import { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jobService, applicationService, savedJobService } from '../services/api';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [employerStats, setEmployerStats] = useState({ activeJobs: 0, totalApplications: 0, totalViews: 0 });
  const [jobSeekerStatsData, setJobSeekerStatsData] = useState({ activeApplications: 0 });
  const [savedJobsCount, setSavedJobsCount] = useState(0);

  const isEmployer = user?.role === 'Employer';

  useEffect(() => {
    if (isEmployer) {
      jobService.getEmployerStats()
        .then(data => {
          setEmployerStats(data);
        })
        .catch(err => console.error("Stats fetch error:", err));
    } else {
      applicationService.getStats()
        .then(data => {
          setJobSeekerStatsData(data);
        })
        .catch(err => console.error("JS Stats fetch error:", err));

      // Fetch saved jobs count for JobSeekers
      savedJobService.getSavedJobIds()
        .then(ids => {
          setSavedJobsCount(ids.length);
        })
        .catch(err => console.error("Saved jobs fetch error:", err));
    }
  }, [isEmployer]);

  const jobSeekerStats = [
    {
      title: 'Aktif Başvurular',
      value: jobSeekerStatsData.activeApplications.toString(),
      icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      desc: 'Değerlendirme süreci devam edenler'
    },
    {
      title: 'Kaydedilen İlanlar',
      value: savedJobsCount.toString(),
      icon: <BookmarkIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      desc: 'Favorilerinize eklediğiniz ilanlar'
    }
  ];

  const employerStatsCards = [
    {
      title: 'Aktif İlanlar',
      value: employerStats.activeJobs.toString(),
      icon: <WorkOutlineIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      desc: 'Yayında olan iş ilanlarınız'
    },
    {
      title: 'Toplam Başvuru',
      value: employerStats.totalApplications?.toString() || '0',
      icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
      desc: 'İlanlarınıza gelen toplam başvuru'
    }
  ];

  const stats = isEmployer ? employerStatsCards : jobSeekerStats;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setTimeout(() => {
        alert(`"${file.name}" yüklendi! (Demo)`);
        setSelectedFile(null);
      }, 1000);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 0 } }}>
      <Grid container spacing={4}>

        {/* Welcome Section - Full Width */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
              : 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={3}>
              <Box sx={{ position: 'relative', zIndex: 1, maxWidth: { xs: '100%', md: '65%' } }}>
                <Typography variant="h4" fontWeight="800" gutterBottom sx={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  Hoş Geldin, <Box component="span" sx={{ opacity: 0.9 }}>{user?.firstName} {user?.lastName}</Box> !
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95, mb: 3, fontWeight: 500 }}>
                  {isEmployer
                    ? "Ekibiniz için en iyi yetenekleri bugün keşfedin."
                    : "Kariyer yolculuğunuzda yeni fırsatlar sizi bekliyor."
                  }
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(isEmployer ? '/dashboard/post-job' : '/dashboard/jobs')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    textTransform: 'none',
                    px: 4,
                    '&:hover': {
                      bgcolor: 'grey.100',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {isEmployer ? 'Hemen İlan Ver' : 'İlanları İncele'}
                </Button>
              </Box>

              {/* Decorative Art */}
              <Box sx={{
                display: { xs: 'none', md: 'block' },
                position: 'relative',
                width: '150px',
                height: '150px',
                opacity: 0.8
              }}>
                <WorkOutlineIcon sx={{ fontSize: 140, color: 'rgba(255,255,255,0.3)' }} />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Stats Section */}
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 6 }} key={index}>
            <Card sx={{
              p: 3,
              height: '100%',
              borderRadius: 3,
              background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }
            }}>
              <Box sx={{
                p: 1.5,
                borderRadius: 3,
                background: stat.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  {stat.title}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}

        {/* Quick Actions Title */}
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <Typography variant="h5" fontWeight="700">
            Hızlı İşlemler
          </Typography>
        </Grid>

        {/* Quick Action Cards */}
        {/* JobSeeker Specific */}
        {!isEmployer && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{
              p: 3,
              borderRadius: 3,
              cursor: 'pointer',
              border: '1px dashed',
              borderColor: 'primary.main',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.05)' : 'rgba(33, 150, 243, 0.03)',
              transition: 'all 0.3s',
              '&:hover': {
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.08)',
                transform: 'translateY(-3px)'
              }
            }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'primary.main', color: 'white' }}>
                  <CloudUploadIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold">CV Yükle / Güncelle</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Profilinizi güncel tutarak şansınızı artırın
                  </Typography>
                  {selectedFile && (
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      ✓ {selectedFile.name}
                    </Typography>
                  )}
                </Box>
                <ArrowForwardIcon color="action" />
              </Stack>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Card>
          </Grid>
        )}

        {/* Employer Specific */}
        {isEmployer && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{
              p: 3,
              borderRadius: 3,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: 'primary.main',
                transform: 'translateY(-3px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }
            }}
              onClick={() => navigate('/dashboard/post-job')}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'secondary.main', color: 'white' }}>
                  <PostAddIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold">Yeni İlan Oluştur</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aradığınız adayı bulmak için ilan yayınlayın
                  </Typography>
                </Box>
                <ArrowForwardIcon color="action" />
              </Stack>
            </Card>
          </Grid>
        )}

        {/* Common Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{
            p: 3,
            borderRadius: 3,
            cursor: 'pointer',
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.3s',
            '&:hover': {
              borderColor: 'info.main',
              transform: 'translateY(-3px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }
          }}
            onClick={() => navigate('/dashboard/profile')}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'info.main', color: 'white' }}>
                <SettingsIcon />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">Profil Ayarları</Typography>
                <Typography variant="body2" color="text.secondary">
                  Hesap bilgilerinizi ve tercihlerinizi yönetin
                </Typography>
              </Box>
              <ArrowForwardIcon color="action" />
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

