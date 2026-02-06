import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#e6ebf5]">
      {/* Hero Section */}
      <div className="bg-[#a8d5ba] px-4 py-8 md:py-0 md:h-[450px] flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        {/* Left Image */}
        <div className="w-full md:w-1/3 flex justify-center md:justify-start order-2 md:order-1 mt-6 md:mt-0">
          <img src="/home1.png" alt="home1" className="h-48 md:h-[400px] object-contain" />
        </div>

        {/* Center Content */}
        <div className="w-full flex flex-col items-center text-center space-y-4 z-10 order-1 md:order-2">
          <h1 className="text-3xl md:text-5xl font-bold text-[#58856c]">Sức khoẻ tinh thần</h1>
          <div className="text-[#58856c] font-medium">
            <p>Chia sẻ ẩn danh - Thư giãn AI - Tham gia thử thách hình thành thói quen tốt</p>
            <p>Nền tảng chăm sóc sức khoẻ tinh thần cho sinh viên Việt Nam.</p>
          </div>
          <Button
            type="primary"
            className="bg-[#ff7e79] hover:bg-[#ff6b66]! border-none text-xl px-12 py-6 rounded-2xl font-bold mt-4 h-auto shadow-md"
            onClick={() => navigate('/confessions')}
          >
            Bắt đầu
          </Button>
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/3 flex justify-center md:justify-end order-3 md:order-3 mt-6 md:mt-0">
          <img src="/home2.png" alt="home2" className="h-48 md:h-[400px] object-contain" />
        </div>
      </div>

      {/* Feature Section */}
      <div className="flex-1 px-4 py-12 md:py-24 relative bg-[#e2e7f7]">

        {/* Cards Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-10">
          {/* Card 1: Chia sẻ ẩn danh */}
          <div
            onClick={() => navigate('/confessions')}
            className="bg-white rounded-[40px] p-6 md:p-8 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="bg-[#e8ebf7] w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center">
              <img src="/andanh.png" alt="an danh" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
            </div>
            <span className="text-[#58856c] font-semibold text-lg md:text-xl text-center">chia sẻ ẩn danh</span>
          </div>

          {/* Card 2: Dr. MTH */}
          <div
            onClick={() => navigate('/chat')}
            className="bg-white rounded-[40px] p-6 md:p-8 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="bg-[#dcf3e8] w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center overflow-hidden">
              <img src="/robot.png" alt="dr mth" className="w-20 h-20 md:w-28 md:h-28 object-contain mt-2" />
            </div>
            <span className="text-[#58856c] font-semibold text-lg md:text-xl text-center">Dr. MTH</span>
          </div>

          {/* Card 3: Thử thách */}
          <div
            onClick={() => navigate('/habits')}
            className="bg-white rounded-[40px] p-6 md:p-8 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="bg-[#dcf3e8] w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 md:w-20 md:h-20 text-[#58856c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <path d="M19 5L14 10" strokeLinecap="round" />
                <path d="M19 5L21 3" strokeLinecap="round" />
                <path d="M19 5L17 7" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[#58856c] font-semibold text-lg md:text-xl text-center">Thử thách</span>
          </div>

          {/* Card 4: Thư viện */}
          <div
            onClick={() => navigate('/library')}
            className="bg-white rounded-[40px] p-6 md:p-8 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="bg-[#e8ebf7] w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 md:w-20 md:h-20 text-[#58856c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <path d="M8 7h8M8 11h8M8 15h4" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[#58856c] font-semibold text-lg md:text-xl text-center">Thư viện</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
