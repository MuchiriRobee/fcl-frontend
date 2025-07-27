"use client";

import { useState, useEffect } from "react";
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
} from "@mui/material";
import axios from "axios";

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

export default function SalesAgentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

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
        const usersData = usersResponse.data.users;

        // Fetch orders for each user
        const usersWithOrders = await Promise.all(
          usersData.map(async (user) => {
            try {
              const ordersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/orders/user/${user.id}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              });
              const orders = ordersResponse.data;
              const number_of_orders = orders.length;
              const total_orders_amount = orders
                .reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
                .toFixed(2);
              const last_purchase_date = orders.reduce(
                (latest, order) => {
                  const orderDate = new Date(order.created_at);
                  return !latest || orderDate > new Date(latest.created_at) ? order : latest;
                },
                null
              )?.created_at || null;
              return {
                ...user,
                number_of_orders,
                total_orders_amount,
                last_purchase_date,
              };
            } catch (error) {
              console.warn(`Failed to fetch orders for user ${user.id}:`, error.response?.data?.message || error.message);
              return {
                ...user,
                number_of_orders: 0,
                total_orders_amount: "0.00",
                last_purchase_date: null,
              };
            }
          })
        );

        // Sort users by last_purchase_date (most recent first)
        const sortedUsers = usersWithOrders.sort((a, b) => {
          const dateA = a.last_purchase_date ? new Date(a.last_purchase_date) : new Date(0);
          const dateB = b.last_purchase_date ? new Date(b.last_purchase_date) : new Date(0);
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Loading users...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
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
                          <Typography variant="body2">{user.user_code || "N/A"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(user.last_purchase_date)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.number_of_orders}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">KSh {formatNumberWithCommas(user.total_orders_amount)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
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