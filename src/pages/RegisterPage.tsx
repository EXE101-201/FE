import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import api from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { SmileOutlined } from "@ant-design/icons";
import { GoogleLogin } from "@react-oauth/google";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Map 'name' to 'fullName' as expected by backend
      const payload = {
        ...values,
        fullName: values.name,
        role: 'USER',
      };
      delete payload.name; // optional, but cleaner

      await api.post('/auth/register', payload);
      navigate("/login");
    } catch (error: any) {
      console.error("Register Error:", error);
      const msg = error.response?.data?.message || 'Đăng ký thất bại';
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
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate("/");
    } catch (error) {
      console.error("Google Login Error:", error);
      message.error("Đăng nhập bằng Google thất bại");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <div className="text-center mb-6">
          <SmileOutlined className="text-green-500 text-4xl mb-2" />
          <Title level={2} className="!text-green-700 !mb-1">
            Stu.Mental Health
          </Title>
          <Text type="secondary">
            Cùng bạn vun đắp sức khỏe tinh thần mỗi ngày
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

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

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            Đăng ký
          </Button>
        </Form>

        <div className="flex flex-col items-center gap-2 my-4 border-t-2 border-gray-200">
          <Text type="secondary">Hoặc đăng ký bằng</Text>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              message.error('Đăng ký Google thất bại');
            }}
            ux_mode="popup"
          />
        </div>
        <div className="text-center mt-6">
          <Text>Đã có tài khoản? </Text>
          <Link to="/login" className="text-green-600 font-semibold">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
