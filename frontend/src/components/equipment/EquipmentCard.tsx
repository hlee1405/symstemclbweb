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
  const defaultImage = 'https://images.pexels.com/photos/2720447/pexels-photo-2720447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  
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
              disabled={status === EquipmentStatus.OUT_OF_STOCK}
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