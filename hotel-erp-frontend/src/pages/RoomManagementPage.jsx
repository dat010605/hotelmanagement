import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, message, 
  Tag, Space, Card, InputNumber, Tabs, Popconfirm, Row, Col, Alert 
} from 'antd';
import { 
  SearchOutlined, EditOutlined, PlusOutlined, 
  DeleteOutlined, DatabaseOutlined, CopyOutlined 
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { TabPane } = Tabs;

const RoomManagementPage = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [equipments, setEquipments] = useState([]); 
  const [roomInventory, setRoomInventory] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('basic_info');

  const [searchText, setSearchText] = useState('');
  const [searchFloor, setSearchFloor] = useState(null);
  const [searchRoomType, setSearchRoomType] = useState(null);

  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneSourceRoomId, setCloneSourceRoomId] = useState(null);

  const [basicForm] = Form.useForm();
  const [inventoryForm] = Form.useForm();

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [roomRes, eqRes] = await Promise.all([
        axiosClient.get('/Rooms'),
        axiosClient.get('/Equipments')
      ]);
      setRooms(roomRes.data);
      setFilteredRooms(roomRes.data);
      setEquipments(eqRes.data);

      setRoomTypes([
        { id: 1, name: 'Phòng tiêu chuẩn 1 giường đơn' },
        { id: 2, name: 'Phòng tiêu chuẩn 1 giường đôi' },
        { id: 3, name: 'Phòng cao cấp hướng phố' },
        { id: 4, name: 'Phòng Deluxe hướng biển' },
        { id: 5, name: 'Phòng Premium tiện nghi cao cấp' },
      ]);
    } catch (error) {
      message.error('Lỗi kết nối server!');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    let result = rooms;
    if (searchText) result = result.filter(r => (r.roomNumber || r.RoomNumber)?.includes(searchText));
    if (searchFloor) result = result.filter(r => Number(r.floor || r.Floor) === Number(searchFloor));
    if (searchRoomType) result = result.filter(r => Number(r.roomTypeId || r.RoomTypeId) === Number(searchRoomType));
    setFilteredRooms(result);
  }, [searchText, searchFloor, searchRoomType, rooms]);

  const fetchRoomInventory = async (roomId) => {
    try {
      const res = await axiosClient.get(`/RoomInventory/Room/${roomId}`);
      setRoomInventory(res.data);
    } catch (error) { setRoomInventory([]); }
  };

  const openModal = async (room = null) => {
    setCurrentRoom(room);
    setActiveTab('basic_info'); 
    setIsModalOpen(true);
    if (room) {
      const typeId = room.roomTypeId || room.RoomTypeId || 1;
      basicForm.setFieldsValue({
        roomNumber: room.roomNumber || room.RoomNumber,
        floor: room.floor || room.Floor,
        roomTypeId: Number(typeId),
        status: room.status || room.Status,
        cleaningStatus: room.cleaningStatus || room.CleaningStatus || 'Clean'
      });
      const roomId = room.id || room.Id;
      if(roomId) fetchRoomInventory(roomId);
    } else {
      basicForm.resetFields();
      basicForm.setFieldsValue({ status: 'Available', floor: 1, cleaningStatus: 'Clean', roomTypeId: 1 });
      setRoomInventory([]);
    }
  };

  const handleSaveBasicInfo = async () => {
    try {
      const values = await basicForm.validateFields();
      const currentId = currentRoom?.id || currentRoom?.Id;

      // CHỐT: Gửi đúng PascalCase cho Backend C#
      const payload = {
        RoomNumber: values.roomNumber.toString(),
        Floor: parseInt(values.floor),
        RoomTypeId: parseInt(values.roomTypeId),
        Status: values.status,
        CleaningStatus: values.cleaningStatus
      };

      if (currentId) {
        await axiosClient.put(`/Rooms/${currentId}`, payload);
        message.success('Cập nhật phòng thành công!');
      } else {
        await axiosClient.post('/Rooms', payload);
        message.success('Tạo phòng mới thành công!');
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (error) { 
      message.error(error.response?.data?.message || 'Kiểm tra lại thông tin!'); 
    }
  };

  // --- SỬA LỖI KHO KHÔNG ĐỦ: Map lại tên trường và ép kiểu số ---
  const handleAddInventory = async (values) => {
    try {
      const roomId = currentRoom.id || currentRoom.Id;
      
      // CHỐT: Backend C# cần PascalCase (RoomId, EquipmentId, Quantity)
      const payload = {
        RoomId: roomId,
        EquipmentId: values.equipmentId,
        Quantity: parseInt(values.quantity),
        Note: "Cấp phát từ kho"
      };

      await axiosClient.post('/RoomInventory', payload);
      message.success('Đã thêm vật tư thành công!');
      
      // Quan trọng: Load lại dữ liệu để cập nhật số lượng tồn kho mới trong list Select
      fetchInitialData(); 
      fetchRoomInventory(roomId);
      inventoryForm.resetFields();
    } catch (error) { 
      message.error(error.response?.data?.message || 'Lỗi: Có thể số lượng kho thực tế không đủ!'); 
    }
  };

  const handleDeleteInventory = async (id) => {
    try {
      await axiosClient.delete(`/RoomInventory/${id}`);
      message.success('Đã xóa và hoàn kho!');
      fetchInitialData(); // Refresh kho
      fetchRoomInventory(currentRoom.id || currentRoom.Id);
    } catch (error) { message.error('Lỗi khi xóa!'); }
  };

  const handleSyncWarehouse = async () => {
    try {
      const roomId = currentRoom.id || currentRoom.Id;
      await axiosClient.post(`/Rooms/sync-from-warehouse/${roomId}`);
      message.success('Đã đồng bộ vật tư mẫu từ kho!');
      fetchInitialData();
      fetchRoomInventory(roomId);
    } catch (error) { message.error('Lỗi đồng bộ!'); }
  };

  const handleClone = async () => {
    if (!cloneSourceRoomId) return message.warning('Hãy chọn phòng mẫu!');
    try {
      const targetId = currentRoom.id || currentRoom.Id;
      await axiosClient.post(`/RoomInventory/Clone?sourceRoomId=${cloneSourceRoomId}&targetRoomId=${targetId}`);
      message.success('Sao chép vật tư thành công!');
      setIsCloneModalOpen(false);
      fetchInitialData();
      fetchRoomInventory(targetId);
    } catch (error) { message.error(error.response?.data?.message || 'Lỗi sao chép!'); }
  };

  // --- SỬA LỖI MẤT BUỒNG PHÒNG: Map nhãn Tiếng Việt và xử lý Case ---
  const roomListColumns = [
    { title: 'Số phòng', render: (_, r) => <b>{r.roomNumber || r.RoomNumber}</b> },
    { title: 'Tầng', render: (_, r) => r.floor || r.Floor, align: 'center' },
    { title: 'Hạng phòng', render: (_, r) => roomTypes.find(t => t.id === (r.roomTypeId || r.RoomTypeId))?.name },
    { title: 'Trạng thái', render: (_, r) => {
        const s = r.status || r.Status;
        return <Tag color={s === 'Available' ? 'green' : 'red'}>{s}</Tag>
    }},
    { title: 'Buồng phòng', render: (_, r) => {
        const s = r.cleaningStatus || r.CleaningStatus;
        // Map lại để hiển thị đẹp và tránh mất chữ
        const labels = { 'Clean': 'Sạch sẽ', 'Dirty': 'Chưa dọn', 'Cleaning': 'Đang dọn' };
        return <Tag color="blue">{labels[s] || s || 'Sạch sẽ'}</Tag>
    }},
    { title: 'Thao tác', align: 'center', render: (_, r) => <Button type="primary" ghost icon={<EditOutlined />} onClick={() => openModal(r)}>Cấu hình</Button> },
  ];

  const inventoryColumns = [
    { title: 'Tên vật tư', dataIndex: 'equipmentName', render: t => <b>{t}</b> },
    { title: 'Số lượng', dataIndex: 'quantity', align: 'center' },
    { title: 'Giá đền bù', dataIndex: 'priceIfLost', render: p => p?.toLocaleString() + ' đ' },
    { title: 'Ghi chú', dataIndex: 'note' },
    { title: '', align: 'center', render: (_, r) => (
      <Popconfirm title="Xóa và trả lại kho?" onConfirm={() => handleDeleteInventory(r.id)}>
        <Button type="text" danger icon={<DeleteOutlined />} />
      </Popconfirm>
    )},
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<span style={{fontSize: '20px', fontWeight: 'bold'}}>🏨 Quản lý Quỹ phòng</span>}>
        <Row style={{ marginBottom: 20 }} justify="space-between" gutter={16}>
          <Col>
            <Space size="middle" wrap>
              <Input placeholder="Số phòng..." prefix={<SearchOutlined />} style={{ width: 140 }} onChange={e => setSearchText(e.target.value)} />
              <Select placeholder="-- Hạng phòng --" style={{ width: 230 }} allowClear onChange={v => setSearchRoomType(v)}>
                {roomTypes.map(t => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
              </Select>
              <Select placeholder="-- Tầng --" style={{ width: 100 }} allowClear onChange={v => setSearchFloor(v)}>
                {[...new Set(rooms.map(r => r.floor || r.Floor))].sort((a,b)=>a-b).map(f => <Select.Option key={f} value={f}>Tầng {f}</Select.Option>)}
              </Select>
            </Space>
          </Col>
          <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Thêm phòng mới</Button></Col>
        </Row>
        <Table dataSource={filteredRooms} columns={roomListColumns} rowKey={(r) => r.id || r.Id} loading={loading} bordered size="middle" />
      </Card>

      <Modal 
        title={currentRoom ? `⚙️ Cấu hình: Phòng ${currentRoom.roomNumber || currentRoom.RoomNumber}` : '➕ Thêm phòng mới'} 
        open={isModalOpen} onCancel={() => setIsModalOpen(false)} width={950}
        onOk={() => basicForm.submit()} okText="Lưu thông tin" destroyOnClose
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane tab="🏠 Thông tin cơ bản" key="basic_info">
            <Form form={basicForm} layout="vertical" style={{padding: '20px 10px'}} onFinish={handleSaveBasicInfo}>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="roomNumber" label="Số phòng" rules={[{required: true}]}><Input/></Form.Item></Col>
                <Col span={8}><Form.Item name="floor" label="Tầng" rules={[{required: true}]}><InputNumber style={{width: '100%'}}/></Form.Item></Col>
                <Col span={8}>
                  <Form.Item name="roomTypeId" label="Hạng phòng">
                    <Select options={roomTypes.map(t => ({ value: t.id, label: t.name }))} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="status" label="Trạng thái kinh doanh">
                    <Select options={[{value:'Available', label:'Available (Trống)'}, {value:'Occupied', label:'Occupied (Có khách)'}, {value:'Maintenance', label:'Maintenance (Bảo trì)'}]} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="cleaningStatus" label="Tình trạng buồng phòng">
                    <Select options={[{value:'Clean', label:'Sạch sẽ'}, {value:'Dirty', label:'Chưa dọn'}, {value:'Cleaning', label:'Đang dọn'}]} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </TabPane>

          <TabPane tab="📦 Quản lý vật tư" key="amenities" disabled={!currentRoom}>
            <div style={{ padding: '15px 0' }}>
              <Space style={{ marginBottom: 16 }}>
                <Button type="primary" ghost icon={<DatabaseOutlined />} onClick={handleSyncWarehouse}>Đồng bộ từ kho mẫu</Button>
                <Button icon={<CopyOutlined />} onClick={() => setIsCloneModalOpen(true)}>Clone từ phòng khác</Button>
              </Space>

              <Card size="small" title="Thêm vật tư lẻ" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
                <Form form={inventoryForm} layout="inline" onFinish={handleAddInventory}>
                  <Form.Item name="equipmentId" rules={[{ required: true }]} style={{ width: 300 }}>
                    <Select showSearch placeholder="Chọn vật tư từ kho" filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      options={equipments.map(e => ({ value: e.id || e.Id, label: `[${e.itemCode || e.ItemCode}] ${e.name || e.Name} (Còn: ${e.inStockQuantity || e.InStockQuantity})` }))} />
                  </Form.Item>
                  <Form.Item name="quantity" rules={[{ required: true }]}><InputNumber min={1} placeholder="SL" style={{width: 80}}/></Form.Item>
                  <Form.Item><Button type="primary" htmlType="submit" icon={<PlusOutlined />}>Thêm</Button></Form.Item>
                </Form>
              </Card>
              
              <Table dataSource={roomInventory} columns={inventoryColumns} rowKey="id" pagination={{ pageSize: 5 }} size="small" bordered />
            </div>
          </TabPane>
        </Tabs>
      </Modal>

      <Modal title="Sao chép vật tư" open={isCloneModalOpen} onCancel={() => setIsCloneModalOpen(false)} onOk={handleClone} okText="Bắt đầu sao chép">
        <p>Chọn phòng có sẵn vật tư để copy sang phòng <b>{currentRoom?.roomNumber || currentRoom?.RoomNumber}</b>:</p>
        <Select style={{ width: '100%' }} placeholder="-- Chọn phòng mẫu --" onChange={setCloneSourceRoomId}>
          {rooms.filter(r => (r.id || r.Id) !== (currentRoom?.id || currentRoom?.Id)).map(r => (
            <Select.Option key={r.id || r.Id} value={r.id || r.Id}>Phòng {r.roomNumber || r.RoomNumber} (Tầng {r.floor || r.Floor})</Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default RoomManagementPage;