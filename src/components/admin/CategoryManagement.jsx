"use client"

import { useState, useEffect, useContext } from "react"
import {
  Box, Typography, TextField, Button, Paper, Table, TableContainer,
  TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Alert, FormControl, InputLabel,
  Select, MenuItem, Collapse, FormHelperText
} from "@mui/material"
import { Edit, Delete, Add, ExpandMore, ExpandLess } from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import axios from "axios"
import { CategoriesContext } from "./CategoriesContext"

// Styled Components for Enhanced Visualization
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  backgroundColor: theme.palette.grey[50],
}))

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  "& .MuiTableCell-head": {
    color: theme.palette.common.white,
    fontWeight: 700,
    fontSize: "1.1rem",
    padding: theme.spacing(2),
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
}))

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
}))

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.grey[600],
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    transform: "scale(1.1)",
    transition: "all 0.2s ease-in-out",
  },
}))

const StyledAddButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.secondary.dark,
    boxShadow: theme.shadows[2],
  },
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
}))

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  fontWeight: 500,
}))

export default function CategoryManagement() {
  const { categories, setCategories, refreshCategories, loading: contextLoading, error: contextError } = useContext(CategoriesContext)
  const [parentCategories, setParentCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [openParentCategoryDialog, setOpenParentCategoryDialog] = useState(false)
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false)
  const [openSubCategoryDialog, setOpenSubCategoryDialog] = useState(false)
  const [parentCategoryForm, setParentCategoryForm] = useState({ name: "", parent_category_code: "", id: null })
  const [categoryForm, setCategoryForm] = useState({ name: "", parent_category_id: "", id: null })
  const [subCategoryForm, setSubCategoryForm] = useState({ name: "", category_id: "", category_name: "", id: null })
  const [formErrors, setFormErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedParent, setExpandedParent] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

  const fetchParentCategories = async () => {
    setLoading(true)
    try {
      console.log(`[FETCH] GET ${API_URL}/categories/parent`)
      const response = await axios.get(`${API_URL}/categories/parent`, {
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('[FETCH] Parent categories response:', response.data)
      setParentCategories(response.data || [])
      setError(null)
    } catch (err) {
      const errorMessage = err.response
        ? `Failed to fetch parent categories: ${err.response.status} ${err.response.data?.message || err.message}`
        : `Failed to fetch parent categories: Network error (${err.message})`
      console.error(errorMessage, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubCategories = async (categoryId) => {
    setLoading(true)
    try {
      console.log(`[FETCH] GET ${API_URL}/categories/${categoryId}/subcategories`)
      const response = await axios.get(`${API_URL}/categories/${categoryId}/subcategories`, {
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('[FETCH] Subcategories response:', response.data)
      setSubCategories(response.data || [])
      setError(null)
    } catch (err) {
      const errorMessage = err.response
        ? `Failed to fetch subcategories: ${err.response.status} ${err.response.data?.message || err.message}`
        : `Failed to fetch subcategories: Network error (${err.message})`
      console.error(errorMessage, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('[INIT] Component mounted, fetching parent categories...')
    console.log('[INIT] Using API_URL:', API_URL)
    fetchParentCategories()
  }, [])

  const validateParentCategoryCode = (code, currentId) => {
    const codeRegex = /^[A-Z]\d{2}$/
    if (!codeRegex.test(code)) {
      return "Parent category code must be one uppercase letter followed by two digits (e.g., M01)"
    }
    const isCodeTaken = parentCategories.some(
      (pc) => pc.parent_category_code === code && pc.id !== currentId
    )
    if (isCodeTaken) {
      return "Parent category code is already in use"
    }
    return null
  }

  const handleParentCategorySubmit = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!parentCategoryForm.name) errors.name = "Parent category name is required"
    if (!parentCategoryForm.parent_category_code) {
      errors.parent_category_code = "Parent category code is required"
    } else {
      const codeError = validateParentCategoryCode(parentCategoryForm.parent_category_code, parentCategoryForm.id)
      if (codeError) errors.parent_category_code = codeError
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setLoading(true)
    try {
      const url = parentCategoryForm.id
        ? `${API_URL}/categories/parent/${parentCategoryForm.id}`
        : `${API_URL}/categories/parent`
      const method = parentCategoryForm.id ? "put" : "post"
      console.log(`[SUBMIT] ${method.toUpperCase()} ${url}`, {
        name: parentCategoryForm.name,
        parent_category_code: parentCategoryForm.parent_category_code
      })
      const response = await axios({
        method,
        url,
        data: {
          name: parentCategoryForm.name,
          parent_category_code: parentCategoryForm.parent_category_code
        },
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('[SUBMIT] Response:', response.data)
      await refreshCategories()
      await fetchParentCategories()
      setSuccessMessage(`Parent category ${parentCategoryForm.id ? 'updated' : 'added'} successfully`)
      setTimeout(() => setSuccessMessage(null), 3000)
      setOpenParentCategoryDialog(false)
      setParentCategoryForm({ name: "", parent_category_code: "", id: null })
      setFormErrors({})
      setError(null)
    } catch (err) {
      const errorMessage = err.response
        ? `Failed to save parent category: ${err.response.status} ${err.response.data?.message || err.message}`
        : `Failed to save parent category: Network error (${err.message})`
      console.error(errorMessage, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!categoryForm.name) errors.name = "Category name is required"
    if (!categoryForm.parent_category_id) errors.parent_category_id = "Parent category is required"
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setLoading(true)
    try {
      const url = categoryForm.id
        ? `${API_URL}/categories/${categoryForm.id}`
        : `${API_URL}/categories`
      const method = categoryForm.id ? "put" : "post"
      console.log(`[SUBMIT] ${method.toUpperCase()} ${url}`, {
        name: categoryForm.name,
        parent_category_id: categoryForm.parent_category_id
      })
      const response = await axios({
        method,
        url,
        data: {
          name: categoryForm.name,
          parent_category_id: categoryForm.parent_category_id
        },
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('[SUBMIT] Response:', response.data)
      await refreshCategories()
      await fetchParentCategories()
      setSuccessMessage(`Category ${categoryForm.id ? 'updated' : 'added'} successfully`)
      setTimeout(() => setSuccessMessage(null), 3000)
      setOpenCategoryDialog(false)
      setCategoryForm({ name: "", parent_category_id: "", id: null })
      setFormErrors({})
      setError(null)
    } catch (err) {
      const errorMessage = err.response
        ? `Failed to save category: ${err.response.status} ${err.response.data?.message || err.message}`
        : `Failed to save category: Network error (${err.message})`
      console.error(errorMessage, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubCategorySubmit = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!subCategoryForm.name) errors.name = "Subcategory name is required"
    if (!subCategoryForm.category_id) errors.category_id = "Category is required"
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setLoading(true)
    try {
      const url = subCategoryForm.id
        ? `${API_URL}/categories/subcategories/${subCategoryForm.id}`
        : `${API_URL}/categories/subcategories`
      const method = subCategoryForm.id ? "put" : "post"
      console.log(`[SUBMIT] ${method.toUpperCase()} ${url}`, {
        name: subCategoryForm.name,
        category_id: subCategoryForm.category_id
      })
      const response = await axios({
        method,
        url,
        data: {
          name: subCategoryForm.name,
          category_id: subCategoryForm.category_id
        },
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('[SUBMIT] Response:', response.data)
      await fetchSubCategories(subCategoryForm.category_id)
      await refreshCategories()
      await fetchParentCategories()
      setSuccessMessage(`Subcategory ${subCategoryForm.id ? 'updated' : 'added'} successfully`)
      setTimeout(() => setSuccessMessage(null), 3000)
      setOpenSubCategoryDialog(false)
      setSubCategoryForm({ name: "", category_id: "", category_name: "", id: null })
      setFormErrors({})
      setError(null)
    } catch (err) {
      const errorMessage = err.response
        ? `Failed to save subcategory: ${err.response.status} ${err.response.data?.message || err.message}`
        : `Failed to save subcategory: Network error (${err.message})`
      console.error(errorMessage, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleParentCategoryEdit = (parentCategory) => {
    setParentCategoryForm({
      name: parentCategory.name,
      parent_category_code: parentCategory.parent_category_code,
      id: parentCategory.id
    })
    setOpenParentCategoryDialog(true)
  }

  const handleCategoryEdit = (category) => {
    setCategoryForm({
      name: category.name,
      parent_category_id: category.parent_category_id,
      id: category.id
    })
    setOpenCategoryDialog(true)
  }

  const handleSubCategoryEdit = (subCategory, categoryId) => {
    setSubCategoryForm({
      name: subCategory.name,
      category_id: categoryId,
      category_name: subCategory.category_name || categories.find(c => c.categories.some(cat => cat.id === categoryId))?.categories.find(cat => cat.id === categoryId)?.name || '',
      id: subCategory.id
    })
    setOpenSubCategoryDialog(true)
  }

  const handleParentCategoryDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this parent category?")) return
    setLoading(true)
    try {
      console.log(`[SUBMIT] DELETE ${API_URL}/categories/parent/${id}`)
      const response = await axios.delete(`${API_URL}/categories/parent/${id}`, {
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('[SUBMIT] Response:', response.data)
      await refreshCategories()
      await fetchParentCategories()
      setSuccessMessage('Parent category deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      setExpandedParent(null)
      setError(null)
    } catch (err) {
      const errorMessage = err.response
        ? `Failed to delete parent category: ${err.response.status} ${err.response.data?.message || err.message}`
        : `Failed to delete parent category: Network error (${err.message})`
      console.error(errorMessage, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return
    setLoading(true)
    try {
      console.log(`[SUBMIT] DELETE ${API_URL}/categories/${id}`)
      const response = await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('[SUBMIT] Response:', response.data)
      await refreshCategories()
      await fetchParentCategories()
      setSuccessMessage('Category deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      setExpandedCategory(null)
      setError(null)
    } catch (err) {
      const errorMessage = err.response
        ? `Failed to delete category: ${err.response.status} ${err.response.data?.message || err.message}`
        : `Failed to delete category: Network error (${err.message})`
      console.error(errorMessage, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubCategoryDelete = async (id, categoryId) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return
    setLoading(true)
    try {
      console.log(`[SUBMIT] DELETE ${API_URL}/categories/subcategories/${id}`)
      const response = await axios.delete(`${API_URL}/categories/subcategories/${id}`, {
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('[SUBMIT] Response:', response.data)
      await fetchSubCategories(categoryId)
      await refreshCategories()
      await fetchParentCategories()
      setSuccessMessage('Subcategory deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      setError(null)
    } catch (err) {
      const errorMessage = err.response
        ? `Failed to delete subcategory: ${err.response.status} ${err.response.data?.message || err.message}`
        : `Failed to delete subcategory: Network error (${err.message})`
      console.error(errorMessage, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const filteredParentCategories = parentCategories.filter(pc =>
    pc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 }, bgcolor: '#f5f5f5' }}>
      <Typography variant="h4" fontWeight="bold" color="secondary.main" gutterBottom sx={{ textAlign: 'center' }}>
        Category Management
      </Typography>
      <Collapse in={!!successMessage}>
        <StyledAlert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </StyledAlert>
      </Collapse>
      <Collapse in={!!error || !!contextError}>
        <StyledAlert severity="error" onClose={() => setError(null)}>
          {error || contextError || `Error in category management. Please ensure the backend server is running at ${API_URL} and the /categories/parent endpoint is accessible.`}
        </StyledAlert>
      </Collapse>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <TextField
          label="Search Parent Categories"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: '300px',
            '& .MuiInputBase-root': { borderRadius: '8px' },
            '& .MuiInputLabel-root': { color: 'secondary.main' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'secondary.light' },
              '&:hover fieldset': { borderColor: 'secondary.main' },
            },
          }}
        />
        <StyledAddButton
          startIcon={<Add />}
          onClick={() => setOpenParentCategoryDialog(true)}
        >
          Add Parent Category
        </StyledAddButton>
      </Box>

      <StyledTableContainer component={Paper}>
        <Table>
          <StyledTableHead>
            <TableRow>
              <StyledTableCell />
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Parent Category Code</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {(loading || contextLoading) ? (
              <TableRow>
                <StyledTableCell colSpan={4} align="center">
                  <CircularProgress color="secondary" />
                </StyledTableCell>
              </TableRow>
            ) : filteredParentCategories.length === 0 ? (
              <TableRow>
                <StyledTableCell colSpan={4} align="center">No parent categories found</StyledTableCell>
              </TableRow>
            ) : (
              filteredParentCategories.map((parentCategory) => (
                <>
                  <TableRow key={parentCategory.id} sx={{ '&:hover': { bgcolor: 'grey.100' } }}>
                    <StyledTableCell>
                      <StyledIconButton
                        onClick={() => setExpandedParent(expandedParent === parentCategory.id ? null : parentCategory.id)}
                      >
                        {expandedParent === parentCategory.id ? <ExpandLess /> : <ExpandMore />}
                      </StyledIconButton>
                    </StyledTableCell>
                    <StyledTableCell>{parentCategory.name}</StyledTableCell>
                    <StyledTableCell>{parentCategory.parent_category_code}</StyledTableCell>
                    <StyledTableCell>
                      <StyledIconButton onClick={() => handleParentCategoryEdit(parentCategory)}>
                        <Edit sx={{ color: 'info.main' }} />
                      </StyledIconButton>
                      <StyledIconButton onClick={() => handleParentCategoryDelete(parentCategory.id)}>
                        <Delete sx={{ color: 'error.main' }} />
                      </StyledIconButton>
                    </StyledTableCell>
                  </TableRow>
                  <TableRow>
                    <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                      <Collapse in={expandedParent === parentCategory.id} timeout="auto" unmountOnExit>
                        <Box sx={{ ml: 4, mb: 2 }}>
                          <StyledAddButton
                            startIcon={<Add />}
                            onClick={() => {
                              setCategoryForm({ name: "", parent_category_id: parentCategory.id, id: null })
                              setOpenCategoryDialog(true)
                            }}
                            sx={{ mb: 2 }}
                          >
                            Add Category
                          </StyledAddButton>
                          <StyledTableContainer component={Paper}>
                            <Table>
                              <StyledTableHead>
                                <TableRow>
                                  <StyledTableCell />
                                  <StyledTableCell>Name</StyledTableCell>
                                  <StyledTableCell>Category Code</StyledTableCell>
                                  <StyledTableCell>Actions</StyledTableCell>
                                </TableRow>
                              </StyledTableHead>
                              <TableBody>
                                {parentCategory.categories?.length === 0 ? (
                                  <TableRow>
                                    <StyledTableCell colSpan={4} align="center">No categories found</StyledTableCell>
                                  </TableRow>
                                ) : (
                                  parentCategory.categories?.map((category) => (
                                    <>
                                      <TableRow key={category.id} sx={{ '&:hover': { bgcolor: 'grey.100' } }}>
                                        <StyledTableCell>
                                          <StyledIconButton
                                            onClick={() => {
                                              setExpandedCategory(expandedCategory === category.id ? null : category.id)
                                              if (expandedCategory !== category.id) fetchSubCategories(category.id)
                                            }}
                                          >
                                            {expandedCategory === category.id ? <ExpandLess /> : <ExpandMore />}
                                          </StyledIconButton>
                                        </StyledTableCell>
                                        <StyledTableCell>{category.name}</StyledTableCell>
                                        <StyledTableCell>{category.category_code}</StyledTableCell>
                                        <StyledTableCell>
                                          <StyledIconButton onClick={() => handleCategoryEdit(category)}>
                                            <Edit sx={{ color: 'info.main' }} />
                                          </StyledIconButton>
                                          <StyledIconButton onClick={() => handleCategoryDelete(category.id)}>
                                            <Delete sx={{ color: 'error.main' }} />
                                          </StyledIconButton>
                                        </StyledTableCell>
                                      </TableRow>
                                      <TableRow>
                                        <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                          <Collapse in={expandedCategory === category.id} timeout="auto" unmountOnExit>
                                            <Box sx={{ ml: 4, mb: 2 }}>
                                              <StyledAddButton
                                                startIcon={<Add />}
                                                onClick={() => {
                                                  setSubCategoryForm({ 
                                                    name: "", 
                                                    category_id: category.id, 
                                                    category_name: category.name, 
                                                    id: null 
                                                  })
                                                  setOpenSubCategoryDialog(true)
                                                }}
                                                sx={{ mb: 2 }}
                                              >
                                                Add Subcategory
                                              </StyledAddButton>
                                              <StyledTableContainer component={Paper}>
                                                <Table>
                                                  <StyledTableHead>
                                                    <TableRow>
                                                      <StyledTableCell>Name</StyledTableCell>
                                                      <StyledTableCell>Subcategory Code</StyledTableCell>
                                                      <StyledTableCell>Actions</StyledTableCell>
                                                    </TableRow>
                                                  </StyledTableHead>
                                                  <TableBody>
                                                    {subCategories.length === 0 ? (
                                                      <TableRow>
                                                        <StyledTableCell colSpan={3} align="center">No subcategories found</StyledTableCell>
                                                      </TableRow>
                                                    ) : (
                                                      subCategories.map((subCategory) => (
                                                        <TableRow key={subCategory.id} sx={{ '&:hover': { bgcolor: 'grey.100' } }}>
                                                          <StyledTableCell>{subCategory.name}</StyledTableCell>
                                                          <StyledTableCell>{subCategory.subcategory_code}</StyledTableCell>
                                                          <StyledTableCell>
                                                            <StyledIconButton onClick={() => handleSubCategoryEdit(subCategory, category.id)}>
                                                              <Edit sx={{ color: 'info.main' }} />
                                                            </StyledIconButton>
                                                            <StyledIconButton onClick={() => handleSubCategoryDelete(subCategory.id, category.id)}>
                                                              <Delete sx={{ color: 'error.main' }} />
                                                            </StyledIconButton>
                                                          </StyledTableCell>
                                                        </TableRow>
                                                      ))
                                                    )}
                                                  </TableBody>
                                                </Table>
                                              </StyledTableContainer>
                                            </Box>
                                          </Collapse>
                                        </StyledTableCell>
                                      </TableRow>
                                    </>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </StyledTableContainer>
                        </Box>
                      </Collapse>
                    </StyledTableCell>
                  </TableRow>
                </>
              ))
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      <Dialog open={openParentCategoryDialog} onClose={() => setOpenParentCategoryDialog(false)}>
        <DialogTitle sx={{ bgcolor: 'primary.dark', color: 'white', py: 2 }}>
          {parentCategoryForm.id ? "Edit Parent Category" : "Add Parent Category"}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'grey.50' }}>
          <TextField
            fullWidth
            label="Parent Category Name"
            value={parentCategoryForm.name}
            onChange={(e) => setParentCategoryForm({ ...parentCategoryForm, name: e.target.value })}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{
              mt: 2,
              '& .MuiInputLabel-root': { color: 'secondary.main' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'secondary.light' },
                '&:hover fieldset': { borderColor: 'secondary.main' },
              },
            }}
          />
          <TextField
            fullWidth
            label="Parent Category Code (e.g., M01)"
            value={parentCategoryForm.parent_category_code}
            onChange={(e) => setParentCategoryForm({ ...parentCategoryForm, parent_category_code: e.target.value })}
            error={!!formErrors.parent_category_code}
            helperText={formErrors.parent_category_code || "Enter one uppercase letter followed by two digits (e.g., M01)"}
            sx={{
              mt: 2,
              '& .MuiInputLabel-root': { color: 'secondary.main' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'secondary.light' },
                '&:hover fieldset': { borderColor: 'secondary.main' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'grey.50', py: 2 }}>
          <Button onClick={() => setOpenParentCategoryDialog(false)} color="secondary">Cancel</Button>
          <StyledAddButton
            onClick={handleParentCategorySubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (parentCategoryForm.id ? "Update" : "Add")}
          </StyledAddButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
        <DialogTitle sx={{ bgcolor: 'primary.dark', color: 'white', py: 2 }}>
          {categoryForm.id ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'grey.50' }}>
          <FormControl fullWidth sx={{ mt: 2 }} error={!!formErrors.parent_category_id}>
            <InputLabel sx={{ color: 'secondary.main' }}>Parent Category</InputLabel>
            <Select
              value={categoryForm.parent_category_id}
              onChange={(e) => setCategoryForm({ ...categoryForm, parent_category_id: e.target.value })}
              label="Parent Category"
              disabled={!!categoryForm.id}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'secondary.light' },
                  '&:hover fieldset': { borderColor: 'secondary.main' },
                },
              }}
            >
              <MenuItem value="" disabled>Select Parent Category</MenuItem>
              {parentCategories.map((parentCategory) => (
                <MenuItem key={parentCategory.id} value={parentCategory.id}>{parentCategory.name}</MenuItem>
              ))}
            </Select>
            {formErrors.parent_category_id && <FormHelperText>{formErrors.parent_category_id}</FormHelperText>}
          </FormControl>
          <TextField
            fullWidth
            label="Category Name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{
              mt: 2,
              '& .MuiInputLabel-root': { color: 'secondary.main' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'secondary.light' },
                '&:hover fieldset': { borderColor: 'secondary.main' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'grey.50', py: 2 }}>
          <Button onClick={() => setOpenCategoryDialog(false)} color="secondary">Cancel</Button>
          <StyledAddButton
            onClick={handleCategorySubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (categoryForm.id ? "Update" : "Add")}
          </StyledAddButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openSubCategoryDialog} onClose={() => setOpenSubCategoryDialog(false)}>
        <DialogTitle sx={{ bgcolor: 'primary.dark', color: 'white', py: 2 }}>
          {subCategoryForm.id ? "Edit Subcategory" : "Add Subcategory"}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'grey.50' }}>
          <FormControl fullWidth sx={{ mt: 2 }} error={!!formErrors.category_id}>
            <InputLabel sx={{ color: 'secondary.main' }}>Category</InputLabel>
            <Select
              value={subCategoryForm.category_id}
              onChange={(e) => {
                const selectedCategory = categories.find(c => c.categories.some(cat => cat.id === e.target.value))
                const category = selectedCategory?.categories.find(cat => cat.id === e.target.value)
                setSubCategoryForm({ 
                  ...subCategoryForm, 
                  category_id: e.target.value,
                  category_name: category?.name || ''
                })
              }}
              label="Category"
              disabled={!!subCategoryForm.id}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'secondary.light' },
                  '&:hover fieldset': { borderColor: 'secondary.main' },
                },
              }}
            >
              <MenuItem value="" disabled>Select Category</MenuItem>
              {categories.map((parentCategory) => (
                parentCategory.categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name} ({parentCategory.name})
                  </MenuItem>
                ))
              ))}
            </Select>
            {formErrors.category_id && <FormHelperText>{formErrors.category_id}</FormHelperText>}
          </FormControl>
          <TextField
            fullWidth
            label="Subcategory Name"
            value={subCategoryForm.name}
            onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{
              mt: 2,
              '& .MuiInputLabel-root': { color: 'secondary.main' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'secondary.light' },
                '&:hover fieldset': { borderColor: 'secondary.main' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'grey.50', py: 2 }}>
          <Button onClick={() => setOpenSubCategoryDialog(false)} color="secondary">Cancel</Button>
          <StyledAddButton
            onClick={handleSubCategorySubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (subCategoryForm.id ? "Update" : "Add")}
          </StyledAddButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}