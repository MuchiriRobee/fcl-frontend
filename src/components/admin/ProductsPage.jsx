import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Card, CardMedia, Button, CircularProgress,
  TextField, FormControl, InputLabel, Select, MenuItem, Stack, Snackbar, Alert
} from "@mui/material";
import { Search } from "@mui/icons-material";
import placeholderProduct from "../../assets/images/placeholder-product.png";
import ErrorBoundary from "./ErrorBoundary";

// Helper function to format numbers with commas and two decimal places
const formatCurrency = (value) => {
  if (!value && value !== 0) return "0.00";
  const num = parseFloat(value);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function ProductsPage() {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://fcl-back.onrender.com';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!subcategoryId || isNaN(parseInt(subcategoryId))) {
          throw new Error("Invalid subcategory ID");
        }
        const url = `${import.meta.env.VITE_API_URL}/products/subcategory/${subcategoryId}`;
        console.log("Fetching products from:", url);
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response status:", response.status, "Response text:", errorText);
          let errorMessage = "Failed to fetch products";
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = "Server returned an unexpected response";
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();
        if (data.length === 0) {
          setError("No products available in this subcategory");
        }
        const transformedData = data.map(product => ({
          id: Number(product.id), // Ensure ID is a number
          product_name: product.product_name,
          product_code: product.product_code,
          description: product.description,
          image_url: product.image_url,
          uom: product.uom || "PC",
          cashback_rate: product.cashback_rate || 0,
          tier_pricing: [
            { min_quantity: product.qty1_min || 1, max_quantity: product.qty1_max || null, price: parseFloat(product.selling_price1) || 0 },
            ...(product.selling_price2 && product.qty2_min
              ? [{ min_quantity: product.qty2_min, max_quantity: product.qty2_max || null, price: parseFloat(product.selling_price2) }]
              : []),
            ...(product.selling_price3 && product.qty3_min
              ? [{ min_quantity: product.qty3_min, max_quantity: null, price: parseFloat(product.selling_price3) }]
              : []),
          ],
          vat: product.vat || 0.16, // Add vat for consistency with cart and checkout
        }));
        setProducts(transformedData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [subcategoryId]);

  const addToCart = (product) => {
    if (!product.id || isNaN(Number(product.id)) || Number(product.id) < 1) {
      console.error(`Invalid product ID: ${product.id}`);
      setSnackbarMessage("Error: Invalid product. Please try again.");
      setSnackbarOpen(true);
      return;
    }

    const quantity = 1;
    const selectedTier = product.tier_pricing.find(tier => 
      quantity >= tier.min_quantity && (!tier.max_quantity || quantity <= tier.max_quantity)
    ) || product.tier_pricing[0];
    const cashbackPercent = parseFloat(product.cashback_rate || 0).toFixed(2);
    const cartItem = {
      id: Number(product.id), // Use numeric ID
      name: product.product_name,
      description: product.description,
      price: parseFloat(selectedTier.price).toFixed(2),
      basePrice: parseFloat(selectedTier.price).toFixed(2),
      cashbackPercent,
      image: product.image_url ? `${baseUrl}${product.image_url}` : placeholderProduct,
      itemCode: product.product_code || "N/A",
      tier_pricing: product.tier_pricing,
      quantity,
      vat: product.vat || 0.16, // Add vat for consistency
    };

    const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const existingItemIndex = existingCartItems.findIndex(item => item.id === cartItem.id);

    let updatedCart;
    if (existingItemIndex >= 0) {
      updatedCart = [...existingCartItems];
      updatedCart[existingItemIndex].quantity += 1;
      const newQuantity = updatedCart[existingItemIndex].quantity;
      const newTier = product.tier_pricing.find(tier => 
        newQuantity >= tier.min_quantity && (!tier.max_quantity || newQuantity <= tier.max_quantity)
      ) || product.tier_pricing[0];
      updatedCart[existingItemIndex].price = parseFloat(newTier.price).toFixed(2);
      setSnackbarMessage(`${product.product_name} quantity updated in cart! You'll earn ${cashbackPercent}% cashback.`);
    } else {
      updatedCart = [...existingCartItems, cartItem];
      setSnackbarMessage(`${product.product_name} added to cart! You'll earn ${cashbackPercent}% cashback.`);
    }

    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const CategoryCard = ({ product }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <Card
        sx={{
          minWidth: 200,
          width: "auto",
          display: "flex",
          flexDirection: "column",
          boxShadow: "none",
          border: "1px solid #f0f0f0",
          borderRadius: 2,
          p: 2,
          position: "relative",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transform: "scale(1.02)",
            transition: "all 0.2s ease-in-out",
          },
        }}
      >
        <Typography
          variant="body2"
          color="white"
          fontWeight="bold"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: "red",
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
            fontSize: "0.9rem",
            fontWeight: 700,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            zIndex: 1,
          }}
        >
          {formatCurrency(product.cashback_rate || 0)}% Cashback
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 150,
            mt: 4,
            mb: 1,
          }}
        >
          <CardMedia
            component="img"
            image={imageError || !product.image_url ? placeholderProduct : `${baseUrl}${product.image_url}`}
            alt={`Image of ${product.product_name}`}
            sx={{
              maxWidth: "100%",
              maxHeight: 150,
              objectFit: "contain",
              margin: "auto",
            }}
            onError={() => setImageError(true)}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight="bold"
          sx={{
            fontSize: "0.85rem",
            overflowWrap: "break-word",
          }}
        >
          Item code: {product.product_code}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            my: 1,
            fontSize: "0.95rem",
            lineHeight: 1.3,
            overflowWrap: "break-word",
          }}
        >
          {product.product_name} 
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            mt: "auto",
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "table",
              tableLayout: "auto",
              borderCollapse: "separate",
              borderSpacing: "4px",
            }}
          >
            <Box sx={{ display: "table-row" }}>
              {product.tier_pricing.map((tier, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "table-cell",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    p: 0.5,
                    textAlign: "center",
                    verticalAlign: "middle",
                    minWidth: 80,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      lineHeight: 1.2,
                      overflowWrap: "break-word",
                    }}
                  >
                    {tier.max_quantity
                      ? `${tier.min_quantity}-${tier.max_quantity} ${product.uom}`
                      : `${tier.min_quantity}+ ${product.uom}`}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      lineHeight: 1.2,
                      overflowWrap: "break-word",
                    }}
                  >
                    KSh {formatCurrency(tier.price)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={() => addToCart(product)}
          sx={{
            backgroundColor: theme => theme.palette.primary.main,
            color: "white",
            fontSize: "0.9rem",
            py: 0.8,
            mt: 1,
            textTransform: "none",
            "&:hover": {
              backgroundColor: theme => theme.palette.primary.dark,
            },
          }}
        >
          ADD TO CART
        </Button>
      </Card>
    );
  };

  const filteredProducts = products
    .filter(product => product.product_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name-asc") return a.product_name.localeCompare(b.product_name);
      if (sort === "name-desc") return b.product_name.localeCompare(a.product_name);
      if (sort === "price-asc") return (a.tier_pricing[0]?.price || 0) - (b.tier_pricing[0]?.price || 0);
      if (sort === "price-desc") return (b.tier_pricing[0]?.price || 0) - (a.tier_pricing[0]?.price || 0);
      return 0;
    });

  return (
    <ErrorBoundary>
      <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>
          Products
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
          <TextField
            label="Search Products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <Search />, 'aria-label': 'Search products' }}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} label="Sort By">
              <MenuItem value="name-asc">Name (A-Z)</MenuItem>
              <MenuItem value="name-desc">Name (Z-A)</MenuItem>
              <MenuItem value="price-asc">Price (Low to High)</MenuItem>
              <MenuItem value="price-desc">Price (High to Low)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Grid container spacing={2} sx={{ justifyContent: "space-between" }}>
          {loading && (
            <Box sx={{ textAlign: "center", p: 4, width: "100%" }}>
              <CircularProgress />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Loading products...
              </Typography>
            </Box>
          )}
          {error && (
            <Typography color="error" sx={{ p: 4, width: "100%" }}>
              {error}
            </Typography>
          )}
          {!loading && !error && filteredProducts.length === 0 && (
            <Typography variant="body1" sx={{ p: 4, width: "100%" }}>
              No products found. Try adjusting your search or category filters.
            </Typography>
          )}
          {!loading && !error && filteredProducts.map(product => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <CategoryCard product={product} />
            </Grid>
          ))}
        </Grid>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ErrorBoundary>
  );
}