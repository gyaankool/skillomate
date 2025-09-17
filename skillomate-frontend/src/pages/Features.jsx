import { FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import person from "../assets/images/cyber_person.png";
import round from "../assets/images/round.png";
import wifi from "../assets/images/wifi.png";
import Vector from "../assets/images/Vector.png";
import Group from "../assets/images/Group.png";

export default function Features() {
  const navigate = useNavigate();

  // Features from the homework solving modal
  const features = [
    {
      title: "Context Aware Solver",
      description: "AI that understands your homework context and gives accurate answers.",
      icon: <FaCheckCircle className="text-orange-500 text-6xl" />,
      details: "Our AI analyzes your specific homework context, including your class, board, and subject to provide the most relevant and accurate solutions."
    },
    {
      title: "Step-by-step Guider Mode",
      description: "Solve problems step by step, just like a personal tutor.",
      icon: <img src={person} alt="Step-by-step guide" className="h-16 w-16" />,
      details: "Get detailed, step-by-step solutions that help you understand the process, not just the answer. Perfect for learning and exam preparation."
    },
    {
      title: "Teacher-approved Formatting",
      description: "Ask your doubts using voice commands and get instant solutions.",
      icon: <img src={Vector} alt="Teacher format" className="h-16 w-16" />,
      details: "Solutions are formatted exactly as teachers expect, with proper structure, diagrams, and explanations that match your curriculum standards."
    },
    {
      title: "Voice Chat Mode",
      description: "Upload your homework and let AI guide you with solutions.",
      icon: <img src={Group} alt="Voice chat" className="h-16 w-16" />,
      details: "Simply speak your questions and get instant voice responses. Perfect for hands-free learning and accessibility."
    },
    {
      title: "Diagram & Chart Generator",
      description: "Generate visual diagrams and charts to better understand concepts.",
      icon: <img src={round} alt="Diagram generator" className="h-16 w-16" />,
      details: "Create interactive diagrams, flowcharts, and visual representations to make complex topics easier to understand and remember."
    },
    {
      title: "Offline/Low Data Mode",
      description: "Continue learning even with limited internet connectivity.",
      icon: <img src={wifi} alt="Offline mode" className="h-16 w-16" />,
      details: "Access cached solutions and continue your learning journey even when internet is slow or unavailable."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition-colors"
            >
              <FaArrowLeft className="text-lg" />
              <span className="font-medium">Back to Home</span>
            </button>
            <h1 className="text-2xl font-bold text-orange-500">GetSkilled Homework Helper</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="text-orange-500"> Smart Learning</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover all the amazing features that make GetSkilled Homework Helper your perfect homework companion
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-100"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-center mb-4">
                {feature.description}
              </p>

              {/* Details */}
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                {feature.details}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Experience These Features?
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
