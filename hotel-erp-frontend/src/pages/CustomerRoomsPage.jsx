import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Spin, Empty, Select, Space, Rate, Modal, Form, Input, DatePicker, Checkbox, Divider, message, Alert, Drawer, Tabs, Avatar, Progress, List } from 'antd';
import { CheckCircleOutlined, UserOutlined, FilterOutlined, SortAscendingOutlined, CalendarOutlined, PhoneOutlined, MailOutlined, HomeOutlined, GiftOutlined, WifiOutlined, CarOutlined, CoffeeOutlined, SafetyCertificateOutlined, CustomerServiceOutlined, StarFilled, EnvironmentOutlined, InfoCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800';

const CustomerRoomsPage = () => {
  const { t } = useTranslation();
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

  // Room detail drawer state
  const [drawerRoom, setDrawerRoom] = useState(null);

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
        roomTypeName: typeInfo.name || typeInfo.Name || t('rooms.standardRoom'),
        basePrice: typeInfo.basePrice || typeInfo.BasePrice || 500000,
        description: typeInfo.description || typeInfo.Description || t('rooms.defaultDesc'),
        rating: 4 + Math.random() // Giả lập đánh giá 4 - 5 sao
      };
    });
  }, [rooms, roomTypes, t]);

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

    // Helper kiểm tra phòng có sẵn
    const checkAvailable = (r) => {
      const status = r.status || r.Status;
      return status !== 'Occupied' && status !== 'Maintenance';
    };

    const isVillaRoom = (r) => ((r.roomTypeName || '').toLowerCase()).includes('villa');

    result.sort((a, b) => {
      // 🌟 TIÊU CHÍ 1: Phòng trống/có thể đặt lên đầu, phòng hết/bận xuống dưới
      const aAvail = checkAvailable(a) ? 1 : 0;
      const bAvail = checkAvailable(b) ? 1 : 0;
      if (aAvail !== bAvail) {
        return bAvail - aAvail; // 1 (Available) lên trước 0 (Occupied/Maintenance)
      }

      // 🌟 TIÊU CHÍ 2: Sắp xếp theo bộ lọc người dùng chọn
      if (sortOrder === 'price_asc') {
        return a.basePrice - b.basePrice;
      } else if (sortOrder === 'price_desc') {
        return b.basePrice - a.basePrice;
      } else {
        // Mặc định: Sắp xếp roomNumber tăng dần, Villa luôn ở cuối
        const aVilla = isVillaRoom(a) ? 1 : 0;
        const bVilla = isVillaRoom(b) ? 1 : 0;
        if (aVilla !== bVilla) return aVilla - bVilla; // Villa xuống cuối
        const aNum = String(a.roomNumber || a.RoomNumber || '');
        const bNum = String(b.roomNumber || b.RoomNumber || '');
        return aNum.localeCompare(bNum, undefined, { numeric: true });
      }
    });

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
    if (!voucherCode.trim()) { setVoucherError(t('rooms.enterVoucherCode')); return; }
    setVoucherLoading(true); setVoucherError(''); setVoucherInfo(null);
    try {
      const rtId = selectedRoom?.roomTypeId || selectedRoom?.RoomTypeId || '';
      const res = await axiosClient.get(`/Vouchers/check?code=${voucherCode.trim()}&roomTypeId=${rtId}`);
      const v = res.data;
      if (v.validTo && new Date(v.validTo) < new Date()) { setVoucherError(t('rooms.voucherExpired')); return; }
      if (v.validFrom && new Date(v.validFrom) > new Date()) { setVoucherError(t('rooms.voucherNotYet')); return; }
      setVoucherInfo(v);
    } catch (err) {
      setVoucherError(err.response?.data || t('rooms.voucherInvalid'));
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
          🎉 {t('rooms.bookingSuccess')} {t('rooms.bookingCode')}: <b>{response.data.bookingCode}</b>
          <br />{t('rooms.bookingContact')}
        </span>,
        6
      );

      setBookingModal(false);
      setVillaModal(false);
      bookingForm.resetFields();
      setSelectedAddons([]);
      setVoucherCode(''); setVoucherInfo(null); setVoucherError('');
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data || t('rooms.bookingError');
      message.error(typeof errMsg === 'string' ? errMsg : t('rooms.bookingError'));
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
        <Title level={2}>{t('rooms.searchTitle')}</Title>
        <Paragraph type="secondary">{t('rooms.searchSubtitle')}</Paragraph>
        <div style={{ width: '60px', height: '4px', background: '#c9a961', margin: '0 auto', borderRadius: '2px' }}></div>
      </div>

      {/* FILTER & SORT SECTION */}
      <Card bodyStyle={{ padding: '16px 24px' }} style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle" wrap>
              <Text strong><FilterOutlined /> {t('rooms.roomCategory')}:</Text>
              <Select 
                value={selectedType} 
                onChange={setSelectedType} 
                style={{ width: 200 }}
              >
                <Option value="all">{t('rooms.allCategories')}</Option>
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
              <Text strong><SortAscendingOutlined /> {t('rooms.sortBy')}:</Text>
              <Select 
                value={sortOrder} 
                onChange={setSortOrder} 
                style={{ width: 200 }}
              >
                <Option value="default">{t('rooms.sortDefault')}</Option>
                <Option value="price_asc">{t('rooms.sortPriceAsc')}</Option>
                <Option value="price_desc">{t('rooms.sortPriceDesc')}</Option>
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
        <Empty description={t('rooms.noRoomsFound')} style={{ marginTop: '50px' }} />
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
                        {villa ? `🏡 ${room.roomTypeName}` : `${t('rooms.room')} ${room.roomNumber || room.RoomNumber}`}
                      </Title>
                      <Tag color={villa ? 'gold' : 'geekblue'} style={{ fontSize: '14px', padding: '4px 8px' }}>
                        {room.roomTypeName}
                      </Tag>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <Rate disabled allowHalf defaultValue={room.rating} style={{ fontSize: '14px', color: '#fadb14' }} />
                      <Text type="secondary" style={{ marginLeft: '8px' }}>({(Math.random() * 100 + 10).toFixed(0)} {t('rooms.reviews')})</Text>
                    </div>

                    <Paragraph style={{ color: '#595959', flex: 1, marginBottom: 16 }}>
                      {room.description}
                    </Paragraph>

                    <Space wrap>
                      {isAvailable ? (
                        <Tag color="success" icon={<CheckCircleOutlined />}>{t('rooms.available')} ({t('rooms.floor')} {room.floor || room.Floor || t('rooms.groundFloor')})</Tag>
                      ) : (
                        <Tag color="error" icon={<UserOutlined />}>{t('rooms.occupied')}</Tag>
                      )}
                      {villa && <Tag color="gold">🏠 {t('rooms.includes4Rooms')}</Tag>}
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
                    <Text type="secondary" style={{ marginBottom: '4px' }}>{t('rooms.pricePerNight')}</Text>
                    <Title level={2} style={{ color: '#c9a961', marginTop: 0, marginBottom: '12px' }}>
                      {room.basePrice.toLocaleString()}₫
                    </Title>
                    <Button
                      type="default"
                      size="large"
                      onClick={(e) => { e.stopPropagation(); setDrawerRoom(room); }}
                      style={{ width: '100%', borderRadius: '8px', marginBottom: 10, fontWeight: 600 }}
                    >
                      Xem chi tiết
                    </Button>
                    <Button 
                      type="primary" 
                      size="large" 
                      disabled={!isAvailable} 
                      onClick={(e) => { e.stopPropagation(); handleSelectRoom(room); }}
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px', 
                        background: isAvailable ? '#c9a961' : undefined, 
                        borderColor: isAvailable ? '#c9a961' : undefined,
                        fontWeight: 'bold'
                      }}
                    >
                      {isAvailable ? (villa ? `🏡 ${t('rooms.selectVilla')}` : t('rooms.selectRoom')) : t('rooms.soldOut')}
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
              {t('rooms.bookRoom')} {selectedRoom?.roomNumber || selectedRoom?.RoomNumber}
            </Title>
            <Text type="secondary">{selectedRoom?.roomTypeName} — {selectedRoom?.basePrice?.toLocaleString()}₫{t('rooms.perNight')}</Text>
            {isVilla(selectedRoom || {}) && selectedAddons.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Tag color="gold">+ {selectedAddons.length} {t('rooms.addonRooms')}</Tag>
                <Text strong style={{ color: '#c9a961' }}> {t('rooms.total')}: {villaTotal.toLocaleString()}₫{t('rooms.perNight')}</Text>
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
          <Form.Item name="dates" label={<><CalendarOutlined /> {t('rooms.checkInOut')}</>} rules={[{ required: true, message: t('rooms.selectDates') }]}>
            <RangePicker size="large" style={{ width: '100%', borderRadius: 8 }} placeholder={['Check-in', 'Check-out']} disabledDate={(d) => d && d < dayjs().startOf('day')} />
          </Form.Item>
          <Form.Item name="guestName" label={t('rooms.fullName')} rules={[{ required: true, message: t('rooms.enterName') }]}>
            <Input size="large" prefix={<UserOutlined />} placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="phone" label={t('rooms.phone')} rules={[{ required: true, message: t('rooms.enterPhone') }]}>
            <Input size="large" prefix={<PhoneOutlined />} placeholder="0986 023 541" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="email" label={t('rooms.email')} rules={[{ type: 'email', message: t('rooms.invalidEmail') }]}>
            <Input size="large" prefix={<MailOutlined />} placeholder="email@example.com" style={{ borderRadius: 8 }} />
          </Form.Item>

          {/* ── Voucher Section ── */}
          <Divider style={{ margin: '12px 0 16px' }}>🎟️ {t('rooms.voucherSection')}</Divider>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Input
              size="large"
              prefix={<GiftOutlined style={{ color: '#c9a961' }} />}
              placeholder={t('rooms.enterVoucher')}
              value={voucherCode}
              onChange={e => { setVoucherCode(e.target.value); setVoucherError(''); setVoucherInfo(null); }}
              style={{ borderRadius: 8, flex: 1 }}
            />
            <Button size="large" loading={voucherLoading} onClick={handleApplyVoucher}
              style={{ borderRadius: 8, fontWeight: 600, borderColor: '#c9a961', color: '#c9a961' }}
            >
              {t('common.apply')}
            </Button>
          </div>
          {voucherError && <Alert type="error" message={voucherError} showIcon style={{ marginBottom: 12, borderRadius: 8 }} />}
          {voucherInfo && (
            <Alert type="success" showIcon style={{ marginBottom: 12, borderRadius: 8 }}
              message={`✅ ${t('rooms.voucherDiscount')} ${(voucherInfo.discountType || '').toLowerCase() === 'percent' ? voucherInfo.discountValue + '%' : (voucherInfo.discountValue || 0).toLocaleString() + '₫'} — ${t('rooms.voucherCode')}: ${voucherInfo.code}`}
            />
          )}

          <Button 
            type="primary" htmlType="submit" size="large" block loading={submitting}
            style={{ borderRadius: 8, background: '#c9a961', borderColor: '#c9a961', fontWeight: 'bold', height: 48, marginTop: 8 }}
          >
            {submitting ? t('rooms.processing') : t('rooms.confirmBooking')}
          </Button>
        </Form>
      </Modal>

      {/* ── MODAL: Villa Add-on ─────────────────────────────────────────── */}
      <Modal
        title={
          <div>
            <Title level={4} style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
              🏡 {t('rooms.villaBooking')} – {selectedRoom?.roomNumber || selectedRoom?.RoomNumber}
            </Title>
            <Text type="secondary">{selectedRoom?.roomTypeName}</Text>
          </div>
        }
        open={villaModal}
        onCancel={() => setVillaModal(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text type="secondary">{t('rooms.villaTotalPerNight')}: </Text>
              <Title level={3} style={{ margin: 0, display: 'inline', color: '#c9a961' }}>
                {villaTotal.toLocaleString()}₫
              </Title>
            </div>
            <Button type="primary" size="large" onClick={handleVillaConfirm} style={{ background: '#c9a961', borderColor: '#c9a961', fontWeight: 'bold', borderRadius: 8 }}>
              {t('rooms.villaContinue')}
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
                <Title level={5} style={{ margin: 0 }}>📦 {t('rooms.villaBasePkg')}</Title>
                <Text type="secondary">{t('rooms.villaBaseDesc')}</Text>
              </div>
              <Title level={4} style={{ margin: 0, color: '#c9a961' }}>
                {selectedRoom?.basePrice?.toLocaleString()}₫
              </Title>
            </div>
          </Card>

          {/* Phòng add-on */}
          {villaChildRooms.length > 0 ? (
            <>
              <Divider>🛎️ {t('rooms.villaAddonTitle')}</Divider>
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
                            <Text strong>🚪 {t('rooms.room')} {child.roomNumber || child.RoomNumber}</Text>
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
              {t('rooms.villaNoAddon')}
            </Text>
          )}
        </div>
      </Modal>
      {/* ── ROOM DETAIL DRAWER ─────────────────────────────────────────── */}
      <Drawer
        open={!!drawerRoom}
        onClose={() => setDrawerRoom(null)}
        placement="right"
        width={620}
        destroyOnClose
        title={null}
        bodyStyle={{ padding: 0 }}
      >
        {drawerRoom && (() => {
          const roomImg = getRoomImage(drawerRoom);
          const villa = isVilla(drawerRoom);
          const isAvailable = (drawerRoom.status || drawerRoom.Status) !== 'Occupied' && (drawerRoom.status || drawerRoom.Status) !== 'Maintenance';
          const fakeReviews = [
            { name: 'Nguyễn Minh Trí', avatar: 'https://i.pravatar.cc/40?img=11', rating: 5, comment: 'Phòng rất sang trọng, sạch sẽ và thoải mái. Dịch vụ tuyệt vời!', date: '10/04/2026' },
            { name: 'Trần Thị Lan', avatar: 'https://i.pravatar.cc/40?img=32', rating: 4, comment: 'View đẹp, giường êm, bữa sáng ngon. Sẽ quay lại lần sau!', date: '05/04/2026' },
            { name: 'Lê Văn Hùng', avatar: 'https://i.pravatar.cc/40?img=53', rating: 5, comment: 'Trải nghiệm tuyệt vời, nhân viên thân thiện và chu đáo.', date: '01/04/2026' },
          ];
          const facilities = [
            { icon: <WifiOutlined />, label: 'WiFi tốc độ cao miễn phí' },
            { icon: <CarOutlined />, label: 'Bãi đỗ xe miễn phí' },
            { icon: <CoffeeOutlined />, label: 'Bữa sáng buffet' },
            { icon: <SafetyCertificateOutlined />, label: 'Két an toàn trong phòng' },
            { icon: <CustomerServiceOutlined />, label: 'Dịch vụ phòng 24/7' },
            { icon: '🏊', label: 'Hồ bơi ngoài trời' },
            { icon: '🛁', label: 'Bồn tắm sang trọng' },
            { icon: '❄️', label: 'Điều hòa nhiệt độ' },
            { icon: '📺', label: 'TV màn hình phẳng 55"' },
            { icon: '🍷', label: 'Minibar miễn phí' },
          ];
          const ratingBreakdown = [
            { label: 'Vệ sinh', value: 96 },
            { label: 'Tiện nghi', value: 92 },
            { label: 'Dịch vụ', value: 98 },
            { label: 'Vị trí', value: 88 },
          ];
          return (
            <div>
              {/* Hero Image */}
              <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
                <img src={roomImg} alt={drawerRoom.roomTypeName} onError={(e) => { e.target.src = FALLBACK_IMG; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))' }} />
                <div style={{ position: 'absolute', bottom: 20, left: 24 }}>
                  <Tag color={villa ? 'gold' : 'geekblue'} style={{ marginBottom: 8, fontSize: 13 }}>{drawerRoom.roomTypeName}</Tag>
                  <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                    {villa ? `🏡 ${drawerRoom.roomTypeName}` : `Phòng ${drawerRoom.roomNumber || drawerRoom.RoomNumber}`}
                  </div>
                  <Rate disabled allowHalf defaultValue={drawerRoom.rating} style={{ fontSize: 14, marginTop: 4 }} />
                </div>
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <Tag color={isAvailable ? 'success' : 'error'} style={{ fontSize: 13, padding: '4px 12px' }}>
                    {isAvailable ? '✅ Còn phòng' : '❌ Hết phòng'}
                  </Tag>
                </div>
              </div>

              {/* Price + Book */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#fffbf0', borderBottom: '1px solid #f0e9d2' }}>
                <div>
                  <Text type="secondary">Giá mỗi đêm</Text>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#c9a961', lineHeight: 1.2 }}>{drawerRoom.basePrice?.toLocaleString()}₫</div>
                </div>
                <Button
                  type="primary"
                  size="large"
                  disabled={!isAvailable}
                  onClick={() => { setDrawerRoom(null); handleSelectRoom(drawerRoom); }}
                  style={{ background: '#c9a961', borderColor: '#c9a961', fontWeight: 700, borderRadius: 8, height: 46, padding: '0 28px' }}
                >
                  {isAvailable ? '🛎️ Đặt phòng ngay' : 'Hết phòng'}
                </Button>
              </div>

              {/* Tabs */}
              <Tabs
                defaultActiveKey="overview"
                style={{ padding: '0 24px' }}
                tabBarStyle={{ fontWeight: 600 }}
                items={[
                  {
                    key: 'overview',
                    label: '📋 Tổng quan',
                    children: (
                      <div style={{ paddingBottom: 32 }}>
                        <Title level={5} style={{ marginTop: 16 }}>Mô tả phòng</Title>
                        <Paragraph style={{ color: '#555', lineHeight: 1.8, fontSize: 14 }}>
                          {drawerRoom.description} Phòng được trang bị nội thất cao cấp với thiết kế hiện đại sang trọng,
                          mang lại cảm giác thư giãn hoàn toàn. Từ cửa sổ phòng, quý khách có thể ngắm nhìn toàn cảnh thành phố tuyệt đẹp.
                        </Paragraph>
                        <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
                          {[
                            { label: 'Diện tích', value: villa ? '200–450 m²' : '35–60 m²' },
                            { label: 'Loại giường', value: villa ? 'King + Queen' : 'King size' },
                            { label: 'Sức chứa', value: villa ? 'Tối đa 8 người' : 'Tối đa 2 người' },
                            { label: 'Tầng', value: `Tầng ${drawerRoom.floor || drawerRoom.Floor || '1'}` },
                          ].map(info => (
                            <Col span={12} key={info.label}>
                              <Card size="small" style={{ borderRadius: 10, background: '#fafafa', textAlign: 'center' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>{info.label}</Text>
                                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>{info.value}</div>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )
                  },
                  {
                    key: 'facilities',
                    label: '🏨 Cơ sở vật chất',
                    children: (
                      <div style={{ paddingBottom: 32 }}>
                        <Title level={5} style={{ marginTop: 16 }}>Tiện nghi trong phòng</Title>
                        <Row gutter={[10, 10]}>
                          {facilities.map((item, i) => (
                            <Col span={12} key={i}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9f9f9', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                                <span style={{ fontSize: 18, color: '#c9a961' }}>{item.icon}</span>
                                <Text style={{ fontSize: 13 }}>{item.label}</Text>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )
                  },
                  {
                    key: 'reviews',
                    label: '⭐ Đánh giá',
                    children: (
                      <div style={{ paddingBottom: 32 }}>
                        <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 48, fontWeight: 900, color: '#c9a961', lineHeight: 1 }}>4.8</div>
                            <Rate disabled allowHalf defaultValue={4.8} style={{ fontSize: 14, marginTop: 4 }} />
                            <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>123 đánh giá</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            {ratingBreakdown.map(rb => (
                              <div key={rb.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Text style={{ minWidth: 65, fontSize: 12 }}>{rb.label}</Text>
                                <Progress percent={rb.value} showInfo={false} strokeColor="#c9a961" trailColor="#f0f0f0" style={{ flex: 1, margin: 0 }} />
                                <Text style={{ minWidth: 32, fontSize: 12, textAlign: 'right' }}>{rb.value}%</Text>
                              </div>
                            ))}
                          </div>
                        </div>
                        <List
                          dataSource={fakeReviews}
                          renderItem={rv => (
                            <List.Item style={{ padding: '16px 0' }}>
                              <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                  <Avatar src={rv.avatar} size={40} />
                                  <div>
                                    <Text strong>{rv.name}</Text>
                                    <div>
                                      <Rate disabled defaultValue={rv.rating} style={{ fontSize: 12 }} />
                                      <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>{rv.date}</Text>
                                    </div>
                                  </div>
                                </div>
                                <Paragraph style={{ color: '#444', margin: 0, fontStyle: 'italic', fontSize: 14 }}>"{rv.comment}"</Paragraph>
                              </div>
                            </List.Item>
                          )}
                        />
                      </div>
                    )
                  },
                  {
                    key: 'policy',
                    label: '📜 Chính sách',
                    children: (
                      <div style={{ paddingBottom: 32 }}>
                        {[
                          {
                            title: '🕐 Giờ nhận & trả phòng',
                            items: ['Check-in: 14:00 — Check-out: 12:00', 'Nhận phòng sớm trước 10:00 tính thêm 50%', 'Trả phòng muộn sau 18:00 tính thêm 1 đêm']
                          },
                          {
                            title: '❌ Chính sách hủy phòng',
                            items: ['Hủy trước 48 giờ: Hoàn tiền 100%', 'Hủy trong 24–48 giờ: Hoàn tiền 50%', 'Hủy trong vòng 24 giờ: Không hoàn tiền']
                          },
                          {
                            title: '🚭 Quy định chung',
                            items: ['Không hút thuốc trong phòng (phạt 2.000.000₫)', 'Không mang thú cưng', 'Không tổ chức tiệc ồn ào sau 22:00']
                          },
                          {
                            title: '👶 Trẻ em & giường phụ',
                            items: ['Trẻ em dưới 6 tuổi: Miễn phí', 'Trẻ em 6–12 tuổi: Phụ thu 200.000₫/đêm', 'Giường phụ người lớn: 500.000₫/đêm']
                          },
                        ].map(section => (
                          <div key={section.title} style={{ marginBottom: 20 }}>
                            <Title level={5} style={{ marginTop: 16 }}>{section.title}</Title>
                            <div style={{ background: '#fafafa', borderRadius: 10, padding: '12px 16px', border: '1px solid #f0f0f0' }}>
                              {section.items.map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < section.items.length - 1 ? 8 : 0 }}>
                                  <CheckCircleOutlined style={{ color: '#c9a961', marginTop: 3, flexShrink: 0 }} />
                                  <Text style={{ color: '#555', fontSize: 14 }}>{item}</Text>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  },
                ]}
              />
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};

export default CustomerRoomsPage;
