import React, { useEffect, useState } from 'react';
import { Button, Card, Typography, Badge, App } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, CrownFilled, RocketFilled, StarFilled, HeartFilled } from '@ant-design/icons';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../lib/hooks/hooks';

const { Title, Text, Paragraph } = Typography;

const PremiumUpgrade: React.FC = () => {
    const { message } = App.useApp();
    const { user, refreshUser } = useUser();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const isPremiumUser = user?.isPremium && new Date(user.premiumUntil).getTime() > new Date().getTime();
    useEffect(() => {
        console.log(user);
    }, [user]);

    const handleUpgrade = async (plan: string) => {
        if (plan === 'premium') {
            try {
                // Create order first
                const res = await api.post('/transactions/create', { plan: 'premium' });
                if (res.data && res.data.id) {
                    navigate(`/payment?orderId=${res.data.id}`);
                } else {
                    message.error('Không thể tạo đơn hàng. Vui lòng thử lại.');
                }
            } catch (err) {
                console.error(err);
                message.error('Lỗi kết nối đến server.');
            }
            return;
        } else if (plan === 'trial') {
            activateTrial();
            return;
        } else {
            executeUpgrade(plan);
        }
    };

    const activateTrial = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/users/activate-trial');

            // Update user in localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const currentUser = JSON.parse(userStr);
                currentUser.isPremium = true;
                currentUser.premiumUntil = data.user.premiumUntil;
                currentUser.hasUsedTrial = true;
                localStorage.setItem('user', JSON.stringify(currentUser));
                refreshUser();
            }
            message.success(data.message);
            navigate('/');
        } catch (error: any) {
            console.error('Trial activation error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi kích hoạt dùng thử');
        } finally {
            setLoading(false);
        }
    };

    const executeUpgrade = async (plan: string) => {
        setLoading(true);
        try {
            const { data } = await api.post('/users/upgrade', { plan });

            // Update user in localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const currentUser = JSON.parse(userStr);
                currentUser.isPremium = plan === 'premium';
                currentUser.premiumUntil = data.user.premiumUntil;
                localStorage.setItem('user', JSON.stringify(currentUser));
                refreshUser();
            }
            message.success(data.message);
            if (plan === 'premium' && !isPremiumUser) {
                navigate('/');
            } else if (plan === 'basic') {
                navigate('/');
            }
        } catch (error: any) {
            console.error('Upgrade error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi nâng cấp');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            key: '1',
            feature: 'Chatbot AI',
            free: 'Giới hạn câu hỏi',
            premium: 'Phản hồi không giới hạn & Cá nhân hóa',
            icon: <RocketFilled className="text-blue-500" />,
        },
        {
            key: '2',
            feature: 'Thư viện nội dung',
            free: 'Nội dung cơ bản',
            premium: 'Thư viện đầy đủ (Audio, Video, E-book)',
            icon: <StarFilled className="text-amber-500" />,
        },
        {
            key: '3',
            feature: 'Theo dõi cảm xúc',
            free: 'Không hỗ trợ',
            premium: 'Báo cáo & Phân tích tâm trạng hàng tuần',
            icon: <HeartFilled className="text-red-500" />,
        },
        {
            key: '4',
            feature: 'Confessions',
            free: 'Duyệt thông thường',
            premium: 'Ưu tiên hiển thị & Icon đặc quyền',
            icon: <CrownFilled className="text-indigo-500" />,
        },
    ];

    return (
        <div className="min-h-screen bg-[#a8d5ba] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <Badge count={<CrownFilled style={{ color: '#faad14', fontSize: '24px' }} />} offset={[10, 0]}>
                        <Title level={1} className="!mb-4 !text-4xl sm:!text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            Nâng Tầm Trải Nghiệm Cùng Premium
                        </Title>
                    </Badge>
                    <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Đầu tư vào sức khỏe tinh thần là khoản đầu tư xứng đáng nhất.
                        Mở khóa toàn bộ tiềm năng của Stu.Mental Health ngay hôm nay.
                    </Paragraph>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Free Plan */}
                    <Card className="rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent">
                        <div className="text-center p-4">
                            <Text strong className="text-gray-400 uppercase tracking-widest">Gói Cơ Bản</Text>
                            <div className="my-4">
                                <span className="text-4xl font-bold">0đ</span>
                                <span className="text-gray-500 ml-2">/tháng</span>
                            </div>
                            <ul className="text-left space-y-4 my-8">
                                <li className="flex items-center gap-3">
                                    <CheckCircleFilled className="text-green-500" />
                                    <span>Chatbot AI cơ bản</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircleFilled className="text-green-500" />
                                    <span>Đọc Confessions</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-400">
                                    <CloseCircleFilled />
                                    <span>Thư viện chuyên sâu</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-400">
                                    <CloseCircleFilled />
                                    <span>Phân tích cảm xúc</span>
                                </li>
                            </ul>
                            <Button disabled className="w-full h-12 rounded-xl text-lg mt-4">{isPremiumUser ? "Đã bao gồm trong Premium" : "Đang Sử Dụng"}</Button>
                        </div>
                    </Card>

                    {/* Premium Plan */}
                    <Card className="rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-indigo-500 gradient-border relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 rounded-bl-3xl font-bold flex items-center gap-2">
                            PHỔ BIẾN
                        </div>
                        <div className="text-center p-4">
                            <Text strong className="text-indigo-600 uppercase tracking-widest">Premium Đặc Quyền</Text>
                            <div className="my-4">
                                <span className="text-4xl font-bold text-indigo-700">99.000đ</span>
                                <span className="text-gray-500 ml-2">/tháng</span>
                            </div>
                            <ul className="text-left space-y-4 my-8">
                                <li className="flex items-center gap-3 font-semibold text-gray-800">
                                    <CheckCircleFilled className="text-green-500" />
                                    <span>AI phản hồi cá nhân hóa</span>
                                </li>
                                <li className="flex items-center gap-3 font-semibold text-gray-800">
                                    <CheckCircleFilled className="text-green-500" />
                                    <span>Truy cập toàn bộ Thư viện</span>
                                </li>
                                <li className="flex items-center gap-3 font-semibold text-gray-800">
                                    <CheckCircleFilled className="text-green-500" />
                                    <span>Theo dõi cảm xúc nâng cao</span>
                                </li>
                                <li className="flex items-center gap-3 font-semibold text-gray-800">
                                    <CheckCircleFilled className="text-green-500" />
                                    <span>Ưu tiên duyệt Confessions</span>
                                </li>
                            </ul>
                            <Button
                                type="primary"
                                loading={loading}
                                onClick={() => handleUpgrade('premium')}
                                className="w-full h-12 rounded-xl text-lg mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-lg hover:scale-105 transform transition-all"
                            >
                                {isPremiumUser ? "Gia hạn thêm 1 tháng" : "Nâng cấp chỉ 99.000đ/tháng"}
                            </Button>
                            {isPremiumUser && user?.premiumUntil && (
                                <div className="mt-4 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <Text className="text-indigo-600 text-sm font-medium">
                                        Hạn dùng đến: <span className="font-bold">{new Date(user.premiumUntil).toLocaleDateString('vi-VN')}</span>
                                    </Text>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Free Trial Plan - Show only if not used */}
                    {!user?.hasUsedTrial && (
                        <div className="col-span-1 md:col-span-2">
                            <Card className="rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                                <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-6">
                                    <div className="text-left">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Dùng thử miễn phí</span>
                                            <Text strong className="text-indigo-800 text-xl">Trải nghiệm Premium 7 ngày</Text>
                                        </div>
                                        <Paragraph className="text-gray-600 mb-0 max-w-2xl">
                                            Mở khóa toàn bộ tính năng cao cấp trong 7 ngày. Không cần thẻ tín dụng, hủy bất kỳ lúc nào.
                                            Mỗi người chỉ được kích hoạt 1 lần duy nhất.
                                        </Paragraph>
                                    </div>
                                    <Button
                                        onClick={() => handleUpgrade('trial')}
                                        loading={loading}
                                        className="h-12 px-8 rounded-xl text-lg font-semibold bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-md mt-4 md:mt-0 whitespace-nowrap"
                                    >
                                        Kích hoạt ngay
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl shadow-lg p-8 overflow-hidden">
                    <Title level={3} className="text-center mb-8">So sánh chi tiết</Title>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="py-4 px-6 font-bold text-gray-700">Tính năng</th>
                                    <th className="py-4 px-6 font-bold text-gray-400">FREE</th>
                                    <th className="py-4 px-6 font-bold text-indigo-600">PREMIUM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {features.map((f) => (
                                    <tr key={f.key} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors">
                                        <td className="py-6 px-6 flex items-center gap-3">
                                            {f.icon}
                                            <span className="font-medium">{f.feature}</span>
                                        </td>
                                        <td className="py-6 px-6 text-gray-500">{f.free}</td>
                                        <td className="py-6 px-6 font-semibold text-indigo-700">{f.premium}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-12 text-center text-gray-400 px-4">
                    <p>* Gói Premium sẽ được gia hạn tự động mỗi tháng. Bạn có thể hủy bất kỳ lúc nào trong phần cài đặt.</p>
                    <p>* Thanh toán an toàn qua MoMo, ZaloPay và Chuyển khoản ngân hàng.</p>
                </div>
            </div>

            <style>{`
                .gradient-border {
                    background: linear-gradient(#fff, #fff) padding-box,
                                linear-gradient(to right, #6366f1, #a855f7) border-box;
                    border: 2px solid transparent;
                }
            `}</style>
        </div>
    );
};

export default PremiumUpgrade;
