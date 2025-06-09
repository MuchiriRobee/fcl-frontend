import { useState, useEffect, Component } from "react";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  Box,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container component="main" maxWidth="xs" sx={{ py: 4 }}>
          <Paper elevation={0} sx={{ padding: 3, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>
              Something Went Wrong
            </Typography>
            <Alert severity="error" sx={{ mb: 2 }}>
              An error occurred: {this.state.error?.message || "Unknown error"}
            </Alert>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
            <Button
              variant="outlined"
              sx={{ ml: 1 }}
              onClick={() => window.location.href = '/'}
            >
              Back to Sign In
            </Button>
          </Paper>
        </Container>
      );
    }
    return this.props.children;
  }
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    console.log("ResetPasswordPage mounted, searchParams:", searchParams.toString());
    let tokenParam = decodeURIComponent(searchParams.get("token") || "");

    // Check if tokenParam is a URL and extract the actual token
    try {
      const url = new URL(tokenParam.startsWith('http') ? tokenParam : `http://dummy.com?token=${tokenParam}`);
      tokenParam = url.searchParams.get("token") || tokenParam;
    } catch (e) {
      console.error("Error parsing token as URL:", e);
    }

    if (!tokenParam || tokenParam.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(tokenParam)) {
      setError("Invalid reset token format. Please use the link from your email.");
      setIsLoading(false);
      console.error("Invalid token format:", tokenParam);
      return;
    }

    setToken(tokenParam);
    console.log("Token extracted:", tokenParam);

    const verifyToken = async () => {
      try {
        console.log("Verifying token with API:", `${import.meta.env.VITE_API_URL}/auth/verify-reset-token?token=${tokenParam}`);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/verify-reset-token`,
          { params: { token: tokenParam } }
        );

        console.log("Verify token response:", response.data);

        if (response.status === 200 && response.data.message === "Token valid") {
          setIsTokenValid(true);
        } else {
          setError(response.data.message || "Invalid or expired reset token. Please request a new link.");
        }
      } catch (err) {
        console.error("Token verification error:", err.response?.data || err.message);
        const errorMessage =
          err.response?.data?.message ||
          "Failed to verify token. Please request a new link.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      setIsLoading(false);
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      setIsLoading(false);
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      setIsLoading(false);
      return;
    }

    if (!/[!@#$%^&*]/.test(password)) {
      setError("Password must contain at least one special character");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Submitting reset password request with token:", token);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        { token, password, confirmPassword },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Reset password response:", response.data);

      if (response.status === 200) {
        setSuccessMessage("Password reset successfully. Redirecting to login...");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => navigate('/'), 2000);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err) {
      console.error("Reset password error:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.map((e) => e.msg).join(", ") ||
        "Failed to reset password. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container component="main" maxWidth="xs" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Validating reset token...
        </Typography>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container component="main" maxWidth="xs" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h5" gutterBottom>
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Enter your new password below.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
              {(error.includes("token") || error.includes("Token")) && (
                <Box sx={{ mt: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Request New Link
                  </Button>
                </Box>
              )}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <TextField
              label="New Password"
              fullWidth
              margin="normal"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || !isTokenValid}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={isLoading || !isTokenValid}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              fullWidth
              margin="normal"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading || !isTokenValid}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                      disabled={isLoading || !isTokenValid}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, py: 1.5 }}
              disabled={isLoading || !isTokenValid}
            >
              {isLoading ? <CircularProgress size={24} /> : "Reset Password"}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              sx={{ mt: 1, py: 1.5 }}
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Back to Sign In
            </Button>
          </form>
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}

export default ResetPasswordPage;