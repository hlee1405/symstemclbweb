import React, { useState, useEffect } from 'react';
import { Form, DatePicker, InputNumber, Button, Card, Space, Alert } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Equipment, RequestStatus } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createRequest } from '../../store/slices/requestSlice';
import { setAlert } from '../../store/slices/alertSlice';
import { fetchRequests } from '../../store/slices/requestSlice';

const { RangePicker } = DatePicker;

interface BorrowFormProps {
  equipment: Equipment;
  onSuccess: () => void;
}

const BorrowForm: React.FC<BorrowFormProps> = ({ equipment, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const { requests } = useAppSelector((state) => state.request);
  const requestError = useAppSelector((state) => state.request.error);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchRequests());
    }
  }, [dispatch, user?.id]);

  // Tổng số lượng thiết bị cùng loại đã mượn (PENDING hoặc APPROVED)
  const totalSameDeviceBorrowed = requests
    .filter(
      req => req.userId === user?.id &&
        (req.status === RequestStatus.APPROVED || req.status === RequestStatus.PENDING) &&
        req.equipmentId === equipment.id
    )
    .reduce((sum, req) => sum + (req.quantity || 0), 0);

  // Tổng số lượng thiết bị đã mượn (mọi loại, PENDING hoặc APPROVED)
  const totalAllDeviceBorrowed = requests
    .filter(
      req => req.userId === user?.id &&
        (req.status === RequestStatus.APPROVED || req.status === RequestStatus.PENDING)
    )
    .reduce((sum, req) => sum + (req.quantity || 0), 0);

  // // Kiểm tra giới hạn trước khi gửi
  // const checkLimits = (quantity: number) => {
  //   // Kiểm tra tổng số lượng cùng loại
  //   if (totalSameDeviceBorrowed + quantity > 2) {
  //     dispatch(setAlert('Bạn chỉ được mượn tối đa 2 thiết bị cùng loại (bao gồm cả đang chờ duyệt và đã duyệt).', 'error'));
  //     return false;
  //   }
  //   // Kiểm tra tổng số lượng tất cả thiết bị
  //   if (totalAllDeviceBorrowed + quantity > 3) {
  //     dispatch(setAlert('Bạn chỉ được mượn tối đa 3 thiết bị (bao gồm cả đang chờ duyệt và đã duyệt).', 'error'));
  //     return false;
  //   }
  //   return true;
  // };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const [borrowDate, returnDate]: [Dayjs, Dayjs] = values.dateRange;
      const quantity = values.quantity;
      // Kiểm tra giới hạn trước khi gửi
      if (totalSameDeviceBorrowed + quantity > 2 || totalAllDeviceBorrowed + quantity > 3) {
        dispatch(setAlert('Gửi yêu cầu thất bại, bạn đã yêu cầu mượn vượt quá số lượng cho phép', 'error'));
        setLoading(false);
        return;
      }
      await dispatch(
        createRequest({
          userId: user?.id || '',
          userName: user?.name || '',
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          quantity: quantity,
          borrowDate: borrowDate.format('YYYY-MM-DD'),
          returnDate: returnDate.format('YYYY-MM-DD'),
        })
      );
      if (!requestError) {
        dispatch(setAlert('Đã gửi yêu cầu mượn thành công', 'success'));
        form.resetFields();
        onSuccess();
      } else {
        dispatch(setAlert('Gửi yêu cầu mượn thất bại', 'error'));
      }
    } catch (error) {
      dispatch(setAlert('Gửi yêu cầu mượn thất bại', 'error'));
    } finally {
      setLoading(false);
    }
  };

  // Disallow dates in the past
  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <Card title="Yêu cầu mượn" className="mb-4">
      {equipment.availableQuantity === 0 ? (
        <Alert
          message="Thiết bị hiện không khả dụng"
          description="Hiện không có đơn vị nào có sẵn để mượn. Vui lòng kiểm tra lại sau."
          type="warning"
          showIcon
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            quantity: 1,
          }}
        >
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              {
                type: 'number',
                min: 1,
                message: `Số lượng tối đa là ${equipment.availableQuantity}`,
              },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Ngày mượn và trả"
            rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              disabledDate={disabledDate}
              format="YYYY-MM-DD"
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={totalSameDeviceBorrowed >= 2 || totalAllDeviceBorrowed >= 3}
              >
                Gửi yêu cầu
              </Button>
              <Button onClick={() => form.resetFields()}>
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
          <Alert
            message="Lưu ý"
            description="Yêu cầu của bạn sẽ được quản trị viên xem xét. Bạn sẽ nhận được thông báo khi yêu cầu được duyệt."
            type="info"
            showIcon
          />
        </Form>
      )}
    </Card>
  );
};

export default BorrowForm;
