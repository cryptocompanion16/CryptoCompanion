import React from 'react'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const { user, supabaseClient } = useAuth()

  if (!user) return <div>Please login</div>

  return (
    <div>
      <h2>Welcome, {user.email}</h2>
      {/* Use supabaseClient for queries, updates, etc. */}
    </div>
  )
}
