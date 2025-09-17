import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function SelectClass() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const classes = [
    "KG (Kindergarten)",
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#f6bc86] flex flex">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        className="hidden md:flex"
      />
      <div
        className={`flex-1 ${
          isCollapsed ? "md:ml-20 ml-0" : "md:ml-64 ml-0"
        } flex flex-col items-center justify-center transition-all duration-300`}
      >
        {/* Main Card */}
        <div className="w-full sm:max-w-4xl">
          <div className="md:m-9 p-10 bg-white sm:shadow-lg sm:rounded-2xl sm:p-10 flex flex-col items-center">
            {/* Heading */}
            <h2 className="text-2xl font-bold text-orange-500 mb-2">
              GetSkilled Homework Helper
            </h2>
            <p className="font-bold text-center mb-8 hidden sm:block">
              Your smart AI mate for every homework challenge
            </p>
            <h3 className="text-lg font-semibold mb-2">Select your class</h3>
            <div className="w-16 h-0.5 bg-orange-500 mb-6"></div>

            {/* Class Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full sm:w-auto">
              {classes.map((cls, index) => (
                <button
                  key={index}
                  className="border border-orange-500 text-gray-700 rounded-xl px-4 py-2 hover:bg-orange-500 hover:text-white transition"
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
