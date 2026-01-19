import { Layout, Menu, Dropdown } from "antd";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { HeartOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined, CrownFilled } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useUser } from "../lib/hooks";

const { Header, Footer, Content } = Layout;

export default function MainLayout() {
    const { user, isLoggedIn, refreshUser } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        refreshUser();
        console.log(123);
        navigate('/login');
    };
    const items: MenuProps['items'] = isLoggedIn
        ? [
            {
                key: '1',
                label: <Link to="/account">Tài khoản</Link>,
            },
            {
                key: 'p',
                label: <Link to="/premium" className="text-indigo-600 font-bold">Nâng cấp Premium</Link>,
            },
            {
                key: '2',
                label: <span onClick={handleLogout}>Đăng xuất</span>,
            },
        ]
        : [
            {
                key: '1',
                label: <Link to="/login">Đăng nhập</Link>,
            },
            {
                key: '2',
                label: <Link to="/register">Đăng ký</Link>,
            },
        ];

    return (
        <Layout className="min-h-screen! bg-[#f5f5f5]">
            <Header className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 bg-white shadow-sm border-b border-gray-100">
                <Link to="/" className="flex items-center gap-2">
                    <HeartOutlined className="text-2xl text-green-500" />
                    <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-500 bg-clip-text text-transparent">
                        Stu.Mental Health
                    </span>
                </Link>

                <div className="flex items-center gap-4 flex-1 justify-end">
                    <Menu
                        mode="horizontal"
                        theme="dark"
                        style={{
                            background: "transparent", border: "none", width: "fill-content", flex: "1"
                        }}
                        items={[
                            { key: "2", label: <Link to="/confessions" className="text-indigo-600 font-bold">Cộng đồng</Link> },
                            { key: "3", label: <Link to="/habits" className="text-indigo-600 font-bold">Thử thách</Link> },
                            { key: "4", label: <Link to="/chat" className="text-indigo-600 font-bold">Chatbot AI</Link> },
                            { key: "5", label: <Link to="/library" className="text-indigo-600 font-bold">Thư viện</Link> },
                            { key: "6", label: <Link to="/premium" className="text-indigo-600 font-bold">Gói</Link> },
                            { key: "7", label: (user?.role === "ADMIN") ? (<Link to="/admin" className="text-indigo-600 font-bold">Quản lý</Link>) : null }
                        ]}
                    />
                    <Dropdown menu={{ items }} placement="bottomRight">
                        <div className="relative cursor-pointer">
                            <img src={"/background-homePage.png"} alt="profile" className="w-10 h-10 rounded-full border-2 border-green-500" />
                            {user?.isPremium && (
                                <CrownFilled className="absolute -top-1 -right-1 text-amber-500 text-lg" />
                            )}
                        </div>
                    </Dropdown>
                </div>
            </Header>

            <Content>
                <Outlet />
            </Content>

            <Footer className=" py-12 px-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-green-400">Stu.Mental Health</h3>
                        <p className="text-gray-400 text-sm">
                            Nền tảng chăm sóc sức khỏe tinh thần toàn diện dành cho sinh viên Việt Nam.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-amber-600">Liên kết nhanh</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/" className="hover:text-green-400 transition">Trang chủ</Link></li>
                            <li><Link to="/library" className="hover:text-green-400 transition">Thư viện nội dung</Link></li>
                            <li><Link to="/about" className="hover:text-green-400 transition">Về chúng tôi</Link></li>
                            <li><Link to="/contact" className="hover:text-green-400 transition">Liên hệ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-amber-600">Hỗ trợ</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-green-400 transition">Trung tâm trợ giúp</a></li>
                            <li><a href="#" className="hover:text-green-400 transition">Chính sách bảo mật</a></li>
                            <li><a href="#" className="hover:text-green-400 transition">Điều khoản sử dụng</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-amber-600">Kết nối</h4>
                        <div className="flex gap-4">
                            <FacebookOutlined twoToneColor="#eb2f96" className="text-2xl hover:text-blue-500 cursor-pointer transition" />
                            <InstagramOutlined twoToneColor="#eb2f96" className="text-2xl hover:text-pink-500 cursor-pointer transition " />
                            <YoutubeOutlined twoToneColor="#eb2f96" className="text-2xl hover:text-red-500 cursor-pointer transition " />
                        </div>
                    </div>
                </div>
                <div className="text-center mt-12 pt-8 border-t border-gray-800 text-gray-500 text-sm">
                    © 2024 Stu.Mental Health. All rights reserved.
                </div>
            </Footer>
        </Layout>
    );
}
