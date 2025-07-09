"use client"

import { useState, useEffect } from "react"
import {
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
} from "@mui/material"
import { useNavigate, useLocation } from "react-router-dom"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import axios from "axios"

function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("customer")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check URL parameters for user type and redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const typeParam = urlParams.get("type")
    if (typeParam === "agent") {
      setUserType("agent")
    } else if (typeParam === "admin") {
      setUserType("admin")
    }
  }, [location])

  // Handle redirect after successful login
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const redirect = urlParams.get("redirect")
    if (successMessage && redirect) {
      setTimeout(() => navigate(redirect), 1500)
    } else if (successMessage) {
      setTimeout(() => {
        if (userType === "admin") navigate("/admin")
        else if (userType === "agent") navigate("/sales-agent")
        else navigate("/account")
      }, 1500)
    }
  }, [successMessage, userType, navigate, location])

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    // Validation
    if (!email || !password) {
      setError("Please enter both email and password")
      setIsLoading(false)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    if (userType === "admin") {
      // Admin login with backend authentication
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/admin-login`,
          {
            email: email.trim(),
            password,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        )

        console.log("Admin login response:", response.data)

        const { token, user } = response.data

        if (response.status === 200 && token && user) {
          // Store JWT token and user data
          localStorage.setItem("authToken", token)
          localStorage.setItem("currentUser", JSON.stringify({
            id: user.id,
            email: user.email,
            username: user.name || email.split("@")[0],
            userType: "admin",
          }))

          setSuccessMessage("Admin login successful! Redirecting...")

          if (onLogin) {
            onLogin({
              id: user.id,
              email: user.email,
              username: user.name,
              userType: "admin",
            })
          }
        } else {
          throw new Error("Invalid response from server")
        }
      } catch (err) {
        console.error("Admin login error:", err.response?.data || err.message)
        const errorMessage =
          err.response?.data?.message ||
          "Admin login failed. Please check your email and password."
        setError(errorMessage)
        setIsLoading(false)
      }
      return
    }

    if (userType === "agent") {
      // Sales agent login with backend authentication
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/sales-agent-login`,
          {
            email: email.trim(),
            password,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        )

        console.log("Sales agent login response:", response.data)

        const { token, user } = response.data

        if (response.status === 200 && token && user) {
          // Store JWT token and user data
          localStorage.setItem("authToken", token)
          localStorage.setItem("currentUser", JSON.stringify({
            id: user.id,
            email: user.email,
            username: user.name || email.split("@")[0],
            userType: "sales_agent",
          }))

          setSuccessMessage("Sales Agent login successful! Redirecting...")

          if (onLogin) {
            onLogin({
              id: user.id,
              email: user.email,
              username: user.name,
              userType: "sales_agent",
            })
          }
        } else {
          throw new Error("Invalid response from server")
        }
      } catch (err) {
        console.error("Sales agent login error:", err.response?.data || err.message)
        const errorMessage =
          err.response?.data?.message ||
          "Sales Agent login failed. Please check your email and password."
        setError(errorMessage)
        setIsLoading(false)
      }
      return
    }

    // Customer login with backend authentication
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email: email.trim(),
          password,
          userType: "customer",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      )

      console.log("Customer login response:", response.data)

      const { token, user } = response.data

      if (response.status === 200 && token && user) {
        // Store JWT token and user data
        localStorage.setItem("authToken", token)
        localStorage.setItem("currentUser", JSON.stringify({
          id: user.id,
          email: user.email,
          username: user.name || email.split("@")[0],
          userType: "customer",
        }))

        setSuccessMessage("Customer login successful! Redirecting...")

        if (onLogin) {
          onLogin({
            id: user.id,
            email: user.email,
            username: user.name,
            userType: "customer",
          })
        }
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (err) {
      console.error("Customer login error:", err.response?.data || err.message)
      const errorMessage =
        err.response?.data?.message ||
        "Customer login failed. Please check your email and password."
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h5" gutterBottom>
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          {/* User Type Selection */}
          <FormControl component="fieldset" sx={{ width: "100%", mb: 2 }}>
            <FormLabel component="legend">Login as:</FormLabel>
            <RadioGroup
              row
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              sx={{ justifyContent: "center" }}
            >
              <FormControlLabel value="customer" control={<Radio />} label="Customer" />
              <FormControlLabel value="agent" control={<Radio />} label="Sales Agent" />
              <FormControlLabel value="admin" control={<Radio />} label="Admin" />
            </RadioGroup>
          </FormControl>

          <Divider sx={{ mb: 2 }} />

          <TextField
            label="Email Address"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <TextField
            label="Password"
            fullWidth
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    disabled={isLoading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/forgot-password')}
              disabled={isLoading}
              sx={{ textDecoration: 'underline', color: 'primary.main' }}
            >
              Forgot Password?
            </Link>
          </Box>

          <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> Please select your login type and use your registered credentials.
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ marginTop: 2, py: 1.5 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              `Sign In as ${userType === "agent" ? "Sales Agent" : userType === "admin" ? "Admin" : "Customer"}`
            )}
          </Button>
        </form>
      </Paper>
    </Container>
  )
}

export default LoginPage