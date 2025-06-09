import React from 'react';
import { Tag } from 'antd';
import { RequestStatus, EquipmentStatus } from '../../types';

interface StatusBadgeProps {
  status: RequestStatus | EquipmentStatus;
  type: 'request' | 'equipment';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const requestStatusConfig: Record<RequestStatus, { color: string; text: string }> = {
    [RequestStatus.PENDING]: { color: 'orange', text: 'Đang chờ' },
    [RequestStatus.APPROVED]: { color: 'green', text: 'Đã duyệt' },
    [RequestStatus.REJECTED]: { color: 'red', text: 'Từ chối' },
    [RequestStatus.RETURNED]: { color: 'blue', text: 'Đã trả' },
    [RequestStatus.OVERDUE]: { color: 'magenta', text: 'Quá hạn' },
    [RequestStatus.CANCELED]: { color: 'volcano', text: 'Đã hủy' },
  };
  
  const equipmentStatusConfig: Record<EquipmentStatus, { color: string; text: string }> = {
    [EquipmentStatus.AVAILABLE]: { color: 'green', text: 'Có sẵn' },
    [EquipmentStatus.OUT_OF_STOCK]: { color: 'red', text: 'Hết hàng' },
    [EquipmentStatus.MAINTENANCE]: { color: 'purple', text: 'Bảo trì' },
  };

  const defaultConfig = { color: 'default', text: 'Unknown' };
  
  const config = type === 'request' 
    ? requestStatusConfig[status as RequestStatus] || defaultConfig
    : equipmentStatusConfig[status as EquipmentStatus] || defaultConfig;
  
  return (
    <Tag color={config.color}>{config.text}</Tag>
  );
};

export default StatusBadge;
