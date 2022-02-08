import { io } from 'socket.io-client';
import { config } from '../config';

const socket = io(`${config.api_host}`, {
  autoConnect: true,
  pingTimeout: 30000,
  reconnection: true,
  reconnectionDelayMax: 10000,
  transports: ['websocket'],
  allowUpgrades: false,
  forceNew: true,
});

export { socket };
