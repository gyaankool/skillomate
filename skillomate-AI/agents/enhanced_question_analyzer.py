import openai
import os
import json
import logging
import re
from typing import Dict, Any, List, Optional, Tuple
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class EnhancedQuestionAnalyzer:
    """
    Enhanced Question Analyzer
    Analyzes questions to determine type, complexity, and appropriate response strategy
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required but not found")
        
        self.client = openai.OpenAI(api_key=self.openai_api_key)
        
        # Question type patterns
        self.question_patterns = {
            "mathematical": [
                r'\b(solve|calculate|find|compute|evaluate|simplify|factor|expand|derive|integrate|differentiate)\b',
                r'[\+\-\*\/\=\<\>\(\)\[\]\{\}]',
                r'\b(equation|formula|theorem|proof|problem)\b',
                r'\d+[\+\-\*\/]\d+',
                r'\b(percentage|fraction|decimal|ratio|proportion)\b'
            ],
            "conceptual": [
                r'\b(explain|describe|define|what is|how does|why does|compare|contrast|analyze)\b',
                r'\b(concept|theory|principle|mechanism|process|system)\b',
                r'\b(understand|meaning|significance|importance|role)\b'
            ],
            "factual": [
                r'\b(when|where|who|what year|which|how many|how much)\b',
                r'\b(date|year|place|person|number|amount|quantity)\b',
                r'\b(fact|information|data|statistic|figure)\b'
            ],
            "analytical": [
                r'\b(analyze|evaluate|assess|examine|investigate|study)\b',
                r'\b(cause|effect|relationship|correlation|impact|influence)\b',
                r'\b(argument|opinion|perspective|viewpoint|position)\b'
            ],
            "creative": [
                r'\b(imagine|create|design|develop|invent|suggest|propose)\b',
                r'\b(story|essay|poem|drawing|model|project)\b',
                r'\b(creative|original|unique|innovative)\b'
            ],
            "practical": [
                r'\b(how to|steps|procedure|method|technique|approach)\b',
                r'\b(apply|implement|use|practice|demonstrate)\b',
                r'\b(real-world|practical|application|example)\b'
            ]
        }
        
        # Complexity indicators
        self.complexity_indicators = {
            "basic": [
                r'\b(simple|basic|easy|fundamental|elementary)\b',
                r'\b(what is|define|explain|describe)\b',
                r'\b(one|single|first|basic)\b'
            ],
            "intermediate": [
                r'\b(compare|contrast|analyze|evaluate)\b',
                r'\b(relationship|connection|difference|similarity)\b',
                r'\b(example|case|scenario|situation)\b'
            ],
            "advanced": [
                r'\b(synthesize|evaluate|critique|assess)\b',
                r'\b(theory|hypothesis|research|study)\b',
                r'\b(complex|advanced|sophisticated|detailed)\b'
            ]
        }
    
    def analyze_question(self, question: str, user_context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Comprehensive question analysis
        """
        try:
            # Basic pattern analysis
            pattern_analysis = self._analyze_patterns(question)
            
            # AI-powered analysis
            ai_analysis = self._ai_analyze_question(question, user_context)
            
            # Combine analyses
            combined_analysis = self._combine_analyses(pattern_analysis, ai_analysis)
            
            # Determine response strategy
            response_strategy = self._determine_response_strategy(combined_analysis)
            
            return {
                "success": True,
                "question_type": combined_analysis["primary_type"],
                "complexity": combined_analysis["complexity"],
                "subject": combined_analysis["subject"],
                "topics": combined_analysis["topics"],
                "response_strategy": response_strategy,
                "confidence": combined_analysis["confidence"],
                "analysis_details": combined_analysis
            }
            
        except Exception as e:
            logger.error(f"Error in question analysis: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "question_type": "general",
                "complexity": "intermediate",
                "subject": "General",
                "response_strategy": "comprehensive"
            }
    
    def _analyze_patterns(self, question: str) -> Dict[str, Any]:
        """Analyze question using pattern matching"""
        question_lower = question.lower()
        
        # Analyze question types
        type_scores = {}
        for qtype, patterns in self.question_patterns.items():
            score = 0
            for pattern in patterns:
                matches = re.findall(pattern, question_lower)
                score += len(matches)
            type_scores[qtype] = score
        
        # Analyze complexity
        complexity_scores = {}
        for complexity, patterns in self.complexity_indicators.items():
            score = 0
            for pattern in patterns:
                matches = re.findall(pattern, question_lower)
                score += len(matches)
            complexity_scores[complexity] = score
        
        # Determine primary type and complexity
        primary_type = max(type_scores, key=type_scores.get) if any(type_scores.values()) else "general"
        complexity = max(complexity_scores, key=complexity_scores.get) if any(complexity_scores.values()) else "intermediate"
        
        return {
            "type_scores": type_scores,
            "complexity_scores": complexity_scores,
            "primary_type": primary_type,
            "complexity": complexity
        }
    
    def _ai_analyze_question(self, question: str, user_context: Optional[Dict] = None) -> Dict[str, Any]:
        """Use AI to analyze question comprehensively"""
        try:
            system_prompt = """You are an expert educational question analyzer. Analyze the given question and provide detailed insights.

Analyze the question for:
1. Question type (mathematical, conceptual, factual, analytical, creative, practical, conversational, identity, greeting)
2. Subject area (Mathematics, Science, English, History, Geography, etc.)
3. Complexity level (basic, intermediate, advanced)
4. Key topics/concepts involved
5. Required skills (calculation, analysis, creativity, etc.)
6. Appropriate response style (direct, explanatory, step-by-step, conversational, etc.)

Respond with ONLY a valid JSON object:
{
    "question_type": "detected_type",
    "subject": "detected_subject",
    "complexity": "basic|intermediate|advanced",
    "topics": ["topic1", "topic2"],
    "skills_required": ["skill1", "skill2"],
    "response_style": "appropriate_style",
    "confidence": 0.9
}"""

            context_info = f"User Context: {user_context}" if user_context else "No user context provided"
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Question: {question}\n{context_info}"}
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            response_content = response.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                analysis = json.loads(response_content)
            except json.JSONDecodeError:
                # Fallback parsing
                import re
                json_match = re.search(r'\{.*\}', response_content, re.DOTALL)
                if json_match:
                    analysis = json.loads(json_match.group())
                else:
                    analysis = {
                        "question_type": "general",
                        "subject": "General",
                        "complexity": "intermediate",
                        "topics": [],
                        "skills_required": [],
                        "response_style": "comprehensive",
                        "confidence": 0.5
                    }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}")
            return {
                "question_type": "general",
                "subject": "General",
                "complexity": "intermediate",
                "topics": [],
                "skills_required": [],
                "response_style": "comprehensive",
                "confidence": 0.5
            }
    
    def _combine_analyses(self, pattern_analysis: Dict, ai_analysis: Dict) -> Dict[str, Any]:
        """Combine pattern and AI analyses"""
        # Weight AI analysis more heavily
        combined = {
            "primary_type": ai_analysis.get("question_type", pattern_analysis["primary_type"]),
            "complexity": ai_analysis.get("complexity", pattern_analysis["complexity"]),
            "subject": ai_analysis.get("subject", "General"),
            "topics": ai_analysis.get("topics", []),
            "skills_required": ai_analysis.get("skills_required", []),
            "response_style": ai_analysis.get("response_style", "comprehensive"),
            "confidence": ai_analysis.get("confidence", 0.7),
            "pattern_analysis": pattern_analysis,
            "ai_analysis": ai_analysis
        }
        
        return combined
    
    def _determine_response_strategy(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Determine the best response strategy based on analysis"""
        question_type = analysis["primary_type"]
        complexity = analysis["complexity"]
        subject = analysis["subject"]
        
        strategies = {
            "mathematical": {
                "basic": "step_by_step",
                "intermediate": "detailed_explanation",
                "advanced": "comprehensive_analysis"
            },
            "conceptual": {
                "basic": "simple_explanation",
                "intermediate": "detailed_explanation",
                "advanced": "comprehensive_analysis"
            },
            "factual": {
                "basic": "direct_answer",
                "intermediate": "detailed_answer",
                "advanced": "comprehensive_answer"
            },
            "analytical": {
                "basic": "guided_analysis",
                "intermediate": "detailed_analysis",
                "advanced": "comprehensive_analysis"
            },
            "creative": {
                "basic": "creative_guidance",
                "intermediate": "creative_framework",
                "advanced": "creative_collaboration"
            },
            "practical": {
                "basic": "step_by_step",
                "intermediate": "detailed_procedure",
                "advanced": "comprehensive_guide"
            },
            "conversational": {
                "basic": "friendly_response",
                "intermediate": "engaging_response",
                "advanced": "detailed_conversation"
            },
            "identity": {
                "basic": "personal_response",
                "intermediate": "detailed_personal",
                "advanced": "comprehensive_personal"
            },
            "greeting": {
                "basic": "friendly_greeting",
                "intermediate": "engaging_greeting",
                "advanced": "detailed_greeting"
            }
        }
        
        strategy = strategies.get(question_type, {}).get(complexity, "comprehensive")
        
        return {
            "strategy": strategy,
            "question_type": question_type,
            "complexity": complexity,
            "subject": subject,
            "requires_context": question_type in ["conversational", "identity", "greeting"],
            "requires_examples": question_type in ["conceptual", "practical", "creative"],
            "requires_steps": question_type in ["mathematical", "practical"],
            "requires_analysis": question_type in ["analytical", "conceptual"]
        }
    
    def is_conversational_question(self, question: str) -> bool:
        """Check if question is conversational in nature"""
        conversational_patterns = [
            r'\b(hi|hello|hey|greetings|namaste)\b',
            r'\b(who am i|what is my name|do you know me)\b',
            r'\b(how are you|how do you do|what\'s up)\b',
            r'\b(thank you|thanks|goodbye|bye)\b',
            r'\b(tell me about yourself|what can you do)\b'
        ]
        
        question_lower = question.lower()
        return any(re.search(pattern, question_lower) for pattern in conversational_patterns)
    
    def is_identity_question(self, question: str) -> bool:
        """Check if question is about identity"""
        identity_patterns = [
            r'\b(who am i|what is my name|do you know my name)\b',
            r'\b(what do you know about me|tell me about myself)\b',
            r'\b(remember me|do you remember)\b'
        ]
        
        question_lower = question.lower()
        return any(re.search(pattern, question_lower) for pattern in identity_patterns)
    
    def is_greeting(self, question: str) -> bool:
        """Check if question is a greeting"""
        greeting_patterns = [
            r'^(hi|hello|hey|greetings|namaste|sup|yo)',
            r'\b(good morning|good afternoon|good evening)\b',
            r'\b(how are you|how do you do|what\'s up)\b'
        ]
        
        question_lower = question.lower().strip()
        return any(re.search(pattern, question_lower) for pattern in greeting_patterns)
