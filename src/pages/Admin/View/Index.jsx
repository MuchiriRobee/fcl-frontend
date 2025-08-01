"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Button,
  useMediaQuery,
  useTheme,
  Snackbar,
} from "@mui/material"
import { Add as AddIcon, List as ListIcon } from "@mui/icons-material"
import { useNavigate, Routes, Route } from "react-router-dom"
import AdminNavigation from "../../../components/admin/AdminNavigation"
import EnhancedDashboard from "../../../components/admin/EnhancedDashboard"
import NewItemForm from "../../../components/admin/NewItemForm"
import ManageItems from "../../../components/admin/ManageItems"
import CategoryManagement from "../../../components/admin/CategoryManagement"
import InventoryManagement from "../../../components/admin/InventoryManagement"
import SalesAgentManagement from "../../../components/admin/SalesAgentManagement"
import SupplierManagement from "../../../components/admin/SupplierManagement"
import CustomerManagement from "../../../components/admin/CustomerManagement"
import SalesAgentPage from "../../../components/admin/SalesAgentPage"

// Error Boundary Component
import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong.
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Reload Page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

// Tab panel component for clean content rendering
function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && (
        <Box
          sx={{
            p: { xs: 0, sm: 0 },
            minHeight: "calc(100vh - 120px)",
          }}
        >
          {children}
        </Box>
      )}
    </div>
  )
}

const AdminPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // E-commerce admin state management
  const [tabValue, setTabValue] = useState(0)
  const [subTabValue, setSubTabValue] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [editingItem, setEditingItem] = useState(null)
  const [crudNotification, setCrudNotification] = useState({ open: false, message: "", severity: "success" })

  // E-commerce data state for CRUD operations
  const [items, setItems] = useState([])

  // E-commerce admin authentication
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setCurrentUser(user)

      // E-commerce admin access control
      if (!user.isAdmin && !user.email?.includes("admin")) {
        navigate("/")
        return
      }
    } else {
      navigate("/login")
      return
    }
  }, [navigate])

  // Direct navigation handler
  const handleDirectNavigation = useCallback((componentName, tabIndex) => {
    console.log(`🎯 Navigating to component: ${componentName} in tab ${tabIndex}`)
    setTabValue(tabIndex)
    setSubTabValue(0) // Reset sub-tab for consistency
  }, [])

  // CRUD Operations Handler
  const handleCRUDOperation = (action, section, data) => {
    console.log(`CRUD Operation: ${action} on ${section}`, data)

    switch (action) {
      case "create":
        if (section === "itemMaster") {
          setTabValue(1)
          setSubTabValue(0) // New Item
          setCrudNotification({
            open: true,
            message: "Opening New Item form...",
            severity: "info",
          })
        } else if (section === "categories") {
          setTabValue(2)
          setCrudNotification({
            open: true,
            message: "Opening Category creation form...",
            severity: "info",
          })
        } else if (section === "suppliers") {
          setTabValue(5)
          setCrudNotification({
            open: true,
            message: "Opening Supplier creation form...",
            severity: "info",
          })
        } else if (section === "agents") {
          setTabValue(6)
          setCrudNotification({
            open: true,
            message: "Opening Sales Agent creation form...",
            severity: "info",
          })
        }
        break

      case "read":
        if (section === "itemMaster") {
          setTabValue(1)
          setSubTabValue(1) // Manage Items
          setCrudNotification({
            open: true,
            message: "Loading items list...",
            severity: "info",
          })
        } else if (section === "categories") {
          setTabValue(2)
          setCrudNotification({
            open: true,
            message: "Loading categories...",
            severity: "info",
          })
        } else if (section === "suppliers") {
          setTabValue(5)
          setCrudNotification({
            open: true,
            message: "Loading suppliers...",
            severity: "info",
          })
        } else if (section === "agents") {
          setTabValue(6)
          setCrudNotification({
            open: true,
            message: "Loading sales agents...",
            severity: "info",
          })
        }
        break

      case "update":
        if (section === "itemMaster") {
          setTabValue(1)
          setSubTabValue(0) // New Item form for editing
          setEditingItem(data)
          setCrudNotification({
            open: true,
            message: `Editing item: ${data?.productName || 'item'}`,
            severity: "info",
          })
        } else if (section === "categories") {
          setTabValue(2)
          setCrudNotification({
            open: true,
            message: "Opening edit form for category...",
            severity: "warning",
          })
        } else if (section === "suppliers") {
          setTabValue(5)
          setCrudNotification({
            open: true,
            message: "Opening edit form for supplier...",
            severity: "warning",
          })
        } else if (section === "agents") {
          setTabValue(6)
          setCrudNotification({
            open: true,
            message: "Opening edit form for sales agent...",
            severity: "warning",
          })
        }
        break

      case "delete":
        setCrudNotification({
          open: true,
          message: `Delete operation for ${section} - Please confirm`,
          severity: "error",
        })
        break

      default:
        console.log("Unknown CRUD operation")
    }
  }

  // E-commerce admin navigation handlers
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    setSubTabValue(0) // Reset sub tab when main tab changes
  }

  const handleSubTabChange = (event, newValue) => {
    setSubTabValue(newValue)
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    navigate("/")
  }

  // E-commerce category management
  const handleCategoriesChange = useCallback((updatedCategories) => {
    console.log('Parent received categories:', updatedCategories);
    setCrudNotification({
      open: true,
      message: "Categories updated successfully!",
      severity: "success",
    })
  }, []);

  // E-commerce supplier management
  const handleSuppliersChange = useCallback((updatedSuppliers) => {
    console.log('Parent received suppliers:', updatedSuppliers);
    setCrudNotification({
      open: true,
      message: "Suppliers updated successfully!",
      severity: "success",
    })
  }, []);

  // E-commerce product management
  const handleNewItemSubmit = (itemData) => {
    console.log("E-commerce item submitted:", itemData)

    // Add item to items array (simulating database operation)
    const newItem = {
      id: Date.now(),
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setItems((prevItems) => [...prevItems, newItem])

    setSuccessMessage(editingItem ? "Product updated successfully!" : "Product added successfully!")
    setCrudNotification({
      open: true,
      message: editingItem ? "Product updated successfully!" : "Product added successfully!",
      severity: "success",
    })

    setTimeout(() => setSuccessMessage(""), 3000)
    setEditingItem(null)
    setTabValue(1) // Switch to Item Master tab
    setSubTabValue(1) // Switch to Manage Items sub-tab
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setTabValue(1) // Switch to Item Master tab
    setSubTabValue(0) // Switch to New Item sub-tab
    setCrudNotification({
      open: true,
      message: `Editing item: ${item.productName}`,
      severity: "info",
    })
  }

  const handleAddNewItem = () => {
    setEditingItem(null)
    setTabValue(1) // Switch to Item Master tab
    setSubTabValue(0) // Switch to New Item sub-tab
  }

  const handleCloseNotification = () => {
    setCrudNotification({ ...crudNotification, open: false })
  }

  if (!currentUser) {
    return null
  }

  // E-commerce admin access validation
  if (!currentUser.isAdmin && !currentUser.email?.includes("admin")) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: "'Poppins', sans-serif" }}>
            {"You don't have permission to access the e-commerce admin panel. Please contact your administrator."}
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 2, fontFamily: "'Poppins', sans-serif" }}>
            Go to Homepage
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Box
      className="ecommerce-admin-interface"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Single Unified Admin Navigation with CRUD */}
      <AdminNavigation
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={tabValue}
        onTabChange={handleTabChange}
        onDirectNavigation={handleDirectNavigation}
        onCRUDOperation={handleCRUDOperation}
        activeComponent={tabValue === 0 ? "EnhancedDashboard" :
                         tabValue === 1 && subTabValue === 0 ? "NewItemForm" :
                         tabValue === 1 && subTabValue === 1 ? "ManageItems" :
                         tabValue === 2 ? "CategoryManagement" :
                         tabValue === 3 ? "SalesManagement" :
                         tabValue === 4 ? "InventoryManagement" :
                         tabValue === 5 ? "SupplierManagement" :
                         tabValue === 6 ? "SalesAgentManagement" :
                         tabValue === 7 ? "CustomerManagement" : null}
      />

      {/* E-commerce Success Messages */}
      {successMessage && (
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
          <Alert
            severity="success"
            onClose={() => setSuccessMessage("")}
            sx={{
              fontFamily: "'Poppins', sans-serif",
              borderRadius: 2,
            }}
          >
            {successMessage}
          </Alert>
        </Box>
      )}

      {/* CRUD Operation Notifications */}
      <Snackbar
        open={crudNotification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={crudNotification.severity}
          sx={{
            fontFamily: "'Poppins', sans-serif",
            borderRadius: 2,
          }}
        >
          {crudNotification.message}
        </Alert>
      </Snackbar>

      {/* E-commerce Admin Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f8fafc" }}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Dashboard - E-commerce Analytics */}
                <TabPanel value={tabValue} index={0}>
                  <EnhancedDashboard />
                </TabPanel>

                {/* Item Master - E-commerce Product Management with CRUD */}
                <TabPanel value={tabValue} index={1}>
                  {subTabValue === 0 && (
                    <NewItemForm onSubmit={handleNewItemSubmit} editItem={editingItem} items={items} />
                  )}
                  {subTabValue === 1 && (
                    <ManageItems
                      onEditItem={handleEditItem}
                      onAddNewItem={handleAddNewItem}
                      items={items}
                      setItems={setItems}
                    />
                  )}
                </TabPanel>

                {/* Categories - E-commerce Category Management with CRUD */}
                <TabPanel value={tabValue} index={2}>
                  <ErrorBoundary>
                    <CategoryManagement onCategoriesChange={handleCategoriesChange} />
                  </ErrorBoundary>
                </TabPanel>

                {/* Sales - E-commerce Sales Management with CRUD */}
                <TabPanel value={tabValue} index={3}>
                  <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
                      E-commerce Sales Dashboard with CRUD Operations
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                      Create, Read, Update, Delete sales orders and manage customer transactions.
                    </Typography>
                  </Paper>
                </TabPanel>

                {/* Inventory - E-commerce Stock Management with CRUD */}
                <TabPanel value={tabValue} index={4}>
                  <InventoryManagement />
                </TabPanel>

                {/* Suppliers - E-commerce Vendor Management with CRUD */}
                <TabPanel value={tabValue} index={5}>
                  <ErrorBoundary>
                    <SupplierManagement onSuppliersChange={handleSuppliersChange} />
                  </ErrorBoundary>
                </TabPanel>

                {/* Sales Agents - E-commerce Team Management with CRUD */}
                <TabPanel value={tabValue} index={6}>
                  <ErrorBoundary>
                    <SalesAgentManagement />
                  </ErrorBoundary>
                </TabPanel>

                {/* Customers - E-commerce Customer Management with CRUD */}
                <TabPanel value={tabValue} index={7}>
                  <ErrorBoundary>
                    <CustomerManagement />
                  </ErrorBoundary>
                </TabPanel>
              </>
            }
          />
          <Route
            path="agents/:id"
            element={
              <TabPanel value={tabValue} index={6}>
                <ErrorBoundary>
                  <SalesAgentPage />
                </ErrorBoundary>
              </TabPanel>
            }
          />
        </Routes>
      </Box>
    </Box>
  )
}

export default AdminPage