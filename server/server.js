const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store connected users and admins
const connectedUsers = new Map();
const connectedAdmins = new Map();
const userSessions = new Map(); // Store user chat sessions

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user identification
  socket.on("identify-user", (userData) => {
    connectedUsers.set(socket.id, {
      ...userData,
      connectedAt: new Date(),
    });
    console.log("User identified:", userData);

    // Notify admins of new user
    io.to("admin").emit("user-connected", {
      socketId: socket.id,
      userData: connectedUsers.get(socket.id),
      totalUsers: connectedUsers.size,
    });
  });

  // Handle admin joining
  socket.on("join-admin", (adminData) => {
    socket.join("admin");
    connectedAdmins.set(socket.id, {
      ...adminData,
      connectedAt: new Date(),
    });
    console.log("Admin joined:", adminData);

    // Send current stats to admin
    socket.emit("admin-stats", {
      connectedUsers: connectedUsers.size,
      connectedAdmins: connectedAdmins.size,
      usersList: Array.from(connectedUsers.entries()).map(
        ([socketId, userData]) => ({
          socketId,
          ...userData,
        })
      ),
    });
  });

  // Handle user messages to admin
  socket.on("user-to-admin", (data) => {
    console.log("User message to admin:", data);

    const userInfo = connectedUsers.get(socket.id);
    const messageData = {
      ...data,
      socketId: socket.id,
      userInfo,
      timestamp: new Date().toISOString(),
    };

    // Store message in user session
    if (!userSessions.has(socket.id)) {
      userSessions.set(socket.id, []);
    }
    userSessions.get(socket.id).push({
      type: "user",
      content: data.content,
      timestamp: messageData.timestamp,
    });

    // Send to all admins
    io.to("admin").emit("user-message", messageData);
  });

  // Handle admin responses
  socket.on("admin-response", (data) => {
    console.log("Admin response:", data);

    const adminInfo = connectedAdmins.get(socket.id);
    const messageData = {
      ...data,
      adminInfo,
      timestamp: new Date().toISOString(),
    };

    // Store message in user session if targeting specific user
    if (data.targetSocketId && userSessions.has(data.targetSocketId)) {
      userSessions.get(data.targetSocketId).push({
        type: "admin",
        content: data.content,
        timestamp: messageData.timestamp,
        adminInfo,
      });
    }

    // Send to specific user or broadcast
    if (data.targetSocketId) {
      io.to(data.targetSocketId).emit("admin-message", messageData);
      // Also notify other admins about the response
      socket.to("admin").emit("admin-sent-message", messageData);
    } else {
      socket.broadcast.emit("admin-message", messageData);
    }
  });

  // Handle typing indicators
  socket.on("user-typing", (data) => {
    const userInfo = connectedUsers.get(socket.id);
    io.to("admin").emit("user-typing", {
      ...data,
      socketId: socket.id,
      userInfo,
    });
  });

  socket.on("user-stop-typing", () => {
    io.to("admin").emit("user-stop-typing", { socketId: socket.id });
  });

  socket.on("admin-typing", (data) => {
    if (data.targetSocketId) {
      io.to(data.targetSocketId).emit("admin-typing", data);
    } else {
      socket.broadcast.emit("admin-typing", data);
    }
  });

  socket.on("admin-stop-typing", (data) => {
    if (data.targetSocketId) {
      io.to(data.targetSocketId).emit("admin-stop-typing", data);
    } else {
      socket.broadcast.emit("admin-stop-typing", data);
    }
  });

  // Handle getting chat history
  socket.on("get-chat-history", (callback) => {
    const history = userSessions.get(socket.id) || [];
    callback(history);
  });

  // Handle admin requesting user chat history
  socket.on("get-user-history", (data, callback) => {
    const history = userSessions.get(data.socketId) || [];
    callback(history);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    const wasAdmin = connectedAdmins.has(socket.id);
    const wasUser = connectedUsers.has(socket.id);

    // Clean up
    connectedUsers.delete(socket.id);
    connectedAdmins.delete(socket.id);

    // Keep user sessions for a while (you might want to persist this)
    // userSessions.delete(socket.id)

    // Notify admins if a user disconnected
    if (wasUser) {
      io.to("admin").emit("user-disconnected", {
        socketId: socket.id,
        totalUsers: connectedUsers.size,
      });
    }

    // Notify about admin disconnect
    if (wasAdmin) {
      io.to("admin").emit("admin-disconnected", {
        socketId: socket.id,
        totalAdmins: connectedAdmins.size,
      });
    }
  });
});

// REST API endpoints
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    connectedUsers: connectedUsers.size,
    connectedAdmins: connectedAdmins.size,
    uptime: process.uptime(),
  });
});

app.get("/stats", (req, res) => {
  res.json({
    connectedUsers: connectedUsers.size,
    connectedAdmins: connectedAdmins.size,
    totalSessions: userSessions.size,
    users: Array.from(connectedUsers.entries()).map(([socketId, userData]) => ({
      socketId,
      ...userData,
    })),
    admins: Array.from(connectedAdmins.entries()).map(
      ([socketId, adminData]) => ({
        socketId,
        ...adminData,
      })
    ),
  });
});

// Get chat history for a specific user (admin endpoint)
app.get("/chat-history/:socketId", (req, res) => {
  const { socketId } = req.params;
  const history = userSessions.get(socketId) || [];
  res.json({ history, socketId });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Stats endpoint: http://localhost:${PORT}/stats`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});