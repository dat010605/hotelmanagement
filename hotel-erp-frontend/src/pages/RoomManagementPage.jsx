import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, message, 
  Tag, Space, Card, InputNumber, Tabs, Popconfirm, Row, Col, Drawer, Typography, Upload 
} from 'antd';
import { 
  SearchOutlined, EditOutlined, PlusOutlined, 
  DeleteOutlined, DatabaseOutlined, CopyOutlined, CheckSquareOutlined, 
  AppstoreAddOutlined, UploadOutlined, WarningOutlined 
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;
const { Text, Title } = Typography; 

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

  const [isVillaForm, setIsVillaForm] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [roomRes, eqRes] = await Promise.all([
        axiosClient.get('/Rooms'),
        axiosClient.get('/Equipments')
      ]);

      const rawData = roomRes.data.sort((a, b) => {
        const floorA = a.floor || a.Floor || 0;
        const floorB = b.floor || b.Floor || 0;
        if (floorA !== floorB) return floorA - floorB;
        const numA = String(a.roomNumber || a.RoomNumber || "");
        const numB = String(b.roomNumber || b.RoomNumber || "");
        return numA.localeCompare(numB, undefined, { numeric: true });
      });

      // 🌟 MA PHÁP CHUYỂN ĐỔI DATA THÀNH CẤU TRÚC CÂY (PARENT-CHILD)
      const buildTree = (flatData) => {
        let tree = [];
        let lookup = {};
        
        flatData.forEach(item => {
          lookup[item.id || item.Id] = { ...item, children: [] };
        });

        flatData.forEach(item => {
          const parentId = item.parentRoomId || item.ParentRoomId;
          if (parentId && lookup[parentId]) {
            lookup[parentId].children.push(lookup[item.id || item.Id]);
          } else {
            tree.push(lookup[item.id || item.Id]);
          }
        });

        Object.values(lookup).forEach(item => {
          if (item.children.length === 0) delete item.children;
        });

        return tree;
      };

      const treeData = buildTree(rawData);

      // Lưu rawData vào state ẩn nếu cần dùng, nhưng hiển thị treeData
      setRooms(treeData);
      setFilteredRooms(treeData); 
      
      setEquipments(eqRes.data);

      setRoomTypes([
        { id: 1, name: 'Phòng tiêu chuẩn 1 giường đơn' },
        { id: 2, name: 'Phòng tiêu chuẩn 1 giường đôi' },
        { id: 3, name: 'Phòng cao cấp hướng phố' },
        { id: 4, name: 'Phòng Deluxe hướng biển' },
        { id: 5, name: 'Phòng Premium tiện nghi cao cấp' },
        { id: 6, name: ' Phòng Hoàng gia (Royal Suite)' },
        { id: 7, name: ' Phòng Tổng thống (Presidential)' },
        { id: 8, name: ' Villa nguyên căn' },
      ]);
    } catch (error) {
      message.error('Lỗi kết nối server!');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    let result = rooms;
    if (searchText) {
      // 🌟 Lọc tìm kiếm phẳng (phá vỡ cây tạm thời nếu tìm kiếm)
      const flattenData = (arr) => arr.reduce((acc, val) => acc.concat(val, val.children ? flattenData(val.children) : []), []);
      result = flattenData(rooms).filter(r => (r.roomNumber || r.RoomNumber)?.includes(searchText));
    }
    if (searchRoomType) {
      const flattenData = (arr) => arr.reduce((acc, val) => acc.concat(val, val.children ? flattenData(val.children) : []), []);
      result = flattenData(rooms).filter(r => Number(r.roomTypeId || r.RoomTypeId) === Number(searchRoomType));
    }
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
      setIsVillaForm(typeId === 8);
      basicForm.setFieldsValue({
        roomNumber: room.roomNumber || room.RoomNumber,
        floor: room.floor || room.Floor,
        roomTypeId: Number(typeId),
        status: room.status || room.Status,
        cleaningStatus: room.cleaningStatus || room.CleaningStatus || 'Clean',
        parentRoomId: room.parentRoomId || room.ParentRoomId // 🌟 LOAD THÔNG TIN CĂN MẸ
      });
      const roomId = room.id || room.Id;
      if(roomId) fetchRoomInventory(roomId);
    } else {
      setIsVillaForm(false);
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
        Floor: isVillaForm ? 0 : parseInt(values.floor || 1),
        RoomTypeId: parseInt(values.roomTypeId),
        Status: values.status,
        CleaningStatus: values.cleaningStatus,
        ParentRoomId: values.parentRoomId || null // 🌟 GỬI ID CĂN MẸ LÊN SERVER
      };

      if (currentId) {
        await axiosClient.put(`/Rooms/${currentId}`, payload);
        message.success('Cập nhật thông tin phòng thành công!');
      } else {
        const res = await axiosClient.post('/Rooms', payload);
        const newRoomId = res.data?.id || res.data?.Id; 
        if (newRoomId) {
          try { await axiosClient.post(`/Rooms/sync-from-warehouse/${newRoomId}`); } 
          catch (syncErr) { console.log('Lỗi đồng bộ:', syncErr); }
        }
        message.success('Đã tạo phòng và tự động thêm vật tư mẫu!');
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (error) { message.error('Kiểm tra lại thông tin (Định danh có thể bị trùng)!'); }
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
        const createAndSyncAction = axiosClient.post('/Rooms', payload)
          .then(async (res) => {
            const newRoomId = res.data?.id || res.data?.Id;
            if (newRoomId) await axiosClient.post(`/Rooms/sync-from-warehouse/${newRoomId}`);
            successCount++;
          }).catch((err) => console.log('Bỏ qua phòng lỗi/trùng:', finalRoomNumber));

        promises.push(createAndSyncAction);
      }
      await Promise.all(promises);
      message.success(`Đã tạo tự động cho ${successCount} phòng mới!`);
      setIsBulkModalOpen(false);
      bulkForm.resetFields();
      fetchInitialData(); 
    } catch (error) {} finally { setLoading(false); }
  };

  const handleCheckOut = async (roomId) => {
    try {
      // Vì data giờ là Tree, cần flatten để tìm room
      const flattenData = (arr) => arr.reduce((acc, val) => acc.concat(val, val.children ? flattenData(val.children) : []), []);
      const allFlatRooms = flattenData(rooms);
      
      const targetRoom = allFlatRooms.find(r => (r.id || r.Id) === roomId);
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

  // =======================================================
  // 🌟 ĐÂY CHÍNH LÀ HÀM BÁO HỎNG ĐÃ CẬP NHẬT THEO YÊU CẦU 🌟
  // =======================================================
  const handleReportDamage = (room) => {
    const currentStatus = room.status || room.Status;
    // Kiểm tra xem phòng có khách hay không (chỉ phòng Occupied mới được báo hỏng)
    if (currentStatus !== 'Occupied') {
      // Đã sửa text theo đúng yêu cầu của bạn!
      message.warning("Phòng hiện tại không có khách, không thể báo hỏng");
      return;
    }
    
    // Nếu có khách, sẽ mở module thất thoát (giả lập chuyển hướng hoặc mở modal tùy ý bạn)
    message.info("Đang chuyển đến module Thất thoát & Đền bù...");
    // Nếu bạn muốn nó tự động nhảy sang trang đền bù, hãy bỏ dấu // ở dòng dưới:
    // navigate(`/admin/loss-and-damages`); 
  };
  // =======================================================

  const handleUploadImage = async (options) => {
    const { file, onSuccess, onError } = options;
    const roomId = currentRoom?.id || currentRoom?.Id;
    if (!roomId) {
      message.error("Vui lòng lưu thông cơ bản trước khi tải ảnh lên!");
      onError("No Room ID"); return;
    }
    const formData = new FormData();
    formData.append("file", file); 
    try {
      const res = await axiosClient.post(`/Rooms/${roomId}/upload-image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newImageUrl = res.data?.imageUrl || res.data?.ImageUrl;
      setCurrentRoom(prev => ({ ...prev, roomImages: [{ imageUrl: newImageUrl }] }));
      message.success("Tải ảnh phòng lên mây thành công rực rỡ!");
      fetchInitialData(); 
      onSuccess("OK");
    } catch (err) { message.error("Lỗi khi tải ảnh lên!"); onError(err); }
  };

  const handleAddInventory = async (values) => {
    try {
      await axiosClient.post('/RoomInventory', { RoomId: currentRoom.id || currentRoom.Id, EquipmentId: values.equipmentId, Quantity: parseInt(values.quantity), Note: "Cấp phát từ kho" });
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
    } catch (error) {}
  };

  const handleDeleteAllInventory = async () => {
    try {
      await axiosClient.delete(`/RoomInventory/Room/${currentRoom.id || currentRoom.Id}`);
      message.success('Đã dọn sạch toàn bộ vật tư!');
      fetchInitialData(); fetchRoomInventory(currentRoom.id || currentRoom.Id);
    } catch (error) {}
  };

  const handleQuantityChange = async (inventoryId, newQuantity) => {
    setRoomInventory(roomInventory.map(item => item.id === inventoryId ? { ...item, quantity: newQuantity } : item));
    try { await axiosClient.put(`/RoomInventory/${inventoryId}/Quantity`, newQuantity, { headers: { 'Content-Type': 'application/json' } });
    } catch (error) { fetchRoomInventory(currentRoom.id || currentRoom.Id); }
  };

  const handleSyncWarehouse = async () => {
    try {
      await axiosClient.post(`/Rooms/sync-from-warehouse/${currentRoom.id || currentRoom.Id}`);
      message.success('Đã đồng bộ vật tư mẫu!');
      fetchInitialData(); fetchRoomInventory(currentRoom.id || currentRoom.Id);
    } catch (error) {}
  };

  const handleClone = async () => {
    if (!cloneSourceRoomId) return;
    try {
      await axiosClient.post(`/RoomInventory/Clone?sourceRoomId=${cloneSourceRoomId}&targetRoomId=${currentRoom.id || currentRoom.Id}`);
      message.success('Sao chép thành công!');
      setIsCloneModalOpen(false);
      fetchInitialData(); fetchRoomInventory(currentRoom.id || currentRoom.Id);
    } catch (error) {}
  };

  const roomListColumns = [
    { title: 'Định danh', width: 150, render: (_, r) => {
      const isVilla = (r.roomTypeId || r.RoomTypeId) === 8;
      const isSubRoom = r.parentRoomId != null || r.ParentRoomId != null;
      return <b>{isVilla ? 'Căn ' : (isSubRoom ? 'Phòng ' : 'Phòng ')}{r.roomNumber || r.RoomNumber}</b>;
    } },
    { title: 'Hạng phòng', render: (_, r) => <Text strong>{roomTypes.find(t => t.id === (r.roomTypeId || r.RoomTypeId))?.name}</Text> },
    { 
      title: 'Trạng thái', width: 130, align: 'center', 
      render: (_, r) => {
        const s = r.status || r.Status;
        if (s === 'Occupied') return <Tag color="red">Có khách</Tag>;
        if (s === 'Maintenance') return <Tag color="orange">Bảo trì</Tag>;
        return <Tag color="green">Sẵn sàng</Tag>;
      }
    },
    {
      title: 'Buồng phòng', width: 130, align: 'center',
      render: (_, r) => {
        const s = (r.cleaningStatus || r.cleaning_status || r.CleaningStatus || "").toLowerCase();
        if (s === 'dirty') return <Tag color="red">Chưa dọn</Tag>;
        if (s === 'cleaning') return <Tag color="blue">Đang dọn</Tag>;
        return <Tag color="green">Sạch sẽ</Tag>;
      }
    },
    {
      title: 'Thao tác', align: 'center', width: 360,
      render: (_, record) => {
        const cStatus = record.cleaningStatus || record.CleaningStatus || '';
        const isHousekeepingDisabled = !(cStatus === 'Dirty' || cStatus === 'Cleaning');
        return (
          <Space>
            <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => openModal(record)}>Cấu hình</Button>
            <Button size="small" danger onClick={() => handleCheckOut(record.id || record.Id)}>Trả phòng</Button>
            <Button size="small" style={isHousekeepingDisabled ? {} : { color: '#fa8c16', borderColor: '#fa8c16' }} icon={<CheckSquareOutlined />} disabled={isHousekeepingDisabled} onClick={() => navigate(`/admin/housekeeping/${record.id || record.Id}`)}>Dọn phòng</Button>
            {/* 🌟 NÚT BÁO HỎNG MỚI ĐƯỢC THÊM VÀO ĐÂY */}
            <Button size="small" danger ghost icon={<WarningOutlined />} onClick={() => handleReportDamage(record)}>Báo hỏng</Button>
          </Space>
        );
      },
    },
  ];

  const inventoryColumns = [
    { title: 'Tên vật tư', dataIndex: 'equipmentName', render: t => <b>{t}</b> },
    { title: 'SL', align: 'center', render: (_, r) => <InputNumber min={1} max={99} value={r.quantity} onChange={(v) => handleQuantityChange(r.id || r.Id, v)} style={{ width: '60px' }} /> },
    { title: 'Đền bù', dataIndex: 'priceIfLost', render: p => p?.toLocaleString() + ' đ' },
    { title: ( <Popconfirm title="Dọn sạch?" onConfirm={handleDeleteAllInventory} placement="left"> <Button danger type="primary" size="small">Xóa hết</Button> </Popconfirm> ), align: 'center', render: (_, r) => (
        <Popconfirm title="Xóa món này?" onConfirm={() => handleDeleteInventory(r.id || r.Id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
    )},
  ];

  const uniqueFloors = [...new Set(filteredRooms.map(r => (r.roomTypeId || r.RoomTypeId) === 8 ? 'Villa' : (r.floor || r.Floor)).filter(f => f != null))].sort((a, b) => {
    if (a === 'Villa') return 1;
    if (b === 'Villa') return -1;
    return a - b;
  });

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<span style={{fontSize: '20px', fontWeight: 'bold'}}>🏨 Quản lý Quỹ phòng (Phân theo Tầng)</span>}>
        <Row style={{ marginBottom: 20 }} justify="space-between" gutter={16}>
          <Col>
            <Space size="middle" wrap>
              <Input placeholder="Tìm số/tên..." prefix={<SearchOutlined />} style={{ width: 160 }} onChange={e => setSearchText(e.target.value)} allowClear />
              <Select placeholder="-- Lọc Hạng --" style={{ width: 200 }} allowClear onChange={v => setSearchRoomType(v)}>
                {roomTypes.map(t => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button type="primary" style={{ backgroundColor: '#52c41a' }} icon={<AppstoreAddOutlined />} onClick={() => { setIsBulkModalOpen(true); bulkForm.resetFields(); }}>Tạo nhiều</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Thêm lẻ</Button>
            </Space>
          </Col>
        </Row>

        <Tabs defaultActiveKey="all" type="card" size="large">
          <TabPane tab={<span style={{fontWeight: 'bold'}}>Tất cả</span>} key="all">
            <Table dataSource={filteredRooms} columns={roomListColumns} rowKey={(r) => r.id || r.Id} loading={loading} bordered size="middle" pagination={{ pageSize: 15 }} />
          </TabPane>
          {uniqueFloors.map(floor => (
            <TabPane tab={<span style={{fontWeight: 'bold', color: floor === 'Villa' ? '#52c41a' : '#1890ff'}}>{floor === 'Villa' ? ' Khu Villa' : `Tầng ${floor}`}</span>} key={String(floor)}>
              <Table dataSource={filteredRooms.filter(r => ((r.roomTypeId || r.RoomTypeId) === 8 ? 'Villa' : (r.floor || r.Floor)) === floor)} columns={roomListColumns} rowKey={(r) => r.id || r.Id} loading={loading} bordered size="middle" pagination={{ pageSize: 15 }} />
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <Modal title="🏗️ Tạo hàng loạt" open={isBulkModalOpen} onCancel={() => setIsBulkModalOpen(false)} onOk={handleBulkCreate} okText="Bắt đầu tạo" confirmLoading={loading}>
        <Form form={bulkForm} layout="vertical" initialValues={{ floor: 1, startNumber: 1, endNumber: 5, roomTypeId: 1 }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="floor" label="Tầng" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="roomTypeId" label="Hạng phòng" rules={[{ required: true }]}><Select options={roomTypes.map(t => ({ value: t.id, label: t.name }))} /></Form.Item></Col>
            <Col span={12}><Form.Item name="startNumber" label="Từ số" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="endNumber" label="Đến số" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title={currentRoom ? `⚙️ Cấu hình: ${isVillaForm ? 'Căn' : 'Phòng'} ${currentRoom.roomNumber || currentRoom.RoomNumber}` : '➕ Thêm mới'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} width={950} onOk={() => basicForm.submit()} okText="Lưu thông tin" destroyOnClose>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane tab="🏠 Cơ bản" key="basic_info">
            <Form form={basicForm} layout="vertical" style={{padding: '20px 10px'}} onFinish={handleSaveBasicInfo} onValuesChange={(c) => { if(c.roomTypeId !== undefined) setIsVillaForm(c.roomTypeId === 8); }}>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="roomNumber" label={isVillaForm ? "Số Căn/Tên" : "Định danh"} rules={[{required: true}]}><Input placeholder={isVillaForm ? "Vd: Villa VIP 1" : "101"}/></Form.Item></Col>
                <Col span={8}><Form.Item name="roomTypeId" label="Phân Loại"><Select options={roomTypes.map(t => ({ value: t.id, label: t.name }))} /></Form.Item></Col>
                
                {/* MA PHÁP GIAO DIỆN VILLA VÀ CHỌN CĂN MẸ  */}
                <Col span={8}>
                  {isVillaForm ? (
                     <Form.Item label="Quy mô"><Input disabled value="Nguyên Căn" style={{ color: '#52c41a', fontWeight: 'bold', backgroundColor: '#f6ffed' }} /></Form.Item>
                  ) : (
                    <Form.Item name="parentRoomId" label="Thuộc Căn (Dành cho phòng lẻ trong Villa)">
                      <Select allowClear placeholder="-- Chọn Villa Mẹ (Nếu có) --">
                        {/* Cần flatten tree để tìm lại các căn Villa làm options */}
                        {rooms.reduce((acc, val) => acc.concat(val, val.children || []), []).filter(r => (r.roomTypeId || r.RoomTypeId) === 8).map(villa => (
                          <Select.Option key={villa.id || villa.Id} value={villa.id || villa.Id}>
                            Căn {villa.roomNumber || villa.RoomNumber}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                </Col>

                {/* Nếu không phải Villa, và không chọn Căn mẹ, thì bắt buộc nhập Tầng */}
                <Col span={8}>
                   <Form.Item name="floor" label="Tầng (Bỏ qua nếu chọn Căn mẹ)">
                      <InputNumber style={{width: '100%'}} disabled={isVillaForm}/>
                   </Form.Item>
                </Col>

                <Col span={8}><Form.Item name="status" label="Trạng thái kinh doanh"><Select options={[{value:'Available', label:'Available'}, {value:'Occupied', label:'Occupied'}, {value:'Maintenance', label:'Maintenance'}]} /></Form.Item></Col>
                <Col span={8}><Form.Item name="cleaningStatus" label="Tình trạng dọn dẹp"><Select options={[{value:'Clean', label:'Sạch sẽ'}, {value:'Dirty', label:'Chưa dọn'}, {value:'Cleaning', label:'Đang dọn'}]} /></Form.Item></Col>
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
                  <Form.Item name="equipmentId" rules={[{ required: true }]} style={{ width: 250 }}><Select showSearch placeholder="Chọn vật tư" filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} options={equipments.map(e => ({ value: e.id || e.Id, label: `[${e.itemCode || e.ItemCode}] ${e.name || e.Name}` }))} /></Form.Item>
                  <Form.Item name="quantity" rules={[{ required: true }]}><InputNumber min={1} placeholder="SL" style={{width: 60}}/></Form.Item>
                  <Form.Item><Button type="primary" htmlType="submit" icon={<PlusOutlined />}>Thêm</Button></Form.Item>
                </Form>
              </Card>
              <Table dataSource={roomInventory} columns={inventoryColumns} rowKey={(r) => r.id || r.Id} pagination={{ pageSize: 5 }} size="small" bordered />
            </div>
          </TabPane>
          
          <TabPane tab="🖼️ Hình ảnh" key="images" disabled={!currentRoom}>
            <div style={{ padding: '15px 0', textAlign: 'center' }}>
              <Upload customRequest={handleUploadImage} showUploadList={false} accept="image/*">
                <Button type="primary" icon={<UploadOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 20 }}>
                  Tải ảnh {isVillaForm ? 'Căn' : 'Phòng'} lên hệ thống
                </Button>
              </Upload>
              {currentRoom?.roomImages && currentRoom.roomImages.length > 0 ? (
                <div style={{ marginTop: '20px' }}>
                  <Text strong style={{ display: 'block', marginBottom: 10 }}>Ảnh hiện tại:</Text>
                  <img src={currentRoom.roomImages[0].imageUrl} alt="Room" style={{ maxWidth: '80%', maxHeight: '350px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </div>
              ) : (
                <div style={{ marginTop: '30px', color: '#bfbfbf' }}><p>Chưa có hình ảnh nào.</p></div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Modal>

      <Drawer title="📋 Sao chép vật tư" placement="right" onClose={() => setIsCloneModalOpen(false)} open={isCloneModalOpen} width={400}>
        <div style={{ padding: '10px 0' }}>
          <p>Chọn phòng có sẵn vật tư để copy sang <Tag color="blue"><b>{currentRoom?.roomNumber || currentRoom?.RoomNumber}</b></Tag>:</p>
          <Select style={{ width: '100%', marginTop: '10px' }} placeholder="-- Chọn phòng mẫu --" showSearch filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} onChange={setCloneSourceRoomId}>
             {/* Flatten data để load hết các phòng vào options */}
             {rooms.reduce((acc, val) => acc.concat(val, val.children || []), []).filter(r => (r.id || r.Id) !== (currentRoom?.id || currentRoom?.Id)).map(r => (<Select.Option key={r.id || r.Id} value={r.id || r.Id} label={`Phòng ${r.roomNumber || r.RoomNumber}`}>Phòng {r.roomNumber || r.RoomNumber}</Select.Option>))}
          </Select>
          <Button onClick={handleClone} type="primary" style={{ backgroundColor: '#13c2c2', marginTop: 20, width: '100%' }} >Bắt đầu sao chép</Button>
        </div>
      </Drawer>
    </div>
  );
};

export default RoomManagementPage;