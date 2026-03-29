import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Card, Space, Upload, Image, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import axios from 'axios'; 

const EquipmentManagementPage = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form] = Form.useForm();

  // CLOUDINARY
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

  // 🔥 THUẬT TOÁN TỰ ĐỘNG TÍNH GIÁ ĐỀN BÙ
  const handleBasePriceChange = (value) => {
    if (value === null || value === undefined) {
      form.setFieldsValue({ defaultPriceIfLost: null });
      return;
    }

    let defaultPrice = 0;
    if (value < 100000) {
      defaultPrice = value + 10000; // Dưới 100k -> tăng 10k
    } else if (value < 1000000) {
      defaultPrice = value + 100000; // Dưới 1 triệu -> tăng 100k
    } else {
      defaultPrice = value + 200000; // Từ 1 triệu trở lên -> tăng 200k
    }

    // Tự động điền kết quả vào ô "Giá đền bù"
    form.setFieldsValue({ defaultPriceIfLost: defaultPrice });
  };

  const columns = [
    { title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', render: (url) => url ? <Image width={40} height={40} src={url} style={{ borderRadius: '4px', objectFit: 'cover' }} /> : <PictureOutlined style={{ fontSize: '20px', color: '#ccc' }} /> },
    { title: 'Mã', dataIndex: 'itemCode', key: 'itemCode' },
    { title: 'Tên vật tư', dataIndex: 'name', key: 'name', fontWeight: 'bold' },
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit' },
    { title: 'Tổng', dataIndex: 'totalQuantity', key: 'totalQuantity', render: (val) => <b style={{color: '#1890ff'}}>{val}</b> },
    { title: 'Sẵn kho', dataIndex: 'inStockQuantity', key: 'inStockQuantity', render: (val) => <span style={{color: '#52c41a'}}>{val}</span> },
    { title: 'Đang dùng', dataIndex: 'inUseQuantity', key: 'inUseQuantity', render: (val) => <span style={{color: '#1890ff'}}>{val}</span> },
    { title: 'Hỏng', dataIndex: 'damagedQuantity', key: 'damagedQuantity', render: (val) => <span style={{color: '#ff4d4f'}}>{val || 0}</span> },
    { title: 'Thanh lý', dataIndex: 'liquidatedQuantity', key: 'liquidatedQuantity', render: (val) => <span style={{color: 'gray'}}>{val || 0}</span> },
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
    <Card title={<span style={{fontSize: '20px', color: '#595959'}}>Danh mục Quản lý Kho vật tư</span>} extra={<Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>Thêm vật tư mới</Button>}>
      <Table dataSource={equipments} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      <Modal title={isEditMode ? "Sửa thông tin vật tư" : "Thêm thông tin vật tư"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} width={700}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={24}>
            <Col span={16}>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="itemCode" label="* Mã vật tư"><Input placeholder="VD: SN-OR-01" /></Form.Item></Col>
                <Col span={12}><Form.Item name="name" label="* Tên vật tư" rules={[{ required: true, message: 'Nhập tên' }]}><Input placeholder="Bánh Oreo 133g" /></Form.Item></Col>
                <Col span={12}>
                  <Form.Item name="category" label="* Danh mục">
                    <Select placeholder="Chọn danh mục">
                      <Select.Option value="Minibar">Minibar</Select.Option>
                      <Select.Option value="Điện tử">Điện tử</Select.Option>
                      <Select.Option value="Nội thất">Nội thất</Select.Option>
                      <Select.Option value="Đồ vải">Đồ vải</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}><Form.Item name="unit" label="* Đơn vị tính"><Input placeholder="Hộp, Ly, Lon..." /></Form.Item></Col>
                <Col span={8}><Form.Item name="totalQuantity" label="* Số lượng tổng" rules={[{ required: true, message: 'Nhập SL' }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                
                {/* 🌟 ĐÃ THÊM FORMATTER VÀ SỰ KIỆN ONCHANGE CHO GIÁ NHẬP */}
                <Col span={8}>
                  <Form.Item name="basePrice" label="* Giá nhập (VNĐ)" rules={[{ required: true, message: 'Nhập giá' }]}>
                    <InputNumber 
                      min={0} 
                      style={{ width: '100%' }} 
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      onChange={handleBasePriceChange} 
                    />
                  </Form.Item>
                </Col>

                {/* 🌟 ĐÃ THÊM FORMATTER CHO GIÁ ĐỀN BÙ */}
                <Col span={8}>
                  <Form.Item name="defaultPriceIfLost" label="* Giá đền bù" rules={[{ required: true, message: 'Nhập giá' }]}>
                    <InputNumber 
                      min={0} 
                      style={{ width: '100%' }} 
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>

                {isEditMode && <Col span={12}><Form.Item name="damagedQuantity" label="Báo hỏng"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>}
                {isEditMode && <Col span={12}><Form.Item name="liquidatedQuantity" label="Thanh lý"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>}
                <Col span={24}><Form.Item name="supplier" label="Nhà cung cấp"><Input placeholder="VD: Mondelez" /></Form.Item></Col>
              </Row>
            </Col>
            <Col span={8} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: 8, fontSize: '14px', color: '#555' }}>Hình ảnh (Cloudinary)</div>
              <Upload name="file" customRequest={handleImageUpload} showUploadList={false} accept="image/*">
                {imageUrl ? <Image src={imageUrl} preview={false} style={{ width: 150, height: 150, objectFit: 'contain', border: '1px solid #d9d9d9', padding: '10px' }} /> : <div style={{ width: 150, height: 150, border: '1px dashed #d9d9d9', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fafafa' }}><PictureOutlined style={{ fontSize: '30px', color: '#ccc' }} /></div>}
                <Button icon={<UploadOutlined />} style={{ marginTop: 10, width: '100%' }} loading={uploadingImage}>Chọn ảnh mới</Button>
              </Upload>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
};
export default EquipmentManagementPage;