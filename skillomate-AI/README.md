# Skillomate AI Homework Solver v2.0

An intelligent, curriculum-aligned AI homework assistant designed specifically for Indian students with agentic AI architecture.

## 🌟 Key Features

### 1. **Context-Aware Answering**
- **Board Detection**: Automatically detects CBSE, ICSE, IB, or State boards
- **Grade-Level Adaptation**: Adjusts explanation depth and vocabulary based on grade (1-12)
- **India-Specific Localization**: 
  - Uses Indian Rupees (₹) instead of dollars
  - Includes Indian examples (cricket, festivals, local geography)
  - References Indian leaders, events, and scientific achievements (ISRO)

### 2. **Progressive Guided Learning**
- **4-Level Hint System**: From basic hints to complete solutions
- **Adaptive Explanations**: Younger grades get detailed explanations, higher grades get concise answers
- **Step-by-Step Guidance**: Perfect for problem-solving in mathematics and science

### 3. **Teacher-Approved Formatting**
- **Structured Output**: Headings, numbered steps, bullet points
- **Subject-Specific Templates**: Different formats for math, science, social studies
- **Exam-Ready Format**: Professional formatting for academic submissions

### 4. **Smart Diagram Generation**
- **Mathematics**: Triangles, circles, coordinate planes, bar graphs, pie charts
- **Science**: Electric circuits, cell diagrams, atoms
- **Geography**: Climate graphs, maps
- **Social Studies**: Historical timelines, comparison charts
- **Grade-Appropriate Complexity**: Simple for primary, detailed for higher grades

### 5. **Offline + Low Data Mode**
- **Local Caching**: SQLite database for Q&A storage
- **JSON Backup**: Lightweight JSON cache for offline access
- **Smart Search**: Find similar questions in cache
- **Export/Import**: Share cache between devices

## 🏗️ Architecture

### Agentic AI System

1. **Curriculum Mapper Agent**
   - Detects board, grade, subject from questions
   - Applies India-specific localization
   - Creates context-aware prompts

2. **Guided Solver Agent**
   - Implements progressive hint system
   - Adapts explanations by grade level
   - Provides step-by-step guidance

3. **Formatter Agent**
   - Structures answers in teacher-approved format
   - Applies subject-specific templates
   - Ensures exam-ready presentation

4. **Diagram Generator Agent**
   - Creates labeled diagrams using matplotlib
   - Supports multiple subjects and complexity levels
   - Generates base64 images for web display

5. **Offline Cache Agent**
   - Manages SQLite and JSON caching
   - Provides search functionality
   - Handles cache export/import

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API key
- Required packages (see requirements.txt)

### Installation

1. **Clone the repository**
   ```bash
git clone <repository-url>
   cd skillomate-AI
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   # Option A: Use the setup script (recommended)
   python setup_env.py
   
   # Option B: Set manually
   export OPENAI_API_KEY="your-openai-api-key"
   ```

4. **Run the application**
```bash
python app.py
```

The server will start on `http://localhost:8000`

## 🔧 Environment Setup

### Using the Setup Script (Recommended)
```bash
python setup_env.py
```
This will:
- Create a `.env` file with all necessary configuration
- Guide you through setting up your OpenAI API key
- Verify your configuration

### Manual Setup
1. Create a `.env` file in the project root:
```bash
OPENAI_API_KEY=your_openai_api_key_here
FLASK_PORT=8000
FLASK_DEBUG=True
```

2. Replace `your_openai_api_key_here` with your actual OpenAI API key

### Troubleshooting
- **"OPENAI_API_KEY is required but not found"**: Make sure your `.env` file exists and contains the correct API key
- **"module 'openai' has no attribute 'OpenAI'"**: Run `pip install --upgrade openai` to get the latest version

## 📚 API Endpoints

### Core Homework Assistance

#### `/api/homework` (POST)
Main endpoint for comprehensive homework assistance.

**Request:**
  ```json
  {
  "question": "What is the area of a triangle with base 6cm and height 4cm?",
    "context": {
    "board": "CBSE",
    "grade": "8",
    "subject": "Mathematics"
  },
  "mode": "comprehensive"
}
```

**Response:**
```json
{
  "success": true,
  "source": "ai_generated",
  "answer": "**Solution:**\n\n**Given:**\n- Base of triangle = 6 cm\n- Height of triangle = 4 cm\n\n**To Find:**\n- Area of the triangle\n\n**Formula:**\nArea of triangle = ½ × base × height\n\n**Solution:**\n1. Substitute the values:\n   Area = ½ × 6 cm × 4 cm\n\n2. Calculate:\n   Area = ½ × 24 cm²\n   Area = 12 cm²\n\n**Answer:** The area of the triangle is **12 cm²**.",
  "context": {
    "board": "CBSE",
    "grade": "8",
    "subject": "Mathematics"
  },
  "diagram": {
    "image_data": "base64-encoded-image",
    "description": "Triangle with labeled base and height",
    "type": "triangle"
  }
}
```

#### `/api/guided-learning` (POST)
Progressive hint system for step-by-step learning.

**Request:**
```json
{
  "question": "Solve: 2x + 5 = 13",
  "context": {
    "board": "CBSE",
    "grade": "7",
    "subject": "Mathematics"
  },
  "current_level": 1
}
```

**Response:**
```json
{
  "success": true,
  "mode": "guided",
  "hint_level": 1,
  "max_levels": 4,
  "hint": "**Hint 1:**\n\nLook at the equation: 2x + 5 = 13\n\nWhat operation do you need to perform to isolate 'x'?\n\nThink about: What is the opposite of adding 5?",
  "next_action": "show_detailed_hint",
  "is_complete": false
}
```

#### `/api/diagram` (POST)
Generate subject-specific diagrams and charts.

**Request:**
```json
{
  "question": "Draw a bar graph showing sports popularity in India",
  "context": {
    "board": "CBSE",
    "grade": "6",
    "subject": "Mathematics"
  }
}
```

**Response:**
  ```json
  {
  "success": true,
  "source": "generated",
  "diagram": {
    "image_data": "base64-encoded-image",
    "description": "Bar graph showing sports popularity in India",
    "type": "bar_graph",
    "complexity": "moderate"
  }
}
```

### Cache Management

#### `/api/cache/stats` (GET)
Get cache statistics.

#### `/api/cache/search` (GET)
Search cached content.
```
/api/cache/search?query=triangle&subject=Mathematics&grade=8
```

#### `/api/cache/clear` (POST)
Clear old cache entries.
```json
{
  "days": 30
}
```

#### `/api/cache/export` (POST)
Export cache to file.
```json
{
  "path": "cache_export.json"
}
```

#### `/api/cache/import` (POST)
Import cache from file.
```json
{
  "path": "cache_import.json"
}
```

### Utility Endpoints

#### `/api/available-diagrams` (GET)
Get available diagram types for a subject.
```
/api/available-diagrams?subject=Mathematics
```



## 🎯 Usage Examples

### Example 1: Mathematics Problem
```python
import requests

response = requests.post('http://localhost:8000/api/homework', json={
    "question": "A shopkeeper bought 50 kg of rice for ₹2000. He sold it at ₹45 per kg. Find his profit percentage.",
    "context": {
        "board": "CBSE",
        "grade": "8",
        "subject": "Mathematics"
    }
})

print(response.json()['answer'])
```

### Example 2: Science Diagram
```python
response = requests.post('http://localhost:8000/api/diagram', json={
    "question": "Draw an electric circuit with a battery, resistor, and bulb",
    "context": {
        "board": "CBSE",
        "grade": "7",
        "subject": "Science"
    }
})

# Save diagram image
import base64
image_data = response.json()['diagram']['image_data']
with open('circuit.png', 'wb') as f:
    f.write(base64.b64decode(image_data))
```

### Example 3: Guided Learning
```python
# Get first hint
response = requests.post('http://localhost:8000/api/guided-learning', json={
    "question": "Explain the process of photosynthesis",
    "context": {
        "board": "CBSE",
        "grade": "6",
        "subject": "Science"
    },
    "current_level": 1
})

print(response.json()['hint'])

# Get next hint
response = requests.post('http://localhost:8000/api/guided-learning', json={
    "question": "Explain the process of photosynthesis",
    "context": {
        "board": "CBSE",
        "grade": "6",
        "subject": "Science"
    },
    "current_level": 2
})
```

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key
- `FLASK_ENV`: Set to 'development' for debug mode
- `PORT`: Server port (default: 8000)

### Curriculum Customization
Edit `data/curriculum.json` to customize:
- Board-specific guidelines
- Grade-level characteristics
- Subject-specific templates
- Localization settings

### Cache Configuration
- Cache directory: `cache/`
- SQLite database: `cache/skillomate_cache.db`
- JSON cache: `cache/qa_cache.json`

## 📊 Supported Features by Subject

### Mathematics
- **Topics**: Algebra, Geometry, Trigonometry, Statistics
- **Diagrams**: Triangles, circles, coordinate planes, bar graphs, pie charts
- **Localization**: Indian currency, local measurements

### Science
- **Topics**: Physics, Chemistry, Biology
- **Diagrams**: Electric circuits, cell diagrams, atoms, molecules
- **Localization**: ISRO examples, Indian scientists

### Social Studies
- **Topics**: History, Geography, Civics, Economics
- **Diagrams**: Timelines, maps, comparison charts
- **Localization**: Indian independence, local leaders

### English
- **Topics**: Literature, Grammar, Composition
- **Formatting**: Literary analysis, creative writing
- **Localization**: Indian authors, local expressions

## 🎨 Diagram Types

### Mathematics
- `triangle` - Triangle with labeled sides and angles
- `circle` - Circle with radius, diameter, center
- `coordinate_plane` - X-Y coordinate system
- `bar_graph` - Bar charts with data
- `pie_chart` - Pie charts with percentages

### Science
- `circuit` - Electric circuit with components
- `cell` - Cell structure with organelles
- `atom` - Atomic structure with electrons

### Geography
- `climate_graph` - Temperature and rainfall patterns

### Social Studies
- `timeline` - Historical events timeline

## 🔍 Cache Management

### Cache Statistics
```bash
curl http://localhost:8000/api/cache/stats
```

### Search Cache
```bash
curl "http://localhost:8000/api/cache/search?query=triangle&subject=Mathematics"
```

### Export Cache
```bash
curl -X POST http://localhost:5000/api/cache/export \
  -H "Content-Type: application/json" \
  -d '{"path": "my_cache.json"}'
```

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment
```bash
# Using gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Using Docker
docker build -t skillomate-ai .
docker run -p 5000:5000 -e OPENAI_API_KEY=your-key skillomate-ai
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API examples

## 🔄 Version History

### v2.0 (Current)
- Agentic AI architecture
- Context-aware curriculum mapping
- Progressive guided learning
- Enhanced diagram generation
- Offline caching system
- India-specific localization

### v1.0
- Basic AI chat functionality
- Simple chart generation

---

**Built with ❤️ for Indian students**

