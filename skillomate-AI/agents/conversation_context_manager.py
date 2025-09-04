import openai
import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class ConversationContextManager:
    """
    Manages conversation context by summarizing previous chats and maintaining conversation flow
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required but not found")
        
        self.client = openai.OpenAI(api_key=self.openai_api_key)
        self.max_context_length = 2000  # Maximum characters for context summary
    
    def generate_conversation_summary(self, conversation_history: List[Dict], user_context: Dict) -> str:
        """
        Generate a summary of the conversation history for context
        """
        if not conversation_history or len(conversation_history) < 2:
            return ""
        
        try:
            # Take the last 8 messages (4 exchanges) for summary
            recent_messages = conversation_history[-8:]
            
            # Format conversation for summary
            conversation_text = ""
            for msg in recent_messages:
                role = "Student" if msg["role"] == "user" else "Assistant"
                conversation_text += f"{role}: {msg['content']}\n"
            
            # Create summary prompt
            summary_prompt = f"""Summarize the key points from this recent conversation in 2-3 sentences. Focus on:
1. What the student is learning/working on
2. Any specific problems or concepts they're struggling with
3. The current progress or understanding level
4. Any important context or preferences mentioned

Student Context: {user_context.get('name', 'Student')} in {user_context.get('grade', 'middle school')}

Recent Conversation:
{conversation_text}

Summary:"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that creates concise, accurate summaries of educational conversations."},
                    {"role": "user", "content": summary_prompt}
                ],
                max_tokens=150,
                temperature=0.3
            )
            
            summary = response.choices[0].message.content.strip()
            return summary
            
        except Exception as e:
            logger.error(f"Error generating conversation summary: {str(e)}")
            return ""
    
    def create_context_prompt(self, current_question: str, conversation_history: List[Dict], 
                            user_context: Dict, previous_summary: str = "") -> str:
        """
        Create a comprehensive context prompt for the AI
        """
        context_parts = []
        
        # Add user context
        if user_context.get('name'):
            context_parts.append(f"STUDENT NAME: {user_context['name']}")
        if user_context.get('grade'):
            context_parts.append(f"STUDENT GRADE: {user_context['grade']}")
        if user_context.get('subject'):
            context_parts.append(f"CURRENT SUBJECT: {user_context['subject']}")
        if user_context.get('board'):
            context_parts.append(f"EDUCATION BOARD: {user_context['board']}")
        
        # Add conversation summary if available
        if previous_summary:
            context_parts.append(f"\nCONVERSATION CONTEXT: {previous_summary}")
        
        # Add recent conversation history (last 4 exchanges = 8 messages)
        recent_history = conversation_history[-8:] if len(conversation_history) >= 8 else conversation_history
        if recent_history:
            context_parts.append("\nRECENT CONVERSATION:")
            for msg in recent_history:
                role = "STUDENT" if msg["role"] == "user" else "ASSISTANT"
                # Truncate long messages to keep context manageable
                content = msg['content'][:200] + "..." if len(msg['content']) > 200 else msg['content']
                context_parts.append(f"{role}: {content}")
        
        # Add current question
        context_parts.append(f"\nCURRENT QUESTION: {current_question}")
        
        # Add conversation flow instructions
        context_parts.append("""
CONVERSATION FLOW INSTRUCTIONS:
- Reference previous context when relevant
- Build upon previous explanations
- Maintain continuity in the conversation
- If the student is continuing from a previous topic, acknowledge that
- Use the conversation history to provide more personalized and contextual responses
- If this is a follow-up question, reference what was discussed before
""")
        
        return "\n".join(context_parts)
    
    def analyze_conversation_flow(self, current_question: str, conversation_history: List[Dict]) -> Dict[str, Any]:
        """
        Analyze the conversation flow to determine if this is a follow-up question
        """
        if not conversation_history:
            return {
                "is_followup": False,
                "related_topic": None,
                "continuity_level": "new"
            }
        
        try:
            # Get the last assistant response
            last_assistant_msg = None
            for msg in reversed(conversation_history):
                if msg["role"] == "assistant":
                    last_assistant_msg = msg["content"]
                    break
            
            if not last_assistant_msg:
                return {
                    "is_followup": False,
                    "related_topic": None,
                    "continuity_level": "new"
                }
            
            # Analyze if current question is related to the last response
            analysis_prompt = f"""Analyze if the current question is a follow-up to the previous response.

Previous Assistant Response: {last_assistant_msg[:300]}

Current Question: {current_question}

Determine:
1. Is this a follow-up question? (yes/no)
2. What topic are they continuing? (brief description)
3. Continuity level: (new/related/strong_followup)

Respond in JSON format:
{{
    "is_followup": true/false,
    "related_topic": "topic description",
    "continuity_level": "new/related/strong_followup"
}}"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert at analyzing conversation flow and continuity."},
                    {"role": "user", "content": analysis_prompt}
                ],
                max_tokens=200,
                temperature=0.1
            )
            
            analysis_text = response.choices[0].message.content.strip()
            
            # Try to parse JSON response
            try:
                analysis = json.loads(analysis_text)
                return analysis
            except json.JSONDecodeError:
                # Fallback analysis
                current_lower = current_question.lower()
                last_lower = last_assistant_msg.lower()
                
                # Simple keyword matching for follow-up detection (more conservative)
                strong_followup_indicators = [
                    "what about", "how about", "what if", "explain more", 
                    "tell me more", "what else", "and then", "next", 
                    "after that", "also", "too", "as well", "following up",
                    "continuing", "related to", "about that"
                ]
                
                weak_followup_indicators = [
                    "can you", "could you", "please", "help me"
                ]
                
                # Check for strong follow-up indicators
                is_strong_followup = any(indicator in current_lower for indicator in strong_followup_indicators)
                
                # Check for weak follow-up indicators (only if there's recent conversation)
                is_weak_followup = any(indicator in current_lower for indicator in weak_followup_indicators) and len(conversation_history) > 2
                
                is_followup = is_strong_followup or is_weak_followup
                
                return {
                    "is_followup": is_followup,
                    "related_topic": "general follow-up" if is_followup else None,
                    "continuity_level": "strong_followup" if is_strong_followup else ("related" if is_weak_followup else "new")
                }
                
        except Exception as e:
            logger.error(f"Error analyzing conversation flow: {str(e)}")
            return {
                "is_followup": False,
                "related_topic": None,
                "continuity_level": "new"
            }
    
    def enhance_response_with_context(self, ai_response: str, conversation_flow: Dict[str, Any], 
                                    user_context: Dict) -> str:
        """
        Enhance the AI response with conversation context
        """
        # DISABLED: No more follow-up enhancements
        # Return the AI response as-is without any intro phrases
        return ai_response
    
    def get_conversation_context(self, current_question: str, conversation_history: List[Dict], 
                               user_context: Dict) -> Dict[str, Any]:
        """
        Get comprehensive conversation context for the AI
        """
        # Generate conversation summary
        conversation_summary = self.generate_conversation_summary(conversation_history, user_context)
        
        # Analyze conversation flow
        flow_analysis = self.analyze_conversation_flow(current_question, conversation_history)
        
        # Create context prompt
        context_prompt = self.create_context_prompt(
            current_question, conversation_history, user_context, conversation_summary
        )
        
        return {
            "context_prompt": context_prompt,
            "conversation_summary": conversation_summary,
            "flow_analysis": flow_analysis,
            "is_followup": flow_analysis.get("is_followup", False),
            "related_topic": flow_analysis.get("related_topic"),
            "continuity_level": flow_analysis.get("continuity_level", "new")
        }
