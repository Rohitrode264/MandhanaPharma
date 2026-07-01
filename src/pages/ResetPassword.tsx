import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../services/auth.service';
import axios from 'axios';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError('Reset token is missing from the URL.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      setMessage(res?.message || 'Password reset successful.');

      // Redirect user to login (recommended — avoids storing tokens client-side)
      setTimeout(() => navigate('/login'), 1200);

      // Optional auto-login path (commented):
      // const email = sessionStorage.getItem('resetEmail');
      // if (email) {
      //   // backend must allow credentials (CORS) and set httpOnly cookie on login
      //   await axios.post(`${import.meta.env.VITE_API_URL || ''}/auth/login`, { email, password }, { withCredentials: true });
      //   navigate('/'); // logged-in landing
      //   return;
      // }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" p={2}>
      <Paper sx={{ width: '100%', maxWidth: 640, p: { xs: 2, md: 4 } }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Reset password
        </Typography>
        <Typography color="text.secondary" mb={2}>
          Enter a new password for your account.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <Box component="form" onSubmit={onSubmit}>
          <TextField
            label="New password"
            type="password"
            name="password"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            inputProps={{ minLength: 6 }}
          />
          <TextField
            label="Confirm password"
            type="password"
            name="confirm"
            required
            fullWidth
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            margin="normal"
            inputProps={{ minLength: 6 }}
          />

          <Box mt={2} display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} /> : undefined}
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </Button>

            <Button variant="outlined" onClick={() => navigate('/login')}>
              Back to login
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
