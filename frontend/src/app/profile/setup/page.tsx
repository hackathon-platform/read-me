'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ProfileSetup() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File|null>(null)

  // ensure signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/auth/login')
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    let avatar_url = null
    if (avatarFile) {
      const path = `${session.user.id}/${avatarFile.name}`
      await supabase.storage.from('avatars').upload(path, avatarFile)
      avatar_url = supabase
        .storage
        .from('avatars')
        .getPublicUrl(path)
        .data.publicUrl
    }

    await supabase.from('profiles')
      .update({ full_name: name, avatar_url })
      .eq('id', session.user.id)

    router.replace('/profile')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-6">
      <label>
        お名前
        <Input value={name} onChange={e => setName(e.target.value)} required />
      </label>
      <label>
        アイコン画像
        <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
      </label>
      <Button type="submit" className="w-full">プロフィールを保存</Button>
    </form>
  )
}
