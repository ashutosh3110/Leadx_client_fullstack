import React from 'react';
import { useCustomization } from '../../context/CustomizationContext';

const AmbassadorCard = ({
    ambassador,
    onChat,
    onViewProfile
}) => {
    const { customization } = useCustomization();
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
        // Handle languages from backend - it should be an array
        let languages = ambassador.languages || ambassador.language;
        
        // If languages is an array (as expected from backend)
        if (Array.isArray(languages)) {
            const result = languages.join(' | ');
            return result;
        }
        
        // If it's a string, try to parse it
        if (typeof languages === 'string') {
            // Check if it's a JSON string
            try {
                const parsed = JSON.parse(languages);
                if (Array.isArray(parsed)) {
                    const result = parsed.join(' | ');
                    return result;
                }
            } catch (e) {
                // If not JSON, check if it has comma separation
                if (languages.includes(',')) {
                    const result = languages.split(',').map(lang => lang.trim()).join(' | ');
                    return result;
                }
            }
        }
        
        // If single language, return as is
        if (languages) {
            return languages;
        }
        
        // Fallback to default
        return 'English';
    };

    const getAbout = () => {
        const fullText = ambassador.description || ambassador.about || `Community leader, enthusiastic about event management, problem-solver, always eager to learn and grow in the field of business and technology.`;
        // Limit to 40 characters to make more space for profile image
        return fullText.length > 40 ? fullText.substring(0, 40) + '...' : fullText;
    };




   

    const getOverlayText = () => {
        return {
            title: ambassador.title || 'NEVER GIVE UP',
            subtitle: ambassador.overlaySubtitle || 'You automatically miss 100% of the shots you don\'t take.'
        };
    };
console.log(ambassador);
    const getProfileImage = ()=>{
        const url= `http://localhost:5000/${ambassador.profileImage}`;
        return url;
    }
    const getBackgroundImageUrl =()=>{
        const url= `http://localhost:5000/${ambassador.thumbnailImage}`;
        return url;
    }

    const overlayText = getOverlayText();

    return (
         <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-slate-200 hover:border-blue-300 overflow-hidden w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-6xl h-[320px] md:h-[450px] flex flex-col overflow-y-hidden">
            {/* Background Image Section - Starting from top */}
            <div className="relative h-16 md:h-20 w-full">
                            <img
                                src={getBackgroundImageUrl()}
                                alt="Background"
                    className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                }}
                            />
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Profile Image Section - Overlapping background image */}
                <div className="absolute -bottom-6 md:-bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="relative flex items-center gap-2">
                        {/* Profile Image */}
                        <div className="relative w-18 h-18 md:w-20 md:h-20 rounded-full border-4 border-white shadow-xl overflow-hidden">
                            <img
                                src={getProfileImage()}
                                alt={ambassador.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target;
                                    target.style.display = 'none';
                                    target.parentElement.innerHTML = `
                                        <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                                            ${ambassador.name.charAt(0).toUpperCase()}
                                        </div>
                                    `;
                                }}
                            />
                        </div>
                        {/* Online Status Dot */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-400 border-3 border-white rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-600 rounded-full animate-pulse"></div>
                        </div>
                        </div>
                    </div>
                </div>

            {/* Main Content Container */}
            <div className="p-2 md:p-4 flex-1 flex flex-col relative overflow-hidden pt-8 md:pt-12">
                {/* Info Icon - Right Corner */}
                <div className="absolute top-2 right-2 md:top-4 md:right-4">
                    <button
                        onClick={() => onViewProfile(ambassador)}
                        className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-blue-300 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
                    >
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-slate-600 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>

                {/* Name with Flag - Mobile Only */}
                <div className="md:hidden flex items-center justify-center gap-2 mt-4 mb-3">
                    <h3 className="text-xs font-semibold text-slate-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {ambassador.name}
                    </h3>
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xs">🇮🇳</span>
                    </div>
                </div>

                {/* Name - Desktop Only */}
                <h3 className="hidden md:block relative text-xs font-semibold text-slate-900 text-center mb-3 mt-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {ambassador.name}
                </h3>
                
                {/* Mobile Simplified Content */}
                <div className="md:hidden space-y-1 mb-0 overflow-hidden">
                    {/* Subject */}
                    <div className="text-center">
                        <p className="text-xs font-semibold text-slate-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            {ambassador.course || ambassador.program || 'BBA'}
                        </p>
                </div>

                    {/* Space */}
                    <div className="h-1"></div>
                    
                    {/* Program */}
                    <div className="text-center">
                        <p className="text-xs font-light text-green-600" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            {ambassador.programType || getProgramType(ambassador.course || ambassador.program)}
                                </p>
                            </div>
                </div>

                {/* Desktop Info Section - Card Style - Compact */}
                <div className="hidden md:block space-y-1 mb-2">
                    {/* Program Card */}
                    <div className="bg-white/30 backdrop-blur-sm rounded-md p-1 border border-slate-200/30 hover:bg-white/50 transition-colors duration-300">
                        <div className="text-center">
                            <p className="text-xs font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {ambassador.course || ambassador.program || 'BBA'}
                            </p>
                            <p className="text-xs font-light text-green-600" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {ambassador.programType || getProgramType(ambassador.course || ambassador.program)}
                            </p>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-white/30 backdrop-blur-sm rounded-md p-1 border border-slate-200/30 hover:bg-white/50 transition-colors duration-300">
                        <div className="text-center">
                            <p className="text-xs text-slate-900 font-semibold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>I'm from</p>
                            <p className="text-xs font-light text-slate-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {getLocation()}
                            </p>
                        </div>
                    </div>

                    {/* Languages Card */}
                    <div className="bg-white/30 backdrop-blur-sm rounded-md p-1 border border-slate-200/30 hover:bg-white/50 transition-colors duration-300">
                        <div className="text-center">
                            <p className="text-xs text-slate-900 font-semibold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>I Speak</p>
                            <p className="text-xs font-light text-slate-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {getLanguages()}
                            </p>
                        </div>
                    </div>

                    {/* About Card - Compact */}
                    <div className="bg-white/30 backdrop-blur-sm rounded-md p-1 border border-slate-200/30 hover:bg-white/50 transition-colors duration-300">
                        <div className="text-center">
                            <p className="text-xs text-slate-900 font-semibold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>About me</p>
                            <p className="text-xs text-slate-600 leading-tight font-light" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {getAbout().length > 30 ? getAbout().substring(0, 30) + '...' : getAbout()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-1 mt-2 md:mt-1 overflow-hidden">
                    {/* Chat Button */}
                    <button
                        onClick={() => onChat(ambassador)}
                        className="w-3/4 mx-auto md:w-full font-bold py-2 md:py-2.5 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                        style={{
                            backgroundColor: customization.chatBackgroundColor || '#EF4444',
                            color: customization.chatTextColor || '#FFFFFF',
                        }}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Chat</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AmbassadorCard;
