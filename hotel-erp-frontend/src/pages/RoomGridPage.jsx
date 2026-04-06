import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Badge, Tag, Typography, 
  Tabs, Tooltip, Button, Empty, Space, Modal 
} from 'antd';
import { 
  CheckCircleOutlined, SyncOutlined, 
  WarningOutlined, CoffeeOutlined, UserOutlined 
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const RoomGridPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/Rooms');
      setRooms(res.data);
    } catch (error) {
      console.error("Lỗi tải sơ đồ phòng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    //  Ma pháp: Tự động cập nhật sau mỗi 30 giây để lễ tân luôn thấy số mới nhất
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
  }, []);

  // Hàm định nghĩa màu sắc và icon cho từng trạng thái
  const getStatusConfig = (status, cleaning) => {
    if (status === 'Occupied') return { color: '#f5222d', icon: <UserOutlined />, text: 'Có khách' };
    if (status === 'Maintenance') return { color: '#8c8c8c', icon: <WarningOutlined />, text: 'Bảo trì' };
    if (cleaning === 'Dirty') return { color: '#faad14', icon: <CoffeeOutlined />, text: 'Chờ dọn' };
    return { color: '#52c41a', icon: <CheckCircleOutlined />, text: 'Sẵn sàng' };
  };

  const uniqueFloors = [...new Set(rooms.map(r => r.floor || r.Floor))].sort((a, b) => a - b);

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card bordered={false} style={{ borderRadius: '12px' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>📊 Sơ đồ phòng trực tuyến</Title>
          </Col>
          <Col>
            <Space size="large">
              <Badge color="#52c41a" text="Sẵn sàng" />
              <Badge color="#f5222d" text="Có khách" />
              <Badge color="#faad14" text="Chờ dọn" />
              <Badge color="#8c8c8c" text="Bảo trì" />
              <Button icon={<SyncOutlined />} onClick={fetchRooms}>Làm mới</Button>
            </Space>
          </Col>
        </Row>

        <Tabs defaultActiveKey="1" type="line" size="large">
          {uniqueFloors.map(floor => (
            <TabPane tab={<b style={{ fontSize: '16px' }}>Tầng {floor}</b>} key={floor}>
              <Row gutter={[16, 16]}>
                {rooms.filter(r => (r.floor || r.Floor) === floor).map(room => {
                  const config = getStatusConfig(room.status || room.Status, room.cleaningStatus || room.CleaningStatus);
                  return (
                    <Col xs={12} sm={8} md={6} lg={4} xl={3} key={room.id}>
                      <Tooltip title={`${room.roomTypeName || 'Hạng phòng'}`}>
                        <Card
                          hoverable
                          style={{ 
                            borderRadius: '10px', 
                            borderTop: `5px solid ${config.color}`,
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                          onClick={() => Modal.info({ title: `Thông tin Phòng ${room.roomNumber}`, content: 'Tính năng xem nhanh đang phát triển...' })}
                        >
                          <Title level={4} style={{ margin: 0 }}>{room.roomNumber || room.RoomNumber}</Title>
                          <div style={{ marginTop: 8 }}>
                            <Tag color={config.color} icon={config.icon} style={{ margin: 0 }}>
                              {config.text}
                            </Tag>
                          </div>
                        </Card>
                      </Tooltip>
                    </Col>
                  );
                })}
              </Row>
            </TabPane>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

export default RoomGridPage;