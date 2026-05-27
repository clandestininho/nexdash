import { io } from 'socket.io-client';

export const socket = io('/', {
  auth: {
    token: localStorage.getItem('token'),
  },
  autoConnect: !!localStorage.getItem('token'),
  transports: ['websocket', 'polling'],
});

export function connectSocket(token) {
  socket.auth = { token: token || localStorage.getItem('token') };
  if (socket.disconnected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  socket.disconnect();
}
