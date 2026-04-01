import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Card, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CoffeeOutlined, EditOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title } = Typography;

const HousekeepingListPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDirtyRooms = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/Rooms');
      // Lọc ra những phòng chưa dọn (Dirty) hoặc đang dọn (Cleaning)
      const dirty = res.data.filter(r => 
        (r.cleaning_status || r.cleaningStatus || "").toLowerCase() !== 'clean'
      );
      setRooms(dirty);
    } catch (error) {
      console.error("Lỗi tải danh sách phòng dọn dẹp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDirtyRooms(); }, []);

 const columns = [
  { 
    title: 'Số phòng', 
    // Duy dùng render để check cả 2 trường hợp viết hoa/viết thường
    render: (_, record) => <b>{record.roomNumber || record.room_number || "N/A"}</b>,
    key: 'roomNumber',
  },
  { 
    title: 'Tầng', 
    render: (_, record) => <span>Tầng {record.floor || record.Floor || "1"}</span>,
    align: 'center',
  },
  { 
    title: 'Tình trạng', 
    render: (_, record) => {
      // Ép về chữ thường để so sánh không bao giờ sai
      const status = (record.cleaningStatus || record.cleaning_status || "").toLowerCase();
      
      const config = {
        'clean': { label: 'Sạch sẽ', color: 'green' },
        'dirty': { label: 'Chưa dọn', color: 'red' },
        'cleaning': { label: 'Đang dọn', color: 'blue' }
      };

      const current = config[status] || { label: 'Chưa xác định', color: 'default' };
      return <Tag color={current.color}>{current.label}</Tag>;
    }
  },
  {
    title: 'Thao tác',
    align: 'center',
    render: (_, record) => (
      <Button 
        type="primary" 
        icon={<EditOutlined />} 
        // Dùng record.id để dẫn vào đúng phòng (ví dụ: id = 2 cho phòng 102)
        onClick={() => navigate(`/admin/housekeeping/${record.id || record.Id}`)}
      >
        Bắt đầu kiểm kê
      </Button>
    )
  }
];

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<Space><CoffeeOutlined /> <Title level={4} style={{margin:0}}>Danh sách phòng cần dọn dẹp</Title></Space>}>
        <Table 
          dataSource={rooms} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          locale={{ emptyText: 'Hôm nay các phòng đều sạch sẽ ' }}
        />
      </Card>
    </div>
  );
};

export default HousekeepingListPage;