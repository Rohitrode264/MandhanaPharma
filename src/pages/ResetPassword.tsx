import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { KeyRound, CheckCircle2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const { resetToken } = useParams<{ resetToken: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/auth/reset-password/${resetToken}`, { password });
      setSuccess(true);
      // Automatically log user in if token returned
      if (response.data?.data?.token) {
        setTimeout(() => {
          login(response.data.data.token);
          navigate('/products');
        }, 2500);
      }
    } catch (err: unknown) {
      const errorResponse = (err as { response?: { data?: { message?: string } } }).response;
      setError(errorResponse?.data?.message || 'Failed to reset password. The link may have expired or is invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#8AA08E',
      p: { xs: 2, md: 4 }
    }}>
      <Paper sx={{
        display: 'flex',
        width: '100%',
        maxWidth: 1000,
        height: 600,
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>

        {/* Left side - Form */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 6,
          bgcolor: '#FFFFFF',
          position: 'relative'
        }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
              <span style={{ color: '#4CAF50' }}>Mandhana</span>Pharma
            </Typography>
            <Box sx={{ width: 24, height: 16, bgcolor: '#f0f0f0', display: 'flex', borderRadius: 0.5, overflow: 'hidden' }}>
              <Box sx={{ flex: 1, bgcolor: '#FF9933' }} />
              <Box sx={{ flex: 1, bgcolor: '#FFFFFF' }} />
              <Box sx={{ flex: 1, bgcolor: '#138808' }} />
            </Box>
          </Box>

          <Box sx={{ maxWidth: 380, mx: 'auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justify: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#F0FDF4', borderRadius: '50%', mr: 2, display: 'flex' }}>
                <KeyRound size={24} color="#16A34A" />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#1F2937' }}>
                  Set New Password
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 4 }}>
              Your new password must be different from previously used passwords.
            </Typography>

            {error && <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>{error}</Alert>}

            {success ? (
              <Box sx={{ textAlign: 'center', p: 4, bgcolor: '#F0FDF4', borderRadius: 3, border: '1px solid #BBF7D0' }}>
                <CheckCircle2 size={48} color="#16A34A" style={{ margin: '0 auto 16px' }} />
                <Typography variant="h6" sx={{ color: '#166534', fontWeight: 600, mb: 1 }}>
                  Password Reset Successful!
                </Typography>
                <Typography variant="body2" sx={{ color: '#15803D', mb: 3, lineHeight: 1.5 }}>
                  Your password has been reset successfully. Redirecting you to your dashboard...
                </Typography>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ borderRadius: 12, py: 1, textTransform: 'none', fontWeight: 600 }}
                >
                  Go to Login Now
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>
                  New Password
                </Typography>
                <TextField
                  required
                  fullWidth
                  id="password"
                  placeholder="Enter new password (min. 6 characters)"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#F9FAFB',
                      borderRadius: 2,
                      '& fieldset': { border: 'none' }
                    }
                  }}
                />

                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>
                  Confirm New Password
                </Typography>
                <TextField
                  required
                  fullWidth
                  id="confirmPassword"
                  placeholder="Re-enter new password"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#F9FAFB',
                      borderRadius: 2,
                      '& fieldset': { border: 'none' }
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="secondary"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 12,
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                </Button>
              </Box>
            )}
          </Box>

          <Typography variant="caption" sx={{ textAlign: 'center', color: '#9CA3AF', mt: 'auto', fontSize: '0.65rem' }}>
            Allrights reserved Indie MandhanaPharma Medical Practices 2026 ©
          </Typography>
        </Box>

        {/* Right side - Image */}
        <Box sx={{
          flex: 1,
          display: { xs: 'none', md: 'block' },
          backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}>
          {/* Glassmorphism Card on Image */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            p: 4,
            bgcolor: 'rgba(243, 243, 243, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}>
            <Box sx={{ width: 24, height: 24, border: '2px solid white', borderRadius: '50%', mb: 2 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                lineHeight: 1.3,
                mb: 2,
                color: '#fff',
              }}
            >
              Next-Gen Pharmacy & Drug Catalog Management
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.5, fontSize: '0.8rem' }}>
              Seamlessly manage products, formulas, pricing, and inventory across domestic and international markets.
            </Typography>
          </Box>
        </Box>

      </Paper>
    </Box>
  );
};

export default ResetPassword;
