import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import PeopleIcon from '@mui/icons-material/People';
import EmailIcon from '@mui/icons-material/Email';

export default function About() {
  return (
    <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto', p: { xs: 1, md: 0 } }}>
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" sx={{
              fontWeight: 800,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Hakkında
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Platform ve sürüm bilgileri.
            </Typography>
          </Box>
        </Stack>

        <Card sx={{
          p: 2.5,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'primary.main',
                  color: (theme) => theme.palette.mode === 'dark' ? 'primary.light' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <InfoIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  İş İlanları Platformu
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  v1.0.0
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Bu platform, kullanıcıların CV'lerini yükleyip iş ilanlarına başvurabileceği
              modern bir iş arama platformudur. Kullanıcı dostu arayüzü ve güçlü özellikleriyle
              iş arama sürecinizi kolaylaştırır.
            </Typography>

            <Box sx={{
              border: '1px solid',
              borderColor: 'divider',
              p: 2,
              borderRadius: 2
            }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, fontSize: '0.875rem' }}>Özellikler</Typography>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CodeIcon color="action" sx={{ fontSize: 18 }} />
                  <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.8rem' }}>Modern ve responsive tasarım</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <PeopleIcon color="action" sx={{ fontSize: 18 }} />
                  <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.8rem' }}>Kolay CV yükleme ve yönetimi</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <EmailIcon color="action" sx={{ fontSize: 18 }} />
                  <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.8rem' }}>Hızlı iş başvuru süreci</Typography>
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                © 2026 İş İlanları Platformu. Tüm hakları saklıdır.
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

