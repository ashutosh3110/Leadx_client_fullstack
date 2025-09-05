import React, { useState, useEffect } from 'react';
import AmbassadorCard from '../components/AmbassadorCard';
import Pagination from '../components/Pagination';
import ChatModal from '../components/ChatModal';

// Comprehensive ambassador data with all card content
const ambassadorCardsData = [
  {
    _id: '1',
    name: 'Archit',
    email: 'archit@example.com',
    phone: '1234567890',
    program: 'UG',
    course: 'B.Tech in Computer Science and Engineering',
    year: '2',
    country: 'India',
    state: 'Uttar Pradesh',
    language: 'English - Hindi',
    about: "I love communicating and sharing true experience with new friends. Passionate about technology and helping others grow in their journey.",
    isProgramCompleted: true,
    role: 'ambessdor',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    // Card-specific content
    backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    overlayTitle: 'USE YOUR IMAGINATION',
    overlaySubtitle: 'IT NEEDS PRACTICE',
    programType: 'UG Programme',
    location: 'Uttar Pradesh | India',
    languages: 'English - Hindi',
    description: 'Tech enthusiast with strong communication skills, always ready to help and share experiences.'
  },
  {
    _id: '2',
    name: 'Areeb',
    email: 'areeb@example.com',
    phone: '1234567891',
    program: 'UG',
    course: 'B.Tech in Computer Science and Engineering',
    year: '3',
    country: 'India',
    state: 'Uttar Pradesh',
    language: 'English - Hindi',
    about: "Brains, biceps, and big dreams - I'm Areeb Khan, a Top 8 hackathon finisher with a passion for innovation and problem-solving.",
    isProgramCompleted: true,
    role: 'ambessdor',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    // Card-specific content
    backgroundImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    overlayTitle: 'Live life to the fullest',
    overlaySubtitle: 'Innovation drives success',
    programType: 'UG Programme',
    location: 'Uttar Pradesh | India',
    languages: 'English - Hindi',
    description: 'Hackathon champion with big dreams, combining technical skills with innovative thinking.'
  },
  {
    _id: '3',
    name: 'Fahad',
    email: 'fahad@example.com',
    phone: '1234567892',
    program: 'UG',
    course: 'B.Tech in Computer Science and Engineering',
    year: '2',
    country: 'India',
    state: 'Uttar Pradesh',
    language: 'English - Hindi',
    about: "I love cinema and storytelling. Passionate about technology and how it can be used to create amazing visual experiences.",
    isProgramCompleted: true,
    role: 'ambessdor',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    // Card-specific content
    backgroundImage: 'https://images.unsplash.com/photo-1489599804151-0a0b0b0b0b0b?w=400&h=200&fit=crop',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    overlayTitle: 'Life is like a cinema',
    overlaySubtitle: 'Every frame tells a story',
    programType: 'UG Programme',
    location: 'Uttar Pradesh | India',
    languages: 'English - Hindi',
    description: 'Cinema enthusiast with a passion for technology and visual storytelling.'
  },
  {
    _id: '4',
    name: 'Priyanshu',
    email: 'priyanshu@example.com',
    phone: '1234567893',
    program: 'UG',
    course: 'B.Tech in Computer Science and Engineering',
    year: '3',
    country: 'India',
    state: 'Bihar',
    language: 'English - Hindi',
    about: "Coordinator @onlinepromotionsteam lead GuGeeks, lead Budding Developers. Passionate about community building and tech leadership.",
    isProgramCompleted: true,
    role: 'ambessdor',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    // Card-specific content
    backgroundImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
    profileImage: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    overlayTitle: 'Digital World',
    overlaySubtitle: 'Leading the tech revolution',
    programType: 'UG Programme',
    location: 'Bihar | India',
    languages: 'English - Hindi',
    description: 'Tech leader and community builder, passionate about developing the next generation of developers.'
  },
  {
    _id: '5',
    name: 'Abhinna',
    email: 'abhinna@example.com',
    phone: '1234567894',
    program: 'UG',
    course: 'BBA',
    year: '2',
    country: 'India',
    state: 'Uttar Pradesh',
    language: 'English - Hindi',
    about: "Community leader, enthusiastic about event management, problem-solver, always eager to learn and grow in the field of business and technology.",
    isProgramCompleted: true,
    role: 'ambessdor',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    // Card-specific content
    backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    overlayTitle: 'NEVER GIVE UP',
    overlaySubtitle: 'You automatically miss 100% of the shots you don\'t take.',
    programType: 'UG Programme',
    location: 'Uttar Pradesh | India',
    languages: 'English - Hindi',
    description: 'Business leader with strong event management skills and a passion for community building.'
  },
  {
    _id: '6',
    name: 'Suraj',
    email: 'suraj@example.com',
    phone: '1234567895',
    program: 'UG',
    course: 'B.Tech in Computer Science and Engineering',
    year: '3',
    country: 'India',
    state: 'Bihar',
    language: 'English - Hindi',
    about: "Tech enthusiast with a passion for AI and machine learning, always exploring new technologies and building innovative solutions.",
    isProgramCompleted: true,
    role: 'ambessdor',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    // Card-specific content
    backgroundImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    overlayTitle: 'AI & ML Expert',
    overlaySubtitle: 'Building the future',
    programType: 'UG Programme',
    location: 'Bihar | India',
    languages: 'English - Hindi',
    description: 'AI/ML specialist passionate about creating intelligent systems and exploring cutting-edge technologies.'
  },
  {
    _id: '7',
    name: 'Rishika',
    email: 'rishika@example.com',
    phone: '1234567896',
    program: 'UG',
    course: 'B.Tech in Computer Science and Engineering',
    year: '2',
    country: 'India',
    state: 'Uttar Pradesh',
    language: 'English - Hindi',
    about: "Data science enthusiast, love working with big data and analytics to solve real-world problems and drive business insights.",
    isProgramCompleted: true,
    role: 'ambessdor',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    // Card-specific content
    backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    overlayTitle: 'Data Science',
    overlaySubtitle: 'Insights from data',
    programType: 'UG Programme',
    location: 'Uttar Pradesh | India',
    languages: 'English - Hindi',
    description: 'Data science expert passionate about extracting meaningful insights from complex datasets.'
  },
  {
    _id: '8',
    name: 'Devank',
    email: 'devank@example.com',
    phone: '1234567897',
    program: 'UG',
    course: 'B.Tech in Computer Science and Engineering',
    year: '3',
    country: 'India',
    state: 'Uttar Pradesh',
    language: 'English - Hindi',
    about: "AI researcher and developer, passionate about creating intelligent systems that can help people and make a positive impact on society.",
    isProgramCompleted: true,
    role: 'ambessdor',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    // Card-specific content
    backgroundImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop',
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    overlayTitle: 'AI Researcher',
    overlaySubtitle: 'Creating intelligence',
    programType: 'UG Programme',
    location: 'Uttar Pradesh | India',
    languages: 'English - Hindi',
    description: 'AI researcher focused on developing intelligent systems that benefit humanity and society.'
  }
];

const AmbassadorList = () => {
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedAmbassador, setSelectedAmbassador] = useState(null);

  useEffect(() => {
    const fetchAmbassadors = async () => {
      try {
        setLoading(true);
        // For now, use mock data. In production, you would call the API
        // const response = await ambassadorAPI.getAllAmbassadors();
        // setAmbassadors(response.data.users);
        
        // Show all 8 ambassadors for the 8-card layout
        setAmbassadors(ambassadorCardsData.slice(0, 8));
        setTotalPages(1);
        setError(null);
      } catch (err) {
        setError('Failed to fetch ambassadors');
        console.error('Error fetching ambassadors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAmbassadors();
  }, [itemsPerPage]);

  const handleChat = (ambassador) => {
    setSelectedAmbassador(ambassador);
    setIsChatModalOpen(true);
  };

  const handleCloseChatModal = () => {
    setIsChatModalOpen(false);
    setSelectedAmbassador(null);
  };

  const handleViewProfile = (ambassador) => {
    console.log('Viewing profile of:', ambassador.name);
    // Implement profile view functionality
    // This could navigate to a profile page or open a profile modal
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAmbassadors = ambassadors.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ambassadors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Chat with an Ambassador
          </h1>
          <p className="text-sm text-gray-600 text-center mt-2">
            Showing 1-8 of 8 ambassadors
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Large Container Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Ambassador Grid - 4 cards per row, 2 rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentAmbassadors.map((ambassador) => (
              <AmbassadorCard
                key={ambassador._id}
                ambassador={ambassador}
                onChat={handleChat}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>

          {/* Pagination - inside the large card at the bottom */}
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            Powered by UNIV
          </div>
        </div>
      </footer>

      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatModalOpen}
        onClose={handleCloseChatModal}
        ambassador={selectedAmbassador}
      />
    </div>
  );
};

export default AmbassadorList;
