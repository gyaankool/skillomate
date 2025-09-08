from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import openai
import os
import json



import logging
from datetime import datetime
import uuid
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import configuration and the new AI orchestrator
from config import *
from ai_orchestrator import SkillomateAIOrchestrator
from environment_config.environment import config as env_config

# Import new enhancement features
from core.response_formatter import TeacherApprovedFormatter
from core.india_context_enhancer import IndiaContextEnhancer
from core.board_templates import BoardSpecificTemplates
from diagrams.advanced_diagram_generator import EducationalDiagramGenerator
from core.offline_question_bank import OfflineQuestionBank

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=env_config['CORS_ORIGINS'], 
     supports_credentials=True, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# OpenAI Configuration
openai.api_key = os.getenv('OPENAI_API_KEY')

# Initialize the AI orchestrator
ai_orchestrator = SkillomateAIOrchestrator()

# Initialize enhancement features
response_formatter = TeacherApprovedFormatter()
india_context_enhancer = IndiaContextEnhancer()
board_templates = BoardSpecificTemplates()
diagram_generator = EducationalDiagramGenerator()
offline_question_bank = OfflineQuestionBank()

class SkillomateAI:
    def __init__(self):
        self.conversation_history = []
        # Initialize OpenAI client
        self.client = openai.OpenAI(api_key=openai.api_key)
        self.system_prompt = """You are Skillomate, an intelligent educational AI assistant designed to help students with their academic doubts and questions. 

Key characteristics:
- Provide clear, step-by-step explanations
- Use age-appropriate language based on the student's grade level
- Include relevant examples and analogies
- Encourage critical thinking and problem-solving
- Be patient and supportive
- When appropriate, suggest related topics or concepts to explore

Always maintain a helpful, encouraging tone and focus on educational value."""

    def generate_response(self, user_message, context=None):
        """Generate AI response using OpenAI API"""
        try:
            # Build conversation context
            messages = [{"role": "system", "content": self.system_prompt}]
            
            # Add conversation history (last 10 messages to manage context length)
            for msg in self.conversation_history[-10:]:
                messages.append(msg)
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            # Add context if provided
            if context:
                context_message = f"Additional context: {context}"
                messages.append({"role": "system", "content": context_message})
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=1000,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content
            
            # Update conversation history
            self.conversation_history.append({"role": "user", "content": user_message})
            self.conversation_history.append({"role": "assistant", "content": ai_response})
            
            return {
                "success": True,
                "response": ai_response,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return {
                "success": False,
                "error": "Failed to generate response",
                "details": str(e)
            }



# Initialize AI orchestrator (already done above)

@app.route('/')
def index():
    """Main page"""
    return jsonify({
        "message": "Skillomate AI Homework Solver",
        "status": "running",
        "version": "2.0",
        "features": [
            "Context-aware curriculum mapping",
            "Progressive guided learning",
            "Teacher-approved formatting",
            "Diagram generation",
            "Offline caching",
            "India-specific localization"
        ],
        "endpoints": {
            "homework": "/api/homework",
            "guided_learning": "/api/guided-learning",
            "diagram": "/api/diagram",
            "chat": "/api/chat",
            "cache_stats": "/api/cache/stats",
            "search_cache": "/api/cache/search",
            "health": "/api/health",
            "session_create": "/api/session/create",
            "session_info": "/api/session/<session_id>",
            "session_delete": "/api/session/<session_id>",
            "list_sessions": "/api/sessions"
        }
    })

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "openai_key": "configured" if openai.api_key else "missing",
        "ai_orchestrator": "initialized"
    })

@app.route('/api/homework', methods=['POST'])
def homework_assistance():
    """Enhanced homework assistance endpoint"""
    try:
        data = request.get_json()
        question = data.get('question', '')
        user_context = data.get('context', {})
        mode = data.get('mode', 'comprehensive')
        
        if not question:
            return jsonify({'success': False, 'error': 'Question is required'}), 400
        
        # Process homework request using AI orchestrator
        result = ai_orchestrator.process_homework_request(question, user_context, mode)
        
        # Ensure consistent response format
        if result.get('success') and 'answer' in result:
            result['response'] = result['answer']  # Map answer to response for compatibility
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error in homework endpoint: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/guided-learning', methods=['POST'])
def guided_learning():
    """Guided learning with progressive hints"""
    try:
        data = request.get_json()
        question = data.get('question', '')
        user_context = data.get('context', {})
        current_level = data.get('current_level', 1)
        
        if not question:
            return jsonify({'success': False, 'error': 'Question is required'}), 400
        
        if current_level > 1:
            # Get next hint
            result = ai_orchestrator.get_next_hint(question, current_level - 1, user_context)
        else:
            # Start guided learning with level 1
            user_context['current_level'] = 1
            result = ai_orchestrator.process_homework_request(question, user_context, "guided")
        
        # Ensure consistent response format
        if result.get('success'):
            if 'hint' in result and 'answer' not in result:
                result['answer'] = result['hint']  # Map hint to answer for compatibility
            if 'answer' in result:
                result['response'] = result['answer']  # Map answer to response for compatibility
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error in guided learning endpoint: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/diagram', methods=['POST'])
def generate_diagram():
    """Generate diagrams and charts"""
    try:
        data = request.get_json()
        question = data.get('question', '')
        user_context = data.get('context', {})
        diagram_type = data.get('diagram_type', None)
        
        if not question:
            return jsonify({'success': False, 'error': 'Question is required'}), 400
        
        if diagram_type:
            # Generate specific diagram type
            result = ai_orchestrator.diagram_generator.generate_diagram(
                diagram_type, user_context.get('subject', 'General'), user_context
            )
        else:
            # Process diagram mode
            result = ai_orchestrator.process_homework_request(question, user_context, "diagram")
        
        # For diagram requests, ensure answer field contains response
        if result.get('success') and 'answer' not in result and 'image_data' in result:
            result['answer'] = result.get('description', 'Diagram generated successfully')
        
        # Ensure consistent response format
        if result.get('success') and 'answer' in result:
            result['response'] = result['answer']  # Map answer to response for compatibility
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error in diagram endpoint: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/available-diagrams', methods=['GET'])
def get_available_diagrams():
    """Get available diagram types for a subject"""
    try:
        subject = request.args.get('subject', 'General')
        diagrams = ai_orchestrator.get_available_diagrams(subject)
        
        return jsonify({
            'success': True,
            'subject': subject,
            'available_diagrams': diagrams
        })
        
    except Exception as e:
        logging.error(f"Error getting available diagrams: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/cache/stats', methods=['GET'])
def get_cache_stats():
    """Get cache statistics"""
    try:
        stats = ai_orchestrator.get_cache_stats()
        return jsonify(stats)
        
    except Exception as e:
        logging.error(f"Error getting cache stats: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/cache/search', methods=['GET'])
def search_cache():
    """Search cached content"""
    try:
        query = request.args.get('query', '')
        subject = request.args.get('subject', None)
        grade = request.args.get('grade', None)
        
        if not query:
            return jsonify({'success': False, 'error': 'Query is required'}), 400
        
        results = ai_orchestrator.search_cache(query, subject, grade)
        return jsonify(results)
        
    except Exception as e:
        logging.error(f"Error searching cache: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Clear old cache entries"""
    try:
        data = request.get_json() or {}
        days = data.get('days', 30)
        
        result = ai_orchestrator.clear_cache(days)
        # Ensure consistent response format
        if result.get('success') and 'answer' in result:
            result['response'] = result['answer']  # Map answer to response for compatibility
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error clearing cache: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/cache/export', methods=['POST'])
def export_cache():
    """Export cache to file"""
    try:
        data = request.get_json()
        export_path = data.get('path', 'cache_export.json')
        
        result = ai_orchestrator.export_cache(export_path)
        # Ensure consistent response format
        if result.get('success') and 'answer' in result:
            result['response'] = result['answer']  # Map answer to response for compatibility
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error exporting cache: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/cache/import', methods=['POST'])
def import_cache():
    """Import cache from file"""
    try:
        data = request.get_json()
        import_path = data.get('path', '')
        
        if not import_path:
            return jsonify({'success': False, 'error': 'Import path is required'}), 400
        
        result = ai_orchestrator.import_cache(import_path)
        # Ensure consistent response format
        if result.get('success') and 'answer' in result:
            result['response'] = result['answer']  # Map answer to response for compatibility
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error importing cache: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Enhanced chat endpoint with conversation context management"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        context = data.get('context', {})
        session_id = data.get('session_id', None)
        
        if not user_message:
            return jsonify({'success': False, 'error': 'Message is required'}), 400
        
        # Use the new AI orchestrator with session management
        result = ai_orchestrator.process_homework_request(
            user_message, 
            context, 
            "comprehensive",
            session_id
        )
        
        return jsonify({
            'success': True,
            'response': result.get('answer', result.get('response', '')),
            'answer': result.get('answer', result.get('response', '')),  # Include both for compatibility
            'timestamp': datetime.now().isoformat(),
            'timestamp': datetime.now().isoformat(),
            'source': result.get('source', 'ai_generated'),
            'session_id': result.get('session_id', session_id)
        })
        
    except Exception as e:
        logging.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/chat-enhanced', methods=['POST'])
def enhanced_chat():
    """Enhanced chat endpoint with all new features integrated"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        session_id = data.get('session_id', str(uuid.uuid4()))
        user_context = data.get('context', {})
        format_style = data.get('format_style', 'teacher_approved')
        answer_type = data.get('answer_type', 'general')
        
        if not message:
            return jsonify({'success': False, 'error': 'Message is required'}), 400
        
        # Get conversation history for this session
        conversation_history = ai_orchestrator._get_conversation_context(session_id)
        
        # 1. Get raw AI response (existing functionality)
        raw_result = ai_orchestrator.get_response(message, user_context, conversation_history)
        raw_response = raw_result.get('answer', '')
        
        # Extract context information
        subject = user_context.get('subject', 'Mathematics')
        grade = user_context.get('grade', 'Class 8')
        board = user_context.get('board', 'CBSE')
        topic = user_context.get('topic', 'general')
        
        # 2. Apply teacher-approved formatting
        formatted_result = response_formatter.format_response(
            raw_response, subject, grade, answer_type, board
        )
        
        if formatted_result.get('success'):
            formatted_response = formatted_result.get('formatted_response', raw_response)
        else:
            formatted_response = raw_response
        
        # 3. Enhance with Indian context
        indian_response = india_context_enhancer.enhance_with_indian_context(
            formatted_response, subject, topic, grade, board
        )
        
        # 4. Apply board-specific templates  
        final_response = board_templates.apply_board_template(
            indian_response, board, subject, answer_type
        )
        
        # 5. Generate diagrams if needed
        diagrams = []
        if data.get('generate_diagram', False):
            diagram_suggestions = diagram_generator.get_diagram_suggestions(message, subject)
            if diagram_suggestions:
                diagram_type = diagram_suggestions[0]  # Use first suggestion
                diagram_result = diagram_generator.generate_diagram(diagram_type, user_context)
                if diagram_result.get('success'):
                    diagrams.append(diagram_result)
        
        # Store the conversation using orchestrator
        ai_orchestrator._store_conversation(session_id, message, final_response)
        
        return jsonify({
            'success': True,
            'response': final_response,
            'raw_response': raw_response,
            'diagrams': diagrams,
            'formatting_applied': formatted_result.get('formatting_applied', []),
            'estimated_marks': formatted_result.get('estimated_marks', 0),
            'timestamp': datetime.now().isoformat(),
            'source': 'enhanced_ai_generated',
            'session_id': session_id
        })
        
    except Exception as e:
        logger.error(f"Error in enhanced chat endpoint: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/session/create', methods=['POST'])
def create_session():
    """Create a new conversation session with user context"""
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id', None)
        user_context = data.get('user_context', {})
        
        # Create new session using orchestrator with user context
        session_id = ai_orchestrator._create_session(user_id, user_context)
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'message': 'Session created successfully with user context'
        })
        
    except Exception as e:
        logger.error(f"Error creating session: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to create session"
        }), 500

@app.route('/api/session/<session_id>', methods=['GET'])
def get_session_info(session_id):
    """Get session information and conversation history"""
    try:
        if session_id not in ai_orchestrator.conversation_sessions:
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404
        
        session = ai_orchestrator.conversation_sessions[session_id]
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'user_context': session['user_context'],
            'conversation_history': session['conversation_history'],
            'created_at': session['created_at'].isoformat(),
            'last_activity': session['last_activity'].isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting session info: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to get session info"
        }), 500

@app.route('/api/session/<session_id>/context', methods=['PUT'])
def update_session_context(session_id):
    """Update user context for a session"""
    try:
        if session_id not in ai_orchestrator.conversation_sessions:
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404
        
        data = request.get_json() or {}
        context_updates = data.get('context', {})
        
        # Update the session context
        success = ai_orchestrator._update_session_context(session_id, context_updates)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Session context updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to update session context'
            }), 500
        
    except Exception as e:
        logger.error(f"Error updating session context: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to update session context"
        }), 500

@app.route('/api/session/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    """Delete a conversation session"""
    try:
        if session_id not in ai_orchestrator.conversation_sessions:
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404
        
        del ai_orchestrator.conversation_sessions[session_id]
        
        return jsonify({
            'success': True,
            'message': 'Session deleted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error deleting session: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to delete session"
        }), 500

@app.route('/api/sessions', methods=['GET'])
def list_sessions():
    """List all active sessions"""
    try:
        sessions = []
        for session_id, session_data in ai_orchestrator.conversation_sessions.items():
            sessions.append({
                'session_id': session_id,
                'user_id': session_data['user_id'],
                'user_name': session_data['user_context'].get('name'),
                'created_at': session_data['created_at'].isoformat(),
                'last_activity': session_data['last_activity'].isoformat(),
                'message_count': len(session_data['conversation_history'])
            })
        
        return jsonify({
            'success': True,
            'sessions': sessions,
            'total_sessions': len(sessions)
        })
        
    except Exception as e:
        logger.error(f"Error listing sessions: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to list sessions"
        }), 500



# Offline Question Bank Endpoints
@app.route('/api/offline/sync-status/<grade>/<subject>/<board>', methods=['GET'])
def get_offline_sync_status(grade, subject, board):
    """Get sync status for offline question bank"""
    try:
        status = offline_question_bank.get_sync_status(grade, subject, board)
        return jsonify({
            'success': True,
            'status': status
        })
    except Exception as e:
        logger.error(f"Error getting sync status: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get sync status'
        }), 500

@app.route('/api/offline/generate-question-bank', methods=['POST'])
def generate_question_bank():
    """Generate question bank for offline use"""
    try:
        data = request.get_json()
        grade = data.get('grade', 'Class 8')
        subject = data.get('subject', 'Mathematics')
        board = data.get('board', 'CBSE')
        
        question_bank = offline_question_bank.generate_question_bank(grade, subject, board)
        
        return jsonify({
            'success': True,
            'question_bank': question_bank
        })
    except Exception as e:
        logger.error(f"Error generating question bank: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate question bank'
        }), 500

@app.route('/api/offline/question-bank/<grade>/<subject>', methods=['GET'])
def get_question_bank(grade, subject):
    """Get question bank for a specific grade and subject"""
    try:
        board = request.args.get('board', 'CBSE')
        question_bank = offline_question_bank.generate_question_bank(grade, subject, board)
        
        return jsonify({
            'success': True,
            'question_bank': question_bank
        })
    except Exception as e:
        logger.error(f"Error getting question bank: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get question bank'
        }), 500

@app.route('/api/offline/bulk-cache', methods=['POST'])
def bulk_cache_responses():
    """Bulk cache responses for offline use"""
    try:
        data = request.get_json()
        questions_list = data.get('questions', [])
        
        success = offline_question_bank.cache_responses_bulk(questions_list)
        
        return jsonify({
            'success': success,
            'message': f'Successfully cached {len(questions_list)} questions' if success else 'Failed to cache questions'
        })
    except Exception as e:
        logger.error(f"Error bulk caching: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to bulk cache responses'
        }), 500

@app.route('/api/offline/popular-questions/<grade>/<subject>', methods=['GET'])
def get_popular_questions(grade, subject):
    """Get popular questions for a grade and subject"""
    try:
        limit = request.args.get('limit', 10, type=int)
        popular_questions = offline_question_bank.get_popular_questions(grade, subject, limit)
        
        return jsonify({
            'success': True,
            'popular_questions': popular_questions
        })
    except Exception as e:
        logger.error(f"Error getting popular questions: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get popular questions'
        }), 500

@app.route('/api/offline/search', methods=['GET'])
def search_offline_questions():
    """Search questions in offline database"""
    try:
        query = request.args.get('q', '')
        grade = request.args.get('grade')
        subject = request.args.get('subject')
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Search query is required'
            }), 400
        
        results = offline_question_bank.search_offline_questions(query, grade, subject)
        
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })
    except Exception as e:
        logger.error(f"Error searching offline questions: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to search questions'
        }), 500

@app.route('/api/offline/analytics', methods=['GET'])
def get_offline_analytics():
    """Get analytics for offline question bank"""
    try:
        grade = request.args.get('grade')
        subject = request.args.get('subject')
        
        analytics = offline_question_bank.get_analytics(grade, subject)
        
        return jsonify({
            'success': True,
            'analytics': analytics
        })
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get analytics'
        }), 500

# Diagram Generation Endpoints
@app.route('/api/diagram/generate', methods=['POST'])
def generate_educational_diagram():
    """Generate educational diagram"""
    try:
        data = request.get_json()
        diagram_type = data.get('diagram_type', 'triangle')
        context = data.get('context', {})
        
        result = diagram_generator.generate_diagram(diagram_type, context)
        
        # Ensure consistent response format
        if result.get('success') and 'answer' in result:
            result['response'] = result['answer']  # Map answer to response for compatibility
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error generating diagram: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate diagram'
        }), 500

@app.route('/api/diagram/suggestions', methods=['GET'])
def get_diagram_suggestions():
    """Get diagram suggestions for a question"""
    try:
        question = request.args.get('question', '')
        subject = request.args.get('subject', 'Mathematics')
        
        suggestions = diagram_generator.get_diagram_suggestions(question, subject)
        
        return jsonify({
            'success': True,
            'suggestions': suggestions
        })
    except Exception as e:
        logger.error(f"Error getting diagram suggestions: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get diagram suggestions'
        }), 500

if __name__ == '__main__':
    app.run(debug=FLASK_DEBUG, host=FLASK_HOST, port=FLASK_PORT)
