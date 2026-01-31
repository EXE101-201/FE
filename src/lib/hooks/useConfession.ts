import { useEffect, useState } from "react";
import { getConfessions } from "../api";


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