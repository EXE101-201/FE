import React, { useState, useEffect } from 'react';
import { Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getChallenges, joinChallenge, updateChallengeProgress } from '../lib/api';
import ChallengeCard from '../components/ChallengeCard';

const Challenges: React.FC = () => {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const fetchChallenges = async () => {
        try {
            const data = await getChallenges();
            if (data && data.length > 0) {
                setChallenges(data);
            } else {
                // Fallback to mock data if DB is empty
                const mockChallenges = [
                    { _id: '1', title: "Ngủ sớm 7 ngày", description: "Nên ngủ trước 11h", duration: 7, icon: "/Thuthach.png", participants: 5, completedCount: 5, userProgress: { progress: 2, status: 'JOINED' } },
                    { _id: '2', title: "Ngồi thiền 10p", description: "Hãy tập trung nhé!!", duration: 7, icon: "/Thuthach2.png", participants: 9, completedCount: 3, userProgress: null },
                    { _id: '3', title: "Uống 2lít nước mỗi ngày", description: "nước rất quan trọng cho cơ thể!", duration: 7, icon: "/Thuthach3.png", participants: 15, completedCount: 2, userProgress: { progress: 5, status: 'JOINED' } },
                    { _id: '4', title: "Tập thể dục 15p", description: "Cùng vươn vai nào", duration: 7, icon: "/Thuthach4.png", participants: 5, completedCount: 5, userProgress: { progress: 2, status: 'JOINED' } },
                    { _id: '5', title: "Không dùng điện thoại 15 phút trước khi ngủ", description: "Ngủ dễ hơn cực nhiều.", duration: 7, icon: "/Thuthach5.png", participants: 12, completedCount: 4, userProgress: { progress: 2, status: 'JOINED' } },
                    { _id: '6', title: "Tâm sự cùng Dr. MTH", description: "Có áp lực hãy nói với tôi!", duration: 7, icon: "/Thuthach9.png", participants: 20, completedCount: 10, userProgress: { progress: 2, status: 'JOINED' } },
                    { _id: '7', title: "Viết lại 1 ngày của bạn thế nào?", description: "Cùng chia sẻ nào !", duration: 7, icon: "/Thuthach7.png", participants: 8, completedCount: 2, userProgress: { progress: 5, status: 'JOINED' } },
                    { _id: '8', title: "Thư giãn cùng âm nhạc", description: "Thư giãn chút nào !", duration: 7, icon: "/Thuthach8.png", participants: 18, completedCount: 6, userProgress: { progress: 2, status: 'JOINED' } }
                ];

                setChallenges(mockChallenges);
            }
        } catch (error) {
            console.error('Failed to fetch challenges:', error);
            // Also fallback on error
            const mockChallenges = [
                { _id: '1', title: "Ngủ sớm 7 ngày", description: "Nên ngủ trước 11h", duration: 7, icon: "/Thuthach.png", participants: 5, completedCount: 5 },
                { _id: '2', title: "Ngồi thiền 10p", description: "Hãy tập trung nhé!!", duration: 7, icon: "/Thuthach2.png", participants: 9, completedCount: 3 },
                { _id: '6', title: "Tâm sự cùng Dr. MTH", description: "Có áp lực hãy nói với tôi!", duration: 7, icon: "/chat-robot.png", participants: 20, completedCount: 10 }
            ];
            setChallenges(mockChallenges);
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, []);

    const handleJoin = async (id: string) => {
        try {
            await joinChallenge(id);
            message.success('Đã tham gia thử thách!');
            const challenge = challenges.find(c => c._id === id);
            if (challenge && challenge.title.includes("Dr. MTH")) {
                navigate('/chat');
            } else {
                fetchChallenges();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleUpdate = async (id: string) => {
        const challenge = challenges.find(c => c._id === id);
        if (challenge && challenge.title.includes("Dr. MTH")) {
            navigate('/chat');
            return;
        }
        try {
            await updateChallengeProgress(id);
            message.success('Cập nhật tiến độ thành công!');
            fetchChallenges();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const filteredChallenges = challenges.filter((c: any) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const featuredChallenges = [...challenges].sort((a, b) => b.participants - a.participants).slice(0, 4);

    return (
        <div className="bg-[#d9ede2] min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-4">
                        <h1 className="text-3xl font-bold text-[#557c61] leading-tight">
                            Thử thách nhỏ - tạo<br />thói quen “lớn”
                        </h1>
                        <div className="flex items-center gap-4">
                            <Input
                                placeholder="tìm kiếm"
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                className="rounded-full bg-[#d0e5d8] border-none px-6 py-2 w-64 md:w-96 text-gray-500"
                                style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)', textAlign: 'right' }}
                            />
                            <div className="bg-[#a8cfb6] p-1 rounded-full shadow-sm h-12">
                                <img src="/robot.png" alt="bot" className=" w-12 overflow-hidden object-contain" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {filteredChallenges.map((challenge: any) => (
                            <ChallengeCard
                                key={challenge._id}
                                challenge={challenge}
                                onJoin={handleJoin}
                                onUpdate={handleUpdate}
                            />
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-[#e9eef6] rounded-[2.5rem] p-8 h-48 flex items-center justify-center shadow-sm">
                        <h2 className="text-3xl font-bold text-[#7fa3c4]">Quảng cáo</h2>
                    </div>

                    <div className="bg-[#ebf1f9] rounded-[2.5rem] p-6 shadow-sm">
                        <h2 className="text-2xl font-bold text-[#557c61] text-center mb-8">Thử thách nổi bật</h2>
                        <div className="space-y-8">
                            {featuredChallenges.map((challenge, index) => (
                                <div key={challenge._id} className="relative">
                                    <div className="flex gap-4 items-center">
                                        <img src={challenge.icon} alt={challenge.title} className="w-14 h-14 object-contain" />
                                        <div className="flex-1">
                                            <h4 className="text-[13px] font-bold text-gray-700">{challenge.title}</h4>
                                            <div className="flex justify-between text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                                                <span>{challenge.completedCount} hoàn thành</span>
                                                <span>{challenge.participants} {index === 3 ? 'người' : ''} tham gia</span>
                                            </div>
                                        </div>
                                    </div>
                                    {index < featuredChallenges.length - 1 && (
                                        <div className="h-[1px] bg-gray-200 mt-6 w-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Challenges;
