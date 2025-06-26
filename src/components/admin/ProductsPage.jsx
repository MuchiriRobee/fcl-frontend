import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box, Typography, Grid, Card, CardMedia, Button, CircularProgress,
  TextField, FormControl, InputLabel, Select, MenuItem, Stack, Snackbar, Alert
} from "@mui/material"
import { Search } from "@mui/icons-material"
import placeholderProduct from "../../assets/images/placeholder-product.png"

// Helper function to format numbers with commas
const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export default function ProductsPage() {
  const { categoryId, subcategoryId } = useParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("name-asc")
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const baseUrl = 'http://localhost:5000' // Base URL for images

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const url = `${import.meta.env.VITE_API_URL}/products${
          categoryId ? `?categoryId=${categoryId}` : ''
        }${subcategoryId ? `${categoryId ? '&' : '?'}subcategoryId=${subcategoryId}` : ''}`
        const response = await fetch(url)
        if (!response.ok) throw new Error("Failed to fetch products")
        const data = await response.json()
        console.log('Fetched products:', data.map(p => ({ id: p.id, image_url: p.image_url })))
        setProducts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [categoryId, subcategoryId])

  const addToCart = (product) => {
    const cartItem = {
      id: `item${product.id}`,
      name: product.product_name,
      size: "medium",
      color: "blue",
      material: "Plastic",
      seller: "Artist Market",
      price: product.selling_price1,
      basePrice: product.selling_price1,
      cashbackPercent: product.cashback_rate || 5,
      image: product.image_url ? `${baseUrl}${product.image_url}` : placeholderProduct,
      itemCode: product.product_code,
    }

    const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || []
    const updatedCart = [...existingCartItems, cartItem]
    localStorage.setItem("cartItems", JSON.stringify(updatedCart))

    setSnackbarMessage(`${product.product_name} added to cart! You'll earn ${product.cashback_rate || 5}% cashback.`)
    setSnackbarOpen(true)

    navigate("/cart")
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const CategoryCard = ({ product }) => (
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
        {product.cashback_rate || 5}% Cashback
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
          image={product.image_url ? `${baseUrl}${product.image_url}` : placeholderProduct}
          alt={`Image of ${product.product_name}`}
          sx={{
            maxWidth: "100%",
            maxHeight: 150,
            objectFit: "contain",
            margin: "auto",
          }}
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
        {product.product_name} - {product.description || 'No description available.'}
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
                  KSh {formatNumberWithCommas(tier.price.toFixed(0))}
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

  const filteredProducts = products
    .filter(product => product.product_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name-asc") return a.product_name.localeCompare(b.product_name)
      if (sort === "name-desc") return b.product_name.localeCompare(b.product_name)
      if (sort === "price-asc") return (a.selling_price1 || 0) - (b.selling_price1 || 0)
      if (sort === "price-desc") return (b.selling_price1 || 0) - (a.selling_price1 || 0)
      return 0
    })
    .slice(0, 4)

  if (loading) return <Box sx={{ textAlign: "center", p: 4 }}><CircularProgress /></Box>
  if (error) return <Typography color="error" sx={{ p: 4 }}>{error}</Typography>

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>Products</Typography>
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
        {filteredProducts.length === 0 && (
          <Typography variant="body1" sx={{ p: 4, width: "100%" }}>
            No products found for this category or subcategory.
          </Typography>
        )}
        {filteredProducts.map(product => (
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
  )
}