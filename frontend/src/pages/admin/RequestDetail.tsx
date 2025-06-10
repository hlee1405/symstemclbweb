import React, { useEffect, useState } from 'react';
import { Typography, Descriptions, Button, Card, Space, Steps, Input, Modal, Spin, Alert } from 'antd';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, AlertTriangleIcon } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getRequestById, updateRequestStatusById } from '../../store/slices/requestSlice';
import { getEquipmentById } from '../../store/slices/equipmentSlice';
import { RequestStatus } from '../../types';
import { setAlert } from '../../store/slices/alertSlice';
import StatusBadge from '../../components/common/StatusBadge';
import moment from 'moment';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

const AdminRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedRequest, loading: requestLoading } = useAppSelector((state) => state.request);
  const { selectedEquipment, loading: equipmentLoading } = useAppSelector((state) => state.equipment);
  const [notes, setNotes] = useState('');
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  
  useEffect(() => {
    if (id) {
      dispatch(getRequestById(id));
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    if (selectedRequest?.equipmentId) {
      dispatch(getEquipmentById(selectedRequest.equipmentId));
    }
  }, [dispatch, selectedRequest?.equipmentId]);
  
  const loading = requestLoading || equipmentLoading;
  
  // Kiểm tra xem yêu cầu có quá hạn không
  const isOverdue = selectedRequest && selectedRequest.status === RequestStatus.APPROVED && moment(selectedRequest.returnDate).startOf('day').isBefore(moment().startOf('day'));
  
  // Xác định bước hiện tại trong quy trình
  const getCurrentStep = () => {
    if (!selectedRequest) return 0;
    
    switch (selectedRequest.status) {
      case RequestStatus.PENDING:
        return 0;
      case RequestStatus.APPROVED:
        return 1;
      case RequestStatus.RETURNED:
        return 3;
      case RequestStatus.REJECTED:
        return -1; // Trường hợp đặc biệt cho bị từ chối
      default:
        return 0;
    }
  };
  
  const handleApprove = () => {
    setActionType('approve');
    setIsNotesModalVisible(true);
  };
  
  const handleReject = () => {
    setActionType('reject');
    setIsNotesModalVisible(true);
  };
  
  const handleMarkReturned = () => {
    if (!id) return;
    Modal.confirm({
      title: 'Đánh dấu là đã trả lại',
      content: 'Bạn có chắc chắn muốn đánh dấu thiết bị này là đã trả lại không? Thao tác này sẽ cập nhật hàng tồn kho.',
      cancelText: 'Hủy',
      onOk: async () => {
        await dispatch(updateRequestStatusById(id, 'RETURNED' as RequestStatus));
        dispatch(setAlert('Thiết bị được đánh dấu là đã trả lại thành công', 'success'));
        dispatch(getRequestById(id));
      },
    });
  };
  
  const handleNotesSubmit = async () => {
    if (!id || !actionType) return;
    if (actionType === 'approve') {
      await dispatch(updateRequestStatusById(id, 'APPROVED' as RequestStatus, notes));
      dispatch(setAlert('Yêu cầu đã được phê duyệt', 'success'));
      dispatch(getRequestById(id));
    } else if (actionType === 'reject') {
      await dispatch(updateRequestStatusById(id, 'REJECTED' as RequestStatus, notes));
      dispatch(setAlert('Yêu cầu đã bị từ chối ', 'info'));
      dispatch(getRequestById(id));
    }
    setIsNotesModalVisible(false);
    setNotes('');
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }
  
  if (!selectedRequest) {
    return (
      <AdminLayout>
        <Alert
          message="Không tìm thấy yêu cầu"
          description="Yêu cầu bạn đang tìm kiếm không tồn tại."
          type="error"
          showIcon
        />
        <Button 
          type="primary" 
          onClick={() => navigate('/admin/requests')}
          className="mt-4"
        >
          Quay lại danh sách yêu cầu
        </Button>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <Space className="mb-6">
        <Button icon={<ArrowLeftIcon size={16} />} onClick={() => navigate('/admin/requests')}>
          Quay lại danh sách yêu cầu
        </Button>
      </Space>
      
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={3}>Chi tiết yêu cầu mượn</Title>
            <div className="flex items-center">
              <Text type="secondary">Trạng thái:</Text>
              <div className="ml-2">
                {isOverdue ? (
                  <StatusBadge status={RequestStatus.OVERDUE} type="request" />
                ) : (
                  <StatusBadge status={selectedRequest.status} type="request" />
                )}
              </div>
            </div>
          </div>
          
          <Space>
            {selectedRequest.status === RequestStatus.PENDING && (
              <>
                <Button 
                  type="primary" 
                  icon={<CheckCircleIcon size={16} />} 
                  onClick={handleApprove}
                >
                  Duyệt
                </Button>
                <Button 
                  danger 
                  icon={<XCircleIcon size={16} />} 
                  onClick={handleReject}
                >
                  Từ chối
                </Button>
              </>
            )}
            
            {selectedRequest.status === RequestStatus.APPROVED && (
              <Button 
                type="primary" 
                onClick={handleMarkReturned}
              >
                Đánh dấu đã trả
              </Button>
            )}
          </Space>
        </div>
        
        {isOverdue && (
          <Alert
            message="Thiết bị quá hạn"
            description={`Thiết bị này đã quá hạn trả vào ngày ${selectedRequest.returnDate}`}
            type="error"
            showIcon
            icon={<AlertTriangleIcon />}
            className="mb-4"
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Descriptions title="Thông tin yêu cầu" bordered column={1}>
            <Descriptions.Item label="Tên thiết bị">
              {selectedRequest.equipmentName}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">
              {selectedRequest.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Sinh viên mượn">
              {selectedRequest.userName}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày gửi yêu cầu">
              {selectedRequest.requestDate}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày dự kiến mượn">
              {selectedRequest.borrowDate}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày dự kiến trả">
              {selectedRequest.returnDate}
            </Descriptions.Item>
            {selectedRequest.actualBorrowDate && (
              <Descriptions.Item label="Ngày mượn thực tế">
                {selectedRequest.actualBorrowDate}
              </Descriptions.Item>
            )}
            {selectedRequest.actualReturnDate && (
              <Descriptions.Item label="Ngày trả thực tế">
                {selectedRequest.actualReturnDate}
              </Descriptions.Item>
            )}
            {selectedRequest.notes && (
              <Descriptions.Item label="Ghi chú">
                {selectedRequest.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
          
          <div>
            <Descriptions title="Thông tin thiết bị" bordered column={1}>
              {selectedEquipment ? (
                <>
                  <Descriptions.Item label="Danh mục">
                    {selectedEquipment.category}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng có sẵn">
                    {selectedEquipment.availableQuantity} / {selectedEquipment.totalQuantity}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tình trạng">
                    {selectedEquipment.condition}
                  </Descriptions.Item>
                </>
              ) : (
                <Descriptions.Item label="Thiết bị">
                  Không có thông tin thiết bị
                </Descriptions.Item>
              )}
            </Descriptions>
            
            <div className="mt-6">
              <Text strong>Tiến trình yêu cầu</Text>
              <Steps
                current={getCurrentStep()}
                direction="vertical"
                className="mt-4"
                status={selectedRequest.status === RequestStatus.REJECTED ? 'error' : 'process'}
              >
                <Step title="Đã gửi yêu cầu" description={`Vào ngày ${selectedRequest.requestDate}`} />
                <Step 
                  title="Yêu cầu đã duyệt"
                  description={selectedRequest.status !== RequestStatus.PENDING && 
                              selectedRequest.status !== RequestStatus.REJECTED ? 'Đã duyệt' : (
                                selectedRequest.status === RequestStatus.REJECTED ? 'Đã từ chối' : 'Đang chờ duyệt'
                              )}
                />
                <Step
                  title="Đã trả thiết bị"
                  description={selectedRequest.actualReturnDate || 'Đang chờ'}
                />
              </Steps>
            </div>
          </div>
        </div>
      </Card>
      
      <Modal
        title={actionType === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}
        open={isNotesModalVisible}
        onOk={handleNotesSubmit}
        onCancel={() => setIsNotesModalVisible(false)}
        okText={actionType === 'approve' ? 'Duyệt' : 'Từ chối'}
        cancelText="Hủy"
        okButtonProps={{ 
          danger: actionType === 'reject',
          type: actionType === 'approve' ? 'primary' : 'default'
        }}
      >
        <div className="mb-4">
          <label className="block mb-2">Thêm ghi chú (tùy chọn):</label>
          <TextArea
            rows={4}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Nhập ghi chú hoặc bình luận về quyết định này..."
          />
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminRequestDetail;