import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Card, Space, Upload, Image, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import axios from 'axios'; 
import { API_BASE_URL } from '../api/config';

const EquipmentManagementPage = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form] = Form.useForm();

  const CLOUD_NAME = 'drqvarew0'; 
  const UPLOAD_PRESET = 'hotel_kho_vat_tu'; 

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/Equipments');
      setEquipments(res.data);
    } catch (error) { message.error('Lỗi tải dữ liệu kho vật tư!'); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const showAddModal = () => {
    setIsEditMode(false); setEditingItem(null); setImageUrl(''); form.resetFields(); setIsModalVisible(true);
  };

  const showEditModal = (item) => {
    setIsEditMode(true); setEditingItem(item); setImageUrl(item.imageUrl || ''); 
    form.setFieldsValue({
      itemCode: item.itemCode,
      name: item.name,
      category: item.category,
      unit: item.unit,
      totalQuantity: item.totalQuantity,
      basePrice: item.basePrice,
      defaultPriceIfLost: item.defaultPriceIfLost,
      supplier: item.supplier,
      damagedQuantity: item.damagedQuantity || 0,
      liquidatedQuantity: item.liquidatedQuantity || 0
    });
    setIsModalVisible(true);
  };

  const handleImageUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);

    try {
      setUploadingImage(true);
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
      setImageUrl(res.data.secure_url); onSuccess("Ok"); message.success('Tải ảnh thành công!');
    } catch (err) { onError({ err }); message.error('Lỗi khi tải ảnh!'); } 
    finally { setUploadingImage(false); }
  };

  // --- HÀM XUẤT FILE (LOGIC MỚI CỦA DUY) ---
  const handleExportInventory = async (type) => {
    const token = localStorage.getItem('token');
    const endpoint = type === 'excel' ? 'inventory-report' : 'export-inventory-zip';
    const fileName = type === 'excel' ? 'Bao_Cao_Vat_Tu.xlsx' : 'Kho_Vat_Tu_Anh.zip';

    try {
        const apiBaseUrl = API_BASE_URL;
        const response = await fetch(`${apiBaseUrl}/Export/${endpoint}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Tải tệp thất bại!');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        message.success(`Đã tải: ${fileName}`);
    } catch (err) {
        message.error(err.message);
    }
  };

  const handleSave = async (values) => {
    const payload = { ...values, imageUrl: imageUrl };
    try {
      if (isEditMode && editingItem) {
        await axiosClient.put(`/Equipments/${editingItem.id}`, payload);
        message.success('Cập nhật thành công!');
      } else {
        await axiosClient.post('/Equipments', payload);
        message.success('Thêm vật tư thành công!');
      }
      setIsModalVisible(false); fetchData();
    } catch (error) { message.error('Thao tác thất bại!'); }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/Equipments/${id}`); message.success('Đã xóa!'); fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Không thể xóa vật tư này!'); }
  };

  const handleBasePriceChange = (value) => {
    if (!value) { form.setFieldsValue({ defaultPriceIfLost: null }); return; }
    let defaultPrice = value < 100000 ? value + 10000 : value < 1000000 ? value + 100000 : value + 200000;
    form.setFieldsValue({ defaultPriceIfLost: defaultPrice });
  };

  const columns = [
    { title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', render: (url) => url ? <Image width={40} height={40} src={url} style={{ borderRadius: '4px', objectFit: 'cover' }} /> : <PictureOutlined style={{ fontSize: '20px', color: '#ccc' }} /> },
    { title: 'Mã', dataIndex: 'itemCode', key: 'itemCode' },
    { title: 'Tên vật tư', dataIndex: 'name', key: 'name' },
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit' },
    { title: 'Tổng', dataIndex: 'totalQuantity', key: 'totalQuantity', render: (val) => <b style={{color: '#1890ff'}}>{val}</b> },
    { title: 'Sẵn kho', dataIndex: 'inStockQuantity', key: 'inStockQuantity', render: (val) => <span style={{color: '#52c41a'}}>{val}</span> },
    { title: 'Hỏng', dataIndex: 'damagedQuantity', key: 'damagedQuantity', render: (val) => <span style={{color: '#ff4d4f'}}>{val || 0}</span> },
    { title: 'Thao tác', key: 'action', render: (_, record) => (
        <Space size="middle">
          <Button type="text" style={{color: '#1890ff'}} icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => {
            Modal.confirm({ title: 'Xóa vật tư này?', content: 'Không thể hoàn tác.', onOk: () => handleDelete(record.id) });
          }} />
        </Space>
      )},
  ];

  return (
    <Card 
      title={<span style={{fontSize: '20px', color: '#595959'}}>Quản lý Kho vật tư</span>} 
      extra={
        <Space>
            <Button icon={<FileExcelOutlined />} onClick={() => handleExportInventory('excel')}>Xuất Excel</Button>
            <Button danger icon={<UploadOutlined />} onClick={() => handleExportInventory('zip')}>Xuất ZIP (Ảnh)</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>Thêm mới</Button>
        </Space>
      }
    >
      <Table dataSource={equipments} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      
      <Modal title={isEditMode ? "Sửa vật tư" : "Thêm vật tư"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} width={700}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={24}>
            <Col span={16}>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="itemCode" label="Mã vật tư"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="name" label="Tên vật tư" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col span={12}>
                  <Form.Item name="category" label="Danh mục">
                    <Select>
                      <Select.Option value="Minibar">Minibar</Select.Option>
                      <Select.Option value="Điện tử">Điện tử</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}><Form.Item name="unit" label="Đơn vị tính"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="totalQuantity" label="SL tổng" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}>
                  <Form.Item name="basePrice" label="Giá nhập" rules={[{ required: true }]}>
                    <InputNumber min={0} style={{ width: '100%' }} onChange={handleBasePriceChange} />
                  </Form.Item>
                </Col>
                <Col span={8}><Form.Item name="defaultPriceIfLost" label="Giá đền bù"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              </Row>
            </Col>
            <Col span={8} style={{ textAlign: 'center' }}>
              <Upload name="file" customRequest={handleImageUpload} showUploadList={false}>
                {imageUrl ? <Image src={imageUrl} preview={false} style={{ width: 120, height: 120, objectFit: 'cover' }} /> : <div style={{ width: 120, height: 120, border: '1px dashed #d9d9d9', lineHeight: '120px' }}>Ảnh</div>}
                <Button icon={<UploadOutlined />} style={{ marginTop: 10 }}>Chọn ảnh</Button>
              </Upload>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
};
export default EquipmentManagementPage;