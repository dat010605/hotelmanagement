import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Card, Tag, message, Typography, Row, Col, Statistic, 
  DatePicker, Button, Space, Popconfirm, Input, Modal, Form,
  InputNumber, Image, Tooltip 
} from 'antd';
import { 
  ReloadOutlined, DeleteOutlined, EditOutlined, 
  ExclamationCircleOutlined, DollarCircleOutlined, HistoryOutlined,
  SearchOutlined, FileImageOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const LossAndDamagePage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); 
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [searchText, setSearchText] = useState(''); 
  const [lastUpdated, setLastUpdated] = useState(dayjs().format('HH:mm:ss DD/MM/YYYY'));
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 1. Lấy dữ liệu từ Backend
  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/LossAndDamages';
      if (dateRange && dateRange[0] && dateRange[1]) {
        const start = dateRange[0].format('YYYY-MM-DD');
        const end = dateRange[1].format('YYYY-MM-DD');
        url += `?startDate=${start}&endDate=${end}`;
      }
      
      const [lossRes, roomRes] = await Promise.all([
        axiosClient.get(url),
        axiosClient.get('/Rooms')
      ]);

      setData(lossRes.data);
      setFilteredData(lossRes.data); 
      setRooms(roomRes.data);
      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (error) {
      message.error('Không thể tải dữ liệu!');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  // 2. Xử lý TÌM KIẾM
  const handleSearch = (value) => {
    setSearchText(value);
    const searchLower = value.toLowerCase();
    const filtered = data.filter(item => 
      (item.roomNumber && item.roomNumber.toString().includes(searchLower)) ||
      (item.equipmentName && item.equipmentName.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
    setFilteredData(filtered);
  };

  // 3. Tính toán thống kê
  const stats = useMemo(() => {
    const totalIncidents = filteredData.length;
    const totalPenalty = filteredData.reduce((sum, item) => sum + (item.penaltyAmount || 0), 0);
    return { totalIncidents, totalPenalty };
  }, [filteredData]);

  //  MỚI: Xử lý THU TIỀN (Thanh toán)
  const handlePayment = async (id) => {
    try {
      setLoading(true);
      // Gửi Status = 1 (Đã thanh toán) lên server
      await axiosClient.put(`/LossAndDamages/${id}`, { status: 1 });
      message.success('Xác nhận: Khách đã thanh toán đền bù thành công!');
      fetchData();
    } catch (error) {
      message.error('Lỗi khi cập nhật thanh toán!');
    } finally {
      setLoading(false);
    }
  };

  // 4. Xử lý Xóa & Sửa
  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/LossAndDamages/${id}`);
      message.success('Đã xóa phiếu và hoàn vật tư về trạng thái đang sử dụng');
      fetchData();
    } catch (error) { message.error('Xóa thất bại!'); }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
    setTimeout(() => {
      form.setFieldsValue({
        roomInventoryId: record.roomInventoryId,
        quantity: record.quantity,
        penaltyAmount: record.penaltyAmount,
        description: record.description,
        createdAt: record.createdAt ? dayjs(record.createdAt) : dayjs()
      });
    }, 100);
  };

  const handleUpdate = async () => {
    try {
      if (!editingRecord?.id) return;
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        ...values,
        roomInventoryId: editingRecord.roomInventoryId,
        createdAt: values.createdAt ? values.createdAt.toISOString() : dayjs().toISOString()
      };
      await axiosClient.put(`/LossAndDamages/${editingRecord.id}`, payload);
      message.success('Cập nhật thành công!');
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) { message.error('Cập nhật thất bại!'); }
    finally { setLoading(false); }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70, align: 'center' },
    { 
        title: 'Ảnh minh chứng', 
        key: 'imageUrl', 
        width: 120,
        align: 'center',
        render: (_, record) => {
          const url = record.imageUrl || record.ImageUrl || record.image_url;
          return url ? (
            <Image src={url} width={80} style={{ borderRadius: 4, objectFit: 'cover' }} fallback="https://placehold.co/80x80?text=Lỗi+Ảnh" />
          ) : <Text type="secondary"><FileImageOutlined /> Chưa chụp</Text>
        }
    },
    { 
      title: 'Phòng', 
      key: 'room', 
      align: 'center',
      render: (_, record) => {
        const rId = record.roomId || record.room_id || record.roomNumber; 
        const room = rooms.find(r => r.id == rId || r.Id == rId);
        const displayName = room ? (room.roomNumber || room.RoomNumber) : rId;
        return <Tag color="blue" style={{fontSize: '14px'}}><b>{displayName}</b></Tag>;
      }
    },
    { title: 'Vật tư', dataIndex: 'equipmentName' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status',
      width: 130,
      align: 'center',
      render: (s) => s === 1 
        ? <Tag color="green" icon={<CheckCircleOutlined />}>Đã thu tiền</Tag> 
        : <Tag color="volcano" icon={<ExclamationCircleOutlined />}>Chờ thanh toán</Tag>
    },
    { 
      title: 'Tiền phạt', 
      dataIndex: 'penaltyAmount', 
      render: (val) => <Text type="danger" strong>{val?.toLocaleString()} đ</Text> 
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', render: (d) => dayjs(d).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          {/* NÚT THU TIỀN: Chỉ hiện nếu Status chưa phải là 1 (Đã thu) */}
          {record.status !== 1 && (
            <Tooltip title="Thu tiền đền bù">
              <Popconfirm 
                title="Xác nhận khách đã nộp tiền đền bù?" 
                onConfirm={() => handlePayment(record.id)}
                okText="Đã thu"
                cancelText="Hủy"
              >
                <Button 
                  type="primary" 
                  size="small" 
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} 
                  icon={<DollarCircleOutlined />} 
                />
              </Popconfirm>
            </Tooltip>
          )}

          <Button type="text" icon={<EditOutlined style={{color: '#1890ff'}} />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xóa phiếu này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card variant="borderless"><Statistic title="Tổng sự cố" value={stats.totalIncidents} prefix={<ExclamationCircleOutlined />} styles={{ content: { color: '#faad14' } }} /></Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless"><Statistic title="Tổng tiền đền bù" value={stats.totalPenalty} suffix="đ" prefix={<DollarCircleOutlined />} styles={{ content: { color: '#cf1322' } }} /></Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless"><Statistic title="Cập nhật cuối" value={lastUpdated} prefix={<HistoryOutlined />} styles={{ content: { fontSize: '16px' } }} /></Card>
        </Col>
      </Row>

      <Card variant="borderless" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Input 
                placeholder="Tìm phòng hoặc vật tư..." 
                prefix={<SearchOutlined />} 
                onChange={e => handleSearch(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <RangePicker onChange={(dates) => setDateRange(dates)} placeholder={['Từ ngày', 'Đến ngày']} />
            </Space>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
          </Col>
        </Row>
      </Card>

      <Card title={<Title level={4}>Chi tiết danh sách đền bù</Title>} variant="borderless">
        <Table dataSource={filteredData} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} bordered />
      </Card>

      <Modal title="Chỉnh sửa phiếu đền bù" open={isEditModalOpen} onOk={handleUpdate} onCancel={() => setIsEditModalOpen(false)} confirmLoading={loading}>
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
             <Col span={12}><Form.Item name="roomInventoryId" label="ID Vật tư"><InputNumber style={{ width: '100%' }} disabled /></Form.Item></Col>
             <Col span={12}><Form.Item name="quantity" label="Số lượng hỏng" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
             <Col span={12}><Form.Item name="penaltyAmount" label="Tiền phạt (VNĐ)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
             <Col span={12}><Form.Item name="createdAt" label="Ngày tạo phiếu"><DatePicker showTime style={{ width: '100%' }} /></Form.Item></Col>
             <Col span={24}><Form.Item name="description" label="Mô tả sự cố"><Input.TextArea rows={3} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default LossAndDamagePage;