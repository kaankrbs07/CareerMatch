import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { chatService } from '../services/api';

interface ChatContextType {
    unreadCount: number;
    connection: HubConnection | null;
    refreshUnreadCount: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { user, token } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [connection, setConnection] = useState<HubConnection | null>(null);

    const refreshUnreadCount = async () => {
        try {
            const data = await chatService.getUnreadCount();
            setUnreadCount(data.count);
        } catch (err) {
            console.error("Failed to fetch unread count", err);
        }
    };

    // 1. Initialize Connection
    useEffect(() => {
        if (!token) {
            setUnreadCount(0);
            return;
        }

        // Initial fetch
        refreshUnreadCount();

        const newConnection = new HubConnectionBuilder()
            .withUrl("http://localhost:5217/chathub", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        setConnection(newConnection);

        return () => {
            newConnection.stop();
        };
    }, [token]);

    // 2. Start Connection and Listen
    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Chat Context SignalR Connected!');

                    connection.on('ReceiveMessage', (message: any) => {
                        // If I am the receiver, increment unread count
                        // Note: If I am currently ON the chat page and the chat is open, 
                        // the chat component might mark it as read immediately.
                        // But simpler logic: Increment, and let the Chat component decrement/refresh when it reads.

                        if (message.receiverId === user?.userId) {
                            // You might want to check if the user is currently viewing this chat to avoid incrementing
                            // But strictly speaking, it IS unread until the API marks it read.
                            // So we can just refresh the count from the server to be sure, or optimistically increment.
                            // Optimistic increment:
                            setUnreadCount(prev => prev + 1);

                            // Or safer:
                            // refreshUnreadCount(); 
                        }
                    });
                })
                .catch(e => console.error('Connection failed: ', e));
        }
    }, [connection, user]);

    return (
        <ChatContext.Provider value={{ unreadCount, connection, refreshUnreadCount }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

