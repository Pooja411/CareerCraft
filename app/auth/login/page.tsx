"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Access your CareerCraft account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                if (!email || !password) throw new Error("Please enter email and password")
                await login(email, password)
                toast({ title: "Welcome back!", description: "You are now logged in." })
                router.push("/")
              } catch (err: any) {
                toast({
                  title: "Login failed",
                  description: err?.message ?? "Please try again",
                  variant: "destructive",
                })
              } finally {
                setBusy(false)
              }
            }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl: "/" })}>
            Continue with Google
          </Button>
          <div className="text-sm text-muted-foreground">
            No account?{" "}
            <Link className="underline underline-offset-4" href="/auth/signup">
              Create one
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
