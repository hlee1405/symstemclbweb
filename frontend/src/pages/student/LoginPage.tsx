import React from 'react';
import { Card, Form, Input, Button, Typography, Divider, Alert } from 'antd';
import { UserIcon, LockIcon, BoxIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { loginStudent } from '../../store/slices/authSlice';

const { Title, Text } = Typography;

const UserLoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const onFinish = (values: { username: string; password: string }) => {
    dispatch(loginStudent(values.username, values.password));
  };

  const handleAutoFill = () => {
    form.setFieldsValue({
      username: 'student',
      password: 'student123',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg rounded-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <BoxIcon size={48} className="text-blue-500" />
          </div>
          <Title level={3}>Hệ Thống Quản Lý Mượn Thiết Bị</Title>
          <Text type="secondary">Đăng nhập để quản lý mượn thiết bị</Text>
        </div>

        {error && (
          <Alert
            message="Đăng Nhập Thất Bại"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
          >
            <Input 
              prefix={<UserIcon size={16} className="text-gray-400" />} 
              placeholder="Username" 
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockIcon size={16} className="text-gray-400" />} 
              placeholder="Mật khẩu" 
            />
          </Form.Item>

          <Form.Item className="mb-4">
            <div className="flex items-center justify-between">
              <Button type="link" onClick={handleAutoFill} size="small">
                Dùng tài khoản demo
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div className="text-center text-sm text-gray-500">
          <p>Tài khoản demo:</p>
          <p>Sinh viên: student / student123</p>
        </div>
      </Card>
    </div>
  );
};

export default UserLoginPage;