using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models
{
    [Table("Equipments")]
    public class Equipment
    {
        [Key]
        public int Id { get; set; }

        [Column("ItemCode")]
        public string? ItemCode { get; set; } 

        [Required]
        [Column("Name")]
        public string Name { get; set; }

        [Column("Category")]
        public string? Category { get; set; }

        [Column("Unit")]
        public string? Unit { get; set; }

        [Column("TotalQuantity")]
        public int TotalQuantity { get; set; }

        [Column("InUseQuantity")]
        public int InUseQuantity { get; set; }

        [Column("DamagedQuantity")]
        public int DamagedQuantity { get; set; }

        [Column("LiquidatedQuantity")]
        public int LiquidatedQuantity { get; set; } 

        [Column("InStockQuantity")]
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public int InStockQuantity { get; set; } 

        [Column("BasePrice")]
        public decimal BasePrice { get; set; } 

        [Column("DefaultPriceIfLost")]
        public decimal DefaultPriceIfLost { get; set; } 

        [Column("ImageUrl")]
        public string? ImageUrl { get; set; }

        [Column("Supplier")]
        public string? Supplier { get; set; }
    }
}