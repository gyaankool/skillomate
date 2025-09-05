
// import { useState, useEffect, useRef } from "react";
// import Sidebar from "../components/Sidebar";
// import { Plus, Mic, Search } from "lucide-react";
// import Navbar from "../components/Navbar";
// import ChartRenderer from "../components/ChartRenderer";
// import AudioControls from "../components/AudioControls";
// import StreamingText from "../components/StreamingText";
// import InteractiveSuggestions from "../components/InteractiveSuggestions";
// import mic from "../assets/images/mike.png";
// import send from "../assets/images/send.png";
// import attach from "../assets/images/attach.png";
// import downArrow from "../assets/images/downArrow.png";

// const Dashboard = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [user, setUser] = useState(null);

//   // Dropdown states
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedBoard, setSelectedBoard] = useState("");
//   const [selectedSubject, setSelectedSubject] = useState("");
//   const [selectedAnswerStyle, setSelectedAnswerStyle] = useState("");

//   // Chat states
//   const [message, setMessage] = useState("");
//   const [chatHistory, setChatHistory] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [audioCache, setAudioCache] = useState({});
//   const [currentAudioId, setCurrentAudioId] = useState(null);
//   const [audioProgress, setAudioProgress] = useState(0);
//   const [playbackSpeed, setPlaybackSpeed] = useState(1);
//   const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
//   const [currentChatId, setCurrentChatId] = useState(null);

//   // Helper function to set current chat ID and save to localStorage
//   const setCurrentChatIdAndSave = (chatId) => {
//     setCurrentChatId(chatId);
//     if (chatId) {
//       localStorage.setItem("currentChatId", chatId);
//     } else {
//       localStorage.removeItem("currentChatId");
//     }
//   };
//   const [chatSessions, setChatSessions] = useState([]);

//   // Enhanced AI session management
//   const [aiSessionId, setAiSessionId] = useState(null);

//   // Audio states
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [audioChunks, setAudioChunks] = useState([]);
//   const audioRef = useRef(null);

//   // Dropdown options
//   const classOptions = [
//     "Class 1",
//     "Class 2",
//     "Class 3",
//     "Class 4",
//     "Class 5",
//     "Class 6",
//     "Class 7",
//     "Class 8",
//     "Class 9",
//     "Class 10",
//     "Class 11",
//     "Class 12",
//   ];
//   const boardOptions = [
//     "C.B.S.E",
//     "I.C.S.E",
//     "State Board",
//     "International Board",
//   ];
//   const subjectOptions = [
//     "Mathematics",
//     "Science",
//     "English",
//     "Hindi",
//     "Social Studies",
//     "Computer Science",
//     "Physics",
//     "Chemistry",
//     "Biology",
//     "History",
//     "Geography",
//     "Economics",
//   ];
//   const answerStyleOptions = [
//     "Simple",
//     "Detailed",
//     "Step-by-step",
//     "Visual",
//     "Interactive",
//   ];

//   useEffect(() => {
//     const userData = localStorage.getItem("user");
//     if (userData) {
//       const parsedUser = JSON.parse(userData);
//       setUser(parsedUser);
//       // Set default values from user data
//       setSelectedClass(parsedUser?.grade || "Class 1");
//       setSelectedBoard(parsedUser?.board || "C.B.S.E");
//     }

//     // Test backend connection
//     testBackendConnection();

//     // Load chat sessions and restore current chat if exists
//     loadChatSessionsAndRestore();
//   }, []);

//   // Update AI session context when dropdowns change
//   useEffect(() => {
//     if (
//       aiSessionId &&
//       (selectedClass || selectedBoard || selectedSubject || selectedAnswerStyle)
//     ) {
//       const contextUpdates = {};
//       if (selectedClass) contextUpdates.grade = selectedClass;
//       if (selectedBoard) contextUpdates.board = selectedBoard;
//       if (selectedSubject) contextUpdates.subject = selectedSubject;
//       if (selectedAnswerStyle)
//         contextUpdates.answer_style = selectedAnswerStyle;

//       // Only update if we have changes
//       if (Object.keys(contextUpdates).length > 0) {
//         updateAiSessionContext(contextUpdates);
//       }
//     }
//   }, [
//     selectedClass,
//     selectedBoard,
//     selectedSubject,
//     selectedAnswerStyle,
//     aiSessionId,
//   ]);

//   // Monitor chat history changes
//   useEffect(() => {
//     console.log("Chat history updated:", chatHistory);
//     console.log("Current chat ID:", currentChatId);
//   }, [chatHistory, currentChatId]);

//   // Cleanup audio cache when component unmounts
//   useEffect(() => {
//     return () => {
//       // Clean up audio URLs to prevent memory leaks
//       Object.values(audioCache).forEach((url) => {
//         URL.revokeObjectURL(url);
//       });
//     };
//   }, [audioCache]);

//   // Clear old audio cache entries (keep only last 20)
//   useEffect(() => {
//     const cacheKeys = Object.keys(audioCache);
//     if (cacheKeys.length > 20) {
//       const keysToRemove = cacheKeys.slice(0, cacheKeys.length - 20);
//       const newCache = { ...audioCache };
//       keysToRemove.forEach((key) => {
//         URL.revokeObjectURL(newCache[key]);
//         delete newCache[key];
//       });
//       setAudioCache(newCache);
//     }
//   }, [audioCache]);

//   // Keyboard shortcuts for audio controls
//   useEffect(() => {
//     const handleKeyPress = (e) => {
//       if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
//         return;

//       switch (e.key) {
//         case " ": // Spacebar - play/pause current audio
//           e.preventDefault();
//           if (isPlaying) {
//             stopAudio();
//           }
//           break;
//         case "ArrowLeft": // Left arrow - skip backward
//           e.preventDefault();
//           skipAudio(-10);
//           break;
//         case "ArrowRight": // Right arrow - skip forward
//           e.preventDefault();
//           skipAudio(10);
//           break;
//         case "Escape": // Escape - stop audio
//           e.preventDefault();
//           stopAudio();
//           break;
//       }
//     };

//     document.addEventListener("keydown", handleKeyPress);
//     return () => document.removeEventListener("keydown", handleKeyPress);
//   }, [isPlaying]);

//   // Auto-generate audio for AI responses (optional feature)
//   const autoGenerateAudio = async (message) => {
//     if (
//       message.type === "ai" &&
//       !audioCache[`${message.id}_${message.originalText?.substring(0, 50)}`]
//     ) {
//       // Generate audio in background for faster playback later
//       setTimeout(() => {
//         playAudioResponse(message.content, message.originalText, message.id);
//       }, 1000);
//     }
//   };

//   const clearAudioCache = () => {
//     Object.values(audioCache).forEach((url) => {
//       URL.revokeObjectURL(url);
//     });
//     setAudioCache({});
//   };

//   const testBackendConnection = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.log("No token found for backend test");
//         return;
//       }

//       console.log("Testing backend connection...");
//       const response = await fetch("http://localhost:5000/api/chat/test", {
//         headers: getAuthHeaders(),
//       });

//       console.log("Test response status:", response.status);

//       if (response.ok) {
//         const data = await response.json();
//         console.log("Backend test successful:", data);
//       } else {
//         const errorData = await response.json();
//         console.error("Backend test failed:", errorData);
//       }
//     } catch (error) {
//       console.error("Backend test error:", error);
//     }
//   };

//   const getAuthHeaders = () => {
//     const token = localStorage.getItem("token");
//     return {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     };
//   };

//   // const loadChatSessionsAndRestore = async () => {
//   //   try {
//   //     const token = localStorage.getItem("token");
//   //     if (!token) {
//   //       console.log("No token found, skipping chat load");
//   //       return;
//   //     }

//   //     console.log("Loading chat sessions...");
//   //     const response = await fetch("http://localhost:5000/api/chat", {
//   //       method: "GET",
//   //       headers: getAuthHeaders(),
//   //     });

//   //     console.log("Response status:", response.status);

//   //     if (response.ok) {
//   //       const data = await response.json();
//   //       console.log("Chat sessions loaded:", data);
//   //       if (data.success) {
//   //         setChatSessions(data.data);

//   //         // Check if there's a saved current chat ID
//   //         const savedChatId = localStorage.getItem("currentChatId");
//   //         if (savedChatId) {
//   //           console.log("Found saved chat ID:", savedChatId);

//   //           // Check if the saved chat still exists in the loaded sessions
//   //           const savedChat = data.data.find(
//   //             (chat) => chat._id === savedChatId
//   //           );
//   //           if (savedChat) {
//   //             console.log("Restoring saved chat:", savedChat);
//   //             setCurrentChatIdAndSave(savedChatId);

//   //             // Load the chat messages
//   //             await loadChatMessages(savedChatId);

//   //             // Create AI session for the restored chat
//   //             const sessionCreated = await createAiSession();
//   //             if (!sessionCreated) {
//   //               console.error("Failed to create AI session for restored chat");
//   //             }
//   //           } else {
//   //             console.log("Saved chat not found, clearing saved chat ID");
//   //             localStorage.removeItem("currentChatId");
//   //           }
//   //         }
//   //       }
//   //     } else {
//   //       const errorData = await response.json();
//   //       console.error("Error loading chats:", errorData);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error loading chat sessions:", error);
//   //   }
//   // };

//   // const loadChatMessages = async (chatId) => {
//   //   try {
//   //     console.log("Loading messages for chat:", chatId);
//   //     const response = await fetch(
//   //       `http://localhost:5000/api/chat/${chatId}/messages`,
//   //       {
//   //         method: "GET",
//   //         headers: getAuthHeaders(),
//   //       }
//   //     );

//   //     if (response.ok) {
//   //       const data = await response.json();
//   //       if (data.success) {
//   //         console.log("Chat messages loaded:", data.data);
//   //         setChatHistory(data.data );
//   //       }
//   //     } else {
//   //       console.error("Error loading chat messages:", response.status);
//   //       setChatHistory([]);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error loading chat messages:", error);
//   //     setChatHistory([]);
//   //   }
//   // };


//   const loadChatSessionsAndRestore = async () => {
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       console.log("No token found, skipping chat load");
//       return;
//     }

//     console.log("Loading chat sessions...");
//     const response = await fetch("http://localhost:5000/api/chat", {
//       method: "GET",
//       headers: getAuthHeaders(),
//     });

//     console.log("Response status:", response.status);

//     if (response.ok) {
//       const data = await response.json();
//       console.log("Chat sessions loaded:", data);
//       if (data.success) {
//         setChatSessions(data.data);

//         // Check if there's a saved current chat ID
//         const savedChatId = localStorage.getItem("currentChatId");
//         if (savedChatId) {
//           console.log("Found saved chat ID:", savedChatId);

//           // Check if the saved chat still exists in the loaded sessions
//           const savedChat = data.data.find((chat) => chat._id === savedChatId);
//           if (savedChat) {
//             console.log("Restoring saved chat:", savedChat);
//             // Use loadChat to properly load the chat and its messages
//             await loadChat(savedChatId);
//           } else {
//             console.log("Saved chat not found, clearing saved chat ID");
//             localStorage.removeItem("currentChatId");
//             setChatHistory([]);
//           }
//         } else {
//           setChatHistory([]);
//         }
//       }
//     } else {
//       const errorData = await response.json();
//       console.error("Error loading chats:", errorData);
//       setChatHistory([]);
//     }
//   } catch (error) {
//     console.error("Error loading chat sessions:", error);
//     setChatHistory([]);
//   }
// };


//   const loadChatMessages = async (chatId) => {
//   try {
//     console.log("Loading messages for chat:", chatId);
//     const response = await fetch(
//       `http://localhost:5000/api/chat/${chatId}/messages`,
//       {
//         method: "GET",
//         headers: getAuthHeaders(),
//       }
//     );

//     console.log("Load messages response status:", response.status);

//     if (response.ok) {
//       const data = await response.json();
//       if (data.success) {
//         console.log("Chat messages loaded:", data.data);
//         setChatHistory(data.data || []); // Set chat history with fetched messages
//       } else {
//         console.error("Failed to load messages:", data.error);
//         setChatHistory([]); // Only clear if the response indicates an error
//       }
//     } else if (response.status === 404) {
//       console.warn("Messages endpoint returned 404, checking chat session data");
//       // Fallback to loading chat data to get messages
//       const chatResponse = await fetch(`http://localhost:5000/api/chat/${chatId}`, {
//         method: "GET",
//         headers: getAuthHeaders(),
//       });
//       if (chatResponse.ok) {
//         const chatData = await chatResponse.json();
//         if (chatData.success && chatData.data.messages) {
//           console.log("Loaded messages from chat data:", chatData.data.messages);
//           setChatHistory(chatData.data.messages || []);
//         } else {
//           console.error("No messages found in chat data:", chatData);
//           setChatHistory([]);
//         }
//       } else {
//         console.error("Failed to load chat data:", chatResponse.status);
//         setChatHistory([]);
//       }
//     } else {
//       console.error("Error loading chat messages:", response.status);
//       setChatHistory([]);
//     }
//   } catch (error) {
//     console.error("Error loading chat messages:", error.message);
//     setChatHistory([]); // Only clear on error
//   }
// };


//   const loadChatSessions = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.log("No token found, skipping chat load");
//         return;
//       }

//       console.log("Loading chat sessions...");
//       const response = await fetch("http://localhost:5000/api/chat", {
//         method: "GET",
//         headers: getAuthHeaders(),
//       });

//       console.log("Response status:", response.status);

//       if (response.ok) {
//         const data = await response.json();
//         console.log("Chat sessions loaded:", data);
//         if (data.success) {
//           setChatSessions(data.data);
//         }
//       } else {
//         const errorData = await response.json();
//         console.error("Error loading chats:", errorData);
//       }
//     } catch (error) {
//       console.error("Error loading chat sessions:", error);
//     }
//   };

//   const createNewChat = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.log("No token found, cannot create chat");
//         return;
//       }

//       console.log("Creating new chat...");

//       // Only include context values that are not empty
//       const context = {};
//       if (selectedClass && selectedClass.trim()) {
//         context.grade = selectedClass;
//       }
//       if (selectedSubject && selectedSubject.trim()) {
//         context.subject = selectedSubject;
//       }
//       if (selectedBoard && selectedBoard.trim()) {
//         context.board = selectedBoard;
//       }
//       if (selectedAnswerStyle && selectedAnswerStyle.trim()) {
//         context.answerStyle = selectedAnswerStyle;
//       }

//       const requestBody = {
//         title: "New Chat",
//         ...(Object.keys(context).length > 0 && { context }),
//       };

//       console.log("Request body:", requestBody);

//       const response = await fetch("http://localhost:5000/api/chat", {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify(requestBody),
//       });

//       console.log("Create chat response status:", response.status);

//       if (response.ok) {
//         const data = await response.json();
//         console.log("New chat created:", data);
//         if (data.success) {
//           const newChat = data.data;
//           setCurrentChatIdAndSave(newChat._id);
//           setChatHistory([]);
//           setChatSessions((prev) => [newChat, ...prev]);

//           // Create AI session for enhanced bot immediately
//           const sessionCreated = await createAiSession();
//           if (!sessionCreated) {
//             console.error("Failed to create AI session for new chat");
//           }
//         }
//       } else {
//         const errorData = await response.json();
//         console.error("Error creating chat:", errorData);
//       }
//     } catch (error) {
//       console.error("Error creating new chat:", error);
//     }
//   };

//   const createAiSession = async () => {
//     try {
//       console.log("Creating AI session...");

//       // Use the backend endpoint that includes user context
//       const response = await fetch(
//         "http://localhost:5000/api/chat/ai-session",
//         {
//           method: "POST",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           setAiSessionId(data.session_id);
//           console.log("AI session created with user context:", data.session_id);
//           console.log("User context:", data.user_context);

//           // Update AI session with current dropdown selections
//           const contextUpdates = {};
//           if (selectedClass) contextUpdates.grade = selectedClass;
//           if (selectedBoard) contextUpdates.board = selectedBoard;
//           if (selectedSubject) contextUpdates.subject = selectedSubject;
//           if (selectedAnswerStyle)
//             contextUpdates.answer_style = selectedAnswerStyle;

//           if (Object.keys(contextUpdates).length > 0) {
//             await updateAiSessionContext(contextUpdates);
//           }

//           return true; // Success
//         } else {
//           console.error("Failed to create AI session:", data.error);
//           return false;
//         }
//       } else {
//         const errorData = await response.json().catch(() => ({}));
//         console.error(
//           "Failed to create AI session:",
//           response.status,
//           errorData
//         );
//         return false;
//       }
//     } catch (error) {
//       console.error("Error creating AI session:", error);
//       return false;
//     }
//   };

//   // const loadChat = async (chatId) => {
//   //   try {
//   //     if (!chatId) {
//   //       console.log("No chat ID provided, cannot load chat");
//   //       return;
//   //     }

//   //     const token = localStorage.getItem("token");
//   //     if (!token) {
//   //       console.log("No token found, cannot load chat");
//   //       return;
//   //     }

//   //     console.log("Loading chat:", chatId);
//   //     const response = await fetch(`http://localhost:5000/api/chat/${chatId}`, {
//   //       method: "GET",
//   //       headers: getAuthHeaders(),
//   //     });

//   //     console.log("Load chat response status:", response.status);

//   //     if (response.ok) {
//   //       const data = await response.json();
//   //       console.log("Chat loaded:", data);
//   //       if (data.success) {
//   //         const chat = data.data;
//   //         console.log("Setting current chat ID to:", chat._id);
//   //         console.log("Setting chat history to:", chat.messages);
//   //         console.log(
//   //           "Chat messages length:",
//   //           chat.messages ? chat.messages.length : 0
//   //         );
//   //         console.log("Chat messages type:", typeof chat.messages);
//   //         console.log("Chat messages is array:", Array.isArray(chat.messages));

//   //         // Set the current chat ID and messages
//   //         setCurrentChatIdAndSave(chat._id);
//   //         setChatHistory(chat.messages || []);

//   //         // Force a re-render by updating the message state
//   //         setMessage("");

//   //         // Create AI session for this chat if not exists
//   //         if (!aiSessionId) {
//   //           await createAiSession();
//   //         }

//   //         console.log("Chat loaded successfully!");
//   //       }
//   //     } else {
//   //       const errorData = await response.json();
//   //       console.error("Error loading chat:", errorData);
//   //       setChatHistory([]);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error loading chat:", error);
//   //     setChatHistory([]);
//   //   }
//   // };


//   const loadChat = async (chatId) => {
//   try {
//     if (!chatId) {
//       console.log("No chat ID provided, cannot load chat");
//       return;
//     }

//     const token = localStorage.getItem("token");
//     if (!token) {
//       console.log("No token found, cannot load chat");
//       return;
//     }

//     console.log("Loading chat:", chatId);
//     const response = await fetch(`http://localhost:5000/api/chat/${chatId}`, {
//       method: "GET",
//       headers: getAuthHeaders(),
//     });

//     console.log("Load chat response status:", response.status);

//     if (response.ok) {
//       const data = await response.json();
//       console.log("Chat loaded:", data);
//       if (data.success) {
//         const chat = data.data;
//         console.log("Setting current chat ID to:", chat._id);
//         setCurrentChatIdAndSave(chat._id);
//         // Set chat history with messages from the chat data
//         setChatHistory(chat.messages || []);

//         // Create AI session if not exists
//         if (!aiSessionId) {
//           await createAiSession();
//         }

//         console.log("Chat loaded successfully!");
//       } else {
//         console.error("Failed to load chat:", data.error);
//         setChatHistory([]);
//       }
//     } else {
//       console.error("Error loading chat:", response.status);
//       setChatHistory([]);
//     }
//   } catch (error) {
//     console.error("Error loading chat:", error.message);
//     setChatHistory([]);
//   }
// };


//   const addMessageToChat = async (message) => {
//     if (!currentChatId) {
//       console.log("No current chat ID, cannot add message");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.log("No token found, cannot add message");
//         return;
//       }

//       console.log("Adding message to chat:", currentChatId);
//       const response = await fetch(
//         `http://localhost:5000/api/chat/${currentChatId}/messages`,
//         {
//           method: "POST",
//           headers: getAuthHeaders(),
//           body: JSON.stringify({ message }),
//         }
//       );

//       console.log("Add message response status:", response.status);

//       if (response.ok) {
//         const data = await response.json();
//         console.log("Message added:", data);
//         if (data.success) {
//           // Don't overwrite local chat history, just update chat sessions
//           setChatSessions((prev) =>
//             prev.map((chat) => (chat._id === currentChatId ? data.data : chat))
//           );
//         }
//       } else {
//         const errorData = await response.json();
//         console.error("Error adding message:", errorData);
//       }
//     } catch (error) {
//       console.error("Error adding message to chat:", error);
//     }
//   };

//   const deleteChat = async (chatId) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.log("No token found, cannot delete chat");
//         return;
//       }

//       console.log("Deleting chat:", chatId);
//       const response = await fetch(`http://localhost:5000/api/chat/${chatId}`, {
//         method: "DELETE",
//         headers: getAuthHeaders(),
//       });

//       console.log("Delete chat response status:", response.status);

//       if (response.ok) {
//         console.log("Chat deleted successfully");
//         setChatSessions((prev) => prev.filter((chat) => chat._id !== chatId));
//         if (currentChatId === chatId) {
//           // Clear the saved chat ID since this chat was deleted
//           localStorage.removeItem("currentChatId");
//           createNewChat();
//         }
//       } else {
//         const errorData = await response.json();
//         console.error("Error deleting chat:", errorData);
//       }
//     } catch (error) {
//       console.error("Error deleting chat:", error);
//     }
//   };

//   const handleDropdownToggle = (dropdownName) => {
//     setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
//   };

//   const updateAiSessionContext = async (contextUpdates) => {
//     if (!aiSessionId) return;

//     try {
//       console.log("Updating AI session context:", contextUpdates);

//       const response = await fetch(
//         `http://localhost:8000/api/session/${aiSessionId}/context`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             context: contextUpdates,
//           }),
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           console.log("AI session context updated successfully");
//         }
//       } else {
//         console.error("Failed to update AI session context");
//       }
//     } catch (error) {
//       console.error("Error updating AI session context:", error);
//     }
//   };

//   const handleOptionSelect = (dropdownName, value) => {
//     let contextUpdates = {};

//     switch (dropdownName) {
//       case "class":
//         setSelectedClass(value);
//         contextUpdates = { grade: value };
//         break;
//       case "board":
//         setSelectedBoard(value);
//         contextUpdates = { board: value };
//         break;
//       case "subject":
//         setSelectedSubject(value);
//         contextUpdates = { subject: value };
//         break;
//       case "answerStyle":
//         setSelectedAnswerStyle(value);
//         contextUpdates = { answer_style: value };
//         break;
//       default:
//         break;
//     }

//     setOpenDropdown(null);

//     // Update AI session context if we have changes
//     if (Object.keys(contextUpdates).length > 0) {
//       updateAiSessionContext(contextUpdates);
//     }
//   };

//   const handleInteractiveSuggestionClick = (suggestion) => {
//     setMessage(suggestion);
//     // Automatically send the suggestion
//     setTimeout(() => {
//       sendMessage();
//     }, 100);
//   };

//   const sendMessage = async () => {
//     if (!message.trim()) return;

//     // Create new chat if none exists
//     if (!currentChatId) {
//       await createNewChat();
//       // Wait a bit for the chat to be created
//       setTimeout(async () => {
//         await processMessage();
//       }, 100);
//       return;
//     }

//     // Create AI session if not exists (before processing message)
//     if (!aiSessionId) {
//       const sessionCreated = await createAiSession();
//       if (!sessionCreated) {
//         // If AI session creation failed, show error and don't proceed
//         const errorMessage = {
//           id: Date.now().toString(),
//           type: "error",
//           content: "Unable to connect to AI service. Please try again later.",
//           timestamp: new Date().toISOString(),
//         };
//         setChatHistory([errorMessage]);
//         setIsLoading(false);
//         return;
//       }
//       // Wait a bit for AI session to be fully ready
//       setTimeout(async () => {
//         await processMessage();
//       }, 200);
//       return;
//     }

//     await processMessage();
//   };

//   const processMessage = async () => {
//     const userMessage = message.trim();
//     setMessage("");
//     setIsLoading(true);

//     console.log("Processing message:", userMessage);
//     console.log("Current chat history length:", chatHistory.length);

//     // Add user message to chat
//     const newUserMessage = {
//       id: Date.now().toString(),
//       type: "user",
//       content: userMessage,
//       timestamp: new Date().toISOString(),
//     };

//     console.log("Created user message:", newUserMessage);

//     // Update local state immediately
//     const updatedHistory = [...chatHistory, newUserMessage];
//     setChatHistory(updatedHistory);

//     console.log("Updated chat history length:", updatedHistory.length);

//     // Save user message to backend
//     await addMessageToChat(newUserMessage);

//     try {
//       const response = await fetch("http://localhost:8000/api/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           message: userMessage,
//           session_id: aiSessionId,
//           context: {
//             grade: selectedClass,
//             subject: selectedSubject,
//             board: selectedBoard,
//             answer_style: selectedAnswerStyle,
//           },
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`AI backend responded with status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.success) {
//         // Update session ID if provided in response
//         if (data.session_id && data.session_id !== aiSessionId) {
//           setAiSessionId(data.session_id);
//           console.log("Updated AI session ID:", data.session_id);
//         }

//         // Format the AI response with proper HTML tags and styling
//         const responseText = data.answer || data.response; // Handle both response formats
//         const formattedContent = await formatAIResponse(responseText);

//         const aiMessage = {
//           id: (Date.now() + 1).toString(),
//           type: "ai",
//           content: formattedContent,
//           originalText: responseText, // Store the original plain text
//           timestamp: data.timestamp,
//           isFormatted: true, // Flag to indicate this is formatted content
//           suggestions: data.suggestions || [], // Interactive suggestions
//           interactive: data.interactive || false, // Whether this is an interactive response
//           isFollowup: data.is_followup || false, // Whether this is a follow-up response
//           conversationSummary: data.conversation_summary || "", // Conversation context summary
//           contextUsed: data.metadata?.context_used || false, // Whether context was used
//         };

//         // Update chat history with AI response
//         const finalHistory = [...updatedHistory, aiMessage];
//         setChatHistory(finalHistory);

//         console.log("Final chat history length:", finalHistory.length);
//         console.log("AI message added to history");

//         // Save AI message to backend
//         await addMessageToChat(aiMessage);

//         // Check if this is a chart request and generate chart if needed
//         if (isChartRequest(userMessage)) {
//           console.log("Chart request detected, generating chart...");
//           const chartData = await generateChart(userMessage, data.response);

//           if (chartData) {
//             console.log("Generated chart data:", chartData);
//             const chartMessage = {
//               id: (Date.now() + 2).toString(),
//               type: "chart",
//               chartData: chartData,
//               timestamp: new Date().toISOString(),
//             };

//             const historyWithChart = [...finalHistory, chartMessage];
//             setChatHistory(historyWithChart);
//             await addMessageToChat(chartMessage);
//           } else {
//             console.error("Failed to generate chart data");
//           }
//         }
//       } else {
//         const errorMessage = {
//           id: (Date.now() + 1).toString(),
//           type: "error",
//           content: `Error: ${data.error}`,
//           timestamp: new Date().toISOString(),
//         };

//         // Update chat history with error message
//         const finalHistory = [...updatedHistory, errorMessage];
//         setChatHistory(finalHistory);

//         // Save error message to backend
//         await addMessageToChat(errorMessage);
//       }
//     } catch (error) {
//       const errorMessage = {
//         id: (Date.now() + 1).toString(),
//         type: "error",
//         content: "Failed to connect to AI service",
//         timestamp: new Date().toISOString(),
//       };

//       // Update chat history with error message
//       const finalHistory = [...updatedHistory, errorMessage];
//       setChatHistory(finalHistory);

//       // Save error message to backend
//       await addMessageToChat(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream);

//       recorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           setAudioChunks((prev) => [...prev, event.data]);
//         }
//       };

//       recorder.onstop = async () => {
//         const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//         await processVoiceInput(audioBlob);
//         setAudioChunks([]);
//       };

//       setMediaRecorder(recorder);
//       recorder.start();
//       setIsRecording(true);
//     } catch (error) {
//       console.error("Error starting recording:", error);
//       alert("Error accessing microphone. Please check permissions.");
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder && isRecording) {
//       mediaRecorder.stop();
//       mediaRecorder.stream.getTracks().forEach((track) => track.stop());
//       setIsRecording(false);
//     }
//   };

//   const processVoiceInput = async (audioBlob) => {
//     setIsLoading(true);

//     // Create new chat if none exists
//     if (!currentChatId) {
//       await createNewChat();
//       setTimeout(async () => {
//         await processVoiceMessage(audioBlob);
//       }, 100);
//       return;
//     }

//     await processVoiceMessage(audioBlob);
//   };

//   const processVoiceMessage = async (audioBlob) => {
//     const formData = new FormData();
//     formData.append("audio", audioBlob, "voice.wav");

//     // Add context and session_id to voice input
//     const context = {
//       grade: selectedClass,
//       subject: selectedSubject,
//       board: selectedBoard,
//       answer_style: selectedAnswerStyle,
//     };

//     formData.append("context", JSON.stringify(context));
//     if (aiSessionId) {
//       formData.append("session_id", aiSessionId);
//     }

//     try {
//       const response = await fetch("http://localhost:8000/api/voice-input", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         // Add recognized text as user message
//         const userMessage = {
//           id: Date.now().toString(),
//           type: "user",
//           content: data.text,
//           timestamp: new Date().toISOString(),
//         };

//         // Update local state immediately
//         const updatedHistory = [...chatHistory, userMessage];
//         setChatHistory(updatedHistory);

//         // Save user message to backend
//         await addMessageToChat(userMessage);

//         // Add AI response
//         if (data.ai_response && data.ai_response.success) {
//           // Format the AI response with proper HTML tags and styling
//           const formattedContent = await formatAIResponse(
//             data.ai_response.response
//           );

//           const aiMessage = {
//             id: (Date.now() + 1).toString(),
//             type: "ai",
//             content: formattedContent,
//             originalText: data.ai_response.response, // Store the original plain text
//             timestamp: data.ai_response.timestamp,
//             isFormatted: true, // Flag to indicate this is formatted content
//           };

//           // Update chat history with AI response
//           const finalHistory = [...updatedHistory, aiMessage];
//           setChatHistory(finalHistory);

//           // Save AI message to backend
//           await addMessageToChat(aiMessage);

//           // Check if this is a chart request and generate chart if needed
//           if (isChartRequest(data.text)) {
//             console.log(
//               "Chart request detected in voice input, generating chart..."
//             );
//             const chartData = await generateChart(
//               data.text,
//               data.ai_response.response
//             );

//             if (chartData) {
//               console.log("Generated chart data from voice:", chartData);
//               const chartMessage = {
//                 id: (Date.now() + 2).toString(),
//                 type: "chart",
//                 chartData: chartData,
//                 timestamp: new Date().toISOString(),
//               };

//               const historyWithChart = [...finalHistory, chartMessage];
//               setChatHistory(historyWithChart);
//               await addMessageToChat(chartMessage);
//             } else {
//               console.error("Failed to generate chart data from voice input");
//             }
//           }
//         }
//       } else {
//         const errorMessage = {
//           id: (Date.now() + 1).toString(),
//           type: "error",
//           content: `Voice recognition error: ${data.error}`,
//           timestamp: new Date().toISOString(),
//         };

//         // Update chat history with error message
//         const finalHistory = [...updatedHistory, errorMessage];
//         setChatHistory(finalHistory);

//         // Save error message to backend
//         await addMessageToChat(errorMessage);
//       }
//     } catch (error) {
//       const errorMessage = {
//         id: (Date.now() + 1).toString(),
//         type: "error",
//         content: "Failed to process voice input",
//         timestamp: new Date().toISOString(),
//       };

//       // Update chat history with error message
//       const finalHistory = [...updatedHistory, errorMessage];
//       setChatHistory(finalHistory);

//       // Save error message to backend
//       await addMessageToChat(errorMessage);
//     }
//   };

//   const playAudioResponse = async (
//     text,
//     originalText = null,
//     messageId = null
//   ) => {
//     if (isPlaying) {
//       // Stop current audio if playing
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current.currentTime = 0;
//       }
//       setIsPlaying(false);
//       setCurrentAudioId(null);
//       return;
//     }

//     try {
//       let plainText = originalText || text;
//       if (!originalText && text.includes("<") && text.includes(">")) {
//         const tempDiv = document.createElement("div");
//         tempDiv.innerHTML = text;
//         plainText = tempDiv.textContent || tempDiv.innerText || "";
//         plainText = plainText.replace(/\s+/g, " ").trim();
//       }

//       // Create a unique key for caching
//       const audioKey = `${messageId || Date.now()}_${plainText.substring(
//         0,
//         50
//       )}`;

//       // Check if audio is already cached
//       if (audioCache[audioKey]) {
//         console.log("Using cached audio for:", audioKey);
//         playCachedAudio(audioCache[audioKey], messageId);
//         return;
//       }

//       setIsGeneratingAudio(true);
//       console.log("Generating audio for text:", plainText);

//       const response = await fetch("http://localhost:8000/api/voice-output", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: plainText }),
//       });

//       const data = await response.json();
//       console.log("Voice output response:", data);

//       if (data.success && data.audio) {
//         const audioData = atob(data.audio);
//         const arrayBuffer = new ArrayBuffer(audioData.length);
//         const view = new Uint8Array(arrayBuffer);
//         for (let i = 0; i < audioData.length; i++) {
//           view[i] = audioData.charCodeAt(i);
//         }
//         const blob = new Blob([arrayBuffer], { type: "audio/mp3" });
//         const audioUrl = URL.createObjectURL(blob);

//         // Cache the audio URL
//         setAudioCache((prev) => ({
//           ...prev,
//           [audioKey]: audioUrl,
//         }));

//         playCachedAudio(audioUrl, messageId);
//       } else {
//         console.error("Voice output failed:", data.error || "Unknown error");
//         setIsPlaying(false);
//       }
//     } catch (error) {
//       console.error("Error playing audio:", error);
//       setIsPlaying(false);
//     } finally {
//       setIsGeneratingAudio(false);
//     }
//   };

//   const playCachedAudio = (audioUrl, messageId) => {
//     if (audioRef.current) {
//       audioRef.current.src = audioUrl;
//       audioRef.current.playbackRate = playbackSpeed;
//       audioRef.current.currentTime = 0;

//       // Event listeners
//       audioRef.current.onloadeddata = () => {
//         console.log("Audio loaded successfully");
//         setIsPlaying(true);
//         setCurrentAudioId(messageId);
//       };

//       audioRef.current.onerror = (e) => {
//         console.error("Audio playback error:", e);
//         setIsPlaying(false);
//         setCurrentAudioId(null);
//       };

//       audioRef.current.onended = () => {
//         console.log("Audio playback ended");
//         setIsPlaying(false);
//         setCurrentAudioId(null);
//         setAudioProgress(0);
//       };

//       audioRef.current.ontimeupdate = () => {
//         if (audioRef.current) {
//           const progress =
//             (audioRef.current.currentTime / audioRef.current.duration) * 100;
//           setAudioProgress(progress);
//         }
//       };

//       const playPromise = audioRef.current.play();
//       if (playPromise !== undefined) {
//         playPromise.catch((error) => {
//           console.error("Error playing audio:", error);
//           setIsPlaying(false);
//           setCurrentAudioId(null);
//         });
//       }
//     }
//   };

//   const stopAudio = () => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//     }
//     setIsPlaying(false);
//     setCurrentAudioId(null);
//     setAudioProgress(0);
//   };

//   const changePlaybackSpeed = (speed) => {
//     setPlaybackSpeed(speed);
//     if (audioRef.current) {
//       audioRef.current.playbackRate = speed;
//     }
//   };

//   const skipAudio = (seconds) => {
//     if (audioRef.current) {
//       const newTime = audioRef.current.currentTime + seconds;
//       audioRef.current.currentTime = Math.max(
//         0,
//         Math.min(newTime, audioRef.current.duration)
//       );
//     }
//   };

//   const sanitizeHTML = (html) => {
//     // Simple HTML sanitization - only allow safe tags
//     const allowedTags = {
//       p: true,
//       h1: true,
//       h2: true,
//       h3: true,
//       h4: true,
//       h5: true,
//       h6: true,
//       ul: true,
//       ol: true,
//       li: true,
//       strong: true,
//       b: true,
//       em: true,
//       i: true,
//       code: true,
//       pre: true,
//       blockquote: true,
//       br: true,
//       span: true,
//       div: true,
//     };

//     // If it's not HTML, wrap it in a paragraph
//     if (!html.includes("<") || !html.includes(">")) {
//       return `<p>${html}</p>`;
//     }

//     return html;
//   };

//   const formatAIResponse = async (content) => {
//     console.log("Formatting AI response, original content:", content);

//     if (!content) return "";

//     // Clean up the content first
//     let cleanedContent = content
//       // Remove LaTeX math notation and replace with readable text
//       .replace(/\\\(/g, "")
//       .replace(/\\\)/g, "")
//       // Remove extra whitespace
//       .replace(/\s+/g, " ")
//       .trim();

//     // Split into paragraphs and format properly
//     const paragraphs = cleanedContent.split("\n\n").filter((p) => p.trim());

//     if (paragraphs.length === 1) {
//       // Single paragraph
//       return sanitizeHTML(`<p>${paragraphs[0]}</p>`);
//     } else {
//       // Multiple paragraphs
//       const formattedParagraphs = paragraphs
//         .map((p) => `<p>${p.trim()}</p>`)
//         .join("");
//       return sanitizeHTML(formattedParagraphs);
//     }
//   };

//   const DropdownButton = ({
//     name,
//     value,
//     options,
//     label,
//     position = "left",
//   }) => (
//     <div className="relative w-full">
//       <button
//         onClick={() => handleDropdownToggle(name)}
//         className="px-4 py-0 md:py-2 border bg-white border-[#F47B0B] text-[#F47B0B] rounded-xl md:rounded-full flex items-center gap-2 text-sm font-medium hover:bg-orange-50 transition-colors"
//       >
//         {value || label}
//         <span className="text-xs">
//           <img
//             src={downArrow}
//             alt=""
//             className={`transition-transform ${
//               openDropdown === name ? "rotate-180" : ""
//             }`}
//           />
//         </span>
//       </button>

//       {openDropdown === name && (
//         <div
//           className={`absolute ${
//             position === "right" ? "right-0" : "left-0"
//           } top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[150px] max-h-48 overflow-y-auto`}
//         >
//           {options.map((option) => (
//             <button
//               key={option}
//               onClick={() => handleOptionSelect(name, option)}
//               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-[#F47B0B] transition-colors first:rounded-t-lg last:rounded-b-lg"
//             >
//               {option}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   const ChatMessage = ({ message }) => {
//     console.log("ChatMessage render:", {
//       type: message.type,
//       isFormatted: message.isFormatted,
//       content: message.content,
//       contentLength: message.content?.length,
//       isFollowup: message.isFollowup,
//       contextUsed: message.contextUsed,
//     });

//     return ( 
//       <div
//         className={`flex mb-4 ${
//           message.type === "user" ? "justify-end" : "justify-start"
//         }`}
//       >
//         <div
//           className={`max-w-[70%] p-4 rounded-lg ${
//             message.type === "user"
//               ? "bg-orange-500 text-white"
//               : message.type === "error"
//               ? "bg-red-100 text-red-800"
//               : "bg-white text-black border border-gray-200"
//           }`}
//         >
//           {/* Context indicator for AI messages */}
//           {message.type === "ai" && message.isFollowup && (
//             <div className="mb-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
//               🔄 Building on previous conversation
//             </div>
//           )}
//           {message.type === "chart" ? (
//             <div className="chart-message">
//               <ChartRenderer chartData={message.chartData} />
//               {message.chartData.explanation && (
//                 <p className="text-sm text-gray-600 mt-2">
//                   {message.chartData.explanation}
//                 </p>
//               )}
//             </div>
//           ) : message.isFormatted ? (
//             <StreamingText
//               content={formatTextContent(message.content)}
//               isStreaming={message.isStreaming || false}
//               onComplete={() => {
//                 // Mark message as complete when streaming finishes
//                 if (message.isStreaming) {
//                   const updatedHistory = chatHistory.map((msg) =>
//                     msg.id === message.id ? { ...msg, isStreaming: false } : msg
//                   );
//                   setChatHistory(updatedHistory);
//                 }
//               }}
//             />
//           ) : (
//             <StreamingText
//               content={formatTextContent(message.content)}
//               isStreaming={message.isStreaming || false}
//             />
//           )}
//           {message.type === "ai" && (
//             <AudioControls
//               isPlaying={isPlaying}
//               isGenerating={isGeneratingAudio}
//               currentAudioId={currentAudioId}
//               messageId={message.id}
//               audioProgress={audioProgress}
//               playbackSpeed={playbackSpeed}
//               onPlayPause={() =>
//                 playAudioResponse(
//                   message.content,
//                   message.originalText,
//                   message.id
//                 )
//               }
//               onStop={stopAudio}
//               onSpeedChange={changePlaybackSpeed}
//               onSkip={skipAudio}
//               isCached={
//                 !!audioCache[
//                   `${message.id}_${message.originalText?.substring(0, 50)}`
//                 ]
//               }
//             />
//           )}
//           {message.type === "ai" &&
//             message.suggestions &&
//             message.suggestions.length > 0 && (
//               <InteractiveSuggestions
//                 suggestions={message.suggestions}
//                 onSuggestionClick={handleInteractiveSuggestionClick}
//               />
//             )}
//         </div>
//       </div>
//     );
//   };

//   const formatTextContent = (content) => {
//     if (!content) return "";

//     // Remove HTML tags and clean up markdown
//     let formatted = content
//       .replace(/<p>/g, "")
//       .replace(/<\/p>/g, "\n\n")
//       .replace(/<br\s*\/?>/g, "\n")
//       .replace(/<strong>/g, "**")
//       .replace(/<\/strong>/g, "**")
//       .replace(/<em>/g, "*")
//       .replace(/<\/em>/g, "*")
//       .replace(/<h[1-6]>/g, "\n### ")
//       .replace(/<\/h[1-6]>/g, "\n")
//       .replace(/<ul>/g, "\n")
//       .replace(/<\/ul>/g, "\n")
//       .replace(/<li>/g, "• ")
//       .replace(/<\/li>/g, "\n")
//       .replace(/<ol>/g, "\n")
//       .replace(/<\/ol>/g, "\n")
//       .replace(/<code>/g, "`")
//       .replace(/<\/code>/g, "`")
//       .replace(/<pre>/g, "\n```\n")
//       .replace(/<\/pre>/g, "\n```\n")
//       .replace(/&nbsp;/g, " ")
//       .replace(/&amp;/g, "&")
//       .replace(/&lt;/g, "<")
//       .replace(/&gt;/g, ">")
//       .replace(/&quot;/g, '"')
//       .replace(/&#39;/g, "'");

//     // Clean up extra whitespace
//     formatted = formatted
//       .replace(/\n\s*\n\s*\n/g, "\n\n")
//       .replace(/^\s+|\s+$/g, "");

//     return formatted;
//   };

//   const isChartRequest = (text) => {
//     const chartKeywords = [
//       "chart",
//       "graph",
//       "pie chart",
//       "bar chart",
//       "line chart",
//       "diagram",
//       "visualization",
//       "plot",
//       "histogram",
//       "scatter plot",
//       "doughnut chart",
//       "create a chart",
//       "show me a graph",
//       "generate a diagram",
//       "make a chart",
//       "draw a graph",
//       "pie chart",
//       "bar graph",
//       "line graph",
//       "visual representation",
//       "statistics",
//       "data visualization",
//       "show data",
//       "display chart",
//     ];

//     const lowerText = text.toLowerCase();
//     return chartKeywords.some((keyword) => lowerText.includes(keyword));
//   };

//   const generateChart = async (request, aiResponse = "") => {
//     try {
//       console.log("Generating chart for request:", request);
//       console.log("AI response for consistency:", aiResponse);

//       // Extract context from the request
//       const context = {
//         board: selectedBoard || "CBSE",
//         grade: selectedClass || "8",
//         subject: "Mathematics", // Default subject, can be enhanced
//       };

//       const response = await fetch("http://localhost:8000/api/diagram", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           question: request,
//           context: context,
//         }),
//       });

//       const data = await response.json();
//       console.log("Chart generation response:", data);

//       if (data.success && data.image_data) {
//         return {
//           type: "image",
//           data: data.image_data,
//           description: data.description,
//           diagram_type: data.diagram_type,
//         };
//       } else {
//         console.error("Chart generation failed:", data.error);
//         return null;
//       }
//     } catch (error) {
//       console.error("Error generating chart:", error);
//       return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#f6bc86] flex">
//       {/* Sidebar */}
//       <Sidebar
//         isCollapsed={isCollapsed}
//         setIsCollapsed={setIsCollapsed}
//         // className="hidden md:flex"
//         chatSessions={chatSessions}
//         currentChatId={currentChatId}
//         onLoadChat={loadChat}
//         onDeleteChat={deleteChat}
//         onCreateNewChat={createNewChat}
//       />

//       {/* Main Content */}
//       <div
//         className={`flex-1 ${
//           isCollapsed ? "md:ml-20 ml-0" : "md:ml-64 ml-0"
//         } transition-all duration-300`}
//       >
//         <Navbar />

//         {/* Main Content Area */}
//         <div className="flex-1 flex flex-col px-2 md:px-8 py-6 h-[90vh]">
//           {/* Conditional Content */}
//           {chatHistory.length === 0 ? (
//             // Welcome Screen - Show when no messages
//             <div className="flex-1 flex flex-col items-center justify-center">
//               {/* Welcome Message */}
//               <div className="text-center mb-12">
//                 <h1 className="text-5xl font-bold text-orange-500 mb-4">
//                   HI, {user?.username || "User"}
//                 </h1>
//                 <h2 className="text-3xl font-bold text-gray-700 mb-8">
//                   Ask Your Doubt
//                 </h2>
//               </div>

//               {/* Input Section */}
//               <div className="w-full max-w-4xl flex flex-col items-center">
//                 {/* Top Button */}
//                 {/* <button className="mb-4 border bg-white border-[#F47B0B] text-[#F47B0B] font-medium px-6 py-2 rounded-lg shadow-sm hover:bg-orange-50 transition">
//                   Generate Chart And Diagram
//                 </button> */}

//                 {/* Input with side boxes */}
//               <div className="flex flex-col md:flex-row items-center w-full justify-center">
//   {/* Left Side Buttons (Desktop only) */}
//   <div className="hidden md:flex flex-col gap-3 mr-4">
//     <DropdownButton
//       name="class"
//       value={selectedClass}
//       options={classOptions}
//       label="Class 1"
//     />
//     <DropdownButton
//       name="board"
//       value={selectedBoard}
//       options={boardOptions}
//       label="C.B.S.E"
//     />
//   </div>

//   {/* Input Box */}
//   <div className="flex-1 w-full md:w-auto">
//     <div className="bg-white rounded-3xl border border-gray-400 shadow-sm p-2 md:p-6">
//       <input
//         type="text"
//         placeholder="Type or upload your doubt"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onKeyPress={(e) => e.key === "Enter" && sendMessage()}
//         className="w-full text-gray-600 bg-transparent outline-none mb-6  text-base"
//       />
//       <div className="flex items-center justify-between">
//         <div className="relative group">
//           <Plus className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" />
//           {/* Tooltip Box */}
//           <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-white border w-[200px] border-gray-300 rounded-xl shadow-md px-3 py-2 text-sm text-gray-600 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
//             <span className="text-gray-500">
//               <img src={attach} alt="" className="h-6" />
//             </span>
//             <span>Add photos &amp; files</span>
//           </div>
//         </div>
//         <div className="flex items-center space-x-4">
//           <button
//             onClick={isRecording ? stopRecording : startRecording}
//             className={`p-2 rounded-full transition-colors ${
//               isRecording
//                 ? "bg-red-500 text-white"
//                 : "text-gray-400 hover:text-gray-600"
//             }`}
//           >
//             <img src={mic} alt="" className="w-4 h-5" />
//           </button>
//           <button
//             onClick={sendMessage}
//             disabled={!message.trim() || isLoading}
//             className="disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <img
//               src={send}
//               alt=""
//               className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
//             />
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>

//   {/* Right Side Buttons (Desktop only) */}
//   <div className="hidden md:flex flex-col gap-3 ml-4">
//     <DropdownButton
//       name="subject"
//       value={selectedSubject}
//       options={subjectOptions}
//       label="Subject"
//       position="right"
//     />
//     <DropdownButton
//       name="answerStyle"
//       value={selectedAnswerStyle}
//       options={answerStyleOptions}
//       label="Answer style"
//       position="right"
//     />
//   </div>

//   {/* Mobile View Dropdowns (Stacked below input) */}
//   {/* <div className="flex md:hidden flex-wrap justify-center gap-3 mt-4"> */}
//   <div className="grid grid-cols-2 gap-3 mt-4 md:hidden">
//     <DropdownButton
//       name="class"
//       value={selectedClass}
//       options={classOptions}
//       label="Class 1"
//     />
//     <DropdownButton
//       name="board"
//       value={selectedBoard}
//       options={boardOptions}
//       label="C.B.S.E"
//     />
//     <DropdownButton
//       name="subject"
//       value={selectedSubject}
//       options={subjectOptions}
//       label="Subject"
//     />
//     <DropdownButton
//       name="answerStyle"
//       value={selectedAnswerStyle}
//       options={answerStyleOptions}
//       label="Answer style"
//     />
//   </div>
// </div>


                
//               </div>
//             </div>
//           ) : (
//             // Chat Interface - Show when messages exist
//             <>
//               {/* Chat Area */}
//               <div className="flex-1 p-4 mb-4 overflow-y-auto">
//                 {chatHistory.map((msg) => (
//                   <ChatMessage key={msg.id} message={msg} />
//                 ))}
//                 {isLoading && (
//                   <div className="flex justify-start mb-4">
//                     <div className="bg-white bg-opacity-80 p-3 rounded-lg backdrop-blur-sm">
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                         <div
//                           className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                           style={{ animationDelay: "0.1s" }}
//                         ></div>
//                         <div
//                           className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                           style={{ animationDelay: "0.2s" }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Input Section */}
         
//               <div className="flex flex-col md:flex-row items-center w-full justify-center">
//   {/* Left Side Buttons (Desktop only) */}
//   <div className="hidden md:flex flex-col gap-3 mr-4">
//     <DropdownButton
//       name="class"
//       value={selectedClass}
//       options={classOptions}
//       label="Class 1"
//     />
//     <DropdownButton
//       name="board"
//       value={selectedBoard}
//       options={boardOptions}
//       label="C.B.S.E"
//     />
//   </div>

//   {/* Input Box */}
//   <div className="flex-1 w-full md:w-auto">
//     <div className="bg-white rounded-3xl border border-gray-400 shadow-sm p-2 md:p-6">
//       <input
//         type="text"
//         placeholder="Type or upload your doubt"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onKeyPress={(e) => e.key === "Enter" && sendMessage()}
//         className="w-full text-gray-600 bg-transparent outline-none mb-6  text-base"
//       />
//       <div className="flex items-center justify-between">
//         <div className="relative group">
//           <Plus className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" />
//           {/* Tooltip Box */}
//           <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-white border w-[200px] border-gray-300 rounded-xl shadow-md px-3 py-2 text-sm text-gray-600 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
//             <span className="text-gray-500">
//               <img src={attach} alt="" className="h-6" />
//             </span>
//             <span>Add photos &amp; files</span>
//           </div>
//         </div>
//         <div className="flex items-center space-x-4">
//           <button
//             onClick={isRecording ? stopRecording : startRecording}
//             className={`p-2 rounded-full transition-colors ${
//               isRecording
//                 ? "bg-red-500 text-white"
//                 : "text-gray-400 hover:text-gray-600"
//             }`}
//           >
//             <img src={mic} alt="" className="w-4 h-5" />
//           </button>
//           <button
//             onClick={sendMessage}
//             disabled={!message.trim() || isLoading}
//             className="disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <img
//               src={send}
//               alt=""
//               className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
//             />
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>

//   {/* Right Side Buttons (Desktop only) */}
//   <div className="hidden md:flex flex-col gap-3 ml-4">
//     <DropdownButton
//       name="subject"
//       value={selectedSubject}
//       options={subjectOptions}
//       label="Subject"
//       position="right"
//     />
//     <DropdownButton
//       name="answerStyle"
//       value={selectedAnswerStyle}
//       options={answerStyleOptions}
//       label="Answer style"
//       position="right"
//     />
//   </div>

//   {/* Mobile View Dropdowns (Stacked below input) */}
//   {/* <div className="flex md:hidden flex-wrap justify-center gap-3 mt-4"> */}
//   <div className="grid grid-cols-2 gap-3 mt-4 md:hidden">
//     <DropdownButton
//       name="class"
//       value={selectedClass}
//       options={classOptions}
//       label="Class 1"
//     />
//     <DropdownButton
//       name="board"
//       value={selectedBoard}
//       options={boardOptions}
//       label="C.B.S.E"
//     />
//     <DropdownButton
//       name="subject"
//       value={selectedSubject}
//       options={subjectOptions}
//       label="Subject"
//     />
//     <DropdownButton
//       name="answerStyle"
//       value={selectedAnswerStyle}
//       options={answerStyleOptions}
//       label="Answer style"
//     />
//   </div>
// </div>







//             </>
//           )}
//         </div>
//       </div>

//       {/* Hidden audio element for playback */}
//       <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

//       {/* Overlay to close dropdowns when clicking outside */}
//       {openDropdown && (
//         <div
//           className="fixed inset-0 z-40"
//           onClick={() => setOpenDropdown(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default Dashboard;











import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { Plus, Mic, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import ChartRenderer from "../components/ChartRenderer";
import AudioControls from "../components/AudioControls";
import StreamingText from "../components/StreamingText";
import InteractiveSuggestions from "../components/InteractiveSuggestions";
import mic from "../assets/images/mike.png";
import send from "../assets/images/send.png";
import attach from "../assets/images/attach.png";
import downArrow from "../assets/images/downArrow.png";
import HexagonalGrid from "./hex";
import { useChat } from "../context/chatContext";
import config from "../../env-config.js";

const API_BASE_URL = config.API_BASE_URL;
const AI_SERVER_URL = config.AI_SERVER_URL;
console.log('api base url', API_BASE_URL)
console.log('ai server url', AI_SERVER_URL)

const Dashboard = () => {
  const { chatSessions, currentChatId,setCurrentChatId, setChatSessions,chatHistory, setChatHistory, loadChat, deleteChat, createNewChat } = useChat()
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedAnswerStyle, setSelectedAnswerStyle] = useState("");

  // Chat states
  const [message, setMessage] = useState("");
  // const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCache, setAudioCache] = useState({});
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  // const [currentChatId, setCurrentChatId] = useState(null);

  // Helper function to set current chat ID and save to localStorage
  const setCurrentChatIdAndSave = (chatId) => {
    setCurrentChatId(chatId);
    if (chatId) {
      localStorage.setItem("currentChatId", chatId);
    } else {
      localStorage.removeItem("currentChatId");
    }
  };
  // const [chatSessions, setChatSessions] = useState([]);

  // Enhanced AI session management
  const [aiSessionId, setAiSessionId] = useState(null);

  // Audio states
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const audioRef = useRef(null);

  // Dropdown options
  const classOptions = [
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
  ];
  const boardOptions = [
    "C.B.S.E",
    "I.C.S.E",
    "State Board",
    "International Board",
  ];
  const subjectOptions = [
    "Mathematics",
    "Science",
    "English",
    "Hindi",
    "Social Studies",
    "Computer Science",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Economics",
  ];
  const answerStyleOptions = [
    "Simple",
    "Detailed",
    "Step-by-step",
    "Visual",
    "Interactive",
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Set default values from user data
      setSelectedClass(parsedUser?.grade || "Class 1");
      setSelectedBoard(parsedUser?.board || "C.B.S.E");
    }

    // Test backend connection
    testBackendConnection();

    // Load chat sessions and restore current chat if exists
    loadChatSessionsAndRestore();
  }, []);

  // Update AI session context when dropdowns change
  useEffect(() => {
    if (
      aiSessionId &&
      (selectedClass || selectedBoard || selectedSubject || selectedAnswerStyle)
    ) {
      const contextUpdates = {};
      if (selectedClass) contextUpdates.grade = selectedClass;
      if (selectedBoard) contextUpdates.board = selectedBoard;
      if (selectedSubject) contextUpdates.subject = selectedSubject;
      if (selectedAnswerStyle)
        contextUpdates.answer_style = selectedAnswerStyle;

      // Only update if we have changes
      if (Object.keys(contextUpdates).length > 0) {
        updateAiSessionContext(contextUpdates);
      }
    }
  }, [
    selectedClass,
    selectedBoard,
    selectedSubject,
    selectedAnswerStyle,
    aiSessionId,
  ]);

  // Monitor chat history changes
  useEffect(() => {
    console.log("Chat history updated:", chatHistory);
    console.log("Current chat ID:", currentChatId);
  }, [chatHistory, currentChatId]);

  // Cleanup audio cache when component unmounts
  useEffect(() => {
    return () => {
      // Clean up audio URLs to prevent memory leaks
      Object.values(audioCache).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [audioCache]);

  // Clear old audio cache entries (keep only last 20)
  useEffect(() => {
    const cacheKeys = Object.keys(audioCache);
    if (cacheKeys.length > 20) {
      const keysToRemove = cacheKeys.slice(0, cacheKeys.length - 20);
      const newCache = { ...audioCache };
      keysToRemove.forEach((key) => {
        URL.revokeObjectURL(newCache[key]);
        delete newCache[key];
      });
      setAudioCache(newCache);
    }
  }, [audioCache]);

  // Keyboard shortcuts for audio controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.key) {
        case " ": // Spacebar - play/pause current audio
          e.preventDefault();
          if (isPlaying) {
            stopAudio();
          }
          break;
        case "ArrowLeft": // Left arrow - skip backward
          e.preventDefault();
          skipAudio(-10);
          break;
        case "ArrowRight": // Right arrow - skip forward
          e.preventDefault();
          skipAudio(10);
          break;
        case "Escape": // Escape - stop audio
          e.preventDefault();
          stopAudio();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying]);

  // Auto-generate audio for AI responses (optional feature)
  const autoGenerateAudio = async (message) => {
    if (
      message.type === "ai" &&
      !audioCache[`${message.id}_${message.originalText?.substring(0, 50)}`]
    ) {
      // Generate audio in background for faster playback later
      setTimeout(() => {
        playAudioResponse(message.content, message.originalText, message.id);
      }, 1000);
    }
  };

  const clearAudioCache = () => {
    Object.values(audioCache).forEach((url) => {
      URL.revokeObjectURL(url);
    });
    setAudioCache({});
  };

  const testBackendConnection = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found for backend test");
        return;
      }

      console.log("Testing backend connection...");
      // const response = await fetch("http://localhost:5000/api/chat/test", {
      const response = await fetch(`${API_BASE_URL}/chat/test` , {
        headers: getAuthHeaders(),
      });

      console.log("Test response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Backend test successful:", data);
      } else {
        const errorData = await response.json();
        console.error("Backend test failed:", errorData);
      }
    } catch (error) {
      console.error("Backend test error:", error);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };


  const loadChatSessionsAndRestore = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, skipping chat load");
      return;
    }

    console.log("Loading chat sessions...");
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    console.log("Response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Chat sessions loaded:", data);
      if (data.success) {
        setChatSessions(data.data);

        // Check if there's a saved current chat ID
        const savedChatId = localStorage.getItem("currentChatId");
        if (savedChatId) {
          console.log("Found saved chat ID:", savedChatId);

          // Check if the saved chat still exists in the loaded sessions
          const savedChat = data.data.find((chat) => chat._id === savedChatId);
          if (savedChat) {
            console.log("Restoring saved chat:", savedChat);
            // Use loadChat to properly load the chat and its messages
            await loadChat(savedChatId);
          } else {
            console.log("Saved chat not found, clearing saved chat ID");
            localStorage.removeItem("currentChatId");
            setChatHistory([]);
          }
        } else {
          setChatHistory([]);
        }
      }
    } else {
      const errorData = await response.json();
      console.error("Error loading chats:", errorData);
      setChatHistory([]);
    }
  } catch (error) {
    console.error("Error loading chat sessions:", error);
    setChatHistory([]);
  }
};


  const loadChatMessages = async (chatId) => {
  try {
    console.log("Loading messages for chat:", chatId);
    const response = await fetch(
      `${API_BASE_URL}/chat/${chatId}/messages`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    console.log("Load messages response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log("Chat messages loaded:", data.data);
        setChatHistory(data.data || []); // Set chat history with fetched messages
      } else {
        console.error("Failed to load messages:", data.error);
        setChatHistory([]); // Only clear if the response indicates an error
      }
    } else if (response.status === 404) {
      console.warn("Messages endpoint returned 404, checking chat session data");
      // Fallback to loading chat data to get messages
      const chatResponse = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        if (chatData.success && chatData.data.messages) {
          console.log("Loaded messages from chat data:", chatData.data.messages);
          setChatHistory(chatData.data.messages || []);
        } else {
          console.error("No messages found in chat data:", chatData);
          setChatHistory([]);
        }
      } else {
        console.error("Failed to load chat data:", chatResponse.status);
        setChatHistory([]);
      }
    } else {
      console.error("Error loading chat messages:", response.status);
      setChatHistory([]);
    }
  } catch (error) {
    console.error("Error loading chat messages:", error.message);
    setChatHistory([]); // Only clear on error
  }
};


  const loadChatSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, skipping chat load");
        return;
      }

          console.log("Loading chat sessions...");
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Chat sessions loaded:", data);
        if (data.success) {
          setChatSessions(data.data);
        }
      } else {
        const errorData = await response.json();
        console.error("Error loading chats:", errorData);
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    }
  };


  const createAiSession = async () => {
    try {
      console.log("Creating AI session...");

      // Use the backend endpoint that includes user context
      const response = await fetch(
        `${API_BASE_URL}/chat/ai-session`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAiSessionId(data.session_id);
          console.log("AI session created with user context:", data.session_id);
          console.log("User context:", data.user_context);

          // Update AI session with current dropdown selections
          const contextUpdates = {};
          if (selectedClass) contextUpdates.grade = selectedClass;
          if (selectedBoard) contextUpdates.board = selectedBoard;
          if (selectedSubject) contextUpdates.subject = selectedSubject;
          if (selectedAnswerStyle)
            contextUpdates.answer_style = selectedAnswerStyle;

          if (Object.keys(contextUpdates).length > 0) {
            await updateAiSessionContext(contextUpdates);
          }

          return true; // Success
        } else {
          console.error("Failed to create AI session:", data.error);
          return false;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Failed to create AI session:",
          response.status,
          errorData
        );
        return false;
      }
    } catch (error) {
      console.error("Error creating AI session:", error);
      return false;
    }
  };


  const addMessageToChat = async (message) => {
    if (!currentChatId) {
      console.log("No current chat ID, cannot add message");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, cannot add message");
        return;
      }

      console.log("Adding message to chat:", currentChatId);
      const response = await fetch(
        `http://localhost:5000/api/chat/${currentChatId}/messages`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ message }),
        }
      );

      console.log("Add message response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Message added:", data);
        if (data.success) {
          // Don't overwrite local chat history, just update chat sessions
          setChatSessions((prev) =>
            prev.map((chat) => (chat._id === currentChatId ? data.data : chat))
          );
        }
      } else {
        const errorData = await response.json();
        console.error("Error adding message:", errorData);
      }
    } catch (error) {
      console.error("Error adding message to chat:", error);
    }
  };

 

  const handleDropdownToggle = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const updateAiSessionContext = async (contextUpdates) => {
    if (!aiSessionId) return;

    try {
      console.log("Updating AI session context:", contextUpdates);

      const response = await fetch(
        `${AI_SERVER_URL}/api/session/${aiSessionId}/context`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            context: contextUpdates,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("AI session context updated successfully");
        }
      } else {
        console.error("Failed to update AI session context");
      }
    } catch (error) {
      console.error("Error updating AI session context:", error);
    }
  };

  const handleOptionSelect = (dropdownName, value) => {
    let contextUpdates = {};

    switch (dropdownName) {
      case "class":
        setSelectedClass(value);
        contextUpdates = { grade: value };
        break;
      case "board":
        setSelectedBoard(value);
        contextUpdates = { board: value };
        break;
      case "subject":
        setSelectedSubject(value);
        contextUpdates = { subject: value };
        break;
      case "answerStyle":
        setSelectedAnswerStyle(value);
        contextUpdates = { answer_style: value };
        break;
      default:
        break;
    }

    setOpenDropdown(null);

    // Update AI session context if we have changes
    if (Object.keys(contextUpdates).length > 0) {
      updateAiSessionContext(contextUpdates);
    }
  };

  const handleInteractiveSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    // Automatically send the suggestion
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Create new chat if none exists
    if (!currentChatId) {
      await createNewChat();
      // Wait a bit for the chat to be created
      setTimeout(async () => {
        await processMessage();
      }, 100);
      return;
    }

    // Create AI session if not exists (before processing message)
    if (!aiSessionId) {
      const sessionCreated = await createAiSession();
      if (!sessionCreated) {
        // If AI session creation failed, show error and don't proceed
        const errorMessage = {
          id: Date.now().toString(),
          type: "error",
          content: "Unable to connect to AI service. Please try again later.",
          timestamp: new Date().toISOString(),
        };
        setChatHistory([errorMessage]);
        setIsLoading(false);
        return;
      }
      // Wait a bit for AI session to be fully ready
      setTimeout(async () => {
        await processMessage();
      }, 200);
      return;
    }

    await processMessage();
  };

  const processMessage = async () => {
    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    console.log("Processing message:", userMessage);
    console.log("Current chat history length:", chatHistory.length);

    // Add user message to chat
    const newUserMessage = {
      id: Date.now().toString(),
      type: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    console.log("Created user message:", newUserMessage);

    // Update local state immediately
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);

    console.log("Updated chat history length:", updatedHistory.length);

    // Save user message to backend
    await addMessageToChat(newUserMessage);

    try {
      const response = await fetch(`${AI_SERVER_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: aiSessionId,
          context: {
            grade: selectedClass,
            subject: selectedSubject,
            board: selectedBoard,
            answer_style: selectedAnswerStyle,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`AI backend responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update session ID if provided in response
        if (data.session_id && data.session_id !== aiSessionId) {
          setAiSessionId(data.session_id);
          console.log("Updated AI session ID:", data.session_id);
        }

        // Format the AI response with proper HTML tags and styling
        const responseText = data.answer || data.response; // Handle both response formats
        const formattedContent = await formatAIResponse(responseText);

        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: formattedContent,
          originalText: responseText, // Store the original plain text
          timestamp: data.timestamp,
          isFormatted: true, // Flag to indicate this is formatted content
          suggestions: data.suggestions || [], // Interactive suggestions
          interactive: data.interactive || false, // Whether this is an interactive response
          isFollowup: data.is_followup || false, // Whether this is a follow-up response
          conversationSummary: data.conversation_summary || "", // Conversation context summary
          contextUsed: data.metadata?.context_used || false, // Whether context was used
        };

        // Update chat history with AI response
        const finalHistory = [...updatedHistory, aiMessage];
        setChatHistory(finalHistory);

        console.log("Final chat history length:", finalHistory.length);
        console.log("AI message added to history");

        // Save AI message to backend
        await addMessageToChat(aiMessage);

        // Check if this is a chart request and generate chart if needed
        if (isChartRequest(userMessage)) {
          console.log("Chart request detected, generating chart...");
          const chartData = await generateChart(userMessage, data.response);

          if (chartData) {
            console.log("Generated chart data:", chartData);
            const chartMessage = {
              id: (Date.now() + 2).toString(),
              type: "chart",
              chartData: chartData,
              timestamp: new Date().toISOString(),
            };

            const historyWithChart = [...finalHistory, chartMessage];
            setChatHistory(historyWithChart);
            await addMessageToChat(chartMessage);
          } else {
            console.error("Failed to generate chart data");
          }
        }
      } else {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          type: "error",
          content: `Error: ${data.error}`,
          timestamp: new Date().toISOString(),
        };

        // Update chat history with error message
        const finalHistory = [...updatedHistory, errorMessage];
        setChatHistory(finalHistory);

        // Save error message to backend
        await addMessageToChat(errorMessage);
      }
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: "error",
        content: "Failed to connect to AI service",
        timestamp: new Date().toISOString(),
      };

      // Update chat history with error message
      const finalHistory = [...updatedHistory, errorMessage];
      setChatHistory(finalHistory);

      // Save error message to backend
      await addMessageToChat(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        await processVoiceInput(audioBlob);
        setAudioChunks([]);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Error accessing microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob) => {
    setIsLoading(true);

    // Create new chat if none exists
    if (!currentChatId) {
      await createNewChat();
      setTimeout(async () => {
        await processVoiceMessage(audioBlob);
      }, 100);
      return;
    }

    await processVoiceMessage(audioBlob);
  };

  const processVoiceMessage = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.wav");

    // Add context and session_id to voice input
    const context = {
      grade: selectedClass,
      subject: selectedSubject,
      board: selectedBoard,
      answer_style: selectedAnswerStyle,
    };

    formData.append("context", JSON.stringify(context));
    if (aiSessionId) {
      formData.append("session_id", aiSessionId);
    }

    try {
      const response = await fetch("http://localhost:8000/api/voice-input", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Add recognized text as user message
        const userMessage = {
          id: Date.now().toString(),
          type: "user",
          content: data.text,
          timestamp: new Date().toISOString(),
        };

        // Update local state immediately
        const updatedHistory = [...chatHistory, userMessage];
        setChatHistory(updatedHistory);

        // Save user message to backend
        await addMessageToChat(userMessage);

        // Add AI response
        if (data.ai_response && data.ai_response.success) {
          // Format the AI response with proper HTML tags and styling
          const formattedContent = await formatAIResponse(
            data.ai_response.response
          );

          const aiMessage = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: formattedContent,
            originalText: data.ai_response.response, // Store the original plain text
            timestamp: data.ai_response.timestamp,
            isFormatted: true, // Flag to indicate this is formatted content
          };

          // Update chat history with AI response
          const finalHistory = [...updatedHistory, aiMessage];
          setChatHistory(finalHistory);

          // Save AI message to backend
          await addMessageToChat(aiMessage);

          // Check if this is a chart request and generate chart if needed
          if (isChartRequest(data.text)) {
            console.log(
              "Chart request detected in voice input, generating chart..."
            );
            const chartData = await generateChart(
              data.text,
              data.ai_response.response
            );

            if (chartData) {
              console.log("Generated chart data from voice:", chartData);
              const chartMessage = {
                id: (Date.now() + 2).toString(),
                type: "chart",
                chartData: chartData,
                timestamp: new Date().toISOString(),
              };

              const historyWithChart = [...finalHistory, chartMessage];
              setChatHistory(historyWithChart);
              await addMessageToChat(chartMessage);
            } else {
              console.error("Failed to generate chart data from voice input");
            }
          }
        }
      } else {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          type: "error",
          content: `Voice recognition error: ${data.error}`,
          timestamp: new Date().toISOString(),
        };

        // Update chat history with error message
        const finalHistory = [...updatedHistory, errorMessage];
        setChatHistory(finalHistory);

        // Save error message to backend
        await addMessageToChat(errorMessage);
      }
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: "error",
        content: "Failed to process voice input",
        timestamp: new Date().toISOString(),
      };

      // Update chat history with error message
      const finalHistory = [...updatedHistory, errorMessage];
      setChatHistory(finalHistory);

      // Save error message to backend
      await addMessageToChat(errorMessage);
    }
  };

  const playAudioResponse = async (
    text,
    originalText = null,
    messageId = null
  ) => {
    if (isPlaying) {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentAudioId(null);
      return;
    }

    try {
      let plainText = originalText || text;
      if (!originalText && text.includes("<") && text.includes(">")) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;
        plainText = tempDiv.textContent || tempDiv.innerText || "";
        plainText = plainText.replace(/\s+/g, " ").trim();
      }

      // Create a unique key for caching
      const audioKey = `${messageId || Date.now()}_${plainText.substring(
        0,
        50
      )}`;

      // Check if audio is already cached
      if (audioCache[audioKey]) {
        console.log("Using cached audio for:", audioKey);
        playCachedAudio(audioCache[audioKey], messageId);
        return;
      }

      setIsGeneratingAudio(true);
      console.log("Generating audio for text:", plainText);

      const response = await fetch("http://localhost:8000/api/voice-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: plainText }),
      });

      const data = await response.json();
      console.log("Voice output response:", data);

      if (data.success && data.audio) {
        const audioData = atob(data.audio);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
          view[i] = audioData.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: "audio/mp3" });
        const audioUrl = URL.createObjectURL(blob);

        // Cache the audio URL
        setAudioCache((prev) => ({
          ...prev,
          [audioKey]: audioUrl,
        }));

        playCachedAudio(audioUrl, messageId);
      } else {
        console.error("Voice output failed:", data.error || "Unknown error");
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const playCachedAudio = (audioUrl, messageId) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.currentTime = 0;

      // Event listeners
      audioRef.current.onloadeddata = () => {
        console.log("Audio loaded successfully");
        setIsPlaying(true);
        setCurrentAudioId(messageId);
      };

      audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
        setCurrentAudioId(null);
      };

      audioRef.current.onended = () => {
        console.log("Audio playback ended");
        setIsPlaying(false);
        setCurrentAudioId(null);
        setAudioProgress(0);
      };

      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          const progress =
            (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setAudioProgress(progress);
        }
      };

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
          setCurrentAudioId(null);
        });
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentAudioId(null);
    setAudioProgress(0);
  };

  const changePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const skipAudio = (seconds) => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime + seconds;
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(newTime, audioRef.current.duration)
      );
    }
  };

  const sanitizeHTML = (html) => {
    // Simple HTML sanitization - only allow safe tags
    const allowedTags = {
      p: true,
      h1: true,
      h2: true,
      h3: true,
      h4: true,
      h5: true,
      h6: true,
      ul: true,
      ol: true,
      li: true,
      strong: true,
      b: true,
      em: true,
      i: true,
      code: true,
      pre: true,
      blockquote: true,
      br: true,
      span: true,
      div: true,
    };

    // If it's not HTML, wrap it in a paragraph
    if (!html.includes("<") || !html.includes(">")) {
      return `<p>${html}</p>`;
    }

    return html;
  };

  const formatAIResponse = async (content) => {
    console.log("Formatting AI response, original content:", content);

    if (!content) return "";

    // Clean up the content first
    let cleanedContent = content
      // Remove LaTeX math notation and replace with readable text
      .replace(/\\\(/g, "")
      .replace(/\\\)/g, "")
      // Remove extra whitespace
      .replace(/\s+/g, " ")
      .trim();

    // Split into paragraphs and format properly
    const paragraphs = cleanedContent.split("\n\n").filter((p) => p.trim());

    if (paragraphs.length === 1) {
      // Single paragraph
      return sanitizeHTML(`<p>${paragraphs[0]}</p>`);
    } else {
      // Multiple paragraphs
      const formattedParagraphs = paragraphs
        .map((p) => `<p>${p.trim()}</p>`)
        .join("");
      return sanitizeHTML(formattedParagraphs);
    }
  };

  const DropdownButton = ({
    name,
    value,
    options,
    label,
    position = "left",
  }) => (
    <div className="relative w-full">
      <button
        onClick={() => handleDropdownToggle(name)}
        className="px-4 py-0 md:py-2 border bg-white border-[#F47B0B] text-[#F47B0B] rounded-xl md:rounded-full flex items-center gap-2 text-sm font-medium hover:bg-orange-50 transition-colors"
      >
        {value || label}
        <span className="text-xs">
          <img
            src={downArrow}
            alt=""
            className={`transition-transform ${
              openDropdown === name ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {openDropdown === name && (
        <div
          className={`absolute ${
            position === "right" ? "right-0" : "left-0"
          } top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[150px] max-h-48 overflow-y-auto`}
        >
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionSelect(name, option)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-[#F47B0B] transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const ChatMessage = ({ message }) => {
    console.log("ChatMessage render:", {
      type: message.type,
      isFormatted: message.isFormatted,
      content: message.content,
      contentLength: message.content?.length,
      isFollowup: message.isFollowup,
      contextUsed: message.contextUsed,
    });

    return ( 
      <div
        className={`flex mb-4 ${
          message.type === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[70%] p-4 rounded-lg ${
            message.type === "user"
              ? "bg-orange-500 text-white"
              : message.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-white text-black border border-gray-200"
          }`}
        >
          {/* Context indicator for AI messages */}
          {message.type === "ai" && message.isFollowup && (
            <div className="mb-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
              🔄 Building on previous conversation
            </div>
          )}
          {message.type === "chart" ? (
            <div className="chart-message">
              <ChartRenderer chartData={message.chartData} />
              {message.chartData.explanation && (
                <p className="text-sm text-gray-600 mt-2">
                  {message.chartData.explanation}
                </p>
              )}
            </div>
          ) : message.isFormatted ? (
            <StreamingText
              content={formatTextContent(message.content)}
              isStreaming={message.isStreaming || false}
              onComplete={() => {
                // Mark message as complete when streaming finishes
                if (message.isStreaming) {
                  const updatedHistory = chatHistory.map((msg) =>
                    msg.id === message.id ? { ...msg, isStreaming: false } : msg
                  );
                  setChatHistory(updatedHistory);
                }
              }}
            />
          ) : (
            <StreamingText
              content={formatTextContent(message.content)}
              isStreaming={message.isStreaming || false}
            />
          )}
          {message.type === "ai" && (
            <AudioControls
              isPlaying={isPlaying}
              isGenerating={isGeneratingAudio}
              currentAudioId={currentAudioId}
              messageId={message.id}
              audioProgress={audioProgress}
              playbackSpeed={playbackSpeed}
              onPlayPause={() =>
                playAudioResponse(
                  message.content,
                  message.originalText,
                  message.id
                )
              }
              onStop={stopAudio}
              onSpeedChange={changePlaybackSpeed}
              onSkip={skipAudio}
              isCached={
                !!audioCache[
                  `${message.id}_${message.originalText?.substring(0, 50)}`
                ]
              }
            />
          )}
          {message.type === "ai" &&
            message.suggestions &&
            message.suggestions.length > 0 && (
              <InteractiveSuggestions
                suggestions={message.suggestions}
                onSuggestionClick={handleInteractiveSuggestionClick}
              />
            )}
        </div>
      </div>
    );
  };

  const formatTextContent = (content) => {
    if (!content) return "";

    // Remove HTML tags and clean up markdown
    let formatted = content
      .replace(/<p>/g, "")
      .replace(/<\/p>/g, "\n\n")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<strong>/g, "**")
      .replace(/<\/strong>/g, "**")
      .replace(/<em>/g, "*")
      .replace(/<\/em>/g, "*")
      .replace(/<h[1-6]>/g, "\n### ")
      .replace(/<\/h[1-6]>/g, "\n")
      .replace(/<ul>/g, "\n")
      .replace(/<\/ul>/g, "\n")
      .replace(/<li>/g, "• ")
      .replace(/<\/li>/g, "\n")
      .replace(/<ol>/g, "\n")
      .replace(/<\/ol>/g, "\n")
      .replace(/<code>/g, "`")
      .replace(/<\/code>/g, "`")
      .replace(/<pre>/g, "\n```\n")
      .replace(/<\/pre>/g, "\n```\n")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Clean up extra whitespace
    formatted = formatted
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .replace(/^\s+|\s+$/g, "");

    return formatted;
  };

  const isChartRequest = (text) => {
    const chartKeywords = [
      "chart",
      "graph",
      "pie chart",
      "bar chart",
      "line chart",
      "diagram",
      "visualization",
      "plot",
      "histogram",
      "scatter plot",
      "doughnut chart",
      "create a chart",
      "show me a graph",
      "generate a diagram",
      "make a chart",
      "draw a graph",
      "pie chart",
      "bar graph",
      "line graph",
      "visual representation",
      "statistics",
      "data visualization",
      "show data",
      "display chart",
    ];

    const lowerText = text.toLowerCase();
    return chartKeywords.some((keyword) => lowerText.includes(keyword));
  };

  const generateChart = async (request, aiResponse = "") => {
    try {
      console.log("Generating chart for request:", request);
      console.log("AI response for consistency:", aiResponse);

      // Extract context from the request
      const context = {
        board: selectedBoard || "CBSE",
        grade: selectedClass || "8",
        subject: "Mathematics", // Default subject, can be enhanced
      };

      const response = await fetch(`${AI_SERVER_URL}/api/diagram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: request,
          context: context,
        }),
      });

      const data = await response.json();
      console.log("Chart generation response:", data);

      if (data.success && data.image_data) {
        return {
          type: "image",
          data: data.image_data,
          description: data.description,
          diagram_type: data.diagram_type,
        };
      } else {
        console.error("Chart generation failed:", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error generating chart:", error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#f6bc86] flex relative">
      {/* <HexagonalGrid /> */}
       {/* <div className="absolute inset-0 ">
      <HexagonalGrid />
    </div> */}
    
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        // className="hidden md:flex"
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onLoadChat={loadChat}
        onDeleteChat={deleteChat}
        onCreateNewChat={createNewChat}
      />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isCollapsed ? "md:ml-20 ml-0" : "md:ml-64 ml-0"
        } transition-all duration-300`}
      >
        <Navbar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col px-2 md:px-8 py-6 h-[90vh]">
          {/* Conditional Content */}
          {chatHistory.length === 0 ? (
            // Welcome Screen - Show when no messages
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Welcome Message */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-orange-500 mb-4">
                  HI, {user?.username || "User"}
                </h1>
                <h2 className="text-3xl font-bold text-gray-700 mb-8">
                  Ask Your Doubt
                </h2>
              </div>

              {/* Input Section */}
              <div className="w-full max-w-4xl flex flex-col items-center">
                {/* Top Button */}
                {/* <button className="mb-4 border bg-white border-[#F47B0B] text-[#F47B0B] font-medium px-6 py-2 rounded-lg shadow-sm hover:bg-orange-50 transition">
                  Generate Chart And Diagram
                </button> */}

                {/* Input with side boxes */}
              <div className="flex flex-col md:flex-row items-center w-full justify-center">
  {/* Left Side Buttons (Desktop only) */}
  <div className="hidden md:flex flex-col gap-3 mr-4">
    <DropdownButton
      name="class"
      value={selectedClass}
      options={classOptions}
      label="Class 1"
    />
    <DropdownButton
      name="board"
      value={selectedBoard}
      options={boardOptions}
      label="C.B.S.E"
    />
  </div>

  {/* Input Box */}
  <div className="flex-1 w-full md:w-auto">
    <div className="bg-white rounded-3xl border border-gray-400 shadow-sm p-2 md:p-6">
      <input
        type="text"
        placeholder="Type or upload your doubt"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        className="w-full text-gray-600 bg-transparent outline-none mb-6  text-base"
      />
      <div className="flex items-center justify-between">
        <div className="relative group">
          <Plus className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" />
          {/* Tooltip Box */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-white border w-[200px] border-gray-300 rounded-xl shadow-md px-3 py-2 text-sm text-gray-600 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-gray-500">
              <img src={attach} alt="" className="h-6" />
            </span>
            <span>Add photos &amp; files</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-full transition-colors ${
              isRecording
                ? "bg-red-500 text-white"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <img src={mic} alt="" className="w-4 h-5" />
          </button>
          <button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src={send}
              alt=""
              className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Right Side Buttons (Desktop only) */}
  <div className="hidden md:flex flex-col gap-3 ml-4">
    <DropdownButton
      name="subject"
      value={selectedSubject}
      options={subjectOptions}
      label="Subject"
      position="right"
    />
    <DropdownButton
      name="answerStyle"
      value={selectedAnswerStyle}
      options={answerStyleOptions}
      label="Answer style"
      position="right"
    />
  </div>

  {/* Mobile View Dropdowns (Stacked below input) */}
  {/* <div className="flex md:hidden flex-wrap justify-center gap-3 mt-4"> */}
  <div className="grid grid-cols-2 gap-3 mt-4 md:hidden">
    <DropdownButton
      name="class"
      value={selectedClass}
      options={classOptions}
      label="Class 1"
    />
    <DropdownButton
      name="board"
      value={selectedBoard}
      options={boardOptions}
      label="C.B.S.E"
    />
    <DropdownButton
      name="subject"
      value={selectedSubject}
      options={subjectOptions}
      label="Subject"
    />
    <DropdownButton
      name="answerStyle"
      value={selectedAnswerStyle}
      options={answerStyleOptions}
      label="Answer style"
    />
  </div>
</div>


                
              </div>
            </div>
          ) : (
            // Chat Interface - Show when messages exist
            <>
              {/* Chat Area */}
              <div className="flex-1 p-4 mb-4 overflow-y-auto">
                {chatHistory.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white bg-opacity-80 p-3 rounded-lg backdrop-blur-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Section */}
         
              <div className="flex flex-col md:flex-row items-center w-full justify-center">
  {/* Left Side Buttons (Desktop only) */}
  <div className="hidden md:flex flex-col gap-3 mr-4">
    <DropdownButton
      name="class"
      value={selectedClass}
      options={classOptions}
      label="Class 1"
    />
    <DropdownButton
      name="board"
      value={selectedBoard}
      options={boardOptions}
      label="C.B.S.E"
    />
  </div>

  {/* Input Box */}
  <div className="flex-1 w-full md:w-auto">
    <div className="bg-white rounded-3xl border border-gray-400 shadow-sm p-2 md:p-6">
      <input
        type="text"
        placeholder="Type or upload your doubt"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        className="w-full text-gray-600 bg-transparent outline-none mb-6  text-base"
      />
      <div className="flex items-center justify-between">
        <div className="relative group">
          <Plus className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" />
          {/* Tooltip Box */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-white border w-[200px] border-gray-300 rounded-xl shadow-md px-3 py-2 text-sm text-gray-600 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-gray-500">
              <img src={attach} alt="" className="h-6" />
            </span>
            <span>Add photos &amp; files</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-full transition-colors ${
              isRecording
                ? "bg-red-500 text-white"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <img src={mic} alt="" className="w-4 h-5" />
          </button>
          <button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src={send}
              alt=""
              className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Right Side Buttons (Desktop only) */}
  <div className="hidden md:flex flex-col gap-3 ml-4">
    <DropdownButton
      name="subject"
      value={selectedSubject}
      options={subjectOptions}
      label="Subject"
      position="right"
    />
    <DropdownButton
      name="answerStyle"
      value={selectedAnswerStyle}
      options={answerStyleOptions}
      label="Answer style"
      position="right"
    />
  </div>

  {/* Mobile View Dropdowns (Stacked below input) */}
  {/* <div className="flex md:hidden flex-wrap justify-center gap-3 mt-4"> */}
  <div className="grid grid-cols-2 gap-3 mt-4 md:hidden">
    <DropdownButton
      name="class"
      value={selectedClass}
      options={classOptions}
      label="Class 1"
    />
    <DropdownButton
      name="board"
      value={selectedBoard}
      options={boardOptions}
      label="C.B.S.E"
    />
    <DropdownButton
      name="subject"
      value={selectedSubject}
      options={subjectOptions}
      label="Subject"
    />
    <DropdownButton
      name="answerStyle"
      value={selectedAnswerStyle}
      options={answerStyleOptions}
      label="Answer style"
    />
  </div>
</div>







            </>
          )}
        </div>
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* Overlay to close dropdowns when clicking outside */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
