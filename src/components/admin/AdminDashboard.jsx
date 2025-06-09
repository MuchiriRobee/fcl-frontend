import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material"
import { TrendingUp, AttachMoney, Receipt, Warning, Inventory, Person } from "@mui/icons-material"

// Sample data
const recentBuyers = [
  { id: 1, name: "John Doe", email: "john@example.com", amount: 150000, status: "completed" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", amount: 89000, status: "pending" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", amount: 234000, status: "completed" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", amount: 67000, status: "processing" },
]

const recentInvoices = [
  { id: "INV001", customer: "John Doe", amount: 150000, date: "2024-01-15", status: "paid" },
  { id: "INV002", customer: "Jane Smith", amount: 89000, date: "2024-01-14", status: "pending" },
  { id: "INV003", customer: "Bob Johnson", amount: 234000, date: "2024-01-13", status: "paid" },
  { id: "INV004", customer: "Alice Brown", amount: 67000, date: "2024-01-12", status: "overdue" },
]

const stockAlerts = [
  { product: "Chair", stock: 5, minStock: 10, status: "low" },
  { product: "T-shirts", stock: 2, minStock: 15, status: "critical" },
  { product: "Kitchen Dishes", stock: 8, minStock: 20, status: "low" },
  { product: "Office Desk", stock: 1, minStock: 5, status: "critical" },
]

const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export default function AdminDashboard() {
  const metrics = [
    {
      title: "Today Invoices",
      value: "12",
      change: "+5",
      icon: <Receipt />,
      color: "#4CAF50",
      bgColor: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
    },
    {
      title: "This Month Invoices",
      value: "348",
      change: "+23",
      icon: <Receipt />,
      color: "#2196F3",
      bgColor: "linear-gradient(135deg, #2196F3 0%, #1976d2 100%)",
    },
    {
      title: "Today Sales",
      value: "2.4M",
      change: "+12%",
      icon: <AttachMoney />,
      color: "#FF9800",
      bgColor: "linear-gradient(135deg, #FF9800 0%, #f57c00 100%)",
    },
    {
      title: "This Month Sales",
      value: "45.2M",
      change: "+8%",
      icon: <TrendingUp />,
      color: "#9C27B0",
      bgColor: "linear-gradient(135deg, #9C27B0 0%, #7b1fa2 100%)",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "paid":
        return "success"
      case "pending":
        return "warning"
      case "processing":
        return "info"
      case "overdue":
        return "error"
      default:
        return "default"
    }
  }

  const getStockStatusColor = (status) => {
    switch (status) {
      case "critical":
        return "error"
      case "low":
        return "warning"
      default:
        return "success"
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: metric.bgColor,
                color: "white",
                height: "140px",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "100px",
                  height: "100px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  transform: "translate(30px, -30px)",
                },
              }}
            >
              <CardContent sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                    {metric.change}
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {metric.value}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                  {metric.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Buyers */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: "400px" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
              <Person sx={{ mr: 1 }} />
              Recent Buyers
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ maxHeight: "300px", overflow: "auto" }}>
              {recentBuyers.map((buyer) => (
                <ListItem key={buyer.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: metrics[0].color }}>{buyer.name.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body1" fontWeight="medium">
                          {buyer.name}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {formatNumberWithCommas(buyer.amount)}/=
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {buyer.email}
                        </Typography>
                        <Chip label={buyer.status} size="small" color={getStatusColor(buyer.status)} />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Stock Alerts */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: "400px" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
              <Warning sx={{ mr: 1 }} />
              Stock Alerts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ maxHeight: "300px", overflow: "auto" }}>
              {stockAlerts.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getStockStatusColor(item.status) === "error" ? "#f44336" : "#ff9800" }}>
                      <Inventory />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body1" fontWeight="medium">
                          {item.product}
                        </Typography>
                        <Chip
                          label={`${item.stock}/${item.minStock}`}
                          size="small"
                          color={getStockStatusColor(item.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                          Stock Level: {item.status === "critical" ? "Critical" : "Low"}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(item.stock / item.minStock) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "#f5f5f5",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: item.status === "critical" ? "#f44336" : "#ff9800",
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Invoices */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
              <Receipt sx={{ mr: 1 }} />
              Recent Invoices
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Invoice ID</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="right">
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium" color="primary">
                          {invoice.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {invoice.date}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatNumberWithCommas(invoice.amount)}/=
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={invoice.status} size="small" color={getStatusColor(invoice.status)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
