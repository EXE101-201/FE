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
    const [user, setUser] = useState<any>(() => {
        const local = localStorage.getItem('user');
        if (!local) return null;
        try {
            return JSON.parse(local);
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            return null;
        }
    });

    const isLoggedIn = !!user;

    useEffect(() => {
        const fetchUser = () => {
            const data = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            if (data && token) {
                try {
                    setUser(JSON.parse(data));
                } catch (e) {
                    setUser(null);
                }
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

    return { user, isLoggedIn, refreshUser };
}

export function useConfessions() {
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        console.log('Refreshing confessions...');
        setLoading(true);
        try {
            const data = await getConfessions();
            console.log('Received confessions data:', data);

            if (!Array.isArray(data)) {
                console.error('Data is not an array:', data);
                // If it's an object with a data property, use that
                if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
                    console.log('Using data.data as confessions array');
                    setConfessions((data as any).data);
                } else {
                    throw new Error('Server returned invalid data format: expected array');
                }
            } else {
                // Sort: Premium first, then by createdAt desc
                const sorted = [...data].sort((a: Confession, b: Confession) => {
                    if (a.isPremium && !b.isPremium) return -1;
                    if (!a.isPremium && b.isPremium) return 1;
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    if (isNaN(dateA) || isNaN(dateB)) return 0;
                    return dateB - dateA;
                });
                setConfessions(sorted);
            }
            setError(null);
        } catch (err: any) {
            console.error('Error fetching confessions:', err);
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
