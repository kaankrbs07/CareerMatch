import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { cvService } from '../services/api';

export default function CvUpload() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [currentCv, setCurrentCv] = useState<any>(null);

    useEffect(() => {
        if (user && user.role !== 'JobSeeker') {
            navigate('/dashboard');
            return;
        }
        loadCurrentCv();
    }, [user, navigate]);

    const loadCurrentCv = async () => {
        try {
            const data = await cvService.getMyLatest();
            setCurrentCv(data);
        } catch (err) {
            // No CV found or error
            console.log("CV load error or not found", err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
            setSuccess('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            await cvService.upload(file);
            setSuccess(`CV başarıyla yüklendi!`);
            setFile(null);
            // Reload current stats/cv info
            loadCurrentCv();
        } catch (err) {
            console.error(err);
            setError('Yükleme sırasında bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    const handleButtonClick = () => {
        if (file) {
            handleUpload();
        } else {
            fileInputRef.current?.click();
        }
    };

    const handleViewCv = () => {
        if (currentCv && currentCv.url) {
            // Open in new tab. URL is relative, so prepend API base if needed, 
            // but usually static files are distinct.
            // Assuming static files served content root
            window.open(`http://localhost:5217${currentCv.url}`, '_blank');
        }
    };

    return (
        <Card sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4, borderRadius: 3, boxShadow: 3 }}>
            <Stack spacing={4} alignItems="center">
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>CV Yönetimi</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Yeni CV yükleyebilir veya mevcut CV'nizi görüntüleyebilirsiniz.
                    </Typography>
                </Box>

                {/* Current CV Display */}
                {currentCv ? (
                    <Card variant="outlined" sx={{ width: '100%', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <PictureAsPdfIcon color="error" fontSize="large" />
                            <Box>
                                <Typography variant="subtitle1" fontWeight="600">{currentCv.fileName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Yüklendi: {new Date(currentCv.uploadedAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={handleViewCv}
                        >
                            Görüntüle
                        </Button>
                    </Card>
                ) : (
                    <Alert severity="info" sx={{ width: '100%' }}>Henüz yüklü bir CV bulunmamaktadır.</Alert>
                )}

                <Box sx={{ width: '100%', borderTop: 1, borderColor: 'divider', pt: 4 }}>
                    <Typography variant="h6" gutterBottom>Yeni Yükle</Typography>

                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{
                            width: '100%',
                            height: 120,
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            borderRadius: 2,
                            flexDirection: 'column',
                            gap: 1
                        }}
                    >
                        {file ? file.name : 'Dosya Seçin veya Sürükleyin'}
                        <Typography variant="caption" color="text.secondary">PDF, DOCX (Max 5MB)</Typography>
                        <input
                            type="file"
                            hidden
                            accept=".pdf,.docx,.doc"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>}

                <Button
                    variant="contained"
                    onClick={handleButtonClick}
                    disabled={uploading}
                    fullWidth
                    size="large"
                    sx={{ borderRadius: 2, py: 1.5 }}
                >
                    {uploading ? 'Yükleniyor...' : 'Gönder'}
                </Button>
            </Stack>
        </Card>
    );
}

