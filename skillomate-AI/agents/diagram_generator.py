import matplotlib
# Set matplotlib to use non-interactive backend to avoid GUI issues
matplotlib.use('Agg')

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import io
import base64
import json
import logging
import os
from typing import Dict, Any, List, Optional, Tuple
import seaborn as sns
from matplotlib.patches import Circle, Rectangle, Polygon, FancyBboxPatch
import matplotlib.patches as mpatches

logger = logging.getLogger(__name__)

class DiagramGeneratorAgent:
    """
    Agent 4: Diagram Generator
    Creates labeled diagrams (matplotlib/static images).
    """
    
    def __init__(self):
        self.diagram_templates = self._load_diagram_templates()
        self.setup_matplotlib_style()
    
    def setup_matplotlib_style(self):
        """Setup matplotlib style for school-level diagrams"""
        plt.style.use('default')
        plt.rcParams.update({
            'font.size': 12,
            'font.family': 'DejaVu Sans',
            'axes.linewidth': 2,
            'axes.edgecolor': 'black',
            'axes.facecolor': 'white',
            'figure.facecolor': 'white',
            'savefig.facecolor': 'white',
            'savefig.bbox': 'tight',
            'savefig.dpi': 300
        })
    
    def _load_diagram_templates(self) -> Dict[str, Any]:
        """Load diagram templates for different subjects"""
        return {
            "mathematics": {
                "geometry": ["triangle", "circle", "rectangle", "square", "polygon"],
                "graphs": ["line_graph", "bar_graph", "pie_chart", "scatter_plot"],
                "algebra": ["number_line", "coordinate_plane", "function_graph"]
            },
            "science": {
                "physics": ["circuit", "forces", "motion", "energy"],
                "chemistry": ["atom", "molecule", "reaction", "periodic_table"],
                "biology": ["cell", "organ_system", "food_chain", "ecosystem"]
            },
            "geography": {
                "maps": ["india_map", "world_map", "climate_map"],
                "charts": ["climate_graph", "population_chart", "resource_map"]
            },
            "social_studies": {
                "timeline": ["historical_timeline", "event_sequence"],
                "charts": ["comparison_chart", "flow_diagram", "organizational_chart"]
            }
        }
    
    def generate_diagram(self, diagram_type: str, subject: str, context: Dict[str, Any], 
                        data: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Generate a diagram based on type, subject, and context
        """
        try:
            grade = context.get("grade", "8")
            board = context.get("board", "CBSE")
            
            # Determine diagram complexity based on grade
            complexity = self._get_complexity_level(grade)
            
            # Generate the diagram
            if subject.lower() in ["mathematics", "math"]:
                diagram_data = self._generate_math_diagram(diagram_type, complexity, data)
            elif subject.lower() in ["science", "physics", "chemistry", "biology"]:
                diagram_data = self._generate_science_diagram(diagram_type, complexity, data)
            elif subject.lower() in ["geography"]:
                diagram_data = self._generate_geography_diagram(diagram_type, complexity, data)
            elif subject.lower() in ["social studies", "history", "civics"]:
                diagram_data = self._generate_social_studies_diagram(diagram_type, complexity, data)
            else:
                diagram_data = self._generate_general_diagram(diagram_type, complexity, data)
            
            # Convert to base64 for web display
            diagram_base64 = self._convert_to_base64(diagram_data["figure"])
            logger.info(f"Diagram generated successfully. Base64 length: {len(diagram_base64) if diagram_base64 else 0}")
            
            return {
                "success": True,
                "diagram_type": diagram_type,
                "subject": subject,
                "complexity": complexity,
                "image_data": diagram_base64,
                "description": diagram_data["description"],
                "labels": diagram_data.get("labels", []),
                "metadata": {
                    "grade": grade,
                    "board": board,
                    "generated_at": "now"
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating diagram: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "diagram_type": diagram_type,
                "subject": subject
            }
    
    def _get_complexity_level(self, grade: str) -> str:
        """Get diagram complexity based on grade"""
        grade_num = int(grade) if grade.isdigit() else 8
        
        if grade_num <= 5:
            return "simple"
        elif grade_num <= 8:
            return "moderate"
        elif grade_num <= 10:
            return "detailed"
        else:
            return "advanced"
    
    def _generate_math_diagram(self, diagram_type: str, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Generate mathematics diagrams"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        if diagram_type == "triangle":
            return self._create_triangle_diagram(ax, complexity, data)
        elif diagram_type == "circle":
            return self._create_circle_diagram(ax, complexity, data)
        elif diagram_type == "coordinate_plane":
            return self._create_coordinate_plane(ax, complexity, data)
        elif diagram_type == "bar_graph":
            return self._create_bar_graph(ax, complexity, data)
        elif diagram_type == "pie_chart":
            return self._create_pie_chart(ax, complexity, data)
        else:
            return self._create_general_math_diagram(ax, diagram_type, complexity, data)
    
    def _create_triangle_diagram(self, ax, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create a triangle diagram"""
        # Create triangle vertices
        vertices = np.array([[0, 0], [4, 0], [2, 3]])
        triangle = Polygon(vertices, facecolor='lightblue', edgecolor='black', linewidth=2)
        ax.add_patch(triangle)
        
        # Add labels
        ax.text(0, -0.3, 'A', fontsize=14, ha='center', va='top')
        ax.text(4, -0.3, 'B', fontsize=14, ha='center', va='top')
        ax.text(2, 3.3, 'C', fontsize=14, ha='center', va='bottom')
        
        # Add side lengths if data provided
        if data and "sides" in data:
            sides = data["sides"]
            ax.text(2, -0.5, f'a = {sides.get("a", "5")} cm', fontsize=12, ha='center')
            ax.text(0.5, 1.5, f'b = {sides.get("b", "4")} cm', fontsize=12, ha='center')
            ax.text(3.5, 1.5, f'c = {sides.get("c", "3")} cm', fontsize=12, ha='center')
        
        ax.set_xlim(-1, 5)
        ax.set_ylim(-1, 4)
        ax.set_aspect('equal')
        ax.axis('off')
        
        return {
            "figure": plt.gcf(),
            "description": "Triangle ABC with labeled vertices and sides",
            "labels": ["A", "B", "C"]
        }
    
    def _create_circle_diagram(self, ax, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create a circle diagram"""
        center = (0, 0)
        radius = 3
        
        circle = Circle(center, radius, facecolor='lightgreen', edgecolor='black', linewidth=2)
        ax.add_patch(circle)
        
        # Add center point
        ax.plot(0, 0, 'ko', markersize=8)
        ax.text(0.3, 0.3, 'O', fontsize=14)
        
        # Add radius
        ax.plot([0, 3], [0, 0], 'r-', linewidth=2)
        ax.text(1.5, 0.3, 'r', fontsize=12, color='red')
        
        # Add diameter if complexity allows
        if complexity in ["moderate", "detailed", "advanced"]:
            ax.plot([-3, 3], [0, 0], 'b--', linewidth=2)
            ax.text(0, 0.5, 'Diameter', fontsize=12, ha='center', color='blue')
        
        ax.set_xlim(-4, 4)
        ax.set_ylim(-4, 4)
        ax.set_aspect('equal')
        ax.axis('off')
        
        return {
            "figure": plt.gcf(),
            "description": "Circle with center O, radius r, and diameter",
            "labels": ["O", "r", "Diameter"]
        }
    
    def _create_coordinate_plane(self, ax, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create a coordinate plane"""
        # Set up the coordinate plane
        ax.set_xlim(-5, 5)
        ax.set_ylim(-5, 5)
        ax.grid(True, alpha=0.3)
        ax.axhline(y=0, color='black', linewidth=2)
        ax.axvline(x=0, color='black', linewidth=2)
        
        # Add axis labels
        ax.set_xlabel('X-axis', fontsize=12)
        ax.set_ylabel('Y-axis', fontsize=12)
        ax.text(5.2, 0, 'X', fontsize=14, ha='left')
        ax.text(0, 5.2, 'Y', fontsize=14, va='bottom')
        
        # Add origin
        ax.plot(0, 0, 'ko', markersize=6)
        ax.text(0.3, 0.3, 'O', fontsize=12)
        
        # Add points if data provided
        if data and "points" in data:
            points = data["points"]
            for point in points:
                x, y = point["x"], point["y"]
                ax.plot(x, y, 'ro', markersize=8)
                ax.text(x + 0.2, y + 0.2, f'({x}, {y})', fontsize=10)
        
        return {
            "figure": plt.gcf(),
            "description": "Coordinate plane with X and Y axes",
            "labels": ["O", "X", "Y"]
        }
    
    def _create_bar_graph(self, ax, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create a bar graph"""
        if not data or "categories" not in data:
            # Default data for Indian context
            categories = ['Cricket', 'Football', 'Hockey', 'Kabaddi', 'Tennis']
            values = [45, 25, 15, 10, 5]
        else:
            categories = data["categories"]
            values = data["values"]
        
        bars = ax.bar(categories, values, color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'])
        
        # Add value labels on bars
        for bar, value in zip(bars, values):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                   f'{value}%', ha='center', va='bottom', fontsize=10)
        
        ax.set_ylabel('Percentage (%)', fontsize=12)
        ax.set_title('Sports Popularity in India', fontsize=14, fontweight='bold')
        ax.set_ylim(0, max(values) + 10)
        
        # Rotate x-axis labels for better readability
        plt.xticks(rotation=45, ha='right')
        
        return {
            "figure": plt.gcf(),
            "description": f"Bar graph showing {', '.join(categories)}",
            "labels": categories
        }
    
    def _create_pie_chart(self, ax, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create a pie chart"""
        if not data or "categories" not in data:
            # Default data for Indian context
            categories = ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi']
            values = [40, 20, 15, 12, 13]
        else:
            categories = data["categories"]
            values = data["values"]
        
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
        wedges, texts, autotexts = ax.pie(values, labels=categories, autopct='%1.1f%%',
                                         colors=colors, startangle=90)
        
        ax.set_title('Languages Spoken in India', fontsize=14, fontweight='bold')
        
        return {
            "figure": plt.gcf(),
            "description": f"Pie chart showing {', '.join(categories)}",
            "labels": categories
        }
    
    def _generate_science_diagram(self, diagram_type: str, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Generate science diagrams"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        if diagram_type == "circuit":
            return self._create_electric_circuit(ax, complexity, data)
        elif diagram_type == "cell":
            return self._create_cell_diagram(ax, complexity, data)
        elif diagram_type == "atom":
            return self._create_atom_diagram(ax, complexity, data)
        else:
            return self._create_general_science_diagram(ax, diagram_type, complexity, data)
    
    def _create_electric_circuit(self, ax, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create an electric circuit diagram"""
        # Battery
        battery = Rectangle((1, 2), 0.5, 1, facecolor='yellow', edgecolor='black', linewidth=2)
        ax.add_patch(battery)
        ax.text(1.25, 2.5, '+', fontsize=16, ha='center', va='center')
        ax.text(1.25, 2.2, '-', fontsize=16, ha='center', va='center')
        
        # Resistor
        resistor = Rectangle((2, 2), 1, 0.5, facecolor='brown', edgecolor='black', linewidth=2)
        ax.add_patch(resistor)
        ax.text(2.5, 2.25, 'R', fontsize=14, ha='center', va='center')
        
        # Bulb
        bulb = Circle((4, 2.25), 0.3, facecolor='orange', edgecolor='black', linewidth=2)
        ax.add_patch(bulb)
        ax.text(4, 2.25, '💡', fontsize=20, ha='center', va='center')
        
        # Wires
        ax.plot([1.5, 2], [2.5, 2.5], 'k-', linewidth=3)  # Battery to resistor
        ax.plot([3, 3.7], [2.25, 2.25], 'k-', linewidth=3)  # Resistor to bulb
        ax.plot([4.3, 5], [2.25, 2.25], 'k-', linewidth=3)  # Bulb to switch
        ax.plot([5, 5], [2.25, 1.5], 'k-', linewidth=3)  # Switch to battery
        
        # Switch
        switch = Rectangle((4.8, 1.3), 0.4, 0.4, facecolor='gray', edgecolor='black', linewidth=2)
        ax.add_patch(switch)
        ax.text(5, 1.5, 'S', fontsize=14, ha='center', va='center')
        
        # Labels
        ax.text(1.25, 3.2, 'Battery', fontsize=12, ha='center')
        ax.text(2.5, 3.2, 'Resistor', fontsize=12, ha='center')
        ax.text(4, 3.2, 'Bulb', fontsize=12, ha='center')
        ax.text(5, 0.8, 'Switch', fontsize=12, ha='center')
        
        ax.set_xlim(0, 6)
        ax.set_ylim(0, 4)
        ax.axis('off')
        
        return {
            "figure": plt.gcf(),
            "description": "Simple electric circuit with battery, resistor, bulb, and switch",
            "labels": ["Battery", "Resistor", "Bulb", "Switch"]
        }
    
    def _create_cell_diagram(self, ax, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create a cell diagram"""
        # Cell membrane
        cell = Ellipse((0, 0), 4, 3, facecolor='lightblue', edgecolor='black', linewidth=2)
        ax.add_patch(cell)
        
        # Nucleus
        nucleus = Circle((0, 0), 0.8, facecolor='pink', edgecolor='black', linewidth=2)
        ax.add_patch(nucleus)
        ax.text(0, 0, 'Nucleus', fontsize=10, ha='center', va='center')
        
        # Cytoplasm (represented by dots)
        for _ in range(20):
            x = np.random.uniform(-1.5, 1.5)
            y = np.random.uniform(-1, 1)
            if (x**2/2**2 + y**2/1.5**2) < 1:  # Inside cell but outside nucleus
                ax.plot(x, y, 'ko', markersize=2)
        
        # Labels
        ax.text(0, 2, 'Cell Membrane', fontsize=12, ha='center')
        ax.text(0, -2, 'Cytoplasm', fontsize=12, ha='center')
        
        ax.set_xlim(-3, 3)
        ax.set_ylim(-2.5, 2.5)
        ax.axis('off')
        
        return {
            "figure": plt.gcf(),
            "description": "Basic cell structure with nucleus and cytoplasm",
            "labels": ["Cell Membrane", "Nucleus", "Cytoplasm"]
        }
    
    def _generate_geography_diagram(self, diagram_type: str, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Generate geography diagrams"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        if diagram_type == "climate_graph":
            return self._create_climate_graph(ax, complexity, data)
        else:
            return self._create_general_geography_diagram(ax, diagram_type, complexity, data)
    
    def _create_climate_graph(self, ax, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create a climate graph"""
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        if not data:
            # Default data for Indian climate
            temperature = [20, 22, 26, 30, 32, 30, 28, 28, 27, 26, 23, 21]
            rainfall = [20, 15, 25, 30, 80, 150, 200, 180, 120, 60, 30, 25]
        else:
            temperature = data.get("temperature", [20, 22, 26, 30, 32, 30, 28, 28, 27, 26, 23, 21])
            rainfall = data.get("rainfall", [20, 15, 25, 30, 80, 150, 200, 180, 120, 60, 30, 25])
        
        # Create dual-axis plot
        ax2 = ax.twinx()
        
        # Temperature line
        line1 = ax.plot(months, temperature, 'r-o', linewidth=2, markersize=6, label='Temperature (°C)')
        ax.set_ylabel('Temperature (°C)', color='red', fontsize=12)
        ax.tick_params(axis='y', labelcolor='red')
        
        # Rainfall bars
        bars = ax2.bar(months, rainfall, alpha=0.6, color='blue', label='Rainfall (mm)')
        ax2.set_ylabel('Rainfall (mm)', color='blue', fontsize=12)
        ax2.tick_params(axis='y', labelcolor='blue')
        
        ax.set_title('Climate Graph - India', fontsize=14, fontweight='bold')
        ax.set_xlabel('Months', fontsize=12)
        
        # Rotate x-axis labels
        plt.xticks(rotation=45)
        
        return {
            "figure": plt.gcf(),
            "description": "Climate graph showing temperature and rainfall patterns",
            "labels": months
        }
    
    def _generate_social_studies_diagram(self, diagram_type: str, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Generate social studies diagrams"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        if diagram_type == "timeline":
            return self._create_timeline(ax, complexity, data)
        else:
            return self._create_general_social_studies_diagram(ax, diagram_type, complexity, data)
    
    def _create_timeline(self, ax, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create a historical timeline"""
        if not data:
            # Default Indian independence timeline
            events = [
                {"year": "1857", "event": "First War of Independence"},
                {"year": "1885", "event": "Indian National Congress Founded"},
                {"year": "1905", "event": "Partition of Bengal"},
                {"year": "1919", "event": "Jallianwala Bagh Massacre"},
                {"year": "1942", "event": "Quit India Movement"},
                {"year": "1947", "event": "India Gains Independence"}
            ]
        else:
            events = data.get("events", [])
        
        # Create timeline
        years = [int(event["year"]) for event in events]
        y_positions = np.linspace(0, len(events)-1, len(events))
        
        # Timeline line
        ax.plot([min(years), max(years)], [0, 0], 'k-', linewidth=3)
        
        # Events
        for i, event in enumerate(events):
            year = int(event["year"])
            ax.plot(year, 0, 'ro', markersize=10)
            ax.text(year, 0.5, event["event"], fontsize=10, ha='center', va='bottom', 
                   rotation=45, rotation_mode='anchor')
            ax.text(year, -0.3, year, fontsize=12, ha='center', va='top', fontweight='bold')
        
        ax.set_title('Historical Timeline', fontsize=14, fontweight='bold')
        ax.set_xlabel('Year', fontsize=12)
        ax.set_ylim(-1, 2)
        ax.axis('off')
        
        return {
            "figure": plt.gcf(),
            "description": "Historical timeline showing key events",
            "labels": [event["event"] for event in events]
        }
    
    def _create_general_math_diagram(self, ax, diagram_type: str, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create general math diagrams"""
        ax.text(0.5, 0.5, f'Math Diagram: {diagram_type}', fontsize=16, ha='center', va='center')
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        return {
            "figure": plt.gcf(),
            "description": f"General mathematics diagram: {diagram_type}",
            "labels": []
        }
    
    def _create_general_science_diagram(self, ax, diagram_type: str, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create general science diagrams"""
        ax.text(0.5, 0.5, f'Science Diagram: {diagram_type}', fontsize=16, ha='center', va='center')
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        return {
            "figure": plt.gcf(),
            "description": f"General science diagram: {diagram_type}",
            "labels": []
        }
    
    def _create_general_geography_diagram(self, ax, diagram_type: str, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create general geography diagrams"""
        ax.text(0.5, 0.5, f'Geography Diagram: {diagram_type}', fontsize=16, ha='center', va='center')
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        return {
            "figure": plt.gcf(),
            "description": f"General geography diagram: {diagram_type}",
            "labels": []
        }
    
    def _create_general_social_studies_diagram(self, ax, diagram_type: str, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Create general social studies diagrams"""
        ax.text(0.5, 0.5, f'Social Studies Diagram: {diagram_type}', fontsize=16, ha='center', va='center')
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        return {
            "figure": plt.gcf(),
            "description": f"General social studies diagram: {diagram_type}",
            "labels": []
        }
    
    def _convert_to_base64(self, figure) -> str:
        """Convert matplotlib figure to base64 string"""
        try:
            # Save figure to bytes buffer
            buf = io.BytesIO()
            figure.savefig(buf, format='png', dpi=300, bbox_inches='tight')
            buf.seek(0)
            
            # Convert to base64
            img_str = base64.b64encode(buf.getvalue()).decode('utf-8')
            
            # Close the figure to free memory
            plt.close(figure)
            
            logger.info(f"Successfully converted figure to base64. Length: {len(img_str)}")
            return img_str
            
        except Exception as e:
            logger.error(f"Error converting figure to base64: {str(e)}")
            return ""
    
    def get_available_diagrams(self, subject: str) -> List[str]:
        """Get available diagram types for a subject"""
        subject_lower = subject.lower()
        
        if subject_lower in ["mathematics", "math"]:
            return (self.diagram_templates["mathematics"]["geometry"] + 
                   self.diagram_templates["mathematics"]["graphs"] + 
                   self.diagram_templates["mathematics"]["algebra"])
        elif subject_lower in ["science", "physics", "chemistry", "biology"]:
            return (self.diagram_templates["science"]["physics"] + 
                   self.diagram_templates["science"]["chemistry"] + 
                   self.diagram_templates["science"]["biology"])
        elif subject_lower in ["geography"]:
            return (self.diagram_templates["geography"]["maps"] + 
                   self.diagram_templates["geography"]["charts"])
        elif subject_lower in ["social studies", "history", "civics"]:
            return (self.diagram_templates["social_studies"]["timeline"] + 
                   self.diagram_templates["social_studies"]["charts"])
        else:
            return ["general_diagram"]
    
    def _generate_general_diagram(self, diagram_type: str, complexity: str, data: Optional[Dict]) -> Dict[str, Any]:
        """Generate a general diagram for unknown subjects"""
        try:
            fig, ax = plt.subplots(figsize=(8, 6))
            
            # Create a simple placeholder diagram
            ax.text(0.5, 0.5, f'Diagram: {diagram_type}', fontsize=16, ha='center', va='center')
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis('off')
            
            return {
                "figure": fig,
                "description": f"General diagram: {diagram_type}",
                "labels": []
            }
            
        except Exception as e:
            logger.error(f"Error generating general diagram: {str(e)}")
            # Return a simple text-based diagram
            fig, ax = plt.subplots(figsize=(8, 6))
            ax.text(0.5, 0.5, 'Diagram Generation Error', fontsize=14, ha='center', va='center', color='red')
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis('off')
            
            return {
                "figure": fig,
                "description": "Error generating diagram",
                "labels": []
            }
