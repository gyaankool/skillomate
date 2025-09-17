import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaEnvelope, 
  FaPhone, 
  FaClock, 
  FaHeadset, 
  FaQuestionCircle, 
  FaArrowLeft,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaTelegram
} from "react-icons/fa";

const Support = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contact');

  const contactInfo = {
    email: "studentsatgetskilled@gmail.com",
    phone: "+91 95910 09606",
    whatsapp: "+91 95910 09606"
  };

  const faqData = [
    {
      question: "How do I get started with GetSkilled Homework Helper?",
      answer: "Simply sign up for an account, select your class/grade, and start asking homework questions. Our AI will provide step-by-step solutions tailored to your curriculum."
    },
    {
      question: "What subjects are supported?",
      answer: "We support all major subjects including Mathematics, Science, English, Social Studies, and more for classes KG to 10th grade."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer a free trial with limited questions so you can experience our AI-powered homework assistance before subscribing."
    },
    {
      question: "How accurate are the AI-generated solutions?",
      answer: "Our AI is trained on curriculum-specific content and provides highly accurate solutions. However, we always recommend reviewing the solutions and understanding the concepts."
    },
    {
      question: "Can I use this app offline?",
      answer: "Yes, we have an offline mode that allows you to access previously solved questions and basic features when you don't have internet connectivity."
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "We offer a 7-day money-back guarantee. If you're not satisfied, contact our support team and we'll process a full refund."
    }
  ];

  const handleEmailClick = () => {
    window.location.href = `mailto:${contactInfo.email}?subject=GetSkilled Support Request`;
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${contactInfo.phone}`;
  };

  const handleWhatsAppClick = () => {
    const message = "Hi! I need help with GetSkilled Homework Helper.";
    window.open(`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors"
              >
                <FaArrowLeft className="text-lg" />
                <span className="font-medium">Back to Home</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">GetSkilled Support</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
            <FaHeadset className="text-3xl text-orange-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to support your learning journey. Get in touch with our team for any questions, 
            technical issues, or feedback about GetSkilled Homework Helper.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'contact'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'faq'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              FAQ
            </button>
          </div>
        </div>

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
              
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FaEnvelope className="text-orange-600 text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Email Support</h4>
                    <p className="text-gray-600 mb-2">Send us an email and we'll respond within 24 hours</p>
                    <button
                      onClick={handleEmailClick}
                      className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    >
                      {contactInfo.email}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FaPhone className="text-orange-600 text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Phone Support</h4>
                    <p className="text-gray-600 mb-2">Call us for immediate assistance</p>
                    <button
                      onClick={handlePhoneClick}
                      className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    >
                      {contactInfo.phone}
                    </button>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaWhatsapp className="text-green-600 text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">WhatsApp Support</h4>
                    <p className="text-gray-600 mb-2">Chat with us on WhatsApp for quick help</p>
                    <button
                      onClick={handleWhatsAppClick}
                      className="text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                      {contactInfo.whatsapp}
                    </button>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FaClock className="text-orange-600 text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Business Hours</h4>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                      Saturday: 10:00 AM - 4:00 PM IST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-6">
                {faqData.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <FaQuestionCircle className="text-orange-600 text-sm" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {faq.question}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  Still have questions? We're here to help!
                </p>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Support Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Immediate Help?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              For urgent technical issues or immediate assistance, please call us directly or 
              reach out via WhatsApp for the fastest response.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handlePhoneClick}
                className="flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
              >
                <FaPhone />
                <span>Call Now</span>
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;

