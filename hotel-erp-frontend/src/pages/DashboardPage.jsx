import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Row, Col, Typography, Segmented, Spin, Space, Tag, Tooltip, message, Result, Button, List, Avatar, Table } from 'antd';
import {
  DollarOutlined, HomeOutlined, CalendarOutlined, RiseOutlined,
  FallOutlined, TeamOutlined, CheckCircleOutlined, ToolOutlined,
  BarChartOutlined, ReloadOutlined, SmileOutlined, ClearOutlined,
  ArrowRightOutlined, HistoryOutlined, UserOutlined, LineChartOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

// ==========================================
// COMPONENT: Biểu đồ cột SVG thuần
// ==========================================
const BarChart = ({ data, labelKey, valueKey, color = '#4f6ef7', height = 280 }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Chưa có dữ liệu</div>;

  const maxVal = Math.max(...data.map(d => d[valueKey]), 1);
  const barWidth = Math.max(16, Math.min(40, (700 / data.length) - 8));
  const chartWidth = data.length * (barWidth + 8) + 60;
  const chartHeight = height - 40;

  const gridLines = 5;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) => Math.round(maxVal / gridLines * i));

  const formatMoney = (val) => {
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toString();
  };

  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
      <svg width={Math.max(chartWidth, 400)} height={height} style={{ display: 'block', margin: '0 auto' }}>
        {gridValues.map((val, i) => {
          const y = chartHeight - (val / maxVal) * (chartHeight - 30) - 5;
          return (
            <g key={`grid-${i}`}>
              <line x1="55" y1={y} x2={chartWidth} y2={y} stroke="#e8e8e8" strokeDasharray="4,4" />
              <text x="50" y={y + 4} textAnchor="end" fontSize="11" fill="#999">{formatMoney(val)}</text>
            </g>
          );
        })}

        {data.map((item, index) => {
          const barH = (item[valueKey] / maxVal) * (chartHeight - 30);
          const x = 60 + index * (barWidth + 8);
          const y = chartHeight - barH - 5;
          const isHovered = hoveredIndex === index;
          const barColor = isHovered ? '#1a3fd4' : color;
          const gradientId = `grad-${index}`;

          return (
            <g key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={barColor} stopOpacity="1" />
                  <stop offset="100%" stopColor={barColor} stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <rect
                x={x} y={y} width={barWidth} height={barH}
                fill={`url(#${gradientId})`}
                rx="4" ry="4"
                style={{ transition: 'all 0.2s ease', filter: isHovered ? 'brightness(1.1)' : 'none' }}
              />
              {isHovered && (
                <g>
                  <rect x={x - 15} y={y - 28} width={barWidth + 30} height={22} rx="6" fill="#333" opacity="0.9" />
                  <text x={x + barWidth / 2} y={y - 13} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">
                    {item[valueKey].toLocaleString()}{item[valueKey] > 1000 ? 'đ' : ' lượt'}
                  </text>
                </g>
              )}
              <text
                x={x + barWidth / 2} y={chartHeight + 15}
                textAnchor="middle" fontSize="10" fill="#666"
                transform={data.length > 10 ? `rotate(-35, ${x + barWidth / 2}, ${chartHeight + 15})` : ''}
              >
                {item[labelKey]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ==========================================
// COMPONENT: Thẻ thống kê KPI
// ==========================================
const StatCard = ({ icon, title, value, suffix = '', color, bgGradient, subText, subColor }) => (
  <Card
    style={{
      borderRadius: 16,
      border: 'none',
      background: bgGradient,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      position: 'relative',
    }}
    bodyStyle={{ padding: '24px 20px' }}
  >
    <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.08, fontSize: 100, color }}>
      {icon}
    </div>
    <Space direction="vertical" size={4} style={{ position: 'relative', zIndex: 1 }}>
      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Text>
      <Title level={3} style={{ margin: 0, color: '#fff', fontSize: 26 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}{suffix && <span style={{ fontSize: 14, marginLeft: 4 }}>{suffix}</span>}
      </Title>
      {subText && (
        <Tag color={subColor || 'green'} style={{ borderRadius: 12, fontSize: 12, marginTop: 4 }}>
          {subText}
        </Tag>
      )}
    </Space>
  </Card>
);

// ==========================================
// COMPONENT: Mini donut chart cho công suất phòng
// ==========================================
const DonutChart = ({ occupied, available, maintenance, total }) => {
  const size = 140;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const pctOccupied = total > 0 ? occupied / total : 0;
  const pctAvailable = total > 0 ? available / total : 0;
  const pctMaintenance = total > 0 ? maintenance / total : 0;

  const offset1 = 0;
  const offset2 = pctOccupied * circumference;
  const offset3 = (pctOccupied + pctAvailable) * circumference;

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f0f0f0" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ff4d4f" strokeWidth={strokeWidth}
          strokeDasharray={`${pctOccupied * circumference} ${circumference}`}
          strokeDashoffset={-offset1} strokeLinecap="round"
          style={{ transition: 'all 0.6s ease' }}
        />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#52c41a" strokeWidth={strokeWidth}
          strokeDasharray={`${pctAvailable * circumference} ${circumference}`}
          strokeDashoffset={-offset2} strokeLinecap="round"
          style={{ transition: 'all 0.6s ease' }}
        />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#faad14" strokeWidth={strokeWidth}
          strokeDasharray={`${pctMaintenance * circumference} ${circumference}`}
          strokeDashoffset={-offset3} strokeLinecap="round"
          style={{ transition: 'all 0.6s ease' }}
        />
      </svg>
      <div style={{ marginTop: -size / 2 - 20, marginBottom: size / 2 - 25, position: 'relative', zIndex: 1 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#333' }}>{total}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 11 }}>phòng</Text>
      </div>
      <Space size={16} style={{ marginTop: 12 }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#ff4d4f', marginRight: 4 }} />Có khách: {occupied}</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#52c41a', marginRight: 4 }} />Trống: {available}</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#faad14', marginRight: 4 }} />Bảo trì: {maintenance}</span>
      </Space>
    </div>
  );
};

// ==========================================
// TRANG CHÍNH: Dashboard
// ==========================================
const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [chartMode, setChartMode] = useState('day');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  const userRoleId = localStorage.getItem('userRole') || 'Guest';

  const getRoleName = (id) => {
    switch(id) {
      case '1': return 'Admin';
      case '2': return 'Manager';
      case '3': return 'Lễ tân';
      case '5': return 'Buồng phòng';
      default: return `Role ${id}`;
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axiosClient.get('/Reports/Dashboard/AdvancedSummary');
      setSummary(res.data);
    } catch (error) { console.error('Lỗi tải thống kê:', error); }
  };

  const fetchChartData = useCallback(async (mode) => {
    setChartLoading(true);
    try {
      let url = mode === 'day' ? '/Reports/RevenueByDay' : mode === 'week' ? '/Reports/RevenueByWeek' : '/Reports/RevenueByMonth2';
      const res = await axiosClient.get(url);
      setChartData(res.data);
    } catch (error) { console.error('Lỗi tải biểu đồ:', error); }
    finally { setChartLoading(false); }
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await axiosClient.get('/AuditLogs?top=100');
      let logData = [];
      if (Array.isArray(res.data)) logData = res.data;
      else if (res.data && Array.isArray(res.data.data)) logData = res.data.data;
      else if (res.data && Array.isArray(res.data.items)) logData = res.data.items;
      setAuditLogs(logData);
    } catch (error) { console.error('Lỗi log:', error); }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      // 🌟 SỬA ĐỔI: Gộp cả Role 1 (Admin) và Role 2 (Manager) tải chung toàn bộ dữ liệu 
      if (userRoleId === '1' || userRoleId === '2') {
        await Promise.all([fetchSummary(), fetchChartData('day'), fetchAuditLogs()]);
      } else if (['3', '5'].includes(userRoleId)) {
        await fetchSummary();
      }
      setLoading(false);
    };
    loadAll();
  }, [fetchChartData, userRoleId]);

  const activityData = useMemo(() => {
    const counts = { 'Thêm mới': 0, 'Cập nhật': 0, 'Xóa bỏ': 0, 'Khác': 0 };
    auditLogs.forEach(log => {
      const action = (log.action || '').toUpperCase();
      if (action.includes('CREATE') || action.includes('ADD') || action.includes('INSERT')) counts['Thêm mới']++;
      else if (action.includes('UPDATE') || action.includes('EDIT') || action.includes('MODIFY')) counts['Cập nhật']++;
      else if (action.includes('DELETE') || action.includes('REMOVE')) counts['Xóa bỏ']++;
      else counts['Khác']++;
    });
    return Object.keys(counts).map(key => ({ label: key, value: counts[key] }));
  }, [auditLogs]);

  const handleModeChange = (val) => {
    setChartMode(val);
    fetchChartData(val);
  };

  const getLabelKey = () => chartMode === 'day' ? 'date' : chartMode === 'week' ? 'week' : 'month';
  const getChartColor = () => chartMode === 'day' ? '#4f6ef7' : chartMode === 'week' ? '#13c2c2' : '#722ed1';

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Spin size="large" tip="Đang tải bảng điều khiển..." /></div>;
  }

  const s = summary || {};

  // ---------------------------------------------------------
  // VIEW 1: DÀNH CHO ADMIN VÀ MANAGER (ID = 1 HOẶC ID = 2)
  // ---------------------------------------------------------
  const renderAdminView = () => (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<DollarOutlined />} title="Doanh thu hôm nay" value={s.revenueToday || 0} suffix="đ" color="#4f6ef7" bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<BarChartOutlined />} title="Doanh thu tháng" value={s.revenueMonth || 0} suffix="đ" color="#00b4d8" bgGradient="linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)" subText={s.growthPercent > 0 ? `↑ ${s.growthPercent}% so với tháng trước` : s.growthPercent < 0 ? `↓ ${Math.abs(s.growthPercent)}% so với tháng trước` : 'Chưa có dữ liệu'} subColor={s.growthPercent >= 0 ? 'green' : 'red'} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<HomeOutlined />} title="Phòng đang sử dụng" value={`${s.occupiedRooms || 0}/${s.totalRooms || 0}`} color="#52c41a" bgGradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" subText={`${s.occupancyRate || 0}% đang sử dụng`} subColor="cyan" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<CalendarOutlined />} title="Đơn đang ở" value={s.checkedInToday || 0} suffix="đơn" color="#fa8c16" bgGradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" subText={`${s.completedBookings || 0} đã hoàn tất`} subColor="blue" />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={<Space><BarChartOutlined style={{ color: getChartColor() }} /><span>Biểu đồ Doanh thu</span></Space>} extra={<Segmented options={[{ label: '📅 Ngày', value: 'day' }, { label: '📆 Tuần', value: 'week' }, { label: '🗓️ Tháng', value: 'month' }]} value={chartMode} onChange={handleModeChange} />} style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            {chartLoading ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}><Spin /></div> : <BarChart data={chartData} labelKey={getLabelKey()} valueKey="amount" color={getChartColor()} />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<Space><HomeOutlined style={{ color: '#52c41a' }} /><span>Tình trạng Phòng</span></Space>} style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }} bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
            <DonutChart occupied={s.occupiedRooms || 0} available={s.availableRooms || 0} maintenance={s.maintenanceRooms || 0} total={s.totalRooms || 0} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <Card title={<Space><LineChartOutlined style={{ color: '#eb2f96' }}/><span>Thống kê hoạt động (Audit Logs)</span></Space>} style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
            <BarChart data={activityData} labelKey="label" valueKey="value" color="#eb2f96" height={280} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<Space><HistoryOutlined /><span>Nhật ký hệ thống mới nhất</span></Space>} style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }} bodyStyle={{ padding: '0 16px', overflowY: 'auto', maxHeight: 310 }}>
            <Table dataSource={auditLogs.slice(0, 5)} rowKey={(r) => r.id || r.Id || Math.random().toString()} pagination={false} size="small" columns={[
              { title: 'Nhân viên', dataIndex: 'userName', render: t => <Space><Avatar size="small" icon={<UserOutlined />} /> {t || 'System'}</Space> },
              { title: 'Hành động', dataIndex: 'action', render: (text) => {
                let color = 'blue';
                if(String(text).toUpperCase().includes('CREATE')) color = 'green';
                if(String(text).toUpperCase().includes('DELETE')) color = 'red';
                if(String(text).toUpperCase().includes('UPDATE')) color = 'orange';
                return <Tag color={color}>{text}</Tag>;
              } },
              { title: 'Thời gian', dataIndex: 'timestamp', render: t => t ? new Date(t).toLocaleString('vi-VN') : '' },
            ]} />
          </Card>
        </Col>
      </Row>
    </>
  );

  // ---------------------------------------------------------
  // VIEW 2: DÀNH CHO LỄ TÂN (ID = 3)
  // ---------------------------------------------------------
  const renderRoomManagementView = () => (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <StatCard icon={<HomeOutlined />} title="Phòng Trống Sẵn Sàng" value={s.availableRooms || 0} color="#52c41a" bgGradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard icon={<TeamOutlined />} title="Phòng Đang Có Khách" value={s.occupiedRooms || 0} color="#ff4d4f" bgGradient="linear-gradient(135deg, #ff0844 0%, #ffb199 100%)" />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard icon={<ToolOutlined />} title="Phòng Cần Dọn/Bảo Trì" value={s.maintenanceRooms || 0} color="#faad14" bgGradient="linear-gradient(135deg, #f6d365 0%, #fda085 100%)" />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title="Tỉ lệ Lấp đầy Phòng" style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
            <DonutChart occupied={s.occupiedRooms || 0} available={s.availableRooms || 0} maintenance={s.maintenanceRooms || 0} total={s.totalRooms || 0} />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Thao tác nhanh" style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
            <List
              itemLayout="horizontal"
              dataSource={[
                { title: 'Quản lý quỹ phòng', desc: 'Xem danh sách toàn bộ phòng và trạng thái buồng phòng', link: '/admin/rooms' },
                { title: 'Danh sách đặt phòng', desc: 'Kiểm tra thông tin khách chuẩn bị check-in hôm nay', link: '/admin/booking' }
              ]}
              renderItem={item => (
                <List.Item actions={[<Button type="primary" ghost href={item.link}>Đi tới <ArrowRightOutlined /></Button>]}>
                  <List.Item.Meta avatar={<Avatar icon={<CalendarOutlined />} style={{backgroundColor: '#1890ff'}}/>} title={item.title} description={item.desc} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );

  // ---------------------------------------------------------
  // VIEW 3: DÀNH CHO BUỒNG PHÒNG (ID = 5)
  // ---------------------------------------------------------
  const renderHousekeepingView = () => (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <StatCard icon={<ClearOutlined />} title="Phòng Đang Chờ Dọn Dẹp" value={s.maintenanceRooms || 0} color="#ff4d4f" bgGradient="linear-gradient(135deg, #ff0844 0%, #ffb199 100%)" subText="Vui lòng ưu tiên xử lý" subColor="red" />
        </Col>
        <Col xs={24} sm={12}>
          <StatCard icon={<CheckCircleOutlined />} title="Phòng Đã Sạch Sẽ" value={s.availableRooms || 0} color="#52c41a" bgGradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" subText="Sẵn sàng đón khách" subColor="green" />
        </Col>
      </Row>
      
      <Card style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <Result
          icon={<ClearOutlined style={{ color: '#1890ff' }} />}
          title="Chào mừng Bộ phận Buồng phòng"
          subTitle="Vui lòng nhấn nút bên dưới hoặc chuyển sang menu 'Dọn Phòng' ở thanh bên trái để xem danh sách chi tiết các phòng cần dọn dẹp và thực hiện thao tác chụp ảnh xác nhận."
          extra={<Button type="primary" size="large" href="/admin/housekeeping">Bắt đầu dọn phòng</Button>}
        />
      </Card>
    </>
  );

  // ---------------------------------------------------------
  // VIEW 4: CÁC ROLE KHÁC
  // ---------------------------------------------------------
  const renderDevelopingView = () => (
    <Card style={{ borderRadius: 16, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Result
        icon={<SmileOutlined />}
        title="Tính năng đang được phát triển"
        subTitle={`Xin chào! Dashboard báo cáo số liệu dành riêng cho vai trò hiện tại đang được cập nhật và sẽ sớm ra mắt.`}
      />
    </Card>
  );

  return (
    <div style={{ padding: '8px 16px', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            {/* 🌟 SỬA ĐỔI: Admin và Manager xài chung title Tổng quan Quản trị & Quản lý */}
            {(userRoleId === '1' || userRoleId === '2') ? '📊 Tổng quan Quản trị & Quản lý' : 
             userRoleId === '3' ? '🛎️ Tổng quan Lễ tân' :
             userRoleId === '5' ? '🧹 Bảng điều khiển Buồng phòng' : 'Bảng điều khiển'}
          </Title>
          <Text type="secondary">Xin chào, chúc bạn một ngày làm việc hiệu quả!</Text>
        </Col>
        <Col>
          <Space>
            <Tag color="blue" style={{ fontSize: 14, padding: '4px 10px', borderRadius: '4px' }}>Vai trò: {getRoleName(userRoleId)}</Tag>
            <Tooltip title="Làm mới dữ liệu">
              <ReloadOutlined
                style={{ fontSize: 20, cursor: 'pointer', color: '#1890ff', padding: 8, borderRadius: 8, background: 'rgba(24,144,255,0.06)' }}
                onClick={() => { 
                  if(userRoleId === '1' || userRoleId === '2') { fetchSummary(); fetchChartData(chartMode); fetchAuditLogs(); }
                  else if(['3', '5'].includes(userRoleId)) fetchSummary();
                  message.success('Đã làm mới!'); 
                }}
              />
            </Tooltip>
          </Space>
        </Col>
      </Row>

      {/* 🌟 SỬA ĐỔI: Gọi hàm renderAdminView cho cả Role 1 và Role 2 */}
      {(userRoleId === '1' || userRoleId === '2') && renderAdminView()}
      {userRoleId === '3' && renderRoomManagementView()}
      {userRoleId === '5' && renderHousekeepingView()}
      {!['1', '2', '3', '5'].includes(userRoleId) && renderDevelopingView()}

    </div>
  );
};

export default DashboardPage;