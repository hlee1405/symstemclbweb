import React, { useState } from 'react';
import { List, Badge, Typography, Empty, Button, Modal, Space } from 'antd';
import { CheckCircleIcon, AlertTriangleIcon, ClockIcon, CheckIcon } from 'lucide-react';
import moment from 'moment';
import { BorrowRequest, RequestStatus } from '../../types';

const { Text } = Typography;

interface NotificationListProps {
  requests: BorrowRequest[];
  readNotifications: Set<string>;
  onReadChange: (readSet: Set<string>) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ requests, readNotifications, onReadChange, onMarkAsRead, onMarkAllAsRead }) => {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // Tạo danh sách thông báo, luôn gửi cả hai nếu vừa được duyệt và sắp đến hạn
  const notifications = requests.flatMap(req => {
    if (req.status === RequestStatus.APPROVED) {
      const isNewlyApproved = moment().diff(moment(req.approvedDate), 'hours') < 24;
      const daysDiff = moment(req.returnDate).startOf('day').diff(moment().startOf('day'), 'days');
      const result = [];
      if (isNewlyApproved) {
        result.push({ ...req, notificationType: 'approval' as const });
      }
      if (daysDiff === 1 || daysDiff === 0 || daysDiff < 0) {
        result.push({ ...req, notificationType: 'return' as const });
      }
      return result;
    }
    return [];
  }).sort((a, b) => {
    // Ưu tiên thông báo duyệt trước nếu cùng request
    if (a.id === b.id) {
      if (a.notificationType === 'approval') return -1;
      if (b.notificationType === 'approval') return 1;
    }
    // Nếu khác request, sắp xếp theo thời gian
    const dateA = a.approvedDate || a.returnDate;
    const dateB = b.approvedDate || b.returnDate;
    return moment(dateB).valueOf() - moment(dateA).valueOf();
  });

  const getNotificationIcon = (notification: any) => {
    if (notification.notificationType === 'approval') {
      return <CheckCircleIcon className="text-green-500" />;
    }
    if (notification.notificationType === 'return') {
      const daysDiff = moment(notification.returnDate).startOf('day').diff(moment().startOf('day'), 'days');
      if (daysDiff < 0) {
        return <AlertTriangleIcon className="text-red-500" />;
      }
      if (daysDiff === 0 || daysDiff === 1) {
        return <ClockIcon className="text-yellow-500" />;
      }
    }
    // fallback: icon cảnh báo nhẹ hoặc null
    return <ClockIcon className="text-yellow-500" />;
  };

  const getNotificationMessage = (notification: any) => {
    if (notification.notificationType === 'approval') {
      return `Yêu cầu mượn thiết bị "${notification.equipmentName}" đã được duyệt`;
    }
    if (notification.notificationType === 'return') {
      const daysDiff = moment(notification.returnDate).startOf('day').diff(moment().startOf('day'), 'days');
      if (daysDiff === 1) {
        return `Thiết bị "${notification.equipmentName}" sắp đến hạn trả vào ngày mai`;
      }
      if (daysDiff === 0) {
        return `Hôm nay là hạn trả thiết bị "${notification.equipmentName}"`;
      }
      if (daysDiff < 0) {
        return `Thiết bị "${notification.equipmentName}" đã quá hạn trả`;
      }
    }
    return '';
  };

  const getNotificationDetail = (notification: any) => {
    if (notification.notificationType === 'approval') {
      return {
        title: (
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 0, textTransform: 'none', lineHeight: 1.3 }}>
            {`Yêu cầu mượn thiết bị "${notification.equipmentName}" đã được duyệt`}
          </div>
        ),
        content: (
          <>
            <div style={{ fontSize: 16, color: '#222', lineHeight: 1.7 }}>
              <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Thiết bị:</span> {notification.equipmentName}</div>
              <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Số lượng:</span> {notification.quantity}</div>
              <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ngày mượn:</span> {moment(notification.borrowDate).format('DD/MM/YYYY')}</div>
              <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Hạn trả:</span> {moment(notification.returnDate).format('DD/MM/YYYY')}</div>
              {notification.actualBorrowDate && (
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ngày mượn thực tế:</span> {moment(notification.actualBorrowDate).format('DD/MM/YYYY')}</div>
              )}
              {notification.actualReturnDate && (
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ngày trả thực tế:</span> {moment(notification.actualReturnDate).format('DD/MM/YYYY')}</div>
              )}
              {notification.notes && (
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ghi chú:</span> {notification.notes}</div>
              )}
            </div>
          </>
        )
      };
    }
    if (notification.notificationType === 'return') {
      const daysDiff = moment(notification.returnDate).startOf('day').diff(moment().startOf('day'), 'days');
      if (daysDiff < 0) {
        // Quá hạn
        return {
          title: (
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 0, textTransform: 'none', lineHeight: 1.3 }}>
              {`Thiết bị "${notification.equipmentName}" đã quá hạn trả`}
            </div>
          ),
          content: (
            <>
              <div style={{ fontSize: 16, color: '#222', lineHeight: 1.7 }}>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Thiết bị:</span> {notification.equipmentName}</div>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Số lượng:</span> {notification.quantity}</div>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ngày mượn:</span> {moment(notification.borrowDate).format('DD/MM/YYYY')}</div>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Hạn trả:</span> {moment(notification.returnDate).format('DD/MM/YYYY')}</div>
                {notification.actualBorrowDate && (
                  <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ngày mượn thực tế:</span> {moment(notification.actualBorrowDate).format('DD/MM/YYYY')}</div>
                )}
                {notification.actualReturnDate && (
                  <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ngày trả thực tế:</span> {moment(notification.actualReturnDate).format('DD/MM/YYYY')}</div>
                )}
                {notification.notes && (
                  <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ghi chú:</span> {notification.notes}</div>
                )}
                <div style={{ color: '#ff3b30', fontWeight: 600, marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangleIcon className="inline mr-1" />
                  Thiết bị đã quá hạn trả {Math.abs(daysDiff)} ngày
                </div>
                <div style={{ marginTop: 16, background: '#fffbe6', padding: 12, borderRadius: 6, border: '1px solid #ffe58f' }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>Kính gửi bạn,</div>
                  <div>
                    Thiết bị bạn đã mượn đã quá hạn trả. Vui lòng liên hệ với quản trị viên hoặc trả thiết bị sớm nhất có thể để tránh ảnh hưởng đến quyền lợi sử dụng thiết bị của các sinh viên khác.
                  </div>
                </div>
              </div>
            </>
          )
        };
      }
      if (daysDiff === 0) {
        // Hôm nay là hạn trả
        return {
          title: (
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 0, textTransform: 'none', lineHeight: 1.3 }}>
              {`Hôm nay là hạn trả thiết bị "${notification.equipmentName}"`}
            </div>
          ),
          content: (
            <>
              <div style={{ fontSize: 16, color: '#222', lineHeight: 1.7 }}>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Thiết bị:</span> {notification.equipmentName}</div>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Số lượng:</span> {notification.quantity}</div>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ngày mượn:</span> {moment(notification.borrowDate).format('DD/MM/YYYY')}</div>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Hạn trả:</span> {moment(notification.returnDate).format('DD/MM/YYYY')}</div>
                {notification.actualBorrowDate && (
                  <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ngày mượn thực tế:</span> {moment(notification.actualBorrowDate).format('DD/MM/YYYY')}</div>
                )}
                {notification.actualReturnDate && (
                  <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ngày trả thực tế:</span> {moment(notification.actualReturnDate).format('DD/MM/YYYY')}</div>
                )}
                {notification.notes && (
                  <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ghi chú:</span> {notification.notes}</div>
                )}
                <div style={{ color: '#faad14', fontWeight: 600, marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ClockIcon className="inline mr-1" />
                  Hôm nay là hạn trả thiết bị, vui lòng trả đúng hạn
                </div>
                <div style={{ marginTop: 16, background: '#fffbe6', padding: 12, borderRadius: 6, border: '1px solid #ffe58f' }}>
                  <div>
                    Vui lòng trả thiết bị đúng hạn để tránh ảnh hưởng đến quyền lợi sử dụng thiết bị của các sinh viên khác.
                  </div>
                </div>
              </div>
            </>
          )
        };
      }
      if (daysDiff === 1) {
        // Sắp đến hạn
        return {
          title: (
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 0, textTransform: 'none', lineHeight: 1.3 }}>
              {`Thiết bị "${notification.equipmentName}" sắp đến hạn trả vào ngày mai`}
            </div>
          ),
          content: (
            <>
              <div style={{ fontSize: 16, color: '#222', lineHeight: 1.7 }}>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Thiết bị:</span> {notification.equipmentName}</div>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Số lượng:</span> {notification.quantity}</div>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ngày mượn:</span> {moment(notification.borrowDate).format('DD/MM/YYYY')}</div>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Hạn trả:</span> {moment(notification.returnDate).format('DD/MM/YYYY')}</div>
                {notification.actualBorrowDate && (
                  <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ngày mượn thực tế:</span> {moment(notification.actualBorrowDate).format('DD/MM/YYYY')}</div>
                )}
                {notification.actualReturnDate && (
                  <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ngày trả thực tế:</span> {moment(notification.actualReturnDate).format('DD/MM/YYYY')}</div>
                )}
                {notification.notes && (
                  <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Ghi chú:</span> {notification.notes}</div>
                )}
                <div style={{ color: '#faad14', fontWeight: 600, marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ClockIcon className="inline mr-1" />
                  Thiết bị sắp đến hạn trả
                </div>
                <div style={{ marginTop: 16, background: '#fffbe6', padding: 12, borderRadius: 6, border: '1px solid #ffe58f' }}>
                  <div>
                    Vui lòng trả thiết bị đúng hạn để tránh ảnh hưởng đến quyền lợi sử dụng thiết bị của các sinh viên khác.
                  </div>
                </div>
              </div>
            </>
          )
        };
      }
      // fallback: không trả về rỗng, có thể trả về thông báo chung hoặc null
      return {
        title: 'Thông báo',
        content: 'Không có nội dung chi tiết cho thông báo này.'
      };
    }
    // fallback
    return { title: '', content: '' };
  };

  // Khi đọc/xem chi tiết thì cập nhật trạng thái đã đọc và callback lên trên
  const handleMarkAsRead = (id: string) => {
    if (!readNotifications.has(id)) {
      const newSet = new Set(readNotifications);
      newSet.add(id);
      onReadChange(newSet);
      onMarkAsRead(id);
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const newSet = new Set(readNotifications);
    allIds.forEach(id => newSet.add(id));
    onReadChange(newSet);
    onMarkAllAsRead();
  };

  const handleViewDetail = (notification: any) => {
    setSelectedNotification(notification);
    handleMarkAsRead(notification.id);
  };

  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;

  if (notifications.length === 0) {
    return <Empty description="Không có thông báo mới" />;
  }

  return (
    <div className="w-80">
      <div
        style={{
          maxHeight: 384,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f3f3f3',
        }}
        className="notification-scrollbar"
      >
        <style>{`
          .notification-scrollbar::-webkit-scrollbar {
            width: 8px;
            background: #f3f3f3;
            border-radius: 8px;
          }
          .notification-scrollbar::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 8px;
          }
        `}</style>
        <List
          dataSource={notifications}
          renderItem={item => (
            <List.Item
              className={`cursor-pointer hover:bg-gray-50 ${readNotifications.has(item.id) ? 'opacity-60' : ''}`}
              onClick={() => handleViewDetail(item)}
            >
              <List.Item.Meta
                avatar={getNotificationIcon(item)}
                title={getNotificationMessage(item)}
                description={
                  <Space>
                    <Text type="secondary">
                      {moment(item.returnDate).format('DD/MM/YYYY')}
                    </Text>
                    {!readNotifications.has(item.id) && (
                      <Badge status="processing" />
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </div>
      <div className="flex justify-between items-center mt-2 px-2">
        <Text type="secondary">Thông báo ({unreadCount})</Text>
        <Button 
          type="link" 
          size="small"
          onClick={handleMarkAllAsRead}
          icon={<CheckIcon size={14} />}
        >
          Đánh dấu đã đọc
        </Button>
      </div>
      <Modal
        title={selectedNotification ? getNotificationDetail(selectedNotification).title : ''}
        open={!!selectedNotification}
        onCancel={() => setSelectedNotification(null)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setSelectedNotification(null)}
              style={{
                background: '#ffffff',
                color: '#333',
                border: '1px solid #ccc',
                padding: '5px 24px',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                borderRadius: 6,
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Đóng
            </button>
          </div>
        }
        bodyStyle={{
          padding: 24,
          background: '#fff',
          position: 'relative',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
        }}
        style={{
          minWidth: 400,
          maxWidth: 500,
          overflow: 'hidden',
        }}
      >
        {selectedNotification && (
          <div
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: '#333',
              whiteSpace: 'pre-wrap',
            }}
          >
            {getNotificationDetail(selectedNotification).content}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotificationList;