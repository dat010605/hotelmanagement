import { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const useSignalR = (hubUrl) => {
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        // 1. Khởi tạo cấu hình kết nối
        const newConnection = new HubConnectionBuilder()
            .withUrl(hubUrl, {
                // Đính kèm Token để Backend biết ai đang kết nối (nếu cần phân quyền thông báo)
                accessTokenFactory: () => localStorage.getItem('token') 
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect() // Tự động kết nối lại nếu rớt mạng
            .build();

        setConnection(newConnection);
    }, [hubUrl]);

    useEffect(() => {
        // 2. Bắt đầu kết nối khi object connection được tạo
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('⚡ Đã kết nối thành công với SignalR Hub!');
                })
                .catch(e => {
                    console.error('❌ Lỗi kết nối SignalR: ', e);
                });

            // Cleanup: Ngắt kết nối khi chuyển trang hoặc tắt Component
            return () => {
                connection.stop();
            };
        }
    }, [connection]);

    // Trả về đối tượng connection để các Component khác dùng (lắng nghe sự kiện)
    return connection;
};

export default useSignalR;