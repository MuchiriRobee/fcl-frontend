import { useState } from "react"
import { Box, Card, Typography, CardMedia, Button, Snackbar, Alert, useTheme } from "@mui/material"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"

import softChairsImage from "../../assets/images/1.png"
import sofaChairImage from "../../assets/images/2.png"
import kitchenDishesImage from "../../assets/images/11.png"
import smartWatchesImage from "../../assets/images/8.png"
import kitchenMixerImage from "../../assets/images/9.png"
import blendersImage from "../../assets/images/12.png"
import homeApplianceImage from "../../assets/images/10.png"
import coffeeMakerImage from "../../assets/images/13.png"

// Helper function to format numbers with commas
const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const categories = [
  { id: 1, name: "Soft chairs", price: 1900000, cashback: 5, image: softChairsImage, itemCode: "SC001" },
  { id: 2, name: "Sofa & chair", price: 1900000, cashback: 3, image: sofaChairImage, itemCode: "SC002" },
  { id: 3, name: "Kitchen dishes", price: 1900000, cashback: 7, image: kitchenDishesImage, itemCode: "KD001" },
  { id: 4, name: "Smart watches", price: 1900000, cashback: 10, image: smartWatchesImage, itemCode: "SW001" },
  { id: 5, name: "Kitchen mixer", price: 10000000, cashback: 15, image: kitchenMixerImage, itemCode: "KM001" },
  { id: 6, name: "Blenders", price: 3900000, cashback: 8, image: blendersImage, itemCode: "BL001" },
  { id: 7, name: "Home appliance", price: 1900000, cashback: 6, image: homeApplianceImage, itemCode: "HA001" },
  { id: 8, name: "Coffee maker", price: 1000000, cashback: 12, image: coffeeMakerImage, itemCode: "CM001" },
]

const ProductCategories = ({ header }) => {
  const theme = useTheme()
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")

  // Function to add item to cart
  const addToCart = (category) => {
    // Create a cart item from the category
    const cartItem = {
      id: `item${category.id}`,
      name: category.name,
      size: "medium",
      color: "blue",
      material: "Plastic",
      seller: "Artist Market",
      price: category.price,
      basePrice: category.price, // Store the base price for tier calculations
      cashbackPercent: category.cashback || 5, // Store the cashback percentage correctly
      image: category.image,
      itemCode: category.itemCode || `PROD-${Math.floor(Math.random() * 10000)}`,
    }

    // Get existing cart items from localStorage or initialize empty array
    const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || []

    // Add new item to cart
    const updatedCart = [...existingCartItems, cartItem]

    // Save updated cart to localStorage
    localStorage.setItem("cartItems", JSON.stringify(updatedCart))

    // Show notification
    setSnackbarMessage(`${category.name} added to cart! You'll earn ${category.cashback || 5}% cashback.`)
    setSnackbarOpen(true)
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const CategoryCard = ({ category }) => (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "none",
        border: "1px solid #f0f0f0",
        borderRadius: 2,
        p: 2,
        position: "relative",
        minHeight: 320,
        "&:hover": {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* Cashback Badge */}
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
          fontSize: "0.9rem", // Increased font size from 12px
          fontWeight: 700,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          zIndex: 1,
        }}
      >
        {category.cashback}% Cashback
      </Typography>

      {/* Image - Fixed consistent height */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 150,
          mt: 4,
          mb: 1,
        }}
      >
        <CardMedia
          component="img"
          image={category.image}
          alt={category.name}
          sx={{
            maxWidth: 130,
            maxHeight: 130,
            objectFit: "contain",
            margin: "auto",
          }}
        />
      </Box>

      {/* Item code - Increased font size */}
      <Typography variant="body2" color="text.secondary" fontWeight="bold" sx={{ fontSize: "0.85rem" }}>
        Item code: {category.itemCode}
      </Typography>

      {/* Item description - Increased font size */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          my: 1,
          fontSize: "0.95rem", // Increased from 0.75rem
          lineHeight: 1.3,
        }}
      >
        {category.name} - This is a sample product description.
      </Typography>

      {/* Pricing section - Cleaner layout with increased font sizes */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: "auto",
          mb: 1,
          position: "relative",
        }}
      >
        {/* Simple table-like layout for pricing */}
        <Box
          sx={{
            width: "100%",
            display: "table",
            tableLayout: "fixed",
            borderCollapse: "separate",
            borderSpacing: "4px",
          }}
        >
          <Box sx={{ display: "table-row" }}>
            {[
              { label: "1-3 PC", price: category.price },
              { label: "4-11 PC", price: category.price * 0.95 }, // Changed from 1.05 to 0.95 (5% discount)
              { label: "12 PC+", price: category.price * 0.9 }, // Changed from 0.95 to 0.90 (10% discount)
            ].map((tier, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "table-cell",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  p: 0.5,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.8rem", // Increased from 0.6rem
                    fontWeight: 600,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tier.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.8rem", // Increased from 0.6rem
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatNumberWithCommas(tier.price.toFixed(0))}/=
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Add to Cart Button - Full width at bottom */}
      <Button
        variant="contained"
        fullWidth
        onClick={() => addToCart(category)}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: "white",
          fontSize: "0.9rem", // Increased from 0.7rem
          py: 0.8, // Increased padding
          mt: 1,
          textTransform: "none",
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
          },
        }}
      >
        ADD TO CART
      </Button>
    </Card>
  )

  return (
    <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 2 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          mb: 2,
          fontSize: { xs: "1.4rem", sm: "1.6rem" }, // Increased from 1.2rem/1.5rem
          fontWeight: "bold",
        }}
      >
        {header}
      </Typography>
      <Swiper
        spaceBetween={20}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        navigation
        modules={[Autoplay, Navigation]}
        style={{ padding: "10px 0" }}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          600: {
            slidesPerView: 2,
          },
          900: {
            slidesPerView: 3,
          },
          1200: {
            slidesPerView: 5,
          },
        }}
      >
        {categories.map((category) => (
          <SwiperSlide key={category.id}>
            <CategoryCard category={category} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Simple notification */}
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

export default ProductCategories
