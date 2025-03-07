let io;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"], // Allow specific methods
        allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
        credentials: true, // Allow credentials
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io does not initialized.");
    }
    return io;
  },
};
