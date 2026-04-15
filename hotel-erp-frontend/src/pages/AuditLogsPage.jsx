import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, Space, Card, Modal, Button, Row, Col, Select, DatePicker, Descriptions } from 'antd';
import { UserOutlined, FileExcelOutlined, CloudDownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;
const { Option } = Select;

const AuditLogsPage = () => {
    const [groupedLogs, setGroupedLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 }); // Lấy nhiều hơn để gom nhóm cho đẹp
    
    // State cho Modal JSON 
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [modalTitle, setModalTitle] = useState('');

    //  THUẬT TOÁN GOM NHÓM DỮ LIỆU
    const groupLogs = (flatLogs) => {
        const grouped = {};
        flatLogs.forEach(log => {
            const rawDateStr = log.createdAt.endsWith('Z') ? log.createdAt : `${log.createdAt}Z`;
            const dateObj = new Date(rawDateStr);
            const dateStr = dateObj.toLocaleDateString('vi-VN');
            const timeStr = dateObj.toLocaleTimeString('vi-VN');
            // Gom nhóm theo Ngày + Tên nhân viên
            const key = `${dateStr}_${log.userFullName || 'System'}`;

            if (!grouped[key]) {
                grouped[key] = {
                    key: key,
                    date: dateStr,
                    employeeName: log.userFullName || 'Hệ thống',
                    role: 'Admin', // Mặc định hiển thị, có thể lấy từ API nếu có
                    events: []
                };
            }

            // Đổi tên Hành động 
            let actionName = 'UPDATE';
            if (log.action === 'Added') actionName = 'CREATE';
            if (log.action === 'Deleted') actionName = 'DELETE';

            grouped[key].events.push({
                key: log.id || Math.random(),
                time: timeStr,
                action: actionName,
                target: log.tableName,
                content: `Tác động lên bản ghi ID: ${log.recordId}`,
                oldValue: log.oldValue,
                newValue: log.newValue
            });
        });

        // Tạo dòng tóm tắt "(và X sự kiện khác)"
        return Object.values(grouped).map(g => {
            if (g.events.length > 0) {
                const first = g.events[0];
                const actionText = first.action === 'CREATE' ? 'Thêm mới' : first.action === 'UPDATE' ? 'Cập nhật' : 'Xóa';
                g.summary = `${actionText} dữ liệu ở bảng ${first.target}. (và ${g.events.length - 1} sự kiện khác)`;
            }
            return g;
        });
    };

    const fetchLogs = async (page = 1, pageSize = 50) => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/AuditLogs?page=${page}&pageSize=${pageSize}`);
            // Gọi hàm gom nhóm dữ liệu trước khi set state
            const groupedData = groupLogs(response.data.data);
            setGroupedLogs(groupedData);
            
            setPagination({
                ...pagination,
                current: page,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

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
                title: 'Data (Cũ / Mới)',
                key: 'details',
                width: 150,
                render: (_, eventRecord) => (
                    <Space>
                        {eventRecord.oldValue && (
                            <Button size="small" onClick={() => showJsonModal('Dữ liệu cũ', eventRecord.oldValue)}>Cũ</Button>
                        )}
                        {eventRecord.newValue && (
                            <Button size="small" type="primary" onClick={() => showJsonModal('Dữ liệu mới', eventRecord.newValue)}>Mới</Button>
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

    return (
        <div style={{ padding: '24px' }}>
            <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>🕒 Nhật ký hoạt động</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<FileExcelOutlined />}>Xuất theo bộ lọc</Button>
                            <Button type="primary" icon={<CloudDownloadOutlined />}>Xuất toàn bộ (Server)</Button>
                        </Space>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 24, padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
                    <Col><Select placeholder="Lọc theo nhân viên" style={{ width: 200 }} allowClear><Option value="admin">Admin</Option></Select></Col>
                    <Col><DatePicker placeholder="Lọc theo ngày" style={{ width: 180 }} format="DD/MM/YYYY" /></Col>
                    <Col><Button icon={<ReloadOutlined />}>Bỏ lọc</Button></Col>
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