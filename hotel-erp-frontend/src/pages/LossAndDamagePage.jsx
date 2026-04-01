import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Card, Tag, message, Typography, Row, Col, Statistic, 
  DatePicker, Button, Space, Popconfirm, Input, Tooltip, Modal, Form,
  InputNumber, Image 
} from 'antd';
import { 
  ReloadOutlined, DeleteOutlined, EditOutlined, 
  ExclamationCircleOutlined, DollarCircleOutlined, HistoryOutlined,
  SearchOutlined, FileImageOutlined 
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const LossAndDamagePage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // THÊM: Để xử lý tìm kiếm
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [searchText, setSearchText] = useState(''); // THÊM: Lưu text tìm kiếm
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
      const res = await axiosClient.get(url);
      setData(res.data);
      setFilteredData(res.data); // Cập nhật cả mảng filter
      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (error) {
      message.error('Không thể tải dữ liệu!');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  // 2. Xử lý TÌM KIẾM (Search) - THÊM MỚI
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

  // 3. Tính toán các chỉ số thống kê (Dùng trên mảng đã lọc)
  const stats = useMemo(() => {
    const totalIncidents = filteredData.length;
    const totalPenalty = filteredData.reduce((sum, item) => sum + (item.penaltyAmount || 0), 0);
    return { totalIncidents, totalPenalty };
  }, [filteredData]);

  // 4. Xử lý Xóa & Sửa (Giữ nguyên logic của Duy)
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
    { title: 'ID', dataIndex: 'id', width: 70 },
    { 
        title: 'Ảnh minh chứng', 
        dataIndex: 'imageUrl', 
        width: 120,
        render: (url) => url ? (
          <Image src={url} width={80} style={{ borderRadius: 4 }} fallback="https://placehold.co/80x80?text=No+Image" />
        ) : <Text type="secondary"><FileImageOutlined /> No Photo</Text>
    },
    { title: 'Phòng', dataIndex: 'roomNumber', render: (val) => <b>{val}</b> },
    { title: 'Vật tư', dataIndex: 'equipmentName' },
    { title: 'Số lượng', dataIndex: 'quantity', align: 'center' },
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
      width: 120,
      render: (_, record) => (
        <Space size="middle">
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
          {/* ... Phần Form của Duy giữ nguyên ... */}
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