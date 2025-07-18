"use client"

import { Box, Grid, Typography, Link, IconButton, Stack, useTheme, useMediaQuery } from "@mui/material"
import FacebookIcon from "@mui/icons-material/Facebook"
import TwitterIcon from "@mui/icons-material/Twitter"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import InstagramIcon from "@mui/icons-material/Instagram"
import YouTubeIcon from "@mui/icons-material/YouTube"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import FirstCraftLogo from "../assets/images/FirstCraft-logo.png"
import { useNavigate } from "react-router-dom"

const AppStoreBadge = () => (
  <Box component="img" alt="App Store" src="/path-to-appstore-badge.png" sx={{ height: 40, mb: 1 }} />
)

const GooglePlayBadge = () => (
  <Box component="img" alt="Google Play" src="/path-to-googleplay-badge.png" sx={{ height: 40 }} />
)

const FooterLink = ({ text, href, onClick }) => (
  <Link
    href={href}
    underline="none"
    color="inherit"
    onClick={onClick}
    sx={{
      display: "block",
      mb: 1.8,
      fontSize: "0.9rem",
      color: "rgba(255, 255, 255, 0.85)",
      transition: "all 0.3s ease",
      cursor: "pointer",
      position: "relative",
      "&:hover": {
        color: "#87CEEB",
        transform: "translateX(8px)",
        "&::after": {
          width: "100%",
          opacity: 1,
        },
      },
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: -2,
        left: 0,
        width: "0%",
        height: "2px",
        background: "linear-gradient(90deg, #87CEEB, #B0E0E6)",
        transition: "all 0.3s ease",
        opacity: 0,
      },
    }}
  >
    {text}
  </Link>
)

export default function Footer() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const navigate = useNavigate()

  return (
    <Box 
      sx={{ 
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%)",
        position: "relative",
        pt: 8, 
        pb: 4, 
        px: 3,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grid\" width=\"10\" height=\"10\" patternUnits=\"userSpaceOnUse\"><path d=\"M 10 0 L 0 0 0 10\" fill=\"none\" stroke=\"rgba(255,255,255,0.03)\" stroke-width=\"1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grid)\"/></svg>')",
          pointerEvents: "none",
        },
      }}
    >
      <Grid container sx={{ position: "relative", zIndex: 1 }}>
        {/* Logo and company info */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              mb: 3, 
              cursor: "pointer",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }} 
            onClick={() => navigate("/")}
          >
            <Box 
              component="img" 
              src={FirstCraftLogo} 
              alt="First Craft logo" 
              sx={{ 
                height: 100,
                filter: "brightness(1.2) contrast(1.1)",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }} 
            />
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 3, 
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "1rem",
              lineHeight: 1.6,
            }}
          >
            Connect with us on social media
          </Typography>
          <Stack 
            direction="row" 
            spacing={1.5} 
            justifyContent={isMobile ? "center" : "flex-start"} 
            sx={{ mb: 3 }}
          >
            <IconButton 
              size="medium" 
              sx={{ 
                bgcolor: "rgba(255, 255, 255, 0.1)", 
                color: "#87CEEB",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": { 
                  bgcolor: "rgba(135, 206, 235, 0.2)",
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 25px rgba(135, 206, 235, 0.3)",
                },
              }}
            >
              <FacebookIcon fontSize="medium" />
            </IconButton>
            <IconButton 
              size="medium" 
              sx={{ 
                bgcolor: "rgba(255, 255, 255, 0.1)", 
                color: "#87CEEB",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": { 
                  bgcolor: "rgba(135, 206, 235, 0.2)",
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 25px rgba(135, 206, 235, 0.3)",
                },
              }}
            >
              <TwitterIcon fontSize="medium" />
            </IconButton>
            <IconButton 
              size="medium" 
              sx={{ 
                bgcolor: "rgba(255, 255, 255, 0.1)", 
                color: "#87CEEB",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": { 
                  bgcolor: "rgba(135, 206, 235, 0.2)",
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 25px rgba(135, 206, 235, 0.3)",
                },
              }}
            >
              <LinkedInIcon fontSize="medium" />
            </IconButton>
            <IconButton 
              size="medium" 
              sx={{ 
                bgcolor: "rgba(255, 255, 255, 0.1)", 
                color: "#87CEEB",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": { 
                  bgcolor: "rgba(135, 206, 235, 0.2)",
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 25px rgba(135, 206, 235, 0.3)",
                },
              }}
            >
              <InstagramIcon fontSize="medium" />
            </IconButton>
            <IconButton 
              size="medium" 
              sx={{ 
                bgcolor: "rgba(255, 255, 255, 0.1)", 
                color: "#87CEEB",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": { 
                  bgcolor: "rgba(135, 206, 235, 0.2)",
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 25px rgba(135, 206, 235, 0.3)",
                },
              }}
            >
              <YouTubeIcon fontSize="medium" />
            </IconButton>
          </Stack>
        </Grid>

        {/* Link Sections */}
        <Grid item xs={12} md={9}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-evenly",
              ml: { md: 4 },
              mt: { xs: 4, md: 0 },
            }}
          >
            <Box sx={{ mb: { xs: 4, sm: 0 }, minWidth: "140px", mr: { sm: 12 } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  fontWeight: "600",
                  color: "#B0E0E6",
                  fontSize: "1.1rem",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -8,
                    left: 0,
                    width: "30px",
                    height: "2px",
                    background: "linear-gradient(90deg, #87CEEB, #B0E0E6)",
                  },
                }}
              >
                About
              </Typography>
              <FooterLink text="About Us" href="#" />
              <FooterLink text="Contact us" href="#" />
            </Box>

            <Box sx={{ mb: { xs: 4, sm: 0 }, minWidth: "140px", mx: { sm: 12 } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  fontWeight: "600",
                  color: "#B0E0E6",
                  fontSize: "1.1rem",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -8,
                    left: 0,
                    width: "30px",
                    height: "2px",
                    background: "linear-gradient(90deg, #87CEEB, #B0E0E6)",
                  },
                }}
              >
                Information
              </Typography>
              <FooterLink text="Help Center" href="#" />
              <FooterLink text="Refund Policy" href="#" />
            </Box>

            <Box sx={{ minWidth: "140px", ml: { sm: 12 } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  fontWeight: "600",
                  color: "#B0E0E6",
                  fontSize: "1.1rem",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -8,
                    left: 0,
                    width: "30px",
                    height: "2px",
                    background: "linear-gradient(90deg, #87CEEB, #B0E0E6)",
                  },
                }}
              >
                For users
              </Typography>
              <FooterLink text="Login" onClick={() => navigate("/login")} />
              <FooterLink text="Register" onClick={() => navigate("/register")} />
              <FooterLink text="Settings" href="#" />
              <FooterLink text="My Orders" href="#" />
              <FooterLink text="Sales Agent Login" onClick={() => navigate("/login?type=agent")} />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Bottom section */}
      <Box
        sx={{
          mt: 6,
          pt: 4,
          borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "0.9rem",
          }}
        >
          © 2025 First Craft. All rights reserved.
        </Typography>
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center",
            bgcolor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            px: 2,
            py: 1,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.15)",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "0.9rem",
              mr: 0.5,
            }}
          >
            English
          </Typography>
          <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "rgba(255, 255, 255, 0.9)" }} />
        </Box>
      </Box>
    </Box>
  )
}