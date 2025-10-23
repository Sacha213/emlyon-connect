import { Server as HttpServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import prisma from './config/database';

let wss: WebSocketServer;
const clients = new Map<string, WebSocket>();

export const setupWebSocket = (server: HttpServer) => {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws: WebSocket, req) => {
    console.log('🔌 New WebSocket connection');

    // Authentification via token dans l'URL
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Token manquant');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const userId = decoded.userId;

      // Stocker la connexion
      clients.set(userId, ws);

      ws.on('close', () => {
        clients.delete(userId);
        console.log(`🔌 WebSocket closed for user ${userId}`);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(userId);
      });

      // Envoyer les données initiales
      await sendInitialData(ws);
    } catch (error) {
      console.error('WebSocket auth error:', error);
      ws.close(1008, 'Token invalide');
    }
  });

  console.log('✅ WebSocket server initialized');
};

const sendInitialData = async (ws: WebSocket) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [checkIns, events] = await Promise.all([
      prisma.checkIn.findMany({
        where: { createdAt: { gte: twentyFourHoursAgo } },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true }
          }
        }
      }),
      prisma.event.findMany({
        include: {
          creator: {
            select: { id: true, name: true, avatarUrl: true }
          },
          attendees: {
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true }
              }
            }
          }
        }
      })
    ]);

    const data = {
      type: 'initial',
      checkIns: checkIns.map(c => ({
        id: c.id,
        user: c.user,
        locationName: c.locationName,
        latitude: c.latitude,
        longitude: c.longitude,
        timestamp: c.createdAt.getTime(),
        statusEmoji: c.statusEmoji
      })),
      events: events.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date.getTime(),
        creator: e.creator,
        attendees: e.attendees.map(a => a.user)
      }))
    };

    ws.send(JSON.stringify(data));
  } catch (error) {
    console.error('Error sending initial data:', error);
  }
};

export const broadcastCheckIns = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const checkIns = await prisma.checkIn.findMany({
      where: { createdAt: { gte: twentyFourHoursAgo } },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    });

    const data = {
      type: 'checkIns',
      data: checkIns.map(c => ({
        id: c.id,
        user: c.user,
        locationName: c.locationName,
        latitude: c.latitude,
        longitude: c.longitude,
        timestamp: c.createdAt.getTime(),
        statusEmoji: c.statusEmoji
      }))
    };

    broadcast(data);
  } catch (error) {
    console.error('Error broadcasting check-ins:', error);
  }
};

export const broadcastEvents = async () => {
  try {
    const events = await prisma.event.findMany({
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true }
        },
        attendees: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true }
            }
          }
        }
      }
    });

    const data = {
      type: 'events',
      data: events.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date.getTime(),
        creator: e.creator,
        attendees: e.attendees.map(a => a.user)
      }))
    };

    broadcast(data);
  } catch (error) {
    console.error('Error broadcasting events:', error);
  }
};

const broadcast = (data: any) => {
  const message = JSON.stringify(data);

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};
