import re
import json
import logging
import random
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class IndiaContextEnhancer:
    """
    Enhances AI responses with Indian cultural and educational context
    Makes all responses deeply Indian with local examples, currency, cultural references
    """
    
    INDIAN_CONTEXT_DB = {
        "currency": {
            "problems": ["shop_keeper_scenarios", "bank_interest", "salary_calculations"],
            "examples": "Always use ₹ (Rupees), common amounts: ₹10, ₹50, ₹100, ₹500, ₹1000",
            "conversion": {
                "$": "₹",
                "dollars": "rupees",
                "cents": "paise"
            }
        },
        "cultural_references": {
            "festivals": ["Diwali", "Holi", "Eid", "Christmas", "Dussehra", "Karva Chauth", "Raksha Bandhan", "Ganesh Chaturthi"],
            "sports": ["Cricket", "Hockey", "Badminton", "Kabaddi", "Kho-Kho", "Gilli Danda"],
            "food": ["Roti", "Rice", "Dal", "Sabzi", "Chai", "Samosa", "Pakora", "Lassi", "Pani Puri"],
            "places": ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Varanasi"],
            "landmarks": ["Taj Mahal", "Red Fort", "Gateway of India", "India Gate", "Golden Temple", "Ganga River", "Himalayas"]
        },
        "educational_context": {
            "exam_boards": ["CBSE", "ICSE", "Maharashtra Board", "UP Board", "Karnataka Board", "Tamil Nadu Board"],
            "common_names": ["Raj", "Priya", "Amit", "Sneha", "Arjun", "Kavya", "Rahul", "Anjali", "Vikram", "Meera", "Aditya", "Zara"],
            "local_examples": {
                "distance": "Delhi to Mumbai = 1400 km",
                "population": "India population = 1.4 billion",
                "historical": "Independence = 1947",
                "cricket": "IPL cricket tournament",
                "transport": "Metro trains in Delhi, Mumbai, Bangalore"
            }
        }
    }
    
    # Subject-specific Indian contexts
    MATH_CONTEXTS = {
        "percentage": [
            "Diwali sale: 25% off on clothes, original price ₹800",
            "Ravi scored 85% in his exam out of 100 marks",
            "Shopkeeper gives 10% discount on purchase above ₹500"
        ],
        "ratio": [
            "In a cricket team, ratio of batsmen to bowlers is 7:4",
            "Ratio of boys to girls in class is 3:2",
            "Ratio of roti to sabzi in a meal is 2:1"
        ],
        "profit_loss": [
            "Ravi bought mangoes at ₹40/kg and sold at ₹50/kg",
            "Shopkeeper bought shirts at ₹200 each and sold at ₹250",
            "Farmer sold wheat at ₹1800 per quintal"
        ],
        "time_distance": [
            "Train from Delhi to Agra covers 200km in 2.5 hours",
            "Bus from Mumbai to Pune takes 3 hours for 150km",
            "Metro train covers 20km in 45 minutes"
        ],
        "area_volume": [
            "Area of a cricket field is 150m × 100m",
            "Volume of water tank in school is 5000 liters",
            "Area of classroom is 8m × 6m"
        ],
        "simple_interest": [
            "Bank gives 6% interest on fixed deposit of ₹10,000",
            "Post office gives 7.5% interest on savings account",
            "Loan of ₹50,000 at 12% interest for 2 years"
        ]
    }
    
    SCIENCE_CONTEXTS = {
        "nutrition": [
            "Dal-chawal provides complete protein",
            "Roti-sabzi gives carbohydrates and vitamins",
            "Milk and curd are rich in calcium"
        ],
        "weather": [
            "Monsoon brings 75% of India's annual rainfall",
            "Summer temperature in Delhi reaches 45°C",
            "Winter in Shimla goes below 0°C"
        ],
        "ecology": [
            "Ganga river ecosystem and pollution effects",
            "Tiger conservation in Ranthambore National Park",
            "Crop rotation in Punjab and Haryana farms"
        ],
        "energy": [
            "Solar panels on rooftops in Gujarat",
            "Wind energy farms in Tamil Nadu",
            "Hydroelectric power from Bhakra Dam"
        ],
        "health": [
            "Ayurvedic medicines from neem and tulsi",
            "Yoga exercises for physical fitness",
            "Traditional Indian diet for good health"
        ]
    }
    
    SOCIAL_CONTEXTS = {
        "independence": [
            "1947 Independence movement led by Mahatma Gandhi",
            "Quit India Movement of 1942",
            "Dandi March for salt satyagraha"
        ],
        "geography": [
            "Himalayan ranges form northern border",
            "Thar Desert in Rajasthan",
            "Western Ghats along west coast"
        ],
        "economics": [
            "Green Revolution in Punjab and Haryana",
            "IT industry boom in Bangalore",
            "Textile industry in Surat and Mumbai"
        ],
        "culture": [
            "Classical dance forms like Bharatanatyam, Kathak",
            "Classical music traditions of Hindustani and Carnatic",
            "Festival celebrations across different states"
        ]
    }
    
    def __init__(self):
        self.currency_patterns = {
            r'\$\s*(\d+)': r'₹\1',
            r'(\d+)\s*dollars': r'₹\1',
            r'(\d+)\s*USD': r'₹\1',
            r'(\d+)\s*\$': r'₹\1'
        }
        
        self.measurement_patterns = {
            r'(\d+)\s*miles': r'\1 km',
            r'(\d+)\s*pounds': r'\1 kg',
            r'(\d+)\s*feet': r'\1 meters',
            r'(\d+)\s*inches': r'\1 cm'
        }
    
    def enhance_with_indian_context(self, response: str, subject: str, topic: str, 
                                  grade: str = "Class 8", board: str = "CBSE") -> str:
        """Replace generic examples with Indian ones"""
        try:
            enhanced_response = response
            
            # 1. Replace currency references
            enhanced_response = self.add_currency_context(enhanced_response)
            
            # 2. Add subject-specific Indian examples
            enhanced_response = self.localize_examples(enhanced_response, subject, topic)
            
            # 3. Add cultural relevance
            enhanced_response = self.add_cultural_relevance(enhanced_response, grade, board)
            
            # 4. Replace generic names with Indian names
            enhanced_response = self._replace_names_with_indian_names(enhanced_response)
            
            # 5. Add local place references
            enhanced_response = self._add_local_place_references(enhanced_response, subject)
            
            return enhanced_response
            
        except Exception as e:
            logger.error(f"Error enhancing with Indian context: {str(e)}")
            return response
    
    def add_currency_context(self, content: str) -> str:
        """Convert $ or generic currency to Indian Rupees"""
        enhanced_content = content
        
        # Replace currency symbols and terms
        for pattern, replacement in self.currency_patterns.items():
            enhanced_content = re.sub(pattern, replacement, enhanced_content, flags=re.IGNORECASE)
        
        # Replace generic currency amounts with realistic Indian amounts
        currency_replacements = {
            r'\$\s*5': '₹50',
            r'\$\s*10': '₹100', 
            r'\$\s*20': '₹200',
            r'\$\s*50': '₹500',
            r'\$\s*100': '₹1000',
            r'5\s*dollars': '₹50',
            r'10\s*dollars': '₹100',
            r'20\s*dollars': '₹200'
        }
        
        for pattern, replacement in currency_replacements.items():
            enhanced_content = re.sub(pattern, replacement, enhanced_content, flags=re.IGNORECASE)
        
        # Ensure ₹ is present for math problems
        if "area" in content.lower() or "rectangle" in content.lower() or "math" in content.lower():
            if "₹" not in enhanced_content and "rupee" not in enhanced_content.lower():
                enhanced_content = enhanced_content.replace("cm", "cm (₹)")
        
        return enhanced_content
    
    def localize_examples(self, content: str, subject: str, context_type: str) -> str:
        """Add familiar Indian names, places, situations"""
        enhanced_content = content
        
        # Get subject-specific contexts
        if subject == "Mathematics":
            contexts = self.MATH_CONTEXTS
        elif subject in ["Physics", "Chemistry", "Biology"]:
            contexts = self.SCIENCE_CONTEXTS
        elif subject in ["History", "Geography", "Social Studies"]:
            contexts = self.SOCIAL_CONTEXTS
        else:
            return enhanced_content
        
        # Find appropriate context for the topic
        for topic, examples in contexts.items():
            if topic.lower() in context_type.lower() or context_type.lower() in topic.lower():
                # Replace generic examples with Indian ones
                for example in examples:
                    # Look for generic patterns to replace
                    if "percentage" in topic and "%" in content:
                        enhanced_content = self._replace_percentage_examples(enhanced_content, example)
                    elif "ratio" in topic and "ratio" in content.lower():
                        enhanced_content = self._replace_ratio_examples(enhanced_content, example)
                    elif "profit" in topic or "loss" in topic:
                        enhanced_content = self._replace_profit_loss_examples(enhanced_content, example)
                    elif "distance" in topic or "time" in topic:
                        enhanced_content = self._replace_distance_examples(enhanced_content, example)
        
        return enhanced_content
    
    def _replace_percentage_examples(self, content: str, indian_example: str) -> str:
        """Replace generic percentage examples with Indian ones"""
        # Look for generic percentage patterns and replace
        patterns = [
            r'(discount|sale|off).*?(\d+)%.*?(\$\d+)',
            r'(\d+)%.*?(discount|reduction)',
            r'scored.*?(\d+)%.*?exam'
        ]
        
        for pattern in patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return re.sub(pattern, indian_example, content, flags=re.IGNORECASE)
        
        return content
    
    def _replace_ratio_examples(self, content: str, indian_example: str) -> str:
        """Replace generic ratio examples with Indian ones"""
        patterns = [
            r'ratio.*?(\d+):(\d+)',
            r'(\d+):(\d+).*?ratio'
        ]
        
        for pattern in patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return re.sub(pattern, indian_example, content, flags=re.IGNORECASE)
        
        return content
    
    def _replace_profit_loss_examples(self, content: str, indian_example: str) -> str:
        """Replace generic profit/loss examples with Indian ones"""
        patterns = [
            r'bought.*?(\$\d+).*?sold.*?(\$\d+)',
            r'purchased.*?(\$\d+).*?sold.*?(\$\d+)'
        ]
        
        for pattern in patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return re.sub(pattern, indian_example, content, flags=re.IGNORECASE)
        
        return content
    
    def _replace_distance_examples(self, content: str, indian_example: str) -> str:
        """Replace generic distance examples with Indian ones"""
        patterns = [
            r'(\d+)\s*miles.*?(\d+)\s*hours',
            r'(\d+)\s*km.*?(\d+)\s*minutes'
        ]
        
        for pattern in patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return re.sub(pattern, indian_example, content, flags=re.IGNORECASE)
        
        return content
    
    def add_cultural_relevance(self, content: str, grade: str, board: str) -> str:
        """Make examples culturally relevant and age-appropriate"""
        enhanced_content = content
        
        # Add festival references for younger grades
        if "Class" in grade and int(grade.split()[-1]) <= 5:
            festivals = self.INDIAN_CONTEXT_DB["cultural_references"]["festivals"]
            if "celebration" in content.lower() or "party" in content.lower():
                festival = random.choice(festivals)
                enhanced_content = enhanced_content.replace("celebration", f"{festival} celebration")
        
        # Add sports references
        if "game" in content.lower() or "sport" in content.lower():
            sports = self.INDIAN_CONTEXT_DB["cultural_references"]["sports"]
            sport = random.choice(sports)
            enhanced_content = enhanced_content.replace("game", f"{sport} game")
        
        # Add food references
        if "food" in content.lower() or "meal" in content.lower():
            foods = self.INDIAN_CONTEXT_DB["cultural_references"]["food"]
            food = random.choice(foods)
            enhanced_content = enhanced_content.replace("food", f"{food}")
        
        return enhanced_content
    
    def _replace_names_with_indian_names(self, content: str) -> str:
        """Replace generic names with Indian names"""
        indian_names = self.INDIAN_CONTEXT_DB["educational_context"]["common_names"]
        
        # Common generic names to replace
        generic_names = ["John", "Mary", "Tom", "Sarah", "Mike", "Lisa", "David", "Emma", "James", "Anna"]
        
        for generic_name in generic_names:
            if generic_name in content:
                indian_name = random.choice(indian_names)
                content = content.replace(generic_name, indian_name)
        
        return content
    
    def _add_local_place_references(self, content: str, subject: str) -> str:
        """Add local Indian place references"""
        places = self.INDIAN_CONTEXT_DB["cultural_references"]["places"]
        
        # Add place references based on subject
        if subject == "Geography":
            if "city" in content.lower() or "place" in content.lower():
                place = random.choice(places)
                content = content.replace("city", place)
        
        elif subject == "History":
            if "country" in content.lower() or "nation" in content.lower():
                content = content.replace("country", "India")
                content = content.replace("nation", "India")
        
        elif subject == "Science":
            if "river" in content.lower():
                content = content.replace("river", "Ganga river")
            elif "mountain" in content.lower():
                content = content.replace("mountain", "Himalayas")
        
        return content
    
    def get_indian_math_problem(self, topic: str, difficulty: str = "medium") -> str:
        """Generate Indian context math problems"""
        if topic in self.MATH_CONTEXTS:
            examples = self.MATH_CONTEXTS[topic]
            return random.choice(examples)
        
        # Default Indian math problems
        default_problems = {
            "basic": "Ravi bought 5 apples at ₹20 each. How much did he pay?",
            "medium": "A train from Delhi to Mumbai covers 1400 km in 18 hours. What is its speed?",
            "advanced": "Priya invested ₹10,000 in a bank at 8% simple interest for 3 years. How much interest will she earn?"
        }
        
        return default_problems.get(difficulty, default_problems["medium"])
    
    def get_indian_science_example(self, topic: str) -> str:
        """Generate Indian context science examples"""
        if topic in self.SCIENCE_CONTEXTS:
            examples = self.SCIENCE_CONTEXTS[topic]
            return random.choice(examples)
        
        return "Indian context science example"
    
    def get_indian_social_example(self, topic: str) -> str:
        """Generate Indian context social studies examples"""
        if topic in self.SOCIAL_CONTEXTS:
            examples = self.SOCIAL_CONTEXTS[topic]
            return random.choice(examples)
        
        return "Indian context social studies example"
    
    def enhance_measurement_units(self, content: str) -> str:
        """Convert measurements to Indian units where appropriate"""
        enhanced_content = content
        
        # Replace measurement units
        for pattern, replacement in self.measurement_patterns.items():
            enhanced_content = re.sub(pattern, replacement, enhanced_content, flags=re.IGNORECASE)
        
        return enhanced_content
    
    def add_indian_cultural_notes(self, content: str, subject: str) -> str:
        """Add cultural notes relevant to Indian students"""
        cultural_notes = {
            "Mathematics": "Note: In India, we use the Indian numbering system (lakh, crore) for large numbers.",
            "Science": "Note: Many traditional Indian practices like yoga and ayurveda are based on scientific principles.",
            "History": "Note: India has a rich history dating back to the Indus Valley Civilization (3300-1300 BCE).",
            "Geography": "Note: India is the 7th largest country by land area and has diverse geographical features.",
            "English": "Note: English is one of the official languages of India and is widely used in education and business."
        }
        
        if subject in cultural_notes:
            content += f"\n\n{cultural_notes[subject]}"
        
        return content
