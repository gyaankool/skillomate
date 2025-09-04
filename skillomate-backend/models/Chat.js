const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'ai', 'error'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  }
}, { _id: false });

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Chat'
  },
  messages: [messageSchema],
  context: {
    grade: {
      type: String,
      enum: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
    },
    subject: {
      type: String,
      enum: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics']
    },
    board: {
      type: String,
      enum: ['C.B.S.E', 'I.C.S.E', 'State Board', 'International Board']
    },
    answerStyle: {
      type: String,
      enum: ['Simple', 'Detailed', 'Step-by-step', 'Visual', 'Interactive']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, isActive: 1 });

// Virtual for message count
chatSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Method to add message
chatSchema.methods.addMessage = function(message) {
  this.messages.push(message);
  return this.save();
};

// Method to update title
chatSchema.methods.updateTitle = function(title) {
  this.title = title;
  return this.save();
};

// Method to soft delete
chatSchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

// Static method to get user's active chats
chatSchema.statics.getUserChats = function(userId) {
  return this.find({ userId, isActive: true })
    .sort({ updatedAt: -1 })
    .select('title messages context createdAt updatedAt')
    .limit(50);
};

// Static method to get chat with messages
chatSchema.statics.getChatWithMessages = function(chatId, userId) {
  return this.findOne({ _id: chatId, userId, isActive: true });
};

module.exports = mongoose.model('Chat', chatSchema);
