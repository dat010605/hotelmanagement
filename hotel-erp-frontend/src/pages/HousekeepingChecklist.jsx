import React, { useState, useEffect } from 'react';
import { Card, List, Button, Tag, Typography, message, Modal, InputNumber, Space, Divider } from 'antd';
import { 
  AlertOutlined, CheckCircleOutlined, ArrowLeftOutlined, 
  CameraOutlined, ToolOutlined, ShopOutlined 
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useParams } from 'react-router-dom';

const { Text, Title } = Typography;

const HousekeepingChecklist = () => {
  const { roomId } = useParams();
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [roomData, setRoomData] = useState(null); 

  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy thông tin phòng
      const roomRes = await axiosClient.get(`/Rooms/${roomId}`);
      setRoomData(roomRes.data);

      // SỬA LỖI 1: Gọi đúng API lấy vật tư trong phòng (RoomInventory) thay vì đồ hỏng (LossAndDamages)
      const invRes = await axiosClient.get(`/RoomInventory/Room/${roomId}`);
      setInventory(invRes.data);
    } catch (error) {
      message.error("Không thể tải dữ liệu phòng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [roomId]);

  const handleReportLoss = (item) => {
    let reportQty = 1;
    Modal.confirm({
      // SỬA LỖI 2: Dùng đúng tên biến equipmentName do C# trả về
      title: <span style={{ color: '#ff4d4f' }}>⚠️ Báo hỏng: {item.equipmentName || "Vật tư phòng"}</span>,
      content: (
        <Space direction="vertical" style={{ width: '100%', marginTop: 10 }}>
          <Text>Giá đền bù: <Text strong danger>{(item.priceIfLost || 0).toLocaleString()}đ</Text></Text>
          <InputNumber 
            min={1} 
            max={item.quantity || 1} 
            defaultValue={1} 
            onChange={(val) => reportQty = val} 
            addonBefore="Số lượng"
            style={{ width: '100%' }}
          />
          <Button icon={<CameraOutlined />} block>Chụp bằng chứng</Button>
        </Space>
      ),
      onOk: async () => {
        try {
          // SỬA LỖI 3: Khai báo biến calculatedPenalty để tránh sập web khi bấm "Ok"
          const calculatedPenalty = (item.priceIfLost || 0) * reportQty;

          await axiosClient.post('/LossAndDamages', {
            RoomInventoryId: item.id,
            Quantity: reportQty,
            PenaltyAmount: calculatedPenalty, 
            Description: `Nhân viên báo hỏng ${item.equipmentName} tại phòng`,
            ImageUrl: ''
          });
          message.warning(`Đã gửi báo cáo đền bù thành công!`);
        } catch (err) {
          message.error("Lỗi 405: Kiểm tra HttpPost ở Backend!");
        }
      }
    });
  };

  const handleComplete = async () => {
    if (!roomData) return;
    try {
      await axiosClient.put(`/Rooms/${roomId}`, { 
        Id: parseInt(roomId),
        RoomNumber: roomData.roomNumber || roomData.room_number,
        RoomTypeId: roomData.roomTypeId || roomData.room_type_id,
        Floor: roomData.floor,
        Status: 'Available', 
        CleaningStatus: 'Clean' 
      });
      message.success(`Phòng ${roomData.roomNumber || roomData.room_number} đã sạch!`);
      window.location.href = '/admin/rooms';
    } catch (err) {
      message.error("Vẫn lỗi 400: Kiểm tra Network tab để xem Backend báo thiếu trường nào!");
    }
  };

  return (
    <div style={{ padding: '16px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => window.location.href = '/admin/rooms'} type="text" style={{ marginBottom: 12 }}>
        Quay lại
      </Button>

      <Card 
        bordered={false}
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        title={
          <Space>
            <ShopOutlined style={{ color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>
              Kiểm kê {roomData ? `Phòng ${roomData.roomNumber || roomData.room_number}` : `Phòng ${roomId}`}
            </Title>
          </Space>
        }
        extra={<Tag color="processing" icon={<ToolOutlined />}>Đang kiểm tra</Tag>}
      >
        <Text type="secondary">Danh sách vật tư </Text>
        <Divider style={{ margin: '16px 0' }} />

        <List
          loading={loading}
          dataSource={inventory}
          renderItem={item => (
            <List.Item 
              actions={[
                <Button danger ghost icon={<AlertOutlined />} onClick={() => handleReportLoss(item)}>Báo hỏng</Button>
              ]}
            >
              <List.Item.Meta 
                // SỬA LỖI 2: Map đúng tên biến từ C# (equipmentName, priceIfLost)
                title={<Text strong style={{ fontSize: '16px' }}>{item.equipmentName || "Vật tư phòng"}</Text>}
                description={
                  <Space>
                    <Tag color="default">Số lượng: {item.quantity || 0}</Tag>
                    <Text type="secondary">Đền bù: {(item.priceIfLost || 0).toLocaleString()}đ</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        
        <Button 
          type="primary" block size="large" icon={<CheckCircleOutlined />}
          style={{ marginTop: 32, height: 55, borderRadius: '10px', backgroundColor: '#52c41a', fontWeight: 'bold' }}
          onClick={handleComplete}
        >
          HOÀN TẤT & BÁO SẠCH PHÒNG
        </Button>
      </Card>
    </div>
  );
};

export default HousekeepingChecklist;