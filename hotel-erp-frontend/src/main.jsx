import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
<<<<<<< HEAD
import { GoogleOAuthProvider } from '@react-oauth/google';
=======
import './i18n.js' // ← Khởi tạo hệ thống đa ngôn ngữ (i18n) trước khi render App

>>>>>>> datpronak123
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="1092964554796-m6sdv9908bk6qapbk586g6qna4pu4p6a.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
