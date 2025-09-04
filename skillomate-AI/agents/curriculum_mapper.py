import openai
import os
import json
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class CurriculumMapperAgent:
    """
    Agent 1: Curriculum Mapper
    Detects board + grade → Adjusts explanation depth, vocabulary, formatting.
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        # Check if API key is available
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required but not found")
        
        # Initialize OpenAI client
        self.client = openai.OpenAI(api_key=self.openai_api_key)
        self.curriculum_data = self._load_curriculum_data()
        
    def _load_curriculum_data(self) -> Dict[str, Any]:
        """Load curriculum data for different boards and grades"""
        curriculum_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'curriculum.json')
        try:
            with open(curriculum_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning("Curriculum data file not found, using default data")
            return self._get_default_curriculum_data()
    
    def _get_default_curriculum_data(self) -> Dict[str, Any]:
        """Default curriculum data for Indian education boards"""
        return {
            "boards": {
                "CBSE": {
                    "name": "Central Board of Secondary Education",
                    "style": "comprehensive, exam-focused",
                    "subjects": ["Mathematics", "Science", "English", "Hindi", "Social Studies"]
                },
                "ICSE": {
                    "name": "Indian Certificate of Secondary Education", 
                    "style": "detailed, literature-focused",
                    "subjects": ["Mathematics", "Science", "English", "Hindi", "Social Studies"]
                },
                "IB": {
                    "name": "International Baccalaureate",
                    "style": "inquiry-based, global perspective",
                    "subjects": ["Mathematics", "Sciences", "Language", "Individuals and Societies"]
                },
                "State": {
                    "name": "State Board",
                    "style": "local context, regional focus",
                    "subjects": ["Mathematics", "Science", "English", "Regional Language", "Social Studies"]
                }
            },
            "grade_levels": {
                "primary": {"grades": ["1", "2", "3", "4", "5"], "style": "simple, visual, story-based"},
                "middle": {"grades": ["6", "7", "8"], "style": "conceptual, examples, step-by-step"},
                "secondary": {"grades": ["9", "10"], "style": "detailed, exam-ready, comprehensive"},
                "higher_secondary": {"grades": ["11", "12"], "style": "advanced, analytical, research-oriented"}
            }
        }
    
    def detect_context(self, question: str, user_context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Detect board, grade level, and subject from question and user context
        """
        try:
            # Use OpenAI to analyze the question and extract context
            system_prompt = """You are an expert in Indian education curriculum analysis. 
            Analyze the given question and extract the following information:
            1. Most likely education board (CBSE, ICSE, IB, State Board)
            2. Grade level (1-12)
            3. Subject area
            4. Topic/concept being tested
            
            IMPORTANT: You must respond with ONLY a valid JSON object, no additional text.
            
            Return your analysis as a JSON object with these fields:
            {
                "board": "detected_board",
                "grade": "detected_grade", 
                "subject": "detected_subject",
                "topic": "detected_topic",
                "confidence": 0.8
            }
            
            Consider:
            - CBSE: More structured, exam-focused questions
            - ICSE: Literature-heavy, detailed explanations
            - IB: Inquiry-based, global perspective
            - State Board: Regional/local context
            - Grade indicators: complexity, vocabulary, concepts
            - Subject indicators: mathematical symbols, scientific terms, historical references
            
            Remember: Respond with ONLY the JSON object, no explanations or additional text."""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Question: {question}\nUser Context: {user_context or 'None'}"}
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            # Get the response content
            response_content = response.choices[0].message.content.strip()
            
            # Try to parse JSON, with fallback if it fails
            try:
                analysis = json.loads(response_content)
            except json.JSONDecodeError as json_error:
                logger.warning(f"Failed to parse JSON response: {json_error}")
                logger.warning(f"Raw response: {response_content}")
                
                # Fallback: try to extract JSON from the response
                import re
                json_match = re.search(r'\{.*\}', response_content, re.DOTALL)
                if json_match:
                    try:
                        analysis = json.loads(json_match.group())
                    except json.JSONDecodeError:
                        # Use default values if all parsing fails
                        analysis = {
                            "board": "CBSE",
                            "grade": "8",
                            "subject": "General",
                            "topic": "General",
                            "confidence": 0.5
                        }
                else:
                    # Use default values
                    analysis = {
                        "board": "CBSE",
                        "grade": "8",
                        "subject": "General",
                        "topic": "General",
                        "confidence": 0.5
                    }
            
            # Override with user context if provided
            if user_context:
                analysis.update({
                    "board": user_context.get("board", analysis.get("board")),
                    "grade": user_context.get("grade", analysis.get("grade")),
                    "subject": user_context.get("subject", analysis.get("subject"))
                })
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error in context detection: {str(e)}")
            return {
                "board": "CBSE",
                "grade": "8", 
                "subject": "General",
                "topic": "General",
                "confidence": 0.5
            }
    
    def get_curriculum_style(self, board: str, grade: str) -> Dict[str, Any]:
        """Get curriculum-specific style guidelines"""
        board_data = self.curriculum_data["boards"].get(board, {})
        
        # Determine grade level category
        grade_level = "primary"
        for level, data in self.curriculum_data["grade_levels"].items():
            if grade in data["grades"]:
                grade_level = level
                break
        
        grade_data = self.curriculum_data["grade_levels"].get(grade_level, {})
        
        return {
            "board_style": board_data.get("style", "comprehensive"),
            "grade_style": grade_data.get("style", "detailed"),
            "vocabulary_level": self._get_vocabulary_level(grade),
            "explanation_depth": self._get_explanation_depth(grade),
            "localization": self._get_localization_guidelines(board)
        }
    
    def _get_vocabulary_level(self, grade: str) -> str:
        """Get appropriate vocabulary level for grade"""
        grade_num = int(grade) if grade.isdigit() else 8
        
        if grade_num <= 5:
            return "simple, basic words, short sentences"
        elif grade_num <= 8:
            return "moderate, clear explanations, examples"
        elif grade_num <= 10:
            return "standard, subject-specific terms"
        else:
            return "advanced, technical terms, detailed explanations"
    
    def _get_explanation_depth(self, grade: str) -> str:
        """Get appropriate explanation depth for grade"""
        grade_num = int(grade) if grade.isdigit() else 8
        
        if grade_num <= 5:
            return "very detailed, step-by-step, visual aids"
        elif grade_num <= 8:
            return "detailed with examples, clear steps"
        elif grade_num <= 10:
            return "comprehensive, exam-ready format"
        else:
            return "concise, analytical, research-oriented"
    
    def _get_localization_guidelines(self, board: str) -> Dict[str, str]:
        """Get India-specific localization guidelines"""
        return {
            "currency": "Use Indian Rupees (₹) instead of dollars",
            "examples": "Use Indian examples: cricket, festivals, local geography",
            "measurements": "Use metric system (km, kg, °C)",
            "geography": "Reference Indian rivers, mountains, states",
            "history": "Include Indian leaders, events, independence movement",
            "science": "Mention ISRO, Indian scientists, local environmental issues",
            "culture": "Include Indian festivals, traditions, languages"
        }
    
    def create_context_prompt(self, question: str, context: Dict[str, Any]) -> str:
        """Create a context-aware prompt for the AI"""
        curriculum_style = self.get_curriculum_style(context["board"], context["grade"])
        
        prompt = f"""You are an expert educational AI assistant for Indian students.

CONTEXT:
- Education Board: {context['board']} ({curriculum_style['board_style']})
- Grade Level: {context['grade']} ({curriculum_style['grade_style']})
- Subject: {context['subject']}
- Topic: {context['topic']}

STYLE GUIDELINES:
- Vocabulary: {curriculum_style['vocabulary_level']}
- Explanation Depth: {curriculum_style['explanation_depth']}

INDIA-SPECIFIC LOCALIZATION:
- Currency: {curriculum_style['localization']['currency']}
- Examples: {curriculum_style['localization']['examples']}
- Geography: {curriculum_style['localization']['geography']}
- History: {curriculum_style['localization']['history']}
- Science: {curriculum_style['localization']['science']}

RESPONSE REQUIREMENTS:
1. Use age-appropriate language and examples
2. Include Indian context where relevant
3. Follow the board's curriculum style
4. Provide clear, structured explanations
5. Use step-by-step approach for problem-solving
6. Include relevant examples and analogies

Question: {question}

Please provide a comprehensive, curriculum-aligned answer that follows these guidelines."""

        return prompt
    
    def process_question(self, question: str, user_context: Optional[Dict] = None) -> Dict[str, Any]:
        """Main method to process a question and return context-aware analysis"""
        try:
            # Detect context from question
            detected_context = self.detect_context(question, user_context)
            
            # Get curriculum style guidelines
            curriculum_style = self.get_curriculum_style(detected_context["board"], detected_context["grade"])
            
            # Create context-aware prompt
            context_prompt = self.create_context_prompt(question, detected_context)
            
            return {
                "success": True,
                "detected_context": detected_context,
                "curriculum_style": curriculum_style,
                "context_prompt": context_prompt,
                "localization_guidelines": curriculum_style["localization"]
            }
            
        except Exception as e:
            logger.error(f"Error in curriculum mapping: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "detected_context": {"board": "CBSE", "grade": "8", "subject": "General"},
                "curriculum_style": self.get_curriculum_style("CBSE", "8"),
                "context_prompt": f"Answer this question for an Indian student: {question}"
            }
