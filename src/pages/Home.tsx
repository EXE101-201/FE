import { useEffect } from "react";
import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";

const HomePage = () => {


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
      <Content className="flex flex-col justify-center items-center text-center px-8 py-20 mt-30">
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
