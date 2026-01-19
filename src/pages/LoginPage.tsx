import { GoogleLogin } from '@react-oauth/google';
import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import api from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { SmileOutlined } from "@ant-design/icons";
import { useUser } from "../lib/hooks";

const { Title, Text } = Typography;

export default function LoginPage() {
  const { refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', values);
      message.success('Đăng nhập thành công!');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // Optional: save user info
      refreshUser();
      navigate("/");
    } catch (error: any) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || 'Đăng nhập thất bại';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const { data } = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });
      message.success('Đăng nhập bằng Google thành công!');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      refreshUser();
      navigate("/");
    } catch (error) {
      console.error("Google Login Error:", error);
      message.error("Đăng nhập bằng Google thất bại");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        {/* ... Header ... */}
        <div className="text-center mb-6">
          <SmileOutlined className="text-green-500 text-4xl mb-2" />
          <Title level={2} className="!text-green-700 !mb-1">
            Stu.Mental Health
          </Title>
          <Text type="secondary">
            Cùng nhau chăm sóc sức khỏe tinh thần sinh viên
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <div className="flex justify-end mb-4">
            <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-800">
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-green-500 hover:bg-green-600 mb-4"
          >
            Đăng nhập
          </Button>
        </Form>

        <div className="flex flex-col items-center gap-2  my-4 border-t-2 border-gray-200">
          <Text type="secondary">Hoặc đăng nhập bằng</Text>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              message.error('Đăng nhập Google thất bại');
            }}
          />
        </div>

        <div className="text-center mt-6">
          <Text>Bạn chưa có tài khoản? </Text>
          <Link to="/register" className="text-green-600 font-semibold">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
