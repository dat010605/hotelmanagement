import React, { useState, useMemo } from 'react';
import { Steps, DatePicker, Button, Table, Form, Input, message, Card, Typography, Space, Divider } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, CheckCircleOutlined, DollarOutlined, GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const CreateBooking = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [dates, setDates] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [form] = Form.useForm();

  // ==========================================
  // STATE MỚI CHO VOUCHER
  // ==========================================
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // ==========================================
  // LOGIC TÍNH TỔNG TIỀN (ĐÃ TÍCH HỢP VOUCHER)
  // ==========================================
  const bookingSummary = useMemo(() => {
    if (!dates || dates.length !== 2 || selectedRoomIds.length === 0) {
      return { nights: 0, totalAmount: 0, discount: 0, finalAmount: 0 };
    }

    const checkIn = dates[0];
    const checkOut = dates[1];
    const nights = checkOut.diff(checkIn, 'day');

    const selectedRoomsData = availableRooms.filter(room => selectedRoomIds.includes(room.roomId));
    const totalRoomPricePerNight = selectedRoomsData.reduce((sum, room) => sum + room.price, 0);

    const totalAmount = totalRoomPricePerNight * nights; // Tiền gốc
    let discount = 0;

    // Nếu có voucher thì bắt đầu tính toán trừ tiền
    if (appliedVoucher) {
      if (appliedVoucher.discountType === 'PERCENT') {
        discount = (totalAmount * appliedVoucher.discountValue) / 100;
      } else if (appliedVoucher.discountType === 'AMOUNT') {
        discount = appliedVoucher.discountValue;
      }
      // Tránh việc mã giảm giá trừ quá cả tiền phòng (ví dụ phòng 500k mà nhập mã trừ 1 triệu)
      if (discount > totalAmount) discount = totalAmount; 
    }

    const finalAmount = totalAmount - discount; // Tiền cuối cùng khách phải trả

    return { nights, totalAmount, discount, finalAmount };
  }, [dates, selectedRoomIds, availableRooms, appliedVoucher]);

  // ==========================================
  // HÀM KIỂM TRA VOUCHER TỪ BACKEND
  // ==========================================
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      message.warning('Vui lòng nhập mã Voucher!');
      return;
    }
    
    setCheckingVoucher(true);
    try {
      const response = await fetch(`http://localhost:5057/api/Vouchers/check?code=${voucherCode.trim()}`);
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }
      
      const data = await response.json();
      setAppliedVoucher(data); // Lưu voucher xịn vào State
      message.success(`Áp dụng thành công mã: ${data.code}`);
    } catch (error) {
      message.error(error.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      setAppliedVoucher(null);
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    message.info('Đã gỡ mã giảm giá.');
  };

  // ==========================================
  // BƯỚC 1 & 2: TÌM & CHỌN PHÒNG (GIỮ NGUYÊN)
  // ==========================================
  const handleSearchRooms = async () => {
    if (!dates || dates.length !== 2) return message.warning('Vui lòng chọn ngày!');
    setLoading(true);
    const checkIn = dates[0].format('YYYY-MM-DD');
    const checkOut = dates[1].format('YYYY-MM-DD');
    try {
      const response = await fetch(`http://localhost:5057/api/Bookings/AvailableRooms?checkIn=${checkIn}&checkOut=${checkOut}`);
      if (!response.ok) throw new Error(await response.text());
      setAvailableRooms(await response.json());
      setCurrentStep(1); 
    } catch (error) {
      message.error('Lỗi khi tìm phòng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const roomColumns = [
    { title: 'Số phòng', dataIndex: 'roomNumber', key: 'roomNumber', width: 120 },
    { title: 'Hạng phòng', dataIndex: 'roomTypeName' },
    { title: 'Giá / Đêm', dataIndex: 'price', render: (price) => <Text strong style={{ color: '#cf1322' }}>{price.toLocaleString()} VNĐ</Text> },
    { title: 'Sức chứa', render: (_, r) => `${r.maxAdults} NL, ${r.maxChildren} TE` }
  ];

  const rowSelection = { selectedRowKeys: selectedRoomIds, onChange: (keys) => setSelectedRoomIds(keys) };

  const handleConfirmRooms = () => {
    if (selectedRoomIds.length === 0) return message.warning('Chọn ít nhất 1 phòng!');
    setCurrentStep(2); 
  };

  // ==========================================
  // BƯỚC 3: ĐẶT PHÒNG
  // ==========================================
  const handleFinishBooking = async (values) => {
    setLoading(true);
    const payload = {
      guestName: values.guestName,
      guestPhone: values.guestPhone,
      guestEmail: values.guestEmail,
      // Backend C# của bạn hiện tại chưa có cột VoucherCode trong bảng Booking,
      // nên chúng ta vẫn gửi list phòng bình thường. Nếu muốn lưu vết mã giảm giá vào DB, 
      // bạn cần bảo đồng đội thêm cột VoucherCode vào Model C# nhé!
      rooms: selectedRoomIds.map(id => ({
        roomId: id,
        checkInDate: dates[0].format('YYYY-MM-DD'),
        checkOutDate: dates[1].format('YYYY-MM-DD')
      }))
    };

    try {
      const response = await fetch('http://localhost:5057/api/Bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result || 'Lỗi đặt phòng');

      message.success(`Đặt phòng thành công! Mã đơn: ${result.bookingCode}`);
      
      // Reset sạch sẽ
      form.resetFields();
      setDates(null);
      setSelectedRoomIds([]);
      setAppliedVoucher(null);
      setVoucherCode('');
      setCurrentStep(0);
      
    } catch (error) {
      message.error('Lỗi đặt phòng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<Title level={3}>Tạo Đơn Đặt Phòng Mới</Title>} bordered={false}>
      <Steps current={currentStep} items={[{ title: 'Chọn ngày' }, { title: 'Chọn phòng' }, { title: 'Xác nhận' }]} style={{ marginBottom: 30 }} />

      {currentStep === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Space direction="vertical" size="large">
            <Text strong>Chọn thời gian lưu trú:</Text>
            <RangePicker size="large" onChange={setDates} value={dates} disabledDate={(c) => c && c < dayjs().startOf('day')} />
            <Button type="primary" size="large" onClick={handleSearchRooms} loading={loading}>Tìm phòng trống</Button>
          </Space>
        </div>
      )}

      {currentStep === 1 && (
        <div>
          <Table rowKey="roomId" rowSelection={rowSelection} columns={roomColumns} dataSource={availableRooms} pagination={{ pageSize: 5 }} />
          <Space style={{ marginTop: 20 }}>
            <Button onClick={() => setCurrentStep(0)}>Quay lại</Button>
            <Button type="primary" onClick={handleConfirmRooms}>Tiếp tục ({selectedRoomIds.length} phòng)</Button>
          </Space>
        </div>
      )}

      {currentStep === 2 && (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          
          {/* KHUNG TÓM TẮT CÓ GIẢM GIÁ */}
          <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <Title level={5} style={{ color: '#389e0d', marginTop: 0 }}>Tóm tắt đơn đặt phòng</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>📅 Thời gian: {dates[0].format('DD/MM/YYYY')} - {dates[1].format('DD/MM/YYYY')} ({bookingSummary.nights} đêm)</Text>
              <Text>🛏️ Số lượng phòng: {selectedRoomIds.length} phòng</Text>
              <Divider style={{ margin: '10px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Tạm tính:</Text>
                <Text strong>{bookingSummary.totalAmount.toLocaleString()} VNĐ</Text>
              </div>

              {bookingSummary.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cf1322' }}>
                  <Text type="danger">Giảm giá ({appliedVoucher.code}):</Text>
                  <Text strong type="danger">- {bookingSummary.discount.toLocaleString()} VNĐ</Text>
                </div>
              )}

              <Divider style={{ margin: '10px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: '18px' }}>Khách cần thanh toán:</Text>
                <Title level={3} style={{ color: '#cf1322', margin: 0 }}>
                  <DollarOutlined style={{ marginRight: 8 }}/> 
                  {bookingSummary.finalAmount.toLocaleString()} VNĐ
                </Title>
              </div>
            </Space>
          </div>

          <Form form={form} layout="vertical" onFinish={handleFinishBooking}>
            {/* KHU VỰC NHẬP VOUCHER */}
            <div style={{ padding: '15px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '8px', marginBottom: '24px' }}>
              <Text strong><GiftOutlined style={{ marginRight: 8 }}/> Áp dụng Mã khuyến mãi</Text>
              <div style={{ display: 'flex', marginTop: '10px' }}>
                <Input 
                  placeholder="Nhập mã giảm giá..." 
                  value={voucherCode} 
                  onChange={(e) => setVoucherCode(e.target.value)}
                  disabled={!!appliedVoucher}
                  style={{ textTransform: 'uppercase' }}
                />
                {!appliedVoucher ? (
                  <Button type="primary" onClick={handleApplyVoucher} loading={checkingVoucher} style={{ marginLeft: '10px' }}>
                    Kiểm tra
                  </Button>
                ) : (
                  <Button danger onClick={handleRemoveVoucher} style={{ marginLeft: '10px' }}>
                    Gỡ bỏ
                  </Button>
                )}
              </div>
            </div>

            <Form.Item name="guestName" label="Họ và tên khách hàng" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
              <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" size="large" />
            </Form.Item>
            <Form.Item name="guestPhone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}>
              <Input prefix={<PhoneOutlined />} placeholder="Ví dụ: 0901234567" size="large" />
            </Form.Item>
            <Form.Item name="guestEmail" label="Email (Không bắt buộc)">
              <Input prefix={<MailOutlined />} placeholder="Ví dụ: email@gmail.com" size="large" />
            </Form.Item>

            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button onClick={() => setCurrentStep(1)} size="large">Quay lại</Button>
              <Button type="primary" htmlType="submit" size="large" icon={<CheckCircleOutlined />} loading={loading}>
                Xác nhận đặt phòng
              </Button>
            </Space>
          </Form>
        </div>
      )}
    </Card>
  );
};

export default CreateBooking;