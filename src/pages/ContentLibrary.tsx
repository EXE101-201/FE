import { useState, useEffect } from "react";
import { Badge, Button, Card, List, Modal, Spin } from "antd";
import { LockOutlined, PlayCircleOutlined, ReadOutlined, SoundOutlined, HeartOutlined, StarOutlined } from "@ant-design/icons";
import api from "../lib/api";
import { useUser } from "../lib/hooks/hooks";
import { useNavigate } from "react-router-dom";


export default function ContentLibrary() {
    const { user } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [articles, setArticles] = useState<any[]>([]);
    const [music, setMusic] = useState<any[]>([]);
    const [meditation, setMeditation] = useState<any[]>([]);
    const [otherContent, setOtherContent] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('articles');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const isPremiumUser = user?.isPremium && new Date(user.premiumUntil).getTime() > new Date().getTime();

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const contentRes = await api.get('/content');
            setArticles(contentRes.data.filter((item: any) => item.type === 'ARTICLE'));
            setMusic(contentRes.data.filter((item: any) => item.type === 'MUSIC'));
            setMeditation(contentRes.data.filter((item: any) => item.type === 'MEDITATION'));
        } catch (error) {
            console.error("Failed to fetch content", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccess = (item: any) => {
        if (item.isPremium && !isPremiumUser) {
            setIsModalOpen(true);
        } else {
            if (item.type === 'ARTICLE') {
                navigate(`/articles/${item.idArticle || item._id}`);
            } else {
                navigate(`/library/play/${item._id}`);
            }
        }
    };

    // Helper to get displayed content based on tab
    const getActiveContent = () => {
        switch (activeTab) {
            case 'articles': return articles;
            case 'music': return music;
            case 'meditation': return meditation;
            default: return [];
        }
    };

    // Find a featured item (e.g., the first premium one or just the first one)
    const featuredItem = articles.find(a => a.isPremium) || articles[0] || music[0];

    const renderCard = (item: any) => {
        const type = item.type === 'ARTICLE' ? 'article' : (item.type === 'MUSIC' ? 'music' : 'meditation');
        const Icon = type === 'article' ? ReadOutlined : (type === 'music' ? PlayCircleOutlined : SoundOutlined);
        const description = type === 'article'
            ? (item.summary || (item.content?.intro?.substring(0, 60) + '...'))
            : `Thời lượng: ${item.duration}`;

        return (
            <List.Item>
                {item.isPremium ? (
                    <Badge.Ribbon text="Premium" color="gold">
                        <Card
                            hoverable
                            onClick={() => handleAccess(item)}
                            className={`w-full overflow-hidden ${item.isPremium && !isPremiumUser ? 'opacity-75' : ''}`}
                            cover={item.thumbnail && <div className="h-40 overflow-hidden"><img alt={item.title} src={item.thumbnail} className="w-full h-full object-cover" /></div>}
                        >
                            <List.Item.Meta
                                avatar={!item.thumbnail && <Icon className="text-2xl text-blue-500" />}
                                title={<span className="font-semibold">{item.title}</span>}
                                description={
                                    <div>
                                        {description}
                                        {item.isPremium && !isPremiumUser && (
                                            <div className="flex items-center text-amber-600 mt-1">
                                                <LockOutlined className="mr-1" /> Cần nâng cấp Premium
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        </Card>
                    </Badge.Ribbon>
                ) : (
                    <Card
                        hoverable
                        onClick={() => handleAccess(item)}
                        className="w-full overflow-hidden"
                        cover={item.thumbnail && <div className="h-40 overflow-hidden"><img alt={item.title} src={item.thumbnail} className="w-full h-full object-cover" /></div>}
                    >
                        <List.Item.Meta
                            avatar={!item.thumbnail && <Icon className="text-2xl text-green-500" />}
                            title={<span className="font-semibold">{item.title}</span>}
                            description={description}
                        />
                    </Card>
                )}
            </List.Item>
        );
    };

    return (
        <div className="min-h-screen bg-[#EEF2F6] font-sans w-full">
            <div>
                {/* Header */}
                <div className="mb-10 text-center md:text-left bg-[#a8d5ba] p-4 md:p-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-2 tracking-tight">
                        Thư viện Chăm Sóc Tinh Thần
                    </h1>
                    <p className="text-gray-500 text-lg font-light">
                        Nơi chia sẻ kiến thức, lắng nghe và chữa lành tâm hồn của bạn.
                    </p>
                </div>

                {loading ? (
                    <div className="h-64 flex justify-center items-center">
                        <Spin size="large" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-8">
                        {/* Left Column - Featured */}
                        <div className="lg:col-span-3 h-fit">
                            <div className="bg-white rounded-3xl p-6 shadow-lg h-full border border-gray-100 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-6 text-gray-700 font-semibold">
                                    <StarOutlined className="text-yellow-500" />
                                    <span>Nổi bật</span>
                                </div>

                                {featuredItem ? (
                                    <div className="flex flex-col h-full gap-4 cursor-pointer" onClick={() => handleAccess(featuredItem)}>
                                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100 mb-2 group">
                                            {featuredItem.thumbnail ? (
                                                <img
                                                    src={featuredItem.thumbnail}
                                                    alt={featuredItem.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-400">
                                                    <ReadOutlined className="text-6xl" />
                                                </div>
                                            )}
                                            {featuredItem.isPremium && (
                                                <span className="absolute bottom-3 right-3 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                    Premium
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">
                                                {featuredItem.title}
                                            </h2>
                                            <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                                                {featuredItem.summary || featuredItem.content?.intro || "Khám phá nội dung đặc biệt này để tìm thấy sự bình yên và cân bằng trong cuộc sống."}
                                            </p>

                                            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mt-auto pt-4">
                                                {featuredItem.isPremium && !isPremiumUser ? (
                                                    <span className="flex items-center gap-1 text-amber-600"><LockOutlined /> Mở khóa Premium</span>
                                                ) : (
                                                    <span>Xem ngay &rarr;</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-center py-10">Chưa có nội dung nổi bật</div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Tabs & Grid */}
                        <div className="lg:col-span-6">
                            {/* Tabs */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <button
                                    onClick={() => setActiveTab('articles')}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'articles'
                                        ? 'bg-blue-400 text-white! shadow-md shadow-blue-200'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    <ReadOutlined /> Bài viết ngắn
                                </button>
                                <button
                                    onClick={() => setActiveTab('music')}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'music'
                                        ? 'bg-blue-400 text-white! shadow-md shadow-blue-200'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    <SoundOutlined /> Nhạc thư giãn
                                </button>
                                <button
                                    onClick={() => setActiveTab('meditation')}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'meditation'
                                        ? 'bg-blue-400 text-white! shadow-md shadow-blue-200'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    <HeartOutlined /> Audio thiền
                                </button>
                            </div>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {getActiveContent().length > 0 ? (
                                    getActiveContent().map(item => renderCard(item))
                                ) : (
                                    <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                        Không có nội dung nào trong mục này.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="lg:col-span-3">
                            <button
                                className="px-5 py-2 rounded-full text-sm font-medium bg-white text-gray-400 border border-gray-200 cursor-not-allowed hidden md:block"
                            >
                                Danh mục khác
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {otherContent.length > 0 ? (
                                    otherContent.map(item => renderCard(item))
                                ) : (
                                    <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                        Không có nội dung nào trong mục này.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <Modal
                    title={null}
                    open={isModalOpen}
                    footer={null}
                    onCancel={() => setIsModalOpen(false)}
                    centered
                    width={400}
                    className="rounded-2xl overflow-hidden"
                >
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LockOutlined className="text-3xl text-amber-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Nội dung Premium</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Nâng cấp tài khoản để truy cập không giới hạn kho nội dung độc quyền của chúng tôi.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button type="primary" size="large" onClick={() => navigate('/premium')} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 border-none h-12 rounded-xl text-base font-semibold shadow-lg shadow-amber-200">
                                Nâng cấp ngay
                            </Button>
                            <Button type="text" onClick={() => setIsModalOpen(false)} className="text-gray-500">
                                Để sau
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
