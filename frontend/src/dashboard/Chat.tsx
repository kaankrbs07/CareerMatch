import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/api';
// import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

interface Contact {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
}

interface Message {
    id: string; // Mongo ObjectId
    senderId: number;
    receiverId: number;
    content: string;
    timestamp: string;
}

import { useChat } from '../context/ChatContext';

export default function Chat() {
    const { user } = useAuth();
    const { connection, refreshUnreadCount } = useChat();
    const location = useLocation();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Listen for new messages on shared connection
    useEffect(() => {
        if (!connection) return;

        const handleReceiveMessage = (message: Message) => {
            // Only add to messages if it belongs to the current conversation
            if (selectedContact) {
                if ((message.senderId === selectedContact.id && message.receiverId === user?.userId) ||
                    (message.senderId === user?.userId && message.receiverId === selectedContact.id)) {

                    setMessages(prev => [...prev, message]);

                    // If user is currently looking at this conversation, mark it as read immediately
                    if (message.receiverId === user?.userId && message.senderId === selectedContact.id) {
                        // We can fire-and-forget this call
                        chatService.markAsRead(selectedContact.id).then(() => {
                            refreshUnreadCount();
                        });
                    }
                }
            }

            // If the message is NOT from the selected contact (or no contact selected), 
            // the Context handles the increment. We don't need to do anything.
            // But if we ARE looking at it, we just marked it as read above, so we refresh count.
        };

        connection.on('ReceiveMessage', handleReceiveMessage);

        return () => {
            connection.off('ReceiveMessage', handleReceiveMessage);
        };
    }, [connection, selectedContact, user, refreshUnreadCount]);

    // 3. Load Contacts & specific contact from state
    useEffect(() => {
        const initChat = async () => {
            await loadContacts();

            // Check if we navigated here with a specific contact to chat with
            const state = location.state as { contact?: Contact };
            if (state?.contact) {
                // If this contact is not in our list, add it temporarily
                setContacts(prev => {
                    const exists = prev.find(c => c.id === state.contact!.id);
                    if (!exists) return [state.contact!, ...prev];
                    return prev;
                });
                setSelectedContact(state.contact);
            }
        };
        initChat();
    }, [location.state]);

    // 4. Load Messages when Contact Selected
    useEffect(() => {
        if (selectedContact) {
            loadMessages(selectedContact.id);
        }
    }, [selectedContact]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadContacts = async () => {
        try {
            const data = await chatService.getContacts();
            setContacts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadMessages = async (otherUserId: number) => {
        try {
            const data = await chatService.getMessages(otherUserId);
            setMessages(data);
            // Since backend marks messages as read on getMessages, updates badge
            await refreshUnreadCount();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !selectedContact || !connection) {
            console.log("Send aborted", { msg: inputMessage, contact: selectedContact, conn: connection });
            return;
        }

        try {
            // SignalR call
            await connection.invoke('SendMessage', selectedContact.id, inputMessage);
            setInputMessage('');
        } catch (err) {
            console.error("Message send failed", err);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        try {
            await chatService.deleteMessage(messageId);
            // Optimistic update: remove from UI
            setMessages(prev => prev.filter(m => m.id !== messageId));
        } catch (err) {
            console.error("Failed to delete message", err);
        }
    };

    return (
        <Paper elevation={3} sx={{ height: '80vh', display: 'flex', overflow: 'hidden', borderRadius: 3 }}>
            {/* Contacts Sidebar */}
            <Box sx={{ width: 320, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h6">Mesajlar</Typography>
                </Box>
                <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {contacts.map((contact) => (
                        <ListItem key={contact.id} disablePadding>
                            <ListItemButton
                                selected={selectedContact?.id === contact.id}
                                onClick={() => setSelectedContact(contact)}
                            >
                                <ListItemAvatar>
                                    <Avatar>{contact.firstName[0]}{contact.lastName[0]}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={`${contact.firstName} ${contact.lastName}`}
                                    secondary={contact.role}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    {contacts.length === 0 && (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Henüz mesajınız yok.
                            </Typography>
                        </Box>
                    )}
                </List>
            </Box>

            {/* Chat Area */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar>{selectedContact.firstName[0]}{selectedContact.lastName[0]}</Avatar>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {selectedContact.firstName} {selectedContact.lastName}
                            </Typography>
                        </Box>

                        {/* Messages List */}
                        <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#f5f7fa' }}>
                            <Stack spacing={2}>
                                {messages.filter(m =>
                                    (m.senderId === user?.userId && m.receiverId === selectedContact.id) ||
                                    (m.receiverId === user?.userId && m.senderId === selectedContact.id)
                                ).map((msg, index) => {
                                    const isMe = msg.senderId === user?.userId;
                                    return (
                                        <Box key={index} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', '&:hover .delete-icon': { opacity: 1, visibility: 'visible' } }}>
                                            <Stack direction={isMe ? 'row' : 'row-reverse'} spacing={1} alignItems="center">
                                                {isMe && (
                                                    <IconButton
                                                        className="delete-icon"
                                                        size="small"
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                        sx={{
                                                            opacity: 0,
                                                            visibility: 'hidden',
                                                            transition: 'all 0.2s',
                                                            color: 'text.secondary',
                                                            '&:hover': { color: 'error.main' }
                                                        }}
                                                    >
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                <Paper sx={{ p: 1.5, px: 2, maxWidth: '70%', borderRadius: 3, bgcolor: isMe ? 'primary.main' : (theme) => theme.vars ? theme.vars.palette.action.hover : '#f5f5f5', color: isMe ? '#ffffff' : 'text.primary', boxShadow: 1, borderTopRightRadius: isMe ? 0 : 3, borderTopLeftRadius: !isMe ? 0 : 3 }}>
                                                    <Typography variant="body1">{msg.content}</Typography>
                                                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8, textAlign: 'right', fontSize: '0.7rem' }}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Paper>
                                            </Stack>
                                        </Box>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </Stack>
                        </Box>

                        {/* Message Input */}
                        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'white' }}>
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    fullWidth
                                    placeholder="Bir mesaj yazın..."
                                    size="small"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSendMessage();
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    endIcon={<SendIcon />}
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim()}
                                >
                                    Gönder
                                </Button>
                            </Stack>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2, opacity: 0.6 }}>
                        <SendIcon sx={{ fontSize: 60 }} />
                        <Typography variant="h6">Bir sohbet seçin veya yeni birine mesaj gönderin.</Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}

