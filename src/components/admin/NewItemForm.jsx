"use client"

import { useState, useEffect, useContext } from "react"
import {
  Box, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Paper, InputAdornment, FormHelperText, Card, Table, TableContainer, TableHead, TableBody,
  TableCell, TableRow, Accordion, AccordionSummary, AccordionDetails, Switch, FormControlLabel, Chip, CircularProgress
} from "@mui/material"
import { Upload, Image as ImageIcon, ExpandMore, QrCode } from "@mui/icons-material"
import { NumericFormat } from 'react-number-format'
import { CategoriesContext } from "./CategoriesContext"

const initialFormState = {
  parentCatId: "",
  categoryId: "",
  subcategoryId: "",
  productName: "",
  productCode: "",
  uom: "PC",
  packSize: "",
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

// Custom NumericFormat component for price inputs
const PriceFormat = ({ onChange, ...props }) => (
  <NumericFormat
    {...props}
    thousandSeparator=","
    decimalScale={2}
    fixedDecimalScale
    allowNegative={false}
    isAllowed={(values) => {
      const { floatValue, formattedValue } = values
      if (floatValue === undefined) return true
      const integers = formattedValue.split('.')[0].replace(/,/g, '').length
      return floatValue <= 9999999999999.99 && integers <= 13
    }}
    onValueChange={(values) => {
      onChange({
        target: {
          name: props.name,
          value: values.value,
        },
      })
    }}
    customInput={TextField}
  />
)

// Custom NumericFormat component for percentage inputs
const PercentageFormat = ({ onChange, ...props }) => (
  <NumericFormat
    {...props}
    thousandSeparator=","
    decimalScale={2}
    fixedDecimalScale
    allowNegative={false}
    isAllowed={(values) => {
      const { floatValue } = values
      return floatValue === undefined || (floatValue >= 0 && floatValue <= 100)
    }}
    onValueChange={(values) => {
      onChange({
        target: {
          name: props.name,
          value: values.value,
        },
      })
    }}
    customInput={TextField}
  />
)

export default function NewItemForm({ onSubmit, editItem = null }) {
  const { categories, loading, error } = useContext(CategoriesContext)
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [subCategories, setSubCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false)
  const [subCategoriesError, setSubCategoriesError] = useState(null)
  const [suppliersLoading, setSuppliersLoading] = useState(false)
  const [suppliersError, setSuppliersError] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [calculatedProfits, setCalculatedProfits] = useState({
    gp1: 0, np1: 0, gp2: 0, np2: 0, gp3: 0, np3: 0,
  })
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://fcl-back.onrender.com'

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

  // Load edit item data
  useEffect(() => {
    if (editItem) {
      setIsEditMode(true)
      setLoadingSubmit(true)
      fetch(`${import.meta.env.VITE_API_URL}/products/${editItem.id}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch product")
          return res.json()
        })
        .then(data => {
          setFormData({
            parentCatId: data.parent_cat_id ? data.parent_cat_id.toString() : "",
            categoryId: data.category_id ? data.category_id.toString() : "",
            subcategoryId: data.subcategory_id ? data.subcategory_id.toString() : "",
            productName: data.product_name || "",
            productCode: data.product_code || "",
            uom: data.uom || "PC",
            packSize: data.pack_size || "",
            description: data.description || "",
            longerDescription: data.longer_description || "",
            productBarcode: data.product_barcode || "",
            etimsRefCode: data.etims_ref_code || "",
            expiryDate: data.expiry_date ? data.expiry_date.split('T')[0] : "",
            image: null,
            imagePreview: data.image_url ? `${baseUrl}${data.image_url}` : null,
            costPrice: data.cost_price ? parseFloat(data.cost_price).toFixed(2) : "",
            sellingPrice1: data.selling_price1 ? parseFloat(data.selling_price1).toFixed(2) : "",
            sellingPrice2: data.selling_price2 ? parseFloat(data.selling_price2).toFixed(2) : "",
            sellingPrice3: data.selling_price3 ? parseFloat(data.selling_price3).toFixed(2) : "",
            qty1Min: data.qty1_min ? data.qty1_min.toString() : "1",
            qty1Max: data.qty1_max ? data.qty1_max.toString() : "3",
            qty2Min: data.qty2_min ? data.qty2_min.toString() : "",
            qty2Max: data.qty2_max ? data.qty2_max.toString() : "",
            qty3Min: data.qty3_min ? data.qty3_min.toString() : "",
            vat: data.vat ? parseFloat(data.vat).toFixed(2) : "16",
            cashbackRate: data.cashback_rate ? parseFloat(data.cashback_rate).toFixed(2) : "0",
            preferredVendor1: data.preferred_vendor1 ? data.preferred_vendor1.toString() : "",
            vendorItemCode: data.vendor_item_code || "",
            saCashback1stPurchase: data.sa_cashback_1st ? parseFloat(data.sa_cashback_1st).toFixed(2) : "6",
            saCashback2ndPurchase: data.sa_cashback_2nd ? parseFloat(data.sa_cashback_2nd).toFixed(2) : "4",
            saCashback3rdPurchase: data.sa_cashback_3rd ? parseFloat(data.sa_cashback_3rd).toFixed(2) : "3",
            saCashback4thPurchase: data.sa_cashback_4th ? parseFloat(data.sa_cashback_4th).toFixed(2) : "2",
            stockUnits: data.stock_units ? data.stock_units.toString() : "",
            reorderLevel: data.reorder_level ? data.reorder_level.toString() : "",
            orderLevel: data.order_level ? data.order_level.toString() : "",
            reorderActive: data.reorder_active !== undefined ? data.reorder_active : true,
            alertQuantity: data.alert_quantity ? data.alert_quantity.toString() : "",
          })
        })
        .catch(err => {
          setErrors({ form: err.message || "Failed to load product data" })
        })
        .finally(() => setLoadingSubmit(false))
    }
  }, [editItem])

  // Fetch subcategories when category changes
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
          setSubCategories(data.map(sub => ({
            ...sub,
            subcategory_code: sub.subcategory_code || "01"
          })))
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

  // Auto-fill vendorItemCode when supplier is selected
  useEffect(() => {
    if (formData.preferredVendor1) {
      const supplier = suppliers.find(s => s.id === parseInt(formData.preferredVendor1))
      setFormData(prev => ({
        ...prev,
        vendorItemCode: supplier ? supplier.code || "" : ""
      }))
    } else {
      setFormData(prev => ({ ...prev, vendorItemCode: "" }))
    }
  }, [formData.preferredVendor1, suppliers])

  // Calculate profits
  useEffect(() => {
    const costPriceExclVat = Number.parseFloat(formData.costPrice) || 0
    const vatRate = Number.parseFloat(formData.vat) / 100

    const calculateProfit = (sellingPriceInclVat) => {
      const sellingPrice = Number.parseFloat(sellingPriceInclVat) || 0
      const sellingPriceExclVat = sellingPrice / (1 + vatRate)
      const gp = sellingPriceExclVat - costPriceExclVat
      const gpPercentage = costPriceExclVat > 0 ? (gp / costPriceExclVat) * 100 : 0
      const npPercentage = sellingPriceExclVat > 0 ? ((sellingPriceExclVat - costPriceExclVat) / sellingPriceExclVat) * 100 : 0
      return { gp: gpPercentage.toFixed(2), np: npPercentage.toFixed(2) }
    }

    setCalculatedProfits({
      gp1: calculateProfit(formData.sellingPrice1).gp,
      np1: calculateProfit(formData.sellingPrice1).np,
      gp2: calculateProfit(formData.sellingPrice2).gp,
      np2: calculateProfit(formData.sellingPrice2).np,
      gp3: calculateProfit(formData.sellingPrice3).gp,
      np3: calculateProfit(formData.sellingPrice3).np,
    })
  }, [formData.costPrice, formData.sellingPrice1, formData.sellingPrice2, formData.sellingPrice3, formData.vat])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
    if (name === "parentCatId") {
      setFormData(prev => ({ ...prev, categoryId: "", subcategoryId: "", productCode: "" }))
    } else if (name === "categoryId") {
      setFormData(prev => ({ ...prev, subcategoryId: "", productCode: "" }))
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

  const generateBarcode = () => {
    const code = Math.floor(100000000000 + Math.random() * 900000000000).toString()
    setFormData({ ...formData, productBarcode: code })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.productName.trim()) newErrors.productName = "Product name is required"
    if (!formData.productCode || !/^[A-Z]\d{9}$/.test(formData.productCode)) {
      newErrors.productCode = "Product code must be like B010101001 (1 letter, 9 digits)"
    }
    if (!formData.parentCatId || isNaN(parseInt(formData.parentCatId))) newErrors.parentCatId = "Parent category is required"
    if (!formData.categoryId || isNaN(parseInt(formData.categoryId))) newErrors.categoryId = "Category is required"
    if (!formData.subcategoryId || isNaN(parseInt(formData.subcategoryId))) newErrors.subcategoryId = "Subcategory is required"
    if (!formData.costPrice || Number.parseFloat(formData.costPrice) <= 0 || Number.parseFloat(formData.costPrice) > 9999999999999.99) {
      newErrors.costPrice = "Cost price must be between 0.01 and 9,999,999,999,999.99"
    }
    if (!formData.sellingPrice1 || Number.parseFloat(formData.sellingPrice1) <= 0 || Number.parseFloat(formData.sellingPrice1) > 9999999999999.99) {
      newErrors.sellingPrice1 = "Selling price 1 must be between 0.01 and 9,999,999,999,999.99"
    }
    if (formData.sellingPrice2 && (Number.parseFloat(formData.sellingPrice2) <= 0 || Number.parseFloat(formData.sellingPrice2) > 9999999999999.99)) {
      newErrors.sellingPrice2 = "Selling price 2 must be between 0.01 and 9,999,999,999,999.99"
    }
    if (formData.sellingPrice3 && (Number.parseFloat(formData.sellingPrice3) <= 0 || Number.parseFloat(formData.sellingPrice3) > 9999999999999.99)) {
      newErrors.sellingPrice3 = "Selling price 3 must be between 0.01 and 9,999,999,999,999.99"
    }
    if (!formData.stockUnits || Number.parseInt(formData.stockUnits) < 0) newErrors.stockUnits = "Stock quantity must be non-negative"
    if (Number.parseInt(formData.qty1Max) < Number.parseInt(formData.qty1Min)) newErrors.qty1Max = "Tier 1 max must be greater than min"
    if (formData.qty2Min && Number.parseInt(formData.qty2Min) <= Number.parseInt(formData.qty1Max)) {
      newErrors.qty2Min = "Tier 2 min must be greater than Tier 1 max"
    }
    if (formData.qty2Max && Number.parseInt(formData.qty2Max) < Number.parseInt(formData.qty2Min)) {
      newErrors.qty2Max = "Tier 2 max must be greater than min"
    }
    if (formData.qty3Min && Number.parseInt(formData.qty3Min) <= Number.parseInt(formData.qty2Max || 0)) {
      newErrors.qty3Min = "Tier 3 min must be greater than Tier 2 max"
    }
    if (formData.description && formData.description.length > 1000) newErrors.description = "Description must be less than 1000 characters"
    if (formData.longerDescription && formData.longerDescription.length > 2000) newErrors.longerDescription = "Longer description must be less than 2000 characters"
    if (formData.productBarcode && formData.productBarcode.length > 50) newErrors.productBarcode = "Product barcode must be less than 50 characters"
    if (formData.etimsRefCode && formData.etimsRefCode.length > 50) newErrors.etimsRefCode = "eTIMS ref code must be less than 50 characters"
    if (formData.packSize && formData.packSize.length > 50) newErrors.packSize = "Pack size must be less than 50 characters"
    if (formData.vendorItemCode && formData.vendorItemCode.length > 50) newErrors.vendorItemCode = "Vendor item code must be less than 50 characters"
    if (formData.image && formData.image.size > 5 * 1024 * 1024) newErrors.image = "Image size exceeds 5MB"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      setLoadingSubmit(false)
      return
    }
    setLoadingSubmit(true)

    const formDataToSend = new FormData()
    const appendIfValid = (key, value, isNumeric = false, isInt = false, isRequired = false) => {
      if (isRequired && (value === "" || value === null || value === undefined || (isNumeric && isNaN(value)))) {
        setErrors(prev => ({ ...prev, [key]: `${key} is required` }))
        return false
      }
      if (value === "" || value === null || value === undefined) {
        if (!isRequired) formDataToSend.append(key, '')
        return true
      }
      if (isNumeric && !isNaN(value)) {
        formDataToSend.append(key, parseFloat(value).toFixed(2))
      } else if (isInt && !isNaN(value)) {
        formDataToSend.append(key, parseInt(value))
      } else {
        formDataToSend.append(key, value)
      }
      return true
    }

    // Required fields
    if (!appendIfValid('productName', formData.productName.trim(), false, false, true)) return
    if (!appendIfValid('productCode', formData.productCode, false, false, true)) return
    if (!appendIfValid('parentCatId', parseInt(formData.parentCatId), false, true, true)) return
    if (!appendIfValid('categoryId', parseInt(formData.categoryId), false, true, true)) return
    if (!appendIfValid('subcategoryId', parseInt(formData.subcategoryId), false, true, true)) return
    if (!appendIfValid('uom', formData.uom, false, false, true)) return
    if (!appendIfValid('costPrice', formData.costPrice, true, false, true)) return
    if (!appendIfValid('sellingPrice1', formData.sellingPrice1, true, false, true)) return
    if (!appendIfValid('qty1Min', parseInt(formData.qty1Min), false, true, true)) return
    if (!appendIfValid('qty1Max', parseInt(formData.qty1Max), false, true, true)) return
    if (!appendIfValid('vat', formData.vat, true, false, true)) return
    if (!appendIfValid('cashbackRate', formData.cashbackRate, true, false, true)) return
    if (!appendIfValid('saCashback1stPurchase', formData.saCashback1stPurchase, true, false, true)) return
    if (!appendIfValid('saCashback2ndPurchase', formData.saCashback2ndPurchase, true, false, true)) return
    if (!appendIfValid('saCashback3rdPurchase', formData.saCashback3rdPurchase, true, false, true)) return
    if (!appendIfValid('saCashback4thPurchase', formData.saCashback4thPurchase, true, false, true)) return
    if (!appendIfValid('stockUnits', parseInt(formData.stockUnits), false, true, true)) return
    appendIfValid('reorderActive', formData.reorderActive, false, false, true)

    // Optional fields
    appendIfValid('packSize', formData.packSize)
    appendIfValid('description', formData.description)
    appendIfValid('longerDescription', formData.longerDescription)
    appendIfValid('productBarcode', formData.productBarcode)
    appendIfValid('etimsRefCode', formData.etimsRefCode)
    appendIfValid('expiryDate', formData.expiryDate)
    if (formData.image) {
      formDataToSend.append('image', formData.image)
    } else if (isEditMode && formData.imagePreview) {
      formDataToSend.append('imageUrl', formData.imagePreview.replace(baseUrl, ''))
    }
    appendIfValid('sellingPrice2', formData.sellingPrice2, true)
    appendIfValid('sellingPrice3', formData.sellingPrice3, true)
    appendIfValid('qty2Min', parseInt(formData.qty2Min), false, true)
    appendIfValid('qty2Max', parseInt(formData.qty2Max), false, true)
    appendIfValid('qty3Min', parseInt(formData.qty3Min), false, true)
    appendIfValid('preferredVendor1', parseInt(formData.preferredVendor1), false, true)
    appendIfValid('vendorItemCode', formData.vendorItemCode)
    appendIfValid('reorderLevel', parseInt(formData.reorderLevel), false, true)
    appendIfValid('orderLevel', parseInt(formData.orderLevel), false, true)
    appendIfValid('alertQuantity', parseInt(formData.alertQuantity), false, true)

    // Log FormData for debugging
    console.log('FormData to send:');
    for (const [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const url = isEditMode ? `${import.meta.env.VITE_API_URL}/products/${editItem.id}` : `${import.meta.env.VITE_API_URL}/products`
      const method = isEditMode ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })
      const data = await response.json()
      if (!response.ok) {
        console.error('Server response:', data)
        throw new Error(data.message || 'Failed to save product')
      }
      if (onSubmit) onSubmit({ ...formData, id: data.id })
      setFormData(initialFormState)
      setErrors({})
      setIsEditMode(false)
    } catch (error) {
      console.error('Submission error:', error)
      setErrors({ form: error.message })
    } finally {
      setLoadingSubmit(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setErrors({})
    setIsEditMode(false)
  }

  // Render loading or error state from CategoriesContext
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading categories...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Failed to load categories: {error}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please try refreshing the page or contact support.
        </Typography>
      </Box>
    );
  }

  const parentCategories = categories.filter(cat => cat.categories && cat.categories.length > 0);
  const filteredCategories = formData.parentCatId
    ? categories.find(cat => cat.id === parseInt(formData.parentCatId))?.categories || []
    : [];

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
                    inputProps={{ "aria-required": true, maxLength: 255 }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!errors.parentCatId}>
                    <InputLabel id="parent-category-label">Parent Category</InputLabel>
                    <Select
                      labelId="parent-category-label"
                      name="parentCatId"
                      value={formData.parentCatId}
                      onChange={handleChange}
                      label="Parent Category"
                      renderValue={(selected) => {
                        const parent = parentCategories.find(cat => cat.id === parseInt(selected))
                        return parent ? `${parent.name} (${parent.category_code})` : "Select Parent Category"
                      }}
                      aria-required="true"
                      sx={{ height: 56 }}
                    >
                      <MenuItem value="" disabled>Select Parent Category</MenuItem>
                      {parentCategories.map(parent => (
                        <MenuItem key={parent.id} value={parent.id}>{parent.name} ({parent.category_code})</MenuItem>
                      ))}
                    </Select>
                    {errors.parentCatId && <FormHelperText error>{errors.parentCatId}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!errors.categoryId}>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      label="Category"
                      disabled={!formData.parentCatId}
                      renderValue={(selected) => {
                        const category = filteredCategories.find(cat => cat.id === parseInt(selected))
                        return category ? `${category.name} (${category.category_code})` : "Select Category"
                      }}
                      aria-required="true"
                      sx={{ height: 56 }}
                    >
                      <MenuItem value="" disabled>Select Category</MenuItem>
                      {filteredCategories.map(category => (
                        <MenuItem key={category.id} value={category.id}>{category.name} ({category.category_code})</MenuItem>
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
                        return subCat ? `${subCat.name} (${subCat.subcategory_code})` : (formData.categoryId ? "Select Subcategory" : "Select Category First")
                      }}
                      aria-required="true"
                      sx={{ height: 56 }}
                    >
                      <MenuItem value="" disabled>Select Subcategory</MenuItem>
                      {subCategoriesLoading && <MenuItem disabled>Loading...</MenuItem>}
                      {subCategoriesError && <MenuItem disabled>Error: {subCategoriesError}</MenuItem>}
                      {subCategories.map(subCat => (
                        <MenuItem key={subCat.id} value={subCat.id}>{subCat.name} ({subCat.subcategory_code})</MenuItem>
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
                    required
                    label="Product Code"
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleChange}
                    error={!!errors.productCode}
                    helperText={errors.productCode || "Format: B010101001 (ParentCatCode + CatCode + SubCatCode + 3-digit sequence)"}
                    inputProps={{ "aria-required": true, maxLength: 10 }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pack Size"
                    name="packSize"
                    value={formData.packSize}
                    onChange={handleChange}
                    inputProps={{ maxLength: 50 }}
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
                    inputProps={{ maxLength: 50 }}
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
                    inputProps={{ maxLength: 50 }}
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
                    inputProps={{ maxLength: 1000 }}
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
                    inputProps={{ maxLength: 2000 }}
                    sx={{ '& .MuiInputBase-root': { minHeight: 120 } }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#f8f9fa" }}>
              <Typography variant="h6" fontWeight="600" color="#1976d2">💰 Pricing Information</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <PriceFormat
                    fullWidth
                    required
                    label="Cost Price (Excl. VAT)"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">KSh</InputAdornment> }}
                    error={!!errors.costPrice}
                    helperText={errors.costPrice}
                    inputProps={{ "aria-required": true }}
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
                  <PercentageFormat
                    fullWidth
                    label="Customer Cashback Rate"
                    name="cashbackRate"
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
                            <PriceFormat
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
                            <PriceFormat
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
                            <PriceFormat
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
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#f8f9fa" }}>
              <Typography variant="h6" fontWeight="600" color="#1976d2">🏢 Vendor Information</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!suppliersError}>
                    <InputLabel id="vendor-label">Preferred Vendor</InputLabel>
                    <Select
                      labelId="vendor-label"
                      name="preferredVendor1"
                      value={formData.preferredVendor1}
                      onChange={handleChange}
                      label="Preferred Vendor"
                      disabled={suppliersLoading || suppliersError || suppliers.length === 0}
                      renderValue={(selected) => {
                        const supplier = suppliers.find(s => s.id === parseInt(selected))
                        return supplier ? `${supplier.name} (${supplier.code || 'N/A'})` : "Select Preferred Vendor"
                      }}
                      sx={{ height: 56 }}
                    >
                      <MenuItem value="" disabled>Select Preferred Vendor</MenuItem>
                      {suppliersLoading && <MenuItem disabled>Loading suppliers...</MenuItem>}
                      {suppliersError && <MenuItem disabled>Error: {suppliersError}</MenuItem>}
                      {suppliers.length === 0 && !suppliersLoading && !suppliersError && (
                        <MenuItem disabled>No suppliers available</MenuItem>
                      )}
                      {suppliers.map(vendor => (
                        <MenuItem key={vendor.id} value={vendor.id}>
                          {vendor.name} ({vendor.code || 'N/A'})
                        </MenuItem>
                      ))}
                    </Select>
                    {suppliersError && <FormHelperText error>{suppliersError}</FormHelperText>}
                    {!suppliersError && suppliers.length === 0 && !suppliersLoading && (
                      <FormHelperText error>No suppliers available. Please add suppliers first.</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vendor Item Code"
                    name="vendorItemCode"
                    value={formData.vendorItemCode}
                    onChange={handleChange}
                    disabled={!!formData.preferredVendor1}
                    helperText={formData.preferredVendor1 ? "Autofilled from selected vendor" : "Enter vendor item code"}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#f8f9fa" }}>
              <Typography variant="h6" fontWeight="600" color="#1976d2">🎯 Sales Agent Incentives</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                  <PercentageFormat
                    fullWidth
                    label="1st Purchase Cashback"
                    name="saCashback1stPurchase"
                    value={formData.saCashback1stPurchase}
                    onChange={handleChange}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <PercentageFormat
                    fullWidth
                    label="2nd Purchase Cashback"
                    name="saCashback2ndPurchase"
                    value={formData.saCashback2ndPurchase}
                    onChange={handleChange}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <PercentageFormat
                    fullWidth
                    label="3rd Purchase Cashback"
                    name="saCashback3rdPurchase"
                    value={formData.saCashback3rdPurchase}
                    onChange={handleChange}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <PercentageFormat
                    fullWidth
                    label="4th+ Purchase Cashback"
                    name="saCashback4thPurchase"
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

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loadingSubmit || subCategoriesLoading || suppliersLoading}
              sx={{ px: 6, py: 1.5, fontSize: "1.1rem", mr: 2 }}
              startIcon={loadingSubmit && <CircularProgress size={20} />}
            >
              {loadingSubmit ? "Saving..." : (isEditMode ? "Update Product" : "Add Product")}
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