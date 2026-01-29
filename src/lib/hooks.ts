import { useState, useEffect } from 'react';
import api, { getConfessions } from './api';

export interface Confession {
    id: string
    _id: string
    content: string
    tags: string[]
    author: string | null
    authorId: string | null
    status: 'pending' | 'approved' | 'rejected'
    reactions: Record<string, number>
    myReaction?: string
    isOwner?: boolean
    isPremium: boolean
    createdAt: number | string
    commentCount?: number
    comments?: any[]
}

export function useUser() {
    const userLocal = localStorage.getItem('user')
    const [user, setUser] = useState<any>(userLocal ? JSON.parse(userData()) : null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    function userData() {
        return localStorage.getItem('user') || 'null';
    }

    useEffect(() => {
        const fetchUser = () => {
            const data = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            if (data && token) {
                setUser(JSON.parse(data));
                setIsLoggedIn(true);
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

        const handleStorageChange = () => fetchUser();
        window.addEventListener('storage', handleStorageChange);
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

    const refresh = async () => {
        setLoading(true);
        try {
            const data = await getConfessions();
            // Sort: Premium first, then by createdAt desc
            const sorted = data.sort((a: Confession, b: Confession) => {
                if (a.isPremium && !b.isPremium) return -1;
                if (!a.isPremium && b.isPremium) return 1;
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });
            setConfessions(sorted);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch confessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    return { confessions, loading, error, refresh };
}
