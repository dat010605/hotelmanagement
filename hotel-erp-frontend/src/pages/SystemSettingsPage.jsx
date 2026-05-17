import React from 'react';
import { Card, Switch, ColorPicker, Divider, Typography, Row, Col, Button, Space, message } from 'antd';
import { BgColorsOutlined, DesktopOutlined, CompressOutlined, UndoOutlined } from '@ant-design/icons';
import useSettingsStore from '../store/useSettingsStore';

const { Title, Text } = Typography;

const SystemSettingsPage = () => {
  const { 
    themeMode, setThemeMode, 
    primaryColor, setPrimaryColor, 
    compactMode, setCompactMode,
    resetSettings 
  } = useSettingsStore();

  const handleReset = () => {
    resetSettings();
    message.success('Đã khôi phục cài đặt gốc!');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<span style={{fontSize: '20px', fontWeight: 'bold'}}>⚙️ Cấu hình hệ thống</span>} bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Title level={5}><DesktopOutlined /> Giao diện</Title>
            <Divider style={{ margin: '12px 0' }} />
            
            <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col>
                <Text strong>Chế độ tối (Dark Mode)</Text>
                <br/>
                <Text type="secondary" style={{ fontSize: 13 }}>Chuyển đổi giao diện sang nền tối giúp bảo vệ mắt</Text>
              </Col>
              <Col>
                <Switch 
                  checked={themeMode === 'dark'} 
                  onChange={(checked) => setThemeMode(checked ? 'dark' : 'light')} 
                  checkedChildren="Tối" 
                  unCheckedChildren="Sáng"
                />
              </Col>
            </Row>

            <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col>
                <Text strong>Chế độ thu gọn (Compact Mode)</Text>
                <br/>
                <Text type="secondary" style={{ fontSize: 13 }}>Thu nhỏ kích thước các thành phần để hiển thị nhiều thông tin hơn (Bảng, nút bấm, ...)</Text>
              </Col>
              <Col>
                <Switch 
                  checked={compactMode} 
                  onChange={(checked) => setCompactMode(checked)} 
                />
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Title level={5}><BgColorsOutlined /> Màu sắc</Title>
            <Divider style={{ margin: '12px 0' }} />
            
            <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col>
                <Text strong>Màu chủ đạo (Primary Color)</Text>
                <br/>
                <Text type="secondary" style={{ fontSize: 13 }}>Tùy chỉnh màu sắc chính của toàn bộ hệ thống</Text>
              </Col>
              <Col>
                <ColorPicker 
                  value={primaryColor} 
                  onChange={(color, hex) => setPrimaryColor(hex)} 
                  showText 
                />
              </Col>
            </Row>
          </Col>

          <Col span={24} style={{ marginTop: 24, textAlign: 'right' }}>
            <Button icon={<UndoOutlined />} onClick={handleReset} type="default">
              Khôi phục mặc định
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SystemSettingsPage;
