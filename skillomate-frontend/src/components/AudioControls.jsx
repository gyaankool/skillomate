import React from 'react';

const AudioControls = ({ 
  isPlaying, 
  isGenerating, 
  currentAudioId, 
  messageId, 
  audioProgress, 
  playbackSpeed, 
  onPlayPause, 
  onStop, 
  onSpeedChange, 
  onSkip,
  isCached = false
}) => {
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="audio-controls mt-2 flex items-center space-x-2">
      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        disabled={isGenerating}
        className={`flex items-center justify-center w-8 h-8 rounded-full text-xs transition-colors ${
          isPlaying && currentAudioId === messageId
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={
          isGenerating 
            ? 'Generating audio...' 
            : isPlaying 
            ? 'Pause (Spacebar)' 
            : isCached 
            ? 'Play (Spacebar) - Cached for instant playback' 
            : 'Play (Spacebar) - Will generate audio'
        }
      >
        {isGenerating ? (
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        ) : isPlaying && currentAudioId === messageId ? (
          '⏸️'
        ) : (
          <div className="relative">
            🔊
            {isCached && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        )}
      </button>

      {/* Stop Button */}
      {isPlaying && currentAudioId === messageId && (
        <button
          onClick={onStop}
          className="w-6 h-6 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
          title="Stop (Escape)"
        >
          ⏹️
        </button>
      )}

      {/* Progress Bar */}
      {isPlaying && currentAudioId === messageId && (
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-orange-500 h-full transition-all duration-100"
            style={{ width: `${audioProgress}%` }}
          ></div>
        </div>
      )}

      {/* Skip Buttons */}
      {isPlaying && currentAudioId === messageId && (
        <div className="flex space-x-1">
          <button
            onClick={() => onSkip(-10)}
            className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs hover:bg-gray-200 transition-colors flex items-center justify-center"
            title="Skip -10s (←)"
          >
            ⏪
          </button>
          <button
            onClick={() => onSkip(10)}
            className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs hover:bg-gray-200 transition-colors flex items-center justify-center"
            title="Skip +10s (→)"
          >
            ⏩
          </button>
        </div>
      )}

      {/* Speed Control */}
      {isPlaying && currentAudioId === messageId && (
        <div className="relative group">
          <button
            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            title="Playback Speed"
          >
            {playbackSpeed}x
          </button>
          <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <div className="p-2 space-y-1">
              {speedOptions.map(speed => (
                <button
                  key={speed}
                  onClick={() => onSpeedChange(speed)}
                  className={`block w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                    playbackSpeed === speed 
                      ? 'bg-orange-500 text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cache Status Indicator */}
      {!isPlaying && isCached && (
        <div className="text-xs text-green-600 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
          Cached
        </div>
      )}
    </div>
  );
};

export default AudioControls;
