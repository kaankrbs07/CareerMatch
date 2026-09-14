import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ChatIcon from '@mui/icons-material/Chat';
import { applicationService } from '../services/api';

interface Applicant {
    applicationId: number;
    appliedAt: string;
    status: string;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    cvUrl?: string;
    cvId?: string;
}

export default function JobApplications() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: 'approve' | 'reject' | null; applicationId: number | null }>({ open: false, type: null, applicationId: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (jobId) {
            loadApplicants(jobId);
        }
    }, [jobId]);

    const loadApplicants = async (id: string) => {
        try {
            setLoading(true);
            const data = await applicationService.getJobApplicants(id);
            setApplicants(data);
        } catch (err) {
            console.error(err);
            setError('Başvurular yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirmDialog.applicationId) return;
        try {
            await applicationService.approveApplication(confirmDialog.applicationId);
            setSnackbar({ open: true, message: 'Başvuru onaylandı!', severity: 'success' });
            if (jobId) loadApplicants(jobId);
        } catch (err) {
            setSnackbar({ open: true, message: 'İşlem başarısız.', severity: 'error' });
        } finally {
            setConfirmDialog({ open: false, type: null, applicationId: null });
        }
    };

    const handleReject = async () => {
        if (!confirmDialog.applicationId) return;
        try {
            await applicationService.rejectApplication(confirmDialog.applicationId);
            setSnackbar({ open: true, message: 'Başvuru reddedildi.', severity: 'success' });
            if (jobId) loadApplicants(jobId);
        } catch (err) {
            setSnackbar({ open: true, message: 'İşlem başarısız.', severity: 'error' });
        } finally {
            setConfirmDialog({ open: false, type: null, applicationId: null });
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

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', width: '100%' }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard/jobs')}
                sx={{ mb: 2 }}
            >
                İlanlara Dön
            </Button>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
                İlan Başvuruları
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {applicants.length === 0 && !error ? (
                <Alert severity="info">Bu ilana henüz başvuru yapılmamış.</Alert>
            ) : (
                <Stack spacing={2}>
                    {applicants.map((apt) => {
                        const statusInfo = getStatusInfo(apt.status);
                        const isActionable = apt.status !== 'Accepted' && apt.status !== 'Rejected';

                        return (
                            <Card key={apt.applicationId} sx={{
                                p: 3,
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                border: '1px solid',
                                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                            }}>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Stack direction="row" spacing={3} alignItems="center" sx={{ flex: 1 }}>
                                            <Avatar sx={{
                                                bgcolor: 'primary.main',
                                                width: 64,
                                                height: 64,
                                                fontSize: '1.5rem',
                                                fontWeight: 700,
                                            }}>
                                                {apt.user.firstName[0]}{apt.user.lastName[0]}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {apt.user.firstName} {apt.user.lastName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {apt.user.email}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                    <CalendarTodayIcon fontSize="small" color="action" />
                                                    <Typography variant="caption" color="text.secondary">
                                                        Başvuru: {new Date(apt.appliedAt).toLocaleDateString('tr-TR')}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                        <Chip
                                            label={statusInfo.label}
                                            color={statusInfo.color}
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Stack>

                                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                                        <Button
                                            component="a"
                                            variant="outlined"
                                            startIcon={<PictureAsPdfIcon />}
                                            disabled={!apt.cvUrl}
                                            href={apt.cvUrl ? `http://localhost:5217${apt.cvUrl}` : undefined}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => {
                                                if (apt.applicationId) applicationService.markViewed(apt.applicationId).catch(console.error);
                                            }}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            {apt.cvUrl ? 'CV Görüntüle' : 'CV Yok'}
                                        </Button>

                                        {isActionable && (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<CheckCircleIcon />}
                                                    onClick={() => setConfirmDialog({ open: true, type: 'approve', applicationId: apt.applicationId })}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Onayla
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<CancelIcon />}
                                                    onClick={() => setConfirmDialog({ open: true, type: 'reject', applicationId: apt.applicationId })}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Reddet
                                                </Button>
                                            </>
                                        )}

                                        <Button
                                            variant="outlined"
                                            startIcon={<ChatIcon />}
                                            onClick={() => navigate('/dashboard/chat', {
                                                state: {
                                                    contact: {
                                                        id: apt.user.id, // Ensure user object has ID from backend! Wait, interface Applicant user doesn't have ID? Check interface.
                                                        firstName: apt.user.firstName,
                                                        lastName: apt.user.lastName,
                                                        role: 'JobSeeker' // Assumed role
                                                    }
                                                }
                                            })}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Mesaj Gönder
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Card>
                        );
                    })}
                </Stack>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, type: null, applicationId: null })}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle>
                    {confirmDialog.type === 'approve' ? 'Başvuruyu Onayla' : 'Başvuruyu Reddet'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {confirmDialog.type === 'approve'
                            ? 'Bu başvuruyu onaylamak istediğinizden emin misiniz? Adaya bildirim gönderilecektir.'
                            : 'Bu başvuruyu reddetmek istediğinizden emin misiniz? Adaya bildirim gönderilecektir.'
                        }
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, type: null, applicationId: null })}>
                        İptal
                    </Button>
                    <Button
                        onClick={confirmDialog.type === 'approve' ? handleApprove : handleReject}
                        variant="contained"
                        color={confirmDialog.type === 'approve' ? 'success' : 'error'}
                    >
                        {confirmDialog.type === 'approve' ? 'Onayla' : 'Reddet'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

