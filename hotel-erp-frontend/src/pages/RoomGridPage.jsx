import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Badge, Tag, Typography, 
  Tabs, Tooltip, Button, Space, Modal, Table 
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

  const [isRoomModalVisible, setIsRoomModalVisible] = useState(false);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/Rooms');
      
      const sortedRooms = res.data.sort((a, b) => {
        const floorA = a.floor || a.Floor || 0;
        const floorB = b.floor || b.Floor || 0;
        if (floorA !== floorB) return floorA - floorB;
        const numA = String(a.roomNumber || a.RoomNumber || "");
        const numB = String(b.roomNumber || b.RoomNumber || "");
        return numA.localeCompare(numB, undefined, { numeric: true });
      });
      
      setRooms(sortedRooms);
    } catch (error) {
      console.error("Lỗi tải sơ đồ phòng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (status, cleaning) => {
    if (status === 'Occupied') return { color: '#f5222d', icon: <UserOutlined />, text: 'Có khách' };
    if (status === 'Maintenance') return { color: '#8c8c8c', icon: <WarningOutlined />, text: 'Bảo trì' };
    if (cleaning === 'Dirty') return { color: '#faad14', icon: <CoffeeOutlined />, text: 'Chờ dọn' };
    return { color: '#52c41a', icon: <CheckCircleOutlined />, text: 'Sẵn sàng' };
  };

  //  HÀM XỬ LÝ CLICK PHÒNG (DÙNG CHUNG CHO CẢ MẶT TIỀN VÀ PHÒNG CON) 
  const handleRoomClick = async (room) => {
    const config = getStatusConfig(room.status || room.Status, room.cleaningStatus || room.CleaningStatus);
    const roomId = room.id || room.Id;
    
    const roomImage = room.roomImages && room.roomImages.length > 0 
                      ? room.roomImages[0].imageUrl 
                      : (room.RoomImages && room.RoomImages.length > 0 
                         ? room.RoomImages[0].imageUrl 
                         : `https://placehold.co/600x400/1890ff/white?text=Phong+${room.roomNumber || room.RoomNumber}`);

    const isVilla = (room.roomTypeId || room.RoomTypeId) === 8;
    const subRooms = rooms.filter(r => (r.parentRoomId || r.ParentRoomId) === roomId);

    const detailData = {
      ...room,
      isVilla: isVilla, 
      currentStatusText: config.text,
      currentStatusColor: config.color,
      imageUrl: roomImage,
      equipments: [],
      subRoomsList: subRooms 
    };
    
    setSelectedRoomDetail(detailData);
    setIsRoomModalVisible(true);
    setIsFetchingDetail(true);

    try {
      const invRes = await axiosClient.get(`/RoomInventory/Room/${roomId}`);
      const mappedEquipments = invRes.data.map(item => ({
        id: item.id || item.Id,
        name: item.equipmentName || item.EquipmentName || 'Vật tư',
        quantity: item.quantity || item.Quantity,
        status: 'Bình thường' 
      }));
      setSelectedRoomDetail(prev => ({ ...prev, equipments: mappedEquipments }));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vật tư:", error);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const rootRooms = rooms.filter(r => !(r.parentRoomId || r.ParentRoomId));

  const uniqueFloors = [...new Set(rootRooms.map(r => (r.roomTypeId || r.RoomTypeId) === 8 ? 'Villa' : (r.floor || r.Floor)).filter(f => f != null))].sort((a, b) => {
    if (a === 'Villa') return 1; 
    if (b === 'Villa') return -1;
    return a - b;
  });

  return (
    <div style={{ padding: '24px', background: 'transparent', minHeight: '100vh' }}>
      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
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
              <Button icon={<SyncOutlined />} onClick={fetchRooms} loading={loading}>Làm mới</Button>
            </Space>
          </Col>
        </Row>

        <Tabs defaultActiveKey="all" type="line" size="large">
          <TabPane tab={<b style={{ fontSize: '16px' }}>Tất cả</b>} key="all">
             <Row gutter={[16, 16]}>
                {rootRooms.map(room => {
                  const config = getStatusConfig(room.status || room.Status, room.cleaningStatus || room.CleaningStatus);
                  const isVillaCard = (room.roomTypeId || room.RoomTypeId) === 8;
                  return (
                    <Col xs={12} sm={8} md={6} lg={4} xl={3} key={room.id || room.Id}>
                        <Card hoverable style={{ borderRadius: '10px', borderTop: `5px solid ${config.color}`, textAlign: 'center' }} onClick={() => handleRoomClick(room)}>
                          <Title level={4} style={{ margin: 0 }}>{isVillaCard ? 'Căn ' : ''}{room.roomNumber || room.RoomNumber}</Title>
                          <div style={{ marginTop: 8 }}><Tag color={config.color}>{config.text}</Tag></div>
                        </Card>
                    </Col>
                  );
                })}
             </Row>
          </TabPane>
          {uniqueFloors.map(floor => (
            <TabPane 
              //  ĐÃ XÓA CSS MÀU CỐ ĐỊNH ĐỂ TỰ ĐỘNG CHUYỂN MÀU THEO TRẠNG THÁI ACTIVE 
              tab={<b style={{ fontSize: '16px' }}>{floor === 'Villa' ? ' Khu Villa' : `Tầng ${floor}`}</b>} 
              key={String(floor)}
            >
              <Row gutter={[16, 16]}>
                {rootRooms.filter(r => ((r.roomTypeId || r.RoomTypeId) === 8 ? 'Villa' : (r.floor || r.Floor)) === floor).map(room => {
                  const config = getStatusConfig(room.status || room.Status, room.cleaningStatus || room.CleaningStatus);
                  const isVillaCard = (room.roomTypeId || room.RoomTypeId) === 8;
                  return (
                    <Col xs={12} sm={8} md={6} lg={4} xl={3} key={room.id || room.Id}>
                        <Card hoverable style={{ borderRadius: '10px', borderTop: `5px solid ${config.color}`, textAlign: 'center' }} onClick={() => handleRoomClick(room)}>
                          <Title level={4} style={{ margin: 0 }}>{isVillaCard ? 'Căn ' : ''}{room.roomNumber || room.RoomNumber}</Title>
                          <div style={{ marginTop: 8 }}><Tag color={config.color}>{config.text}</Tag></div>
                        </Card>
                    </Col>
                  );
                })}
              </Row>
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Thông tin chi tiết {selectedRoomDetail?.isVilla ? 'Căn' : 'Phòng'} {selectedRoomDetail?.roomNumber || selectedRoomDetail?.RoomNumber}</Title>}
        open={isRoomModalVisible}
        onCancel={() => setIsRoomModalVisible(false)}
        footer={[<Button key="close" type="primary" onClick={() => setIsRoomModalVisible(false)}>Đóng</Button>]}
        width={850} 
        centered
      >
        {selectedRoomDetail && (
          <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
            <Col xs={24} md={9}>
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <img src={selectedRoomDetail.imageUrl} alt="Room" style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }} />
              </div>
              <div style={{ marginTop: 16, textAlign: 'center', padding: '12px', background: '#fafafa', borderRadius: '8px' }}>
                <Text style={{ fontSize: '14px', display: 'block', marginBottom: 4 }}>Trạng thái hiện tại:</Text>
                <Title level={4} style={{ margin: 0, color: selectedRoomDetail.currentStatusColor }}>{selectedRoomDetail.currentStatusText}</Title>
              </div>
            </Col>

            <Col xs={24} md={15}>
              {/*  BẢNG DANH SÁCH PHÒNG CON: CÓ THỂ CLICK ĐỂ XEM CHI TIẾT  */}
              {selectedRoomDetail.isVilla && selectedRoomDetail.subRoomsList && selectedRoomDetail.subRoomsList.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <Title level={5} style={{ marginTop: 0, borderBottom: '2px solid #f0f0f0', paddingBottom: 8, color: '#1890ff' }}>🏠 Cấu trúc các phòng bên trong</Title>
                  <Table 
                    dataSource={selectedRoomDetail.subRoomsList} 
                    pagination={false} 
                    rowKey={(r) => r.id || r.Id}
                    size="small"
                    // THÊM SỰ KIỆN CLICK VÀO DÒNG ĐỂ XEM CHI TIẾT PHÒNG CON
                    onRow={(record) => ({
                      onClick: () => handleRoomClick(record),
                      style: { cursor: 'pointer' }
                    })}
                    columns={[
                      { title: 'Phòng/Khu vực', render: (_, r) => <b style={{color: '#1890ff'}}>{r.roomNumber || r.RoomNumber}</b> },
                      { title: 'Tầng', dataIndex: 'floor', align: 'center' },
                      { title: 'Trạng thái', align: 'center', render: (_, r) => {
                          const s = (r.cleaningStatus || r.CleaningStatus || "").toLowerCase();
                          return <Tag color={s === 'dirty' ? 'red' : s === 'cleaning' ? 'blue' : 'green'}>{s === 'dirty' ? 'Chưa dọn' : s === 'cleaning' ? 'Đang dọn' : 'Sạch sẽ'}</Tag>;
                      }}
                    ]}
                  />
                  <Text type="secondary" style={{fontSize: '12px'}}>* Nhấp vào tên phòng để xem chi tiết vật tư của phòng đó.</Text>
                </div>
              )}

              <Title level={5} style={{ marginTop: 0, borderBottom: '2px solid #f0f0f0', paddingBottom: 8 }}>📦 Danh sách Vật tư</Title>
              <Table 
                dataSource={selectedRoomDetail.equipments} 
                pagination={{ pageSize: 5 }} 
                rowKey="id" size="small" loading={isFetchingDetail} 
                locale={{ emptyText: isFetchingDetail ? 'Đang tải...' : 'Chưa có vật tư' }}
                columns={[
                  { title: 'Tên thiết bị', dataIndex: 'name', key: 'name', render: (txt) => <Text strong>{txt}</Text> },
                  { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60, align: 'center' },
                  { title: 'Tình trạng', dataIndex: 'status', key: 'status', width: 120, align: 'right', render: (status) => <Tag color="green">{status}</Tag> }
                ]}
              />
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default RoomGridPage;