import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

const ChatWithFile = () => {
    const { user } = useSelector((state) => state.user);
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchUserFiles = async () => {
        setIsLoadingFiles(true);
        try {
            const response = await api.get('/upload/files', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setFiles(response.data);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        } finally {
            setIsLoadingFiles(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !selectedFile) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await api.post('/analysis/chat', {
                message: inputMessage,
                fileId: selectedFile
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            const aiMessage = {
                id: Date.now() + 1,
                text: response.data.response,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.value);
        setMessages([]); // Clear chat when file changes
    };

    useEffect(() => {
        if (user && user.token) {
            fetchUserFiles();
        }
    }, [user]);

    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white">Chat with Your Files</h2>
                    <p className="text-blue-100 mt-1">Ask questions about your uploaded data files</p>
                </div>

                {/* File Selection */}
                <div className="p-6 border-b border-gray-200">
                    <label htmlFor="file-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Select a file to chat about:
                    </label>
                    <select
                        id="file-select"
                        value={selectedFile}
                        onChange={handleFileChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoadingFiles}
                    >
                        <option value="">Choose a file...</option>
                        {files.map((file) => (
                            <option key={file._id} value={file._id}>
                                {file.fileName}
                            </option>
                        ))}
                    </select>
                    {isLoadingFiles && (
                        <p className="text-sm text-gray-500 mt-2">Loading files...</p>
                    )}
                </div>

                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto p-6 bg-gray-50">
                    {selectedFile ? (
                        messages.length > 0 ? (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                message.sender === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : message.isError
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-white text-gray-800 border border-gray-200'
                                            }`}
                                        >
                                            <p className="text-sm">{message.text}</p>
                                            <p className={`text-xs mt-1 ${
                                                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                            }`}>
                                                {message.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                <span className="text-sm">AI is thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-500">
                                    <div className="text-6xl mb-4">💬</div>
                                    <p className="text-lg font-medium">Start chatting about your data!</p>
                                    <p className="text-sm">Ask questions like:</p>
                                    <ul className="text-sm mt-2 space-y-1">
                                        <li>• "What are the main trends in this data?"</li>
                                        <li>• "Show me the highest values"</li>
                                        <li>• "What insights can you find?"</li>
                                    </ul>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                                <div className="text-6xl mb-4">📁</div>
                                <p className="text-lg font-medium">Select a file to start chatting</p>
                                <p className="text-sm">Choose a file from the dropdown above</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Message Input */}
                {selectedFile && (
                    <form onSubmit={sendMessage} className="p-6 border-t border-gray-200">
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask a question about your data..."
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isLoading}
                                className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    (!inputMessage.trim() || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ChatWithFile; 