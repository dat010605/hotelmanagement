import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Rate, Button, message, Typography, Select } from 'antd';
import axiosClient from '../api/axiosClient';

const { Text } = Typography;

const ReviewModal = ({ open, onClose, bookingRecord, userId }) => {
  const [loading, setLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [form] = Form.useForm();

  // 1. Load danh sách hạng phòng
  useEffect(() => {
    setRoomTypes([
      { id: 1, name: 'Phòng tiêu chuẩn 1 giường đơn' },
      { id: 2, name: 'Phòng tiêu chuẩn 1 giường đôi' },
      { id: 3, name: 'Phòng cao cấp hướng phố' },
      { id: 4, name: 'Phòng Deluxe hướng biển' },
      { id: 5, name: 'Phòng Premium tiện nghi cao cấp' },
      { id: 6, name: 'Phòng Hoàng gia (Royal Suite)' },
      { id: 7, name: 'Phòng Tổng thống (Presidential)' },
      { id: 8, name: 'Villa nguyên căn' },
    ]);
  }, []);

  // 2. Tự động điền sẵn hạng phòng nếu khách mở từ Lịch sử đặt phòng
  useEffect(() => {
    if (open && bookingRecord) {
      form.setFieldsValue({
        // Tự bắt đúng ID phòng mà khách đã ở
        roomTypeId: bookingRecord.roomTypeId || bookingRecord.RoomTypeId
      });
    }
  }, [open, bookingRecord, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        UserId: userId,
        RoomTypeId: values.roomTypeId, // Lấy ID phòng từ ô Select Dropdown
        Rating: values.rating,
        Comment: values.comment
      };

      await axiosClient.post('/Reviews', payload);
      message.success('Gửi đánh giá thành công! Cảm ơn bạn rất nhiều.');
      form.resetFields();
      onClose(); // Đóng modal
    } catch (error) {
      // Bắt lỗi từ Backend (Ví dụ: chưa từng ở phòng này)
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Đánh giá trải nghiệm của bạn"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        
        {/* Ô CHỌN HẠNG PHÒNG DẠNG DROPDOWN */}
        <Form.Item 
          name="roomTypeId" 
          label={<Text strong>Hạng phòng đã ở</Text>}
          rules={[{ required: true, message: 'Vui lòng chọn hạng phòng!' }]}
        >
          <Select 
            size="large"
            placeholder="-- Vui lòng chọn hạng phòng --"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={roomTypes.map(type => ({
              value: type.id,
              label: type.name
            }))}
          />
        </Form.Item>

        <Form.Item 
          name="rating" 
          label={<Text strong><span style={{color: '#ff4d4f'}}>*</span> Bạn chấm hạng phòng này mấy sao?</Text>}
          rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
        >
          <Rate style={{ fontSize: 32, color: '#fadb14' }} />
        </Form.Item>

        <Form.Item 
          name="comment" 
          label={<Text strong>Chia sẻ cảm nhận chi tiết của bạn</Text>}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Phòng rất sạch sẽ, view đẹp, nhân viên nhiệt tình..." 
          />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Gửi đánh giá
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReviewModal; 