import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Card, Tag, message, Typography, Row, Col, Statistic, 
  DatePicker, Button, Space, Popconfirm, Input, Tooltip, Modal, Form,
  InputNumber 
} from 'antd';
import { 
  ReloadOutlined, DeleteOutlined, EditOutlined, 
  ExclamationCircleOutlined, DollarCircleOutlined, HistoryOutlined 
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const LossAndDamagePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
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
      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (error) {
      message.error('Không thể tải dữ liệu!');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  // 2. Tính toán các chỉ số thống kê
  const stats = useMemo(() => {
    const totalIncidents = data.length;
    const totalPenalty = data.reduce((sum, item) => sum + (item.penaltyAmount || 0), 0);
    return { totalIncidents, totalPenalty };
  }, [data]);

  // 3. Xử lý Xóa bản ghi
  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/LossAndDamages/${id}`);
      message.success('Đã xóa phiếu và hoàn vật tư về trạng thái đang sử dụng');
      fetchData();
    } catch (error) {
      message.error('Xóa thất bại!');
    }
  };

  // 4. Xử lý Mở Modal Sửa
  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
    console.log("Dữ liệu dòng chọn:", record);
    // Cần dùng setTimeout để đảm bảo form đã render xong trước khi set value
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

  // 5. Gửi yêu cầu cập nhật lên Backend
  const handleUpdate = async () => {
    try {
    // 1. Kiểm tra xem đã có bản ghi đang sửa chưa
    if (!editingRecord || !editingRecord.id) {
      message.error("Không tìm thấy ID bản ghi cần cập nhật!");
      return;
    }

    const values = await form.validateFields();
    setLoading(true);
    
    // 2. Chuẩn bị dữ liệu gửi đi (Payload)
    // Đảm bảo gửi đầy đủ các trường mà Backend yêu cầu (kể cả ID vật tư)
    const payload = {
      ...values,
      roomInventoryId: editingRecord.roomInventoryId, // Lấy từ bản ghi gốc nếu Form không sửa
      createdAt: values.createdAt ? values.createdAt.toISOString() : dayjs().toISOString()
    };

    // 3. Gọi API với ID truyền vào URL
    // Đường dẫn đúng phải là: /LossAndDamages/1, /LossAndDamages/2...
    await axiosClient.put(`/LossAndDamages/${editingRecord.id}`, payload);

    message.success('Cập nhật thành công!');
    setIsEditModalOpen(false);
    fetchData(); // Load lại bảng
  } catch (error) {
    console.error("Lỗi khi cập nhật:", error.response?.data || error.message);
    message.error('Cập nhật thất bại! Kiểm tra lại dữ liệu.');
  } finally {
    setLoading(false);
  }
};

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
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
          <Tooltip title="Chỉnh sửa phiếu">
            <Button 
              type="text" 
              icon={<EditOutlined style={{color: '#1890ff'}} />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm 
            title="Xóa phiếu này?" 
            description="Vật tư sẽ được tính là đang sử dụng bình thường trở lại."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa" cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {/* PHẦN TRÊN: TỔNG HỢP CHỈ SỐ */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card variant="borderless" className="stat-card">
            <Statistic 
              title="Tổng sự cố" 
              value={stats.totalIncidents} 
              prefix={<ExclamationCircleOutlined />} 
              styles={{ content: { color: '#faad14' } }} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" className="stat-card">
            <Statistic 
              title="Tổng tiền đền bù" 
              value={stats.totalPenalty} 
              precision={0} 
              prefix={<DollarCircleOutlined />} 
              suffix="đ" 
              styles={{ content: { color: '#cf1322' } }} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" className="stat-card">
            <Statistic 
              title="Cập nhật cuối" 
              value={lastUpdated} 
              prefix={<HistoryOutlined />} 
              styles={{ content: { fontSize: '16px' } }} 
            />
          </Card>
        </Col>
      </Row>

      {/* THANH CÔNG CỤ: LỌC & LÀM MỚI */}
      <Card variant="borderless" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle">
              <Text strong>Lọc theo ngày:</Text>
              <RangePicker 
                onChange={(dates) => setDateRange(dates)} 
                placeholder={['Từ ngày', 'Đến ngày']} 
              />
            </Space>
          </Col>
          <Col>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchData} 
              loading={loading}
            >
              Làm mới dữ liệu
            </Button>
          </Col>
        </Row>
      </Card>

      <Card 
        title={<Title level={4}>Chi tiết danh sách đền bù</Title>} 
        variant="borderless"
      >
        <Table 
          dataSource={data} 
          columns={columns} 
          rowKey="id" 
          loading={loading} 
          pagination={{ pageSize: 10 }}
          bordered 
        />
      </Card>

      {/* MODAL SỬA PHIẾU ĐỀN BÙ (Gộp từ 2 bản của bạn) */}
      <Modal
        title="Chỉnh sửa phiếu đền bù"
        open={isEditModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Cập nhật"
        cancelText="Hủy"
        destroyOnHidden
        width={600}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="roomInventoryId" 
                label="ID Vật tư trong phòng" 
               
              >
                <InputNumber style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="quantity" 
                label="Số lượng hỏng" 
                rules={[{ required: true, message: 'Nhập số lượng' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="penaltyAmount" 
                label="Tiền phạt (VNĐ)" 
                rules={[{ required: true, message: 'Nhập số tiền' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={val => val.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="createdAt" 
                label="Ngày tạo phiếu" 
                rules={[{ required: true, message: 'Chọn ngày' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Mô tả sự cố">
                <Input.TextArea rows={3} placeholder="Mô tả chi tiết nguyên nhân..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default LossAndDamagePage;