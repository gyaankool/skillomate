import openai
import os
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from dotenv import load_dotenv
import uuid

# Load environment variables from .env file
load_dotenv()

from agents.curriculum_mapper import CurriculumMapperAgent
from agents.guided_solver import GuidedSolverAgent
from agents.formatter_agent import FormatterAgent
from agents.diagram_generator import DiagramGeneratorAgent
from agents.offline_cache import OfflineCacheAgent
from agents.enhanced_question_analyzer import EnhancedQuestionAnalyzer
from agents.conversational_homework_tutor import ConversationalHomeworkTutor
from agents.conversation_context_manager import ConversationContextManager

logger = logging.getLogger(__name__)

class SkillomateAIOrchestrator:
    """
    Main AI Orchestrator that coordinates all agents for comprehensive homework assistance
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        # Check if API key is available
        if not self.openai_api_key:
            logger.error("OPENAI_API_KEY not found in environment variables!")
            logger.error("Please set your OpenAI API key in one of these ways:")
            logger.error("1. Create a .env file with: OPENAI_API_KEY=your_key_here")
            logger.error("2. Set environment variable: export OPENAI_API_KEY=your_key_here")
            raise ValueError("OPENAI_API_KEY is required but not found")
        
        # Initialize OpenAI client
        self.client = openai.OpenAI(api_key=self.openai_api_key)
        
        # Initialize all agents
        self.curriculum_mapper = CurriculumMapperAgent()
        self.guided_solver = GuidedSolverAgent()
        self.formatter_agent = FormatterAgent()
        self.diagram_generator = DiagramGeneratorAgent()
        self.offline_cache = OfflineCacheAgent()
        
        # Initialize enhanced components
        self.question_analyzer = EnhancedQuestionAnalyzer()
        self.conversational_tutor = ConversationalHomeworkTutor()
        self.context_manager = ConversationContextManager()
        
        # Set default OpenAI model
        self.default_model = "gpt-4o-mini"
        
        # Conversation history management
        self.conversation_sessions = {}  # session_id -> conversation_data
        self.max_history_length = 20  # Maximum messages to keep in history
    
    def _create_session(self, user_id: Optional[str] = None, user_context: Optional[Dict[str, Any]] = None) -> str:
        """Create a new conversation session with user context"""
        session_id = str(uuid.uuid4())
        
        # Initialize default user context
        default_context = {
            "name": None,
            "grade": None,
            "subject": None,
            "preferences": {}
        }
        
        # Update with provided user context
        if user_context:
            logger.info(f"Received user context: {user_context}")
            # Map backend user context to AI context
            if user_context.get('username'):
                default_context['name'] = user_context['username']
            if user_context.get('grade'):
                default_context['grade'] = user_context['grade']
            if user_context.get('board'):
                default_context['board'] = user_context['board']
            if user_context.get('email'):
                default_context['email'] = user_context['email']
            if user_context.get('role'):
                default_context['role'] = user_context['role']
            
            logger.info(f"Mapped AI context: {default_context}")
        
        self.conversation_sessions[session_id] = {
            "user_id": user_id,
            "conversation_history": [],
            "user_context": default_context,
            "created_at": datetime.now(),
            "last_activity": datetime.now()
        }
        
        logger.info(f"Created session {session_id} with user context: {default_context}")
        return session_id
    
    def _get_or_create_session(self, session_id: Optional[str] = None, user_id: Optional[str] = None) -> str:
        """Get existing session or create new one"""
        if session_id and session_id in self.conversation_sessions:
            # Update last activity
            self.conversation_sessions[session_id]["last_activity"] = datetime.now()
            return session_id
        else:
            return self._create_session(user_id)
    
    def _update_session_context(self, session_id: str, context_updates: Dict[str, Any]) -> bool:
        """Update user context for a session"""
        try:
            if session_id not in self.conversation_sessions:
                logger.error(f"Session {session_id} not found for context update")
                return False
            
            session = self.conversation_sessions[session_id]
            user_context = session.get("user_context", {})
            
            # Update context with new values
            for key, value in context_updates.items():
                if value:  # Only update if value is not empty
                    user_context[key] = value
            
            # Update the session
            session["user_context"] = user_context
            session["last_activity"] = datetime.now()
            
            logger.info(f"Updated session {session_id} context: {context_updates}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating session context: {str(e)}")
            return False
    
    def _extract_user_info(self, message: str) -> Dict[str, Any]:
        """Extract user information from messages"""
        user_info = {}
        
        # Extract name
        name_patterns = [
            r"i am (\w+)",
            r"my name is (\w+)",
            r"i'm (\w+)",
            r"call me (\w+)",
            r"i am abhinaya",
            r"i'm abhinaya"
        ]
        
        message_lower = message.lower()
        for pattern in name_patterns:
            import re
            match = re.search(pattern, message_lower)
            if match:
                user_info["name"] = match.group(1).title()
                break
        
        # Extract grade/class
        grade_patterns = [
            r"class (\d+)",
            r"grade (\d+)",
            r"(\d+)(?:st|nd|rd|th) class",
            r"(\d+)(?:st|nd|rd|th) grade"
        ]
        
        for pattern in grade_patterns:
            match = re.search(pattern, message_lower)
            if match:
                user_info["grade"] = int(match.group(1))
                break
        
        return user_info
    
    def _update_user_context(self, session_id: str, message: str):
        """Update user context based on conversation"""
        if session_id not in self.conversation_sessions:
            return
        
        session = self.conversation_sessions[session_id]
        user_info = self._extract_user_info(message)
        
        # Update user context
        if user_info.get("name"):
            session["user_context"]["name"] = user_info["name"]
        if user_info.get("grade"):
            session["user_context"]["grade"] = user_info["grade"]
    
    def _get_conversation_context(self, session_id: str) -> str:
        """Get conversation context for AI prompt"""
        if session_id not in self.conversation_sessions:
            return ""
        
        session = self.conversation_sessions[session_id]
        context_parts = []
        
        # Add user context
        user_context = session["user_context"]
        if user_context["name"]:
            context_parts.append(f"STUDENT NAME: {user_context['name']}")
        if user_context["grade"]:
            context_parts.append(f"STUDENT GRADE: {user_context['grade']}")
        if user_context["subject"]:
            context_parts.append(f"CURRENT SUBJECT: {user_context['subject']}")
        
        # Add recent conversation history (last 10 messages)
        history = session["conversation_history"][-10:]  # Last 10 messages
        if history:
            context_parts.append("\nCONVERSATION HISTORY:")
            for msg in history:
                role = "STUDENT" if msg["role"] == "user" else "ASSISTANT"
                context_parts.append(f"{role}: {msg['content']}")
        
        # Add specific instructions for identity questions
        if user_context["name"]:
            context_parts.append(f"\nIMPORTANT: If the student asks about their identity or 'who am i?', tell them they are {user_context['name']} and reference what you know about them from this conversation.")
        
        return "\n".join(context_parts)
    
    def _add_to_conversation_history(self, session_id: str, role: str, content: str):
        """Add message to conversation history"""
        if session_id not in self.conversation_sessions:
            return
        
        session = self.conversation_sessions[session_id]
        session["conversation_history"].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now()
        })
        
        # Keep only the last max_history_length messages
        if len(session["conversation_history"]) > self.max_history_length:
            session["conversation_history"] = session["conversation_history"][-self.max_history_length:]
    
    def _is_greeting(self, question: str) -> bool:
        """
        Check if the question is a greeting
        """
        greeting_words = [
            'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 
            'good evening', 'namaste', 'namaskar', 'sup', 'yo', 'what\'s up',
            'how are you', 'howdy', 'hi there', 'hello there'
        ]
        
        question_lower = question.lower().strip()
        
        # Check for exact matches
        if question_lower in greeting_words:
            return True
            
        # Check if question starts with greeting words
        for greeting in greeting_words:
            if question_lower.startswith(greeting):
                return True
                
        return False
    
    def _is_identity_question(self, question: str) -> bool:
        """
        Check if the question is asking about identity
        """
        identity_questions = [
            'who am i', 'who am i?', 'what is my name', 'what is my name?',
            'do you know my name', 'do you know my name?', 'what do you know about me',
            'what do you know about me?', 'tell me about myself', 'tell me about myself?'
        ]
        
        question_lower = question.lower().strip()
        
        return question_lower in identity_questions
    
    def _handle_identity_question(self, question: str, session_id: str) -> Dict[str, Any]:
        """
        Handle identity questions with context awareness
        """
        session = self.conversation_sessions.get(session_id, {})
        user_context = session.get("user_context", {})
        user_name = user_context.get("name")
        
        if user_name:
            response = f"You are {user_name}! Based on our conversation, you introduced yourself as {user_name}. You're a student who's here to learn and get help with your studies. I remember you from when you said 'Hi, I am {user_name}' earlier in our conversation."
        else:
            response = "I don't have your name yet, but I'm here to help you with your studies! What should I call you?"
        
        # Add to conversation history
        self._add_to_conversation_history(session_id, "user", question)
        self._add_to_conversation_history(session_id, "assistant", response)
        
        return {
            "success": True,
            "source": "identity_response",
            "answer": response,
            "context": {"type": "identity_question"},
            "session_id": session_id,
            "metadata": {
                "response_type": "identity_question",
                "processing_time": 0.1
            }
        }
    
    def _handle_greeting(self, question: str, session_id: str, user_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate a friendly, short greeting response with context awareness
        """
        session = self.conversation_sessions.get(session_id, {})
        user_name = session.get("user_context", {}).get("name")
        
        if user_name:
            greetings = [
                f"Hi {user_name}! 👋 Great to see you again! How can I help with your studies today?",
                f"Hello {user_name}! 😊 Ready to continue learning? What would you like to work on?",
                f"Hey {user_name}! 🎓 Welcome back! What subject are we tackling today?",
                f"Namaste {user_name}! 🙏 How can I assist you with your homework today?",
                f"Hi {user_name}! 📚 What would you like to learn about today?"
            ]
        else:
            greetings = [
                "Hi there! 👋 I'm Skillomate, your AI homework helper. What's your name?",
                "Hello! 😊 I'm here to help with your studies. What should I call you?",
                "Hey! 🎓 I'm your friendly AI tutor. What's your name?",
                "Namaste! 🙏 Welcome to Skillomate. What's your name?",
                "Hi! 📚 I'm here to help with your homework. What should I call you?"
            ]
        
        import random
        greeting = random.choice(greetings)
        
        # Add to conversation history
        self._add_to_conversation_history(session_id, "user", question)
        self._add_to_conversation_history(session_id, "assistant", greeting)
        
        return {
            "success": True,
            "source": "greeting",
            "answer": greeting,
            "context": {"type": "greeting"},
            "session_id": session_id,
            "metadata": {
                "response_type": "greeting",
                "processing_time": 0.1
            }
        }
    
    def process_homework_request(self, question: str, user_context: Optional[Dict[str, Any]] = None, 
                               mode: str = "comprehensive", session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Main method to process homework requests with all agents
        """
        try:
            start_time = datetime.now()
            
            # Get or create session
            session_id = self._get_or_create_session(session_id, user_context.get("user_id") if user_context else None)
            
            # Update user context based on message
            self._update_user_context(session_id, question)
            
            # Enhanced question analysis
            question_analysis = self.question_analyzer.analyze_question(question, user_context)
            
            # Get conversation history for context
            session = self.conversation_sessions.get(session_id, {})
            conversation_history = session.get("conversation_history", [])
            user_context_from_session = session.get("user_context", {})
            
            # Merge user context
            if user_context:
                user_context_from_session.update(user_context)
            
            # Get comprehensive conversation context
            context_data = self.context_manager.get_conversation_context(
                question, conversation_history, user_context_from_session
            )
            
            # Generate conversational response with enhanced context
            logger.info(f"Processing question: '{question}'")
            logger.info(f"User context: {user_context_from_session}")
            logger.info(f"Conversation history length: {len(conversation_history)}")
            
            response_result = self.conversational_tutor.generate_conversational_response(
                question, user_context_from_session, conversation_history, context_data
            )
            
            if not response_result.get("success", True):
                return {
                    "success": False,
                    "error": response_result.get("error", "Failed to generate response"),
                    "session_id": session_id
                }
            
            # Add user message to conversation history
            self._add_to_conversation_history(session_id, "user", question)
            
            # Enhance response with context if it's a follow-up
            enhanced_response = self.context_manager.enhance_response_with_context(
                response_result["response"], 
                context_data["flow_analysis"], 
                user_context_from_session
            )
            
            
            # Apply board-specific formatting
            try:
                from core.board_templates import BoardSpecificTemplates
                board_templates = BoardSpecificTemplates()
                board = user_context_from_session.get("board", "CBSE")
                subject = user_context_from_session.get("subject", "Mathematics")
                enhanced_response = board_templates.apply_board_template(
                    enhanced_response, board, subject, "general"
                )
            except Exception as e:
                logger.warning(f"Board formatting failed: {e}")
            
            # Apply Indian context enhancement
            try:
                from core.india_context_enhancer import IndiaContextEnhancer
                india_enhancer = IndiaContextEnhancer()
                enhanced_response = india_enhancer.enhance_with_indian_context(
                    enhanced_response,
                    user_context_from_session.get("subject", "Mathematics"),
                    user_context_from_session.get("topic", "general"),
                    user_context_from_session.get("grade", "Class 8"),
                    user_context_from_session.get("board", "CBSE")
                )
            except Exception as e:
                logger.warning(f"Indian context enhancement failed: {e}")

            # Add bot response to conversation history
            self._add_to_conversation_history(session_id, "assistant", enhanced_response)
            
            # Return conversational response
            return {
                "success": True,
                "source": "conversational_tutor",
                "answer": enhanced_response,
                "response": enhanced_response,  # Compatibility field
                "context": user_context_from_session or {},
                "session_id": session_id,
                "interactive": response_result.get("interactive", False),
                "suggestions": response_result.get("suggestions", []),
                "conversation_summary": context_data.get("conversation_summary", ""),
                "is_followup": context_data.get("is_followup", False),
                "metadata": {
                    "response_type": "conversational",
                    "processing_time": (datetime.now() - start_time).total_seconds(),
                    "context_used": True
                }
            }
            

                
        except Exception as e:
            logger.error(f"Error in homework request processing: {str(e)}")
            return {
                "success": False,
                "error": "Failed to process homework request",
                "details": str(e),
                "session_id": session_id
            }
    
    def _process_comprehensive_mode(self, question: str, context: Dict[str, Any], 
                                  curriculum_result: Dict[str, Any], session_id: str, conversation_context: str) -> Dict[str, Any]:
        """Process comprehensive mode with conversational tutoring"""
        try:
            # Step 1: Get conversation history for context
            session = self.conversation_sessions.get(session_id, {})
            conversation_history = session.get("conversation_history", [])
            
            # Step 2: Generate conversational response
            response_result = self.conversational_tutor.generate_conversational_response(
                question, context, conversation_history
            )
            
            if not response_result.get("success", True):
                return {
                    "success": False,
                    "error": response_result.get("error", "Failed to generate response"),
                    "session_id": session_id
                }
            
            ai_response = response_result["response"]
            
            # Step 3: Format the answer
            formatted_result = self.formatter_agent.format_answer(
                ai_response, context
            )
            
            # Step 3: Check if diagram is needed
            diagram_result = None
            if self._needs_diagram(question, ai_response):
                diagram_result = self._generate_relevant_diagram(question, context, ai_response)
            
            # Step 4: Cache the result
            cache_result = self.offline_cache.cache_qa(
                question, ai_response, context
            )
            
            # Step 5: Prepare final response
            final_response = {
                "success": True,
                "source": "conversational_tutor",
                "answer": formatted_result.get("formatted_content", ai_response),
                "context": context,
                "curriculum_style": curriculum_result["curriculum_style"],
                "localization": curriculum_result["localization_guidelines"],
                "interactive": response_result.get("interactive", False),
                "suggestions": response_result.get("suggestions", [])
            }
            
            if diagram_result and diagram_result["success"]:
                final_response["diagram"] = {
                    "image_data": diagram_result["image_data"],
                    "description": diagram_result["description"],
                    "type": diagram_result["diagram_type"]
                }
                
                # Cache the diagram
                self.offline_cache.cache_diagram(
                    diagram_result["diagram_type"],
                    context["subject"],
                    context,
                    diagram_result["image_data"],
                    diagram_result["metadata"]
                )
            
            final_response["metadata"] = {
                "cached": cache_result.get("cached", False),
                "processing_time": datetime.now().isoformat(),
                "mode": "comprehensive"
            }
            
            final_response["session_id"] = session_id
            
            # Add to conversation history
            self._add_to_conversation_history(session_id, "assistant", final_response["answer"])
            
            return final_response
            
        except Exception as e:
            logger.error(f"Error in comprehensive mode: {str(e)}")
            return {
                "success": False,
                "error": "Failed to process comprehensive mode",
                "details": str(e)
            }
    
    def _process_guided_mode(self, question: str, context: Dict[str, Any], 
                           curriculum_result: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Process guided learning mode"""
        try:
            # Generate progressive hints
            guided_result = self.guided_solver.process_guided_learning(
                question, context, "progressive"
            )
            
            if not guided_result["success"]:
                return guided_result
            
            # Format the hint
            formatted_result = self.formatter_agent.format_answer(
                guided_result["hint_content"], context
            )
            
            # Add to conversation history
            self._add_to_conversation_history(session_id, "assistant", formatted_result.get("formatted_content", guided_result["hint_content"]))
            
            return {
                "success": True,
                "mode": "guided",
                "hint_level": guided_result["hint_level"],
                "max_levels": guided_result["max_levels"],
                "hint": formatted_result.get("formatted_content", guided_result["hint_content"]),
                "next_action": guided_result["next_action"],
                "context": context,
                "is_complete": guided_result["is_complete"]
            }
            
        except Exception as e:
            logger.error(f"Error in guided mode: {str(e)}")
            return {
                "success": False,
                "error": "Failed to process guided mode",
                "details": str(e)
            }
    
    def _process_diagram_mode(self, question: str, context: Dict[str, Any], 
                            curriculum_result: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Process diagram generation mode"""
        try:
            # Determine diagram type from question
            diagram_type = self._extract_diagram_type(question, context["subject"])
            
            # Check cache first
            cached_diagram = self.offline_cache.retrieve_diagram(
                diagram_type, context["subject"], context
            )
            
            if cached_diagram["success"] and cached_diagram["found"]:
                # Add to conversation history
                self._add_to_conversation_history(session_id, "assistant", "Using cached diagram.")
                return {
                    "success": True,
                    "source": "cache",
                    "image_data": cached_diagram["image_data"],
                    "diagram_type": diagram_type,
                    "subject": context["subject"],
                    "cached_at": cached_diagram["created_at"],
                    "context": context
                }
            
            # Generate new diagram
            diagram_result = self.diagram_generator.generate_diagram(
                diagram_type, context["subject"], context
            )
            
            if not diagram_result["success"]:
                return diagram_result
            
            # Cache the diagram
            self.offline_cache.cache_diagram(
                diagram_type,
                context["subject"],
                context,
                diagram_result["image_data"],
                diagram_result["metadata"]
            )
            
            # Add to conversation history
            self._add_to_conversation_history(session_id, "assistant", "Generated new diagram.")
            return {
                "success": True,
                "source": "generated",
                "image_data": diagram_result["image_data"],
                "description": diagram_result["description"],
                "diagram_type": diagram_result["diagram_type"],
                "complexity": diagram_result["complexity"],
                "subject": context["subject"],
                "context": context
            }
            
        except Exception as e:
            logger.error(f"Error in diagram mode: {str(e)}")
            return {
                "success": False,
                "error": "Failed to process diagram mode",
                "details": str(e)
            }
    
    def _process_offline_mode(self, question: str, context: Dict[str, Any], 
                            curriculum_result: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Process offline mode with cached content only"""
        try:
            # Search for similar questions in cache
            search_result = self.offline_cache.search_cache(
                question, context.get("subject"), context.get("grade")
            )
            
            if search_result["success"] and search_result["results"]:
                # Return the most relevant cached result
                best_match = search_result["results"][0]
                
                formatted_result = self.formatter_agent.format_answer(
                    best_match["answer"], context
                )
                
                # Add to conversation history
                self._add_to_conversation_history(session_id, "assistant", f"Using cached answer for '{best_match['question']}'.")
                return {
                    "success": True,
                    "source": "offline_cache",
                    "answer": formatted_result.get("formatted_content", best_match["answer"]),
                    "context": context,
                    "metadata": {
                        "matched_question": best_match["question"],
                        "access_count": best_match["access_count"],
                        "created_at": best_match["created_at"]
                    }
                }
            
            # If no cache found, return offline message
            # Add to conversation history
            self._add_to_conversation_history(session_id, "assistant", "No cached content found for this question. Please try again when online.")
            return {
                "success": True,
                "source": "offline",
                "message": "No cached content found for this question. Please try again when online.",
                "context": context
            }
            
        except Exception as e:
            logger.error(f"Error in offline mode: {str(e)}")
            return {
                "success": False,
                "error": "Failed to process offline mode",
                "details": str(e)
            }
    
    def _generate_ai_response(self, question: str, conversation_context: str) -> Dict[str, Any]:
        """Generate AI response using OpenAI with conversation context"""
        try:
            # Create a comprehensive system prompt
            system_prompt = """You are Skillomate, an intelligent educational AI assistant designed to help students with their academic doubts and questions. 

Key characteristics:
- Provide clear, step-by-step explanations
- Use age-appropriate language based on the student's grade level
- Include relevant examples and analogies
- Encourage critical thinking and problem-solving
- Be patient and supportive
- When appropriate, suggest related topics or concepts to explore
- Remember the student's name and use it when appropriate
- Maintain conversation continuity and context

IMPORTANT CONTEXT RULES:
1. ALWAYS use the conversation context provided to you
2. If the student asks "who am i?" or similar identity questions, use the context to tell them what you know about them from the conversation
3. If you know the student's name from context, use it in your responses
4. If the student has shared information about themselves, reference that information
5. Be personal and conversational, not generic

Always maintain a helpful, encouraging tone and focus on educational value.

IMPORTANT FORMATTING RULES:
- Use simple plain text for all math expressions (like 5x = 10, not \\( 5x = 10 \\))
- Avoid LaTeX formatting, backslashes, or special math delimiters
- Write equations clearly using regular characters only
- Use simple fractions like 1/2 instead of complex formatting"""

            # Build messages array
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add conversation context if available
            if conversation_context:
                messages.append({
                    "role": "system", 
                    "content": f"Conversation Context:\n{conversation_context}"
                })
            
            # Add the current question
            messages.append({"role": "user", "content": question})
            
            response = self.client.chat.completions.create(
                model=self.default_model,
                messages=messages,
                max_tokens=1500,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            return {
                "success": True,
                "response": ai_response,
                "model": self.default_model
            }
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return {
                "success": False,
                "error": "Failed to generate AI response",
                "details": str(e)
            }
    
    def _needs_diagram(self, question: str, answer: str) -> bool:
        """Determine if a diagram is needed based on question and answer"""
        diagram_keywords = [
            'draw', 'sketch', 'diagram', 'graph', 'chart', 'figure', 'plot',
            'visualize', 'show', 'illustrate', 'represent', 'geometry',
            'triangle', 'circle', 'rectangle', 'coordinate', 'axis',
            'circuit', 'cell', 'atom', 'molecule', 'timeline', 'map'
        ]
        
        question_lower = question.lower()
        answer_lower = answer.lower()
        
        return any(keyword in question_lower or keyword in answer_lower 
                  for keyword in diagram_keywords)
    
    def _extract_diagram_type(self, question: str, subject: str) -> str:
        """Extract diagram type from question"""
        question_lower = question.lower()
        
        if subject.lower() in ["mathematics", "math"]:
            if any(word in question_lower for word in ["triangle", "triangle"]):
                return "triangle"
            elif any(word in question_lower for word in ["circle", "circular"]):
                return "circle"
            elif any(word in question_lower for word in ["graph", "plot", "chart"]):
                return "bar_graph"
            elif any(word in question_lower for word in ["coordinate", "axis", "point"]):
                return "coordinate_plane"
            else:
                return "triangle"  # default
        
        elif subject.lower() in ["science", "physics", "chemistry", "biology"]:
            if any(word in question_lower for word in ["circuit", "electric", "battery"]):
                return "circuit"
            elif any(word in question_lower for word in ["cell", "nucleus"]):
                return "cell"
            elif any(word in question_lower for word in ["atom", "molecule"]):
                return "atom"
            else:
                return "circuit"  # default
        
        elif subject.lower() in ["geography"]:
            if any(word in question_lower for word in ["climate", "weather", "temperature"]):
                return "climate_graph"
            else:
                return "climate_graph"  # default
        
        elif subject.lower() in ["social studies", "history", "civics"]:
            if any(word in question_lower for word in ["timeline", "history", "event"]):
                return "timeline"
            else:
                return "timeline"  # default
        
        else:
            return "general_diagram"
    
    def _generate_relevant_diagram(self, question: str, context: Dict[str, Any], 
                                 answer: str) -> Dict[str, Any]:
        """Generate a relevant diagram based on the question and answer"""
        try:
            diagram_type = self._extract_diagram_type(question, context["subject"])
            
            return self.diagram_generator.generate_diagram(
                diagram_type, context["subject"], context
            )
            
        except Exception as e:
            logger.error(f"Error generating relevant diagram: {str(e)}")
            return {
                "success": False,
                "error": "Failed to generate diagram",
                "details": str(e)
            }
    
    def get_next_hint(self, question: str, current_level: int, context: Dict[str, Any]) -> Dict[str, Any]:
        """Get the next hint in progressive learning"""
        try:
            return self.guided_solver.generate_progressive_hints(
                question, context, current_level + 1
            )
        except Exception as e:
            logger.error(f"Error getting next hint: {str(e)}")
            return {
                "success": False,
                "error": "Failed to get next hint",
                "details": str(e)
            }
    
    def get_available_diagrams(self, subject: str) -> List[str]:
        """Get available diagram types for a subject"""
        return self.diagram_generator.get_available_diagrams(subject)
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return self.offline_cache.get_cache_stats()
    
    def search_cache(self, query: str, subject: Optional[str] = None, 
                    grade: Optional[str] = None) -> Dict[str, Any]:
        """Search cached content"""
        return self.offline_cache.search_cache(query, subject, grade)
    
    def clear_cache(self, days: int = 30) -> Dict[str, Any]:
        """Clear old cache entries"""
        return self.offline_cache.clear_old_cache(days)
    
    def export_cache(self, export_path: str) -> Dict[str, Any]:
        """Export cache to file"""
        return self.offline_cache.export_cache(export_path)
    
    def import_cache(self, import_path: str) -> Dict[str, Any]:
        """Import cache from file"""
        return self.offline_cache.import_cache(import_path)
