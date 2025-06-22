"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { Add, Edit, Delete, Person, TrendingUp, Assignment, Phone } from "@mui/icons-material"

const initialAgents = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@firstcraft.com",
    phone: "+256 700 123 456",
    territory: "Kampala Central",
    salesTarget: 5000000,
    salesAchieved: 3750000,
    customersAssigned: 25,
    status: "active",
    joinDate: "2023-01-15",
    commission: 8,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@firstcraft.com",
    phone: "+256 700 234 567",
    territory: "Entebbe",
    salesTarget: 4000000,
    salesAchieved: 4200000,
    customersAssigned: 20,
    status: "active",
    joinDate: "2023-03-20",
    commission: 10,
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob.johnson@firstcraft.com",
    phone: "+256 700 345 678",
    territory: "Jinja",
    salesTarget: 3500000,
    salesAchieved: 2100000,
    customersAssigned: 18,
    status: "inactive",
    joinDate: "2022-11-10",
    commission: 7,
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice.brown@firstcraft.com",
    phone: "+256 700 456 789",
    territory: "Mbarara",
    salesTarget: 3000000,
    salesAchieved: 2850000,
    customersAssigned: 15,
    status: "active",
    joinDate: "2023-05-08",
    commission: 9,
  },
]

const territories = ["Kampala Central", "Entebbe", "Jinja", "Mbarara", "Gulu", "Mbale", "Fort Portal"]

export default function SalesAgentManagement() {
  const [agents, setAgents] = useState(initialAgents)
  const [open, setOpen] = useState(false)
  const [editAgent, setEditAgent] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    territory: "",
    salesTarget: "",
    commission: "",
    status: "active",
  })

  const handleOpen = (agent = null) => {
    if (agent) {
      setEditAgent(agent)
      setFormData({
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        territory: agent.territory,
        salesTarget: agent.salesTarget.toString(),
        commission: agent.commission.toString(),
        status: agent.status,
      })
    } else {
      setEditAgent(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        territory: "",
        salesTarget: "",
        commission: "",
        status: "active",
      })
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditAgent(null)
  }

  const handleSubmit = () => {
    const newAgent = {
      id: editAgent ? editAgent.id : Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      territory: formData.territory,
      salesTarget: Number.parseInt(formData.salesTarget),
      commission: Number.parseInt(formData.commission),
      status: formData.status,
      salesAchieved: editAgent ? editAgent.salesAchieved : 0,
      customersAssigned: editAgent ? editAgent.customersAssigned : 0,
      joinDate: editAgent ? editAgent.joinDate : new Date().toISOString().split("T")[0],
    }

    if (editAgent) {
      setAgents(agents.map((agent) => (agent.id === editAgent.id ? newAgent : agent)))
    } else {
      setAgents([...agents, newAgent])
    }

    handleClose()
  }

  const handleDelete = (id) => {
    setAgents(agents.filter((agent) => agent.id !== id))
  }

  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const getPerformancePercentage = (achieved, target) => {
    return Math.min((achieved / target) * 100, 100)
  }

  const getStatusColor = (status) => {
    return status === "active" ? "success" : "error"
  }

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return "success"
    if (percentage >= 70) return "warning"
    return "error"
  }

  // Calculate summary stats
  const totalAgents = agents.length
  const activeAgents = agents.filter((agent) => agent.status === "active").length
  const totalSalesTarget = agents.reduce((sum, agent) => sum + agent.salesTarget, 0)
  const totalSalesAchieved = agents.reduce((sum, agent) => sum + agent.salesAchieved, 0)
  const overallPerformance = (totalSalesAchieved / totalSalesTarget) * 100

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Sales Agent Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {totalAgents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Agents
                  </Typography>
                </Box>
                <Person sx={{ fontSize: 40, color: "primary.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {activeAgents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Agents
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: "success.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {formatNumber(totalSalesTarget)}/=
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sales Target
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: "warning.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {overallPerformance.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Performance
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: "info.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Agents Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Sales Agents
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Add Agent
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Agent</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Territory</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Customers
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Performance
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Sales Target
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Sales Achieved
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.map((agent) => {
                const performance = getPerformancePercentage(agent.salesAchieved, agent.salesTarget)
                return (
                  <TableRow key={agent.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>{agent.name.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {agent.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {agent.email}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            <Phone sx={{ fontSize: 12, mr: 0.5 }} />
                            {agent.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{agent.territory}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight="bold">
                        {agent.customersAssigned}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ minWidth: 100 }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {performance.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={performance}
                          color={getPerformanceColor(performance)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {formatNumber(agent.salesTarget)}/=
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="medium">
                        {formatNumber(agent.salesAchieved)}/=
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={agent.status} size="small" color={getStatusColor(agent.status)} />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpen(agent)} sx={{ mr: 1 }}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(agent.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editAgent ? "Edit Agent" : "Add New Agent"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Territory</InputLabel>
                <Select
                  value={formData.territory}
                  label="Territory"
                  onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                >
                  {territories.map((territory) => (
                    <MenuItem key={territory} value={territory}>
                      {territory}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sales Target (UGX)"
                type="number"
                value={formData.salesTarget}
                onChange={(e) => setFormData({ ...formData, salesTarget: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Commission (%)"
                type="number"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editAgent ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => handleOpen()}
      >
        <Add />
      </Fab>
    </Box>
  )
}
