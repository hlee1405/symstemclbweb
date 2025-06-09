import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Divider, Alert } from 'antd';
import { UserIcon, LockIcon, BoxIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { loginAdmin } from '../../store/slices/authSlice';

const { Title, Text } = Typography;

const AdminLoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  const onFinish = async (values: { username: string; password: string }) => {
    await dispatch(loginAdmin(values.username, values.password));
    // Sau khi login, kiểm tra user có phải admin không
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser.isAdmin) {
        setErrorMsg('Chỉ tài khoản quản trị mới được phép đăng nhập tại đây!');
      } else {
        setErrorMsg(null);
      }
    }
  };

  const handleAutoFill = () => {
    form.setFieldsValue({
      username: 'admin',
      password: 'admin123',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg rounded-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <BoxIcon size={48} className="text-blue-500" />
          </div>
          <Title level={3}>Đăng nhập quản trị</Title>
          <Text type="secondary">Chỉ dành cho quản trị viên</Text>
        </div>
        {(error || errorMsg) && (
          <Alert
            message="Đăng Nhập Thất Bại"
            description={errorMsg || error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}
        <Form
          form={form}
          name="admin-login"
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
          <p>Quản trị: admin / admin123</p>
        </div>
      </Card>
    </div>
  );
};

export default AdminLoginPage; 