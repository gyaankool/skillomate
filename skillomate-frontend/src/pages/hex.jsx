

// import React, { useState, useEffect } from 'react';

// const Hexagon = ({ row, col, onHover, isHovered, isPrimaryHovered }) => {
//   return (
//     <div
//       className={`relative transition-all duration-300 ease-in-out transform ${
//         isPrimaryHovered
//           ? 'bg-orange-50/30 border  scale-105 shadow-[0_0_8px_rgba(251,191,36,0.6)] opacity-100'
//           : isHovered
//           ? 'bg-orange-50/20 border shadow-[0_0_5px_rgba(251,191,36,0.4)] opacity-100'
//           : 'opacity-0'
//       }`}
//       style={{
//         clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
//         width: '4rem',
//         height: '4.6rem',
//         // marginLeft: col % 2 === 0 ? '0' : '3rem', // 75% of width for tight packing
//         marginTop: col % 2 === 0 ? '0' : '-1.15rem', // 25% of height for overlap
//         zIndex: isHovered || isPrimaryHovered ? 10 : 0,
//       }}
//       onMouseEnter={() => onHover(row, col)}
//     />
//   );
// };

// const HexagonalGrid = () => {
//   const [dimensions, setDimensions] = useState({ rows: 10, cols: 10 });
//   const [hovered, setHovered] = useState({ row: -1, col: -1 });

//   useEffect(() => {
//     const updateDimensions = () => {
//       const hexWidth = 64; // 4rem in pixels (1rem = 16px)
//       const hexHeight = 73.6; // 4.6rem in pixels
//       const colOffset = 48; // 75% of hexWidth (0.75 * 64) for horizontal packing
//       const rowOffset = 36.8; // 50% of hexHeight for vertical overlap

//       const cols = Math.ceil(window.innerWidth / colOffset) + 2; // Extra columns for full coverage
//       const rows = Math.ceil(window.innerHeight / (hexHeight - rowOffset)) + 1;

//       setDimensions({ rows, cols });
//     };

//     updateDimensions();
//     window.addEventListener('resize', updateDimensions);
//     return () => window.removeEventListener('resize', updateDimensions);
//   }, []);

//   const handleHover = (row, col) => {
//     setHovered({ row, col });
//   };

//   const isHexagonHovered = (row, col) => {
//     return (
//       (hovered.row === row && hovered.col - 1 === col) || // Left neighbor
//       (hovered.row === row && hovered.col + 1 === col) || // Right neighbor
//       (hovered.row + 1 === row && hovered.col === col) // Bottom neighbor
//     );
//   };

//   const isPrimaryHexagonHovered = (row, col) => {
//     return hovered.row === row && hovered.col === col; // Hovered hexagon
//   };

//   return (
//     <div className="fixed inset-0 overflow-hidden">
//       <div
//         className="grid absolute"
//         style={{
//           gap: '0',
//           top: '-1.15rem', // Align with hexagon height
//           left: '0', // No left offset needed with proper column offset
//         }}
//       >
//         {Array.from({ length: dimensions.rows }).map((_, row) => (
//           <div key={row} className="flex" style={{ gap: '0' }}>
//             {Array.from({ length: dimensions.cols }).map((_, col) => (
//               <Hexagon
//                 key={`${row}-${col}`}
//                 row={row}
//                 col={col}
//                 onHover={handleHover}
//                 isHovered={isHexagonHovered(row, col)}
//                 isPrimaryHovered={isPrimaryHexagonHovered(row, col)}
//               />
//             ))}
//           </div>
//         ))}
//       </div>
//     {/* <h1 className='text-center cursor-pointer'>hpware dyou</h1> */}
//     </div>
//   );
// };

// export default HexagonalGrid;


import React, { useState, useEffect } from 'react';

const Hexagon = ({ row, col, onHover, isHovered, isPrimaryHovered }) => {
  return (
    <div
      className={`relative transition-all duration-300 ease-in-out transform ${
        isPrimaryHovered
          ? 'bg-orange-50/30 border scale-105 shadow-[0_0_8px_rgba(251,191,36,0.6)] opacity-100'
          : isHovered
          ? 'bg-orange-50/20 border shadow-[0_0_5px_rgba(251,191,36,0.4)] opacity-100'
          : 'opacity-0'
      }`}
      style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        width: '4rem',
        height: '4.6rem',
        marginTop: col % 2 === 0 ? '0' : '-1.15rem',
        zIndex: isHovered || isPrimaryHovered ? -1 : -1, // Keep behind dashboard
      }}
      onMouseEnter={() => onHover(row, col)}
    />
  );
};

const HexagonalGrid = () => {
  const [dimensions, setDimensions] = useState({ rows: 10, cols: 10 });
  const [hovered, setHovered] = useState({ row: -1, col: -1 });

  useEffect(() => {
    const updateDimensions = () => {
      const hexWidth = 64;
      const hexHeight = 73.6;
      const colOffset = 48;
      const rowOffset = 36.8;

      const cols = Math.ceil(window.innerWidth / colOffset) + 2;
      const rows = Math.ceil(window.innerHeight / (hexHeight - rowOffset)) + 1;

      setDimensions({ rows, cols });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleHover = (row, col) => {
    setHovered({ row, col });
  };

  const isHexagonHovered = (row, col) => {
    return (
      (hovered.row === row && hovered.col - 1 === col) ||
      (hovered.row === row && hovered.col + 1 === col) ||
      (hovered.row + 1 === row && hovered.col === col)
    );
  };

  const isPrimaryHexagonHovered = (row, col) => {
    return hovered.row === row && hovered.col === col;
  };

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{
        zIndex: -1, // Place it behind other components
      }}
    >
      <div
        className="grid absolute"
        style={{
          gap: '0',
          top: '-1.15rem',
          left: '0',
        }}
      >
        {Array.from({ length: dimensions.rows }).map((_, row) => (
          <div key={row} className="flex" style={{ gap: '0' }}>
            {Array.from({ length: dimensions.cols }).map((_, col) => (
              <Hexagon
                key={`${row}-${col}`}
                row={row}
                col={col}
                onHover={handleHover}
                isHovered={isHexagonHovered(row, col)}
                isPrimaryHovered={isPrimaryHexagonHovered(row, col)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HexagonalGrid;