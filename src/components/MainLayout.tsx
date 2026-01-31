import { Layout, Menu, Dropdown } from "antd";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { HeartOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined, CrownFilled } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useUser } from "../lib/hooks/hooks";

const { Header, Footer, Content } = Layout;

export default function MainLayout() {
    const { user, refreshUser } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine the selected key based on the current path
    const selectedKey = "/" + location.pathname.split("/")[1];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        refreshUser();
        console.log(123);
        navigate('/login');
    };
    const items: MenuProps['items'] = user
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

    const menuItems = [
        { key: "/confessions", label: <Link to="/confessions">Cộng đồng</Link> },
        { key: "/habits", label: <Link to="/habits">Thử thách</Link> },
        { key: "/chat", label: <Link to="/chat">Chatbot AI</Link> },
        { key: "/library", label: <Link to="/library">Thư viện</Link> },
        { key: "/premium", label: <Link to="/premium">Gói</Link> },
    ];

    if (user?.role === "ADMIN") {
        menuItems.push({ key: "/admin", label: <Link to="/admin">Quản lý</Link> });
    }

    return (
        <Layout className="min-h-screen! bg-[#f5f5f5]">
            <Header className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 bg-[#d9ede2]! shadow-sm border-b border-gray-100">
                <img src="/logo.png" alt="logo" className=" h-3/4 cursor-pointer" onClick={() => navigate("/")} />

                <div className="flex items-center gap-4 flex-1 justify-end">
                    <Menu
                        mode="horizontal"
                        selectedKeys={[selectedKey]}
                        style={{
                            background: "transparent", border: "none", width: "fill-content", flex: "1"
                        }}
                        items={menuItems}
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

            <Footer className=" py-12 px-8 bg-[#d9ede2]!">
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
