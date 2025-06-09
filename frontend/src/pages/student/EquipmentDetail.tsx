import React, { useEffect, useState } from 'react';
import { Typography, Descriptions, Image, Card, Divider, Badge, Button, Space, Spin, Alert } from 'antd';
import { ArrowLeftIcon } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/Layout/StudentLayout';
import BorrowForm from '../../components/equipment/BorrowForm';
import StatusBadge from '../../components/common/StatusBadge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getEquipmentById } from '../../store/slices/equipmentSlice';
import { fetchRequests } from '../../store/slices/requestSlice';
import { RequestStatus } from '../../types';

const { Title, Text } = Typography;

const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedEquipment, loading } = useAppSelector((state) => state.equipment);
  const { requests } = useAppSelector((state) => state.request);
  const { user } = useAppSelector((state) => state.auth);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  
  useEffect(() => {
    if (id) {
      dispatch(getEquipmentById(id));
    }
    
    if (user?.id) {
      dispatch(fetchRequests());
    }
  }, [dispatch, id, user?.id]);
  
  // Kiểm tra xem người dùng đã yêu cầu thiết bị này chưa và nó đang chờ xử lý
  const hasPendingRequest = requests.some(
    req => req.equipmentId === id && req.status === RequestStatus.PENDING
  );
  
  // Hình ảnh mặc định nếu không có sẵn
  const defaultImage = 'https://images.pexels.com/photos/2720447/pexels-photo-2720447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  
  const handleBorrowClick = () => {
    setShowBorrowForm(true);
  };
  
  const handleBorrowSuccess = () => {
    // Làm mới yêu cầu của người dùng và ẩn biểu mẫu
    if (user?.id) {
      dispatch(fetchRequests());
    }
    setShowBorrowForm(false);
  };
  
  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      </StudentLayout>
    );
  }
  
  if (!selectedEquipment) {
    return (
      <StudentLayout>
        <Alert
          message="Không tìm thấy thiết bị"
          description="Thiết bị bạn đang tìm kiếm không tồn tại."
          type="error"
          showIcon
        />
        <Button 
          type="primary" 
          onClick={() => navigate('/equipment')}
          className="mt-4"
        >
          Quay lại danh sách thiết bị
        </Button>
      </StudentLayout>
    );
  }
  
  return (
    <StudentLayout>
      <Space className="mb-6" size="middle">
        <Button icon={<ArrowLeftIcon size={16} />} onClick={() => navigate('/equipment')}>
          Quay lại danh sách thiết bị
        </Button>
      </Space>
      
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6">
            <Image
              src={selectedEquipment.imageUrl || defaultImage}
              alt={selectedEquipment.name}
              className="rounded-lg object-cover"
              style={{ maxHeight: '300px' }}
              fallback={defaultImage}
            />
          </div>
          
          <div className="md:w-2/3">
            <div className="flex justify-between items-center mb-4">
              <Title level={2}>{selectedEquipment.name}</Title>
              <StatusBadge status={selectedEquipment.status} type="equipment" />
            </div>
            
            <Text className="block mb-4">{selectedEquipment.description}</Text>
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Danh mục">{selectedEquipment.category}</Descriptions.Item>
              <Descriptions.Item label="Tình trạng">{selectedEquipment.condition}</Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                <Badge 
                  status={selectedEquipment.availableQuantity > 0 ? "success" : "error"} 
                  text={`${selectedEquipment.availableQuantity} / ${selectedEquipment.totalQuantity} có sẵn`} 
                />
              </Descriptions.Item>
            </Descriptions>
            
            {!showBorrowForm && !hasPendingRequest && (
              <Button 
                type="primary" 
                onClick={handleBorrowClick}
                className="mt-4"
                disabled={selectedEquipment.availableQuantity === 0}
              >
                Yêu cầu mượn
              </Button>
            )}
            
            {hasPendingRequest && (
              <Alert
                message="Yêu cầu đang chờ"
                description="Bạn đã có một yêu cầu đang chờ duyệt cho thiết bị này."
                type="info"
                showIcon
                className="mt-4"
              />
            )}
          </div>
        </div>
      </Card>
      
      {showBorrowForm && (
        <BorrowForm 
          equipment={selectedEquipment} 
          onSuccess={handleBorrowSuccess}
        />
      )}
      
      <Divider orientation="left">Quy định mượn thiết bị</Divider>
      
      <Card>
        <Title level={5}>Hướng dẫn mượn thiết bị</Title>
        <ul className="pl-5 list-disc">
          <li>Thiết bị phải được trả về trong tình trạng như khi mượn.</li>
          <li>Người mượn chịu trách nhiệm về bất kỳ hư hỏng hoặc mất mát trong thời gian mượn.</li>
          <li>Trả muộn có thể dẫn đến việc tạm ngưng quyền mượn thiết bị.</li>
          <li>Yêu cầu phải được quản trị viên phê duyệt trước khi có thể nhận thiết bị.</li>
          <li>Nếu có vấn đề, vui lòng liên hệ văn phòng quản trị.</li>
        </ul>
      </Card>
    </StudentLayout>
  );
};

export default EquipmentDetail;