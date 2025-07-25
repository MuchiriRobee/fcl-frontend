"use client"

import { useState, useEffect, useContext,  } from "react"
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
    parentCatId: product.parent_cat_id ? product.parent_cat_id.toString() : "",
    categoryId: product.category_id ? product.category_id.toString() : "",
    subcategoryId: product.subcategory_id ? product.subcategory_id.toString() : "",
    productName: product.product_name || "",
    productCode: product.product_code || "",
    uom: product.uom || "PC",
    packSize: product.pack_size || "",
    description: product.description || "",
    longerDescription: product.longer_description ? 'TRUE' : 'FALSE',
    productBarcode: product.product_barcode || "",
    etimsRefCode: product.etims_ref_code || "",
    expiryDate: product.expiry_date ? product.expiry_date.split('T')[0] : "",
    image: null,
    imagePreview: product.image_url ? `${baseUrl}${product.image_url}` : null,
    costPrice: product.cost_price ? parseFloat(product.cost_price).toFixed(2) : "",
    sellingPrice1: product.selling_price1 ? parseFloat(product.selling_price1).toFixed(2) : "",
    sellingPrice2: product.selling_price2 ? parseFloat(product.selling_price2).toFixed(2) : "",
    sellingPrice3: product.selling_price3 ? parseFloat(product.selling_price3).toFixed(2) : "",
    qty1Min: product.qty1_min ? product.qty1_min.toString() : "1",
    qty1Max: product.qty1_max ? product.qty1_max.toString() : "3",
    qty2Min: product.qty2_min ? product.qty2_min.toString() : "",
    qty2Max: product.qty2_max ? product.qty2_max.toString() : "",
    qty3Min: product.qty3_min ? product.qty3_min.toString() : "",
    vat: product.vat ? parseFloat(product.vat).toFixed(2) : "16",
    cashbackRate: product.cashback_rate ? parseFloat(product.cashback_rate).toFixed(2) : "0",
    preferredVendor1: product.preferred_vendor1 ? product.preferred_vendor1.toString() : "",
    vendorItemCode: product.vendor_item_code || "",
    saCashback1stPurchase: product.sa_cashback_1st ? parseFloat(product.sa_cashback_1st).toFixed(2) : "6",
    saCashback2ndPurchase: product.sa_cashback_2nd ? parseFloat(product.sa_cashback_2nd).toFixed(2) : "4",
    saCashback3rdPurchase: product.sa_cashback_3rd ? parseFloat(product.sa_cashback_3rd).toFixed(2) : "3",
    saCashback4thPurchase: product.sa_cashback_4th ? parseFloat(product.sa_cashback_4th).toFixed(2) : "2",
    stockUnits: product.stock_units ? product.stock_units.toString() : "0",
    reorderLevel: product.reorder_level ? product.reorder_level.toString() : "",
    orderLevel: product.order_level ? product.order_level.toString() : "",
    alertQuantity: product.alert_quantity ? product.alert_quantity.toString() : "",
    reorderActive: product.reorder_active !== undefined ? !!product.reorder_active : true,
  })

  // Convert camelCase product to snake_case for state
  const toSnakeCaseProduct = (product) => ({
    id: product.id,
    parent_cat_id: parseInt(product.parentCatId) || null,
    category_id: parseInt(product.categoryId) || null,
    subcategory_id: parseInt(product.subcategoryId) || null,
    product_name: product.productName || null,
    product_code: product.productCode || null,
    uom: product.uom || null,
    pack_size: product.packSize || null,
    description: product.description || null,
    longer_description: product.longerDescription ? 'TRUE' : 'FALSE',
    product_barcode: product.productBarcode || null,
    etims_ref_code: product.etimsRefCode || null,
    expiry_date: product.expiryDate || null,
    image: product.image || null,
    image_url: product.imagePreview ? product.imagePreview.replace(baseUrl, '') : null,
    cost_price: product.costPrice ? parseFloat(product.costPrice).toFixed(2) : null,
    selling_price1: product.sellingPrice1 ? parseFloat(product.sellingPrice1).toFixed(2) : null,
    selling_price2: product.sellingPrice2 ? parseFloat(product.sellingPrice2).toFixed(2) : null,
    selling_price3: product.sellingPrice3 ? parseFloat(product.sellingPrice3).toFixed(2) : null,
    qty1_min: parseInt(product.qty1Min) || null,
    qty1_max: parseInt(product.qty1Max) || null,
    qty2_min: product.qty2Min ? parseInt(product.qty2Min) : null,
    qty2_max: product.qty2Max ? parseInt(product.qty2Max) : null,
    qty3_min: product.qty3Min ? parseInt(product.qty3Min) : null,
    vat: product.vat ? parseFloat(product.vat).toFixed(2) : null,
    cashback_rate: product.cashbackRate ? parseFloat(product.cashbackRate).toFixed(2) : null,
    preferred_vendor1: product.preferredVendor1 ? parseInt(product.preferredVendor1) : null,
    vendor_item_code: product.vendorItemCode || null,
    sa_cashback_1st: product.saCashback1stPurchase ? parseFloat(product.saCashback1stPurchase).toFixed(2) : null,
    sa_cashback_2nd: product.saCashback2ndPurchase ? parseFloat(product.saCashback2ndPurchase).toFixed(2) : null,
    sa_cashback_3rd: product.saCashback3rdPurchase ? parseFloat(product.saCashback3rdPurchase).toFixed(2) : null,
    sa_cashback_4th: product.saCashback4thPurchase ? parseFloat(product.saCashback4thPurchase).toFixed(2) : null,
    stock_units: parseInt(product.stockUnits) || 0,
    reorder_level: product.reorderLevel ? parseInt(product.reorderLevel) : null,
    order_level: product.orderLevel ? parseInt(product.orderLevel) : null,
    alert_quantity: product.alertQuantity ? parseInt(product.alertQuantity) : null,
    reorder_active: product.reorderActive !== undefined ? product.reorderActive : true,
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
      const camelCaseProduct = toCamelCaseProduct(product)
      const parentCat = categories.find(cat => cat.id === product.parent_cat_id)
      const category = parentCat?.categories.find(cat => cat.id === product.category_id)
      const subCategory = subcategories[product.category_id]?.find(sub => sub.id === product.subcategory_id)
      const supplier = product.preferred_vendor1
        ? allSuppliers.find(s => s.id === parseInt(product.preferred_vendor1))
        : null

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
        parentCat: parentCat?.name || '',
        category: category?.name || '',
        subCat: subCategory?.name || '',
        itemCode: product.product_code || '',
        itemName: product.product_name || '',
        preferredVendor1: supplier?.name || '',
        vendorItemCode: product.vendor_item_code || '',
        itemBarcode: product.product_barcode || '',
        vat: parseFloat(product.vat).toFixed(2),
        uom: product.uom || '',
        packSize: product.pack_size || '',
        reorderLevel: product.reorder_level?.toString() || '',
        orderLevel: product.order_level?.toString() || '',
        reorderActive: product.reorder_active ? 'TRUE' : 'FALSE',
        currentStock: product.stock_units?.toString() || '0',
        costPrice: parseFloat(product.cost_price).toFixed(2),
        GP1: calculateProfit(product.selling_price1).gp,
        NP1: calculateProfit(product.selling_price1).np,                           
        qty1Min: product.qty1_min?.toString() || '1',
        qty1Max: product.qty1_max?.toString() || '3',
        sp1: parseFloat(product.selling_price1).toFixed(2),
        GP2: product.selling_price2 ? calculateProfit(product.selling_price2).gp : '',
        NP2: product.selling_price2 ? calculateProfit(product.selling_price2).np : '',        
        qty2Min: product.qty2_min?.toString() || '',
        qty2Max: product.qty2_max?.toString() || '',
        sp2: product.selling_price2 ? parseFloat(product.selling_price2).toFixed(2) : '',
        GP3: product.selling_price3 ? calculateProfit(product.selling_price3).gp : '',
        NP3: product.selling_price3 ? calculateProfit(product.selling_price3).np : '',                
        qty3Min: product.qty3_min?.toString() || '', 
        sp3: product.selling_price3 ? parseFloat(product.selling_price3).toFixed(2) : '',       
        clientCashBack: parseFloat(product.cashback_rate).toFixed(2),        
        saCashback1: parseFloat(product.sa_cashback_1st).toFixed(2),
        saCashback2: parseFloat(product.sa_cashback_2nd).toFixed(2),
        saCashback3: parseFloat(product.sa_cashback_3rd).toFixed(2),
        saCashback4: parseFloat(product.sa_cashback_4th).toFixed(2),
        active: product.active ? 'TRUE' : 'FALSE',
        image: product.image_url ? 'TRUE' : 'FALSE',        
        longerDescription: product.longer_description ? 'TRUE' : 'FALSE',        
        etimsRef: product.etims_ref_code || ''                
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
        if (!row['parentCatId']) rowErrors.parentCat = 'Parent category is required'
        if (!row['categoryId']) rowErrors.category = 'Category is required'
        if (!row['subcategoryId']) rowErrors.subCat = 'Subcategory is required'
        if (!row['productName']) rowErrors.itemName = 'Product name is required'
        if (!row['productCode'] || !/^[A-Z]\d{9}$/.test(row['productCode'])) {
          rowErrors.itemCode = 'Product code must be 1 letter followed by 9 digits'
        }
        if (!row['uom'] || !['PC', 'PKT', 'BOX', 'SET', 'KG', 'LITERS', 'METERS', 'REAMS', 'PACKS'].includes(row['uom'])) {
          rowErrors.uom = 'Unit of measure must be one of PC, PKT, BOX, SET, KG, LITERS, METERS, REAMS, PACKS'
        }
        if (!row['costPrice'] || isNaN(row['costPrice']) || row['costPrice'] <= 0 || row['costPrice'] > 9999999999999.99) {
          rowErrors.costPrice = 'Cost price must be between 0.01 and 9,999,999,999,999.99'
        }
        if (!row['sellingPrice1'] || isNaN(row['sellingPrice1']) || row['sellingPrice1'] <= 0 || row['sellingPrice1'] > 9999999999999.99) {
          rowErrors.sp1 = 'Selling price 1 must be between 0.01 and 9,999,999,999,999.99'
        }
        if (!row['qty1Min'] || isNaN(row['qty1Min']) || row['qty1Min'] < 1) {
          rowErrors.qty1Min = 'Quantity 1 min must be at least 1'
        }
        if (!row['qty1Max'] || isNaN(row['qty1Max']) || row['qty1Max'] < 1) {
          rowErrors.qty1Max = 'Quantity 1 max must be at least 1'
        }
        if (row['vat'] == null || isNaN(row['vat']) || row['vat'] < 0 || row['vat'] > 100) {
          rowErrors.vat = 'VAT must be between 0 and 100'
        }
        if (row['cashbackRate'] == null || isNaN(row['cashbackRate']) || row['cashbackRate'] < 0 || row['cashbackRate'] > 100) {
          rowErrors.clientCashBack = 'Cashback rate must be between 0 and 100'
        }
        if (row['saCashback1stPurchase'] == null || isNaN(row['saCashback1stPurchase']) || row['saCashback1stPurchase'] < 0 || row['saCashback1stPurchase'] > 100) {
          rowErrors.saCashback1 = '1st purchase cashback must be between 0 and 100'
        }
        if (row['saCashback2ndPurchase'] == null || isNaN(row['saCashback2ndPurchase']) || row['saCashback2ndPurchase'] < 0 || row['saCashback2ndPurchase'] > 100) {
          rowErrors.saCashback2 = '2nd purchase cashback must be between 0 and 100'
        }
        if (row['saCashback3rdPurchase'] == null || isNaN(row['saCashback3rdPurchase']) || row['saCashback3rdPurchase'] < 0 || row['saCashback3rdPurchase'] > 100) {
          rowErrors.saCashback3 = '3rd purchase cashback must be between 0 and 100'
        }
        if (row['saCashback4thPurchase'] == null || isNaN(row['saCashback4thPurchase']) || row['saCashback4thPurchase'] < 0 || row['saCashback4thPurchase'] > 100) {
          rowErrors.saCashback4 = '4th purchase cashback must be between 0 and 100'
        }
        if (row['stockUnits'] == null || isNaN(row['stockUnits']) || row['stockUnits'] < 0) {
          rowErrors.currentStock = 'Stock units must be non-negative'
        }
        if (typeof row['reorderActive'] !== 'string' || !['TRUE', 'FALSE'].includes(row['reorderActive'])) {
          rowErrors.reorderActive = 'Reorder active must be TRUE or FALSE'
        }
        if (typeof row['active'] !== 'string' || !['TRUE', 'FALSE'].includes(row['active'])) {
          rowErrors.active = 'Active status must be TRUE or FALSE'
        }
        if (typeof row['hasImage'] !== 'string' || !['TRUE', 'FALSE'].includes(row['hasImage'])) {
          rowErrors.image = 'Image status must be TRUE or FALSE'
        }

        // Validate optional fields
        if (row['sellingPrice2'] && (isNaN(row['sellingPrice2']) || row['sellingPrice2'] <= 0 || row['sellingPrice2'] > 9999999999999.99)) {
          rowErrors.sp2 = 'Selling price 2 must be between 0.01 and 9,999,999,999,999.99'
        }
        if (row['sellingPrice3'] && (isNaN(row['sellingPrice3']) || row['sellingPrice3'] <= 0 || row['sellingPrice3'] > 9999999999999.99)) {
          rowErrors.sp3 = 'Selling price 3 must be between 0.01 and 9,999,999,999,999.99'
        }
        if (row['qty2Min'] && (isNaN(row['qty2Min']) || row['qty2Min'] < 1)) {
          rowErrors.qty2Min = 'Quantity 2 min must be at least 1'
        }
        if (row['qty2Max'] && (isNaN(row['qty2Max']) || row['qty2Max'] < 1)) {
          rowErrors.qty2Max = 'Quantity 2 max must be at least 1'
        }
        if (row['qty3Min'] && (isNaN(row['qty3Min']) || row['qty3Min'] < 1)) {
          rowErrors.qty3Min = 'Quantity 3 min must be at least 1'
        }
        // longerDescription is now handled as TRUE/FALSE in export, no need for length validation here
        
        if (row['productBarcode'] && row['productBarcode'].length > 50) {
          rowErrors.itemBarcode = 'Product barcode must be less than 50 characters'
        }
        if (row['etimsRefCode'] && row['etimsRefCode'].length > 50) {
          rowErrors.etimsRef = 'eTIMS ref code must be less than 50 characters'
        }
        if (row['packSize'] && row['packSize'].length > 50) {
          rowErrors.packSize = 'Pack size must be less than 50 characters'
        }
        if (row['vendorItemCode'] && row['vendorItemCode'].length > 50) {
          rowErrors.vendorItemCode = 'Vendor item code must be less than 50 characters'
        }
        if (row['reorderLevel'] && (isNaN(row['reorderLevel']) || row['reorderLevel'] < 0)) {
          rowErrors.reorderLevel = 'Reorder level must be non-negative'
        }
        if (row['orderLevel'] && (isNaN(row['orderLevel']) || row['orderLevel'] < 0)) {
          rowErrors.orderLevel = 'Order level must be non-negative'
        }

        // Validate quantity ranges
        const qty1Min = parseInt(row['qty1Min'])
        const qty1Max = parseInt(row['qty1Max'])
        const qty2Min = row['qty2Min'] ? parseInt(row['qty2Min']) : null
        const qty2Max = row['qty2Max'] ? parseInt(row['qty2Max']) : null
        const qty3Min = row['qty3Min'] ? parseInt(row['qty3Min']) : null
        if (qty1Max < qty1Min) {
          rowErrors.qty1Max = 'Quantity 1 max must be greater than min'
        }
        if (qty2Min && qty2Min <= qty1Max) {
          rowErrors.qty2Min = 'Quantity 2 min must be greater than Quantity 1 max'
        }
        if (qty2Max && qty2Max < qty2Min) {
          rowErrors.qty2Max = 'Quantity 2 max must be greater than min'
        }
        if (qty3Min && qty2Max && qty3Min <= qty2Max) {
          rowErrors.qty3Min = 'Quantity 3 min must be greater than Quantity 2 max'
        }

        if (Object.keys(rowErrors).length > 0) {
          errors.push({ row: i + 2, errors: rowErrors })
          continue
        }

        // Map category names to IDs
        const parentCat = categories.find(cat => cat.name.toLowerCase() === row['parentCatId'].toLowerCase())
        if (!parentCat) {
          errors.push({ row: i + 2, errors: { parentCat: `Parent category ${row['parentCatId']} not found` } })
          continue
        }
        const category = parentCat.categories.find(cat => cat.name.toLowerCase() === row['categoryId'].toLowerCase())
        if (!category) {
          errors.push({ row: i + 2, errors: { category: `Category ${row['categoryId']} not found` } })
          continue
        }
        const subCategory = subcategories[category.id]?.find(sub => sub.name.toLowerCase() === row['subcategoryId'].toLowerCase())
        if (!subCategory) {
          errors.push({ row: i + 2, errors: { subCat: `Subcategory ${row['subcategoryId']} not found` } })
          continue
        }

        // Map supplier name to ID and code
        let supplierId = null
        let vendorItemCode = null
        if (row['preferredVendor1']) {
          try {
            const supplierResponse = await fetch(`${import.meta.env.VITE_API_URL}/suppliers`)
            if (!supplierResponse.ok) throw new Error('Failed to fetch suppliers')
            const suppliers = await supplierResponse.json()
            const supplier = suppliers.find(s => s.name.toLowerCase() === row['preferredVendor1'].toLowerCase())
            if (!supplier) {
              errors.push({ row: i + 2, errors: { preferredVendor1: `Supplier ${row['preferredVendor1']} not found` } })
              continue
            }
            supplierId = supplier.id
            vendorItemCode = supplier.code
          } catch (err) {
            errors.push({ row: i + 2, errors: { preferredVendor1: `Failed to fetch suppliers: ${err.message}` } })
            continue
          }
        }

        validProducts.push({
          parentCat: parentCat.id.toString(),
          category: category.id.toString(),
          subCat: subCategory.id.toString(),
          itemCode: row['productCode'],
          itemName: row['productName'],          
          preferredVendor1: supplierId ? supplierId.toString() : '',
          vendorItemCode: vendorItemCode || '',
          itemBarcode: row['productBarcode'] || '',
          vat: parseFloat(row['vat']).toFixed(2),
          uom: row['uom'],
          packSize: row['packSize'] || '',
          reorderLevel: row['reorderLevel'] ? parseInt(row['reorderLevel']) : '',
          orderLevel: row['orderLevel'] ? parseInt(row['orderLevel']) : '',
          reorderActive: row['reorderActive'] === 'TRUE',
          currentStock: parseInt(row['stockUnits']) || 0,          
          costPrice: parseFloat(product.cost_price).toFixed(2),
          GP1: calculateProfit(product.selling_price1).gp,
          NP1: calculateProfit(product.selling_price1).np,          
          qty1Min: product.qty1_min?.toString() || '1',
          qty1Max: product.qty1_max?.toString() || '3',
          sp1: parseFloat(product.selling_price1).toFixed(2),
          GP2: product.selling_price2 ? calculateProfit(product.selling_price2).gp : '',
          NP2: product.selling_price2 ? calculateProfit(product.selling_price2).np : '',          
          qty2Min: product.qty2_min?.toString() || '',
          qty2Max: product.qty2_max?.toString() || '',
          sp2: product.selling_price2 ? parseFloat(product.selling_price2).toFixed(2) : '',
          GP3: product.selling_price3 ? calculateProfit(product.selling_price3).gp : '',
          NP3: product.selling_price3 ? calculateProfit(product.selling_price3).np : '',          
          qty3Min: product.qty3_min?.toString() || '',
          sp3: product.selling_price3 ? parseFloat(product.selling_price3).toFixed(2) : '',
          clientCashBack: parseFloat(product.cashback_rate).toFixed(2),
          saCashback1: parseFloat(product.sa_cashback_1st).toFixed(2),
          saCashback2: parseFloat(product.sa_cashback_2nd).toFixed(2),
          saCashback3: parseFloat(product.sa_cashback_3rd).toFixed(2),
          saCashback4: parseFloat(product.sa_cashback_4th).toFixed(2),
          active: product.active ? 'TRUE' : 'FALSE',
          image: product.image_url ? 'TRUE' : 'FALSE',
          longerDescription: product.longer_description ? 'TRUE' : 'FALSE',
          etimsRef: product.etims_ref_code || ''
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
        setImportErrors(result.errors && Array.isArray(result.errors) ? result.errors.map(err => ({
          row: err.index + 2,
          errors: err.errors.reduce((acc, e) => ({ ...acc, [e.path]: e.msg }), {})
        })) : [])
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
    parentCat: '',
    category: '',
    subCat: '',
    itemCode: '',
    itemName: '',    
    preferredVendor1: '',
    vendorItemCode: '',
    itemBarcode: '',
    vat: '',
    uom: '',
    packSize: '',    
    reorderLevel: '',
    orderLevel: '',
    reorderActive: 'TRUE',
    currentStock: '',
    costPrice: '',
    GP1: '',
    NP1: '',    
    qty1Min: '',
    qty1Max: '',
    sp1: '',
    GP2: '',
    NP2: '',    
    qty2Min: '',
    qty2Max: '',
    sp2: '',
    GP3: '',
    NP3: '',            
    qty3Min: '',
    sp3: '',    
    clientCashBack: '',    
    saCashback1: '',
    saCashback2: '',
    saCashback3: '',
    saCashback4: '',        
    active: 'TRUE',
    image: 'FALSE',
    longerDescription: 'FALSE',
    etimsRef: ''            
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
            startIcon={<Download />}
            onClick={handleExport}
            sx={{ borderColor: "#1976d2", color: "#1976d2" }}
          >
            Export
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