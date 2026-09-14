import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../services/api';
// import { useAuth } from '../context/AuthContext';
import { MenuItem, Select } from '@mui/material';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  maxWidth: '450px',
  boxShadow: 'none',
  backgroundColor: 'transparent',
  [theme.breakpoints.up('md')]: {
    maxWidth: '450px',
  },
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  flexDirection: 'row',
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundColor: theme.palette.background.default,
  },
}));

const LeftSection = styled(Box)(({ theme }) => ({
  display: 'none',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: theme.spacing(8),
  width: '50%',
  position: 'relative',
  background: 'linear-gradient(135deg, #240b36 0%, #c31432 100%)', // Always dark
  color: theme.palette.common.white,
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const RightSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  // const { login } = useAuth(); // Unused now
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('JobSeeker');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !email || !password) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }
    setError('');

    try {
      const parts = name.split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || 'User';

      let roleId = 3; // Default JobSeeker
      if (role === 'Employer') roleId = 2;

      await authService.register({
        email,
        password,
        firstName,
        lastName,
        roleId
      });

      // Auto-login removed. Redirect to verify-email
      // login(response); 

      navigate(`/verify-email?email=${encodeURIComponent(email)}`);

    } catch (err: any) {
      console.error('Registration failed', err);
      let msg = 'Kayıt başarısız.';
      if (err.response) {
        msg += ` Sunucu hatası: ${err.response.status}`;
      } else if (err.message) {
        msg += ` Hata: ${err.message}`;
      }
      setError(msg);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer>
        <LeftSection>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 4,
            bgcolor: 'rgba(255,255,255,0.15)',
            p: 1.5,
            borderRadius: 3
          }}>
            <PersonAddIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">CareerMatch</Typography>
          </Box>
          <Typography variant="h2" fontWeight="bold" sx={{ mb: 2, lineHeight: 1.2 }}>
            Yeteneklerinizi<br />Keşfedelim
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, maxWidth: 480, fontWeight: 400 }}>
            Kariyerinizde bir sonraki adımı atmaya hazır mısınız? Sadece birkaç dakika içinde profilinizi oluşturun.
          </Typography>

          {/* Overlay Icon */}
          <WorkOutlineIcon sx={{
            position: 'absolute',
            right: -60,
            bottom: -60,
            fontSize: 400,
            opacity: 0.1,
            transform: 'rotate(-20deg)'
          }} />
        </LeftSection>

        <RightSection>
          <Box sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1100 }}>
            <ColorModeIconDropdown />
          </Box>
          <Card>
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
                Kayıt Ol
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hemen ücretsiz hesabınızı oluşturun
              </Typography>
            </Stack>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl>
                <FormLabel htmlFor="name" sx={{ mb: 0.5, fontWeight: 500 }}>Ad Soyad</FormLabel>
                <TextField
                  name="name"
                  required
                  fullWidth
                  id="name"
                  placeholder="Adınız Soyadınız"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="email" sx={{ mb: 0.5, fontWeight: 500 }}>E-posta Adresi</FormLabel>
                <TextField
                  required
                  fullWidth
                  id="email"
                  placeholder="ornek@email.com"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password" sx={{ mb: 0.5, fontWeight: 500 }}>Şifre</FormLabel>
                <TextField
                  required
                  fullWidth
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="role" sx={{ mb: 0.5, fontWeight: 500 }}>Hesap Türü</FormLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="JobSeeker">İş Arayan</MenuItem>
                  <MenuItem value="Employer">İşveren</MenuItem>
                </Select>
              </FormControl>
              {error && (
                <Typography color="error" variant="body2" sx={{ bgcolor: 'error.lighter', p: 1, borderRadius: 1 }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`, // Secondary for signup
                  boxShadow: 2
                }}
              >
                Hesap Oluştur
              </Button>
              <Typography sx={{ textAlign: 'center', mt: 2 }} variant="body2" color="text.secondary">
                Zaten hesabınız var mı?{' '}
                <Button
                  variant="text"
                  onClick={() => navigate('/signin')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 'auto',
                    p: 0.5,
                    color: 'secondary.main'
                  }}
                >
                  Giriş Yap
                </Button>
              </Typography>
            </Box>
          </Card>
        </RightSection>
      </SignUpContainer>
    </AppTheme>
  );
}
