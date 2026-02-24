import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../../store/authStore';
import API from '../../api/axiosConfig';
import { format } from 'date-fns';

const TeamChat = ({ teamId }) => {
    const { userInfo } = useAuthStore();
    const [messages, setMessagesState] = useState([]); // we'll use a ref for latest messages to avoid stale closures in socket
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    // Proper state management trick for sockets
    const messagesRef = useRef([]);
    const setMessages = (data) => {
        messagesRef.current = data;
        setMessagesState(data);
    };

    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // 1. Fetch historical messages
        const fetchMessages = async () => {
            try {
                const { data } = await API.get(`/messages/${teamId}`);
                setMessages(data);
            } catch (err) {
                console.error('Failed to fetch messages:', err);
            }
        };
        fetchMessages();

        // 2. Initialize Socket Connection
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            // Join the team's specific chat room
            socketRef.current.emit('join_team', teamId);
        });

        socketRef.current.on('receive_message', (message) => {
            // Append new message to existing messages
            setMessages([...messagesRef.current, message]);
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            socketRef.current.disconnect();
        };
    }, [teamId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !isConnected) return;

        const messageData = {
            teamId,
            senderId: userInfo._id,
            senderName: { firstName: userInfo.firstName, lastName: userInfo.lastName },
            content: newMessage.trim()
        };

        socketRef.current.emit('send_message', messageData);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
                <h3 className="font-bold">Team Chat</h3>
                <div className="flex items-center gap-2 text-sm">
                    <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10 italic">No messages yet. Say hi to your team!</div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMine = msg.sender._id === userInfo._id;
                        return (
                            <div key={msg._id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                {!isMine && <span className="text-xs text-gray-500 mb-1 ml-1">{msg.sender.firstName}</span>}
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMine
                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                                    }`}>
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 mx-1">
                                    {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : 'Just now'}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || !isConnected}
                    className="bg-indigo-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default TeamChat;
