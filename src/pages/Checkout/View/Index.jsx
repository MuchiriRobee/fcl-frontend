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
  const [paymentStatus, setPaymentStatus] = useState(null) // null, 'initiated', 'completed', 'failed'
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Uganda",
  })

  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [mpesaPhone, setMpesaPhone] = useState("")
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
              // Normalize phone number to start with '0'
              const phone = userDetails.cashback_phone_number || userDetails.phone_number || ""
              const normalizedPhone = phone.startsWith("0") ? phone : `0${phone.replace(/^\+?256/, "")}`
              setShippingInfo({
                firstName: userDetails.name?.split(" ")[0] || userData.username?.split(" ")[0] || "",
                lastName: userDetails.name?.split(" ")[1] || userData.username?.split(" ")[1] || "",
                email: userDetails.email || userData.email || "",
                phone: userDetails.phone_number || "",
                address: userDetails.street_name || "",
                city: userDetails.city || "",
                postalCode: "",
                country: userDetails.country || "Uganda",
              })
              setMpesaPhone(normalizedPhone)
            } catch (err) {
              console.error("Fetch user details error:", err)
              setShippingInfo({
                firstName: userData.username?.split(" ")[0] || "",
                lastName: userData.username?.split(" ")[1] || "",
                email: userData.email || "",
                phone: "",
                address: "",
                city: "",
                postalCode: "",
                country: "Uganda",
              })
              setMpesaPhone("")
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

  const totalCashback = cartItems.reduce((sum, item) => {
    const quantity = item.quantity || 1
    const adjustedPrice = getAdjustedPrice(item, quantity)
    const cashbackPercent = parseFloat(item.cashbackPercent) || 5
    const vatRate = parseFloat(item.vat) || 0.16
    const priceExclVAT = Math.round(adjustedPrice / (1 + vatRate))
    return sum + Math.round((priceExclVAT * quantity * cashbackPercent) / 100)
  }, 0)

  // Validate M-Pesa phone number
  const validateMpesaPhone = (phone) => {
    const phoneRegex = /^0[0-9]{9}$/
    return phoneRegex.test(phone)
  }

  const handleMpesaPhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "") // Allow only digits
    if (!value.startsWith("0")) {
      value = `0${value}`
    }
    if (value.length > 10) {
      value = value.slice(0, 10) // Limit to 10 digits
    }
    setMpesaPhone(value)
  }

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate shipping information
      const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city"]
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
      // Validate payment method
      if (paymentMethod === "mpesa" && !validateMpesaPhone(mpesaPhone)) {
        setError("Please enter a valid M-Pesa phone number (e.g., 0712345678)")
        return
      }
      if (!termsAccepted) {
        setError("Please accept the terms and conditions")
        return
      }
    }

    setError("")
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  // Poll order status
  const pollOrderStatus = async (orderId, maxAttempts = 30, interval = 2000) => {
    let attempts = 0
    while (attempts < maxAttempts) {
      try {
        const token = localStorage.getItem("authToken")
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const { status } = response.data
        if (status === "completed") {
          setPaymentStatus("completed")
          setOrderComplete(true)
          localStorage.removeItem("cartItems")
          const currentWallet = JSON.parse(localStorage.getItem("walletBalance")) || 0
          localStorage.setItem("walletBalance", JSON.stringify(currentWallet + totalCashback))
          return
        } else if (status === "failed") {
          setPaymentStatus("failed")
          setError("Payment failed. Please try again.")
          return
        }
        // Continue polling if status is 'pending' or 'initiated'
      } catch (err) {
        console.error("Error polling order status:", err)
        setError("Failed to verify payment status. Please try again.")
        return
      }
      await new Promise((resolve) => setTimeout(resolve, interval))
      attempts++
    }
    setPaymentStatus("failed")
    setError("Payment timed out. Please try again.")
  }

  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const orderNum = `FCL${Date.now().toString().slice(-6)}`
      setPaymentStatus("initiated")
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          cartItems,
          shippingInfo,
          paymentMethod,
          mpesaPhone: paymentMethod === "mpesa" ? mpesaPhone : null,
          orderNumber: orderNum,
          total,
          shippingCost,
          vatAmount,
          totalCashback,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setOrderNumber(orderNum)
      setOrderId(response.data.orderId)
      if (paymentMethod === "mpesa" && response.data.transactionStatus === "Initiated") {
        // Start polling for order status
        pollOrderStatus(response.data.orderId)
      } else {
        // Non-M-Pesa orders or immediate success
        setPaymentStatus("completed")
        setOrderComplete(true)
        localStorage.removeItem("cartItems")
        const currentWallet = JSON.parse(localStorage.getItem("walletBalance")) || 0
        localStorage.setItem("walletBalance", JSON.stringify(currentWallet + totalCashback))
      }
    } catch (err) {
      setPaymentStatus(null)
      setError(err.response?.data?.message || "Failed to place order. Please try again.")
    }
  }

  if (loading) return <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />

  if (paymentStatus === "initiated") {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 }, textAlign: "center" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Processing Payment
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Please check your phone ({mpesaPhone}) and complete the M-Pesa payment prompt.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Order Number: {orderNumber}
        </Typography>
      </Box>
    )
  }

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
        <Typography variant="body2" color="success.main" sx={{ mb: 4 }}>
          Cashback of {formatNumberWithCommas(totalCashback)}/= has been added to your wallet.
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
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Checkout
      </Typography>
      {user && (
        <Typography variant="body1" sx={{ mb: 2 }}>
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
                    }}
                  />
                )
              }}
            >
              {!isMobile && label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {activeStep === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Shipping Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name *"
                    value={shippingInfo.firstName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name *"
                    value={shippingInfo.lastName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                    required
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address *"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City *"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={shippingInfo.postalCode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {activeStep === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <FormControlLabel value="mpesa" control={<Radio />} label="M-Pesa Mobile Money" />
                  <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" disabled />
                  <FormControlLabel value="bank" control={<Radio />} label="Bank Transfer" disabled />
                </RadioGroup>
              </FormControl>

              {paymentMethod === "mpesa" && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="M-Pesa Phone Number"
                    placeholder="0712345678"
                    value={mpesaPhone}
                    onChange={handleMpesaPhoneChange}
                    error={!validateMpesaPhone(mpesaPhone) && mpesaPhone !== ""}
                    helperText={
                      !validateMpesaPhone(mpesaPhone) && mpesaPhone !== ""
                        ? "Phone number must be 10 digits starting with 0 (e.g., 0712345678)"
                        : ""
                    }
                    inputProps={{ maxLength: 10 }}
                    sx={{ mb: 2 }}
                  />
                  <Alert severity="info">
                    You will receive an M-Pesa prompt on your phone to complete the payment.
                  </Alert>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={<Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />}
                  label="I accept the terms and conditions and privacy policy"
                />
              </Box>
            </Paper>
          )}

          {activeStep === 2 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Confirmation
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Please review your order details before placing the order.
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Shipping Information:
                </Typography>
                <Typography variant="body2">
                  {shippingInfo.firstName} {shippingInfo.lastName}
                </Typography>
                <Typography variant="body2">{shippingInfo.email}</Typography>
                <Typography variant="body2">{shippingInfo.phone}</Typography>
                <Typography variant="body2">
                  {shippingInfo.address}, {shippingInfo.city}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Payment Method:
                </Typography>
                <Typography variant="body2">
                  {paymentMethod === "mpesa" && validateMpesaPhone(mpesaPhone)
                    ? `M-Pesa (${mpesaPhone})`
                    : paymentMethod}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Order Items:
                </Typography>
                {cartItems.map((item) => (
                  <Box key={item.id} sx={{ display: "flex", mb: 2 }}>
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{ width: 50, height: 50, objectFit: "contain", mr: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Qty: {item.quantity || 1}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {formatNumberWithCommas(getAdjustedPrice(item, item.quantity || 1) * (item.quantity || 1))}/=
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button onClick={() => navigate("/cart")} startIcon={<ArrowBack />} sx={{ textTransform: "none" }}>
              Back to Cart
            </Button>
            <Box>
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 1, textTransform: "none" }}>
                  Back
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                  sx={{ textTransform: "none" }}
                >
                  Next
                </Button>
              ) : (
                <Button variant="contained" color="success" onClick={handlePlaceOrder} sx={{ textTransform: "none" }}>
                  Place Order
                </Button>
              )}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: "sticky", top: 20 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Order Summary
            </Typography>

            {cartItems.map((item) => (
              <Box key={item.id} sx={{ display: "flex", mb: 2 }}>
                <Box
                  component="img"
                  src={item.image}
                  alt={item.name}
                  sx={{ width: 50, height: 50, objectFit: "contain", mr: 2 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qty: {item.quantity || 1}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {formatNumberWithCommas(getAdjustedPrice(item, item.quantity || 1) * (item.quantity || 1))}/=
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography>Subtotal (Excl. VAT):</Typography>
              <Typography>{formatNumberWithCommas(subtotalExclVAT)}/=</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography>Shipping:</Typography>
              <Typography>{formatNumberWithCommas(shippingCost)}/=</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography>VAT:</Typography>
              <Typography>{formatNumberWithCommas(vatAmount)}/=</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography color="success.main">Cashback:</Typography>
              <Typography color="success.main">-{formatNumberWithCommas(totalCashback)}/=</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatNumberWithCommas(total + shippingCost)}/=
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}