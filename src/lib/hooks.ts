import { useState, useEffect } from 'react';

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

        fetchUser();

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
