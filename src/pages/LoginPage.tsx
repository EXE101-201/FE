import { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { SmileOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    setLoading(true);
    console.log("Login:", values);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
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

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            Đăng nhập
          </Button>
        </Form>

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
