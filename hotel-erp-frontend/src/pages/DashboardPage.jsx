import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Row, Col, Typography, Segmented, Spin, Space, Tag, Tooltip, message } from 'antd';
import {
  DollarOutlined, HomeOutlined, CalendarOutlined, RiseOutlined,
  FallOutlined, TeamOutlined, CheckCircleOutlined, ToolOutlined,
  BarChartOutlined, ReloadOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

// ==========================================
// COMPONENT: Biểu đồ cột SVG thuần (không cần thư viện)
// ==========================================
const BarChart = ({ data, labelKey, valueKey, color = '#4f6ef7', height = 280 }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Chưa có dữ liệu</div>;

  const maxVal = Math.max(...data.map(d => d[valueKey]), 1);
  const barWidth = Math.max(16, Math.min(40, (700 / data.length) - 8));
  const chartWidth = data.length * (barWidth + 8) + 60;
  const chartHeight = height - 40;

  // Gridlines
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
        {/* Grid lines */}
        {gridValues.map((val, i) => {
          const y = chartHeight - (val / maxVal) * (chartHeight - 30) - 5;
          return (
            <g key={`grid-${i}`}>
              <line x1="55" y1={y} x2={chartWidth} y2={y} stroke="#e8e8e8" strokeDasharray="4,4" />
              <text x="50" y={y + 4} textAnchor="end" fontSize="11" fill="#999">{formatMoney(val)}</text>
            </g>
          );
        })}

        {/* Bars */}
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
              {/* Value on hover */}
              {isHovered && (
                <g>
                  <rect x={x - 15} y={y - 28} width={barWidth + 30} height={22} rx="6" fill="#333" opacity="0.9" />
                  <text x={x + barWidth / 2} y={y - 13} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">
                    {item[valueKey].toLocaleString()}đ
                  </text>
                </g>
              )}
              {/* Label */}
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
        {/* Occupied */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ff4d4f" strokeWidth={strokeWidth}
          strokeDasharray={`${pctOccupied * circumference} ${circumference}`}
          strokeDashoffset={-offset1} strokeLinecap="round"
          style={{ transition: 'all 0.6s ease' }}
        />
        {/* Available */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#52c41a" strokeWidth={strokeWidth}
          strokeDasharray={`${pctAvailable * circumference} ${circumference}`}
          strokeDashoffset={-offset2} strokeLinecap="round"
          style={{ transition: 'all 0.6s ease' }}
        />
        {/* Maintenance */}
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
  const [chartMode, setChartMode] = useState('day');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await axiosClient.get('/Reports/Dashboard/AdvancedSummary');
      setSummary(res.data);
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    }
  };

  const fetchChartData = useCallback(async (mode) => {
    setChartLoading(true);
    try {
      let url = '';
      if (mode === 'day') url = '/Reports/RevenueByDay';
      else if (mode === 'week') url = '/Reports/RevenueByWeek';
      else url = '/Reports/RevenueByMonth2';
      
      const res = await axiosClient.get(url);
      setChartData(res.data);
    } catch (error) {
      console.error('Lỗi tải biểu đồ:', error);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchChartData('day')]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleModeChange = (val) => {
    setChartMode(val);
    fetchChartData(val);
  };

  const getLabelKey = () => {
    if (chartMode === 'day') return 'date';
    if (chartMode === 'week') return 'week';
    return 'month';
  };

  const getChartColor = () => {
    if (chartMode === 'day') return '#4f6ef7';
    if (chartMode === 'week') return '#13c2c2';
    return '#722ed1';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Đang tải bảng điều khiển..." />
      </div>
    );
  }

  const s = summary || {};

  return (
    <div style={{ padding: '8px 16px', minHeight: '100vh' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>📊 Bảng Điều Khiển</Title>
          <Text type="secondary">Tổng quan hoạt động khách sạn</Text>
        </Col>
        <Col>
          <Tooltip title="Làm mới dữ liệu">
            <ReloadOutlined
              style={{ fontSize: 20, cursor: 'pointer', color: '#1890ff', padding: 8, borderRadius: 8, background: 'rgba(24,144,255,0.06)' }}
              onClick={() => { fetchSummary(); fetchChartData(chartMode); message.success('Đã làm mới!'); }}
            />
          </Tooltip>
        </Col>
      </Row>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<DollarOutlined />}
            title="Doanh thu hôm nay"
            value={s.revenueToday || 0}
            suffix="đ"
            color="#4f6ef7"
            bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<BarChartOutlined />}
            title="Doanh thu tháng"
            value={s.revenueMonth || 0}
            suffix="đ"
            color="#00b4d8"
            bgGradient="linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)"
            subText={s.growthPercent > 0 ? `↑ ${s.growthPercent}% so với tháng trước` : s.growthPercent < 0 ? `↓ ${Math.abs(s.growthPercent)}% so với tháng trước` : 'Chưa có dữ liệu tháng trước'}
            subColor={s.growthPercent >= 0 ? 'green' : 'red'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<HomeOutlined />}
            title="Phòng đang sử dụng"
            value={`${s.occupiedRooms || 0}/${s.totalRooms || 0}`}
            color="#52c41a"
            bgGradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
            subText={`${s.occupancyRate || 0}% đang sử dụng`}
            subColor="cyan"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<CalendarOutlined />}
            title="Đơn đang ở"
            value={s.checkedInToday || 0}
            suffix="đơn"
            color="#fa8c16"
            bgGradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            subText={`${s.completedBookings || 0} đã hoàn tất / ${s.totalBookings || 0} tổng`}
            subColor="blue"
          />
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: getChartColor() }} />
                <span>Biểu đồ Doanh thu</span>
              </Space>
            }
            extra={
              <Segmented
                options={[
                  { label: '📅 Ngày', value: 'day' },
                  { label: '📆 Tuần', value: 'week' },
                  { label: '🗓️ Tháng', value: 'month' },
                ]}
                value={chartMode}
                onChange={handleModeChange}
              />
            }
            style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            bodyStyle={{ padding: '16px 8px' }}
          >
            {chartLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                <Spin />
              </div>
            ) : (
              <BarChart
                data={chartData}
                labelKey={getLabelKey()}
                valueKey="amount"
                color={getChartColor()}
              />
            )}
          </Card>
        </Col>

        {/* Room Status Donut */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <HomeOutlined style={{ color: '#52c41a' }} />
                <span>Tình trạng Phòng</span>
              </Space>
            }
            style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}
            bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}
          >
            <DonutChart
              occupied={s.occupiedRooms || 0}
              available={s.availableRooms || 0}
              maintenance={s.maintenanceRooms || 0}
              total={s.totalRooms || 0}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Stats Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 16, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <DollarOutlined style={{ fontSize: 36, color: '#722ed1', marginBottom: 8 }} />
            <Title level={4} style={{ margin: '8px 0 4px 0', color: '#722ed1' }}>{(s.revenueTotal || 0).toLocaleString()} đ</Title>
            <Text type="secondary">Tổng doanh thu tích lũy</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 16, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <CheckCircleOutlined style={{ fontSize: 36, color: '#52c41a', marginBottom: 8 }} />
            <Title level={4} style={{ margin: '8px 0 4px 0', color: '#52c41a' }}>{s.completedBookings || 0}</Title>
            <Text type="secondary">Đơn hoàn tất</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 16, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <ToolOutlined style={{ fontSize: 36, color: '#faad14', marginBottom: 8 }} />
            <Title level={4} style={{ margin: '8px 0 4px 0', color: '#faad14' }}>{s.availableRooms || 0} / {s.totalRooms || 0}</Title>
            <Text type="secondary">Phòng trống / Tổng phòng</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
