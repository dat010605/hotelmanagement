import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, Space, Card, Modal, Button, Descriptions } from 'antd';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const AuditLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [modalTitle, setModalTitle] = useState('');

    const fetchLogs = async (page = 1, pageSize = 15) => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/AuditLogs?page=${page}&pageSize=${pageSize}`);
            setLogs(response.data.data);
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
        // Mặc định url backend cho máy local development ASP.NET 
        // Hãy chú ý kiểm tra cổng nếu project chạy cổng khác.
        fetchLogs();
    }, []);

    const handleTableChange = (newPagination) => {
        fetchLogs(newPagination.current, newPagination.pageSize);
    };

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

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => new Date(text).toLocaleString('vi-VN'),
            width: 170
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            render: (action) => {
                let color = action === 'Added' ? 'green' : action === 'Modified' ? 'blue' : 'red';
                return <Tag color={color}>{action.toUpperCase()}</Tag>;
            },
            width: 100
        },
        {
            title: 'Bảng',
            dataIndex: 'tableName',
            key: 'tableName',
            width: 150
        },
        {
            title: 'Record ID',
            dataIndex: 'recordId',
            key: 'recordId',
            width: 100
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'userFullName',
            key: 'userFullName',
            width: 180
        },
        {
            title: 'Chi tiết thay đổi',
            key: 'details',
            render: (_, record) => (
                <Space>
                    {record.oldValue && (
                        <Button size="small" onClick={() => showJsonModal('Dữ liệu cũ', record.oldValue)}>
                            Cũ
                        </Button>
                    )}
                    {record.newValue && (
                        <Button size="small" type="primary" onClick={() => showJsonModal('Dữ liệu mới', record.newValue)}>
                            Mới
                        </Button>
                    )}
                </Space>
            ),
        }
    ];

    return (
        <Card title={<Title level={3}>Lịch sử hệ thống (Audit Logs)</Title>} bordered={false}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Hiển thị toàn bộ lịch sử thao tác thêm, sửa, xóa trên hệ thống. Dữ liệu được bảo lưu 30 ngày.
            </Text>
            <Table 
                columns={columns} 
                dataSource={logs} 
                rowKey="id" 
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                size="middle"
                bordered
            />

            <Modal 
                title={modalTitle} 
                open={isModalVisible} 
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>Đóng</Button>
                ]}
                width={700}
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
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                {selectedData?.raw || 'Không có dữ liệu'}
                            </pre>
                        </div>
                    )}
                </div>
            </Modal>
        </Card>
    );
};

export default AuditLogsPage;
