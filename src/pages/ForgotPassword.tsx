import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { forgotPassword } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      // Save the email temporarily so Reset page can optionally auto-login after reset
      sessionStorage.setItem('resetEmail', email);
      setMessage(res?.message || 'If that email exists, a reset link was sent.');
    } catch (err: any) {
      // show neutral message instead of disclosing if email exists (privacy)
      if (err?.response?.status === 404) {
        setMessage('If that email exists, a reset link was sent.');
      } else {
        setError(err?.response?.data?.message || err.message || 'Failed to send reset link.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" p={2}>
      <Paper sx={{ width: '100%', maxWidth: 980, p: { xs: 2, md: 4 } }}>
        <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
          <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="flex-start" px={2}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Forgot password
            </Typography>
            <Typography color="text.secondary" mb={2}>
              Enter your account email and we will send you a link to reset your password.
            </Typography>
          </Box>

          <Box flex={1} px={2} display="flex" alignItems="center">
            <Box component="form" onSubmit={onSubmit} width="100%">
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

              <TextField
                label="Email"
                name="email"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
              />

              <Box mt={2} display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} /> : undefined}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>

                <Button variant="outlined" onClick={() => navigate('/login')}>
                  Back to login
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
