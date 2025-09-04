// import { useState } from 'react';
// import Sidebar from '../components/Sidebar';
// import { Plus, Mic, Search } from 'lucide-react';
// import Navbar from '../components/Navbar';
// import mic from '../assets/images/mike.png';

// const Dashboard = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#f6bc86] flex">
//       {/* Sidebar */}
//       <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} className="hidden md:flex" />

//       {/* Main Content */}
//         <div className={`flex-1 ${isCollapsed ? 'md:ml-20 ml-0' : 'md:ml-64 ml-0'} transition-all duration-300`}>
//         <Navbar/>
//         {/* Main Content Area */}
//         <div className="flex-1 flex flex-col items-center justify-end px-8 py-12 h-[90vh]">
//           <h2 className="text-3xl font-bold text-orange-500 mb-12">Ask Your Doubt</h2>
          
//           {/* Input Section */}
//           <div className="w-full max-w-2xl">
//             <div className="bg-white rounded-3xl border border-gray-400 shadow-sm p-6">
//               <input
//                 type="text"
//                 placeholder="Type Your Doubt or upload"
//                 className="w-full text-gray-600 bg-transparent outline-none mb-6 text-base"
//               />
//               <div className="flex items-center justify-between">
//                 <Plus className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" />
//                 <div className="flex items-center space-x-4">
//                   <img src={mic} alt=""  className='w-4 h-5'/>
//                   {/* <Mic className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" /> */}
//                   <Search className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Mic, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import mic from '../assets/images/mike.png';
import chatgpt from '../assets/images/chatgpt.png';
import send from '../assets/images/send.png';
import attach from '../assets/images/attach.png';

const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#f6bc86] flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} className="hidden md:flex" />

      {/* Main Content */}
        {/* <div className={`flex-1 ${isCollapsed ? 'md:ml-20 ml-0' : 'md:ml-64 ml-0'} transition-all duration-300`}> */}
        <div className={`flex-1 ${isCollapsed ? 'md:ml-20 ml-0' : 'md:ml-64 ml-0'} transition-all duration-300 flex flex-col justify-between`}>
        <Navbar/>
        {/* Main Content Area */}

        <div>
           <h1 className="text-[#F47B0B] text-2xl md:text-3xl font-bold text-center mt-10 tracking-wide">
        HI, I'm Your Homework Buddy
      </h1>
      <h2 className="text-[#F47B0B] text-xl md:text-3xl font-semibold text-center mt-1 tracking-wide">
        How can I Help You Today
      </h2>
        </div>
        <div className='flex justify-center'>
          <img src={chatgpt} alt="" className='h-80 w-80'/>
        </div>
        <div className="flex-1 flex flex-col items-center justify-end px-8 py-12 h-[90vh]">
          {/* <h2 className="text-3xl font-bold text-orange-500 mb-12">Ask Your Doubt</h2> */}
          
          {/* Input Section */}
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-3xl border border-gray-400 shadow-sm p-6">
              <input
                type="text"
                placeholder="Type Your Doubt or upload"
                className="w-full text-gray-600 bg-transparent outline-none mb-6 text-base"
              />
              <div className="flex items-center justify-between">
                {/* <Plus className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" /> */}

                 {/* Upload with tooltip */}
      <div className="relative group">
        <Plus className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" />
        {/* Tooltip Box */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-white border w-[200px] border-gray-300 rounded-xl shadow-md px-3 py-2 text-sm text-gray-600 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-gray-500">
            <img src={attach} alt="" className='h-6'/>
          </span>
          <span>Add photos &amp; files</span>
        </div>
      </div>

      
                <div className="flex items-center space-x-4">
                  <img src={mic} alt=""  className='w-6 h-8'/>
                  {/* <Mic className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" /> */}
                  {/* <Search className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" /> */}
                  <img src={send} alt="" className='h-10 w-10'/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;