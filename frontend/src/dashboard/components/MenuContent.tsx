import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WorkIcon from '@mui/icons-material/Work';
import PostAddIcon from '@mui/icons-material/PostAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Chip from '@mui/material/Chip';
import { useChat } from '../../context/ChatContext';

export default function MenuContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useChat();

  const isEmployer = user?.role === 'Employer';

  const isAdmin = user?.role === 'Admin';

  const jobSeekerItems = [
    { text: 'Anasayfa', icon: <HomeRoundedIcon />, path: '/dashboard' },
    { text: 'İş İlanları', icon: <WorkIcon />, path: '/dashboard/jobs' },
    { text: 'Kaydedilenler', icon: <FavoriteRoundedIcon />, path: '/dashboard/saved-jobs' },
    { text: 'Başvurularım', icon: <AssignmentIcon />, path: '/dashboard/my-applications' },
    { text: 'CV Yükle', icon: <CloudUploadIcon />, path: '/dashboard/cv-upload' },
    { text: 'Eşleşmelerim', icon: <AnalyticsRoundedIcon />, path: '/dashboard/matches' },
    { text: 'Mesajlar', icon: <ChatBubbleOutlineIcon />, path: '/dashboard/chat' },
  ];

  const employerItems = [
    { text: 'Anasayfa', icon: <HomeRoundedIcon />, path: '/dashboard' },
    { text: 'İş İlanı Ver', icon: <PostAddIcon />, path: '/dashboard/post-job' },
    { text: 'İlanlarım', icon: <WorkIcon />, path: '/dashboard/jobs' },
    { text: 'Mesajlar', icon: <ChatBubbleOutlineIcon />, path: '/dashboard/chat' },
  ];

  const adminItems = [
    { text: 'Panel', icon: <AnalyticsRoundedIcon />, path: '/admin' },
    { text: 'Tüm İlanlar', icon: <WorkIcon />, path: '/dashboard/jobs' },
  ];

  const mainListItems = isAdmin ? adminItems : (isEmployer ? employerItems : jobSeekerItems);

  const secondaryListItems = [
    { text: 'Ayarlar', icon: <SettingsRoundedIcon />, path: '/dashboard/settings' },
    { text: 'Hakkında', icon: <InfoRoundedIcon />, path: '/dashboard/about' },
    { text: 'Geri Bildirim', icon: <HelpRoundedIcon />, path: '/dashboard/feedback' },
  ];

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {item.path === '/dashboard/chat' && unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  color="error"
                  size="small"
                  sx={{ height: 20, minWidth: 20, ml: 1, fontSize: '0.75rem' }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}

