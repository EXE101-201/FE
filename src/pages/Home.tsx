import { Button, Dropdown, Layout, Menu, Typography, type MenuProps } from "antd";
import { Link } from "react-router-dom";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const HomePage = () => {

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Link to="/">Tài khoản</Link>
      ),
    },
    {
      key: '2',
      label: (
        <Link to="/login">Đăng nhập</Link> 
      ),
    },
    {
      key: '3',
      label: (
        <Link to="/register">Đăng ký</Link> 
      ),
    },
  ];

  return (
    <Layout
      className="h-screen"
      style={{
        backgroundImage: "url('/background-homePage.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
      <Header
        className="flex justify-between items-center px-4! bg-transparent shadow-none"
        style={{ backdropFilter: "blur(8px)" }}
      >
        <div className="text-white font-bold text-xl">MHW Platform</div>
        <Menu
          mode="horizontal"
          theme="dark"
          style={{ background: "transparent", border: "none", width: "fit-content", alignItems: "center" }}
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Cộng đồng" },
            { key: "3", label: "Thử thách" },
            { key: "4", label: "Chatbot AI" },
            {
              key: "5", label: <Dropdown menu={{ items }} overlayStyle={{backgroundColor:"#001529"}} placement="bottomLeft">
                <img src={"/background-homePage.png"} alt="logo" className="w-10 h-10 rounded-full" />
              </Dropdown>
            },
          ]}
        />
      </Header>

      {/* Content */}
      <Content className="flex flex-col justify-center items-center text-center px-8 py-20 bg-black/40">
        <Title
          level={1}
          className="text-white text-5xl font-bold drop-shadow-lg"
        >
          Sức Khỏe Sinh Viên
        </Title>
        <Paragraph className="text-white text-lg mt-4 max-w-2xl drop-shadow-md">
          Chia sẻ ẩn danh - Thư giãn cùng AI - Tham gia thử thách hình thành
          thói quen tốt. <br /> Nền tảng chăm sóc sức khỏe tinh thần cho sinh
          viên Việt Nam.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          shape="round"
          className="mt-8 font-semibold text-lg px-8 py-5"
          style={{
            background: "#1677ff",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          }}
          onClick={() => alert("Bắt đầu hành trình của bạn!")}
        >
          Bắt đầu ngay
        </Button>
      </Content>
    </Layout>
  );
};

export default HomePage;
