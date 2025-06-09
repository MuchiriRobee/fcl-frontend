import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing token');
      return;
    }

    // Validate token
    const validateToken = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/confirm`, {
          params: { token },
        });
        setStatus('success');
        setEmail(response.data.email);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Invalid or expired token');
      }
    };

    validateToken();
  }, [searchParams]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    // Validation checks
    if (!password || !confirmPassword) {
      setMessage('Please fill in both password fields');
      setStatus('error');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setStatus('error');
      return;
    }
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters');
      setStatus('error');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setMessage('Password must contain at least one uppercase letter');
      setStatus('error');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setMessage('Password must contain at least one lowercase letter');
      setStatus('error');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setMessage('Password must contain at least one number');
      setStatus('error');
      return;
    }
    if (!/[!@#$%^&*]/.test(password)) {
      setMessage('Password must contain at least one special character');
      setStatus('error');
      return;
    }

    try {
      const token = searchParams.get('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/set-password`, {
        token,
        password,
      });
      setStatus('success');
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to set password');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
          Set Your Password
        </Typography>

        {status === 'loading' && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}

        {status === 'error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        {status === 'success' && !message && (
          <form onSubmit={handleSubmit}>
            <Typography variant="body1" gutterBottom>
              Setting password for <strong>{email}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              size="small"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={status === 'loading'}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              size="small"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                      disabled={status === 'loading'}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ px: 4, py: 1 }}
                disabled={status === 'loading'}
              >
                Set Password
              </Button>
            </Box>
          </form>
        )}

        {status === 'success' && message && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {message}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Redirecting to login...
            </Typography>
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default SetPassword;