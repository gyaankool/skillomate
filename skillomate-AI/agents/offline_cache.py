import sqlite3
import json
import os
import logging
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import pickle

logger = logging.getLogger(__name__)

class OfflineCacheAgent:
    """
    Agent 5: Offline Cache Agent
    Stores/retrieves Q&A locally in JSON/SQLite for low-data use.
    """
    
    def __init__(self, cache_dir: str = "cache"):
        self.cache_dir = cache_dir
        self.db_path = os.path.join(cache_dir, "skillomate_cache.db")
        self.json_cache_path = os.path.join(cache_dir, "qa_cache.json")
        self.diagram_cache_path = os.path.join(cache_dir, "diagram_cache")
        
        # Create cache directory if it doesn't exist
        os.makedirs(cache_dir, exist_ok=True)
        os.makedirs(self.diagram_cache_path, exist_ok=True)
        
        # Initialize database
        self._init_database()
        self._load_json_cache()
    
    def _init_database(self):
        """Initialize SQLite database for caching"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create tables
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS qa_cache (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    question_hash TEXT UNIQUE NOT NULL,
                    question TEXT NOT NULL,
                    answer TEXT NOT NULL,
                    subject TEXT,
                    grade TEXT,
                    board TEXT,
                    context TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    access_count INTEGER DEFAULT 1,
                    is_offline_ready BOOLEAN DEFAULT 1
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS diagram_cache (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    diagram_hash TEXT UNIQUE NOT NULL,
                    diagram_type TEXT NOT NULL,
                    subject TEXT,
                    grade TEXT,
                    image_data TEXT,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS syllabus_cache (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    subject TEXT NOT NULL,
                    grade TEXT NOT NULL,
                    board TEXT NOT NULL,
                    topic TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(subject, grade, board, topic)
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
    
    def _load_json_cache(self):
        """Load JSON cache file"""
        try:
            if os.path.exists(self.json_cache_path):
                with open(self.json_cache_path, 'r', encoding='utf-8') as f:
                    self.json_cache = json.load(f)
            else:
                self.json_cache = {
                    "qa_entries": {},
                    "diagram_entries": {},
                    "syllabus_entries": {},
                    "metadata": {
                        "created_at": datetime.now().isoformat(),
                        "last_updated": datetime.now().isoformat(),
                        "total_entries": 0
                    }
                }
                self._save_json_cache()
                
        except Exception as e:
            logger.error(f"Error loading JSON cache: {str(e)}")
            self.json_cache = {"qa_entries": {}, "diagram_entries": {}, "syllabus_entries": {}, "metadata": {}}
    
    def _save_json_cache(self):
        """Save JSON cache to file"""
        try:
            self.json_cache["metadata"]["last_updated"] = datetime.now().isoformat()
            self.json_cache["metadata"]["total_entries"] = (
                len(self.json_cache["qa_entries"]) + 
                len(self.json_cache["diagram_entries"]) + 
                len(self.json_cache["syllabus_entries"])
            )
            
            with open(self.json_cache_path, 'w', encoding='utf-8') as f:
                json.dump(self.json_cache, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            logger.error(f"Error saving JSON cache: {str(e)}")
    
    def _generate_hash(self, content: str) -> str:
        """Generate hash for content"""
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    def cache_qa(self, question: str, answer: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cache a question-answer pair
        """
        try:
            question_hash = self._generate_hash(question)
            
            # Prepare data
            qa_data = {
                "question": question,
                "answer": answer,
                "subject": context.get("subject", "General"),
                "grade": context.get("grade", "8"),
                "board": context.get("board", "CBSE"),
                "context": json.dumps(context),
                "created_at": datetime.now().isoformat(),
                "last_accessed": datetime.now().isoformat(),
                "access_count": 1,
                "is_offline_ready": True
            }
            
            # Cache in SQLite
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO qa_cache 
                (question_hash, question, answer, subject, grade, board, context, 
                 created_at, last_accessed, access_count, is_offline_ready)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                question_hash, qa_data["question"], qa_data["answer"], 
                qa_data["subject"], qa_data["grade"], qa_data["board"], 
                qa_data["context"], qa_data["created_at"], qa_data["last_accessed"],
                qa_data["access_count"], qa_data["is_offline_ready"]
            ))
            
            conn.commit()
            conn.close()
            
            # Cache in JSON
            self.json_cache["qa_entries"][question_hash] = qa_data
            self._save_json_cache()
            
            return {
                "success": True,
                "cached": True,
                "hash": question_hash,
                "message": "QA pair cached successfully"
            }
            
        except Exception as e:
            logger.error(f"Error caching QA: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "cached": False
            }
    
    def retrieve_qa(self, question: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Retrieve cached answer for a question
        """
        try:
            question_hash = self._generate_hash(question)
            
            # Try SQLite first
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT question, answer, subject, grade, board, context, 
                       created_at, last_accessed, access_count
                FROM qa_cache 
                WHERE question_hash = ?
            ''', (question_hash,))
            
            result = cursor.fetchone()
            
            if result:
                # Update access count and timestamp
                cursor.execute('''
                    UPDATE qa_cache 
                    SET last_accessed = CURRENT_TIMESTAMP, access_count = access_count + 1
                    WHERE question_hash = ?
                ''', (question_hash,))
                
                conn.commit()
                conn.close()
                
                return {
                    "success": True,
                    "found": True,
                    "answer": result[1],
                    "metadata": {
                        "subject": result[2],
                        "grade": result[3],
                        "board": result[4],
                        "context": json.loads(result[5]) if result[5] else {},
                        "created_at": result[6],
                        "last_accessed": result[7],
                        "access_count": result[8]
                    }
                }
            
            conn.close()
            
            # Try JSON cache as fallback
            if question_hash in self.json_cache["qa_entries"]:
                qa_data = self.json_cache["qa_entries"][question_hash]
                qa_data["last_accessed"] = datetime.now().isoformat()
                qa_data["access_count"] += 1
                self._save_json_cache()
                
                return {
                    "success": True,
                    "found": True,
                    "answer": qa_data["answer"],
                    "metadata": {
                        "subject": qa_data["subject"],
                        "grade": qa_data["grade"],
                        "board": qa_data["board"],
                        "context": json.loads(qa_data["context"]) if qa_data["context"] else {},
                        "created_at": qa_data["created_at"],
                        "last_accessed": qa_data["last_accessed"],
                        "access_count": qa_data["access_count"]
                    }
                }
            
            return {
                "success": True,
                "found": False,
                "message": "Question not found in cache"
            }
            
        except Exception as e:
            logger.error(f"Error retrieving QA: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "found": False
            }
    
    def cache_diagram(self, diagram_type: str, subject: str, context: Dict[str, Any], 
                     image_data: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cache a diagram
        """
        try:
            diagram_hash = self._generate_hash(f"{diagram_type}_{subject}_{context.get('grade', '8')}")
            
            # Cache in SQLite
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO diagram_cache 
                (diagram_hash, diagram_type, subject, grade, image_data, metadata, 
                 created_at, last_accessed)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ''', (
                diagram_hash, diagram_type, subject, context.get("grade", "8"),
                image_data, json.dumps(metadata)
            ))
            
            conn.commit()
            conn.close()
            
            # Cache in JSON
            self.json_cache["diagram_entries"][diagram_hash] = {
                "diagram_type": diagram_type,
                "subject": subject,
                "grade": context.get("grade", "8"),
                "image_data": image_data,
                "metadata": metadata,
                "created_at": datetime.now().isoformat(),
                "last_accessed": datetime.now().isoformat()
            }
            self._save_json_cache()
            
            return {
                "success": True,
                "cached": True,
                "hash": diagram_hash,
                "message": "Diagram cached successfully"
            }
            
        except Exception as e:
            logger.error(f"Error caching diagram: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "cached": False
            }
    
    def retrieve_diagram(self, diagram_type: str, subject: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Retrieve cached diagram
        """
        try:
            diagram_hash = self._generate_hash(f"{diagram_type}_{subject}_{context.get('grade', '8')}")
            
            # Try SQLite first
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT image_data, metadata, created_at, last_accessed
                FROM diagram_cache 
                WHERE diagram_hash = ?
            ''', (diagram_hash,))
            
            result = cursor.fetchone()
            
            if result:
                # Update access timestamp
                cursor.execute('''
                    UPDATE diagram_cache 
                    SET last_accessed = CURRENT_TIMESTAMP
                    WHERE diagram_hash = ?
                ''', (diagram_hash,))
                
                conn.commit()
                conn.close()
                
                return {
                    "success": True,
                    "found": True,
                    "image_data": result[0],
                    "metadata": json.loads(result[1]) if result[1] else {},
                    "created_at": result[2],
                    "last_accessed": result[3]
                }
            
            conn.close()
            
            # Try JSON cache as fallback
            if diagram_hash in self.json_cache["diagram_entries"]:
                diagram_data = self.json_cache["diagram_entries"][diagram_hash]
                diagram_data["last_accessed"] = datetime.now().isoformat()
                self._save_json_cache()
                
                return {
                    "success": True,
                    "found": True,
                    "image_data": diagram_data["image_data"],
                    "metadata": diagram_data["metadata"],
                    "created_at": diagram_data["created_at"],
                    "last_accessed": diagram_data["last_accessed"]
                }
            
            return {
                "success": True,
                "found": False,
                "message": "Diagram not found in cache"
            }
            
        except Exception as e:
            logger.error(f"Error retrieving diagram: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "found": False
            }
    
    def cache_syllabus_content(self, subject: str, grade: str, board: str, 
                             topic: str, content: str) -> Dict[str, Any]:
        """
        Cache syllabus content for offline access
        """
        try:
            # Cache in SQLite
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO syllabus_cache 
                (subject, grade, board, topic, content, created_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (subject, grade, board, topic, content))
            
            conn.commit()
            conn.close()
            
            # Cache in JSON
            key = f"{subject}_{grade}_{board}_{topic}"
            self.json_cache["syllabus_entries"][key] = {
                "subject": subject,
                "grade": grade,
                "board": board,
                "topic": topic,
                "content": content,
                "created_at": datetime.now().isoformat()
            }
            self._save_json_cache()
            
            return {
                "success": True,
                "cached": True,
                "key": key,
                "message": "Syllabus content cached successfully"
            }
            
        except Exception as e:
            logger.error(f"Error caching syllabus content: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "cached": False
            }
    
    def retrieve_syllabus_content(self, subject: str, grade: str, board: str, 
                                topic: str) -> Dict[str, Any]:
        """
        Retrieve cached syllabus content
        """
        try:
            # Try SQLite first
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT content, created_at
                FROM syllabus_cache 
                WHERE subject = ? AND grade = ? AND board = ? AND topic = ?
            ''', (subject, grade, board, topic))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return {
                    "success": True,
                    "found": True,
                    "content": result[0],
                    "created_at": result[1]
                }
            
            # Try JSON cache as fallback
            key = f"{subject}_{grade}_{board}_{topic}"
            if key in self.json_cache["syllabus_entries"]:
                syllabus_data = self.json_cache["syllabus_entries"][key]
                return {
                    "success": True,
                    "found": True,
                    "content": syllabus_data["content"],
                    "created_at": syllabus_data["created_at"]
                }
            
            return {
                "success": True,
                "found": False,
                "message": "Syllabus content not found in cache"
            }
            
        except Exception as e:
            logger.error(f"Error retrieving syllabus content: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "found": False
            }
    
    def search_cache(self, query: str, subject: Optional[str] = None, 
                    grade: Optional[str] = None) -> Dict[str, Any]:
        """
        Search cached content
        """
        try:
            results = []
            
            # Search in SQLite
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            search_query = '''
                SELECT question, answer, subject, grade, board, created_at, access_count
                FROM qa_cache 
                WHERE question LIKE ? OR answer LIKE ?
            '''
            params = [f"%{query}%", f"%{query}%"]
            
            if subject:
                search_query += " AND subject = ?"
                params.append(subject)
            
            if grade:
                search_query += " AND grade = ?"
                params.append(grade)
            
            search_query += " ORDER BY access_count DESC, last_accessed DESC LIMIT 10"
            
            cursor.execute(search_query, params)
            
            for row in cursor.fetchall():
                results.append({
                    "question": row[0],
                    "answer": row[1],
                    "subject": row[2],
                    "grade": row[3],
                    "board": row[4],
                    "created_at": row[5],
                    "access_count": row[6]
                })
            
            conn.close()
            
            return {
                "success": True,
                "results": results,
                "count": len(results)
            }
            
        except Exception as e:
            logger.error(f"Error searching cache: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "results": []
            }
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # QA cache stats
            cursor.execute("SELECT COUNT(*) FROM qa_cache")
            qa_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM diagram_cache")
            diagram_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM syllabus_cache")
            syllabus_count = cursor.fetchone()[0]
            
            # Most accessed QAs
            cursor.execute('''
                SELECT question, subject, grade, access_count 
                FROM qa_cache 
                ORDER BY access_count DESC 
                LIMIT 5
            ''')
            top_qa = cursor.fetchall()
            
            conn.close()
            
            return {
                "success": True,
                "stats": {
                    "qa_entries": qa_count,
                    "diagram_entries": diagram_count,
                    "syllabus_entries": syllabus_count,
                    "total_entries": qa_count + diagram_count + syllabus_count,
                    "top_accessed_qa": [
                        {"question": row[0], "subject": row[1], "grade": row[2], "access_count": row[3]}
                        for row in top_qa
                    ]
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def clear_old_cache(self, days: int = 30) -> Dict[str, Any]:
        """
        Clear old cache entries
        """
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Clear old QA entries
            cursor.execute('''
                DELETE FROM qa_cache 
                WHERE last_accessed < ?
            ''', (cutoff_date.isoformat(),))
            
            qa_deleted = cursor.rowcount
            
            # Clear old diagram entries
            cursor.execute('''
                DELETE FROM diagram_cache 
                WHERE last_accessed < ?
            ''', (cutoff_date.isoformat(),))
            
            diagram_deleted = cursor.rowcount
            
            conn.commit()
            conn.close()
            
            return {
                "success": True,
                "cleared": {
                    "qa_entries": qa_deleted,
                    "diagram_entries": diagram_deleted,
                    "total": qa_deleted + diagram_deleted
                },
                "cutoff_date": cutoff_date.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error clearing old cache: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def export_cache(self, export_path: str) -> Dict[str, Any]:
        """
        Export cache to file
        """
        try:
            # Export JSON cache
            with open(export_path, 'w', encoding='utf-8') as f:
                json.dump(self.json_cache, f, indent=2, ensure_ascii=False)
            
            return {
                "success": True,
                "exported": True,
                "path": export_path,
                "message": "Cache exported successfully"
            }
            
        except Exception as e:
            logger.error(f"Error exporting cache: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "exported": False
            }
    
    def import_cache(self, import_path: str) -> Dict[str, Any]:
        """
        Import cache from file
        """
        try:
            with open(import_path, 'r', encoding='utf-8') as f:
                imported_cache = json.load(f)
            
            # Merge with existing cache
            self.json_cache["qa_entries"].update(imported_cache.get("qa_entries", {}))
            self.json_cache["diagram_entries"].update(imported_cache.get("diagram_entries", {}))
            self.json_cache["syllabus_entries"].update(imported_cache.get("syllabus_entries", {}))
            
            self._save_json_cache()
            
            return {
                "success": True,
                "imported": True,
                "path": import_path,
                "message": "Cache imported successfully"
            }
            
        except Exception as e:
            logger.error(f"Error importing cache: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "imported": False
            }
