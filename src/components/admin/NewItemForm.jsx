"use client"

import { useState, useEffect, useContext } from "react"
import axios from 'axios';
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
  longerDescription: "",
  productBarcode: "",
  etimsRefCode: "",
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
  stockUnits: "0",
  reorderLevel: "0",
  orderLevel: "0",
  reorderActive: false,
}

const uomOptions = ["PC", "PKT", "BOX", "BOTTLES", "SET", "KG", "LITERS", "METERS", "REAMS", "PACKS"]

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

// Custom NumericFormat component for quantity inputs
const QuantityFormat = ({ onChange, ...props }) => (
  <NumericFormat
    {...props}
    thousandSeparator=","
    decimalScale={0}
    allowNegative={false}
    isAllowed={(values) => {
      const { floatValue } = values
      return floatValue === undefined || (floatValue >= 1 && floatValue <= 9999999999999)
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

  // Fetch suppliers and dependent data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch suppliers
        setSuppliersLoading(true)
        const suppliersRes = await fetch(`${import.meta.env.VITE_API_URL}/suppliers`)
        if (!suppliersRes.ok) throw new Error("Failed to fetch suppliers")
        const suppliersData = await suppliersRes.json()
        setSuppliers(suppliersData)

        // Fetch subcategories if categoryId exists
        if (formData.categoryId) {
          setSubCategoriesLoading(true)
          const subCatRes = await fetch(`${import.meta.env.VITE_API_URL}/categories/${formData.categoryId}/subcategories`)
          if (!subCatRes.ok) throw new Error("Failed to fetch subcategories")
          const subCatData = await subCatRes.json()
          const validSubCategories = subCatData.map(sub => ({
            ...sub,
            id: parseInt(sub.id),
            subcategory_code: sub.subcategory_code || "01"
          })).filter(sub => !isNaN(sub.id))
          setSubCategories(validSubCategories)
          if (!validSubCategories.some(sub => sub.id === parseInt(formData.subcategoryId))) {
            setFormData(prev => ({ ...prev, subcategoryId: "", productCode: "" }))
          }
        }
      } catch (err) {
        setErrors(prev => ({ ...prev, form: err.message }))
        if (err.message.includes("suppliers")) setSuppliersError(err.message)
        if (err.message.includes("subcategories")) setSubCategoriesError(err.message)
      } finally {
        setSuppliersLoading(false)
        setSubCategoriesLoading(false)
      }
    }
    fetchData()
  }, [formData.parentCatId, formData.categoryId, formData.subcategoryId, isEditMode])

  // Fetch product code when parent category, category, and subcategory are selected
  useEffect(() => {
    if (formData.parentCatId && formData.categoryId && formData.subcategoryId) {
      const fetchProductCode = async () => {
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/products/generate-code`, {
            parentCatId: parseInt(formData.parentCatId),
            categoryId: parseInt(formData.categoryId),
            subcategoryId: parseInt(formData.subcategoryId),
          })
          setFormData((prev) => ({ ...prev, productCode: response.data.productCode }))
        } catch (error) {
          console.error('Error fetching product code:', error)
        }
      }
      fetchProductCode()
    } else {
      setFormData((prev) => ({ ...prev, productCode: '' }))
    }
  }, [formData.parentCatId, formData.categoryId, formData.subcategoryId])

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
          const subcategoryId = data.subcategory_id ? parseInt(data.subcategory_id) : ""
          if (isNaN(subcategoryId)) {
            setErrors({ form: "Invalid subcategory ID in product data" })
            return
          }
          setFormData({
            parentCatId: data.parent_cat_id ? data.parent_cat_id.toString() : "",
            categoryId: data.category_id ? data.category_id.toString() : "",
            subcategoryId: subcategoryId.toString(),
            productName: data.product_name || "",
            productCode: data.product_code || "",
            uom: data.uom || "PC",
            packSize: data.pack_size || "",
            longerDescription: data.longer_description || "",
            productBarcode: data.product_barcode || "",
            etimsRefCode: data.etims_ref_code || "",
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
            stockUnits: data.stock_units ? data.stock_units.toString() : "0",
            reorderLevel: data.reorder_level ? data.reorder_level.toString() : "0",
            orderLevel: data.order_level ? data.order_level.toString() : "0",
            reorderActive: data.reorder_active !== undefined ? data.reorder_active : false,
          })
        })
        .catch(err => {
          setErrors({ form: err.message || "Failed to load product data" })
        })
        .finally(() => setLoadingSubmit(false))
    }
  }, [editItem])

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
      newErrors.productCode = "Product code must be 1 letter followed by 9 digits (e.g., B010101001)"
    }
    if (!formData.parentCatId || isNaN(parseInt(formData.parentCatId))) newErrors.parentCatId = "Parent category is required"
    if (!formData.categoryId || isNaN(parseInt(formData.categoryId))) newErrors.categoryId = "Category is required"
    if (!formData.subcategoryId || isNaN(parseInt(formData.subcategoryId))) newErrors.subcategoryId = "Subcategory is required"
    if (!uomOptions.includes(formData.uom)) newErrors.uom = "Valid UOM is required"
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
    if (!formData.qty1Min || Number.parseInt(formData.qty1Min) < 1) newErrors.qty1Min = "Quantity 1 min must be at least 1"
    if (!formData.qty1Max || Number.parseInt(formData.qty1Max) < 1) newErrors.qty1Max = "Quantity 1 max must be at least 1"
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
    if (!formData.vat || Number.parseFloat(formData.vat) < 0 || Number.parseFloat(formData.vat) > 100) {
      newErrors.vat = "VAT rate must be between 0 and 100"
    }
    if (!formData.cashbackRate || Number.parseFloat(formData.cashbackRate) < 0 || Number.parseFloat(formData.cashbackRate) > 100) {
      newErrors.cashbackRate = "Cashback rate must be between 0 and 100"
    }
    if (!formData.saCashback1stPurchase || Number.parseFloat(formData.saCashback1stPurchase) < 0 || Number.parseFloat(formData.saCashback1stPurchase) > 100) {
      newErrors.saCashback1stPurchase = "1st purchase cashback must be between 0 and 100"
    }
    if (!formData.saCashback2ndPurchase || Number.parseFloat(formData.saCashback2ndPurchase) < 0 || Number.parseFloat(formData.saCashback2ndPurchase) > 100) {
      newErrors.saCashback2ndPurchase = "2nd purchase cashback must be between 0 and 100"
    }
    if (!formData.saCashback3rdPurchase || Number.parseFloat(formData.saCashback3rdPurchase) < 0 || Number.parseFloat(formData.saCashback3rdPurchase) > 100) {
      newErrors.saCashback3rdPurchase = "3rd purchase cashback must be between 0 and 100"
    }
    if (!formData.saCashback4thPurchase || Number.parseFloat(formData.saCashback4thPurchase) < 0 || Number.parseFloat(formData.saCashback4thPurchase) > 100) {
      newErrors.saCashback4thPurchase = "4th purchase cashback must be between 0 and 100"
    }
    if (typeof formData.reorderActive !== 'boolean') newErrors.reorderActive = "Reorder active must be a boolean"
    if (formData.longerDescription && formData.longerDescription.length > 2000) newErrors.longerDescription = "Detailed description must be less than 2000 characters"
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

    const jsonData = {
      productName: formData.productName.trim(),
      productCode: formData.productCode,
      parentCatId: parseInt(formData.parentCatId),
      categoryId: parseInt(formData.categoryId),
      subcategoryId: parseInt(formData.subcategoryId),
      uom: formData.uom,
      packSize: formData.packSize || null,
      longerDescription: formData.longerDescription || null,
      productBarcode: formData.productBarcode || null,
      etimsRefCode: formData.etimsRefCode || null,
      costPrice: Number.parseFloat(formData.costPrice) || 0,
      sellingPrice1: Number.parseFloat(formData.sellingPrice1) || 0,
      sellingPrice2: formData.sellingPrice2 ? Number.parseFloat(formData.sellingPrice2) : null,
      sellingPrice3: formData.sellingPrice3 ? Number.parseFloat(formData.sellingPrice3) : null,
      qty1Min: parseInt(formData.qty1Min) || 1,
      qty1Max: parseInt(formData.qty1Max) || 1,
      qty2Min: formData.qty2Min ? parseInt(formData.qty2Min) : null,
      qty2Max: formData.qty2Max ? parseInt(formData.qty2Max) : null,
      qty3Min: formData.qty3Min ? parseInt(formData.qty3Min) : null,
      vat: Number.parseFloat(formData.vat) || 0,
      cashbackRate: Number.parseFloat(formData.cashbackRate) || 0,
      preferredVendor1: formData.preferredVendor1 ? parseInt(formData.preferredVendor1) : null,
      vendorItemCode: formData.vendorItemCode || null,
      saCashback1stPurchase: Number.parseFloat(formData.saCashback1stPurchase) || 0,
      saCashback2ndPurchase: Number.parseFloat(formData.saCashback2ndPurchase) || 0,
      saCashback3rdPurchase: Number.parseFloat(formData.saCashback3rdPurchase) || 0,
      saCashback4thPurchase: Number.parseFloat(formData.saCashback4thPurchase) || 0,
      stockUnits: parseInt(formData.stockUnits) || 0,
      reorderLevel: parseInt(formData.reorderLevel) || 0,
      orderLevel: parseInt(formData.orderLevel) || 0,
      reorderActive: formData.reorderActive,
      imageUrl: isEditMode && !formData.image && formData.imagePreview ? formData.imagePreview.replace(baseUrl, '') : '',
    }

    try {
      const url = isEditMode ? `${import.meta.env.VITE_API_URL}/products/${editItem.id}` : `${import.meta.env.VITE_API_URL}/products`
      const method = isEditMode ? 'PUT' : 'POST'

      if (formData.image) {
        const formDataToSend = new FormData()
        formDataToSend.append('data', JSON.stringify(jsonData))
        formDataToSend.append('image', formData.image)
        const response = await fetch(url, {
          method,
          body: formDataToSend,
        })
        const data = await response.json()
        if (!response.ok) {
          if (data.errors) {
            const newErrors = {}
            data.errors.forEach(err => {
              newErrors[err.path] = err.msg
            })
            setErrors(prev => ({ ...prev, ...newErrors, form: data.message }))
          } else {
            setErrors({ form: data.message || 'Failed to save product' })
          }
          return
        }
        if (onSubmit) onSubmit({ ...formData, id: data.id })
        setFormData(initialFormState)
        setErrors({})
        setIsEditMode(false)
      } else {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData),
        })
        const data = await response.json()
        if (!response.ok) {
          if (data.errors) {
            const newErrors = {}
            data.errors.forEach(err => {
              newErrors[err.path] = err.msg
            })
            setErrors(prev => ({ ...prev, ...newErrors, form: data.message }))
          } else {
            setErrors({ form: data.message || 'Failed to save product' })
          }
          return
        }
        if (onSubmit) onSubmit({ ...formData, id: data.id })
        setFormData(initialFormState)
        setErrors({})
        setIsEditMode(false)
      }
    } catch (error) {
      setErrors({ form: error.message || 'Failed to save product' })
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
        <Typography variant="h6" sx={{ ml: 2, color: '#1976d2' }}>Loading categories...</Typography>
      </Box>
    )
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
    )
  }

  const parentCategories = categories.filter(cat => cat.categories && cat.categories.length > 0)
  const filteredCategories = formData.parentCatId
    ? categories.find(cat => cat.id === parseInt(formData.parentCatId))?.categories || []
    : []

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", bgcolor: '#ffffff' }}>
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
          <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", bgcolor: '#e3f2fd' }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#bbdefb" }}>
              <Typography variant="h6" fontWeight="600" color="#1565c0">📋 Basic Information</Typography>
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
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
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
                      sx={{
                        height: 56,
                        bgcolor: '#fafafa',
                        '&:hover': { bgcolor: '#f5f5f5' },
                        '&.Mui-focused': { bgcolor: '#ffffff' },
                      }}
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
                      sx={{
                        height: 56,
                        bgcolor: '#fafafa',
                        '&:hover': { bgcolor: '#f5f5f5' },
                        '&.Mui-focused': { bgcolor: '#ffffff' },
                      }}
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
                      disabled={isEditMode || !formData.categoryId || subCategoriesLoading || subCategoriesError}
                      renderValue={(selected) => {
                        const subCat = subCategories.find(sub => sub.id === parseInt(selected))
                        return subCat ? `${subCat.name} (${subCat.subcategory_code})` : (formData.categoryId ? "Select Subcategory" : "Select Category First")
                      }}
                      aria-required="true"
                      sx={{
                        height: 56,
                        bgcolor: '#fafafa',
                        '&:hover': { bgcolor: '#f5f5f5' },
                        '&.Mui-focused': { bgcolor: '#ffffff' },
                      }}
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
                    readOnly
                    InputProps={{ readOnly: !errors.productCode && !isEditMode }}
                    error={!!errors.productCode}
                    helperText={errors.productCode || "Auto-generated (e.g., B010101001)"}
                    inputProps={{ "aria-required": true }}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pack Size"
                    name="packSize"
                    value={formData.packSize}
                    onChange={handleChange}
                    error={!!errors.packSize}
                    helperText={errors.packSize}
                    inputProps={{ maxLength: 50 }}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!errors.uom}>
                    <InputLabel id="uom-label">Unit of Measure</InputLabel>
                    <Select
                      labelId="uom-label"
                      name="uom"
                      value={formData.uom}
                      onChange={handleChange}
                      label="Unit of Measure"
                      aria-required="true"
                      sx={{
                        height: 56,
                        bgcolor: '#fafafa',
                        '&:hover': { bgcolor: '#f5f5f5' },
                        '&.Mui-focused': { bgcolor: '#ffffff' },
                      }}
                    >
                      {uomOptions.map(uom => (
                        <MenuItem key={uom} value={uom}>{uom}</MenuItem>
                      ))}
                    </Select>
                    {errors.uom && <FormHelperText error>{errors.uom}</FormHelperText>}
                  </FormControl>
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
                    error={!!errors.longerDescription}
                    helperText={errors.longerDescription || `${formData.longerDescription.length}/2000 characters`}
                    inputProps={{ maxLength: 2000 }}
                    sx={{
                      '& .MuiInputBase-root': { bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Product Barcode"
                    name="productBarcode"
                    value={formData.productBarcode}
                    onChange={handleChange}
                    error={!!errors.productBarcode}
                    helperText={errors.productBarcode}
                    inputProps={{ maxLength: 50 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button onClick={generateBarcode} startIcon={<QrCode />} sx={{ color: '#1976d2' }}>
                            Generate
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="eTIMS Ref Code"
                    name="etimsRefCode"
                    value={formData.etimsRefCode}
                    onChange={handleChange}
                    error={!!errors.etimsRefCode}
                    helperText={errors.etimsRefCode}
                    inputProps={{ maxLength: 50 }}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Upload />}
                      sx={{
                        height: 56,
                        borderColor: '#1976d2',
                        color: '#1976d2',
                        '&:hover': { borderColor: '#1565c0', bgcolor: '#e3f2fd' },
                      }}
                    >
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                      />
                    </Button>
                    {formData.imagePreview && (
                      <Box sx={{ position: 'relative', width: 100, height: 100 }}>
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                        />
                        <Chip
                          label="Remove"
                          color="error"
                          size="small"
                          onClick={() => setFormData({ ...formData, image: null, imagePreview: null })}
                          sx={{ position: 'absolute', top: 4, right: 4 }}
                        />
                      </Box>
                    )}
                    {errors.image && (
                      <Typography color="error" variant="body2">
                        {errors.image}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", bgcolor: '#e8f5e9' }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#c8e6c9" }}>
              <Typography variant="h6" fontWeight="600" color="#2e7d32">💰 Pricing and Inventory</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <PriceFormat
                      fullWidth
                      required
                      label="Cost Price (Excl. VAT)"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      error={!!errors.costPrice}
                      helperText={errors.costPrice}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">KES</InputAdornment>,
                      }}
                      inputProps={{ "aria-required": true }}
                      sx={{
                        '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                        '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                        '& .Mui-focused': { bgcolor: '#ffffff' },
                      }}
                    />
                    <PercentageFormat
                      fullWidth
                      required
                      label="VAT Rate"
                      name="vat"
                      value={formData.vat}
                      onChange={handleChange}
                      error={!!errors.vat}
                      helperText={errors.vat}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      inputProps={{ "aria-required": true }}
                      sx={{
                        '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                        '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                        '& .Mui-focused': { bgcolor: '#ffffff' },
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <PriceFormat
                        fullWidth
                        required
                        label="Selling Price 1 (Incl. VAT)"
                        name="sellingPrice1"
                        value={formData.sellingPrice1}
                        onChange={handleChange}
                        error={!!errors.sellingPrice1}
                        helperText={errors.sellingPrice1}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">KES</InputAdornment>,
                        }}
                        inputProps={{ "aria-required": true }}
                        sx={{
                          '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                          '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                          '& .Mui-focused': { bgcolor: '#ffffff' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <PriceFormat
                        fullWidth
                        label="Selling Price 2 (Incl. VAT)"
                        name="sellingPrice2"
                        value={formData.sellingPrice2}
                        onChange={handleChange}
                        error={!!errors.sellingPrice2}
                        helperText={errors.sellingPrice2}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">KES</InputAdornment>,
                        }}
                        sx={{
                          '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                          '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                          '& .Mui-focused': { bgcolor: '#ffffff' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <PriceFormat
                        fullWidth
                        label="Selling Price 3 (Incl. VAT)"
                        name="sellingPrice3"
                        value={formData.sellingPrice3}
                        onChange={handleChange}
                        error={!!errors.sellingPrice3}
                        helperText={errors.sellingPrice3}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">KES</InputAdornment>,
                        }}
                        sx={{
                          '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                          '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                          '& .Mui-focused': { bgcolor: '#ffffff' },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ color: '#2e7d32' }}>
                    Pricing Tiers
                  </Typography>
                  <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #e0e0e0", bgcolor: '#fafafa' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#c8e6c9' }}>
                          <TableCell sx={{ color: '#2e7d32', fontWeight: 600 }}>Tier</TableCell>
                          <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 600 }}>Min Qty</TableCell>
                          <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 600 }}>Max Qty</TableCell>
                          <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 600 }}>Price (KES)</TableCell>
                          <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 600 }}>Gross Profit (%)</TableCell>
                          <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 600 }}>Net Profit (%)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Tier 1</TableCell>
                          <TableCell align="right">
                            <QuantityFormat
                              size="small"
                              name="qty1Min"
                              value={formData.qty1Min}
                              onChange={handleChange}
                              error={!!errors.qty1Min}
                              helperText={errors.qty1Min}
                              fullWidth
                              sx={{ '& .MuiInputBase-root': { bgcolor: '#ffffff' } }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <QuantityFormat
                              size="small"
                              name="qty1Max"
                              value={formData.qty1Max}
                              onChange={handleChange}
                              error={!!errors.qty1Max}
                              helperText={errors.qty1Max}
                              fullWidth
                              sx={{ '& .MuiInputBase-root': { bgcolor: '#ffffff' } }}
                            />
                          </TableCell>
                          <TableCell align="right">{formData.sellingPrice1}</TableCell>
                          <TableCell align="right">{calculatedProfits.gp1}%</TableCell>
                          <TableCell align="right">{calculatedProfits.np1}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Tier 2</TableCell>
                          <TableCell align="right">
                            <QuantityFormat
                              size="small"
                              name="qty2Min"
                              value={formData.qty2Min}
                              onChange={handleChange}
                              error={!!errors.qty2Min}
                              helperText={errors.qty2Min}
                              fullWidth
                              sx={{ '& .MuiInputBase-root': { bgcolor: '#ffffff' } }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <QuantityFormat
                              size="small"
                              name="qty2Max"
                              value={formData.qty2Max}
                              onChange={handleChange}
                              error={!!errors.qty2Max}
                              helperText={errors.qty2Max}
                              fullWidth
                              sx={{ '& .MuiInputBase-root': { bgcolor: '#ffffff' } }}
                            />
                          </TableCell>
                          <TableCell align="right">{formData.sellingPrice2 || '-'}</TableCell>
                          <TableCell align="right">{formData.sellingPrice2 ? `${calculatedProfits.gp2}%` : '-'}</TableCell>
                          <TableCell align="right">{formData.sellingPrice2 ? `${calculatedProfits.np2}%` : '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Tier 3</TableCell>
                          <TableCell align="right">
                            <QuantityFormat
                              size="small"
                              name="qty3Min"
                              value={formData.qty3Min}
                              onChange={handleChange}
                              error={!!errors.qty3Min}
                              helperText={errors.qty3Min}
                              fullWidth
                              sx={{ '& .MuiInputBase-root': { bgcolor: '#ffffff' } }}
                            />
                          </TableCell>
                          <TableCell align="right">-</TableCell>
                          <TableCell align="right">{formData.sellingPrice3 || '-'}</TableCell>
                          <TableCell align="right">{formData.sellingPrice3 ? `${calculatedProfits.gp3}%` : '-'}</TableCell>
                          <TableCell align="right">{formData.sellingPrice3 ? `${calculatedProfits.np3}%` : '-'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", bgcolor: '#fff3e0' }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#ffccbc" }}>
              <Typography variant="h6" fontWeight="600" color="#e64a19">🤝 Supplier and Cashback</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.preferredVendor1 || !!suppliersError}>
                    <InputLabel id="supplier-label">Preferred Supplier</InputLabel>
                    <Select
                      labelId="supplier-label"
                      name="preferredVendor1"
                      value={formData.preferredVendor1}
                      onChange={handleChange}
                      label="Preferred Supplier"
                      disabled={suppliersLoading || suppliersError}
                      renderValue={(selected) => {
                        const supplier = suppliers.find(s => s.id === parseInt(selected))
                        return supplier ? `${supplier.name} (${supplier.code})` : "Select Supplier"
                      }}
                      sx={{
                        height: 56,
                        bgcolor: '#fafafa',
                        '&:hover': { bgcolor: '#f5f5f5' },
                        '&.Mui-focused': { bgcolor: '#ffffff' },
                      }}
                    >
                      <MenuItem value="" disabled>Select Supplier</MenuItem>
                      {suppliersLoading && <MenuItem disabled>Loading...</MenuItem>}
                      {suppliersError && <MenuItem disabled>Error: {suppliersError}</MenuItem>}
                      {suppliers.map(supplier => (
                        <MenuItem key={supplier.id} value={supplier.id}>{supplier.name} ({supplier.code})</MenuItem>
                      ))}
                    </Select>
                    {(errors.preferredVendor1 || suppliersError) && (
                      <FormHelperText error>{errors.preferredVendor1 || suppliersError}</FormHelperText>
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
                    error={!!errors.vendorItemCode}
                    helperText={errors.vendorItemCode}
                    inputProps={{ maxLength: 50 }}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PercentageFormat
                    fullWidth
                    required
                    label="Cashback Rate"
                    name="cashbackRate"
                    value={formData.cashbackRate}
                    onChange={handleChange}
                    error={!!errors.cashbackRate}
                    helperText={errors.cashbackRate}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ "aria-required": true }}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PercentageFormat
                    fullWidth
                    required
                    label="1st Purchase Cashback"
                    name="saCashback1stPurchase"
                    value={formData.saCashback1stPurchase}
                    onChange={handleChange}
                    error={!!errors.saCashback1stPurchase}
                    helperText={errors.saCashback1stPurchase}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ "aria-required": true }}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PercentageFormat
                    fullWidth
                    required
                    label="2nd Purchase Cashback"
                    name="saCashback2ndPurchase"
                    value={formData.saCashback2ndPurchase}
                    onChange={handleChange}
                    error={!!errors.saCashback2ndPurchase}
                    helperText={errors.saCashback2ndPurchase}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ "aria-required": true }}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PercentageFormat
                    fullWidth
                    required
                    label="3rd Purchase Cashback"
                    name="saCashback3rdPurchase"
                    value={formData.saCashback3rdPurchase}
                    onChange={handleChange}
                    error={!!errors.saCashback3rdPurchase}
                    helperText={errors.saCashback3rdPurchase}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ "aria-required": true }}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PercentageFormat
                    fullWidth
                    required
                    label="4th Purchase Cashback"
                    name="saCashback4thPurchase"
                    value={formData.saCashback4thPurchase}
                    onChange={handleChange}
                    error={!!errors.saCashback4thPurchase}
                    helperText={errors.saCashback4thPurchase}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ "aria-required": true }}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", bgcolor: '#f3e5f5' }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#e1bee7" }}>
              <Typography variant="h6" fontWeight="600" color="#7b1fa2">📦 Reorder Settings</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <QuantityFormat
                    fullWidth
                    required
                    label="Stock Quantity"
                    name="stockUnits"
                    value={formData.stockUnits}
                    onChange={handleChange}
                    error={!!errors.stockUnits}
                    helperText={errors.stockUnits}
                    inputProps={{ "aria-required": true }}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <QuantityFormat
                    fullWidth
                    label="Reorder Level"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleChange}
                    error={!!errors.reorderLevel}
                    helperText={errors.reorderLevel}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <QuantityFormat
                    fullWidth
                    label="Order Level"
                    name="orderLevel"
                    value={formData.orderLevel}
                    onChange={handleChange}
                    error={!!errors.orderLevel}
                    helperText={errors.orderLevel}
                    sx={{
                      '& .MuiInputBase-root': { height: 56, bgcolor: '#fafafa' },
                      '& .MuiInputBase-root:hover': { bgcolor: '#f5f5f5' },
                      '& .Mui-focused': { bgcolor: '#ffffff' },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.reorderActive}
                        onChange={handleChange}
                        name="reorderActive"
                        color="primary"
                      />
                    }
                    label="Enable Auto-Reorder"
                    sx={{ ml: 1, color: '#7b1fa2' }}
                  />
                  {errors.reorderActive && (
                    <Typography color="error" variant="body2">
                      {errors.reorderActive}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={resetForm}
              disabled={loadingSubmit}
              sx={{
                borderColor: '#e64a19',
                color: '#e64a19',
                '&:hover': { borderColor: '#d84315', bgcolor: '#fff3e0' },
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loadingSubmit}
              startIcon={loadingSubmit ? <CircularProgress size={20} /> : null}
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
              }}
            >
              {loadingSubmit ? "Saving..." : isEditMode ? "Update Product" : "Add Product"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  )
}