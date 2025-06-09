import React, { useState, useRef, useEffect } from "react"
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
} from "@mui/icons-material"
import { styled, alpha, useTheme } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
import FirstCraftLogo from "../assets/images/FirstCraft-logo.png"
import RegistrationForm from "../pages/Registration/View/Index" // Update this path to match your file structure
import LoginPage from "../pages/Login/View/Index" // Import LoginPage

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
  width: "auto", // Original width setting
  [theme.breakpoints.down("sm")]: {
    marginRight: theme.spacing(1), // Less margin on mobile
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
    padding: theme.spacing(0, 1), // Less padding on mobile
  },
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "20ch", // Original fixed width
    [theme.breakpoints.down("sm")]: {
      width: "15ch", // Smaller width on mobile
      paddingLeft: `calc(1em + ${theme.spacing(3)})`, // Less padding on mobile
      fontSize: "0.875rem", // Smaller font on mobile
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
    marginLeft: theme.spacing(0.5), // Less margin on mobile
    padding: "4px 8px", // Less padding on mobile
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
    marginLeft: theme.spacing(0.5), // Less margin on mobile
    padding: "4px 8px", // Less padding on mobile
  },
}))

// Styled dropdown content
const DropdownContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4], // Stronger shadow
  borderRadius: theme.shape.borderRadius,
  minWidth: 180,
  zIndex: 1500, // Higher z-index to ensure it appears above other content
}))

// Styled dropdown item
const DropdownItem = styled("div")(({ theme }) => ({
  padding: theme.spacing(1, 2),
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}))

const NavigationBar = ({ isLoggedIn, currentUser, onLogout }) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  // Refs for menu buttons
  const menuRefs = useRef({})

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

  // Get cart items count from localStorage
  useEffect(() => {
    const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || []
    setCartItemsCount(storedCartItems.length)
  }, [])

  // State for tooltips
  const [activeTooltip, setActiveTooltip] = useState("")

  // State for dropdowns
  const [activeDropdown, setActiveDropdown] = useState("")

  const menus = {
    "Office Essentials": ["Paper Products", "Writing Instruments", "Binders & Filing"],
    "Toners & Inks": ["HP Toners", "Canon Inks", "Brother Cartridges"],
    "Office Machines": ["Printers", "Shredders", "Laminators"],
  }

  // Handle dropdown open
  const handleDropdownOpen = (menuName) => {
    setActiveDropdown(menuName)
  }

  // Handle dropdown close
  const handleDropdownClose = () => {
    setActiveDropdown("")
  }

  // Handle tooltip open
  const handleTooltipOpen = (tooltipName) => {
    setActiveTooltip(tooltipName)
  }

  // Handle tooltip close
  const handleTooltipClose = () => {
    setActiveTooltip("")
  }

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev)
  }

  const toggleSubmenu = (key) => {
    setDrawerSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleOpenRegistration = () => {
    setRegistrationOpen(true)
    setLoginOpen(false)
  }

  const handleCloseRegistration = () => {
    setRegistrationOpen(false)
  }

  const handleOpenLogin = () => {
    setLoginOpen(true)
    setRegistrationOpen(false)
  }

  const handleCloseLogin = () => {
    setLoginOpen(false)
  }

  // Toggle mobile search
  const toggleMobileSearch = () => {
    setMobileSearchOpen((prev) => !prev)
  }

  // Handle dropdown item click
  const handleDropdownItemClick = (item) => {
    console.log(`Clicked on ${item}`)
    handleDropdownClose()
    // In a real app, you might want to navigate here
  }

  // Initialize refs for menu items
  const setMenuRef = (menuName, element) => {
    menuRefs.current[menuName] = element
  }

  // Handle user menu open
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget)
  }

  // Handle user menu close
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null)
  }

  // Handle logout
  const handleLogout = () => {
    handleUserMenuClose()
    if (onLogout) onLogout()
    navigate("/")
  }

  // Handle login success
  const handleLoginSuccess = (userData) => {
    handleCloseLogin()
    // In a real app, you would update the user state here
  }

  return (
    <>
      <AppBar
        position="static"
        sx={{
          boxShadow: 0,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          overflowX: "hidden", // Prevent horizontal scrolling
          zIndex: 1200, // Set a base z-index for the AppBar
        }}
      >
        {/* Mobile Top Bar - Contact Info */}

        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 1, sm: 2 }, // Reduce padding on small screens
            overflowX: "hidden", // Prevent horizontal scrolling
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              justifyContent: "space-between",
              flexDirection: { xs: "row", sm: "row" }, // Row on all screens for better layout
              alignItems: "center",
              flexWrap: "wrap", // Allow wrapping on very small screens
              minHeight: { xs: "56px" }, // Standard height on mobile
              py: { xs: 1, sm: 1 }, // Consistent padding
              gap: { xs: 1, sm: 0 }, // Add gap between elements on mobile
            }}
          >
            {/* Logo and Mobile Menu Button */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between", // Space between logo and menu button
                width: { xs: "100%", sm: "auto" }, // Full width on mobile
                mb: { xs: 0, sm: 0 }, // No margin bottom
              }}
            >
              {/* Logo */}
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
                      height: { xs: "70px", sm: "70px" }, // Smaller on mobile
                      maxWidth: "100%", // Ensure it doesn't overflow
                      objectFit: "contain", // Maintain aspect ratio
                    }}
                  />
                </Typography>
              </Box>

              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton sx={{ color: theme.palette.primary.main }} onClick={toggleDrawer} aria-label="menu">
                  <MenuIcon />
                </IconButton>
              )}
            </Box>

            {/* Mobile Search Bar - Expandable */}
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
                  placeholder="Search products..."
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

            {/* Right Side - Desktop and Mobile */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row", // Always row for better layout
                alignItems: "center",
                justifyContent: "flex-end", // Align to the right
                gap: { xs: 0.5, sm: 0.5 }, // Smaller gap on mobile
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                px: { xs: 1, sm: 1 }, // Less padding on mobile
                py: { xs: 1, sm: 1 }, // Consistent padding
                borderRadius: 1,
                width: isMobile ? "100%" : "auto", // Full width on mobile
                mt: isMobile && mobileSearchOpen ? 1 : 0, // Add margin top if search is open
              }}
            >
              {/* Search bar - desktop only */}
              {!isMobile && (
                <Search>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase placeholder="Search..." inputProps={{ "aria-label": "search" }} />
                </Search>
              )}

              {/* Mobile Search Toggle Button */}
              {isMobile && !mobileSearchOpen && (
                <IconButton
                  size="small"
                  sx={{ color: theme.palette.primary.contrastText }}
                  onClick={toggleMobileSearch}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              )}

              {/* Action buttons row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                {/* Wishlist Icon with Tooltip */}
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

                {/* Profile Icon with Tooltip */}
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

                {/* Cart Icon with Tooltip */}
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

                {/* E-Wallet Button - Desktop only */}
                {!isTablet && !isMobile && (
                  <WalletButton startIcon={<WalletIcon />} onClick={() => navigate("/wallet")}>
                    E-Wallet
                  </WalletButton>
                )}

                {/* Register/Login Button - Desktop only */}
                {!isMobile && !isLoggedIn && <RegisterButton onClick={handleOpenRegistration}>Register</RegisterButton>}

                {/* User greeting - Desktop only */}
                {!isMobile && isLoggedIn && (
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: "medium" }}>
                    Hello, {currentUser?.username || "User"}
                  </Typography>
                )}
              </Box>
            </Box>
          </Toolbar>
        </Container>

        {/* Bottom Toolbar - Desktop only */}
        {!isMobile && (
          <Box
            sx={{
              bgcolor: theme.palette.primary.main,
              width: "100%",
              color: theme.palette.primary.contrastText,
              overflowX: "auto", // Allow horizontal scrolling only in the menu bar
              "&::-webkit-scrollbar": { height: "4px" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "4px" },
              position: "relative", // Important for proper stacking context
              zIndex: 1, // Lower than dropdown z-index
            }}
          >
            <Container maxWidth="xl">
              <Toolbar
                disableGutters
                sx={{
                  minHeight: "40px",
                  overflowX: "auto",
                  display: "flex",
                  flexWrap: "nowrap", // Prevent wrapping
                }}
              >
                {/* Home Button in the navigation bar */}
                <NavButton startIcon={<HomeIcon fontSize="small" />} onClick={() => navigate("/")}>
                  Home
                </NavButton>

                <NavButton>Special Offer</NavButton>

                {/* Menu items with hover effect */}
                {Object.keys(menus).map((menuName) => (
                  <Box
                    key={menuName}
                    ref={(el) => setMenuRef(menuName, el)}
                    sx={{ position: "relative" }}
                    onMouseEnter={() => handleDropdownOpen(menuName)}
                    onMouseLeave={handleDropdownClose}
                  >
                    <NavButton endIcon={<ChevronDownIcon fontSize="small" />}>{menuName}</NavButton>

                    {/* Dropdown content */}
                    <Popper
                      open={activeDropdown === menuName}
                      anchorEl={menuRefs.current[menuName]}
                      placement="bottom-start"
                      transition
                      disablePortal={false}
                      style={{ zIndex: 1400 }}
                      modifiers={[
                        {
                          name: "offset",
                          options: {
                            offset: [0, 8],
                          },
                        },
                      ]}
                    >
                      {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={200}>
                          <DropdownContent
                            onMouseEnter={() => handleDropdownOpen(menuName)}
                            onMouseLeave={handleDropdownClose}
                          >
                            {menus[menuName].map((item, index) => (
                              <DropdownItem key={index} onClick={() => handleDropdownItemClick(item)}>
                                {item}
                              </DropdownItem>
                            ))}
                          </DropdownContent>
                        </Fade>
                      )}
                    </Popper>
                  </Box>
                ))}

                <NavButton>School Supplies</NavButton>
                <NavButton>Stapling & Punching</NavButton>
                <NavButton>IT Accessories</NavButton>
                <NavButton>Office Furniture</NavButton>
                <NavButton>More</NavButton>
                <NavButton>ALL Brands</NavButton>
                <NavButton>Contact Us</NavButton>

                {/* E-Wallet Button for tablet view */}
                {isTablet && !isMobile && (
                  <WalletButton startIcon={<WalletIcon />} onClick={() => navigate("/wallet")}>
                    E-Wallet
                  </WalletButton>
                )}
              </Toolbar>
            </Container>
          </Box>
        )}
      </AppBar>

      {/* Mobile Drawer - Enhanced for better mobile experience */}
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
          {/* User Profile Section */}
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
                      navigate("/account")
                    }}
                  >
                    My Account
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

          {/* Search in drawer */}
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Quick Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              p: 1,
              borderBottom: "1px solid #e0e0e0",
              borderTop: "1px solid #e0e0e0",
            }}
          >
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
            {/* Home option in mobile drawer */}
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
                    navigate("/account")
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AccountCircle fontSize="small" color="primary" />
                        <span>My Account</span>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            )}

            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="Special Offer" />
              </ListItemButton>
            </ListItem>

            {Object.keys(menus).map((menuName) => (
              <React.Fragment key={menuName}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => toggleSubmenu(menuName)}>
                    <ListItemText primary={menuName} />
                    {drawerSubmenus[menuName] ? <ExpandLess /> : <ChevronRightIcon />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={drawerSubmenus[menuName]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {menus[menuName].map((subItem, index) => (
                      <ListItemButton key={index} sx={{ pl: 4 }}>
                        <ListItemText primary={subItem} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))}

            {[
              "School Supplies",
              "Stapling & Punching",
              "IT Accessories",
              "Office Furniture",
              "More",
              "ALL Brands",
              "Contact Us",
            ].map((item, index) => (
              <ListItem disablePadding key={index}>
                <ListItemButton>
                  <ListItemText primary={item} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider />

          {/* Contact Information */}
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

      {/* User Menu */}
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
            navigate("/account")
          }}
        >
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          My Account
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

      {/* Registration Form Dialog */}
      <Dialog
        open={registrationOpen}
        onClose={handleCloseRegistration}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            maxHeight: "90vh",
            width: { xs: "95%", sm: "90%", md: "80%" }, // Responsive width
            margin: { xs: "10px", sm: "auto" }, // Proper margins on mobile
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

      {/* Login Dialog */}
      <Dialog
        open={loginOpen}
        onClose={handleCloseLogin}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            maxHeight: "90vh",
            width: { xs: "95%", sm: "90%", md: "500px" }, // Responsive width
            margin: { xs: "10px", sm: "auto" }, // Proper margins on mobile
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
