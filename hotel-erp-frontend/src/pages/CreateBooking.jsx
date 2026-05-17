import React, { useState, useMemo } from 'react';
import { Steps, DatePicker, Button, Table, Form, Input, message, Card, Typography, Space, Divider, InputNumber, Tag } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, CheckCircleOutlined, DollarOutlined, GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const CreateBooking = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [dates, setDates] = useState(null);
  
  //  MA PHÁP MỚI: State lưu Hạng phòng thay vì từng phòng lẻ
  const [availableRoomTypes, setAvailableRoomTypes] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({}); // VD: { "Phòng Deluxe": 2 }
  
  const [form] = Form.useForm();

  // STATE VOUCHER
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // ==========================================
  // BƯỚC 1: TÌM PHÒNG & GOM NHÓM THEO HẠNG
  // ==========================================
  const handleSearchRooms = async () => {
    if (!dates || dates.length !== 2) return message.warning('Vui lòng chọn ngày!');
    setLoading(true);
    const checkIn = dates[0].format('YYYY-MM-DD');
    const checkOut = dates[1].format('YYYY-MM-DD');
    
    try {
      const response = await fetch(`http://localhost:5057/api/Bookings/AvailableRooms?checkIn=${checkIn}&checkOut=${checkOut}`);
      if (!response.ok) throw new Error(await response.text());
      const rawRooms = await response.json();

      // 🔮 THUẬT TOÁN GOM NHÓM TỰ ĐỘNG
      const grouped = rawRooms.reduce((acc, room) => {
        if (!acc[room.roomTypeName]) {
          acc[room.roomTypeName] = {
            roomTypeName: room.roomTypeName,
            price: room.price,
            maxAdults: room.maxAdults,
            maxChildren: room.maxChildren,
            rooms: [] // Chứa danh sách các phòng cụ thể thuộc hạng này
          };
        }
        acc[room.roomTypeName].rooms.push(room);
        return acc;
      }, {});

      setAvailableRoomTypes(Object.values(grouped));
      setSelectedQuantities({}); // Reset lựa chọn cũ
      setCurrentStep(1); 
    } catch (error) {
      message.error('Lỗi khi tìm phòng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // BƯỚC 2: CHỌN SỐ LƯỢNG (DẠNG RESORT)
  // ==========================================
  const handleQuantityChange = (roomTypeName, value) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [roomTypeName]: value
    }));
  };

  const roomTypeColumns = [
    { title: 'Hạng phòng', dataIndex: 'roomTypeName', render: text => <Text strong style={{ fontSize: '15px' }}>{text}</Text> },
    { title: 'Giá / Đêm', dataIndex: 'price', render: (price) => <Text strong style={{ color: '#cf1322' }}>{price.toLocaleString()} đ</Text> },
    { title: 'Sức chứa', render: (_, r) => `${r.maxAdults} Lớn, ${r.maxChildren} Bé` },
    { 
      title: 'Còn trống', 
      align: 'center',
      render: (_, r) => <Tag color="green" style={{ fontSize: '14px', padding: '4px 8px' }}>{r.rooms.length} phòng</Tag> 
    },
    { 
      title: 'Số lượng đặt', 
      align: 'center',
      render: (_, r) => (
        <InputNumber
          min={0}
          max={r.rooms.length} // Không cho đặt lố số phòng trống
          value={selectedQuantities[r.roomTypeName] || 0}
          onChange={(val) => handleQuantityChange(r.roomTypeName, val)}
          size="large"
          style={{ width: '80px' }}
        />
      )
    }
  ];

  const handleConfirmRooms = () => {
    const totalSelected = Object.values(selectedQuantities).reduce((a, b) => a + b, 0);
    if (totalSelected === 0) return message.warning('Vui lòng chọn số lượng ít nhất 1 phòng!');
    setCurrentStep(2); 
  };

  // ==========================================
  // LOGIC TÍNH TỔNG TIỀN 
  // ==========================================
  const bookingSummary = useMemo(() => {
    if (!dates || dates.length !== 2) return { nights: 0, totalRoomsCount: 0, totalAmount: 0, discount: 0, finalAmount: 0 };

    const checkIn = dates[0];
    const checkOut = dates[1];
    const nights = checkOut.diff(checkIn, 'day');

    let totalRoomPricePerNight = 0;
    let totalRoomsCount = 0;

    availableRoomTypes.forEach(type => {
      const qty = selectedQuantities[type.roomTypeName] || 0;
      if (qty > 0) {
        totalRoomPricePerNight += (type.price * qty);
        totalRoomsCount += qty;
      }
    });

    const totalAmount = totalRoomPricePerNight * nights;
    let discount = 0;

    if (appliedVoucher) {
      if (appliedVoucher.discountType === 'PERCENT') {
        discount = (totalAmount * appliedVoucher.discountValue) / 100;
      } else if (appliedVoucher.discountType === 'AMOUNT') {
        discount = appliedVoucher.discountValue;
      }
      if (discount > totalAmount) discount = totalAmount; 
    }

    const finalAmount = totalAmount - discount;

    return { nights, totalRoomsCount, totalAmount, discount, finalAmount };
  }, [dates, selectedQuantities, availableRoomTypes, appliedVoucher]);

  // ==========================================
  // XỬ LÝ VOUCHER
  // ==========================================
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return message.warning('Vui lòng nhập mã!');
    setCheckingVoucher(true);
    try {
      const response = await fetch(`http://localhost:5057/api/Vouchers/check?code=${voucherCode.trim()}`);
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setAppliedVoucher(data);
      message.success(`Áp dụng mã ${data.code} thành công!`);
    } catch (error) {
      message.error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
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
  // BƯỚC 3: ĐẶT PHÒNG VỀ BACKEND
  // ==========================================
  const handleFinishBooking = async (values) => {
    setLoading(true);
    
    // 🔮 MA PHÁP GÁN PHÒNG NGẦM: Bốc đại ID của các phòng trống đúng với số lượng khách chọn
    const roomsToBook = [];
    availableRoomTypes.forEach(type => {
      const qty = selectedQuantities[type.roomTypeName] || 0;
      if (qty > 0) {
        // Cắt lấy đúng số lượng ID phòng trống từ mảng (VD: Lấy 2 ID đầu tiên)
        const assignedRooms = type.rooms.slice(0, qty);
        assignedRooms.forEach(r => {
          roomsToBook.push({
            roomId: r.roomId,
            checkInDate: dates[0].format('YYYY-MM-DD'),
            checkOutDate: dates[1].format('YYYY-MM-DD')
          });
        });
      }
    });

    const payload = {
      guestName: values.guestName,
      guestPhone: values.guestPhone,
      guestEmail: values.guestEmail,
      rooms: roomsToBook
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
      
      form.resetFields();
      setDates(null);
      setSelectedQuantities({});
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
    <Card title={<Title level={3}>Tạo Đơn Đặt Phòng Mới (Chế độ Resort)</Title>} bordered={false}>
      <Steps current={currentStep} items={[{ title: 'Chọn ngày' }, { title: 'Chọn hạng phòng' }, { title: 'Xác nhận' }]} style={{ marginBottom: 30 }} />

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
          <Table 
            rowKey="roomTypeName" 
            columns={roomTypeColumns} 
            dataSource={availableRoomTypes} 
            pagination={false} // Tắt phân trang cho dễ nhìn tổng quát
            bordered
          />
          <Space style={{ marginTop: 20 }}>
            <Button onClick={() => setCurrentStep(0)}>Quay lại</Button>
            <Button type="primary" onClick={handleConfirmRooms}>
              Tiếp tục ({bookingSummary.totalRoomsCount} phòng)
            </Button>
          </Space>
        </div>
      )}

      {currentStep === 2 && (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          
          <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <Title level={5} style={{ color: '#389e0d', marginTop: 0 }}>Tóm tắt đơn đặt phòng</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>📅 Thời gian: {dates[0].format('DD/MM/YYYY')} - {dates[1].format('DD/MM/YYYY')} ({bookingSummary.nights} đêm)</Text>
              
              <Text strong>🛏️ Hạng phòng đã chọn:</Text>
              <ul style={{ margin: '0 0 10px 20px' }}>
                {availableRoomTypes.filter(t => selectedQuantities[t.roomTypeName] > 0).map(t => (
                   <li key={t.roomTypeName}>{t.roomTypeName}: <Text strong color="blue">{selectedQuantities[t.roomTypeName]} phòng</Text></li>
                ))}
              </ul>

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
                  <Button type="primary" onClick={handleApplyVoucher} loading={checkingVoucher} style={{ marginLeft: '10px' }}>Kiểm tra</Button>
                ) : (
                  <Button danger onClick={handleRemoveVoucher} style={{ marginLeft: '10px' }}>Gỡ bỏ</Button>
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