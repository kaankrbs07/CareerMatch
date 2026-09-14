import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/Person';
import Grid from '@mui/material/Grid';
import { useAuth } from '../context/AuthContext';
import { profileService, commonService } from '../services/api';
import type { JobSeekerProfileDto, EmployerProfileDto } from '../services/api';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [occupations, setOccupations] = useState<{ id: number; name: string }[]>([]);
  const [educationLevels, setEducationLevels] = useState<{ id: number; name: string }[]>([]);
  const [industries, setIndustries] = useState<{ id: number; name: string }[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const isJobSeeker = user?.role === 'JobSeeker';
  const isEmployer = user?.role === 'Employer';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (isJobSeeker) {
          const [occRes, eduRes, roleRes, profRes] = await Promise.all([
            commonService.getOccupations(),
            commonService.getEducationLevels(),
            commonService.getRoles(),
            profileService.getJobSeeker().catch(() => null)
          ]);
          setOccupations(occRes);
          setEducationLevels(eduRes);
          setRoles(roleRes);
          if (profRes) setFormData(profRes);
        } else if (isEmployer) {
          const [indRes, roleRes, profRes] = await Promise.all([
            commonService.getIndustries(),
            commonService.getRoles(),
            profileService.getEmployer().catch(() => null)
          ]);
          setIndustries(indRes);
          setRoles(roleRes);
          if (profRes) setFormData(profRes);
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
        setNotification({ open: true, message: 'Profil henüz oluşturulmadı.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user, isJobSeeker, isEmployer]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'experienceYears') {
      if (value === '') {
        setFormData((prev: any) => ({ ...prev, [name]: 0 }));
        return;
      }
      if (value.length > 1 && value[0] === '0') return;
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 0 || numValue > 60) return;
      setFormData((prev: any) => ({ ...prev, [name]: numValue }));
      return;
    }
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (isJobSeeker) {
        await profileService.updateJobSeeker(formData as JobSeekerProfileDto);
      } else if (isEmployer) {
        await profileService.updateEmployer(formData as EmployerProfileDto);
      }
      setNotification({ open: true, message: 'Profil başarıyla güncellendi.', severity: 'success' });
    } catch (err) {
      console.error("Update failed", err);
      setNotification({ open: true, message: 'Güncelleme başarısız. Lütfen bilgileri kontrol edin.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 0 } }}>
      <Stack spacing={2}>

        {/* Header - Compact */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="h5" sx={{
              fontWeight: 800,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Profil Duzenle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kişisel ve profesyonel bilgilerinizi güncelleyin
            </Typography>
          </Box>
          {isJobSeeker && (
            <Button
              variant="contained"
              component={Link}
              to="/dashboard/cv-upload"
              size="small"
              sx={{
                borderRadius: 2,
                px: 2,
                textTransform: 'none',
                fontWeight: 700,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
            >
              CV Yükle
            </Button>
          )}
        </Stack>

        <Grid container spacing={3}>
          {/* Left Column: Avatar & Quick Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%'
            }}>
              <Box sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                pt: 4,
                pb: 8, // Extended padding for avatar overlap
                px: 3,
                position: 'relative',
                color: 'white',
                textAlign: 'center'
              }}>
                <PersonIcon sx={{
                  position: 'absolute',
                  right: -20,
                  top: -20,
                  fontSize: 150,
                  opacity: 0.1,
                  transform: 'rotate(15deg)'
                }} />
                <Typography variant="h5" fontWeight="bold">{formData.firstName} {formData.lastName}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {roles.find(r => r.name === user?.role)?.name || user?.role}
                </Typography>
              </Box>
              <Box sx={{ px: 3, pb: 4, textAlign: 'center', mt: -6 }}>
                <Avatar
                  src="/static/images/avatar/placeholder.jpg"
                  sx={{
                    width: 100,
                    height: 100,
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    mx: 'auto',
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', opacity: 0.9, lineHeight: 1.6 }}>{formData.email}</Typography>

                <Box
                  sx={{
                    p: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : 'grey.100',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: 'italic',
                      opacity: 0.9,
                      lineHeight: 1.6,
                      color: (theme) =>
                        theme.palette.mode === 'dark'
                          ? theme.palette.grey[300]   // DARK MODE YAZI RENGİ
                          : theme.palette.grey[700],  // LIGHT MODE YAZI RENGİ
                    }}
                  >
                    {(!formData.description || formData.description === 'Kayıt sırasında oluşturuldu')
                      ? 'Henüz bir açıklama eklemediniz.'
                      : formData.description}
                  </Typography>
                </Box>

              </Box>
            </Card>
          </Grid>

          {/* Right Column: Edit Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              border: '1px solid',
              borderColor: 'divider',
              p: 3
            }}>
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight="bold">Detayları Düzenle</Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Ad"
                      name="firstName"
                      size="small"
                      value={formData.firstName || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Soyad"
                      name="lastName"
                      size="small"
                      value={formData.lastName || ''}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Hakkımda"
                      name="description"
                      size="small"
                      value={
                        formData.description === 'Kayıt sırasında oluşturuldu'
                          ? ''
                          : formData.description || ''
                      }
                      onChange={handleChange}
                      multiline
                      minRows={0}
                      maxRows={3}
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                      helperText={
                        formData.description === 'Kayıt sırasında oluşturuldu'
                          ? 'Kayıt sırasında otomatik oluşturuldu'
                          : ''
                      }
                      sx={{
                        '& textarea': {
                          lineHeight: 1.6,
                        },
                      }}
                    />

                  </Grid>



                  {/* Job Seeker Fields */}
                  {isJobSeeker && (
                    <>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Ülke"
                          name="country"
                          size="small"
                          value={formData.country || ''}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><LocationOnIcon fontSize="small" color="primary" /></InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Şehir"
                          name="city"
                          size="small"
                          value={formData.city || ''}
                          onChange={handleChange}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          select
                          fullWidth
                          label="Meslek"
                          name="occupationId"
                          size="small"
                          value={formData.occupationId || ''}
                          onChange={handleChange}
                        >
                          {occupations.map((opt) => (
                            <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          select
                          fullWidth
                          label="Eğitim Seviyesi"
                          name="educationId"
                          size="small"
                          value={formData.educationId || ''}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><SchoolIcon fontSize="small" color="primary" /></InputAdornment>,
                          }}
                        >
                          {educationLevels.map((opt) => (
                            <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Deneyim (Yıl)"
                          name="experienceYears"
                          type="number"
                          size="small"
                          value={formData.experienceYears || 0}
                          onChange={handleChange}
                          inputProps={{ min: 0, max: 60 }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><WorkIcon fontSize="small" color="primary" /></InputAdornment>,
                          }}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Employer Fields */}
                  {isEmployer && (
                    <>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Şirket Adı"
                          name="companyName"
                          size="small"
                          value={formData.companyName || ''}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><BusinessIcon fontSize="small" color="primary" /></InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Endüstri"
                          name="industryId"
                          select
                          size="small"
                          value={formData.industryId || ''}
                          onChange={handleChange}
                        >
                          {industries.map((opt) => (
                            <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Adres"
                          name="address"
                          multiline
                          rows={2}
                          size="small"
                          value={formData.address || ''}
                          onChange={handleChange}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                      px: 4,
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                    }}
                  >
                    {saving ? '' : 'Kaydet'}
                  </Button>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Stack>
    </Box>
  );
}

