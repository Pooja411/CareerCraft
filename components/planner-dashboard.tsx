"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { Clock, Target, Bell, Download, Repeat, Play, Pause, RotateCcw } from "lucide-react"
import CalendarView from "./calendar-view"
import { toast } from "sonner"

type Task = {
  id: string
  title: string
  notes?: string
  completed: boolean
  createdAt: number
  completedAt?: number
  priority?: "low" | "medium" | "high"
  deadline?: string | undefined
  group?: string
  estimatedTime?: number // in minutes
  timeSpent?: number // in minutes
  isTracking?: boolean
  startTime?: number
  recurrence?: "none" | "daily" | "weekly" | "monthly"
  reminder?: string | undefined // ISO date string
}

const STORAGE_KEY = "cc_tasks"
const GOALS_KEY = "cc_daily_goals"
const STREAK_KEY = "cc_streak"

function loadTasks(): Task[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Task[]) : []
  } catch {
    return []
  }
}

function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  try {
    window.dispatchEvent(new CustomEvent("cc_tasks_updated"))
  } catch {}
}

function loadDailyGoal(): number {
  if (typeof window === "undefined") return 5
  try {
    const raw = localStorage.getItem(GOALS_KEY)
    return raw ? Number(raw) : 5
  } catch {
    return 5
  }
}

function saveDailyGoal(goal: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(GOALS_KEY, String(goal))
}

function loadStreak(): { current: number; lastDate: string } {
  if (typeof window === "undefined") return { current: 0, lastDate: "" }
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    return raw ? JSON.parse(raw) : { current: 0, lastDate: "" }
  } catch {
    return { current: 0, lastDate: "" }
  }
}

function saveStreak(streak: { current: number; lastDate: string }) {
  if (typeof window === "undefined") return
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak))
}

// Request notification permission
function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }
  }
}

// Helper functions
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString()
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function showTaskCompletionNotification(taskTitle: string) {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("✅ Task Completed!", {
        body: `Great job completing "${taskTitle}"!`,
        icon: "/placeholder-logo.svg",
      })
    }
  }
  toast.success("Task completed!", {
    description: `"${taskTitle}" is now done! 🎉`,
  })
}

function updateStreak() {
  const streak = loadStreak()
  const today = new Date().toISOString().slice(0, 10)

  if (streak.lastDate === today) {
    // Already updated today
    return
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  if (streak.lastDate === yesterdayStr) {
    // Continue streak
    streak.current += 1
  } else {
    // New streak
    streak.current = 1
  }

  streak.lastDate = today
  saveStreak(streak)
}

function scheduleReminder(taskId: string, title: string, reminderDate: string) {
  const reminderTime = new Date(reminderDate).getTime()
  const now = Date.now()

  if (reminderTime > now) {
    const timeout = reminderTime - now
    setTimeout(() => {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(" Reminder", {
            body: `Don't forget: ${title}`,
            icon: "/placeholder-logo.svg",
          })
        }
      }
      toast.info("Reminder", {
        description: title,
      })
    }, timeout)
  }
}

function createRecurringTask(
  task: Task,
  tasks: Task[],
  addTask: (
    title: string,
    notes?: string,
    priority?: Task["priority"],
    deadline?: string,
    group?: string,
    estimatedTime?: number,
    recurrence?: Task["recurrence"],
    reminder?: string,
  ) => void,
) {
  if (task.recurrence === "none") return

  const nextDate = new Date()
  if (task.recurrence === "daily") {
    nextDate.setDate(nextDate.getDate() + 1)
  } else if (task.recurrence === "weekly") {
    nextDate.setDate(nextDate.getDate() + 7)
  } else if (task.recurrence === "monthly") {
    nextDate.setMonth(nextDate.getMonth() + 1)
  }

  // Check if recurring task already exists for this date
  const existingRecurring = tasks.find(
    (t) =>
      t.title === task.title && t.recurrence === task.recurrence && t.deadline === nextDate.toISOString().slice(0, 10),
  )

  if (!existingRecurring) {
    addTask(
      task.title,
      task.notes,
      task.priority,
      nextDate.toISOString().slice(0, 10),
      task.group || "General",
      task.estimatedTime,
      task.recurrence,
      task.reminder,
    )
  }
}

function exportTasks(tasks: Task[]) {
  const dataStr = JSON.stringify(tasks, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = `careercraft-tasks-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  toast.success("Tasks exported!", {
    description: "Your tasks have been downloaded",
  })
}

function exportProductivityData(tasks: Task[]) {
  const data = groupByDay(tasks)
  const csvContent = "Date,Planned,Completed\n" + data.map((d) => `${d.date},${d.planned},${d.completed}`).join("\n")
  const dataBlob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = `careercraft-productivity-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  toast.success("Productivity data exported!", {
    description: "Your productivity data has been downloaded",
  })
}

function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    setTasks(loadTasks())
  }, [])
  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const addTask = (
    title: string,
    notes?: string,
    priority: Task["priority"] = "low",
    deadline?: string,
    group = "General",
    estimatedTime?: number,
    recurrence?: Task["recurrence"],
    reminder?: string,
  ) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      notes,
      completed: false,
      createdAt: Date.now(),
      priority,
      deadline,
      group,
      estimatedTime,
      timeSpent: 0,
      isTracking: false,
      recurrence: recurrence || "none",
      reminder,
    }
    setTasks((prev) => [...prev, newTask])

    // Show toast notification
    toast.success("Task added!", {
      description: `"${title}" has been added to your list`,
    })

    // Set reminder if provided
    if (reminder) {
      scheduleReminder(newTask.id, title, reminder)
    }
  }

  const updateTask = (id: string, payload: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...payload } : t)))

    // Reschedule reminder if changed
    if (payload.reminder !== undefined) {
      const task = tasks.find((t) => t.id === id)
      if (payload.reminder) {
        scheduleReminder(id, task?.title || "", payload.reminder)
      }
    }
  }

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const wasCompleted = t.completed
          const newCompleted = !t.completed

          // Stop tracking when completing
          const updates: Partial<Task> = {
            completed: newCompleted,
            completedAt: newCompleted ? Date.now() : undefined,
            isTracking: newCompleted ? false : t.isTracking,
          }

          // Send notification on completion
          if (!wasCompleted && newCompleted) {
            showTaskCompletionNotification(t.title)

            // Check if daily goal is reached
            const completedToday =
              prev.filter(
                (task) => task.completed && task.completedAt && isSameDay(new Date(task.completedAt), new Date()),
              ).length + 1
            const goal = loadDailyGoal()
            if (completedToday >= goal) {
              toast.success("🎯 Daily Goal Achieved!", {
                description: `You've completed ${completedToday} tasks today!`,
              })
              updateStreak()
            }

            // Handle recurrence - schedule for next occurrence
            if (t.recurrence !== "none") {
              setTimeout(() => {
                createRecurringTask(t, prev, addTask)
              }, 100)
            }
          }

          return { ...t, ...updates }
        }
        return t
      }),
    )
  }

  const removeTask = (id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id)
      const newTasks = prev.filter((t) => t.id !== id)
      if (task?.isTracking) {
        stopTaskTimer(task)
      }
      toast.info("Task removed", {
        description: `"${task?.title}" has been removed`,
      })
      return newTasks
    })
  }

  const toggleTaskTimer = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (t.isTracking) {
            // Stop tracking
            const elapsed = t.startTime ? Math.floor((Date.now() - t.startTime) / 60000) : 0
            return {
              ...t,
              isTracking: false,
              timeSpent: (t.timeSpent || 0) + elapsed,
              startTime: undefined,
            }
          } else {
            // Start tracking
            return {
              ...t,
              isTracking: true,
              startTime: Date.now(),
            }
          }
        } else if (t.isTracking) {
          // Stop other tasks
          const elapsed = t.startTime ? Math.floor((Date.now() - t.startTime) / 60000) : 0
          return {
            ...t,
            isTracking: false,
            timeSpent: (t.timeSpent || 0) + elapsed,
            startTime: undefined,
          }
        }
        return t
      }),
    )
  }

  const stopTaskTimer = (task: Task) => {
    if (task.isTracking && task.startTime) {
      const elapsed = Math.floor((Date.now() - task.startTime) / 60000)
      updateTask(task.id, {
        isTracking: false,
        timeSpent: (task.timeSpent || 0) + elapsed,
        startTime: undefined,
      })
    }
  }

  return { tasks, addTask, updateTask, toggleTask, removeTask, toggleTaskTimer, stopTaskTimer }
}

function PomodoroTimer() {
  const [focusMin, setFocusMin] = useState<number>(() => Number(localStorage.getItem("cc_pomo_focus") || 25))
  const [shortBreakMin, setShortBreakMin] = useState<number>(() => Number(localStorage.getItem("cc_pomo_short") || 5))
  const [longBreakMin, setLongBreakMin] = useState<number>(() => Number(localStorage.getItem("cc_pomo_long") || 15))
  const [sessionsUntilLong, setSessionsUntilLong] = useState<number>(() =>
    Number(localStorage.getItem("cc_pomo_until_long") || 4),
  )
  const [seconds, setSeconds] = useState<number>(() => Number(localStorage.getItem("cc_pomo_seconds") || focusMin * 60))
  const [running, setRunning] = useState<boolean>(() => localStorage.getItem("cc_pomo_running") === "1")
  const [mode, setMode] = useState<"focus" | "short" | "long">(
    () => (localStorage.getItem("cc_pomo_mode") as any) || "focus",
  )
  const [completedSessions, setCompletedSessions] = useState<number>(() =>
    Number(localStorage.getItem("cc_pomo_sessions") || 0),
  )

  // persist settings
  useEffect(() => {
    localStorage.setItem("cc_pomo_focus", String(focusMin))
  }, [focusMin])
  useEffect(() => {
    localStorage.setItem("cc_pomo_short", String(shortBreakMin))
  }, [shortBreakMin])
  useEffect(() => {
    localStorage.setItem("cc_pomo_long", String(longBreakMin))
  }, [longBreakMin])
  useEffect(() => {
    localStorage.setItem("cc_pomo_until_long", String(sessionsUntilLong))
  }, [sessionsUntilLong])
  useEffect(() => {
    localStorage.setItem("cc_pomo_seconds", String(seconds))
  }, [seconds])
  useEffect(() => {
    localStorage.setItem("cc_pomo_running", running ? "1" : "0")
  }, [running])
  useEffect(() => {
    localStorage.setItem("cc_pomo_mode", mode)
  }, [mode])
  useEffect(() => {
    localStorage.setItem("cc_pomo_sessions", String(completedSessions))
  }, [completedSessions])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (seconds > 0) return
    if (mode === "focus") {
      const nextIsLong = (completedSessions + 1) % sessionsUntilLong === 0
      setCompletedSessions((c) => c + 1)
      setMode(nextIsLong ? "long" : "short")
      setSeconds((nextIsLong ? longBreakMin : shortBreakMin) * 60)
    } else {
      setMode("focus")
      setSeconds(focusMin * 60)
    }
    // optional notification
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(mode === "focus" ? "Break time!" : "Focus time!")
      }
    }
  }, [seconds])

  const resetTo = (newMode: "focus" | "short" | "long") => {
    setRunning(false)
    setMode(newMode)
    setSeconds((newMode === "focus" ? focusMin : newMode === "short" ? shortBreakMin : longBreakMin) * 60)
  }

  const minutesPart = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")
  const secondsPart = String(seconds % 60).padStart(2, "0")
  const total = (mode === "focus" ? focusMin : mode === "short" ? shortBreakMin : longBreakMin) * 60
  const progress = 1 - seconds / total

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pomodoro</CardTitle>
        <CardDescription>
          {mode === "focus" ? "Focus" : mode === "short" ? "Short break" : "Long break"} • Sessions: {completedSessions}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-5xl font-semibold text-center tabular-nums">
          {minutesPart}:{secondsPart}
        </div>
        <div className="w-full h-2 rounded bg-muted">
          <div className="h-2 rounded" style={{ width: `${progress * 100}%`, background: "var(--color-chart-1)" }} />
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Start"}</Button>
          <Button variant="secondary" onClick={() => resetTo(mode)}>
            Reset
          </Button>
          <Button variant="secondary" onClick={() => resetTo("focus")}>
            Focus
          </Button>
          <Button variant="secondary" onClick={() => resetTo("short")}>
            Short
          </Button>
          <Button variant="secondary" onClick={() => resetTo("long")}>
            Long
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm flex items-center gap-2">
            Focus (min)
            <input
              className="border rounded px-2 py-1 bg-background w-full"
              type="number"
              min={1}
              max={120}
              value={focusMin}
              onChange={(e) => setFocusMin(Math.max(1, Number(e.target.value) || 25))}
            />
          </label>
          <label className="text-sm flex items-center gap-2">
            Short break (min)
            <input
              className="border rounded px-2 py-1 bg-background w-full"
              type="number"
              min={1}
              max={60}
              value={shortBreakMin}
              onChange={(e) => setShortBreakMin(Math.max(1, Number(e.target.value) || 5))}
            />
          </label>
          <label className="text-sm flex items-center gap-2">
            Long break (min)
            <input
              className="border rounded px-2 py-1 bg-background w-full"
              type="number"
              min={1}
              max={60}
              value={longBreakMin}
              onChange={(e) => setLongBreakMin(Math.max(1, Number(e.target.value) || 15))}
            />
          </label>
          <label className="text-sm flex items-center gap-2">
            Sessions per long break
            <input
              className="border rounded px-2 py-1 bg-background w-full"
              type="number"
              min={1}
              max={12}
              value={sessionsUntilLong}
              onChange={(e) => setSessionsUntilLong(Math.max(1, Number(e.target.value) || 4))}
            />
          </label>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Tip: Allow notifications to get alerts when a session ends.
        </div>
      </CardContent>
    </Card>
  )
}

function TaskList() {
  const { tasks, addTask, updateTask, toggleTask, removeTask, toggleTaskTimer } = useTasks()
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState<Task["priority"]>("low")
  const [deadline, setDeadline] = useState<string | undefined>(undefined)
  const [group, setGroup] = useState<string>("General")
  const [estimatedTime, setEstimatedTime] = useState<string>("")
  const [recurrence, setRecurrence] = useState<Task["recurrence"]>("none")
  const [reminder, setReminder] = useState<string>("")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("created-desc")
  const [groupFilter, setGroupFilter] = useState<string>("All")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editPriority, setEditPriority] = useState<Task["priority"]>("low")
  const [editDeadline, setEditDeadline] = useState<string | undefined>(undefined)
  const [editGroup, setEditGroup] = useState<string>("General")
  const [editEstimatedTime, setEditEstimatedTime] = useState<string>("")
  const [editRecurrence, setEditRecurrence] = useState<Task["recurrence"]>("none")
  const [editReminder, setEditReminder] = useState<string>("")

  const planned = tasks.length
  const done = tasks.filter((t) => t.completed).length
  const completedToday = tasks.filter(
    (t) => t.completed && t.completedAt && isSameDay(new Date(t.completedAt), new Date()),
  ).length

  // Force re-render every minute to update time displays
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Plan and complete your day</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportTasks(tasks)} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={requestNotificationPermission} className="gap-2 bg-transparent">
            <Bell className="h-4 w-4" />
            Enable Notifications
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <Input
            placeholder="Add a task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && document.getElementById("add-task-btn")?.click()}
          />
          <Textarea placeholder="Optional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <select
            className="border rounded-md px-2 py-1 bg-background text-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task["priority"])}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <input
            className="border rounded-md px-2 py-1 bg-background text-sm"
            type="date"
            value={deadline || ""}
            onChange={(e) => setDeadline(e.target.value || undefined)}
            placeholder="Deadline"
          />
          <Input
            placeholder="Group/Category"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Est. time (min)"
            type="number"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Select value={recurrence} onValueChange={(v) => setRecurrence(v as Task["recurrence"])}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Recurrence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No recurrence</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <input
            className="border rounded-md px-2 py-1 bg-background text-sm"
            type="datetime-local"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            placeholder="Reminder"
          />
          <Button
            id="add-task-btn"
            onClick={() => {
              if (!title.trim()) return
              addTask(
                title.trim(),
                notes.trim() || undefined,
                priority,
                deadline,
                group.trim() || "General",
                estimatedTime ? Number(estimatedTime) : undefined,
                recurrence,
                reminder || undefined,
              )
              setTitle("")
              setNotes("")
              setPriority("low")
              setDeadline(undefined)
              setGroup("General")
              setEstimatedTime("")
              setRecurrence("none")
              setReminder("")
            }}
            className="w-full"
          >
            Add Task
          </Button>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-4 text-sm">
            <div className="text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{planned}</span>
            </div>
            <div className="text-muted-foreground">
              Completed: <span className="font-semibold text-foreground">{done}</span>
            </div>
            <div className="text-muted-foreground">
              Today: <span className="font-semibold text-foreground">{completedToday}</span>
            </div>
          </div>
          <div className="ml-auto flex gap-2 items-center">
            <Input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select
              className="border rounded-md px-2 py-1 bg-background"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="created-desc">Newest</option>
              <option value="created-asc">Oldest</option>
              <option value="priority-desc">Priority</option>
              <option value="deadline-asc">Nearest deadline</option>
            </select>
            <select
              className="border rounded-md px-2 py-1 bg-background"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="All">All groups</option>
              {Array.from(new Set(tasks.map((t) => t.group || "General"))).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ul className="space-y-2">
          {tasks.length === 0 ? (
            <li className="text-sm text-muted-foreground">No tasks yet. Add your first task above.</li>
          ) : (
            tasks
              .filter((t) => {
                if (!query.trim()) return true
                const q = query.toLowerCase()
                return (t.title || "").toLowerCase().includes(q) || (t.notes || "").toLowerCase().includes(q)
              })
              .filter((t) => (groupFilter === "All" ? true : (t.group || "General") === groupFilter))
              .sort((a, b) => {
                switch (sort) {
                  case "priority-desc":
                    return (
                      ["high", "medium", "low"].indexOf(a.priority || "low") -
                      ["high", "medium", "low"].indexOf(b.priority || "low")
                    )
                  case "deadline-asc":
                    return (
                      new Date(a.deadline || "2100-01-01").getTime() - new Date(b.deadline || "2100-01-01").getTime()
                    )
                  case "created-asc":
                    return a.createdAt - b.createdAt
                  default:
                    return b.createdAt - a.createdAt
                }
              })
              .map((t) => {
                const currentElapsed = t.isTracking && t.startTime ? Math.floor((Date.now() - t.startTime) / 60000) : 0
                const totalTime = (t.timeSpent || 0) + currentElapsed
                const priorityColors = { low: "bg-gray-500", medium: "bg-yellow-500", high: "bg-red-500" }
                const priorityColor = priorityColors[t.priority || "low"]

                return (
                  <li
                    key={t.id}
                    className={`flex items-start gap-3 rounded-md border p-3 bg-card ${t.completed ? "opacity-60" : ""}`}
                  >
                    <Checkbox checked={t.completed} onCheckedChange={() => toggleTask(t.id)} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      {editingId === t.id ? (
                        <div className="space-y-2">
                          <div className="grid md:grid-cols-2 gap-2">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Task title"
                            />
                            <Input
                              placeholder="Notes"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <select
                              className="border rounded-md px-2 py-1 bg-background text-sm"
                              value={editPriority}
                              onChange={(e) => setEditPriority(e.target.value as Task["priority"])}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            <input
                              className="border rounded-md px-2 py-1 bg-background text-sm"
                              type="date"
                              value={editDeadline || ""}
                              onChange={(e) => setEditDeadline(e.target.value || undefined)}
                            />
                            <Input
                              placeholder="Group"
                              value={editGroup}
                              onChange={(e) => setEditGroup(e.target.value)}
                              className="text-sm"
                            />
                            <Input
                              placeholder="Est. time (min)"
                              type="number"
                              value={editEstimatedTime}
                              onChange={(e) => setEditEstimatedTime(e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Select
                              value={editRecurrence}
                              onValueChange={(v) => setEditRecurrence(v as Task["recurrence"])}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No recurrence</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <input
                              className="border rounded-md px-2 py-1 bg-background text-sm"
                              type="datetime-local"
                              value={editReminder || ""}
                              onChange={(e) => setEditReminder(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                updateTask(t.id, {
                                  title: editTitle,
                                  notes: editNotes,
                                  priority: editPriority,
                                  deadline: editDeadline,
                                  group: editGroup || "General",
                                  estimatedTime: editEstimatedTime ? Number(editEstimatedTime) : undefined,
                                  recurrence: editRecurrence,
                                  reminder: editReminder || undefined,
                                })
                                setEditingId(null)
                              }}
                            >
                              Save
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-medium flex items-center gap-2 flex-wrap">
                                {t.title}
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    t.priority === "high"
                                      ? "bg-red-500 text-white border-red-500"
                                      : t.priority === "medium"
                                        ? "bg-yellow-500 text-white border-yellow-500"
                                        : "bg-gray-500 text-white border-gray-500"
                                  }`}
                                >
                                  {t.priority || "low"}
                                </Badge>
                                {t.recurrence !== "none" && (
                                  <Badge variant="outline" className="text-xs">
                                    <Repeat className="h-3 w-3 mr-1" />
                                    {t.recurrence}
                                  </Badge>
                                )}
                              </div>
                              {t.notes && (
                                <div className="text-sm text-muted-foreground leading-relaxed mt-1">{t.notes}</div>
                              )}
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                                {t.group && <span>📁 {t.group}</span>}
                                {t.deadline && (
                                  <span
                                    className={
                                      new Date(t.deadline) < new Date() && !t.completed
                                        ? "text-red-500 font-semibold"
                                        : ""
                                    }
                                  >
                                    📅 {t.deadline}
                                  </span>
                                )}
                                {t.estimatedTime && <span>⏱️ Est: {formatTime(t.estimatedTime)}</span>}
                                {totalTime > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(totalTime)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {editingId === t.id ? null : (
                      <div className="flex flex-col gap-2">
                        {!t.completed && (
                          <Button
                            size="sm"
                            variant={t.isTracking ? "destructive" : "outline"}
                            onClick={() => toggleTaskTimer(t.id)}
                            className="gap-1"
                          >
                            {t.isTracking ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                            {t.isTracking ? "Stop" : "Start"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingId(t.id)
                            setEditTitle(t.title || "")
                            setEditNotes(t.notes || "")
                            setEditPriority(t.priority || "low")
                            setEditDeadline(t.deadline)
                            setEditGroup(t.group || "General")
                            setEditEstimatedTime(t.estimatedTime?.toString() || "")
                            setEditRecurrence(t.recurrence || "none")
                            setEditReminder(t.reminder || "")
                          }}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removeTask(t.id)}>
                          🗑️
                        </Button>
                      </div>
                    )}
                  </li>
                )
              })
          )}
        </ul>
      </CardContent>
    </Card>
  )
}

function groupByDay(tasks: Task[], days = 7) {
  const map = new Map<string, { date: string; planned: number; completed: number }>()
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    map.set(key, { date: dateFormatted, planned: 0, completed: 0 })
  }
  for (const t of tasks) {
    const createdKey = new Date(t.createdAt).toISOString().slice(0, 10)
    if (map.has(createdKey)) {
      map.get(createdKey)!.planned += 1
    }
    if (t.completedAt) {
      const completedKey = new Date(t.completedAt).toISOString().slice(0, 10)
      if (map.has(completedKey)) {
        map.get(completedKey)!.completed += 1
      }
    }
  }
  return Array.from(map.values())
}

function groupByWeek(tasks: Task[], weeks = 4) {
  const map = new Map<string, { week: string; planned: number; completed: number }>()
  const now = new Date()
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i * 7)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const weekKey = weekStart.toISOString().slice(0, 10)
    const weekLabel = `Week ${i + 1}`
    map.set(weekKey, { week: weekLabel, planned: 0, completed: 0 })
  }
  for (const t of tasks) {
    const taskDate = new Date(t.createdAt)
    const weekStart = new Date(taskDate)
    weekStart.setDate(taskDate.getDate() - taskDate.getDay())
    const weekKey = weekStart.toISOString().slice(0, 10)
    if (map.has(weekKey)) {
      map.get(weekKey)!.planned += 1
    }
    if (t.completedAt) {
      const completedDate = new Date(t.completedAt)
      const completedWeekStart = new Date(completedDate)
      completedWeekStart.setDate(completedDate.getDate() - completedDate.getDay())
      const completedWeekKey = completedWeekStart.toISOString().slice(0, 10)
      if (map.has(completedWeekKey)) {
        map.get(completedWeekKey)!.completed += 1
      }
    }
  }
  return Array.from(map.values())
}

function ProductivityChart() {
  const [mounted, setMounted] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<"daily" | "weekly">("daily")

  useEffect(() => {
    setMounted(true)
    setTasks(loadTasks())
    const onStorage = () => setTasks(loadTasks())
    const onLocal = () => setTasks(loadTasks())
    window.addEventListener("storage", onStorage)
    window.addEventListener("cc_tasks_updated", onLocal as EventListener)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("cc_tasks_updated", onLocal as EventListener)
    }
  }, [])

  const dailyData = useMemo(() => groupByDay(tasks, 7), [tasks])
  const weeklyData = useMemo(() => groupByWeek(tasks, 4), [tasks])
  const data = view === "daily" ? dailyData : weeklyData
  const dataKey = view === "daily" ? "date" : "week"

  if (!mounted) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Productivity Analytics</CardTitle>
          <CardDescription>
            {view === "daily" ? "Daily trends (last 7 days)" : "Weekly trends (last 4 weeks)"}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "daily" ? "default" : "outline"} size="sm" onClick={() => setView("daily")}>
            Daily
          </Button>
          <Button variant={view === "weekly" ? "default" : "outline"} size="sm" onClick={() => setView("weekly")}>
            Weekly
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportProductivityData(tasks)} className="gap-1">
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="area" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="area">Area</TabsTrigger>
            <TabsTrigger value="bar">Bar</TabsTrigger>
            <TabsTrigger value="line">Line</TabsTrigger>
          </TabsList>
          <TabsContent value="area">
            <div style={{ width: "100%", height: "288px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey={dataKey} tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      color: "#000000",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    stroke="#f59e0b"
                    fill="url(#plannedGrad)"
                    strokeWidth={2}
                    name="Planned"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    fill="url(#completedGrad)"
                    strokeWidth={2}
                    name="Completed"
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="bar">
            <div style={{ width: "100%", height: "288px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey={dataKey} tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      color: "#000000",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="planned" fill="#f59e0b" name="Planned" />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="line">
            <div style={{ width: "100%", height: "288px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey={dataKey} tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      color: "#000000",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="planned" stroke="#f59e0b" strokeWidth={2} name="Planned" />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function ProductivityStats() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    setTasks(loadTasks())
    const onLocal = () => setTasks(loadTasks())
    window.addEventListener("cc_tasks_updated", onLocal as EventListener)
    return () => window.removeEventListener("cc_tasks_updated", onLocal as EventListener)
  }, [])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const completedToday = tasks.filter(
    (t) => t.completed && t.completedAt && isSameDay(new Date(t.completedAt), new Date()),
  ).length
  const totalTimeSpent = tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0)
  const highPriorityTasks = tasks.filter((t) => t.priority === "high" && !t.completed).length
  const overdueTasks = tasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && !t.completed).length

  const streak = loadStreak()
  const dailyGoal = loadDailyGoal()
  const goalProgress = Math.min(Math.round((completedToday / dailyGoal) * 100), 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productivity Stats</CardTitle>
        <CardDescription>Your performance at a glance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Completion Rate</div>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Current Streak</div>
            <div className="text-2xl font-bold flex items-center gap-2">🔥 {streak.current} days</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Completed Today</div>
            <div className="text-xl font-semibold">{completedToday} tasks</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Time Spent</div>
            <div className="text-xl font-semibold">{formatTime(totalTimeSpent)}</div>
          </div>
        </div>
        <div className="space-y-2 pt-2 border-t">
          <div className="text-sm font-medium">Daily Goal Progress</div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {completedToday} / {dailyGoal} tasks
            </span>
            <span>{goalProgress}%</span>
          </div>
          <Progress value={goalProgress} className="h-3" />
        </div>
        {(highPriorityTasks > 0 || overdueTasks > 0) && (
          <div className="pt-2 border-t space-y-1">
            {highPriorityTasks > 0 && (
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ {highPriorityTasks} high priority task{highPriorityTasks > 1 ? "s" : ""} remaining
              </div>
            )}
            {overdueTasks > 0 && (
              <div className="text-sm text-red-600 dark:text-red-400">
                ⚠️ {overdueTasks} overdue task{overdueTasks > 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DailyGoals() {
  const [dailyGoal, setDailyGoal] = useState(loadDailyGoal())
  const [tasks, setTasks] = useState<Task[]>([])
  const streak = loadStreak()

  useEffect(() => {
    setTasks(loadTasks())
    const onLocal = () => setTasks(loadTasks())
    window.addEventListener("cc_tasks_updated", onLocal as EventListener)
    return () => window.removeEventListener("cc_tasks_updated", onLocal as EventListener)
  }, [])

  const completedToday = tasks.filter(
    (t) => t.completed && t.completedAt && isSameDay(new Date(t.completedAt), new Date()),
  ).length
  const goalProgress = Math.min((completedToday / dailyGoal) * 100, 100)

  const handleGoalChange = (newGoal: number) => {
    setDailyGoal(newGoal)
    saveDailyGoal(newGoal)
    toast.success("Daily goal updated!", {
      description: `Target set to ${newGoal} tasks per day`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Daily Goals & Streak
        </CardTitle>
        <CardDescription>Track your progress and build consistency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Daily Goal</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => handleGoalChange(Math.max(1, dailyGoal - 1))}>
                -
              </Button>
              <span className="w-12 text-center font-semibold">{dailyGoal}</span>
              <Button size="sm" variant="outline" onClick={() => handleGoalChange(dailyGoal + 1)}>
                +
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Progress: {completedToday} / {dailyGoal}
              </span>
              <span>{Math.round(goalProgress)}%</span>
            </div>
            <Progress value={goalProgress} className="h-3" />
          </div>
        </div>
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Streak</span>
            <span className="text-lg font-bold text-orange-500">🔥 {streak.current} days</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {completedToday >= dailyGoal
              ? "🎉 You're on track for today!"
              : `Complete ${dailyGoal - completedToday} more task${dailyGoal - completedToday > 1 ? "s" : ""} to maintain your streak`}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PlannerDashboard() {
  useEffect(() => {
    requestNotificationPermission()
    const tasks = loadTasks()
    const today = new Date()
    const overdue = tasks.filter((t) => t.deadline && new Date(t.deadline) < today && !t.completed)
    const dueToday = tasks.filter(
      (t) => t.deadline && isSameDay(new Date(t.deadline), today) && !t.completed && new Date(t.deadline) >= today,
    )

    if (overdue.length || dueToday.length) {
      const parts: string[] = []
      if (overdue.length) parts.push(`${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}`)
      if (dueToday.length) parts.push(`${dueToday.length} task${dueToday.length > 1 ? "s" : ""} due today`)

      const message = parts.join(" • ")

      toast.info("Planner summary", {
        description: message,
      })

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("CareerCraft Planner", {
            body: message,
            icon: "/placeholder-logo.svg",
          })
        } catch {
          // ignore notification errors
        }
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Task List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <TaskList />
            </div>
            <div className="space-y-6">
              <DailyGoals />
              <ProductivityStats />
              <PomodoroTimer />
            </div>
          </div>
          <ProductivityChart />
        </TabsContent>
        <TabsContent value="calendar" className="space-y-6">
          <CalendarViewWrapper />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CalendarViewWrapper() {
  const { tasks, addTask, toggleTask, removeTask } = useTasks()

  return <CalendarView tasks={tasks} onAddTask={addTask} onToggleTask={toggleTask} onRemoveTask={removeTask} />
}
