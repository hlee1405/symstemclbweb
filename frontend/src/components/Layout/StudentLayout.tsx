import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Space, Popover } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BoxIcon, 
  ClockIcon, 
  LogOutIcon, 
  BellIcon, 
  UserIcon 
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';
import AlertList from '../common/AlertList';
import NotificationList from '../notifications/NotificationList';
import { RequestStatus } from '../../types';
import moment from 'moment';
import { fetchReadNotifications, markNotificationsRead } from '../../store/slices/notificationReadSlice';

const { Header, Sider, Content } = Layout;

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { requests } = useAppSelector((state) => state.request);
  const readIds = useAppSelector((state) => state.notificationRead.readIds);
  
  // Quản lý danh sách đã đọc ở đây
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  // Tính toán danh sách thông báo cần thiết
  const notifications = requests.flatMap(req => {
    if (req.status === RequestStatus.APPROVED) {
      const isNewlyApproved = moment().diff(moment(req.approvedDate), 'hours') < 24;
      const isNearDue = moment(req.returnDate).diff(moment(), 'days') === 1;
      const isOverdue = moment().isAfter(moment(req.returnDate));
      const result = [];
      if (isNewlyApproved) {
        result.push({ ...req, notificationType: 'approval' });
      }
      if (isNearDue || isOverdue) {
        result.push({ ...req, notificationType: 'return' });
      }
      return result;
    }
    return [];
  });

  // Cập nhật số lượng chưa đọc mỗi khi notifications hoặc readNotifications thay đổi
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !readIds.includes(n.id)).length);
  }, [notifications, readIds]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchReadNotifications(user.id));
    }
  }, [user?.id, dispatch]);

  // Callback cho NotificationList để cập nhật trạng thái đã đọc
  const handleReadChange = (readSet: Set<string>) => {
    setReadNotifications(new Set(readSet));
  };
  
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
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
              <div className="mt-1 text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">Student</div>
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
  
  const handleMarkAsRead = (notificationId: string) => {
    if (user?.id && !readIds.includes(notificationId)) {
      dispatch(markNotificationsRead(user.id, [notificationId]));
    }
  };

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      const unreadIds = notifications.filter(n => !readIds.includes(n.id)).map(n => n.id);
      if (unreadIds.length > 0) {
        dispatch(markNotificationsRead(user.id, unreadIds));
      }
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="flex items-center justify-between px-6 bg-white shadow-sm">
        <div className="flex items-center">
          <BoxIcon className="mr-2 text-primary-color" />
          <h1 className="m-0 text-xl font-semibold">Hệ thống mượn đồ dùng</h1>
        </div>
        <Space size={24} className="notification-profile-space">
          <Popover
            content={
              <NotificationList
                requests={requests}
                readNotifications={new Set(readIds)}
                onReadChange={(newSet) => {
                  const newIds = Array.from(newSet).filter(id => !readIds.includes(id));
                  if (user?.id && newIds.length > 0) {
                    dispatch(markNotificationsRead(user.id, newIds));
                  }
                }}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            }
            title="Thông báo"
            trigger="click"
            placement="bottomRight"
          >
            <Badge
              count={unreadCount}
              size="default"
              style={{
                background: '#ff3b30',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 12,
                minWidth: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                boxShadow: '0 0 0 2px #fff',
                top: 2,
                right: 2,
                padding: '0 8px',
              }}
            >
              <Button shape="circle" icon={<BellIcon size={16} />} />
            </Badge>
          </Popover>
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
                key: '/',
                icon: <HomeIcon size={16} />,
                label: 'Dashboard',
                onClick: () => navigate('/'),
              },
              {
                key: '/equipment',
                icon: <BoxIcon size={16} />,
                label: 'Thiết bị',
                onClick: () => navigate('/equipment'),
              },
              {
                key: '/history',
                icon: <ClockIcon size={16} />,
                label: 'Lịch sử mượn',
                onClick: () => navigate('/history'),
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

export default StudentLayout;