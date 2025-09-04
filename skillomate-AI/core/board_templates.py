import re
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class BoardSpecificTemplates:
    """
    Manages board-specific response formats and requirements
    Tailors responses to match specific educational board requirements
    """
    
    BOARD_SPECIFICATIONS = {
        "CBSE": {
            "answer_format": "structured_with_subheadings",
            "mathematical_notation": "standard_international",
            "language_mixing": "minimal_hindi",
            "diagram_requirements": "labeled_clearly",
            "marking_scheme": "step_wise_marking",
            "style": "formal_academic",
            "emphasis": "conceptual_understanding"
        },
        "ICSE": {
            "answer_format": "detailed_explanatory",
            "mathematical_notation": "verbose_working",
            "language_mixing": "english_focused", 
            "diagram_requirements": "detailed_with_explanation",
            "marking_scheme": "comprehensive_marking",
            "style": "detailed_analytical",
            "emphasis": "comprehensive_coverage"
        },
        "Maharashtra_Board": {
            "answer_format": "point_wise_structured",
            "mathematical_notation": "regional_preference",
            "language_mixing": "marathi_english",
            "diagram_requirements": "simple_clear",
            "marking_scheme": "objective_focused",
            "style": "practical_application",
            "emphasis": "practical_knowledge"
        },
        "UP_Board": {
            "answer_format": "traditional_structured",
            "mathematical_notation": "traditional_indian",
            "language_mixing": "hindi_english",
            "diagram_requirements": "basic_clear",
            "marking_scheme": "traditional_marking",
            "style": "traditional_learning",
            "emphasis": "memorization_and_practice"
        },
        "Karnataka_Board": {
            "answer_format": "modern_structured",
            "mathematical_notation": "standard_international",
            "language_mixing": "kannada_english",
            "diagram_requirements": "modern_clear",
            "marking_scheme": "balanced_marking",
            "style": "modern_approach",
            "emphasis": "application_oriented"
        },
        "Tamil_Nadu_Board": {
            "answer_format": "detailed_structured",
            "mathematical_notation": "standard_international",
            "language_mixing": "tamil_english",
            "diagram_requirements": "detailed_clear",
            "marking_scheme": "detailed_marking",
            "style": "comprehensive_learning",
            "emphasis": "thorough_understanding"
        }
    }
    
    # Board-specific formatting templates
    FORMATTING_TEMPLATES = {
        "CBSE": {
            "mathematics": {
                "problem_solving": {
                    "structure": ["Given", "To Find", "Formula", "Solution", "Answer"],
                    "language": "formal_english",
                    "working": "step_by_step",
                    "notation": "standard_math"
                },
                "theory": {
                    "structure": ["Definition", "Explanation", "Examples", "Applications"],
                    "language": "formal_english",
                    "emphasis": "conceptual_clarity"
                }
            },
            "science": {
                "numerical": {
                    "structure": ["Given", "Find", "Formula", "Substitution", "Calculation", "Answer with Unit"],
                    "language": "formal_english",
                    "working": "detailed_steps"
                },
                "theory": {
                    "structure": ["Definition", "Explanation", "Examples", "Applications"],
                    "language": "formal_english",
                    "emphasis": "understanding"
                }
            }
        },
        "ICSE": {
            "mathematics": {
                "problem_solving": {
                    "structure": ["Given", "To Find", "Formula", "Detailed Solution", "Verification", "Answer"],
                    "language": "detailed_english",
                    "working": "comprehensive_steps",
                    "notation": "detailed_math"
                },
                "theory": {
                    "structure": ["Definition", "Detailed Explanation", "Multiple Examples", "Applications", "Summary"],
                    "language": "detailed_english",
                    "emphasis": "comprehensive_coverage"
                }
            },
            "science": {
                "numerical": {
                    "structure": ["Given", "Find", "Formula", "Detailed Substitution", "Step-by-step Calculation", "Answer with Unit", "Verification"],
                    "language": "detailed_english",
                    "working": "comprehensive_steps"
                },
                "theory": {
                    "structure": ["Definition", "Detailed Explanation", "Multiple Examples", "Applications", "Summary"],
                    "language": "detailed_english",
                    "emphasis": "comprehensive_understanding"
                }
            }
        },
        "Maharashtra_Board": {
            "mathematics": {
                "problem_solving": {
                    "structure": ["दिलेले (Given)", "शोधायचे (To Find)", "सूत्र (Formula)", "उकल (Solution)", "उत्तर (Answer)"],
                    "language": "marathi_english_mix",
                    "working": "practical_steps",
                    "notation": "practical_math"
                },
                "theory": {
                    "structure": ["व्याख्या (Definition)", "स्पष्टीकरण (Explanation)", "उदाहरणे (Examples)"],
                    "language": "marathi_english_mix",
                    "emphasis": "practical_application"
                }
            }
        }
    }
    
    # Language patterns for different boards
    LANGUAGE_PATTERNS = {
        "CBSE": {
            "formal_terms": ["Therefore", "Hence", "Thus", "Consequently", "As a result"],
            "mathematical_terms": ["Given", "To Find", "Solution", "Answer", "Formula"],
            "hindi_mix": False
        },
        "ICSE": {
            "formal_terms": ["Therefore", "Hence", "Thus", "Consequently", "As a result", "Furthermore", "Moreover"],
            "mathematical_terms": ["Given", "To Find", "Solution", "Answer", "Formula", "Verification"],
            "hindi_mix": False
        },
        "Maharashtra_Board": {
            "formal_terms": ["म्हणून (Therefore)", "अशाप्रकारे (Thus)", "म्हणजे (That is)"],
            "mathematical_terms": ["दिलेले (Given)", "शोधायचे (To Find)", "उकल (Solution)", "उत्तर (Answer)"],
            "hindi_mix": True
        },
        "UP_Board": {
            "formal_terms": ["अतः (Therefore)", "इसलिए (Therefore)", "मतलब (That is)"],
            "mathematical_terms": ["दिया गया है (Given)", "ज्ञात करना है (To Find)", "हल (Solution)", "उत्तर (Answer)"],
            "hindi_mix": True
        }
    }
    
    def __init__(self):
        self.default_board = "CBSE"
    
    def apply_board_template(self, response: str, board: str, subject: str, 
                           question_type: str = "general") -> str:
        """Apply board-specific formatting to response"""
        try:
            if board not in self.BOARD_SPECIFICATIONS:
                board = self.default_board
            
            # Get board specifications
            board_specs = self.BOARD_SPECIFICATIONS[board]
            
            # Apply board-specific formatting
            formatted_response = response
            
            # 1. Apply language style
            formatted_response = self.adjust_language_style(formatted_response, board)
            
            # 2. Apply subject-specific formatting
            if subject in ["Mathematics", "Physics", "Chemistry", "Biology"]:
                formatted_response = self._apply_science_math_formatting(
                    formatted_response, board, subject, question_type
                )
            
            # 3. Apply board-specific structure
            formatted_response = self._apply_board_structure(formatted_response, board, subject)
            
            # 4. Add board-specific elements
            formatted_response = self._add_board_elements(formatted_response, board, subject)
            
            return formatted_response
            
        except Exception as e:
            logger.error(f"Error applying board template: {str(e)}")
            return response
    
    def adjust_language_style(self, content: str, board: str) -> str:
        """Adjust language complexity and mixing based on board"""
        if board not in self.LANGUAGE_PATTERNS:
            return content
        
        language_patterns = self.LANGUAGE_PATTERNS[board]
        adjusted_content = content
        
        # Replace informal terms with formal board-specific terms
        informal_to_formal = {
            "So": "Therefore",
            "So,": "Therefore,",
            "That's why": "Hence",
            "This means": "This implies",
            "We get": "We obtain",
            "We have": "We are given"
        }
        
        for informal, formal in informal_to_formal.items():
            adjusted_content = adjusted_content.replace(informal, formal)
        
        # Add board-specific formal terms where appropriate
        if board in ["CBSE", "ICSE"]:
            # Add formal mathematical language
            math_terms = {
                "Given": "Given:",
                "To Find": "To Find:",
                "Solution": "Solution:",
                "Answer": "Answer:",
                "Formula": "Formula:"
            }
            
            for term, formal_term in math_terms.items():
                if term in adjusted_content and not term + ":" in adjusted_content:
                    adjusted_content = adjusted_content.replace(term, formal_term)
        
        return adjusted_content
    
    def format_for_board_exams(self, answer: str, board: str, marks: int, 
                              subject: str = "general") -> str:
        """Format answer according to board's exam pattern"""
        try:
            formatted_answer = answer
            
            # Add mark allocation
            if board in ["CBSE", "ICSE"]:
                formatted_answer = f"**Marks: {marks}**\n\n" + formatted_answer
            
            # Add board-specific headers
            if board == "CBSE":
                formatted_answer = self._add_cbse_exam_formatting(formatted_answer, subject, marks)
            elif board == "ICSE":
                formatted_answer = self._add_icse_exam_formatting(formatted_answer, subject, marks)
            elif board == "Maharashtra_Board":
                formatted_answer = self._add_maharashtra_exam_formatting(formatted_answer, subject, marks)
            elif board == "UP_Board":
                formatted_answer = self._add_up_exam_formatting(formatted_answer, subject, marks)
            
            # Add time allocation suggestion
            time_allocation = self._get_time_allocation(marks, board)
            if time_allocation:
                formatted_answer += f"\n\n**Suggested Time: {time_allocation}**"
            
            return formatted_answer
            
        except Exception as e:
            logger.error(f"Error formatting for board exams: {str(e)}")
            return answer
    
    def _apply_science_math_formatting(self, content: str, board: str, subject: str, 
                                     question_type: str) -> str:
        """Apply science and mathematics specific formatting"""
        if board not in self.FORMATTING_TEMPLATES:
            return content
        
        board_templates = self.FORMATTING_TEMPLATES[board]
        
        if subject == "Mathematics" and "mathematics" in board_templates:
            math_templates = board_templates["mathematics"]
            
            if question_type in math_templates:
                template = math_templates[question_type]
                return self._apply_template_structure(content, template)
        
        elif subject in ["Physics", "Chemistry", "Biology"] and "science" in board_templates:
            science_templates = board_templates["science"]
            
            if question_type in science_templates:
                template = science_templates[question_type]
                return self._apply_template_structure(content, template)
        
        return content
    
    def _apply_template_structure(self, content: str, template: Dict) -> str:
        """Apply template structure to content"""
        structure = template.get("structure", [])
        language = template.get("language", "formal_english")
        
        # Add structure headers if not present
        for header in structure:
            if header not in content:
                # Find appropriate place to insert header
                if "Given" in header and "Given" not in content:
                    content = f"**{header}:**\n" + content
                elif "Solution" in header and "Solution" not in content:
                    # Insert before the main explanation
                    lines = content.split('\n')
                    for i, line in enumerate(lines):
                        if line.strip() and not line.startswith('**'):
                            lines.insert(i, f"\n**{header}:**")
                            break
                    content = '\n'.join(lines)
        
        return content
    
    def _apply_board_structure(self, content: str, board: str, subject: str) -> str:
        """Apply board-specific structural elements"""
        if board == "CBSE":
            return self._apply_cbse_structure(content, subject)
        elif board == "ICSE":
            return self._apply_icse_structure(content, subject)
        elif board == "Maharashtra_Board":
            return self._apply_maharashtra_structure(content, subject)
        elif board == "UP_Board":
            return self._apply_up_structure(content, subject)
        
        return content
    
    def _apply_cbse_structure(self, content: str, subject: str) -> str:
        """Apply CBSE-specific structure"""
        # CBSE prefers clear, structured answers
        if "**Given:**" not in content and subject == "Mathematics":
            # Add CBSE-style structure
            content = f"**Given:**\n• [Values from question]\n\n**To Find:**\n• [What needs to be calculated]\n\n**Solution:**\n{content}\n\n**Answer:**\n• [Final answer with units]"
        
        return content
    
    def _apply_icse_structure(self, content: str, subject: str) -> str:
        """Apply ICSE-specific structure"""
        # ICSE prefers detailed, comprehensive answers
        if "**Detailed Solution:**" not in content and subject == "Mathematics":
            content = f"**Given:**\n• [Values from question]\n\n**To Find:**\n• [What needs to be calculated]\n\n**Detailed Solution:**\n{content}\n\n**Verification:**\n• [Check if answer is reasonable]\n\n**Answer:**\n• [Final answer with units]"
        
        return content
    
    def _apply_maharashtra_structure(self, content: str, subject: str) -> str:
        """Apply Maharashtra Board-specific structure"""
        # Maharashtra Board prefers bilingual approach
        if "**दिलेले (Given):**" not in content and subject == "Mathematics":
            content = f"**दिलेले (Given):**\n• [Values from question]\n\n**शोधायचे (To Find):**\n• [What needs to be calculated]\n\n**उकल (Solution):**\n{content}\n\n**उत्तर (Answer):**\n• [Final answer with units]"
        
        return content
    
    def _apply_up_structure(self, content: str, subject: str) -> str:
        """Apply UP Board-specific structure"""
        # UP Board prefers traditional Hindi-English mix
        if "**दिया गया है (Given):**" not in content and subject == "Mathematics":
            content = f"**दिया गया है (Given):**\n• [Values from question]\n\n**ज्ञात करना है (To Find):**\n• [What needs to be calculated]\n\n**हल (Solution):**\n{content}\n\n**उत्तर (Answer):**\n• [Final answer with units]"
        
        return content
    
    def _add_board_elements(self, content: str, board: str, subject: str) -> str:
        """Add board-specific elements to content"""
        if board == "CBSE":
            # Add CBSE-specific elements
            if subject == "Mathematics":
                content += "\n\n**Note:** Show all working steps clearly."
            elif subject in ["Physics", "Chemistry"]:
                content += "\n\n**Note:** Write units with all numerical answers."
        
        elif board == "ICSE":
            # Add ICSE-specific elements
            if subject == "Mathematics":
                content += "\n\n**Note:** Provide detailed explanation for each step."
            elif subject in ["Physics", "Chemistry"]:
                content += "\n\n**Note:** Include proper units and significant figures."
        
        elif board == "Maharashtra_Board":
            # Add Maharashtra Board-specific elements
            if subject == "Mathematics":
                content += "\n\n**टीप (Note):** सर्व पायऱ्या स्पष्टपणे दाखवा।"
            elif subject in ["Physics", "Chemistry"]:
                content += "\n\n**टीप (Note):** सर्व संख्यांसोबत एकके लिहा।"
        
        return content
    
    def _add_cbse_exam_formatting(self, content: str, subject: str, marks: int) -> str:
        """Add CBSE-specific exam formatting"""
        formatted = content
        
        # Add CBSE-style headers
        if subject == "Mathematics":
            formatted = formatted.replace("**Solution:**", "**Solution:**\n*Show all working steps*")
        
        # Add CBSE marking scheme hints
        if marks <= 2:
            formatted += "\n\n*[2 marks: Show formula and final answer]*"
        elif marks <= 4:
            formatted += "\n\n*[4 marks: Show all working steps clearly]*"
        else:
            formatted += "\n\n*[5+ marks: Detailed solution with verification]*"
        
        return formatted
    
    def _add_icse_exam_formatting(self, content: str, subject: str, marks: int) -> str:
        """Add ICSE-specific exam formatting"""
        formatted = content
        
        # Add ICSE-style detailed headers
        if subject == "Mathematics":
            formatted = formatted.replace("**Solution:**", "**Detailed Solution:**\n*Provide comprehensive explanation*")
        
        # Add ICSE marking scheme hints
        if marks <= 3:
            formatted += "\n\n*[3 marks: Basic solution with working]*"
        elif marks <= 5:
            formatted += "\n\n*[5 marks: Detailed solution with verification]*"
        else:
            formatted += "\n\n*[7+ marks: Comprehensive solution with multiple methods]*"
        
        return formatted
    
    def _add_maharashtra_exam_formatting(self, content: str, subject: str, marks: int) -> str:
        """Add Maharashtra Board-specific exam formatting"""
        formatted = content
        
        # Add Maharashtra Board-style bilingual headers
        if subject == "Mathematics":
            formatted = formatted.replace("**Solution:**", "**उकल (Solution):**\n*सर्व पायऱ्या दाखवा*")
        
        # Add Maharashtra Board marking scheme hints
        if marks <= 2:
            formatted += "\n\n*[2 गुण: सूत्र आणि अंतिम उत्तर दाखवा]*"
        elif marks <= 4:
            formatted += "\n\n*[4 गुण: सर्व पायऱ्या स्पष्टपणे दाखवा]*"
        else:
            formatted += "\n\n*[5+ गुण: तपशीलवार उकल]*"
        
        return formatted
    
    def _add_up_exam_formatting(self, content: str, subject: str, marks: int) -> str:
        """Add UP Board-specific exam formatting"""
        formatted = content
        
        # Add UP Board-style traditional headers
        if subject == "Mathematics":
            formatted = formatted.replace("**Solution:**", "**हल (Solution):**\n*सभी चरण स्पष्ट रूप से दिखाएं*")
        
        # Add UP Board marking scheme hints
        if marks <= 2:
            formatted += "\n\n*[2 अंक: सूत्र और अंतिम उत्तर दिखाएं]*"
        elif marks <= 4:
            formatted += "\n\n*[4 अंक: सभी चरण स्पष्ट रूप से दिखाएं]*"
        else:
            formatted += "\n\n*[5+ अंक: विस्तृत हल]*"
        
        return formatted
    
    def _get_time_allocation(self, marks: int, board: str) -> str:
        """Get suggested time allocation based on marks and board"""
        # General time allocation (minutes per mark)
        time_per_mark = {
            "CBSE": 2,
            "ICSE": 2.5,
            "Maharashtra_Board": 2,
            "UP_Board": 2,
            "Karnataka_Board": 2,
            "Tamil_Nadu_Board": 2.5
        }
        
        time_per_mark_value = time_per_mark.get(board, 2)
        total_time = marks * time_per_mark_value
        
        if total_time <= 5:
            return f"{total_time} minutes"
        elif total_time <= 15:
            return f"{total_time} minutes"
        else:
            return f"{total_time} minutes"
    
    def get_board_requirements(self, board: str) -> Dict[str, Any]:
        """Get board-specific requirements"""
        return self.BOARD_SPECIFICATIONS.get(board, self.BOARD_SPECIFICATIONS[self.default_board])
    
    def validate_board_compliance(self, content: str, board: str, subject: str) -> Dict[str, Any]:
        """Validate if content complies with board requirements"""
        requirements = self.get_board_requirements(board)
        compliance = {
            "board": board,
            "subject": subject,
            "compliant": True,
            "issues": [],
            "suggestions": []
        }
        
        # Check language mixing
        if not requirements.get("language_mixing", False) and self._has_hindi_mixing(content):
            compliance["compliant"] = False
            compliance["issues"].append("Hindi language mixing not allowed for this board")
            compliance["suggestions"].append("Use English only")
        
        # Check mathematical notation
        if subject == "Mathematics":
            notation_style = requirements.get("mathematical_notation", "standard_international")
            if notation_style == "standard_international" and self._has_non_standard_notation(content):
                compliance["suggestions"].append("Use standard international mathematical notation")
        
        # Check structure
        if requirements.get("answer_format") == "structured_with_subheadings":
            if not self._has_proper_structure(content):
                compliance["suggestions"].append("Add proper subheadings (Given, To Find, Solution, Answer)")
        
        return compliance
    
    def _has_hindi_mixing(self, content: str) -> bool:
        """Check if content has Hindi language mixing"""
        hindi_patterns = [
            r'[अ-ह]',  # Hindi characters
            r'[ा-ौ]',  # Hindi matras
            r'[०-९]'   # Hindi numerals
        ]
        
        for pattern in hindi_patterns:
            if re.search(pattern, content):
                return True
        
        return False
    
    def _has_non_standard_notation(self, content: str) -> bool:
        """Check if content has non-standard mathematical notation"""
        non_standard_patterns = [
            r'[×÷]',  # Non-standard multiplication/division symbols
            r'[²³]',  # Non-standard superscripts
        ]
        
        for pattern in non_standard_patterns:
            if re.search(pattern, content):
                return True
        
        return False
    
    def _has_proper_structure(self, content: str) -> bool:
        """Check if content has proper structure with subheadings"""
        required_headers = ["Given", "To Find", "Solution", "Answer"]
        content_lower = content.lower()
        
        for header in required_headers:
            if header.lower() not in content_lower:
                return False
        
        return True
