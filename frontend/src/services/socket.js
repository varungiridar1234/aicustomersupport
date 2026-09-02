import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (userId = 'default_user') => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_API_URL || '/';
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
