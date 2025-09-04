import json
import hashlib
import sqlite3
import logging
import os
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import pickle
import gzip

logger = logging.getLogger(__name__)

class OfflineQuestionBank:
    """
    Manages pre-cached questions and responses for offline usage
    Provides comprehensive offline capability with pre-computed responses
    """
    
    def __init__(self, db_path: str = "data/offline_question_bank.db"):
        self.db_path = db_path
        self.question_categories = {
            "high_frequency": [],  # Most asked questions
            "exam_important": [],  # Previous year questions
            "concept_clearing": [], # Fundamental concepts
            "board_specific": {}   # Board-wise variations
        }
        
        # Ensure data directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        # Initialize database
        self._init_database()
        
        # Load question banks
        self._load_question_banks()
    
    def _init_database(self):
        """Initialize SQLite database for offline question bank"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create question_bank table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS question_bank (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    question_text TEXT NOT NULL,
                    question_hash VARCHAR(64) UNIQUE,
                    subject VARCHAR(50),
                    grade VARCHAR(20), 
                    board VARCHAR(30),
                    difficulty_level INTEGER,
                    topic VARCHAR(100),
                    category VARCHAR(50),
                    popularity_score INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create pre_cached_responses table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS pre_cached_responses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    question_hash VARCHAR(64) UNIQUE,
                    formatted_response TEXT,
                    raw_response TEXT,
                    diagrams JSON,
                    related_questions TEXT,
                    metadata JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (question_hash) REFERENCES question_bank(question_hash)
                )
            ''')
            
            # Create offline_sync_status table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS offline_sync_status (
                    grade VARCHAR(20),
                    subject VARCHAR(50), 
                    board VARCHAR(30),
                    total_questions INTEGER DEFAULT 0,
                    cached_responses INTEGER DEFAULT 0,
                    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    sync_status VARCHAR(20) DEFAULT 'pending',
                    PRIMARY KEY(grade, subject, board)
                )
            ''')
            
            # Create usage_analytics table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS usage_analytics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    question_hash VARCHAR(64),
                    access_count INTEGER DEFAULT 1,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_feedback INTEGER DEFAULT 0,
                    FOREIGN KEY (question_hash) REFERENCES question_bank(question_hash)
                )
            ''')
            
            conn.commit()
            conn.close()
            
            logger.info("Offline question bank database initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
    
    def _load_question_banks(self):
        """Load predefined question banks for different subjects and grades"""
        try:
            # Load from JSON files if they exist
            question_bank_path = "data/question_banks"
            if os.path.exists(question_bank_path):
                for filename in os.listdir(question_bank_path):
                    if filename.endswith('.json'):
                        file_path = os.path.join(question_bank_path, filename)
                        self._load_question_bank_from_file(file_path)
            
            # If no files exist, create default question banks
            if not self._has_questions():
                self._create_default_question_banks()
                
        except Exception as e:
            logger.error(f"Error loading question banks: {str(e)}")
    
    def _load_question_bank_from_file(self, file_path: str):
        """Load question bank from JSON file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            for question_data in data.get('questions', []):
                self._add_question_to_bank(question_data)
                
        except Exception as e:
            logger.error(f"Error loading question bank from {file_path}: {str(e)}")
    
    def _create_default_question_banks(self):
        """Create default question banks for common subjects"""
        default_questions = {
            "Mathematics": {
                "Class 8": [
                    {
                        "question": "What is the area of a rectangle with length 8 cm and breadth 6 cm?",
                        "topic": "area",
                        "difficulty": 1,
                        "category": "basic"
                    },
                    {
                        "question": "Solve: 2x + 5 = 15",
                        "topic": "linear_equations",
                        "difficulty": 2,
                        "category": "problem_solving"
                    },
                    {
                        "question": "Find the perimeter of a square with side 5 cm",
                        "topic": "perimeter",
                        "difficulty": 1,
                        "category": "basic"
                    }
                ],
                "Class 9": [
                    {
                        "question": "Find the value of x in the equation 3x - 7 = 8",
                        "topic": "linear_equations",
                        "difficulty": 2,
                        "category": "problem_solving"
                    },
                    {
                        "question": "Calculate the area of a circle with radius 7 cm",
                        "topic": "area_circle",
                        "difficulty": 2,
                        "category": "geometry"
                    }
                ]
            },
            "Science": {
                "Class 8": [
                    {
                        "question": "What is photosynthesis?",
                        "topic": "photosynthesis",
                        "difficulty": 1,
                        "category": "concept"
                    },
                    {
                        "question": "Define force and its SI unit",
                        "topic": "force",
                        "difficulty": 1,
                        "category": "definition"
                    }
                ]
            },
            "English": {
                "Class 8": [
                    {
                        "question": "What are the parts of speech?",
                        "topic": "grammar",
                        "difficulty": 1,
                        "category": "concept"
                    },
                    {
                        "question": "Explain the difference between a noun and a pronoun",
                        "topic": "grammar",
                        "difficulty": 2,
                        "category": "comparison"
                    }
                ]
            }
        }
        
        for subject, grades in default_questions.items():
            for grade, questions in grades.items():
                for question_data in questions:
                    question_data["subject"] = subject
                    question_data["grade"] = grade
                    question_data["board"] = "CBSE"
                    self._add_question_to_bank(question_data)
    
    def _add_question_to_bank(self, question_data: Dict[str, Any]):
        """Add a question to the question bank"""
        try:
            question_text = question_data["question"]
            question_hash = self._generate_question_hash(question_text)
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if question already exists
            cursor.execute("SELECT id FROM question_bank WHERE question_hash = ?", (question_hash,))
            if cursor.fetchone():
                return  # Question already exists
            
            # Insert question
            cursor.execute('''
                INSERT INTO question_bank 
                (question_text, question_hash, subject, grade, board, difficulty_level, topic, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                question_text,
                question_hash,
                question_data.get("subject", "General"),
                question_data.get("grade", "Class 8"),
                question_data.get("board", "CBSE"),
                question_data.get("difficulty", 1),
                question_data.get("topic", "general"),
                question_data.get("category", "basic")
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error adding question to bank: {str(e)}")
    
    def generate_question_bank(self, grade: str, subject: str, board: str) -> Dict[str, Any]:
        """Generate comprehensive question bank for offline use"""
        try:
            # Get questions from database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT question_text, topic, difficulty_level, category, popularity_score
                FROM question_bank 
                WHERE grade = ? AND subject = ? AND board = ?
                ORDER BY popularity_score DESC, difficulty_level ASC
            ''', (grade, subject, board))
            
            questions = cursor.fetchall()
            conn.close()
            
            # Organize questions by category
            organized_questions = {
                "basic_concepts": [],
                "problem_solving": [],
                "advanced_topics": [],
                "exam_preparation": []
            }
            
            for question in questions:
                question_text, topic, difficulty, category, popularity = question
                
                if difficulty == 1:
                    organized_questions["basic_concepts"].append({
                        "question": question_text,
                        "topic": topic,
                        "difficulty": difficulty,
                        "popularity": popularity
                    })
                elif difficulty == 2:
                    organized_questions["problem_solving"].append({
                        "question": question_text,
                        "topic": topic,
                        "difficulty": difficulty,
                        "popularity": popularity
                    })
                else:
                    organized_questions["advanced_topics"].append({
                        "question": question_text,
                        "topic": topic,
                        "difficulty": difficulty,
                        "popularity": popularity
                    })
            
            return {
                "grade": grade,
                "subject": subject,
                "board": board,
                "total_questions": len(questions),
                "categories": organized_questions,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating question bank: {str(e)}")
            return {"error": str(e)}
    
    def cache_responses_bulk(self, questions_list: List[Dict[str, Any]]) -> bool:
        """Pre-compute and cache responses for question list"""
        try:
            success_count = 0
            
            for question_data in questions_list:
                question_text = question_data.get("question", "")
                if not question_text:
                    continue
                
                # Generate response using AI (this would be called from the main AI service)
                # For now, we'll create a placeholder response
                response_data = self._generate_placeholder_response(question_data)
                
                # Cache the response
                if self._cache_response(question_text, response_data):
                    success_count += 1
            
            logger.info(f"Successfully cached {success_count}/{len(questions_list)} responses")
            return success_count > 0
            
        except Exception as e:
            logger.error(f"Error caching responses bulk: {str(e)}")
            return False
    
    def _generate_placeholder_response(self, question_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate placeholder response for caching"""
        # This would normally call the AI service
        # For now, return a structured placeholder
        return {
            "formatted_response": f"Answer to: {question_data.get('question', '')}",
            "raw_response": f"Raw answer for: {question_data.get('question', '')}",
            "diagrams": [],
            "related_questions": [],
            "metadata": {
                "subject": question_data.get("subject", "General"),
                "grade": question_data.get("grade", "Class 8"),
                "board": question_data.get("board", "CBSE"),
                "topic": question_data.get("topic", "general"),
                "difficulty": question_data.get("difficulty", 1)
            }
        }
    
    def _cache_response(self, question_text: str, response_data: Dict[str, Any]) -> bool:
        """Cache a single response"""
        try:
            question_hash = self._generate_question_hash(question_text)
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if response already exists
            cursor.execute("SELECT id FROM pre_cached_responses WHERE question_hash = ?", (question_hash,))
            existing = cursor.fetchone()
            
            if existing:
                # Update existing response
                cursor.execute('''
                    UPDATE pre_cached_responses 
                    SET formatted_response = ?, raw_response = ?, diagrams = ?, 
                        related_questions = ?, metadata = ?, last_updated = CURRENT_TIMESTAMP
                    WHERE question_hash = ?
                ''', (
                    response_data.get("formatted_response", ""),
                    response_data.get("raw_response", ""),
                    json.dumps(response_data.get("diagrams", [])),
                    json.dumps(response_data.get("related_questions", [])),
                    json.dumps(response_data.get("metadata", {})),
                    question_hash
                ))
            else:
                # Insert new response
                cursor.execute('''
                    INSERT INTO pre_cached_responses 
                    (question_hash, formatted_response, raw_response, diagrams, related_questions, metadata)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    question_hash,
                    response_data.get("formatted_response", ""),
                    response_data.get("raw_response", ""),
                    json.dumps(response_data.get("diagrams", [])),
                    json.dumps(response_data.get("related_questions", [])),
                    json.dumps(response_data.get("metadata", {}))
                ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Error caching response: {str(e)}")
            return False
    
    def get_offline_response(self, question_hash: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached response for offline use"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT formatted_response, raw_response, diagrams, related_questions, metadata
                FROM pre_cached_responses 
                WHERE question_hash = ?
            ''', (question_hash,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                formatted_response, raw_response, diagrams_json, related_questions_json, metadata_json = result
                
                # Update access count
                self._update_access_count(question_hash)
                
                return {
                    "success": True,
                    "formatted_response": formatted_response,
                    "raw_response": raw_response,
                    "diagrams": json.loads(diagrams_json) if diagrams_json else [],
                    "related_questions": json.loads(related_questions_json) if related_questions_json else [],
                    "metadata": json.loads(metadata_json) if metadata_json else {},
                    "source": "offline_cache"
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving offline response: {str(e)}")
            return None
    
    def _update_access_count(self, question_hash: str):
        """Update access count for analytics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO usage_analytics (question_hash, access_count, last_accessed)
                VALUES (?, 
                    COALESCE((SELECT access_count FROM usage_analytics WHERE question_hash = ?), 0) + 1,
                    CURRENT_TIMESTAMP)
            ''', (question_hash, question_hash))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error updating access count: {str(e)}")
    
    def update_popularity_scores(self, question_patterns: Dict[str, int]) -> None:
        """Update question priority based on usage patterns"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for question_hash, popularity in question_patterns.items():
                cursor.execute('''
                    UPDATE question_bank 
                    SET popularity_score = popularity_score + ?
                    WHERE question_hash = ?
                ''', (popularity, question_hash))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error updating popularity scores: {str(e)}")
    
    def get_sync_status(self, grade: str, subject: str, board: str) -> Dict[str, Any]:
        """Get sync status for a specific grade, subject, and board"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT total_questions, cached_responses, last_sync, sync_status
                FROM offline_sync_status 
                WHERE grade = ? AND subject = ? AND board = ?
            ''', (grade, subject, board))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                total_questions, cached_responses, last_sync, sync_status = result
                return {
                    "grade": grade,
                    "subject": subject,
                    "board": board,
                    "total_questions": total_questions,
                    "cached_responses": cached_responses,
                    "coverage_percentage": (cached_responses / total_questions * 100) if total_questions > 0 else 0,
                    "last_sync": last_sync,
                    "sync_status": sync_status
                }
            
            return {
                "grade": grade,
                "subject": subject,
                "board": board,
                "total_questions": 0,
                "cached_responses": 0,
                "coverage_percentage": 0,
                "last_sync": None,
                "sync_status": "not_synced"
            }
            
        except Exception as e:
            logger.error(f"Error getting sync status: {str(e)}")
            return {"error": str(e)}
    
    def get_popular_questions(self, grade: str, subject: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most popular questions for a grade and subject"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT qb.question_text, qb.topic, qb.difficulty_level, 
                       COALESCE(ua.access_count, 0) as access_count
                FROM question_bank qb
                LEFT JOIN usage_analytics ua ON qb.question_hash = ua.question_hash
                WHERE qb.grade = ? AND qb.subject = ?
                ORDER BY access_count DESC, qb.popularity_score DESC
                LIMIT ?
            ''', (grade, subject, limit))
            
            results = cursor.fetchall()
            conn.close()
            
            popular_questions = []
            for result in results:
                question_text, topic, difficulty, access_count = result
                popular_questions.append({
                    "question": question_text,
                    "topic": topic,
                    "difficulty": difficulty,
                    "access_count": access_count
                })
            
            return popular_questions
            
        except Exception as e:
            logger.error(f"Error getting popular questions: {str(e)}")
            return []
    
    def search_offline_questions(self, query: str, grade: str = None, subject: str = None) -> List[Dict[str, Any]]:
        """Search questions in offline database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Build search query
            search_query = '''
                SELECT question_text, subject, grade, topic, difficulty_level, popularity_score
                FROM question_bank 
                WHERE question_text LIKE ?
            '''
            params = [f"%{query}%"]
            
            if grade:
                search_query += " AND grade = ?"
                params.append(grade)
            
            if subject:
                search_query += " AND subject = ?"
                params.append(subject)
            
            search_query += " ORDER BY popularity_score DESC LIMIT 20"
            
            cursor.execute(search_query, params)
            results = cursor.fetchall()
            conn.close()
            
            search_results = []
            for result in results:
                question_text, subject, grade, topic, difficulty, popularity = result
                search_results.append({
                    "question": question_text,
                    "subject": subject,
                    "grade": grade,
                    "topic": topic,
                    "difficulty": difficulty,
                    "popularity": popularity
                })
            
            return search_results
            
        except Exception as e:
            logger.error(f"Error searching offline questions: {str(e)}")
            return []
    
    def _generate_question_hash(self, question_text: str) -> str:
        """Generate hash for question text"""
        return hashlib.sha256(question_text.encode('utf-8')).hexdigest()
    
    def _has_questions(self) -> bool:
        """Check if database has any questions"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM question_bank")
            count = cursor.fetchone()[0]
            conn.close()
            return count > 0
        except Exception as e:
            logger.error(f"Error checking question count: {str(e)}")
            return False
    
    def export_question_bank(self, grade: str, subject: str, board: str, format: str = "json") -> str:
        """Export question bank to file"""
        try:
            question_bank = self.generate_question_bank(grade, subject, board)
            
            if format == "json":
                filename = f"question_bank_{grade}_{subject}_{board}_{datetime.now().strftime('%Y%m%d')}.json"
                filepath = os.path.join("data/exports", filename)
                
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(question_bank, f, indent=2, ensure_ascii=False)
                
                return filepath
            
            return None
            
        except Exception as e:
            logger.error(f"Error exporting question bank: {str(e)}")
            return None
    
    def get_analytics(self, grade: str = None, subject: str = None) -> Dict[str, Any]:
        """Get analytics for question bank usage"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Build analytics query
            analytics_query = '''
                SELECT 
                    COUNT(DISTINCT qb.question_hash) as total_questions,
                    COUNT(DISTINCT pcr.question_hash) as cached_responses,
                    AVG(COALESCE(ua.access_count, 0)) as avg_access_count,
                    MAX(ua.last_accessed) as last_accessed
                FROM question_bank qb
                LEFT JOIN pre_cached_responses pcr ON qb.question_hash = pcr.question_hash
                LEFT JOIN usage_analytics ua ON qb.question_hash = ua.question_hash
            '''
            
            params = []
            if grade:
                analytics_query += " WHERE qb.grade = ?"
                params.append(grade)
            
            if subject:
                analytics_query += " AND qb.subject = ?" if grade else " WHERE qb.subject = ?"
                params.append(subject)
            
            cursor.execute(analytics_query, params)
            result = cursor.fetchone()
            conn.close()
            
            if result:
                total_questions, cached_responses, avg_access, last_accessed = result
                return {
                    "total_questions": total_questions,
                    "cached_responses": cached_responses,
                    "coverage_percentage": (cached_responses / total_questions * 100) if total_questions > 0 else 0,
                    "average_access_count": round(avg_access, 2) if avg_access else 0,
                    "last_accessed": last_accessed
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Error getting analytics: {str(e)}")
            return {}
