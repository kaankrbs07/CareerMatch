import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

export default function Settings() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async () => {
    setSubmitted(false);
    setError('');

    // Basit validasyonlar
    if (!currentPassword) {
      setError("Mevcut şifrenizi giriniz.");
      return;
    }

    if (!newPassword) {
      setError("Yeni şifre alanı boş olamaz.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler uyuşmuyor.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("Yeni şifre eskisiyle aynı olamaz.");
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword({
        activePassword: currentPassword,
        newPassword: newPassword
      });

      setSubmitted(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Şifre değiştirilemedi. Lütfen mevcut şifrenizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', p: { xs: 1, md: 0 } }}>
      <Stack spacing={2}>

        {/* Header Section - Compact */}
        <Card sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)'
            : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 80
        }}>
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ mb: 0.5, fontSize: '1.5rem' }}>
              Hesap Ayarları
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Kişisel bilgilerinizi ve güvenliğinizi yönetin
            </Typography>
          </Box>
          <SettingsIcon sx={{ fontSize: 48, opacity: 0.2, display: { xs: 'none', sm: 'block' } }} />
        </Card>

        <Grid container spacing={2}>
          {/* Security Settings Column */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'visible'
            }}>
              <Box sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Box sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: 'primary.main',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  display: 'flex'
                }}>
                  <SecurityIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Güvenlik ve Giriş
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={2} sx={{ p: 3 }}>
                <Box sx={{ minHeight: 40, display: error || (submitted && !error) ? 'block' : 'none' }}>
                  {error && (
                    <Alert severity="error" sx={{ width: '100%', borderRadius: 2, py: 0.5 }}>
                      {error}
                    </Alert>
                  )}
                  {submitted && !error && (
                    <Alert severity="success" sx={{ width: '100%', borderRadius: 2, py: 0.5 }}>
                      Şifreniz başarıyla güncellendi!
                    </Alert>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="E-posta Adresi"
                  value={email}
                  disabled
                  size="small"
                  variant="outlined"
                  slotProps={{
                    input: {
                      startAdornment: <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>@</Box>
                    }
                  }}
                  helperText="Değiştirilemez"
                />

                <Box sx={{ borderTop: '1px dashed', borderColor: 'divider', my: 1 }} />

                <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockIcon fontSize="small" color="action" /> Şifre Değiştir
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Mevcut Şifre"
                      type="password"
                      size="small"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Yeni Şifre"
                      type="password"
                      size="small"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Yeni Şifre (Tekrar)"
                      type="password"
                      size="small"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading}
                    size="medium"
                    sx={{
                      px: 4,
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    {loading ? '...' : 'Kaydet'}
                  </Button>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

