import React, { useEffect } from 'react';
import { Typography, Row, Col, Statistic, Card, List, Empty, Spin, Badge, Button } from 'antd';
import { BoxIcon, ClockIcon, AlertTriangleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import StudentLayout from '../../components/Layout/StudentLayout';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchEquipment } from '../../store/slices/equipmentSlice';
import { fetchRequests } from '../../store/slices/requestSlice';
import { RequestStatus } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: equipment, loading: equipmentLoading } = useAppSelector(state => state.equipment);
  const { requests, loading: requestsLoading } = useAppSelector(state => state.request);
  const { user } = useAppSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(fetchEquipment());
    if (user?.id) {
      dispatch(fetchRequests());
    }
  }, [dispatch, user?.id]);
  
  // Calculate statistics
  const approvedRequests = requests.filter(req => 
    req.status === RequestStatus.APPROVED
  ).length;
  
  const pendingRequests = requests.filter(req => 
    req.status === RequestStatus.PENDING
  ).length;
  
  // Đếm tổng số thiết bị quá hạn thực tế
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
    <StudentLayout>
      <div className="mb-6">
        <Title level={3}>Bảng điều khiển sinh viên</Title>
        <p className="text-gray-500">Chào mừng trở lại, {user?.name}!</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Đang mượn"
                  value={approvedRequests}
                  prefix={<BoxIcon size={20} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Yêu cầu đang chờ"
                  value={pendingRequests}
                  prefix={<ClockIcon size={20} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Cảnh báo quá hạn"
                  value={allOverdueRequests.length}
                  prefix={<AlertTriangleIcon size={20} />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Card 
              title="Yêu cầu gần đây" 
              extra={<Button type="link" onClick={() => navigate('/history')}>Xem tất cả</Button>}
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
                          description={`Yêu cầu vào ngày ${item.requestDate}`}
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
                              <div>Ngày mượn: {item.borrowDate}</div>
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
    </StudentLayout>
  );
};

export default Dashboard;