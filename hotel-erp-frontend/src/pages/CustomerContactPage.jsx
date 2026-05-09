import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Input, Form, Divider, message } from 'antd';
import {
  PhoneOutlined, MailOutlined, EnvironmentOutlined,
  ClockCircleOutlined, SendOutlined, GlobalOutlined,
  FacebookOutlined, InstagramOutlined, YoutubeOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const CONTACT_INFO = [
  {
    icon: <PhoneOutlined style={{ fontSize: 28, color: '#c9a961' }} />,
    title: 'Điện thoại',
    details: ['+84 (0) 236 3888 888', '+84 (0) 905 123 456 (Hotline)'],
  },
  {
    icon: <MailOutlined style={{ fontSize: 28, color: '#c9a961' }} />,
    title: 'Email',
    details: ['hotelnhungnguoiban@gmail.com', 'The Royal Citadel'],
  },
  {
    icon: <EnvironmentOutlined style={{ fontSize: 28, color: '#c9a961' }} />,
    title: 'Địa chỉ',
    details: ['Bãi biển Mỹ Khê, Quận Ngũ Hành Sơn', 'TP. Đà Nẵng, Việt Nam'],
  },
  {
    icon: <ClockCircleOutlined style={{ fontSize: 28, color: '#c9a961' }} />,
    title: 'Giờ làm việc',
    details: ['Lễ tân: 24/7', 'Đặt phòng: 07:00 – 22:00'],
  },
];

const CustomerContactPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    // Giả lập gửi form
    setTimeout(() => {
      message.success('Cảm ơn bạn! Chúng tôi sẽ phản hồi trong 24 giờ.');
      form.resetFields();
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{
        textAlign: 'center', padding: '60px 20px 40px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: 16, marginBottom: 48, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(201,169,97,0.1) 0%, transparent 60%)',
        }} />
        <Title level={1} style={{
          color: '#fff', margin: 0, fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, position: 'relative',
        }}>
          Liên Hệ
        </Title>
        <div style={{ width: 60, height: 1, background: '#c9a961', margin: '16px auto' }} />
        <Paragraph style={{
          color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 600,
          margin: '0 auto', position: 'relative', letterSpacing: '1px',
        }}>
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
        </Paragraph>
      </div>

      {/* Contact Info Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
        {CONTACT_INFO.map((info, idx) => (
          <Col xs={24} sm={12} md={6} key={idx}>
            <Card
              hoverable
              style={{
                borderRadius: 16, textAlign: 'center', height: '100%',
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s',
              }}
              bodyStyle={{ padding: 28 }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#fdf8ed', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px',
              }}>
                {info.icon}
              </div>
              <Title level={5} style={{ marginBottom: 8, color: '#1a1a2e' }}>{info.title}</Title>
              {info.details.map((d, i) => (
                <Text key={i} style={{ display: 'block', color: '#595959', fontSize: 14, lineHeight: 1.8 }}>
                  {d}
                </Text>
              ))}
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[32, 32]}>
        {/* Contact Form */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: 16, border: '1px solid #f0f0f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}
            bodyStyle={{ padding: 32 }}
          >
            <Title level={3} style={{ fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>
              Gửi Tin Nhắn
            </Title>
            <div style={{ width: 40, height: 2, background: '#c9a961', marginBottom: 24 }} />

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                  >
                    <Input size="large" placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                  >
                    <Input size="large" placeholder="email@example.com" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="phone"
                label="Số điện thoại"
              >
                <Input size="large" placeholder="+84 905 xxx xxx" style={{ borderRadius: 8 }} />
              </Form.Item>

              <Form.Item
                name="subject"
                label="Chủ đề"
                rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}
              >
                <Input size="large" placeholder="VD: Đặt phòng, Hỏi giá, Góp ý..." style={{ borderRadius: 8 }} />
              </Form.Item>

              <Form.Item
                name="message"
                label="Nội dung"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
              >
                <TextArea rows={5} placeholder="Nội dung tin nhắn của bạn..." style={{ borderRadius: 8 }} />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<SendOutlined />}
                style={{
                  background: '#c9a961', borderColor: '#c9a961',
                  borderRadius: 4, letterSpacing: 1, fontWeight: 600,
                  width: '100%', height: 48,
                }}
              >
                GỬI TIN NHẮN
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Map */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: 16, overflow: 'hidden', height: '100%', minHeight: 500,
              border: '1px solid #f0f0f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}
            bodyStyle={{ padding: 0, height: '100%' }}
          >
            <div style={{ padding: '24px 24px 16px' }}>
              <Title level={3} style={{ fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>
                Vị Trí
              </Title>
              <div style={{ width: 40, height: 2, background: '#c9a961', marginBottom: 8 }} />
              <Text type="secondary">The Royal Citadel – Bãi biển Mỹ Khê, Đà Nẵng</Text>
            </div>
            <div style={{ height: 'calc(100% - 90px)' }}>
              <iframe
                title="The Royal Citadel Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15336.5!2d108.245!3d16.045!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142177f2ced6d0b%3A0xdcf48a3b9f06e7e5!2zQuOjaSBiaeG7g24gTeG7uSBLaMOq!5e0!3m2!1svi!2s!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Social Links */}
      <div style={{
        textAlign: 'center', marginTop: 48, padding: '40px 24px',
        background: 'linear-gradient(135deg, #0f3460, #1a1a2e)',
        borderRadius: 16,
      }}>
        <Title level={4} style={{ color: '#fff', fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
          Theo dõi chúng tôi
        </Title>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
          {[
            { icon: <FacebookOutlined />, label: 'Facebook' },
            { icon: <InstagramOutlined />, label: 'Instagram' },
            { icon: <YoutubeOutlined />, label: 'YouTube' },
            { icon: <GlobalOutlined />, label: 'Website' },
          ].map(s => (
            <Button
              key={s.label}
              shape="circle"
              size="large"
              icon={s.icon}
              style={{
                background: 'transparent', border: '1.5px solid #c9a961',
                color: '#c9a961', width: 48, height: 48, fontSize: 20,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.target.style.background = '#c9a961'; e.target.style.color = '#1a1a2e'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#c9a961'; }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerContactPage;
