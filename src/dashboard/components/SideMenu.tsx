import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MenuContent from './MenuContent';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const handleAvatarClick = () => {
    navigate('/dashboard/profile');
  };

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setOpenLogoutDialog(false);
    navigate('/signin');
  };

  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          [`& .${drawerClasses.paper}`]: {
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Box
          sx={{
            overflow: 'auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <MenuContent />

        </Box>
        <Stack
          direction="row"
          sx={{
            p: 2,
            gap: 1,
            alignItems: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Avatar
            sizes="small"
            alt={user?.email || 'User'}
            src="/static/images/avatar/7.jpg"
            sx={{
              width: 36,
              height: 36,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }}
            onClick={handleAvatarClick}
          />
          <Box
            sx={{
              mr: 'auto',
              cursor: 'pointer',
              flex: 1,
              '&:hover': {
                opacity: 0.8,
              },
            }}
            onClick={handleAvatarClick}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
              {user?.email || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user?.email || 'user@email.com'}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleLogoutClick}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                backgroundColor: 'light',
              },
            }}
            aria-label="Logout"
          >
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Drawer>

      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: { borderRadius: 3, padding: 1 }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>
          Çıkış Yap
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Çıkış yapmak istediğinizden emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleLogoutCancel} sx={{ color: 'text.secondary' }}>
            İptal
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="error"
            autoFocus
            sx={{ borderRadius: 2 }}
          >
            Çıkış Yap
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

