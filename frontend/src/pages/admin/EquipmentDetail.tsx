import React, { useEffect } from 'react';
import { Typography, Card, Descriptions, Image, Button, Space, Spin, Alert, Table } from 'antd';
import { ArrowLeftIcon, EditIcon } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import AdminLayout from '../../components/Layout/AdminLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getEquipmentById } from '../../store/slices/equipmentSlice';
import { fetchRequests } from '../../store/slices/requestSlice';
import { RequestStatus } from '../../types';

const { Title, Text } = Typography;

const AdminEquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedEquipment, loading } = useAppSelector((state) => state.equipment);
  const { requests } = useAppSelector((state) => state.request);
  
  useEffect(() => {
    if (id) {
      dispatch(getEquipmentById(id));
      dispatch(fetchRequests());
    }
  }, [dispatch, id]);
  
  // Get all requests for this equipment
  const equipmentRequests = requests.filter(req => req.equipmentId === id);
  
  // Default image if none provided
  const defaultImage = 'https://images.pexels.com/photos/2720447/pexels-photo-2720447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  
  const handleEdit = () => {
    navigate(`/admin/equipment`);
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
  
  if (!selectedEquipment) {
    return (
      <AdminLayout>
        <Alert
          message="Không tìm thấy thiết bị"
          description="Thiết bị bạn đang tìm kiếm không tồn tại."
          type="error"
          showIcon
        />
        <Button 
          type="primary" 
          onClick={() => navigate('/admin/equipment')}
          className="mt-4"
        >
          Quay lại danh sách thiết bị
        </Button>
      </AdminLayout>
    );
  }
  
  const columns = [
    {
      title: 'Sinh viên',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      sorter: (a: any, b: any) => moment(a.borrowDate).unix() - moment(b.borrowDate).unix(),
    },
    {
      title: 'Ngày trả',
      dataIndex: 'returnDate',
      key: 'returnDate',
      sorter: (a: any, b: any) => moment(a.returnDate).unix() - moment(b.returnDate).unix(),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (text: string, record: any) => (
        <StatusBadge status={record.status} type="request" />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (text: string, record: any) => (
        <Button 
          type="link"
          onClick={() => navigate(`/admin/requests/${record.id}`)}
        >
          Xem
        </Button>
      ),
    },
  ];
  
  return (
    <AdminLayout>
      <Space className="mb-6" size="middle">
        <Button icon={<ArrowLeftIcon size={16} />} onClick={() => navigate('/admin/equipment')}>
          Quay lại danh sách thiết bị
        </Button>
        <Button type="primary" icon={<EditIcon size={16} />} onClick={handleEdit}>
          Chỉnh sửa thiết bị
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
              <Descriptions.Item label="Tổng số lượng">{selectedEquipment.totalQuantity}</Descriptions.Item>
              <Descriptions.Item label="Số lượng có sẵn">{selectedEquipment.availableQuantity}</Descriptions.Item>
              <Descriptions.Item label="Đang được mượn">
                {selectedEquipment.totalQuantity - selectedEquipment.availableQuantity}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>
      
      <Card title="Lịch sử mượn">
        <Table
          columns={columns}
          dataSource={equipmentRequests}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </AdminLayout>
  );
};

export default AdminEquipmentDetail;