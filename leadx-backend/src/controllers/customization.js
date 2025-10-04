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
      selectedAmbassadorIds,
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

    // If no ambassadors selected, use all verified ambassadors
    let finalAmbassadorIds = selectedAmbassadorIds || []
    if (!finalAmbassadorIds || finalAmbassadorIds.length === 0) {
      const allAmbassadors = await User.find({
        role: "ambassador",
        isVerified: true,
      }).select("_id")
      finalAmbassadorIds = allAmbassadors.map((amb) => amb._id)
    } else {
      // Validate selected ambassadors exist
      const ambassadors = await User.find({
        _id: { $in: finalAmbassadorIds },
        role: "ambassador",
        isVerified: true,
      })

      if (ambassadors.length !== finalAmbassadorIds.length) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Some selected ambassadors are invalid or not verified",
        })
      }
    }

    // Generate unique configId
    const configId =
      "config_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
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
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
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

// Generate embeddable script
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

    // Generate the embeddable JavaScript
    const script = generateEmbedScript(customization)

    res.setHeader("Content-Type", "application/javascript")
    res.setHeader("Cache-Control", "public, max-age=3600") // Cache for 1 hour
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

// Helper function to generate embed script
function generateEmbedScript(customization) {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000"
  const apiUrl = process.env.API_URL || "http://localhost:5000"

  return `
(function() {
  // LeadX Ambassador Widget - Configuration: ${customization.configId}
  
  const LEADX_CONFIG = {
    configId: '${customization.configId}',
    apiUrl: '${apiUrl}',
    baseUrl: '${baseUrl}',
    webUrl: '${customization.webUrl}',
    webName: '${customization.webName}',
    policyUrl: '${customization.policyUrl || ""}',
    termsUrl: '${customization.termsUrl || ""}',
    tilesAndButtonColor: '${customization.tilesAndButtonColor}',
    textColor: '${customization.textColor}',
    borderColor: '${customization.borderColor}',
    borderSize: '${customization.borderSize}',
    questions: ${JSON.stringify(customization.questions || [])},
    isActive: ${customization.isActive}
  };

  // Check if widget already exists or is inactive
  if (window.leadxWidgetLoaded) {
    console.warn('LeadX Widget already loaded');
    return;
  }
  
  if (!LEADX_CONFIG.isActive) {
    console.warn('LeadX Widget is inactive');
    return;
  }
  
  window.leadxWidgetLoaded = true;

  // Add comprehensive CSS styles
  const styles = \`
    <style id="leadx-widget-styles">
      .leadx-widget-container {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.5;
        color: #374151;
        box-sizing: border-box;
      }
      .leadx-widget-container *, .leadx-widget-container *::before, .leadx-widget-container *::after {
        box-sizing: border-box;
      }
      .leadx-ambassador-card {
        background: white;
        border-radius: \${parseInt(LEADX_CONFIG.borderSize) * 4}px;
        border: 2px solid \${LEADX_CONFIG.borderColor};
        transition: all 0.3s ease;
        overflow: hidden;
        height: 450px;
        display: flex;
        flex-direction: column;
        position: relative;
        max-width: 320px;
        margin: 0 auto;
      }
      .leadx-ambassador-card:hover {
        border-color: #3b82f6;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        transform: translateY(-2px);
      }
      .leadx-chat-button {
        background: \${LEADX_CONFIG.tilesAndButtonColor};
        color: \${LEADX_CONFIG.textColor};
        border: none;
        border-radius: \${parseInt(LEADX_CONFIG.borderSize) * 4}px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .leadx-chat-button:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      .leadx-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        z-index: 10000;
        display: none;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
        padding: 20px;
      }
      .leadx-modal-content {
        background: white;
        border-radius: 20px;
        width: 100%;
        max-width: 1200px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      }
      .leadx-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        padding: 30px;
      }
      .leadx-floating-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: \${LEADX_CONFIG.tilesAndButtonColor};
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: all 0.3s ease;
        border: none;
      }
      .leadx-floating-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(0,0,0,0.2);
      }
      @keyframes leadx-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .leadx-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e5e7eb;
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        animation: leadx-spin 1s linear infinite;
        margin: 0 auto 16px;
      }
      @media (max-width: 768px) {
        .leadx-grid {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          padding: 20px;
        }
        .leadx-ambassador-card {
          height: 400px;
          max-width: 100%;
        }
        .leadx-modal-content {
          border-radius: 16px;
          margin: 10px;
        }
      }
    </style>
  \`;
  
  // Add styles to head
  if (!document.getElementById('leadx-widget-styles')) {
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // Create floating chat button
  function createFloatingButton() {
    const button = document.createElement('button');
    button.id = 'leadx-floating-button';
    button.className = 'leadx-floating-btn';
    button.innerHTML = \`
      <svg width="24" height="24" fill="\${LEADX_CONFIG.textColor}" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    \`;
    
    button.addEventListener('click', openAmbassadorModal);
    document.body.appendChild(button);
  }

  // Create ambassador modal with complete AmbassadorCard UI
  function createAmbassadorModal() {
    const modal = document.createElement('div');
    modal.id = 'leadx-ambassador-modal';
    modal.className = 'leadx-modal leadx-widget-container';
    modal.innerHTML = \`
      <div class="leadx-modal-content">
        <!-- Header -->
        <div style="
          padding: 25px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px 20px 0 0;
          position: relative;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="margin: 0; font-size: 28px; font-weight: 700; margin-bottom: 8px;">
                Connect with our Ambassadors
              </h2>
              <p style="margin: 0; opacity: 0.9; font-size: 16px;">
                Get personalized guidance from verified student ambassadors
              </p>
            </div>
            <button id="leadx-close-modal" style="
              background: rgba(255,255,255,0.2);
              border: none;
              border-radius: 50%;
              width: 44px;
              height: 44px;
              font-size: 24px;
              cursor: pointer;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
            ">
              ×
            </button>
          </div>
        </div>
        
        <!-- Loading State -->
        <div id="leadx-loading" style="
          padding: 80px 30px;
          text-align: center;
          color: #6b7280;
        ">
          <div class="leadx-spinner"></div>
          <p style="margin: 0; font-size: 16px;">Loading ambassadors...</p>
        </div>
        
        <!-- Ambassadors Container -->
        <div id="leadx-ambassadors-container" class="leadx-grid" style="display: none;">
        </div>
        
        <!-- Error State -->
        <div id="leadx-error" style="
          padding: 80px 30px;
          text-align: center;
          color: #ef4444;
          display: none;
        ">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <p style="margin: 0; font-size: 16px;">Unable to load ambassadors. Please try again later.</p>
        </div>
      </div>
    \`;
    
    // Add event listeners
    modal.addEventListener('click', function(e) {
      if (e.target.id === 'leadx-ambassador-modal') {
        closeAmbassadorModal();
      }
    });
    
    const closeBtn = modal.querySelector('#leadx-close-modal');
    closeBtn.addEventListener('click', closeAmbassadorModal);
    closeBtn.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(255,255,255,0.3)';
    });
    closeBtn.addEventListener('mouseleave', function() {
      this.style.background = 'rgba(255,255,255,0.2)';
    });
    
    document.body.appendChild(modal);
  }

  function openAmbassadorModal() {
    const modal = document.getElementById('leadx-ambassador-modal');
    if (!modal) {
      createAmbassadorModal();
    }
    
    document.getElementById('leadx-ambassador-modal').style.display = 'flex';
    loadAmbassadors();
  }

  function closeAmbassadorModal() {
    document.getElementById('leadx-ambassador-modal').style.display = 'none';
  }

  async function loadAmbassadors() {
    const loadingEl = document.getElementById('leadx-loading');
    const containerEl = document.getElementById('leadx-ambassadors-container');
    const errorEl = document.getElementById('leadx-error');
    
    // Show loading state
    loadingEl.style.display = 'block';
    containerEl.style.display = 'none';
    errorEl.style.display = 'none';
    
    try {
      const response = await fetch(\`\${LEADX_CONFIG.apiUrl}/api/auth/ambassadors/public\`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const ambassadors = result.data.filter(amb => amb.role === 'ambassador' && amb.isVerified);
        renderAmbassadors(ambassadors);
      } else {
        throw new Error('No ambassadors found');
      }
    } catch (error) {
      console.error('Error loading ambassadors:', error);
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';
    }
  }

  function getCountryFlag(country) {
    const countryCodeMap = {
      'India': 'in', 'United States': 'us', 'USA': 'us', 'US': 'us',
      'United Kingdom': 'gb', 'Canada': 'ca', 'Australia': 'au',
      'Germany': 'de', 'France': 'fr', 'Japan': 'jp', 'China': 'cn'
    };
    const countryCode = countryCodeMap[country] || countryCodeMap[country?.toLowerCase()] || 'in';
    return \`https://flagcdn.com/24x18/\${countryCode}.png\`;
  }

  function renderAmbassadors(ambassadors) {
    const loadingEl = document.getElementById('leadx-loading');
    const containerEl = document.getElementById('leadx-ambassadors-container');
    
    loadingEl.style.display = 'none';
    containerEl.style.display = 'grid';
    
    if (!ambassadors || ambassadors.length === 0) {
      containerEl.innerHTML = \`
        <div style="
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 30px;
          color: #6b7280;
        ">
          <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
          <p style="margin: 0; font-size: 16px;">No ambassadors available at the moment.</p>
        </div>
      \`;
      return;
    }

    const ambassadorCards = ambassadors.map(ambassador => \`
      <div class="leadx-ambassador-card">
        <!-- Background Header with Gradient -->
        <div style="
          height: 80px;
          background: \${LEADX_CONFIG.tilesAndButtonColor};
          position: relative;
          background-image: url('\${ambassador.thumbnailImage ? LEADX_CONFIG.apiUrl + '/' + ambassador.thumbnailImage : ''}');
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
            bottom: -40px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 4px solid white;
            overflow: hidden;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          ">
            <img 
              src="\${ambassador.profileImage ? LEADX_CONFIG.apiUrl + '/' + ambassador.profileImage : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIyMCIgeT0iMTUiIHdpZHRoPSI0MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOUI5QkEwIj4KPHA+dGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPgo8L3N2Zz4KPC9zdmc+'}" 
              alt="\${ambassador.name}"
              style="
                width: 100%;
                height: 100%;
                object-fit: cover;
              "
            />
          </div>
          
          <!-- Online Status -->
          <div style="
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(25px);
            width: 20px;
            height: 20px;
            background: #10b981;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: #059669;
              border-radius: 50%;
              margin: 3px auto;
              animation: pulse 2s infinite;
            "></div>
          </div>
        </div>
        
        <!-- Content -->
        <div style="
          padding: 50px 20px 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        ">
          <!-- Name -->
          <h3 style="
            margin: 0 0 8px 0;
            text-align: center;
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            font-family: 'Inter', sans-serif;
          ">
            \${ambassador.name}
          </h3>
          
          <!-- Course/Program -->
          <div style="
            background: linear-gradient(135deg, #ddd6fe 0%, #e0e7ff 100%);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 16px;
            text-align: center;
            border: 1px solid #c4b5fd;
          ">
            <p style="
              margin: 0;
              font-size: 14px;
              color: #5b21b6;
              font-weight: 600;
            ">
              📚 \${ambassador.course || ambassador.program || 'Student Ambassador'}
            </p>
          </div>
          
          <!-- Location -->
          <div style="
            background: linear-gradient(135deg, #bfdbfe 0%, #dbeafe 100%);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 16px;
            text-align: center;
            border: 1px solid #93c5fd;
          ">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <img
                src="\${getCountryFlag(ambassador.country || 'India')}"
                alt="Flag"
                style="width: 20px; height: 15px; border-radius: 2px;"
                onerror="this.style.display='none'"
              />
              <p style="
                margin: 0;
                font-size: 14px;
                color: #1e40af;
                font-weight: 600;
              ">
                📍 \${ambassador.state || ambassador.country || 'India'}
              </p>
            </div>
          </div>
          
          <!-- Languages -->
          <div style="
            background: linear-gradient(135deg, #bbf7d0 0%, #dcfce7 100%);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 16px;
            text-align: center;
            border: 1px solid #86efac;
          ">
            <p style="
              margin: 0;
              font-size: 14px;
              color: #166534;
              font-weight: 600;
            ">
              🗣️ \${Array.isArray(ambassador.languages) ? ambassador.languages.join(', ') : (ambassador.languages || 'English')}
            </p>
          </div>
          
          <!-- Questions Preview -->
          \${LEADX_CONFIG.questions.length > 0 ? \`
            <div style="
              background: #f8fafc;
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 20px;
              border: 2px solid \${LEADX_CONFIG.borderColor};
            ">
              <p style="
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 700;
                color: #374151;
                text-align: center;
              ">
                💬 Ask me about:
              </p>
              \${LEADX_CONFIG.questions.slice(0, 3).map(question => \`
                <div style="
                  font-size: 12px;
                  color: #6b7280;
                  margin-bottom: 8px;
                  line-height: 1.4;
                  padding: 8px 12px;
                  background: white;
                  border-radius: 8px;
                  border-left: 3px solid \${LEADX_CONFIG.tilesAndButtonColor.includes('gradient') ? '#667eea' : LEADX_CONFIG.tilesAndButtonColor};
                ">
                  • \${question.length > 50 ? question.substring(0, 50) + '...' : question}
                </div>
              \`).join('')}
              \${LEADX_CONFIG.questions.length > 3 ? \`
                <div style="
                  font-size: 11px;
                  color: #9ca3af;
                  font-style: italic;
                  text-align: center;
                  margin-top: 8px;
                ">
                  +\${LEADX_CONFIG.questions.length - 3} more questions
                </div>
              \` : ''}
            </div>
          \` : ''}
          
          <!-- Chat Button -->
          <div style="margin-top: auto;">
            <button 
              class="leadx-chat-button"
              onclick="startChat('\${ambassador._id}', '\${ambassador.name}')"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
              </svg>
              Chat with \${ambassador.name}
            </button>
          </div>
        </div>
      </div>
    \`).join('');

    containerEl.innerHTML = ambassadorCards;
  }

  // Global function for chat
  window.startChat = function(ambassadorId, ambassadorName) {
    // Create chat modal or redirect to chat page
    const chatUrl = \`\${LEADX_CONFIG.baseUrl}/embed/\${LEADX_CONFIG.configId}?ambassador=\${ambassadorId}&name=\${encodeURIComponent(ambassadorName)}\`;
    window.open(chatUrl, '_blank', 'width=500,height=700,scrollbars=yes,resizable=yes,location=no,menubar=no,toolbar=no');
  };

  // Initialize widget when DOM is ready
  function initWidget() {
    createFloatingButton();
    createAmbassadorModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
`
}
