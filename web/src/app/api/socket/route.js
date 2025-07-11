import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

export async function GET(req) {
  if (!global.io) {
    console.log("Initializing Socket.IO server...");

    // Create HTTP server
    const httpServer = new HTTPServer();

    // Create Socket.IO server
    global.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    global.io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("join-admin", () => {
        socket.join("admin");
        console.log("Admin joined:", socket.id);
      });

      socket.on("admin-response", (data) => {
        console.log("Admin response:", data);
        socket.broadcast.emit("admin-message", data);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    // Start the HTTP server
    const port = process.env.SOCKET_PORT || 3001;
    httpServer.listen(port, () => {
      console.log(`Socket.IO server running on port ${port}`);
    });
  }

  return new Response("Socket.IO server initialized", { status: 200 });
}
