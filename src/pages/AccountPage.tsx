import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Avatar } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined, CrownFilled, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../lib/api';
import { useUser } from '../lib/hooks/hooks';

const { Title, Text, Paragraph } = Typography;

const AccountPage: React.FC = () => {
    const { user, refreshUser } = useUser();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullName: user.fullName,
                email: user.email,
                anonymousName: user.anonymous?.name,
                anonymousId: user.anonymous?.id,
            });
        }
    }, [user, form]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const { data } = await api.put('/users/profile', values);
            message.success(data.message);
            localStorage.setItem('user', JSON.stringify(data.user));
            refreshUser();
        } catch (error: any) {
            console.error('Update profile error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>;

    return (
        <div className="min-h-screen bg-[#f0f2f5] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Card className="rounded-3xl shadow-xl overflow-hidden border-none">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 h-32 relative">
                        <div className="absolute -bottom-12 left-8">
                            <Avatar
                                size={100}
                                icon={<UserOutlined />}
                                src="/background-homePage.png"
                                className="border-4 border-white shadow-lg"
                            />
                            {user.isPremium && (
                                <CrownFilled className="absolute bottom-0 right-0 text-amber-500 text-2xl bg-white rounded-full p-1" />
                            )}
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <Title level={2} className="!mb-1">{user.fullName}</Title>
                                <Text type="secondary" className="flex items-center gap-2">
                                    <MailOutlined /> {user.email}
                                </Text>
                            </div>
                            {user.isPremium ? (
                                <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm">
                                    <CrownFilled /> PREMIUM
                                </div>
                            ) : (
                                <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                                    MEMBER
                                </div>
                            )}
                        </div>

                        <Divider />

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            requiredMark={false}
                        >
                            <Title level={4} className="!mb-6">Thông tin cá nhân</Title>

                            <Form.Item
                                label="Họ và tên"
                                name="fullName"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                            >
                                <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Nhập họ và tên" className="h-11 rounded-lg" />
                            </Form.Item>

                            <Form.Item
                                label="Email (Không thể thay đổi)"
                                name="email"
                            >
                                <Input prefix={<MailOutlined className="text-gray-400" />} disabled className="h-11 rounded-lg" />
                            </Form.Item>

                            <Divider />

                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <Title level={4} className="!mb-1">Chế độ ẩn danh</Title>
                                    <Paragraph type="secondary">
                                        Sử dụng thông tin này khi tham gia cộng đồng Confession để bảo vệ quyền riêng tư.
                                    </Paragraph>
                                </div>
                                <SafetyCertificateOutlined className="text-3xl text-indigo-500" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item
                                    label="Tên ẩn danh"
                                    name="anonymousName"
                                >
                                    <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Ví dụ: Người lạ 123" className="h-11 rounded-lg" />
                                </Form.Item>

                                <Form.Item
                                    label="ID ẩn danh (Tự sinh)"
                                    name="anonymousId"
                                >
                                    <Input prefix={<IdcardOutlined className="text-gray-400" />} disabled className="h-11 rounded-lg bg-gray-50" />
                                </Form.Item>
                            </div>

                            <Form.Item className="mt-8">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="h-12 px-8 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 border-none shadow-lg hover:scale-105 transform transition-all text-lg font-semibold"
                                >
                                    Lưu thay đổi
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AccountPage;
