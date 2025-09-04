import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import base64
import io
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import math
import re

logger = logging.getLogger(__name__)

class EducationalDiagramGenerator:
    """
    Generates subject-specific diagrams for Indian curriculum
    Creates educational diagrams with proper labeling and Indian context
    """
    
    DIAGRAM_TEMPLATES = {
        "Mathematics": {
            "geometry": ["triangles", "circles", "polygons", "coordinate_geometry", "angles"],
            "algebra": ["graphs", "functions", "equations_visual", "number_line"],
            "statistics": ["bar_charts", "pie_charts", "histograms", "line_graphs"],
            "trigonometry": ["unit_circle", "trigonometric_graphs", "angles_measurement"]
        },
        "Science": {
            "biology": ["cell_structure", "human_body_systems", "plant_parts", "food_chain", "ecosystem"],
            "chemistry": ["atomic_structure", "periodic_table", "molecular_structure", "chemical_reactions"],
            "physics": ["circuit_diagrams", "wave_diagrams", "force_diagrams", "energy_transfer"]
        },
        "Geography": {
            "india_maps": ["political_map", "physical_features", "climate_zones", "river_systems"],
            "world_geography": ["continents", "oceans", "mountain_ranges", "climate_patterns"]
        },
        "Social_Studies": {
            "history": ["timeline", "historical_events", "freedom_movement", "ancient_civilizations"],
            "economics": ["supply_demand", "economic_cycles", "trade_balance", "development_indicators"]
        }
    }
    
    # Indian context for diagrams
    INDIAN_CONTEXT = {
        "currency": "₹",
        "measurements": {
            "distance": "km",
            "area": "sq km", 
            "temperature": "°C",
            "weight": "kg"
        },
        "places": ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad"],
        "landmarks": ["Taj Mahal", "Red Fort", "Gateway of India", "India Gate"],
        "crops": ["Rice", "Wheat", "Cotton", "Sugarcane", "Tea"],
        "festivals": ["Diwali", "Holi", "Eid", "Christmas", "Dussehra"]
    }
    
    def __init__(self):
        # Set matplotlib style for educational diagrams
        plt.style.use('default')
        plt.rcParams['font.size'] = 10
        plt.rcParams['font.family'] = 'DejaVu Sans'
        plt.rcParams['figure.figsize'] = (10, 8)
        plt.rcParams['axes.grid'] = True
        plt.rcParams['grid.alpha'] = 0.3
    
    def generate_diagram(self, diagram_type: str, content_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate educational diagram with labels"""
        try:
            subject = content_context.get("subject", "Mathematics")
            grade = content_context.get("grade", "Class 8")
            board = content_context.get("board", "CBSE")
            
            # Generate the diagram based on type
            if diagram_type == "triangle":
                diagram_data = self._generate_triangle_diagram(content_context)
            elif diagram_type == "circle":
                diagram_data = self._generate_circle_diagram(content_context)
            elif diagram_type == "coordinate_geometry":
                diagram_data = self._generate_coordinate_diagram(content_context)
            elif diagram_type == "bar_chart":
                diagram_data = self._generate_bar_chart(content_context)
            elif diagram_type == "pie_chart":
                diagram_data = self._generate_pie_chart(content_context)
            elif diagram_type == "cell_structure":
                diagram_data = self._generate_cell_diagram(content_context)
            elif diagram_type == "circuit_diagram":
                diagram_data = self._generate_circuit_diagram(content_context)
            elif diagram_type == "india_map":
                diagram_data = self._generate_india_map(content_context)
            elif diagram_type == "timeline":
                diagram_data = self._generate_timeline(content_context)
            else:
                # Default to a simple geometric diagram
                diagram_data = self._generate_default_diagram(diagram_type, content_context)
            
            # Add Indian context
            diagram_data = self.add_indian_context_to_diagrams(diagram_data, content_context)
            
            # Convert to base64 for web display
            image_base64 = self._convert_to_base64(diagram_data["figure"])
            
            return {
                "success": True,
                "diagram_type": diagram_type,
                "image_data": image_base64,
                "description": diagram_data.get("description", f"{diagram_type} diagram"),
                "labels": diagram_data.get("labels", []),
                "subject": subject,
                "grade": grade,
                "board": board
            }
            
        except Exception as e:
            logger.error(f"Error generating diagram: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to generate {diagram_type} diagram: {str(e)}"
            }
    
    def create_step_by_step_visual(self, process_description: str) -> List[Dict[str, Any]]:
        """Break down processes into visual steps"""
        try:
            steps = []
            
            # Parse process description to extract steps
            step_patterns = [
                r'Step \d+[:\s]+([^.]*)',
                r'(\d+)\.\s*([^.]*)',
                r'First[,\s]+([^.]*)',
                r'Next[,\s]+([^.]*)',
                r'Finally[,\s]+([^.]*)'
            ]
            
            extracted_steps = []
            for pattern in step_patterns:
                matches = re.findall(pattern, process_description, re.IGNORECASE)
                extracted_steps.extend(matches)
            
            # Create visual for each step
            for i, step in enumerate(extracted_steps[:5], 1):  # Limit to 5 steps
                step_diagram = self._create_step_diagram(step, i)
                steps.append({
                    "step_number": i,
                    "description": step,
                    "diagram": step_diagram
                })
            
            return steps
            
        except Exception as e:
            logger.error(f"Error creating step-by-step visual: {str(e)}")
            return []
    
    def _generate_triangle_diagram(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate triangle diagram with measurements"""
        fig, ax = plt.subplots(figsize=(8, 6))
        
        # Triangle coordinates
        triangle_points = np.array([[0, 0], [4, 0], [2, 3]])
        
        # Draw triangle
        triangle = patches.Polygon(triangle_points, facecolor='lightblue', 
                                 edgecolor='black', linewidth=2)
        ax.add_patch(triangle)
        
        # Add labels
        ax.text(-0.3, -0.3, 'A', fontsize=12, fontweight='bold')
        ax.text(4.2, -0.3, 'B', fontsize=12, fontweight='bold')
        ax.text(1.8, 3.2, 'C', fontsize=12, fontweight='bold')
        
        # Add measurements
        ax.text(2, -0.5, 'Base = 4 cm', ha='center', fontsize=10)
        ax.text(2.5, 1.5, 'Height = 3 cm', ha='center', fontsize=10)
        ax.text(-0.5, 1.5, 'Side AC', ha='center', fontsize=10)
        ax.text(4.5, 1.5, 'Side BC', ha='center', fontsize=10)
        
        # Set limits and labels
        ax.set_xlim(-1, 5)
        ax.set_ylim(-1, 4)
        ax.set_aspect('equal')
        ax.set_title('Triangle with Measurements', fontsize=14, fontweight='bold')
        ax.set_xlabel('Length (cm)')
        ax.set_ylabel('Height (cm)')
        ax.grid(True, alpha=0.3)
        
        return {
            "figure": fig,
            "description": "Triangle with labeled sides and measurements",
            "labels": ["A", "B", "C", "Base", "Height"]
        }
    
    def _generate_circle_diagram(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate circle diagram with radius and diameter"""
        fig, ax = plt.subplots(figsize=(8, 8))
        
        # Circle parameters
        center = (0, 0)
        radius = 3
        
        # Draw circle
        circle = patches.Circle(center, radius, facecolor='lightgreen', 
                              edgecolor='black', linewidth=2)
        ax.add_patch(circle)
        
        # Draw radius
        ax.plot([0, 0], [0, 3], 'r-', linewidth=3, label='Radius')
        ax.plot([-3, 3], [0, 0], 'b-', linewidth=3, label='Diameter')
        
        # Add center point
        ax.plot(0, 0, 'ko', markersize=8)
        
        # Add labels
        ax.text(0.2, 1.5, 'r = 3 cm', fontsize=10, color='red')
        ax.text(0, -0.5, 'Center', ha='center', fontsize=10)
        ax.text(3.2, 0.2, 'Diameter = 6 cm', fontsize=10, color='blue')
        
        # Set limits and labels
        ax.set_xlim(-4, 4)
        ax.set_ylim(-4, 4)
        ax.set_aspect('equal')
        ax.set_title('Circle with Radius and Diameter', fontsize=14, fontweight='bold')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        return {
            "figure": fig,
            "description": "Circle showing radius, diameter, and center",
            "labels": ["Center", "Radius", "Diameter"]
        }
    
    def _generate_coordinate_diagram(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate coordinate geometry diagram"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Plot points
        points = [(2, 3), (5, 7), (8, 4), (1, 6)]
        x_coords = [p[0] for p in points]
        y_coords = [p[1] for p in points]
        
        # Plot points
        ax.scatter(x_coords, y_coords, c='red', s=100, zorder=5)
        
        # Connect points to form a polygon
        ax.plot(x_coords + [x_coords[0]], y_coords + [y_coords[0]], 'b-', linewidth=2)
        
        # Add point labels
        labels = ['A', 'B', 'C', 'D']
        for i, (x, y) in enumerate(points):
            ax.text(x + 0.2, y + 0.2, labels[i], fontsize=12, fontweight='bold')
        
        # Set grid and labels
        ax.grid(True, alpha=0.3)
        ax.set_xlabel('X-axis')
        ax.set_ylabel('Y-axis')
        ax.set_title('Coordinate Geometry - Points and Polygon', fontsize=14, fontweight='bold')
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        
        return {
            "figure": fig,
            "description": "Coordinate geometry showing points and polygon",
            "labels": ["A", "B", "C", "D", "Polygon"]
        }
    
    def _generate_bar_chart(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate bar chart with Indian context"""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Indian context data
        categories = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Tea']
        production = [120, 95, 35, 25, 15]  # Million tonnes
        
        # Create bar chart
        bars = ax.bar(categories, production, color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'])
        
        # Add value labels on bars
        for bar, value in zip(bars, production):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                   f'{value} MT', ha='center', va='bottom', fontweight='bold')
        
        # Customize chart
        ax.set_title('Agricultural Production in India (2023)', fontsize=14, fontweight='bold')
        ax.set_xlabel('Crops')
        ax.set_ylabel('Production (Million Tonnes)')
        ax.grid(True, alpha=0.3, axis='y')
        
        # Rotate x-axis labels for better readability
        plt.xticks(rotation=45)
        
        return {
            "figure": fig,
            "description": "Bar chart showing Indian agricultural production",
            "labels": categories
        }
    
    def _generate_pie_chart(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate pie chart with Indian context"""
        fig, ax = plt.subplots(figsize=(8, 8))
        
        # Indian population data by region
        regions = ['North', 'South', 'East', 'West', 'Central']
        population = [30, 25, 20, 15, 10]  # Percentage
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
        
        # Create pie chart
        wedges, texts, autotexts = ax.pie(population, labels=regions, autopct='%1.1f%%',
                                         colors=colors, startangle=90)
        
        # Customize
        ax.set_title('India Population Distribution by Region', fontsize=14, fontweight='bold')
        
        return {
            "figure": fig,
            "description": "Pie chart showing Indian population distribution",
            "labels": regions
        }
    
    def _generate_cell_diagram(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate plant cell diagram"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Cell membrane (outer boundary)
        cell_membrane = patches.Ellipse((0, 0), 8, 6, facecolor='lightyellow', 
                                       edgecolor='black', linewidth=2)
        ax.add_patch(cell_membrane)
        
        # Cell wall (outer boundary)
        cell_wall = patches.Ellipse((0, 0), 8.5, 6.5, facecolor='none', 
                                   edgecolor='brown', linewidth=3)
        ax.add_patch(cell_wall)
        
        # Nucleus
        nucleus = patches.Circle((-1, 1), 0.8, facecolor='lightblue', 
                               edgecolor='darkblue', linewidth=2)
        ax.add_patch(nucleus)
        
        # Chloroplasts
        for i in range(3):
            chloroplast = patches.Ellipse((1 + i*0.8, -0.5 + i*0.3), 0.6, 0.4, 
                                        facecolor='lightgreen', edgecolor='darkgreen', linewidth=1)
            ax.add_patch(chloroplast)
        
        # Vacuole
        vacuole = patches.Ellipse((0, -1.5), 2, 1.5, facecolor='lightgray', 
                                edgecolor='gray', linewidth=1)
        ax.add_patch(vacuole)
        
        # Add labels
        ax.text(-1, 1, 'Nucleus', ha='center', fontsize=10, fontweight='bold')
        ax.text(1.5, -0.5, 'Chloroplasts', ha='center', fontsize=10)
        ax.text(0, -1.5, 'Vacuole', ha='center', fontsize=10)
        ax.text(0, 3.5, 'Cell Wall', ha='center', fontsize=10, color='brown')
        ax.text(0, 2.8, 'Cell Membrane', ha='center', fontsize=10)
        
        # Set limits and title
        ax.set_xlim(-5, 5)
        ax.set_ylim(-4, 4)
        ax.set_aspect('equal')
        ax.set_title('Plant Cell Structure', fontsize=14, fontweight='bold')
        ax.axis('off')
        
        return {
            "figure": fig,
            "description": "Plant cell showing major organelles",
            "labels": ["Nucleus", "Chloroplasts", "Vacuole", "Cell Wall", "Cell Membrane"]
        }
    
    def _generate_circuit_diagram(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate simple electric circuit diagram"""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Battery
        battery = patches.Rectangle((-3, -0.5), 1, 1, facecolor='yellow', 
                                  edgecolor='black', linewidth=2)
        ax.add_patch(battery)
        
        # Resistor
        resistor = patches.Rectangle((0, -0.3), 1, 0.6, facecolor='lightgray', 
                                   edgecolor='black', linewidth=2)
        ax.add_patch(resistor)
        
        # Bulb
        bulb = patches.Circle((2, 0), 0.4, facecolor='orange', 
                            edgecolor='black', linewidth=2)
        ax.add_patch(bulb)
        
        # Wires
        ax.plot([-2, -1], [0, 0], 'k-', linewidth=3)  # Battery to resistor
        ax.plot([1, 1.6], [0, 0], 'k-', linewidth=3)  # Resistor to bulb
        ax.plot([2.4, 3], [0, 0], 'k-', linewidth=3)  # Bulb to battery
        
        # Add labels
        ax.text(-2.5, 0, 'Battery\n(6V)', ha='center', fontsize=10, fontweight='bold')
        ax.text(0.5, 0, 'Resistor\n(10Ω)', ha='center', fontsize=10)
        ax.text(2, 0, 'Bulb', ha='center', fontsize=10, fontweight='bold')
        ax.text(0, -1.5, 'Simple Electric Circuit', ha='center', fontsize=12, fontweight='bold')
        
        # Set limits and title
        ax.set_xlim(-4, 4)
        ax.set_ylim(-2, 2)
        ax.set_aspect('equal')
        ax.set_title('Simple Electric Circuit', fontsize=14, fontweight='bold')
        ax.axis('off')
        
        return {
            "figure": fig,
            "description": "Simple electric circuit with battery, resistor, and bulb",
            "labels": ["Battery", "Resistor", "Bulb", "Wires"]
        }
    
    def _generate_india_map(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate simplified India map"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Simplified India boundary (approximate)
        india_boundary = [
            (68, 8), (97, 8), (97, 37), (68, 37), (68, 8)
        ]
        
        # Plot India boundary
        x_coords = [p[0] for p in india_boundary]
        y_coords = [p[1] for p in india_boundary]
        ax.fill(x_coords, y_coords, color='lightgreen', alpha=0.7)
        ax.plot(x_coords, y_coords, 'k-', linewidth=2)
        
        # Add major cities
        cities = {
            'Delhi': (77, 29),
            'Mumbai': (73, 19),
            'Bangalore': (78, 13),
            'Chennai': (80, 13),
            'Kolkata': (88, 22),
            'Hyderabad': (78, 18)
        }
        
        for city, coords in cities.items():
            ax.plot(coords[0], coords[1], 'ro', markersize=8)
            ax.text(coords[0] + 0.5, coords[1] + 0.5, city, fontsize=9, fontweight='bold')
        
        # Add title and labels
        ax.set_title('Map of India with Major Cities', fontsize=14, fontweight='bold')
        ax.set_xlabel('Longitude (°E)')
        ax.set_ylabel('Latitude (°N)')
        ax.grid(True, alpha=0.3)
        
        return {
            "figure": fig,
            "description": "Simplified map of India showing major cities",
            "labels": list(cities.keys())
        }
    
    def _generate_timeline(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate historical timeline"""
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Historical events
        events = [
            ('1857', 'First War of Independence'),
            ('1885', 'Indian National Congress Founded'),
            ('1905', 'Partition of Bengal'),
            ('1919', 'Jallianwala Bagh Massacre'),
            ('1930', 'Dandi March'),
            ('1942', 'Quit India Movement'),
            ('1947', 'India Independence')
        ]
        
        years = [int(event[0]) for event in events]
        event_names = [event[1] for event in events]
        
        # Plot timeline
        ax.plot(years, [0]*len(years), 'b-', linewidth=3)
        ax.scatter(years, [0]*len(years), c='red', s=100, zorder=5)
        
        # Add event labels
        for i, (year, event) in enumerate(events):
            ax.text(year, 0.2 if i % 2 == 0 else -0.2, f'{year}\n{event}', 
                   ha='center', va='center' if i % 2 == 0 else 'top',
                   fontsize=9, fontweight='bold',
                   bbox=dict(boxstyle="round,pad=0.3", facecolor="lightblue", alpha=0.7))
        
        # Customize
        ax.set_title('Indian Freedom Movement Timeline', fontsize=14, fontweight='bold')
        ax.set_xlabel('Year')
        ax.set_ylim(-1, 1)
        ax.set_yticks([])
        ax.grid(True, alpha=0.3, axis='x')
        
        return {
            "figure": fig,
            "description": "Timeline of Indian freedom movement",
            "labels": event_names
        }
    
    def _generate_default_diagram(self, diagram_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate default diagram for unknown types"""
        fig, ax = plt.subplots(figsize=(8, 6))
        
        # Create a simple geometric shape
        if "triangle" in diagram_type.lower():
            triangle_points = np.array([[0, 0], [4, 0], [2, 3]])
            shape = patches.Polygon(triangle_points, facecolor='lightblue', 
                                  edgecolor='black', linewidth=2)
        elif "circle" in diagram_type.lower():
            shape = patches.Circle((0, 0), 2, facecolor='lightgreen', 
                                 edgecolor='black', linewidth=2)
        elif "square" in diagram_type.lower():
            shape = patches.Rectangle((-2, -2), 4, 4, facecolor='lightcoral', 
                                    edgecolor='black', linewidth=2)
        else:
            # Default rectangle
            shape = patches.Rectangle((-2, -1), 4, 2, facecolor='lightgray', 
                                    edgecolor='black', linewidth=2)
        
        ax.add_patch(shape)
        ax.set_xlim(-3, 3)
        ax.set_ylim(-3, 3)
        ax.set_aspect('equal')
        ax.set_title(f'{diagram_type.title()} Diagram', fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3)
        
        return {
            "figure": fig,
            "description": f"Basic {diagram_type} diagram",
            "labels": [diagram_type]
        }
    
    def _create_step_diagram(self, step_description: str, step_number: int) -> Dict[str, Any]:
        """Create diagram for a single step"""
        fig, ax = plt.subplots(figsize=(6, 4))
        
        # Create a simple step visualization
        ax.text(0.5, 0.5, f'Step {step_number}\n{step_description}', 
               ha='center', va='center', fontsize=12, fontweight='bold',
               bbox=dict(boxstyle="round,pad=0.5", facecolor="lightblue", alpha=0.8))
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        return {
            "figure": fig,
            "description": f"Step {step_number}: {step_description}"
        }
    
    def add_indian_context_to_diagrams(self, diagram_data: Dict[str, Any], 
                                     context: Dict[str, Any]) -> Dict[str, Any]:
        """Add Indian examples to diagrams"""
        try:
            # Add Indian context based on subject
            subject = context.get("subject", "Mathematics")
            
            if subject == "Mathematics":
                # Add Indian currency symbols
                if "bar_chart" in diagram_data.get("description", ""):
                    diagram_data["description"] += " (Values in ₹)"
            
            elif subject == "Geography":
                # Add Indian place names
                if "map" in diagram_data.get("description", ""):
                    diagram_data["description"] += " - Indian cities and landmarks"
            
            elif subject == "History":
                # Add Indian historical context
                if "timeline" in diagram_data.get("description", ""):
                    diagram_data["description"] += " - Indian freedom movement"
            
            return diagram_data
            
        except Exception as e:
            logger.error(f"Error adding Indian context: {str(e)}")
            return diagram_data
    
    def _convert_to_base64(self, figure) -> str:
        """Convert matplotlib figure to base64 string"""
        try:
            # Save figure to bytes buffer
            buf = io.BytesIO()
            figure.savefig(buf, format='png', dpi=150, bbox_inches='tight')
            buf.seek(0)
            
            # Convert to base64
            img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            
            # Close the figure to free memory
            plt.close(figure)
            
            return img_base64
            
        except Exception as e:
            logger.error(f"Error converting figure to base64: {str(e)}")
            return ""
    
    def get_available_diagram_types(self, subject: str) -> List[str]:
        """Get available diagram types for a subject"""
        if subject in self.DIAGRAM_TEMPLATES:
            return list(self.DIAGRAM_TEMPLATES[subject].keys())
        return []
    
    def get_diagram_suggestions(self, question: str, subject: str) -> List[str]:
        """Get diagram suggestions based on question content"""
        suggestions = []
        
        # Analyze question for diagram opportunities
        question_lower = question.lower()
        
        if subject == "Mathematics":
            if any(word in question_lower for word in ["triangle", "angle", "geometry"]):
                suggestions.append("triangle")
            elif any(word in question_lower for word in ["circle", "radius", "diameter"]):
                suggestions.append("circle")
            elif any(word in question_lower for word in ["graph", "coordinate", "plot"]):
                suggestions.append("coordinate_geometry")
            elif any(word in question_lower for word in ["chart", "data", "statistics"]):
                suggestions.extend(["bar_chart", "pie_chart"])
        
        elif subject in ["Physics", "Chemistry", "Biology"]:
            if any(word in question_lower for word in ["cell", "structure", "organelle"]):
                suggestions.append("cell_structure")
            elif any(word in question_lower for word in ["circuit", "electric", "current"]):
                suggestions.append("circuit_diagram")
        
        elif subject == "Geography":
            if any(word in question_lower for word in ["map", "india", "location"]):
                suggestions.append("india_map")
        
        elif subject == "History":
            if any(word in question_lower for word in ["timeline", "history", "event"]):
                suggestions.append("timeline")
        
        return suggestions[:3]  # Return top 3 suggestions
