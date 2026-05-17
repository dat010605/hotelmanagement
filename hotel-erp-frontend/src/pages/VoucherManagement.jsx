import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Card, Typography, Space, Popconfirm, Tag, Tooltip, DatePicker, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, GiftOutlined, EyeOutlined } from '@ant-design/icons';
=======
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Card, Typography, Space, Popconfirm, Tag, DatePicker, Descriptions, Divider, Badge } from 'antd';
import { PlusOutlined, DeleteOutlined, GiftOutlined, EyeOutlined, CalendarOutlined, TagOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
>>>>>>> datpronak123

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detailModal, setDetailModal] = useState(null); // Voucher chi tiết
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

  // Lấy danh sách hạng phòng
  const fetchRoomTypes = async () => {
    try {
      const res = await fetch('http://localhost:5057/api/RoomTypes');
      if (res.ok) {
        const data = await res.json();
        setRoomTypes(data);
      }
    } catch (e) {
      console.log('Không tải được hạng phòng');
    }
  };

  useEffect(() => {
    fetchVouchers();
    fetchRoomTypes();
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
<<<<<<< HEAD
      Code: values.code,
      DiscountType: values.discountType,
      DiscountValue: values.discountValue,
      MinBookingValue: values.minBookingValue || 0,
      UsageLimit: values.usageLimit || null, 
      ValidFrom: validFrom,
      ValidTo: validTo
=======
      code: values.code,
      discountType: values.discountType,
      discountValue: values.discountValue,
      minBookingValue: values.minBookingValue || 0,
      validFrom: values.validFrom ? values.validFrom.toISOString() : null,
      validTo: values.validTo ? values.validTo.toISOString() : null,
      usageLimit: values.usageLimit || null,
      roomTypeId: values.roomTypeId || null,
>>>>>>> datpronak123
    };

    try {
      const response = await fetch('http://localhost:5057/api/Vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

<<<<<<< HEAD
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
=======
      let result;
      const text = await response.text();
      try {
        result = JSON.parse(text);
      } catch {
        result = text;
      }

      if (!response.ok) {
        throw new Error(result.Message || result || 'Lỗi khi tạo mã');
>>>>>>> datpronak123
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

  // Hàm kiểm tra hạn sử dụng
  const getVoucherStatus = (voucher) => {
    if (!voucher.validTo) return { status: 'default', text: 'Không giới hạn' };
    const now = new Date();
    const expDate = new Date(voucher.validTo);
    if (expDate < now) return { status: 'error', text: 'Đã hết hạn' };
    const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return { status: 'warning', text: `Còn ${diffDays} ngày` };
    return { status: 'success', text: 'Đang hoạt động' };
  };

  // Tìm tên hạng phòng
  const getRoomTypeName = (id) => {
    if (!id) return 'Tất cả hạng phòng';
    const rt = roomTypes.find(t => (t.id || t.Id) === id);
    return rt ? (rt.name || rt.Name) : `ID: ${id}`;
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
        return <Text type="danger" strong>{record.discountValue?.toLocaleString()} VNĐ</Text>;
      }
    },
    {
      title: 'Hạn Sử Dụng',
      key: 'validTo',
      render: (_, record) => {
        const vStatus = getVoucherStatus(record);
        return (
          <div>
            {record.validTo ? (
              <>
                <Text style={{ fontSize: 13 }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {dayjs(record.validTo).format('DD/MM/YYYY HH:mm')}
                </Text>
                <br />
                <Badge status={vStatus.status} text={<Text style={{ fontSize: 12 }}>{vStatus.text}</Text>} />
              </>
            ) : (
              <Tag>Không giới hạn</Tag>
            )}
          </div>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
<<<<<<< HEAD
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

=======
          <Button 
            type="primary" 
            ghost 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => setDetailModal(record)}
          >
            Xem chi tiết
          </Button>
>>>>>>> datpronak123
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

      {/* ── MODAL TẠO MỚI ────────────────────────────────────── */}
      <Modal
        title="Tạo Mã Giảm Giá Mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
<<<<<<< HEAD
        width={700}
=======
        width={600}
>>>>>>> datpronak123
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

<<<<<<< HEAD
          <Form.Item style={{ marginTop: 20, textAlign: 'right' }}>
=======
          <Form.Item name="minBookingValue" label="Giá trị đơn tối thiểu (VNĐ)">
            <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="0 = Không giới hạn" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="validFrom" label="Ngày bắt đầu" style={{ flex: 1 }}>
              <DatePicker 
                size="large" 
                style={{ width: '100%' }} 
                showTime={{ format: 'HH:mm' }}
                format="DD/MM/YYYY HH:mm"
                placeholder="Chọn ngày/giờ bắt đầu"
              />
            </Form.Item>
            <Form.Item name="validTo" label="⏰ Hạn sử dụng (valid_to)" style={{ flex: 1 }}>
              <DatePicker 
                size="large" 
                style={{ width: '100%' }} 
                showTime={{ format: 'HH:mm' }}
                format="DD/MM/YYYY HH:mm"
                placeholder="Chọn ngày/giờ hết hạn"
              />
            </Form.Item>
          </div>

          <Form.Item name="usageLimit" label="Giới hạn lượt sử dụng">
            <InputNumber size="large" style={{ width: '100%' }} min={1} placeholder="Để trống = Không giới hạn" />
          </Form.Item>

          <Form.Item name="roomTypeId" label="Hạng phòng áp dụng">
            <Select size="large" allowClear placeholder="Tất cả hạng phòng (Không giới hạn)">
              {roomTypes.map(rt => (
                <Option key={rt.id || rt.Id} value={rt.id || rt.Id}>
                  {rt.name || rt.Name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginTop: 30, textAlign: 'right' }}>
>>>>>>> datpronak123
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu Mã Khuyến Mãi</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── MODAL XEM CHI TIẾT ────────────────────────────────── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />
            <span>Chi Tiết Mã Khuyến Mãi</span>
          </div>
        }
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModal(null)}>Đóng</Button>
        ]}
        width={560}
        centered
      >
        {detailModal && (() => {
          const vStatus = getVoucherStatus(detailModal);
          return (
            <div>
              {/* Mã Code nổi bật */}
              <div style={{
                textAlign: 'center', padding: '24px 16px', marginBottom: 24,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 12,
              }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>
                  Mã Giảm Giá
                </Text>
                <br />
                <Text style={{ color: '#fff', fontSize: 32, fontWeight: 800, letterSpacing: 4 }}>
                  {detailModal.code}
                </Text>
                <br />
                <Badge 
                  status={vStatus.status} 
                  text={<Text style={{ color: '#fff', fontSize: 13 }}>{vStatus.text}</Text>} 
                />
              </div>

              <Descriptions bordered size="small" column={1} labelStyle={{ fontWeight: 600, width: '40%' }}>
                <Descriptions.Item label={<><TagOutlined /> Loại giảm giá</>}>
                  <Tag color={detailModal.discountType === 'PERCENT' ? 'green' : 'gold'} style={{ fontSize: 14 }}>
                    {detailModal.discountType === 'PERCENT' ? 'Giảm theo %' : 'Trừ tiền mặt'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Mức giảm">
                  <Text type="danger" strong style={{ fontSize: 18 }}>
                    {detailModal.discountType === 'PERCENT' 
                      ? `${detailModal.discountValue}%` 
                      : `${detailModal.discountValue?.toLocaleString()} VNĐ`}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Giá trị đơn tối thiểu">
                  {detailModal.minBookingValue 
                    ? `${detailModal.minBookingValue.toLocaleString()} VNĐ` 
                    : <Tag>Không giới hạn</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Hạng phòng áp dụng">
                  <Tag color="blue">{getRoomTypeName(detailModal.roomTypeId)}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label={<><CalendarOutlined /> Ngày bắt đầu</>}>
                  {detailModal.validFrom 
                    ? dayjs(detailModal.validFrom).format('DD/MM/YYYY HH:mm')
                    : <Tag>Không giới hạn</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> Hạn sử dụng</>}>
                  <div>
                    {detailModal.validTo ? (
                      <>
                        <Text strong style={{ fontSize: 15 }}>
                          {dayjs(detailModal.validTo).format('DD/MM/YYYY HH:mm')}
                        </Text>
                        <br />
                        <Badge status={vStatus.status} text={vStatus.text} />
                      </>
                    ) : (
                      <Tag color="green">Vô thời hạn</Tag>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Giới hạn sử dụng">
                  {detailModal.usageLimit 
                    ? `${detailModal.usageLimit} lượt` 
                    : <Tag>Không giới hạn</Tag>}
                </Descriptions.Item>
              </Descriptions>
            </div>
          );
        })()}
      </Modal>
    </Card>
  );
};

export default VoucherManagement;