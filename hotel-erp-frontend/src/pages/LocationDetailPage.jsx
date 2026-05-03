import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LocationDetailPage = () => {
    const { id } = useParams(); // Lấy ID từ thanh địa chỉ trình duyệt
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        // Gọi API lấy chi tiết dựa trên ID đã cung cấp trong Model Attraction
        axios.get(`https://localhost:5057/api/Attractions/${id}`)
            .then(res => setDetail(res.data))
            .catch(err => console.error("Lỗi tải chi tiết:", err));
    }, [id]);

    if (!detail) return <div>Đang tải thông tin...</div>;

    return (
        <div className="detail-container" style={{ padding: '50px' }}>
            <button onClick={() => navigate(-1)}>← Quay lại</button>
            <h1>{detail.name}</h1>
            <p><strong>Địa chỉ:</strong> {detail.address}</p>
            <p><strong>Khoảng cách:</strong> {detail.distanceKm} km</p>
            <div className="content">
                <p>{detail.description}</p>
            </div>
            {/* Nhúng bản đồ nếu có link */}
            {detail.mapEmbedLink && (
                <div className="map-view" dangerouslySetInnerHTML={{ __html: detail.mapEmbedLink }} />
            )}
        </div>
    );
};

export default LocationDetailPage;