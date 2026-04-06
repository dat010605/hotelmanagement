import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Typography, Divider, Table, Row, Col, message, Tag, Space } from 'antd';
import { PrinterOutlined, CreditCardOutlined, CheckCircleOutlined, ShopOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const CheckoutPage = () => {
  const [activeBookings, setActiveBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [damages, setDamages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy các ĐƠN ĐẶT PHÒNG đang ở trạng thái CheckedIn (Đang ở)
  useEffect(() => {
    const fetchActiveBookings = async () => {
      try {
        const res = await axiosClient.get('/Bookings');
        const active = res.data.filter(b => b.status === 'CheckedIn');
        setActiveBookings(active);
      } catch (error) {
        message.error("Lỗi tải danh sách đơn đặt phòng!");
      }
    };
    fetchActiveBookings();
  }, []);

  const handleSelectBooking = async (bookingId) => {
    setSelectedBookingId(bookingId);
    setLoading(true);
    try {
      // 1. Lấy chi tiết đơn
      const bRes = await axiosClient.get(`/Bookings/${bookingId}`);
      setBookingDetail(bRes.data);

      // 2. Tìm tiền đền bù của các phòng trong đơn này
      const roomIds = bRes.data.rooms.map(r => r.roomId);
      const dmgRes = await axiosClient.get('/LossAndDamages');
      
      const bookingDamages = dmgRes.data.filter(d => 
        roomIds.includes(d.roomId || d.roomNumber) && d.status !== 1 // Chưa thu tiền
      );
      setDamages(bookingDamages);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // THUẬT TOÁN TÍNH TIỀN (PHẠT TRẢ PHÒNG SỚM)
  // ==========================================
  const calculateRoomCharges = () => {
    if (!bookingDetail) return { roomCharge: 0, penaltyCharge: 0, details: [] };

    const today = dayjs().startOf('day');
    let totalRoom = 0;
    let totalPenalty = 0;
    let calcDetails = [];

    bookingDetail.rooms.forEach(r => {
      const checkIn = dayjs(r.checkInDate).startOf('day');
      const checkOut = dayjs(r.checkOutDate).startOf('day');

      // Số đêm đã ở thực tế (Tính từ lúc Check-in đến Hôm nay)
      let stayedNights = today.diff(checkIn, 'day');
      if (stayedNights <= 0) stayedNights = 1; // Ít nhất phải tính 1 đêm dù vừa check-in xong check-out liền

      // Số đêm chưa ở (Tính từ Hôm nay đến ngày Check-out dự kiến)
      let unstayedNights = checkOut.diff(today, 'day');
      if (unstayedNights < 0) unstayedNights = 0; // Trả trễ thì không tính phần này (Có thể tính phụ thu trả trễ ở đây nếu cần)

      const stayedCost = stayedNights * r.pricePerNight;
      const penaltyCost = unstayedNights * (r.pricePerNight * 0.5); // Phạt 50% những ngày không ở

      totalRoom += stayedCost;
      totalPenalty += penaltyCost;

      calcDetails.push({
        roomName: r.roomName,
        price: r.pricePerNight,
        stayedNights,
        unstayedNights,
        stayedCost,
        penaltyCost
      });
    });

    return { roomCharge: totalRoom, penaltyCharge: totalPenalty, details: calcDetails };
  };

  const { roomCharge, penaltyCharge, details: roomDetails } = calculateRoomCharges();
  const totalDamages = damages.reduce((sum, item) => sum + (item.penaltyAmount || 0), 0);
  const grandTotal = roomCharge + penaltyCharge + totalDamages;

  const handleCheckout = async () => {
    if (!selectedBookingId) return;
    try {
      setLoading(true);
      // Gọi API Chốt sổ Checkout bên C#
      await axiosClient.patch(`/Bookings/${selectedBookingId}/checkout`);
      message.success(`Đã thu ${grandTotal.toLocaleString()} VNĐ và trả phòng thành công!`);
      
      // Reset form
      setSelectedBookingId(null);
      setBookingDetail(null);
      setDamages([]);
      
      // Cập nhật lại danh sách đơn đang ở
      const res = await axiosClient.get('/Bookings');
      setActiveBookings(res.data.filter(b => b.status === 'CheckedIn'));

    } catch (error) {
      message.error("Lỗi khi trả phòng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} md={20} lg={16}>
          <Card 
            title={<Title level={3} style={{ margin: 0, textAlign: 'center' }}>💳 Hóa Đơn Thanh Toán (Checkout)</Title>} 
            style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <Text strong style={{ fontSize: '16px' }}>Chọn đơn cần thanh toán: </Text>
              <Select 
                showSearch
                placeholder="-- Tìm theo tên khách hoặc Mã đơn --" 
                style={{ width: 350, marginLeft: 10 }}
                onChange={handleSelectBooking}
                size="large"
                value={selectedBookingId}
              >
                {activeBookings.map(b => (
                  <Option key={b.id} value={b.id}>
                    {b.bookingCode} - Khách: {b.guestName}
                  </Option>
                ))}
              </Select>
            </div>

            {bookingDetail ? (
              <div style={{ padding: '20px', border: '1px dashed #d9d9d9', borderRadius: '8px', background: '#fafafa' }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                  <Col>
                    <Title level={4} style={{ color: '#1890ff', margin: 0 }}>Hóa đơn: {bookingDetail.bookingCode}</Title>
                    <Text type="secondary">Khách hàng: <b>{bookingDetail.guestName}</b></Text>
                  </Col>
                  <Col><Tag color="processing">Đang tiến hành Checkout</Tag></Col>
                </Row>
                
                {/* 1. TIỀN PHÒNG */}
                <Text strong style={{ fontSize: '16px' }}>1. Tiền lưu trú thực tế:</Text>
                <div style={{ paddingLeft: 20, marginBottom: 15, marginTop: 5 }}>
                  {roomDetails.map((r, idx) => (
                    <Row justify="space-between" key={idx}>
                      <Col>- Phòng {r.roomName} ({r.stayedNights} đêm x {r.price.toLocaleString()}đ)</Col>
                      <Col strong>{r.stayedCost.toLocaleString()} đ</Col>
                    </Row>
                  ))}
                </div>

                {/* 2. PHẠT TRẢ SỚM */}
                {penaltyCharge > 0 && (
                  <>
                    <Text strong style={{ fontSize: '16px', color: '#fa8c16' }}>2. Phụ thu trả phòng sớm (50% ngày còn lại):</Text>
                    <div style={{ paddingLeft: 20, marginBottom: 15, marginTop: 5 }}>
                      {roomDetails.filter(r => r.unstayedNights > 0).map((r, idx) => (
                        <Row justify="space-between" key={idx} style={{ color: '#fa8c16' }}>
                          <Col>- Phòng {r.roomName} (Bỏ trống {r.unstayedNights} đêm)</Col>
                          <Col>{r.penaltyCost.toLocaleString()} đ</Col>
                        </Row>
                      ))}
                    </div>
                  </>
                )}

                {/* 3. TIỀN ĐỀN BÙ */}
                {damages.length > 0 && (
                  <>
                    <Text strong style={{ fontSize: '16px', color: '#cf1322' }}>3. Phụ thu hư hỏng / đền bù:</Text>
                    <div style={{ paddingLeft: 20, marginBottom: 10, marginTop: 5 }}>
                      {damages.map((d, index) => (
                        <Row justify="space-between" key={index} style={{ color: '#cf1322' }}>
                          <Col>- Phòng {d.roomNumber}: {d.equipmentName} (SL: {d.quantity})</Col>
                          <Col>{(d.penaltyAmount || 0).toLocaleString()} đ</Col>
                        </Row>
                      ))}
                    </div>
                  </>
                )}

                <Divider style={{ borderBlockColor: '#000' }} />

                {/* TỔNG TIỀN */}
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                  <Col><Title level={3} style={{ margin: 0 }}>TỔNG CỘNG:</Title></Col>
                  <Col><Title level={2} style={{ margin: 0, color: '#52c41a' }}>{grandTotal.toLocaleString()} VNĐ</Title></Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Button block size="large" icon={<PrinterOutlined />}>In Hóa Đơn</Button>
                  </Col>
                  <Col span={12}>
                    <Button 
                      type="primary" block size="large" loading={loading}
                      style={{ backgroundColor: '#52c41a', fontWeight: 'bold' }} 
                      icon={<CheckCircleOutlined />} onClick={handleCheckout}
                    >
                      Xác Nhận Thu Tiền & Trả Phòng
                    </Button>
                  </Col>
                </Row>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#bfbfbf' }}>
                <CreditCardOutlined style={{ fontSize: '48px', marginBottom: 16 }} />
                <br />
                <Text type="secondary">Vui lòng chọn đơn để hiển thị hóa đơn thanh toán</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;