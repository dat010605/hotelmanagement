import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Typography, Switch, Avatar, Rate, Tag, Input, Space, Spin, message, Popconfirm, Button } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useReviewStore } from '../store/useReviewStore';

const { Title, Text } = Typography;

const normalizeLocal = (r) => ({
  id: `local_${r.id}`,
  userName:     r.name    || 'Khách hàng',
  userAvatar:   r.avatar  || null,
  rating:       r.rating,
  roomTypeName: r.room    || '',
  comment:      r.content || '',
  createdAt: (() => {
    if (!r.date) return new Date().toISOString();
    const p = r.date.split('/');
    return p.length === 3
      ? new Date(`${p[2]}-${p[1]}-${p[0]}`).toISOString()
      : r.date;
  })(),
  isHidden: r.isHidden || false,
  isLocal: true,
  originalId: r.id
});

const normalizeApi = (r) => ({
  id: `api_${r.id}`,
  userName:     r.userName     || 'Khách hàng',
  userAvatar:   r.userAvatar   || null,
  rating:       r.rating,
  roomTypeName: r.roomTypeName || '',
  comment:      r.comment      || '',
  createdAt:    r.createdAt    || new Date().toISOString(),
  isHidden: false,
  isLocal: false,
  originalId: r.id
});

const AdminReviewsPage = () => {
  const [apiReviews, setApiReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const { reviews: localStoreReviews, toggleHideReview, deleteReview: deleteLocalReview } = useReviewStore();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/Reviews');
      setApiReviews(res.data || []);
    } catch {
      message.error('Không thể tải danh sách đánh giá từ server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const mergedReviews = useMemo(() => {
    const api = apiReviews.map(normalizeApi);
    const local = localStoreReviews.map(normalizeLocal);
    return [...api, ...local].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [apiReviews, localStoreReviews]);

  const filteredReviews = mergedReviews.filter(r =>
    (r.userName || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (r.comment || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (r.roomTypeName || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = async (record) => {
    if (record.isLocal) {
      deleteLocalReview(record.originalId);
      message.success('Đã xóa đánh giá (Local)');
    } else {
      try {
        await axiosClient.delete(`/Reviews/${record.originalId}`);
        message.success('Đã xóa đánh giá (API)');
        fetchReviews();
      } catch (err) {
        message.error('Lỗi khi xóa đánh giá trên server.');
      }
    }
  };

  const handleToggleHide = (record) => {
    if (record.isLocal) {
      toggleHideReview(record.originalId);
      message.success(record.isHidden ? 'Đã HIỂN THỊ đánh giá này' : 'Đã ẨN đánh giá này');
    } else {
      message.warning('Tính năng ẩn chỉ áp dụng cho bài đánh giá mẫu. Bài từ API vui lòng xóa nếu vi phạm.');
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={record.userAvatar}>{(text || 'K').charAt(0)}</Avatar>
          <div>
            <Text strong>{text}</Text>
            {record.isLocal ? <div style={{ fontSize: 11, color: '#bfbfbf' }}>Hệ thống</div> : <div style={{ fontSize: 11, color: '#52c41a' }}>Xác thực</div>}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Hạng phòng',
      dataIndex: 'roomTypeName',
      key: 'roomTypeName',
      render: text => <Tag color="blue">{text || 'N/A'}</Tag>,
      width: 140,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: rating => <Rate disabled allowHalf defaultValue={rating} style={{ fontSize: 14 }} />,
      width: 150,
      sorter: (a, b) => b.rating - a.rating,
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      render: text => (
        <p style={{ margin: 0, maxWidth: 300, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {text}
        </p>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: d => d ? new Date(d).toLocaleDateString('vi-VN') : '',
      width: 110,
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space>
          {record.isLocal && (
            <Button 
              size="small" 
              type={record.isHidden ? "default" : "primary"}
              ghost={!record.isHidden}
              icon={record.isHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => handleToggleHide(record)}
            >
              {record.isHidden ? 'Đang ẩn' : 'Ẩn'}
            </Button>
          )}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa đánh giá này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            placement="left"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <Card
      title={<Title level={3} style={{ margin: 0 }}>Quản lý Đánh Giá</Title>}
      extra={
        <Text type="secondary">
          Tổng: <Text strong>{filteredReviews.length}</Text> đánh giá
          {searchText && ` (lọc từ ${mergedReviews.length})`}
        </Text>
      }
      bordered={false}
    >
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Input
          placeholder="Tìm theo tên khách, hạng phòng, nội dung..."
          prefix={<SearchOutlined />}
          style={{ width: 340 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredReviews}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        rowClassName={(record) => record.isHidden ? 'hidden-review-row' : ''}
      />
      <style>{`
        .hidden-review-row {
          opacity: 0.5;
          background-color: #fafafa;
        }
      `}</style>
    </Card>
  );
};

export default AdminReviewsPage;
