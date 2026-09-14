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
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../services/api';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import EmailIcon from '@mui/icons-material/Email';
import PinIcon from '@mui/icons-material/Pin';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: theme.spacing(5),
    gap: theme.spacing(2),
    maxWidth: '480px',
    borderRadius: theme.spacing(3),
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    background: theme.palette.mode === 'dark'
        ? 'rgba(30, 30, 30, 0.8)'
        : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.3)'}`,
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.2)',
        transform: 'translateY(-2px)',
    },
    [theme.breakpoints.up('md')]: {
        maxWidth: '500px',
        padding: theme.spacing(6),
    },
}));

const VerifyContainer = styled(Stack)(({ theme }) => ({
    minHeight: '100vh',
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    },
}));

const LeftSection = styled(Box)(({ theme }) => ({
    display: 'none',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: theme.spacing(10),
    width: '50%',
    position: 'relative',
    color: theme.palette.common.white,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '10%',
        right: '-10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
        filter: 'blur(80px)',
    },
    [theme.breakpoints.up('md')]: {
        display: 'flex',
    },
}));

const RightSection = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    position: 'relative',
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(5),
    },
}));

export default function VerifyEmail(props: { disableCustomTheme?: boolean }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialEmail = searchParams.get('email') || '';

    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email || !code) {
            setError('Lütfen e-posta ve doğrulama kodunu giriniz.');
            return;
        }
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await authService.verifyEmail(email, code);
            setMessage('E-posta başarıyla doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...');
            setTimeout(() => {
                navigate('/signin');
            }, 2000);
        } catch (err: any) {
            console.error('Doğrulama hatası', err);
            let msg = 'Doğrulama başarısız.';
            if (err.response && err.response.data && err.response.data.message) {
                msg = err.response.data.message;
            }
            setError(msg);
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError('Kodun gönderilmesi için e-posta adresi gereklidir.');
            return;
        }
        setError('');
        setMessage('');

        try {
            await authService.resendVerification(email);
            setMessage('Doğrulama kodu tekrar gönderildi.');
        } catch (err: any) {
            console.error('Kod gönderme hatası', err);
            let msg = 'Kod gönderilemedi.';
            if (err.response && err.response.data && err.response.data.message) {
                msg = err.response.data.message;
            }
            setError(msg);
        }
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <VerifyContainer>
                <LeftSection>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 6,
                        p: 2,
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                    }}>
                        <WorkOutlineIcon sx={{ fontSize: 40 }} />
                        <Typography variant="h4" fontWeight="bold">CareerMatch</Typography>
                    </Box>

                    <Typography variant="h2" fontWeight="800" sx={{ mb: 3, lineHeight: 1.1 }}>
                        Son Bir Adım
                        <Box component="span" sx={{
                            display: 'block',
                            background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Kaldı!
                        </Box>
                    </Typography>

                    <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 500, fontWeight: 400, lineHeight: 1.6, mb: 4 }}>
                        E-posta adresinize gönderilen doğrulama kodunu girerek hesabınızı aktifleştirin.
                    </Typography>

                    <MarkEmailReadIcon sx={{
                        fontSize: 200,
                        opacity: 0.1,
                        position: 'absolute',
                        right: '10%',
                        bottom: '10%',
                    }} />
                </LeftSection>

                <RightSection>
                    <Box sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1100 }}>
                        <ColorModeIconDropdown />
                    </Box>

                    <Card>
                        <Stack spacing={1} sx={{ mb: 2 }}>
                            <Typography component="h1" variant="h3" sx={{
                                fontWeight: 800,
                                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Hesabı Doğrula
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                E-postanıza gönderilen 6 haneli kodu giriniz
                            </Typography>
                        </Stack>

                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 3 }}>
                            <FormControl>
                                <FormLabel htmlFor="email" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>E-posta Adresi</FormLabel>
                                <TextField
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="ornek@email.com"
                                    autoComplete="email"
                                    required
                                    fullWidth
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon sx={{ color: 'primary.main' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                            },
                                            '&.Mui-focused': {
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                            },
                                        }
                                    }}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel htmlFor="code" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>Doğrulama Kodu</FormLabel>
                                <TextField
                                    required
                                    fullWidth
                                    name="code"
                                    placeholder="123456"
                                    type="text"
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    inputProps={{ maxLength: 6 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PinIcon sx={{ color: 'primary.main' }} />
                                            </InputAdornment>
                                        ),
                                        style: { fontSize: '1.2rem', letterSpacing: '0.5rem', textAlign: 'center', fontWeight: 600 }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                            },
                                            '&.Mui-focused': {
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                            },
                                        }
                                    }}
                                />
                            </FormControl>

                            {error && (
                                <Box sx={{
                                    bgcolor: 'error.lighter',
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'error.light',
                                    animation: 'shake 0.5s',
                                    '@keyframes shake': {
                                        '0%, 100%': { transform: 'translateX(0)' },
                                        '25%': { transform: 'translateX(-5px)' },
                                        '75%': { transform: 'translateX(5px)' },
                                    }
                                }}>
                                    <Typography color="error.dark" variant="body2" fontWeight={500}>
                                        {error}
                                    </Typography>
                                </Box>
                            )}

                            {message && (
                                <Box sx={{
                                    bgcolor: 'success.lighter',
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'success.light',
                                }}>
                                    <Typography color="success.dark" variant="body2" fontWeight={500}>
                                        {message}
                                    </Typography>
                                </Box>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    mt: 1,
                                    py: 1.8,
                                    borderRadius: 2.5,
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(0,118,255,0.5)',
                                        transform: 'translateY(-2px)',
                                    },
                                    '&:active': {
                                        transform: 'translateY(0)',
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: '-100%',
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                        transition: 'left 0.5s',
                                    },
                                    '&:hover::before': {
                                        left: '100%',
                                    },
                                }}
                            >
                                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Doğrula'}
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={handleResend}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    py: 1.2,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }
                                }}
                            >
                                Kodu Tekrar Gönder
                            </Button>

                            <Typography sx={{ textAlign: 'center', mt: 2 }} variant="body2" color="text.secondary">
                                <Button
                                    variant="text"
                                    onClick={() => navigate('/signin')}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        minWidth: 'auto',
                                        p: 0.5,
                                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        }
                                    }}
                                >
                                    Giriş Sayfasına Dön
                                </Button>
                            </Typography>
                        </Box>
                    </Card>
                </RightSection>
            </VerifyContainer>
        </AppTheme>
    );
}

