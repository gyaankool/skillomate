// import { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const navigate = useNavigate();
//   const [chatSessions, setChatSessions] = useState(() => {
//     const storedSessions = localStorage.getItem('chatSessions');
//     return storedSessions ? JSON.parse(storedSessions) : [];
//   });
//   const [currentChatId, setCurrentChatId] = useState(null);

//   // Persist chatSessions to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
//   }, [chatSessions]);

//   const loadChat = (chatId) => {
//     setCurrentChatId(chatId);
//     navigate('/dashboard'); // Navigate to Dashboard to view the chat
//   };

//   const deleteChat = (chatId) => {
//     const updatedSessions = chatSessions.filter((chat) => chat._id !== chatId);
//     setChatSessions(updatedSessions);
//     if (currentChatId === chatId) {
//       setCurrentChatId(null);
//     }
//   };

//   const createNewChat = () => {
//     // Your logic to create a new chat session (e.g., API call or local creation)
//     // For example:
//     const newChat = {
//       _id: Date.now().toString(), // Temporary ID; replace with real logic
//       title: 'New Chat',
//       createdAt: Date.now(),
//     };
//     setChatSessions([newChat, ...chatSessions]);
//     setCurrentChatId(newChat._id);
//     navigate('/dashboard');
//   };

//   return (
//     <ChatContext.Provider
//       value={{
//         chatSessions,
//         setChatSessions,
//         currentChatId,
//         setCurrentChatId,
//         loadChat,
//         deleteChat,
//         createNewChat,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChat = () => useContext(ChatContext);


import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const navigate = useNavigate();
  const [chatSessions, setChatSessions] = useState(() => {
    const storedSessions = localStorage.getItem('chatSessions');
    return storedSessions ? JSON.parse(storedSessions) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(() => {
    return localStorage.getItem('currentChatId') || null;
  });
  const [chatHistory, setChatHistory] = useState([]);

  // Fetch auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch chat sessions from backend
  const fetchChatSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping chat load');
        return;
      }
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChatSessions(data.data || []);
          localStorage.setItem('chatSessions', JSON.stringify(data.data || []));
        } else {
          console.error('Error loading chats:', data);
        }
      } else {
        console.error('Error loading chats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };


  // Load chat messages for a given chatId
  const loadChatMessages = async (chatId) => {
    try {
      console.log('Loading messages for chat:', chatId);
      const response = await fetch(`http://localhost:5000/api/chat/${chatId}/messages`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      console.log('Load messages response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Chat messages loaded:', data.data);
          setChatHistory(data.data || []);
        } else {
          console.error('Failed to load messages:', data.error);
          setChatHistory([]);
        }
      } else if (response.status === 404) {
        console.warn('Messages endpoint returned 404, checking chat session data');
        const chatResponse = await fetch(`http://localhost:5000/api/chat/${chatId}`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          if (chatData.success && chatData.data.messages) {
            console.log('Loaded messages from chat data:', chatData.data.messages);
            setChatHistory(chatData.data.messages || []);
          } else {
            console.error('No messages found in chat data:', chatData);
            setChatHistory([]);
          }
        } else {
          console.error('Failed to load chat data:', chatResponse.status);
          setChatHistory([]);
        }
      } else {
        console.error('Error loading chat messages:', response.status);
        setChatHistory([]);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error.message);
      setChatHistory([]);
    }
  };

  // Load chat sessions and restore current chat on mount
  useEffect(() => {
    fetchChatSessions();
    const savedChatId = localStorage.getItem('currentChatId');
    if (savedChatId) {
      setCurrentChatId(savedChatId);
      loadChatMessages(savedChatId); 
    }
  }, []);

  // Persist chatSessions and currentChatId to localStorage
  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('currentChatId', currentChatId);
    } else {
      localStorage.removeItem('currentChatId');
    }
  }, [currentChatId]);

  // const loadChat = async (chatId) => {
  //   setCurrentChatId(chatId);
  //   navigate('/dashboard'); // Navigate to Dashboard to view the chat
  // };

  // Load chat and its messages
  const loadChat = async (chatId) => {
    if (!chatId) {
      console.log('No chat ID provided, cannot load chat');
      return;
    }
    console.log('Loading chat:', chatId);
    setCurrentChatId(chatId);
    await loadChatMessages(chatId); // Fetch messages for the selected chat
    navigate('/dashboard');
  };
  
  const deleteChat = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const updatedSessions = chatSessions.filter((chat) => chat._id !== chatId);
        setChatSessions(updatedSessions);
        if (currentChatId === chatId) {
          setCurrentChatId(null);
          setChatHistory([]);
          navigate('/dashboard');
        }
      } else {
        console.error('Error deleting chat:', response.status);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, cannot create chat');
        return;
      }
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: 'New Chat' }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newChat = data.data;
          setChatSessions([newChat, ...chatSessions]);
          setCurrentChatId(newChat._id);
          setChatHistory([]);
          navigate('/dashboard');
        } else {
          console.error('Error creating chat:', data);
        }
      } else {
        console.error('Error creating chat:', response.status);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  
  return (
    <ChatContext.Provider
      value={{
        chatSessions,
        setChatSessions,
        currentChatId,
        setCurrentChatId,
        chatHistory,
        setChatHistory,
        loadChat,
        deleteChat,
        createNewChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);