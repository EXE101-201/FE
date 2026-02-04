import { useState, useEffect } from 'react';
import { PlayCircleOutlined, ClockCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Progress, Button, Typography } from "antd";

const { Title } = Typography;

export default function ChallengeDetail({ type }: { type?: number }) {
    // 15 minutes in seconds
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Mock data for videos
    const videos = Array(8).fill(null).map((_, i) => ({
        id: i,
        thumbnail: `https://drive.google.com/file/d/1IEB-eqGTV3Au0Ow2SwI4Slp-od02_FH7/preview`,
        duration: "15:00"
    }));

    const cards = [
        {
            id: 1,
            title: null,
            image: "https://cdn-icons-png.flaticon.com/512/2927/2927347.png",
            bgColor: "#E6E6FA",
            content: (
                <p className="text-gray-600 text-sm leading-relaxed text-justify">
                    Ngủ sớm không chỉ là một thói quen "tốt", mà là cách tự nhiên và hiệu quả nhất để cơ thể phục hồi và tái tạo năng lượng. Trong khoảng 22h-2h, cơ thể bước vào giai đoạn nghỉ ngơi sâu...
                </p>
            )
        },
        {
            id: 2,
            title: "Tác hại của việc ngủ muộn",
            image: "https://cdn-icons-png.flaticon.com/512/4826/4826315.png",
            bgColor: "#E0F2F1",
            content: (
                <ul className="space-y-1.5 text-xs text-gray-600">
                    <li>😵 Mệt mỏi, kém tập trung: não không được nghỉ đủ</li>
                    <li>🤯 Dễ cáu gắt, stress: hormone cảm xúc mất cân bằng</li>
                    <li>🧠 Giảm trí nhớ & sáng tạo: não không kịp "dọn rác"</li>
                    <li>🩺 Ảnh hưởng sức khỏe lâu dài: nguy cơ béo phì, tim mạch</li>
                    <li>😴 Rối loạn đồng hồ sinh học</li>
                </ul>
            )
        },
        {
            id: 3,
            title: "Ngủ sớm & cảm xúc",
            image: "https://cdn-icons-png.flaticon.com/512/3670/3670150.png",
            bgColor: "#E8EAF6",
            content: (
                <ul className="space-y-1.5 text-xs text-gray-600">
                    <li>🧠 Ngủ đủ giúp não điều hòa cảm xúc tốt hơn</li>
                    <li>🍃 "Xoa dịu" những cảm xúc tiêu cực tích tụ</li>
                    <li>😤 Ít cáu gắt, ít overthinking</li>
                    <li>😊 Dễ giữ tâm trạng tích cực suốt cả ngày</li>
                </ul>
            )
        },
        {
            id: 4,
            title: "Lợi ích của việc ngủ sớm",
            image: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png",
            bgColor: "#F3E5F5",
            content: (
                <ul className="space-y-1 text-xs text-gray-600">
                    <li>✨ Tỉnh táo & tràn năng lượng</li>
                    <li>🧠 Tập trung tốt hơn, học nhanh hơn</li>
                    <li>😊 Tinh thần ổn định, ít stress</li>
                    <li>💪 Tăng sức đề kháng & phục hồi</li>
                </ul>
            )
        }
    ];

    // Force rendering the new layout for now as per user's debug state
    if (type === 2) {
        return (
            <div className="min-h-screen bg-[#A8D5BA] p-6 font-sans relative flex flex-col items-center">
                {/* Header */}
                <div className="text-center mb-10 w-full">
                    <Title level={2} className="!text-[#2d5c40] !mb-0 font-medium tracking-wide">
                        Thử thách nhỏ - tạo thói quen "lớn"
                    </Title>
                </div>

                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Grid Content (2x2) */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                style={{ backgroundColor: card.bgColor }}
                                className="rounded-3xl p-6 shadow-md flex items-center relative overflow-hidden h-full"
                            >
                                <div className="w-1/3 flex-shrink-0 z-10 flex justify-center items-center h-full">
                                    <img src={card.image} alt="Icon" className="w-full h-auto max-h-32 object-contain" />
                                </div>
                                <div className="w-2/3 pl-4 z-10">
                                    {card.title && <h4 className="font-semibold text-gray-700 mb-2">{card.title}</h4>}
                                    {card.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Sidebar: Challenge Progress */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-xl w-full h-full flex flex-col">
                            <div className="text-center mb-4">
                                <h3 className="font-semibold text-gray-700">Thử thách</h3>
                            </div>

                            <div className="bg-[#E8EAF6] rounded-2xl p-6 mb-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-xl">Ngủ sớm 7 ngày</h4>
                                        <p className="text-xs text-green-600 font-medium">Nên ngủ trước 11h</p>
                                    </div>
                                    <div className="w-12 h-12">
                                        <img src="https://cdn-icons-png.flaticon.com/512/2927/2927347.png" alt="Sleep Icon" className="w-full h-full object-contain" />
                                    </div>
                                </div>

                                <div className="mt-4 relative z-10">
                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                        <span>2/7 ngày</span>
                                        <span className="text-blue-500 cursor-pointer">Tiếp tục</span>
                                    </div>
                                    <Progress
                                        percent={(2 / 7) * 100}
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
                                    className="!bg-[#88D3A8] !text-white !font-bold !rounded-full !px-8 !h-12 !border-none shadow-lg hover:!shadow-xl hover:!scale-105 transition-all w-full"
                                >
                                    Hoàn Thành
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                    {videos.slice(0, 2).map((video) => (
                        <iframe
                            key={video.id}
                            src={video.thumbnail}
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
                                    <h4 className="font-bold text-gray-800 text-base">Tập thể dục 15p</h4>
                                    <p className="text-[10px] text-gray-500">Cùng vươn vai nào</p>
                                </div>
                                <div className="bg-blue-100 p-1.5 rounded-full">
                                    <UserOutlined className="text-blue-500 text-lg" />
                                </div>
                            </div>

                            <div className="mt-2 relative z-10">
                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                    <span>2/7 ngày</span>
                                </div>
                                <Progress
                                    percent={(2 / 7) * 100}
                                    showInfo={false}
                                    strokeColor="#8CDCB1"
                                    trailColor="#ffffff"
                                    size="small"
                                />
                                <div className="mt-2 text-right">
                                    <Button type="text" size="small" className="text-gray-400 hover:text-gray-600 text-xs">Tiếp tục</Button>
                                </div>
                            </div>

                            {/* Decorative background shape */}
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-50 rounded-full opacity-50 z-0"></div>
                        </div>

                        {/* Process Section */}
                        <div className="text-center">
                            <h3 className="font-semibold text-gray-700 mb-1 text-sm">Quá trình</h3>
                            {/* <div className="bg-gray-50 rounded-xl p-2 inline-flex items-center gap-2 text-gray-600 text-xs">
                                <ClockCircleOutlined />
                                <span className="font-medium">Đồng hồ đếm ngược 15p</span>
                            </div> */}
                            <div className="bg-gray-50 rounded-xl p-3 w-full">
                                <div className="flex justify-between items-center mb-1 text-xs text-gray-600">
                                    <span className="flex items-center gap-1"><ClockCircleOutlined /> Thời gian còn lại</span>
                                    <span className="font-bold text-[#2d5c40]">{Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                                </div>
                                <Progress
                                    percent={((900 - timeLeft) / 900) * 100}
                                    showInfo={false}
                                    strokeColor="#8CDCB1"
                                    trailColor="#E6E6FA"
                                    size="small"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Render remaining videos (skipping the 3rd one if we want exactly 9 items total, or just continuing) */}
                    {videos.slice(2).map((video) => (
                        <iframe
                            key={video.id}
                            src={video.thumbnail}
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
