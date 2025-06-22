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
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Collapse,
  Grid,
  Card,
  Stack,
} from "@mui/material"
import { Search, Edit, Delete, Visibility, Add } from "@mui/icons-material"

// Updated sample items data with office supplies theme and KSh pricing
const sampleItems = [
  {
    id: 1,
    productName: "A4 Copy Paper",
    itemCode: "PP001",
    description: "High quality 80gsm A4 copy paper, 500 sheets per ream",
    category: "Office Essentials",
    subCategory: "Paper Products",
    cashbackRate: 5,
    stockUnits: 150,
    alertQuantity: 20,
    measurementUnit: "Reams",
    image: "/placeholder.svg?height=200&width=200",
    tierPricing: [
      { minQuantity: 1, maxQuantity: 5, price: 450 },
      { minQuantity: 6, maxQuantity: 20, price: 420 },
      { minQuantity: 21, maxQuantity: 999, price: 390 },
    ],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    productName: "HP LaserJet Toner",
    itemCode: "TN001",
    description: "Original HP LaserJet toner cartridge, black, high yield",
    category: "Toners & Inks",
    subCategory: "Laser Toners",
    cashbackRate: 8,
    stockUnits: 25,
    alertQuantity: 5,
    measurementUnit: "Pieces",
    image: "/placeholder.svg?height=200&width=200",
    tierPricing: [
      { minQuantity: 1, maxQuantity: 2, price: 8500 },
      { minQuantity: 3, maxQuantity: 5, price: 8200 },
      { minQuantity: 6, maxQuantity: 999, price: 7900 },
    ],
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
  },
  {
    id: 3,
    productName: "Office Chair Executive",
    itemCode: "CH001",
    description: "Ergonomic executive office chair with lumbar support",
    category: "Office Furniture",
    subCategory: "Chairs",
    cashbackRate: 10,
    stockUnits: 12,
    alertQuantity: 3,
    measurementUnit: "Pieces",
    image: "/placeholder.svg?height=200&width=200",
    tierPricing: [
      { minQuantity: 1, maxQuantity: 2, price: 15500 },
      { minQuantity: 3, maxQuantity: 5, price: 14800 },
      { minQuantity: 6, maxQuantity: 999, price: 14200 },
    ],
    createdAt: "2024-01-15T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
  {
    id: 4,
    productName: "Scientific Calculator",
    itemCode: "CA001",
    description: "Casio scientific calculator for students and professionals",
    category: "School Supplies",
    subCategory: "Educational Tools",
    cashbackRate: 6,
    stockUnits: 35,
    alertQuantity: 8,
    measurementUnit: "Pieces",
    image: "/placeholder.svg?height=200&width=200",
    tierPricing: [
      { minQuantity: 1, maxQuantity: 5, price: 2200 },
      { minQuantity: 6, maxQuantity: 15, price: 2050 },
      { minQuantity: 16, maxQuantity: 999, price: 1900 },
    ],
    createdAt: "2024-01-15T13:00:00Z",
    updatedAt: "2024-01-15T13:00:00Z",
  },
  {
    id: 5,
    productName: "Heavy Duty Stapler",
    itemCode: "ST001",
    description: "Metal heavy duty stapler, 100 sheet capacity",
    category: "Stapling & Punching",
    subCategory: "Staplers",
    cashbackRate: 7,
    stockUnits: 18,
    alertQuantity: 4,
    measurementUnit: "Pieces",
    image: "/placeholder.svg?height=200&width=200",
    tierPricing: [
      { minQuantity: 1, maxQuantity: 3, price: 1800 },
      { minQuantity: 4, maxQuantity: 10, price: 1650 },
      { minQuantity: 11, maxQuantity: 999, price: 1500 },
    ],
    createdAt: "2024-01-15T14:00:00Z",
    updatedAt: "2024-01-15T14:00:00Z",
  },
]

export default function ManageItems({ onEditItem, onAddNewItem }) {
  const [items, setItems] = useState(sampleItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewDialog, setViewDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Filter items based on search
  const filteredItems = items.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEditItem = (item) => {
    if (onEditItem) {
      onEditItem(item)
    }
  }

  const handleDeleteItem = (item) => {
    setSelectedItem(item)
    setDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (selectedItem) {
      setItems(items.filter((item) => item.id !== selectedItem.id))
      setSuccessMessage(`Item "${selectedItem.productName}" deleted successfully!`)
      setTimeout(() => setSuccessMessage(""), 3000)
    }
    setDeleteDialog(false)
    setSelectedItem(null)
  }

  const handleViewItem = (item) => {
    setSelectedItem(item)
    setViewDialog(true)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatPricingTiers = (tierPricing) => {
    return tierPricing.map((tier, index) => (
      <Box key={index} sx={{ mb: 1 }}>
        <Typography variant="body2">
          {tier.minQuantity}-{tier.maxQuantity === 999 ? "∞" : tier.maxQuantity} PC: {formatCurrency(tier.price)}
        </Typography>
      </Box>
    ))
  }

  const getStockStatus = (stockUnits, alertQuantity) => {
    if (stockUnits <= alertQuantity) {
      return { color: "#f44336", label: "Low", bgcolor: "#ffebee" }
    } else if (stockUnits <= alertQuantity * 2) {
      return { color: "#ff9800", label: "Medium", bgcolor: "#fff3e0" }
    } else {
      return { color: "#4caf50", label: "Good", bgcolor: "#e8f5e8" }
    }
  }

  return (
    <Box sx={{ maxWidth: "100%", mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>
            Manage Items
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View, edit, and manage your product inventory
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddNewItem}
          sx={{
            bgcolor: "#1976d2",
            "&:hover": { bgcolor: "#1565c0" },
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 2,
          }}
        >
          Add New Item
        </Button>
      </Box>

      {/* Success Message */}
      <Collapse in={!!successMessage}>
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Collapse>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          placeholder="Search items by name, code, or category..."
          variant="outlined"
          size="medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#666" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { xs: "100%", sm: 400 },
            "& .MuiOutlinedInput-root": {
              bgcolor: "white",
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* Items Table - Responsive Design */}
      <Paper sx={{ overflow: "hidden", borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <TableContainer sx={{ width: "100%" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 200 }}>
                  Product
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 80 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 120 }}>
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 140 }}>
                  Price Range
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 80 }}>
                  Cashback
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 100 }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 120 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item.stockUnits, item.alertQuantity)
                const lowestPrice = Math.min(...item.tierPricing.map((tier) => tier.price))
                const highestPrice = Math.max(...item.tierPricing.map((tier) => tier.price))

                return (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "#f8f9fa" },
                      borderBottom: "1px solid #e9ecef",
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={item.image}
                          sx={{
                            mr: 1.5,
                            width: 40,
                            height: 40,
                            bgcolor: "#f5f5f5",
                            borderRadius: 1,
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#333", fontSize: "0.85rem" }}>
                            {item.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                            {item.description.substring(0, 30)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1976d2", fontSize: "0.8rem" }}>
                        {item.itemCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{
                            bgcolor: "#e3f2fd",
                            color: "#1976d2",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 20,
                          }}
                        />
                        {item.subCategory && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                            {item.subCategory}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                          {formatCurrency(lowestPrice)} - {formatCurrency(highestPrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                          {item.tierPricing.length} tiers
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${item.cashbackRate}%`}
                        size="small"
                        sx={{
                          bgcolor: "#fff3e0",
                          color: "#f57c00",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 20,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Chip
                          label={stockStatus.label}
                          size="small"
                          sx={{
                            bgcolor: stockStatus.bgcolor,
                            color: stockStatus.color,
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 20,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                          {item.stockUnits} {item.measurementUnit}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleViewItem(item)}
                          title="View"
                          sx={{
                            color: "#4caf50",
                            "&:hover": { bgcolor: "#e8f5e8" },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditItem(item)}
                          title="Edit"
                          sx={{
                            color: "#ff9800",
                            "&:hover": { bgcolor: "#fff3e0" },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteItem(item)}
                          title="Delete"
                          sx={{
                            "&:hover": { bgcolor: "#ffebee" },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedItem?.productName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialog(false)} sx={{ textTransform: "none", color: "#666" }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Item Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Item Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                    <img
                      src={selectedItem.image || "/placeholder.svg"}
                      alt={selectedItem.productName}
                      style={{
                        width: "100%",
                        maxWidth: "250px",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {selectedItem.productName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    Item Code: <strong>{selectedItem.itemCode}</strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
                    {selectedItem.description}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Pricing Tiers:
                    </Typography>
                    <Card sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                      {formatPricingTiers(selectedItem.tierPricing)}
                    </Card>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Category:</strong> {selectedItem.category}
                        {selectedItem.subCategory && ` > ${selectedItem.subCategory}`}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Cashback:</strong> {selectedItem.cashbackRate}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Stock:</strong> {selectedItem.stockUnits} {selectedItem.measurementUnit}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Alert Quantity:</strong> {selectedItem.alertQuantity}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewDialog(false)} sx={{ textTransform: "none", color: "#666" }}>
            Close
          </Button>
          <Button
            onClick={() => {
              setViewDialog(false)
              handleEditItem(selectedItem)
            }}
            variant="contained"
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Edit Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
