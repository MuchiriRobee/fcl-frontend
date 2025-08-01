"use client"

import React, { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { CategoriesProvider } from "./components/admin/CategoriesContext"
import HomePage from "./pages/Home/View/Index"
import NavigationBar from "./components/NavigationBar"
import Footer from "./components/Footer"
import Confirm from "./components/Confirm"
import SetPassword from "./components/SetPassword"
import ProductDetails from "./pages/ProductDetails/View/Index"
import Cart from "./pages/Cart/View/Index"
import RegisterPage from "./pages/Registration/View/Index"
import LoginPage from "./pages/Login/View/Index"
import RegistrationForm from "./pages/Registration/View/Index"
import AccountPage from "./pages/Account/View/Index"
import WalletPage from "./pages/Wallet/View/Index"
import ForgotPasswordPage from "./components/ForgotPassword"
import ResetPasswordPage from "./components/ResetPassword"
import ProductsPage from "./components/admin/ProductsPage"
import AdminPage from "./pages/Admin/View/Index"
import CheckoutPage from "./pages/Checkout/View/Index"
import { Typography, Box } from "@mui/material"
import ErrorBoundary from "./components/admin/ErrorBoundary"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (userData) => {
    setCurrentUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem("currentUser", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("currentUser")
  }

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: {
            main: "#0056B3",
          },
          secondary: {
            main: "#800080",
          },
          success: {
            main: "#4CAF50",
          },
          error: {
            main: "#E53935",
          },
          warning: {
            main: "#FFA000",
          },
          info: {
            main: "#2196F3",
          },
          background: {
            default: "#ffffff",
            paper: "#ffffff",
          },
          text: {
            primary: "#333333",
            secondary: "#666666",
          },
        },
        breakpoints: {
          values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
          },
        },
        spacing: (factor) => `${0.25 * factor}rem`,
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          fontSize: 14,
          h1: {
            fontSize: "2.7rem",
            fontWeight: 600,
          },
          h2: {
            fontSize: "2.2rem",
            fontWeight: 600,
          },
          h3: {
            fontSize: "1.8rem",
            fontWeight: 600,
          },
          h4: {
            fontSize: "1.5rem",
            fontWeight: 600,
          },
          h5: {
            fontSize: "1.3rem",
            fontWeight: 600,
          },
          h6: {
            fontSize: "1.1rem",
            fontWeight: 600,
          },
          body1: {
            fontSize: "1rem",
          },
          body2: {
            fontSize: "0.9rem",
          },
          button: {
            fontSize: "0.95rem",
            textTransform: "none",
          },
          caption: {
            fontSize: "0.85rem",
          },
        },
        components: {
          MuiContainer: {
            styleOverrides: {
              root: {
                paddingLeft: "16px",
                paddingRight: "16px",
                "@media (min-width:600px)": {
                  paddingLeft: "24px",
                  paddingRight: "24px",
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              label: {
                fontSize: "0.85rem",
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                fontSize: "0.95rem",
              },
            },
          },
        },
      }),
    [],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <CategoriesProvider>
          <BrowserRouter>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <NavigationBar isLoggedIn={isLoggedIn} currentUser={currentUser} onLogout={handleLogout} />
              <main style={{ flexGrow: 1 }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/product-details" element={<ProductDetails />} />
                  <Route path="/product-details/:id" element={<ProductDetails />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/RegistrationForm" element={<RegistrationForm />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/confirm" element={<Confirm />} />
                  <Route path="/set-password" element={<SetPassword />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/admin/*" element={<AdminPage />} />
                  <Route path="/products/subcategory/:subcategoryId" element={<ProductsPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </CategoriesProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App