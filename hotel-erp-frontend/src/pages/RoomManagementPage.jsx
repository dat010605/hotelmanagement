import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, message, 
  Tag, Space, Card, InputNumber, Tabs, Popconfirm, Row, Col, Drawer, Badge, Typography 
} from 'antd';
import { 
  SearchOutlined, EditOutlined, PlusOutlined, 
  DeleteOutlined, DatabaseOutlined, CopyOutlined, CheckSquareOutlined, AppstoreAddOutlined 
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;
const { Text } = Typography; //  ĐÃ CHUYỂN LÊN ĐÂY CHUẨN MỰC, KHÔNG DÙNG REQUIRE NỮA 

const RoomManagementPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [equipments, setEquipments] = useState([]); 
  const [roomInventory, setRoomInventory] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false); 

  const [currentRoom, setCurrentRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('basic_info');
  const [cloneSourceRoomId, setCloneSourceRoomId] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [searchRoomType, setSearchRoomType] = useState(null);

  const [basicForm] = Form.useForm();
  const [inventoryForm] = Form.useForm();
  const [bulkForm] = Form.useForm();

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
        { id: 6, name: '👑 Phòng Hoàng gia (Royal Suite)' },
        { id: 7, name: '🌟 Phòng Tổng thống (Presidential)' },
        { id: 8, name: '🌴 Villa nguyên căn' },
      ]);
    } catch (error) {
      message.error('Lỗi kết nối server!');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    let result = rooms;
    if (searchText) result = result.filter(r => (r.roomNumber || r.RoomNumber)?.includes(searchText));
    if (searchRoomType) result = result.filter(r => Number(r.roomTypeId || r.RoomTypeId) === Number(searchRoomType));
    setFilteredRooms(result);
  }, [searchText, searchRoomType, rooms]);

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
      const payload = {
        RoomNumber: values.roomNumber.toString(),
        Floor: parseInt(values.floor),
        RoomTypeId: parseInt(values.roomTypeId),
        Status: values.status,
        CleaningStatus: values.cleaningStatus
      };
      if (currentId) await axiosClient.put(`/Rooms/${currentId}`, payload);
      else await axiosClient.post('/Rooms', payload);
      
      message.success('Lưu phòng thành công!');
      setIsModalOpen(false);
      fetchInitialData();
    } catch (error) { message.error('Kiểm tra lại thông tin (Số phòng có thể bị trùng)!'); }
  };

  const handleBulkCreate = async () => {
    try {
      const values = await bulkForm.validateFields();
      const { floor, startNumber, endNumber, roomTypeId } = values;
      if (startNumber > endNumber) return message.error('Số bắt đầu không lớn hơn số kết thúc!');

      setLoading(true);
      const promises = [];
      let successCount = 0;

      for (let i = startNumber; i <= endNumber; i++) {
        const roomNumStr = i < 10 ? `0${i}` : `${i}`;
        const finalRoomNumber = `${floor}${roomNumStr}`;
        const payload = {
          RoomNumber: finalRoomNumber,
          Floor: parseInt(floor),
          RoomTypeId: parseInt(roomTypeId),
          Status: 'Available',
          CleaningStatus: 'Clean'
        };
        promises.push(axiosClient.post('/Rooms', payload).then(() => successCount++).catch(() => {}));
      }

      await Promise.all(promises);
      message.success(`Đã tạo thành công ${successCount} phòng mới!`);
      setIsBulkModalOpen(false);
      bulkForm.resetFields();
      fetchInitialData(); 
    } catch (error) { console.log(error); } 
    finally { setLoading(false); }
  };

  const handleCheckOut = async (roomId) => {
    try {
      const targetRoom = rooms.find(r => (r.id || r.Id) === roomId);
      if (!targetRoom) return;
      await axiosClient.put(`/Rooms/${roomId}`, {
        Id: roomId,
        RoomNumber: targetRoom.roomNumber || targetRoom.RoomNumber,
        Floor: targetRoom.floor || targetRoom.Floor,
        RoomTypeId: targetRoom.roomTypeId || targetRoom.RoomTypeId,
        Status: 'Maintenance', 
        CleaningStatus: 'Dirty' 
      });
      message.success("Đã trả phòng và yêu cầu dọn dẹp!");
      fetchInitialData();
    } catch (error) { message.error(`Lỗi trả phòng`); }
  };

  const handleAddInventory = async (values) => {
    try {
      await axiosClient.post('/RoomInventory', {
        RoomId: currentRoom.id || currentRoom.Id,
        EquipmentId: values.equipmentId,
        Quantity: parseInt(values.quantity),
        Note: "Cấp phát từ kho"
      });
      message.success('Thêm vật tư thành công!');
      fetchInitialData(); fetchRoomInventory(currentRoom.id || currentRoom.Id);
      inventoryForm.resetFields();
    } catch (error) { message.error('Lỗi kho!'); }
  };

  const handleDeleteInventory = async (itemId) => {
    try {
      await axiosClient.delete(`/RoomInventory/${itemId}`);
      message.success('Đã xóa 1 món!');
      fetchInitialData(); fetchRoomInventory(currentRoom.id || currentRoom.Id);
    } catch (error) { message.error(`Lỗi xóa!`); }
  };

  const handleDeleteAllInventory = async () => {
    try {
      await axiosClient.delete(`/RoomInventory/Room/${currentRoom.id || currentRoom.Id}`);
      message.success('Đã dọn sạch toàn bộ vật tư!');
      fetchInitialData(); fetchRoomInventory(currentRoom.id || currentRoom.Id);
    } catch (error) { message.error('Lỗi xóa phòng!'); }
  };

  const handleQuantityChange = async (inventoryId, newQuantity) => {
    setRoomInventory(roomInventory.map(item => item.id === inventoryId ? { ...item, quantity: newQuantity } : item));
    try {
      await axiosClient.put(`/RoomInventory/${inventoryId}/Quantity`, newQuantity, { headers: { 'Content-Type': 'application/json' } });
    } catch (error) { message.warning('Lỗi tăng giảm!'); fetchRoomInventory(currentRoom.id || currentRoom.Id); }
  };

  const handleSyncWarehouse = async () => {
    try {
      await axiosClient.post(`/Rooms/sync-from-warehouse/${currentRoom.id || currentRoom.Id}`);
      message.success('Đã đồng bộ vật tư mẫu!');
      fetchInitialData(); fetchRoomInventory(currentRoom.id || currentRoom.Id);
    } catch (error) { message.error('Lỗi đồng bộ!'); }
  };

  const handleClone = async () => {
    if (!cloneSourceRoomId) return;
    try {
      await axiosClient.post(`/RoomInventory/Clone?sourceRoomId=${cloneSourceRoomId}&targetRoomId=${currentRoom.id || currentRoom.Id}`);
      message.success('Sao chép thành công!');
      setIsCloneModalOpen(false);
      fetchInitialData(); fetchRoomInventory(currentRoom.id || currentRoom.Id);
    } catch (error) { message.error('Lỗi sao chép!'); }
  };

  const roomListColumns = [
    { title: 'Số phòng', width: 100, align: 'center', render: (_, r) => <b>{r.roomNumber || r.RoomNumber}</b> },
    { title: 'Hạng phòng', render: (_, r) => <Text strong>{roomTypes.find(t => t.id === (r.roomTypeId || r.RoomTypeId))?.name}</Text> },
    { title: 'Trạng thái', width: 150, align: 'center', render: (_, r) => {
        const s = r.status || r.Status;
        return <Badge status={s === 'Available' ? 'success' : s === 'Occupied' ? 'processing' : 'error'} text={s === 'Available' ? 'Sẵn sàng' : s === 'Occupied' ? 'Có khách' : 'Bảo trì'} />
    }},
    {
      title: 'Buồng phòng', width: 150, align: 'center',
      render: (_, r) => {
        const s = (r.cleaningStatus || r.cleaning_status || r.CleaningStatus || "").toLowerCase();
        const labels = { 'clean': 'Sạch sẽ', 'dirty': 'Chưa dọn', 'cleaning': 'Đang dọn' };
        const colors = { 'clean': 'green', 'dirty': 'red', 'cleaning': 'blue' };
        return <Tag color={colors[s] || 'default'}>{labels[s] || s}</Tag>;
      }
    },
    {
      title: 'Thao tác', align: 'center', width: 350,
      render: (_, record) => ( 
        <Space>
          <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => openModal(record)}>Cấu hình</Button>
          <Button size="small" danger onClick={() => handleCheckOut(record.id || record.Id)}>Trả phòng</Button>
          <Button size="small" style={{ color: '#fa8c16', borderColor: '#fa8c16' }} icon={<CheckSquareOutlined />} onClick={() => navigate(`/admin/housekeeping/${record.id || record.Id}`)}>Dọn phòng</Button>
        </Space>
      ),
    },
  ];

  const inventoryColumns = [
    { title: 'Tên vật tư', dataIndex: 'equipmentName', render: t => <b>{t}</b> },
    { title: 'Số lượng', align: 'center', render: (_, r) => <InputNumber min={1} max={99} value={r.quantity} onChange={(v) => handleQuantityChange(r.id || r.Id, v)} style={{ width: '70px' }} /> },
    { title: 'Giá đền bù', dataIndex: 'priceIfLost', render: p => p?.toLocaleString() + ' đ' },
    { title: ( <Popconfirm title="Dọn sạch phòng?" onConfirm={handleDeleteAllInventory} placement="left"> <Button danger type="primary" size="small">Xóa tất cả</Button> </Popconfirm> ), align: 'center', render: (_, r) => (
        <Popconfirm title="Xóa món này?" onConfirm={() => handleDeleteInventory(r.id || r.Id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
    )},
  ];

  const uniqueFloors = [...new Set(filteredRooms.map(r => r.floor || r.Floor))].sort((a, b) => a - b);

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<span style={{fontSize: '20px', fontWeight: 'bold'}}>🏨 Quản lý Quỹ phòng (Phân theo Tầng)</span>}>
        
        <Row style={{ marginBottom: 20 }} justify="space-between" gutter={16}>
          <Col>
            <Space size="middle" wrap>
              <Input placeholder="Tìm số phòng..." prefix={<SearchOutlined />} style={{ width: 160 }} onChange={e => setSearchText(e.target.value)} allowClear />
              <Select placeholder="-- Lọc theo Hạng phòng --" style={{ width: 250 }} allowClear onChange={v => setSearchRoomType(v)}>
                {roomTypes.map(t => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button type="primary" style={{ backgroundColor: '#52c41a' }} icon={<AppstoreAddOutlined />} onClick={() => { setIsBulkModalOpen(true); bulkForm.resetFields(); }}>Tạo nhiều phòng</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Thêm phòng lẻ</Button>
            </Space>
          </Col>
        </Row>

        <Tabs defaultActiveKey="all" type="card" size="large">
          <TabPane tab={<span style={{fontWeight: 'bold'}}>Tất cả phòng</span>} key="all">
            <Table dataSource={filteredRooms} columns={roomListColumns} rowKey={(r) => r.id || r.Id} loading={loading} bordered size="middle" pagination={{ pageSize: 15 }} />
          </TabPane>
          
          {uniqueFloors.map(floor => (
            <TabPane 
              tab={<span style={{fontWeight: 'bold', color: '#1890ff'}}>Tầng {floor}</span>} 
              key={floor.toString()}
            >
              <Table 
                dataSource={filteredRooms.filter(r => (r.floor || r.Floor) === floor)} 
                columns={roomListColumns} 
                rowKey={(r) => r.id || r.Id} 
                loading={loading} 
                bordered size="middle" 
                pagination={{ pageSize: 15 }} 
              />
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <Modal title="🏗️ Tạo phòng hàng loạt" open={isBulkModalOpen} onCancel={() => setIsBulkModalOpen(false)} onOk={handleBulkCreate} okText="Bắt đầu tạo" confirmLoading={loading}>
        <Form form={bulkForm} layout="vertical" initialValues={{ floor: 1, startNumber: 1, endNumber: 5, roomTypeId: 1 }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="floor" label="Tầng" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="roomTypeId" label="Hạng phòng" rules={[{ required: true }]}><Select options={roomTypes.map(t => ({ value: t.id, label: t.name }))} /></Form.Item></Col>
            <Col span={12}><Form.Item name="startNumber" label="Từ phòng thứ" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="endNumber" label="Đến phòng thứ" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title={currentRoom ? `⚙️ Cấu hình: Phòng ${currentRoom.roomNumber || currentRoom.RoomNumber}` : '➕ Thêm phòng'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} width={950} onOk={() => basicForm.submit()} okText="Lưu thông tin" destroyOnClose>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane tab="🏠 Cơ bản" key="basic_info">
            <Form form={basicForm} layout="vertical" style={{padding: '20px 10px'}} onFinish={handleSaveBasicInfo}>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="roomNumber" label="Số phòng" rules={[{required: true}]}><Input/></Form.Item></Col>
                <Col span={8}><Form.Item name="floor" label="Tầng" rules={[{required: true}]}><InputNumber style={{width: '100%'}}/></Form.Item></Col>
                <Col span={8}><Form.Item name="roomTypeId" label="Hạng phòng"><Select options={roomTypes.map(t => ({ value: t.id, label: t.name }))} /></Form.Item></Col>
                <Col span={12}><Form.Item name="status" label="Trạng thái"><Select options={[{value:'Available', label:'Available'}, {value:'Occupied', label:'Occupied'}, {value:'Maintenance', label:'Maintenance'}]} /></Form.Item></Col>
                <Col span={12}><Form.Item name="cleaningStatus" label="Buồng phòng"><Select options={[{value:'Clean', label:'Sạch sẽ'}, {value:'Dirty', label:'Chưa dọn'}, {value:'Cleaning', label:'Đang dọn'}]} /></Form.Item></Col>
              </Row>
            </Form>
          </TabPane>
          <TabPane tab="📦 Quản lý vật tư" key="amenities" disabled={!currentRoom}>
            <div style={{ padding: '15px 0' }}>
              <Space style={{ marginBottom: 16 }}>
                <Button ghost type="primary" icon={<DatabaseOutlined />} onClick={handleSyncWarehouse}>Đồng bộ từ kho mẫu</Button>
                <Button style={{ color: '#13c2c2', borderColor: '#13c2c2' }} icon={<CopyOutlined />} onClick={() => setIsCloneModalOpen(true)}>Clone từ phòng khác</Button>
              </Space>
              <Card size="small" title="Thêm vật tư lẻ" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
                <Form form={inventoryForm} layout="inline" onFinish={handleAddInventory}>
                  <Form.Item name="equipmentId" rules={[{ required: true }]} style={{ width: 300 }}><Select showSearch placeholder="Chọn vật tư" filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} options={equipments.map(e => ({ value: e.id || e.Id, label: `[${e.itemCode || e.ItemCode}] ${e.name || e.Name} (Kho: ${e.inStockQuantity || e.InStockQuantity})` }))} /></Form.Item>
                  <Form.Item name="quantity" rules={[{ required: true }]}><InputNumber min={1} placeholder="SL" style={{width: 80}}/></Form.Item>
                  <Form.Item><Button type="primary" htmlType="submit" icon={<PlusOutlined />}>Thêm</Button></Form.Item>
                </Form>
              </Card>
              <Table dataSource={roomInventory} columns={inventoryColumns} rowKey={(r) => r.id || r.Id} pagination={{ pageSize: 5 }} size="small" bordered />
            </div>
          </TabPane>
        </Tabs>
      </Modal>

      <Drawer title="📋 Sao chép vật tư" placement="right" onClose={() => setIsCloneModalOpen(false)} open={isCloneModalOpen} width={400} footer={<div style={{ textAlign: 'right' }}><Button onClick={() => setIsCloneModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button><Button onClick={handleClone} type="primary" style={{ backgroundColor: '#13c2c2' }} >Bắt đầu sao chép</Button></div>}>
        <div style={{ padding: '10px 0' }}>
          <p>Chọn phòng có sẵn vật tư để copy sang phòng <Tag color="blue"><b>{currentRoom?.roomNumber || currentRoom?.RoomNumber}</b></Tag>:</p>
          <Select style={{ width: '100%', marginTop: '10px' }} placeholder="-- Chọn phòng mẫu --" showSearch filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} onChange={setCloneSourceRoomId}>
            {rooms.filter(r => (r.id || r.Id) !== (currentRoom?.id || currentRoom?.Id)).map(r => (<Select.Option key={r.id || r.Id} value={r.id || r.Id} label={`Phòng ${r.roomNumber || r.RoomNumber}`}>Phòng {r.roomNumber || r.RoomNumber} (Tầng {r.floor || r.Floor})</Select.Option>))}
          </Select>
        </div>
      </Drawer>
    </div>
  );
};

export default RoomManagementPage;