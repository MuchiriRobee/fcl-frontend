"use client"

import { useState } from "react"
import { Box } from "@mui/material"
import AdminNavigation from "./AdminNavigation"
import AdminDashboard from "./AdminDashboard"

export default function AdminLayout({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AdminNavigation 
        currentUser={currentUser}
        onLogout={onLogout}
        activeTab={activeTab}
        onTabChange={(e, newValue) => setActiveTab(newValue)}
      />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {activeTab === 0 && <AdminDashboard />}
      </Box>
    </Box>
  )
}