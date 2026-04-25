import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Spin, Empty, Select, Space, Rate } from 'antd';
import { CheckCircleOutlined, UserOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CustomerRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for Filter & Sort
  const [selectedType, setSelectedType] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');

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

  // Filter & Sort Data
  const filteredAndSortedRooms = useMemo(() => {
    let result = [...mergedRooms];

    // Filter
    if (selectedType !== 'all') {
      result = result.filter(r => (r.roomTypeId || r.RoomTypeId) === selectedType);
    }

    // Sort
    if (sortOrder === 'price_asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortOrder === 'price_desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    }

    return result;
  }, [mergedRooms, selectedType, sortOrder]);

  return (
    <div style={{ padding: '40px 20px', minHeight: '60vh', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title level={2}>Kết Quả Tìm Kiếm Phòng</Title>
        <Paragraph type="secondary">Tìm căn phòng phù hợp nhất cho kỳ nghỉ của bạn</Paragraph>
        <div style={{ width: '60px', height: '4px', background: '#1890ff', margin: '0 auto', borderRadius: '2px' }}></div>
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

      {/* ROOM LIST (VERTICAL) */}
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
            const rId = room.roomTypeId || room.RoomTypeId;
            
            // Bộ ảnh mặc định theo TÊN hạng phòng (không phụ thuộc ID) 
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

            const typeName = (room.roomTypeName || '').toLowerCase().trim();
            // Tìm key khớp với tên hạng phòng (khớp một phần)
            const matchedKey = Object.keys(imageByTypeName).find(k => typeName.includes(k));
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

            const roomImage = room.roomImages?.length > 0
                      ? room.roomImages[0].imageUrl
                      : room.RoomImages?.length > 0
                        ? room.RoomImages[0].imageUrl
                        : (matchedKey
                            ? imageByTypeName[matchedKey]
                            : (fallbackByTypeId[rId] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'));


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
                      style={{ width: '100%', height: '100%', minHeight: '220px', objectFit: 'cover', display: 'block' }} 
                    />
                  </Col>

                  {/* Cột Nội dung chi tiết */}
                  <Col xs={24} md={10} lg={12} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Title level={3} style={{ marginTop: 0, marginBottom: '8px' }}>
                        Phòng {room.roomNumber || room.RoomNumber}
                      </Title>
                      <Tag color="geekblue" style={{ fontSize: '14px', padding: '4px 8px' }}>
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

                    <Space>
                      {isAvailable ? (
                        <Tag color="success" icon={<CheckCircleOutlined />}>Phòng trống (Tầng {room.floor || room.Floor || 'Trệt'})</Tag>
                      ) : (
                        <Tag color="error" icon={<UserOutlined />}>Đã có khách</Tag>
                      )}
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
                    <Title level={2} style={{ color: '#ff4d4f', marginTop: 0, marginBottom: '24px' }}>
                      {room.basePrice.toLocaleString()}₫
                    </Title>
                    <Button 
                      type="primary" 
                      size="large" 
                      disabled={!isAvailable} 
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px', 
                        background: isAvailable ? '#ff4d4f' : undefined, 
                        borderColor: isAvailable ? '#ff4d4f' : undefined,
                        fontWeight: 'bold'
                      }}
                    >
                      {isAvailable ? 'Chọn phòng này' : 'Hết phòng'}
                    </Button>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      )}
    </div>
  );
};

export default CustomerRoomsPage;
