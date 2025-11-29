"use client"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { AlertCircle, Download, Trash2, Plus, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SavedResume {
  id: string
  name: string
  content: string
  createdAt: string
}

interface SavedJob {
  id: string
  title: string
  description: string
  createdAt: string
}

export default function ResumeAnalyzer() {
  const [jobTitle, setJobTitle] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  const [resume, setResume] = useState("")
  const [busy, setBusy] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [result, setResult] = useState<{
    match_score: number
    missing_keywords: string[]
    suggestions: string[]
    analysis: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [resumeName, setResumeName] = useState("")
  const [jobName, setJobName] = useState("")

  const handleAnalyze = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
    const form = new FormData()
    if (resumeFile) {
      form.append("resumeFile", resumeFile)
    }
    if (resume.trim()) form.append("resumeText", resume)
    if (jobDesc.trim()) form.append("jobDesc", jobDesc)
    if (!resumeFile && !resume.trim()) {
      setError("Provide a PDF or paste resume text")
      return
    }
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const resp = await fetch(`${backendUrl}/analyze`, {
        method: "POST",
        body: form,
      })
      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(txt || `Request failed: ${resp.status}`)
      }
      const data = await resp.json()
      setResult(data)
    } catch (e: any) {
      setError(e?.message || "Analysis failed")
    } finally {
      setBusy(false)
    }
  }

  const handleSaveResume = () => {
    if (!resume.trim() || !resumeName.trim()) return
    const newResume: SavedResume = {
      id: Date.now().toString(),
      name: resumeName,
      content: resume,
      createdAt: new Date().toLocaleDateString(),
    }
    setSavedResumes([newResume, ...savedResumes])
    setResumeName("")
  }

  const handleSaveJob = () => {
    if (!jobDesc.trim() || !jobName.trim()) return
    const newJob: SavedJob = {
      id: Date.now().toString(),
      title: jobName,
      description: jobDesc,
      createdAt: new Date().toLocaleDateString(),
    }
    setSavedJobs([newJob, ...savedJobs])
    setJobName("")
  }

  const handleLoadResume = (savedResume: SavedResume) => {
    setResume(savedResume.content)
  }

  const handleLoadJob = (savedJob: SavedJob) => {
    setJobTitle(savedJob.title)
    setJobDesc(savedJob.description)
  }

  const handleDeleteResume = (id: string) => {
    setSavedResumes(savedResumes.filter((r) => r.id !== id))
  }

  const handleDeleteJob = (id: string) => {
    setSavedJobs(savedJobs.filter((j) => j.id !== id))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="analyzer" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyzer">Analyzer</TabsTrigger>
          <TabsTrigger value="resumes">Saved Resumes</TabsTrigger>
          <TabsTrigger value="jobs">Saved Jobs</TabsTrigger>
        </TabsList>

        {/* ANALYZER TAB */}
        <TabsContent value="analyzer">
          <Card>
            <CardHeader>
              <CardTitle>Resume Analyzer</CardTitle>
              <CardDescription>
                Paste a job description and your resume to evaluate match
                percentage, missing keywords, and get actionable tips.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Job Title</label>
                  <Input
                    placeholder="e.g., Data Scientist"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                  <label className="text-sm font-medium">
                    Job Description
                  </label>
                  <Textarea
                    className="min-h-40"
                    placeholder="Paste job description here..."
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                  />
                  <Input
                    placeholder="Job name (e.g., ML Engineer Role)"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    className="text-xs"
                  />
                  <Button
                    onClick={handleSaveJob}
                    disabled={!jobDesc.trim() || !jobName.trim()}
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Save Job
                  </Button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Resume</label>
                  <Textarea
                    className="min-h-64"
                    placeholder="Paste your resume text here..."
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                  />
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  />
                  <Input
                    placeholder="Resume name (e.g., Full Stack Resume)"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    className="text-xs"
                  />
                  <Button
                    onClick={handleSaveResume}
                    disabled={!resume.trim() || !resumeName.trim()}
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Save Resume
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleAnalyze} disabled={busy}>
                  {busy ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {jobTitle ? `Target role: ${jobTitle}` : "Target role not set"}
                </div>
              </div>

              {error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : null}

              {result ? (
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm text-muted-foreground">AI Match Score</div>
                    <div className="text-3xl font-semibold">{result.match_score}%</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Gemini-based analysis
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border bg-card md:col-span-2">
                    <div className="text-sm font-medium mb-2">AI Missing Keywords</div>
                    {result.missing_keywords?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {result.missing_keywords.slice(0, 30).map((kw) => (
                          <span key={kw} className="text-xs px-2 py-1 rounded-full border bg-muted">
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">None</div>
                    )}
                  </div>
                  <div className="p-4 rounded-lg border bg-card md:col-span-3">
                    <div className="text-sm font-medium mb-2">AI Suggestions</div>
                    {result.suggestions?.length ? (
                      <ul className="list-disc pl-6 text-sm leading-relaxed space-y-1">
                        {result.suggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground">No suggestions</div>
                    )}
                    <div className="text-sm text-muted-foreground mt-3">
                      {result.analysis}
                    </div>
                  </div>
                </div>
              ) : null}

            </CardContent>
          </Card>
        </TabsContent>

        {/* SAVED RESUMES */}
        <TabsContent value="resumes">
          <Card>
            <CardHeader>
              <CardTitle>Saved Resumes</CardTitle>
              <CardDescription>
                Manage and quickly load your saved resumes for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedResumes.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No saved resumes yet. Save your first resume from the
                    Analyzer tab.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {savedResumes.map((savedResume) => (
                    <div
                      key={savedResume.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {savedResume.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Saved on {savedResume.createdAt}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleLoadResume(savedResume)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Load
                        </Button>
                        <Button
                          onClick={() => handleDeleteResume(savedResume.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SAVED JOBS */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Saved Jobs</CardTitle>
              <CardDescription>
                Keep track of job descriptions you want to analyze against.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedJobs.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No saved jobs yet. Save your first job from the Analyzer
                    tab.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {savedJobs.map((savedJob) => (
                    <div
                      key={savedJob.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {savedJob.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Saved on {savedJob.createdAt}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleLoadJob(savedJob)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Load
                        </Button>
                        <Button
                          onClick={() => handleDeleteJob(savedJob.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
