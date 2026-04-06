import React, { useState, useEffect, useRef } from 'react';
import { Card, List, Button, Tag, Typography, message, Modal, InputNumber, Space, Divider, Row, Col } from 'antd';
import { 
  AlertOutlined, CheckCircleOutlined, ArrowLeftOutlined, 
  CameraOutlined, ShopOutlined, CheckOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useParams, useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const HousekeepingChecklist = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [roomData, setRoomData] = useState(null); 

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingItem, setReportingItem] = useState(null);
  const [damageQuantity, setDamageQuantity] = useState(1);
  const [proofImage, setProofImage] = useState(null);
  
  // 🌟 MA PHÁP MỚI: State lưu đường dẫn ảnh tạm để xem trước 🌟
  const [previewImageUrl, setPreviewImageUrl] = useState(null); 
  
  const hiddenFileInput = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const roomRes = await axiosClient.get(`/Rooms/${roomId}`);
      setRoomData(roomRes.data);

      const invRes = await axiosClient.get(`/RoomInventory/Room/${roomId}`);
      const itemsWithStatus = invRes.data.map(item => ({ ...item, checkStatus: 'pending' }));
      setInventory(itemsWithStatus);
    } catch (error) {
      message.error("Không thể tải dữ liệu phòng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [roomId]);

  const handleCameraClick = () => { hiddenFileInput.current.click(); };
  
  // --- NÂNG CẤP HÀM XỬ LÝ ẢNH CÓ CHỨC NĂNG XEM TRƯỚC ---
  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProofImage(file); // Lưu file thật để gửi Backend (nếu cần FormData)

      // 🔮 Bắt đầu ma pháp FileReader để tạo ảnh xem trước 🔮
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImageUrl(reader.result); // kết quả là chuỗi base64 nạp vào src ảnh
        message.success('Đã tải ảnh bằng chứng lên!');
      };
      reader.readAsDataURL(file); // Đọc file dưới dạng Data URL
    }
  };

  const openReportModal = (item) => {
    setReportingItem(item);
    setDamageQuantity(1);
    
    // Reset toàn bộ state liên quan đến ảnh khi mở Modal mới
    setProofImage(null); 
    setPreviewImageUrl(null); // 🌟 Reset ảnh xem trước
    
    setIsReportModalOpen(true);
  };

  const submitDamageReport = async () => {
    if (!reportingItem) return;
    try {
      const calculatedPenalty = (reportingItem.priceIfLost || 0) * damageQuantity;
      await axiosClient.post('/LossAndDamages', {
        RoomInventoryId: reportingItem.id,
        Quantity: damageQuantity,
        PenaltyAmount: calculatedPenalty, 
        Description: `Nhân viên báo hỏng ${reportingItem.equipmentName} tại phòng`,
        ImageUrl: previewImageUrl ? previewImageUrl : '' // Gửi đường dẫn ảnh xem trước 
      });
      message.success(`Đã gửi báo cáo đền bù: ${reportingItem.equipmentName}`);
      markItemStatus(reportingItem.id, 'damaged');
      setIsReportModalOpen(false);
    } catch (err) { message.error("Lỗi khi gửi báo cáo đền bù!"); }
  };

  const markItemStatus = (itemId, status) => {
    const updatedInventory = inventory.map(item => 
      item.id === itemId ? { ...item, checkStatus: status } : item
    );
    setInventory(updatedInventory);
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
      navigate('/admin/rooms');
    } catch (err) { message.error("Lỗi cập nhật trạng thái phòng!"); }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '16px' }}>
      
      {/* Hiệu ứng Hover màu sắc */}
      <style>{`
        .btn-report-loss:hover { background-color: #ff4d4f !important; color: white !important; border-color: #ff4d4f !important; }
        .btn-check-ok:hover { background-color: #52c41a !important; color: white !important; border-color: #52c41a !important; }
        .btn-check-ok.active { background-color: #52c41a !important; border-color: #52c41a !important; color: white !important; }
        .btn-report-loss.active { background-color: #ff4d4f !important; border-color: #ff4d4f !important; color: white !important; }
      `}</style>

      {/* Header gọn gàng */}
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/rooms')} type="text" style={{ marginBottom: 12 }}>
        Quay lại danh sách phòng
      </Button>

      <Card 
        bordered={false}
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '1000px', margin: '0 auto' }}
        title={
          <Space>
            <ShopOutlined style={{ color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>
              {roomData ? `Kiểm kê Phòng ${roomData.roomNumber || roomData.room_number}` : `Kiểm kê Phòng ${roomId}`}
            </Title>
          </Space>
        }
      >
        <Text type="secondary" style={{fontSize: '15px'}}>Danh sách vật tư </Text>
        <Divider style={{ margin: '16px 0' }} />

        <List
          loading={loading}
          dataSource={inventory}
          renderItem={(item) => (
            <Card 
              style={{ 
                marginBottom: '12px', 
                borderRadius: '8px',
                borderLeft: item.checkStatus === 'ok' ? '5px solid #52c41a' : item.checkStatus === 'damaged' ? '5px solid #ff4d4f' : '5px solid #d9d9d9',
                backgroundColor: '#fff'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <Row align="middle" gutter={16}>
                <Col xs={24} md={12}>
                  <Text strong style={{ fontSize: '16px' }}>{item.equipmentName || "Vật tư phòng"}</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Space>
                      <Tag color="blue">SL: {item.quantity || 0}</Tag>
                      <Text type="secondary">Đền: {(item.priceIfLost || 0).toLocaleString()}đ</Text>
                    </Space>
                  </div>
                </Col>
                
                <Col xs={24} md={12} style={{ textAlign: 'right', marginTop: '10px' }}>
                  <Space>
                    <Button 
                      size="large"
                      icon={<AlertOutlined />} 
                      className={`btn-report-loss ${item.checkStatus === 'damaged' ? 'active' : ''}`} 
                      danger={item.checkStatus !== 'damaged'} 
                      onClick={() => openReportModal(item)}
                    >
                      Báo hỏng
                    </Button>

                    <Button 
                      size="large"
                      icon={<CheckCircleOutlined />} 
                      className={`btn-check-ok ${item.checkStatus === 'ok' ? 'active' : ''}`} 
                      style={{ 
                        color: item.checkStatus !== 'ok' ? '#52c41a' : 'white',
                        borderColor: '#52c41a',
                      }}
                      onClick={() => markItemStatus(item.id, 'ok')}
                    >
                      Đủ & Sạch
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          )}
        />
        
        <Button 
          type="primary" block size="large" icon={<CheckCircleOutlined />}
          style={{ 
            marginTop: 32, height: 60, borderRadius: '10px', 
            backgroundColor: '#52c41a', borderColor: '#52c41a',
            fontWeight: 'bold', fontSize: '18px',
            boxShadow: '0 4px 10px rgba(82, 196, 26, 0.3)'
          }}
          onClick={handleComplete}
        >
          HOÀN TẤT & BÁO SẠCH PHÒNG
        </Button>
      </Card>

      <Modal
        title={<span style={{ color: '#ff4d4f' }}>⚠️ Báo hỏng: {reportingItem?.equipmentName}</span>}
        open={isReportModalOpen}
        onCancel={() => setIsReportModalOpen(false)}
        onOk={submitDamageReport}
        okText="Gửi báo cáo đền bù"
        cancelText="Hủy"
        centered 
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">Giá đền bù quy định: </Text>
          <Text strong style={{ color: '#ff4d4f' }}>{(reportingItem?.priceIfLost || 0).toLocaleString()} đ / cái</Text>
        </div>
        <Space direction="vertical" style={{ width: '100%' }}>
          <InputNumber min={1} max={reportingItem?.quantity || 1} value={damageQuantity} onChange={setDamageQuantity} addonBefore="Số lượng hỏng/mất" style={{ width: '100%' }} size="large" />
          
          {/* --- NÂNG CẤP KHU VỰC CAMERA MA PHÁP & XEM TRƯỚC --- */}
          <div style={{ textAlign: 'center', marginTop: 10, padding: '16px', border: '1px dashed #d9d9d9', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            
            {/* 🔮 MA PHÁP HIỂN THỊ ẢNH XEM TRƯỚC 🔮 */}
            {previewImageUrl ? (
              // Nếu đã có ảnh -> Hiện ảnh to, BO GÓC, giớí hạn chiều cao
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <img 
                  src={previewImageUrl} 
                  alt="Bằng chứng hỏng hóc" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '250px', // Không cho ảnh quá dài
                    borderRadius: '8px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    objectFit: 'contain' // Giữ nguyên tỷ lệ ảnh
                  }} 
                />
                <Divider style={{margin: '12px 0'}} />
                {/* Nút nhỏ để chụp lại/đổi ảnh */}
                <Button 
                  icon={<CameraOutlined />} 
                  onClick={handleCameraClick}
                  style={{ color: '#1890ff', borderColor: '#1890ff' }}
                >
                  Chụp lại / Đổi ảnh
                </Button>
              </div>
            ) : (
              // Nếu chưa có ảnh -> Hiện nút to chà bá như cũ
              <Button 
                size="large" 
                icon={<CameraOutlined />} 
                onClick={handleCameraClick} 
                block 
                style={{ color: '#1890ff', borderColor: '#1890ff', height: '50px' }}
              >
                📸 Bấm để Chụp bằng chứng
              </Button>
            )}

            {/* Input tàng hình gọi Camera sau */}
            <input type="file" accept="image/*" capture="environment" ref={hiddenFileInput} style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default HousekeepingChecklist;