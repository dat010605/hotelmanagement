import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Card, Typography, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Gọi API lấy danh sách
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5057/api/Vouchers');
      if (!response.ok) throw new Error('Không thể tải dữ liệu');
      const data = await response.json();
      setVouchers(data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Gọi API Xóa
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5057/api/Vouchers/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Lỗi khi xóa');
      message.success('Đã xóa Voucher thành công');
      fetchVouchers(); // Load lại bảng
    } catch (error) {
      message.error(error.message);
    }
  };

  // Gọi API Thêm mới
  const handleAddVoucher = async (values) => {
    // Map dữ liệu cho đúng với Backend
    const payload = {
      code: values.code,
      discountType: values.discountType,
      discountValue: values.discountValue
    };

    try {
      const response = await fetch('http://localhost:5057/api/Vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result || 'Lỗi khi tạo mã');

      message.success('Thêm Voucher mới thành công!');
      setIsModalVisible(false);
      form.resetFields();
      fetchVouchers();
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { 
      title: 'Mã Giảm Giá', 
      dataIndex: 'code', 
      key: 'code',
      render: (text) => <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>{text}</Text>
    },
    { 
      title: 'Loại Giảm', 
      dataIndex: 'discountType', 
      key: 'discountType',
      render: (type) => (
        <Tag color={type === 'PERCENT' ? 'green' : 'gold'}>
          {type === 'PERCENT' ? 'Giảm theo %' : 'Trừ tiền mặt'}
        </Tag>
      )
    },
    { 
      title: 'Mức Giảm', 
      key: 'discountValue',
      render: (_, record) => {
        if (record.discountType === 'PERCENT') {
          return <Text type="danger" strong>{record.discountValue}%</Text>;
        }
        return <Text type="danger" strong>{record.discountValue.toLocaleString()} VNĐ</Text>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa mã này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger type="text" icon={<DeleteOutlined />}>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3}><GiftOutlined style={{ marginRight: 10 }} />Quản Lý Khuyến Mãi</Title>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalVisible(true)}>
          Tạo Mã Mới
        </Button>
      </div>

      <Table 
        dataSource={vouchers} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title="Tạo Mã Giảm Giá Mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddVoucher}>
          <Form.Item 
            name="code" 
            label="Mã Code (Ví dụ: TET2026)" 
            rules={[{ required: true, message: 'Vui lòng nhập mã code' }]}
          >
            <Input size="large" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Form.Item 
            name="discountType" 
            label="Loại Khuyến Mãi" 
            rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
            initialValue="PERCENT"
          >
            <Select size="large">
              <Option value="PERCENT">Giảm theo % (Phần trăm)</Option>
              <Option value="AMOUNT">Trừ thẳng tiền mặt (VNĐ)</Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="discountValue" 
            label="Mức Giảm" 
            rules={[{ required: true, message: 'Vui lòng nhập số tiền hoặc %' }]}
          >
            <InputNumber size="large" style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item style={{ marginTop: 30, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu Mã</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default VoucherManagement;