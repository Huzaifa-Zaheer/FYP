import { useParams } from 'react-router-dom';
import ChatBox from '../components/ChatBox';

const ChatRoom = () => {
  const { rideId } = useParams(); // ✅ Extract rideId from route like /chat/:rideId

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {/* ✅ Pass it to ChatBox */}
      <ChatBox rideId={rideId} />
    </div>
  );
};

export default ChatRoom;
