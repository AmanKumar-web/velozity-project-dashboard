import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
export declare const initSocket: (httpServer: HttpServer) => Server;
export declare const getIO: () => Server;
