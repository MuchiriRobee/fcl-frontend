"use client"

import { useState, useEffect, useContext } from "react"
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
  TablePagination, Switch, FormControlLabel
} from "@mui/material"
import { Edit, Delete, Add, Upload, Download } from "@mui/icons-material"
import { NumericFormat } from 'react-number-format'
import * as XLSX from 'xlsx'
import { CategoriesContext } from "./CategoriesContext"
import NewItemForm from "./NewItemForm"

export default function ManageItems() {
  const { categories, loading: categoriesLoading, error: categoriesError } = useContext(CategoriesContext)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [subcategories, setSubcategories] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItemId, setDeleteItemId] = useState(null)
  const [importError, setImportError] = useState(null)
  const [importErrors, setImportErrors] = useState([])
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://fcl-back.onrender.com'

  // Convert snake_case product to camelCase for NewItemForm
  const toCamelCaseProduct = (product) => ({
    id: product.id,
    productName: product.product_name,
    productCode: product.product_code,
    parentCatId: product.parent_cat_id,
    categoryId: product.category_id,
    subcategoryId: product.subcategory_id,
    uom: product.uom,
    packSize: product.pack_size || null,
    vat: parseFloat(product.vat).toFixed(2),
    costPrice: parseFloat(product.cost_price).toFixed(2),
    sellingPrice1: parseFloat(product.selling_price1).toFixed(2),
    qty1Min: product.qty1_min,
    qty1Max: product.qty1_max,
    sellingPrice2: product.selling_price2 ? parseFloat(product.selling_price2).toFixed(2) : null,
    qty2Min: product.qty2_min || null,
    qty2Max: product.qty2_max || null,
    sellingPrice3: product.selling_price3 ? parseFloat(product.selling_price3).toFixed(2) : null,
    qty3Min: product.qty3_min || null,
    cashbackRate: parseFloat(product.cashback_rate).toFixed(2),
    saCashback1stPurchase: parseFloat(product.sa_cashback_1st).toFixed(2),
    saCashback2ndPurchase: parseFloat(product.sa_cashback_2nd).toFixed(2),
    saCashback3rdPurchase: parseFloat(product.sa_cashback_3rd).toFixed(2),
    saCashback4thPurchase: parseFloat(product.sa_cashback_4th).toFixed(2),
    publishOnWebsite: product.publish_on_website,
    imageUrl: product.image_url || null,
    active: product.active,
    etimsRefCode: product.etims_ref_code || null,
    description: product.description || null,
    longerDescription: product.longer_description || null,
    preferredVendor1: product.preferred_vendor1 || null,
    vendorItemCode: product.vendor_item_code || null,
    stockUnits: product.stock_units,
    reorderLevel: product.reorder_level || null,
    orderLevel: product.order_level || null,
    alertQuantity: product.alert_quantity || null,
    reorderActive: product.reorder_active,
    productBarcode: product.product_barcode || null,
    expiryDate: product.expiry_date || null
  })

  // Convert camelCase product to snake_case for state
  const toSnakeCaseProduct = (product) => ({
    id: product.id,
    product_name: product.productName,
    product_code: product.productCode,
    parent_cat_id: product.parentCatId,
    category_id: product.categoryId,
    subcategory_id: product.subcategoryId,
    uom: product.uom,
    pack_size: product.packSize || null,
    vat: parseFloat(product.vat).toFixed(2),
    cost_price: parseFloat(product.costPrice).toFixed(2),
    selling_price1: parseFloat(product.sellingPrice1).toFixed(2),
    qty1_min: product.qty1Min,
    qty1_max: product.qty1Max,
    selling_price2: product.sellingPrice2 ? parseFloat(product.sellingPrice2).toFixed(2) : null,
    qty2_min: product.qty2Min || null,
    qty2_max: product.qty2Max || null,
    selling_price3: product.sellingPrice3 ? parseFloat(product.sellingPrice3).toFixed(2) : null,
    qty3_min: product.qty3Min || null,
    cashback_rate: parseFloat(product.cashbackRate).toFixed(2),
    sa_cashback_1st: parseFloat(product.saCashback1stPurchase).toFixed(2),
    sa_cashback_2nd: parseFloat(product.saCashback2ndPurchase).toFixed(2),
    sa_cashback_3rd: parseFloat(product.saCashback3rdPurchase).toFixed(2),
    sa_cashback_4th: parseFloat(product.saCashback4thPurchase).toFixed(2),
    publish_on_website: product.publishOnWebsite,
    image_url: product.imageUrl || null,
    active: product.active,
    etims_ref_code: product.etimsRefCode || null,
    description: product.description || null,
    longer_description: product.longerDescription || null,
    preferred_vendor1: product.preferredVendor1 || null,
    vendor_item_code: product.vendorItemCode || null,
    stock_units: product.stockUnits,
    reorder_level: product.reorderLevel || null,
    order_level: product.orderLevel || null,
    alert_quantity: product.alertQuantity || null,
    reorder_active: product.reorderActive,
    product_barcode: product.productBarcode || null,
    expiry_date: product.expiryDate || null
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter(product =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
    setPage(0)
  }, [searchTerm, products])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products`)
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      setProducts(data)
      setFilteredProducts(data)

      // Fetch all subcategories for each category
      const subcategoriesMap = {}
      await Promise.all(
        categories.flatMap(parent =>
          parent.categories.map(async category => {
            try {
              const subResponse = await fetch(`${import.meta.env.VITE_API_URL}/categories/${category.id}/subcategories`)
              if (!subResponse.ok) throw new Error(`Failed to fetch subcategories for category ${category.id}`)
              const subs = await subResponse.json()
              subcategoriesMap[category.id] = subs
            } catch (err) {
              console.warn(`Failed to fetch subcategories for category ${category.id}: ${err.message}`)
              subcategoriesMap[category.id] = []
            }
          })
        )
      )
      setSubcategories(subcategoriesMap)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = (newProduct) => {
    const snakeCaseProduct = toSnakeCaseProduct(newProduct)
    setProducts(prev => [...prev, snakeCaseProduct])
    setFilteredProducts(prev => [...prev, snakeCaseProduct])
    setOpenDialog(false)
    setEditItem(null)
  }

  const handleEditProduct = (updatedProduct) => {
    const snakeCaseProduct = toSnakeCaseProduct(updatedProduct)
    setProducts(prev =>
      prev.map(product => (product.id === updatedProduct.id ? snakeCaseProduct : product))
    )
    setFilteredProducts(prev =>
      prev.map(product => (product.id === updatedProduct.id ? snakeCaseProduct : product))
    )
    setOpenDialog(false)
    setEditItem(null)
  }

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${deleteItemId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error("Failed to delete product")
      setProducts(prev => prev.filter(product => product.id !== deleteItemId))
      setFilteredProducts(prev => prev.filter(product => product.id !== deleteItemId))
      setDeleteItemId(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggleActive = async (productId, currentActive) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${productId}/active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      })
      if (!response.ok) throw new Error("Failed to toggle product status")
      setProducts(prev =>
        prev.map(product =>
          product.id === productId ? { ...product, active: !currentActive } : product
        )
      )
      setFilteredProducts(prev =>
        prev.map(product =>
          product.id === productId ? { ...product, active: !currentActive } : product
        )
      )
    } catch (err) {
      setError(err.message)
    }
  }

  const handleExport = async () => {
    try {
      // Fetch all suppliers once
      let allSuppliers = []
      try {
        const suppliersResponse = await fetch(`${import.meta.env.VITE_API_URL}/suppliers`)
        if (!suppliersResponse.ok) throw new Error('Failed to fetch suppliers')
        allSuppliers = await suppliersResponse.json()
      } catch (err) {
        console.warn(`Failed to fetch suppliers: ${err.message}`)
      }

      const exportData = filteredProducts.map(product => {
        const parentCat = categories.find(cat => cat.id === product.parent_cat_id)
        const category = parentCat?.categories.find(cat => cat.id === product.category_id)
        const subCategory = subcategories[product.category_id]?.find(sub => sub.id === product.subcategory_id)
        const supplier = product.preferred_vendor1
          ? allSuppliers.find(s => s.id === parseInt(product.preferred_vendor1))
          : null

        if (product.preferred_vendor1 && !supplier) {
          console.warn(`Product ${product.product_code}: Supplier ${product.preferred_vendor1} not found in fetched suppliers`)
        }

        const costPriceExclVat = parseFloat(product.cost_price) || 0
        const vatRate = parseFloat(product.vat) / 100 || 0
        const calculateProfit = (sellingPriceInclVat) => {
          const sellingPrice = parseFloat(sellingPriceInclVat) || 0
          const sellingPriceExclVat = sellingPrice / (1 + vatRate)
          const gp = sellingPriceExclVat - costPriceExclVat
          const gpPercentage = costPriceExclVat > 0 ? (gp / costPriceExclVat) * 100 : 0
          const npPercentage = sellingPriceExclVat > 0 ? ((sellingPriceExclVat - costPriceExclVat) / sellingPriceExclVat) * 100 : 0
          return { gp: gpPercentage.toFixed(2), np: npPercentage.toFixed(2) }
        }

        return {
          parent_category: parentCat?.name || '',
          category: category?.name || '',
          subcategory: subCategory?.name || '',
          product_code: product.product_code,
          'Item description': product.product_name,
          preferred_vendor: supplier?.name || '',
          uom: product.uom,
          'Pack size': product.pack_size || '',
          vat: parseFloat(product.vat).toFixed(2),
          'cost Price': parseFloat(product.cost_price).toFixed(2),
          Gp1: calculateProfit(product.selling_price1).gp,
          Np1: calculateProfit(product.selling_price1).np,
          qty_1: product.qty1_max,
          sp_1: parseFloat(product.selling_price1).toFixed(2),
          qty_2: product.qty2_max || '',
          gp2: product.selling_price2 ? calculateProfit(product.selling_price2).gp : '',
          np2: product.selling_price2 ? calculateProfit(product.selling_price2).np : '',
          sp_2: product.selling_price2 ? parseFloat(product.selling_price2).toFixed(2) : '',
          qty_3: product.qty3_min || '',
          gp3: product.selling_price3 ? calculateProfit(product.selling_price3).gp : '',
          np3: product.selling_price3 ? calculateProfit(product.selling_price3).np : '',
          sp_3: product.selling_price3 ? parseFloat(product.selling_price3).toFixed(2) : '',
          cashback: parseFloat(product.cashback_rate).toFixed(2),
          Sa1: parseFloat(product.sa_cashback_1st).toFixed(2),
          Sa2: parseFloat(product.sa_cashback_2nd).toFixed(2),
          Sa3: parseFloat(product.sa_cashback_3rd).toFixed(2),
          Sa4: parseFloat(product.sa_cashback_4th).toFixed(2),
          'publ on wsite': product.publish_on_website ? 'TRUE' : 'FALSE',
          image: product.image_url ? 'TRUE' : 'FALSE',
          'active/archived': product.active ? 'TRUE' : 'FALSE',
          etims: product.etims_ref_code || '',
          product_barcode: product.product_barcode || '',
          expiry_date: product.expiry_date || '',
          description: product.description || '',
          longer_description: product.longer_description || '',
          stock_units: product.stock_units || 0,
          reorder_level: product.reorder_level || '',
          order_level: product.order_level || '',
          alert_quantity: product.alert_quantity || '',
          reorder_active: product.reorder_active ? 'TRUE' : 'FALSE'
        }
      })

      const validExportData = exportData.filter(item => item !== null)
      if (validExportData.length === 0) {
        setError('No valid products to export')
        return
      }

      const ws = XLSX.utils.json_to_sheet(validExportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Products')
      XLSX.writeFile(wb, 'Products_Export.xlsx')
    } catch (err) {
      setError('Failed to export products: ' + err.message)
    }
  }

  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setImportError(null)
    setImportErrors([])
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(sheet)

        if (jsonData.length === 0) {
          setImportError('Excel file is empty')
          return
        }

        const errors = []
        const validProducts = []
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i]
          const rowErrors = {}

          // Validate required fields
          if (!row['parent_category']) rowErrors.parent_category = 'Parent category is required'
          if (!row['category']) rowErrors.category = 'Category is required'
          if (!row['subcategory']) rowErrors.subcategory = 'Subcategory is required'
          if (!row['product_code'] || !/^[A-Z]\d{9}$/.test(row['product_code'])) {
            rowErrors.product_code = 'Product code must be 1 letter followed by 9 digits'
          }
          if (!row['Item description']) rowErrors['Item description'] = 'Item description is required'
          if (!row['uom']) rowErrors.uom = 'Unit of measure is required'
          if (!row['cost Price'] || isNaN(row['cost Price']) || row['cost Price'] <= 0) {
            rowErrors['cost Price'] = 'Cost price must be a positive number'
          }
          if (!row['sp_1'] || isNaN(row['sp_1']) || row['sp_1'] <= 0) {
            rowErrors.sp_1 = 'Selling price 1 must be a positive number'
          }
          if (!row['qty_1'] || isNaN(row['qty_1']) || row['qty_1'] < 1) {
            rowErrors.qty_1 = 'Quantity 1 must be a positive integer'
          }
          if (row['vat'] == null || isNaN(row['vat']) || row['vat'] < 0 || row['vat'] > 100) {
            rowErrors.vat = 'VAT must be between 0 and 100'
          }
          if (row['cashback'] == null || isNaN(row['cashback']) || row['cashback'] < 0 || row['cashback'] > 100) {
            rowErrors.cashback = 'Cashback rate must be between 0 and 100'
          }
          if (row['Sa1'] == null || isNaN(row['Sa1']) || row['Sa1'] < 0 || row['Sa1'] > 100) {
            rowErrors.Sa1 = '1st purchase cashback must be between 0 and 100'
          }
          if (row['Sa2'] == null || isNaN(row['Sa2']) || row['Sa2'] < 0 || row['Sa2'] > 100) {
            rowErrors.Sa2 = '2nd purchase cashback must be between 0 and 100'
          }
          if (row['Sa3'] == null || isNaN(row['Sa3']) || row['Sa3'] < 0 || row['Sa3'] > 100) {
            rowErrors.Sa3 = '3rd purchase cashback must be between 0 and 100'
          }
          if (row['Sa4'] == null || isNaN(row['Sa4']) || row['Sa4'] < 0 || row['Sa4'] > 100) {
            rowErrors.Sa4 = '4th purchase cashback must be between 0 and 100'
          }

          // Validate optional fields
          if (row['sp_2'] && (isNaN(row['sp_2']) || row['sp_2'] <= 0)) {
            rowErrors.sp_2 = 'Selling price 2 must be a positive number'
          }
          if (row['qty_2'] && (isNaN(row['qty_2']) || row['qty_2'] < 1)) {
            rowErrors.qty_2 = 'Quantity 2 must be a positive integer'
          }
          if (row['sp_3'] && (isNaN(row['sp_3']) || row['sp_3'] <= 0)) {
            rowErrors.sp_3 = 'Selling price 3 must be a positive number'
          }
          if (row['qty_3'] && (isNaN(row['qty_3']) || row['qty_3'] < 1)) {
            rowErrors.qty_3 = 'Quantity 3 must be a positive integer'
          }

          if (Object.keys(rowErrors).length > 0) {
            errors.push({ row: i + 2, errors: rowErrors })
            continue
          }

          // Map category names to IDs
          const parentCat = categories.find(cat => cat.name.toLowerCase() === row['parent_category'].toLowerCase())
          if (!parentCat) {
            errors.push({ row: i + 2, errors: { parent_category: `Parent category ${row['parent_category']} not found` } })
            continue
          }
          const category = parentCat.categories.find(cat => cat.name.toLowerCase() === row['category'].toLowerCase())
          if (!category) {
            errors.push({ row: i + 2, errors: { category: `Category ${row['category']} not found` } })
            continue
          }
          const subCategory = subcategories[category.id]?.find(sub => sub.name.toLowerCase() === row['subcategory'].toLowerCase())
          if (!subCategory) {
            errors.push({ row: i + 2, errors: { subcategory: `Subcategory ${row['subcategory']} not found` } })
            continue
          }

          // Map supplier name to ID and code
          let supplierId = null
          let vendorItemCode = null
          if (row['preferred_vendor']) {
            try {
              const supplierResponse = await fetch(`${import.meta.env.VITE_API_URL}/suppliers`)
              if (!supplierResponse.ok) throw new Error('Failed to fetch suppliers')
              const suppliers = await supplierResponse.json()
              const supplier = suppliers.find(s => s.name.toLowerCase() === row['preferred_vendor'].toLowerCase())
              if (!supplier) {
                errors.push({ row: i + 2, errors: { preferred_vendor: `Supplier ${row['preferred_vendor']} not found` } })
                continue
              }
              supplierId = supplier.id
              vendorItemCode = supplier.code
            } catch (err) {
              errors.push({ row: i + 2, errors: { preferred_vendor: `Failed to fetch suppliers: ${err.message}` } })
              continue
            }
          }

          // Validate quantity ranges
          const qty1Max = parseInt(row['qty_1'])
          const qty2Max = row['qty_2'] ? parseInt(row['qty_2']) : null
          const qty3Min = row['qty_3'] ? parseInt(row['qty_3']) : null
          if (qty2Max && qty2Max <= qty1Max) {
            rowErrors.qty_2 = 'Quantity 2 must be greater than Quantity 1'
          }
          if (qty3Min && qty2Max && qty3Min <= qty2Max) {
            rowErrors.qty_3 = 'Quantity 3 must be greater than Quantity 2'
          }

          if (Object.keys(rowErrors).length > 0) {
            errors.push({ row: i + 2, errors: rowErrors })
            continue
          }

          validProducts.push({
            parentCatId: parentCat.id,
            categoryId: category.id,
            subcategoryId: subCategory.id,
            productName: row['Item description'],
            productCode: row['product_code'],
            uom: row['uom'],
            packSize: row['Pack size'] || null,
            vat: parseFloat(row['vat']).toFixed(2),
            costPrice: parseFloat(row['cost Price']).toFixed(2),
            sellingPrice1: parseFloat(row['sp_1']).toFixed(2),
            qty1Min: 1,
            qty1Max: qty1Max,
            sellingPrice2: row['sp_2'] ? parseFloat(row['sp_2']).toFixed(2) : null,
            qty2Min: qty2Max ? qty1Max + 1 : null,
            qty2Max: qty2Max || null,
            sellingPrice3: row['sp_3'] ? parseFloat(row['sp_3']).toFixed(2) : null,
            qty3Min: qty3Min || null,
            cashbackRate: parseFloat(row['cashback']).toFixed(2),
            saCashback1stPurchase: parseFloat(row['Sa1']).toFixed(2),
            saCashback2ndPurchase: parseFloat(row['Sa2']).toFixed(2),
            saCashback3rdPurchase: parseFloat(row['Sa3']).toFixed(2),
            saCashback4thPurchase: parseFloat(row['Sa4']).toFixed(2),
            publishOnWebsite: row['publ on wsite'] === 'TRUE',
            imageUrl: row['image'] === 'TRUE' ? '' : null,
            active: row['active/archived'] === 'TRUE',
            etimsRefCode: row['etims'] || null,
            description: row['description'] || null,
            longerDescription: row['longer_description'] || null,
            preferredVendor1: supplierId || null,
            vendorItemCode: vendorItemCode || null,
            stockUnits: parseInt(row['stock_units'] || 0),
            reorderLevel: row['reorder_level'] ? parseInt(row['reorder_level']) : null,
            orderLevel: row['order_level'] ? parseInt(row['order_level']) : null,
            alertQuantity: row['alert_quantity'] ? parseInt(row['alert_quantity']) : null,
            reorderActive: row['reorder_active'] === 'TRUE',
            productBarcode: row['product_barcode'] || null,
            expiryDate: row['expiry_date'] || null
          })
        }

        if (errors.length > 0) {
          setImportErrors(errors)
          return
        }

        if (validProducts.length === 0) {
          setImportError('No valid products to import')
          return
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validProducts)
        })

        const result = await response.json()
        if (!response.ok) {
          console.error('Bulk import error response:', result)
          setImportError(result.message || 'Failed to import products')
          setImportErrors(result.errors && Array.isArray(result.errors) ? result.errors : [])
          return
        }

        await fetchProducts()
      } catch (err) {
        console.error('Import error:', err.message)
        setImportError('Error importing file: ' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDownloadTemplate = () => {
    const templateData = [{
      parent_category: '',
      category: '',
      subcategory: '',
      product_code: '',
      'Item description': '',
      preferred_vendor: '',
      uom: '',
      'Pack size': '',
      vat: '',
      'cost Price': '',
      Gp1: '',
      Np1: '',
      qty_1: '',
      sp_1: '',
      qty_2: '',
      gp2: '',
      np2: '',
      sp_2: '',
      qty_3: '',
      gp3: '',
      np3: '',
      sp_3: '',
      cashback: '',
      Sa1: '',
      Sa2: '',
      Sa3: '',
      Sa4: '',
      'publ on wsite': 'TRUE',
      image: 'TRUE',
      'active/archived': 'TRUE',
      etims: '',
      product_barcode: '',
      expiry_date: '',
      description: '',
      longer_description: '',
      stock_units: '0',
      reorder_level: '',
      order_level: '',
      alert_quantity: '',
      reorder_active: 'TRUE'
    }]
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, 'Products_Import_Template.xlsx')
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (loading || categoriesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    )
  }

  if (error || categoriesError) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Error: {error || categoriesError}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>
        Manage Products
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Search Products"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{ bgcolor: "#1976d2" }}
          >
            Add Product
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            component="label"
            sx={{ borderColor: "#1976d2", color: "#1976d2" }}
          >
            Import
            <input type="file" hidden accept=".xlsx,.xls" onChange={handleImport} />
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{ borderColor: "#1976d2", color: "#1976d2" }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadTemplate}
            sx={{ borderColor: "#1976d2", color: "#1976d2" }}
          >
            Download Template
          </Button>
        </Box>
      </Box>

      {importError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {importError}
        </Typography>
      )}
      {importErrors.length > 0 && (
        <Box sx={{ mb: 2, maxHeight: 200, overflow: 'auto', bgcolor: '#ffebee', p: 2, borderRadius: 1 }}>
          {importErrors.map(({ row, errors }, index) => (
            <Typography key={index} color="error" variant="body2">
              Row {row}: {errors && typeof errors === 'object' ? Object.entries(errors).map(([field, msg]) => `${field}: ${msg}`).join(', ') : 'Invalid error data'}
            </Typography>
          ))}
        </Box>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <Table aria-label="products table">
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow>
              <TableCell><strong>Product Name</strong></TableCell>
              <TableCell><strong>Product Code</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Cost Price</strong></TableCell>
              <TableCell><strong>Selling Price</strong></TableCell>
              <TableCell><strong>Stock Units</strong></TableCell>
              <TableCell><strong>Active</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => {
              const parentCat = categories.find(cat => cat.id === product.parent_cat_id)
              const category = parentCat?.categories.find(cat => cat.id === product.category_id)
              const subCategory = subcategories[product.category_id]?.find(sub => sub.id === product.subcategory_id)
              return (
                <TableRow key={product.id}>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.product_code}</TableCell>
                  <TableCell>
                    {parentCat?.name || 'N/A'} / {category?.name || 'N/A'} / {subCategory?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <NumericFormat
                      value={product.cost_price}
                      displayType="text"
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      prefix="KSh "
                    />
                  </TableCell>
                  <TableCell>
                    <NumericFormat
                      value={product.selling_price1}
                      displayType="text"
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      prefix="KSh "
                    />
                  </TableCell>
                  <TableCell>{product.stock_units}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={product.active}
                          onChange={() => handleToggleActive(product.id, product.active)}
                          color="primary"
                        />
                      }
                      label={product.active ? 'Active' : 'Archived'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => { setEditItem(toCamelCaseProduct(product)); setOpenDialog(true); }}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => setDeleteItemId(product.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredProducts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setEditItem(null); }} maxWidth="lg" fullWidth>
        <DialogTitle>{editItem ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <NewItemForm
            onSubmit={editItem ? handleEditProduct : handleAddProduct}
            editItem={editItem}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); setEditItem(null); }} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteItemId} onClose={() => setDeleteItemId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteItemId(null)} color="secondary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}