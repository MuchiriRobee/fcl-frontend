"use client"

import { useState, useEffect, useContext } from "react"
import {
  Box, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Paper, InputAdornment, FormHelperText, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Accordion, AccordionSummary,
  AccordionDetails, Switch, FormControlLabel, Chip, CircularProgress
} from "@mui/material"
import { Upload, Image as ImageIcon, ExpandMore, QrCode } from "@mui/icons-material"
import JsBarcode from "jsbarcode"
import { CategoriesContext } from "./CategoriesContext"

// Static vendor list (temporary, as vendor integration is deferred)
const vendorOptions = ["Vendor A", "Vendor B", "Vendor C"]

// Initial form state
const initialFormState = {
  productName: "",
  productCode: "",
  uom: "PC",
  packSize: "",
  categoryId: "",
  subcategoryId: "",
  description: "",
  longerDescription: "",
  productBarcode: "",
  etimsRefCode: "",
  expiryDate: "",
  image: null,
  imagePreview: null,
  costPrice: "",
  sellingPrice1: "",
  sellingPrice2: "",
  sellingPrice3: "",
  qty1Min: "1",
  qty1Max: "3",
  qty2Min: "4",
  qty2Max: "11",
  qty3Min: "12",
  vat: "16",
  cashbackRate: "0",
  preferredVendor1: "",
  preferredVendor2: "",
  vendorItemCode: "",
  saCashback1stPurchase: "6",
  saCashback2ndPurchase: "4",
  saCashback3rdPurchase: "3",
  saCashback4thPurchase: "2",
  stockUnits: "",
  reorderLevel: "",
  orderLevel: "",
  reorderActive: true,
  alertQuantity: "",
}

const uomOptions = ["PC", "PKT", "BOX", "SET", "KG", "LITERS", "METERS", "REAMS", "PACKS"]
const vatRates = ["0", "8", "16"]

export default function NewItemForm({ onSubmit, editItem = null }) {
  const categories = useContext(CategoriesContext)
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [subCategories, setSubCategories] = useState([])
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false)
  const [subCategoriesError, setSubCategoriesError] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [calculatedProfits, setCalculatedProfits] = useState({
    gp1: 0, np1: 0, gp2: 0, np2: 0, gp3: 0, np3: 0,
  })
  const [calculatedCashback, setCalculatedCashback] = useState({
    cashback1: 0, cashback2: 0, cashback3: 0,
  })

  // Initialize form for edit mode
  useEffect(() => {
    if (editItem) {
      setIsEditMode(true)
      setFormData({
        ...editItem,
        categoryId: editItem.category_id || "",
        subcategoryId: editItem.subcategory_id || "",
        imagePreview: editItem.image_url || null,
        image: null,
      })
    }
  }, [editItem])

  // Fetch subcategories when categoryId changes
  useEffect(() => {
    if (formData.categoryId) {
      setSubCategoriesLoading(true)
      setSubCategoriesError(null)
      fetch(`${import.meta.env.VITE_API_URL}/categories/${formData.categoryId}/subcategories`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch subcategories")
          return res.json()
        })
        .then(data => {
          setSubCategories(data)
          // Reset subcategoryId if not in the new list
          if (!data.some(sub => sub.id === parseInt(formData.subcategoryId))) {
            setFormData(prev => ({ ...prev, subcategoryId: "" }))
          }
        })
        .catch(err => {
          setSubCategoriesError(err.message)
          setSubCategories([])
        })
        .finally(() => setSubCategoriesLoading(false))
    } else {
      setSubCategories([])
      setFormData(prev => ({ ...prev, subcategoryId: "" }))
    }
  }, [formData.categoryId])

  // Calculate profits and cashback
  useEffect(() => {
    const costPriceExclVat = Number.parseFloat(formData.costPrice) || 0
    const vatRate = Number.parseFloat(formData.vat) / 100
    const cashbackRate = Number.parseFloat(formData.cashbackRate) / 100

    const calculateProfit = (sellingPriceInclVat) => {
      const sellingPrice = Number.parseFloat(sellingPriceInclVat) || 0
      const sellingPriceExclVat = sellingPrice / (1 + vatRate)
      const gp = sellingPriceExclVat - costPriceExclVat
      const gpPercentage = costPriceExclVat > 0 ? (gp / costPriceExclVat) * 100 : 0
      const npPercentage = sellingPrice > 0 ? (gp / sellingPrice) * 100 : 0
      return { gp: gpPercentage.toFixed(2), np: npPercentage.toFixed(2) }
    }

    const calculateCashback = (sellingPriceInclVat) => {
      const sellingPrice = Number.parseFloat(sellingPriceInclVat) || 0
      return (sellingPrice * cashbackRate).toFixed(2)
    }

    setCalculatedProfits({
      gp1: calculateProfit(formData.sellingPrice1).gp,
      np1: calculateProfit(formData.sellingPrice1).np,
      gp2: calculateProfit(formData.sellingPrice2).gp,
      np2: calculateProfit(formData.sellingPrice2).np,
      gp3: calculateProfit(formData.sellingPrice3).gp,
      np3: calculateProfit(formData.sellingPrice3).np,
    })

    setCalculatedCashback({
      cashback1: calculateCashback(formData.sellingPrice1),
      cashback2: calculateCashback(formData.sellingPrice2),
      cashback3: calculateCashback(formData.sellingPrice3),
    })
  }, [formData.costPrice, formData.sellingPrice1, formData.sellingPrice2, formData.sellingPrice3, formData.vat, formData.cashbackRate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image size exceeds 5MB" })
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: event.target.result,
        })
        setErrors({ ...errors, image: null })
      }
      reader.readAsDataURL(file)
    }
  }

  const generateProductCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const randomLetter = letters[Math.floor(Math.random() * letters.length)]
    const randomNumbers = Math.floor(Math.random() * 1000000).toString().padStart(6, "0")
    const productCode = `${randomLetter}01${randomNumbers.slice(0, 2)}${randomNumbers.slice(2)}`
    setFormData({ ...formData, productCode })
  }

  const generateBarcode = () => {
    const code = Math.floor(100000000000 + Math.random() * 900000000000).toString() // EAN-13
    setFormData({ ...formData, productBarcode: code })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.productName) newErrors.productName = "Product name is required"
    if (!formData.productCode || !/^[A-Z]\d{8}$/.test(formData.productCode)) {
      newErrors.productCode = "Product code must be like A01010101"
    }
    if (!formData.categoryId) newErrors.categoryId = "Category is required"
    if (!formData.subcategoryId) newErrors.subcategoryId = "Subcategory is required"
    if (!formData.costPrice || formData.costPrice <= 0) newErrors.costPrice = "Valid cost price is required"
    if (!formData.sellingPrice1 || formData.sellingPrice1 <= 0) newErrors.sellingPrice1 = "Valid selling price is required"
    if (!formData.stockUnits || formData.stockUnits < 0) newErrors.stockUnits = "Valid stock quantity is required"
    if (formData.sellingPrice2 && formData.sellingPrice2 <= 0) newErrors.sellingPrice2 = "Valid selling price is required"
    if (formData.sellingPrice3 && formData.sellingPrice3 <= 0) newErrors.sellingPrice3 = "Valid selling price is required"
    if (parseInt(formData.qty1Max) < parseInt(formData.qty1Min)) newErrors.qty1Max = "Max must be greater than min"
    if (formData.qty2Min && parseInt(formData.qty2Min) <= parseInt(formData.qty1Max)) {
      newErrors.qty2Min = "Tier 2 min must be greater than Tier 1 max"
    }
    if (formData.qty2Max && parseInt(formData.qty2Max) < parseInt(formData.qty2Min)) {
      newErrors.qty2Max = "Max must be greater than min"
    }
    if (formData.qty3Min && parseInt(formData.qty3Min) <= parseInt(formData.qty2Max || 0)) {
      newErrors.qty3Min = "Tier 3 min must be greater than Tier 2 max"
    }
    if (formData.image && formData.image.size > 5 * 1024 * 1024) newErrors.image = "Image size exceeds 5MB"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)

    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'imagePreview') {
        formDataToSend.append(key, value)
      }
    })

    try {
      const url = isEditMode ? `${import.meta.env.VITE_API_URL}/products/${editItem.id}` : `${import.meta.env.VITE_API_URL}/products`
      const method = isEditMode ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })
      if (!response.ok) throw new Error('Failed to save product')
      const result = await response.json()
      if (onSubmit) onSubmit({ ...formData, id: result.id })
      setFormData(initialFormState)
      setErrors({})
      setIsEditMode(false)
    } catch (error) {
      setErrors({ form: 'Failed to save product. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setErrors({})
    setIsEditMode(false)
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>
            {isEditMode ? "Edit Product" : "Add New Product"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditMode ? "Update product information" : "Complete product information for inventory management"}
          </Typography>
          {errors.form && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.form}
            </Typography>
          )}
        </Box>

        <form onSubmit={handleSubmit} aria-label={isEditMode ? "Edit product form" : "Add product form"}>
          {/* Basic Information */}
          <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#f8f9fa" }}>
              <Typography variant="h6" fontWeight="600" color="#1976d2">📋 Basic Information</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Product Name"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    error={!!errors.productName}
                    helperText={errors.productName}
                    inputProps={{ "aria-required": true }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Product Code"
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleChange}
                    error={!!errors.productCode}
                    helperText={errors.productCode}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button size="small" onClick={generateProductCode}>Generate</Button>
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{ "aria-required": true }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      label="Category"
                      renderValue={(selected) => {
                        const category = categories.find(cat => cat.id === parseInt(selected))
                        return category ? category.name : "Select Category"
                      }}
                      aria-required="true"
                      sx={{ height: 56 }}
                    >
                      <MenuItem value="" disabled>Select Category</MenuItem>
                      {categories.map(category => (
                        <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                      ))}
                    </Select>
                    {errors.categoryId && <FormHelperText error>{errors.categoryId}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!errors.subcategoryId || !!subCategoriesError}>
                    <InputLabel id="subcategory-label">Subcategory</InputLabel>
                    <Select
                      labelId="subcategory-label"
                      name="subcategoryId"
                      value={formData.subcategoryId}
                      onChange={handleChange}
                      label="Subcategory"
                      disabled={!formData.categoryId || subCategoriesLoading || subCategoriesError}
                      renderValue={(selected) => {
                        const subCat = subCategories.find(sub => sub.id === parseInt(selected))
                        return subCat ? subCat.name : (formData.categoryId ? "Select Subcategory" : "Select Category First")
                      }}
                      aria-required="true"
                      sx={{ height: 56 }}
                    >
                      <MenuItem value="" disabled>Select Subcategory</MenuItem>
                      {subCategoriesLoading && <MenuItem disabled>Loading...</MenuItem>}
                      {subCategoriesError && <MenuItem disabled>Error: {subCategoriesError}</MenuItem>}
                      {subCategories.map(subCat => (
                        <MenuItem key={subCat.id} value={subCat.id}>{subCat.name}</MenuItem>
                      ))}
                    </Select>
                    {(errors.subcategoryId || subCategoriesError) && (
                      <FormHelperText error>{errors.subcategoryId || subCategoriesError}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pack Size"
                    name="packSize"
                    value={formData.packSize}
                    onChange={handleChange}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="uom-label">UOM</InputLabel>
                    <Select
                      labelId="uom-label"
                      name="uom"
                      value={formData.uom}
                      onChange={handleChange}
                      label="UOM"
                      aria-required="true"
                      sx={{ height: 56 }}
                    >
                      {uomOptions.map(unit => (
                        <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Product Barcode"
                    name="productBarcode"
                    value={formData.productBarcode}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button size="small" onClick={generateBarcode} startIcon={<QrCode />}>Generate</Button>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="eTIMS Ref Code"
                    name="etimsRefCode"
                    value={formData.etimsRefCode}
                    onChange={handleChange}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Short Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    sx={{ '& .MuiInputBase-root': { minHeight: 100 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Detailed Description"
                    name="longerDescription"
                    value={formData.longerDescription}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    sx={{ '& .MuiInputBase-root': { minHeight: 120 } }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Pricing Information */}
          <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#f8f9fa" }}>
              <Typography variant="h6" fontWeight="600" color="#1976d2">💰 Pricing Information</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Cost Price (Excl. VAT)"
                    name="costPrice"
                    type="number"
                    value={formData.costPrice}
                    onChange={handleChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">KSh</InputAdornment> }}
                    error={!!errors.costPrice}
                    helperText={errors.costPrice}
                    inputProps={{ min: 0, "aria-required": true }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="vat-label">VAT Rate</InputLabel>
                    <Select
                      labelId="vat-label"
                      name="vat"
                      value={formData.vat}
                      onChange={handleChange}
                      label="VAT Rate"
                      sx={{ height: 56 }}
                    >
                      {vatRates.map(rate => (
                        <MenuItem key={rate} value={rate}>{rate}%</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Customer Cashback Rate"
                    name="cashbackRate"
                    type="number"
                    value={formData.cashbackRate}
                    onChange={handleChange}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small" aria-label="Pricing tiers table">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                          <TableCell>Tier</TableCell>
                          <TableCell>Quantity Range</TableCell>
                          <TableCell>Selling Price (KSh)</TableCell>
                          <TableCell>GP %</TableCell>
                          <TableCell>NP %</TableCell>
                          <TableCell>Cashback Earned</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><Chip label="Tier 1" color="primary" size="small" /></TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, alignItems: "center" }}>
                              <TextField
                                type="number"
                                value={formData.qty1Min}
                                onChange={(e) => setFormData({ ...formData, qty1Min: e.target.value })}
                                size="small"
                                inputProps={{ min: 1 }}
                                error={!!errors.qty1Min}
                                helperText={errors.qty1Min}
                                sx={{ width: { xs: "100%", sm: 100 } }}
                              />
                              <Typography variant="body2">to</Typography>
                              <TextField
                                type="number"
                                value={formData.qty1Max}
                                onChange={(e) => setFormData({ ...formData, qty1Max: e.target.value })}
                                size="small"
                                inputProps={{ min: 1 }}
                                error={!!errors.qty1Max}
                                helperText={errors.qty1Max}
                                sx={{ width: { xs: "100%", sm: 100 } }}
                              />
                              <Typography variant="caption" color="text.secondary">pieces</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={formData.sellingPrice1}
                              onChange={handleChange}
                              name="sellingPrice1"
                              size="small"
                              InputProps={{ startAdornment: <InputAdornment position="start">KSh</InputAdornment> }}
                              error={!!errors.sellingPrice1}
                              helperText={errors.sellingPrice1}
                              inputProps={{ "aria-required": true }}
                              sx={{ width: "100%" }}
                            />
                          </TableCell>
                          <TableCell><Chip label={`${calculatedProfits.gp1}%`} color="success" size="small" /></TableCell>
                          <TableCell><Chip label={`${calculatedProfits.np1}%`} color="info" size="small" /></TableCell>
                          <TableCell>
                            <Typography variant="body2" color="primary">KSh {calculatedCashback.cashback1}</Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><Chip label="Tier 2" color="secondary" size="small" /></TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, alignItems: "center" }}>
                              <TextField
                                type="number"
                                value={formData.qty2Min}
                                onChange={(e) => setFormData({ ...formData, qty2Min: e.target.value })}
                                size="small"
                                inputProps={{ min: 1 }}
                                error={!!errors.qty2Min}
                                helperText={errors.qty2Min}
                                sx={{ width: { xs: "100%", sm: 100 } }}
                              />
                              <Typography variant="body2">to</Typography>
                              <TextField
                                type="number"
                                value={formData.qty2Max}
                                onChange={(e) => setFormData({ ...formData, qty2Max: e.target.value })}
                                size="small"
                                inputProps={{ min: 1 }}
                                error={!!errors.qty2Max}
                                helperText={errors.qty2Max}
                                sx={{ width: { xs: "100%", sm: 100 } }}
                              />
                              <Typography variant="caption" color="text.secondary">pieces</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={formData.sellingPrice2}
                              onChange={handleChange}
                              name="sellingPrice2"
                              size="small"
                              InputProps={{ startAdornment: <InputAdornment position="start">KSh</InputAdornment> }}
                              error={!!errors.sellingPrice2}
                              helperText={errors.sellingPrice2}
                              sx={{ width: "100%" }}
                            />
                          </TableCell>
                          <TableCell><Chip label={`${calculatedProfits.gp2}%`} color="success" size="small" /></TableCell>
                          <TableCell><Chip label={`${calculatedProfits.np2}%`} color="info" size="small" /></TableCell>
                          <TableCell>
                            <Typography variant="body2" color="primary">KSh {calculatedCashback.cashback2}</Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><Chip label="Tier 3" color="warning" size="small" /></TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, alignItems: "center" }}>
                              <TextField
                                type="number"
                                value={formData.qty3Min}
                                onChange={(e) => setFormData({ ...formData, qty3Min: e.target.value })}
                                size="small"
                                inputProps={{ min: 1 }}
                                error={!!errors.qty3Min}
                                helperText={errors.qty3Min}
                                sx={{ width: { xs: "100%", sm: 100 } }}
                              />
                              <Typography variant="caption" color="text.secondary">and above</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={formData.sellingPrice3}
                              onChange={handleChange}
                              name="sellingPrice3"
                              size="small"
                              InputProps={{ startAdornment: <InputAdornment position="start">KSh</InputAdornment> }}
                              error={!!errors.sellingPrice3}
                              helperText={errors.sellingPrice3}
                              sx={{ width: "100%" }}
                            />
                          </TableCell>
                          <TableCell><Chip label={`${calculatedProfits.gp3}%`} color="success" size="small" /></TableCell>
                          <TableCell><Chip label={`${calculatedProfits.np3}%`} color="info" size="small" /></TableCell>
                          <TableCell>
                            <Typography variant="body2" color="primary">KSh {calculatedCashback.cashback3}</Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Vendor Information */}
          <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#f8f9fa" }}>
              <Typography variant="h6" fontWeight="600" color="#1976d2">🏢 Vendor Information</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="vendor-label">Preferred Vendor</InputLabel>
                    <Select
                      labelId="vendor-label"
                      name="preferredVendor1"
                      value={formData.preferredVendor1}
                      onChange={handleChange}
                      label="Preferred Vendor"
                      sx={{ height: 56 }}
                    >
                      <MenuItem value="" disabled>Select Vendor</MenuItem>
                      {vendorOptions.map(vendor => (
                        <MenuItem key={vendor} value={vendor}>{vendor}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Secondary Vendor"
                    name="preferredVendor2"
                    value={formData.preferredVendor2}
                    onChange={handleChange}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Vendor Item Code"
                    name="vendorItemCode"
                    value={formData.vendorItemCode}
                    onChange={handleChange}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Sales Agent Incentives */}
          <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#f8f9fa" }}>
              <Typography variant="h6" fontWeight="600" color="#1976d2">🎯 Sales Agent Incentives</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="1st Purchase Cashback"
                    name="saCashback1stPurchase"
                    type="number"
                    value={formData.saCashback1stPurchase}
                    onChange={handleChange}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="2nd Purchase Cashback"
                    name="saCashback2ndPurchase"
                    type="number"
                    value={formData.saCashback2ndPurchase}
                    onChange={handleChange}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="3rd Purchase Cashback"
                    name="saCashback3rdPurchase"
                    type="number"
                    value={formData.saCashback3rdPurchase}
                    onChange={handleChange}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="4th+ Purchase Cashback"
                    name="saCashback4thPurchase"
                    type="number"
                    value={formData.saCashback4thPurchase}
                    onChange={handleChange}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Inventory & Additional Information */}
          <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#f8f9fa" }}>
              <Typography variant="h6" fontWeight="600" color="#1976d2">📦 Inventory & Additional Information</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Current Stock Quantity"
                        name="stockUnits"
                        type="number"
                        value={formData.stockUnits}
                        onChange={handleChange}
                        error={!!errors.stockUnits}
                        helperText={errors.stockUnits}
                        inputProps={{ min: 0, "aria-required": true }}
                        sx={{ '& .MuiInputBase-root': { height: 56 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Alert Quantity"
                        name="alertQuantity"
                        type="number"
                        value={formData.alertQuantity}
                        onChange={handleChange}
                        inputProps={{ min: 0 }}
                        sx={{ '& .MuiInputBase-root': { height: 56 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Reorder Level"
                        name="reorderLevel"
                        type="number"
                        value={formData.reorderLevel}
                        onChange={handleChange}
                        inputProps={{ min: 0 }}
                        sx={{ '& .MuiInputBase-root': { height: 56 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Order Level"
                        name="orderLevel"
                        type="number"
                        value={formData.orderLevel}
                        onChange={handleChange}
                        inputProps={{ min: 0 }}
                        sx={{ '& .MuiInputBase-root': { height: 56 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={<Switch checked={formData.reorderActive} onChange={handleChange} name="reorderActive" />}
                        label="Auto Reorder Active"
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Expiry Date"
                        name="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiInputBase-root': { height: 56 } }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>Product Photo</Typography>
                  <Card sx={{ border: "2px dashed #e0e0e0", p: 3, textAlign: "center", minHeight: 200 }}>
                    {formData.imagePreview ? (
                      <Box>
                        <img
                          src={formData.imagePreview}
                          alt="Product preview"
                          style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 8 }}
                        />
                        <Button variant="outlined" component="label" size="small" sx={{ mt: 2 }}>
                          Change Photo
                          <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                        </Button>
                        {errors.image && <FormHelperText error>{errors.image}</FormHelperText>}
                      </Box>
                    ) : (
                      <Box>
                        <ImageIcon sx={{ fontSize: 48, color: "#bdbdbd" }} />
                        <Button variant="contained" component="label" startIcon={<Upload />} sx={{ mt: 2 }}>
                          Upload Photo
                          <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                        </Button>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          Max 5MB, JPG/PNG
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Submit Buttons */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || subCategoriesLoading}
              sx={{ px: 6, py: 1.5, fontSize: "1.1rem", mr: 2 }}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Saving..." : (isEditMode ? "Update Product" : "Add Product")}
            </Button>
            {isEditMode && (
              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={resetForm}
                sx={{ px: 6, py: 1.5, fontSize: "1.1rem" }}
              >
                Cancel Edit
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  )
}