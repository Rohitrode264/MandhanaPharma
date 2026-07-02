import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Navigate, Link } from 'react-router-dom';
import { getDynamicGreeting } from '../utils/greeting';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/products" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.data.token);
    } catch (err: unknown) {
      const errorResponse = (err as { response?: { data?: { message?: string } } }).response;
      setError(errorResponse?.data?.message || 'Failed to login. Please check your credentials.');
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
      bgcolor: '#8AA08E', // The muted green background around the card
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
              <span style={{ color: '#4CAF50' }}>Mandhana</span>Pharma
            </Typography>
            <Box sx={{ width: 24, height: 16, bgcolor: '#f0f0f0', display: 'flex', borderRadius: 0.5, overflow: 'hidden' }}>
              <Box sx={{ flex: 1, bgcolor: '#FF9933' }} />
              <Box sx={{ flex: 1, bgcolor: '#FFFFFF' }} />
              <Box sx={{ flex: 1, bgcolor: '#138808' }} />
            </Box>
          </Box>

          <Box sx={{ maxWidth: 360, mx: 'auto', width: '100%', flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1F2937', textAlign: 'center', mb: 1 }}>
              {getDynamicGreeting()}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center', mb: 5, px: 2 }}>
              Please enter your Email ID and Password to access your account
            </Typography>

            {error && <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                required
                fullWidth
                id="email"
                placeholder="Please enter your email address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#F9FAFB',
                    borderRadius: 2,
                    '& fieldset': { border: 'none' }
                  }
                }}
              />
              <TextField
                required
                fullWidth
                name="password"
                placeholder="Please enter your Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#F9FAFB',
                    borderRadius: 2,
                    '& fieldset': { border: 'none' }
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 4 }}>
                <Typography component={Link} to="/forgot-password" variant="caption" sx={{ color: '#4CAF50', cursor: 'pointer', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Forgot your password?
                </Typography>
              </Box>

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
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
            </Box>

            <Box sx={{ mt: 6, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Write to our support team
              </Typography>
              <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 500 }}>
                support@Mandhanapharma.com
              </Typography>
            </Box>
          </Box>

          <Typography variant="caption" sx={{ textAlign: 'center', color: '#9CA3AF', mt: 'auto', fontSize: '0.65rem' }}>
            Allrights reserved Indie MandhanaPharma Medical Practices 2026 ©
          </Typography>
        </Box>

        {/* Right side - Image */}
        <Box sx={{
          flex: 1,
          display: { xs: 'none', md: 'block' },
          backgroundImage: 'url(https://images.unsplash.com/photo-1629384756704-de20df2bda20?q=80&w=2000&auto=format&fit=crop)',

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
              Modern Medicine the new gold standard for healthcare
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.5, fontSize: '0.8rem' }}>
              The resulting interactive report includes updated information about approved or investigational treatments for each patient.
            </Typography>
          </Box>
        </Box>

      </Paper>
    </Box>
  );
};

export default Login;
