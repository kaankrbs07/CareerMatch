
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../services/api';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import LockResetIcon from '@mui/icons-material/LockReset';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    maxWidth: '450px',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    [theme.breakpoints.up('md')]: {
        maxWidth: '450px',
    },
}));

const Container = styled(Stack)(({ theme }) => ({
    minHeight: '100vh',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundColor: theme.palette.background.default,
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
        backgroundRepeat: 'no-repeat',
        ...theme.applyStyles('dark', {
            backgroundImage: 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
        }),
    },
}));

export default function ForgotPassword(props: { disableCustomTheme?: boolean }) {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0); // 0: Email, 1: Code, 2: NewPassword
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await authService.forgotPassword(email);
            setMessage('Doğrulama kodu e-posta adresinize gönderildi.');
            setActiveStep(1);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Kod gönderilemedi. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.verifyCode(email, code);
            setMessage('Kod doğrulandı.');
            setActiveStep(2);
        } catch (err: any) {
            setError('Geçersiz veya süresi dolmuş kod.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.resetPassword({ email, code, newPassword });
            setMessage('Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...');
            setTimeout(() => navigate('/signin'), 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Şifre sıfırlanamadı.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <Container>
                <ColorModeSelect sx={{ position: 'absolute', top: '2rem', right: '2rem' }} />
                <Card>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                        <LockResetIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            Şifremi Unuttum
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            {activeStep === 0 && "Hesabınıza erişmek için e-posta adresinizi girin."}
                            {activeStep === 1 && "E-posta adresinize gönderilen 6 haneli kodu girin."}
                            {activeStep === 2 && "Yeni şifrenizi belirleyin."}
                        </Typography>
                    </Box>

                    {activeStep === 0 && (
                        <Box component="form" onSubmit={handleSendCode} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControl>
                                <FormLabel htmlFor="email">E-posta Adresi</FormLabel>
                                <TextField
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="ornek@email.com"
                                    autoComplete="email"
                                    autoFocus
                                    required
                                    fullWidth
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </FormControl>
                            <Button type="submit" fullWidth variant="contained" disabled={loading}>
                                {loading ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
                            </Button>
                        </Box>
                    )}

                    {activeStep === 1 && (
                        <Box component="form" onSubmit={handleVerifyCode} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControl>
                                <FormLabel htmlFor="code">Doğrulama Kodu</FormLabel>
                                <TextField
                                    id="code"
                                    name="code"
                                    placeholder="123456"
                                    required
                                    fullWidth
                                    variant="outlined"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </FormControl>
                            <Button type="submit" fullWidth variant="contained" disabled={loading}>
                                {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                            </Button>
                        </Box>
                    )}

                    {activeStep === 2 && (
                        <Box component="form" onSubmit={handleResetPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControl>
                                <FormLabel htmlFor="newPassword">Yeni Şifre</FormLabel>
                                <TextField
                                    id="newPassword"
                                    type="password"
                                    name="newPassword"
                                    placeholder="••••••"
                                    required
                                    fullWidth
                                    variant="outlined"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </FormControl>
                            <Button type="submit" fullWidth variant="contained" disabled={loading}>
                                {loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
                            </Button>
                        </Box>
                    )}

                    {error && (
                        <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                    {message && (
                        <Typography color="success.main" variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                            {message}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button variant="text" onClick={() => navigate('/signin')}>
                            Giriş Yap sayfasına dön
                        </Button>
                    </Box>
                </Card>
            </Container>
        </AppTheme>
    );
}

