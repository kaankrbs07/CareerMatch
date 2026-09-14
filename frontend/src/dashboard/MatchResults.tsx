import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { matchesService, applicationService } from '../services/api';

interface MatchResult {
    job: {
        id: string;
        title: string;
        company: string;
        description: string;
        skills: string;
        location: string;
    };
    score: number;
    details: {
        emb: number;
        kw: number;
        tag: number;
    };
}

export default function MatchResults() {
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Snackbar state (simplified for this component)
    const [applied, setApplied] = useState<string | null>(null);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            setLoading(true);
            const results = await matchesService.recommendJobs();
            setMatches(results);
        } catch (err: any) {
            console.error(err);
            setError('Eşleşmeler alınırken hata oluştu. CV\'niz olduğundan emin olun.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId: string) => {
        try {
            await applicationService.apply(jobId);
            setApplied(jobId);
        } catch (err) {
            console.error(err);
            alert("Başvuru başarısız.");
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="warning">{error}</Alert>;

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Sizin İçin Seçtiklerimiz (Yapay Zeka)
            </Typography>
            {matches.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>Henüz eşleşen ilan bulunamadı.</Alert>
            ) : (
                <Stack spacing={3}>
                    {matches.map((m, idx) => (
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
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{m.job?.title || 'Başlıksız İlan'}</Typography>
                                        <Typography variant="subtitle1" color="primary">{m.job?.company || 'Şirket'}</Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                                            {m.job?.description?.substring(0, 200)}...
                                        </Typography>

                                        {/* Explanation Box */}
                                        <Alert
                                            severity="info"
                                            sx={{
                                                mt: 2,
                                                mb: 2,
                                                borderRadius: 2,
                                                p: 1,
                                                backgroundColor: (theme) => `${theme.palette.info.main}10`,
                                                border: '1px solid',
                                                borderColor: 'info.main'
                                            }}
                                        >
                                            <Typography variant="caption" fontWeight="bold">Eşleşme Detayları:</Typography>
                                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                                <Typography variant="caption">Anlamsal: %{(m.details.emb * 100).toFixed(0)}</Typography>
                                                <Typography variant="caption">BM25: %{(m.details.kw * 100).toFixed(1)}</Typography>
                                                <Typography variant="caption">Etiket: %{(m.details.tag * 100).toFixed(1)}</Typography>
                                            </Stack>
                                        </Alert>

                                        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 0.5 }}>
                                            {m.job?.skills?.split(',').map((t: string, i: number) =>
                                                <Chip
                                                    key={i}
                                                    label={t.trim()}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: i % 3 === 0 ? 'primary.50' : i % 3 === 1 ? 'success.50' : 'warning.50',
                                                        color: i % 3 === 0 ? 'primary.main' : i % 3 === 1 ? 'success.main' : 'warning.main',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            )}
                                        </Stack>

                                        <Button
                                            variant="contained"
                                            sx={{ mt: 2 }}
                                            onClick={() => handleApply(m.job.id)}
                                            disabled={applied === m.job.id}
                                        >
                                            {applied === m.job.id ? "Başvuruldu" : "Hemen Başvur"}
                                        </Button>
                                    </Box>
                                    <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                            <CircularProgress
                                                variant="determinate"
                                                value={m.score * 100}
                                                color={m.score > 0.7 ? 'success' : m.score > 0.5 ? 'primary' : 'warning'}
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
                                                    %{(m.score * 100).toFixed(0)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 600 }}>
                                            Uygunluk
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

