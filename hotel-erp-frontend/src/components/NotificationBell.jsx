import React, { useState, useEffect } from 'react';
import { Badge, Popover, List } from 'antd'; 
import { BellOutlined } from '@ant-design/icons'; 
import useSignalR from '../hooks/useSignalR'; 

const NotificationBell = () => {
  
    const connection = useSignalR('http://localhost:5057/notificationHub');
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (connection) {
            connection.on('ReceiveNotification', (message) => {
                console.log("🔔 TING TING:", message);
                setNotifications(prev => [message, ...prev]);
            });
        }
    }, [connection]);

    const popoverContent = (
        <div style={{ width: 300, maxHeight: 400, overflowY: 'auto' }}>
            <List
                size="small"
                dataSource={notifications}
                renderItem={(item) => <List.Item>{item}</List.Item>}
                locale={{ emptyText: 'Chưa có thông báo nào' }}
            />
        </div>
    );

    return (
        <Popover content={popoverContent} title="Thông báo hệ thống" trigger="click" placement="bottomRight">
            <Badge count={notifications.length} style={{ cursor: 'pointer' }}>
                <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#1890ff' }} />
            </Badge>
        </Popover>
    );
};

export default NotificationBell;