import React, { useState } from 'react';
import { Card, Row, Col, Typography, Divider, Button, Modal, Form, Input, message, Popconfirm, Upload } from 'antd';
import { EditOutlined, GlobalOutlined, PlusOutlined, DeleteOutlined, EnvironmentOutlined, UploadOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useAttractionsStore } from '../store/useAttractionsStore';

const { Title, Paragraph, Text } = Typography;

const TouristAttractions = () => {
  const { attractions, addAttraction, updateAttraction, deleteAttraction } = useAttractionsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const showModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
        img: item.img ? [{ uid: '-1', name: 'image.png', status: 'done', url: item.img }] : []
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      let imageUrl = "";
      let finalMapUrl = values.mapUrl;

      // --- LOGIC TỰ SỬA LINK MAP: LỌC SRC TỪ IFRAME ---
      if (finalMapUrl && finalMapUrl.includes('<iframe')) {
        const regex = /src="([^"]+)"/;
        const match = finalMapUrl.match(regex);
        if (match && match[1]) {
          finalMapUrl = match[1];
        }
      }

      // Xử lý ảnh
      if (values.img && values.img.length > 0) {
        const file = values.img[0];
        imageUrl = file.originFileObj ? await getBase64(file.originFileObj) : file.url;
      }

      const finalData = { ...values, img: imageUrl, mapUrl: finalMapUrl };

      if (editingItem) {
        updateAttraction(editingItem.id, finalData);
        message.success("Đã cập nhật địa điểm!");
        axiosClient.post('/SystemNotifications/broadcast', { message: `Cập nhật thông tin điểm tham quan: ${finalData.title}` });
      } else {
        const newId = attractions.length > 0 ? Math.max(...attractions.map(a => a.id)) + 1 : 1;
        addAttraction({ id: newId, ...finalData });
        message.success("Đã thêm địa điểm mới!");
        axiosClient.post('/SystemNotifications/broadcast', { message: `Đã thêm điểm tham quan mới: ${finalData.title}` });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.log("Lỗi lưu dữ liệu:", error);
    }
  };

  const handleDelete = (id) => {
    const deletedItem = attractions.find(attr => attr.id === id);
    deleteAttraction(id);
    message.warning(" Đã xóa địa điểm!");
    if (deletedItem) {
        axiosClient.post('/SystemNotifications/broadcast', { message: `Đã xóa điểm tham quan: ${deletedItem.title}` });
    }
  };

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}><GlobalOutlined /> Khám Phá Địa Điểm Nổi Tiếng</Title>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => showModal()}>
          Thêm địa điểm mới
        </Button>
      </div>
      <Divider />

      <Row gutter={[24, 24]}>
        {attractions.map(item => (
          <Col xs={24} lg={12} key={item.id}>
            <Card
              hoverable
              title={<Text strong style={{fontSize: '18px'}}><EnvironmentOutlined /> {item.title}</Text>}
              extra={
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button type="link" icon={<EditOutlined />} onClick={() => showModal(item)}>Sửa</Button>
                  <Popconfirm title="Xóa địa điểm này?" onConfirm={() => handleDelete(item.id)} okText="Xóa" cancelText="Hủy">
                    <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
                  </Popconfirm>
                </div>
              }
              cover={<img alt={item.title} src={item.img} style={{ height: 280, objectFit: 'cover' }} />}
            >
              <Paragraph style={{ minHeight: '60px' }}>{item.desc}</Paragraph>
              <Divider plain><Text type="secondary">Bản đồ chỉ dẫn</Text></Divider>
              <div style={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                <iframe title={item.title} src={item.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingItem ? "Chỉnh sửa địa điểm" : "Thêm địa điểm tham quan mới"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText={editingItem ? "Lưu thay đổi" : "Thêm ngay"}
        cancelText="Hủy"
        width={700}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
          <Form.Item name="title" label="Tên địa điểm" rules={[{ required: true, message: 'Nhập tên!' }]}>
            <Input placeholder="Ví dụ: Landmark 81..." />
          </Form.Item>
          
          <Form.Item 
            name="img" 
            label="Hình ảnh" 
            valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
          >
            <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Chọn ảnh từ máy</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="desc" label="Giới thiệu">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="mapUrl" label="Link nhúng Google Maps (Iframe)">
            <Input.TextArea rows={2} placeholder="Dán link src hoặc thẻ iframe..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TouristAttractions;