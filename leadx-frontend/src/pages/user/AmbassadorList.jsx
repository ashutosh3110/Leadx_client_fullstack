import React, { useState, useEffect } from 'react';
import AmbassadorCard from './AmbassadorCard';
import Pagination from './Pagination';
import ChatModal from './ChatModal';
import ProfileModal from './ProfileModal';
import { ambassadorAPI } from '../utils/apicopy';

// Comprehensive ambassador data with all card content


const AmbassadorList = () => {
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedAmbassador, setSelectedAmbassador] = useState(null);

  useEffect(() => {
    const fetchAmbassadors = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          console.log('Fetching ambassadors from API...');
          const response = await ambassadorAPI.getAllAmbassadors();
          console.log('API Response:', response);
          
          // Handle different possible response formats
          let users = [];
          if (response.success && response.data && response.data.users) {
            users = response.data.users;
          } else if (response.data && Array.isArray(response.data)) {
            users = response.data;
          } else if (Array.isArray(response)) {
            users = response;
          } else {
            throw new Error('Invalid API response format');
          }
          
          console.log('Users from API:', users);
          
          // Filter only VERIFIED ambassadors (approved by admin)
          const ambassadorUsers = users.filter(user => 
            user.role === 'ambassador' && user.isVerified === true
          );
          
          console.log('Filtered ambassadors:', ambassadorUsers);
          
          if (ambassadorUsers.length > 0) {
            // Map API data to card format
            const mappedAmbassadors = ambassadorUsers.map((user, index) => ({
              ...user,
              // Add card-specific fields for display
            
            }));
            console.log("background",mappedAmbassadors.backgroundImage);
            
            console.log('Mapped ambassadors:', mappedAmbassadors);
            setAmbassadors(mappedAmbassadors);
            setTotalPages(Math.ceil(mappedAmbassadors.length / itemsPerPage));
            console.log('Successfully loaded', mappedAmbassadors.length, 'ambassadors from API');
          } else {
            console.warn('No ambassadors found in API response, using mock data');
            throw new Error('No ambassadors found');
          }
        } catch (apiError) {
          console.error('API fetch failed:', apiError);
          console.warn('Using mock data as fallback');
          // Fallback to mock data if API fails
          // setAmbassadors(ambassadorCardsData.slice(0, 8));
          setTotalPages(1);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch ambassadors');
        console.error('Error fetching ambassadors:', err);
        // Final fallback to mock data
        // setAmbassadors(ambassadorCardsData.slice(0, 8));
        setTotalPages(1);
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
    setSelectedAmbassador(ambassador);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedAmbassador(null);
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Chat with an Ambassador
          </h1>
          <p className="text-sm text-gray-600 text-center mt-2">
            Showing {ambassadors.length} ambassadors
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* Large Container Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 overflow-x-hidden">
          {/* Ambassador Grid - 4 cards per row, 2 rows */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-hidden">
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

      {/* Simplified Footer */}
      <footer className="bg-gradient-to-br from-slate-50 to-blue-50 border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Company Info */}
              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Leadx
                </h3>
                <p className="text-sm text-slate-600 max-w-md">
                  Connecting students with verified ambassadors
                </p>
              </div>

              {/* Quick Links */}
              <div className="flex items-center space-x-6 text-sm">
                <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Help</a>
                <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Contact</a>
                <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Privacy</a>
                <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Terms</a>
              </div>

              {/* Social Media */}
              <div className="flex space-x-3">
                <button className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="py-3 border-t border-slate-200">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
              <div className="text-xs text-slate-500">
                © 2024 Leadx. All rights reserved.
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Powered by Leadx
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={handleCloseChatModal}
        ambassador={selectedAmbassador}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        ambassador={selectedAmbassador}
      />
    </div>
  );
};

export default AmbassadorList;
