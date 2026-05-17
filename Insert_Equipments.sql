USE [HotelManagementDB]
GO

-- Xóa dữ liệu cũ nếu có để tránh trùng lặp khi chạy lại
DELETE FROM [dbo].[Equipments]
DBCC CHECKIDENT ('[dbo].[Equipments]', RESEED, 0)
GO

INSERT INTO [dbo].[Equipments] 
([ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt])
VALUES
('EQ-TV-001', N'Tivi Samsung 43 inch', N'Thiết bị điện tử', N'Cái', 50, 45, 1, 0, 8000000, 8500000, N'Samsung VN', 1, GETDATE()),
('EQ-TV-002', N'Tivi Sony 55 inch', N'Thiết bị điện tử', N'Cái', 20, 18, 0, 0, 15000000, 16000000, N'Sony VN', 1, GETDATE()),
('EQ-AC-001', N'Điều hòa Daikin Inverter 9000 BTU', N'Thiết bị điện lạnh', N'Cái', 80, 75, 2, 0, 9500000, 10000000, N'Daikin', 1, GETDATE()),
('EQ-AC-002', N'Điều hòa Panasonic 12000 BTU', N'Thiết bị điện lạnh', N'Cái', 30, 25, 1, 0, 12000000, 12500000, N'Panasonic', 1, GETDATE()),
('EQ-FG-001', N'Tủ lạnh mini Electrolux 90L', N'Thiết bị điện lạnh', N'Cái', 100, 95, 3, 0, 2800000, 3000000, N'Electrolux', 1, GETDATE()),
('EQ-BD-001', N'Giường đôi King Size (2m x 2.2m)', N'Nội thất', N'Cái', 40, 35, 0, 0, 12000000, 13000000, N'Nội Thất Hòa Phát', 1, GETDATE()),
('EQ-BD-002', N'Giường đơn (1.2m x 2m)', N'Nội thất', N'Cái', 60, 50, 0, 0, 5000000, 5500000, N'Nội Thất Hòa Phát', 1, GETDATE()),
('EQ-MT-001', N'Nệm cao su Kim Đan 2m x 2.2m', N'Đồ dùng phòng', N'Tấm', 45, 40, 1, 0, 18000000, 19000000, N'Kim Đan', 1, GETDATE()),
('EQ-MT-002', N'Nệm lò xo Liên Á 1.2m x 2m', N'Đồ dùng phòng', N'Tấm', 65, 55, 2, 0, 6000000, 6500000, N'Liên Á', 1, GETDATE()),
('EQ-SF-001', N'Ghế Sofa phòng khách', N'Nội thất', N'Bộ', 20, 15, 0, 0, 8000000, 8500000, N'Nội Thất Xinh', 1, GETDATE()),
('EQ-TB-001', N'Bàn trà Sofa', N'Nội thất', N'Cái', 20, 15, 0, 0, 2000000, 2200000, N'Nội Thất Xinh', 1, GETDATE()),
('EQ-DS-001', N'Bàn làm việc', N'Nội thất', N'Cái', 50, 45, 0, 0, 1500000, 1700000, N'Hòa Phát', 1, GETDATE()),
('EQ-CH-001', N'Ghế làm việc', N'Nội thất', N'Cái', 50, 45, 2, 0, 800000, 1000000, N'Hòa Phát', 1, GETDATE()),
('EQ-WM-001', N'Máy sấy tóc Panasonic', N'Thiết bị điện tử', N'Cái', 100, 90, 5, 1, 450000, 500000, N'Panasonic', 1, GETDATE()),
('EQ-KT-001', N'Ấm siêu tốc Sunhouse', N'Thiết bị điện tử', N'Cái', 100, 95, 2, 0, 250000, 300000, N'Sunhouse', 1, GETDATE()),
('EQ-SF-002', N'Két sắt mini', N'Thiết bị phòng', N'Cái', 80, 75, 0, 0, 1500000, 1800000, N'Việt Tiệp', 1, GETDATE()),
('EQ-TL-001', N'Điện thoại bàn', N'Thiết bị điện tử', N'Cái', 100, 95, 1, 0, 300000, 400000, N'Panasonic', 1, GETDATE()),
('EQ-LP-001', N'Đèn ngủ để bàn', N'Thiết bị điện tử', N'Cái', 150, 140, 5, 0, 350000, 450000, N'Rạng Đông', 1, GETDATE()),
('EQ-CB-001', N'Tủ quần áo gỗ công nghiệp', N'Nội thất', N'Cái', 80, 75, 1, 0, 4000000, 4500000, N'Mộc Phát', 1, GETDATE()),
('EQ-MR-001', N'Gương toàn thân', N'Nội thất', N'Cái', 80, 75, 0, 0, 800000, 1000000, N'Gương Việt', 1, GETDATE()),
('EQ-CR-001', N'Rèm cửa chống nắng', N'Nội thất', N'Bộ', 100, 95, 2, 0, 1200000, 1500000, N'Rèm Xinh', 1, GETDATE()),
('EQ-CP-001', N'Thảm trải sàn', N'Nội thất', N'Tấm', 50, 45, 1, 0, 2000000, 2500000, N'Thảm Việt', 1, GETDATE()),
('EQ-TW-001', N'Khăn tắm loại lớn (Cotton 100%)', N'Đồ dùng phòng tắm', N'Cái', 500, 400, 10, 5, 150000, 200000, N'Dệt May VN', 1, GETDATE()),
('EQ-TW-002', N'Khăn lau mặt', N'Đồ dùng phòng tắm', N'Cái', 600, 500, 15, 5, 50000, 80000, N'Dệt May VN', 1, GETDATE()),
('EQ-TW-003', N'Khăn lau tay', N'Đồ dùng phòng tắm', N'Cái', 600, 500, 12, 3, 30000, 50000, N'Dệt May VN', 1, GETDATE()),
('EQ-BR-001', N'Áo choàng tắm', N'Đồ dùng phòng tắm', N'Cái', 200, 150, 5, 0, 350000, 450000, N'Dệt May VN', 1, GETDATE()),
('EQ-SL-001', N'Dép mang trong nhà', N'Đồ dùng phòng', N'Đôi', 400, 300, 20, 10, 25000, 40000, N'Dệt May VN', 1, GETDATE()),
('EQ-PL-001', N'Gối ngủ', N'Đồ dùng phòng', N'Cái', 300, 250, 5, 2, 200000, 250000, N'Liên Á', 1, GETDATE()),
('EQ-BL-001', N'Chăn mùa đông', N'Đồ dùng phòng', N'Cái', 150, 100, 2, 0, 800000, 1000000, N'Everon', 1, GETDATE()),
('EQ-HT-001', N'Móc treo quần áo gỗ', N'Đồ dùng phòng', N'Cái', 1000, 800, 20, 10, 15000, 25000, N'Hòa Phát', 1, GETDATE()),
('EQ-BN-001', N'Thùng rác phòng', N'Đồ dùng phòng', N'Cái', 120, 110, 2, 0, 100000, 150000, N'Duy Tân', 1, GETDATE()),
('EQ-SH-001', N'Dầu gội đầu 500ml', N'Vật tư tiêu hao', N'Chai', 200, 100, 0, 0, 80000, 100000, N'Unilever', 1, GETDATE()),
('EQ-SG-001', N'Sữa tắm 500ml', N'Vật tư tiêu hao', N'Chai', 200, 100, 0, 0, 85000, 105000, N'Unilever', 1, GETDATE()),
('EQ-SP-001', N'Bánh xà phòng mini', N'Vật tư tiêu hao', N'Bánh', 1000, 500, 0, 0, 5000, 10000, N'Unilever', 1, GETDATE()),
('EQ-TB-002', N'Bàn chải đánh răng + Kem', N'Vật tư tiêu hao', N'Bộ', 2000, 1000, 0, 0, 10000, 15000, N'P/S', 1, GETDATE()),
('EQ-CZ-001', N'Cốc thủy tinh', N'Đồ dùng phòng', N'Cái', 300, 250, 10, 5, 20000, 30000, N'Ocean', 1, GETDATE()),
('EQ-CF-001', N'Cà phê gói hòa tan', N'Thực phẩm', N'Gói', 1000, 400, 0, 0, 5000, 10000, N'Trung Nguyên', 1, GETDATE()),
('EQ-TE-001', N'Trà túi lọc', N'Thực phẩm', N'Gói', 1000, 400, 0, 0, 3000, 5000, N'Cozy', 1, GETDATE()),
('EQ-WA-001', N'Nước suối Aquafina 500ml', N'Thực phẩm', N'Chai', 2000, 800, 0, 0, 5000, 10000, N'Suntory Pepsico', 1, GETDATE()),
('EQ-HK-001', N'Máy hút bụi công nghiệp', N'Thiết bị vệ sinh', N'Cái', 10, 8, 1, 0, 3500000, 4000000, N'Karcher', 1, GETDATE()),
('EQ-HK-002', N'Xe đẩy làm phòng', N'Thiết bị vệ sinh', N'Chiếc', 15, 12, 0, 0, 2500000, 3000000, N'Rubbermaid', 1, GETDATE()),
('EQ-HK-003', N'Cây lau nhà', N'Thiết bị vệ sinh', N'Cái', 30, 25, 2, 1, 150000, 200000, N'Duy Tân', 1, GETDATE()),
('EQ-FD-001', N'Tủ mát trưng bày nước (Lobby)', N'Thiết bị chung', N'Cái', 2, 2, 0, 0, 8000000, 9000000, N'Sanaky', 1, GETDATE()),
('EQ-RC-001', N'Máy pha cà phê lễ tân', N'Thiết bị chung', N'Cái', 1, 1, 0, 0, 15000000, 16000000, N'Breville', 1, GETDATE()),
('EQ-RC-002', N'Máy in hóa đơn', N'Thiết bị chung', N'Cái', 3, 3, 0, 0, 2000000, 2500000, N'Xprinter', 1, GETDATE()),
('EQ-RC-003', N'Máy tính bàn quầy lễ tân', N'Thiết bị điện tử', N'Cái', 3, 3, 0, 0, 12000000, 13000000, N'Dell', 1, GETDATE()),
('EQ-SW-001', N'Bộ phát Wifi chịu tải cao', N'Thiết bị mạng', N'Cái', 20, 18, 1, 0, 2500000, 3000000, N'Ubiquiti', 1, GETDATE()),
('EQ-SW-002', N'Camera giám sát hành lang', N'Thiết bị an ninh', N'Cái', 50, 48, 1, 0, 1200000, 1500000, N'Hikvision', 1, GETDATE()),
('EQ-FR-001', N'Bình chữa cháy CO2', N'Thiết bị PCCC', N'Bình', 40, 38, 0, 0, 450000, 600000, N'PCCC VN', 1, GETDATE()),
('EQ-FR-002', N'Bình chữa cháy bột tổng hợp', N'Thiết bị PCCC', N'Bình', 40, 38, 0, 0, 350000, 500000, N'PCCC VN', 1, GETDATE());
GO
