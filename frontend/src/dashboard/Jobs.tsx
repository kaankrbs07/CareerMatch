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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FilterListIcon from '@mui/icons-material/FilterList';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Pagination from '@mui/material/Pagination';

import { jobService, applicationService, savedJobService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [minSalaryFilter, setMinSalaryFilter] = useState('');
  const [maxSalaryFilter, setMaxSalaryFilter] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(9); // 3x3 grid - setPageSize not used yet

  const isJobSeeker = user?.role === 'JobSeeker';
  const isEmployer = user?.role === 'Employer';
  const isAdmin = user?.role === 'Admin';

  const [currentTab, setCurrentTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // Saved Jobs
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  // Snackbar states
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  // Removed: Admin users no longer have access to tabs, they only see All Jobs view

  useEffect(() => {
    // Reset page when switching tabs or filters change (optional implementation choice)
    setPage(1);
  }, [currentTab]);

  useEffect(() => {
    loadJobs();
    if (isJobSeeker) {
      loadSavedJobs();
    }
  }, [currentTab, page]); // Reload when page changes

  const loadSavedJobs = async () => {
    try {
      const ids = await savedJobService.getSavedJobIds();
      setSavedJobIds(ids);
    } catch (err) {
      console.error("Failed to load saved jobs", err);
    }
  }

  const loadJobs = async () => {
    try {
      setLoading(true);

      if (isEmployer) {
        if (currentTab === 0) {
          // My Jobs - currently client side filtered as mock implementation in backend was incomplete for filtering
          // But since recent update, we might want to standardize.
          // For now, let's keep My Jobs as all load then filter, OR rely on backend if implemented
          const myJobsData = await jobService.getMyJobs();
          setMyJobs(myJobsData); // MyJobs endpoint returns list directly
        } else {
          await performSearch();
        }
      } else {
        // JobSeeker and Admin users only see All Jobs
        await performSearch();
      }

    } catch (err) {
      console.error(err);
      setSnackbarMessage('Veriler yüklenirken hata oluştu.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    const params: any = {};
    if (searchTerm) params.keyword = searchTerm;
    if (locationFilter) params.location = locationFilter;
    if (jobTypeFilter) params.jobType = jobTypeFilter;
    if (currencyFilter) params.currency = currencyFilter;
    if (minSalaryFilter) params.minSalary = parseFloat(minSalaryFilter);
    if (maxSalaryFilter) params.maxSalary = parseFloat(maxSalaryFilter);

    params.pageNumber = page;
    params.pageSize = pageSize;

    const response = await jobService.getAll(params);

    // New response structure: { items, totalCount, pageNumber, pageSize, totalPages }
    // New response structure: { items, totalCount, pageNumber, pageSize, totalPages }
    const items = response.items || response.Items;
    const total = response.totalPages || response.TotalPages;

    if (items) {
      setAllJobs(items);
      setTotalPages(total || 1);
    } else {
      // Fallback if API returns array directly (backward compatibility or error)
      setAllJobs(Array.isArray(response) ? response : []);
      setTotalPages(1);
    }
  };

  const handleSalaryChange = (setter: (value: string) => void, value: string) => {
    if (parseFloat(value) < 0) return; // Prevent negative values
    setter(value);
  };

  const validateSalaries = (): boolean => {
    if (minSalaryFilter && maxSalaryFilter) {
      if (parseFloat(minSalaryFilter) > parseFloat(maxSalaryFilter)) {
        setSnackbarMessage('Alt maaş, üst maaştan büyük olamaz.');
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
        return false;
      }
    }
    return true;
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateSalaries()) return; // Stop if validation fails
    setPage(1); // Reset to first page
    if (isEmployer && currentTab === 0) {
      loadJobs();
    } else {
      performSearch();
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

  const handleToggleSave = async (jobId: string) => {
    try {
      const isCurrentlySaved = savedJobIds.includes(jobId);
      setSavedJobIds(prev => isCurrentlySaved ? prev.filter(id => id !== jobId) : [...prev, jobId]);

      if (isCurrentlySaved) {
        await savedJobService.unsave(jobId);
        setSnackbarMessage('İlan kaydedilenlerden çıkarıldı.');
      } else {
        await savedJobService.save(jobId);
        setSnackbarMessage('İlan kaydedildi. ❤️');
      }
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      console.error(err);
      loadSavedJobs();
      setSnackbarMessage('İşlem başarısız.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleDeleteClick = (jobId: string) => {
    setJobToDelete(jobId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      await jobService.deleteJob(jobToDelete);
      setSnackbarMessage('İlan başarıyla silindi.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setDeleteDialogOpen(false);
      setJobToDelete(null);
      loadJobs();
    } catch (err) {
      console.error(err);
      setSnackbarMessage('İlan silinirken hata oluştu.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  let jobsToRender = allJobs;
  if (isEmployer && currentTab === 0) {
    // My Jobs still client side filtered for now logic check
    jobsToRender = myJobs.filter(job =>
      !searchTerm ||
      job.title?.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR')) ||
      job.company?.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR'))
    );
  }

  const renderJobCard = (job: any, isMyJob: boolean) => {
    const isSaved = savedJobIds.includes(job.id || job.Id);

    return (
      <Card
        key={job.id || job.Id}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(102, 126, 234, 0.15)',
            transform: 'translateY(-6px)',
            borderColor: 'primary.main',
            '& .job-card-accent': {
              width: '100%'
            }
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease'
          },
          '&:hover::before': {
            opacity: 1
          }
        }}
      >
        {!isMyJob && isJobSeeker && (
          <IconButton
            onClick={() => handleToggleSave(job.id || job.Id)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              backgroundColor: 'rgba(255,255,255,0.7)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
            }}
          >
            {isSaved ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon color="action" />}
          </IconButton>
        )}

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  pr: 4,
                  fontSize: '1.15rem',
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em'
                }}
              >
                {job.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    boxShadow: '0 0 8px rgba(102, 126, 234, 0.4)'
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {job.company || 'Firma Adı Gizli'}
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <BusinessIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {job.location || 'Uzaktan / Hibrit'}
              </Typography>
            </Stack>

            {(job.minAmount || job.maxAmount) && (
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.08)',
                  border: '1px solid',
                  borderColor: 'success.main',
                  display: 'inline-block'
                }}
              >
                <Typography variant="body2" color="success.main" fontWeight={700}>
                  💰 {job.minAmount?.toLocaleString()} - {job.maxAmount?.toLocaleString()} {job.currency || 'TRY'}
                </Typography>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" sx={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
            }}>
              {job.description}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {job.skills && job.skills.split(',').slice(0, 5).map((tag: string, idx: number) => (
                <Chip
                  key={tag}
                  label={tag.trim()}
                  size="small"
                  sx={{
                    bgcolor: idx % 3 === 0
                      ? (theme) => theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)'
                      : idx % 3 === 1
                        ? (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)'
                        : (theme) => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.1)',
                    color: idx % 3 === 0 ? 'primary.main' : idx % 3 === 1 ? 'success.main' : 'info.main',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                />
              ))}
            </Box>
          </Stack>
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          {isMyJob && isEmployer && (
            <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/dashboard/post-job?edit=${job.id || job.Id}`)}
                sx={{ borderRadius: 2 }}
              >
                Düzenle
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteClick(job.id || job.Id)}
                sx={{ borderRadius: 2 }}
              >
                Sil
              </Button>
              <Button
                size="small"
                variant="outlined"
                fullWidth
                onClick={() => navigate(`/dashboard/jobs/${job.id || job.Id}/candidates`)}
                sx={{ borderRadius: 2 }}
              >
                AI Adaylar
              </Button>
              <Button
                size="small"
                variant="contained"
                fullWidth
                onClick={() => navigate(`/dashboard/jobs/${job.id || job.Id}/applications`)}
                sx={{ borderRadius: 2 }}
              >
                Başvurular
              </Button>
            </Stack>
          )}

          {!isMyJob && isJobSeeker && (
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
          )}

          {!isMyJob && (isEmployer || isAdmin) && (
            <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center', py: 1 }}>
              Sadece görüntüleme modu
            </Typography>
          )}
        </CardActions>
      </Card>
    )
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={4}>
          {isEmployer && (
            <Tabs value={currentTab} onChange={(_e, newValue) => setCurrentTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="İlanlarım" />
              <Tab label="Tüm İlanlar" />
            </Tabs>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                placeholder="Pozisyon, yetenek veya şirket ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)',
                      borderColor: 'primary.main'
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={() => handleSearchSubmit()}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  minWidth: 120,
                  height: 56,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Ara
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  minWidth: 140,
                  height: 56,
                  backgroundColor: 'background.paper',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                Filtrele
              </Button>
            </Box>

            <Collapse in={showFilters}>
              <Box sx={{
                p: 3,
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'divider',
                mt: 1
              }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                  <Box sx={{ flex: 3, width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Şehir / Konum"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 3, width: '100%' }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Çalışma Tipi</InputLabel>
                      <Select
                        value={jobTypeFilter}
                        label="Çalışma Tipi"
                        onChange={(e) => setJobTypeFilter(e.target.value)}
                        sx={{
                          borderRadius: 2
                        }}
                      >
                        <MenuItem value="">Tümü</MenuItem>
                        <MenuItem value="Remote">Remote</MenuItem>
                        <MenuItem value="Hybrid">Hybrid</MenuItem>
                        <MenuItem value="On-site">On-site</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: 2, width: '100%' }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Para Birimi</InputLabel>
                      <Select
                        value={currencyFilter}
                        label="Para Birimi"
                        onChange={(e) => setCurrencyFilter(e.target.value)}
                        sx={{
                          borderRadius: 2
                        }}
                      >
                        <MenuItem value="">Tümü</MenuItem>
                        <MenuItem value="TRY">TRY (₺)</MenuItem>
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: 2, width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Alt Maaş"
                      type="number"
                      value={minSalaryFilter}
                      onChange={(e) => handleSalaryChange(setMinSalaryFilter, e.target.value)}
                      size="small"
                      InputProps={{
                        inputProps: { min: 0 },
                        endAdornment: currencyFilter && (
                          <InputAdornment position="end">
                            {currencyFilter === 'TRY' ? '₺' : currencyFilter === 'USD' ? '$' : '€'}
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 2, width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Üst Maaş"
                      type="number"
                      value={maxSalaryFilter}
                      onChange={(e) => handleSalaryChange(setMaxSalaryFilter, e.target.value)}
                      size="small"
                      InputProps={{
                        inputProps: { min: 0 },
                        endAdornment: currencyFilter && (
                          <InputAdornment position="end">
                            {currencyFilter === 'TRY' ? '₺' : currencyFilter === 'USD' ? '$' : '€'}
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 2, width: '100%' }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        setLocationFilter('');
                        setJobTypeFilter('');
                        setCurrencyFilter('');
                        setMinSalaryFilter('');
                        setMaxSalaryFilter('');
                        setSearchTerm('');
                      }}
                      sx={{
                        borderRadius: 2,
                        height: 40
                      }}
                    >
                      Temizle
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Collapse>
          </Box>

          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            {isEmployer && currentTab === 0 ? 'İlanlarım' : 'İş İlanları'}
          </Typography>

          {jobsToRender.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body1" color="text.secondary">Aradığınız kriterlere uygun ilan bulunamadı.</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                {jobsToRender.map((job) => renderJobCard(job, currentTab === 0 && isEmployer))}
              </Box>
              {/* Pagination only for 'All Jobs' tab */}
              {!(currentTab === 0 && isEmployer) && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Stack>
      )
      }

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>İlanı Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Sil</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box >
  );
}

