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
  Fab,
} from "@mui/material"
import { Add, Edit, Delete, Inventory, Warning, CheckCircle } from "@mui/icons-material"

const initialInventory = [
  { id: 1, name: "Office Chair", sku: "OFC001", stock: 25, minStock: 10, price: 150000, status: "in_stock" },
  { id: 2, name: "Desk Lamp", sku: "DSK002", stock: 8, minStock: 15, price: 45000, status: "low_stock" },
  { id: 3, name: "Computer Mouse", sku: "CMP003", stock: 2, minStock: 20, price: 25000, status: "critical" },
  { id: 4, name: "Keyboard", sku: "KBD004", stock: 30, minStock: 10, price: 75000, status: "in_stock" },
  { id: 5, name: "Monitor Stand", sku: "MON005", stock: 5, minStock: 8, price: 120000, status: "low_stock" },
]

export default function InventoryManagement() {
  const [inventory, setInventory] = useState(initialInventory)
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    stock: "",
    minStock: "",
    price: "",
  })

  const handleOpen = (item = null) => {
    if (item) {
      setEditItem(item)
      setFormData({
        name: item.name,
        sku: item.sku,
        stock: item.stock.toString(),
        minStock: item.minStock.toString(),
        price: item.price.toString(),
      })
    } else {
      setEditItem(null)
      setFormData({
        name: "",
        sku: "",
        stock: "",
        minStock: "",
        price: "",
      })
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditItem(null)
  }

  const handleSubmit = () => {
    const newItem = {
      id: editItem ? editItem.id : Date.now(),
      name: formData.name,
      sku: formData.sku,
      stock: Number.parseInt(formData.stock),
      minStock: Number.parseInt(formData.minStock),
      price: Number.parseInt(formData.price),
      status: getStockStatus(Number.parseInt(formData.stock), Number.parseInt(formData.minStock)),
    }

    if (editItem) {
      setInventory(inventory.map((item) => (item.id === editItem.id ? newItem : item)))
    } else {
      setInventory([...inventory, newItem])
    }

    handleClose()
  }

  const handleDelete = (id) => {
    setInventory(inventory.filter((item) => item.id !== id))
  }

  const getStockStatus = (stock, minStock) => {
    if (stock <= minStock * 0.5) return "critical"
    if (stock <= minStock) return "low_stock"
    return "in_stock"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "critical":
        return "error"
      case "low_stock":
        return "warning"
      case "in_stock":
        return "success"
      default:
        return "default"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "critical":
        return <Warning />
      case "low_stock":
        return <Warning />
      case "in_stock":
        return <CheckCircle />
      default:
        return <Inventory />
    }
  }

  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Calculate summary stats
  const totalItems = inventory.length
  const lowStockItems = inventory.filter((item) => item.status === "low_stock").length
  const criticalItems = inventory.filter((item) => item.status === "critical").length
  const totalValue = inventory.reduce((sum, item) => sum + item.stock * item.price, 0)

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Inventory Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {totalItems}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                </Box>
                <Inventory sx={{ fontSize: 40, color: "primary.main" }} />
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
                    {lowStockItems}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: "warning.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {criticalItems}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Critical Stock
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: "error.main" }} />
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
                    {formatNumber(totalValue)}/=
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Value
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: "success.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Inventory Items
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Add Item
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Item Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Stock
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Min Stock
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Price
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
              {inventory.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.sku}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" fontWeight="bold">
                      {item.stock}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {item.minStock}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="medium">
                      {formatNumber(item.price)}/=
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={getStatusIcon(item.status)}
                      label={item.status.replace("_", " ").toUpperCase()}
                      size="small"
                      color={getStatusColor(item.status)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpen(item)} sx={{ mr: 1 }}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? "Edit Item" : "Add New Item"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Current Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Minimum Stock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Price (UGX)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editItem ? "Update" : "Add"}
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
