import { useState, useEffect } from 'react';
import api from '../api';

export function useUser() {
    const userLocal = localStorage.getItem('user')
    const [user, setUser] = useState<any>(userLocal ? JSON.parse(userLocal) : null);

    useEffect(() => {
        const fetchUser = () => {
            const userData = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            if (userData && token) {
                setUser(JSON.parse(userData));
            } else {
                setUser(null);
            }
        };

        const syncUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/users/me');
                    localStorage.setItem('user', JSON.stringify(data));
                    setUser(data);
                    window.dispatchEvent(new Event('user-updated'));
                } catch (error) {
                    console.error("Failed to sync user data", error);
                }
            }
        };

        // Initial fetch from local
        fetchUser();
        // Sync with server
        syncUser();

        // Listen for local storage changes (optional, but helpful if user logs out/in in another tab)
        const handleStorageChange = () => fetchUser();
        window.addEventListener('storage', handleStorageChange);

        // Custom event for same-tab updates
        window.addEventListener('user-updated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('user-updated', handleStorageChange);
        };
    }, []);

    const refreshUser = () => {
        window.dispatchEvent(new Event('user-updated'));
    };

    return { user, refreshUser };
}


