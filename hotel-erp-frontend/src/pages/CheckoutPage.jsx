import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Typography, Divider, Row, Col, message, Tag, Space, Modal, Form, Input, InputNumber, Radio } from 'antd';
import { PrinterOutlined, CreditCardOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [extraFees, setExtraFees] = useState([]);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [feeForm] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('cash'); 

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resultCode = params.get('resultCode');
    const orderId = params.get('orderId');
    if (resultCode !== null) {
      if (resultCode === '0') {
        message.success(`Thanh toán MoMo thành công cho đơn ${orderId}!`, 5);
      } else {
        message.error('Khách hàng đã hủy thanh toán hoặc giao dịch thất bại!', 5);
      }
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchActiveBookings = async () => {
      try {
        const res = await axiosClient.get('/Bookings');
        const active = res.data.filter(b => b.status === 'CheckedIn' || b.status === 'PendingCheckout');
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
    setExtraFees([]);
    setPaymentMethod('cash');
    try {
      const bRes = await axiosClient.get(`/Bookings/${bookingId}`);
      setBookingDetail(bRes.data);
      const roomIds = bRes.data.rooms.map(r => r.roomId);

      try {
        // 🌟 MA PHÁP CẬP NHẬT: Bắt dữ liệu đền bù siêu chuẩn xác 🌟
        const dmgRes = await axiosClient.get('/LossAndDamages');
        const bookingDamages = dmgRes.data.filter(d => {
            const dRoomId = d.roomId || d.RoomId;
            const dStatus = d.status !== undefined ? d.status : d.Status;
            // Bắt những vật tư thuộc phòng của đơn này và Chưa thanh toán
            return roomIds.includes(dRoomId) && (dStatus === 0 || dStatus === 'Unpaid' || dStatus !== 1);
        });
        setDamages(bookingDamages);
      } catch (dmgErr) {
        console.log("Lỗi tải danh sách đền bù, hoặc chưa có API:", dmgErr);
        setDamages([]);
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFee = (values) => {
    setExtraFees([...extraFees, { id: Date.now(), reason: values.reason, amount: values.amount }]);
    setIsFeeModalOpen(false);
    feeForm.resetFields();
  };

  const handleRemoveFee = (idToRemove) => {
    setExtraFees(extraFees.filter(fee => fee.id !== idToRemove));
  };

  const calculateRoomCharges = () => {
    if (!bookingDetail) return { roomCharge: 0, penaltyCharge: 0, details: [] };
    const today = dayjs().startOf('day');
    let totalRoom = 0;
    let totalPenalty = 0;
    let calcDetails = [];
    bookingDetail.rooms.forEach(r => {
      const checkIn = dayjs(r.checkInDate).startOf('day');
      const checkOut = dayjs(r.checkOutDate).startOf('day');
      let stayedNights = today.diff(checkIn, 'day');
      if (stayedNights <= 0) stayedNights = 1;
      let unstayedNights = checkOut.diff(today, 'day');
      if (unstayedNights < 0) unstayedNights = 0;
      const stayedCost = stayedNights * r.pricePerNight;
      const penaltyCost = unstayedNights * (r.pricePerNight * 0.5);
      totalRoom += stayedCost;
      totalPenalty += penaltyCost;
      calcDetails.push({ roomName: r.roomName, price: r.pricePerNight, stayedNights, unstayedNights, stayedCost, penaltyCost });
    });
    return { roomCharge: totalRoom, penaltyCharge: totalPenalty, details: calcDetails };
  };

  const { roomCharge, penaltyCharge, details: roomDetails } = calculateRoomCharges();
  
  // 🌟 ĐÃ SỬA: Chống lỗi PascalCase
  const totalDamages = damages.reduce((sum, item) => sum + (item.penaltyAmount || item.PenaltyAmount || 0), 0);
  const totalExtraFees = extraFees.reduce((sum, item) => sum + item.amount, 0);
  const grandTotal = roomCharge + penaltyCharge + totalDamages + totalExtraFees;

  const handlePrint = () => {
    window.print();
  };

  const handleMoMoPayment = async () => {
    try {
      setLoading(true);
      message.loading({ content: 'Đang khởi tạo cổng thanh toán MoMo...', key: 'momo' });
      const response = await axiosClient.post('/Invoices/create-momo-payment', {
        amount: Math.round(grandTotal),
        orderId: bookingDetail.bookingCode
      });
      if (response.data && response.data.payUrl) {
        message.success({ content: 'Đang chuyển hướng sang MoMo...', key: 'momo', duration: 2 });
        window.location.href = response.data.payUrl;
      } else {
        message.error({ content: 'Không nhận được link thanh toán từ MoMo', key: 'momo' });
      }
    } catch (error) {
      console.error(error);
      message.error({ content: 'Lỗi kết nối API MoMo! Bạn hãy kiểm tra lại Key nhé.', key: 'momo' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutClick = () => {
    if (!selectedBookingId) return;
    if (paymentMethod === 'momo') {
      handleMoMoPayment(); 
    } else {
      processFinalCheckout(); 
    }
  };

  const processFinalCheckout = async () => {
    try {
      setLoading(true);
      const checkoutId = selectedBookingId;

      await axiosClient.post('/Invoices/process-payment', {
        bookingId: checkoutId,
        paymentMethod: 'Cash',
        transactionCode: null
      });
      message.success(`Đã thanh toán ${grandTotal.toLocaleString()} VNĐ và trả phòng thành công!`);

      setActiveBookings(prev => prev.filter(b => b.id !== checkoutId));
      setSelectedBookingId(null);
      setBookingDetail(null);
      setDamages([]);
      setExtraFees([]);
      try {
        const res = await axiosClient.get('/Bookings');
        setActiveBookings(res.data.filter(b => b.status === 'CheckedIn' || b.status === 'PendingCheckout'));
      } catch (_) { }
    } catch (error) {
      const errMsg = error?.response?.data || "Lỗi khi trả phòng!";
      message.error(typeof errMsg === 'string' ? errMsg : "Lỗi khi trả phòng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: 'transparent', minHeight: '100vh' }}>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-invoice, #printable-invoice * { visibility: visible; }
            #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; background: white; }
            .no-print { display: none !important; }
            .ant-card { border: none !important; box-shadow: none !important; }
          }
        `}
      </style>
      <Row justify="center">
        <Col xs={24} md={20} lg={16}>
          <Card
            title={<Title level={3} className="no-print" style={{ margin: 0, textAlign: 'center' }}> 💳  Hóa Đơn Thanh Toán (Checkout)</Title>}
            style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <div className="no-print" style={{ marginBottom: 24, textAlign: 'center' }}>
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
                    {b.bookingCode} - Khách: {b.guestName} {b.status === 'PendingCheckout' ? ' ⚠️ Yêu cầu trả phòng' : ''}
                  </Option>
                ))}
              </Select>
            </div>
            
            {bookingDetail ? (
              <>
                <div id="printable-invoice" style={{ padding: '20px', border: '1px dashed #d9d9d9', borderRadius: '8px', background: '#fafafa' }}>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={2} style={{ margin: 0, color: '#1890ff' }}>HÓA ĐƠN KHÁCH SẠN</Title>
                    <Text type="secondary">Mã đơn: {bookingDetail.bookingCode}</Text>
                  </div>
                  
                  <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                      <Text type="secondary">Khách hàng: <b>{bookingDetail.guestName}</b></Text><br/>
                      <Text type="secondary">Ngày Check-in: {dayjs(bookingDetail.checkInDate).format('DD/MM/YYYY')}</Text>
                    </Col>
                    <Col className="no-print"><Tag color="processing">Đang tiến hành Checkout</Tag></Col>
                  </Row>

                  <Text strong style={{ fontSize: '16px' }}>1. Tiền lưu trú thực tế:</Text>
                  <div style={{ paddingLeft: 20, marginBottom: 15, marginTop: 5 }}>
                    {roomDetails.map((r, idx) => (
                      <Row justify="space-between" key={idx}>
                        <Col>- Phòng {r.roomName} ({r.stayedNights} đêm x {r.price.toLocaleString()}đ)</Col>
                        <Col strong>{r.stayedCost.toLocaleString()} đ</Col>
                      </Row>
                    ))}
                  </div>

                  {penaltyCharge > 0 && (
                    <>
                      <Text strong style={{ fontSize: '16px', color: '#fa8c16' }}>2. Phụ thu trả phòng sớm:</Text>
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

                  {damages.length > 0 && (
                    <>
                      <Text strong style={{ fontSize: '16px', color: '#cf1322' }}>{penaltyCharge > 0 ? '3' : '2'}. Phụ thu đền bù (Từ App Dọn Phòng):</Text>
                      <div style={{ paddingLeft: 20, marginBottom: 10, marginTop: 5 }}>
                        {damages.map((d, index) => (
                          <Row justify="space-between" key={index} style={{ color: '#cf1322' }}>
                            {/* 🌟 ĐÃ SỬA: Chống lỗi PascalCase */}
                            <Col>- Phòng {d.roomNumber || d.RoomNumber || 'N/A'}: {d.equipmentName || d.EquipmentName || 'Vật tư'} (SL: {d.quantity || d.Quantity || 1})</Col>
                            <Col>{(d.penaltyAmount || d.PenaltyAmount || 0).toLocaleString()} đ</Col>
                          </Row>
                        ))}
                      </div>
                    </>
                  )}

                  {extraFees.length > 0 && (
                    <>
                      <Text strong style={{ fontSize: '16px', color: '#13c2c2' }}>{penaltyCharge > 0 ? (damages.length > 0 ? '4' : '3') : (damages.length > 0 ? '3' : '2')}. Phụ thu khác:</Text>
                      <div style={{ paddingLeft: 20, marginBottom: 15, marginTop: 5 }}>
                        {extraFees.map((fee) => (
                          <Row justify="space-between" align="middle" style={{ color: '#13c2c2', marginBottom: 4 }} key={fee.id}>
                            <Col>- {fee.reason} <Button className="no-print" type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => handleRemoveFee(fee.id)} style={{ marginLeft: 8 }} /></Col>
                            <Col>{fee.amount.toLocaleString()} đ</Col>
                          </Row>
                        ))}
                      </div>
                    </>
                  )}

                  <Divider style={{ borderBlockColor: '#000' }} />
                  <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col><Title level={3} style={{ margin: 0 }}>TỔNG CẦN THANH TOÁN:</Title></Col>
                    <Col><Title level={2} style={{ margin: 0, color: '#52c41a' }}>{grandTotal.toLocaleString()} VNĐ</Title></Col>
                  </Row>

                  <Button className="no-print" type="dashed" icon={<PlusOutlined />} onClick={() => setIsFeeModalOpen(true)} style={{ marginBottom: 10, width: '100%', borderColor: '#13c2c2', color: '#13c2c2' }}>
                    + Thêm Phí Phụ Thu / Dịch vụ
                  </Button>
                </div>

                <div className="no-print" style={{ marginTop: 20, textAlign: 'right', background: '#f0f2f5', padding: '15px', borderRadius: '8px' }}>
                  <Text strong style={{ fontSize: '16px', marginRight: 16 }}>Phương thức thanh toán:</Text>
                  <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} size="large">
                    <Radio value="cash"> 💵  Tiền mặt</Radio>
                    <Radio value="momo" style={{ color: '#a50064', fontWeight: 'bold' }}> 📱  Ví MoMo</Radio>
                  </Radio.Group>
                </div>

                <Row gutter={16} className="no-print" style={{ marginTop: 20 }}>
                  <Col span={12}>
                    <Button block size="large" icon={<PrinterOutlined />} onClick={handlePrint}>In Hóa Đơn Bản Nháp</Button>
                  </Col>
                  <Col span={12}>
                    <Button type="primary" block size="large" loading={loading} style={{ backgroundColor: paymentMethod === 'momo' ? '#a50064' : '#52c41a', fontWeight: 'bold' }} icon={<CheckCircleOutlined />} onClick={handleCheckoutClick}>
                      {paymentMethod === 'momo' ? 'Chuyển Sang Cổng MoMo' : 'Xác Nhận Thu Tiền & Trả Phòng'}
                    </Button>
                  </Col>
                </Row>
              </>
            ) : (
              <div className="no-print" style={{ textAlign: 'center', padding: '40px 0', color: '#bfbfbf' }}>
                <CreditCardOutlined style={{ fontSize: '48px', marginBottom: 16 }} /><br />
                <Text type="secondary">Vui lòng chọn đơn để hiển thị hóa đơn thanh toán</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal title="Thêm khoản phụ thu" open={isFeeModalOpen} onCancel={() => setIsFeeModalOpen(false)} onOk={() => feeForm.submit()}>
        <Form form={feeForm} layout="vertical" onFinish={handleAddFee}>
          <Form.Item name="reason" label="Lý do phụ thu" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="amount" label="Số tiền (VNĐ)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} min={0}/></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CheckoutPage;
