import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation } from 'react-router-dom';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: theme.palette.action.disabled, // Safely access palette
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

export default function NavbarBreadcrumbs() {
  const location = useLocation();

  // Path'e göre breadcrumb label'ını belirle
  const getCurrentPageLabel = () => {
    const path = location.pathname;

    if (path === '/dashboard') return 'Anasayfa';
    if (path.includes('/post-job')) return 'İş İlanı Ver';
    if (path.includes('/saved-jobs')) return 'Kaydedilen İlanlar';
    if (path.includes('/my-applications')) return 'Başvurularım';
    if (path.includes('/jobs')) return 'İş İlanları';
    if (path.includes('/cv-upload')) return 'CV Yükle';
    if (path.includes('/matches')) return 'Eşleşmelerim';
    if (path.includes('/chat')) return 'Mesajlar';
    if (path.includes('/settings')) return 'Ayarlar';
    if (path.includes('/about')) return 'Hakkında';
    if (path.includes('/feedback')) return 'Geri Bildirim';
    if (path.includes('/profile')) return 'Profil';

    return 'Anasayfa';
  };

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1">Dashboard</Typography>
      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
        {getCurrentPageLabel()}
      </Typography>
    </StyledBreadcrumbs>
  );
}

