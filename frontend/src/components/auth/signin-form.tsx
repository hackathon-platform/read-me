'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import GoogleLoginButton from './GoogleLoginButton'

export function SigninForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { data, error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { locale: 'ja' }
      }
    })

    if (signError) {
      setError(signError.message)
      return
    }

    // Notify the user to check their mail
    alert('✅ 登録ありがとうございます！確認用メールをお送りしました。リンクをクリックして続行してください。')
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">新規登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div className="grid gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">パスワード</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">新規登録</Button>
            <GoogleLoginButton />
            <p className="mt-4 text-center text-sm">
              <a href="/auth/login" className="underline">すでにアカウントをお持ちの方</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
