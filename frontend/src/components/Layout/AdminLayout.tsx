import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboardIcon,
  BoxIcon, 
  ClipboardListIcon, 
  LogOutIcon, 
  BellIcon, 
  UserIcon,
  BarChart2Icon 
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';
import AlertList from '../common/AlertList';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { requests } = useAppSelector((state) => state.request);
  
  // Count pending requests that need admin approval
  const pendingRequests = requests.filter(req => req.status === 'pending').length;
  
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/admin/login');
  };
  
  const userMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: (
            <div className="px-4 py-2 text-center">
              <Avatar size={64} icon={<UserIcon />} className="mb-2" />
              <div className="font-semibold">{user?.name}</div>
              {/* <div className="text-sm text-gray-500">{user?.email}</div> */}
              <div className="mt-1 text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">Admin</div>
            </div>
          ),
        },
        {
          key: '2',
          label: (
            <Button 
              type="primary" 
              danger 
              icon={<LogOutIcon size={16} />}
              onClick={handleLogout}
              block
            >
              Logout
            </Button>
          ),
        }
      ]}
    />
  );
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="flex items-center justify-between px-6 bg-white shadow-sm">
        <div className="flex items-center">
          <BoxIcon className="mr-2 text-primary-color" />
          <h1 className="m-0 text-xl font-semibold">Hệ thống quản trị</h1>
        </div>
        <Space>
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <Button shape="circle" icon={<UserIcon size={16} />} />
          </Dropdown>
        </Space>
      </Header>
      <Layout>
        <Sider width={200} theme="light" className="shadow-sm">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={[
              {
                key: '/admin',
                icon: <LayoutDashboardIcon size={16} />,
                label: 'Dashboard',
                onClick: () => navigate('/admin'),
              },
              {
                key: '/admin/equipment',
                icon: <BoxIcon size={16} />,
                label: 'Thiết bị',
                onClick: () => navigate('/admin/equipment'),
              },
              {
                key: '/admin/requests',
                icon: <ClipboardListIcon size={16} />,
                label: 'Yêu cầu mượn',
                onClick: () => navigate('/admin/requests'),
              },
              {
                key: '/admin/statistics',
                icon: <BarChart2Icon size={16} />,
                label: 'Thống kê',
                onClick: () => navigate('/admin/statistics'),
              },
            ]}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            className="p-6 bg-white rounded-lg shadow-sm"
            style={{ minHeight: 280 }}
          >
            <AlertList />
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;