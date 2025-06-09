import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Input, Select, Empty, Spin } from 'antd';
import { Search } from 'lucide-react';
import StudentLayout from '../../components/Layout/StudentLayout';
import EquipmentCard from '../../components/equipment/EquipmentCard';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchEquipment } from '../../store/slices/equipmentSlice';
import { Equipment, EquipmentStatus } from '../../types';

const { Title } = Typography;
const { Option } = Select;

const EquipmentList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.equipment);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | null>(null);
  
  useEffect(() => {
    dispatch(fetchEquipment());
  }, [dispatch]);
  
  // Extract unique categories from equipment
  const categories = Array.from(new Set(items.map(item => item.category)));
  
  // Filter equipment based on search and filters
  const filteredEquipment = items.filter((item: Equipment) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  return (
    <StudentLayout>
      <div className="mb-6">
        <Title level={3}>Danh mục thiết bị</Title>
        <p className="text-gray-500">Duyệt qua các thiết bị có sẵn để mượn</p>
      </div>
      
      <div className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input 
              placeholder="Tìm kiếm thiết bị..." 
              prefix={<Search size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col xs={12} md={8}>
            <Select
              placeholder="Lọc theo danh mục"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setCategoryFilter(value)}
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setStatusFilter(value)}
            >
              <Option value={EquipmentStatus.AVAILABLE}>Có sẵn</Option>
              <Option value={EquipmentStatus.OUT_OF_STOCK}>Hết hàng</Option>
              <Option value={EquipmentStatus.MAINTENANCE}>Bảo trì</Option>
            </Select>
          </Col>
        </Row>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : filteredEquipment.length === 0 ? (
        <Empty description="Không tìm thấy thiết bị" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredEquipment.map((equipment) => (
            <Col xs={24} sm={12} md={8} lg={6} key={equipment.id}>
              <EquipmentCard equipment={equipment} />
            </Col>
          ))}
        </Row>
      )}
    </StudentLayout>
  );
};

export default EquipmentList;