import React, { useEffect, useState } from 'react';
import { Typography, Tabs, Space, Empty, Spin, Button } from 'antd';
import { RefreshCwIcon as RefreshIcon } from 'lucide-react';
import StudentLayout from '../../components/Layout/StudentLayout';
import RequestCard from '../../components/requests/RequestCard';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchRequests } from '../../store/slices/requestSlice';
import { BorrowRequest, RequestStatus } from '../../types';

const { Title } = Typography;
const { TabPane } = Tabs;

const BorrowHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { requests, loading } = useAppSelector((state) => state.request);
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('pending');
  
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchRequests());
    }
  }, [dispatch, user?.id]);
  
  const refreshData = () => {
    if (user?.id) {
      dispatch(fetchRequests());
    }
  };
  
  // Filter requests based on tab
  const pendingRequests = requests.filter(
    req => req.status === RequestStatus.PENDING
  );

  const approvedRequests = requests.filter(
    req => req.status === RequestStatus.APPROVED
  );

  const returnedRequests = requests.filter(
    req => req.status === RequestStatus.RETURNED
  );

  const rejectedRequests = requests.filter(
    req => req.status === RequestStatus.REJECTED || req.status === RequestStatus.CANCELED
  );
  
  const handleMarkReturned = async (id: string) => {
    if (user?.id) {
      dispatch(fetchUserRequests(user.id));
    }
  };
  
  const renderRequestList = (requestList: BorrowRequest[]) => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      );
    }
    
    if (requestList.length === 0) {
      return <Empty description="Không tìm thấy yêu cầu nào" />;
    }
    
    return (
      <div>
        {requestList.map(request => (
          <RequestCard key={request.id} request={request} onMarkReturned={handleMarkReturned} />
        ))}
      </div>
    );
  };
  
  return (
    <StudentLayout>
      <Space className="w-full flex justify-between mb-6">
        <div>
          <Title level={3}>Lịch sử mượn thiết bị</Title>
          <p className="text-gray-500">Theo dõi yêu cầu và lịch sử mượn thiết bị của bạn</p>
        </div>
        <Button 
          icon={<RefreshIcon size={16} />} 
          onClick={refreshData}
          loading={loading}
        >
          Làm mới
        </Button>
      </Space>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              Đang chờ
              {pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}
            </span>
          } 
          key="pending"
        >
          {renderRequestList(pendingRequests)}
        </TabPane>
        <TabPane 
          tab={
            <span>
              Đã duyệt
              {approvedRequests.length > 0 ? ` (${approvedRequests.length})` : ''}
            </span>
          } 
          key="approved"
        >
          {renderRequestList(approvedRequests)}
        </TabPane>
        <TabPane 
          tab={
            <span>
              Đã trả
              {returnedRequests.length > 0 ? ` (${returnedRequests.length})` : ''}
            </span>
          } 
          key="returned"
        >
          {renderRequestList(returnedRequests)}
        </TabPane>
        <TabPane 
          tab={
            <span>
              Đã từ chối
              {rejectedRequests.length > 0 ? ` (${rejectedRequests.length})` : ''}
            </span>
          } 
          key="rejected"
        >
          {renderRequestList(rejectedRequests)}
        </TabPane>
      </Tabs>
    </StudentLayout>
  );
};

export default BorrowHistory;