import { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import person from "../assets/images/cyber_person.png";
import round from "../assets/images/round.png";
import wifi from "../assets/images/wifi.png";
import Vector from "../assets/images/Vector.png";
import Group from "../assets/images/Group.png";
import profile from "../assets/images/profile.png";

export default function HeroPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  // Define steps
  const steps = [
    {
      title: "Context Aware Solver",
      desc: "AI that understands your homework context and gives accurate answers.",
      icon: <FaCheckCircle className="text-orange-500 text-8xl" />,
    },
    {
      title: "Step-by-step Guider Mode",
      desc: "Solve problems step by step, just like a personal tutor.",
      icon: <img src={person} alt="" className="h-20 w-20" />,
    },
    {
      title: "Teacher-approved Formatting",
      desc: "Ask your doubts using voice commands and get instant solutions.",
      icon: <img src={Vector} alt="" className="h-20 w-20" />,
    },
    {
      title: "Voice Chat Mode",
      desc: "Upload your homework and let AI guide you with solutions.",
      icon: <img src={Group} alt="" className="h-20 w-20" />,
    },
    {
      title: "Diagram & Chart Generator",
      //   desc: "Easily upload questions as images or PDFs and solve them quickly.",
      icon: <img src={round} alt="" className="h-20 w-20" />,
    },
    {
      title: "Offline/Low Data Mode",
      //   desc: "Get recommended tips and tricks to improve your problem-solving.",
      icon: <img src={wifi} alt="" className="h-20 w-20" />,
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setIsModalOpen(false); // Close after last step
      setStep(0); // Reset to first step
      // Navigate to login after modal closes
      navigate('/login');
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    setIsModalOpen(false);
    setStep(0);
    // Navigate to login when skipped
    navigate('/login');
  };

  const handleGuestMode = () => {
    // Navigate directly to dashboard for guest mode
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/4144222/pexels-photo-4144222.jpeg"
          alt="Homework"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-80"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-4 md:px-10 py-6 text-white">
        <h1 className="text-orange-500 font-bold text-xl md:text-2xl">GetSkilled Homework Helper</h1>
        <ul className="hidden md:flex gap-48 text-lg font-medium">
          <li 
            className="text-orange-400 cursor-pointer hover:text-orange-300"
            onClick={() => navigate('/features')}
          >
            Features
          </li>
          <li 
            className="text-orange-400 cursor-pointer hover:text-orange-300"
            onClick={() => navigate('/support')}
          >
            Support
          </li>
          <li 
            className="text-orange-400 cursor-pointer hover:text-orange-300"
            onClick={() => navigate('/login')}
          >
            Login
          </li>
        </ul>
         <div
    className="block md:hidden text-orange-400 cursor-pointer  hover:text-orange-300 text-lg font-medium"
    onClick={() => navigate('/login')}
  >
    Login
  </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white h-[80vh] px-6">
        <span className="mb-4 text-3xl md:text-5xl font-bold">
          Your AI Powered{" "}
        </span>
        <br />
        <span className="text-orange-500 text-3xl md:text-5xl font-bold">
          Homework Buddy
        </span>
        <p className="mt-4 text-gray-200 max-w-2xl text-base md:text-xl">
          Board-specific, step-by-step, and voice-enabled
          <br />
          homework help.
        </p>

        <div className="md:mt-20 mt-40 space-y-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#F47B0B] hover:bg-orange-600 px-6 py-3 rounded-lg text-lg font-semibold shadow-md"
          >
            Start Solving Homework
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white flex flex-col justify-between rounded-2xl shadow-lg w-[90%] md:w-[600px] p-8 relative min-h-[400px]">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                <div
                  className="h-2 bg-orange-500 rounded-full"
                  style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
              <button
                className="text-sm text-orange-500"
                onClick={handleSkip}
              >
                Skip
              </button>
            </div>

            <div>
              {/* Icon */}
              <div className="flex justify-center mb-4">{steps[step].icon}</div>

              {/* Title + Description */}
              <h3 className="text-2xl font-bold text-center">
                {steps[step].title}
              </h3>
              <p className="font-bold text-center mt-2">{steps[step].desc}</p>
            </div>
            {/* Buttons */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handleBack}
                disabled={step === 0}
                className={`flex items-center space-x-2 px-5 py-2 rounded-lg ${
                  step === 0
                    ? "bg-orange-300 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                <FaArrowLeft /> <span>Back</span>
              </button>
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600"
              >
                <span>{step === steps.length - 1 ? "Finish" : "Next"}</span>{" "}
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
