'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/app/actions'

export function UserMenu() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    
    return () => subscription.unsubscribe()
  }, [])
  
  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          登出
        </button>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        登录
      </Link>
      <Link
        href="/register"
        className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
      >
        注册
      </Link>
    </div>
  )
}
