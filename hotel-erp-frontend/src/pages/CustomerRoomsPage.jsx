import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Spin, Empty, Select, Space, Rate, Modal, Form, Input, DatePicker, Checkbox, Divider, message, Alert } from 'antd';
import { CheckCircleOutlined, UserOutlined, FilterOutlined, SortAscendingOutlined, CalendarOutlined, PhoneOutlined, MailOutlined, HomeOutlined, GiftOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800';

const CustomerRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for Filter & Sort
  const [selectedType, setSelectedType] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');

  // Booking modal states
  const [bookingModal, setBookingModal] = useState(false);
  const [villaModal, setVillaModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [bookingForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherInfo, setVoucherInfo] = useState(null); // { id, code, discountType, discountValue, ... }
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, typesRes] = await Promise.all([
          axiosClient.get('/Rooms'),
          axiosClient.get('/RoomTypes')
        ]);
        
        setRooms(roomsRes.data);
        setRoomTypes(typesRes.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Merge Data
  const mergedRooms = useMemo(() => {
    return rooms.map(room => {
      const typeInfo = roomTypes.find(t => t.id === (room.roomTypeId || room.RoomTypeId)) || {};
      return {
        ...room,
        roomTypeName: typeInfo.name || typeInfo.Name || 'Phòng tiêu chuẩn',
        basePrice: typeInfo.basePrice || typeInfo.BasePrice || 500000,
        description: typeInfo.description || typeInfo.Description || 'Một căn phòng ấm cúng với đầy đủ tiện nghi tiêu chuẩn, phù hợp cho kỳ nghỉ dưỡng của bạn.',
        rating: 4 + Math.random() // Giả lập đánh giá 4 - 5 sao
      };
    });
  }, [rooms, roomTypes]);

  // ── YC1: Lọc phòng con (parentRoomId != null) ra khỏi danh sách ──
  const filteredAndSortedRooms = useMemo(() => {
    // Chỉ hiển thị phòng độc lập và Villa mẹ (không có parentRoomId)
    let result = mergedRooms.filter(r => {
      const parentId = r.parentRoomId || r.ParentRoomId;
      return !parentId; // Chỉ giữ phòng không có parent
    });

    // Filter theo loại phòng
    if (selectedType !== 'all') {
      result = result.filter(r => (r.roomTypeId || r.RoomTypeId) === selectedType);
    }

    // Sort
    const isVillaRoom = (r) => ((r.roomTypeName || '').toLowerCase()).includes('villa');

    if (sortOrder === 'price_asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortOrder === 'price_desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else {
      // Mặc định: Sắp xếp roomNumber tăng dần, Villa luôn ở cuối
      result.sort((a, b) => {
        const aVilla = isVillaRoom(a) ? 1 : 0;
        const bVilla = isVillaRoom(b) ? 1 : 0;
        if (aVilla !== bVilla) return aVilla - bVilla; // Villa xuống cuối
        const aNum = String(a.roomNumber || a.RoomNumber || '');
        const bNum = String(b.roomNumber || b.RoomNumber || '');
        return aNum.localeCompare(bNum, undefined, { numeric: true });
      });
    }

    return result;
  }, [mergedRooms, selectedType, sortOrder]);

  // ── Kiểm tra phòng có phải Villa không ──
  const isVilla = (room) => {
    const typeName = (room.roomTypeName || '').toLowerCase();
    return typeName.includes('villa');
  };

  // ── Lấy phòng con của Villa ──
  const getChildRooms = (parentId) => {
    return mergedRooms.filter(r => {
      const pid = r.parentRoomId || r.ParentRoomId;
      return pid && (pid === parentId);
    });
  };

  // ── YC2: Xử lý click "Chọn phòng này" ──
  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    const roomId = room.id || room.Id;

    if (isVilla(room)) {
      // Villa → mở modal chọn phòng add-on
      setSelectedAddons([]);
      setVillaModal(true);
    } else {
      // Phòng thường → mở modal đặt phòng
      bookingForm.resetFields();
      setVoucherCode(''); setVoucherInfo(null); setVoucherError('');
      setBookingModal(true);
    }
  };

  // ── Tính tổng tiền Villa ──
  const villaChildRooms = selectedRoom ? getChildRooms(selectedRoom.id || selectedRoom.Id) : [];
  const villaTotal = useMemo(() => {
    if (!selectedRoom) return 0;
    let total = selectedRoom.basePrice; // Giá cơ bản Villa
    selectedAddons.forEach(addonId => {
      const addon = villaChildRooms.find(r => (r.id || r.Id) === addonId);
      if (addon) total += addon.basePrice;
    });
    return total;
  }, [selectedRoom, selectedAddons, villaChildRooms]);

  // ── Áp dụng mã khuyến mãi ──
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) { setVoucherError('Vui lòng nhập mã khuyến mãi'); return; }
    setVoucherLoading(true); setVoucherError(''); setVoucherInfo(null);
    try {
      const rtId = selectedRoom?.roomTypeId || selectedRoom?.RoomTypeId || '';
      const res = await axiosClient.get(`/Vouchers/check?code=${voucherCode.trim()}&roomTypeId=${rtId}`);
      const v = res.data;
      if (v.validTo && new Date(v.validTo) < new Date()) { setVoucherError('Mã khuyến mãi đã hết hạn.'); return; }
      if (v.validFrom && new Date(v.validFrom) > new Date()) { setVoucherError('Mã khuyến mãi chưa tới thời gian sử dụng.'); return; }
      setVoucherInfo(v);
    } catch (err) {
      setVoucherError(err.response?.data || 'Mã khuyến mãi không hợp lệ.');
    } finally { setVoucherLoading(false); }
  };

  // ── Tính giảm giá ──
  const calcDiscount = (baseTotal) => {
    if (!voucherInfo) return 0;
    if ((voucherInfo.discountType || '').toLowerCase() === 'percent')
      return Math.round(baseTotal * (voucherInfo.discountValue || 0) / 100);
    return voucherInfo.discountValue || 0;
  };

  // ── Xử lý submit đặt phòng → GỌI API BACKEND ──
  const handleBookingSubmit = async (values) => {
    if (!selectedRoom) return;

    setSubmitting(true);
    try {
      const checkInDate = values.dates[0].format('YYYY-MM-DD');
      const checkOutDate = values.dates[1].format('YYYY-MM-DD');
      const mainRoomId = selectedRoom.id || selectedRoom.Id;

      const roomsToBook = [{ roomId: mainRoomId, checkInDate, checkOutDate }];

      if (isVilla(selectedRoom) && selectedAddons.length > 0) {
        selectedAddons.forEach(addonId => {
          roomsToBook.push({ roomId: addonId, checkInDate, checkOutDate });
        });
      }

      const response = await axiosClient.post('/Bookings', {
        guestName: values.guestName,
        guestPhone: values.phone,
        guestEmail: values.email || null,
        voucherCode: voucherInfo ? voucherCode.trim() : null,
        rooms: roomsToBook,
      });

      message.success(
        <span>
          🎉 Đặt phòng thành công! Mã đơn: <b>{response.data.bookingCode}</b>
          <br />Chúng tôi sẽ liên hệ xác nhận qua SĐT của bạn.
        </span>,
        6
      );

      setBookingModal(false);
      setVillaModal(false);
      bookingForm.resetFields();
      setSelectedAddons([]);
      setVoucherCode(''); setVoucherInfo(null); setVoucherError('');
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại!';
      message.error(typeof errMsg === 'string' ? errMsg : 'Có lỗi xảy ra khi đặt phòng!');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Xử lý Villa confirm → chuyển sang form đặt phòng ──
  const handleVillaConfirm = () => {
    setVillaModal(false);
    bookingForm.resetFields();
    setVoucherCode(''); setVoucherInfo(null); setVoucherError('');
    setBookingModal(true);
  };

  // Bộ ảnh mặc định theo TÊN hạng phòng
  const imageByTypeName = {
    'standard':   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'tiêu chuẩn': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'deluxe':     'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    'suite':      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    'family':     'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    'gia đình':   'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    'executive':  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
    'villa':      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
    'vip':        'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=800',
    'president':  'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800',
    'tổng thống': 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800',
    'honeymoon':  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
    'trăng mật':  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
    'bungalow':   'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
  };

  const fallbackByTypeId = {
    1: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    2: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    4: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    5: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
    6: 'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=800',
    7: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800',
    8: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
  };

  const getRoomImage = (room) => {
    const rId = room.roomTypeId || room.RoomTypeId;
    const img = room.roomImages?.length > 0
      ? (room.roomImages[0].imageUrl || room.roomImages[0].ImageUrl)
      : room.RoomImages?.length > 0
        ? (room.RoomImages[0].imageUrl || room.RoomImages[0].ImageUrl)
        : null;
    if (img) return img;

    const typeName = (room.roomTypeName || '').toLowerCase().trim();
    const matchedKey = Object.keys(imageByTypeName).find(k => typeName.includes(k));
    return matchedKey ? imageByTypeName[matchedKey] : (fallbackByTypeId[rId] || FALLBACK_IMG);
  };

  return (
    <div style={{ padding: '40px 20px', minHeight: '60vh', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title level={2}>Kết Quả Tìm Kiếm Phòng</Title>
        <Paragraph type="secondary">Tìm căn phòng phù hợp nhất cho kỳ nghỉ của bạn</Paragraph>
        <div style={{ width: '60px', height: '4px', background: '#c9a961', margin: '0 auto', borderRadius: '2px' }}></div>
      </div>

      {/* FILTER & SORT SECTION */}
      <Card bodyStyle={{ padding: '16px 24px' }} style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle" wrap>
              <Text strong><FilterOutlined /> Hạng phòng:</Text>
              <Select 
                value={selectedType} 
                onChange={setSelectedType} 
                style={{ width: 200 }}
              >
                <Option value="all">Tất cả hạng phòng</Option>
                {roomTypes.map(type => (
                  <Option key={type.id || type.Id} value={type.id || type.Id}>
                    {type.name || type.Name}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col>
            <Space size="middle" wrap>
              <Text strong><SortAscendingOutlined /> Sắp xếp theo:</Text>
              <Select 
                value={sortOrder} 
                onChange={setSortOrder} 
                style={{ width: 200 }}
              >
                <Option value="default">Mặc định</Option>
                <Option value="price_asc">Giá: Thấp đến cao</Option>
                <Option value="price_desc">Giá: Cao đến thấp</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ROOM LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : filteredAndSortedRooms.length === 0 ? (
        <Empty description="Không tìm thấy phòng nào phù hợp" style={{ marginTop: '50px' }} />
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {filteredAndSortedRooms.map(room => {
            const isAvailable = (room.status || room.Status) !== 'Occupied' && (room.status || room.Status) !== 'Maintenance';
            const roomImage = getRoomImage(room);
            const villa = isVilla(room);

            return (
              <Card 
                key={room.id || room.Id} 
                hoverable 
                style={{ borderRadius: '12px', overflow: 'hidden' }}
                bodyStyle={{ padding: 0 }}
              >
                <Row>
                  {/* Cột Hình ảnh */}
                  <Col xs={24} md={8} lg={7}>
                    <img 
                      alt="room" 
                      src={roomImage} 
                      onError={(e) => { e.target.src = FALLBACK_IMG; }}
                      style={{ width: '100%', height: '100%', minHeight: '220px', objectFit: 'cover', display: 'block' }} 
                    />
                  </Col>

                  {/* Cột Nội dung chi tiết */}
                  <Col xs={24} md={10} lg={12} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Title level={3} style={{ marginTop: 0, marginBottom: '8px' }}>
                        {villa ? `🏡 ${room.roomTypeName}` : `Phòng ${room.roomNumber || room.RoomNumber}`}
                      </Title>
                      <Tag color={villa ? 'gold' : 'geekblue'} style={{ fontSize: '14px', padding: '4px 8px' }}>
                        {room.roomTypeName}
                      </Tag>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <Rate disabled allowHalf defaultValue={room.rating} style={{ fontSize: '14px', color: '#fadb14' }} />
                      <Text type="secondary" style={{ marginLeft: '8px' }}>({(Math.random() * 100 + 10).toFixed(0)} đánh giá)</Text>
                    </div>

                    <Paragraph style={{ color: '#595959', flex: 1, marginBottom: 16 }}>
                      {room.description}
                    </Paragraph>

                    <Space wrap>
                      {isAvailable ? (
                        <Tag color="success" icon={<CheckCircleOutlined />}>Phòng trống (Tầng {room.floor || room.Floor || 'Trệt'})</Tag>
                      ) : (
                        <Tag color="error" icon={<UserOutlined />}>Đã có khách</Tag>
                      )}
                      {villa && <Tag color="gold">🏠 Bao gồm 4 phòng tiêu chuẩn</Tag>}
                    </Space>
                  </Col>

                  {/* Cột Giá & Nút Đặt phòng */}
                  <Col xs={24} md={6} lg={5} style={{ 
                    padding: '24px', 
                    background: '#fafafa', 
                    borderLeft: '1px solid #f0f0f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <Text type="secondary" style={{ marginBottom: '4px' }}>Giá mỗi đêm từ</Text>
                    <Title level={2} style={{ color: '#c9a961', marginTop: 0, marginBottom: '24px' }}>
                      {room.basePrice.toLocaleString()}₫
                    </Title>
                    <Button 
                      type="primary" 
                      size="large" 
                      disabled={!isAvailable} 
                      onClick={() => handleSelectRoom(room)}
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px', 
                        background: isAvailable ? '#c9a961' : undefined, 
                        borderColor: isAvailable ? '#c9a961' : undefined,
                        fontWeight: 'bold'
                      }}
                    >
                      {isAvailable ? (villa ? '🏡 Chọn Villa' : 'Chọn phòng này') : 'Hết phòng'}
                    </Button>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      )}

      {/* ── MODAL: Đặt phòng thường ────────────────────────────────────── */}
      <Modal
        title={
          <div>
            <Title level={4} style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
              Đặt phòng {selectedRoom?.roomNumber || selectedRoom?.RoomNumber}
            </Title>
            <Text type="secondary">{selectedRoom?.roomTypeName} — {selectedRoom?.basePrice?.toLocaleString()}₫/đêm</Text>
            {isVilla(selectedRoom || {}) && selectedAddons.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Tag color="gold">+ {selectedAddons.length} phòng add-on</Tag>
                <Text strong style={{ color: '#c9a961' }}> Tổng: {villaTotal.toLocaleString()}₫/đêm</Text>
              </div>
            )}
          </div>
        }
        open={bookingModal}
        onCancel={() => setBookingModal(false)}
        footer={null}
        width={520}
        centered
        destroyOnClose
      >
        <Form form={bookingForm} layout="vertical" onFinish={handleBookingSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="dates" label={<><CalendarOutlined /> Ngày nhận – trả phòng</>} rules={[{ required: true, message: 'Chọn ngày' }]}>
            <RangePicker size="large" style={{ width: '100%', borderRadius: 8 }} placeholder={['Check-in', 'Check-out']} disabledDate={(d) => d && d < dayjs().startOf('day')} />
          </Form.Item>
          <Form.Item name="guestName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
            <Input size="large" prefix={<UserOutlined />} placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập SĐT' }]}>
            <Input size="large" prefix={<PhoneOutlined />} placeholder="0986 023 541" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
            <Input size="large" prefix={<MailOutlined />} placeholder="email@example.com" style={{ borderRadius: 8 }} />
          </Form.Item>

          {/* ── Voucher Section ── */}
          <Divider style={{ margin: '12px 0 16px' }}>🎟️ Mã khuyến mãi</Divider>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Input
              size="large"
              prefix={<GiftOutlined style={{ color: '#c9a961' }} />}
              placeholder="Nhập mã giảm giá (nếu có)"
              value={voucherCode}
              onChange={e => { setVoucherCode(e.target.value); setVoucherError(''); setVoucherInfo(null); }}
              style={{ borderRadius: 8, flex: 1 }}
            />
            <Button size="large" loading={voucherLoading} onClick={handleApplyVoucher}
              style={{ borderRadius: 8, fontWeight: 600, borderColor: '#c9a961', color: '#c9a961' }}
            >
              Áp dụng
            </Button>
          </div>
          {voucherError && <Alert type="error" message={voucherError} showIcon style={{ marginBottom: 12, borderRadius: 8 }} />}
          {voucherInfo && (
            <Alert type="success" showIcon style={{ marginBottom: 12, borderRadius: 8 }}
              message={`✅ Giảm ${(voucherInfo.discountType || '').toLowerCase() === 'percent' ? voucherInfo.discountValue + '%' : (voucherInfo.discountValue || 0).toLocaleString() + '₫'} — Mã: ${voucherInfo.code}`}
            />
          )}

          <Button 
            type="primary" htmlType="submit" size="large" block loading={submitting}
            style={{ borderRadius: 8, background: '#c9a961', borderColor: '#c9a961', fontWeight: 'bold', height: 48, marginTop: 8 }}
          >
            {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT PHÒNG'}
          </Button>
        </Form>
      </Modal>

      {/* ── MODAL: Villa Add-on ─────────────────────────────────────────── */}
      <Modal
        title={
          <div>
            <Title level={4} style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
              🏡 Đặt Villa – {selectedRoom?.roomNumber || selectedRoom?.RoomNumber}
            </Title>
            <Text type="secondary">{selectedRoom?.roomTypeName}</Text>
          </div>
        }
        open={villaModal}
        onCancel={() => setVillaModal(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text type="secondary">Tổng giá mỗi đêm: </Text>
              <Title level={3} style={{ margin: 0, display: 'inline', color: '#c9a961' }}>
                {villaTotal.toLocaleString()}₫
              </Title>
            </div>
            <Button type="primary" size="large" onClick={handleVillaConfirm} style={{ background: '#c9a961', borderColor: '#c9a961', fontWeight: 'bold', borderRadius: 8 }}>
              Tiếp tục đặt phòng →
            </Button>
          </div>
        }
        width={600}
        centered
        destroyOnClose
      >
        <div style={{ padding: '16px 0' }}>
          {/* Giá cơ bản */}
          <Card style={{ borderRadius: 12, marginBottom: 16, background: '#fdf8ed', border: '1px solid #e8d5a3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={5} style={{ margin: 0 }}>📦 Gói cơ bản Villa</Title>
                <Text type="secondary">Đã bao gồm 4 phòng tiêu chuẩn</Text>
              </div>
              <Title level={4} style={{ margin: 0, color: '#c9a961' }}>
                {selectedRoom?.basePrice?.toLocaleString()}₫
              </Title>
            </div>
          </Card>

          {/* Phòng add-on */}
          {villaChildRooms.length > 0 ? (
            <>
              <Divider>🛎️ Dịch vụ mua thêm (Add-on Rooms)</Divider>
              <Checkbox.Group
                value={selectedAddons}
                onChange={setSelectedAddons}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {villaChildRooms.map(child => (
                    <Card key={child.id || child.Id} size="small" style={{ borderRadius: 12, border: selectedAddons.includes(child.id || child.Id) ? '2px solid #c9a961' : '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Checkbox value={child.id || child.Id}>
                          <div>
                            <Text strong>🚪 Phòng {child.roomNumber || child.RoomNumber}</Text>
                            <Text type="secondary" style={{ marginLeft: 8 }}>({child.roomTypeName})</Text>
                          </div>
                        </Checkbox>
                        <Tag color="gold" style={{ fontSize: 14, padding: '4px 12px' }}>
                          + {child.basePrice?.toLocaleString()}₫
                        </Tag>
                      </div>
                    </Card>
                  ))}
                </Space>
              </Checkbox.Group>
            </>
          ) : (
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 16 }}>
              Không có phòng add-on nào cho Villa này.
            </Text>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CustomerRoomsPage;
