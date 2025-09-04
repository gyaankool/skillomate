import { useState } from "react";
import book from './assets/images/book.png';
import calculator from './assets/images/calculator.png';
import notes from './assets/images/notes.png';
import graph from './assets/images/graph.png';
import Navbar from "./components/Navbar";

export default function Offline() {
  const [isCollapsed, setIsCollapsed] = useState(false);
   const [offlineMode, setOfflineMode] = useState(false); 

  const features = [
    {
      title: "Saved Notes & Key Concept",
    //   icon: <FaBookOpen className="text-orange-500 text-4xl" />,
      icon: <img src={book} alt="" className="w-32 h-32"/>
    },
    {
      title: "Practice Questions",
    //   icon: <FaCalculator className="text-orange-500 text-4xl" />,
    icon: <img src={calculator} alt="" className="w-32 h-32"/>
    },
    {
      title: "Smart Notebook",
    //   icon: <MdNotes className="text-orange-500 text-4xl" />,
    icon: <img src={notes} alt="" className="w-32 h-32"/>
    },
    {
      title: "Progress (Offline Save)",
    //   icon: <BsGraphUp className="text-orange-500 text-4xl" />,
    icon: <img src={graph} alt="" className="w-32 h-32"/>
    },
  ];

  return (
    // <div className="min-h-screen bg-gradient-to-b from-white to-orange-100 flex flex-col items-center py-16 px-6">
    <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#f6bc86] flex">
      {/* Sidebar */}
      {/* <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        className="hidden md:flex"
      /> */}
      {/* Main Content */}
  {/* <div className={`flex-1 ${isCollapsed ? 'md:ml-20 ml-0' : 'md:ml-64 ml-0'} transition-all duration-300`}> */}
  <div className={`flex-1 transition-all duration-300`}>
        <Navbar/>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 h-[90vh]">
        {/* Header */}
        <h1 className="text-[#F47B0B] text-2xl md:text-3xl font-semibold text-center">
          No Internet? No Problem
        </h1>
        <h2 className="text-[#F47B0B] text-lg md:text-3xl font-semibold text-center mt-2">
          Keep Learning Anytime, Anywhere!
        </h2>
        <p className="text-[#F47B0B] text-sm md:text-base font-semibold text-center mt-3 max-w-2xl">
          Access your saved notes, practice sets, and key concepts offline.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-28 mt-12 w-full max-w-4xl">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border rounded-xl bg-white shadow-md p-6 transition-transform hover:scale-105 hover:shadow-lg"
            >
              <div>{feature.icon}</div>
              <h3 className="text-lg font-semibold text-[#F47B0B]">
                {feature.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
      </div>
            {/* ✅ Offline Mode Button */}
      <button
        onClick={() => setOfflineMode(!offlineMode)}
        className="fixed top-4 right-4 bg-[#F47B0B] text-white px-4 py-2 rounded-full shadow-lg hover:bg-orange-600 transition"
      >
        {offlineMode ? "Offline Mode: ON" : "Offline Mode: OFF"}
      </button>

    </div>
  );
}
