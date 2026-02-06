import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Button, Typography, Slider, Space, Card, Spin, App, Progress } from 'antd';
import {
    PlayCircleFilled,
    PauseCircleFilled,
    StepBackwardOutlined,
    StepForwardOutlined,
    ArrowLeftOutlined,
    SoundOutlined,
    ClockCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import WaveSurfer from 'wavesurfer.js';
import api, { joinChallenge, updateChallengeProgress } from '../lib/api';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function MusicPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { message, modal } = App.useApp();
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);

    // Challenge related states
    const [challenge, setChallenge] = useState<any>(null);
    const [userChallenge, setUserChallenge] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(600); // 10 mins
    const [hasTriggered, setHasTriggered] = useState(false);
    const challengeId = location.state?.challengeId;

    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const fetchChallengeData = async () => {
        if (!challengeId) return;
        try {
            const response = await api.get(`/challenges/${challengeId}`);
            const data = response.data;
            console.log(data);
            setChallenge(data);
            if (data?.userProgress) {
                setUserChallenge(data.userProgress);
                setTimeLeft(data.time || 900);

                // Check if already completed today
                if (data.userProgress.lastUpdated) {
                    const today = new Date().setHours(0, 0, 0, 0);
                    const lastUpdated = new Date(data.userProgress.lastUpdated).setHours(0, 0, 0, 0);

                    if (today === lastUpdated) {
                        setHasTriggered(true);
                        setTimeLeft(0);
                    }
                }
            } else if (data) {
                setTimeLeft(data.time || 900);
            }
            if (!data?.userProgress) {
                await joinChallenge(challengeId);
            }
        } catch (error) {
            console.error('Failed to fetch challenge in player:', error);
        }
    };

    const handleChallengeUpdate = async () => {
        if (!challengeId) return;
        try {
            await updateChallengeProgress(challengeId);
            fetchChallengeData();
        } catch (error: any) {
            console.error('Update progress error in player:', error);
        }
    };

    useEffect(() => {
        console.log("fetch challenge data", challengeId);
        if (challengeId) fetchChallengeData();
    }, [challengeId]);

    useEffect(() => {
        if (!challengeId || hasTriggered) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [challengeId, hasTriggered]);

    useEffect(() => {
        if (challengeId && timeLeft === 0 && !hasTriggered && challenge) {
            setHasTriggered(true);
            console.log("update progress");
            handleChallengeUpdate();
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
        }
    }, [timeLeft, challengeId, hasTriggered, challenge]);

    useEffect(() => {
        const fetchTrack = async () => {
            try {
                const { data } = await api.get(`/content/${id}`);
                setContent(data);
                setLoading(false);
            } catch (error: any) {
                message.error(error.response?.data?.message || "Không thể tải bản nhạc này");
                navigate('/library');
            }
        };

        if (id) fetchTrack();
    }, [id]);

    useEffect(() => {
        if (!loading && content && waveformRef.current) {
            // Initialize WaveSurfer
            wavesurferRef.current = WaveSurfer.create({
                container: waveformRef.current,
                barWidth: 2,
                barRadius: 3,
                height: 60,
                autoCenter: true,
                normalize: true,
            });

            // Load audio
            wavesurferRef.current.load(content.contentUrl);

            // Events
            wavesurferRef.current.on('ready', () => {
                setDuration(wavesurferRef.current?.getDuration() || 0);
            });

            wavesurferRef.current.on('audioprocess', () => {
                setCurrentTime(wavesurferRef.current?.getCurrentTime() || 0);
            });

            wavesurferRef.current.on('play', () => setIsPlaying(true));
            wavesurferRef.current.on('pause', () => setIsPlaying(false));
            wavesurferRef.current.on('finish', () => setIsPlaying(false));

            // Set initial volume
            wavesurferRef.current.setVolume(volume);

            return () => {
                wavesurferRef.current?.destroy();
            };
        }
    }, [loading, content]);

    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.setVolume(volume);
        }
    }, [volume]);

    const togglePlay = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause();
        }
    };

    const handleVolumeChange = (value: number) => {
        setVolume(value);
    };

    const formatTime = (time: number) => {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-900">
            <Spin size="large" tip="Đang tải giai điệu..." />
        </div>
    );

    return (
        <Layout className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-4 md:p-8">
            <Content className="w-full max-w-6xl mx-auto flex flex-col">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined className="text-white" />}
                    onClick={() => navigate('/library')}
                    className="mb-8 self-start text-white hover:text-indigo-200 flex items-center gap-2"
                >
                    Quay lại thư viện
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left/Main Content: Music Player */}
                    <div className={`${challengeId && challenge ? 'lg:col-span-8' : 'lg:col-span-12'} flex justify-center transition-all duration-300`}>
                        <Card
                            className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-[2.5rem] overflow-hidden w-full max-w-2xl"
                            bodyStyle={{ padding: '3rem' }}
                        >
                            <div className="flex flex-col items-center">
                                {/* Thumbnail or Icon */}
                                <div className="w-64 h-64 md:w-80 md:h-80 mb-10 relative group">
                                    {content.thumbnail ? (
                                        <div className={`w-full h-full p-2 rounded-full border-2 border-white/20 relative ${isPlaying ? 'animate-[spin_20s_linear_infinite]' : ''}`}>
                                            <img
                                                src={content.thumbnail}
                                                alt={content.title}
                                                className="w-full h-full object-cover rounded-full shadow-2xl"
                                            />
                                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/40 flex items-center justify-center">
                                                    <div className="w-4 h-4 bg-indigo-900 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-indigo-500/30 rounded-full flex items-center justify-center">
                                            <SoundOutlined className="text-8xl text-white/50" />
                                        </div>
                                    )}
                                </div>

                                {/* Title & Info */}
                                <div className="text-center mb-10">
                                    <Title level={2} className="!text-white !mb-2 !font-bold">{content.title}</Title>
                                    <Text className="text-white/60 text-lg">{content.type === 'MUSIC' ? 'Nhạc thư giãn' : 'Audio dẫn thiền'}</Text>
                                </div>

                                {/* Waveform Container */}
                                <div className="w-full mb-4">
                                    <div ref={waveformRef} className="cursor-pointer" />
                                    <div className="flex justify-between mt-3 px-1">
                                        <Text className="text-white/40 text-sm font-medium">{formatTime(currentTime)}</Text>
                                        <Text className="text-white/40 text-sm font-medium">{formatTime(duration)}</Text>
                                    </div>
                                </div>

                                {/* Controls */}
                                <Space size={48} className="mb-10 mt-6 flex items-center">
                                    <Button type="text" icon={<StepBackwardOutlined className="text-3xl text-white/80 hover:text-white transition-colors" />} />
                                    <Button
                                        type="text"
                                        icon={isPlaying ? <PauseCircleFilled className="text-8xl text-white hover:scale-105 transition-transform" /> : <PlayCircleFilled className="text-8xl text-white hover:scale-105 transition-transform" />}
                                        onClick={togglePlay}
                                        className="h-auto p-0 flex items-center justify-center"
                                    />
                                    <Button type="text" icon={<StepForwardOutlined className="text-3xl text-white/80 hover:text-white transition-colors" />} />
                                </Space>

                                {/* Volume */}
                                <div className="w-64 flex items-center gap-4 bg-white/5 p-3 rounded-2xl px-5">
                                    <SoundOutlined className="text-white/60 text-lg" />
                                    <Slider
                                        value={volume}
                                        max={1}
                                        step={0.01}
                                        onChange={handleVolumeChange}
                                        className="flex-1 m-0"
                                        tooltip={{ formatter: null }}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/*Right Sidebar: Challenge Progress*/}
                    {challengeId && challenge && (<>
                        <div className="lg:col-span-4 bg-white rounded-3xl p-4 shadow-xl w-full flex flex-col justify-between">
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
                    </>
                    )}
                </div>

                {content.summary && (
                    <div className="mt-12 bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 max-w-4xl">
                        <Title level={4} className="!text-white !mb-4 flex items-center gap-3">
                            <SoundOutlined className="text-indigo-300" />
                            Giới thiệu
                        </Title>
                        <Paragraph className="text-white/70 text-lg leading-relaxed !mb-0">{content.summary}</Paragraph>
                    </div>
                )}
            </Content>

            <style dangerouslySetInnerHTML={{
                __html: `
                waveform wave { overflow: visible !important; }
                .ant-slider-rail { background-color: rgba(255,255,255,0.1) !important; }
                .ant-slider-track { background-color: white !important; }
                .ant-slider-handle::after { background-color: white !important; box-shadow: 0 0 10px rgba(0,0,0,0.3) !important; }
            `}} />
        </Layout>
    );
}
