import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

import { adminService, commonService } from '../../services/api';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function AdminDashboard() {
    const [value, setValue] = useState(0);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Users Tab State
    const [users, setUsers] = useState<any[]>([]);

    // System Data Tab State
    const [systemDataType, setSystemDataType] = useState('industry'); // industry, occupation, education
    const [systemDataList, setSystemDataList] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>({ name: '', description: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (value === 1) fetchUsers();
        if (value === 2) fetchSystemData();
    }, [value, systemDataType]);

    const fetchStats = async () => {
        try {
            const data = await adminService.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const fetchSystemData = async () => {
        try {
            let data = [];
            if (systemDataType === 'industry') data = await commonService.getIndustries();
            else if (systemDataType === 'occupation') data = await commonService.getOccupations();
            else if (systemDataType === 'education') data = await commonService.getEducationLevels();
            setSystemDataList(data);
        } catch (error) {
            console.error("Failed to fetch system data", error);
        }
    };

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleSystemDataSave = async () => {
        try {
            if (systemDataType === 'industry') {
                if (isEditing) await adminService.updateIndustry(currentItem.id, currentItem);
                else await adminService.createIndustry(currentItem);
            } else if (systemDataType === 'occupation') {
                if (isEditing) await adminService.updateOccupation(currentItem.id, currentItem);
                else await adminService.createOccupation(currentItem);
            } else if (systemDataType === 'education') {
                if (isEditing) await adminService.updateEducationLevel(currentItem.id, currentItem);
                else await adminService.createEducationLevel(currentItem);
            }
            setOpenDialog(false);
            fetchSystemData();
        } catch (error) {
            console.error("Failed to save", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
        try {
            if (systemDataType === 'industry') await adminService.deleteIndustry(id);
            else if (systemDataType === 'occupation') await adminService.deleteOccupation(id);
            else if (systemDataType === 'education') await adminService.deleteEducationLevel(id);
            fetchSystemData();
        } catch (error) {
            console.error("Delete failed", error);
        }
    }

    const openAddDialog = () => {
        setCurrentItem({ name: '', description: '' });
        setIsEditing(false);
        setOpenDialog(true);
    };

    const openEditDialog = (item: any) => {
        setCurrentItem(item);
        setIsEditing(true);
        setOpenDialog(true);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    const statCards = [
        { title: 'Toplam Kullanıcı', value: stats?.totalUsers, icon: <GroupIcon fontSize="large" color="primary" /> },
        { title: 'İşverenler', value: stats?.totalEmployers, icon: <BusinessIcon fontSize="large" color="secondary" /> },
        { title: 'İş Arayanlar', value: stats?.totalJobSeekers, icon: <PersonIcon fontSize="large" color="success" /> },
        { title: 'Toplam İlan', value: stats?.totalJobs, icon: <WorkIcon fontSize="large" color="action" /> },
        { title: 'Aktif İlan', value: stats?.activeJobs, icon: <WorkIcon fontSize="large" color="info" /> },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Yönetici Paneli
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="admin tabs">
                    <Tab label="Genel Bakış" />
                    <Tab label="Kullanıcılar" />
                    <Tab label="Sistem Verileri" />
                </Tabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={value} index={0}>
                <Grid container spacing={3}>
                    {statCards.map((stat, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: 140,
                                    justifyContent: 'space-between',
                                    borderRadius: 3,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Typography color="text.secondary" variant="subtitle1" fontWeight="medium">
                                        {stat.title}
                                    </Typography>
                                    {stat.icon}
                                </Box>
                                <Typography variant="h3" component="div" fontWeight="bold">
                                    {stat.value ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            {/* Users Tab */}
            <TabPanel value={value} index={1}>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="user table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Ad Soyad</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Rol</TableCell>
                                <TableCell>Oluşturulma Tarihi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {row.firstName} {row.lastName}
                                    </TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>{row.roleName}</TableCell>
                                    <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* System Data Tab */}
            <TabPanel value={value} index={2}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="system-data-select-label">Veri Tipi</InputLabel>
                        <Select
                            labelId="system-data-select-label"
                            value={systemDataType}
                            label="Veri Tipi"
                            onChange={(e) => setSystemDataType(e.target.value)}
                        >
                            <MenuItem value="industry">Sektörler</MenuItem>
                            <MenuItem value="occupation">Meslekler</MenuItem>
                            <MenuItem value="education">Eğitim Seviyeleri</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
                        Yeni Ekle
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Ad</TableCell>
                                <TableCell>Açıklama</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {systemDataList.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.name || item.levelName}</TableCell>
                                    <TableCell>{item.description || '-'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => openEditDialog(item)} color="primary"><EditIcon /></IconButton>
                                        <IconButton onClick={() => handleDelete(item.id)} color="error"><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>{isEditing ? 'Düzenle' : 'Yeni Ekle'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Ad"
                        fullWidth
                        value={currentItem.name || currentItem.levelName || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value, levelName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Açıklama"
                        fullWidth
                        multiline
                        rows={4}
                        value={currentItem.description || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>İptal</Button>
                    <Button onClick={handleSystemDataSave} variant="contained">Kaydet</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

