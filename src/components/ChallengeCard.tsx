import React from 'react';
import { Progress } from 'antd';

import { useNavigate } from 'react-router-dom';

interface ChallengeCardProps {
    challenge: any;
    onJoin: (id: string) => void;
    onUpdate: (id: string) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onJoin, onUpdate }) => {
    const navigate = useNavigate();
    const isJoined = !!challenge.userProgress;
    const progress = challenge.userProgress ? (challenge.userProgress.progress / challenge.duration) * 100 : 0;
    const currentDay = challenge.userProgress ? challenge.userProgress.progress : 0;

    const handleHeaderClick = async () => {
        if (challenge.title.includes("Dr. MTH")) {
            navigate('/chat', { state: { challengeId: challenge._id } });
        } else if (challenge.title.includes("Ngồi thiền 10p")) {
            navigate('/library', { state: { activeTab: 'meditation', challengeId: challenge._id } });
        } else if (challenge.title.includes("Thư giãn cùng âm nhạc")) {
            navigate('/library', { state: { activeTab: 'music', challengeId: challenge._id } });
        } else if (challenge.title.includes("Viết lại 1 ngày")) {
            navigate('/confessions/new', { state: { challengeId: challenge._id } });
        } else {
            navigate(`/challenges/${challenge._id}/${challenge.type}`);
        }
    };

    return (
        <div onClick={handleHeaderClick} className="bg-[#ebf1f9] rounded-[2.5rem] p-5 shadow-sm flex flex-col items-center text-center relative overflow-hidden h-64">
            <div
                className="flex w-full justify-between items-start mb-2 px-1 cursor-pointer"
            >
                <div className="text-left flex-1 pr-2">
                    <h3 className="text-[15px] font-bold text-gray-800 leading-tight mb-1">{challenge.title}</h3>
                    <p className="text-[10px] text-gray-400 leading-snug">{challenge.description}</p>
                </div>
                <img src={challenge.icon} alt={challenge.title} className="w-12 h-12 object-contain" />
            </div>

            <div className="w-full mt-auto px-1">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] text-gray-400 font-medium">{currentDay}/{challenge.duration} ngày</span>
                    {!isJoined ? (
                        <button
                            onClick={() => onJoin(challenge._id)}
                            className="text-[11px] font-bold text-gray-400 hover:text-green-600 transition"
                        >
                            Tham gia
                        </button>
                    ) : (
                        <button
                            onClick={() => onUpdate(challenge._id)}
                            className="text-[11px] font-bold text-gray-400 hover:text-green-600 transition"
                        >
                            Tiếp tục
                        </button>
                    )}
                </div>
                <Progress
                    percent={progress}
                    showInfo={false}
                    strokeColor="#92f09b"
                    trailColor="#c8d2df"
                    strokeWidth={10}
                    className="mb-0"
                />
            </div>
        </div>
    );

};

export default ChallengeCard;
