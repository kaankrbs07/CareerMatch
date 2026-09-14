import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Divider from '@mui/material/Divider';
import { jobService, commonService } from '../services/api';

export default function PostJob() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        location: '',
        jobType: 'On-site',
        salaryMin: '',
        salaryMax: '',
        currency: 'TRY',
        occupation: '',
        durationDays: '7'
    });

    const [occupations, setOccupations] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && user.role === 'JobSeeker') {
            navigate('/dashboard');
            return;
        }

        const fetchOccupations = async () => {
            try {
                const data = await commonService.getOccupations();
                setOccupations(data);
            } catch (err) {
                console.error("Meslekler yüklenemedi", err);
            }
        };
        fetchOccupations();
    }, [user, navigate]);


    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;

        // Maaş alanları için özel kontrol
        if (field === 'salaryMin' || field === 'salaryMax') {
            if (value.length > 1 && value[0] === '0') return;
            const numValue = parseFloat(value);
            if (value !== '' && numValue < 0) return;
        }

        setFormData({ ...formData, [field]: value });
    };


    const handleSubmit = async () => {
        if (!formData.title || !formData.description || !formData.occupation) {
            setError("Başlık, Açıklama ve Meslek Grubu zorunludur.");
            return;
        }

        const minSalary = formData.salaryMin ? parseFloat(formData.salaryMin) : 0;
        const maxSalary = formData.salaryMax ? parseFloat(formData.salaryMax) : 0;

        if (minSalary < 0 || maxSalary < 0) {
            setError("Maaş değerleri negatif olamaz.");
            return;
        }

        if (formData.salaryMin && formData.salaryMax && maxSalary <= minSalary) {
            setError("Maksimum maaş, minimum maaştan büyük olmalıdır.");
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            await jobService.create({
                title: formData.title,
                descriptionText: formData.description,
                tagsCsv: formData.tags,
                location: formData.location,
                jobType: formData.jobType,
                salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
                salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
                currency: formData.currency,
                occupation: formData.occupation,
                durationDays: parseInt(formData.durationDays)
            });
            setSuccess(`🎉 İlan başarıyla yayınlandı!`);
            setFormData({
                title: '', description: '', tags: '', location: '',
                jobType: 'On-site', salaryMin: '', salaryMax: '', currency: 'TRY',
                occupation: '', durationDays: '7'
            });
            window.scrollTo(0, 0);
        } catch (err) {
            console.error(err);
            setError('İlan oluşturulurken bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 0 } }}>
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
                            İş İlanı Yayınla
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Yeni bir iş ilanı oluşturun.
                        </Typography>
                    </Box>
                </Stack>

                <Grid container spacing={2}>
                    {/* Left Column: Main Info */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{
                            p: 2.5,
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <WorkOutlineIcon fontSize="small" color="primary" />
                                    <Typography variant="subtitle1" fontWeight="bold">İlan Detayları</Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="İlan Başlığı"
                                            fullWidth
                                            size="small"
                                            placeholder="Örn: Senior React Developer"
                                            value={formData.title}
                                            onChange={handleChange('title')}
                                            required
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            select
                                            label="Meslek Grubu"
                                            fullWidth
                                            size="small"
                                            value={formData.occupation}
                                            onChange={handleChange('occupation')}
                                            required
                                        >
                                            {occupations.map((occupation) => (
                                                <MenuItem key={occupation.id} value={occupation.name}>
                                                    {occupation.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Etiketler"
                                            fullWidth
                                            size="small"
                                            placeholder="React, TypeScript"
                                            value={formData.tags}
                                            onChange={handleChange('tags')}
                                            helperText="Virgülle ayırın"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="İlan Açıklaması"
                                            fullWidth
                                            multiline
                                            rows={0}
                                            placeholder="İş tanımı..."
                                            value={formData.description}
                                            onChange={handleChange('description')}
                                            required
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Card>
                    </Grid>

                    {/* Right Column: Meta Info (Merged) */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{
                            p: 2.5,
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Stack spacing={2.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <SettingsIcon fontSize="small" color="action" />
                                    <Typography variant="subtitle1" fontWeight="bold">Ayarlar</Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            select
                                            label="Çalışma Şekli"
                                            fullWidth
                                            size="small"
                                            value={formData.jobType}
                                            onChange={handleChange('jobType')}
                                        >
                                            <MenuItem value="On-site">Ofiste (On-site)</MenuItem>
                                            <MenuItem value="Hybrid">Hibrit (Hybrid)</MenuItem>
                                            <MenuItem value="Remote">Uzaktan (Remote)</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Konum / Şehir"
                                            fullWidth
                                            size="small"
                                            placeholder="Örn: İstanbul"
                                            value={formData.location}
                                            onChange={handleChange('location')}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Divider sx={{ my: 0.5 }} />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Stack direction="row" spacing={1}>
                                            <TextField
                                                placeholder="Min"
                                                type="number"
                                                fullWidth
                                                size="small"
                                                value={formData.salaryMin}
                                                onChange={handleChange('salaryMin')}
                                                label="Min Maaş"
                                            />
                                            <TextField
                                                placeholder="Max"
                                                type="number"
                                                fullWidth
                                                size="small"
                                                value={formData.salaryMax}
                                                onChange={handleChange('salaryMax')}
                                                label="Max Maaş"
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            select
                                            label="Para Birimi"
                                            size="small"
                                            fullWidth
                                            value={formData.currency}
                                            onChange={handleChange('currency')}
                                        >
                                            <MenuItem value="TRY">TRY (₺)</MenuItem>
                                            <MenuItem value="USD">USD ($)</MenuItem>
                                            <MenuItem value="EUR">EUR (€)</MenuItem>
                                        </TextField>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Divider sx={{ my: 0.5 }} />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            select
                                            label="Süre"
                                            fullWidth
                                            size="small"
                                            value={formData.durationDays}
                                            onChange={handleChange('durationDays')}
                                        >
                                            {[...Array(15)].map((_, i) => (
                                                <MenuItem key={i + 1} value={String(i + 1)}>
                                                    {i + 1} Gün
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<DeleteOutlineIcon />}
                                onClick={() => setFormData({ ...formData, title: '', description: '' })}
                                size="small"
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                                Temizle
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                onClick={handleSubmit}
                                disabled={uploading}
                                size="small"
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 4,
                                    fontWeight: 'bold',
                                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                                }}
                            >
                                {uploading ? 'Yayınlanıyor...' : 'Yayınla'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    );
}

