import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      // silently ignore - notifications are non-critical
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    if (!user) return;
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await api.put('/notifications/read-all');
    fetchNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
