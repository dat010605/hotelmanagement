import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Card, Typography, Space, Popconfirm, Tag, Tooltip, DatePicker, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, GiftOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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

  // =================================================================
  // 🌟 HÀM THÊM MỚI ĐÃ ĐƯỢC CHỐNG LỖI C# (PascalCase & Lỗi Text thuần)
  // =================================================================
  const handleAddVoucher = async (values) => {
    // 1. Xử lý ngày tháng từ RangePicker
    const validFrom = values.dates ? values.dates[0].toISOString() : null;
    const validTo = values.dates ? values.dates[1].toISOString() : null;

    // 2. Map dữ liệu Viết Hoa Chữ Cái Đầu (PascalCase) để C# hiểu được
    const payload = {
      Code: values.code,
      DiscountType: values.discountType,
      DiscountValue: values.discountValue,
      MinBookingValue: values.minBookingValue || 0,
      UsageLimit: values.usageLimit || null, 
      ValidFrom: validFrom,
      ValidTo: validTo
    };

    try {
      const response = await fetch('http://localhost:5057/api/Vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // 3. CÁCH LẤY LỖI THÔNG MINH (Trị dứt điểm lỗi "Unexpected token 'M'")
      if (!response.ok) {
        let errorMsg = 'Lỗi khi tạo mã';
        const contentType = response.headers.get("content-type");
        
        // Nếu Backend trả về JSON
        if (contentType && contentType.includes("application/json")) {
          const errData = await response.json();
          errorMsg = errData.message || errData.title || 'Dữ liệu không hợp lệ';
        } 
        // Nếu Backend trả về chuỗi Text thuần (Ví dụ: "Mã Voucher đã tồn tại")
        else {
          errorMsg = await response.text(); 
        }
        throw new Error(errorMsg); // Ném lỗi ra catch để hiển thị popup
      }

      // Nếu thành công
      message.success('Thêm Voucher mới thành công!');
      setIsModalVisible(false);
      form.resetFields();
      fetchVouchers();
      
    } catch (error) {
      // In lỗi ra popup cho người dùng biết (Ví dụ: "Mã TET2026 đã tồn tại")
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
        <Space>
          <Tooltip 
            color="#fff"
            title={
              <div style={{ color: '#333', padding: '4px' }}>
                <p style={{ margin: '0 0 4px 0' }}><b>Từ:</b> {record.validFrom || record.valid_from ? new Date(record.validFrom || record.valid_from).toLocaleDateString('vi-VN') : 'Không giới hạn'}</p>
                <p style={{ margin: '0 0 4px 0' }}><b>Đến:</b> {record.validTo || record.valid_to ? new Date(record.validTo || record.valid_to).toLocaleDateString('vi-VN') : 'Không giới hạn'}</p>
                <p style={{ margin: '0 0 4px 0' }}><b>Đơn tối thiểu:</b> {(record.minBookingValue || record.min_booking_value) ? (record.minBookingValue || record.min_booking_value).toLocaleString() + 'đ' : '0đ'}</p>
                <p style={{ margin: 0 }}><b>Lượt dùng:</b> {(record.usageLimit || record.usage_limit) ? (record.usageLimit || record.usage_limit) : 'Không giới hạn'}</p>
              </div>
            }
          >
            <Button type="primary" ghost size="small" icon={<EyeOutlined />}>Chi tiết</Button>
          </Tooltip>

          <Popconfirm
            title="Bạn có chắc chắn muốn xóa mã này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger type="text" size="small" icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3}><GiftOutlined style={{ marginRight: 10 }} />Quản Lý Khuyến Mãi</Title>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { form.resetFields(); setIsModalVisible(true); }}>
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
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleAddVoucher}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="code" 
                label="Mã Code (Ví dụ: TET2026)" 
                rules={[{ required: true, message: 'Vui lòng nhập mã code' }]}
              >
                <Input size="large" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="discountValue" 
                label="Mức Giảm" 
                rules={[{ required: true, message: 'Vui lòng nhập số tiền hoặc %' }]}
              >
                <InputNumber size="large" style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="minBookingValue" 
                label="Đơn Tối Thiểu Áp Dụng (VNĐ)" 
              >
                <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="Ví dụ: 500000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="usageLimit" 
                label="Số Lượt Sử Dụng Tối Đa" 
              >
                <InputNumber size="large" style={{ width: '100%' }} min={1} placeholder="Bỏ trống nếu không giới hạn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="dates" 
                label="Thời Hạn Sử Dụng (Từ ngày - Đến ngày)" 
              >
                <RangePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 20, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu Mã Khuyến Mãi</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default VoucherManagement;