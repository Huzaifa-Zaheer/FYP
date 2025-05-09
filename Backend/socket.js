// const socketIo = require('socket.io');
// const userModel = require('./models/user.model');
// const captainModel = require('./models/captain.model');

// let io;

// function initializeSocket(server) {
//     io = socketIo(server, {
//         cors: {
//             origin: '*',
//             methods: [ 'GET', 'POST' ]
//         }
//     });

//     io.on('connection', (socket) => {
//         console.log(`Client connected: ${socket.id}`);


//         socket.on('join', async (data) => {
//             const { userId, userType } = data;

//             if (userType === 'user') {
//                 await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
//             } else if (userType === 'captain') {
//                 await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
//             }
//         });


//         socket.on('update-location-captain', async (data) => {
//             const { userId, location } = data;

//             if (!location || !location.ltd || !location.lng) {
//                 return socket.emit('error', { message: 'Invalid location data' });
//             }

//             await captainModel.findByIdAndUpdate(userId, {
//                 location: {
//                     ltd: location.ltd,
//                     lng: location.lng
//                 }
//             });
//         });

//         socket.on('disconnect', () => {
//             console.log(`Client disconnected: ${socket.id}`);
//         });
//     });
// }

// const sendMessageToSocketId = (socketId, messageObject) => {

// console.log(messageObject);

//     if (io) {
//         io.to(socketId).emit(messageObject.event, messageObject.data);
//     } else {
//         console.log('Socket.io not initialized.');
//     }
// }

// module.exports = { initializeSocket, sendMessageToSocketId };

const { Server } = require('socket.io');
const Chat = require('./models/chat.model');
const Message = require('./models/message.model');
const Ride = require('./models/ride.model');
const { verifySocketToken } = require('./middlewares/jwt.helper');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');

let io;

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // JWT Middleware for Socket.IO
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            const decoded = await verifySocketToken(token);

            // Attach decoded user info to socket
            socket.user = {
                id: decoded._id,
                role: decoded.role // optional if needed
            };

            next();
        } catch (err) {
            console.error('Socket auth error:', err.message);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id} (${socket.user.id})`);

        socket.on('join-chat', async ({ rideId }) => {
            try {
                const ride = await Ride.findById(rideId);
                if (!ride) return socket.emit('error', { message: 'Ride not found' });

                const userId = socket.user.id;

                if (![ride.userId.toString(), ride.captainId.toString()].includes(userId)) {
                    return socket.emit('error', { message: 'Unauthorized access to chat' });
                }

                socket.join(`ride_${rideId}`);

                let chat = await Chat.findOne({ rideId });
                if (!chat) {
                    chat = await Chat.create({
                        rideId,
                        participants: [ride.userId, ride.captainId]
                    });
                }

                socket.emit('joined-chat', { chatId: chat._id });
            } catch (err) {
                console.error('Join chat error:', err);
                socket.emit('error', { message: 'Server error joining chat' });
            }
        });

        // socket.on('send-message', async ({ chatId, text }) => {
        //     try {
        //         const senderId = socket.user.id;

        //         const chat = await Chat.findById(chatId);
        //         if (!chat) return socket.emit('error', { message: 'Chat not found' });

        //         const message = await Message.create({ chatId, senderId, text });
        //         const rideRoom = `ride_${chat.rideId}`;

        //         io.to(rideRoom).emit('receive-message', {
        //             _id: message._id,
        //             senderId,
        //             text,
        //             createdAt: message.createdAt,
        //         });
        //     } catch (err) {
        //         console.error('Send message error:', err);
        //         socket.emit('error', { message: 'Server error sending message' });
        //     }
        // });
        socket.on('send-message', async ({ chatId, text }) => {
            try {
                const senderId = socket.user.id;
                const chat = await Chat.findById(chatId);
                if (!chat) return socket.emit('error', { message: 'Chat not found' });

                const message = await Message.create({ chatId, senderId, text });

                const sender = await userModel.findById(senderId); // fetch name, role, avatar

                const rideRoom = `ride_${chat.rideId}`;

                io.to(rideRoom).emit('receive-message', {
                    _id: message._id,
                    senderId,
                    text,
                    createdAt: message.createdAt,
                    senderName: sender.name,
                    senderRole: sender.role,
                    senderAvatar: sender.avatarUrl, // ensure this field exists in user model
                });
            } catch (err) {
                console.error('Send message error:', err);
                socket.emit('error', { message: 'Server error sending message' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
}

module.exports = { initializeSocket, io };