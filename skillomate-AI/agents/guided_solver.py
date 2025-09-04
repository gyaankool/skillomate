import openai
import os
import json
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class GuidedSolverAgent:
    """
    Agent 2: Guided Solver
    Generates hints step-by-step, adapts difficulty by grade.
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        # Check if API key is available
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required but not found")
        
        # Initialize OpenAI client
        self.client = openai.OpenAI(api_key=self.openai_api_key)
        self.hint_levels = {
            "level_1": "basic_hint",
            "level_2": "detailed_hint", 
            "level_3": "partial_solution",
            "level_4": "complete_solution"
        }
    
    def generate_progressive_hints(self, question: str, context: Dict[str, Any], 
                                 current_level: int = 1) -> Dict[str, Any]:
        """
        Generate progressive hints based on current level
        """
        try:
            grade = context.get("grade", "8")
            subject = context.get("subject", "General")
            
            # Determine hint strategy based on grade and subject
            hint_strategy = self._get_hint_strategy(grade, subject)
            
            # Create level-specific prompt
            level_prompt = self._create_level_prompt(question, context, current_level, hint_strategy)
            
            # Generate hint using OpenAI
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": level_prompt},
                    {"role": "user", "content": question}
                ],
                max_tokens=800,
                temperature=0.7
            )
            
            hint_content = response.choices[0].message.content.strip()
            
            # Determine next action based on current level
            next_action = self._get_next_action(current_level, context)
            
            return {
                "success": True,
                "hint_level": current_level,
                "hint_content": hint_content,
                "next_action": next_action,
                "max_levels": 4,
                "is_complete": current_level >= 4
            }
            
        except Exception as e:
            logger.error(f"Error generating progressive hints: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "hint_level": current_level,
                "hint_content": "Unable to generate hint at this time.",
                "next_action": "retry"
            }
    
    def _get_hint_strategy(self, grade: str, subject: str) -> Dict[str, Any]:
        """Get hint strategy based on grade and subject"""
        grade_num = int(grade) if grade.isdigit() else 8
        
        if subject.lower() in ["mathematics", "math"]:
            return self._get_math_hint_strategy(grade_num)
        elif subject.lower() in ["science", "physics", "chemistry", "biology"]:
            return self._get_science_hint_strategy(grade_num)
        elif subject.lower() in ["english", "hindi", "language"]:
            return self._get_language_hint_strategy(grade_num)
        elif subject.lower() in ["social studies", "history", "geography", "civics"]:
            return self._get_social_studies_hint_strategy(grade_num)
        else:
            return self._get_general_hint_strategy(grade_num)
    
    def _get_math_hint_strategy(self, grade: int) -> Dict[str, Any]:
        """Math-specific hint strategy"""
        if grade <= 5:
            return {
                "level_1": "Show the formula or concept needed",
                "level_2": "Provide a simple example with numbers",
                "level_3": "Show step-by-step solution with explanation",
                "level_4": "Complete solution with verification"
            }
        elif grade <= 8:
            return {
                "level_1": "Identify the mathematical concept and formula",
                "level_2": "Show how to set up the problem with variables",
                "level_3": "Provide partial solution with key steps",
                "level_4": "Complete solution with alternative methods"
            }
        else:
            return {
                "level_1": "Identify the mathematical approach and concepts",
                "level_2": "Show problem setup and key equations",
                "level_3": "Provide solution framework and key calculations",
                "level_4": "Complete solution with multiple approaches"
            }
    
    def _get_science_hint_strategy(self, grade: int) -> Dict[str, Any]:
        """Science-specific hint strategy"""
        if grade <= 5:
            return {
                "level_1": "Identify the scientific concept",
                "level_2": "Provide a simple example or experiment",
                "level_3": "Explain the concept with step-by-step reasoning",
                "level_4": "Complete explanation with real-world examples"
            }
        elif grade <= 8:
            return {
                "level_1": "Identify the scientific principle and relevant concepts",
                "level_2": "Show the experimental setup or process",
                "level_3": "Provide detailed explanation with examples",
                "level_4": "Complete answer with applications and implications"
            }
        else:
            return {
                "level_1": "Identify the scientific theory and principles involved",
                "level_2": "Show the analytical approach and methodology",
                "level_3": "Provide detailed explanation with evidence",
                "level_4": "Complete answer with critical analysis and applications"
            }
    
    def _get_language_hint_strategy(self, grade: int) -> Dict[str, Any]:
        """Language-specific hint strategy"""
        if grade <= 5:
            return {
                "level_1": "Identify the type of question (grammar, comprehension, etc.)",
                "level_2": "Provide a simple example or pattern",
                "level_3": "Show the answer with explanation",
                "level_4": "Complete answer with additional examples"
            }
        elif grade <= 8:
            return {
                "level_1": "Identify the language concept and rules",
                "level_2": "Show examples and patterns",
                "level_3": "Provide detailed explanation with examples",
                "level_4": "Complete answer with analysis and applications"
            }
        else:
            return {
                "level_1": "Identify the literary device or language concept",
                "level_2": "Show the analytical approach",
                "level_3": "Provide detailed analysis with evidence",
                "level_4": "Complete answer with critical interpretation"
            }
    
    def _get_social_studies_hint_strategy(self, grade: int) -> Dict[str, Any]:
        """Social studies-specific hint strategy"""
        if grade <= 5:
            return {
                "level_1": "Identify the topic (history, geography, civics)",
                "level_2": "Provide simple facts and examples",
                "level_3": "Explain the concept with examples",
                "level_4": "Complete answer with Indian context"
            }
        elif grade <= 8:
            return {
                "level_1": "Identify the historical period or geographical concept",
                "level_2": "Show key events, places, or concepts",
                "level_3": "Provide detailed explanation with context",
                "level_4": "Complete answer with analysis and significance"
            }
        else:
            return {
                "level_1": "Identify the historical context or geographical theme",
                "level_2": "Show the analytical framework",
                "level_3": "Provide detailed analysis with evidence",
                "level_4": "Complete answer with critical evaluation"
            }
    
    def _get_general_hint_strategy(self, grade: int) -> Dict[str, Any]:
        """General hint strategy for other subjects"""
        if grade <= 5:
            return {
                "level_1": "Identify what the question is asking",
                "level_2": "Provide a simple example",
                "level_3": "Show the answer with explanation",
                "level_4": "Complete answer with examples"
            }
        elif grade <= 8:
            return {
                "level_1": "Identify the key concepts and approach",
                "level_2": "Show examples and patterns",
                "level_3": "Provide detailed explanation",
                "level_4": "Complete answer with analysis"
            }
        else:
            return {
                "level_1": "Identify the analytical approach",
                "level_2": "Show the framework and key points",
                "level_3": "Provide detailed analysis",
                "level_4": "Complete answer with critical evaluation"
            }
    
    def _create_level_prompt(self, question: str, context: Dict[str, Any], 
                           level: int, strategy: Dict[str, Any]) -> str:
        """Create level-specific prompt for hint generation"""
        grade = context.get("grade", "8")
        subject = context.get("subject", "General")
        board = context.get("board", "CBSE")
        
        level_description = strategy.get(f"level_{level}", "Provide a helpful hint")
        
        prompt = f"""You are Skillomate, an expert educational guide helping Indian students solve problems step by step.

CONTEXT:
- Grade: {grade}
- Subject: {subject}
- Board: {board}
- Current Hint Level: {level}/4

HINT STRATEGY FOR THIS LEVEL:
{level_description}

SPECIAL INSTRUCTIONS:
1. For Level 1: ALWAYS start with "What do you know about [topic/concept]?" to assess understanding
2. Provide ONLY the hint/guidance for this specific level
3. Do NOT give the complete answer yet
4. Use age-appropriate language for grade {grade}
5. Include Indian context where relevant
6. Make the hint encouraging and helpful
7. Keep it concise but informative

FORMAT:
- For Level 1: Start with "What do you know about [topic]?"
- For other levels: Start with "Hint {level}:"
- Provide the specific guidance for this level
- End with an encouraging note

Question: {question}

Remember: This is hint level {level} of 4. For level 1, always ask "What do you know about..." to assess the student's understanding first."""

        return prompt
    
    def _get_next_action(self, current_level: int, context: Dict[str, Any]) -> str:
        """Determine the next action based on current level"""
        if current_level >= 4:
            return "complete"
        elif current_level == 3:
            return "show_complete_solution"
        elif current_level == 2:
            return "show_partial_solution"
        else:
            return "show_detailed_hint"
    
    def generate_adaptive_explanation(self, question: str, context: Dict[str, Any], 
                                    explanation_type: str = "detailed") -> Dict[str, Any]:
        """
        Generate adaptive explanations based on grade level and explanation type
        """
        try:
            grade = context.get("grade", "8")
            subject = context.get("subject", "General")
            
            # Determine explanation style based on grade
            explanation_style = self._get_explanation_style(grade, explanation_type)
            
            # Create explanation prompt
            explanation_prompt = self._create_explanation_prompt(
                question, context, explanation_style
            )
            
            # Generate explanation using OpenAI
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": explanation_prompt},
                    {"role": "user", "content": question}
                ],
                max_tokens=1200,
                temperature=0.7
            )
            
            explanation_content = response.choices[0].message.content.strip()
            
            return {
                "success": True,
                "explanation_type": explanation_type,
                "content": explanation_content,
                "grade_appropriate": True,
                "includes_examples": "example" in explanation_content.lower()
            }
            
        except Exception as e:
            logger.error(f"Error generating adaptive explanation: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "content": "Unable to generate explanation at this time."
            }
    
    def _get_explanation_style(self, grade: str, explanation_type: str) -> Dict[str, Any]:
        """Get explanation style based on grade and type"""
        grade_num = int(grade) if grade.isdigit() else 8
        
        if explanation_type == "simple":
            return {
                "language": "very simple, basic vocabulary",
                "structure": "short sentences, bullet points",
                "examples": "everyday examples, visual descriptions",
                "length": "brief and concise"
            }
        elif explanation_type == "detailed":
            if grade_num <= 5:
                return {
                    "language": "simple, clear vocabulary",
                    "structure": "step-by-step, numbered points",
                    "examples": "concrete examples, stories",
                    "length": "comprehensive but simple"
                }
            elif grade_num <= 8:
                return {
                    "language": "clear, moderate vocabulary",
                    "structure": "logical flow, clear sections",
                    "examples": "relevant examples, analogies",
                    "length": "detailed with examples"
                }
            else:
                return {
                    "language": "standard academic vocabulary",
                    "structure": "analytical, well-organized",
                    "examples": "specific examples, case studies",
                    "length": "comprehensive and thorough"
                }
        else:  # exam-ready
            return {
                "language": "precise, subject-specific terms",
                "structure": "exam format, clear headings",
                "examples": "relevant examples, applications",
                "length": "concise but complete"
            }
    
    def _create_explanation_prompt(self, question: str, context: Dict[str, Any], 
                                 style: Dict[str, Any]) -> str:
        """Create prompt for adaptive explanation generation"""
        grade = context.get("grade", "8")
        subject = context.get("subject", "General")
        board = context.get("board", "CBSE")
        
        prompt = f"""You are an expert educational AI assistant providing explanations for Indian students.

CONTEXT:
- Grade: {grade}
- Subject: {subject}
- Board: {board}

EXPLANATION STYLE REQUIREMENTS:
- Language: {style['language']}
- Structure: {style['structure']}
- Examples: {style['examples']}
- Length: {style['length']}

SPECIFIC REQUIREMENTS:
1. Use age-appropriate language for grade {grade}
2. Include Indian context and examples where relevant
3. Follow the board's curriculum style ({board})
4. Provide clear, structured explanations
5. Include relevant examples and analogies
6. Use step-by-step approach for problem-solving
7. Make it engaging and educational

FORMAT:
- Start with a clear introduction
- Use appropriate headings and structure
- Include examples and explanations
- End with a summary or key points

Question: {question}

Please provide a comprehensive explanation that follows these guidelines."""

        return prompt
    
    def process_guided_learning(self, question: str, context: Dict[str, Any], 
                               mode: str = "progressive") -> Dict[str, Any]:
        """
        Main method to process guided learning request
        """
        try:
            if mode == "progressive":
                return self.generate_progressive_hints(question, context, 1)
            elif mode == "adaptive":
                return self.generate_adaptive_explanation(question, context, "detailed")
            else:
                return {
                    "success": False,
                    "error": "Invalid mode specified"
                }
                
        except Exception as e:
            logger.error(f"Error in guided learning: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
