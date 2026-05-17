import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, Space, Card, Modal, Button, Row, Col, Select, DatePicker, Descriptions, message } from 'antd';
import { UserOutlined, FileExcelOutlined, CloudDownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;
const { Option } = Select;

// ======================================================
// HELPER: Dịch tên bảng sang tiếng Việt
// ======================================================
const TABLE_NAME_MAP = {
    'Bookings': 'Đơn đặt phòng',
    'Booking_Details': 'Chi tiết đặt phòng',
    'Rooms': 'Phòng',
    'Room_Types': 'Loại phòng',
    'Room_Images': 'Ảnh phòng',
    'Room_Inventory': 'Vật tư phòng',
    'Users': 'Người dùng',
    'Invoices': 'Hóa đơn',
    'Payments': 'Thanh toán',
    'Services': 'Dịch vụ',
    'Order_Services': 'Đơn dịch vụ',
    'Order_Service_Details': 'Chi tiết đơn DV',
    'Vouchers': 'Mã giảm giá',
    'Equipments': 'Vật tư',
    'Loss_And_Damages': 'Hư hỏng / Mất mát',
    'Role_Permissions': 'Phân quyền',
    'Notifications': 'Thông báo',
    'Attractions': 'Địa điểm',
};

const ACTION_MAP = {
    'Added': { text: 'Thêm mới', color: '#52c41a' },
    'Modified': { text: 'Cập nhật', color: '#1890ff' },
    'Deleted': { text: 'Xóa', color: '#ff4d4f' },
};

// ======================================================
// HELPER: Tạo tóm tắt thông minh từ dữ liệu audit
// ======================================================
const parseLogSummary = (record) => {
    try {
        const actionInfo = ACTION_MAP[record.action] || { text: record.action || '?', color: '#666' };
        const tableName = TABLE_NAME_MAP[record.tableName] || record.tableName || 'Dữ liệu';

        // Trường hợp UPDATE — so sánh old vs new
        if (record.action === 'Modified' && record.oldValue && record.newValue) {
            const oldObj = JSON.parse(record.oldValue);
            const newObj = JSON.parse(record.newValue);

            // Tìm các field thay đổi
            const changes = [];
            for (const key of Object.keys(newObj)) {
                if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
                    changes.push(key);
                }
            }

            // Trường hợp đặc biệt: thay đổi Status
            if (changes.includes('Status') || changes.includes('status')) {
                const oldStatus = oldObj.Status || oldObj.status || '?';
                const newStatus = newObj.Status || newObj.status || '?';
                return `Thay đổi trạng thái ${tableName} từ "${oldStatus}" sang "${newStatus}"`;
            }
            if (changes.includes('CleaningStatus') || changes.includes('cleaning_status')) {
                const oldCS = oldObj.CleaningStatus || oldObj.cleaning_status || '?';
                const newCS = newObj.CleaningStatus || newObj.cleaning_status || '?';
                return `Thay đổi tình trạng dọn phòng từ "${oldCS}" sang "${newCS}"`;
            }

            if (changes.length > 0 && changes.length <= 3) {
                return `${actionInfo.text} ${tableName}: ${changes.join(', ')}`;
            }
            return `${actionInfo.text} ${tableName} (${changes.length} trường)`;
        }

        // Trường hợp CREATE
        if (record.action === 'Added' && record.newValue) {
            const obj = JSON.parse(record.newValue);
            const name = obj.GuestName || obj.Name || obj.BookingCode || obj.Code || obj.RoomNumber || '';
            return name ? `${actionInfo.text} ${tableName}: "${name}"` : `${actionInfo.text} ${tableName}`;
        }

        // Trường hợp DELETE
        if (record.action === 'Deleted' && record.oldValue) {
            const obj = JSON.parse(record.oldValue);
            const name = obj.GuestName || obj.Name || obj.BookingCode || obj.Code || obj.RoomNumber || '';
            return name ? `${actionInfo.text} ${tableName}: "${name}"` : `${actionInfo.text} ${tableName}`;
        }

        return `${actionInfo.text} ${tableName}`;
    } catch (e) {
        return `${record.action || 'Hoạt động'} trên ${TABLE_NAME_MAP[record.tableName] || record.tableName || 'hệ thống'}`;
    }
};

const AuditLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });
    
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [modalTitle, setModalTitle] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await axiosClient.get('/Users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const fetchLogs = async (page = 1, pageSize = 50, userId = null, date = null) => {
        setLoading(true);
        try {
            const filterUserId = userId !== null ? userId : selectedUserId;
            const filterDate = date !== null ? date : selectedDate;

            let url = `/AuditLogs?page=${page}&pageSize=${pageSize}`;
            if (filterUserId) url += `&userId=${filterUserId}`;
            if (filterDate) url += `&date=${filterDate.format('YYYY-MM-DD')}`;

            const response = await axiosClient.get(url);
            const rawData = response.data.data || [];

            // Map dữ liệu từ schema mới
            const mapped = rawData.map(log => ({
                key: log.id,
                id: log.id,
                action: log.action,
                tableName: log.tableName,
                recordId: log.recordId,
                oldValue: log.oldValue,
                newValue: log.newValue,
                createdAt: log.createdAt,
                employeeName: log.userFullName || 'Hệ thống',
                summary: parseLogSummary(log),
            }));

            setLogs(mapped);
            setPagination(prev => ({ ...prev, current: page, total: response.data.total || 0 }));
        } catch (error) {
            console.error('Error fetching audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchLogs(1, 50, null, null);
    }, []);

    const handleFilterChange = () => fetchLogs(1, pagination.pageSize, selectedUserId, selectedDate);
    const resetFilters = () => { setSelectedUserId(null); setSelectedDate(null); fetchLogs(1, pagination.pageSize, null, null); };
    const handleTableChange = (newPagination) => fetchLogs(newPagination.current, newPagination.pageSize);

    // ── Modal hiển thị JSON đẹp ──
    const showJsonModal = (title, dataStr) => {
        let parsedObj = null;
        let formattedStr = dataStr;
        try {
            if (dataStr) {
                const temp = JSON.parse(dataStr);
                if (typeof temp === 'object' && temp !== null && !Array.isArray(temp)) parsedObj = temp;
                formattedStr = JSON.stringify(temp, null, 2);
            }
        } catch(e) {}
        setModalTitle(title);
        setSelectedData({ raw: formattedStr, parsed: parsedObj });
        setIsModalVisible(true);
    };

    // ── Format thời gian ──
    const formatTime = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const d = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
            return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch { return dateStr; }
    };

    // ==========================================
    // CỘT BẢNG CHÍNH
    // ==========================================
    const columns = [
        { 
            title: 'Thời gian', dataIndex: 'createdAt', width: 170,
            render: (val) => <Text>{formatTime(val)}</Text>
        },
        { 
            title: 'Nhân viên', width: 200,
            render: (_, record) => (
                <Space>
                    <UserOutlined style={{ color: '#8c8c8c' }} />
                    <Text strong>{record.employeeName}</Text>
                </Space>
            )
        },
        {
            title: 'Hành động', dataIndex: 'action', width: 120, align: 'center',
            render: (action) => {
                const info = ACTION_MAP[action] || { text: action, color: '#666' };
                return <Tag color={info.color} style={{ fontWeight: 600 }}>{info.text}</Tag>;
            }
        },
        {
            title: 'Đối tượng', dataIndex: 'tableName', width: 180,
            render: (name) => <Tag>{TABLE_NAME_MAP[name] || name}</Tag>
        },
        {
            title: 'Tóm tắt hoạt động', dataIndex: 'summary',
            render: (text) => <Text style={{ color: '#333' }}>{text}</Text>
        },
        {
            title: 'Chi tiết', key: 'details', width: 200, align: 'center',
            render: (_, record) => (
                <Space>
                    {record.oldValue && (
                        <Button size="small" onClick={() => showJsonModal('Giá trị CŨ', record.oldValue)}>
                            Trước
                        </Button>
                    )}
                    {record.newValue && (
                        <Button size="small" type="primary" onClick={() => showJsonModal('Giá trị MỚI', record.newValue)}>
                            Sau
                        </Button>
                    )}
                </Space>
            )
        },
    ];

    // ==========================================
    // HÀM TẢI FILE EXCEL
    // ==========================================
    const handleDownloadAuditLog = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5057/api/Export/audit-log`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Tải file thất bại!');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'AuditLog.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            message.success('Đã tải xong nhật ký hoạt động!');
        } catch (err) {
            message.error(err.message);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>🕒 Nhật ký hoạt động</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<FileExcelOutlined />} onClick={handleDownloadAuditLog}>
                                Xuất theo bộ lọc
                            </Button>
                            <Button type="primary" icon={<CloudDownloadOutlined />} onClick={handleDownloadAuditLog}>
                                Xuất toàn bộ (Server)
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 24, padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
                    <Col>
                        <Select 
                            placeholder="Lọc theo nhân viên" style={{ width: 250 }} allowClear
                            value={selectedUserId} onChange={(val) => setSelectedUserId(val)}
                        >
                            {users.map(u => (
                                <Option key={u.id} value={u.id}>{u.fullName} ({u.role})</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col>
                        <DatePicker 
                            placeholder="Lọc theo ngày" style={{ width: 180 }} format="DD/MM/YYYY"
                            value={selectedDate} onChange={(val) => setSelectedDate(val)}
                        />
                    </Col>
                    <Col>
                        <Space>
                            <Button type="primary" icon={<ReloadOutlined />} onClick={handleFilterChange}>Tìm kiếm</Button>
                            <Button icon={<ReloadOutlined />} onClick={resetFilters}>Bỏ lọc / Làm mới</Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="key"
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                    size="middle"
                />

                {/* MODAL VIEW JSON */}
                <Modal 
                    title={modalTitle} open={isModalVisible} onCancel={() => setIsModalVisible(false)}
                    footer={[<Button key="close" onClick={() => setIsModalVisible(false)}>Đóng</Button>]} width={700}
                >
                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {selectedData?.parsed ? (
                            <Descriptions bordered column={1} size="small" labelStyle={{ width: '180px', fontWeight: 'bold', background: '#fafafa' }}>
                                {Object.entries(selectedData.parsed).map(([key, value]) => (
                                    <Descriptions.Item label={key} key={key}>
                                        {value === null ? <Text type="secondary">null</Text> : 
                                         typeof value === 'boolean' ? <Tag color={value ? 'green' : 'red'}>{value ? 'true' : 'false'}</Tag> : 
                                         typeof value === 'object' ? <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(value, null, 2)}</pre> :
                                         String(value)}
                                    </Descriptions.Item>
                                ))}
                            </Descriptions>
                        ) : (
                            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{selectedData?.raw || 'Không có dữ liệu'}</pre>
                            </div>
                        )}
                    </div>
                </Modal>
            </Card>
        </div>
    );
};

export default AuditLogsPage;