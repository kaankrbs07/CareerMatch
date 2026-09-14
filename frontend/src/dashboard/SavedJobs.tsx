import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import BusinessIcon from '@mui/icons-material/Business';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';

import { savedJobService, applicationService } from '../services/api';

export default function SavedJobs() {
    const navigate = useNavigate();
    const [savedJobs, setSavedJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Snackbar states
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    useEffect(() => {
        loadSavedJobs();
    }, []);

    const loadSavedJobs = async () => {
        try {
            setLoading(true);
            const data = await savedJobService.getSavedJobs();
            setSavedJobs(data);
        } catch (err) {
            console.error(err);
            setSnackbarMessage('Kaydedilen ilanlar yüklenirken hata oluştu.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (jobId: string) => {
        try {
            await savedJobService.unsave(jobId);
            setSavedJobs(prev => prev.filter(job => (job.id || job.Id) !== jobId));
            setSnackbarMessage('İlan kaydedilenlerden çıkarıldı.');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
        } catch (err) {
            console.error(err);
            setSnackbarMessage('İşlem başarısız.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleApply = async (jobId: string) => {
        try {
            await applicationService.apply(jobId);
            setSnackbarMessage('Başvurunuz başarıyla alındı! 🎉');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data || "Başvuru sırasında bir hata oluştu.";
            setSnackbarMessage((typeof msg === 'string') ? msg : "Bir hata oluştu.");
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const renderJobCard = (job: any) => (
        <Card
            key={job.id || job.Id}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: 8,
                    transform: 'translateY(-4px)'
                },
                position: 'relative'
            }}
        >
            <IconButton
                onClick={() => handleUnsave(job.id || job.Id)}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                }}
            >
                <FavoriteIcon color="error" />
            </IconButton>

            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 0.5, pr: 4 }}>
                            {job.title}
                        </Typography>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                            {job.company || 'Firma Adı Gizli'}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <BusinessIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                            {job.location || 'Uzaktan / Hibrit'}
                        </Typography>
                    </Stack>

                    {(job.minAmount || job.maxAmount) && (
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                            {job.minAmount?.toLocaleString()} - {job.maxAmount?.toLocaleString()} {job.currency || 'TRY'}
                        </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                    }}>
                        {job.description}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {job.skills && job.skills.split(',').slice(0, 5).map((tag: string, idx: number) => (
                            <Chip
                                key={tag}
                                label={tag.trim()}
                                size="small"
                                sx={{
                                    bgcolor: idx % 3 === 0 ? 'primary.50' : idx % 3 === 1 ? 'success.50' : 'info.50',
                                    color: idx % 3 === 0 ? 'primary.main' : idx % 3 === 1 ? 'success.main' : 'info.main',
                                    fontWeight: 600
                                }}
                            />
                        ))}
                    </Box>
                </Stack>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                    size="medium"
                    variant="contained"
                    fullWidth
                    onClick={() => handleApply(job.id || job.Id)}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1
                    }}
                >
                    Başvur
                </Button>
            </CardActions>
        </Card>
    );

    return (
        <Box sx={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
                Kaydedilen İlanlar
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {savedJobs.length === 0 ? (
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Typography variant="body1" color="text.secondary">Henüz kaydedilmiş bir ilanınız yok.</Typography>
                            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/dashboard/jobs')}>
                                İlanlara Göz At
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                            {savedJobs.map((job) => renderJobCard(job))}
                        </Box>
                    )}
                </>
            )}

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%', borderRadius: 2 }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

