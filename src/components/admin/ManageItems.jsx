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
import * as XLSX from 'xlsx'

export default function ManageItems({ onEditItem, onAddNewItem, refreshItems, onItemsRefreshed }) {
  const [items, setItems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewDialog, setViewDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [suppliers, setSuppliers] = useState([])
  const [suppliersLoading, setSuppliersLoading] = useState(false)
  const [suppliersError, setSuppliersError] = useState(null)
  const { categories, loading: categoriesLoading, error: categoriesError } = useContext(CategoriesContext)

  // Fetch suppliers
  useEffect(() => {
    setSuppliersLoading(true)
    setSuppliersError(null)
    fetch(`${import.meta.env.VITE_API_URL}/suppliers`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch suppliers")
        return res.json()
      })
      .then(data => {
        setSuppliers(data)
      })
      .catch(err => {
        setSuppliersError(err.message)
        setSuppliers([])
      })
      .finally(() => setSuppliersLoading(false))
  }, [])

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
        parent_category: categories.find(cat => cat.id === item.parent_cat_id)?.name || "Unknown",
        parent_category_id: item.parent_cat_id,
        subCategory: item.subcategory?.name || "",
        subCategory_id: item.subcategory_id || "",
        preferred_vendor: item.preferred_vendor1 ? suppliers.find(s => s.id === item.preferred_vendor1)?.name || "" : "",
        preferred_vendor_id: item.preferred_vendor1 || "",
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
    if (!suppliersLoading && !suppliersError && !categoriesLoading && !categoriesError) {
      fetchProducts()
      if (refreshItems && onItemsRefreshed) {
        onItemsRefreshed()
      }
    }
  }, [refreshItems, suppliersLoading, suppliersError, categoriesLoading, categoriesError])

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
        parent_cat_id: item.parent_category_id,
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
        preferred_vendor1: item.preferred_vendor_id,
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

  const handleExport = () => {
    const exportData = items.map(item => ({
      product_name: item.productName,
      product_code: item.itemCode,
      description: item.description,
      parent_category: item.parent_category,
      category: item.category,
      subcategory: item.subCategory,
      preferred_vendor: item.preferred_vendor,
      uom: item.measurementUnit,
      cashback_rate: item.cashbackRate,
      stock_units: item.stockUnits,
      alert_quantity: item.alertQuantity,
      qty1_min: item.tierPricing[0]?.minQuantity || null,
      qty1_max: item.tierPricing[0]?.maxQuantity || null,
      selling_price1: item.tierPricing[0]?.price || null,
      qty2_min: item.tierPricing[1]?.minQuantity || null,
      qty2_max: item.tierPricing[1]?.maxQuantity || null,
      selling_price2: item.tierPricing[1]?.price || null,
      qty3_min: item.tierPricing[2]?.minQuantity || null,
      selling_price3: item.tierPricing[2]?.price || null,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'products_export.xlsx');
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setErrorMessage("");
    try {
      // Create a flat subCategories array from categories context
      const subCategories = categories.flatMap(parent =>
        parent.categories.flatMap(category =>
          (category.subcategories || []).map(sub => ({
            id: sub.id,
            name: sub.name,
            category_id: category.id,
            parent_category_id: parent.id
          }))
        )
      );

      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map names to IDs with validation
        const importData = jsonData.map((item, index) => {
          const errors = [];

          // Validate required fields
          if (!item.product_name) errors.push(`Row ${index + 2}: Product name is required`);
          if (!item.product_code || !/^[A-Z]\d{9}$/.test(item.product_code)) {
            errors.push(`Row ${index + 2}: Product code must be 1 uppercase letter followed by 9 digits`);
          }
          if (!item.uom) errors.push(`Row ${index + 2}: Unit of measure is required`);
          if (!item.stock_units || isNaN(item.stock_units) || item.stock_units < 0) {
            errors.push(`Row ${index + 2}: Stock units must be a non-negative integer`);
          }
          if (!item.qty1_min || isNaN(item.qty1_min) || item.qty1_min < 1) {
            errors.push(`Row ${index + 2}: Quantity 1 min must be a positive integer`);
          }
          if (!item.qty1_max || isNaN(item.qty1_max) || item.qty1_max < item.qty1_min) {
            errors.push(`Row ${index + 2}: Quantity 1 max must be a positive integer and greater than qty1_min`);
          }
          if (!item.selling_price1 || isNaN(item.selling_price1) || item.selling_price1 < 0) {
            errors.push(`Row ${index + 2}: Selling price 1 must be a non-negative number`);
          }
          if (item.cashback_rate === undefined || isNaN(item.cashback_rate) || item.cashback_rate < 0 || item.cashback_rate > 100) {
            errors.push(`Row ${index + 2}: Cashback rate must be between 0 and 100`);
          }
          // Validate optional pricing tiers
          if (item.selling_price2 && (isNaN(item.selling_price2) || item.selling_price2 < 0)) {
            errors.push(`Row ${index + 2}: Selling price 2 must be a non-negative number`);
          }
          if (item.selling_price3 && (isNaN(item.selling_price3) || item.selling_price3 < 0)) {
            errors.push(`Row ${index + 2}: Selling price 3 must be a non-negative number`);
          }
          if (item.qty2_min && (isNaN(item.qty2_min) || item.qty2_min < 1)) {
            errors.push(`Row ${index + 2}: Quantity 2 min must be a positive integer`);
          }
          if (item.qty2_max && (isNaN(item.qty2_max) || item.qty2_max < item.qty2_min)) {
            errors.push(`Row ${index + 2}: Quantity 2 max must be a positive integer and greater than qty2_min`);
          }
          if (item.qty3_min && (isNaN(item.qty3_min) || item.qty3_min < 1)) {
            errors.push(`Row ${index + 2}: Quantity 3 min must be a positive integer`);
          }
          if (item.alert_quantity && (isNaN(item.alert_quantity) || item.alert_quantity < 0)) {
            errors.push(`Row ${index + 2}: Alert quantity must be a non-negative integer`);
          }
          // Validate cost_price
          if (item.cost_price && (isNaN(item.cost_price) || item.cost_price < 0 || item.cost_price > 9999999999999.99)) {
            errors.push(`Row ${index + 2}: Cost price must be between 0 and 9,999,999,999,999.99`);
          }
          if (item.cost_price && (item.cost_price.toString().split('.')[1]?.length || 0) > 2) {
            errors.push(`Row ${index + 2}: Cost price must have at most 2 decimal places`);
          }
          // Validate vat
          if (item.vat && (isNaN(item.vat) || item.vat < 0 || item.vat > 100)) {
            errors.push(`Row ${index + 2}: VAT must be between 0 and 100`);
          }
          if (item.vat && (item.vat.toString().split('.')[1]?.length || 0) > 2) {
            errors.push(`Row ${index + 2}: VAT must have at most 2 decimal places`);
          }
          // Validate sales agent cashbacks
          if (item.sa_cashback_1st && (isNaN(item.sa_cashback_1st) || item.sa_cashback_1st < 0 || item.sa_cashback_1st > 100)) {
            errors.push(`Row ${index + 2}: 1st purchase cashback must be between 0 and 100`);
          }
          if (item.sa_cashback_1st && (item.sa_cashback_1st.toString().split('.')[1]?.length || 0) > 2) {
            errors.push(`Row ${index + 2}: 1st purchase cashback must have at most 2 decimal places`);
          }
          if (item.sa_cashback_2nd && (isNaN(item.sa_cashback_2nd) || item.sa_cashback_2nd < 0 || item.sa_cashback_2nd > 100)) {
            errors.push(`Row ${index + 2}: 2nd purchase cashback must be between 0 and 100`);
          }
          if (item.sa_cashback_2nd && (item.sa_cashback_2nd.toString().split('.')[1]?.length || 0) > 2) {
            errors.push(`Row ${index + 2}: 2nd purchase cashback must have at most 2 decimal places`);
          }
          if (item.sa_cashback_3rd && (isNaN(item.sa_cashback_3rd) || item.sa_cashback_3rd < 0 || item.sa_cashback_3rd > 100)) {
            errors.push(`Row ${index + 2}: 3rd purchase cashback must be between 0 and 100`);
          }
          if (item.sa_cashback_3rd && (item.sa_cashback_3rd.toString().split('.')[1]?.length || 0) > 2) {
            errors.push(`Row ${index + 2}: 3rd purchase cashback must have at most 2 decimal places`);
          }
          if (item.sa_cashback_4th && (isNaN(item.sa_cashback_4th) || item.sa_cashback_4th < 0 || item.sa_cashback_4th > 100)) {
            errors.push(`Row ${index + 2}: 4th purchase cashback must be between 0 and 100`);
          }
          if (item.sa_cashback_4th && (item.sa_cashback_4th.toString().split('.')[1]?.length || 0) > 2) {
            errors.push(`Row ${index + 2}: 4th purchase cashback must have at most 2 decimal places`);
          }

          // Find parent category
          const parentCategory = categories.find(cat => cat.name === item.parent_category);
          if (!parentCategory && item.parent_category) {
            errors.push(`Row ${index + 2}: Parent category "${item.parent_category}" not found`);
          }

          // Find category within parent category
          const filteredCategories = parentCategory ? parentCategory.categories || [] : [];
          const category = filteredCategories.find(cat => cat.name === item.category);
          if (!category && item.category) {
            errors.push(`Row ${index + 2}: Category "${item.category}" not found`);
          }

          // Find subcategory within category
          const subCategory = category ? subCategories.find(sub => sub.name === item.subcategory && sub.category_id === category.id) : null;
          if (!subCategory && item.subcategory) {
            errors.push(`Row ${index + 2}: Subcategory "${item.subcategory}" not found for category "${item.category}"`);
          }

          // Find supplier
          const supplier = item.preferred_vendor ? suppliers.find(s => s.name === item.preferred_vendor) : null;
          if (!supplier && item.preferred_vendor) {
            errors.push(`Row ${index + 2}: Preferred vendor "${item.preferred_vendor}" not found`);
          }

          if (errors.length > 0) {
            throw new Error(errors.join('; '));
          }

          return {
            productName: item.product_name,
            productCode: item.product_code,
            description: item.description || "",
            parentCatId: parentCategory ? parentCategory.id : null,
            categoryId: category ? category.id : null,
            subcategoryId: subCategory ? subCategory.id : null,
            preferredVendor1: supplier ? supplier.id : null,
            uom: item.uom,
            cashbackRate: parseFloat(item.cashback_rate),
            stockUnits: parseInt(item.stock_units),
            alertQuantity: item.alert_quantity ? parseInt(item.alert_quantity) : null,
            qty1Min: parseInt(item.qty1_min),
            qty1Max: parseInt(item.qty1_max),
            sellingPrice1: parseFloat(item.selling_price1),
            qty2Min: item.qty2_min ? parseInt(item.qty2_min) : null,
            qty2Max: item.qty2_max ? parseInt(item.qty2_max) : null,
            sellingPrice2: item.selling_price2 ? parseFloat(item.selling_price2) : null,
            qty3Min: item.qty3_min ? parseInt(item.qty3_min) : null,
            sellingPrice3: item.selling_price3 ? parseFloat(item.selling_price3) : null,
            costPrice: item.cost_price ? parseFloat(item.cost_price) : null,
            vat: item.vat ? parseFloat(item.vat) : null,
            saCashback1stPurchase: item.sa_cashback_1st ? parseFloat(item.sa_cashback_1st) : null,
            saCashback2ndPurchase: item.sa_cashback_2nd ? parseFloat(item.sa_cashback_2nd) : null,
            saCashback3rdPurchase: item.sa_cashback_3rd ? parseFloat(item.sa_cashback_3rd) : null,
            saCashback4thPurchase: item.sa_cashback_4th ? parseFloat(item.sa_cashback_4th) : null,
            reorderActive: false // Default
          };
        });

        // Send to backend for bulk import
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importData),
        });

        if (response.ok) {
          setSuccessMessage('Products imported successfully');
          await fetchProducts(); // Refresh product list
          setTimeout(() => setSuccessMessage(""), 3000);
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.message || 'Failed to import products');
          setTimeout(() => setErrorMessage(""), 5000);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setErrorMessage(err.message || 'Error processing file');
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
      event.target.value = null; // Reset file input
    }
  };

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
  if (categoriesLoading || loading || suppliersLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading products, categories, or suppliers...
        </Typography>
      </Box>
    )
  }

  if (categoriesError || errorMessage || suppliersError) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="error">
          {categoriesError || errorMessage || suppliersError}
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
      <Box sx={{ display: "flex", gap: 2 }}>
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
        <Button
          variant="contained"
          onClick={handleExport}
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
          Export to Excel
        </Button>
        <Button
          variant="contained"
          component="label"
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
          Import from Excel
          <input type="file" accept=".xlsx,.xls" hidden onChange={handleImport} />
        </Button>
      </Box>
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
                        {validTiers.length > 0 ? (
                          <Typography variant="body2" sx={{ fontSize: "0.95rem" }}>
                            {formatCurrency(lowestPrice)}
                            {lowestPrice !== highestPrice && ` - ${formatCurrency(highestPrice)}`}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.95rem" }}>
                            No pricing
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.95rem" }}>
                          {item.cashbackRate ? `${item.cashbackRate}%` : "0%"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            bgcolor: stockStatus.bgcolor,
                            color: stockStatus.color,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          {item.stockUnits} {item.measurementUnit} ({stockStatus.label})
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                          <IconButton
                            aria-label="View product details"
                            onClick={() => handleViewItem(item)}
                            sx={{ color: "#1976d2" }}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            aria-label="Edit product"
                            onClick={() => handleEditItem(item)}
                            sx={{ color: "#1976d2" }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            aria-label="Delete product"
                            onClick={() => handleDeleteItem(item)}
                            sx={{ color: "#d32f2f" }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
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
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
        sx={{ "& .MuiDialog-paper": { borderRadius: 2, p: 2 } }}
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the product{" "}
            <strong>{selectedItem?.productName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} sx={{ color: "#666" }}>
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
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        aria-labelledby="view-dialog-title"
        sx={{ "& .MuiDialog-paper": { borderRadius: 2, p: 2, maxWidth: 600 } }}
      >
        <DialogTitle id="view-dialog-title">{selectedItem?.productName}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Avatar
                src={selectedItem?.image}
                alt={selectedItem?.productName}
                sx={{ width: 150, height: 150, borderRadius: 2, mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Code:</strong> {selectedItem?.itemCode}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Description:</strong>{" "}
                {selectedItem?.description || "No description"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Category:</strong> {selectedItem?.parent_category} {" "}
                {selectedItem?.category}
                {selectedItem?.subCategory && ` > ${selectedItem.subCategory}`}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Supplier:</strong>{" "}
                {selectedItem?.preferred_vendor || "No supplier"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Unit:</strong> {selectedItem?.measurementUnit}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Cashback:</strong>{" "}
                {selectedItem?.cashbackRate ? `${selectedItem.cashbackRate}%` : "0%"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Stock:</strong> {selectedItem?.stockUnits}{" "}
                {selectedItem?.measurementUnit} (
                {getStockStatus(selectedItem?.stockUnits, selectedItem?.alertQuantity).label})
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Pricing Tiers:</strong>
              </Typography>
              {selectedItem?.tierPricing && formatPricingTiers(selectedItem.tierPricing)}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)} sx={{ color: "#666" }}>
            Close
          </Button>
          <Button
            onClick={() => {
              setViewDialog(false)
              handleEditItem(selectedItem)
            }}
            variant="contained"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}