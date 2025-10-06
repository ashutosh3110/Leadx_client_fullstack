import { CustomizationConfig } from "../models/CustomizationConfig.js"
import { User } from "../models/user.js"
import { StatusCodes } from "http-status-codes"

// Create new customization configuration
export const createCustomization = async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      targetWebUrl,
      webUrl,
      webName,
      status,
      policyUrl,
      termsUrl,
      tilesAndButtonColor,
      textColor,
      borderColor,
      borderSize,
      questions,
      isActive,
    } = req.body

    // Validate required fields
    if (!clientName || !targetWebUrl || !webUrl || !webName) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message:
          "Client name, target web URL, web URL, and web name are required",
      })
    }

    // Get all verified ambassadors automatically
    const allAmbassadors = await User.find({
      role: "ambassador",
      isVerified: true,
    }).select("_id")
    const finalAmbassadorIds = allAmbassadors.map((amb) => amb._id)

    // Generate unique configId
    const configId =
      "config_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11)
    const scriptUrl = `/api/customization/script/${configId}.js`

    const customization = new CustomizationConfig({
      configId,
      scriptUrl,
      adminId: req.user.id,
      clientName,
      clientEmail,
      targetWebUrl,
      webUrl,
      webName,
      status,
      policyUrl,
      termsUrl,
      tilesAndButtonColor,
      textColor,
      borderColor,
      borderSize,
      questions: questions || [],
      selectedAmbassadorIds: finalAmbassadorIds,
      isActive: isActive !== undefined ? isActive : true,
    })

    await customization.save()

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Customization configuration created successfully",
      data: customization,
    })
  } catch (error) {
    console.error("Create customization error:", error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create customization configuration",
      error: error.message,
    })
  }
}

// Get all customizations for admin
export const getCustomizations = async (req, res) => {
  try {
    const customizations = await CustomizationConfig.find({
      adminId: req.user.id,
    })
      .populate("selectedAmbassadorIds", "name email profilePicture")
      .sort({ createdAt: -1 })

    res.status(StatusCodes.OK).json({
      success: true,
      data: customizations,
    })
  } catch (error) {
    console.error("Get customizations error:", error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch customizations",
      error: error.message,
    })
  }
}

// Update customization
export const updateCustomization = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const customization = await CustomizationConfig.findOneAndUpdate(
      { _id: id, adminId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    ).populate("selectedAmbassadorIds", "name email profilePicture")

    if (!customization) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Customization configuration not found",
      })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customization updated successfully",
      data: customization,
    })
  } catch (error) {
    console.error("Update customization error:", error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update customization",
      error: error.message,
    })
  }
}

// Delete customization
export const deleteCustomization = async (req, res) => {
  try {
    const { id } = req.params

    const customization = await CustomizationConfig.findOneAndDelete({
      _id: id,
      adminId: req.user.id,
    })

    if (!customization) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Customization configuration not found",
      })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customization deleted successfully",
    })
  } catch (error) {
    console.error("Delete customization error:", error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete customization",
      error: error.message,
    })
  }
}

// Generate embeddable script with EXACT AmbassadorCard UI
export const generateScript = async (req, res) => {
  try {
    const { configId } = req.params

    const customization = await CustomizationConfig.findOne({
      configId,
    }).populate("selectedAmbassadorIds", "name email profilePicture bio")

    if (!customization) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Configuration not found",
      })
    }

    if (!customization.isActive) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Configuration is inactive",
      })
    }

    // Generate the script with EXACT AmbassadorCard UI
    const script = generateAmbassadorCardScript(customization)

    res.setHeader("Content-Type", "application/javascript")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(script)
  } catch (error) {
    console.error("Generate script error:", error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to generate script",
      error: error.message,
    })
  }
}

// Get public configuration for embed
export const getPublicConfig = async (req, res) => {
  try {
    const { configId } = req.params

    const customization = await CustomizationConfig.findOne({
      configId,
      isActive: true,
    }).populate("selectedAmbassadorIds", "name email profilePicture bio")

    if (!customization) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Configuration not found or inactive",
      })
    }

    // Return only public data
    const publicConfig = {
      configId: customization.configId,
      webUrl: customization.webUrl,
      webName: customization.webName,
      policyUrl: customization.policyUrl,
      termsUrl: customization.termsUrl,
      tilesAndButtonColor: customization.tilesAndButtonColor,
      textColor: customization.textColor,
      borderColor: customization.borderColor,
      borderSize: customization.borderSize,
      questions: customization.questions,
      ambassadors: customization.selectedAmbassadorIds,
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: publicConfig,
    })
  } catch (error) {
    console.error("Get public config error:", error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch configuration",
      error: error.message,
    })
  }
}

// Generate script with EXACT AmbassadorCard UI from your original component
function generateAmbassadorCardScript(customization) {
  const apiUrl = process.env.API_URL || "http://localhost:5000"

  return `
(function() {
  console.log('🚀 LeadX Ambassador Widget Loading with AmbassadorCard UI...');
  
  // Configuration
  const CONFIG = {
    configId: '${customization.configId}',
    apiUrl: '${apiUrl}',
    questions: ${JSON.stringify(customization.questions || [])},
    colors: {
      button: '${customization.tilesAndButtonColor}',
      text: '${customization.textColor}',
      border: '${customization.borderColor}',
      borderSize: '${customization.borderSize}'
    }
  };

  // Prevent multiple loads
  if (window.leadxLoaded) {
    console.warn('LeadX Widget already loaded');
    return;
  }
  window.leadxLoaded = true;

  // Add CSS styles for AmbassadorCard UI
  const styles = \`
    <style id="leadx-ambassador-styles">
      .leadx-ambassador-card {
        background: white;
        border-radius: \${parseInt(CONFIG.colors.borderSize) * 4}px;
        border: 2px solid \${CONFIG.colors.border};
        transition: all 0.5s ease;
        overflow: hidden;
        width: 100%;
        max-width: 320px;
        height: 450px;
        display: flex;
        flex-direction: column;
        position: relative;
        margin: 0 auto;
      }
      .leadx-ambassador-card:hover {
        border-color: #3b82f6;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        transform: translateY(-2px);
      }
      .leadx-chat-btn {
        background: \${CONFIG.colors.button};
        color: \${CONFIG.colors.text};
        border: none;
        border-radius: \${parseInt(CONFIG.colors.borderSize) * 4}px;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        width: 100%;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .leadx-chat-btn:hover {
        opacity: 0.9;
        transform: scale(1.05);
      }
      .leadx-floating-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: \${CONFIG.colors.button};
        color: \${CONFIG.colors.text};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 24px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        transition: transform 0.2s;
        border: none;
      }
      .leadx-floating-button:hover {
        transform: scale(1.1);
      }
      .leadx-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .leadx-modal-content {
        background: white;
        border-radius: 16px;
        width: 100%;
        max-width: 1200px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
      }
      .leadx-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        padding: 30px;
      }
      @keyframes leadx-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .leadx-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #ddd;
        border-top: 3px solid #007bff;
        border-radius: 50%;
        animation: leadx-spin 1s linear infinite;
        margin: 0 auto 20px;
      }
      @media (max-width: 768px) {
        .leadx-grid {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          padding: 20px;
        }
        .leadx-ambassador-card {
          height: 400px;
        }
      }
    </style>
  \`;
  
  // Add styles to head
  if (!document.getElementById('leadx-ambassador-styles')) {
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // Create floating button
  function createFloatingButton() {
    const btn = document.createElement('button');
    btn.className = 'leadx-floating-button';
    btn.innerHTML = '💬';
    btn.onclick = openModal;
    document.body.appendChild(btn);
    console.log('✅ Floating button created');
  }

  // Create modal with AmbassadorList UI
  function createModal() {
    const modal = document.createElement('div');
    modal.className = 'leadx-modal';
    modal.innerHTML = \`
      <div class="leadx-modal-content">
        <div style="
          padding: 25px 30px;
          background: \${CONFIG.colors.button};
          color: \${CONFIG.colors.text};
          border-radius: 16px 16px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div>
            <h2 style="margin: 0; font-size: 24px; font-weight: 700;">
              Chat with an Ambassador
            </h2>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">
              Connect with our verified student ambassadors
            </p>
          </div>
          <button onclick="closeModal()" style="
            background: rgba(255,255,255,0.2);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            color: \${CONFIG.colors.text};
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">×</button>
        </div>
        <div id="ambassadors-container">
          <div style="text-align: center; padding: 60px 30px;">
            <div class="leadx-spinner"></div>
            <p style="margin: 0; color: #666;">Loading ambassadors...</p>
          </div>
        </div>
      </div>
    \`;
    
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
    
    document.body.appendChild(modal);
    console.log('✅ Modal created');
  }

  // Open modal and load ambassadors
  function openModal() {
    document.querySelector('.leadx-modal').style.display = 'flex';
    loadAmbassadors();
  }

  // Close modal
  window.closeModal = function() {
    document.querySelector('.leadx-modal').style.display = 'none';
  };

  // Get country flag
  function getCountryFlag(country) {
    const countryCodeMap = {
      'India': 'in', 'United States': 'us', 'USA': 'us', 'US': 'us',
      'United Kingdom': 'gb', 'Canada': 'ca', 'Australia': 'au',
      'Germany': 'de', 'France': 'fr', 'Japan': 'jp', 'China': 'cn'
    };
    const countryCode = countryCodeMap[country] || countryCodeMap[country?.toLowerCase()] || 'in';
    return \`https://flagcdn.com/24x18/\${countryCode}.png\`;
  }

  // Load ambassadors
  async function loadAmbassadors() {
    try {
      console.log('📡 Loading ambassadors...');
      const response = await fetch(\`\${CONFIG.apiUrl}/api/auth/ambassadors/public\`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const ambassadors = result.data.filter(a => a.role === 'ambassador' && a.isVerified);
        console.log(\`✅ Loaded \${ambassadors.length} ambassadors\`);
        renderAmbassadorCards(ambassadors);
      } else {
        throw new Error('No ambassadors found');
      }
    } catch (error) {
      console.error('❌ Error loading ambassadors:', error);
      document.getElementById('ambassadors-container').innerHTML = \`
        <div style="text-align: center; padding: 60px 30px; color: #666;">
          <p>Unable to load ambassadors. Please try again later.</p>
        </div>
      \`;
    }
  }

  // Render ambassadors with EXACT AmbassadorCard UI
  function renderAmbassadorCards(ambassadors) {
    const container = document.getElementById('ambassadors-container');
    
    if (!ambassadors.length) {
      container.innerHTML = \`
        <div style="text-align: center; padding: 60px 30px; color: #666;">
          <p>No ambassadors available at the moment.</p>
        </div>
      \`;
      return;
    }

    // Create EXACT AmbassadorCard UI
    const cards = ambassadors.map(ambassador => \`
      <div class="leadx-ambassador-card">
        <!-- Background Image Section -->
        <div style="
          position: relative;
          height: 80px;
          width: 100%;
          background: \${CONFIG.colors.button};
          background-image: url('\${ambassador.thumbnailImage ? CONFIG.apiUrl + '/' + ambassador.thumbnailImage : ''}');
          background-size: cover;
          background-position: center;
        ">
          <div style="
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
          "></div>
          
          <!-- Profile Image -->
          <div style="
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            width: 72px;
            height: 72px;
            border-radius: 50%;
            border: 4px solid white;
            overflow: hidden;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          ">
            <img 
              src="\${ambassador.profileImage ? CONFIG.apiUrl + '/' + ambassador.profileImage : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMzYiIGN5PSIzNiIgcj0iMzYiIGZpbGw9IiNlNWU3ZWIiLz48cGF0aCBkPSJNMzYgMzhjMy45IDAgNy0zLjEgNy03cy0zLjEtNy03LTctNyAzLjEtNyA3IDMuMSA3IDcgN3ptMCAyYy00LjcgMC0xNCAyLjMtMTQgN3YyaDI4di0yYzAtNC43LTkuMy03LTE0LTd6IiBmaWxsPSIjOWZhNmIyIi8+PC9zdmc+'}"
              alt="\${ambassador.name}"
              style="width: 100%; height: 100%; object-fit: cover;"
            />
          </div>
          
          <!-- Online Status -->
          <div style="
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(20px);
            width: 16px;
            height: 16px;
            background: #10b981;
            border: 3px solid white;
            border-radius: 50%;
          ">
            <div style="
              width: 6px;
              height: 6px;
              background: #059669;
              border-radius: 50%;
              margin: 2px auto;
            "></div>
          </div>
        </div>
        
        <!-- Main Content -->
        <div style="
          padding: 40px 16px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        ">
          <!-- Name -->
          <h3 style="
            margin: 0 0 8px 0;
            text-align: center;
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            font-family: 'Inter', sans-serif;
          ">
            \${ambassador.name}
          </h3>
          
          <!-- Course Card -->
          <div style="
            background: rgba(255,255,255,0.3);
            backdrop-filter: blur(4px);
            border-radius: 8px;
            padding: 8px 12px;
            border: 1px solid rgba(203, 213, 225, 0.3);
            margin-bottom: 12px;
            text-align: center;
          ">
            <p style="
              margin: 0;
              font-size: 12px;
              font-weight: 600;
              color: #1f2937;
            ">
              \${ambassador.course || ambassador.program || 'BBA'}
            </p>
          </div>
          
          <!-- Location Card -->
          <div style="
            background: rgba(255,255,255,0.3);
            backdrop-filter: blur(4px);
            border-radius: 8px;
            padding: 8px 12px;
            border: 1px solid rgba(203, 213, 225, 0.3);
            margin-bottom: 12px;
            text-align: center;
          ">
            <p style="
              margin: 0 0 4px 0;
              font-size: 12px;
              font-weight: 600;
              color: #1f2937;
            ">
              I'm from
            </p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              <img
                src="\${getCountryFlag(ambassador.country || 'India')}"
                alt="Flag"
                style="width: 16px; height: 12px; border-radius: 2px;"
                onerror="this.style.display='none'"
              />
              <p style="
                margin: 0;
                font-size: 12px;
                font-weight: 400;
                color: #374151;
              ">
                \${ambassador.state || ambassador.country || 'India'}
              </p>
            </div>
          </div>
          
          <!-- Languages Card -->
          <div style="
            background: rgba(255,255,255,0.3);
            backdrop-filter: blur(4px);
            border-radius: 8px;
            padding: 8px 12px;
            border: 1px solid rgba(203, 213, 225, 0.3);
            margin-bottom: 12px;
            text-align: center;
          ">
            <p style="
              margin: 0 0 4px 0;
              font-size: 12px;
              font-weight: 600;
              color: #1f2937;
            ">
              I Speak
            </p>
            <p style="
              margin: 0;
              font-size: 12px;
              font-weight: 400;
              color: #374151;
            ">
              \${Array.isArray(ambassador.languages) ? ambassador.languages.join(' | ') : (ambassador.languages || 'English')}
            </p>
          </div>
          
          <!-- About Card -->
          <div style="
            background: rgba(255,255,255,0.3);
            backdrop-filter: blur(4px);
            border-radius: 8px;
            padding: 8px 12px;
            border: 1px solid rgba(203, 213, 225, 0.3);
            margin-bottom: 16px;
            text-align: center;
            flex: 1;
          ">
            <p style="
              margin: 0 0 4px 0;
              font-size: 12px;
              font-weight: 600;
              color: #1f2937;
            ">
              About me
            </p>
            <p style="
              margin: 0;
              font-size: 11px;
              color: #6b7280;
              line-height: 1.4;
              font-weight: 400;
            ">
              \${(ambassador.description || ambassador.about || 'Student Ambassador ready to help!').length > 80 ? 
                (ambassador.description || ambassador.about || 'Student Ambassador ready to help!').substring(0, 80) + '...' : 
                (ambassador.description || ambassador.about || 'Student Ambassador ready to help!')}
            </p>
          </div>
          
          <!-- Questions Preview -->
          \${CONFIG.questions.length > 0 ? \`
            <div style="
              background: rgba(255,255,255,0.3);
              backdrop-filter: blur(4px);
              border-radius: 8px;
              padding: 8px 12px;
              border: 1px solid rgba(203, 213, 225, 0.3);
              margin-bottom: 16px;
              text-align: center;
            ">
              <p style="
                margin: 0 0 8px 0;
                font-size: 12px;
                font-weight: 600;
                color: #1f2937;
              ">
                Ask me about
              </p>
              \${CONFIG.questions.slice(0, 2).map(q => \`
                <div style="
                  font-size: 10px;
                  color: #6b7280;
                  margin-bottom: 4px;
                  line-height: 1.3;
                ">
                  • \${q.length > 40 ? q.substring(0, 40) + '...' : q}
                </div>
              \`).join('')}
              \${CONFIG.questions.length > 2 ? \`
                <p style="
                  margin: 4px 0 0 0;
                  font-size: 10px;
                  color: #9ca3af;
                  font-style: italic;
                ">
                  +\${CONFIG.questions.length - 2} more
                </p>
              \` : ''}
            </div>
          \` : ''}
          
          <!-- Chat Button -->
          <div style="margin-top: auto;">
            <button 
              class="leadx-chat-btn"
              onclick="startChat('\${ambassador._id}', '\${ambassador.name}')"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
              </svg>
              Chat
            </button>
          </div>
        </div>
      </div>
    \`).join('');

    container.innerHTML = \`
      <div class="leadx-grid">
        \${cards}
      </div>
    \`;
  }

  // Start chat function
  window.startChat = function(ambassadorId, ambassadorName) {
    const chatUrl = \`\${CONFIG.apiUrl.replace('5000', '3000')}/embed/\${CONFIG.configId}?ambassador=\${ambassadorId}&name=\${encodeURIComponent(ambassadorName)}\`;
    window.open(chatUrl, '_blank', 'width=500,height=700,scrollbars=yes,resizable=yes');
  };

  // Initialize
  function init() {
    createFloatingButton();
    createModal();
    console.log('✅ LeadX Ambassador Widget with AmbassadorCard UI initialized!');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
`
}
