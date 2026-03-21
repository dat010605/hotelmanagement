// File: DTOs/NewModulesDtos.cs
namespace HotelManagement.API.DTOs
{
    // DTOs cho Amenities
    public class CreateAmenityDto { public string Name { get; set; } = null!;  }
    public class UpdateAmenityDto { public string Name { get; set; } = null!; }

    // DTOs cho Articles & Categories
    public class CreateArticleCategoryDto { public string Name { get; set; } = null!; }
    public class UpdateArticleCategoryDto { public string Name { get; set; } = null!; }
    public class CreateArticleDto { public string Title { get; set; } = null!; public string Content { get; set; } = null!; public int CategoryId { get; set; } }
    public class UpdateArticleDto { public string Title { get; set; } = null!; public string Content { get; set; } = null!; public int CategoryId { get; set; } }

    // DTOs cho Attractions
    public class CreateAttractionDto { public string Name { get; set; } = null!; public string? Description { get; set; } public string Location { get; set; } = null!; }
    public class UpdateAttractionDto { public string Name { get; set; } = null!; public string? Description { get; set; } public string Location { get; set; } = null!; }

    // DTOs cho RoomInventories
    public class CreateRoomInventoryDto { public int RoomId { get; set; } public DateTime Date { get; set; } public bool IsAvailable { get; set; } }
    public class UpdateRoomInventoryDto { public bool IsAvailable { get; set; } }
    // DTOs cho UserProfile
    public class UpdateProfileDto { public string FullName { get; set; } = null!; public string? Phone { get; set; } }
    public class ChangePasswordDto { public string CurrentPassword { get; set; } = null!; public string NewPassword { get; set; } = null!; }
    // DTOs cho Rooms (Bổ sung)
    public class UpdateRoomCleaningStatusDto 
    { 
        public int RoomId { get; set; } 
        public string NewStatus { get; set; } = null!; 
    }

    public class CreateRoomDto
    {
        public int RoomTypeId { get; set; }
        public string Name { get; set; } = null!;
        public string RoomNumber { get; set; } = null!;
        public int Floor { get; set; }
        public string? Status { get; set; }
    }
    // ==========================================
    // DTOs cho Roles (Bổ sung)
    // ==========================================
    public class CreateRoleDto 
    { 
        public string Name { get; set; } = null!; 
    }

    public class UpdateRoleDto 
    { 
        public string Name { get; set; } = null!; 
    }

    public class AssignPermissionDto 
    { 
        public string RoleId { get; set; } = null!; 
        public List<string> Permissions { get; set; } = new List<string>(); 
    }
}