
import { useState, useEffect } from 'react';
import {
    Box,
    List,
    Badge,
    Avatar,
    Divider,
    Popover,
    Typography,
    IconButton,
    ListItemText,
    ListItemAvatar,
    ListItemButton,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import { notificationService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: number;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type: string;
    link?: string;
}

export default function NotificationsPopover() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState<null | HTMLElement>(null);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getMyNotifications();
            // API now returns { notifications: [...], pagination: {...} }
            const data = response.notifications || response; // Fallback for backward compat
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.isRead).length);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setOpen(event.currentTarget);
        fetchNotifications(); // Refresh on open
    };

    const handleClose = () => {
        setOpen(null);
    };

    const handleMarkAllAsRead = async () => {
        await notificationService.markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const handleClickItem = async (notification: Notification) => {
        handleClose();
        if (!notification.isRead) {
            await notificationService.markAsRead(notification.id);
            fetchNotifications(); // optimal: update local state
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleDelete = async (e: React.MouseEvent, notificationId: number) => {
        e.stopPropagation(); // Prevent triggering handleClickItem
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to delete notification', err);
        }
    };

    return (
        <>
            <IconButton
                color={open ? 'primary' : 'default'}
                onClick={handleOpen}
                sx={{ width: 40, height: 40 }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Popover
                open={Boolean(open)}
                anchorEl={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        ml: 0.75,
                        width: 360,
                        maxHeight: 500, // Scrollable
                        overflowY: 'auto'
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1">Notifications</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            You have {unreadCount} unread messages
                        </Typography>
                    </Box>

                    {unreadCount > 0 && (
                        <IconButton color="primary" onClick={handleMarkAllAsRead}>
                            <DoneAllIcon />
                        </IconButton>
                    )}
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <List disablePadding>
                    {notifications.length === 0 && (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">No notifications</Typography>
                        </Box>
                    )}

                    {notifications.map((notification) => (
                        <Box
                            key={notification.id}
                            sx={{
                                position: 'relative',
                                '&:hover .delete-btn': {
                                    opacity: 1
                                }
                            }}
                        >
                            <ListItemButton
                                onClick={() => handleClickItem(notification)}
                                sx={{
                                    py: 1.5,
                                    px: 2.5,
                                    mt: '1px',
                                    ...(notification.isRead === false && {
                                        bgcolor: 'action.selected',
                                    }),
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'background.neutral' }}>
                                        {notification.type === 'Application' ? '📝' : '👀'}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle2">
                                            {notification.title}
                                            <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                                                &nbsp; {notification.message}
                                            </Typography>
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                mt: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: 'text.disabled',
                                            }}
                                        >
                                            <AccessTimeIcon sx={{ mr: 0.5, width: 16, height: 16 }} />
                                            {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                                        </Typography>
                                    }
                                />
                                <IconButton
                                    className="delete-btn"
                                    size="small"
                                    onClick={(e) => handleDelete(e, notification.id)}
                                    sx={{
                                        opacity: 0,
                                        transition: 'opacity 0.2s',
                                        ml: 1,
                                        '&:hover': {
                                            bgcolor: 'error.lighter',
                                            color: 'error.main'
                                        }
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </ListItemButton>
                        </Box>
                    ))}
                </List>
            </Popover>
        </>
    );
}

