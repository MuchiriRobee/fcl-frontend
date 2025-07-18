"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { ArrowBack, ArrowForward, CheckCircle, LocalShipping, Payment, Receipt } from "@mui/icons-material"
import axios from "axios"
import { jwtDecode } from "jwt-decode"

// Helper function to format numbers with commas
const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// Function to get the price tier based on quantity
const getPriceTier = (item, quantity) => {
  return item.tier_pricing.find(tier => 
    quantity >= tier.min_quantity && (!tier.max_quantity || quantity <= tier.max_quantity)
  ) || item.tier_pricing[0] || { price: item.price } // Fallback to first tier or item.price
}

// Function to get the adjusted price based on quantity
const getAdjustedPrice = (item, quantity) => {
  const tier = getPriceTier(item, quantity)
  return Math.round(parseFloat(tier.price) || item.price)
}

const steps = ["Shipping Information", "Payment Method", "Order Confirmation"]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [activeStep, setActiveStep] = useState(0)
  const [cartItems, setCartItems] = useState([])
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [orderId, setOrderId] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mpesaPhone, setMpesaPhone] = useState("")

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Uganda",
  })

  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Check authentication and fetch user details
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userData = JSON.parse(localStorage.getItem("currentUser"))
    if (token && userData?.userType === "customer") {
      try {
        const decoded = jwtDecode(token)
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true)
          setUser(userData)
          // Fetch detailed user info
          const fetchUserDetails = async () => {
            try {
              setLoading(true)
              const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              const userDetails = response.data
              const userPhone = userDetails.phone_number || ""
              const formattedPhone = userPhone.length === 9 && /^\d{9}$/.test(userPhone) 
                ? `0${userPhone}` 
                : userPhone
              setShippingInfo({
                username: userDetails.name || userData.username || "",
                email: userDetails.email || userData.email || "",
                phone: formattedPhone,
                address: userDetails.street_name || "",
                city: userDetails.city || "",
                country: userDetails.country || "Uganda",
              })
              setMpesaPhone(formattedPhone)
            } catch (err) {
              console.error("Fetch user details error:", err)
              setShippingInfo({
                username: userData.username || "",
                email: userData.email || "",
                phone: "",
                address: "",
                city: "",
                country: "Uganda",
              })
            } finally {
              setLoading(false)
            }
          }
          fetchUserDetails()
        } else {
          localStorage.removeItem("authToken")
          localStorage.removeItem("currentUser")
          setError("Session expired. Please log in to continue.")
          setTimeout(() => navigate("/login?redirect=/checkout"), 2000)
        }
      } catch (err) {
        console.error("Token decode error:", err)
        setError("Invalid session. Please log in to continue.")
        setTimeout(() => navigate("/login?redirect=/checkout"), 2000)
      }
    } else {
      setError("Please log in to access checkout.")
      setTimeout(() => navigate("/login?redirect=/checkout"), 2000)
    }
  }, [navigate])

  // Load cart items
  useEffect(() => {
    const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || []
    if (storedCartItems.length === 0 && isAuthenticated) {
      navigate("/cart")
      return
    }
    // Ensure all items have required properties
    const updatedItems = storedCartItems.map((item) => ({
      ...item,
      quantity: item.quantity || 1,
      price: getAdjustedPrice(item, item.quantity || 1),
      tier_pricing: item.tier_pricing || [],
      cashbackPercent: item.cashbackPercent || (item.cashback ? Math.round((item.cashback / item.price) * 100) : 5),
    }))
    setCartItems(updatedItems)
  }, [navigate, isAuthenticated])

  // Calculate totals
  const subtotalExclVAT = cartItems.reduce((sum, item) => {
    const quantity = item.quantity || 1
    const adjustedPrice = getAdjustedPrice(item, quantity)
    const vatRate = parseFloat(item.vat) || 0.16
    const priceExclVAT = Math.round(adjustedPrice / (1 + vatRate))
    return sum + priceExclVAT * quantity
  }, 0)

  const vatAmount = cartItems.reduce((sum, item) => {
    const quantity = item.quantity || 1
    const adjustedPrice = getAdjustedPrice(item, quantity)
    const vatRate = parseFloat(item.vat) || 0.16
    const priceExclVAT = Math.round(adjustedPrice / (1 + vatRate))
    return sum + Math.round(priceExclVAT * vatRate * quantity)
  }, 0)

  const total = subtotalExclVAT + vatAmount
  const shippingCost = 299 // Fixed shipping cost

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate shipping information
      const requiredFields = ["username", "email", "phone", "address", "city"]
      const isValid = requiredFields.every((field) => shippingInfo[field].trim() !== "")
      if (!isValid) {
        setError("Please fill in all required fields")
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
        setError("Please enter a valid email address")
        return
      }
    }

    if (activeStep === 1) {
      // Validate payment method and M-Pesa phone
      if (!termsAccepted) {
        setError("Please accept the terms and conditions")
        return
      }
      if (paymentMethod === "mpesa" && (!/^(0)\d{9}$/.test(mpesaPhone))) {
        setError("Please enter a valid M-Pesa phone number (0 followed by 9 digits)")
        return
      }
    }

    setError("")
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  // Dummy place order handler
  const handlePlaceOrder = async () => {
    try {
      setLoading(true)
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const orderNum = `FCL${Date.now().toString().slice(-6)}`
      setOrderNumber(orderNum)
      setOrderId(Date.now()) // Dummy order ID
      setOrderComplete(true)
      localStorage.removeItem("cartItems")
    } catch (err) {
      setError("Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />

  if (orderComplete) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 }, textAlign: "center" }}>
        <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Order Confirmed!
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Order Number: {orderNumber}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Thank you for your purchase! Your order has been successfully placed.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate("/")} sx={{ mr: 2, textTransform: "none" }}>
          Continue Shopping
        </Button>
        <Button variant="outlined" color="primary" onClick={() => navigate("/account")} sx={{ textTransform: "none" }}>
          View Orders
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, fontSize: "1.1rem" }}>
          {error}
        </Alert>
      )}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Checkout
      </Typography>
      {user && (
        <Typography variant="h6" sx={{ mb: 3 }}>
          Welcome, {user.username}!
        </Typography>
      )}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={({ active, completed }) => {
                const icons = [LocalShipping, Payment, Receipt]
                const Icon = icons[index]
                return (
                  <Icon
                    sx={{
                      color: completed ? "success.main" : active ? "primary.main" : "text.disabled",
                      fontSize: 32,
                    }}
                  />
                )
              }}
            >
              {!isMobile && <Typography variant="h6">{label}</Typography>}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          {activeStep === 0 && (
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Shipping Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username *"
                    value={shippingInfo.username}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, username: e.target.value })}
                    required
                    variant="outlined"
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                    required
                    variant="outlined"
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    required
                    variant="outlined"
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address *"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    required
                    variant="outlined"
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City *"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    required
                    variant="outlined"
                    size="medium"
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {activeStep === 1 && (
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Payment Method
              </Typography>
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <FormControlLabel
                    value="mpesa"
                    control={<Radio size="medium" />}
                    label={<Typography variant="h6">M-Pesa Mobile Money</Typography>}
                  />
                  <FormControlLabel
                    value="card"
                    control={<Radio size="medium" />}
                    label={<Typography variant="h6">Credit/Debit Card</Typography>}
                    disabled
                  />
                  <FormControlLabel
                    value="bank"
                    control={<Radio size="medium" />}
                    label={<Typography variant="h6">Bank Transfer</Typography>}
                    disabled
                  />
                </RadioGroup>
              </FormControl>
              {paymentMethod === "mpesa" && (
                <TextField
                  fullWidth
                  label="M-Pesa Phone Number *"
                  value={mpesaPhone}
                  onChange={(e) => {
                    const value = e.target.value
                    // Only allow digits and ensure it starts with 0
                    if (/^\d*$/.test(value) && value.length <= 10) {
                      setMpesaPhone(value)
                    }
                  }}
                  required
                  variant="outlined"
                  size="medium"
                  sx={{ mb: 3 }}
                  inputProps={{ pattern: "^(0)\\d{9}$", maxLength: 10 }}
                  helperText="Enter a valid phone number starting with 0 (10 digits)"
                />
              )}
              <Box>
                <FormControlLabel
                  control={<Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />}
                  label={<Typography variant="h6">I accept the terms and conditions and privacy policy</Typography>}
                />
              </Box>
            </Paper>
          )}

          {activeStep === 2 && (
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Order Confirmation
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Please review your order details before placing the order.
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Shipping Information:
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>{shippingInfo.username}</Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>{shippingInfo.email}</Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>{shippingInfo.phone}</Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.country}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Payment Method:
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {paymentMethod === "mpesa" ? "M-Pesa Mobile Money" : paymentMethod}
                </Typography>
                {paymentMethod === "mpesa" && (
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    M-Pesa Phone: {mpesaPhone}
                  </Typography>
                )}
              </Box>
            </Paper>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              onClick={() => navigate("/cart")}
              startIcon={<ArrowBack />}
              sx={{ textTransform: "none", fontSize: "1.1rem" }}
            >
              Back to Cart
            </Button>
            <Box>
              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  sx={{ mr: 2, textTransform: "none", fontSize: "1.1rem" }}
                >
                  Back
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                  sx={{ textTransform: "none", fontSize: "1.1rem", px: 4 }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  sx={{ textTransform: "none", fontSize: "1.1rem", px: 4 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Place Order"}
                </Button>
              )}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, position: "sticky", top: 20, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Order Summary
            </Typography>
            <TableContainer sx={{ mb: 3 }}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>Item</TableCell>
                    <TableCell align="right" sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ fontSize: "1rem" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.name}
                            sx={{ width: 60, height: 60, objectFit: "contain", mr: 2 }}
                          />
                          <Typography variant="body1">{item.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "1rem" }}>{item.quantity || 1}</TableCell>
                      <TableCell align="right" sx={{ fontSize: "1rem" }}>
                        {formatNumberWithCommas(getAdjustedPrice(item, item.quantity || 1) * (item.quantity || 1))}/=
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">Subtotal (Excl. VAT):</Typography>
              <Typography variant="h6">{formatNumberWithCommas(subtotalExclVAT)}/=</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">Shipping:</Typography>
              <Typography variant="h6">{formatNumberWithCommas(shippingCost)}/=</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">VAT:</Typography>
              <Typography variant="h6">{formatNumberWithCommas(vatAmount)}/=</Typography>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h5" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatNumberWithCommas(total + shippingCost)}/=
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}