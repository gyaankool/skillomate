import openai
import os
import json
import logging
import re
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class FormatterAgent:
    """
    Agent 3: Formatter Agent
    Structures answer in neat steps, headings, bullet points → ensures teacher-friendly output.
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        # Check if API key is available
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required but not found")
        
        # Initialize OpenAI client
        self.client = openai.OpenAI(api_key=self.openai_api_key)
        self.formatting_templates = self._load_formatting_templates()
    
    def _load_formatting_templates(self) -> Dict[str, Any]:
        """Load formatting templates for different subjects and styles"""
        return {
            "mathematics": {
                "structure": ["Given", "To Find", "Solution", "Answer"],
                "style": "step-by-step with formulas",
                "highlight_answer": True
            },
            "science": {
                "structure": ["Concept", "Explanation", "Examples", "Applications"],
                "style": "detailed with diagrams",
                "highlight_answer": False
            },
            "language": {
                "structure": ["Analysis", "Explanation", "Examples", "Conclusion"],
                "style": "literary analysis",
                "highlight_answer": False
            },
            "social_studies": {
                "structure": ["Background", "Key Points", "Analysis", "Significance"],
                "style": "historical/geographical context",
                "highlight_answer": False
            },
            "general": {
                "structure": ["Introduction", "Main Points", "Explanation", "Summary"],
                "style": "comprehensive",
                "highlight_answer": False
            }
        }
    
    def format_answer(self, content: str, context: Dict[str, Any], 
                     format_style: str = "teacher_approved") -> Dict[str, Any]:
        """
        Format the answer according to teacher-approved standards
        """
        try:
            subject = context.get("subject", "General").lower()
            grade = context.get("grade", "8")
            board = context.get("board", "CBSE")
            
            # Get formatting template
            template = self.formatting_templates.get(subject, self.formatting_templates["general"])
            
            # Create formatting prompt
            formatting_prompt = self._create_formatting_prompt(
                content, context, template, format_style
            )
            
            # Generate formatted answer using OpenAI
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": formatting_prompt},
                    {"role": "user", "content": content}
                ],
                max_tokens=1500,
                temperature=0.5
            )
            
            formatted_content = response.choices[0].message.content.strip()
            
            # Apply additional formatting
            final_content = self._apply_additional_formatting(formatted_content, template, grade)
            
            return {
                "success": True,
                "formatted_content": final_content,
                "format_style": format_style,
                "subject_template": template,
                "grade_appropriate": True
            }
            
        except Exception as e:
            logger.error(f"Error formatting answer: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "formatted_content": content
            }
    
    def _create_formatting_prompt(self, content: str, context: Dict[str, Any], 
                                template: Dict[str, Any], format_style: str) -> str:
        """Create prompt for answer formatting"""
        subject = context.get("subject", "General")
        grade = context.get("grade", "8")
        board = context.get("board", "CBSE")
        
        structure = template["structure"]
        style = template["style"]
        
        prompt = f"""You are an expert educational formatter creating teacher-approved answers for Indian students.

CONTEXT:
- Subject: {subject}
- Grade: {grade}
- Board: {board}
- Format Style: {format_style}

REQUIRED STRUCTURE:
{chr(10).join([f"{i+1}. {section}" for i, section in enumerate(structure)])}

FORMATTING REQUIREMENTS:
1. Use clear, bold headings for each section
2. Number all steps in problem-solving
3. Use bullet points for lists and key points
4. Highlight the final answer clearly
5. Use appropriate spacing and organization
6. Make it look like a neat school notebook
7. Include relevant examples and explanations
8. Use age-appropriate language for grade {grade}

SPECIFIC FORMATTING:
- Headings: Use **bold** or underline format
- Steps: Number them clearly (1, 2, 3...)
- Lists: Use bullet points (• or -)
- Important points: Use **bold** or highlight
- Final answer: Clearly marked and highlighted
- Diagrams: Mention where they should be included

STYLE: {style}

ORIGINAL CONTENT:
{content}

Please reformat this content according to the teacher-approved structure and formatting guidelines."""

        return prompt
    
    def _apply_additional_formatting(self, content: str, template: Dict[str, Any], 
                                   grade: str) -> str:
        """Apply additional formatting enhancements"""
        try:
            # Add notebook-style formatting
            content = self._add_notebook_style(content, grade)
            
            # Highlight answer if required
            if template.get("highlight_answer", False):
                content = self._highlight_final_answer(content)
            
            # Add subject-specific enhancements
            content = self._add_subject_enhancements(content, template)
            
            return content
            
        except Exception as e:
            logger.error(f"Error in additional formatting: {str(e)}")
            return content
    
    def _add_notebook_style(self, content: str, grade: str) -> str:
        """Add notebook-style formatting"""
        # Add title formatting
        content = re.sub(r'^(.*?)$', r'**\1**', content, count=1, flags=re.MULTILINE)
        
        # Add step numbering for problem-solving
        content = re.sub(r'^(\d+\.)', r'**\1**', content, flags=re.MULTILINE)
        
        # Add bullet point formatting
        content = re.sub(r'^[-•]\s*', r'• ', content, flags=re.MULTILINE)
        
        # Add emphasis for key terms
        content = re.sub(r'\b(Answer|Solution|Therefore|Hence|Thus)\b', r'**\1**', content, flags=re.IGNORECASE)
        
        return content
    
    def _highlight_final_answer(self, content: str) -> str:
        """Highlight the final answer clearly"""
        # Look for common answer patterns
        answer_patterns = [
            r'(Answer[:\s]*.*?)(?=\n\n|\n[A-Z]|$)',
            r'(Therefore[:\s]*.*?)(?=\n\n|\n[A-Z]|$)',
            r'(Hence[:\s]*.*?)(?=\n\n|\n[A-Z]|$)',
            r'(Thus[:\s]*.*?)(?=\n\n|\n[A-Z]|$)',
            r'(Final Answer[:\s]*.*?)(?=\n\n|\n[A-Z]|$)'
        ]
        
        for pattern in answer_patterns:
            content = re.sub(pattern, r'**\1**', content, flags=re.IGNORECASE | re.DOTALL)
        
        return content
    
    def _add_subject_enhancements(self, content: str, template: Dict[str, Any]) -> str:
        """Add subject-specific formatting enhancements"""
        style = template.get("style", "")
        
        if "step-by-step" in style:
            # Ensure proper step numbering
            content = re.sub(r'^(\d+\.)', r'**Step \1**', content, flags=re.MULTILINE)
        
        if "formulas" in style:
            # Highlight mathematical formulas
            content = re.sub(r'([A-Za-z]+\s*=\s*[^=]+)', r'`\1`', content)
        
        return content
    
    def create_structured_response(self, question: str, answer: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a complete structured response with question and formatted answer
        """
        try:
            # Format the answer
            formatted_result = self.format_answer(answer, context)
            
            if not formatted_result["success"]:
                return formatted_result
            
            # Create the complete structured response
            structured_response = self._create_complete_structure(
                question, formatted_result["formatted_content"], context
            )
            
            return {
                "success": True,
                "structured_response": structured_response,
                "formatted_answer": formatted_result["formatted_content"],
                "metadata": {
                    "subject": context.get("subject", "General"),
                    "grade": context.get("grade", "8"),
                    "board": context.get("board", "CBSE"),
                    "format_style": "teacher_approved"
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating structured response: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _create_complete_structure(self, question: str, formatted_answer: str, 
                                 context: Dict[str, Any]) -> str:
        """Create complete structured response with question and answer"""
        subject = context.get("subject", "General")
        grade = context.get("grade", "8")
        board = context.get("board", "CBSE")
        
        structure = f"""# {subject} - Grade {grade} ({board})

## Question
{question}

## Solution
{formatted_answer}

---
*This answer follows the {board} curriculum standards for Grade {grade}.*"""

        return structure
    
    def format_for_exam(self, content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format answer specifically for exam-style presentation
        """
        try:
            # Modify context for exam format
            exam_context = context.copy()
            exam_context["format_style"] = "exam_ready"
            
            # Get exam-specific template
            subject = context.get("subject", "General").lower()
            template = self.formatting_templates.get(subject, self.formatting_templates["general"])
            
            # Create exam-specific formatting prompt
            exam_prompt = self._create_exam_formatting_prompt(content, context, template)
            
            # Generate exam-formatted answer
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": exam_prompt},
                    {"role": "user", "content": content}
                ],
                max_tokens=1200,
                temperature=0.4
            )
            
            exam_content = response.choices[0].message.content.strip()
            
            return {
                "success": True,
                "exam_content": exam_content,
                "format_type": "exam_ready",
                "includes_key_points": True
            }
            
        except Exception as e:
            logger.error(f"Error formatting for exam: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "exam_content": content
            }
    
    def _create_exam_formatting_prompt(self, content: str, context: Dict[str, Any], 
                                     template: Dict[str, Any]) -> str:
        """Create prompt for exam-style formatting"""
        subject = context.get("subject", "General")
        grade = context.get("grade", "8")
        board = context.get("board", "CBSE")
        
        prompt = f"""You are formatting an answer for exam presentation.

CONTEXT:
- Subject: {subject}
- Grade: {grade}
- Board: {board}
- Format: Exam-ready

EXAM FORMATTING REQUIREMENTS:
1. Use clear, concise language
2. Structure with clear headings
3. Number all steps and points
4. Highlight key concepts and formulas
5. Include relevant examples
6. Make it easy to read and understand
7. Follow exam answer format
8. Use bullet points for lists
9. Bold important terms and concepts
10. Clear conclusion or final answer

ORIGINAL CONTENT:
{content}

Please reformat this content for exam presentation."""

        return prompt
    
    def add_handwriting_simulation_markers(self, content: str) -> str:
        """
        Add markers for future handwriting simulation
        This is a placeholder for the handwriting simulation feature
        """
        # Add markers that can be used for handwriting simulation
        content = re.sub(r'\*\*(.*?)\*\*', r'<bold>\1</bold>', content)
        content = re.sub(r'`(.*?)`', r'<formula>\1</formula>', content)
        content = re.sub(r'^(\d+\.)', r'<step>\1</step>', content, flags=re.MULTILINE)
        
        return content
    
    def process_formatting_request(self, content: str, context: Dict[str, Any], 
                                 format_type: str = "teacher_approved") -> Dict[str, Any]:
        """
        Main method to process formatting requests
        """
        try:
            if format_type == "teacher_approved":
                return self.format_answer(content, context, "teacher_approved")
            elif format_type == "exam_ready":
                return self.format_for_exam(content, context)
            elif format_type == "structured":
                return self.create_structured_response("", content, context)
            else:
                return {
                    "success": False,
                    "error": "Invalid format type specified"
                }
                
        except Exception as e:
            logger.error(f"Error in formatting request: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
