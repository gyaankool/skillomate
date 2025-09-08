import React, { useState, useEffect, useRef } from 'react';

const StreamingText = ({ content, isStreaming = false, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!content) {
      setDisplayedText('');
      setCurrentIndex(0);
      setIsComplete(false);
      return;
    }

    if (isStreaming && !isComplete) {
      // Start streaming effect
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          if (prevIndex >= content.length) {
            clearInterval(intervalRef.current);
            setIsComplete(true);
            if (onComplete) onComplete();
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, 30); // Adjust speed as needed

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else if (!isStreaming) {
      // Show full content immediately
      setDisplayedText(content);
      setCurrentIndex(content.length);
      setIsComplete(true);
    }
  }, [content, isStreaming, isComplete, onComplete]);

  useEffect(() => {
    setDisplayedText(content.substring(0, currentIndex));
  }, [currentIndex, content]);



  const renderFormattedContent = () => {
    const lines = displayedText.split('\n');
    const elements = [];
    let currentList = [];
    let inList = false;

    lines.forEach((line, index) => {
      // Check if this is a list item
      if (line.startsWith('• ') || line.startsWith('- ')) {
        if (!inList) {
          inList = true;
          currentList = [];
        }
        currentList.push(line.replace(/^[•-]\s*/, ''));
      } else {
        // If we were in a list, close it
        if (inList && currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc ml-6 mb-3">
              {currentList.map((item, itemIndex) => (
                <li key={itemIndex} className="mb-1">{item}</li>
              ))}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        
        // Handle other line types
        if (line.startsWith('### ')) {
          elements.push(<h3 key={index} className="text-lg font-semibold text-gray-800 mt-4 mb-2">{line.replace('### ', '')}</h3>);
        } else if (line.startsWith('## ')) {
          elements.push(<h2 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">{line.replace('## ', '')}</h2>);
        } else if (line.startsWith('# ')) {
          elements.push(<h1 key={index} className="text-2xl font-bold text-gray-900 mt-6 mb-3">{line.replace('# ', '')}</h1>);
        } else if (line.startsWith('```')) {
          elements.push(<pre key={index} className="bg-gray-100 p-2 rounded text-xs overflow-x-auto my-2">{line.replace('```', '')}</pre>);
        } else if (line.trim() === '') {
          elements.push(<br key={index} />);
        } else {
          let formattedLine = line;
          // Handle mathematical expressions
          formattedLine = formattedLine.replace(/\\\[(.*?)\\\]/g, '<div class="math-display my-2 p-2 bg-gray-50 rounded border-l-4 border-blue-400">$1</div>');
          formattedLine = formattedLine.replace(/\\\((.*?)\\\)/g, '<span class="math-inline bg-gray-100 px-1 rounded">$1</span>');
          // Handle LaTeX fractions
          formattedLine = formattedLine.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="math-inline bg-gray-100 px-1 rounded">$1/$2</span>');
          // Handle bold and italic text
          formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
          // Handle inline code
          formattedLine = formattedLine.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>');
          // Handle step numbers and structure
          formattedLine = formattedLine.replace(/^(\d+\.\s)/g, '<span class="font-semibold text-blue-600">$1</span>');
          // Handle "Therefore" and other logical connectors
          formattedLine = formattedLine.replace(/(Therefore,|Thereforelution:)/g, '<span class="font-semibold text-green-600">$1</span>');
          
          elements.push(
            <p 
              key={index} 
              className="mb-2 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formattedLine }}
            />
          );
        }
      }
    });

    // Close any remaining list
    if (inList && currentList.length > 0) {
      elements.push(
        <ul key="final-list" className="list-disc ml-6 mb-3">
          {currentList.map((item, itemIndex) => (
            <li key={itemIndex} className="mb-1">{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div className="text-sm prose prose-sm max-w-none ai-formatted-content">
      {renderFormattedContent()}
      {isStreaming && !isComplete && (
        <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>
      )}
    </div>
  );
};

export default StreamingText;
