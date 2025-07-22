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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
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
  const [filteredSuppliers, setFilteredSuppliers] = useState([])
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    telephone: "",
    telephone2: "",
    contact_name: "",
    contact_name2: "",
    office: "",
    floor: "",
    building_name: "",
    street_name: "",
    city: "",
    postal_address: "",
    kra_number: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })
  const [loading, setLoading] = useState(false)
  const [sortOrder, setSortOrder] = useState("A-Z")
  const [searchQuery, setSearchQuery] = useState("")

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
        setFilteredSuppliers(data || [])
        
        // Check if a specific supplier ID is passed (from dropdown)
        if (data && onSuppliersChange?.data?.id) {
          const supplier = data.find(s => s.id === onSuppliersChange.data.id)
          if (supplier) {
            setFormData(supplier)
            setIsFormOpen(true)
          }
        }
      } catch (error) {
        setNotification({ open: true, message: `Error: ${error.message}`, severity: "error" })
      } finally {
        setLoading(false)
      }
    }
    fetchSuppliers()
  }, [API_URL, onSuppliersChange])

  // Handle sorting and searching
  useEffect(() => {
    let updatedSuppliers = [...suppliers]
    
    // Filter by search query
    if (searchQuery.trim()) {
      updatedSuppliers = updatedSuppliers.filter((supplier) =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort by name
    updatedSuppliers.sort((a, b) => {
      const nameA = a.name.toLowerCase()
      const nameB = b.name.toLowerCase()
      return sortOrder === "A-Z" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    })

    setFilteredSuppliers(updatedSuppliers)
  }, [suppliers, sortOrder, searchQuery])

  // Validate form
  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = "Supplier name is required"
    if (!formData.email.trim()) errors.email = "Email is required"
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Invalid email format (e.g., user@domain.com)"
    if (!formData.telephone.trim()) errors.telephone = "Primary telephone is required"
    else if (!/^07\d{8}$/.test(formData.telephone)) errors.telephone = "Telephone must be 10 digits starting with 07 (e.g., 0712345678)"
    if (formData.telephone2 && !/^07\d{8}$/.test(formData.telephone2)) errors.telephone2 = "Secondary telephone must be 10 digits starting with 07 (e.g., 0712345678)"
    if (!formData.contact_name.trim()) errors.contact_name = "Primary contact name is required"
    if (!formData.office.trim()) errors.office = "Office is required"
    if (!formData.street_name.trim()) errors.street_name = "Street name is required"
    if (!formData.city.trim()) errors.city = "City is required"
    if (!formData.postal_address.trim()) errors.postal_address = "Postal address/code is required"
    if (!formData.kra_number.trim()) errors.kra_number = "KRA Number is required"
    else if (!/^[A-Za-z0-9]+$/.test(formData.kra_number)) errors.kra_number = "KRA Number must be alphanumeric"

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
      if (onSuppliersChange) onSuppliersChange([...suppliers])
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
      const updatedSuppliers = suppliers.filter((s) => s.id !== id)
      setSuppliers(updatedSuppliers)
      setNotification({ open: true, message: "Supplier deleted successfully!", severity: "success" })
      if (onSuppliersChange) onSuppliersChange(updatedSuppliers)
    } catch (error) {
      setNotification({ open: true, message: `Error: ${error.message}`, severity: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      email: "",
      telephone: "",
      telephone2: "",
      contact_name: "",
      contact_name2: "",
      office: "",
      floor: "",
      building_name: "",
      street_name: "",
      city: "",
      postal_address: "",
      kra_number: "",
    })
    setFormErrors({})
    setIsFormOpen(false)
  }

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  // Handle sort change
  const handleSortChange = (event) => {
    setSortOrder(event.target.value)
  }

  // Handle search change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8fafc" }}>
      <Typography variant="h5" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
        Supplier Management
      </Typography>

      {/* Add Supplier Button and Filters */}
      {!isFormOpen && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsFormOpen(true)}
            sx={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Add Supplier
          </Button>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Search by Name"
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              sx={{ width: 200 }}
            />
            <FormControl size="small" sx={{ width: 120 }}>
              <InputLabel>Sort</InputLabel>
              <Select value={sortOrder} onChange={handleSortChange} label="Sort">
                <MenuItem value="A-Z">Name (A-Z)</MenuItem>
                <MenuItem value="Z-A">Name (Z-A)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      {/* Supplier Form */}
      {isFormOpen && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
            {formData.id ? "Edit Supplier" : "Add New Supplier"}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
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
                label="Primary Telephone (e.g., 0712345678)"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                error={!!formErrors.telephone}
                helperText={formErrors.telephone}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="Secondary Telephone (e.g., 0712345678)"
                value={formData.telephone2}
                onChange={(e) => setFormData({ ...formData, telephone2: e.target.value })}
                error={!!formErrors.telephone2}
                helperText={formErrors.telephone2}
                fullWidth
                size="small"
              />
              <TextField
                label="Primary Contact Name"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                error={!!formErrors.contact_name}
                helperText={formErrors.contact_name}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="Secondary Contact Name"
                value={formData.contact_name2}
                onChange={(e) => setFormData({ ...formData, contact_name2: e.target.value })}
                error={!!formErrors.contact_name2}
                helperText={formErrors.contact_name2}
                fullWidth
                size="small"
              />
              <TextField
                label="Office Number"
                value={formData.office}
                onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                error={!!formErrors.office}
                helperText={formErrors.office}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="Floor Number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                error={!!formErrors.floor}
                helperText={formErrors.floor}
                fullWidth
                size="small"
              />
              <TextField
                label="Building Name"
                value={formData.building_name}
                onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                error={!!formErrors.building_name}
                helperText={formErrors.building_name}
                fullWidth
                size="small"
              />
              <TextField
                label="Street Name"
                value={formData.street_name}
                onChange={(e) => setFormData({ ...formData, street_name: e.target.value })}
                error={!!formErrors.street_name}
                helperText={formErrors.street_name}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                error={!!formErrors.city}
                helperText={formErrors.city}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="Postal Address/Code"
                value={formData.postal_address}
                onChange={(e) => setFormData({ ...formData, postal_address: e.target.value })}
                error={!!formErrors.postal_address}
                helperText={formErrors.postal_address}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="KRA Number (e.g., A123456789B)"
                value={formData.kra_number}
                onChange={(e) => setFormData({ ...formData, kra_number: e.target.value })}
                error={!!formErrors.kra_number}
                helperText={formErrors.kra_number}
                fullWidth
                size="small"
                required
              />
              <Box sx={{ gridColumn: { sm: "1 / 3" }, display: "flex", gap: 1 }}>
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
              <TableCell sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>KRA Number</TableCell>
              <TableCell sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Primary Telephone</TableCell>
              <TableCell sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Primary Contact</TableCell>
              <TableCell sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Address</TableCell>
              <TableCell sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography sx={{ fontFamily: "'Poppins', sans-serif" }}>No suppliers found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier, index) => (
                <StyledTableRow key={supplier.id} index={index}>
                  <TableCell sx={{ fontFamily: "'Poppins', sans-serif" }}>{supplier.name}</TableCell>
                  <TableCell sx={{ fontFamily: "'Poppins', sans-serif" }}>{supplier.code}</TableCell>
                  <TableCell sx={{ fontFamily: "'Poppins', sans-serif" }}>{supplier.kra_number}</TableCell>
                  <TableCell sx={{ fontFamily: "'Poppins', sans-serif" }}>
                    <a href={`mailto:${supplier.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {supplier.email}
                    </a>
                  </TableCell>
                  <TableCell sx={{ fontFamily: "'Poppins', sans-serif" }}><a href={`tel:${supplier.telephone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {supplier.telephone}
                    </a></TableCell>
                  <TableCell sx={{ fontFamily: "'Poppins', sans-serif" }}>{supplier.contact_name}</TableCell>
                  <TableCell sx={{ fontFamily: "'Poppins', sans-serif" }}>
                    {`${supplier.office || ''} ${supplier.floor || ''} ${supplier.building_name || ''}, ${supplier.street_name}, ${supplier.city}, ${supplier.postal_address}`.trim()}
                  </TableCell>
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