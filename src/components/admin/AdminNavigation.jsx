"use client"

import { useState, useRef, useCallback } from "react"
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
  Add as AddIcon,
  List as ListIcon,
  KeyboardArrowDown,
  Visibility as ViewIcon,
  Store as StoreIcon,
  LocationOn as LocationIcon,
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
  onItemMasterSubTabChange,
  onCRUDOperation,
}) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // State management for dropdowns and menus
  const [anchorEl, setAnchorEl] = useState(null)
  const [dropdownStates, setDropdownStates] = useState({
    itemMaster: false,
    categories: false,
    sales: false,
    inventory: false,
    suppliers: false,
    agents: false,
    locations: false,
  })

  // Refs for dropdown positioning
  const dropdownRefs = {
    itemMaster: useRef(null),
    categories: useRef(null),
    sales: useRef(null),
    inventory: useRef(null),
    suppliers: useRef(null),
    agents: useRef(null),
    locations: useRef(null),
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
      itemMaster: false,
      categories: false,
      sales: false,
      inventory: false,
      suppliers: false,
      agents: false,
      locations: false,
    })
  }, [])

  // Enhanced CRUD operation handlers
  const handleCRUDAction = useCallback(
    (action, section, data = null) => {
      console.log(`🔄 CRUD Action: ${action} on ${section}`, data)

      // Close all dropdowns immediately
      handleAllDropdownsClose()

      try {
        // Handle navigation based on action and section
        switch (section) {
          case "itemMaster":
            console.log(`📍 Navigating to Item Master - Action: ${action}`)
            onTabChange(null, 1)

            setTimeout(() => {
              if (action === "create" && onItemMasterSubTabChange) {
                console.log("🆕 Switching to New Item sub-tab")
                onItemMasterSubTabChange(null, 0)
              } else if (action === "read" && onItemMasterSubTabChange) {
                console.log("📋 Switching to Manage Items sub-tab")
                onItemMasterSubTabChange(null, 1)
              }
            }, 300) // Increased delay for better rendering
            break

          case "categories":
            console.log(`📍 Navigating to Categories - Action: ${action}`)
            onTabChange(null, 2)
            break

          case "sales":
            console.log(`📍 Navigating to Sales - Action: ${action}`)
            onTabChange(null, 3)
            break

          case "inventory":
            console.log(`📍 Navigating to Inventory - Action: ${action}`)
            onTabChange(null, 4)
            break

          case "suppliers":
            console.log(`📍 Navigating to Suppliers - Action: ${action}`)
            onTabChange(null, 5)
            break

          case "locations":
            console.log(`📍 Navigating to Locations - Action: ${action}`)
            onTabChange(null, 6)
            break

          case "agents":
            console.log(`📍 Navigating to Sales Agents - Action: ${action}`)
            onTabChange(null, 7)
            break

          default:
            console.warn(`⚠️ Unknown section: ${section}`)
        }

        // Call CRUD operation handler if provided
        if (onCRUDOperation) {
          onCRUDOperation(action, section, data)
        }

        console.log(`✅ Navigation completed for ${section}`)
      } catch (error) {
        console.error(`❌ Error in CRUD action:`, error)
      }
    },
    [onTabChange, onItemMasterSubTabChange, onCRUDOperation, handleAllDropdownsClose],
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

  // Clean dropdown renderer
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
                      handleCRUDAction(item.action, section, item.data)
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
        bgcolor: "#1976d2", // Blue background
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
            active={activeTab === 0}
            onClick={() => handleTabClick(0)}
          >
            Dashboard
          </AdminNavButton>

          {/* Item Master Dropdown */}
          <Box
            ref={dropdownRefs.itemMaster}
            onMouseEnter={() => handleDropdownToggle("itemMaster", true)}
            onMouseLeave={() => handleDropdownToggle("itemMaster", false)}
            sx={{ position: "relative" }}
          >
            <AdminNavButton
              startIcon={<ShoppingCart sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={activeTab === 1}
            >
              Item Master
            </AdminNavButton>

            {renderCRUDDropdown("itemMaster", dropdownStates.itemMaster, dropdownRefs.itemMaster, [
              {
                label: "New Item",
                description: "Create new product",
                icon: <AddIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
                action: "create",
                data: { type: "item" },
              },
              {
                label: "Manage Items",
                description: "View and edit products",
                icon: <ListIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                action: "read",
                data: { type: "item" },
              },
            ])}
          </Box>

          {/* Categories Dropdown */}
          <Box
            ref={dropdownRefs.categories}
            onMouseEnter={() => handleDropdownToggle("categories", true)}
            onMouseLeave={() => handleDropdownToggle("categories", false)}
            sx={{ position: "relative" }}
          >
            <AdminNavButton
              startIcon={<CategoryIcon sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={activeTab === 2}
            >
              Categories
            </AdminNavButton>

            {renderCRUDDropdown("categories", dropdownStates.categories, dropdownRefs.categories, [
              {
                label: "Add Category",
                description: "Create new category",
                icon: <AddIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
                action: "create",
                data: { type: "category" },
              },
              {
                label: "View Categories",
                description: "Browse all categories",
                icon: <ViewIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                action: "read",
                data: { type: "category" },
              },
            ])}
          </Box>

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
              active={activeTab === 3}
            >
              Sales
            </AdminNavButton>

            {renderCRUDDropdown("sales", dropdownStates.sales, dropdownRefs.sales, [
              {
                label: "New Sale",
                description: "Create sales order",
                icon: <AddIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
                action: "create",
                data: { type: "sale" },
              },
              {
                label: "View Sales",
                description: "Customer onboarded by agents",
                icon: <ViewIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                action: "read",
                data: { type: "sale" },
              },
            ])}
          </Box>

          {/* Inventory Dropdown */}
          <Box
            ref={dropdownRefs.inventory}
            onMouseEnter={() => handleDropdownToggle("inventory", true)}
            onMouseLeave={() => handleDropdownToggle("inventory", false)}
            sx={{ position: "relative" }}
          >
            <AdminNavButton
              startIcon={<Inventory sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={activeTab === 4}
            >
              Inventory
            </AdminNavButton>

            {renderCRUDDropdown("inventory", dropdownStates.inventory, dropdownRefs.inventory, [
              {
                label: "Add Stock",
                description: "Increase inventory",
                icon: <AddIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
                action: "create",
                data: { type: "stock" },
              },
              {
                label: "View Inventory",
                description: "Check stock levels",
                icon: <ViewIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                action: "read",
                data: { type: "stock" },
              },
            ])}
          </Box>

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
              active={activeTab === 5}
            >
              Suppliers
            </AdminNavButton>

            {renderCRUDDropdown("suppliers", dropdownStates.suppliers, dropdownRefs.suppliers, [
              {
                label: "Add Supplier",
                description: "Register new vendor",
                icon: <AddIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
                action: "create",
                data: { type: "supplier" },
              },
              {
                label: "View Suppliers",
                description: "Browse vendors",
                icon: <ViewIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                action: "read",
                data: { type: "supplier" },
              },
            ])}
          </Box>

          {/* Locations Dropdown */}
          <Box
            ref={dropdownRefs.locations}
            onMouseEnter={() => handleDropdownToggle("locations", true)}
            onMouseLeave={() => handleDropdownToggle("locations", false)}
            sx={{ position: "relative" }}
          >
            <AdminNavButton
              startIcon={<LocationIcon sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={activeTab === 6}
            >
              Locations
            </AdminNavButton>

            {renderCRUDDropdown("locations", dropdownStates.locations, dropdownRefs.locations, [
              {
                label: "Westlands",
                description: "Manage Westlands branch",
                icon: <LocationIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
                action: "read",
                data: { location: "westlands" },
              },
              {
                label: "Parklands",
                description: "Manage Parklands branch",
                icon: <LocationIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                action: "read",
                data: { location: "parklands" },
              },
              {
                label: "Add Location",
                description: "Register new location",
                icon: <AddIcon sx={{ color: "#ff9800", fontSize: 18 }} />,
                action: "create",
                data: { type: "location" },
              },
            ])}
          </Box>

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
              active={activeTab === 7}
            >
              Sales Agents
            </AdminNavButton>

            {renderCRUDDropdown("agents", dropdownStates.agents, dropdownRefs.agents, [
              {
                label: "Add Agent",
                description: "Register new agent",
                icon: <AddIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
                action: "create",
                data: { type: "agent" },
              },
              {
                label: "View Agents",
                description: "Browse team members",
                icon: <ViewIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                action: "read",
                data: { type: "agent" },
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
