import React, { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material"
import {
  Person,
  Edit,
  ShoppingBag,
  CheckCircle,
  Schedule,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import axios from "axios"

// Import sample product images
import softChairsImage from "../../../assets/images/1.png"
import sofaChairImage from "../../../assets/images/2.png"
import kitchenDishesImage from "../../../assets/images/11.png"
import smartWatchesImage from "../../../assets/images/8.png"

// Mock data for orders - will be sorted by date
const mockOrdersData = [
  {
    orderNo: "ORD-2023-001",
    date: "2023-05-15",
    image: softChairsImage,
    productName: "Soft Chair",
    itemCode: "SC001",
    totalPaid: 80,
    cashbackPercent: 5,
    cashbackAmount: 4,
    status: "Completed",
    etimsInvNo: "INV-2023-001",
  },
  {
    orderNo: "ORD-2023-002",
    date: "2023-06-02",
    image: sofaChairImage,
    productName: "Sofa Chair",
    itemCode: "SC002",
    totalPaid: 150,
    cashbackPercent: 3,
    cashbackAmount: 5,
    status: "Pending",
    etimsInvNo: null,
  },
  {
    orderNo: "ORD-2023-003",
    date: "2023-06-10",
    image: kitchenDishesImage,
    productName: "Kitchen Dishes Set",
    itemCode: "KD001",
    totalPaid: 60,
    cashbackPercent: 7,
    cashbackAmount: 4,
    status: "Completed",
    etimsInvNo: "INV-2023-002",
  },
  {
    orderNo: "ORD-2023-004",
    date: "2023-06-18",
    image: smartWatchesImage,
    productName: "Smart Watch",
    itemCode: "SW001",
    totalPaid: 130,
    cashbackPercent: 10,
    cashbackAmount: 13,
    status: "Pending",
    etimsInvNo: null,
  },
]

// Sort orders by date (newest first) and assign serial numbers
const mockOrders = [...mockOrdersData]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .map((order, index) => ({
    ...order,
    serialNo: index + 1,
  }))

const AccountPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const navigate = useNavigate()

  // State for active tab
  const [activeTab, setActiveTab] = useState(0)

  // State for user data
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone_number: "",
    contact_name: "",
    cashback_phone_number: "",
    kra_pin: "",
    building_name: "",
    floor_number: "",
    room_number: "",
    street_name: "",
    area_name: "",
    city: "",
    country: "",
  })

  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // State for edit mode
  const [editMode, setEditMode] = useState(false)

  // State for success/error messages
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // State for loading
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("authToken")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const apiUrl = `${import.meta.env.VITE_API_URL}/account/profile`
        console.log("Fetching user data from:", apiUrl)
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Fetched user data:", response.data)
        setUserData({
          name: response.data.username || "",
          email: response.data.email || "",
          phone_number: response.data.phone || "",
          contact_name: response.data.contact_name || "",
          cashback_phone_number: response.data.cashback_phone_number || "",
          kra_pin: response.data.kra_pin || "",
          building_name: response.data.building_name || "",
          floor_number: response.data.floor_number || "",
          room_number: response.data.room_number || "",
          street_name: response.data.street_name || "",
          area_name: response.data.area_name || "",
          city: response.data.city || "",
          country: response.data.country || "",
        })
      } catch (err) {
        console.error("Error fetching user data:", err.response?.data || err.message)
        setErrorMessage(err.response?.data?.message || "Failed to load user data")
        setTimeout(() => setErrorMessage(""), 5000)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Handle user data change
  const handleUserDataChange = (e) => {
    const { name, value } = e.target
    setUserData({
      ...userData,
      [name]: value,
    })
  }

  // Handle password data change
  const handlePasswordDataChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
  }

  // Handle password visibility toggles
  const handleToggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword((prev) => !prev)
  }

  const handleToggleNewPasswordVisibility = () => {
    setShowNewPassword((prev) => !prev)
  }

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev)
  }

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/account/profile`,
        {
          building_name: userData.building_name,
          floor_number: userData.floor_number,
          room_number: userData.room_number,
          street_name: userData.street_name,
          area_name: userData.area_name,
          city: userData.city,
          country: userData.country,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log("Profile update response:", response.data)
      setUserData({
        ...userData,
        building_name: response.data.building_name || "",
        floor_number: response.data.floor_number || "",
        room_number: response.data.room_number || "",
        street_name: response.data.street_name || "",
        area_name: response.data.area_name || "",
        city: response.data.city || "",
        country: response.data.country || "",
      })
      setEditMode(false)
      setSuccessMessage(response.data.message)
      setTimeout(() => setSuccessMessage(""), 3000)

      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...currentUser,
          username: response.data.username,
          email: response.data.email,
        })
      )
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message)
      setErrorMessage(err.response?.data?.message || "Failed to update profile")
      setTimeout(() => setErrorMessage(""), 5000)
    }
  }

  // Handle password change
  const handlePasswordChange = async () => {
    setErrorMessage("")
    setSuccessMessage("")

    // Validation checks
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrorMessage("Please fill in all password fields")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("New passwords do not match")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }
    if (passwordData.newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }
    if (!/[A-Z]/.test(passwordData.newPassword)) {
      setErrorMessage("New password must contain at least one uppercase letter")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }
    if (!/[a-z]/.test(passwordData.newPassword)) {
      setErrorMessage("New password must contain at least one lowercase letter")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }
    if (!/[0-9]/.test(passwordData.newPassword)) {
      setErrorMessage("New password must contain at least one number")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }
    if (!/[!@#$%^&*]/.test(passwordData.newPassword)) {
      setErrorMessage("New password must contain at least one special character")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }

    try {
      const token = localStorage.getItem("authToken")
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      console.log("Password change response:", response.data)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setSuccessMessage(response.data.message || "Password changed successfully!")
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (err) {
      console.error("Password change error:", err.response?.data || err.message)
      setErrorMessage(err.response?.data?.message || "Failed to change password")
      setTimeout(() => setErrorMessage(""), 5000)
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading profile...
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              Hello, {userData.name || "User"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome to your account dashboard
            </Typography>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            aria-label="account tabs"
          >
            <Tab icon={<Person />} label="Profile" iconPosition="start" sx={{ minHeight: 48, textTransform: "none" }} />
            <Tab
              icon={<ShoppingBag />}
              label="My Orders"
              iconPosition="start"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        {activeTab === 0 && (
          <Box sx={{ py: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" component="h2">
                Account Information
              </Typography>
              <Button
                variant="outlined"
                startIcon={editMode ? null : <Edit />}
                onClick={() => setEditMode(!editMode)}
                color={editMode ? "success" : "primary"}
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Full Name
                </Typography>
                <TextField
                  fullWidth
                  name="name"
                  value={userData.name}
                  disabled
                  size="small"
                  margin="normal"
                />

                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Contact Person Name
                </Typography>
                <TextField
                  fullWidth
                  name="contact_name"
                  value={userData.contact_name}
                  disabled
                  size="small"
                  margin="normal"
                />

                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  name="email"
                  value={userData.email}
                  disabled
                  size="small"
                  type="email"
                  margin="normal"
                />

                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Contact Phone Number
                </Typography>
                <TextField
                  fullWidth
                  name="phone_number"
                  value={userData.phone_number}
                  disabled
                  size="small"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 0 }}>
                        +254
                      </InputAdornment>
                    ),
                  }}
                />

                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Cashback Phone Number{" "}
                  <Typography component="span" color="error" variant="body2">
                    (*SAFARICOM NUMBER ONLY)
                  </Typography>
                </Typography>
                <TextField
                  fullWidth
                  name="cashback_phone_number"
                  value={userData.cashback_phone_number}
                  disabled
                  size="small"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 0 }}>
                        +254
                      </InputAdornment>
                    ),
                  }}
                />

                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  KRA Pin{" "}
                  <Typography component="span" color="error" variant="body2">
                    (*Fill this field to claim VAT)
                  </Typography>
                </Typography>
                <TextField
                  fullWidth
                  name="kra_pin"
                  value={userData.kra_pin}
                  disabled
                  size="small"
                  margin="normal"
                />

                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Building Name
                </Typography>
                <TextField
                  fullWidth
                  name="building_name"
                  value={userData.building_name}
                  onChange={handleUserDataChange}
                  placeholder="Building name"
                  size="small"
                  disabled={!editMode}
                  margin="normal"
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                      Floor Number
                    </Typography>
                    <TextField
                      fullWidth
                      name="floor_number"
                      value={userData.floor_number}
                      onChange={handleUserDataChange}
                      placeholder="Floor Number"
                      size="small"
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                      Room/Door Number
                    </Typography>
                    <TextField
                      fullWidth
                      name="room_number"
                      value={userData.room_number}
                      onChange={handleUserDataChange}
                      placeholder="Room/Door Number"
                      size="small"
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                </Grid>

                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Street Name
                </Typography>
                <TextField
                  fullWidth
                  name="street_name"
                  value={userData.street_name}
                  onChange={handleUserDataChange}
                  placeholder="Street 1"
                  size="small"
                  disabled={!editMode}
                  margin="normal"
                />

                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Area Name
                </Typography>
                <FormControl fullWidth margin="normal" size="small" disabled={!editMode}>
                  <Select name="area_name" value={userData.area_name} onChange={handleUserDataChange}>
                    <MenuItem value="Westlands (KE)">Westlands (KE)</MenuItem>
                    <MenuItem value="Parklands">Parklands</MenuItem>
                    <MenuItem value="Kilimani">Kilimani</MenuItem>
                    <MenuItem value="Lavington">Lavington</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  City
                </Typography>
                <TextField
                  fullWidth
                  name="city"
                  value={userData.city}
                  onChange={handleUserDataChange}
                  placeholder="City"
                  size="small"
                  disabled={!editMode}
                  margin="normal"
                />

                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Country
                </Typography>
                <TextField
                  fullWidth
                  name="country"
                  value={userData.country}
                  onChange={handleUserDataChange}
                  placeholder="Kenya"
                  size="small"
                  disabled
                  margin="normal"
                />

                {editMode && (
                  <Button variant="contained" color="primary" onClick={handleSaveProfile} sx={{ mt: 2 }} fullWidth>
                    Save Changes
                  </Button>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Change Password
                </Typography>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordDataChange}
                  margin="normal"
                  variant="outlined"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle current password visibility"
                          onClick={handleToggleCurrentPasswordVisibility}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={handlePasswordDataChange}
                  margin="normal"
                  variant="outlined"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle new password visibility"
                          onClick={handleToggleNewPasswordVisibility}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordDataChange}
                  margin="normal"
                  variant="outlined"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePasswordChange}
                  sx={{ mt: 2 }}
                  fullWidth
                  disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                >
                  Update Password
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Orders Tab */}
        {activeTab === 1 && (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              My Orders
            </Typography>
            {mockOrders.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                      <TableCell>Serial No.</TableCell>
                      <TableCell>Order No.</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Total Paid</TableCell>
                      <TableCell align="center">Cashback</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">ETIMS INV NO.</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockOrders.map((order) => (
                      <TableRow key={order.serialNo} hover>
                        <TableCell>{order.serialNo}</TableCell>
                        <TableCell>
                          <Button
                            variant="text"
                            color="primary"
                            onClick={() => navigate(`/order-details/${order.orderNo}`)}
                            sx={{ textTransform: "none", padding: 0, minWidth: "auto" }}
                          >
                            {order.orderNo}
                          </Button>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell align="right">{order.totalPaid}/=</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${order.cashbackAmount}/=`}
                            color="success"
                            size="small"
                            sx={{ fontSize: "0.7rem", height: "20px" }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={order.status}
                            color={order.status === "Completed" ? "success" : "warning"}
                            size="small"
                            icon={order.status === "Completed" ? <CheckCircle /> : <Schedule />}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {order.etimsInvNo || (
                            <Chip
                              label="Pending"
                              size="small"
                              color="default"
                              sx={{ fontSize: "0.7rem", height: "20px" }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/order-details/${order.orderNo}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <ShoppingBag sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Orders Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  You haven't placed any orders yet. Start shopping to see your orders here.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate("/")} sx={{ mt: 2 }}>
                  Browse Products
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default AccountPage