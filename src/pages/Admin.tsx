import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Typography, Progress, Tabs, Space, Badge, App } from 'antd';
import {
  TeamOutlined,
  MessageOutlined,
  RocketOutlined,
  ClockCircleOutlined,
  CrownFilled,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LineChartOutlined,
  CommentOutlined,
  RobotOutlined,
  FileTextOutlined,
  DollarOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import api from '../lib/api';
import { useUser } from '../lib/hooks/hooks';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [stats, setStats] = useState<any>(null);
  const [pendingConfessions, setPendingConfessions] = useState<any[]>([]);
  const [reportedComments, setReportedComments] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [chatScripts, setChatScripts] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [premiumUsers, setPremiumUsers] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const { message } = App.useApp();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(user);
    if (!user || user.role !== 'ADMIN') {
      message.error('Bạn không có quyền truy cập trang này');
      navigate('/');
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, reportedRes, blacklistRes, scriptsRes, contentRes, premiumRes, revenueRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/confessions/pending'),
        api.get('/admin/comments/reported'),
        api.get('/admin/blacklist'),
        api.get('/admin/chat-scripts'),
        api.get('/admin/content'),
        api.get('/admin/premium/users'),
        api.get('/admin/premium/revenue')
      ]);
      setStats(statsRes.data);
      setPendingConfessions(pendingRes.data);
      setReportedComments(reportedRes.data);
      setBlacklist(blacklistRes.data);
      setChatScripts(scriptsRes.data);
      setContentList(contentRes.data);
      setPremiumUsers(premiumRes.data);
      setRevenue(revenueRes.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        message.error('Bạn không có quyền truy cập trang này');
        navigate('/');
      }
      console.error('Fetch admin data error:', error);
      message.error(error.response?.data?.message || 'Lỗi tải dữ liệu admin');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.post('/admin/confessions/moderate', { id, status });
      message.success(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} bài viết`);
      fetchData();
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await api.delete(`/admin/comments/${id}`);
      message.success('Đã xóa bình luận');
      fetchData();
    } catch (error) {
      message.error('Lỗi khi xóa bình luận');
    }
  };

  const handleAddBlacklist = async (keyword: string) => {
    try {
      await api.post('/admin/blacklist', { keyword });
      message.success('Đã thêm từ khóa');
      fetchData();
    } catch (error) {
      message.error('Lỗi khi thêm từ khóa');
    }
  };

  const handleDeleteBlacklist = async (id: string) => {
    try {
      await api.delete(`/admin/blacklist/${id}`);
      message.success('Đã xóa từ khóa');
      fetchData();
    } catch (error) {
      message.error('Lỗi khi xóa từ khóa');
    }
  };

  const overviewCards = stats ? [
    { title: 'User Active (DAU)', value: stats.dau, icon: <TeamOutlined />, color: '#1890ff', suffix: 'người' },
    { title: 'Confession Mới', value: stats.confessionsToday, icon: <MessageOutlined />, color: '#52c41a', suffix: 'bài' },
    { title: 'Lượt Chat AI', value: stats.aiChatsToday, icon: <RocketOutlined />, color: '#722ed1', suffix: 'lượt' },
    { title: 'Sử Dụng TB', value: stats.avgUsage, icon: <ClockCircleOutlined />, color: '#faad14', suffix: 'phút' },
  ] : [];

  const commentColumns = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Người viết',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => user?.fullName || 'N/A',
    },
    {
      title: 'Lý do báo cáo',
      dataIndex: 'reports',
      key: 'reports',
      render: (reports: any[]) => reports?.[0]?.reason || 'Tiêu cực',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteComment(record._id)}>Xóa</Button>
      ),
    },
  ];

  const blacklistColumns = [
    { title: 'Từ khóa', dataIndex: 'keyword', key: 'keyword' },
    {
      title: 'Thao tác', key: 'action', render: (_: any, record: any) => (
        <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteBlacklist(record._id)} />
      )
    },
  ];

  const scriptColumns = [
    { title: 'Chủ đề', dataIndex: 'topic', key: 'topic' },
    { title: 'Lượt dùng', dataIndex: 'usageCount', key: 'usageCount' },
    { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', render: (active: boolean) => <Badge status={active ? 'success' : 'error'} text={active ? 'Đang bật' : 'Đã tắt'} /> },
  ];

  const contentColumns = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Loại', dataIndex: 'type', key: 'type', render: (type: string) => <Tag color="blue">{type}</Tag> },
    { title: 'Gói', dataIndex: 'isPremium', key: 'isPremium', render: (prem: boolean) => prem ? <Tag color="gold">PREMIUM</Tag> : <Tag color="green">FREE</Tag> },
    { title: 'Thao tác', key: 'action', render: () => <Space><Button icon={<EditOutlined />} size="small" /><Button danger icon={<DeleteOutlined />} size="small" /></Space> },
  ];

  const premiumUserColumns = [
    { title: 'Tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Hạn dùng', dataIndex: 'premiumUntil', key: 'premiumUntil', render: (date: string) => new Date(date).toLocaleDateString('vi-VN') },
  ];

  return (
    <div className="p-6 bg-[#f0f2f5] min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <Title level={2}>Hệ thống Quản trị</Title>
          <Text type="secondary">Theo dõi chỉ số và điều hành nền tảng Stu.Mental Health</Text>
        </div>
        <Button type="primary" onClick={fetchData} loading={loading}>Làm mới dữ liệu</Button>
      </div>

      <Tabs defaultActiveKey="overview" className="bg-white p-6! rounded-xl shadow-sm">
        <Tabs.TabPane tab={<span><LineChartOutlined />Tổng quan</span>} key="overview">
          <Row gutter={[16, 16]} className="mb-8">
            {overviewCards.map((card, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                  <Statistic
                    title={<Text strong type="secondary">{card.title}</Text>}
                    value={card.value}
                    prefix={<div className="p-2 rounded-lg bg-gray-50 mr-2" style={{ color: card.color }}>{card.icon}</div>}
                    valueStyle={{ color: '#262626', fontWeight: 'bold' }}
                    suffix={<Text type="secondary" className="ml-1 text-xs">{card.suffix}</Text>}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Xu hướng Confession (7 ngày qua)" className="h-full shadow-sm">
                <div className="flex items-end justify-between h-64 gap-2 pt-8">
                  {stats?.confessionTrend.map((item: any, i: number) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all cursor-pointer relative group"
                        style={{ height: `${(item.count / (Math.max(...stats.confessionTrend.map((t: any) => t.count)) || 1)) * 100}%`, minHeight: '4px' }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.count} bài
                        </div>
                      </div>
                      <Text type="secondary" className="mt-2 text-[10px]">{item.date}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Phân phối Người dùng" className="h-full shadow-sm">
                <div className="text-center py-4">
                  <Progress
                    type="dashboard"
                    percent={stats ? Math.round((stats.distribution.premium / (stats.distribution.free + stats.distribution.premium || 1)) * 100) : 0}
                    strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                    format={(percent) => (
                      <div className="flex flex-col items-center">
                        <CrownFilled className="text-amber-500 text-2xl mb-1" />
                        <Text strong className="text-lg">{percent}%</Text>
                        <Text type="secondary" className="text-[10px]">PREMIUM</Text>
                      </div>
                    )}
                  />
                  <div className="mt-6 text-left space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <Text><Badge status="processing" color="#108ee9" /> Tài khoản Free</Text>
                      <Text strong>{stats?.distribution.free}</Text>
                    </div>
                    <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                      <Text><Badge status="success" color="#87d068" /> Tài khoản Premium</Text>
                      <Text strong className="text-indigo-600">{stats?.distribution.premium}</Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><MessageOutlined />Duyệt Confession <Badge count={pendingConfessions.length} offset={[10, 0]} size="small" /></span>} key="moderation">
          <Table
            dataSource={pendingConfessions}
            columns={[
              { title: 'Nội dung', dataIndex: 'content', key: 'content', render: (text: string) => <Paragraph ellipsis={{ rows: 2 }}>{text}</Paragraph> },
              { title: 'Tác giả', dataIndex: 'author', key: 'author', render: (author: any) => author ? author.fullName : <Tag color="default">Ẩn danh</Tag> },
              { title: 'Ngày gửi', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleString('vi-VN') },
              {
                title: 'Thao tác', key: 'action', render: (_: any, record: any) => (
                  <Space>
                    <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleModerate(record._id, 'approved')} className="bg-green-500">Duyệt</Button>
                    <Button danger icon={<CloseCircleOutlined />} onClick={() => handleModerate(record._id, 'rejected')}>Từ chối</Button>
                  </Space>
                )
              }
            ]}
            rowKey="_id"
            loading={loading}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><CommentOutlined />Bình luận & Từ khóa</span>} key="comments">
          <Row gutter={16}>
            <Col span={16}>
              <Card title="Bình luận bị báo cáo" className="shadow-sm">
                <Table dataSource={reportedComments} columns={commentColumns} rowKey="_id" size="small" />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Từ khóa bị chặn" extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => {
                const kw = prompt('Nhập từ khóa cần chặn:');
                if (kw) handleAddBlacklist(kw);
              }}>Thêm</Button>} className="shadow-sm">
                <Table dataSource={blacklist} columns={blacklistColumns} rowKey="_id" size="small" pagination={{ pageSize: 5 }} />
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><RobotOutlined />Quản lý Chatbot</span>} key="chatbot">
          <Row gutter={16}>
            <Col span={24}>
              <Card title="Kịch bản Chatbot (MVP)" className="shadow-sm">
                <Table dataSource={chatScripts} columns={scriptColumns} rowKey="_id" />
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><FileTextOutlined />Quản lý Nội dung</span>} key="content">
          <Card extra={<Button type="primary" icon={<PlusOutlined />}>Thêm Nội dung</Button>} className="shadow-sm">
            <Table dataSource={contentList} columns={contentColumns} rowKey="_id" />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><DollarOutlined />Quản lý Premium</span>} key="premium">
          <Row gutter={16}>
            <Col span={16}>
              <Card title="Danh sách User Premium" className="shadow-sm">
                <Table dataSource={premiumUsers} columns={premiumUserColumns} rowKey="_id" />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Doanh thu" className="shadow-sm">
                <Statistic title="Tổng doanh thu tháng này" value={revenue?.[0]?.total || 0} suffix="VND" prefix={<DollarOutlined />} />
                <div className="mt-4">
                  <Text type="secondary">Lịch sử doanh thu:</Text>
                  {revenue.map((item, idx) => (
                    <div key={idx} className="flex justify-between mt-2 border-b pb-1">
                      <Text>Tháng {item._id.month}/{item._id.year}</Text>
                      <Text strong>{item.total.toLocaleString()} VND</Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
