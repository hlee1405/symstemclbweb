import React, { useEffect, useState } from 'react';
import { Typography, Button, Table, Space, Input, Modal, Form, InputNumber, Select, Badge } from 'antd';
import { PlusIcon, Search, EditIcon, Trash2Icon } from 'lucide-react';
import AdminLayout from '../../components/Layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchEquipment, addEquipment, updateEquipmentById, deleteEquipmentById, createEquipment } from '../../store/slices/equipmentSlice';
import { Equipment, EquipmentStatus } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import { setAlert } from '../../store/slices/alertSlice';
import moment from 'moment';
import { TableProps } from 'antd';
import viVN from 'antd/es/locale/vi_VN';

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
      
      // Set equipment status based on available quantity
      let status = EquipmentStatus.AVAILABLE;
      if (values.availableQuantity === 0) {
        status = EquipmentStatus.OUT_OF_STOCK;
      }
      // Nếu imageUrl rỗng thì gán giá trị mặc định
      if (!values.imageUrl) {
        values.imageUrl = 'https://images.pexels.com/photos/2720447/pexels-photo-2720447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
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
  
  // Filter equipment based on search
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
      render: (text: string, record: Equipment) => (
        <span>{record.availableQuantity} / {record.totalQuantity}</span>
      ),
      sorter: (a: Equipment, b: Equipment) => a.availableQuantity - b.availableQuantity,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (text: string, record: Equipment) => (
        <StatusBadge status={record.status} type="equipment" />
      ),
      sorter: (a: Equipment, b: Equipment) => a.status.localeCompare(b.status),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (text: string, record: Equipment) => (
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
              <Option value="Computers">Máy tính</Option>
              <Option value="Audio Visual">Âm thanh - Hình ảnh</Option>
              <Option value="Photography">Nhiếp ảnh</Option>
              <Option value="Tablets">Máy tính bảng</Option>
              <Option value="Sports">Thể thao</Option>
              <Option value="Music">Âm nhạc</Option>
              <Option value="Lab Equipment">Thiết bị phòng thí nghiệm</Option>
              <Option value="Other">Khác</Option>
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
              <Option value="Excellent">Rất tốt</Option>
              <Option value="Good">Tốt</Option>
              <Option value="Fair">Khá</Option>
              <Option value="Poor">Kém</Option>
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