"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"
import { styled } from "@mui/material/styles"

const StyledTableRow = styled(TableRow)(({ theme, index }) => ({
  backgroundColor: index % 2 === 0 ? "#e3f2fd" : "#ffffff",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}))

const SupplierManagement = ({ onSuppliersChange }) => {
  const [suppliers, setSuppliers] = useState([])
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    code: "",
    email: "",
    telephone: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })
  const [loading, setLoading] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/suppliers`, {
          headers: { "Content-Type": "application/json" },
        })
        if (!response.ok) throw new Error("Failed to fetch suppliers")
        const data = await response.json()
        setSuppliers(data || [])
      } catch (error) {
        setNotification({ open: true, message: `Error: ${error.message}`, severity: "error" })
      } finally {
        setLoading(false)
      }
    }
    fetchSuppliers()
  }, [API_URL])

  // Validate form
  const validateForm = () => {
    const errors = {}
    // Mandatory field validations
    if (!formData.name.trim()) errors.name = "Supplier name is required"
    if (!formData.code.trim()) errors.code = "Supplier code is required"
    else if (!/^[A-Z0-9]+$/.test(formData.code)) errors.code = "Code must be alphanumeric (e.g., A01)"
    if (!formData.email.trim()) errors.email = "Email is required"
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Invalid email format (e.g., user@domain.com)"
    if (!formData.telephone.trim()) errors.telephone = "Telephone is required"
    else if (!/^07\d{8}$/.test(formData.telephone)) errors.telephone = "Telephone must be 10 digits starting with 07 (e.g., 0712345678)"

    // Check for unique supplier code
    if (formData.code && suppliers.some((s) => s.code === formData.code && s.id !== formData.id)) {
      errors.code = "Supplier code must be unique"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const url = formData.id ? `${API_URL}/suppliers/${formData.id}` : `${API_URL}/suppliers`
      const method = formData.id ? "PUT" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error(formData.id ? "Failed to update supplier" : "Failed to add supplier")
      const updatedSupplier = await response.json()

      setSuppliers((prev) =>
        formData.id
          ? prev.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s))
          : [...prev, updatedSupplier]
      )
      setNotification({
        open: true,
        message: formData.id ? "Supplier updated successfully!" : "Supplier added successfully!",
        severity: "success",
      })
      if (onSuppliersChange) onSuppliersChange(suppliers)
      resetForm()
    } catch (error) {
      setNotification({ open: true, message: `Error: ${error.message}`, severity: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Handle edit
  const handleEdit = (supplier) => {
    setFormData(supplier)
    setIsFormOpen(true)
  }

  // Handle delete
  const handleDelete = async (id) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) throw new Error("Failed to delete supplier")
      setSuppliers((prev) => prev.filter((s) => s.id !== id))
      setNotification({ open: true, message: "Supplier deleted successfully!", severity: "success" })
      if (onSuppliersChange) onSuppliersChange(suppliers)
    } catch (error) {
      setNotification({ open: true, message: `Error: ${error.message}`, severity: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({ id: null, name: "", code: "", email: "", telephone: "" })
    setFormErrors({})
    setIsFormOpen(false)
  }

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8fafc" }}>
      <Typography variant="h5" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
        Supplier Management
      </Typography>

      {/* Add Supplier Button */}
      {!isFormOpen && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsFormOpen(true)}
          sx={{ mb: 3, fontFamily: "'Poppins', sans-serif" }}
        >
          Add Supplier
        </Button>
      )}

      {/* Supplier Form */}
      {isFormOpen && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
            {formData.id ? "Edit Supplier" : "Add New Supplier"}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Supplier Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="Supplier Code (e.g., A01)"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                error={!!formErrors.code}
                helperText={formErrors.code}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!formErrors.email}
                helperText={formErrors.email}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="Telephone (e.g., 0712345678)"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                error={!!formErrors.telephone}
                helperText={formErrors.telephone}
                fullWidth
                size="small"
                required
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {loading ? <CircularProgress size={24} /> : formData.id ? "Update Supplier" : "Add Supplier"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  sx={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      )}

      {/* Suppliers Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Code</TableCell>
              <TableCell sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Telephone</TableCell>
              <TableCell sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography sx={{ fontFamily: "'Poppins', sans-serif" }}>No suppliers found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier, index) => (
                <StyledTableRow key={supplier.id} index={index}>
                  <TableCell sx={{ fontFamily: "'Poppins', sans-serif" }}>{supplier.name}</TableCell>
                  <TableCell sx={{ fontFamily: "'Poppins', sans-serif" }}>{supplier.code}</TableCell>
                  <TableCell sx={{ fontFamily: "'Poppins', sans-serif" }}>
                    <a href={`mailto:${supplier.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {supplier.email}
                    </a>
                  </TableCell>
                  <TableCell sx={{ fontFamily: "'Poppins', sans-serif" }}>{supplier.telephone}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(supplier)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(supplier.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

export default SupplierManagement