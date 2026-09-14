import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CancelIcon from '@mui/icons-material/Cancel';
import { applicationService } from '../services/api';

export default function MyApplications() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [withdrawDialog, setWithdrawDialog] = useState<{ open: boolean; applicationId: number | null }>({
        open: false,
        applicationId: null
    });

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const data = await applicationService.getMyApplications();
            setApplications(data);
        } catch (err) {
            console.error('Failed to load applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawClick = (applicationId: number) => {
        setWithdrawDialog({ open: true, applicationId });
    };

    const handleWithdrawConfirm = async () => {
        if (!withdrawDialog.applicationId) return;

        try {
            await applicationService.withdrawApplication(withdrawDialog.applicationId);
            setWithdrawDialog({ open: false, applicationId: null });
            loadApplications(); // Refresh list
        } catch (err) {
            console.error('Failed to withdraw application:', err);
            alert('Başvuru geri çekilemedi. Lütfen tekrar deneyin.');
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'Applied':
                return { label: 'Beklemede', color: 'warning' as const };
            case 'Viewed':
                return { label: 'Görüntülendi', color: 'info' as const };
            case 'Accepted':
                return { label: 'Onaylandı', color: 'success' as const };
            case 'Rejected':
                return { label: 'Reddedildi', color: 'error' as const };
            case 'Shortlisted':
                return { label: 'Kısa Listede', color: 'primary' as const };
            default:
                return { label: status, color: 'default' as const };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
            <Stack spacing={4}>
                {/* Header */}
                <Box>
                    <Typography variant="h4" component="h1" sx={{
                        fontWeight: 800,
                        mb: 1,
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Başvurularım
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Yaptığınız başvuruları ve durumlarını buradan takip edebilirsiniz
                    </Typography>
                </Box>

                {/* Applications List */}
                {applications.length === 0 ? (
                    <Card sx={{
                        p: 6,
                        borderRadius: 3,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'divider',
                    }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Henüz başvuru yapmadınız
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            İlanları keşfedin ve hemen başvurmaya başlayın!
                        </Typography>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {applications.map((app) => {
                            const statusInfo = getStatusInfo(app.status);
                            return (
                                <Grid size={{ xs: 12 }} key={app.applicationId}>
                                    <Card sx={{
                                        borderRadius: 3,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        border: '1px solid',
                                        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}>
                                        <Box sx={{ p: 3 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                                        {app.jobTitle}
                                                    </Typography>

                                                    <Stack spacing={1.5} sx={{ mb: 2 }}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {app.company}
                                                            </Typography>
                                                        </Stack>

                                                        {app.location && (
                                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                                <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {app.location}
                                                                </Typography>
                                                            </Stack>
                                                        )}

                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                Başvuru Tarihi: {formatDate(app.appliedAt)}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Box>

                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Chip
                                                        label={statusInfo.label}
                                                        color={statusInfo.color}
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: '0.875rem',
                                                            height: 32,
                                                        }}
                                                    />
                                                    {app.status === 'Applied' && (
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            startIcon={<CancelIcon />}
                                                            onClick={() => handleWithdrawClick(app.applicationId)}
                                                            sx={{
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            Geri Çek
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Stack>

            {/* Withdraw Confirmation Dialog */}
            <Dialog
                open={withdrawDialog.open}
                onClose={() => setWithdrawDialog({ open: false, applicationId: null })}
            >
                <DialogTitle>Başvuruyu Geri Çek</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bu başvuruyu geri çekmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve işveren bilgilendirilecektir.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWithdrawDialog({ open: false, applicationId: null })}>
                        İptal
                    </Button>
                    <Button onClick={handleWithdrawConfirm} color="error" variant="contained">
                        Geri Çek
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}


