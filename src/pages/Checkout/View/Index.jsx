"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Grid, Button, TextField, FormControl, RadioGroup,
  FormControlLabel, Radio, Divider, Stepper, Step, StepLabel, Checkbox,
  Alert, CircularProgress, useMediaQuery, useTheme, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import { ArrowBack, ArrowForward, CheckCircle, LocalShipping, Payment, Receipt } from "@mui/icons-material";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const formatNumberWithCommas = (number) => {
  if (isNaN(number) || number === null || number === undefined) return "0.00";
  const [integerPart, decimalPart = ""] = Number(number).toFixed(2).split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${formattedInteger}.${decimalPart.padEnd(2, "0")}`;
};

const getPriceTier = (item, quantity) => {
  return item.tier_pricing.find(tier => 
    quantity >= tier.min_quantity && (!tier.max_quantity || quantity <= tier.max_quantity)
  ) || item.tier_pricing[0] || { price: item.price };
};

const getAdjustedPrice = (item, quantity) => {
  const tier = getPriceTier(item, quantity);
  return Number(parseFloat(tier.price) || item.price).toFixed(2);
};

const steps = ["Shipping Information", "Payment Method", "Order Confirmation"];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeStep, setActiveStep] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [shippingInfo, setShippingInfo] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Uganda",
  });
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    if (token && userData?.userType === "customer") {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUser(userData);
          const fetchUserDetails = async () => {
            try {
              setLoading(true);
              const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const userDetails = response.data;
              const userPhone = userDetails.phone_number || "";
              const formattedPhone = userPhone.length === 9 && /^\d{9}$/.test(userPhone) 
                ? `0${userPhone}` 
                : userPhone || "0123456789";
              setShippingInfo({
                username: userDetails.name || userData.username || "",
                email: userDetails.email || userData.email || "",
                phone: formattedPhone,
                address: userDetails.street_name || "",
                city: userDetails.city || "",
                country: userDetails.country || "Uganda",
              });
              setMpesaPhone(formattedPhone);
            } catch (err) {
              console.error("Fetch user details error:", err);
              setShippingInfo({
                username: userData.username || "",
                email: userData.email || "",
                phone: "0123456789",
                address: "",
                city: "",
                country: "Uganda",
              });
            } finally {
              setLoading(false);
            }
          };
          fetchUserDetails();
        } else {
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          setError("Session expired. Please log in to continue.");
          setTimeout(() => navigate("/login?redirect=/checkout"), 2000);
        }
      } catch (err) {
        console.error("Token decode error:", err);
        setError("Invalid session. Please log in to continue.");
        setTimeout(() => navigate("/login?redirect=/checkout"), 2000);
      }
    } else {
      setError("Please log in to access checkout.");
      setTimeout(() => navigate("/login?redirect=/checkout"), 2000);
    }
  }, [navigate]);

  useEffect(() => {
    const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    if (storedCartItems.length === 0 && isAuthenticated) {
      setError("Your cart is empty. Please add items to continue.");
      navigate("/cart");
      return;
    }
    const validItems = storedCartItems
      .filter((item) => {
        if (!item.id || isNaN(Number(item.id)) || Number(item.id) < 1) {
          console.warn(`Invalid cart item detected: ${JSON.stringify(item)}`);
          return false;
        }
        return true;
      })
      .map((item) => ({
        ...item,
        id: Number(item.id),
        quantity: Number(item.quantity) || 1,
        price: Number(getAdjustedPrice(item, Number(item.quantity) || 1)).toFixed(2),
        tier_pricing: item.tier_pricing || [],
        cashbackPercent: Number(item.cashbackPercent || (item.cashback ? Math.round((item.cashback / item.price) * 100) : 5)).toFixed(2),
        vat: Number(item.vat || 0.16).toFixed(2),
      }));
    if (validItems.length === 0 && storedCartItems.length > 0) {
      setError("Invalid items were removed from your cart. Please add products again.");
      localStorage.setItem("cartItems", JSON.stringify(validItems));
      navigate("/cart");
      return;
    }
    setCartItems(validItems);
  }, [navigate, isAuthenticated]);

  const VAT_RATE = 0.16;

  const subtotalExclVAT = cartItems.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 1;
    const adjustedPrice = Number(getAdjustedPrice(item, quantity));
    const priceExclVAT = Number((adjustedPrice / (1 + VAT_RATE)).toFixed(2));
    return Number(sum) + Number((priceExclVAT * quantity).toFixed(2));
  }, 0).toFixed(2);

  const vatAmount = Number((subtotalExclVAT * VAT_RATE).toFixed(2));

  const shippingCost = 299;

  const total = Math.round(Number(subtotalExclVAT) + Number(vatAmount) + Number(shippingCost));

  const cashbackTotal = cartItems.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 1;
    const adjustedPrice = Number(getAdjustedPrice(item, quantity));
    const priceExclVAT = Number((adjustedPrice / (1 + VAT_RATE)).toFixed(2));
    const subtotalExclVAT = Number((priceExclVAT * quantity).toFixed(2));
    const cashbackPercent = Number(item.cashbackPercent) || 5;
    return sum + Number((subtotalExclVAT * (cashbackPercent / 100)).toFixed(2));
  }, 0).toFixed(2);

  const handleNext = () => {
    if (activeStep === 0) {
      const requiredFields = ["username", "email", "phone", "address", "city"];
      const isValid = requiredFields.every((field) => shippingInfo[field].trim() !== "");
      if (!isValid) {
        setError("Please fill in all required fields");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
        setError("Please enter a valid email address");
        return;
      }
    }

    if (activeStep === 1) {
      if (!termsAccepted) {
        setError("Please accept the terms and conditions");
        return;
      }
      if (paymentMethod === "mpesa" && (!/^(0)\d{9}$/.test(mpesaPhone))) {
        setError("Please enter a valid M-Pesa phone number (0 followed by 9 digits)");
        return;
      }
      if (paymentMethod === "card") {
        if (!/^\d{16}$/.test(cardDetails.cardNumber)) {
          setError("Please enter a valid 16-digit card number");
          return;
        }
        if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardDetails.expiry)) {
          setError("Please enter a valid expiry date (MM/YY)");
          return;
        }
        if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
          setError("Please enter a valid CVV (3 or 4 digits)");
          return;
        }
      }
    }

    setError("");
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCardDetailsChange = (field) => (e) => {
    let value = e.target.value;
    if (field === "cardNumber" && !/^\d*$/.test(value)) return;
    if (field === "cvv" && !/^\d*$/.test(value)) return;
    if (field === "expiry") {
      value = value.replace(/[^0-9/]/g, "");
      if (value.length === 2 && !value.includes("/")) {
        value = value + "/";
      }
      if (value.length > 5) {
        value = value.slice(0, 5);
      }
    }
    setCardDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please log in to place an order.");
        setLoading(false);
        return;
      }
      if (cartItems.length === 0) {
        setError("Cart is empty. Please add items to your cart.");
        setLoading(false);
        return;
      }

      const invalidItems = cartItems.filter(item => !item.id || isNaN(Number(item.id)) || Number(item.id) < 1);
      if (invalidItems.length > 0) {
        setError("Invalid cart items detected. Please review your cart.");
        console.error("Invalid cart items:", invalidItems);
        setLoading(false);
        return;
      }

      const paymentDetails = paymentMethod === "mpesa" 
        ? { mpesaPhone }
        : { cardNumber: `**** **** **** ${cardDetails.cardNumber.slice(-4)}` };

      const orderData = {
        shippingInfo,
        paymentMethod,
        paymentDetails,
        cartItems: cartItems.map(item => ({
          id: Number(item.id),
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(getAdjustedPrice(item, Number(item.quantity) || 1)),
          vatRate: Number(item.vat) || 0.16,
          cashbackPercent: Number(item.cashbackPercent) || 5,
        })),
        subtotalExclVAT: Number(subtotalExclVAT),
        vatAmount: Number(vatAmount),
        shippingCost: Number(shippingCost),
        total: Number(total),
      };

      console.log("Order data sent to backend:", JSON.stringify(orderData, null, 2));

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrderNumber(response.data.orderNumber);
      setOrderId(response.data.orderId);
      setOrderComplete(true);
      localStorage.removeItem("cartItems");
    } catch (err) {
      console.error("Order placement error:", {
        message: err.response?.data?.message,
        errors: err.response?.data?.errors,
        status: err.response?.status,
        fullResponse: err.response?.data,
      });
      const errorMessage = err.response?.data?.errors
        ? err.response.data.errors.map(e => e.msg).join("; ")
        : err.response?.data?.message || "Failed to place order. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />;

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
    );
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
                const icons = [LocalShipping, Payment, Receipt];
                const Icon = icons[index];
                return (
                  <Icon
                    sx={{
                      color: completed ? "success.main" : active ? "primary.main" : "text.disabled",
                      fontSize: 32,
                    }}
                  />
                );
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
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Input paying Phone Number *"
                    value={mpesaPhone}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value) && value.length <= 10) {
                        setMpesaPhone(value);
                      }
                    }}
                    required
                    variant="outlined"
                    size="medium"
                    inputProps={{ pattern: "^(0)\\d{9}$", maxLength: 10 }}
                    helperText="Enter a valid phone number starting with 0 (10 digits)"
                  />
                </Box>
              )}
              {paymentMethod === "card" && (
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Card Number *"
                        value={cardDetails.cardNumber}
                        onChange={handleCardDetailsChange("cardNumber")}
                        required
                        variant="outlined"
                        size="medium"
                        inputProps={{ maxLength: 16 }}
                        helperText="Enter a 16-digit card number"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Expiry Date *"
                        value={cardDetails.expiry}
                        onChange={handleCardDetailsChange("expiry")}
                        required
                        variant="outlined"
                        size="medium"
                        placeholder="MM/YY"
                        helperText="Enter expiry date in MM/YY format"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="CVV *"
                        value={cardDetails.cvv}
                        onChange={handleCardDetailsChange("cvv")}
                        required
                        variant="outlined"
                        size="medium"
                        inputProps={{ maxLength: 4 }}
                        helperText="Enter 3 or 4-digit CVV"
                      />
                    </Grid>
                  </Grid>
                </Box>
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
                  {paymentMethod === "mpesa" ? "M-Pesa Mobile Money" : paymentMethod === "card" ? "Credit/Debit Card" : "Bank Transfer"}
                </Typography>
                {paymentMethod === "mpesa" && (
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    M-Pesa Phone: {mpesaPhone}
                  </Typography>
                )}
                {paymentMethod === "card" && (
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Card Number: **** **** **** {cardDetails.cardNumber.slice(-4)}
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
                    <TableCell align="right" sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>Cashback</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => {
                    const quantity = Number(item.quantity) || 1;
                    const adjustedPrice = Number(getAdjustedPrice(item, quantity));
                    const priceExclVAT = Number((adjustedPrice / (1 + VAT_RATE)).toFixed(2));
                    const subtotalExclVAT = Number((priceExclVAT * quantity).toFixed(2));
                    const cashbackPercent = Number(item.cashbackPercent) || 5;
                    const cashbackAmount = Number((subtotalExclVAT * (cashbackPercent / 100)).toFixed(2));
                    return (
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
                        <TableCell align="right" sx={{ fontSize: "1rem" }}>{quantity}</TableCell>
                        <TableCell align="right" sx={{ fontSize: "1rem" }}>
                          {formatNumberWithCommas((adjustedPrice * quantity).toFixed(2))}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: "1rem" }}>
                          {formatNumberWithCommas(cashbackAmount)} ({cashbackPercent}%)
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">Subtotal (Excl. VAT):</Typography>
              <Typography variant="h6">{formatNumberWithCommas(subtotalExclVAT)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">Shipping:</Typography>
              <Typography variant="h6">{formatNumberWithCommas(shippingCost)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">VAT:</Typography>
              <Typography variant="h6">{formatNumberWithCommas(vatAmount)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">Cashback Total:</Typography>
              <Typography variant="h6">{formatNumberWithCommas(cashbackTotal)}</Typography>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h5" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatNumberWithCommas(total)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}