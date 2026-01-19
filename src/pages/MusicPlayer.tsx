import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Button, Typography, Slider, Space, Card, Spin, App } from 'antd';
import {
    PlayCircleFilled,
    PauseCircleFilled,
    StepBackwardOutlined,
    StepForwardOutlined,
    ArrowLeftOutlined,
    SoundOutlined
} from '@ant-design/icons';
import WaveSurfer from 'wavesurfer.js';
import api from '../lib/api';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function MusicPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);

    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);

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
        <Layout className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center p-4">
            <Content className="w-full max-w-md">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined className="text-white" />}
                    onClick={() => navigate('/library')}
                    className="mb-4 text-white hover:text-indigo-200"
                >
                    Quay lại thư viện
                </Button>

                <Card
                    className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl overflow-hidden"
                    bodyStyle={{ padding: '2rem' }}
                >
                    <div className="flex flex-col items-center">
                        {/* Thumbnail or Icon */}
                        <div className="w-64 h-64 mb-8 relative group">
                            {content.thumbnail ? (
                                <img
                                    src={content.thumbnail}
                                    alt={content.title}
                                    className={`w-full h-full object-cover rounded-2xl shadow-xl transition-transform duration-1000 ${isPlaying ? 'rotate-[360deg] animate-[spin_10s_linear_infinite]' : ''}`}
                                />
                            ) : (
                                <div className="w-full h-full bg-indigo-500/30 rounded-2xl flex items-center justify-center">
                                    <SoundOutlined className="text-8xl text-white/50" />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                <Button
                                    type="text"
                                    icon={isPlaying ? <PauseCircleFilled className="text-6xl text-white" /> : <PlayCircleFilled className="text-6xl text-white" />}
                                    onClick={togglePlay}
                                />
                            </div>
                        </div>

                        {/* Title & Info */}
                        <div className="text-center mb-8">
                            <Title level={3} className="!text-white !mb-1">{content.title}</Title>
                            <Text className="text-white/60">{content.type === 'MUSIC' ? 'Nhạc thư giãn' : 'Audio dẫn thiền'}</Text>
                        </div>

                        {/* Waveform Container */}
                        <div className="w-full mb-2">
                            <div ref={waveformRef} className="cursor-pointer" />
                            <div className="flex justify-between mt-2">
                                <Text className="text-white/40 text-xs">{formatTime(currentTime)}</Text>
                                <Text className="text-white/40 text-xs">{formatTime(duration)}</Text>
                            </div>
                        </div>

                        {/* Controls */}
                        <Space size={32} className="mb-8 mt-4">
                            <Button type="text" icon={<StepBackwardOutlined className="text-2xl text-white/80" />} />
                            <Button
                                type="text"
                                icon={isPlaying ? <PauseCircleFilled className="text-7xl text-white" /> : <PlayCircleFilled className="text-7xl text-white" />}
                                onClick={togglePlay}
                                className="flex items-center justify-center"
                            />
                            <Button type="text" icon={<StepForwardOutlined className="text-2xl text-white/80" />} />
                        </Space>

                        {/* Volume */}
                        <div className="w-full flex items-center gap-3">
                            <SoundOutlined className="text-white/60" />
                            <Slider
                                value={volume}
                                max={1}
                                step={0.01}
                                onChange={handleVolumeChange}
                                className="flex-1"
                                tooltip={{ formatter: null }}
                            />
                        </div>
                    </div>
                </Card>

                {content.summary && (
                    <div className="mt-8 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                        <Text strong className="text-white block mb-2">Giới thiệu</Text>
                        <Paragraph className="text-white/70 !mb-0">{content.summary}</Paragraph>
                    </div>
                )}
            </Content>

            <style dangerouslySetInnerHTML={{
                __html: `
                waveform wave { overflow: visible !important; }
            `}} />
        </Layout>
    );
}
