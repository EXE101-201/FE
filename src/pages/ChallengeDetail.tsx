import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Progress, message } from 'antd';
import api from '../lib/api';

const ChallengeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [challenge, setChallenge] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchChallenge = async () => {
        try {
            const response = await api.get(`/challenges/${id}`);
            // Note: I need to implement this endpoint or use getAll and find locally
            // For simplicity, let's assume we implement it
            setChallenge(response.data);
        } catch (error) {
            console.error('Failed to fetch challenge detail:', error);
            // Fallback: try to find it in the list of all challenges
            try {
                const response = await api.get('/challenges');
                const found = response.data.find((c: any) => c._id === id);
                if (found) setChallenge(found);
            } catch (err) {
                message.error('Không tìm thấy thử thách');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChallenge();
    }, [id]);

    const handleUpdate = async () => {
        try {
            await api.put(`/challenges/${id}/progress`);
            message.success('Cập nhật tiến độ thành công!');
            fetchChallenge();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;
    if (!challenge) return <div className="p-8 text-center">Không tìm thấy thử thách.</div>;

    const isJoined = !!challenge.userProgress;
    const progress = challenge.userProgress ? (challenge.userProgress.progress / challenge.duration) * 100 : 0;
    const currentDay = challenge.userProgress ? challenge.userProgress.progress : 0;

    return (
        <div className="bg-[#d9ede2] min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm">
                <Button onClick={() => navigate(-1)} className="mb-8 rounded-full border-[#a8cfb6] text-[#557c61]">
                    &larr; Quay lại
                </Button>

                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <img src={challenge.icon} alt={challenge.title} className="w-32 h-32 md:w-48 md:h-48 object-contain" />

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">{challenge.title}</h1>
                        <p className="text-gray-500 text-lg mb-8">{challenge.description}</p>

                        <div className="bg-[#ebf1f9] rounded-3xl p-8 mb-8">
                            <h2 className="text-xl font-bold text-[#557c61] mb-4">Tiến độ của bạn</h2>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-lg font-medium text-gray-600">Ngày {currentDay} / {challenge.duration}</span>
                                <span className="text-lg font-bold text-[#557c61]">{Math.round(progress)}%</span>
                            </div>
                            <Progress
                                percent={progress}
                                showInfo={false}
                                strokeColor="#92f09b"
                                trailColor="#c8d2df"
                                strokeWidth={16}
                            />
                        </div>

                        <div className="flex gap-4">
                            {!isJoined ? (
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => api.post('/challenges/join', { challengeId: id }).then(() => fetchChallenge())}
                                    className="rounded-full bg-[#557c61] border-none px-12 h-14 text-lg"
                                >
                                    Tham gia ngay
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleUpdate}
                                    className="rounded-full bg-[#557c61] border-none px-12 h-14 text-lg"
                                    disabled={challenge.userProgress.status === 'COMPLETED'}
                                >
                                    {challenge.userProgress.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã làm hôm nay'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeDetail;
