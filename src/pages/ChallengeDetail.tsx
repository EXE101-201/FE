import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClockCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Progress, Button, Typography, App, Spin } from "antd";
import api, { joinChallenge, updateChallengeProgress } from '../lib/api';

const { Title } = Typography;

export default function ChallengeDetail() {
    const navigate = useNavigate();
    const { message, modal } = App.useApp();
    const { id, type } = useParams<{ id: string, type: string }>();
    const [loading, setLoading] = useState(true);
    const [challenge, setChallenge] = useState<any>(null);
    const [userChallenge, setUserChallenge] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(900);
    const [videos, setVideos] = useState([]);
    const [hasTriggered, setHasTriggered] = useState(false);
    const lastShownModalId = useRef<string | null>(null);


    const fetchData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await api.get(`/challenges/${id}`);
            const data = response.data;
            setChallenge(data);

            if (data) {
                setVideos(data.contentDetail || []);
                let currentUC = data.userProgress;
                if (!currentUC) {
                    currentUC = {
                        status: 'JOINED',
                        progress: 0,
                        lastUpdated: null
                    };
                    await joinChallenge(id);
                }
                setUserChallenge(currentUC);
                // Check if already completed today
                if (currentUC.lastUpdated) {
                    const today = new Date().setHours(0, 0, 0, 0);
                    const lastUpdated = new Date(currentUC.lastUpdated).setHours(0, 0, 0, 0);

                    if (today === lastUpdated && type !== '2') {
                        setHasTriggered(true);
                        setTimeLeft(0);

                        if (lastShownModalId.current !== id) {
                            lastShownModalId.current = id;
                            modal.confirm({
                                title: <span className="text-xl font-bold text-[#2d5c40]">Bạn đã hoàn thành hôm nay!</span>,
                                content: "Hôm nay bạn đã thực hiện thử thách này rồi. Bạn muốn quay lại trang danh sách hay ở lại xem nội dung?",
                                centered: true,
                                okText: 'Về trang thử thách',
                                cancelText: 'Ở lại trang',
                                onOk: () => navigate('/challenges'),
                                okButtonProps: { className: '!bg-[#A8D5BA] !border-none !rounded-full' },
                                cancelButtonProps: { className: '!border-[#A8D5BA] !text-[#2d5c40] !rounded-full' }
                            });
                        }
                    } else {
                        setTimeLeft(data.time || 900);
                    }
                } else {
                    setTimeLeft(data.time || 900);
                }
            }
        } catch (error) {
            console.error('Failed to fetch challenge:', error);
            message.error('Không thể tải thông tin thử thách');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Reset timer and trigger when changing challenge
        setHasTriggered(false);
    }, [id]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Effect to trigger update when timer hits zero
    useEffect(() => {
        if (timeLeft === 0 && !loading && challenge && !hasTriggered && type !== '2') {
            setHasTriggered(true);
            handleUpdate();
        }
    }, [timeLeft, loading, challenge, hasTriggered]);

    const handleUpdate = async () => {
        if (!challenge || !id) return;
        try {
            await updateChallengeProgress(id);
            fetchData();
            modal.confirm({
                icon: null,
                title: <span className="text-2xl font-bold text-[#2d5c40]">Chúc mừng!</span>,
                content: (
                    <div className="text-center py-4">
                        <img src="https://cdn-icons-png.flaticon.com/512/3112/3112946.png" alt="Success" className="w-24 h-24 mx-auto mb-4" />
                        <p className="text-lg text-gray-600">
                            Bạn đã hoàn thành thử thách 15 phút hôm nay! 🎉 <br />
                            Hãy tiếp tục duy trì thói quen tốt này nhé.
                        </p>
                    </div>
                ),
                centered: true,
                width: 500,
                okText: 'Về trang thử thách',
                cancelText: 'Ở lại trang',
                okButtonProps: {
                    className: '!bg-[#A8D5BA] !border-none !h-10 !px-6 !rounded-full !font-bold'
                },
                cancelButtonProps: {
                    className: '!border-[#A8D5BA] !text-[#2d5c40] !h-10 !px-6 !rounded-full !font-bold'
                },
                onOk: () => {
                    navigate('/challenges');
                },
            });
        } catch (error: any) {
            console.error('Update progress error:', error);
            // Optionally show error if it's not a "already updated" error
            if (error.response?.status !== 400) {
                message.error('Có lỗi xảy ra khi cập nhật tiến độ');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#A8D5BA] flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="min-h-screen bg-[#A8D5BA] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy thử thách</h2>
                </div>
            </div>
        );
    }

    const isJoined = userChallenge?.status !== 'NOT_JOINED';

    // Force rendering the new layout for specific challenges or if passed as prop
    if (type === '2' || challenge.title.includes("Ngủ sớm")) {
        return (
            <div className="min-h-screen bg-[#A8D5BA] p-10 font-sans relative flex flex-col items-center">
                {/* Header */}
                <div className="text-center mb-10 w-full">
                    <Title level={2} className="!text-[#2d5c40] !mb-0 font-medium tracking-wide">
                        Thử thách nhỏ - tạo thói quen "lớn"
                    </Title>
                </div>

                <div className=" w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Grid Content (2x2) */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-10">
                        {challenge.contentText.map((card: any) => (
                            <div
                                key={card.id}
                                style={{ backgroundColor: '#e2e7f7' }}
                                className="rounded-3xl p-12 shadow-md flex items-center relative overflow-hidden h-full text-lg"
                            >
                                {card.icon && <div className="w-1/3 flex-shrink-0 z-10 flex justify-center items-center h-full">
                                    <img src={card.icon} alt="Icon" className="w-full h-auto max-h-32 object-contain" />
                                </div>}
                                <div className={`pl-4 z-10 ${card.icon ? 'w-2/3' : 'w-full'}`}>
                                    {card.title && <h4 className="text-[#58856c] mb-2">{card.title}</h4>}
                                    {card.detail.map((text: any) => (<>
                                        <img src={text.icon} alt="Icon" style={{ width: '1rem', height: '1rem', transform: 'translateY(-3px)', display: 'inline-block' }} />
                                        <span key={text.id} className="text-[#58856c] leading-relaxed text-justify pl-1.5">
                                            {text.text}
                                        </span><br /></>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Sidebar: Challenge Progress */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-xl w-full h-full flex flex-col max-h-[350px]">
                            <div className="text-center mb-4">
                                <h3 className="font-semibold text-gray-700">Thử thách</h3>
                            </div>

                            <div className="bg-[#E8EAF6] rounded-2xl p-6 mb-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-xl">{challenge.title}</h4>
                                        <p className="text-xs text-green-600 font-medium">{challenge.description}</p>
                                    </div>
                                    <div className="w-12 h-12">
                                        <img src={challenge.icon || "https://cdn-icons-png.flaticon.com/512/2927/2927347.png"} alt="Sleep Icon" className="w-full h-full object-contain" />
                                    </div>
                                </div>

                                <div className="mt-4 relative z-10">
                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                        <span>{userChallenge?.progress || 0}/{challenge.duration} ngày</span>
                                    </div>
                                    <Progress
                                        percent={((userChallenge?.progress || 0) / challenge.duration) * 100}
                                        showInfo={false}
                                        strokeColor="#A5D6A7"
                                        trailColor="#ffffff"
                                        size="default"
                                    />
                                </div>
                            </div>

                            <div className="mt-auto text-center">
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleUpdate}
                                    className="!bg-[#88D3A8] !text-white !font-bold !rounded-full !px-8 !h-12 !border-none shadow-lg hover:!shadow-xl hover:!scale-105 transition-all w-full"
                                >
                                    {isJoined ? (userChallenge.status === 'COMPLETED' ? 'Đã Hoàn Thành' : 'Điểm danh ngay') : 'Tham Gia Thử Thách'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }

    return (
        <div className="min-h-screen bg-[#A8D5BA] p-6 font-sans relative">
            {/* Header */}
            <div className="text-center mb-8">
                <Title level={2} className="!text-[#2d5c40] !mb-0 font-medium tracking-wide">
                    Thử thách nhỏ - tạo thói quen "lớn"
                </Title>
            </div>

            {/* Robot Icon Top Right */}
            <div className="absolute top-6 right-6 w-16 h-16 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/40 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                <img src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=robot" alt="Robot" className="w-12 h-12" />
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                    {/* Render first 2 videos */}
                    {videos.slice(0, 2).map((video, index) => (
                        <iframe
                            key={index}
                            src={video}
                            width="100%"
                            height="100%"
                            className="aspect-video w-full rounded-lg shadow-md"
                            allow="autoplay"
                        />
                    ))}

                    {/* ITEM #3: Challenge Progress Card */}
                    <div className="bg-white rounded-3xl p-4 shadow-xl w-full flex flex-col justify-between">
                        <div className="text-center mb-2">
                            <h3 className="font-semibold text-gray-700 mb-1">Thử thách</h3>
                        </div>

                        {/* Current Challenge Info */}
                        <div className="bg-[#E6F4F1] rounded-2xl p-3 mb-3 relative overflow-hidden flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-base">{challenge.title}</h4>
                                    <p className="text-[10px] text-gray-500">{challenge.description}</p>
                                </div>
                                <div className="bg-blue-100 p-1.5 rounded-full">
                                    <UserOutlined className="text-blue-500 text-lg" />
                                </div>
                            </div>

                            <div className="mt-2 relative z-10">
                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                    <span>{userChallenge?.progress || 0}/{challenge.duration} ngày</span>
                                </div>
                                <Progress
                                    percent={((userChallenge?.progress || 0) / challenge.duration) * 100}
                                    showInfo={false}
                                    strokeColor="#8CDCB1"
                                    trailColor="#ffffff"
                                    size="small"
                                />
                            </div>

                            {/* Decorative background shape */}
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-50 rounded-full opacity-50 z-0"></div>
                        </div>

                        {/* Process Section */}
                        <div className="text-center">
                            <h3 className="font-semibold text-gray-700 mb-1 text-sm">Quá trình</h3>
                            <div className="bg-gray-50 rounded-xl p-3 w-full">
                                <div className="flex justify-between items-center mb-1 text-xs text-gray-600">
                                    <span className="flex items-center gap-1"><ClockCircleOutlined /> Thời gian còn lại</span>
                                    <span className="font-bold text-[#2d5c40]">{Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                                </div>
                                <Progress
                                    percent={((challenge.time - timeLeft) / challenge.time) * 100}
                                    showInfo={false}
                                    strokeColor="#8CDCB1"
                                    trailColor="#E6E6FA"
                                    size="small"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Render remaining videos (skipping the 3rd one if we want exactly 9 items total, or just continuing) */}
                    {videos.slice(2).map((video, index) => (
                        <iframe
                            key={index}
                            src={video}
                            width="100%"
                            height="100%"
                            className="aspect-video w-full rounded-lg shadow-md"
                            allow="autoplay"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
