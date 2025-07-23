"use client"

import { useState, useEffect } from "react"
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
  Fab,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
} from "@mui/material"
import { Add, Edit, Delete, Person, Phone } from "@mui/icons-material"
import axios from "axios"

export default function SalesAgentManagement() {
  const [agents, setAgents] = useState([])
  const [open, setOpen] = useState(false)
  const [editAgent, setEditAgent] = useState(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    agentPhoto: null,
    id_number: "",
    idPhotoFront: null,
    idPhotoBack: null,
    kra_pin: "",
    kraCertificate: null,
    email: "",
    phone_number: "",
    is_active: true,
  })
  const [formErrors, setFormErrors] = useState({})
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })
  const [imagePreviews, setImagePreviews] = useState({
    agentPhoto: null,
    idPhotoFront: null,
    idPhotoBack: null,
    kraCertificate: null,
  })

  // Fetch agents on component mount
 useEffect(() => {
  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/sales-agents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      console.log("Fetched agents:", response.data)
      setAgents(response.data)
    } catch (error) {
      console.error("Error fetching sales agents:", error)
      setNotification({
        open: true,
        message: error.response?.data?.message || "Failed to fetch sales agents",
        severity: "error",
      })
    }
  }
  fetchAgents()
}, [])

  const generateAgentCode = (firstName, lastName, existingAgents) => {
    const firstInitial = firstName.charAt(0).toUpperCase()
    const lastInitial = lastName.charAt(0).toUpperCase()
    const sequence = String(existingAgents.length + 1).padStart(3, "0")
    return `${firstInitial}${lastInitial}${sequence}`
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.first_name.trim()) errors.first_name = "First name is required"
    if (!formData.last_name.trim()) errors.last_name = "Last name is required"
    if (!formData.email.trim()) errors.email = "Email is required"
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Invalid email format (e.g., user@domain.com)"
    if (!formData.phone_number.trim()) errors.phone_number = "Phone number is required"
    else if (!/^07\d{8}$/.test(formData.phone_number)) errors.phone_number = "Phone number must start with 07 and be 10 digits"
    if (!formData.id_number.trim()) errors.id_number = "ID number is required"
    else if (!/^\d{8}$/.test(formData.id_number)) errors.id_number = "ID number must be exactly 8 digits"
    if (!formData.kra_pin.trim()) errors.kra_pin = "KRA PIN is required"
    else if (!/^[A-Za-z0-9]{10,11}$/.test(formData.kra_pin)) errors.kra_pin = "KRA PIN must be 10-11 alphanumeric characters"
    if (!editAgent && !formData.agentPhoto) errors.agentPhoto = "Agent photo is required"
    else if (formData.agentPhoto && !["image/jpeg", "image/png"].includes(formData.agentPhoto.type)) {
      errors.agentPhoto = "Agent photo must be JPEG or PNG"
    } else if (formData.agentPhoto && formData.agentPhoto.size > 2 * 1024 * 1024) {
      errors.agentPhoto = "Agent photo must be less than 2MB"
    }
    if (!editAgent && !formData.idPhotoFront) errors.idPhotoFront = "ID photo (front) is required"
    else if (formData.idPhotoFront && !["image/jpeg", "image/png"].includes(formData.idPhotoFront.type)) {
      errors.idPhotoFront = "ID photo (front) must be JPEG or PNG"
    } else if (formData.idPhotoFront && formData.idPhotoFront.size > 2 * 1024 * 1024) {
      errors.idPhotoFront = "ID photo (front) must be less than 2MB"
    }
    if (!editAgent && !formData.idPhotoBack) errors.idPhotoBack = "ID photo (back) is required"
    else if (formData.idPhotoBack && !["image/jpeg", "image/png"].includes(formData.idPhotoBack.type)) {
      errors.idPhotoBack = "ID photo (back) must be JPEG or PNG"
    } else if (formData.idPhotoBack && formData.idPhotoBack.size > 2 * 1024 * 1024) {
      errors.idPhotoBack = "ID photo (back) must be less than 2MB"
    }
    if (!editAgent && !formData.kraCertificate) errors.kraCertificate = "KRA certificate is required"
    else if (formData.kraCertificate && formData.kraCertificate.type !== "application/pdf") {
      errors.kraCertificate = "KRA certificate must be a PDF"
    } else if (formData.kraCertificate && formData.kraCertificate.size > 5 * 1024 * 1024) {
      errors.kraCertificate = "KRA certificate must be less than 5MB"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleOpen = (agent = null) => {
    if (agent) {
      setEditAgent(agent)
      setFormData({
        first_name: agent.first_name,
        last_name: agent.last_name,
        agentPhoto: null,
        id_number: agent.id_number,
        idPhotoFront: null,
        idPhotoBack: null,
        kra_pin: agent.kra_pin,
        kraCertificate: null,
        email: agent.email,
        phone_number: agent.phone_number,
        is_active: agent.is_active,
      })
      setImagePreviews({
        agentPhoto: null,
        idPhotoFront: null,
        idPhotoBack: null,
        kraCertificate: null,
      })
    } else {
      setEditAgent(null)
      setFormData({
        first_name: "",
        last_name: "",
        agentPhoto: null,
        id_number: "",
        idPhotoFront: null,
        idPhotoBack: null,
        kra_pin: "",
        kraCertificate: null,
        email: "",
        phone_number: "",
        is_active: true,
      })
      setImagePreviews({
        agentPhoto: null,
        idPhotoFront: null,
        idPhotoBack: null,
        kraCertificate: null,
      })
    }
    setFormErrors({})
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditAgent(null)
    setFormErrors({})
    setImagePreviews({
      agentPhoto: null,
      idPhotoFront: null,
      idPhotoBack: null,
      kraCertificate: null,
    })
  }

  const handleFileChange = (e, key) => {
    const file = e.target.files[0]
    setFormData({ ...formData, [key]: file })
    if (file && ["agentPhoto", "idPhotoFront", "idPhotoBack"].includes(key)) {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreviews({ ...imagePreviews, [key]: reader.result })
      }
      reader.readAsDataURL(file)
    } else if (key === "kraCertificate" && file) {
      setImagePreviews({ ...imagePreviews, kraCertificate: URL.createObjectURL(file) })
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const formDataToSend = new FormData()
    formDataToSend.append("first_name", formData.first_name)
    formDataToSend.append("last_name", formData.last_name)
    formDataToSend.append("email", formData.email)
    formDataToSend.append("phone_number", formData.phone_number)
    formDataToSend.append("id_number", formData.id_number)
    formDataToSend.append("kra_pin", formData.kra_pin)
    formDataToSend.append("is_active", formData.is_active)
    if (formData.agentPhoto) formDataToSend.append("agentPhoto", formData.agentPhoto)
    if (formData.idPhotoFront) formDataToSend.append("idPhotoFront", formData.idPhotoFront)
    if (formData.idPhotoBack) formDataToSend.append("idPhotoBack", formData.idPhotoBack)
    if (formData.kraCertificate) formDataToSend.append("kraCertificate", formData.kraCertificate)

    try {
      if (editAgent) {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/auth/sales-agents/${editAgent.id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth setup
            },
          }
        )
        setAgents(agents.map((agent) => (agent.id === editAgent.id ? response.data.agent : agent)))
        setNotification({
          open: true,
          message: "Sales agent updated successfully!",
          severity: "success",
        })
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/sales-agents`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth setup
            },
          }
        )
        setAgents([...agents, response.data.agent])
        setNotification({
          open: true,
          message: "Sales agent added successfully! Confirmation email sent.",
          severity: "success",
        })
      }
      handleClose()
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to process sales agent"
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      })
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/auth/sales-agents/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth setup
        },
      })
      setAgents(agents.filter((agent) => agent.id !== id))
      setNotification({
        open: true,
        message: "Sales agent deleted successfully!",
        severity: "success",
      })
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.message || "Failed to delete sales agent",
        severity: "error",
      })
    }
  }

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  const getStatusColor = (status) => {
    return status ? "success" : "error"
  }

  // Calculate summary stats
  const totalAgents = agents.length
  const activeAgents = agents.filter((agent) => agent.is_active).length

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Sales Agent Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={6}>
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
        <Grid item xs={12} sm={6} md={6}>
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
                <Person sx={{ fontSize: 40, color: "success.main" }} />
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
                <TableCell sx={{ fontWeight: "bold" }}>Agent Code</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>ID Number</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>KRA PIN</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {agents.length === 0 ? (
    <TableRow>
      <TableCell colSpan={6} align="center">
        <Typography variant="body2" color="text.secondary">
          No sales agents found
        </Typography>
      </TableCell>
    </TableRow>
  ) : (
    agents.map((agent) => (
      <TableRow key={agent.id} hover>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
              {agent.first_name?.charAt(0) || "?"}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight="medium">
                {`${agent.first_name || "Unknown"} ${agent.last_name || ""}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {agent.email || "No email"}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                <Phone sx={{ fontSize: 12, mr: 0.5 }} />
                {agent.phone_number || "No phone"}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{agent.agent_code || "N/A"}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{agent.id_number || "N/A"}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{agent.kra_pin || "N/A"}</Typography>
        </TableCell>
        <TableCell align="center">
          <Chip
            label={agent.is_active ? "Active" : "Inactive"}
            size="small"
            color={getStatusColor(agent.is_active)}
          />
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
    ))
  )}
</TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Add/Edit Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>{editAgent ? "Edit Agent" : "Add New Agent"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  error={!!formErrors.first_name}
                  helperText={formErrors.first_name}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  error={!!formErrors.last_name}
                  helperText={formErrors.last_name}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ textAlign: "left", justifyContent: "flex-start" }}
                >
                  {formData.agentPhoto ? formData.agentPhoto.name : "Upload Agent Photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    hidden
                    onChange={(e) => handleFileChange(e, "agentPhoto")}
                  />
                </Button>
                {imagePreviews.agentPhoto && (
                  <Box sx={{ mt: 1 }}>
                    <img src={imagePreviews.agentPhoto} alt="Agent Preview" style={{ maxWidth: "100%", maxHeight: "150px" }} />
                  </Box>
                )}
                {formErrors.agentPhoto && (
                  <Typography variant="caption" color="error">
                    {formErrors.agentPhoto}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ID Number (8 digits)"
                  value={formData.id_number}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  error={!!formErrors.id_number}
                  helperText={formErrors.id_number}
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ textAlign: "left", justifyContent: "flex-start" }}
                >
                  {formData.idPhotoFront ? formData.idPhotoFront.name : "Upload ID Photo (Front)"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    hidden
                    onChange={(e) => handleFileChange(e, "idPhotoFront")}
                  />
                </Button>
                {imagePreviews.idPhotoFront && (
                  <Box sx={{ mt: 1 }}>
                    <img src={imagePreviews.idPhotoFront} alt="ID Front Preview" style={{ maxWidth: "100%", maxHeight: "150px" }} />
                  </Box>
                )}
                {formErrors.idPhotoFront && (
                  <Typography variant="caption" color="error">
                    {formErrors.idPhotoFront}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ textAlign: "left", justifyContent: "flex-start" }}
                >
                  {formData.idPhotoBack ? formData.idPhotoBack.name : "Upload ID Photo (Back)"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    hidden
                    onChange={(e) => handleFileChange(e, "idPhotoBack")}
                  />
                </Button>
                {imagePreviews.idPhotoBack && (
                  <Box sx={{ mt: 1 }}>
                    <img src={imagePreviews.idPhotoBack} alt="ID Back Preview" style={{ maxWidth: "100%", maxHeight: "150px" }} />
                  </Box>
                )}
                {formErrors.idPhotoBack && (
                  <Typography variant="caption" color="error">
                    {formErrors.idPhotoBack}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="KRA PIN (e.g., A123456789B)"
                  value={formData.kra_pin}
                  onChange={(e) => setFormData({ ...formData, kra_pin: e.target.value })}
                  error={!!formErrors.kra_pin}
                  helperText={formErrors.kra_pin}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ textAlign: "left", justifyContent: "flex-start" }}
                >
                  {formData.kraCertificate ? formData.kraCertificate.name : "Upload KRA Certificate (PDF)"}
                  <input
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => handleFileChange(e, "kraCertificate")}
                  />
                </Button>
                {imagePreviews.kraCertificate && (
                  <Box sx={{ mt: 1 }}>
                    <iframe
                      src={imagePreviews.kraCertificate}
                      title="KRA Certificate Preview"
                      style={{ width: "100%", height: "150px" }}
                    />
                  </Box>
                )}
                {formErrors.kraCertificate && (
                  <Typography variant="caption" color="error">
                    {formErrors.kraCertificate}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number (e.g., 0712345678)"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  error={!!formErrors.phone_number}
                  helperText={formErrors.phone_number}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={formData.is_active ? "Active" : "Inactive"}
                />
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