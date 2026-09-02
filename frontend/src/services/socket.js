import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (userId = 'default_user') => {
  if (!socket) {
    let socketUrl = import.meta.env.VITE_API_URL;
    if (!socketUrl) {
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        socketUrl = '/';
      } else {
        socketUrl = 'https://aicustomersupport-lpao.onrender.com';
      }
    }

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to backend server:', socketUrl);
      if (userId) {
        socket.emit('join_room', userId);
      }
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket('agent_dashboard');
  }
  return socket;
};
