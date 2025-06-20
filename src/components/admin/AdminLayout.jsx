"use client"

import { useState } from "react"
import { Box } from "@mui/material"
import AdminNavigation from "./AdminNavigation"
import AdminDashboard from "./AdminDashboard"

export default function AdminLayout({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AdminNavigation 
        currentUser={currentUser}
        onLogout={onLogout}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {activeTab === 0 && <AdminDashboard />}
        {/* Add other admin components here */}
      </Box>
    </Box>
  )
}