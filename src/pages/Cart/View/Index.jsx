"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Grid, Button, Divider, IconButton, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  useMediaQuery, useTheme, Chip, Alert
} from "@mui/material";
import { KeyboardArrowDown, ArrowBack, KeyboardArrowUp, DeleteOutline } from "@mui/icons-material";

// Helper function to format numbers with commas and two decimal places
const formatNumberWithCommas = (number) => {
  if (isNaN(number) || number === null || number === undefined) return "0.00";
  const [integerPart, decimalPart = ""] = Number(number).toFixed(2).split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${formattedInteger}.${decimalPart.padEnd(2, "0")}`;
};

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState("");
  const [quantities, setQuantities] = useState({});

  // Load cart items from localStorage on mount
  useEffect(() => {
    const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
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
        cashbackPercent: Number(item.cashbackPercent || (item.cashback ? (item.cashback / item.price) * 100 : 5)).toFixed(2),
        tier_pricing: item.tier_pricing || [],
        quantity: Number(item.quantity) || 1,
        price: Number(item.price || 0).toFixed(2),
        vat: Number(item.vat || 0.16).toFixed(2),
      }));
    if (validItems.length !== storedCartItems.length) {
      localStorage.setItem("cartItems", JSON.stringify(validItems));
      if (validItems.length === 0 && storedCartItems.length > 0) {
        setError("Invalid items were removed from your cart. Please add products again.");
      }
    }
    setCartItems(validItems);
  }, []);

  // Initialize quantities state
  useEffect(() => {
    const initialQuantities = {};
    cartItems.forEach((item) => {
      initialQuantities[item.id] = Number(item.quantity) || 1;
    });
    setQuantities(initialQuantities);
  }, [cartItems]);

  // Update localStorage when quantities change
  useEffect(() => {
    if (cartItems.length > 0) {
      const updatedCartItems = cartItems.map((item) => ({
        ...item,
        quantity: Number(quantities[item.id] || 1),
        price: Number(getAdjustedPrice(item, quantities[item.id] || 1)).toFixed(2),
      }));
      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
      // Do not call setCartItems to avoid infinite loop
    }
  }, [quantities, cartItems]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));

  const getPriceTier = (item, quantity) => {
    return (
      item.tier_pricing.find(
        (tier) =>
          quantity >= tier.min_quantity &&
          (!tier.max_quantity || quantity <= tier.max_quantity)
      ) || item.tier_pricing[0] || { price: item.price }
    );
  };

  const getAdjustedPrice = (item, quantity) => {
    const tier = getPriceTier(item, quantity);
    return Number(parseFloat(tier.price) || item.price).toFixed(2);
  };

  const getTierLabel = (item, quantity) => {
    const tier = getPriceTier(item, quantity);
    if (!tier) return "N/A";
    return tier.max_quantity
      ? `${tier.min_quantity}-${tier.max_quantity} PC`
      : `${tier.min_quantity}+ PC`;
  };

  const increaseQuantity = (itemId) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 1) + 1,
    }));
  };

  const decreaseQuantity = (itemId) => {
    if (quantities[itemId] > 1) {
      setQuantities((prev) => ({
        ...prev,
        [itemId]: prev[itemId] - 1,
      }));
    }
  };

  const removeItem = (itemId) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCartItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
  };

  const VAT_RATE = 0.16;

  const subtotalExclVAT = cartItems.reduce((sum, item) => {
    const quantity = quantities[item.id] || 1;
    const adjustedPrice = Number(getAdjustedPrice(item, quantity));
    const priceExclVAT = Number((adjustedPrice / (1 + VAT_RATE)).toFixed(2));
    return Number(sum) + Number((priceExclVAT * quantity).toFixed(2));
  }, 0).toFixed(2);

  const vatAmount = Number((subtotalExclVAT * VAT_RATE).toFixed(2));

  const total = Math.round(Number(subtotalExclVAT) + Number(vatAmount));

  const calculateCashback = (item, quantity) => {
    const cashbackPercent = Number(item.cashbackPercent) || 0;
    const adjustedPrice = Number(getAdjustedPrice(item, quantity));
    const priceExclVAT = Number((adjustedPrice / (1 + VAT_RATE)).toFixed(2));
    return Number(((priceExclVAT * quantity * cashbackPercent) / 100).toFixed(2));
  };

  const totalCashback = cartItems.reduce((sum, item) => {
    const quantity = quantities[item.id] || 1;
    return Number(sum) + Number(calculateCashback(item, quantity));
  }, 0).toFixed(2);

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  const handleCheckout = () => {
    const invalidItems = cartItems.filter(
      (item) => !item.id || isNaN(Number(item.id)) || Number(item.id) < 1
    );
    if (invalidItems.length > 0) {
      setError("Invalid cart items detected. Please remove them and try again.");
      console.error("Invalid cart items:", invalidItems);
      return;
    }
    window.location.href = "/checkout";
  };

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, fontSize: "1.1rem" }}>
          {error}
        </Alert>
      )}
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}
      >
        My cart ({cartItems.length})
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ mb: 3 }}>
            {cartItems.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary">
                  Your cart is empty
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ArrowBack />}
                  sx={{
                    mt: 2,
                    textTransform: "none",
                    bgcolor: "#1976d2",
                    "&:hover": { bgcolor: "#1565c0" },
                  }}
                  onClick={() => (window.location.href = "/")}
                >
                  Continue Shopping
                </Button>
              </Box>
            ) : isMobile || isTablet ? (
              <Box>
                {cartItems.map((item) => {
                  const quantity = quantities[item.id] || 1;
                  const adjustedPrice = getAdjustedPrice(item, quantity);
                  const tierLabel = getTierLabel(item, quantity);

                  return (
                    <Paper key={item.id} sx={{ mb: 2, p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.name}
                            sx={{
                              width: "100%",
                              height: "auto",
                              objectFit: "contain",
                            }}
                          />
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body1" fontWeight="medium" gutterBottom>
                            {item.name}
                          </Typography>
                          <Chip
                            label={`Item Code: ${item.itemCode || "N/A"}`}
                            size="small"
                            sx={{
                              mb: 1,
                              fontSize: "0.85rem",
                              height: "24px",
                              backgroundColor: "#f0f7ff",
                              color: theme.palette.primary.main,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Tier: {tierLabel}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cashback: {Number(item.cashbackPercent).toFixed(2)}%
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                              Qty:
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                border: "1px solid #c4c4c4",
                                borderRadius: "4px",
                                width: "100px",
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => decreaseQuantity(item.id)}
                                disabled={quantities[item.id] <= 1}
                                sx={{ p: 1 }}
                              >
                                <KeyboardArrowDown fontSize="small" />
                              </IconButton>
                              <Typography
                                variant="body2"
                                sx={{
                                  flex: 1,
                                  textAlign: "center",
                                  userSelect: "none",
                                  fontSize: "1rem",
                                }}
                              >
                                {quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => increaseQuantity(item.id)}
                                sx={{ p: 1 }}
                              >
                                <KeyboardArrowUp fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            align="right"
                            sx={{ fontSize: "1.1rem" }}
                          >
                            {formatNumberWithCommas(adjustedPrice)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" align="right">
                            per item
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="body2" color="success.main" sx={{ fontSize: "0.95rem" }}>
                            Cashback: {formatNumberWithCommas(calculateCashback(item, quantity))}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            align="right"
                            sx={{ fontSize: "1.1rem" }}
                          >
                            Total (Excl. VAT): {formatNumberWithCommas((adjustedPrice * quantity).toFixed(2))}
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => removeItem(item.id)}
                              startIcon={<DeleteOutline />}
                              sx={{
                                borderRadius: 1,
                                textTransform: "none",
                                px: 2,
                                py: 1,
                                fontSize: "0.9rem",
                              }}
                            >
                              Remove
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                })}
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2}>Product</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Cashback</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item) => {
                      const quantity = quantities[item.id] || 1;
                      const adjustedPrice = getAdjustedPrice(item, quantity);
                      const tierLabel = getTierLabel(item, quantity);

                      return (
                        <TableRow key={item.id}>
                          <TableCell sx={{ width: "80px", padding: "16px 8px" }}>
                            <Box
                              component="img"
                              src={item.image}
                              alt={item.name}
                              sx={{
                                width: "100%",
                                maxWidth: 70,
                                height: "auto",
                                objectFit: "contain",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body1"
                              fontWeight="medium"
                              gutterBottom
                              sx={{ fontSize: "1rem" }}
                            >
                              {item.name}
                            </Typography>
                            <Chip
                              label={`Item Code: ${item.itemCode || "N/A"}`}
                              size="small"
                              sx={{
                                mb: 1,
                                fontSize: "0.85rem",
                                height: "24px",
                                backgroundColor: "#f0f7ff",
                                color: theme.palette.primary.main,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Tier: {tierLabel}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Cashback: {Number(item.cashbackPercent).toFixed(2)}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                border: "1px solid #c4c4c4",
                                borderRadius: "4px",
                                width: "70px",
                                margin: "0 auto",
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => increaseQuantity(item.id)}
                                sx={{ p: 0.5 }}
                              >
                                <KeyboardArrowUp fontSize="small" />
                              </IconButton>
                              <Typography
                                variant="body2"
                                sx={{
                                  textAlign: "center",
                                  userSelect: "none",
                                  py: 0.5,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => decreaseQuantity(item.id)}
                                disabled={quantity <= 1}
                                sx={{ p: 0.5 }}
                              >
                                <KeyboardArrowDown fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: "1rem" }}>
                            {formatNumberWithCommas(adjustedPrice)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {formatNumberWithCommas((adjustedPrice * quantity).toFixed(2))}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "success.main", fontSize: "1rem" }}>
                            {formatNumberWithCommas(calculateCashback(item, quantity))}
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={() => removeItem(item.id)}
                                sx={{
                                  borderRadius: 1,
                                  textTransform: "none",
                                  minWidth: "auto",
                                  px: 1,
                                  fontSize: "0.9rem",
                                }}
                              >
                                <DeleteOutline fontSize="small" />
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {cartItems.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                mb: 4,
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<ArrowBack />}
                fullWidth={isMobile}
                sx={{
                  textTransform: "none",
                  bgcolor: "#1976d2",
                  "&:hover": { bgcolor: "#1565c0" },
                  fontSize: "1rem",
                }}
                onClick={() => (window.location.href = "/")}
              >
                Back to shop
              </Button>

              <Button
                variant="text"
                color="primary"
                onClick={clearCart}
                fullWidth={isMobile}
                sx={{ textTransform: "none", fontSize: "1rem" }}
              >
                Remove all
              </Button>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "#f8f9fa",
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Cashback Summary
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body1" sx={{ fontSize: "1.05rem" }}>
                Total Cashback Earned:
              </Typography>
              <Typography
                variant="body1"
                color="success.main"
                fontWeight="bold"
                sx={{ fontSize: "1.05rem" }}
              >
                {formatNumberWithCommas(totalCashback)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.95rem" }}>
              Cashback is added to your e-wallet after purchase completion.
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mb: 3,
              position: { xs: "static", lg: "sticky" },
              top: { lg: "20px" },
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Order Summary
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1" sx={{ fontSize: "1.05rem" }}>
                  Subtotal (Excl. VAT):
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.05rem" }}>
                  {formatNumberWithCommas(subtotalExclVAT)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1" sx={{ fontSize: "1.05rem" }}>
                  VAT (16%):
                </Typography>
                <Typography variant="body1" color="primary" sx={{ fontSize: "1.05rem" }}>
                  + {formatNumberWithCommas(vatAmount)}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" fontWeight="bold">
                  Total:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatNumberWithCommas(total)}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              color="success"
              fullWidth
              size={isMobile ? "large" : "medium"}
              disabled={cartItems.length === 0}
              sx={{
                textTransform: "none",
                py: { xs: 1.8, md: 1.5 },
                fontSize: { xs: "1.1rem", md: "1rem" },
                bgcolor: "#00a152",
                "&:hover": { bgcolor: "#00873e" },
                mt: 3,
              }}
              onClick={handleCheckout}
            >
              Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}