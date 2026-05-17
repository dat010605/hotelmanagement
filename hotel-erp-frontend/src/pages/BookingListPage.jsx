import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Input, Typography, message, Modal, Descriptions, Divider } from 'antd';
import { SearchOutlined, CheckCircleOutlined, EyeOutlined, UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const BookingListPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  //  State cho Modal Chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/Bookings');
      setBookings(res.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách đặt phòng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCheckIn = (bookingId) => {
    Modal.confirm({
      title: 'Xác nhận Check-in',
      content: 'Bạn có chắc chắn làm thủ tục nhận phòng? (Các phòng trong đơn sẽ chuyển sang "Có khách").',
      onOk: async () => {
        try {
          await axiosClient.patch(`/Bookings/${bookingId}/checkin`);
          message.success('Check-in thành công!');
          fetchBookings(); // Tải lại danh sách
        } catch (error) {
          message.error('Lỗi khi Check-in!');
        }
      }
    });
  };

  const handleConfirm = (bookingId) => {
    Modal.confirm({
      title: 'Xác nhận Đặt phòng',
      content: 'Bạn có chắc chắn muốn duyệt (xác nhận) đơn đặt phòng này?',
      onOk: async () => {
        try {
          await axiosClient.patch(`/Bookings/${bookingId}/confirm`);
          message.success('Duyệt đơn thành công!');
          fetchBookings();
        } catch (error) {
          message.error('Lỗi khi duyệt đơn!');
        }
      }
    });
  };

  //  Hàm gọi API lấy chi tiết đơn và mở Modal
  const handleViewDetail = async (id) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await axiosClient.get(`/Bookings/${id}`);
      setBookingDetail(res.data);
    } catch (error) {
      message.error('Không thể tải chi tiết đơn hàng!');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'bookingCode', render: (code) => <b>{code}</b> },
    { title: 'Khách hàng', dataIndex: 'guestName', render: (name) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{name}</span> },
    { title: 'Số điện thoại', dataIndex: 'guestPhone' },
    { title: 'Số lượng phòng', dataIndex: 'totalRooms', align: 'center', render: (qty) => <Tag color="blue">{qty} phòng</Tag> },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status',
      render: (status) => {
        if (status === 'CheckedIn') return <Tag color="red">Đang ở</Tag>;
        if (status === 'Completed') return <Tag color="default">Đã trả phòng</Tag>;
        if (status === 'Cancelled') return <Tag color="default">Đã hủy</Tag>;
        if (status === 'Pending') return <Tag color="gold">Chờ xác nhận</Tag>;
        if (status === 'Confirmed') return <Tag color="green">Đã duyệt (Chờ nhận phòng)</Tag>;
        return <Tag color="green">Chờ nhận phòng</Tag>;
      }
    },
    {
      title: 'Thao tác',
      align: 'center',
      render: (_, record) => (
        <Space>
          {/*  Nút Chi tiết nay đã có linh hồn */}
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>Chi tiết</Button>
          
          <Button 
            size="small" type="primary" style={{ backgroundColor: record.status === 'Pending' ? '#1890ff' : undefined }}
            icon={<CheckCircleOutlined />} onClick={() => handleConfirm(record.id)}
            disabled={record.status !== 'Pending'}
          >
            Xác nhận
          </Button>

          {record.status === 'Confirmed' && (
            <Button 
              size="small" type="primary" style={{ backgroundColor: '#52c41a' }}
              icon={<CheckCircleOutlined />} onClick={() => handleCheckIn(record.id)}
            >
              Check-in
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card title={<Title level={3}>Danh sách Đặt phòng</Title>} bordered={false}>
        <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Tìm theo tên khách hoặc SĐT..." 
            prefix={<SearchOutlined />} style={{ width: 300 }}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={bookings.filter(b => b.guestName?.toLowerCase().includes(searchText.toLowerCase()) || b.guestPhone?.includes(searchText))} 
          rowKey="id" 
          loading={loading}
        />
      </Card>

      {/*  CỬA SỔ HIỂN THỊ CHI TIẾT ĐƠN HÀNG  */}
      <Modal
        title={`Chi tiết đơn: ${bookingDetail?.bookingCode || ''}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[<Button key="close" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>]}
        width={700}
      >
        {detailLoading ? (
          <p>Đang tải dữ liệu...</p>
        ) : bookingDetail ? (
          <div>
            <Descriptions title="Thông tin Khách hàng" bordered size="small" column={1}>
              <Descriptions.Item label={<><UserOutlined /> Họ và tên</>}><Text strong>{bookingDetail.guestName}</Text></Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>{bookingDetail.guestPhone}</Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>{bookingDetail.guestEmail || 'Không cung cấp'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Danh sách Phòng đã chọn</Title>
            <Table 
              dataSource={bookingDetail.rooms} 
              rowKey="detailId"
              pagination={false}
              size="small"
              bordered
              columns={[
                { title: 'Phòng', dataIndex: 'roomName', render: (r) => <b>Phòng {r}</b> },
                { title: 'Hạng phòng', dataIndex: 'roomTypeName' },
                { 
                  title: 'Lưu trú', 
                  render: (_, r) => `${dayjs(r.checkInDate).format('DD/MM/YYYY')} - ${dayjs(r.checkOutDate).format('DD/MM/YYYY')}` 
                },
                { title: 'Giá/Đêm', dataIndex: 'pricePerNight', render: (p) => <Text type="danger">{p.toLocaleString()} đ</Text> }
              ]}
            />
          </div>
        ) : (
          <p>Không có dữ liệu</p>
        )}
      </Modal>
    </div>
  );
};

export default BookingListPage;