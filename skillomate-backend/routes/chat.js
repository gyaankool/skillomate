const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Test route to check if chat routes are working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Chat routes are working',
    user: req.user.id
  });
});

// @desc    Get chat statistics for user
// @route   GET /api/chat/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    console.log('GET /api/chat/stats - User ID:', req.user.id);
    const totalChats = await Chat.countDocuments({ userId: req.user.id, isActive: true });
    const totalMessages = await Chat.aggregate([
      { $match: { userId: req.user._id, isActive: true } },
      { $unwind: '$messages' },
      { $count: 'total' }
    ]);
    
    const recentChats = await Chat.find({ userId: req.user.id, isActive: true })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title updatedAt');
    
    res.json({
      success: true,
      data: {
        totalChats,
        totalMessages: totalMessages[0]?.total || 0,
        recentChats
      }
    });
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat statistics'
    });
  }
});

// @desc    Get all chat sessions for a user
// @route   GET /api/chat
// @access  Private
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/chat - User ID:', req.user.id);
    const chats = await Chat.getUserChats(req.user.id);
    console.log('Found chats:', chats.length);
    
    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat sessions'
    });
  }
});

// @desc    Get a specific chat session
// @route   GET /api/chat/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    console.log('GET /api/chat/:id - Chat ID:', req.params.id, 'User ID:', req.user.id);
    const chat = await Chat.getChatWithMessages(req.params.id, req.user.id);
    
    if (!chat) {
      console.log('Chat not found');
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }
    
    console.log('Chat found:', chat.title);
    console.log('Chat messages:', chat.messages);
    console.log('Chat messages length:', chat.messages ? chat.messages.length : 0);
    console.log('Chat messages type:', typeof chat.messages);
    console.log('Chat messages is array:', Array.isArray(chat.messages));
    
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat session'
    });
  }
});

// @desc    Create a new chat session
// @route   POST /api/chat
// @access  Private
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/chat - User ID:', req.user.id);
    console.log('Request body:', req.body);
    
    const { title, context } = req.body;
    
    // Clean and validate context data - make it completely optional
    const cleanContext = {};
    if (context && typeof context === 'object') {
      // Only include valid enum values if they exist
      const validGrades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
      const validSubjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics'];
      const validBoards = ['C.B.S.E', 'I.C.S.E', 'State Board', 'International Board'];
      const validAnswerStyles = ['Simple', 'Detailed', 'Step-by-step', 'Visual', 'Interactive'];
      
      if (context.grade && validGrades.includes(context.grade)) {
        cleanContext.grade = context.grade;
      }
      if (context.subject && validSubjects.includes(context.subject)) {
        cleanContext.subject = context.subject;
      }
      if (context.board && validBoards.includes(context.board)) {
        cleanContext.board = context.board;
      }
      if (context.answerStyle && validAnswerStyles.includes(context.answerStyle)) {
        cleanContext.answerStyle = context.answerStyle;
      }
    }
    
    const chat = await Chat.create({
      userId: req.user.id,
      title: title || 'New Chat',
      context: cleanContext,
      messages: []
    });
    
    console.log('Chat created:', chat._id);
    
    // Add chat session to user's chatSessions array
    await req.user.addChatSession(chat._id);
    console.log('Chat added to user sessions');
    
    res.status(201).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create chat session'
    });
  }
});

// @desc    Add message to chat session
// @route   POST /api/chat/:id/messages
// @access  Private
router.post('/:id/messages', async (req, res) => {
  try {
    console.log('POST /api/chat/:id/messages - Chat ID:', req.params.id, 'User ID:', req.user.id);
    console.log('Request body:', req.body);
    
    const { message } = req.body;
    
    // Validate message structure
    if (!message || typeof message !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid message format'
      });
    }
    
    // Create a properly formatted message
    const formattedMessage = {
      id: message.id || Date.now().toString(),
      type: message.type || 'user',
      content: message.content || '',
      timestamp: message.timestamp || new Date().toISOString()
    };
    
    console.log('Formatted message:', formattedMessage);
    
    const chat = await Chat.getChatWithMessages(req.params.id, req.user.id);
    
    if (!chat) {
      console.log('Chat not found');
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }
    
    // Add message to chat
    await chat.addMessage(formattedMessage);
    console.log('Message added to chat');
    
    // Update title if it's the first user message
    if (formattedMessage.type === 'user' && chat.messages.length === 1) {
      const title = formattedMessage.content.substring(0, 50);
      await chat.updateTitle(title);
      console.log('Chat title updated:', title);
    }
    
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add message to chat'
    });
  }
});

// @desc    Update chat session title
// @route   PUT /api/chat/:id/title
// @access  Private
router.put('/:id/title', [
  body('title').isString().trim().isLength({ min: 1, max: 100 }),
  handleValidationErrors
], async (req, res) => {
  try {
    console.log('PUT /api/chat/:id/title - Chat ID:', req.params.id, 'User ID:', req.user.id);
    const chat = await Chat.getChatWithMessages(req.params.id, req.user.id);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }
    
    await chat.updateTitle(req.body.title);
    
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error updating chat title:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update chat title'
    });
  }
});

// @desc    Create AI session with user context
// @route   POST /api/chat/ai-session
// @access  Private
router.post('/ai-session', async (req, res) => {
  try {
    console.log('POST /api/chat/ai-session - User ID:', req.user.id);
    
    // Get user information
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Prepare user context for AI
    const userContext = {
      user_id: user._id.toString(),
      username: user.username,
      email: user.email,
      board: user.board,
      grade: user.grade,
      isEmailVerified: user.isEmailVerified,
      role: user.role
    };
    
    // Call AI backend to create session with user context
    try {
      console.log('Attempting to connect to AI backend...');
      console.log('AI Backend URL:', `${process.env.AI_BACKEND_URL || 'http://localhost:8000'}/api/session/create`);
      console.log('User context being sent:', userContext);
      
      const aiResponse = await axios.post(`${process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000'}/api/session/create`, {
        user_id: user._id.toString(),
        user_context: userContext
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('AI backend response status:', aiResponse.status);
      console.log('AI backend response data:', aiResponse.data);
      
      const aiData = aiResponse.data;
      
      if (aiData.success) {
        res.json({
          success: true,
          session_id: aiData.session_id,
          user_context: userContext
        });
      } else {
        throw new Error(aiData.error || 'Failed to create AI session');
      }
    } catch (aiError) {
      console.error('AI backend error:', aiError);
      if (aiError.response) {
        console.error('AI backend error response:', aiError.response.data);
        res.status(500).json({
          success: false,
          error: `Failed to create AI session: ${aiError.response.status} - ${JSON.stringify(aiError.response.data)}`
        });
      } else {
        res.status(500).json({
          success: false,
          error: `Failed to create AI session: ${aiError.message}`
        });
      }
    }
  } catch (error) {
    console.error('Error creating AI session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create AI session'
    });
  }
});

// @desc    Delete chat session (soft delete)
// @route   DELETE /api/chat/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    console.log('DELETE /api/chat/:id - Chat ID:', req.params.id, 'User ID:', req.user.id);
    const chat = await Chat.getChatWithMessages(req.params.id, req.user.id);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }
    
    // Soft delete the chat
    await chat.softDelete();
    
    // Remove chat session from user's chatSessions array
    await req.user.removeChatSession(chat._id);
    
    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chat session'
    });
  }
});

module.exports = router;
