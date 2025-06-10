import React from 'react';
import { Card, Badge, Button, Tooltip } from 'antd';
import { InfoIcon, CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Equipment, EquipmentStatus } from '../../types';
import StatusBadge from '../common/StatusBadge';

const { Meta } = Card;

interface EquipmentCardProps {
  equipment: Equipment;
  isAdmin?: boolean;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, isAdmin = false }) => {
  const navigate = useNavigate();
  const { id, name, description, imageUrl, availableQuantity, totalQuantity, status } = equipment;

  // Default image if none provided
  const defaultImage = 'https://media.istockphoto.com/id/1077063744/vi/anh/m%C3%A1y-t%C3%ADnh-x%C3%A1ch-tay-%C4%91i%E1%BB%87n-tho%E1%BA%A1i-th%C3%B4ng-minh-m%C3%A1y-%E1%BA%A3nh-v%C3%A0-tai-nghe-%C4%91%C6%B0%E1%BB%A3c-c%C3%A1ch-ly-tr%C3%AAn-n%E1%BB%81n-tr%E1%BA%AFng.jpg?s=612x612&w=0&k=20&c=YpsrQL7BlRE40u9L-atuIOWkQYi6KS__-MSqi7Yw-JE=';
  
  const handleViewDetails = () => {
    if (isAdmin) {
      navigate(`/admin/equipment/${id}`);
    } else {
      navigate(`/equipment/${id}`);
    }
  };
  
  const handleBorrow = () => {
    navigate(`/equipment/${id}`);
  };
  
  return (
    <Card
      hoverable
      className="equipment-card"
      cover={
        <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          <img 
            alt={name} 
            src={imageUrl || defaultImage} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div 
            style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px',
            }}
          >
            <StatusBadge status={status} type="equipment" />
          </div>
        </div>
      }
      actions={[
        <Tooltip title="Xem chi tiết">
          <Button 
            type="text" 
            icon={<InfoIcon size={16} />}
            onClick={handleViewDetails}
          >
            Chi tiết
          </Button>
        </Tooltip>,
        !isAdmin && status !== EquipmentStatus.OUT_OF_STOCK && (
          <Tooltip title="Mượn thiết bị">
            <Button 
              type="text" 
              icon={<CalendarIcon size={16} />}
              onClick={handleBorrow}
              disabled={availableQuantity === 0}
            >
              Mượn
            </Button>
          </Tooltip>
        )
      ].filter(Boolean)}
    >
      <Meta
        title={name}
        description={
          <div>
            <p className="truncate">{description}</p>
            <div className="mt-2">
              <Badge 
                status={availableQuantity > 0 ? "success" : "error"} 
                text={`${availableQuantity}/${totalQuantity} có sẵn`} 
              />
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default EquipmentCard;