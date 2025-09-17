import React from "react";

export default function Class() {
  const classes = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#f6bc86] flex flex-col items-center py-6 px-6">
      {/* Header */}
       <div className="w-full flex justify-start">
        <h1 className="text-[#F47B0B] text-2xl md:text-3xl font-medium">
          GetSkilled Homework Helper
        </h1>
      </div>
      <h1 className="text-[#F47B0B] text-2xl md:text-3xl font-semibold text-center">
        Save Notes Offline – Study Anytime,
      </h1>
      <h2 className="text-[#F47B0B] text-xl md:text-3xl font-semibold text-center mt-1">
        Even Without Internet!
      </h2>

      {/* Class Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12 w-full max-w-5xl">
        {classes.map((cls) => (
          <div
            key={cls}
            className="flex flex-col items-center justify-center border rounded-xl bg-white shadow-md p-6 transition-transform hover:scale-105 hover:shadow-lg"
          >
            <h3 className="text-[#F47B0B] text-xl font-bold">Class {cls}</h3>
            <p className="text-[#578BAC] mt-2 text-sm font-semibold text-center">
              Download Notes <br /> & Practice
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
