import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './i18n.js' // ← Khởi tạo hệ thống đa ngôn ngữ (i18n) trước khi render App

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)