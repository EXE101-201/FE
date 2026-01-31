import { useState, useEffect } from "react";
import { Tabs, Card, List, Badge, Button, Modal, Layout, Typography } from "antd";
import { LockOutlined, PlayCircleOutlined, ReadOutlined, SoundOutlined, HeartOutlined } from "@ant-design/icons";
import api from "../lib/api";
import { useUser } from "../lib/hooks/hooks";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function ContentLibrary() {
    const { user } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [articles, setArticles] = useState([]);
    const [music, setMusic] = useState([]);
    const [meditation, setMeditation] = useState([]);
    const navigate = useNavigate();

    const isPremiumUser = user?.isPremium && new Date(user.premiumUntil).getTime() > new Date().getTime();

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const contentRes = await api.get('/content')

            // For now, let's use the rich articles from the Page model as our primary articles
            // or combine them. Let's see what's better.
            // If the user said "model article", they likely mean the Page model.
            setArticles(contentRes.data.filter((item: any) => item.type === 'ARTICLE'));

            setMusic(contentRes.data.filter((item: any) => item.type === 'MUSIC'));
            setMeditation(contentRes.data.filter((item: any) => item.type === 'MEDITATION'));
        } catch (error) {
            console.error("Failed to fetch content", error);
        }
    };

    const handleAccess = (item: any) => {
        console.log(item);
        if (item.isPremium && !isPremiumUser) {
            setIsModalOpen(true);
        } else {
            if (item.type === 'ARTICLE') {
                navigate(`/articles/${item.idArticle}`);
            } else {
                navigate(`/library/play/${item._id}`);
            }
        }
    };

    const renderItem = (item: any, type: 'article' | 'audio') => {
        const Icon = type === 'article' ? ReadOutlined : (type === 'audio' ? PlayCircleOutlined : SoundOutlined);
        const description = type === 'article'
            ? (item.summary || (item.content?.intro?.substring(0, 100) + '...'))
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
        <Layout className="min-h-screen bg-gray-50">
            <Content className="p-4 md:p-8 max-w-5xl mx-auto w-full">
                <div className="text-center mb-8">
                    <Title level={2} className="!text-green-700">Thư viện Chăm sóc Tinh thần</Title>
                    <Paragraph type="secondary" className="text-lg">
                        Nguồn tài nguyên giúp bạn thư giãn, giảm căng thẳng và học tập hiệu quả.
                    </Paragraph>
                </div>

                <Tabs
                    defaultActiveKey="1"
                    type="card"
                    size="large"
                    items={[
                        {
                            key: '1',
                            label: (<span><ReadOutlined /> Bài viết ngắn</span>),
                            children: (
                                <List
                                    grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
                                    dataSource={articles}
                                    renderItem={(item) => renderItem(item, 'article')}
                                />
                            ),
                        },
                        {
                            key: '2',
                            label: (<span><SoundOutlined /> Nhạc thư giãn</span>),
                            children: (
                                <List
                                    grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
                                    dataSource={music}
                                    renderItem={(item) => renderItem(item, 'audio')}
                                />
                            ),
                        },
                        {
                            key: '3',
                            label: (<span><HeartOutlined /> Audio thiền</span>),
                            children: (
                                <List
                                    grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
                                    dataSource={meditation}
                                    renderItem={(item) => renderItem(item, 'audio')}
                                />
                            ),
                        },
                    ]}
                />

                <Modal
                    title="Nâng cấp lên Premium"
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={[
                        <Button key="back" onClick={() => setIsModalOpen(false)}>
                            Để sau
                        </Button>,
                        <Button key="submit" type="primary" onClick={() => navigate('/premium')}>
                            Nâng cấp ngay
                        </Button>,
                    ]}
                >
                    <div className="text-center py-4">
                        <LockOutlined className="text-4xl text-amber-500 mb-4" />
                        <Title level={4}>Mở khóa toàn bộ nội dung</Title>
                        <Paragraph>
                            Trở thành thành viên Premium để truy cập không giới hạn tất cả bài viết, nhạc thư giãn và bài thiền chuyên sâu.
                        </Paragraph>
                    </div>
                </Modal>

            </Content>
        </Layout>
    );
}
