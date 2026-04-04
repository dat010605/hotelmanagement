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
  const [roomData, setRoomData] = useState(null); // Thêm state để lưu thông tin phòng gốc

  // 1. Lấy dữ liệu vật tư VÀ thông tin phòng để tránh lỗi 400
  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy thông tin phòng để có room_number, room_type_id thực tế
      const roomRes = await axiosClient.get(`/Rooms/${roomId}`);
      setRoomData(roomRes.data);

      // Lấy vật tư từ bảng Room_Inventory
      const invRes = await axiosClient.get(`/LossAndDamages/room/${roomId}`);
      setInventory(invRes.data);
    } catch (error) {
      message.error("Không thể tải dữ liệu phòng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [roomId]);

  // 2. Ghi dữ liệu vào bảng Loss_And_Damages
  const handleReportLoss = (item) => {
    let reportQty = 1;
    Modal.confirm({
      // SỬA: Hiển thị item_type (ví dụ: Smart TV) từ SQL của Duy
      title: <span style={{ color: '#ff4d4f' }}>⚠️ Báo hỏng: {item.item_type || "Vật tư phòng"}</span>,
      content: (
        <Space direction="vertical" style={{ width: '100%', marginTop: 10 }}>
          <Text>Giá đền bù: <Text strong danger>{(item.price_if_lost || 0).toLocaleString()}đ</Text></Text>
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

  // 3. Hoàn tất (Sửa lỗi 400 bằng cách dùng dữ liệu thật của phòng)
 const handleComplete = async () => {
  if (!roomData) return;
  try {
    await axiosClient.put(`/Rooms/${roomId}`, { 
      // Duy dùng đúng tên trường mà Backend C# của Duy định nghĩa
      Id: parseInt(roomId),
      RoomNumber: roomData.roomNumber || roomData.room_number,
      RoomTypeId: roomData.roomTypeId || roomData.room_type_id,
      Floor: roomData.floor,
      Status: 'Available', 
      CleaningStatus: 'Clean' // VIẾT HOA C và S như này nhé
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
              Kiểm kê {roomData ? `Phòng ${roomData.room_number}` : `Phòng ${roomId}`}
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
        // SỬA: Dùng item_type hoặc note (vì trong SQL Duy nạp vào 2 cột này)
        title={<Text strong style={{ fontSize: '16px' }}>{item.item_type || item.note || "Vật tư phòng"}</Text>}
        description={
            <Space>
            <Tag color="default">Số lượng: {item.quantity || 0}</Tag>
            <Text type="secondary">Đền bù: {(item.price_if_lost || 0).toLocaleString()}đ</Text>
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