import { useState } from "react";
import { Form, Input, Button, Typography, App } from "antd";
import api from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { SmileOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgot-password', values);
            message.info(data.message);
            navigate("/login");
        } catch (error: any) {
            if (error.response?.status === 400) {
                message.error(error.response?.data?.message);
            }
            else {
                const msg = error.response?.data?.message || 'Gửi yêu cầu thất bại';
                message.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
                <div className="mb-4">
                    <Link to="/login" className="text-gray-500 hover:text-green-600 flex items-center gap-1">
                        <ArrowLeftOutlined /> Quay lại đăng nhập
                    </Link>
                </div>
                <div className="text-center mb-6">
                    <SmileOutlined className="text-green-500 text-4xl mb-2" />
                    <Title level={2} className="!text-green-700 !mb-1">
                        Quên Mật Khẩu
                    </Title>
                    <Text type="secondary">
                        Nhập email của bạn để nhận mật khẩu mới
                    </Text>
                </div>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: 'email', message: "Email không hợp lệ!" }
                        ]}
                    >
                        <Input placeholder="Nhập email đã đăng ký" size="large" />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full bg-green-500 hover:bg-green-600 h-10 font-semibold"
                    >
                        Gửi mật khẩu mới
                    </Button>
                </Form>
            </div>
        </div>
    );
}
