import React, { useEffect } from 'react';
import { Alert, Space } from 'antd';
import { useAppSelector } from '../../hooks/redux';

const AlertList: React.FC = () => {
  const { alerts } = useAppSelector((state) => state.alert);
  
  // Optional: scroll to top when a new alert appears
  useEffect(() => {
    if (alerts.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [alerts.length]);
  
  if (alerts.length === 0) {
    return null;
  }
  
  return (
    <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          showIcon
          closable
        />
      ))}
    </Space>
  );
};

export default AlertList;