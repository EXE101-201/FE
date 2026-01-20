import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center text-center px-8 py-20 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md space-y-6">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Chia sẻ ẩn danh – Không phán xét</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">Bạn không một mình</p>
        <p className="text-base text-gray-500 dark:text-gray-400">Ở đây, cảm xúc của bạn được tôn trọng. Chatbot luôn sẵn sàng lắng nghe.</p>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Ẩn danh 100%, không thu thập thông tin cá nhân</p>
          <p>Không ai biết bạn là ai</p>
          <p>Chatbot luôn sẵn sàng lắng nghe</p>
        </div>
      </div>
      <Button
        type="primary"
        size="large"
        shape="round"
        className="mt-8 font-semibold text-lg px-8 py-5"
        style={{
          background: "#1677ff",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
        onClick={() => navigate('/')}
      >
        Bắt đầu ngay
      </Button>
    </div>
  );
};

export default Onboarding;