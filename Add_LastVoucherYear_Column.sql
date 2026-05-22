-- =====================================================================
-- Script: Thêm cột last_voucher_year vào bảng Users
-- Mục đích: Chống bào mã voucher sinh nhật (mỗi user chỉ nhận 1 lần/năm)
-- Chạy trên: SQL Server (HotelManagementDB)
-- =====================================================================

-- Kiểm tra cột đã tồn tại chưa trước khi thêm (idempotent)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Users'
      AND COLUMN_NAME = 'last_voucher_year'
)
BEGIN
    ALTER TABLE Users
    ADD last_voucher_year INT NULL;

    PRINT 'Đã thêm cột last_voucher_year vào bảng Users thành công.';
END
ELSE
BEGIN
    PRINT 'Cột last_voucher_year đã tồn tại, bỏ qua.';
END
