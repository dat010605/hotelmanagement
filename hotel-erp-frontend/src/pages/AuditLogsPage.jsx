import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, Space, Card, Modal, Button, Row, Col, Select, DatePicker, Descriptions } from 'antd';
import { UserOutlined, FileExcelOutlined, CloudDownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;
const { Option } = Select;

const AuditLogsPage = () => {
    const [groupedLogs, setGroupedLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });
    
    // State cho bộ lọc
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    // State cho Modal JSON 
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [modalTitle, setModalTitle] = useState('');

    //  THUẬT TOÁN GOM NHÓM DỮ LIỆU
    const groupLogs = (flatLogs) => {
        // Với schema mới, 1 log đã là 1 nhóm (1 ngày/1 user). 
        // Chúng ta chỉ cần format lại để hiển thị đúng cấu trúc cũ của frontend.
        return flatLogs.map(log => {
            const rawDateStr = log.logDate
                ? (log.logDate.endsWith('Z') ? log.logDate : `${log.logDate}Z`)
                : new Date().toISOString();
            const dateObj = new Date(rawDateStr);
            const dateStr = dateObj.toLocaleDateString('vi-VN');
            const timeStr = dateObj.toLocaleTimeString('vi-VN');

            let events = [];
            let summary = "Không có dữ liệu sự kiện";

            if (log.logData) {
                try {
                    const parsedData = JSON.parse(log.logData);
                    const rawEvents = parsedData.Events || [];
                    
                    events = rawEvents.map(ev => ({
                        key: ev.eventId || Math.random(),
                        time: ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('vi-VN') : timeStr,
                        action: ev.actionType,
                        target: ev.tableName,
                        content: `Tác động lên bảng ${ev.tableName}`,
                        logData: JSON.stringify(ev.entity) // Pass the specific entity snapshot to modal
                    }));

                    if (events.length > 0) {
                        const first = events[0];
                        const actionText = first.action === 'CREATE' ? 'Thêm mới' : first.action === 'UPDATE' ? 'Cập nhật' : 'Xóa';
                        summary = `${actionText} dữ liệu ở bảng ${first.target}. (và ${events.length - 1} sự kiện khác)`;
                    }
                } catch (e) {
                    console.error("Error parsing logData", e);
                }
            }

            return {
                key: log.id,
                date: dateStr,
                employeeName: log.userFullName || 'Hệ thống',
                role: log.roleName || 'Unknown',
                events: events,
                summary: summary
            };
        });
    };

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
            // Sử dụng tham số truyền vào, nếu null thì lấy từ state
            const filterUserId = userId !== null ? userId : selectedUserId;
            const filterDate = date !== null ? date : selectedDate;

            let url = `/AuditLogs?page=${page}&pageSize=${pageSize}`;
            if (filterUserId) url += `&userId=${filterUserId}`;
            if (filterDate) url += `&date=${filterDate.format('YYYY-MM-DD')}`;

            const response = await axiosClient.get(url);
            const groupedData = groupLogs(response.data.data || []);
            setGroupedLogs(groupedData);
            
            setPagination({
                ...pagination,
                current: page,
                total: response.data.total || 0
            });
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

    const handleFilterChange = () => {
        // Truyền giá trị từ state vào một cách tường minh
        fetchLogs(1, pagination.pageSize, selectedUserId, selectedDate);
    };

    const resetFilters = () => {
        setSelectedUserId(null);
        setSelectedDate(null);
        fetchLogs(1, pagination.pageSize, null, null);
    };

    const handleTableChange = (newPagination) => {
        fetchLogs(newPagination.current, newPagination.pageSize);
    };

    //  GIỮ NGUYÊN HÀM HIỂN THỊ JSON CỦA NGÀI
    const showJsonModal = (title, dataStr) => {
        let parsedObj = null;
        let formattedStr = dataStr;
        try {
            if (dataStr) {
                const temp = JSON.parse(dataStr);
                if (typeof temp === 'object' && temp !== null && !Array.isArray(temp)) {
                    parsedObj = temp;
                }
                formattedStr = JSON.stringify(temp, null, 2);
            }
        } catch(e) {}

        setModalTitle(title);
        setSelectedData({ raw: formattedStr, parsed: parsedObj });
        setIsModalVisible(true);
    };

    // ==========================================
    // BẢNG CON (CHI TIẾT KHI BẤM DẤU +)
    // ==========================================
    const expandedRowRender = (record) => {
        const nestedColumns = [
            { title: 'Giờ', dataIndex: 'time', key: 'time', width: 100 },
            { 
                title: 'Hành động', 
                dataIndex: 'action', 
                width: 120,
                render: (action) => {
                    let color = '#1890ff'; // Xanh cho UPDATE
                    if (action === 'CREATE') color = '#d4b106'; // Vàng
                    if (action === 'DELETE') color = '#faad14'; // Cam
                    return <Text style={{ color: color, fontWeight: 'bold' }}>{action}</Text>;
                }
            },
            { title: 'Đối tượng', dataIndex: 'target', width: 150 },
            { title: 'Nội dung', dataIndex: 'content' },
            {
                title: 'Chi tiết dữ liệu',
                key: 'details',
                width: 150,
                render: (_, eventRecord) => (
                    <Space>
                        {eventRecord.logData && (
                            <Button size="small" type="primary" onClick={() => showJsonModal('Chi tiết thay đổi', eventRecord.logData)}>Xem chi tiết</Button>
                        )}
                    </Space>
                )
            }
        ];

        return (
            <Table 
                columns={nestedColumns} 
                dataSource={record.events} 
                pagination={false} 
                rowKey="key" 
                size="small" 
                style={{ margin: '0 0 16px 50px', borderLeft: '3px solid #1890ff' }} 
            />
        );
    };

    // ==========================================
    // BẢNG CHA (GIAO DIỆN CHÍNH)
    // ==========================================
    const columns = [
        { title: 'Ngày', dataIndex: 'date', width: 150 },
        { 
            title: 'Nhân viên', 
            width: 250,
            render: (_, record) => (
                <Space>
                    <UserOutlined style={{ color: '#8c8c8c' }} />
                    <Text strong>{record.employeeName}</Text>
                    <Text type="secondary" style={{ fontSize: '12px', color: '#1890ff' }}>{record.role}</Text>
                </Space>
            )
        },
        { title: 'Tóm tắt hoạt động', dataIndex: 'summary' },
    ];

    // ==========================================
    // HÀM TẢI FILE EXCEL TỪ SERVER
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
                            <Button 
                                icon={<FileExcelOutlined />}
                                onClick={handleDownloadAuditLog}
                            >
                                Xuất theo bộ lọc
                            </Button>
                            <Button 
                                type="primary" 
                                icon={<CloudDownloadOutlined />}
                                onClick={handleDownloadAuditLog}
                            >
                                Xuất toàn bộ (Server)
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 24, padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
                    <Col>
                        <Select 
                            placeholder="Lọc theo nhân viên" 
                            style={{ width: 250 }} 
                            allowClear
                            value={selectedUserId}
                            onChange={(val) => { setSelectedUserId(val); }}
                        >
                            {users.map(u => (
                                <Option key={u.id} value={u.id}>
                                    {u.fullName} ({u.role})
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col>
                        <DatePicker 
                            placeholder="Lọc theo ngày" 
                            style={{ width: 180 }} 
                            format="DD/MM/YYYY" 
                            value={selectedDate}
                            onChange={(val) => { setSelectedDate(val); }}
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
                    expandable={{ expandedRowRender, rowExpandable: (record) => record.events.length > 0 }}
                    dataSource={groupedLogs}
                    rowKey="key"
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
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