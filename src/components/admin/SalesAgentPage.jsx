"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import axios from "axios";

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function to format numbers with commas and two decimal places
const formatNumberWithCommas = (number) => {
  if (isNaN(number) || number === null || number === undefined) return "0.00";
  const [integerPart, decimalPart = ""] = Number(number).toFixed(2).split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${formattedInteger}.${decimalPart.padEnd(2, "0")}`;
};

// Helper function to format date as MM/DD/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

// Helper function to format location
const formatLocation = (street, city, country) => {
  const parts = [street, city, country].filter(part => part && part !== "Unknown").join(", ");
  return parts || "N/A";
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return `KSh ${formatNumberWithCommas(amount)}`;
};

export default function SalesAgentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchAgentAndUsers = async () => {
      try {
        setLoading(true);
        // Fetch agent details
        const agentResponse = await axios.get(`${import.meta.env.VITE_API_URL}/auth/sales-agents/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAgent(agentResponse.data.agent);

        // Fetch users registered by this agent
        const usersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/auth/sales-agents/${id}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const usersData = usersResponse.data.users || [];

        if (!Array.isArray(usersData)) {
          throw new Error("Unexpected response format: Expected array of users");
        }

        // Fetch orders for each user and compute detailed user data
        const usersWithOrders = await Promise.all(
          usersData.map(async (user) => {
            try {
              const ordersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/orders/user/${user.id}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              });

              if (!ordersResponse.headers['content-type']?.includes('application/json')) {
                throw new Error('Unexpected response format: Expected JSON');
              }

              const orders = ordersResponse.data;
              const numberOfOrders = orders.length;
              const totalOrdersAmount = orders
                .reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
                .toFixed(2);
              const lastPurchaseDate = orders.reduce(
                (latest, order) => {
                  const orderDate = new Date(order.created_at);
                  return !latest || orderDate > new Date(latest.created_at) ? order : latest;
                },
                null
              )?.created_at || null;

              const cashbackEarned = orders
                .reduce((sum, order) => {
                  const orderCashback = order.items.reduce((itemSum, item) => {
                    return itemSum + Number(item.cashback_amount || 0);
                  }, 0);
                  return sum + orderCashback;
                }, 0)
                .toFixed(2);

              return {
                id: user.id,
                name: user.name || "N/A",
                email: user.email || "N/A",
                userCode: user.user_code || "N/A",
                phone: user.phone_number || "N/A", // Ensure phone_number is mapped to phone
                street: user.street_name || "Unknown",
                city: user.city || "Unknown",
                country: user.country || "Unknown",
                location: formatLocation(user.street_name, user.city, user.country), // Compute location
                registrationDate: user.created_at || new Date().toISOString(),
                totalOrders: numberOfOrders,
                totalSpent: parseFloat(totalOrdersAmount),
                cashbackEarned: parseFloat(cashbackEarned),
                lastPurchaseDate,
                orders: orders.map((order) => ({
                  id: order.id,
                  orderNumber: order.order_number,
                  date: order.created_at,
                  totalAmount: Number(order.total_amount || 0).toFixed(2),
                  shippingCost: Number(order.shipping_cost || 0).toFixed(2),
                  cashbackTotal: order.items
                    .reduce((sum, item) => sum + Number(item.cashback_amount || 0), 0)
                    .toFixed(2),
                  items: order.items.map((item) => ({
                    productId: item.product_id,
                    productName: item.product_name,
                    quantity: item.quantity,
                    unitPrice: item.unit_price,
                    cashbackAmount: item.cashback_amount,
                    subtotalExclVat: item.subtotal_excl_vat,
                    imageUrl: item.image_url || null,
                  })),
                })),
              };
            } catch (error) {
              console.warn(`Failed to fetch orders for user ${user.id}:`, error.response?.data?.message || error.message);
              return {
                id: user.id,
                name: user.name || "N/A",
                email: user.email || "N/A",
                userCode: user.user_code || "N/A",
                phone: user.phone_number || "N/A", // Ensure phone_number is mapped to phone
                street: user.street_name || "Unknown",
                city: user.city || "Unknown",
                country: user.country || "Unknown",
                location: formatLocation(user.street_name, user.city, user.country), // Compute location
                registrationDate: user.created_at || new Date().toISOString(),
                totalOrders: 0,
                totalSpent: 0.00,
                cashbackEarned: 0.00,
                lastPurchaseDate: null,
                orders: [],
              };
            }
          })
        );

        // Sort users by last_purchase_date (most recent first)
        const sortedUsers = usersWithOrders.sort((a, b) => {
          const dateA = a.lastPurchaseDate ? new Date(a.lastPurchaseDate) : new Date(0);
          const dateB = b.lastPurchaseDate ? new Date(b.lastPurchaseDate) : new Date(0);
          return dateB - dateA;
        });

        setUsers(sortedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching agent or users:", error);
        setNotification({
          open: true,
          message: error.response?.data?.message || "Failed to fetch agent or users",
          severity: "error",
        });
        setLoading(false);
      }
    };
    fetchAgentAndUsers();
  }, [id]);

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle view user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {agent && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              {`${agent.first_name} ${agent.last_name}`} (Code: {agent.agent_code || "N/A"})
            </Typography>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Back to Agents
            </Button>
          </Box>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Registered Users
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>User Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>User Code</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Last Purchase Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Number of Orders</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Total Orders Amount</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Loading users...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No users registered by this agent
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Typography variant="body2">{user.name || "N/A"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.userCode || "N/A"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(user.lastPurchaseDate)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.totalOrders}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatCurrency(user.totalSpent)}</Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleViewUser(user)}>
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* User Details Dialog */}
          <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#1976d2" }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer Details
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedUser && (
                <Box>
                  {/* User Info */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: "#1976d2", fontWeight: 600 }}>
                          Customer Information
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <PersonIcon />
                            <Typography>User Code: {selectedUser.userCode}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <EmailIcon />
                            <Typography>{selectedUser.email}</Typography>
                          </Box>
                          {/*
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <PhoneIcon />
                            <Typography>{selectedUser.phone}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LocationIcon />
                            <Typography>{selectedUser.location}</Typography>
                          </Box>
                          */}
                        </Box>                        
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: "#1976d2", fontWeight: 600 }}>
                          Account Summary
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Total Orders
                            </Typography>
                            <Typography variant="h6">{selectedUser.totalOrders}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Total Spent
                            </Typography>
                            <Typography variant="h6">{formatCurrency(selectedUser.totalSpent)}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Total Cashback
                            </Typography>
                            <Typography variant="h6">{formatCurrency(selectedUser.cashbackEarned)}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Last Purchase
                            </Typography>
                            <Typography variant="body2">{formatDate(selectedUser.lastPurchaseDate)}</Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Tabs for detailed information */}
                  <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="user details tabs" sx={{ bgcolor: "#f5f5f5" }}>
                      <Tab icon={<HistoryIcon />} label="Purchase History" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                                <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>Product Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "#1976d2" }} align="right">Quantity</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "#1976d2" }} align="right">Unit Price</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "#1976d2" }} align="right">Subtotal (Excl. VAT)</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "#1976d2" }} align="right">Shipping Cost</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "#1976d2" }} align="right">Cashback</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedUser.orders.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                      No purchase history found
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ) : (
                                selectedUser.orders
                                  .sort((a, b) => new Date(b.date) - new Date(a.date)) // Most recent first
                                  .map((order, index) => (
                                    <React.Fragment key={order.id}>
                                      <TableRow>
                                        <TableCell colSpan={6} sx={{ bgcolor: "#f5f5f5", py: 1 }}>
                                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            Order {order.orderNumber} - {formatDate(order.date)}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                      {order.items.map((item) => (
                                        <TableRow
                                          key={item.productId}
                                          hover
                                          sx={{
                                            '&:hover': { bgcolor: '#e8f5e8' },
                                            borderBottom: '1px solid #ddd',
                                          }}
                                        >
                                          <TableCell sx={{ fontSize: '0.9rem' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Typography variant="body2">{item.productName}</Typography>
                                            </Box>
                                          </TableCell>
                                          <TableCell align="right" sx={{ fontSize: '0.9rem' }}>{item.quantity}</TableCell>
                                          <TableCell align="right" sx={{ fontSize: '0.9rem' }}>
                                            {formatCurrency(item.unitPrice)}
                                          </TableCell>
                                          <TableCell align="right" sx={{ fontSize: '0.9rem' }}>
                                            {formatCurrency(item.subtotalExclVat)}
                                          </TableCell>
                                          <TableCell align="right" sx={{ fontSize: '0.9rem' }}>
                                            {formatCurrency(order.shippingCost)}
                                          </TableCell>
                                          <TableCell align="right" sx={{ fontSize: '0.9rem', color: '#388e3c' }}>
                                            {formatCurrency(item.cashbackAmount)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow>
                                        <TableCell colSpan={3} />
                                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                          Total: {formatCurrency(order.totalAmount)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                          {/* Empty cell for alignment */}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#388e3c' }}>
                                          Total Cashback: {formatCurrency(order.cashbackTotal)}
                                        </TableCell>
                                      </TableRow>
                                      {index < selectedUser.orders.length - 1 && (
                                        <TableRow>
                                          <TableCell colSpan={6} sx={{ py: 0 }}>
                                            <Divider sx={{ my: 2, borderWidth: 2, borderColor: '#1976d2' }} />
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </React.Fragment>
                                  ))
                              )}
                              {selectedUser.orders.length > 0 && (
                                <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                                  <TableCell colSpan={3} />
                                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                    Grand Total: {formatCurrency(selectedUser.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0))}
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                    {/* Empty cell for alignment */}
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem', color: '#388e3c' }}>
                                    Grand Total Cashback: {formatCurrency(selectedUser.cashbackEarned)}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </TabPanel>
                  </Paper>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}