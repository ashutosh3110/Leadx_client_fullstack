import React from 'react';

const AmbassadorCard = ({ 
  ambassador, 
  onChat, 
  onViewProfile 
}) => {
  const getProgramType = (program) => {
    if (program.toLowerCase().includes('b.tech') || program.toLowerCase().includes('btech')) {
      return 'UG Programme';
    } else if (program.toLowerCase().includes('mba') || program.toLowerCase().includes('m.tech')) {
      return 'PG Programme';
    } else if (program.toLowerCase().includes('phd')) {
      return 'PhD Programme';
    } else if (program.toLowerCase().includes('ba') || program.toLowerCase().includes('bba')) {
      return 'UG Programme';
    }
    return 'UG Programme';
  };

  const getLocation = () => {
    return ambassador.location || `${ambassador.state || ''} | ${ambassador.country || 'India'}`;
  };

  const getLanguages = () => {
    return ambassador.languages || ambassador.language || 'English · Hindi';
  };

  const getAbout = () => {
    return ambassador.description || ambassador.about || `Community leader, enthusiastic about event management, problem-solver, always eager to learn and grow in the field of business and technology.`;
  };


  const getProfileImage = () => {
    return ambassador.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face';
  };

  const getBackgroundImageUrl = () => {
    return ambassador.backgroundImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop';
  };

  const getOverlayText = () => {
    return {
      title: ambassador.overlayTitle || 'NEVER GIVE UP',
      subtitle: ambassador.overlaySubtitle || 'You automatically miss 100% of the shots you don\'t take.'
    };
  };

  const overlayText = getOverlayText();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 overflow-hidden w-full max-w-xs h-96 flex flex-col">
      {/* Header Section with Background Image */}
      <div className="relative h-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getBackgroundImageUrl()})`,
            filter: 'brightness(0.7)'
          }}
        />
        
        {/* Overlay Text */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-2 z-10">
          <h2 className="text-xs font-bold uppercase tracking-wide text-center leading-tight drop-shadow-lg">
            {overlayText.title}
          </h2>
          {overlayText.subtitle && (
            <p className="text-xs opacity-90 mt-1 text-center leading-tight drop-shadow-lg">
              {overlayText.subtitle}
            </p>
          )}
        </div>
        
        {/* Student Badge */}
        <div className="absolute top-2 left-2 z-20">
          <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md">
            Student
          </span>
        </div>
      </div>

      {/* Profile Picture - Overlapping the background */}
      <div className="flex justify-center -mt-10 mb-3 relative z-10">
        <div className="w-16 h-16 rounded-full border-2 border-red-500 shadow-lg overflow-hidden">
          <img 
            src={getProfileImage()}
            alt={ambassador.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initial if image fails to load
              const target = e.target;
              target.style.display = 'none';
              target.parentElement.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                  ${ambassador.name.charAt(0).toUpperCase()}
                </div>
              `;
            }}
          />
        </div>
      </div>

      {/* Content Section - Flexible to fill space */}
      <div className="px-4 flex-1 flex flex-col">
        {/* Name */}
        <h3 className="text-sm font-bold text-gray-900 text-center mb-1">
          {ambassador.name}
        </h3>

        {/* Program */}
        <p className="text-xs text-gray-800 text-center mb-1">
          {ambassador.course || ambassador.program}
        </p>

        {/* Program Type */}
        <p className="text-xs text-green-600 text-center mb-2 font-medium">
          {ambassador.programType || getProgramType(ambassador.course || ambassador.program)}
        </p>

        {/* Location */}
        <div className="flex items-center justify-center mb-2">
          <span className="text-xs text-gray-700">
            IN I'm from {getLocation()}
          </span>
        </div>

        {/* Languages */}
        <div className="text-center mb-3">
          <p className="text-xs text-gray-700">I Speak: {getLanguages()}</p>
        </div>

        {/* About Section - Flexible to fill remaining space */}
        <div className="flex-1 mb-3">
          <p className="text-xs text-gray-600 leading-relaxed text-center">
            {getAbout()}
          </p>
        </div>

        {/* Action Buttons - Always at bottom */}
        <div className="space-y-2 mt-auto">
          {/* Chat Button */}
          <button
            onClick={() => onChat(ambassador)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Chat</span>
          </button>

          {/* View Profile Link */}
          <button
            onClick={() => onViewProfile(ambassador)}
            className="w-full text-red-500 hover:text-red-600 font-medium py-1 transition-colors duration-200 text-xs"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorCard;
