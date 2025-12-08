import { Server, Socket } from 'socket.io';

let io: Server;

export const initializeSocket = (socketIo: Server) => {
    io = socketIo;
    io.on("connection", (socket: Socket) => {
        console.log("Connected to socket.io");

        // User setup (Join personal room)
        socket.on("setup", (userData) => {
            if (!userData || !userData._id) return;
            socket.join(userData._id);
            
            // Store userId on socket for disconnect handling
            (socket as any).userId = userData._id;
            
            socket.emit("connected");
            
            // Broadcast online status to everyone
            io.emit("user online", userData._id);
        });

        // Join a chat room
        socket.on("join chat", (room) => {
            socket.join(room);
            console.log("User Joined Room: " + room);
        });

        // Typing indicators
        socket.on("typing", (room) => socket.in(room).emit("typing"));
        socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

        // New Message
        socket.on("new message", (newMessageReceived) => {
            const chat = newMessageReceived.conversationId;

            if (!chat || !chat.participants) return console.log("chat.participants not defined");

            chat.participants.forEach((participant: any) => {
                if (participant.user._id == newMessageReceived.sender.user._id) return;
                socket.in(participant.user._id).emit("message received", newMessageReceived);
            });
        });

        socket.off("setup", () => {
            console.log("USER DISCONNECTED");
            const userId = (socket as any).userId;
            if (userId) {
                socket.leave(userId);
                io.emit("user offline", userId);
            }
        });

        // WebRTC Signaling
        socket.on("callUser", ({ userToCall, signalData, from, name }) => {
            console.log(`[Socket] Call initiated from ${from} to ${userToCall}`);
            // Emit to the specific user's room
            io.to(userToCall).emit("callUser", { signal: signalData, from, name });
        });

        socket.on("answerCall", (data) => {
            console.log(`[Socket] Call accepted by ${data.to}`); // Note: 'to' here is actually the Caller ID being answered
            io.to(data.to).emit("callAccepted", data.signal);
        });

        socket.on("ice-candidate", ({ target, candidate }) => {
            console.log(`[Socket] ICE Candidate relay to ${target}`);
            io.to(target).emit("ice-candidate", candidate);
        });

        socket.on("endCall", ({ to }) => {
             console.log(`[Socket] Call ended for ${to}`);
             io.to(to).emit("callEnded");
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
            const userId = (socket as any).userId;
            if (userId) {
                io.emit("user offline", userId);
            }
        });
    });
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
