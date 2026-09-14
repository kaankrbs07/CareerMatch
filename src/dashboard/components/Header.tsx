import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import NotificationsPopover from './NotificationsPopover';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';

export default function Header() {
  return (
    <Stack
      direction="row"
      sx={{
        position: 'fixed',
        top: 5,
        left: 270,
        zIndex: 1200, // üstte görünmesi için
        display: { xs: 'none', md: 'flex' },
        width: '80%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
      spacing={2}
    >
      {/* Breadcrumbs removed as requested */}
      <Box sx={{ flexGrow: 1 }} />
      <Stack direction="row" sx={{ gap: 1 }}>
        <NotificationsPopover />
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}

