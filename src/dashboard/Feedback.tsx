import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import MenuItem from '@mui/material/MenuItem';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SendIcon from '@mui/icons-material/Send';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { notificationService } from '../services/api';

export default function Feedback() {
  const [rating, setRating] = useState<number | null>(5);
  const [feedbackType, setFeedbackType] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    const checkFeedbackStatus = async () => {
      try {
        const response = await notificationService.hasSubmittedFeedback();
        setAlreadySubmitted(response.hasSubmitted);
      } catch (err) {
        console.error('Error checking feedback status:', err);
      }
    };
    checkFeedbackStatus();
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setErrorMessage('Lütfen mesajınızı yazınız.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }

    setLoading(true);
    try {
      await notificationService.submitFeedback({
        type: feedbackType,
        message: message,
        rating: rating || 5
      });

      setSubmitted(true);
      setErrorMessage('');
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        setRating(5);
        setFeedbackType('general');
      }, 3000);
    } catch (err: any) {
      console.error('Feedback submission error:', err);
      const msg = err.response?.data?.message || 'Geri bildirim gönderilirken bir hata oluştu.';
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto', p: { xs: 1, md: 0 } }}>
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
              Geri Bildirim
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Görüşleriniz bizim için değerli.
            </Typography>
          </Box>
        </Stack>

        <Card sx={{
          p: 2.5,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'primary.main',
                  color: (theme) => theme.palette.mode === 'dark' ? 'primary.light' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FeedbackIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Deneyiminizi Paylaşın
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Platformu geliştirmemize yardımcı olun.
                </Typography>
              </Box>
            </Stack>

            {errorMessage && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{errorMessage}</Alert>
            )}
            {submitted && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>Geri bildiriminiz başarıyla gönderildi!</Alert>
            )}
            {alreadySubmitted && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>Daha önce geri bildirim gönderdiniz. Teşekkürler!</Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary">Platform Puanınız</Typography>
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                size="large"
                disabled={alreadySubmitted}
              />
            </Box>

            <TextField
              select
              label="Geri Bildirim Türü"
              size="small"
              fullWidth
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              disabled={alreadySubmitted}
            >
              <MenuItem value="general">Genel</MenuItem>
              <MenuItem value="bug">Hata Bildirimi</MenuItem>
              <MenuItem value="feature">Özellik Önerisi</MenuItem>
              <MenuItem value="improvement">İyileştirme Önerisi</MenuItem>
            </TextField>

            <TextField
              label="Mesajınız"
              fullWidth
              multiline
              rows={4}
              placeholder="Düşüncelerinizi paylaşın..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={alreadySubmitted}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={handleSubmit}
                disabled={loading || alreadySubmitted}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 4,
                  fontWeight: 'bold',
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                }}
              >
                {loading ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            </Box>

          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

