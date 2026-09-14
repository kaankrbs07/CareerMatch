import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import ChatIcon from '@mui/icons-material/Chat';
import { matchesService } from '../services/api';

interface CandidateResult {
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    score: number;
    details: {
        emb: number;
        kw: number;
        tag: number;
        text: string;
    };
    cvUrl?: string;
}

export default function JobCandidates() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState<CandidateResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (jobId) {
            loadCandidates(jobId);
        } else {
            setError('İş ilanı ID bulunamadı.');
            setLoading(false);
        }
    }, [jobId]);

    const loadCandidates = async (id: string) => {
        try {
            setLoading(true);
            const results = await matchesService.findCandidates(id);
            setCandidates(results);
        } catch (err: any) {
            console.error(err);
            setError('Adaylar getirilirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard/jobs')}
                sx={{ mb: 2 }}
            >
                İlanlara Dön
            </Button>

            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Önerilen Adaylar (AI Eşleşmeleri)
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {candidates.length === 0 && !error ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>Bu ilan için henüz uygun aday bulunamadı.</Alert>
            ) : (
                <Stack spacing={3}>
                    {candidates.map((c, idx) => (
                        <Card
                            key={idx}
                            sx={{
                                borderRadius: 3,
                                boxShadow: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: 6,
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={3}>
                                    <Box sx={{ flex: 1 }}>
                                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                                            <PersonIcon color="primary" fontSize="large" />
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                    {c.user ? `${c.user.firstName} ${c.user.lastName}` : `Aday #${idx + 1}`}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {c.user?.email}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        {/* CV Summary / Snippet */}
                                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                "{c.details.text.substring(0, 300)}..."
                                            </Typography>
                                        </Box>

                                        {/* Match Details */}
                                        <Alert
                                            severity="success"
                                            icon={false}
                                            sx={{
                                                mt: 2,
                                                borderRadius: 2,
                                                p: 1,
                                                backgroundColor: (theme) => `${theme.palette.success.main}10`,
                                                border: '1px solid',
                                                borderColor: 'success.main'
                                            }}
                                        >
                                            <Typography variant="caption" fontWeight="bold" color="success.dark">Eşleşme Analizi:</Typography>
                                            <Stack direction="row" spacing={3} sx={{ mt: 0.5 }}>
                                                <Typography variant="body2">Anlamsal: <strong style={{ color: 'green' }}>%{(c.details.emb * 100).toFixed(0)}</strong></Typography>
                                                <Typography variant="body2">BM25: <strong>%{(c.details.kw * 100).toFixed(1)}</strong></Typography>
                                            </Stack>
                                        </Alert>

                                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<WorkIcon />}
                                                component="a"
                                                disabled={!c.cvUrl}
                                                href={c.cvUrl ? `http://localhost:5217${c.cvUrl}` : undefined}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                CV Görüntüle
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<ChatIcon />}
                                                onClick={() => navigate('/dashboard/chat', {
                                                    state: {
                                                        contact: {
                                                            id: c.user.id,
                                                            firstName: c.user.firstName,
                                                            lastName: c.user.lastName,
                                                            role: 'JobSeeker'
                                                        }
                                                    }
                                                })}
                                            >
                                                Mesaj Gönder
                                            </Button>
                                        </Stack>
                                    </Box>

                                    {/* Score Circle */}
                                    <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                            <CircularProgress
                                                variant="determinate"
                                                value={c.score * 100}
                                                color={c.score > 0.7 ? 'success' : c.score > 0.5 ? 'primary' : 'warning'}
                                                size={80}
                                                thickness={5}
                                            />
                                            <Box
                                                sx={{
                                                    top: 0,
                                                    left: 0,
                                                    bottom: 0,
                                                    right: 0,
                                                    position: 'absolute',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                                                    %{(c.score * 100).toFixed(0)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 600 }}>
                                            Eşleşme
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    );
}

