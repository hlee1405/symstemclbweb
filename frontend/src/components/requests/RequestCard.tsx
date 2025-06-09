import React from 'react';
import { Card, Space, Button, Typography, Descriptions } from 'antd';
import { CalendarIcon, CheckCircleIcon, XCircleIcon, ArrowRightCircleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { BorrowRequest, RequestStatus } from '../../types';
import StatusBadge from '../common/StatusBadge';

const { Text } = Typography;

interface RequestCardProps {
  request: BorrowRequest;
  isAdmin?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onMarkBorrowed?: (id: string) => void;
  onMarkReturned?: (id: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ 
  request, 
  isAdmin = false,
  onApprove,
  onReject,
  onMarkBorrowed,
  onMarkReturned
}) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    if (isAdmin) {
      navigate(`/admin/requests/${request.id}`);
    }
  };
  
  // Check if request is overdue
  const isOverdue = () => {
    if (request.status === RequestStatus.APPROVED) {
      const today = moment();
      const returnDate = moment(request.returnDate);
      return today.isAfter(returnDate);
    }
    return false;
  };
  
  // Render status badge with overdue check
  const renderStatus = () => {
    if (isOverdue()) {
      return <StatusBadge status={RequestStatus.OVERDUE} type="request" />;
    }
    return <StatusBadge status={request.status} type="request" />;
  };
  
  return (
    <Card 
      className="mb-4"
      title={
        <Space>
          <Text strong>{request.equipmentName}</Text>
          {renderStatus()}
        </Space>
      }
      extra={
        <Button type="link" onClick={handleViewDetails}>
          Xem chi tiết
        </Button>
      }
    >
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Số lượng">{request.quantity}</Descriptions.Item>
        <Descriptions.Item label="Ngày yêu cầu">{request.requestDate}</Descriptions.Item>
        <Descriptions.Item label="Ngày mượn">{request.borrowDate}</Descriptions.Item>
        <Descriptions.Item label="Ngày trả">{request.returnDate}</Descriptions.Item>
        {request.actualBorrowDate && (
          <Descriptions.Item label="Ngày mượn thực tế">{request.actualBorrowDate}</Descriptions.Item>
        )}
        {request.actualReturnDate && (
          <Descriptions.Item label="Ngày trả thực tế">{request.actualReturnDate}</Descriptions.Item>
        )}
        {isAdmin && (
          <Descriptions.Item label="Người yêu cầu">{request.userName}</Descriptions.Item>
        )}
      </Descriptions>
      
      {isAdmin && (
        <div className="mt-4 flex justify-end space-x-2">
          {request.status === RequestStatus.PENDING && (
            <>
              <Button 
                type="primary" 
                icon={<CheckCircleIcon size={16} />} 
                onClick={() => onApprove?.(request.id)}
              >
                Duyệt
              </Button>
              <Button 
                danger 
                icon={<XCircleIcon size={16} />} 
                onClick={() => onReject?.(request.id)}
              >
                Từ chối
              </Button>
            </>
          )}
          
          {/* {request.status === RequestStatus.APPROVED && (
            <Button 
              type="primary" 
              icon={<CheckCircleIcon size={16} />} 
              onClick={() => onMarkReturned?.(request.id)}
              className={isOverdue() ? 'bg-red-500 hover:bg-red-600 border-red-500' : ''}
            >
              Đánh dấu đã trả
            </Button>
          )} */}
        </div>
      )}
    </Card>
  );
};

export default RequestCard;