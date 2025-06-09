import React, { useEffect, useState } from 'react';
import { Typography, Card, Space, DatePicker, Spin, Empty, Alert, Radio } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from '../../components/Layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchRequests } from '../../store/slices/requestSlice';
import { fetchEquipment } from '../../store/slices/equipmentSlice';
import { RequestStatus } from '../../types';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type ChartType = 'bar' | 'pie';

const AdminStatistics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { requests, loading: requestsLoading } = useAppSelector(state => state.request);
  const { items: equipment, loading: equipmentLoading } = useAppSelector(state => state.equipment);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  
  useEffect(() => {
    dispatch(fetchRequests());
    dispatch(fetchEquipment());
  }, [dispatch]);
  
  const loading = requestsLoading || equipmentLoading;
  
  // Generate statistics based on requests and date range
  const generateEquipmentStats = () => {
    // Filter requests by date range and status (only count borrowed and returned)
    const filteredRequests = requests.filter(req => {
      const requestDate = moment(req.requestDate);
      return (req.status === RequestStatus.BORROWED || req.status === RequestStatus.RETURNED) &&
             requestDate.isAfter(dateRange[0]) &&
             requestDate.isBefore(dateRange[1]);
    });
    
    // Count requests by equipment
    const equipmentCounts = new Map<string, number>();
    filteredRequests.forEach(req => {
      const count = equipmentCounts.get(req.equipmentId) || 0;
      equipmentCounts.set(req.equipmentId, count + req.quantity);
    });
    
    // Convert to chart data
    const chartData = Array.from(equipmentCounts.entries())
      .map(([equipmentId, count]) => {
        const equipmentItem = equipment.find(e => e.id === equipmentId);
        return {
          name: equipmentItem?.name || 'Unknown Equipment',
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 most borrowed
    
    return chartData;
  };
  
  // Generate statistics by category
  const generateCategoryStats = () => {
    // Filter requests by date range and status
    const filteredRequests = requests.filter(req => {
      const requestDate = moment(req.requestDate);
      return (req.status === RequestStatus.APPROVED || req.status === RequestStatus.RETURNED) &&
             requestDate.isAfter(dateRange[0]) &&
             requestDate.isBefore(dateRange[1]);
    });
    
    // Get category for each equipment
    const categoryCounts = new Map<string, number>();
    
    filteredRequests.forEach(req => {
      const equipmentItem = equipment.find(e => e.id === req.equipmentId);
      if (equipmentItem) {
        const category = equipmentItem.category;
        const count = categoryCounts.get(category) || 0;
        categoryCounts.set(category, count + req.quantity);
      }
    });
    
    // Convert to chart data
    const chartData = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({
        name: category,
        count
      }))
      .sort((a, b) => b.count - a.count);
    
    return chartData;
  };
  
  // Current month statistics
  const generateMonthlyStats = () => {
    const currentMonth = moment().format('MMMM YYYY');
    
    // Filter requests for current month
    const currentMonthRequests = requests.filter(req => {
      return moment(req.requestDate).format('MMMM YYYY') === currentMonth &&
             (req.status === RequestStatus.APPROVED || req.status === RequestStatus.RETURNED);
    });
    
    // Total equipment borrowed this month
    const totalBorrowed = currentMonthRequests.reduce((sum, req) => sum + req.quantity, 0);
    
    // Count unique users
    const uniqueUsers = new Set(currentMonthRequests.map(req => req.userId)).size;
    
    // Most borrowed equipment
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
  
  // Colors for charts
  const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#52c41a'];
  
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
              onChange={(dates) => dates && setDateRange(dates as [moment.Moment, moment.Moment])}
              className="mb-4 md:mb-0"
            />
            <Radio.Group 
              value={chartType} 
              onChange={e => setChartType(e.target.value)}
              optionType="button"
            >
              <Radio.Button value="bar">Biểu đồ cột</Radio.Button>
              <Radio.Button value="pie">Biểu đồ tròn</Radio.Button>
            </Radio.Group>
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
                {chartType === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={equipmentStats}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Số lần mượn" fill="#1890ff" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={equipmentStats}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {equipmentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [value, 'Số lần mượn']}
                        labelFormatter={(label) => equipmentStats.find(item => item.count === label)?.name || ''}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </Card>
          
          <Card title="Mượn theo danh mục">
            {categoryStats.length === 0 ? (
              <Empty description="Không có dữ liệu cho khoảng thời gian đã chọn" />
            ) : (
              <div style={{ height: 400 }}>
                {chartType === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryStats}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Số lần mượn" fill="#52c41a" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [value, 'Số lần mượn']}
                        labelFormatter={(label) => categoryStats.find(item => item.count === label)?.name || ''}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminStatistics;