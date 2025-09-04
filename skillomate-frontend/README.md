# Sales Application Web UI

A modern, responsive React-based web application for comprehensive sales management with AI-powered features, real-time communication, and intuitive user interface.

## 🚀 Overview

The Sales Application Web UI is a feature-rich frontend application built with React and Vite that provides a complete sales management interface. It includes role-based dashboards, lead management, voice calling capabilities, AI-powered conversations, and real-time analytics.

## Key Features

### Role-Based Dashboard
- **Admin Dashboard**: Company-wide analytics, team performance, lead distribution
- **User Dashboard**: Personal performance metrics, assigned leads, quick actions
- **Real-time Updates**: Live data synchronization across all components

### 📊 Lead Management
- **Lead Creation & Editing**: Comprehensive lead forms with validation
- **Lead Tracking**: Visual pipeline with drag-and-drop functionality
- **Lead Analytics**: Detailed performance metrics and conversion tracking
- **Bulk Operations**: Mass lead management capabilities
- **Lead Assignment**: Team member assignment and tracking

### 📞 Voice Calling System
- **Integrated Calling**: Direct calling from the application
- **Call History**: Complete call records with analytics
- **AI-Powered Calls**: AI assistant integration for calls
- **Real-time Status**: Live call status updates
- **Call Recording**: Automatic call recording and transcription

### 🤖 AI-Powered Features
- **Live Suggestions**: Real-time conversation suggestions
- **Speech-to-Text**: Real-time transcription during calls
- **AI Conversations**: Intelligent conversation management
- **Sentiment Analysis**: Call sentiment tracking and insights

### 📦 Product Management
- **Product Catalog**: Complete product management system
- **Category Management**: Hierarchical product organization
- **Inventory Tracking**: Stock management and alerts
- **Product Analytics**: Sales performance tracking

### 📈 Analytics & Reporting
- **Performance Metrics**: Individual and team performance
- **Conversion Tracking**: Lead-to-customer conversion rates
- **Call Analytics**: Detailed call performance insights
- **Real-time Dashboards**: Live data visualization

### 🔐 Authentication & Security
- **JWT Authentication**: Secure login and session management
- **Role-based Access**: Admin and user permission levels
- **Profile Management**: User profile and settings
- **Password Security**: Secure password reset functionality

## 🏗️ Architecture

### Tech Stack
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + Styled Components
- **State Management**: React Context API
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **UI Components**: Custom components + React Icons
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

### Project Structure
```
src/
├── components/
│   ├── AllLeads/           # Lead management components
│   │   ├── ActivityComp.jsx
│   │   ├── Analytics.jsx
│   │   ├── LeadComp.jsx
│   │   ├── NewLeads.jsx
│   │   └── SingleLead.jsx
│   ├── Dashboard/          # Dashboard components
│   │   ├── AdminDashboard.jsx
│   │   ├── Dashboard.jsx
│   │   ├── UserDashboard.jsx
│   │   └── Leads/
│   ├── Login-SignUp/      # Authentication components
│   │   ├── LoginRoute.jsx
│   │   ├── NewLogin.jsx
│   │   ├── Signup.jsx
│   │   └── ...
│   ├── OnCall/            # Voice calling components
│   │   ├── Calling.jsx
│   │   ├── CallHistory.jsx
│   │   └── ...
│   ├── Products/          # Product management
│   │   ├── Products.jsx
│   │   ├── NewProducts.jsx
│   │   └── ...
│   └── SalesPerson/       # Sales team management
├── context/
│   └── UserContext.jsx    # Global state management
├── utilities/
│   └── constants.js       # Application constants
├── assets/
│   └── images/           # Static assets
├── App.jsx               # Main application component
└── main.jsx             # Application entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see server README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sales-app-web-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=https://skillomate-backend.onrender.com/api
VITE_SOCKET_URL=https://skillomate-backend.onrender.com
VITE_AI_SERVER_URL=https://skillomate.onrender.com
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📱 User Flow

### 1. Authentication Flow
```
Login → OTP Verification → Dashboard
     ↓
Signup → Profile Completion → Dashboard
     ↓
Forgot Password → Reset → Login
```

### 2. Lead Management Flow
```
Dashboard → Create Lead → Lead Details
     ↓
Lead List → Edit Lead → Update Status
     ↓
Analytics → Performance Tracking
```

### 3. Voice Calling Flow
```
Lead Details → Start Call → AI Assistant
     ↓
Real-time Transcription → Live Suggestions
     ↓
Call Summary → Analytics
```

### 4. Product Management Flow
```
Products → Create Product → Category Assignment
     ↓
Inventory Management → Sales Tracking
     ↓
Product Analytics → Performance Reports
```

## 🎨 Component Documentation

### Core Components

#### Dashboard Components
- **`AdminDashboard.jsx`**: Company-wide analytics and team management
- **`UserDashboard.jsx`**: Personal performance and assigned leads
- **`Dashboard.jsx`**: Main dashboard router component

#### Lead Management
- **`NewLeads.jsx`**: Lead listing with filtering and search
- **`SingleLead.jsx`**: Individual lead details and management
- **`Analytics.jsx`**: Lead performance analytics
- **`ActivityComp.jsx`**: Lead activity tracking

#### Voice Calling
- **`Calling.jsx`**: Main calling interface
- **`CallHistory.jsx`**: Call records and analytics
- **`ConvoUser.jsx`**: User conversation interface
- **`ConvoRobo.jsx`**: AI conversation interface

#### Authentication
- **`LoginRoute.jsx`**: Main authentication router
- **`NewLogin.jsx`**: Login form component
- **`Signup.jsx`**: User registration
- **`Otp.jsx`**: OTP verification

### State Management

#### UserContext
```javascript
const { user, setUser, isAuthenticated, logout } = useUser();
```

#### API Integration
- **Base URL**: Configurable via environment variables
- **Authentication**: JWT token management
- **Error Handling**: Global error handling with toast notifications
- **Loading States**: Consistent loading indicators

## 🔧 Configuration

### Environment Variables
- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_SOCKET_URL`: WebSocket server URL
- `VITE_AI_SERVER_URL`: AI server URL for voice features

### API Integration
The application integrates with the backend API through:
- **RESTful APIs**: Lead, product, and user management
- **WebSocket**: Real-time updates and notifications
- **AI Server**: Voice calling and conversation features

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive tablet layouts
- **Desktop**: Full-featured desktop experience
- **Breakpoints**: Tailwind CSS responsive breakpoints

## 🎯 Key Features Deep Dive

### Role-Based Access Control
```javascript
// Admin Dashboard Features
- Company statistics overview
- Team performance metrics
- Lead distribution analytics
- Quick action buttons

// User Dashboard Features
- Personal performance metrics
- Assigned leads list
- Quick access to common actions
- Recent activity timeline
```

### Real-time Features
- **Live Updates**: Real-time data synchronization
- **WebSocket Integration**: Instant notifications
- **Call Status**: Live call status updates
- **Chat Integration**: Real-time messaging

### AI Integration
- **Voice Recognition**: Real-time speech-to-text
- **Live Suggestions**: AI-powered conversation hints
- **Sentiment Analysis**: Call sentiment tracking
- **Call Summaries**: Automated call summaries

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run tests (if configured)
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment

### Production Build
```bash
npm run build
```

### Static Hosting
The application can be deployed to any static hosting service:
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **AWS S3**: Static website hosting
- **Firebase Hosting**: Google's hosting solution

### Environment Configuration
Ensure all environment variables are set in production:
```env
VITE_API_BASE_URL=https://skillomate-backend.onrender.com/api
VITE_SOCKET_URL=https://skillomate-backend.onrender.com
VITE_AI_SERVER_URL=https://skillomate.onrender.com
```

## 🔒 Security Considerations

- **JWT Token Management**: Secure token storage and refresh
- **Input Validation**: Client-side form validation
- **XSS Prevention**: Sanitized user inputs
- **CORS Configuration**: Proper CORS setup
- **HTTPS**: Secure communication in production

## 📊 Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Optimized static assets
- **Bundle Optimization**: Vite build optimizations
- **Caching**: Browser caching strategies
- **Lazy Loading**: On-demand component loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with basic features
- **v1.1.0** - Added role-based dashboards
- **v1.2.0** - Integrated voice calling features
- **v1.3.0** - Enhanced AI integration
- **v1.4.0** - Real-time features and WebSocket integration

---

**Built with ❤️ by the Sales Team**
