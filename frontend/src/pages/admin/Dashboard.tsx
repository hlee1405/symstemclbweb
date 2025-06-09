import React, { useEffect } from 'react';
import { Typography, Row, Col, Statistic, Card, List, Empty, Spin, Badge, Button } from 'antd';
import { BoxIcon, UserIcon, ClipboardListIcon, AlertTriangleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import AdminLayout from '../../components/Layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchEquipment } from '../../store/slices/equipmentSlice';
import { fetchRequests } from '../../store/slices/requestSlice';
import { RequestStatus, EquipmentStatus } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';

const { Title } = Typography;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: equipment, loading: equipmentLoading } = useAppSelector(state => state.equipment);
  const { requests, loading: requestsLoading } = useAppSelector(state => state.request);
  
  useEffect(() => {
    dispatch(fetchEquipment());
    dispatch(fetchRequests());
  }, [dispatch]);
  
  // Calculate statistics
  const totalEquipment = equipment.length;
  
  const borrowedRequests = requests.filter(req => 
    req.status === RequestStatus.APPROVED
  ).length;
  
  const pendingRequests = requests.filter(req => 
    req.status === RequestStatus.PENDING
  ).length;
  
  // Find overdue items
  const allOverdueRequests = requests.filter(req => {
    if (req.status === RequestStatus.APPROVED) {
      return moment().isAfter(moment(req.returnDate));
    }
    return false;
  });

// Chỉ lấy 4 thiết bị quá hạn mới nhất để hiển thị
  const overdueRequests = [...allOverdueRequests]
  .sort((a, b) => moment(b.returnDate).valueOf() - moment(a.returnDate).valueOf())
  .slice(0, 4);
  
  // Get recent requests (last 5)
  const recentRequests = [...requests]
    .sort((a, b) => moment(b.requestDate).valueOf() - moment(a.requestDate).valueOf())
    .slice(0, 5);
  
  const loading = equipmentLoading || requestsLoading;
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <Title level={3}>Bảng điều khiển quản trị</Title>
        <p className="text-gray-500">Theo dõi hoạt động hệ thống và trạng thái thiết bị</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng số thiết bị"
                  value={totalEquipment}
                  prefix={<BoxIcon size={20} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Đang mượn"
                  value={borrowedRequests}
                  prefix={<BoxIcon size={20} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Cảnh báo quá hạn"
                  value={allOverdueRequests.length}
                  prefix={<AlertTriangleIcon size={20} />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Yêu cầu đang chờ"
                  value={pendingRequests}
                  prefix={<UserIcon size={20} />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Card 
                title="Yêu cầu gần đây" 
                extra={<Button type="link" onClick={() => navigate('/admin/requests')}>Xem tất cả</Button>}
                // className="h-full"
                bodyStyle={{ paddingTop: 5, paddingBottom: 5 }}
              >
                {recentRequests.length === 0 ? (
                  <Empty description="Chưa có yêu cầu nào" />
                ) : (
                  <List
                    dataSource={recentRequests}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.equipmentName}
                          description={`Yêu cầu bởi ${item.userName} vào ${item.requestDate}`}
                        />
                        <StatusBadge 
                          status={moment().isAfter(moment(item.returnDate)) && item.status === RequestStatus.APPROVED 
                            ? RequestStatus.OVERDUE 
                            : item.status} 
                          type="request" 
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                title={
                  <div className="flex items-center">
                    <AlertTriangleIcon size={16} className="mr-2 text-red-500" />
                    <span>Thiết bị quá hạn</span>
                  </div>
                } 
                // className="h-full"
                bodyStyle={{ paddingTop: 5, paddingBottom: 5 }}
              >
                {overdueRequests.length === 0 ? (
                  <Empty description="Không có thiết bị quá hạn" />
                ) : (
                  <List
                    dataSource={overdueRequests}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.equipmentName}
                          description={
                            <>
                              <div>{`Mượn bởi ${item.userName}`}</div>
                              <div>
                                <Badge status="error" />
                                <span>Hạn trả: {item.returnDate}</span>
                              </div>
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;