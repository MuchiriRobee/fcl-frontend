"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Avatar,
  Chip,
} from "@mui/material"
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  History as HistoryIcon,
  CardGiftcard as CashbackIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material"
import axios from "axios"

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

// Helper function to format numbers with commas and two decimal places
const formatNumberWithCommas = (number) => {
  if (isNaN(number) || number === null || number === undefined) return "0.00"
  const [integerPart, decimalPart = ""] = Number(number).toFixed(2).split(".")
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return `${formattedInteger}.${decimalPart.padEnd(2, "0")}`
}

// Helper function to format date as MM/DD/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })
}

// Helper function to format location
const formatLocation = (street, city, country) => {
  const parts = [street, city, country].filter(part => part && part !== "Unknown").join(", ")
  return parts || "N/A"
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      // Fetch all users (self-registered and sales agent-registered)
      const usersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/users`)

      // Validate response content type
      if (!usersResponse.headers['content-type']?.includes('application/json')) {
        throw new Error('Unexpected response format: Expected JSON')
      }

      const users = usersResponse.data.users || []
      console.log('Users response:', users) // Debug log

      if (!Array.isArray(users) || users.length === 0) {
        setCustomers([])
        setFilteredCustomers([])
        setNotification({
          open: true,
          message: "No customers found",
          severity: "info",
        })
        setLoading(false)
        return
      }

      // Fetch orders for each user and compute customer data
      const customersWithOrders = await Promise.all(
        users.map(async (user) => {
          try {
            const ordersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/orders/user/${user.id}`)

            if (!ordersResponse.headers['content-type']?.includes('application/json')) {
              throw new Error('Unexpected response format: Expected JSON')
            }

            const orders = ordersResponse.data
            const numberOfOrders = orders.length
            const totalSpent = orders
              .reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
              .toFixed(2)
            const lastPurchaseDate = orders.reduce(
              (latest, order) => {
                const orderDate = new Date(order.created_at)
                return !latest || orderDate > new Date(latest.created_at) ? order : latest
              },
              null
            )?.created_at || null

            // Calculate cashback earned (assuming 5% cashback rate)
            const cashbackEarned = orders
              .reduce((sum, order) => {
                const orderCashback = order.items.reduce((itemSum, item) => {
                  const itemPriceExclVAT = item.subtotal_excl_vat || 0
                  const cashbackRate = 0.05
                  return itemSum + (itemPriceExclVAT * cashbackRate)
                }, 0)
                return sum + orderCashback
              }, 0)
              .toFixed(2)

            return {
              id: user.id,
              name: user.name || "N/A",
              email: user.email || "N/A",
              userCode: user.user_code || "N/A",
              phone: user.phone_number || "N/A",
              street: user.street_name || "Unknown",
              city: user.city || "Unknown",
              country: user.country || "Unknown",
              location: formatLocation(user.street_name, user.city, user.country),
              registrationDate: user.created_at || new Date().toISOString(),
              totalOrders: numberOfOrders,
              totalSpent: parseFloat(totalSpent),
              cashbackEarned: parseFloat(cashbackEarned),
              lastPurchaseDate,
              transactions: orders.map((order) => ({
                id: order.id,
                date: order.created_at,
                type: "purchase",
                amount: parseFloat(order.total_amount || 0),
                description: `Order ${order.order_number || "N/A"}`,
                status: order.status || "unknown",
              })),
              cashbackHistory: orders.map((order) => ({
                id: order.id,
                date: order.created_at,
                orderAmount: parseFloat(order.total_amount || 0),
                cashbackRate: 5,
                cashbackAmount: order.items.reduce((sum, item) => sum + ((item.subtotal_excl_vat || 0) * 0.05), 0),
                status: "credited",
              })),
            }
          } catch (error) {
            console.warn(`Failed to fetch orders for user ${user.id}:`, error.response?.data?.message || error.message)
            return {
              id: user.id,
              name: user.name || "N/A",
              email: user.email || "N/A",
              userCode: user.user_code || "N/A",
              phone: user.phone_number || "N/A",
              street: user.street_name || "Unknown",
              city: user.city || "Unknown",
              country: user.country || "Unknown",
              location: formatLocation(user.street_name, user.city, user.country),
              registrationDate: user.created_at || new Date().toISOString(),
              totalOrders: 0,
              totalSpent: 0.00,
              cashbackEarned: 0.00,
              lastPurchaseDate: null,
              transactions: [],
              cashbackHistory: [],
            }
          }
        })
      )

      console.log("Processed customers:", customersWithOrders)
      const sortedCustomers = customersWithOrders.sort((a, b) => {
        const dateA = a.lastPurchaseDate ? new Date(a.lastPurchaseDate) : new Date(0)
        const dateB = b.lastPurchaseDate ? new Date(b.lastPurchaseDate) : new Date(0)
        return dateB - dateA
      })

      setCustomers(sortedCustomers)
      setFilteredCustomers(sortedCustomers)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching customers:", error)
      setNotification({
        open: true,
        message: error.response?.data?.message || "Failed to fetch customers",
        severity: "error",
      })
      setCustomers([])
      setFilteredCustomers([])
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  // Filter customers based on search term
  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.userCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCustomers(filtered)
  }, [customers, searchTerm])

  // Handle view customer details
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setViewDialogOpen(true)
  }

  // Show notification
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `KSh ${formatNumberWithCommas(amount)}`
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Paper sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>
            Customer Management
          </Typography>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchCustomers} disabled={loading}>
            Refresh
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: "#e3f2fd", border: "1px solid #bbdefb" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#1976d2" }}>
                  {customers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Customers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: "#f3e5f5", border: "1px solid #e1bee7" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#7b1fa2" }}>
                  {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: "#e8f5e8", border: "1px solid #c8e6c9" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#388e3c" }}>
                  {formatCurrency(customers.reduce((sum, c) => sum + c.cashbackEarned, 0))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Cashback Earned
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search customers by name, email, user code, phone, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Paper>

      {/* Customer Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>User Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Orders</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Spent</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Loading customers...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No customers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "#1976d2" }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {customer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Joined: {formatDate(customer.registrationDate)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{customer.userCode}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <EmailIcon fontSize="small" />
                          {customer.email}
                        </Typography>
                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                          <PhoneIcon fontSize="small" />
                          {customer.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationIcon fontSize="small" />
                        {customer.location}
                      </Box>
                    </TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(customer.totalSpent)}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleViewCustomer(customer)}>
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Customer Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#1976d2" }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedCustomer?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Customer Details
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box>
              {/* Customer Info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                      Customer Information
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon />
                        <Typography>User Code: {selectedCustomer.userCode}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <EmailIcon />
                        <Typography>{selectedCustomer.email}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon />
                        <Typography>{selectedCustomer.phone}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationIcon />
                        <Typography>{selectedCustomer.location}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                      Account Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Orders
                        </Typography>
                        <Typography variant="h6">{selectedCustomer.totalOrders}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Spent
                        </Typography>
                        <Typography variant="h6">{formatCurrency(selectedCustomer.totalSpent)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Cashback Earned
                        </Typography>
                        <Typography variant="h6">{formatCurrency(selectedCustomer.cashbackEarned)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Last Purchase
                        </Typography>
                        <Typography variant="body2">{formatDate(selectedCustomer.lastPurchaseDate)}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>

              {/* Tabs for detailed information */}
              <Paper>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer details tabs">
                  <Tab icon={<HistoryIcon />} label="Transaction History" />
                  <Tab icon={<CashbackIcon />} label="Cashback Details" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedCustomer.transactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography variant="body2" color="text.secondary">
                                No transactions found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedCustomer.transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{formatDate(transaction.date)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={transaction.type}
                                  color={transaction.type === "purchase" ? "primary" : "success"}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                              <TableCell>
                                <Chip label={transaction.status} color="success" size="small" />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Order Amount</TableCell>
                          <TableCell>Cashback Rate</TableCell>
                          <TableCell>Cashback Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedCustomer.cashbackHistory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography variant="body2" color="text.secondary">
                                No cashback history found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedCustomer.cashbackHistory.map((cashback) => (
                            <TableRow key={cashback.id}>
                              <TableCell>{formatDate(cashback.date)}</TableCell>
                              <TableCell>{formatCurrency(cashback.orderAmount)}</TableCell>
                              <TableCell>{cashback.cashbackRate}%</TableCell>
                              <TableCell>{formatCurrency(cashback.cashbackAmount)}</TableCell>
                              <TableCell>
                                <Chip label={cashback.status} color="success" size="small" />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default CustomerManagement