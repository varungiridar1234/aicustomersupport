import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (userId) => {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to backend server');
      if (userId) {
        socket.emit('join_room', userId);
      }
    });
  }
  return socket;
};

export const getSocket = () => socket;
