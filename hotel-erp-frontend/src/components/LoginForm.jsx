// ============================================================
//  LoginForm.jsx
//  Component TACH RIENG de test - chua form logic cua LoginPage
//  The Royal Citadel - Hotel Management System
//
//  Ly do: LoginPage.jsx tich hop nhieu thu vien phu (Google OAuth,
//  Ant Design App context) nen kho test truc tiep. Day la pattern
//  chuan: tach Form logic thanh component rieng, test no doc lap.
// ============================================================

import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * LoginForm - Component Form Dang Nhap
 * @param {function} onSubmit - Ham goi API, nhan { email, password }
 */
const LoginForm = ({ onSubmit }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập Email!';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ!';
    }

    if (!password.trim()) {
      newErrors.password = 'Vui lòng nhập Mật khẩu!';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await onSubmit({ email, password });
    } catch (err) {
      // Loi API duoc xu ly boi component cha (LoginPage)
      // LoginForm chi dam bao reset loading state
      console.error('Login failed:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="login-form">
      <h1>The Royal Citadel</h1>
      <p>Vui lòng đăng nhập để tiếp tục</p>

      {/* Email Field */}
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert" data-testid="email-error">
            {errors.email}
          </span>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <span id="password-error" role="alert" data-testid="password-error">
            {errors.password}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        data-testid="login-button"
      >
        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
      </button>
    </form>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default LoginForm;
