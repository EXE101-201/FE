import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout, Typography, Spin, Tag, Button, Breadcrumb, Divider } from "antd";
import { ArrowLeftOutlined, ClockCircleOutlined, TagOutlined } from "@ant-design/icons";
import api from "../lib/api";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Section {
    title: string;
    description: {
        content: string;
        subcontent: string[];
    };
}

interface ArticleData {
    title: string;
    thumbnail: string;
    content: {
        intro: string;
        sections: Section[];
        conclusion: string;
    };
    tags: string[];
    createdAt: string;
}

export default function ArticleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState<ArticleData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        const fetchArticle = async () => {
            try {
                const { data } = await api.get(`/articles/${id}`);
                setArticle(data);
            } catch (error) {
                console.error("Failed to fetch article", error);
            } finally {
                setLoading(false);
            }
        };
        console.log(id);
        fetchArticle();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" tip="Đang tải bài viết..." />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="text-center p-10">
                <Title level={3}>Không tìm thấy bài viết</Title>
                <Button type="primary" onClick={() => navigate('/library')}>Quay lại thư viện</Button>
            </div>
        );
    }

    return (
        <Layout className="bg-white min-h-screen">
            <Content className="max-w-4xl mx-auto px-4 py-8">
                <Breadcrumb className="mb-6">
                    <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
                    <Breadcrumb.Item href="/library">Thư viện</Breadcrumb.Item>
                    <Breadcrumb.Item>Bài viết</Breadcrumb.Item>
                </Breadcrumb>

                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    Quay lại
                </Button>

                <div className="article-header mb-10 text-center">
                    <Title className="!text-3xl md:!text-4xl mb-6">{article.title}</Title>

                    <div className="flex justify-center items-center gap-6 text-gray-500 mb-8">
                        <span className="flex items-center gap-1">
                            <ClockCircleOutlined /> {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <div className="flex items-center gap-2">
                            <TagOutlined />
                            {article.tags.map(tag => (
                                <Tag color="blue" key={tag}>{tag}</Tag>
                            ))}
                        </div>
                    </div>

                    {article.thumbnail && (
                        <div className="rounded-2xl overflow-hidden shadow-xl mb-10 w-full h-[400px]">
                            <img
                                src={article.thumbnail}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>

                <div className="article-body">
                    <Paragraph className="text-lg leading-relaxed text-gray-700 italic border-l-4 border-blue-500 pl-4 mb-8">
                        {article.content.intro}
                    </Paragraph>

                    {article.content.sections.map((section, index) => (
                        <div key={index} className="mb-10">
                            <Title level={3} className="text-blue-600 mb-4">{section.title}</Title>
                            <Paragraph className="text-lg leading-relaxed text-gray-800">
                                {section.description.content}
                            </Paragraph>
                            {section.description.subcontent && section.description.subcontent.length > 0 && (
                                <ul className="list-disc pl-6 space-y-2">
                                    {section.description.subcontent.map((sub, sIndex) => (
                                        <li key={sIndex} className="text-lg text-gray-700">{sub}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}

                    <Divider />

                    <div className="article-conclusion mt-8 p-6 bg-blue-50 rounded-xl">
                        <Title level={4} className="!mb-4">Tổng kết</Title>
                        <Paragraph className="text-lg leading-relaxed text-gray-800 mb-0">
                            {article.content.conclusion}
                        </Paragraph>
                    </div>
                </div>
            </Content>

            <style>{`
                .article-body h3 {
                    margin-top: 2rem;
                }
                .article-body p {
                    margin-bottom: 1.5rem;
                }
            `}</style>
        </Layout>
    );
}
