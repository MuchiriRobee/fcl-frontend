"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Collapse,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
} from "@mui/material"
import { Edit, Delete, Visibility, Add, ExpandMore, ExpandLess } from "@mui/icons-material"

export default function CategoryManagement({ onCategoriesChange }) {
  const [categories, setCategories] = useState([])
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [subCategoryDialog, setSubCategoryDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState(null)
  const [formData, setFormData] = useState({ name: "", description: "", parentCategory: "" })
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [expandedRows, setExpandedRows] = useState({})
  const [loading, setLoading] = useState(false)

  // Base API URL from .env
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  // Ref to track previous categories to avoid redundant updates
  const prevCategoriesRef = useRef(categories)

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      console.log('Fetching categories from:', `${API_URL}/categories`);
      const response = await fetch(`${API_URL}/categories`, {
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if required: 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch categories')
      }
      const data = await response.json()
      console.log('Fetched categories:', data);
      // Only update if data has changed
      if (JSON.stringify(data) !== JSON.stringify(categories)) {
        setCategories(data || [])
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      setErrorMessage(`Error: ${error.message}`)
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setLoading(false)
    }
  }, [API_URL])

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Notify parent when categories change
  useEffect(() => {
    if (onCategoriesChange && JSON.stringify(categories) !== JSON.stringify(prevCategoriesRef.current)) {
      console.log('Notifying parent with categories:', categories);
      onCategoriesChange(categories)
      prevCategoriesRef.current = categories
    }
  }, [categories, onCategoriesChange])

  const handleOpenCategoryDialog = (category = null) => {
    setEditMode(!!category)
    setSelectedCategory(category)
    setFormData({
      name: category ? category.name || "" : "",
      description: category ? category.description || "" : "",
      parentCategory: "",
    })
    setCategoryDialog(true)
  }

  const handleOpenSubCategoryDialog = (category = null, subCategory = null) => {
    setEditMode(!!subCategory)
    setSelectedCategory(category)
    setSelectedSubCategory(subCategory)
    setFormData({
      name: subCategory ? subCategory.name || "" : "",
      description: subCategory ? subCategory.description || "" : "",
      parentCategory: category ? category.id : subCategory ? subCategory.category_id : "",
    })
    setSubCategoryDialog(true)
  }

  const handleCloseDialog = () => {
    setCategoryDialog(false)
    setSubCategoryDialog(false)
    setFormData({ name: "", description: "", parentCategory: "" })
    setSelectedCategory(null)
    setSelectedSubCategory(null)
    setEditMode(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      setErrorMessage("Category name is required")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }
    if (formData.name.length > 255) {
      setErrorMessage("Category name must be less than 255 characters")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }
    if (formData.description && formData.description.length > 1000) {
      setErrorMessage("Description must be less than 1000 characters")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }

    setLoading(true)
    try {
      const url = editMode
        ? `${API_URL}/categories/${selectedCategory?.id}`
        : `${API_URL}/categories`
      const method = editMode ? 'PUT' : 'POST'
      console.log('Saving category:', { url, method, data: formData });
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if required
        },
        body: JSON.stringify({ name: formData.name.trim(), description: formData.description.trim() || null }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save category')
      }
      console.log('Saved category:', data);

      if (editMode) {
        setCategories(categories.map((cat) => (cat.id === selectedCategory?.id ? data : cat)))
      } else {
        setCategories([...categories, data])
      }
      setSuccessMessage(editMode ? "Category updated successfully" : "Category added successfully")
      handleCloseDialog()
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error('Save category error:', error);
      setErrorMessage(`Error: ${error.message}`)
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSubCategory = async () => {
    if (!formData.name.trim()) {
      setErrorMessage("Subcategory name is required")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }
    if (!formData.parentCategory) {
      setErrorMessage("Parent category is required")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }
    if (formData.name.length > 255) {
      setErrorMessage("Subcategory name must be less than 255 characters")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }
    if (formData.description && formData.description.length > 1000) {
      setErrorMessage("Description must be less than 1000 characters")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }

    setLoading(true)
    try {
      const url = editMode
        ? `${API_URL}/categories/subcategories/${selectedSubCategory?.id}`
        : `${API_URL}/categories/subcategories`
      const method = editMode ? 'PUT' : 'POST'
      console.log('Saving subcategory:', { url, method, data: formData });
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if required
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category_id: Number(formData.parentCategory),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save subcategory')
      }
      console.log('Saved subcategory:', data);

      setCategories(categories.map((cat) => {
        if (cat.id === Number(formData.parentCategory)) {
          let updatedSubCategories
          if (editMode && selectedSubCategory?.category_id === cat.id) {
            updatedSubCategories = (cat.subcategories || []).map((sub) =>
              sub.id === selectedSubCategory.id ? data : sub
            )
          } else {
            updatedSubCategories = editMode
              ? cat.subcategories || []
              : [...(cat.subcategories || []), data]
          }
          return { ...cat, subcategories: updatedSubCategories }
        }
        if (editMode && selectedSubCategory?.category_id === cat.id) {
          return {
            ...cat,
            subcategories: (cat.subcategories || []).filter((sub) => sub.id !== selectedSubCategory.id),
          }
        }
        return cat
      }))
      setSuccessMessage(editMode ? "Subcategory updated successfully" : "Subcategory added successfully")
      handleCloseDialog()
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error('Save subcategory error:', error);
      setErrorMessage(`Error: ${error.message}`)
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? All subcategories will also be deleted.")) {
      return
    }
    setLoading(true)
    try {
      console.log('Deleting category:', categoryId);
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          // Add Authorization header if required
        },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete category')
      }
      console.log('Deleted category:', categoryId);
      setCategories(categories.filter((cat) => cat.id !== categoryId))
      setSuccessMessage("Category deleted successfully")
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error('Delete category error:', error);
      setErrorMessage(`Error: ${error.message}`)
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubCategory = async (categoryId, subCategoryId) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) {
      return
    }
    setLoading(true)
    try {
      console.log('Deleting subcategory:', subCategoryId);
      const response = await fetch(`${API_URL}/categories/subcategories/${subCategoryId}`, {
        method: 'DELETE',
        headers: {
          // Add Authorization header if required
        },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete subcategory')
      }
      console.log('Deleted subcategory:', subCategoryId);
      setCategories(categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            subcategories: (cat.subcategories || []).filter((sub) => sub.id !== subCategoryId),
          }
        }
        return cat
      }))
      setSuccessMessage("Subcategory deleted successfully")
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error('Delete subcategory error:', error);
      setErrorMessage(`Error: ${error.message}`)
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  const toggleRowExpansion = (categoryId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  if (errorMessage && !categories.length && !loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Failed to load categories
        </Typography>
        <Button
          variant="contained"
          onClick={fetchCategories}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      {/* Header with Action Buttons */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>
          Product Categories
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Manage your product categories and subcategories for better organization
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenCategoryDialog()}
            disabled={loading}
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
            Add New Category
          </Button>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => handleOpenSubCategoryDialog()}
            disabled={loading}
            sx={{
              borderColor: "#1976d2",
              color: "#1976d2",
              "&:hover": {
                borderColor: "#1565c0",
                bgcolor: "rgba(25, 118, 210, 0.04)",
              },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Add New SubCategory
          </Button>
        </Box>
      </Box>

      {/* Success and Error Messages */}
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

      {/* Categories Table */}
      <Paper sx={{ overflow: "hidden", borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#333", width: "5%" }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#333", width: "30%" }}>
                  Category Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#333", width: "15%" }}>
                  Total Products
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#333", width: "15%" }}>
                  Stock Quantity
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#333", width: "20%" }}>
                  Subcategories
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#333", width: "15%" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : !categories.length ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>No categories found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => (
                  <React.Fragment key={category.id}>
                    <TableRow hover sx={{ "&:hover": { bgcolor: "#f8f9fa" } }}>
                      <TableCell sx={{ fontWeight: 500 }}>{index + 1}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" sx={{ color: "#1976d2", fontWeight: 600, mb: 0.5 }}>
                            {category.name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {category.description || 'No description'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={category.total_products ?? 0}
                          size="small"
                          sx={{
                            bgcolor: "#e3f2fd",
                            color: "#1976d2",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={category.stock_quantity ?? 0}
                          size="small"
                          sx={{
                            bgcolor: "#e8f5e8",
                            color: "#2e7d32",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {(category.subcategories || []).length} subcategories
                          </Typography>
                          {(category.subcategories || []).length > 0 && (
                            <IconButton
                              size="small"
                              onClick={() => toggleRowExpansion(category.id)}
                              sx={{ ml: 1 }}
                            >
                              {expandedRows[category.id] ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => toggleRowExpansion(category.id)}
                            disabled={(category.subcategories || []).length === 0}
                            sx={{
                              bgcolor: "#4caf50",
                              "&:hover": { bgcolor: "#45a049" },
                              minWidth: "auto",
                              px: 1.5,
                              py: 0.5,
                              fontSize: "0.75rem",
                              textTransform: "none",
                            }}
                            startIcon={<Visibility sx={{ fontSize: "14px" }} />}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenCategoryDialog(category)}
                            sx={{
                              bgcolor: "#ff9800",
                              "&:hover": { bgcolor: "#f57c00" },
                              minWidth: "auto",
                              px: 1.5,
                              py: 0.5,
                              fontSize: "0.75rem",
                              textTransform: "none",
                            }}
                            startIcon={<Edit sx={{ fontSize: "14px" }} />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleDeleteCategory(category.id)}
                            sx={{
                              bgcolor: "#f44336",
                              "&:hover": { bgcolor: "#d32f2f" },
                              minWidth: "auto",
                              px: 1,
                              py: 0.5,
                              fontSize: "0.75rem",
                            }}
                          >
                            <Delete sx={{ fontSize: "14px" }} />
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                    {expandedRows[category.id] && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Box sx={{ pl: 4, pr: 2, py: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2 }}>
                              Subcategories
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ bgcolor: "#f1f3f5" }}>
                                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {(category.subcategories || []).map((sub, subIndex) => (
                                  <TableRow key={sub.id} hover>
                                    <TableCell>{subIndex + 1}</TableCell>
                                    <TableCell>{sub.name || 'N/A'}</TableCell>
                                    <TableCell>{sub.description || 'No description'}</TableCell>
                                    <TableCell>
                                      <Button
                                        size="small"
                                        variant="text"
                                        onClick={() => handleOpenSubCategoryDialog(category, sub)}
                                        sx={{ color: "#ff9800", mr: 1 }}
                                        startIcon={<Edit />}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="text"
                                        onClick={() => handleDeleteSubCategory(category.id, sub.id)}
                                        sx={{ color: "#f44336" }}
                                        startIcon={<Delete />}
                                      >
                                        Delete
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {editMode ? "Edit Category" : "Add New Product Category"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                name="name"
                placeholder="Enter category name"
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                required
                error={formData.name.trim() === "" && errorMessage.includes("name")}
                helperText={
                  formData.name.trim() === "" && errorMessage.includes("name") ? errorMessage : ""
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                placeholder="Enter category description"
                variant="outlined"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                error={formData.description.length > 1000 && errorMessage.includes("description")}
                helperText={
                  formData.description.length > 1000 && errorMessage.includes("description")
                    ? errorMessage
                    : ""
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={loading}
            sx={{
              textTransform: "none",
              color: "#666",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
              textTransform: "none",
              px: 4,
              fontWeight: 600,
            }}
          >
            {loading ? "Saving..." : editMode ? "Update Category" : "Add Category"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subCategoryDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {editMode ? "Edit Subcategory" : "Add New SubCategory"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subcategory Name"
                name="name"
                placeholder="Enter subcategory name"
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                required
                error={formData.name.trim() === "" && errorMessage.includes("name")}
                helperText={
                  formData.name.trim() === "" && errorMessage.includes("name") ? errorMessage : ""
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                placeholder="Enter subcategory description"
                variant="outlined"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                error={formData.description.length > 1000 && errorMessage.includes("description")}
                helperText={
                  formData.description.length > 1000 && errorMessage.includes("description")
                    ? errorMessage
                    : ""
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl
                fullWidth
                required
                error={formData.parentCategory === "" && errorMessage.includes("Parent category")}
              >
                <Select
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleInputChange}
                  displayEmpty
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="">
                    <em>Select Parent Category</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name || 'N/A'}
                    </MenuItem>
                  ))}
                </Select>
                {formData.parentCategory === "" && errorMessage.includes("Parent category") && (
                  <Typography variant="caption" color="error">
                    {errorMessage}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={loading}
            sx={{
              textTransform: "none",
              color: "#666",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSubCategory}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
              textTransform: "none",
              px: 4,
              fontWeight: 600,
            }}
          >
            {loading ? "Saving..." : editMode ? "Update Subcategory" : "Add Subcategory"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}