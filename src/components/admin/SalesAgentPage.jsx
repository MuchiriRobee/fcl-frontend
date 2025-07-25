"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Alert,
  Snackbar,
} from "@mui/material"
import axios from "axios"

export default function SalesAgentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [agent, setAgent] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })

  useEffect(() => {
    const fetchAgentAndUsers = async () => {
      try {
        setLoading(true)
        // Fetch agent details
        const agentResponse = await axios.get(`${import.meta.env.VITE_API_URL}/auth/sales-agents/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        setAgent(agentResponse.data.agent)

        // Fetch users registered by this agent
        const usersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/auth/sales-agents/${id}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        setUsers(usersResponse.data.users)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching agent or users:", error)
        setNotification({
          open: true,
          message: error.response?.data?.message || "Failed to fetch agent or users",
          severity: "error",
        })
        setLoading(false)
      }
    }
    fetchAgentAndUsers()
  }, [id])

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  return (
    <Box sx={{ p: 3 }}>
      {agent && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              {`${agent.first_name} ${agent.last_name}`} (Code: {agent.agent_code || "N/A"})
            </Typography>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Back to Agents
            </Button>
          </Box>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Registered Users
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>User Name</TableCell>
                    {/* Placeholder columns for future implementation */}
                    {/* <TableCell sx={{ fontWeight: "bold" }}>User Code</TableCell> */}
                    {/* <TableCell sx={{ fontWeight: "bold" }}>Last Purchase/Order Date</TableCell> */}
                    {/* <TableCell sx={{ fontWeight: "bold" }}>Number of Orders</TableCell> */}
                    {/* <TableCell sx={{ fontWeight: "bold" }}>Total Orders Amount</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Loading users...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No users registered by this agent
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Typography variant="body2">{user.name || "N/A"}</Typography>
                        </TableCell>
                        {/* Placeholder columns */}
                        {/* <TableCell><Typography variant="body2">N/A</Typography></TableCell> */}
                        {/* <TableCell><Typography variant="body2">N/A</Typography></TableCell> */}
                        {/* <TableCell><Typography variant="body2">0</Typography></TableCell> */}
                        {/* <TableCell><Typography variant="body2">0</Typography></TableCell> */}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}