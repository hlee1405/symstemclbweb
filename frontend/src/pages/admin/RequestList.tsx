import React, { useEffect, useState } from 'react';
import { Typography, Tabs, Button, Space, Input, Select, Empty, Spin, Modal } from 'antd';
import { RefreshCwIcon as RefreshIcon, Search } from 'lucide-react';
import AdminLayout from '../../components/Layout/AdminLayout';
import RequestCard from '../../components/requests/RequestCard';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchRequests, 
  updateRequestStatusById
} from '../../store/slices/requestSlice';
import { BorrowRequest, RequestStatus } from '../../types';
import { setAlert } from '../../store/slices/alertSlice';
import moment from 'moment';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const AdminRequestList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { requests, loading } = useAppSelector((state) => state.request);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [studentFilter, setStudentFilter] = useState<string | null>(null);
  
  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);
  
  const refreshData = () => {
    dispatch(fetchRequests());
  };
  
  const handleApprove = (id: string) => {
    Modal.confirm({
      title: 'Duyệt yêu cầu',
      content: 'Bạn có chắc chắn muốn duyệt yêu cầu này?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        await dispatch(updateRequestStatusById(id, 'APPROVED' as RequestStatus));
        dispatch(setAlert('Đã duyệt yêu cầu thành công', 'success'));
        dispatch(fetchRequests());
      },
    });
  };
  
  const handleReject = (id: string) => {
    Modal.confirm({
      title: 'Từ chối yêu cầu',
      content: 'Bạn có chắc chắn muốn từ chối yêu cầu này?',
      okText: 'Xác nhận',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        await dispatch(updateRequestStatusById(id, 'REJECTED' as RequestStatus));
        dispatch(setAlert('Đã từ chối yêu cầu thành công', 'info'));
        dispatch(fetchRequests());
      },
    });
  };
  
  const handleMarkReturned = (id: string) => {
    Modal.confirm({
      title: 'Đánh dấu đã trả',
      content: 'Bạn có chắc chắn muốn đánh dấu thiết bị này đã được trả? Điều này sẽ cập nhật kho.',
      onOk: async () => {
        await dispatch(updateRequestStatusById(id, 'RETURNED' as RequestStatus));
        dispatch(setAlert('Đã đánh dấu thiết bị đã trả thành công', 'success'));
        dispatch(fetchRequests());
      },
    });
  };
  
  // Filter requests based on tab, search, and filters
  const filterRequests = (requests: BorrowRequest[], status: RequestStatus[]) => {
    return requests
      .filter(req => {
        // Filter by status
        const matchesStatus = status.includes(req.status);
        
        // Filter by search query
        const matchesSearch = 
          req.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.userName.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter by student
        const matchesStudent = studentFilter ? req.userName === studentFilter : true;
        
        return matchesStatus && matchesSearch && matchesStudent;
      })
      .sort((a, b) => moment(b.requestDate).valueOf() - moment(a.requestDate).valueOf()); // Sort by request date descending
  };
  
  // Get unique student names for filtering
  const studentNames = Array.from(new Set(requests.map(req => req.userName)));
  
  // Filtered request lists
  const pendingRequests = filterRequests(requests, [RequestStatus.PENDING]);
  const approvedRequests = filterRequests(requests, [RequestStatus.APPROVED]);
  const rejectedRequests = filterRequests(requests, [RequestStatus.REJECTED, RequestStatus.CANCELED]);
  const returnedRequests = filterRequests(requests, [RequestStatus.RETURNED]);
  
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
          <RequestCard 
            key={request.id} 
            request={request} 
            isAdmin={true}
            onApprove={handleApprove}
            onReject={handleReject}
            onMarkReturned={handleMarkReturned}
          />
        ))}
      </div>
    );
  };
  
  return (
    <AdminLayout>
      <Space className="w-full flex justify-between mb-6">
        <div>
          <Title level={3}>Quản lý yêu cầu</Title>
          <p className="text-gray-500">Quản lý yêu cầu mượn thiết bị</p>
        </div>
        <Button 
          icon={<RefreshIcon size={16} />} 
          onClick={refreshData}
          loading={loading}
        >
          Làm mới
        </Button>
      </Space>
      
      <div className="mb-4">
        <Space className="w-full">
          <Input 
            placeholder="Tìm kiếm theo thiết bị hoặc sinh viên..." 
            prefix={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Lọc theo sinh viên"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => setStudentFilter(value)}
          >
            {studentNames.map(name => (
              <Option key={name} value={name}>{name}</Option>
            ))}
          </Select>
        </Space>
      </div>
      
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
              Đã từ chối
              {rejectedRequests.length > 0 ? ` (${rejectedRequests.length})` : ''}
            </span>
          } 
          key="rejected"
        >
          {renderRequestList(rejectedRequests)}
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
      </Tabs>
    </AdminLayout>
  );
};

export default AdminRequestList;