import { Form, Input, Button, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { SmileOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function RegisterPage() {
    const navigate = useNavigate();
  const onFinish = (values: any) => {
    console.log("Register:", values);
    navigate("/login");
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
            className="w-full bg-green-500 hover:bg-green-600"
          >
            Đăng ký
          </Button>
        </Form>

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
