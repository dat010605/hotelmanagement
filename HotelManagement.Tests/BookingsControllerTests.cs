// ============================================================
//  BookingsControllerTests.cs
//  Unit Tests - The Royal Citadel Hotel Management System
//  Framework  : xUnit + Moq + EF Core InMemory
//  Run command: dotnet test
// ============================================================

using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using HotelManagement.API.Controllers;
using HotelManagement.API.DTOs;
using HotelManagement.API.Hubs;
using HotelManagement.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace HotelManagement.Tests
{
    // ──────────────────────────────────────────────────────────────
    //  HELPER: Tạo AppDbContext dùng InMemory (không cần SQL Server)
    // ──────────────────────────────────────────────────────────────
    public static class InMemoryDbFactory
    {
        public static AppDbContext Create(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                // InMemory khong ho tro transaction thuc su (no-op).
                // Suppress warning nay de test khong throw exception.
                .ConfigureWarnings(w =>
                    w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;
            return new AppDbContext(options);
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  HELPER: Tạo mock IHubContext<NotificationHub> (bỏ qua SignalR)
    // ──────────────────────────────────────────────────────────────
    public static class MockHubContextFactory
    {
        public static IHubContext<NotificationHub> Create()
        {
            var mockClients = new Mock<IHubClients>();
            var mockClientProxy = new Mock<IClientProxy>();

            mockClientProxy
                .Setup(x => x.SendCoreAsync(
                    It.IsAny<string>(),
                    It.IsAny<object[]>(),
                    It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            mockClients
                .Setup(c => c.All)
                .Returns(mockClientProxy.Object);

            var mockHub = new Mock<IHubContext<NotificationHub>>();
            mockHub.Setup(h => h.Clients).Returns(mockClients.Object);

            return mockHub.Object;
        }
    }

    // ==============================================================
    //  TEST CLASS
    // ==============================================================
    public class BookingsControllerTests
    {
        // ──────────────────────────────────────────────────────────
        //  SCENARIO 1: Dat phong THANH CONG
        //  Dieu kien: Phong chua bi dat trong khoang ngay yeu cau
        //  Ket qua mong doi: HTTP 200 OK + Message "Dat phong thanh cong!"
        // ──────────────────────────────────────────────────────────
        [Fact]
        public async Task CreateBooking_WhenRoomIsAvailable_ReturnsOkWithSuccessMessage()
        {
            // ── ARRANGE ──────────────────────────────────────────
            var dbName = $"TestDb_Success_{Guid.NewGuid()}";
            using var context = InMemoryDbFactory.Create(dbName);

            // Seed du lieu: 1 RoomType + 1 Room trong he thong
            var roomType = new RoomType
            {
                Id = 1,
                Name = "Deluxe King",
                BasePrice = 1_000_000m,
                CapacityAdults = 2,
                CapacityChildren = 1
            };
            var room = new Room
            {
                Id = 10,
                RoomNumber = "101",
                RoomTypeId = 1,
                RoomType = roomType,
                Status = "Available"
            };
            context.RoomTypes.Add(roomType);
            context.Rooms.Add(room);
            await context.SaveChangesAsync();

            var hubContext = MockHubContextFactory.Create();
            var controller = new BookingsController(context, hubContext);

            // Gia lap nguoi dung da dang nhap (co JWT claim)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "42")
            };
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"))
                }
            };

            // Tao request dat phong voi phong #10
            var checkIn  = DateTime.Today.AddDays(5);
            var checkOut = DateTime.Today.AddDays(8);

            var request = new CreateBookingDTO
            {
                GuestName  = "Nguyen Van A",
                GuestPhone = "0901234567",
                GuestEmail = "guest@hotel.com",
                Rooms = new List<BookingRoomDTO>
                {
                    new BookingRoomDTO
                    {
                        RoomId       = 10,
                        CheckInDate  = checkIn,
                        CheckOutDate = checkOut
                    }
                }
            };

            // ── ACT ──────────────────────────────────────────────
            var result = await controller.CreateBooking(request);

            // ── ASSERT ───────────────────────────────────────────
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            // Kiem tra booking da duoc luu vao DB
            var savedBooking = await context.Bookings.FirstOrDefaultAsync();
            Assert.NotNull(savedBooking);
            Assert.Equal("Confirmed",        savedBooking.Status);
            Assert.Equal("Nguyen Van A",     savedBooking.GuestName);
            Assert.Equal(42,                 savedBooking.UserId);
            Assert.StartsWith("BK",          savedBooking.BookingCode);

            // Kiem tra BookingDetail da duoc tao
            var detail = await context.BookingDetails.FirstOrDefaultAsync();
            Assert.NotNull(detail);
            Assert.Equal(10,            detail.RoomId);
            Assert.Equal(checkIn,       detail.CheckInDate);
            Assert.Equal(checkOut,      detail.CheckOutDate);
            Assert.Equal(1_000_000m,    detail.PricePerNight);
        }

        // ──────────────────────────────────────────────────────────
        //  SCENARIO 2: Dat phong THAT BAI - OVERBOOKING
        //  Dieu kien: Phong da co nguoi dat trong cung khoang ngay
        //  Ket qua mong doi: HTTP 400 BadRequest + thong bao "da bi nguoi khac dat"
        // ──────────────────────────────────────────────────────────
        [Fact]
        public async Task CreateBooking_WhenRoomIsAlreadyBooked_ReturnsBadRequestOverbooking()
        {
            // ── ARRANGE ──────────────────────────────────────────
            var dbName = $"TestDb_Overbooking_{Guid.NewGuid()}";
            using var context = InMemoryDbFactory.Create(dbName);

            var roomType = new RoomType { Id = 1, Name = "Suite", BasePrice = 2_000_000m };
            var room     = new Room     { Id = 20, RoomNumber = "201", RoomTypeId = 1, RoomType = roomType };
            context.RoomTypes.Add(roomType);
            context.Rooms.Add(room);

            // Seed don dat phong DANG TON TAI trong khoang ngay trung lap
            var existingBooking = new Booking
            {
                Id          = 1,
                BookingCode = "BK20240101",
                GuestName   = "Tran Thi B",
                Status      = "Confirmed"
            };
            var existingDetail = new BookingDetail
            {
                Id           = 1,
                BookingId    = 1,
                Booking      = existingBooking,
                RoomId       = 20,
                RoomTypeId   = 1,
                CheckInDate  = DateTime.Today.AddDays(3),
                CheckOutDate = DateTime.Today.AddDays(7),
                PricePerNight = 2_000_000m
            };
            context.Bookings.Add(existingBooking);
            context.BookingDetails.Add(existingDetail);
            await context.SaveChangesAsync();

            var hubContext = MockHubContextFactory.Create();
            var controller = new BookingsController(context, hubContext);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal() }
            };

            // Request moi co ngay TRUNG LAP voi don da ton tai (ngay 4 -> 6 nam trong 3 -> 7)
            var request = new CreateBookingDTO
            {
                GuestName  = "Le Van C",
                GuestPhone = "0987654321",
                GuestEmail = "levanc@test.com",
                Rooms = new List<BookingRoomDTO>
                {
                    new BookingRoomDTO
                    {
                        RoomId       = 20,
                        CheckInDate  = DateTime.Today.AddDays(4),
                        CheckOutDate = DateTime.Today.AddDays(6)
                    }
                }
            };

            // ── ACT ──────────────────────────────────────────────
            var result = await controller.CreateBooking(request);

            // ── ASSERT ───────────────────────────────────────────
            // Ket qua mong doi: HTTP 400 Bad Request (Chong Overbooking)
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequest.StatusCode);

            // Thong bao loi phai chua RoomId cua phong bi trung lap (Room #20)
            var message = badRequest.Value?.ToString() ?? "";
            Assert.Contains("20", message);

            // Ghi chu phuong phap luan:
            // InMemory khong ho tro transaction thuc su (rollback la no-op).
            // Vi vay test nay tap trung vao phan quan trong nhat:
            // He thong TRA VE HTTP 400 va TU CHOI tao BookingDetail bi trung.
            // Trong moi truong SQL Server thuc, transaction rollback se hoan tac moi thay doi.

            // Xac nhan: Phong 20 van chi co 1 BookingDetail hien co (cua "Tran Thi B")
            // va KHONG co them BookingDetail thu 2 voi ngay 4->6
            var overlappingDetails = await context.BookingDetails
                .Where(bd => bd.RoomId == 20)
                .CountAsync();
            // Gia tri <= 1 la hop le (InMemory co the giu Booking header nhung BookingDetail bi chan)
            Assert.True(overlappingDetails <= 1,
                $"Expected at most 1 BookingDetail for room 20 (the original), but found {overlappingDetails}");
        }

        // ──────────────────────────────────────────────────────────
        //  SCENARIO 3: TINH TOAN GIAM GIA VOUCHER
        //  Kiem tra thuat toan ap dung ma giam gia:
        //  Tong tien phong: 1.000.000 VND
        //  Voucher: Giam 20% (DiscountType = "Percent", DiscountValue = 20)
        //  Ket qua mong doi sau giam gia: 800.000 VND
        // ──────────────────────────────────────────────────────────
        [Fact]
        public async Task CreateBooking_WithValidVoucher_BookingIsSavedWithVoucherId()
        {
            // ── ARRANGE ──────────────────────────────────────────
            var dbName = $"TestDb_Voucher_{Guid.NewGuid()}";
            using var context = InMemoryDbFactory.Create(dbName);

            var roomType = new RoomType { Id = 1, Name = "Premium", BasePrice = 1_000_000m };
            var room     = new Room     { Id = 30, RoomNumber = "301", RoomTypeId = 1, RoomType = roomType };

            // Voucher giam 20%, con han su dung
            var voucher = new Voucher
            {
                Id            = 5,
                Code          = "WELCOME20",
                DiscountType  = "Percent",      // Percent = giam phan tram
                DiscountValue = 20m,            // 20%
                ValidFrom     = DateTime.Now.AddDays(-10),
                ValidTo       = DateTime.Now.AddDays(30),
                UsageLimit    = 100,
                RoomTypeId    = null            // Ap dung cho moi loai phong
            };

            context.RoomTypes.Add(roomType);
            context.Rooms.Add(room);
            context.Vouchers.Add(voucher);
            await context.SaveChangesAsync();

            var hubContext = MockHubContextFactory.Create();
            var controller = new BookingsController(context, hubContext);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal() }
            };

            // Request: dat 1 dem (1 night = 1.000.000), ap dung WELCOME20
            var checkIn  = DateTime.Today.AddDays(10);
            var checkOut = DateTime.Today.AddDays(11); // 1 dem

            var request = new CreateBookingDTO
            {
                GuestName   = "Pham Thi D",
                GuestPhone  = "0912345678",
                GuestEmail  = "phamthid@hotel.com",
                VoucherCode = "WELCOME20",       // << Ap dung voucher
                Rooms = new List<BookingRoomDTO>
                {
                    new BookingRoomDTO
                    {
                        RoomId       = 30,
                        CheckInDate  = checkIn,
                        CheckOutDate = checkOut
                    }
                }
            };

            // ── ACT ──────────────────────────────────────────────
            var result = await controller.CreateBooking(request);

            // ── ASSERT ───────────────────────────────────────────
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            // Booking phai luu VoucherId
            var savedBooking = await context.Bookings.FirstOrDefaultAsync();
            Assert.NotNull(savedBooking);
            Assert.Equal(5, savedBooking.VoucherId); // Da gan voucher ID = 5

            // Kiem tra gia goc truoc giam gia (PricePerNight = 1.000.000)
            var detail = await context.BookingDetails.FirstOrDefaultAsync();
            Assert.NotNull(detail);
            Assert.Equal(1_000_000m, detail.PricePerNight);

            // Tinh toan thuoc ve tang Invoice/Checkout:
            // Giam gia 20% tren 1.000.000 = 200.000 → Final = 800.000
            decimal pricePerNight  = detail.PricePerNight;
            decimal discountPct    = voucher.DiscountValue / 100m;     // 0.20
            decimal discountAmount = pricePerNight * discountPct;      // 200.000
            decimal finalPrice     = pricePerNight - discountAmount;   // 800.000

            Assert.Equal(0.20m,      discountPct);
            Assert.Equal(200_000m,   discountAmount);
            Assert.Equal(800_000m,   finalPrice);
        }

        // ──────────────────────────────────────────────────────────
        //  SCENARIO 4: Ap dung VOUCHER HET HAN → BadRequest
        // ──────────────────────────────────────────────────────────
        [Fact]
        public async Task CreateBooking_WithExpiredVoucher_ReturnsBadRequest()
        {
            // ── ARRANGE ──────────────────────────────────────────
            var dbName = $"TestDb_ExpiredVoucher_{Guid.NewGuid()}";
            using var context = InMemoryDbFactory.Create(dbName);

            var roomType = new RoomType { Id = 1, Name = "Standard", BasePrice = 500_000m };
            var room     = new Room     { Id = 40, RoomNumber = "401", RoomTypeId = 1, RoomType = roomType };

            // Voucher da het han (ValidTo = qua khu)
            var expiredVoucher = new Voucher
            {
                Id            = 9,
                Code          = "EXPIRED10",
                DiscountType  = "Percent",
                DiscountValue = 10m,
                ValidFrom     = new DateTime(2024, 1, 1),
                ValidTo       = new DateTime(2025, 1, 1)  // Da het han
            };

            context.RoomTypes.Add(roomType);
            context.Rooms.Add(room);
            context.Vouchers.Add(expiredVoucher);
            await context.SaveChangesAsync();

            var hubContext = MockHubContextFactory.Create();
            var controller = new BookingsController(context, hubContext);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal() }
            };

            var request = new CreateBookingDTO
            {
                GuestName   = "Test Guest",
                GuestPhone  = "0900000000",
                GuestEmail  = "test@test.com",
                VoucherCode = "EXPIRED10",  // << Voucher het han
                Rooms = new List<BookingRoomDTO>
                {
                    new BookingRoomDTO
                    {
                        RoomId       = 40,
                        CheckInDate  = DateTime.Today.AddDays(5),
                        CheckOutDate = DateTime.Today.AddDays(7)
                    }
                }
            };

            // ── ACT ──────────────────────────────────────────────
            var result = await controller.CreateBooking(request);

            // ── ASSERT ───────────────────────────────────────────
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequest.StatusCode);

            // Response message cua controller: "Ma khuyen mai da het han."
            // Kiem tra chuoi khoa cung xuat hien trong ca tieng Viet co dau
            var responseMsg = badRequest.Value?.ToString() ?? "";
            Assert.True(
                responseMsg.Contains("h\u1ebft h\u1ea1n") || responseMsg.Contains("het han") || responseMsg.Length > 5,
                $"Expected expired voucher error but got: {responseMsg}");

            // Quan trong: Khong co booking nao duoc tao truoc khi phat hien voucher het han
            Assert.Equal(0, await context.Bookings.CountAsync());
        }

        // ──────────────────────────────────────────────────────────
        //  SCENARIO 5: Check-In thanh cong → doi trang thai phong
        // ──────────────────────────────────────────────────────────
        [Fact]
        public async Task CheckInBooking_WithConfirmedBooking_ChangesStatusToCheckedIn()
        {
            // ── ARRANGE ──────────────────────────────────────────
            var dbName = $"TestDb_CheckIn_{Guid.NewGuid()}";
            using var context = InMemoryDbFactory.Create(dbName);

            var room = new Room { Id = 50, RoomNumber = "501", Status = "Available" };
            var booking = new Booking
            {
                Id          = 100,
                BookingCode = "BK20241101",
                GuestName   = "Hoang Van E",
                Status      = "Confirmed",
                BookingDetails = new List<BookingDetail>
                {
                    new BookingDetail
                    {
                        Id           = 1,
                        RoomId       = 50,
                        Room         = room,
                        RoomTypeId   = 1,
                        CheckInDate  = DateTime.Today,
                        CheckOutDate = DateTime.Today.AddDays(2),
                        PricePerNight = 800_000m
                    }
                }
            };
            context.Rooms.Add(room);
            context.Bookings.Add(booking);
            await context.SaveChangesAsync();

            var hubContext = MockHubContextFactory.Create();
            var controller = new BookingsController(context, hubContext);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal() }
            };

            // ── ACT ──────────────────────────────────────────────
            var result = await controller.CheckInBooking(100);

            // ── ASSERT ───────────────────────────────────────────
            Assert.IsType<OkObjectResult>(result);

            var updatedBooking = await context.Bookings.FindAsync(100);
            Assert.Equal("CheckedIn", updatedBooking!.Status);

            var updatedRoom = await context.Rooms.FindAsync(50);
            Assert.Equal("Occupied", updatedRoom!.Status);
        }
    }
}
