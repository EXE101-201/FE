import { useEffect, useState } from "react";
import { getConfessions } from "../api";


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