"use client"

import { useAuth } from '@/contexts/AuthContext'

export function AuthDebug() {
  const { user, loading } = useAuth()

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-2 rounded text-xs font-mono z-50 max-w-xs">
      <div>Auth State:</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? user.email : 'null'}</div>
      <div>User ID: {user ? user.id : 'null'}</div>
    </div>
  )
} 