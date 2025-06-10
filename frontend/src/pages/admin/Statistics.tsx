import React, { useEffect, useState } from 'react';
import { Typography, Card, Space, DatePicker, Spin, Empty, Alert, Radio } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from '../../components/Layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchRequests } from '../../store/slices/requestSlice';
import { fetchEquipment } from '../../store/slices/equipmentSlice';
import { RequestStatus } from '../../types';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type ChartType = 'bar' | 'pie';

const AdminStatistics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { requests, loading: requestsLoading } = useAppSelector(state => state.request);
  const { items: equipment, loading: equipmentLoading } = useAppSelector(state => state.equipment);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  
  useEffect(() => {
    dispatch(fetchRequests());
    dispatch(fetchEquipment());
  }, [dispatch]);
  
  const loading = requestsLoading || equipmentLoading;
  
  // Tạo số liệu thống kê dựa trên yêu cầu và phạm vi ngày
  const generateEquipmentStats = () => {
    // Lọc yêu cầu theo phạm vi ngày và trạng thái (chỉ tính số đã mượn và trả lại)
    const filteredRequests = requests.filter(req => {
      const requestDate = moment(req.requestDate);
      return (req.status === RequestStatus.APPROVED || req.status === RequestStatus.RETURNED) &&
             requestDate.isAfter(moment(dateRange[0].toDate())) &&
             requestDate.isBefore(moment(dateRange[1].toDate()));
    });
    
    // Đếm yêu cầu theo thiết bị
    const equipmentCounts = new Map<string, number>();
    filteredRequests.forEach(req => {
      const count = equipmentCounts.get(req.equipmentId) || 0;
      equipmentCounts.set(req.equipmentId, count + req.quantity);
    });
    
    // Chuyển đổi sang dữ liệu biểu đồ
    const chartData = Array.from(equipmentCounts.entries())
      .map(([equipmentId, count]) => {
        const equipmentItem = equipment.find(e => e.id === equipmentId);
        return {
          name: equipmentItem?.name || 'Unknown Equipment',
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 được vay nhiều nhất
    
    return chartData;
  };
  
  // Tạo số liệu thống kê theo danh mục
  const generateCategoryStats = () => {
    // Lọc yêu cầu theo phạm vi ngày và trạng thái
    const filteredRequests = requests.filter(req => {
      const requestDate = moment(req.requestDate);
      return (req.status === RequestStatus.APPROVED || req.status === RequestStatus.RETURNED) &&
             requestDate.isAfter(moment(dateRange[0].toDate())) &&
             requestDate.isBefore(moment(dateRange[1].toDate()));
    });
    
    // Nhận danh mục cho từng thiết bị
    const categoryCounts = new Map<string, number>();
    
    filteredRequests.forEach(req => {
      const equipmentItem = equipment.find(e => e.id === req.equipmentId);
      if (equipmentItem) {
        const category = equipmentItem.category;
        const count = categoryCounts.get(category) || 0;
        categoryCounts.set(category, count + req.quantity);
      }
    });
    
    // Chuyển đổi sang dữ liệu biểu đồ
    const chartData = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({
        name: category,
        count
      }))
      .sort((a, b) => b.count - a.count);
    
    return chartData;
  };
  
  // Thống kê tháng hiện tại
  const generateMonthlyStats = () => {
    const currentMonth = dayjs().format('MMMM YYYY');
    
    // Lọc yêu cầu cho tháng hiện tại
    const currentMonthRequests = requests.filter(req => {
      return dayjs(req.requestDate).format('MMMM YYYY') === currentMonth &&
             (req.status === RequestStatus.APPROVED || req.status === RequestStatus.RETURNED);
    });
    
    // Tổng số thiết bị mượn trong tháng này
    const totalBorrowed = currentMonthRequests.reduce((sum, req) => sum + req.quantity, 0);
    
    // Đếm số người dùng duy nhất
    const uniqueUsers = new Set(currentMonthRequests.map(req => req.userId)).size;
    
    // Thiết bị được mượn nhiều nhất
    const equipmentCounts = new Map<string, number>();
    currentMonthRequests.forEach(req => {
      const count = equipmentCounts.get(req.equipmentId) || 0;
      equipmentCounts.set(req.equipmentId, count + req.quantity);
    });
    
    let mostBorrowedEquipment = { name: 'None', count: 0 };
    if (equipmentCounts.size > 0) {
      const [equipmentId, count] = Array.from(equipmentCounts.entries())
        .sort((a, b) => b[1] - a[1])[0];
      const equipmentItem = equipment.find(e => e.id === equipmentId);
      mostBorrowedEquipment = {
        name: equipmentItem?.name || 'Unknown',
        count
      };
    }
    
    return {
      totalBorrowed,
      uniqueUsers,
      mostBorrowedEquipment
    };
  };
  
  const equipmentStats = generateEquipmentStats();
  const categoryStats = generateCategoryStats();
  const monthlyStats = generateMonthlyStats();
  
  // Màu sắc cho biểu đồ
  const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#52c41a'];
  
  // Thêm hàm custom label chỉ hiện phần trăm ở giữa miếng bánh
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
      >
        {percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
      </text>
    );
  };
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <Title level={3}>Thống kê mượn thiết bị</Title>
        <p className="text-gray-500">
          Phân tích mẫu hình và xu hướng sử dụng thiết bị
        </p>
      </div>
      
      <Card className="mb-6">
        <Space direction="vertical" size="middle" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <Text strong>Khoảng thời gian:</Text>
            <RangePicker 
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
              className="mb-4 md:mb-0"
            />
          </div>
          <Alert
            message="Tổng kết tháng hiện tại"
            description={
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                  <Text type="secondary">Tổng số thiết bị đã mượn:</Text>
                  <div className="text-xl font-bold">{monthlyStats.totalBorrowed}</div>
                </div>
                <div>
                  <Text type="secondary">Số người dùng duy nhất:</Text>
                  <div className="text-xl font-bold">{monthlyStats.uniqueUsers}</div>
                </div>
                <div>
                  <Text type="secondary">Thiết bị được mượn nhiều nhất:</Text>
                  <div className="text-xl font-bold">{monthlyStats.mostBorrowedEquipment.name}</div>
                  <div className="text-sm">({monthlyStats.mostBorrowedEquipment.count} lần)</div>
                </div>
              </div>
            }
            type="info"
            showIcon
          />
        </Space>
      </Card>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Thiết bị được mượn nhiều nhất">
            {equipmentStats.length === 0 ? (
              <Empty description="Không có dữ liệu cho khoảng thời gian đã chọn" />
            ) : (
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={equipmentStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                    >
                      {equipmentStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Số lần mượn']}
                      labelFormatter={(label) => equipmentStats.find(item => item.count === label)?.name || ''}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
          
          <Card title="Mượn theo danh mục">
            {categoryStats.length === 0 ? (
              <Empty description="Không có dữ liệu cho khoảng thời gian đã chọn" />
            ) : (
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                    >
                      {categoryStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Số lần mượn']}
                      labelFormatter={(label) => categoryStats.find(item => item.count === label)?.name || ''}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminStatistics;