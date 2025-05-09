// import { useEffect, useState, useRef } from 'react';
// import io from 'socket.io-client';

// const socket = io(`${import.meta.env.VITE_BASE_URL}`, {
//   auth: {
//     token: localStorage.getItem('token'), // replace with actual token logic
//   }
// });

// const ChatBox = ({ rideId }) => {
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState('');
//   const chatIdRef = useRef(null);

//   useEffect(() => {
//     socket.emit('join-chat', { rideId });

//     socket.on('joined-chat', ({ chatId }) => {
//       chatIdRef.current = chatId;
//     });

//     socket.on('receive-message', (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     socket.on('error', (err) => {
//       console.error('Socket error:', err.message);
//     });

//     return () => {
//       socket.off('receive-message');
//       socket.off('joined-chat');
//       socket.disconnect();
//     };
//   }, [rideId]);

//   const sendMessage = () => {
//     if (text.trim()) {
//       socket.emit('send-message', {
//         chatId: chatIdRef.current,
//         text,
//       });
//       setText('');
//     }
//   };

//   return (
//     <div className="w-full max-w-md p-4 border rounded bg-white shadow">
//       <div className="h-64 overflow-y-auto border-b mb-4">
//         {messages.map((msg) => (
//           <div key={msg._id} className="my-2">
//             <strong>{msg.senderId}</strong>: {msg.text}
//           </div>
//         ))}
//       </div>
//       <div className="flex">
//         <input
//           className="flex-1 border px-3 py-1 rounded-l"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//         />
//         <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-1 rounded-r">
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatBox;
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io(`${import.meta.env.VITE_BASE_URL}`, {
  auth: {
    token: localStorage.getItem('token'),
  },
});

const ChatBox = ({ rideId }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const chatIdRef = useRef(null);
  const myUserId = localStorage.getItem('userId'); // Store this when user logs in

  useEffect(() => {
    socket.connect();
    socket.emit('join-chat', { rideId });

    socket.on('joined-chat', ({ chatId }) => {
      chatIdRef.current = chatId;
    });

    socket.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
    });

    return () => {
      socket.off('receive-message');
      socket.off('joined-chat');
      socket.disconnect();
    };
  }, [rideId]);

  const sendMessage = () => {
    if (text.trim()) {
      socket.emit('send-message', {
        chatId: chatIdRef.current,
        text,
      });
      setText('');
    }
  };

  return (
    <div className="w-full max-w-md p-4 border rounded bg-white shadow">
      <div className="h-64 overflow-y-auto border-b mb-4 space-y-2">
        {messages.map((msg) => {
          const isMe = msg.senderId === myUserId;
          return (
            <div
              key={msg._id}
              className={`flex items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <img
                  src={msg.senderAvatar || 'https://via.placeholder.com/32'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className={`max-w-xs px-3 py-2 rounded-lg ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                <div className="text-xs font-semibold">
                  {msg.senderName} ({msg.senderRole})
                </div>
                <div>{msg.text}</div>
                <div className="text-[10px] text-gray-500 text-right mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
              </div>
              {isMe && (
                <img
                  src={msg.senderAvatar || 'https://via.placeholder.com/32'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex">
        <input
          className="flex-1 border px-3 py-1 rounded-l"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-1 rounded-r">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
