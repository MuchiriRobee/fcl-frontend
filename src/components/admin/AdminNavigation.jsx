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

  // State management for dropdowns and menus
const [anchorEl, setAnchorEl] = useState(null)
const [dropdownStates, setDropdownStates] = useState({
  sales: false,
  grn: false,
  agents: false,
  categories: false,
})
const [categoryData, setCategoryData] = useState([])
const [categoryLoading, setCategoryLoading] = useState(false)

// Refs for dropdown positioning
const dropdownRefs = {
  sales: useRef(null),
  grn: useRef(null),
  agents: useRef(null),
  categories: useRef(null),
}
  const isMenuOpen = Boolean(anchorEl)

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
      agents: false,
    })
  }, [])

  // Enhanced direct navigation handler
  const handleDirectComponentNavigation = useCallback(
    (componentName, tabIndex, section, data = null) => {
      console.log(`🎯 Direct navigation to: ${componentName} in tab ${tabIndex}`)

      // Close all dropdowns immediately
      handleAllDropdownsClose()

      // Use direct navigation if available
      if (onDirectNavigation) {
        onDirectNavigation(componentName, tabIndex)
      }

      // Also call CRUD operation handler for backward compatibility
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

// Load categories on component mount and when Categories tab is active
useEffect(() => {
  if (activeTab === 2 || activeComponent === "CategoryManagement") {
    fetchCategories()
  }
}, [activeTab, activeComponent, fetchCategories])

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
        bgcolor: "#1976d2",
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

          {/* Suppliers - Direct to SupplierManagement */}
          <AdminNavButton
            startIcon={<SuppliersIcon sx={{ fontSize: 18 }} />}
            active={isTabActive(5) || activeComponent === "SupplierManagement"}
            onClick={() => handleDirectComponentNavigation("SupplierManagement", 5, "suppliers", { type: "supplier" })}
          >
            Suppliers
          </AdminNavButton>

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

          {/* Sales Agents Dropdown */}
          <Box
            ref={dropdownRefs.agents}
            onMouseEnter={() => handleDropdownToggle("agents", true)}
            onMouseLeave={() => handleDropdownToggle("agents", false)}
            sx={{ position: "relative" }}
          >
            <AdminNavButton
              startIcon={<People sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={isTabActive(6) || activeComponent === "SalesAgentAdminPanel"}
            >
              Sales Agents
            </AdminNavButton>

            {renderCRUDDropdown("agents", dropdownStates.agents, dropdownRefs.agents, [
              {
                label: "Manage Agents",
                description: "View and manage sales agents",
                icon: <ViewIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                componentName: "SalesAgentAdminPanel",
                tabIndex: 6,
                data: { type: "agent" },
              },
            ])}
          </Box>

          {/* Customers Button */}
          <AdminNavButton
            startIcon={<People sx={{ fontSize: 18 }} />}
            active={isTabActive(7) || activeComponent === "CustomerManagement"}
            onClick={() => handleDirectComponentNavigation("CustomerManagement", 7, "customers")}
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
          {/* Store view icon */}
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

          {/* Profile */}
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
    </AppBar>
  )
}

export default AdminNavigation