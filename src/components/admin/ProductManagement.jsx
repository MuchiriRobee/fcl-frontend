"use client"
import { Box, Typography, Button, Paper } from "@mui/material"
import { Add, ShoppingCart } from "@mui/icons-material"

const ProductManagement = ({ viewMode, onAddNewItem }) => {
  return (
    <Box>
      {/* Header with Add New Item Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          {viewMode === "manage" ? "Manage Items" : "Product Management"}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddNewItem}
          sx={{
            bgcolor: "#1976d2",
            "&:hover": { bgcolor: "#1565c0" },
            textTransform: "none",
            fontWeight: 500,
            px: 3,
          }}
        >
          Add New Item
        </Button>
      </Box>

      {/* Rest of the component content */}
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <ShoppingCart sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Product Management Interface
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Product listing and management features will be available here.
        </Typography>
      </Paper>
    </Box>
  )
}

export default ProductManagement
