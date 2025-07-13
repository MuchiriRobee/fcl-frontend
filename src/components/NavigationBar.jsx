"use client"

import React, { useState, useRef, useEffect, useContext } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Box,
  IconButton,
  Badge,
  Container,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton as MuiIconButton,
  Tooltip,
  Paper,
  Popper,
  Fade,
  TextField,
  InputAdornment,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  ExpandMore as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  Close as CloseIcon,
  Wallet as WalletIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  AccountCircle,
  Settings,
  ExitToApp,
  Inbox,
  ShoppingBag,
  AdminPanelSettings,
} from "@mui/icons-material"
import { styled, alpha, useTheme } from "@mui/material/styles"
import { useNavigate, useLocation } from "react-router-dom"
import { CategoriesContext } from "./admin/CategoriesContext"
import FirstCraftLogo from "../assets/images/FirstCraft-logo.png"
import RegistrationForm from "../pages/Registration/View/Index"
import LoginPage from "../pages/Login/View/Index"

// Styled Components
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "auto",
  [theme.breakpoints.down("sm")]: {
    marginRight: theme.spacing(1),
  },
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}))

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.grey[500],
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0, 1),
  },
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "20ch",
    [theme.breakpoints.down("sm")]: {
      width: "15ch",
      paddingLeft: `calc(1em + ${theme.spacing(3)})`,
      fontSize: "0.875rem",
    },
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}))

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  textTransform: "none",
  padding: "4px 8px",
  fontSize: "12px",
  minWidth: "unset",
  whiteSpace: "nowrap",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.contrastText, 0.15),
  },
}))

const RegisterButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  backgroundColor: alpha(theme.palette.primary.contrastText, 0.2),
  textTransform: "none",
  padding: "4px 12px",
  fontSize: "12px",
  fontWeight: "bold",
  marginLeft: theme.spacing(1),
  whiteSpace: "nowrap",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.contrastText, 0.3),
  },
  [theme.breakpoints.down("sm")]: {
    marginLeft: theme.spacing(0.5),
    padding: "4px 8px",
  },
}))

const WalletButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  backgroundColor: alpha(theme.palette.primary.contrastText, 0.2),
  textTransform: "none",
  padding: "4px 12px",
  fontSize: "12px",
  fontWeight: "bold",
  marginLeft: theme.spacing(1),
  whiteSpace: "nowrap",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.contrastText, 0.3),
  },
  [theme.breakpoints.down("sm")]: {
    marginLeft: theme.spacing(0.5),
    padding: "4px 8px",
  },
}))

const DropdownContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  borderRadius: theme.shape.borderRadius,
  minWidth: 180,
  zIndex: 1500,
}))

const DropdownItem = styled("div")(({ theme }) => ({
  padding: theme.spacing(1, 2),
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}))

const NestedDropdownContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  borderRadius: theme.shape.borderRadius,
  minWidth: 180,
  zIndex: 1500,
}))

const NavigationBar = ({ isLoggedIn, currentUser, onLogout, isAdminPage }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))
  const { categories, loading, error } = useContext(CategoriesContext)

  // Refs for menu buttons
  const menuRefs = useRef({})
  const categoryMenuRefs = useRef({})

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSubmenus, setDrawerSubmenus] = useState({})
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  // State for user menu
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null)
  const userMenuOpen = Boolean(userMenuAnchorEl)

  // State for cart items count
  const [cartItemsCount, setCartItemsCount] = useState(0)

  // State for tooltips and dropdowns
  const [activeDropdown, setActiveDropdown] = useState("")
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState("")

  // Debug categories changes
  useEffect(() => {
    console.log('[NavigationBar] Categories updated:', categories)
  }, [categories])

  // Get cart items count from localStorage
  useEffect(() => {
    const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || []
    setCartItemsCount(storedCartItems.length)
  }, [])

  // Check if user is admin
  const isAdmin = currentUser?.isAdmin || currentUser?.email?.toLowerCase().includes("admin")

  // Handle dropdown functions
  const handleDropdownOpen = (menuName) => setActiveDropdown(menuName)
  const handleDropdownClose = () => {
    setActiveDropdown("")
    setActiveCategoryDropdown("")
  }
  const handleCategoryDropdownOpen = (menuName) => setActiveCategoryDropdown(menuName)
  const handleCategoryDropdownClose = () => setActiveCategoryDropdown("")
  const handleTooltipOpen = (tooltipName) => {} // Simplified for brevity
  const handleTooltipClose = () => {}

  const toggleDrawer = () => setDrawerOpen((prev) => !prev)
  const toggleSubmenu = (key) => {
    setDrawerSubmenus((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleOpenRegistration = () => {
    setRegistrationOpen(true)
    setLoginOpen(false)
  }

  const handleCloseRegistration = () => setRegistrationOpen(false)

  const handleOpenLogin = () => {
    setLoginOpen(true)
    setRegistrationOpen(false)
  }

  const handleCloseLogin = () => setLoginOpen(false)

  const toggleMobileSearch = () => setMobileSearchOpen((prev) => !prev)

  const handleDropdownItemClick = (parentCategoryId, categoryId = null, subcategoryId = null) => {
    if (subcategoryId) {
      navigate(`/products/${parentCategoryId}/${categoryId}/${subcategoryId}`)
    } else if (categoryId) {
      navigate(`/products/${parentCategoryId}/${categoryId}`)
    } else {
      navigate(`/products/${parentCategoryId}`)
    }
    handleDropdownClose()
    if (drawerOpen) toggleDrawer()
  }

  const setMenuRef = (menuName, element) => {
    menuRefs.current[menuName] = element
  }

  const setCategoryMenuRef = (menuName, element) => {
    categoryMenuRefs.current[menuName] = element
  }

  const handleUserMenuOpen = (event) => setUserMenuAnchorEl(event.currentTarget)
  const handleUserMenuClose = () => setUserMenuAnchorEl(null)

  const handleLogout = () => {
    handleUserMenuClose()
    if (onLogout) onLogout()
    navigate("/")
  }

  const handleLoginSuccess = (userData) => {
    handleCloseLogin()
    // The login component will handle navigation
  }

  return (
    <>
      {isAdminPage ? null : (
        <AppBar
          position="static"
          sx={{
            boxShadow: 0,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            overflowX: "hidden",
            zIndex: 1200,
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              px: { xs: 1, sm: 2 },
              overflowX: "hidden",
            }}
          >
            <Toolbar
              disableGutters
              sx={{
                justifyContent: "space-between",
                flexDirection: { xs: "row", sm: "row" },
                alignItems: "center",
                flexWrap: "wrap",
                minHeight: { xs: "56px" },
                py: { xs: 1, sm: 1 },
                gap: { xs: 1, sm: 0 },
              }}
            >
              {/* Logo and Mobile Menu Button */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: { xs: "100%", sm: "auto" },
                  mb: { xs: 0, sm: 0 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/")}
                >
                  <Typography variant="h6" noWrap sx={{ fontWeight: 700, display: "flex", alignItems: "center" }}>
                    <Box
                      component="img"
                      src={FirstCraftLogo}
                      alt="FirstCraft Logo"
                      sx={{
                        height: { xs: "70px", sm: "70px" },
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Typography>
                </Box>

                {isMobile && (
                  <IconButton sx={{ color: theme.palette.primary.main }} onClick={toggleDrawer} aria-label="menu">
                    <MenuIcon />
                  </IconButton>
                )}
              </Box>

              {isMobile && mobileSearchOpen && (
                <Box
                  sx={{
                    width: "100%",
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={isAdminPage ? "Search admin..." : "Search products..."}
                    variant="outlined"
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={toggleMobileSearch}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "4px",
                      },
                    }}
                  />
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: { xs: 0.5, sm: 0.5 },
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  px: { xs: 1, sm: 1 },
                  py: { xs: 1, sm: 1 },
                  borderRadius: 1,
                  width: isMobile ? "100%" : "auto",
                  mt: isMobile && mobileSearchOpen ? 1 : 0,
                }}
              >
                {!isMobile && (
                  <Search>
                    <SearchIconWrapper>
                      <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                      placeholder={isAdminPage ? "Search admin..." : "Search..."}
                      inputProps={{ "aria-label": "search" }}
                    />
                  </Search>
                )}

                {isMobile && !mobileSearchOpen && (
                  <IconButton
                    size="small"
                    sx={{ color: theme.palette.primary.contrastText }}
                    onClick={toggleMobileSearch}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                )}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  {!isAdminPage && (
                    <Tooltip title="My Wishlist" arrow>
                      <IconButton
                        size={isMobile ? "small" : "medium"}
                        sx={{ color: theme.palette.primary.contrastText }}
                        onClick={() => navigate("/wishlist")}
                        onMouseEnter={() => handleTooltipOpen("wishlist")}
                        onMouseLeave={handleTooltipClose}
                      >
                        <FavoriteIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title={isLoggedIn ? "My Account" : "Sign In"} arrow>
                    <IconButton
                      size={isMobile ? "small" : "medium"}
                      sx={{ color: theme.palette.primary.contrastText }}
                      onClick={isLoggedIn ? handleUserMenuOpen : handleOpenLogin}
                      onMouseEnter={() => handleTooltipOpen("profile")}
                      onMouseLeave={handleTooltipClose}
                    >
                      {isLoggedIn ? (
                        <Avatar
                          sx={{
                            width: isMobile ? 24 : 32,
                            height: isMobile ? 24 : 32,
                            bgcolor: theme.palette.secondary.main,
                            fontSize: isMobile ? "0.75rem" : "1rem",
                          }}
                        >
                          {currentUser?.username?.charAt(0) || <PersonIcon fontSize={isMobile ? "small" : "medium"} />}
                        </Avatar>
                      ) : (
                        <PersonIcon fontSize={isMobile ? "small" : "medium"} />
                      )}
                    </IconButton>
                  </Tooltip>

                  {!isAdminPage && (
                    <Tooltip title="My Cart" arrow>
                      <IconButton
                        size={isMobile ? "small" : "medium"}
                        sx={{ color: theme.palette.primary.contrastText }}
                        onClick={() => navigate("/cart")}
                        onMouseEnter={() => handleTooltipOpen("cart")}
                        onMouseLeave={handleTooltipClose}
                      >
                        <Badge badgeContent={cartItemsCount} color="error">
                          <ShoppingCartIcon fontSize={isMobile ? "small" : "medium"} />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  )}

                  {!isTablet && !isMobile && !isAdminPage && (
                    <WalletButton startIcon={<WalletIcon />} onClick={() => navigate("/wallet")}>
                      E-Wallet
                    </WalletButton>
                  )}

                  {!isMobile && !isLoggedIn && !isAdminPage && (
                    <RegisterButton onClick={handleOpenRegistration}>Register</RegisterButton>
                  )}

                  {!isMobile && isLoggedIn && (
                    <Typography variant="body2" sx={{ ml: 1, fontWeight: "medium" }}>
                      Hello, {currentUser?.username || "User"}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Toolbar>
          </Container>

          {!isMobile && !isAdminPage && (
            <Box
              sx={{
                bgcolor: theme.palette.primary.main,
                width: "100%",
                color: theme.palette.primary.contrastText,
                overflowX: "auto",
                "&::-webkit-scrollbar": { height: "4px" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "4px" },
                position: "relative",
                zIndex: 1,
              }}
            >
              <Container maxWidth="xl">
                <Toolbar
                  disableGutters
                  sx={{
                    minHeight: "40px",
                    overflowX: "auto",
                    display: "flex",
                    flexWrap: "nowrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <NavButton startIcon={<HomeIcon fontSize="small" />} onClick={() => navigate("/")}>
                    Home
                  </NavButton>

                  <Box sx={{ display: 'flex', flexWrap: 'nowrap', mx: 2 }}>
                    {loading ? (
                      <Typography>Loading categories...</Typography>
                    ) : error ? (
                      <Typography color="error">Failed to load categories</Typography>
                    ) : categories.length === 0 ? (
                      <Typography>No categories available</Typography>
                    ) : (
                      categories.map((parentCategory) => (
                        <Box
                          key={parentCategory.id}
                          ref={(el) => setMenuRef(parentCategory.id, el)} // Use ID for unique ref
                          sx={{ position: "relative" }}
                          onMouseEnter={() => handleDropdownOpen(parentCategory.id)}
                          onMouseLeave={handleDropdownClose}
                        >
                          <NavButton
                            endIcon={
                              (parentCategory.categories || []).length > 0 ? <ChevronDownIcon fontSize="small" /> : null
                            }
                            aria-haspopup="true"
                            aria-expanded={activeDropdown === parentCategory.id ? "true" : "false"}
                            onClick={() => handleDropdownItemClick(parentCategory.id)}
                          >
                            {parentCategory.name || 'N/A'}
                          </NavButton>

                          {(parentCategory.categories || []).length > 0 && (
                            <Popper
                              open={activeDropdown === parentCategory.id}
                              anchorEl={menuRefs.current[parentCategory.id]}
                              placement="bottom-start"
                              transition
                              disablePortal={false}
                              style={{ zIndex: 1400 }}
                              modifiers={[
                                {
                                  name: "offset",
                                  options: { offset: [0, 8] },
                                },
                              ]}
                            >
                              {({ TransitionProps }) => (
                                <Fade {...TransitionProps} timeout={200}>
                                  <DropdownContent
                                    onMouseEnter={() => handleDropdownOpen(parentCategory.id)}
                                    onMouseLeave={handleDropdownClose}
                                  >
                                    {(parentCategory.categories || []).map((category) => (
                                      <Box
                                        key={category.id}
                                        ref={(el) => setCategoryMenuRef(`${parentCategory.id}-${category.id}`, el)}
                                        sx={{ position: "relative" }}
                                        onMouseEnter={() => handleCategoryDropdownOpen(`${parentCategory.id}-${category.id}`)}
                                        onMouseLeave={handleCategoryDropdownClose}
                                      >
                                        <DropdownItem
                                          onClick={() => handleDropdownItemClick(parentCategory.id, category.id)}
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                          }}
                                        >
                                          {category.name || 'N/A'}
                                          {(category.subcategories || []).length > 0 && (
                                            <ChevronRightIcon fontSize="small" />
                                          )}
                                        </DropdownItem>

                                        {(category.subcategories || []).length > 0 && (
                                          <Popper
                                            open={activeCategoryDropdown === `${parentCategory.id}-${category.id}`}
                                            anchorEl={categoryMenuRefs.current[`${parentCategory.id}-${category.id}`]}
                                            placement="right-start"
                                            transition
                                            disablePortal={false}
                                            style={{ zIndex: 1500 }}
                                            modifiers={[
                                              {
                                                name: "offset",
                                                options: { offset: [0, 8] },
                                              },
                                            ]}
                                          >
                                            {({ TransitionProps }) => (
                                              <Fade {...TransitionProps} timeout={200}>
                                                <NestedDropdownContent
                                                  onMouseEnter={() => handleCategoryDropdownOpen(`${parentCategory.id}-${category.id}`)}
                                                  onMouseLeave={handleCategoryDropdownClose}
                                                >
                                                  {(category.subcategories || []).map((subcategory) => (
                                                    <DropdownItem
                                                      key={subcategory.id}
                                                      onClick={() => handleDropdownItemClick(parentCategory.id, category.id, subcategory.id)}
                                                    >
                                                      {subcategory.name || 'N/A'}
                                                    </DropdownItem>
                                                  ))}
                                                </NestedDropdownContent>
                                              </Fade>
                                            )}
                                          </Popper>
                                        )}
                                      </Box>
                                    ))}
                                  </DropdownContent>
                                </Fade>
                              )}
                            </Popper>
                          )}
                        </Box>
                      ))
                    )}
                  </Box>

                  <NavButton onClick={() => navigate("/contact")}>
                    Contact Us
                  </NavButton>
                </Toolbar>
              </Container>
            </Box>
          )}
        </AppBar>
      )}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "85%", sm: 280 },
            maxWidth: "100%",
          },
        }}
      >
        <Box sx={{ width: "100%" }} role="presentation">
          <Box
            sx={{
              p: 2,
              bgcolor: theme.palette.primary.main,
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {isLoggedIn ? (
              <>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 1,
                    bgcolor: theme.palette.secondary.main,
                  }}
                >
                  {currentUser?.username?.charAt(0) || <PersonIcon fontSize="large" />}
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                  Hello, {currentUser?.username || "User"}
                </Typography>
                {isAdmin && (
                  <Typography variant="caption" sx={{ color: "yellow", fontWeight: "bold" }}>
                    Administrator
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      color: "white",
                      borderColor: "white",
                      "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                    onClick={() => {
                      toggleDrawer()
                      navigate(isAdmin ? "/admin" : "/account")
                    }}
                  >
                    {isAdmin ? "Admin Panel" : "My Account"}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: "white",
                      color: theme.palette.primary.main,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                    }}
                    onClick={() => {
                      toggleDrawer()
                      handleLogout()
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 1,
                    bgcolor: theme.palette.primary.light,
                  }}
                >
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                  Welcome
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      color: "white",
                      borderColor: "white",
                      "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                    onClick={() => {
                      toggleDrawer()
                      handleOpenLogin()
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: "white",
                      color: theme.palette.primary.main,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                    }}
                    onClick={() => {
                      toggleDrawer()
                      handleOpenRegistration()
                    }}
                  >
                    Register
                  </Button>
                </Box>
              </>
            )}
          </Box>

          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={isAdminPage ? "Search admin..." : "Search..."}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              p: 1,
              borderBottom: "1px solid #e0e0e0",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            {!isAdminPage && (
              <>
                <IconButton
                  color="primary"
                  onClick={() => {
                    toggleDrawer()
                    navigate("/cart")
                  }}
                >
                  <Badge badgeContent={cartItemsCount} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={() => {
                    toggleDrawer()
                    navigate("/wishlist")
                  }}
                >
                  <FavoriteIcon />
                </IconButton>
              </>
            )}
            <IconButton
              color="primary"
              onClick={() => {
                toggleDrawer()
                navigate("/wallet")
              }}
            >
              <WalletIcon />
            </IconButton>
          </Box>

          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  toggleDrawer()
                  navigate("/")
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <HomeIcon fontSize="small" color="primary" />
                      <span>Home</span>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>

            {isLoggedIn && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    toggleDrawer()
                    navigate(isAdmin ? "/admin" : "/account")
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {isAdmin ? (
                          <AdminPanelSettings fontSize="small" color="primary" />
                        ) : (
                          <AccountCircle fontSize="small" color="primary" />
                        )}
                        <span>{isAdmin ? "Admin Panel" : "My Account"}</span>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            )}

            {!isAdminPage && (
              loading ? (
                <ListItem>
                  <ListItemText primary="Loading categories..." />
                </ListItem>
              ) : error ? (
                <ListItem>
                  <ListItemText primary="Failed to load categories" sx={{ color: 'error.main' }} />
                </ListItem>
              ) : categories.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No categories available" />
                </ListItem>
              ) : (
                categories.map((parentCategory) => (
                  <React.Fragment key={parentCategory.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => {
                          toggleSubmenu(`parent-${parentCategory.id}`)
                          if (!parentCategory.categories?.length) {
                            handleDropdownItemClick(parentCategory.id)
                          }
                        }}
                      >
                        <ListItemText primary={parentCategory.name || 'N/A'} />
                        {(parentCategory.categories || []).length > 0 ? (
                          drawerSubmenus[`parent-${parentCategory.id}`] ? <ExpandLess /> : <ChevronRightIcon />
                        ) : null}
                      </ListItemButton>
                    </ListItem>
                    {(parentCategory.categories || []).length > 0 && (
                      <Collapse in={drawerSubmenus[`parent-${parentCategory.id}`]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {(parentCategory.categories || []).map((category) => (
                            <React.Fragment key={category.id}>
                              <ListItemButton
                                sx={{ pl: 4 }}
                                onClick={() => {
                                  toggleSubmenu(`category-${parentCategory.id}-${category.id}`)
                                  if (!category.subcategories?.length) {
                                    handleDropdownItemClick(parentCategory.id, category.id)
                                  }
                                }}
                              >
                                <ListItemText primary={category.name || 'N/A'} />
                                {(category.subcategories || []).length > 0 ? (
                                  drawerSubmenus[`category-${parentCategory.id}-${category.id}`] ? <ExpandLess /> : <ChevronRightIcon />
                                ) : null}
                              </ListItemButton>
                              {(category.subcategories || []).length > 0 && (
                                <Collapse in={drawerSubmenus[`category-${parentCategory.id}-${category.id}`]} timeout="auto" unmountOnExit>
                                  <List component="div" disablePadding>
                                    {(category.subcategories || []).map((subcategory) => (
                                      <ListItemButton
                                        key={subcategory.id}
                                        sx={{ pl: 8 }}
                                        onClick={() => handleDropdownItemClick(parentCategory.id, category.id, subcategory.id)}
                                      >
                                        <ListItemText primary={subcategory.name || 'N/A'} />
                                      </ListItemButton>
                                    ))}
                                  </List>
                                </Collapse>
                              )}
                            </React.Fragment>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </React.Fragment>
                ))
              )
            )}

            {!isAdminPage && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    toggleDrawer()
                    navigate("/contact")
                  }}
                >
                  <ListItemText primary="Contact Us" />
                </ListItemButton>
              </ListItem>
            )}
          </List>

          <Divider />

          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <PhoneIcon fontSize="small" color="primary" />
              <Typography variant="body2">+254 722517263</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MailIcon fontSize="small" color="primary" />
              <Typography variant="body2">info@firstcraft.com</Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <Menu
        anchorEl={userMenuAnchorEl}
        open={userMenuOpen}
        onClose={handleUserMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 200 },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            navigate(isAdmin ? "/admin" : "/account")
          }}
        >
          <ListItemIcon>
            {isAdmin ? <AdminPanelSettings fontSize="small" /> : <AccountCircle fontSize="small" />}
          </ListItemIcon>
          {isAdmin ? "Admin Panel" : "My Account"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            navigate("/wallet")
          }}
        >
          <ListItemIcon>
            <WalletIcon fontSize="small" />
          </ListItemIcon>
          E-Wallet
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            navigate("/cart")
          }}
        >
          <ListItemIcon>
            <ShoppingBag fontSize="small" />
          </ListItemIcon>
          My Orders
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            navigate("/account")
          }}
        >
          <ListItemIcon>
            <Inbox fontSize="small" />
          </ListItemIcon>
          Inbox
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            navigate("/account")
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Dialog
        open={registrationOpen}
        onClose={handleCloseRegistration}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            maxHeight: "90vh",
            width: { xs: "95%", sm: "90%", md: "80%" },
            margin: { xs: "10px", sm: "auto" },
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, bgcolor: theme.palette.primary.main, color: "white" }}>
          Registration
          <MuiIconButton
            aria-label="close"
            onClick={handleCloseRegistration}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <CloseIcon />
          </MuiIconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: "#f5f5f5", overflowX: "hidden" }}>
          <RegistrationForm />
        </DialogContent>
      </Dialog>

      <Dialog
        open={loginOpen}
        onClose={handleCloseLogin}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            maxHeight: "90vh",
            width: { xs: "95%", sm: "90%", md: "500px" },
            margin: { xs: "10px", sm: "auto" },
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, bgcolor: theme.palette.primary.main, color: "white" }}>
          Sign In
          <MuiIconButton
            aria-label="close"
            onClick={handleCloseLogin}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <CloseIcon />
          </MuiIconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: "#f5f5f5", overflowX: "hidden" }}>
          <LoginPage onLogin={handleLoginSuccess} />
        </DialogContent>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2">
            Don't have an account?{" "}
            <Button
              color="primary"
              onClick={() => {
                handleCloseLogin()
                handleOpenRegistration()
              }}
            >
              Register
            </Button>
          </Typography>
        </Box>
      </Dialog>
    </>
  )
}

export default NavigationBar