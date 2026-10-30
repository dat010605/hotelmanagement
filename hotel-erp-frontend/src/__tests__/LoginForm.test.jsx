// ============================================================
//  LoginForm.test.jsx
//  Frontend Unit Tests - The Royal Citadel Hotel Management System
//  Framework: Vitest + React Testing Library
//
//  Chay lenh: npm run test
// ============================================================

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from '../components/LoginForm';

// ──────────────────────────────────────────────────────────────
//  DESCRIBE BLOCK: Nhom tat ca test cho LoginForm
// ──────────────────────────────────────────────────────────────
describe('LoginForm Component', () => {

  // Mock ham onSubmit - dung vi.fn() de theo doi
  let mockOnSubmit;

  beforeEach(() => {
    // Reset mock truoc moi test case
    mockOnSubmit = vi.fn().mockResolvedValue({ success: true });
  });

  // ──────────────────────────────────────────────────────────
  //  TC-F01: Render dung - Form hien thi day du cac phan tu
  // ──────────────────────────────────────────────────────────
  it('TC-F01: Renders form elements correctly', () => {
    // ARRANGE + ACT
    render(<LoginForm onSubmit={mockOnSubmit} />);

    // ASSERT: Kiem tra cac phan tu co mat tren man hinh
    expect(screen.getByText('The Royal Citadel')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toHaveTextContent('Đăng Nhập');
  });

  // ──────────────────────────────────────────────────────────
  //  TC-F02: Validation - Nhan nut Dang Nhap khi de trong
  //  → Hien thi canh bao loi cho ca hai truong
  // ──────────────────────────────────────────────────────────
  it('TC-F02: Shows validation errors when submitting empty form', async () => {
    // ARRANGE
    render(<LoginForm onSubmit={mockOnSubmit} />);
    const loginBtn = screen.getByTestId('login-button');

    // ACT: Nhan nut khi chua nhap gi
    fireEvent.click(loginBtn);

    // ASSERT: Thong bao loi phai xuat hien
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });

    expect(screen.getByText('Vui lòng nhập Email!')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng nhập Mật khẩu!')).toBeInTheDocument();

    // onSubmit KHONG duoc goi (vi validation that bai)
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────
  //  TC-F03: Validation - Chi nhap Email, bo trong Password
  //  → Chi hien thi loi Password
  // ──────────────────────────────────────────────────────────
  it('TC-F03: Shows only password error when email is filled but password is empty', async () => {
    // ARRANGE
    render(<LoginForm onSubmit={mockOnSubmit} />);

    // ACT: Nhap email, bo trong password
    await userEvent.type(screen.getByLabelText(/email/i), 'test@hotel.com');
    fireEvent.click(screen.getByTestId('login-button'));

    // ASSERT
    await waitFor(() => {
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });

    expect(screen.getByText('Vui lòng nhập Mật khẩu!')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────
  //  TC-F04: Validation - Email sai dinh dang
  //  → Hien thi loi "Email khong hop le"
  // ──────────────────────────────────────────────────────────
  it('TC-F04: Shows invalid email error for malformed email', async () => {
    // ARRANGE
    render(<LoginForm onSubmit={mockOnSubmit} />);

    // ACT: Nhap email sai dinh dang
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/mật khẩu/i), 'Test@1234');
    fireEvent.click(screen.getByTestId('login-button'));

    // ASSERT
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });

    expect(screen.getByText('Email không hợp lệ!')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────
  //  TC-F05: Happy Path - Nhap dung Email va Password
  //  → Goi onSubmit voi dung du lieu
  // ──────────────────────────────────────────────────────────
  it('TC-F05: Calls onSubmit with correct credentials on valid input', async () => {
    // ARRANGE
    render(<LoginForm onSubmit={mockOnSubmit} />);

    // ACT: Nhap email va password hop le
    await userEvent.type(screen.getByLabelText(/email/i), 'receptionist@hotel.com');
    await userEvent.type(screen.getByLabelText(/mật khẩu/i), 'Test@1234');
    fireEvent.click(screen.getByTestId('login-button'));

    // ASSERT: onSubmit phai duoc goi dung 1 lan voi dung tham so
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'receptionist@hotel.com',
      password: 'Test@1234',
    });

    // Khong co thong bao loi nao
    expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('password-error')).not.toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────
  //  TC-F06: Loading State - Nut bi disable trong luc goi API
  // ──────────────────────────────────────────────────────────
  it('TC-F06: Disables login button while API call is in progress', async () => {
    // ARRANGE: onSubmit tra ve Promise chua resolve ngay
    let resolveSubmit;
    const pendingSubmit = new Promise((resolve) => { resolveSubmit = resolve; });
    mockOnSubmit = vi.fn().mockReturnValue(pendingSubmit);

    render(<LoginForm onSubmit={mockOnSubmit} />);

    // ACT: Nhap va click
    await userEvent.type(screen.getByLabelText(/email/i), 'admin@hotel.com');
    await userEvent.type(screen.getByLabelText(/mật khẩu/i), 'Admin@123');
    fireEvent.click(screen.getByTestId('login-button'));

    // ASSERT: Nut phai bi disable va doi text
    await waitFor(() => {
      expect(screen.getByTestId('login-button')).toBeDisabled();
      expect(screen.getByText('Đang đăng nhập...')).toBeInTheDocument();
    });

    // Resolve de test ket thuc sach
    resolveSubmit();
    await waitFor(() => {
      expect(screen.getByTestId('login-button')).not.toBeDisabled();
    });
  });

  // ──────────────────────────────────────────────────────────
  //  TC-F07: Loi tu API - Form reset loading khi API that bai
  // ──────────────────────────────────────────────────────────
  it('TC-F07: Resets loading state when API call fails', async () => {
    // ARRANGE: onSubmit throw error
    mockOnSubmit = vi.fn().mockRejectedValue(new Error('401 Unauthorized'));
    render(<LoginForm onSubmit={mockOnSubmit} />);

    // ACT
    await userEvent.type(screen.getByLabelText(/email/i), 'user@hotel.com');
    await userEvent.type(screen.getByLabelText(/mật khẩu/i), 'WrongPass');
    fireEvent.click(screen.getByTestId('login-button'));

    // ASSERT: Sau khi API that bai, nut phai khoi phuc
    await waitFor(() => {
      expect(screen.getByTestId('login-button')).not.toBeDisabled();
      expect(screen.getByText('Đăng Nhập')).toBeInTheDocument();
    });
  });
});
