import openai
import os
import json
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class ConversationalHomeworkTutor:
    """
    Conversational Homework Assistant
    A friendly AI tutor that helps students with their homework through:
    - Step-by-step guidance
    - Interactive questioning
    - Personalized learning approach
    - Encouraging and supportive responses
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required but not found")
        
        self.client = openai.OpenAI(api_key=self.openai_api_key)
    
    def generate_conversational_response(self, question: str, user_context: Optional[Dict] = None, 
                                       conversation_history: List[Dict] = None, 
                                       context_data: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Generate a conversational, interactive response for homework help
        """
        try:
            # Analyze the question type
            question_type = self._analyze_question_type(question)
            logger.info(f"Question: '{question}' -> Detected type: {question_type}")
            
            # Generate appropriate response based on type with enhanced context
            if question_type == "greeting":
                logger.info("Handling as greeting")
                return self._handle_greeting(question, user_context, context_data)
            elif question_type == "identity":
                logger.info("Handling as identity question")
                return self._handle_identity(question, user_context, conversation_history, context_data)
            elif question_type == "math_problem":
                logger.info("Handling as math problem")
                return self._handle_math_problem(question, user_context, conversation_history, context_data)
            elif question_type == "concept_explanation":
                logger.info("Handling as concept explanation")
                return self._handle_concept_explanation(question, user_context, conversation_history, context_data)
            elif question_type == "step_by_step":
                logger.info("Handling as step-by-step")
                return self._handle_step_by_step(question, user_context, conversation_history, context_data)
            elif question_type == "factual":
                logger.info("Handling as factual question")
                return self._handle_factual_question(question, user_context, context_data)
            else:
                logger.info("Handling as general question")
                return self._handle_general_question(question, user_context, conversation_history, context_data)
                
        except Exception as e:
            logger.error(f"Error in conversational response: {str(e)}")
            return {
                "success": True,
                "response": "I'm here to help! Let me guide you through this step by step. What specific part are you stuck on?",
                "interactive": True,
                "suggestions": ["Can you show me what you've tried so far?", "What's the first step you think we should take?"]
            }
    
    def _analyze_question_type(self, question: str) -> str:
        """Analyze what type of question this is"""
        question_lower = question.lower().strip()
        
        # Math problems - Check this FIRST to avoid false positives
        if any(word in question_lower for word in ['solve', 'calculate', 'find', 'equation', 'formula']):
            return "math_problem"
        
        # Check for mathematical operators (+, -, *, /, =)
        if any(op in question_lower for op in ['+', '-', '*', '/', '=']):
            return "math_problem"
        
        # Greetings - Check for exact word matches, not substrings
        greeting_words = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening']
        if any(word == question_lower or question_lower.startswith(word + ' ') for word in greeting_words):
            return "greeting"
        
        # Identity questions
        if any(phrase in question_lower for phrase in ['who am i', 'what is my name', 'do you know me']):
            return "identity"
        
        # Concept explanations
        if any(word in question_lower for word in ['explain', 'what is', 'how does', 'why does', 'define']):
            return "concept_explanation"
        
        # Step-by-step guidance
        if any(word in question_lower for word in ['how to', 'steps', 'procedure', 'method']):
            return "step_by_step"
        
        # Factual questions
        if any(word in question_lower for word in ['when', 'where', 'who', 'what year']):
            return "factual"
        
        return "general"
    
    def _handle_greeting(self, question: str, user_context: Optional[Dict], context_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Handle greetings with homework focus"""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Greeting handler - user_context: {user_context}")
        logger.info(f"Greeting handler - context_data: {context_data}")
        
        user_name = user_context.get("name") if user_context else None
        user_grade = user_context.get("grade") if user_context else None
        user_board = user_context.get("board") if user_context else None
        
        if user_name:
            # Check if this is a follow-up greeting (returning user)
            if context_data and context_data.get("is_followup"):
                grade_text = f" ({user_grade})" if user_grade else ""
                board_text = f" from {user_board}" if user_board else ""
                response = f"Welcome back, {user_name}{grade_text}{board_text}! 👋 How can I help you continue with your studies today?"
            else:
                grade_text = f" ({user_grade})" if user_grade else ""
                board_text = f" from {user_board}" if user_board else ""
                response = f"Hi {user_name}! 📚 Ready to tackle some homework together? What subject are you working on?"
        else:
            response = "Hi! 👋 I'm your homework assistant! What's your name, and what homework can I help you with?"
        
        return {
            "success": True,
            "response": response,
            "interactive": True,
            "suggestions": ["Math homework", "Science questions", "English assignment", "History project"]
        }
    
    def _handle_identity(self, question: str, user_context: Optional[Dict], 
                        conversation_history: List[Dict], context_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Handle identity questions with homework context"""
        user_name = user_context.get("name") if user_context else None
        user_grade = user_context.get("grade") if user_context else None
        
        if user_name:
            grade_text = f" in grade {user_grade}" if user_grade else ""
            response = f"You're {user_name}{grade_text}! What homework problem can I help you solve?"
        else:
            response = "I don't have your details yet! Tell me your name and what homework you need help with?"
        
        return {
            "success": True,
            "response": response,
            "interactive": True,
            "suggestions": ["Math problem", "Science question", "Reading assignment", "Writing help"]
        }
    
    def _handle_math_problem(self, question: str, user_context: Optional[Dict], 
                           conversation_history: List[Dict], context_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Handle math problems with interactive guidance"""
        
        # Create a homework-focused prompt for math problems with context
        context_info = ""
        if context_data and context_data.get("conversation_summary"):
            context_info = f"\nCONVERSATION CONTEXT: {context_data['conversation_summary']}"
        
        # Removed follow-up info to prevent intro phrases
        
        prompt = f"""You are Skillomate, a helpful homework assistant for Indian students.

STUDENT CONTEXT:
- Name: {user_context.get('name', 'Student') if user_context else 'Student'}
- Grade: {user_context.get('grade', 'Class 8') if user_context else 'Class 8'}
- Board: {user_context.get('board', 'CBSE') if user_context else 'CBSE'}{context_info}

RESPONSE REQUIREMENTS:
1. Use GUIDED LEARNING - don't give direct answers
2. For CBSE board: Structure as "Given:", "To Find:", "Solution:", "Answer:"
3. For ICSE board: Provide detailed explanations with verification
4. Use Indian context: ₹ currency, Indian examples, local references
5. Include the mathematical answer clearly
6. Guide step-by-step appropriate for the grade level

MATH PROBLEM: {question}

Provide a structured response with clear guidance and include the solution following board-specific format."""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": question}
            ],
            max_tokens=400,
            temperature=0.7
        )
        
        tutor_response = response.choices[0].message.content.strip()
        
        
        # Ensure Indian context is applied
        if "₹" not in tutor_response and "dollar" in tutor_response.lower():
            tutor_response = tutor_response.replace("$", "₹").replace("dollar", "rupee")
        if "USD" in tutor_response:
            tutor_response = tutor_response.replace("USD", "INR")

        return {
            "success": True,
            "response": tutor_response,
            "interactive": True,
            "suggestions": [
                "I can do this step",
                "I need help with this step",
                "Can you give me a hint?",
                "What's the next step?"
            ]
        }
    
    def _handle_concept_explanation(self, question: str, user_context: Optional[Dict], 
                                  conversation_history: List[Dict], context_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Handle concept explanations conversationally"""
        
        # Add context information
        context_info = ""
        if context_data and context_data.get("conversation_summary"):
            context_info = f"\nCONVERSATION CONTEXT: {context_data['conversation_summary']}"
        
        # Removed follow-up info to prevent intro phrases
        
        prompt = f"""You are a homework assistant helping a student understand a concept through GUIDED LEARNING.

STUDENT INFO:
- Name: {user_context.get('name', 'Student') if user_context else 'Student'}
- Grade: {user_context.get('grade', 'middle school') if user_context else 'middle school'}{context_info}

YOUR GUIDED LEARNING STYLE:
- Start with a simple introduction to the concept
- Use age-appropriate examples and analogies
- Ask "What do you think this means?"
- Guide them to make connections
- Don't overwhelm with too much information at once
- Build upon previous explanations when relevant

CONCEPT THEY NEED HELP WITH: {question}

Explain this concept as their helpful homework buddy who:
1. Introduces the concept in simple terms
2. Uses a relatable example for their age/grade
3. Asks them to think about it
4. Offers to explain more if needed
5. References previous discussions when relevant

KEEP IT GUIDED: Under 60 words, encourage them to think and ask questions."""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": question}
            ],
            max_tokens=300,
            temperature=0.8
        )
        
        tutor_response = response.choices[0].message.content.strip()
        
        
        # Ensure Indian context is applied
        if "₹" not in tutor_response and "dollar" in tutor_response.lower():
            tutor_response = tutor_response.replace("$", "₹").replace("dollar", "rupee")
        if "USD" in tutor_response:
            tutor_response = tutor_response.replace("USD", "INR")

        return {
            "success": True,
            "response": tutor_response,
            "interactive": True,
            "suggestions": [
                "I think I understand",
                "Can you explain it differently?",
                "Can you give me an example?",
                "I need more help"
            ]
        }
    
    def _handle_step_by_step(self, question: str, user_context: Optional[Dict], 
                           conversation_history: List[Dict], context_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Handle step-by-step guidance conversationally"""
        
        # Add context information
        context_info = ""
        if context_data and context_data.get("conversation_summary"):
            context_info = f"\nCONVERSATION CONTEXT: {context_data['conversation_summary']}"
        
        # Removed follow-up info to prevent intro phrases
        
        prompt = f"""You are a helpful tutor guiding a student through a process using PROGRESSIVE GUIDED LEARNING.

STUDENT CONTEXT:
- Grade: {user_context.get('grade', 'middle school') if user_context else 'middle school'}
- Name: {user_context.get('name', 'Student') if user_context else 'Student'}{context_info}

GUIDED LEARNING APPROACH:
- Start with ONLY the first step
- Ask them to try that step first
- Give progressive hints if they're stuck
- Adapt explanations to their grade level
- Be encouraging and supportive
- Use simple, age-appropriate language
- Make it interactive and engaging
- Build on previous progress when relevant

STUDENT QUESTION: {question}

Give them just the FIRST STEP and ask if they can do it. Don't give all steps at once. Guide them to discover the process themselves."""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": question}
            ],
            max_tokens=200,
            temperature=0.8
        )
        
        tutor_response = response.choices[0].message.content.strip()
        
        
        # Ensure Indian context is applied
        if "₹" not in tutor_response and "dollar" in tutor_response.lower():
            tutor_response = tutor_response.replace("$", "₹").replace("dollar", "rupee")
        if "USD" in tutor_response:
            tutor_response = tutor_response.replace("USD", "INR")

        return {
            "success": True,
            "response": tutor_response,
            "interactive": True,
            "suggestions": [
                "I can do this step",
                "I need a hint",
                "What's the next step?",
                "Can you explain this step more?"
            ]
        }
    
    def _handle_factual_question(self, question: str, user_context: Optional[Dict], context_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Handle factual questions conversationally"""
        
        # Add context information
        context_info = ""
        if context_data and context_data.get("conversation_summary"):
            context_info = f"\nCONVERSATION CONTEXT: {context_data['conversation_summary']}"
        
        # Removed follow-up info to prevent intro phrases
        
        prompt = f"""You are a friendly tutor answering factual questions.

STUDENT CONTEXT:
- Grade: {user_context.get('grade', 'middle school') if user_context else 'middle school'}
- Name: {user_context.get('name', 'Student') if user_context else 'Student'}{context_info}

APPROACH:
- Give a simple, direct answer
- Add a brief, interesting fact if relevant
- Ask if they want to know more
- Be conversational
- Connect to previous discussion when relevant

STUDENT QUESTION: {question}

Give a simple, conversational answer."""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": question}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        tutor_response = response.choices[0].message.content.strip()
        
        
        # Ensure Indian context is applied
        if "₹" not in tutor_response and "dollar" in tutor_response.lower():
            tutor_response = tutor_response.replace("$", "₹").replace("dollar", "rupee")
        if "USD" in tutor_response:
            tutor_response = tutor_response.replace("USD", "INR")

        return {
            "success": True,
            "response": tutor_response,
            "interactive": True,
            "suggestions": [
                "Tell me more about this",
                "Why is this important?",
                "How does this relate to what we're studying?",
                "Thanks, that helps!"
            ]
        }
    
    def _handle_general_question(self, question: str, user_context: Optional[Dict], 
                               conversation_history: List[Dict], context_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Handle general questions conversationally"""
        
        # Add context information
        context_info = ""
        if context_data and context_data.get("conversation_summary"):
            context_info = f"\nCONVERSATION CONTEXT: {context_data['conversation_summary']}"
        
        # Removed follow-up info to prevent intro phrases
        
        prompt = f"""You are a homework assistant helping a student through GUIDED LEARNING.

STUDENT INFO:
- Name: {user_context.get('name', 'Student') if user_context else 'Student'}
- Grade: {user_context.get('grade', 'middle school') if user_context else 'middle school'}{context_info}

YOUR GUIDED LEARNING APPROACH:
- Guide them to discover answers themselves
- Be encouraging and supportive
- Use age-appropriate explanations
- Ask questions to help them think
- Connect concepts to what they already know
- Build upon previous discussions when relevant

HOMEWORK QUESTION: {question}

Answer as their helpful homework assistant who:
1. Guides them to think about the answer
2. Uses age-appropriate examples
3. Asks questions to help them understand
4. Encourages them to explore further
5. References previous discussions when relevant

KEEP IT GUIDED: Under 50 words, encourage thinking and discovery."""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": question}
            ],
            max_tokens=250,
            temperature=0.8
        )
        
        tutor_response = response.choices[0].message.content.strip()
        
        
        # Ensure Indian context is applied
        if "₹" not in tutor_response and "dollar" in tutor_response.lower():
            tutor_response = tutor_response.replace("$", "₹").replace("dollar", "rupee")
        if "USD" in tutor_response:
            tutor_response = tutor_response.replace("USD", "INR")

        return {
            "success": True,
            "response": tutor_response,
            "interactive": True,
            "suggestions": [
                "I think I understand",
                "Can you explain more?",
                "Can you give me an example?",
                "I need help with something else"
            ]
        }
    
    def generate_follow_up_question(self, current_response: str, question_type: str) -> str:
        """Generate a follow-up question to keep the conversation going"""
        
        follow_up_prompts = {
            "math_problem": [
                "Did you try that step? How did it go?",
                "What answer did you get?",
                "Are you stuck on any particular part?",
                "Would you like me to show you the next step?"
            ],
            "concept_explanation": [
                "Does that make sense to you?",
                "Can you give me an example of this?",
                "How would you explain this to a friend?",
                "What part is still unclear?"
            ],
            "step_by_step": [
                "Were you able to complete that step?",
                "What happened when you tried it?",
                "Ready for the next step?",
                "Do you need me to explain that step differently?"
            ],
            "general": [
                "Does that help?",
                "What else would you like to know?",
                "How can I help you further?",
                "Is there anything else you're confused about?"
            ]
        }
        
        import random
        prompts = follow_up_prompts.get(question_type, follow_up_prompts["general"])
        return random.choice(prompts)
