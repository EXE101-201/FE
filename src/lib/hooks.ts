import { useState, useEffect } from 'react';
import api, { getConfessions } from './api';

export type Confession = {
    id: string;
    content: string;
    createdAt: number;
    tags: string[];
    reactions: Record<string, number>;
    commentCount?: number;
    comments?: { id: string; content: string; createdAt: number; user: { _id: string; fullName: string } }[];
    status: 'pending' | 'approved' | 'rejected';
    isPremium?: boolean;
    author: string;
    authorId?: string;
};

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

export function useConfessions() {
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfessions = async () => {
            try {
                const data = await getConfessions();
                // Sort: Premium first, then by createdAt desc
                const sorted = data.sort((a: Confession, b: Confession) => {
                    if (a.isPremium && !b.isPremium) return -1;
                    if (!a.isPremium && b.isPremium) return 1;
                    return b.createdAt - a.createdAt;
                });
                setConfessions(sorted);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch confessions');
            } finally {
                setLoading(false);
            }
        };

        fetchConfessions();
    }, []);

    const refresh = async () => {
        setLoading(true);
        try {
            const data = await getConfessions();
            const sorted = data.sort((a: Confession, b: Confession) => {
                if (a.isPremium && !b.isPremium) return -1;
                if (!a.isPremium && b.isPremium) return 1;
                return b.createdAt - a.createdAt;
            });
            setConfessions(sorted);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch confessions');
        } finally {
            setLoading(false);
        }
    };

    return { confessions, loading, error, refresh };
}
