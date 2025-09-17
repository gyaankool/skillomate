const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');
const { checkUsageLimit, incrementUsage, getUsageStats } = require('../middleware/usage');
const { estimateRequestTokens } = require('../utils/tokenEstimator');
const envConfig = require('../config/environment');

const router = express.Router();

// Function to generate chat title from first message
const generateChatTitle = (message) => {
  if (!message || typeof message !== 'string') {
    return 'New Chat';
  }
  
  // Clean the message
  const cleanMessage = message.trim();
  
  // If message is too short, return a generic title
  if (cleanMessage.length < 10) {
    return 'New Chat';
  }
  
  // Extract key words and create a title
  const words = cleanMessage.split(' ').filter(word => 
    word.length > 2 && 
    !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'when', 'where', 'why', 'can', 'could', 'should', 'would', 'will', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'a', 'an'].includes(word.toLowerCase())
  );
  
  // Take first 3-5 meaningful words
  const titleWords = words.slice(0, 4);
  
  if (titleWords.length === 0) {
    return 'New Chat';
  }
  
  // Capitalize first letter of each word and join
  const title = titleWords.map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  // Limit title length
  return title.length > 50 ? title.substring(0, 47) + '...' : title;
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

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

// @desc    Get usage statistics for user
// @route   GET /api/chat/usage
// @access  Private
router.get('/usage', protect, getUsageStats, (req, res) => {
  console.log('=== CHAT ROUTE /usage HANDLER ===');
  console.log('res.locals.usage:', res.locals.usage);
  
  if (!res.locals.usage) {
    console.error('❌ No usage data in res.locals!');
    return res.status(500).json({
      success: false,
      message: 'No usage data available'
    });
  }
  
  console.log('✅ Sending usage response to frontend');
  res.json(res.locals.usage);
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

// @desc    Get messages for a specific chat session
// @route   GET /api/chat/:id/messages
// @access  Private
router.get('/:id/messages', async (req, res) => {
  try {
    console.log('GET /api/chat/:id/messages - Chat ID:', req.params.id, 'User ID:', req.user.id);
    const chat = await Chat.getChatWithMessages(req.params.id, req.user.id);
    
    if (!chat) {
      console.log('Chat not found');
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }
    
    console.log('Chat messages found:', chat.messages ? chat.messages.length : 0);
    
    res.json({
      success: true,
      data: chat.messages || []
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat messages'
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

// @desc    Update chat session context
// @route   PUT /api/chat/:id/context
// @access  Private
router.put('/:id/context', async (req, res) => {
  try {
    console.log('PUT /api/chat/:id/context - Chat ID:', req.params.id, 'User ID:', req.user.id);
    console.log('Context update:', req.body);
    
    const { context } = req.body;
    
    if (!context || typeof context !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid context format'
      });
    }
    
    const chat = await Chat.getChatWithMessages(req.params.id, req.user.id);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }
    
    // Clean and validate context data
    const cleanContext = {};
    if (context.grade) {
      const validGrades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
      if (validGrades.includes(context.grade)) {
        cleanContext.grade = context.grade;
      }
    }
    if (context.subject) {
      const validSubjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics'];
      if (validSubjects.includes(context.subject)) {
        cleanContext.subject = context.subject;
      }
    }
    if (context.board) {
      const validBoards = ['C.B.S.E', 'I.C.S.E', 'State Board', 'International Board'];
      if (validBoards.includes(context.board)) {
        cleanContext.board = context.board;
      }
    }
    if (context.answerStyle) {
      const validAnswerStyles = ['Simple', 'Detailed', 'Step-by-step', 'Visual', 'Interactive'];
      if (validAnswerStyles.includes(context.answerStyle)) {
        cleanContext.answerStyle = context.answerStyle;
      }
    }
    
    // Update chat context
    chat.context = { ...chat.context, ...cleanContext };
    await chat.save();
    
    console.log('Chat context updated:', cleanContext);
    
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error updating chat context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update chat context'
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
    
    // Prepare user context for AI - Only include grade if explicitly provided
    const userContext = {
      user_id: user._id.toString(),
      username: user.username,
      email: user.email,
      board: user.board,
      // grade: user.grade, // REMOVED - Don't pass profile grade automatically
      isEmailVerified: user.isEmailVerified,
      role: user.role
    };
    
    // Call AI backend to create session with user context
    try {
      console.log('Attempting to connect to AI backend...');
      console.log('AI Backend URL:', `${envConfig.AI_BACKEND_URL}/api/session/create`);
      console.log('User context being sent:', userContext);
      
      const aiResponse = await axios.post(`${envConfig.AI_BACKEND_URL}/api/session/create`, {
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
        // Don't increment usage for session creation - only for actual AI responses
        
        res.json({
          success: true,
          session_id: aiData.session_id,
          user_context: userContext,
          usage: {
            responsesToday: user.usageStats.responsesToday,
            remaining: user.getRemainingResponses(),
            plan: user.subscription.plan
          }
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

// @desc    Process AI chat message
// @route   POST /api/chat/ai-message
// @access  Private
router.post('/ai-message', checkUsageLimit, async (req, res) => {
  try {
    console.log('POST /api/chat/ai-message - User ID:', req.user.id);
    console.log('Request body:', req.body);
    const { message, session_id, new_chat, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    // If no session_id and new_chat is true, create a new session first
    let currentSessionId = session_id;
    if (!session_id && new_chat) {
      console.log('Creating new AI session for new chat');
      try {
        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }
        
        const userContext = {
          user_id: user._id.toString(),
          username: user.username,
          email: user.email,
          board: user.board,
          isEmailVerified: user.isEmailVerified,
          role: user.role
        };
        
        const aiResponse = await axios.post(`${envConfig.AI_BACKEND_URL}/api/session/create`, {
          user_id: user._id.toString(),
          user_context: userContext
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        });
        
        if (aiResponse.data.success) {
          currentSessionId = aiResponse.data.session_id;
          console.log('New AI session created:', currentSessionId);
        } else {
          throw new Error('Failed to create AI session');
        }
      } catch (error) {
        console.error('Error creating AI session:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to create AI session'
        });
      }
    }
    
    if (!currentSessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }
    
    // Call AI backend to process the message
    try {
      const aiResponse = await axios.post(`${envConfig.AI_BACKEND_URL}/api/chat`, {
        session_id: currentSessionId,
        message: message,
        user_id: req.user.id
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout for AI processing
      });
      
      if (aiResponse.data.success) {
        // Estimate tokens used for this request
        const estimatedTokens = estimateRequestTokens(message, {
          responseLength: aiResponse.data.response ? aiResponse.data.response.length : 0,
          context: context
        });
        
        console.log('Token consumption:', {
          user: req.userData.username,
          plan: req.userData.subscription.plan,
          estimatedTokens: estimatedTokens,
          messageLength: message.length,
          responseLength: aiResponse.data.response ? aiResponse.data.response.length : 0
        });
        
        // Increment usage after successful AI response
        await req.userData.incrementUsage();
        
        // Consume tokens for student users
        let tokensConsumed = 0;
        if (req.userData.subscription.plan === 'student') {
          console.log('CONSUMING TOKENS for student user:', {
            before: req.userData.tokenUsage.tokensUsedThisMonth,
            consuming: estimatedTokens,
            budget: req.userData.tokenUsage.monthlyTokenBudget
          });
          
          tokensConsumed = await req.userData.consumeTokens(estimatedTokens);
          
          console.log('TOKENS CONSUMED:', {
            consumed: estimatedTokens,
            totalUsedNow: tokensConsumed,
            remaining: req.userData.tokenUsage.monthlyTokenBudget - tokensConsumed
          });
        }
        
        res.json({
          success: true,
          response: aiResponse.data.response,
          session_id: currentSessionId,
          usage: {
            responsesToday: req.userData.usageStats.responsesToday,
            remaining: req.userData.getRemainingResponses(),
            plan: req.userData.subscription.plan,
            tokenUsage: req.userData.getTokenUsageInfo(),
            tokensConsumedThisRequest: estimatedTokens
          }
        });
      } else {
        throw new Error(aiResponse.data.error || 'Failed to process AI message');
      }
    } catch (aiError) {
      console.error('AI backend error:', aiError);
      res.status(500).json({
        success: false,
        error: `Failed to process AI message: ${aiError.message}`
      });
    }
  } catch (error) {
    console.error('Error processing AI message:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to process AI message',
      details: error.message
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

// @desc    Update chat context
// @route   PUT /api/chat/:id/context
// @access  Private
router.put('/:id/context', async (req, res) => {
  try {
    const { context } = req.body;
    const chatId = req.params.id;

    // Validate chat exists and belongs to user
    const chat = await Chat.findOne({ 
      _id: chatId, 
      userId: req.user.id, 
      isActive: true 
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    // Validate context data
    const validGrades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
    const validSubjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics'];
    const validBoards = ['C.B.S.E', 'I.C.S.E', 'State Board', 'International Board'];
    const validAnswerStyles = ['Simple', 'Detailed', 'Step-by-step', 'Visual', 'Interactive'];

    const cleanContext = {};

    if (context && typeof context === 'object') {
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

    // Update chat context
    chat.context = { ...chat.context, ...cleanContext };
    await chat.save();

    res.json({
      success: true,
      message: 'Chat context updated successfully',
      data: {
        context: chat.context
      }
    });
  } catch (error) {
    console.error('Error updating chat context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update chat context'
    });
  }
});

// Voice input with usage tracking
router.post('/voice-input', checkUsageLimit, upload.single('audio'), async (req, res) => {
  try {
    // Handle uploaded audio file
    const audio = req.file;
    const context = req.body.context;
    const session_id = req.body.session_id;
    const new_chat = req.body.new_chat;
    
    console.log('Voice input received:', {
      hasAudio: !!audio,
      audioSize: audio?.size,
      audioType: audio?.mimetype,
      context: context,
      session_id: session_id,
      new_chat: new_chat
    });
    
    if (!audio) {
      return res.status(400).json({ 
        success: false, 
        error: 'Audio file is required' 
      });
    }

    // Forward to AI server
    const formData = new FormData();
    formData.append('audio', audio.buffer, {
      filename: audio.originalname || 'voice.wav',
      contentType: audio.mimetype || 'audio/wav'
    });
    if (context) formData.append('context', context);
    if (session_id) formData.append('session_id', session_id);
    if (new_chat) formData.append('new_chat', new_chat);

    const aiResponse = await fetch(`${process.env.AI_SERVER_URL || 'http://localhost:8000'}/api/voice-input`, {
      method: 'POST',
      body: formData
    });

    if (!aiResponse.ok) {
      return res.status(aiResponse.status).json({
        success: false,
        error: 'AI server error'
      });
    }

    const aiData = await aiResponse.json();

    if (aiData.success) {
      // Increment usage only if AI response was successful
      await req.userData.incrementUsage();
      
      res.json({
        success: true,
        ...aiData,
        usage: {
          plan: req.userData.subscription.plan,
          responsesToday: req.userData.usageStats.responsesToday,
          remaining: req.userData.getRemainingResponses(),
          totalResponses: req.userData.usageStats.totalResponses
        }
      });
    } else {
      res.json(aiData);
    }
  } catch (error) {
    console.error('Voice input error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;
