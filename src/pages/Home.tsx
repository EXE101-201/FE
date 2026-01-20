import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Layout
      className="h-screen"
      style={{
        backgroundImage: "url('/cccc.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      {/* Content */}
      <Content className="flex flex-col justify-center items-center text-center px-8 py-20 mt-30 text-white">
        {/* <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-bold">Chia sẻ ẩn danh – Không phán xét</h1>
          <p className="text-lg">Bạn không một mình</p>
          <p className="text-base">Ở đây, cảm xúc của bạn được tôn trọng. Chatbot luôn sẵn sàng lắng nghe.</p>
        </div> */}
        <Button
          type="primary"
          size="large"
          shape="round"
          className="mt-8 font-semibold text-lg px-8 py-5"
          style={{
            background: "#1677ff",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          }}
          onClick={() => navigate('/confessions')}
        >
          Bắt đầu ngay
        </Button>
      </Content>
    </Layout>
  );
};

export default HomePage;

