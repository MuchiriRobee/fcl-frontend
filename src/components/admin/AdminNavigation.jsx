"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import axios from "axios"
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
  Popper,
  Paper,
  ClickAwayListener,
  Grow,
  MenuList,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  Dashboard,
  ShoppingCart,
  Category as CategoryIcon,
  AttachMoney as SalesIcon,
  Inventory,
  LocalShipping as SuppliersIcon,
  People,
  AccountCircle,
  Settings,
  ExitToApp,
  List as ListIcon,
  KeyboardArrowDown,
  Visibility as ViewIcon,
  Store as StoreIcon,
  ListAlt as ListAltIcon,
  Receipt as GRNIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

// Clean, modern admin navigation button with white text on blue background
const AdminNavButton = styled(Button)(({ theme, active }) => ({
  color: active ? "#ffffff" : "rgba(255,255,255,0.8)",
  backgroundColor: active ? "rgba(255,255,255,0.15)" : "transparent",
  textTransform: "none",
  fontSize: "0.8rem",
  fontWeight: active ? 600 : 500,
  fontFamily: "'Poppins', sans-serif",
  padding: "6px 12px",
  borderRadius: "6px",
  minWidth: "auto",
  margin: "0 2px",
  height: "36px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "#ffffff",
  },
  "& .MuiButton-startIcon": {
    marginRight: "4px",
  },
  "& .MuiButton-endIcon": {
    marginLeft: "2px",
  },
}))

// Clean dropdown paper with no borders
const StyledDropdownPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: "white",
  color: "#333",
  minWidth: 180,
  maxWidth: 240,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  borderRadius: "8px",
  fontFamily: "'Poppins', sans-serif",
  marginTop: "8px",
  overflow: "hidden",
  zIndex: 99999,
}))

// Clean menu item with no borders
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontFamily: "'Poppins', sans-serif",
  fontSize: "0.875rem",
  fontWeight: 500,
  padding: "10px 16px",
  transition: "all 0.15s ease",
  "&:hover": {
    backgroundColor: "#f5f5f5",
    color: "#1976d2",
  },
  "& .MuiListItemIcon-root": {
    minWidth: "32px",
    color: "inherit",
  },
  "& .MuiListItemText-primary": {
    fontWeight: 500,
    fontSize: "0.875rem",
  },
  "& .MuiListItemText-secondary": {
    fontSize: "0.75rem",
    color: "#666",
  },
}))

const AdminNavigation = ({
  currentUser,
  onLogout,
  activeTab,
  onTabChange,
  onDirectNavigation,
  onCRUDOperation,
  activeComponent,
}) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // State management for dropdowns, menus, and modal
  const [anchorEl, setAnchorEl] = useState(null)
  const [dropdownStates, setDropdownStates] = useState({
    sales: false,
    grn: false,
    categories: false,
    suppliers: false,
  })
  const [categoryData, setCategoryData] = useState([])
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [supplierData, setSupplierData] = useState([])
  const [supplierLoading, setSupplierLoading] = useState(false)
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    telephone: "",
    telephone2: "",
    contact_name: "",
    contact_name2: "",
    office: "",
    floor: "",
    building_name: "",
    street_name: "",
    city: "",
    postal_address: "",
    kra_number: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [formLoading, setFormLoading] = useState(false)
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })
  const isMenuOpen = Boolean(anchorEl)

  // Refs for dropdown positioning
  const dropdownRefs = {
    sales: useRef(null),
    grn: useRef(null),
    categories: useRef(null),
    suppliers: useRef(null),
  }

  // Enhanced dropdown handlers
  const handleDropdownToggle = useCallback((section, isOpen) => {
    console.log(`🔄 Dropdown ${section}: ${isOpen ? "OPENING" : "CLOSING"}`)
    setDropdownStates((prev) => ({
      ...prev,
      [section]: isOpen,
    }))
  }, [])

  const handleDropdownClose = useCallback((section) => {
    setDropdownStates((prev) => ({
      ...prev,
      [section]: false,
    }))
  }, [])

  const handleAllDropdownsClose = useCallback(() => {
    setDropdownStates({
      sales: false,
      grn: false,
      categories: false,
      suppliers: false,
    })
  }, [])

  // Enhanced direct navigation handler
  const handleDirectComponentNavigation = useCallback(
    (componentName, tabIndex, section, data = null) => {
      console.log(`🎯 Direct navigation to: ${componentName} in tab ${tabIndex}`)
      handleAllDropdownsClose()
      if (onDirectNavigation) {
        onDirectNavigation(componentName, tabIndex)
      }
      if (onCRUDOperation) {
        onCRUDOperation("read", section, data)
      }
      console.log(`✅ Navigation completed for ${componentName}`)
    },
    [onDirectNavigation, onCRUDOperation, handleAllDropdownsClose],
  )

  // Profile menu handlers
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    if (onLogout) onLogout()
  }

  const handleNavigateHome = () => {
    navigate("/")
  }

  const handleTabClick = (tabIndex) => {
    console.log(`🎯 Direct tab click: ${tabIndex}`)
    handleAllDropdownsClose()
    onTabChange(null, tabIndex)
  }

  // Check if a tab or component is active
  const isTabActive = (tabIndex, componentName = null) => {
    if (componentName && activeComponent === componentName) {
      return true
    }
    return activeTab === tabIndex && !activeComponent
  }

  // Clean dropdown renderer with direct navigation
  const renderCRUDDropdown = (section, isOpen, anchorRef, items) => (
    <Popper
      open={isOpen}
      anchorEl={anchorRef.current}
      placement="bottom-start"
      transition
      disablePortal={false}
      sx={{
        zIndex: 99999,
      }}
      modifiers={[
        {
          name: "offset",
          options: {
            offset: [0, 4],
          },
        },
      ]}
    >
      {({ TransitionProps }) => (
        <Grow {...TransitionProps} timeout={200}>
          <StyledDropdownPaper elevation={4}>
            <ClickAwayListener onClickAway={() => handleDropdownClose(section)}>
              <MenuList autoFocusItem={isOpen} id={`${section}-menu`} sx={{ py: 0.5 }}>
                {items.map((item, index) => (
                  <StyledMenuItem
                    key={`${section}-${index}`}
                    onClick={() => {
                      console.log(`🖱️ Dropdown item clicked: ${item.label} in ${section}`)
                      handleDirectComponentNavigation(item.componentName, item.tabIndex, section, item.data)
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} secondary={item.description} />
                  </StyledMenuItem>
                ))}
              </MenuList>
            </ClickAwayListener>
          </StyledDropdownPaper>
        </Grow>
      )}
    </Popper>
  )

  // Fetch categories data
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

  const fetchCategories = useCallback(async () => {
    setCategoryLoading(true)
    try {
      console.log(`[FETCH] GET ${API_URL}/categories`)
      const response = await axios.get(`${API_URL}/categories`, {
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('[FETCH] Categories response:', response.data)
      setCategoryData(response.data || [])
    } catch (err) {
      console.error('[FETCH] Failed to fetch categories:', err)
    } finally {
      setCategoryLoading(false)
    }
  }, [])

  // Fetch suppliers data
  const fetchSuppliers = useCallback(async () => {
    setSupplierLoading(true)
    try {
      console.log(`[FETCH] GET ${API_URL}/suppliers`)
      const response = await axios.get(`${API_URL}/suppliers`, {
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('[FETCH] Suppliers response:', response.data)
      setSupplierData(response.data || [])
    } catch (err) {
      console.error('[FETCH] Failed to fetch suppliers:', err)
    } finally {
      setSupplierLoading(false)
    }
  }, [])

  // Validate supplier form
  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = "Supplier name is required"
    if (!formData.email.trim()) errors.email = "Email is required"
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Invalid email format (e.g., user@domain.com)"
    if (!formData.telephone.trim()) errors.telephone = "Primary telephone is required"
    else if (!/^07\d{8}$/.test(formData.telephone)) errors.telephone = "Telephone must be 10 digits starting with 07 (e.g., 0712345678)"
    if (formData.telephone2 && !/^07\d{8}$/.test(formData.telephone2)) errors.telephone2 = "Secondary telephone must be 10 digits starting with 07 (e.g., 0712345678)"
    if (!formData.contact_name.trim()) errors.contact_name = "Primary contact name is required"
    if (!formData.office.trim()) errors.office = "Office is required"
    if (!formData.street_name.trim()) errors.street_name = "Street name is required"
    if (!formData.city.trim()) errors.city = "City is required"
    if (!formData.postal_address.trim()) errors.postal_address = "Postal address/code is required"
    if (!formData.kra_number.trim()) errors.kra_number = "KRA Number is required"
    else if (!/^[A-Za-z0-9]+$/.test(formData.kra_number)) errors.kra_number = "KRA Number must be alphanumeric"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setFormLoading(true)
    try {
      const response = await axios.post(`${API_URL}/suppliers`, formData, {
        headers: { "Content-Type": "application/json" },
      })
      setSupplierData((prev) => [...prev, response.data])
      setNotification({
        open: true,
        message: "Supplier added successfully!",
        severity: "success",
      })
      resetForm()
      setIsAddSupplierModalOpen(false)
    } catch (error) {
      setNotification({
        open: true,
        message: `Error: ${error.response?.data?.message || error.message}`,
        severity: "error",
      })
    } finally {
      setFormLoading(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      telephone: "",
      telephone2: "",
      contact_name: "",
      contact_name2: "",
      office: "",
      floor: "",
      building_name: "",
      street_name: "",
      city: "",
      postal_address: "",
      kra_number: "",
    })
    setFormErrors({})
  }

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  // Load categories and suppliers on component mount and when respective tabs are active
  useEffect(() => {
    if (activeTab === 2 || activeComponent === "CategoryManagement") {
      fetchCategories()
    }
    if (activeTab === 5 || activeComponent === "SupplierManagement") {
      fetchSuppliers()
    }
  }, [activeTab, activeComponent, fetchCategories, fetchSuppliers])

  // Nested dropdown component for categories
  const NestedMenuItem = ({ label, icon, children, onClick }) => {
    const [open, setOpen] = useState(false)
    const anchorRef = useRef(null)

    return (
      <Box
        sx={{ position: 'relative' }}
        ref={anchorRef}
        onClick={() => {
          setOpen((prev) => !prev)
          if (onClick) onClick()
        }}
        onMouseEnter={children ? () => setOpen(true) : undefined}
        onMouseLeave={children ? () => setOpen(false) : undefined}
      >
        <StyledMenuItem>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={label} />
          {children && <KeyboardArrowDown sx={{ fontSize: 16, ml: 1 }} />}
        </StyledMenuItem>
        {children && open && (
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            placement="right-start"
            transition
            sx={{ zIndex: 100000 }}
            modifiers={[{ name: 'offset', options: { offset: [0, 0] } }]}
          >
            {({ TransitionProps }) => (
              <Grow {...TransitionProps} timeout={200}>
                <StyledDropdownPaper elevation={4}>
                  <ClickAwayListener onClickAway={() => setOpen(false)}>
                    <MenuList sx={{ py: 0.5, maxHeight: '200px', overflowY: 'auto' }}>
                      {children}
                    </MenuList>
                  </ClickAwayListener>
                </StyledDropdownPaper>
              </Grow>
            )}
          </Popper>
        )}
      </Box>
    )
  }

  // Render category dropdown with nested structure
  const renderCategoryDropdown = (section, isOpen, anchorRef) => (
    <Popper
      open={isOpen}
      anchorEl={anchorRef.current}
      placement="bottom-start"
      transition
      disablePortal={false}
      sx={{ zIndex: 99999 }}
      modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
    >
      {({ TransitionProps }) => (
        <Grow {...TransitionProps} timeout={200}>
          <StyledDropdownPaper elevation={4}>
            <ClickAwayListener onClickAway={() => handleDropdownClose(section)}>
              <MenuList autoFocusItem={isOpen} id={`${section}-menu`} sx={{ py: 0.5, maxHeight: '200px', overflowY: 'auto' }}>
                {categoryLoading ? (
                  <StyledMenuItem disabled>
                    <ListItemText primary="Loading categories..." />
                  </StyledMenuItem>
                ) : categoryData.length === 0 ? (
                  <StyledMenuItem disabled>
                    <ListItemText primary="No parent categories found" />
                  </StyledMenuItem>
                ) : (
                  categoryData.map((parentCategory) => (
                    <NestedMenuItem
                      key={parentCategory.id}
                      label={parentCategory.name}
                      icon={<CategoryIcon sx={{ color: '#1976d2', fontSize: 18 }} />}
                      onClick={() => handleDirectComponentNavigation("CategoryManagement", 2, "categories", { type: "category", parentCategoryId: parentCategory.id })}
                    >
                      {parentCategory.categories?.map((category) => (
                        <NestedMenuItem
                          key={category.id}
                          label={category.name}
                          icon={<ListIcon sx={{ color: '#2196f3', fontSize: 18 }} />}
                          onClick={() => handleDirectComponentNavigation("CategoryManagement", 2, "categories", { type: "category", categoryId: category.id })}
                        >
                          {category.subcategories?.map((subCategory) => (
                            <NestedMenuItem
                              key={subCategory.id}
                              label={subCategory.name}
                              icon={<ListAltIcon sx={{ color: '#4caf50', fontSize: 18 }} />}
                              onClick={() => handleDirectComponentNavigation("ManageItems", 1, "itemMaster", { type: "item", subCategoryId: subCategory.id })}
                            >
                              {subCategory.products?.length > 0 ? (
                                subCategory.products.map((product) => (
                                  <StyledMenuItem
                                    key={product.id}
                                    onClick={() => handleDirectComponentNavigation("ManageItems", 1, "itemMaster", { productId: product.id })}
                                    sx={{ pl: 4 }}
                                  >
                                    <ListItemIcon>
                                      <ShoppingCart sx={{ color: '#ff9800', fontSize: 18 }} />
                                    </ListItemIcon>
                                    <ListItemText primary={product.product_name} />
                                  </StyledMenuItem>
                                ))
                              ) : (
                                <StyledMenuItem disabled sx={{ pl: 4 }}>
                                  <ListItemText primary="No products" />
                                </StyledMenuItem>
                              )}
                            </NestedMenuItem>
                          ))}
                        </NestedMenuItem>
                      ))}
                    </NestedMenuItem>
                  ))
                )}
              </MenuList>
            </ClickAwayListener>
          </StyledDropdownPaper>
        </Grow>
      )}
    </Popper>
  )

  // Render supplier dropdown
  const renderSupplierDropdown = (section, isOpen, anchorRef) => (
    <Popper
      open={isOpen}
      anchorEl={anchorRef.current}
      placement="bottom-start"
      transition
      disablePortal={false}
      sx={{ zIndex: 99999 }}
      modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
    >
      {({ TransitionProps }) => (
        <Grow {...TransitionProps} timeout={200}>
          <StyledDropdownPaper elevation={4}>
            <ClickAwayListener onClickAway={() => handleDropdownClose(section)}>
              <MenuList autoFocusItem={isOpen} id={`${section}-menu`} sx={{ py: 0.5, maxHeight: '200px', overflowY: 'auto' }}>
                <StyledMenuItem
                  onClick={() => {
                    handleDropdownClose(section)
                    setIsAddSupplierModalOpen(true)
                  }}
                >
                  <ListItemIcon>
                    <AddIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="Add Supplier" />
                </StyledMenuItem>
                {supplierLoading ? (
                  <StyledMenuItem disabled>
                    <ListItemText primary="Loading suppliers..." />
                  </StyledMenuItem>
                ) : supplierData.length === 0 ? (
                  <StyledMenuItem disabled>
                    <ListItemText primary="No suppliers found" />
                  </StyledMenuItem>
                ) : (
                  supplierData.map((supplier) => (
                    <StyledMenuItem
                      key={supplier.id}
                      onClick={() => handleDirectComponentNavigation("SupplierManagement", 5, "suppliers", { type: "supplier", id: supplier.id })}
                    >
                      <ListItemIcon>
                        <SuppliersIcon sx={{ color: '#2196f3', fontSize: 18 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={supplier.name}
                        secondary={`Code: ${ supplier.code }`}
                      />
                    </StyledMenuItem>
                  ))
                )}
              </MenuList>
            </ClickAwayListener>
          </StyledDropdownPaper>
        </Grow>
      )}
    </Popper>
  )

  // Add Supplier Modal
  const renderAddSupplierModal = (
    <Dialog
      open={isAddSupplierModalOpen}
      onClose={() => {
        resetForm()
        setIsAddSupplierModalOpen(false)
      }}
      maxWidth="md"
      fullWidth
      sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
        Add New Supplier
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleFormSubmit} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 2 }}>
          <TextField
            label="Supplier Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!formErrors.name}
            helperText={formErrors.name}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={!!formErrors.email}
            helperText={formErrors.email}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Primary Telephone (e.g., 0712345678)"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            error={!!formErrors.telephone}
            helperText={formErrors.telephone}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Secondary Telephone (e.g., 0712345678)"
            value={formData.telephone2}
            onChange={(e) => setFormData({ ...formData, telephone2: e.target.value })}
            error={!!formErrors.telephone2}
            helperText={formErrors.telephone2}
            fullWidth
            size="small"
          />
          <TextField
            label="Primary Contact Name"
            value={formData.contact_name}
            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
            error={!!formErrors.contact_name}
            helperText={formErrors.contact_name}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Secondary Contact Name"
            value={formData.contact_name2}
            onChange={(e) => setFormData({ ...formData, contact_name2: e.target.value })}
            error={!!formErrors.contact_name2}
            helperText={formErrors.contact_name2}
            fullWidth
            size="small"
          />
          <TextField
            label="Office Number"
            value={formData.office}
            onChange={(e) => setFormData({ ...formData, office: e.target.value })}
            error={!!formErrors.office}
            helperText={formErrors.office}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Floor Number"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            error={!!formErrors.floor}
            helperText={formErrors.floor}
            fullWidth
            size="small"
          />
          <TextField
            label="Building Name"
            value={formData.building_name}
            onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
            error={!!formErrors.building_name}
            helperText={formErrors.building_name}
            fullWidth
            size="small"
          />
          <TextField
            label="Street Name"
            value={formData.street_name}
            onChange={(e) => setFormData({ ...formData, street_name: e.target.value })}
            error={!!formErrors.street_name}
            helperText={formErrors.street_name}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            error={!!formErrors.city}
            helperText={formErrors.city}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Postal Address/Code"
            value={formData.postal_address}
            onChange={(e) => setFormData({ ...formData, postal_address: e.target.value })}
            error={!!formErrors.postal_address}
            helperText={formErrors.postal_address}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="KRA Number (e.g., A123456789B)"
            value={formData.kra_number}
            onChange={(e) => setFormData({ ...formData, kra_number: e.target.value })}
            error={!!formErrors.kra_number}
            helperText={formErrors.kra_number}
            fullWidth
            size="small"
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            resetForm()
            setIsAddSupplierModalOpen(false)
          }}
          sx={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={formLoading}
          onClick={handleFormSubmit}
          sx={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {formLoading ? <CircularProgress size={24} /> : "Add Supplier"}
        </Button>
      </DialogActions>
    </Dialog>
  )

  // Notification
  const renderNotification = (
    <Snackbar
      open={notification.open}
      autoHideDuration={4000}
      onClose={handleCloseNotification}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={handleCloseNotification}
        severity={notification.severity}
        sx={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  )

  // Profile menu renderer
  const menuId = "primary-search-account-menu"
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      sx={{
        "& .MuiPaper-root": {
          fontFamily: "'Poppins', sans-serif",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        },
      }}
    >
      <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "'Poppins', sans-serif", py: 1.5 }}>
        <AccountCircle sx={{ mr: 2, color: "#2196f3" }} />
        Profile Settings
      </MenuItem>
      <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "'Poppins', sans-serif", py: 1.5 }}>
        <Settings sx={{ mr: 2, color: "#ff9800" }} />
        Admin Settings
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ fontFamily: "'Poppins', sans-serif", py: 1.5, color: "#f44336" }}>
        <ExitToApp sx={{ mr: 2 }} />
        Logout
      </MenuItem>
    </Menu>
  )

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "#2b044bff",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 1, sm: 2, md: 3 },
          minHeight: "56px !important",
          height: "56px",
        }}
      >
        {/* Main navigation items in a single row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {/* Dashboard */}
          <AdminNavButton
            startIcon={<Dashboard sx={{ fontSize: 18 }} />}
            active={isTabActive(0)}
            onClick={() => handleTabClick(0)}
          >
            Dashboard
          </AdminNavButton>

          {/* Suppliers Dropdown */}
          <Box
            ref={dropdownRefs.suppliers}
            onMouseEnter={() => handleDropdownToggle("suppliers", true)}
            onMouseLeave={() => handleDropdownToggle("suppliers", false)}
            sx={{ position: "relative" }}
          >
            <AdminNavButton
              startIcon={<SuppliersIcon sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={isTabActive(5) || activeComponent === "SupplierManagement"}
              onClick={() => handleDirectComponentNavigation("SupplierManagement", 5, "suppliers", { type: "supplier" })}
            >
              Suppliers
            </AdminNavButton>
            {renderSupplierDropdown("suppliers", dropdownStates.suppliers, dropdownRefs.suppliers)}
          </Box>

          <Box
            ref={dropdownRefs.categories}
            onMouseEnter={() => handleDropdownToggle("categories", true)}
            onMouseLeave={() => handleDropdownToggle("categories", false)}
            sx={{ position: "relative" }}
          >
            <AdminNavButton
              startIcon={<CategoryIcon sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={isTabActive(2) || activeComponent === "CategoryManagement"}
              onClick={() => handleDirectComponentNavigation("CategoryManagement", 2, "categories", { type: "category" })}
            >
              Parent Categories
            </AdminNavButton>
            {renderCategoryDropdown("categories", dropdownStates.categories, dropdownRefs.categories)}
          </Box>

          {/* Item Master - Direct to ManageItems */}
          <AdminNavButton
            startIcon={<ShoppingCart sx={{ fontSize: 18 }} />}
            active={isTabActive(1) || activeComponent === "ManageItems"}
            onClick={() => handleDirectComponentNavigation("ManageItems", 1, "itemMaster", { type: "item" })}
          >
            Item Master
          </AdminNavButton>

          {/* Sales Agents Button */}
          <AdminNavButton
            startIcon={<People sx={{ fontSize: 18 }} />}
            active={isTabActive(6) || activeComponent === "SalesAgentManagement"}
            onClick={() => handleDirectComponentNavigation("SalesAgentManagement", 6, "agents", { type: "agent" })}
          >
            Sales Agents
          </AdminNavButton>

          {/* Customers Button */}
          <AdminNavButton
            startIcon={<People sx={{ fontSize: 18 }} />}
            active={isTabActive(7) || activeComponent === "CustomerManagement"}
            onClick={() => handleDirectComponentNavigation("CustomerManagement", 7, "customers", { type: "customer" })}
          >
            Customers
          </AdminNavButton>

          {/* Sales Dropdown */}
          <Box
            ref={dropdownRefs.sales}
            onMouseEnter={() => handleDropdownToggle("sales", true)}
            onMouseLeave={() => handleDropdownToggle("sales", false)}
            sx={{ position: "relative" }}
          >
            <AdminNavButton
              startIcon={<SalesIcon sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={
                isTabActive(3) || activeComponent === "OrdersManagement" || activeComponent === "InvoiceManagement"
              }
            >
              Sales
            </AdminNavButton>
            {renderCRUDDropdown("sales", dropdownStates.sales, dropdownRefs.sales, [
              {
                label: "Orders",
                description: "Customer orders management",
                icon: <ListAltIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
                componentName: "OrdersManagement",
                tabIndex: 3,
                data: { type: "orders" },
              },
              {
                label: "Invoices",
                description: "Invoice management",
                icon: <ViewIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                componentName: "InvoiceManagement",
                tabIndex: 3,
                data: { type: "invoices" },
              },
            ])}
          </Box>

          {/* GRN Dropdown */}
          <Box
            ref={dropdownRefs.grn}
            onMouseEnter={() => handleDropdownToggle("grn", true)}
            onMouseLeave={() => handleDropdownToggle("grn", false)}
            sx={{ position: "relative" }}
          >
            <AdminNavButton
              startIcon={<GRNIcon sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={
                isTabActive(4) ||
                activeComponent === "PurchaseOrderManagement" ||
                activeComponent === "InventoryManagement"
              }
            >
              GRN
            </AdminNavButton>
            {renderCRUDDropdown("grn", dropdownStates.grn, dropdownRefs.grn, [
              {
                label: "Purchase Orders",
                description: "Manage purchase orders",
                icon: <ListIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
                componentName: "PurchaseOrderManagement",
                tabIndex: 4,
                data: { type: "purchase-orders" },
              },
              {
                label: "GRN Goods Received",
                description: "Goods received notes",
                icon: <Inventory sx={{ color: "#4caf50", fontSize: 18 }} />,
                componentName: "InventoryManagement",
                tabIndex: 4,
                data: { type: "grn" },
              },
            ])}
          </Box>
        </Box>

        {/* Right side icons - Store and Profile only */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            color="inherit"
            onClick={handleNavigateHome}
            title="Go to Customer Store"
            sx={{
              color: "rgba(255,255,255,0.8)",
              "&:hover": { color: "#ffffff", bgcolor: "rgba(255,255,255,0.1)" },
              borderRadius: "8px",
              p: 1,
            }}
          >
            <StoreIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            title={`Profile: ${currentUser?.username || "Admin"}`}
            sx={{
              color: "rgba(255,255,255,0.8)",
              "&:hover": { color: "#ffffff", bgcolor: "rgba(255,255,255,0.1)" },
              borderRadius: "8px",
              p: 0.5,
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "0.75rem",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              {currentUser?.username?.charAt(0)?.toUpperCase() || "A"}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      {renderMenu}
      {/* Add Supplier Modal */}
      {renderAddSupplierModal}
      {/* Notification */}
      {renderNotification}
    </AppBar>
  )
}

export default AdminNavigation