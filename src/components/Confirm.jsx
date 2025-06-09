import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material';

const Confirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid confirmation link');
      return;
    }

    const confirmEmail = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/confirm`, {
          params: { token },
        });
        setStatus('success');
        setMessage(response.data.message);
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Confirmation failed');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        {status === 'loading' && <CircularProgress />}
        {status !== 'loading' && (
          <Alert severity={status === 'success' ? 'success' : 'error'}>
            <Typography variant="h6">{message}</Typography>
            {status === 'success' && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Redirecting to login...
              </Typography>
            )}
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default Confirm;