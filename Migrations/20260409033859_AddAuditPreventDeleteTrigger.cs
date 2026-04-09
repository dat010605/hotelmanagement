using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditPreventDeleteTrigger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE TRIGGER TR_AuditLogs_PreventDelete
                ON Audit_Logs
                INSTEAD OF DELETE
                AS
                BEGIN
                    -- Chặn nếu có dòng log nào được xóa mà có thời gian nhỏ hơn hoặc bằng 30 ngày
                    IF EXISTS(
                        SELECT 1 FROM deleted 
                        WHERE DATEDIFF(DAY, created_at, GETDATE()) <= 30
                    )
                    BEGIN
                        RAISERROR ('Khong the xoa lich su thao tac chua qua 30 ngay.', 16, 1);
                        ROLLBACK TRANSACTION;
                        RETURN;
                    END
                    
                    -- Nếu không có dòng nào vi phạm, tiến hành xóa
                    DELETE FROM Audit_Logs WHERE id IN (SELECT id FROM deleted);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS TR_AuditLogs_PreventDelete;");
        }
    }
}
