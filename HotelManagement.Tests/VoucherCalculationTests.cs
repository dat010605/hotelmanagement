// ============================================================
//  VoucherCalculationTests.cs
//  Unit Tests for Voucher Discount Algorithm
//  The Royal Citadel - Hotel Management System
//  Framework: xUnit (no database needed - pure logic tests)
// ============================================================

using System;
using Xunit;

namespace HotelManagement.Tests
{
    // ──────────────────────────────────────────────────────────────
    //  Lop tinh toan giam gia (tach rieng khoi controller)
    //  Muc dich: kiem tra thuat toan tinh tien THUAN TUY
    // ──────────────────────────────────────────────────────────────
    public static class VoucherCalculator
    {
        /// <summary>
        /// Tinh so tien sau khi ap dung voucher giam gia
        /// </summary>
        /// <param name="originalPrice">Gia goc (VND)</param>
        /// <param name="discountType">"Percent" hoac "Fixed"</param>
        /// <param name="discountValue">Gia tri giam: % hoac so tien co dinh</param>
        /// <returns>Gia cuoi cung sau giam gia (khong nho hon 0)</returns>
        public static decimal Apply(decimal originalPrice, string discountType, decimal discountValue)
        {
            decimal finalPrice = discountType switch
            {
                "Percent" => originalPrice * (1 - discountValue / 100m),
                "Fixed"   => originalPrice - discountValue,
                _         => originalPrice
            };

            // Gia cuoi khong duoc am
            return Math.Max(0m, finalPrice);
        }

        /// <summary>
        /// Kiem tra voucher con hieu luc hay khong
        /// </summary>
        public static bool IsValid(DateTime? validFrom, DateTime? validTo, DateTime now)
        {
            if (validFrom.HasValue && now < validFrom.Value) return false;
            if (validTo.HasValue   && now > validTo.Value)   return false;
            return true;
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  TEST CLASS: Kiem tra thuat toan tinh toan Voucher
    // ──────────────────────────────────────────────────────────────
    public class VoucherCalculationTests
    {
        // ── TC-V01: Giam 20% tren 1.000.000 → 800.000 ──────────
        [Fact]
        public void Apply_PercentDiscount20_On1Million_Returns800K()
        {
            // ARRANGE
            decimal originalPrice = 1_000_000m;
            string discountType   = "Percent";
            decimal discountValue = 20m;

            // ACT
            decimal result = VoucherCalculator.Apply(originalPrice, discountType, discountValue);

            // ASSERT
            Assert.Equal(800_000m, result);
        }

        // ── TC-V02: Giam co dinh 150.000 tren 500.000 → 350.000 ─
        [Fact]
        public void Apply_FixedDiscount150K_On500K_Returns350K()
        {
            // ARRANGE
            decimal originalPrice = 500_000m;
            string discountType   = "Fixed";
            decimal discountValue = 150_000m;

            // ACT
            decimal result = VoucherCalculator.Apply(originalPrice, discountType, discountValue);

            // ASSERT
            Assert.Equal(350_000m, result);
        }

        // ── TC-V03: Giam 0% → Gia khong thay doi ────────────────
        [Fact]
        public void Apply_ZeroPercentDiscount_ReturnsOriginalPrice()
        {
            decimal result = VoucherCalculator.Apply(2_000_000m, "Percent", 0m);
            Assert.Equal(2_000_000m, result);
        }

        // ── TC-V04: Giam 100% → Gia = 0 (tang mien phi) ─────────
        [Fact]
        public void Apply_100PercentDiscount_ReturnsZero()
        {
            decimal result = VoucherCalculator.Apply(1_500_000m, "Percent", 100m);
            Assert.Equal(0m, result);
        }

        // ── TC-V05: Giam Fixed lon hon gia goc → khong am ────────
        [Fact]
        public void Apply_FixedDiscountLargerThanPrice_ReturnsZeroNotNegative()
        {
            // Giam 500.000 tren 200.000 → khong duoc tra so am
            decimal result = VoucherCalculator.Apply(200_000m, "Fixed", 500_000m);
            Assert.Equal(0m, result);
        }

        // ── TC-V06: Voucher con hieu luc ─────────────────────────
        [Fact]
        public void IsValid_WhenCurrentDateIsWithinRange_ReturnsTrue()
        {
            var now      = new DateTime(2026, 11, 15);
            var validFrom = new DateTime(2026, 11, 1);
            var validTo   = new DateTime(2026, 12, 31);

            bool result = VoucherCalculator.IsValid(validFrom, validTo, now);

            Assert.True(result);
        }

        // ── TC-V07: Voucher het han ───────────────────────────────
        [Fact]
        public void IsValid_WhenVoucherExpired_ReturnsFalse()
        {
            var now      = new DateTime(2026, 11, 15);
            var validFrom = new DateTime(2025, 1, 1);
            var validTo   = new DateTime(2025, 12, 31); // Da qua

            bool result = VoucherCalculator.IsValid(validFrom, validTo, now);

            Assert.False(result);
        }

        // ── TC-V08: Voucher chua den ngay bat dau ────────────────
        [Fact]
        public void IsValid_WhenVoucherNotStartedYet_ReturnsFalse()
        {
            var now       = new DateTime(2026, 10, 30);
            var validFrom = new DateTime(2026, 12, 1); // Tuong lai
            var validTo   = new DateTime(2027, 1, 1);

            bool result = VoucherCalculator.IsValid(validFrom, validTo, now);

            Assert.False(result);
        }

        // ── TC-V09: Giam 20% tren 3 dem (3 x 1.200.000) ─────────
        [Fact]
        public void Apply_PercentDiscount_MultipleNights_CalculatesCorrectly()
        {
            // 3 dem x 1.200.000 = 3.600.000, giam 20% = 2.880.000
            decimal pricePerNight = 1_200_000m;
            int nights            = 3;
            decimal totalPrice    = pricePerNight * nights;  // 3.600.000

            decimal finalPrice = VoucherCalculator.Apply(totalPrice, "Percent", 20m);

            Assert.Equal(3_600_000m, totalPrice);
            Assert.Equal(2_880_000m, finalPrice);
        }
    }
}
