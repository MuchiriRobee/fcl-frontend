"use client"

import { useState, useEffect, useContext } from "react"
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
  CircularProgress,
} from "@mui/material"
import { Search, Edit, Delete, Visibility, Add } from "@mui/icons-material"
import { CategoriesContext } from "./CategoriesContext"

export default function ManageItems({ onEditItem, onAddNewItem, refreshItems, onItemsRefreshed }) {
  const [items, setItems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewDialog, setViewDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const { categories, loading: categoriesLoading, error: categoriesError } = useContext(CategoriesContext)

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true)
    setErrorMessage("")
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products`)
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      // Map API data to UI structure
      const mappedItems = data.map(item => ({
        id: item.id,
        productName: item.product_name,
        itemCode: item.product_code,
        description: item.description || "",
        category: item.category?.name || "Unknown",
        category_id: item.category_id,
        subCategory: item.subcategory?.name || "",
        subCategory_id: item.subcategory_id || "",
        cashbackRate: item.cashback_rate || 0,
        stockUnits: item.stock_units,
        alertQuantity: item.alert_quantity || 0,
        measurementUnit: item.uom,
        image: item.image_url || "/placeholder.svg?height=200&width=200",
        tierPricing: [
          { minQuantity: item.qty1_min || 1, maxQuantity: item.qty1_max || 999, price: item.selling_price1 || 0 },
          item.selling_price2 && item.qty2_min ? { minQuantity: item.qty2_min, maxQuantity: item.qty2_max || null, price: item.selling_price2 } : null,
          item.selling_price3 && item.qty3_min ? { minQuantity: item.qty3_min, maxQuantity: null, price: item.selling_price3 } : null,
        ].filter(tier => tier !== null && tier.price > 0),
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }))
      setItems(mappedItems)
    } catch (error) {
      setErrorMessage(error.message || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  // Fetch products on mount and when refreshItems changes
  useEffect(() => {
    fetchProducts()
    if (refreshItems && onItemsRefreshed) {
      onItemsRefreshed()
    }
  }, [refreshItems])

  // Filter items based on search
  const filteredItems = items.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditItem = (item) => {
    if (onEditItem) {
      // Map back to API structure for NewItemForm.jsx
      const editItem = {
        id: item.id,
        product_name: item.productName,
        product_code: item.itemCode,
        description: item.description,
        category_id: item.category_id,
        subcategory_id: item.subCategory_id,
        uom: item.measurementUnit,
        image_url: item.image,
        cashback_rate: item.cashbackRate,
        stock_units: item.stockUnits,
        alert_quantity: item.alertQuantity,
        qty1_min: item.tierPricing[0]?.minQuantity || "",
        qty1_max: item.tierPricing[0]?.maxQuantity || "",
        selling_price1: item.tierPricing[0]?.price || "",
        qty2_min: item.tierPricing[1]?.minQuantity || "",
        qty2_max: item.tierPricing[1]?.maxQuantity || "",
        selling_price2: item.tierPricing[1]?.price || "",
        qty3_min: item.tierPricing[2]?.minQuantity || "",
        selling_price3: item.tierPricing[2]?.price || "",
      }
      onEditItem(editItem)
    }
  }

  const handleDeleteItem = (item) => {
    setSelectedItem(item)
    setDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (selectedItem) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${selectedItem.id}`, {
          method: "DELETE",
        })
        if (!response.ok) throw new Error("Failed to delete product")
        setItems(items.filter((item) => item.id !== selectedItem.id))
        setSuccessMessage(`Item "${selectedItem.productName}" deleted successfully!`)
        setTimeout(() => setSuccessMessage(""), 3000)
      } catch (error) {
        setErrorMessage(error.message || "Failed to delete product")
        setTimeout(() => setErrorMessage(""), 3000)
      }
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
          {index === 2
            ? `${tier.minQuantity} and above PC: ${formatCurrency(tier.price)}`
            : `${tier.minQuantity}-${tier.maxQuantity || '∞'} PC: ${formatCurrency(tier.price)}`}
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

  // Get parent category name
  const getParentCategory = (categoryId) => {
    if (!Array.isArray(categories) || categories.length === 0) return "Unknown"
    const category = categories.find(cat => cat.id === categoryId)
    if (!category) {
      const parent = categories.find(parent =>
        parent.categories?.some(cat => cat.id === categoryId)
      )
      return parent ? parent.name : "Unknown"
    }
    return category.name
  }

  // Handle loading and error states
  if (categoriesLoading || loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading products and categories...
        </Typography>
      </Box>
    )
  }

  if (categoriesError || errorMessage) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="error">
          {categoriesError || errorMessage}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: "100%", mx: "auto", p: 2 }}>
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

      {/* Messages */}
      <Collapse in={!!successMessage}>
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Collapse>
      <Collapse in={!!errorMessage}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      </Collapse>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          placeholder="Search items by name, code, category, or subcategory..."
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
          inputProps={{ "aria-label": "Search products" }}
          sx={{
            minWidth: { xs: "100%", sm: 400 },
            "& .MuiOutlinedInput-root": {
              bgcolor: "white",
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* Items Table */}
      <Paper sx={{ overflow: "hidden", borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <TableContainer sx={{ width: "100%" }}>
          <Table stickyHeader aria-label="Products table">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell scope="col" sx={{ fontWeight: 700, color: "#333", fontSize: "0.95rem", minWidth: 200 }}>
                  Product
                </TableCell>
                <TableCell scope="col" sx={{ fontWeight: 700, color: "#333", fontSize: "0.95rem", minWidth: 80 }}>
                  Code
                </TableCell>
                <TableCell scope="col" sx={{ fontWeight: 700, color: "#333", fontSize: "0.95rem", minWidth: 120 }}>
                  Parent Category
                </TableCell>
                <TableCell scope="col" sx={{ fontWeight: 700, color: "#333", fontSize: "0.95rem", minWidth: 140 }}>
                  Price Range
                </TableCell>
                <TableCell scope="col" sx={{ fontWeight: 700, color: "#333", fontSize: "0.95rem", minWidth: 80 }}>
                  Cashback
                </TableCell>
                <TableCell scope="col" sx={{ fontWeight: 700, color: "#333", fontSize: "0.95rem", minWidth: 100 }}>
                  Stock
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 700, color: "#333", fontSize: "0.95rem", minWidth: 120 }}
                  align="center"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No products found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item.stockUnits, item.alertQuantity)
                  const validTiers = item.tierPricing.filter(tier => tier.price > 0)
                  const lowestPrice = validTiers.length > 0 ? Math.min(...validTiers.map(tier => tier.price)) : 0
                  const highestPrice = validTiers.length > 0 ? Math.max(...validTiers.map(tier => tier.price)) : 0
                  const parentCategory = getParentCategory(item.category_id)

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
                            alt={item.productName}
                            sx={{
                              mr: 1.5,
                              width: 40,
                              height: 40,
                              bgcolor: "#f5f5f5",
                              borderRadius: 1,
                            }}
                          />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#333", fontSize: "0.95rem" }}>
                              {item.productName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.85rem" }}
                            >
                              {item.description ? item.description.substring(0, 30) + "..." : "No description"}
                            </Typography>
                          </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#1976d2", fontSize: "0.95rem" }}
                          >
                            {item.itemCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Chip
                              label={parentCategory}
                              size="small"
                              sx={{
                                bgcolor: "#e3f2fd",
                                color: "#1976d2",
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                height: 20,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                              {item.category}
                              {item.subCategory && ` > ${item.subCategory}`}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                              {validTiers.length > 0
                                ? `${formatCurrency(lowestPrice)} - ${formatCurrency(highestPrice)}`
                                : formatCurrency(0)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                              {validTiers.length} tier{validTiers.length !== 1 ? "s" : ""}
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
                              fontSize: "0.85rem",
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
                                fontSize: "0.85rem",
                                height: 20,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
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
                              aria-label={`View ${item.productName}`}
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
                              aria-label={`Edit ${item.productName}`}
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
                              aria-label={`Delete ${item.productName}`}
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
                  })
                )}
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
          <Button
            onClick={() => setDeleteDialog(false)}
            sx={{ textTransform: "none", color: "#666" }}
            aria-label="Cancel delete"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{ textTransform: "none", fontWeight: 600 }}
            aria-label="Confirm delete"
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
                      src={selectedItem.image}
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
                    {selectedItem.description || "No description"}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Pricing Tiers
                    </Typography>
                    <Card sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                      {formatPricingTiers(selectedItem.tierPricing)}
                    </Card>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Parent Category:</strong> {getParentCategory(selectedItem.category_id)}
                      </Typography>
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
          <Button
            onClick={() => setViewDialog(false)}
            sx={{ textTransform: "none", color: "#666" }}
            aria-label="Close view dialog"
          >
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
            aria-label={`Edit ${selectedItem?.productName}`}
          >
            Edit Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}