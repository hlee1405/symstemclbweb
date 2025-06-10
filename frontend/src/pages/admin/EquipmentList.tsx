import React, { useEffect, useState } from 'react';
import { Typography, Button, Table, Space, Input, Modal, Form, InputNumber, Select } from 'antd';
import { PlusIcon, Search, EditIcon, Trash2Icon } from 'lucide-react';
import AdminLayout from '../../components/Layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchEquipment, updateEquipmentById, deleteEquipmentById, createEquipment } from '../../store/slices/equipmentSlice';
import { Equipment, EquipmentStatus } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import { setAlert } from '../../store/slices/alertSlice';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const AdminEquipmentList: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.equipment);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  useEffect(() => {
    dispatch(fetchEquipment());
  }, [dispatch]);
  
  const showAddModal = () => {
    setEditingEquipment(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  
  const showEditModal = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    form.setFieldsValue({
      ...equipment,
    });
    setIsModalVisible(true);
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  const handleSubmit = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      
      // Thiết lập trạng thái thiết bị dựa trên số lượng có sẵn
      let status = EquipmentStatus.AVAILABLE;
      if (values.availableQuantity === 0) {
        status = EquipmentStatus.OUT_OF_STOCK;
      }
      // Nếu imageUrl rỗng thì gán giá trị mặc định
      if (!values.imageUrl) {
        values.imageUrl = 'https://media.istockphoto.com/id/1077063744/vi/anh/m%C3%A1y-t%C3%ADnh-x%C3%A1ch-tay-%C4%91i%E1%BB%87n-tho%E1%BA%A1i-th%C3%B4ng-minh-m%C3%A1y-%E1%BA%A3nh-v%C3%A0-tai-nghe-%C4%91%C6%B0%E1%BB%A3c-c%C3%A1ch-ly-tr%C3%AAn-n%E1%BB%81n-tr%E1%BA%AFng.jpg?s=612x612&w=0&k=20&c=YpsrQL7BlRE40u9L-atuIOWkQYi6KS__-MSqi7Yw-JE=';
      }
      if (editingEquipment) {
        // Gọi API cập nhật thiết bị
        await dispatch(updateEquipmentById(editingEquipment.id, { ...editingEquipment, ...values, status }));
        dispatch(setAlert('Cập nhật thiết bị thành công', 'success'));
      } else {
        await dispatch(createEquipment({ ...values, status }));
        dispatch(setAlert('Thêm thiết bị thành công', 'success'));
      }
      setIsModalVisible(false);
    } catch (error) {
      dispatch(setAlert('Lưu thiết bị thất bại', 'error'));
    } finally {
      setConfirmLoading(false);
    }
  };
  
  const handleDelete = (equipment: Equipment) => {
    Modal.confirm({
      title: 'Xóa thiết bị',
      content: `Bạn có chắc chắn muốn xóa ${equipment.name}?`,
      okText: 'Có',
      okType: 'danger',
      cancelText: 'Không',
      onOk: async () => {
        await dispatch(deleteEquipmentById(equipment.id));
        dispatch(setAlert('Xóa thiết bị thành công', 'success'));
      },
    });
  };
  
  // Thiết bị lọc dựa trên tìm kiếm
  const filteredEquipment = items
    .filter((item: Equipment) => {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.category.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()); // Sort by creation date descending
  
  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Equipment, b: Equipment) => a.name.localeCompare(b.name),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      sorter: (a: Equipment, b: Equipment) => a.category.localeCompare(b.category),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_: string, record: Equipment) => (
        <span>{record.availableQuantity} / {record.totalQuantity}</span>
      ),
      sorter: (a: Equipment, b: Equipment) => a.availableQuantity - b.availableQuantity,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: string, record: Equipment) => (
        <StatusBadge status={record.status} type="equipment" />
      ),
      sorter: (a: Equipment, b: Equipment) => a.status.localeCompare(b.status),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: string, record: Equipment) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditIcon size={14} />}
            onClick={() => showEditModal(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<Trash2Icon size={14} />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];
  
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3}>Quản lý thiết bị</Title>
          <p className="text-gray-500">Thêm, sửa và quản lý kho thiết bị</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusIcon size={16} />}
          onClick={showAddModal}
        >
          Thêm thiết bị
        </Button>
      </div>
      
      <div className="mb-4">
        <Input 
          placeholder="Tìm kiếm thiết bị..." 
          prefix={<Search size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Table 
        columns={columns} 
        dataSource={filteredEquipment}
        rowKey="id"
        loading={loading}
        locale={{
          triggerDesc: 'Nhấn để sắp xếp giảm dần',
          triggerAsc: 'Nhấn để sắp xếp tăng dần',
          cancelSort: 'Bỏ sắp xếp',
          emptyText: 'Không có dữ liệu',
        }}
      />
      
      <Modal
        title={editingEquipment ? 'Sửa thiết bị' : 'Thêm thiết bị mới'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        cancelText="Hủy"
        okText={editingEquipment ? "Cập nhật" : "Thêm"}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên thiết bị"
            rules={[{ required: true, message: 'Vui lòng nhập tên thiết bị' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select>
              <Option value="Máy tính">Máy tính</Option>
              <Option value="Âm thanh - Hình ảnh">Âm thanh - Hình ảnh</Option>
              <Option value="Nhiếp ảnh">Nhiếp ảnh</Option>
              <Option value="Máy tính bảng">Máy tính bảng</Option>
              <Option value="Thể thao">Thể thao</Option>
              <Option value="Âm nhạc">Âm nhạc</Option>
              <Option value="Thiết bị phòng thí nghiệm">Thiết bị phòng thí nghiệm</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>
          
          <Space className="w-full">
            <Form.Item
              name="totalQuantity"
              label="Tổng số lượng"
              rules={[{ required: true, message: 'Vui lòng nhập tổng số lượng' }]}
              style={{ width: '100%' }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="availableQuantity"
              label="Số lượng có sẵn"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng có sẵn' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('totalQuantity') >= value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Available quantity cannot exceed total quantity'));
                  },
                }),
              ]}
              style={{ width: '100%' }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          
          <Form.Item
            name="condition"
            label="Tình trạng"
            rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
          >
            <Select>
              <Option value="Rất tốt">Rất tốt</Option>
              <Option value="Tốt">Tốt</Option>
              <Option value="Khá">Khá</Option>
              <Option value="Kém">Kém</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="imageUrl"
            label="Image URL (optional)"
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminEquipmentList;