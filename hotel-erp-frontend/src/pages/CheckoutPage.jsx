import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Typography, Divider, Row, Col, message, Tag, Space, Modal, Form, Input, InputNumber, Radio, QRCode } from 'antd';
import { PrinterOutlined, CreditCardOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const CheckoutPage = () => {
  const [activeBookings, setActiveBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null); // Dữ liệu hóa đơn lấy từ C#
  const [loading, setLoading] = useState(false);

  const [extraFees, setExtraFees] = useState([]);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [feeForm] = Form.useForm();

  const [paymentMethod, setPaymentMethod] = useState('cash'); 
  const [isMoMoModalOpen, setIsMoMoModalOpen] = useState(false);

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
    setExtraFees([]); 
    setPaymentMethod('cash'); 
    try {
      // 1. Lấy thông tin cơ bản của đơn đặt phòng
      const bRes = await axiosClient.get(`/Bookings/${bookingId}`);
      setBookingDetail(bRes.data);

      // 2.  GỌI API C# ĐỂ LẤY BẢNG TÍNH TIỀN (BAO GỒM CẢ VOUCHER ĐÃ TRỪ)
      const invRes = await axiosClient.get(`/Invoices/calculate-invoice/${bookingId}`);
      setInvoiceData(invRes.data);

    } catch (error) {
      console.log(error);
      message.error("Lỗi khi kéo dữ liệu tính tiền từ hệ thống!");
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

  //  TỔNG TIỀN = Tiền cuối cùng C# tính + Phụ phí thủ công trên Frontend
  const totalExtraFees = extraFees.reduce((sum, item) => sum + item.amount, 0); 
  const grandTotal = (invoiceData?.finalTotal || 0) + totalExtraFees; 

  const handlePrint = () => {
    window.print();
  };

  const handleCheckoutClick = () => {
    if (!selectedBookingId) return;
    
    if (paymentMethod === 'momo') {
      setIsMoMoModalOpen(true); 
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
        paymentMethod: paymentMethod === 'momo' ? 'MoMo' : 'Cash',
        transactionCode: paymentMethod === 'momo' ? `MOMO_${Date.now()}` : null
      });

      message.success(`Đã thanh toán ${grandTotal.toLocaleString()} VNĐ và trả phòng thành công!`);
      
      setActiveBookings(prev => prev.filter(b => b.id !== checkoutId));
      setSelectedBookingId(null);
      setBookingDetail(null);
      setInvoiceData(null);
      setExtraFees([]);
      setIsMoMoModalOpen(false);

      try {
        const res = await axiosClient.get('/Bookings');
        setActiveBookings(res.data.filter(b => b.status === 'CheckedIn'));
      } catch (_) { }

    } catch (error) {
      const errMsg = error?.response?.data || "Lỗi khi trả phòng!";
      message.error(typeof errMsg === 'string' ? errMsg : "Lỗi khi trả phòng!");
    } finally {
      setLoading(false);
    }
  };

  const momoQrData = `2|99|0398628920|BO TAN PHAT|email|0|0|${grandTotal}|ThanhToan_${bookingDetail?.bookingCode}`;

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
            title={<Title level={3} className="no-print" style={{ margin: 0, textAlign: 'center' }}>💳 Hóa Đơn Thanh Toán (Checkout)</Title>} 
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
                    {b.bookingCode} - Khách: {b.guestName}
                  </Option>
                ))}
              </Select>
            </div>

            {bookingDetail && invoiceData ? (
              <>
                <div id="printable-invoice" style={{ padding: '20px', border: '1px dashed #d9d9d9', borderRadius: '8px', background: '#fafafa' }}>
                  
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={2} style={{ margin: 0, color: '#1890ff' }}>HÓA ĐƠN KHÁCH SẠN</Title>
                    <Text type="secondary">Mã đơn: {bookingDetail.bookingCode}</Text>
                  </div>

                  <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                      <Text type="secondary">Khách hàng: <b>{bookingDetail.guestName}</b></Text>
                      <br/>
                      <Text type="secondary">Ngày Check-in: {dayjs(bookingDetail.checkInDate).format('DD/MM/YYYY')}</Text>
                    </Col>
                    <Col className="no-print"><Tag color="processing">Đang tiến hành Checkout</Tag></Col>
                  </Row>
                  
                  <Text strong style={{ fontSize: '16px' }}>1. Dịch vụ lưu trú & Tiện ích:</Text>
                  <div style={{ paddingLeft: 20, marginBottom: 15, marginTop: 5 }}>
                    <Row justify="space-between">
                      <Col>- Tổng tiền phòng</Col>
                      <Col strong>{(invoiceData.totalRoomAmount || 0).toLocaleString()} đ</Col>
                    </Row>
                    {invoiceData.totalServiceAmount > 0 && (
                      <Row justify="space-between">
                        <Col>- Phí dịch vụ đi kèm</Col>
                        <Col>{invoiceData.totalServiceAmount.toLocaleString()} đ</Col>
                      </Row>
                    )}
                    {invoiceData.totalDamageAmount > 0 && (
                      <Row justify="space-between" style={{ color: '#cf1322' }}>
                        <Col>- Phụ thu đền bù hư hỏng</Col>
                        <Col>{invoiceData.totalDamageAmount.toLocaleString()} đ</Col>
                      </Row>
                    )}
                  </div>

                  {/*  VOUCHER ĐÃ HIỂN THỊ TẠI ĐÂY */}
                  {invoiceData.discountAmount > 0 && (
                    <>
                      <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>2. Khuyến mãi & Giảm giá:</Text>
                      <div style={{ paddingLeft: 20, marginBottom: 15, marginTop: 5 }}>
                        <Row justify="space-between" style={{ color: '#52c41a' }}>
                          <Col>- Trừ Voucher / Hạng thành viên</Col>
                          <Col>- {invoiceData.discountAmount.toLocaleString()} đ</Col>
                        </Row>
                      </div>
                    </>
                  )}

                  {/*  THUẾ */}
                  {invoiceData.taxAmount > 0 && (
                    <>
                      <Text strong style={{ fontSize: '16px', color: '#8c8c8c' }}>{invoiceData.discountAmount > 0 ? '3' : '2'}. Thuế VAT (10%):</Text>
                      <div style={{ paddingLeft: 20, marginBottom: 15, marginTop: 5 }}>
                        <Row justify="space-between" style={{ color: '#8c8c8c' }}>
                          <Col>- Tiền thuế</Col>
                          <Col>{invoiceData.taxAmount.toLocaleString()} đ</Col>
                        </Row>
                      </div>
                    </>
                  )}

                  {/* PHỤ THU THỦ CÔNG */}
                  {extraFees.length > 0 && (
                    <>
                      <Text strong style={{ fontSize: '16px', color: '#13c2c2' }}>{invoiceData.taxAmount > 0 ? (invoiceData.discountAmount > 0 ? '4' : '3') : 'X'}. Phụ thu khác:</Text>
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
                    <Col><Title level={2} style={{ margin: 0, color: '#fa8c16' }}>{grandTotal.toLocaleString()} VNĐ</Title></Col>
                  </Row>
                  
                  <Button 
                    className="no-print" type="dashed" icon={<PlusOutlined />} onClick={() => setIsFeeModalOpen(true)}
                    style={{ marginBottom: 10, width: '100%', borderColor: '#13c2c2', color: '#13c2c2' }}
                  >
                    + Thêm Phí Phụ Thu / Dịch vụ
                  </Button>
                </div>

                <div className="no-print" style={{ marginTop: 20, textAlign: 'right', background: '#f0f2f5', padding: '15px', borderRadius: '8px' }}>
                  <Text strong style={{ fontSize: '16px', marginRight: 16 }}>Phương thức thanh toán:</Text>
                  <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} size="large">
                    <Radio value="cash">💵 Tiền mặt</Radio>
                    <Radio value="momo" style={{ color: '#a50064', fontWeight: 'bold' }}>📱 Ví MoMo</Radio>
                  </Radio.Group>
                </div>

                <Row gutter={16} className="no-print" style={{ marginTop: 20 }}>
                  <Col span={12}>
                    <Button block size="large" icon={<PrinterOutlined />} onClick={handlePrint}>
                      In Hóa Đơn Bản Nháp
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button 
                      type="primary" block size="large" 
                      style={{ backgroundColor: paymentMethod === 'momo' ? '#a50064' : '#52c41a', fontWeight: 'bold' }} 
                      icon={<CheckCircleOutlined />} onClick={handleCheckoutClick}
                    >
                      {paymentMethod === 'momo' ? 'Tạo Mã QR & Trả Phòng' : 'Xác Nhận Thu Tiền & Trả Phòng'}
                    </Button>
                  </Col>
                </Row>
              </>
            ) : (
              <div className="no-print" style={{ textAlign: 'center', padding: '40px 0', color: '#bfbfbf' }}>
                <CreditCardOutlined style={{ fontSize: '48px', marginBottom: 16 }} />
                <br />
                <Text type="secondary">Vui lòng chọn đơn để hiển thị hóa đơn thanh toán</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* MODAL PHỤ THU */}
      <Modal title="Thêm khoản phụ thu" open={isFeeModalOpen} onCancel={() => setIsFeeModalOpen(false)} onOk={() => feeForm.submit()}>
        <Form form={feeForm} layout="vertical" onFinish={handleAddFee}>
          <Form.Item name="reason" label="Lý do phụ thu" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="amount" label="Số tiền (VNĐ)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} min={0}/></Form.Item>
        </Form>
      </Modal>

      {/* MODAL QUÉT MÃ MOMO */}
      <Modal
        title={null}
        open={isMoMoModalOpen}
        onCancel={() => setIsMoMoModalOpen(false)}
        footer={null}
        width={400}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" style={{ width: 60, marginBottom: 10 }} />
          <Title level={4} style={{ color: '#a50064', marginTop: 0 }}>Quét mã để thanh toán</Title>
          <Text type="secondary">Đơn hàng: {bookingDetail?.bookingCode}</Text>
          
          <div style={{ margin: '20px auto', padding: '15px', background: '#fff', borderRadius: '12px', border: '2px solid #a50064', display: 'inline-block' }}>
            <QRCode 
              value={momoQrData} 
              size={220} 
              color="#a50064"
              bordered={false}
            />
          </div>

          <Title level={2} style={{ color: '#a50064', margin: '10px 0' }}>
            {grandTotal.toLocaleString()} VNĐ
          </Title>
          <Text italic type="secondary">Vui lòng yêu cầu khách quét mã trên ứng dụng MoMo.</Text>

          <Divider style={{ margin: '24px 0 16px 0' }} />
          
          <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
            <Button onClick={() => setIsMoMoModalOpen(false)}>Hủy</Button>
            <Button 
              type="primary" 
              loading={loading}
              onClick={processFinalCheckout}
              style={{ backgroundColor: '#a50064', fontWeight: 'bold' }}
              icon={<CheckCircleOutlined />}
            >
              Khách Đã Thanh Toán
            </Button>
          </Space>
        </div>
      </Modal>

    </div>
  );
};

export default CheckoutPage;