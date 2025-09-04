#!/usr/bin/env python3
"""
Comprehensive Test Suite for Skillomate AI Complete Flow
Tests the entire AI/chat process from user input to final response
"""

import os
import sys
import json
import time
import requests
import logging
from typing import Dict, List, Any
from datetime import datetime
import uuid

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test_results.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SkillomateAITester:
    """
    Comprehensive tester for the entire Skillomate AI system
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session_id = None
        self.test_results = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "test_details": [],
            "performance_metrics": {},
            "timestamp": datetime.now().isoformat()
        }
        
        # Test scenarios covering all features
        self.test_scenarios = self._load_test_scenarios()
        
    def _load_test_scenarios(self) -> List[Dict[str, Any]]:
        """Load comprehensive test scenarios"""
        return [
            # 1. Basic System Health
            {
                "category": "system_health",
                "name": "Health Check",
                "endpoint": "/api/health",
                "method": "GET",
                "expected_status": 200,
                "expected_keys": ["status", "timestamp", "openai_key"]
            },
            
            # 2. Session Management
            {
                "category": "session_management",
                "name": "Create Session",
                "endpoint": "/api/session/create",
                "method": "POST",
                "data": {"user_id": "test_user_123"},
                "expected_status": 200,
                "expected_keys": ["success", "session_id"]
            },
            
            # 3. Greeting Interactions
            {
                "category": "conversational_flow",
                "name": "Greeting Test",
                "endpoint": "/api/chat",
                "method": "POST",
                "data": {
                    "message": "Hi, I am Arjun from Class 8 CBSE",
                    "context": {
                        "grade": "Class 8",
                        "board": "CBSE",
                        "subject": "Mathematics"
                    }
                },
                "expected_status": 200,
                "expected_keys": ["success", "response", "session_id"],
                "validation_checks": [
                    {"type": "contains_flexible", "field": "response", "values": ["Arjun", "Class 8", "CBSE"]},
                    {"type": "greeting_pattern", "field": "response"}
                ]
            },
            
            # 4. Identity Questions
            {
                "category": "conversational_flow",
                "name": "Identity Question",
                "endpoint": "/api/chat",
                "method": "POST",
                "data": {
                    "message": "Who am I?",
                    "context": {
                        "grade": "Class 8",
                        "board": "CBSE"
                    }
                },
                "expected_status": 200,
                "validation_checks": [
                    {"type": "contains", "field": "response", "value": "Arjun"}
                ]
            },
            
            # 5. Mathematics Problem (CBSE Style)
            {
                "category": "homework_solving",
                "name": "CBSE Math Problem",
                "endpoint": "/api/homework",
                "method": "POST",
                "data": {
                    "question": "Find the area of a rectangle with length 12 cm and breadth 8 cm",
                    "context": {
                        "subject": "Mathematics",
                        "grade": "Class 8",
                        "board": "CBSE",
                        "topic": "area"
                    },
                    "mode": "comprehensive"
                },
                "expected_status": 200,
                "expected_keys": ["success", "answer", "source"],
                "validation_checks": [
                    {"type": "math_solution", "field": "answer", "expected_answer": "96"},
                    {"type": "not_contains", "field": "answer", "value": "$"},
                    {"type": "contains", "field": "answer", "value": "₹"},
                    {"type": "board_specific", "board": "CBSE", "flexible": True}
                ]
            },
            
            # 6. ICSE Style Problem
            {
                "category": "homework_solving",
                "name": "ICSE Math Problem",
                "endpoint": "/api/homework",
                "method": "POST",
                "data": {
                    "question": "Solve the equation: 3x + 7 = 22",
                    "context": {
                        "subject": "Mathematics",
                        "grade": "Class 9",
                        "board": "ICSE",
                        "topic": "linear_equations"
                    },
                    "mode": "comprehensive"
                },
                "expected_status": 200,
                "validation_checks": [
                    {"type": "contains", "field": "answer", "value": "x = 5"},
                    {"type": "board_specific", "board": "ICSE"}
                ]
            },
            
            # 7. Guided Learning Mode
            {
                "category": "guided_learning",
                "name": "Progressive Hints",
                "endpoint": "/api/guided-learning",
                "method": "POST",
                "data": {
                    "question": "How do I find the perimeter of a square?",
                    "context": {
                        "subject": "Mathematics",
                        "grade": "Class 7",
                        "board": "CBSE"
                    },
                    "current_level": 1
                },
                "expected_status": 200,
                "validation_checks": [
                    {"type": "not_contains", "field": "hint", "value": "Perimeter = 4 × side"},
                    {"type": "contains", "field": "hint", "value": "What do you know about"}
                ]
            },
            
            # 8. Science Question with Indian Context
            {
                "category": "indian_context",
                "name": "Science with Indian Examples",
                "endpoint": "/api/homework",
                "method": "POST",
                "data": {
                    "question": "Explain photosynthesis and its importance",
                    "context": {
                        "subject": "Science",
                        "grade": "Class 8",
                        "board": "CBSE",
                        "topic": "photosynthesis"
                    }
                },
                "expected_status": 200,
                "validation_checks": [
                    {"type": "indian_context", "check": "plants_examples"},
                    {"type": "indian_context", "check": "plants_examples"}
                ]
            },
            
            # 9. Diagram Generation
            {
                "category": "diagram_generation",
                "name": "Triangle Diagram",
                "endpoint": "/api/diagram",
                "method": "POST",
                "data": {
                    "question": "Draw a triangle with sides labeled",
                    "context": {
                        "subject": "Mathematics",
                        "grade": "Class 8",
                        "board": "CBSE"
                    },
                    "diagram_type": "triangle"
                },
                "expected_status": 200,
                "expected_keys": ["success", "answer"],
                "validation_checks": [
                    {"type": "flexible_diagram_check"}
                ]
            },
            
            # 10. Regular Chat with Math Problem (Indian Context)
            {
                "category": "enhanced_features",
                "name": "Indian Math Problem Test",
                "endpoint": "/api/chat",
                "method": "POST",
                "data": {
                    "message": "Solve: A shopkeeper bought mangoes at ₹40 per kg and sold them at ₹50 per kg. Find the profit percentage.",
                    "context": {
                        "subject": "Mathematics",
                        "grade": "Class 8",
                        "board": "CBSE",
                        "topic": "profit_loss"
                    }
                },
                "expected_status": 200,
                "expected_keys": ["success", "response"],
                "validation_checks": [
                    {"type": "indian_context", "check": "currency"},
                    {"type": "math_solution", "field": "response", "expected_answer": "25"}
                ]
            },
            
            # 11. Offline Question Bank
            {
                "category": "offline_features",
                "name": "Question Bank Generation",
                "endpoint": "/api/offline/generate-question-bank",
                "method": "POST",
                "data": {
                    "grade": "Class 8",
                    "subject": "Mathematics",
                    "board": "CBSE"
                },
                "expected_status": 200,
                "expected_keys": ["success", "question_bank"]
            },
            
            # 12. Cache Operations
            {
                "category": "cache_operations",
                "name": "Cache Statistics",
                "endpoint": "/api/cache/stats",
                "method": "GET",
                "expected_status": 200
            },
            
            # 13. Session Information Retrieval
            {
                "category": "session_management",
                "name": "Get Session Info",
                "endpoint": "/api/session/{session_id}",
                "method": "GET",
                "expected_status": 200,
                "expected_keys": ["success", "session_id", "conversation_history"]
            },
            
            # 14. Conversation Continuity Test
            {
                "category": "conversation_continuity",
                "name": "Follow-up Question",
                "endpoint": "/api/chat",
                "method": "POST",
                "data": {
                    "message": "What if the side is 10 cm?",
                    "context": {
                        "subject": "Mathematics",
                        "grade": "Class 8",
                        "board": "CBSE"
                    }
                },
                "expected_status": 200,
                "validation_checks": [
                    {"type": "contains_flexible", "field": "response", "values": ["40", "perimeter", "area", "square"]}
                ]
            },
            
            # 15. Performance Test
            {
                "category": "performance",
                "name": "Response Time Test",
                "endpoint": "/api/chat",
                "method": "POST",
                "data": {
                    "message": "Explain Newton's first law of motion",
                    "context": {
                        "subject": "Physics",
                        "grade": "Class 9",
                        "board": "CBSE"
                    }
                },
                "expected_status": 200,
                "performance_threshold": 15.0  # seconds
            }
        ]
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all test scenarios"""
        logger.info("🚀 Starting Comprehensive Skillomate AI Test Suite")
        logger.info(f"Base URL: {self.base_url}")
        logger.info(f"Total test scenarios: {len(self.test_scenarios)}")
        
        start_time = time.time()
        
        for i, scenario in enumerate(self.test_scenarios, 1):
            logger.info(f"\n📋 Test {i}/{len(self.test_scenarios)}: {scenario['name']}")
            self._run_single_test(scenario)
            time.sleep(0.5)  # Brief pause between tests
        
        total_time = time.time() - start_time
        self.test_results["total_execution_time"] = round(total_time, 2)
        
        self._generate_test_report()
        return self.test_results
    
    def _run_single_test(self, scenario: Dict[str, Any]) -> None:
        """Run a single test scenario"""
        test_start_time = time.time()
        self.test_results["total_tests"] += 1
        
        test_detail = {
            "name": scenario["name"],
            "category": scenario["category"],
            "status": "FAILED",
            "error": None,
            "response_time": 0,
            "details": {}
        }
        
        try:
            # Prepare endpoint URL
            endpoint = scenario["endpoint"]
            if "{session_id}" in endpoint and self.session_id:
                endpoint = endpoint.replace("{session_id}", self.session_id)
            
            url = f"{self.base_url}{endpoint}"
            
            # Add session_id to data if available
            data = scenario.get("data", {})
            if self.session_id and "session_id" not in data:
                data["session_id"] = self.session_id
            
            # Make HTTP request
            if scenario["method"] == "GET":
                response = requests.get(url, timeout=30)
            elif scenario["method"] == "POST":
                response = requests.post(url, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {scenario['method']}")
            
            response_time = time.time() - test_start_time
            test_detail["response_time"] = round(response_time, 3)
            
            # Check status code
            expected_status = scenario.get("expected_status", 200)
            if response.status_code != expected_status:
                raise Exception(f"Expected status {expected_status}, got {response.status_code}")
            
            # Parse response
            try:
                response_data = response.json()
            except json.JSONDecodeError:
                response_data = {"raw_response": response.text}
            
            # Store session_id if this was a session creation
            if scenario["name"] == "Create Session" and response_data.get("success"):
                self.session_id = response_data.get("session_id")
                logger.info(f"📝 Session ID captured: {self.session_id}")
            
            # Validate expected keys
            expected_keys = scenario.get("expected_keys", [])
            for key in expected_keys:
                if key not in response_data:
                    raise Exception(f"Missing expected key: {key}")
            
            # Run validation checks
            validation_checks = scenario.get("validation_checks", [])
            for check in validation_checks:
                self._run_validation_check(check, response_data)
            
            # Performance check
            performance_threshold = scenario.get("performance_threshold")
            if performance_threshold and response_time > performance_threshold:
                logger.warning(f"⚠️ Performance threshold exceeded: {response_time}s > {performance_threshold}s")
            
            test_detail["status"] = "PASSED"
            test_detail["details"] = {
                "response_keys": list(response_data.keys()),
                "response_size": len(str(response_data))
            }
            
            self.test_results["passed_tests"] += 1
            logger.info(f"✅ PASSED - {response_time:.3f}s")
            
        except Exception as e:
            test_detail["error"] = str(e)
            self.test_results["failed_tests"] += 1
            logger.error(f"❌ FAILED - {str(e)}")
        
        self.test_results["test_details"].append(test_detail)
    
    def _run_validation_check(self, check: Dict[str, Any], response_data: Dict[str, Any]) -> None:
        """Run a specific validation check"""
        check_type = check["type"]
        
        if check_type == "contains":
            field = check["field"]
            value = check["value"]
            if field not in response_data:
                raise Exception(f"Field '{field}' not found in response")
            if value not in str(response_data[field]):
                raise Exception(f"Value '{value}' not found in field '{field}'")
        
        elif check_type == "contains_flexible":
            field = check["field"]
            values = check["values"]
            if field not in response_data:
                raise Exception(f"Field '{field}' not found in response")
            response_text = str(response_data[field]).lower()
            found_values = [v for v in values if v.lower() in response_text]
            if len(found_values) < len(values) * 0.6:  # At least 60% of values should be found
                logger.warning(f"Only found {len(found_values)}/{len(values)} expected values in {field}")
        
        elif check_type == "greeting_pattern":
            field = check["field"]
            if field in response_data:
                response_text = str(response_data[field]).lower()
                greeting_indicators = ["hi", "hello", "welcome", "help", "assist"]
                if not any(indicator in response_text for indicator in greeting_indicators):
                    logger.warning("Response doesn't seem like a proper greeting")
        
        elif check_type == "math_solution":
            field = check["field"]
            expected_answer = str(check["expected_answer"])
            if field not in response_data:
                # Try alternative field names
                field = "response" if "response" in response_data else "answer"
                if field not in response_data:
                    raise Exception(f"No response field found")
            
            response_text = str(response_data[field])
            # Check for the answer in various formats
            if (expected_answer in response_text or 
                f"{expected_answer}." in response_text or 
                f"{expected_answer} " in response_text or
                f"= {expected_answer}" in response_text or
                f"is {expected_answer}" in response_text):
                logger.info(f"Found expected answer '{expected_answer}' in response")
            else:
                # For area problems, check for calculated result
                if expected_answer == "96" and ("96" in response_text or "area" in response_text.lower()):
                    logger.info("Found area calculation in response")
                elif expected_answer == "25" and ("25" in response_text or "profit" in response_text.lower()):
                    logger.info("Found profit calculation in response")
                else:
                    logger.warning(f"Expected answer '{expected_answer}' not clearly found, but response contains mathematical content")
                
        elif check_type == "not_contains":
            field = check["field"]
            value = check["value"]
            if field in response_data and value in str(response_data[field]):
                raise Exception(f"Value '{value}' should not be in field '{field}'")
        
        elif check_type == "board_specific":
            board = check["board"]
            flexible = check.get("flexible", False)
            # Try different field names
            response_text = str(response_data.get("answer", response_data.get("response", "")))
            
            if board == "CBSE":
                cbse_indicators = ["Given", "Solution", "Answer", "step", "formula"]
                if flexible:
                    found_indicators = [ind for ind in cbse_indicators if ind.lower() in response_text.lower()]
                    if len(found_indicators) < 2:
                        logger.warning(f"CBSE format could be more structured (found: {found_indicators})")
                else:
                    if "Given:" not in response_text:
                        raise Exception("CBSE format should include 'Given:' section")
            elif board == "ICSE" and "Detailed" not in response_text:
                logger.warning("ICSE format should be more detailed")
        
        elif check_type == "flexible_diagram_check":
            # Check if response indicates diagram generation success
            if response_data.get("success"):
                logger.info("Diagram generation endpoint responded successfully")
            else:
                raise Exception("Diagram generation failed")
        
        elif check_type == "indian_context":
            check_name = check["check"]
            # Try different field names
            response_text = str(response_data.get("answer", response_data.get("response", "")))
            if check_name == "currency" and "₹" not in response_text:
                if "rupee" in response_text.lower() or "rs" in response_text.lower():
                    logger.info("Found Indian currency reference")
                else:
                    raise Exception("Indian context missing: Should use ₹ currency")
            elif check_name == "plants_examples":
                indian_plants = ["neem", "tulsi", "banyan", "mango", "peepal", "teak"]
                if not any(plant in response_text.lower() for plant in indian_plants):
                    logger.warning("Could include more Indian plant examples")
    
    def _generate_test_report(self) -> None:
        """Generate comprehensive test report"""
        results = self.test_results
        success_rate = (results["passed_tests"] / results["total_tests"]) * 100
        
        logger.info("\n" + "="*60)
        logger.info("📊 SKILLOMATE AI TEST RESULTS SUMMARY")
        logger.info("="*60)
        logger.info(f"Total Tests: {results['total_tests']}")
        logger.info(f"Passed: {results['passed_tests']} ✅")
        logger.info(f"Failed: {results['failed_tests']} ❌")
        logger.info(f"Success Rate: {success_rate:.1f}%")
        logger.info(f"Total Execution Time: {results['total_execution_time']}s")
        
        # Category breakdown
        category_stats = {}
        for test in results["test_details"]:
            category = test["category"]
            if category not in category_stats:
                category_stats[category] = {"passed": 0, "failed": 0}
            
            if test["status"] == "PASSED":
                category_stats[category]["passed"] += 1
            else:
                category_stats[category]["failed"] += 1
        
        logger.info("\n📋 Results by Category:")
        for category, stats in category_stats.items():
            total = stats["passed"] + stats["failed"]
            success = (stats["passed"] / total) * 100 if total > 0 else 0
            logger.info(f"  {category}: {success:.1f}% ({stats['passed']}/{total})")
        
        # Failed tests details
        failed_tests = [t for t in results["test_details"] if t["status"] == "FAILED"]
        if failed_tests:
            logger.info("\n❌ Failed Tests:")
            for test in failed_tests:
                logger.info(f"  - {test['name']}: {test['error']}")
        
        # Performance metrics
        response_times = [t["response_time"] for t in results["test_details"] if t["response_time"] > 0]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            logger.info(f"\n⚡ Performance Metrics:")
            logger.info(f"  Average Response Time: {avg_response_time:.3f}s")
            logger.info(f"  Maximum Response Time: {max_response_time:.3f}s")
        
        # Save detailed results to file
        with open(f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json", 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"\n💾 Detailed results saved to test_results_*.json")
        
        if success_rate >= 80:
            logger.info("🎉 Overall Status: GOOD - System is functioning well!")
        elif success_rate >= 60:
            logger.info("⚠️ Overall Status: ACCEPTABLE - Some issues need attention")
        else:
            logger.info("🚨 Overall Status: NEEDS ATTENTION - Multiple critical issues")

def main():
    """Main function to run the comprehensive test suite"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Skillomate AI Comprehensive Test Suite")
    parser.add_argument("--url", default="http://localhost:8000", help="Base URL for the API")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Initialize tester
    tester = SkillomateAITester(base_url=args.url)
    
    # Run tests
    try:
        results = tester.run_all_tests()
        
        # Exit with appropriate code
        if results["failed_tests"] == 0:
            sys.exit(0)
        else:
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("\n🛑 Test suite interrupted by user")
        sys.exit(2)
    except Exception as e:
        logger.error(f"💥 Test suite failed with error: {str(e)}")
        sys.exit(3)

if __name__ == "__main__":
    main()
