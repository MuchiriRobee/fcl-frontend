"use client"

import { useEffect, useState } from "react"
import { useRouter } from "react-router-dom"
import AdminLayout from "../../components/admin/AdminLayout"
import { CircularProgress, Box } from "@mui/material"

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem("currentUser")
      if (!userData) {
        router.push("/login?type=admin")
        return
      }

      const user = JSON.parse(userData)
      if (user.userType !== "admin") {
        router.push("/login?type=admin")
        return
      }

      setCurrentUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return <AdminLayout currentUser={currentUser} />
}