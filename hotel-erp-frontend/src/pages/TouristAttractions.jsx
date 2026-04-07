import React, { useState } from 'react';
import { Card, Row, Col, Typography, Divider, Button, Modal, Form, Input, message, Popconfirm, Upload } from 'antd';
import { EditOutlined, GlobalOutlined, PlusOutlined, DeleteOutlined, EnvironmentOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const TouristAttractions = () => {
  // 1. State danh sách địa điểm (Đã thêm sẵn 5 địa điểm mới cho Duy)
  const [attractions, setAttractions] = useState([
    {
      id: 1,
      title: "Chợ Bến Thành",
      desc: "Biểu tượng lịch sử lâu đời, nơi hội tụ tinh hoa ẩm thực Sài Gòn và là điểm mua sắm sầm uất nhất trung tâm.",
      img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.485123456789!2d106.6967!3d10.7719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3f1234567f%3A0x1234567890abcdef!2zQ2jhu6MgQuG6v24gVGjDoG5o!5e0!3m2!1svi!2svn!4v1712480000000"
    },
    {
      id: 2,
      title: "Dinh Độc Lập",
      desc: "Di tích lịch sử đặc biệt cấp quốc gia, nơi ghi dấu thời khắc thống nhất đất nước với kiến trúc thập niên 60 cực đẹp.",
      img: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.44795325883!2d106.69344157573435!3d10.777485359483321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed3d7d%3A0x6b485d204780516!2sIndependence%20Palace!5e0!3m2!1svi!2svn!4v1712481000000"
    },
    {
      id: 3,
      title: "Landmark 81",
      desc: "Tòa nhà cao nhất Việt Nam, biểu tượng cho sự thịnh vượng và hiện đại của TP.HCM với view ngắm toàn cảnh cực đỉnh.",
      img: "https://images.unsplash.com/photo-1571506165871-ee72a35bb9d4?w=800",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2014!2d106.7218!3d10.7948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527c3de5779db%3A0x801666992f4e3c!2sLandmark%2081!5e0!3m2!1svi!2svn!4v1712482000000"
    },
    {
      id: 4,
      title: "Bưu Điện Thành Phố",
      desc: "Công trình kiến trúc Pháp cổ điển ngay trung tâm, điểm check-in không thể bỏ qua với vẻ đẹp vượt thời gian.",
      img: "https://images.unsplash.com/photo-1599708155013-176313f8d32d?w=800",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4439!2d106.6999!3d10.7798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385573447d%3A0xbc4047970d49826d!2sSaigon%20Central%20Post%20Office!5e0!3m2!1svi!2svn!4v1712483000000"
    },
    {
      id: 5,
      title: "Phố Đi Bộ Nguyễn Huệ",
      desc: "Thiên đường vui chơi về đêm với các màn trình diễn nhạc nước và không gian đi bộ hiện đại nhất thành phố.",
      img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4602!2d106.7025!3d10.7756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40a6e38253%3A0x6b44983050119f!2zUGjhu5EgxJFpIGLhu5kgTmd1eeG7hW4gSHXhu4c!5e0!3m2!1svi!2svn!4v1712484000000"
    }
  ]);

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
        setAttractions(attractions.map(attr => attr.id === editingItem.id ? { ...attr, ...finalData } : attr));
        message.success("Đã cập nhật địa điểm!");
      } else {
        const newId = attractions.length > 0 ? Math.max(...attractions.map(a => a.id)) + 1 : 1;
        setAttractions([...attractions, { id: newId, ...finalData }]);
        message.success("Đã thêm địa điểm mới!");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.log("Lỗi lưu dữ liệu:", error);
    }
  };

  const handleDelete = (id) => {
    setAttractions(attractions.filter(attr => attr.id !== id));
    message.warning(" Đã xóa địa điểm!");
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