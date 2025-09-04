import re
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class TeacherApprovedFormatter:
    """
    Formats AI responses according to Indian educational standards
    Transforms basic AI responses into structured, exam-ready formats
    """
    
    SUBJECT_TEMPLATES = {
        "Mathematics": {
            "problem_solving": ["Given", "To Find", "Formula", "Solution", "Answer"],
            "theorem_proof": ["Statement", "Given", "To Prove", "Proof", "Hence Proved"],
            "geometry": ["Given", "To Find", "Construction", "Proof", "Answer"],
            "algebra": ["Given", "To Find", "Method", "Solution", "Answer"],
            "style": "numbered_steps_with_working"
        },
        "Physics": {
            "numerical": ["Given", "Find", "Formula", "Substitution", "Calculation", "Answer with Unit"],
            "theory": ["Definition", "Explanation", "Formula/Law", "Applications", "Examples"],
            "experiment": ["Aim", "Apparatus", "Procedure", "Observation", "Result"],
            "style": "structured_with_diagrams"
        },
        "Chemistry": {
            "equations": ["Reactants", "Products", "Balanced Equation", "Type of Reaction"],
            "theory": ["Definition", "Properties", "Uses", "Examples"],
            "calculations": ["Given", "Find", "Formula", "Substitution", "Answer"],
            "style": "chemical_notation_friendly"
        },
        "Biology": {
            "structure": ["Definition", "Structure", "Function", "Location", "Importance"],
            "process": ["Definition", "Steps", "Significance", "Examples"],
            "classification": ["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"],
            "style": "descriptive_with_diagrams"
        },
        "English": {
            "grammar": ["Rule", "Explanation", "Examples", "Practice"],
            "literature": ["Theme", "Summary", "Analysis", "Quotes", "Conclusion"],
            "writing": ["Introduction", "Body", "Conclusion", "Key Points"],
            "style": "structured_with_examples"
        },
        "History": {
            "event": ["When", "Where", "Who", "What", "Why", "How", "Significance"],
            "person": ["Birth", "Life", "Achievements", "Contribution", "Legacy"],
            "period": ["Timeline", "Key Events", "Changes", "Impact"],
            "style": "chronological_structured"
        },
        "Geography": {
            "physical": ["Location", "Features", "Climate", "Vegetation", "Importance"],
            "economic": ["Resources", "Industries", "Trade", "Development"],
            "political": ["Boundaries", "Administration", "Population", "Issues"],
            "style": "descriptive_with_maps"
        }
    }
    
    def __init__(self):
        self.math_patterns = {
            'equation': r'(\d+[xX]\s*[+\-*/]\s*\d+\s*=\s*\d+)',
            'calculation': r'(\d+\s*[+\-*/]\s*\d+)',
            'fraction': r'(\d+/\d+)',
            'percentage': r'(\d+%)',
            'unit': r'(\d+\s*(cm|km|kg|g|m|s|°C|°F))'
        }
        
        self.hindi_terms = {
            'Mathematics': {
                'addition': 'जोड़',
                'subtraction': 'घटाव', 
                'multiplication': 'गुणा',
                'division': 'भाग',
                'equals': 'बराबर',
                'answer': 'उत्तर',
                'solution': 'हल',
                'formula': 'सूत्र'
            },
            'Science': {
                'experiment': 'प्रयोग',
                'observation': 'अवलोकन',
                'result': 'परिणाम',
                'conclusion': 'निष्कर्ष',
                'hypothesis': 'परिकल्पना'
            }
        }
    
    def format_response(self, raw_response: str, subject: str, grade: str, question_type: str, 
                       board: str = "CBSE", marks: Optional[int] = None) -> Dict[str, Any]:
        """
        Convert raw AI response to teacher-approved format
        Returns formatted response with proper structure
        """
        try:
            # Determine the appropriate template
            template = self._get_template(subject, question_type)
            
            # Parse the raw response
            parsed_content = self._parse_raw_response(raw_response, subject, question_type)
            
            # Apply subject-specific formatting
            formatted_content = self._apply_subject_formatting(
                parsed_content, subject, question_type, template
            )
            
            # Add working steps for mathematical solutions
            if subject == "Mathematics":
                formatted_content = self.add_working_steps(formatted_content, subject)
            
            # Format for exam style
            exam_formatted = self.format_for_exam_style(formatted_content, marks, board)
            
            # Add Hindi terms where appropriate
            if board in ["CBSE", "State Board"]:
                exam_formatted = self._add_hindi_terms(exam_formatted, subject)
            
            # Calculate estimated marks
            estimated_marks = self._estimate_marks(exam_formatted, subject, question_type)
            
            return {
                "success": True,
                "formatted_response": exam_formatted,
                "raw_response": raw_response,
                "formatting_applied": self._get_applied_formatting(subject, question_type),
                "estimated_marks": estimated_marks,
                "template_used": template,
                "subject": subject,
                "grade": grade,
                "board": board
            }
            
        except Exception as e:
            logger.error(f"Error formatting response: {str(e)}")
            return {
                "success": False,
                "error": f"Formatting failed: {str(e)}",
                "raw_response": raw_response
            }
    
    def _get_template(self, subject: str, question_type: str) -> List[str]:
        """Get the appropriate template for the subject and question type"""
        if subject in self.SUBJECT_TEMPLATES:
            subject_templates = self.SUBJECT_TEMPLATES[subject]
            
            # Try to find specific question type template
            if question_type in subject_templates:
                return subject_templates[question_type]
            
            # Fall back to first available template
            for key, value in subject_templates.items():
                if isinstance(value, list):
                    return value
            
        # Default template
        return ["Introduction", "Explanation", "Examples", "Conclusion"]
    
    def _parse_raw_response(self, raw_response: str, subject: str, question_type: str) -> Dict[str, str]:
        """Parse raw AI response into structured components"""
        content = {
            "main_content": raw_response,
            "steps": [],
            "calculations": [],
            "examples": [],
            "definitions": []
        }
        
        # Extract mathematical calculations
        if subject == "Mathematics":
            content["calculations"] = self._extract_calculations(raw_response)
            content["steps"] = self._extract_steps(raw_response)
        
        # Extract definitions for theory subjects
        if subject in ["Physics", "Chemistry", "Biology"]:
            content["definitions"] = self._extract_definitions(raw_response)
        
        # Extract examples
        content["examples"] = self._extract_examples(raw_response)
        
        return content
    
    def _extract_calculations(self, text: str) -> List[str]:
        """Extract mathematical calculations from text"""
        calculations = []
        
        # Find equation patterns
        equations = re.findall(self.math_patterns['equation'], text)
        calculations.extend(equations)
        
        # Find calculation patterns
        calcs = re.findall(self.math_patterns['calculation'], text)
        calculations.extend(calcs)
        
        return list(set(calculations))
    
    def _extract_steps(self, text: str) -> List[str]:
        """Extract step-by-step solutions"""
        steps = []
        
        # Look for numbered steps
        step_pattern = r'(\d+\.\s*[^.]*\.)'
        matches = re.findall(step_pattern, text)
        steps.extend(matches)
        
        # Look for step indicators
        step_indicators = [
            r'(Step \d+:.*?)(?=Step \d+:|$)',
            r'(First,.*?)(?=Second,|Next,|Finally,|$)',
            r'(Second,.*?)(?=Third,|Next,|Finally,|$)',
            r'(Finally,.*?)(?=Therefore,|Hence,|$)'
        ]
        
        for pattern in step_indicators:
            matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
            steps.extend(matches)
        
        return steps
    
    def _extract_definitions(self, text: str) -> List[str]:
        """Extract definitions from text"""
        definitions = []
        
        # Look for definition patterns
        def_patterns = [
            r'([A-Z][^.]*?is[^.]*?\.)',
            r'([A-Z][^.]*?refers to[^.]*?\.)',
            r'([A-Z][^.]*?defined as[^.]*?\.)'
        ]
        
        for pattern in def_patterns:
            matches = re.findall(pattern, text)
            definitions.extend(matches)
        
        return definitions
    
    def _extract_examples(self, text: str) -> List[str]:
        """Extract examples from text"""
        examples = []
        
        # Look for example indicators
        example_patterns = [
            r'(For example[^.]*?\.)',
            r'(Example[^.]*?\.)',
            r'(Such as[^.]*?\.)',
            r'(Like[^.]*?\.)'
        ]
        
        for pattern in example_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            examples.extend(matches)
        
        return examples
    
    def _apply_subject_formatting(self, content: Dict[str, str], subject: str, 
                                question_type: str, template: List[str]) -> str:
        """Apply subject-specific formatting to content"""
        formatted_parts = []
        
        if subject == "Mathematics":
            formatted_parts = self._format_mathematics(content, template)
        elif subject in ["Physics", "Chemistry", "Biology"]:
            formatted_parts = self._format_science(content, subject, template)
        elif subject == "English":
            formatted_parts = self._format_english(content, template)
        else:
            formatted_parts = self._format_general(content, template)
        
        return "\n\n".join(formatted_parts)
    
    def _format_mathematics(self, content: Dict[str, str], template: List[str]) -> List[str]:
        """Format mathematics content"""
        parts = []
        
        # Add Given section if calculations exist
        if content["calculations"]:
            parts.append("**Given:**")
            for calc in content["calculations"][:3]:  # Limit to first 3
                parts.append(f"• {calc}")
        
        # Add To Find section
        parts.append("**To Find:**")
        parts.append("• Solution to the given problem")
        
        # Add Formula section
        parts.append("**Formula:**")
        parts.append("• Relevant mathematical formula")
        
        # Add Solution section
        parts.append("**Solution:**")
        if content["steps"]:
            for i, step in enumerate(content["steps"][:5], 1):  # Limit to 5 steps
                parts.append(f"{i}. {step}")
        else:
            parts.append("1. Step-by-step solution")
        
        # Add Answer section
        parts.append("**Answer:**")
        parts.append("• Final answer with proper units")
        
        return parts
    
    def _format_science(self, content: Dict[str, str], subject: str, template: List[str]) -> List[str]:
        """Format science content"""
        parts = []
        
        # Add Definition section
        if content["definitions"]:
            parts.append("**Definition:**")
            parts.append(content["definitions"][0])
        
        # Add Explanation section
        parts.append("**Explanation:**")
        parts.append(content["main_content"][:200] + "...")
        
        # Add Examples section
        if content["examples"]:
            parts.append("**Examples:**")
            for example in content["examples"][:2]:  # Limit to 2 examples
                parts.append(f"• {example}")
        
        return parts
    
    def _format_english(self, content: Dict[str, str], template: List[str]) -> List[str]:
        """Format English content"""
        parts = []
        
        parts.append("**Analysis:**")
        parts.append(content["main_content"][:300] + "...")
        
        if content["examples"]:
            parts.append("**Examples:**")
            for example in content["examples"][:2]:
                parts.append(f"• {example}")
        
        return parts
    
    def _format_general(self, content: Dict[str, str], template: List[str]) -> List[str]:
        """Format general content"""
        parts = []
        
        for section in template:
            parts.append(f"**{section}:**")
            parts.append(f"• {content['main_content'][:150]}...")
        
        return parts
    
    def add_working_steps(self, solution: str, subject: str) -> str:
        """Add detailed working for mathematical solutions"""
        if subject != "Mathematics":
            return solution
        
        # Add working steps if not present
        if "Step" not in solution and "**Solution:**" in solution:
            # Insert working steps after Solution header
            working_steps = """
**Working:**
1. Identify the given values
2. Apply the appropriate formula
3. Substitute the values
4. Perform calculations step by step
5. Write the final answer with units
"""
            solution = solution.replace("**Solution:**", "**Solution:**" + working_steps)
        
        return solution
    
    def format_for_exam_style(self, content: str, marks: Optional[int] = None, board: str = "CBSE") -> str:
        """Format answer according to exam marking scheme"""
        formatted = content
        
        # Add mark allocation if provided
        if marks:
            formatted = f"**Marks: {marks}**\n\n" + formatted
        
        # Add board-specific formatting
        if board == "CBSE":
            formatted = self._apply_cbse_formatting(formatted)
        elif board == "ICSE":
            formatted = self._apply_icse_formatting(formatted)
        elif board == "State Board":
            formatted = self._apply_state_board_formatting(formatted)
        
        # Add neat presentation elements
        formatted = self._add_presentation_elements(formatted)
        
        return formatted
    
    def _apply_cbse_formatting(self, content: str) -> str:
        """Apply CBSE-specific formatting"""
        # CBSE prefers structured, point-wise answers
        formatted = content
        
        # Add CBSE-style headers
        formatted = formatted.replace("**Given:**", "**Given:**")
        formatted = formatted.replace("**Solution:**", "**Solution:**")
        formatted = formatted.replace("**Answer:**", "**Answer:**")
        
        return formatted
    
    def _apply_icse_formatting(self, content: str) -> str:
        """Apply ICSE-specific formatting"""
        # ICSE prefers detailed, explanatory answers
        formatted = content
        
        # Add ICSE-style detailed explanations
        if "**Explanation:**" not in formatted:
            formatted = formatted.replace("**Solution:**", "**Detailed Solution:**")
        
        return formatted
    
    def _apply_state_board_formatting(self, content: str) -> str:
        """Apply State Board-specific formatting"""
        # State boards prefer simple, clear answers
        formatted = content
        
        # Simplify language for state boards
        formatted = formatted.replace("**Given:**", "**दिया गया है:**")
        formatted = formatted.replace("**Solution:**", "**हल:**")
        formatted = formatted.replace("**Answer:**", "**उत्तर:**")
        
        return formatted
    
    def _add_presentation_elements(self, content: str) -> str:
        """Add neat presentation elements"""
        formatted = content
        
        # Add proper spacing
        formatted = re.sub(r'\n{3,}', '\n\n', formatted)
        
        # Add bullet points where appropriate
        formatted = re.sub(r'(\d+\.\s*)([^•\n]+)', r'\1• \2', formatted)
        
        # Ensure proper capitalization
        formatted = re.sub(r'(\*\*[^*]+:\*\*)', lambda m: m.group(1).title(), formatted)
        
        return formatted
    
    def _add_hindi_terms(self, content: str, subject: str) -> str:
        """Add Hindi terms where appropriate"""
        if subject in self.hindi_terms:
            hindi_dict = self.hindi_terms[subject]
            
            for english, hindi in hindi_dict.items():
                # Add Hindi terms in parentheses
                content = re.sub(
                    rf'\b{english}\b',
                    f'{english} ({hindi})',
                    content,
                    flags=re.IGNORECASE
                )
        
        return content
    
    def _estimate_marks(self, content: str, subject: str, question_type: str) -> int:
        """Estimate marks based on content length and complexity"""
        base_marks = 2
        
        # Add marks based on content length
        word_count = len(content.split())
        if word_count > 100:
            base_marks += 1
        if word_count > 200:
            base_marks += 1
        
        # Add marks based on subject complexity
        if subject == "Mathematics" and "calculation" in question_type:
            base_marks += 1
        elif subject in ["Physics", "Chemistry"] and "numerical" in question_type:
            base_marks += 1
        
        # Add marks for structured format
        if "**Given:**" in content and "**Solution:**" in content:
            base_marks += 1
        
        return min(base_marks, 5)  # Cap at 5 marks
    
    def _get_applied_formatting(self, subject: str, question_type: str) -> List[str]:
        """Get list of formatting applied"""
        formatting = ["structured_format", "subject_specific"]
        
        if subject == "Mathematics":
            formatting.extend(["numbered_steps", "proper_working"])
        elif subject in ["Physics", "Chemistry", "Biology"]:
            formatting.extend(["definitions", "examples"])
        
        if question_type in ["problem_solving", "numerical"]:
            formatting.append("step_by_step")
        
        return formatting
