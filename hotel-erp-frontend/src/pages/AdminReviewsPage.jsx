import React, { useState } from 'react';
import { Card, Table, Typography, Button, Switch, Avatar, Rate, Tag, Input, Space } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, SearchOutlined } from '@ant-design/icons';
import { useReviewStore } from '../store/useReviewStore';

const { Title, Text } = Typography;

const AdminReviewsPage = () => {
  const { reviews, toggleHideReview } = useReviewStore();
  const [searchText, setSearchText] = useState('');

  // Bộ lọc
  const filteredReviews = reviews.filter(r => 
    r.name.toLowerCase().includes(searchText.toLowerCase()) || 
    r.content.toLowerCase().includes(searchText.toLowerCase()) ||
    r.room.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={record.avatar}>{text.charAt(0)}</Avatar>
          <Text strong>{text}</Text>
        </div>
      ),
      width: 200
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      key: 'room',
      render: text => <Tag color="blue">{text}</Tag>,
      width: 150
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: rating => <Rate disabled allowHalf defaultValue={rating} style={{ fontSize: 14 }} />,
      width: 150
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: text => (
        <p style={{ margin: 0, maxWidth: 300, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {text}
        </p>
      )
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'date',
      key: 'date',
      width: 120
    },
    {
      title: 'Hiển thị trên Web',
      key: 'visibility',
      render: (_, record) => (
        <Space>
          <Switch 
            checked={!record.isHidden} 
            onChange={() => toggleHideReview(record.id)}
            checkedChildren={<EyeOutlined />}
            unCheckedChildren={<EyeInvisibleOutlined />}
            style={{ background: !record.isHidden ? '#52c41a' : '#ff4d4f' }}
          />
          {!record.isHidden ? (
            <Text type="success">Đang hiện</Text>
          ) : (
            <Text type="danger">Đang ẩn</Text>
          )}
        </Space>
      ),
      width: 180
    }
  ];

  return (
    <Card title={<Title level={3} style={{ margin: 0 }}>Quản lý Đánh giá</Title>} bordered={false}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Input 
          placeholder="Tìm kiếm theo tên khách, phòng, nội dung..." 
          prefix={<SearchOutlined />} 
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <Table 
        columns={columns} 
        dataSource={filteredReviews} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
        rowClassName={(record) => record.isHidden ? 'hidden-review-row' : ''}
      />
    </Card>
  );
};

export default AdminReviewsPage;
