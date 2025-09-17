/**
 * Token Estimation Utility
 * Uses js-tiktoken for accurate OpenAI-compatible token counting
 */

const { encoding_for_model } = require('js-tiktoken');

// Initialize the encoder for GPT models (cl100k_base encoding)
let encoder;
try {
  encoder = encoding_for_model('gpt-3.5-turbo'); // Uses cl100k_base encoding
} catch (error) {
  console.warn('js-tiktoken not available, falling back to character estimation');
  encoder = null;
}

// Accurate token estimation using OpenAI's tiktoken
const estimateTokens = (text) => {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  if (encoder) {
    // Use proper OpenAI tokenization
    try {
      const tokens = encoder.encode(text);
      return tokens.length;
    } catch (error) {
      console.warn('Tiktoken encoding failed, using fallback:', error.message);
    }
  }
  
  // Fallback: OpenAI's documented ratio (1 token ≈ 4 characters for English)
  return Math.ceil(text.length / 4);
};

// Estimate tokens for OpenAI chat completion (user + assistant messages)
const estimateRequestTokens = (userMessage, context = {}) => {
  let totalTokens = 0;
  
  // User message tokens (using accurate tiktoken)
  const userTokens = estimateTokens(userMessage);
  totalTokens += userTokens;
  
  // Response tokens (if actual response length is provided)
  if (context.responseLength && context.responseLength > 0) {
    const responseText = 'A'.repeat(context.responseLength); // Approximate response
    const responseTokens = estimateTokens(responseText);
    totalTokens += responseTokens;
  } else {
    // Fallback: Estimate response is 2-3x longer than input for educational content
    totalTokens += userTokens * 2.5;
  }
  
  // OpenAI Chat Completion overhead (ChatML format)
  // Every message follows <|im_start|>role\ncontent<|im_end|>\n format
  totalTokens += 8; // Overhead for user message formatting
  totalTokens += 8; // Overhead for assistant message formatting
  
  // System prompt tokens (if any)
  if (context.systemPrompt) {
    totalTokens += estimateTokens(context.systemPrompt);
    totalTokens += 8; // System message formatting overhead
  } else {
    totalTokens += 100; // Estimate for typical system prompt
  }
  
  // Context tokens (subject, grade, board info)
  if (context.subject) totalTokens += 5;
  if (context.grade) totalTokens += 3;
  if (context.board) totalTokens += 3;
  
  return Math.max(totalTokens, 50); // Minimum 50 tokens for any chat completion
};

// Categorize request complexity for better estimation
const categorizeRequest = (userMessage) => {
  const message = userMessage.toLowerCase();
  
  // Short requests (simple questions, greetings)
  if (message.length < 100 || 
      message.includes('hi') || 
      message.includes('hello') ||
      message.includes('thanks') ||
      message.includes('ok')) {
    return {
      category: 'short',
      estimatedTokens: 200,
      description: 'Simple questions, greetings, acknowledgments'
    };
  }
  
  // Medium requests (standard homework questions)
  if (message.length < 500 || 
      message.includes('explain') ||
      message.includes('how') ||
      message.includes('what') ||
      message.includes('solve')) {
    return {
      category: 'medium',
      estimatedTokens: 500,
      description: 'Standard homework questions, explanations'
    };
  }
  
  // Long requests (complex problems, detailed explanations)
  return {
    category: 'long',
    estimatedTokens: 1000,
    description: 'Complex problems, detailed explanations, multi-step solutions'
  };
};

// Get token budget information for different plans
const getTokenBudgetInfo = (plan) => {
  const budgets = {
    free: {
      monthlyTokens: 0,
      dailyTokens: 0,
      description: 'Free plan - no token access'
    },
    student: {
      monthlyTokens: 66000,
      dailyTokens: 2200, // 66000 / 30 days
      description: 'Student plan - 66,000 tokens per month'
    },
    family: {
      monthlyTokens: 'unlimited',
      dailyTokens: 'unlimited',
      description: 'Family plan - unlimited tokens'
    }
  };
  
  return budgets[plan] || budgets.free;
};

// Calculate remaining doubts based on token usage
const calculateRemainingDoubts = (tokensUsed, tokenBudget, category = 'medium') => {
  if (tokenBudget === 'unlimited' || tokenBudget === 0) {
    return 'unlimited';
  }
  
  const remainingTokens = Math.max(0, tokenBudget - tokensUsed);
  const categoryEstimates = {
    short: 200,
    medium: 500,
    long: 1000
  };
  
  const tokensPerDoubt = categoryEstimates[category] || 500;
  return Math.floor(remainingTokens / tokensPerDoubt);
};

// Clean up encoder resources
const cleanup = () => {
  if (encoder) {
    try {
      encoder.free();
    } catch (error) {
      // Ignore cleanup errors
    }
  }
};

// Handle process exit
process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

module.exports = {
  estimateTokens,
  estimateRequestTokens,
  categorizeRequest,
  getTokenBudgetInfo,
  calculateRemainingDoubts,
  cleanup
};
