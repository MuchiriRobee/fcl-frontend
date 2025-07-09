import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box, Typography, Grid, Card, CardMedia, Button, CircularProgress,
  TextField, FormControl, InputLabel, Select, MenuItem, Stack, Snackbar, Alert
} from "@mui/material"
import { Search } from "@mui/icons-material"
import placeholderProduct from "../../assets/images/placeholder-product.png"
import ErrorBoundary from "./ErrorBoundary"

// Helper function to format numbers with commas and two decimal places
const formatCurrency = (value) => {
  if (!value && value !== 0) return "0.00"
  const num = parseFloat(value)
  if (isNaN(num)) return "0.00"
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ProductsPage() {
  const { parentCatId, categoryId, subcategoryId } = useParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("name-asc")
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  // Use VITE_BASE_URL for static assets, VITE_API_URL for API calls
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000' || 'https://fcl-back.onrender.com'

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const queryParams = new URLSearchParams()
        if (parentCatId && !isNaN(parseInt(parentCatId))) queryParams.append("parent_cat_id", parentCatId)
        if (categoryId && !isNaN(parseInt(categoryId))) queryParams.append("category_id", categoryId)
        if (subcategoryId && !isNaN(parseInt(subcategoryId))) queryParams.append("subcategory_id", subcategoryId)
        const url = `${import.meta.env.VITE_API_URL}/products${queryParams.toString() ? `?${queryParams}` : ''}`
        const response = await fetch(url)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch products")
        }
        const data = await response.json()
        // Transform API response to include tier_pricing array
        const transformedData = data.map(product => ({
          id: product.id,
          product_name: product.product_name,
          product_code: product.product_code,
          description: product.description || "No description available",
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
          ]
        }))
        setProducts(transformedData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (
      (parentCatId && isNaN(parseInt(parentCatId))) ||
      (categoryId && isNaN(parseInt(categoryId))) ||
      (subcategoryId && isNaN(parseInt(subcategoryId)))
    ) {
      setError("Invalid category IDs")
      setLoading(false)
      return
    }
    fetchProducts()
  }, [parentCatId, categoryId, subcategoryId])

  const addToCart = (product) => {
    const quantity = 1 // Default quantity
    const selectedTier = product.tier_pricing.find(tier => 
      quantity >= tier.min_quantity && (!tier.max_quantity || quantity <= tier.max_quantity)
    ) || product.tier_pricing[0] // Fallback to first tier

    const cashbackPercent = parseFloat(product.cashback_rate || 0).toFixed(2)
    const cartItem = {
      id: `item${product.id}`,
      name: product.product_name,
      description: product.description,
      price: parseFloat(selectedTier.price),
      basePrice: parseFloat(selectedTier.price),
      cashbackPercent,
      image: product.image_url ? `${baseUrl}${product.image_url}` : placeholderProduct,
      itemCode: product.product_code,
      tier_pricing: product.tier_pricing,
      quantity,
    }

    const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || []
    const updatedCart = [...existingCartItems, cartItem]
    localStorage.setItem("cartItems", JSON.stringify(updatedCart))

    setSnackbarMessage(`${product.product_name} added to cart! You'll earn ${cashbackPercent}% cashback.`)
    setSnackbarOpen(true)
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const CategoryCard = ({ product }) => {
    const [imageError, setImageError] = useState(false)

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
          {product.product_name} - {product.description}
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
    )
  }

  const filteredProducts = products
    .filter(product => product.product_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name-asc") return a.product_name.localeCompare(b.product_name)
      if (sort === "name-desc") return b.product_name.localeCompare(a.product_name)
      if (sort === "price-asc") return (a.tier_pricing[0]?.price || 0) - (b.tier_pricing[0]?.price || 0)
      if (sort === "price-desc") return (b.tier_pricing[0]?.price || 0) - (a.tier_pricing[0]?.price || 0)
      return 0
    })

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
  )
}