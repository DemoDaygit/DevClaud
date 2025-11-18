import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

// Import routes
import graphRoutes from './routes/graph.js';
import analyticsRoutes from './routes/analytics.js';
import exportRoutes from './routes/export.js';
import learningRoutes from './routes/learning.js';

// Import Neo4j connection
import { testConnection } from './config/neo4j.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Routes
app.use('/api/graph', graphRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/learning', learningRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    name: 'Swarm AI Knowledge Graph API',
    version: '4.0.0',
    endpoints: {
      graph: '/api/graph',
      analytics: '/api/analytics',
      export: '/api/export',
      health: '/health'
    },
    documentation: 'https://github.com/DemoDaygit/DevClaud'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Create HTTP server
const server = createServer(app);

// WebSocket Server for real-time updates
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());

    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify({
          type: 'update',
          timestamp: new Date().toISOString(),
          data: message.toString()
        }));
      }
    });
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Swarm AI Knowledge Graph WebSocket'
  }));
});

// Start server
async function startServer() {
  try {
    // Test Neo4j connection
    console.log('Testing Neo4j connection...');
    await testConnection();
    console.log('✓ Neo4j connection successful');

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 Swarm AI Knowledge Graph API v4.0.0                   ║
║  📊 Server running on http://localhost:${PORT}              ║
║  🔌 WebSocket available at ws://localhost:${PORT}/ws       ║
║  💾 Neo4j UI: http://localhost:7474                       ║
║  📚 API Docs: http://localhost:${PORT}/api                 ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
