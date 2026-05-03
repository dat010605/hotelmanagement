import React from 'react';
import { Card, Button } from 'antd';

const LocationCard = ({ item }) => {
  // Hàm xử lý nhảy sang "web đó" (trang chi tiết)
  const handleNavigate = (e) => {
    // Ngăn chặn các sự kiện click chồng chéo
    e.preventDefault();
    e.stopPropagation();

    // Lấy ID chuẩn từ dữ liệu SQL (id viết thường như trong log của ông)
    const id = item.id || item.Id;
    
    if (id) {
      console.log("===> ĐÃ NHẤN NÚT! Đang nhảy sang trang chi tiết ID:", id);
      // Dùng window.location.href là cách chắc chắn nhất để ép trình duyệt chuyển trang
      window.location.href = `/location/${id}`;
    } else {
      console.error("Lỗi: Không tìm thấy ID của địa điểm này!", item);
    }
  };

  return (
    <Card
      hoverable
      style={{ 
        borderRadius: '12px', 
        marginBottom: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
      }}
      cover={
        <img 
          alt={item.name} 
          src={item.imageUrl || item.ImageUrl} 
          style={{ height: 200, objectFit: 'cover' }} 
        />
      }
    >
      <Card.Meta 
        title={<span style={{ fontWeight: 'bold', fontSize: '18px' }}>{item.name || item.Name}</span>} 
        description={item.address || item.Address} 
      />
      
      <div style={{ marginTop: '20px' }}>
        <Button 
          type="primary" 
          onClick={handleNavigate} 
          block 
          style={{ 
            borderRadius: '8px', 
            fontWeight: 'bold',
            height: '40px' 
          }}
        >
          Xem chi tiết →
        </Button>
      </div>
    </Card>
  );
};

export default LocationCard;