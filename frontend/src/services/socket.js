import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (userId) => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_API_URL || '/';
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
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

export const getSocket = () => socket;
