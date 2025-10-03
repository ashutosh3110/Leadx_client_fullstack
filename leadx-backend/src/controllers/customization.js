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
      price,
    } = req.body

    // Validate required fields
    if (!clientName || !targetWebUrl || !webUrl || !webName) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message:
          "Client name, target web URL, web URL, and web name are required",
      })
    }

    // Validate selected ambassadors exist
    if (selectedAmbassadorIds && selectedAmbassadorIds.length > 0) {
      const ambassadors = await User.find({
        _id: { $in: selectedAmbassadorIds },
        role: "ambassador",
        isVerified: true,
      })

      if (ambassadors.length !== selectedAmbassadorIds.length) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Some selected ambassadors are invalid or not verified",
        })
      }
    }

    const customization = new CustomizationConfig({
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
      selectedAmbassadorIds: selectedAmbassadorIds || [],
      price,
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
    ambassadors: ${JSON.stringify(customization.selectedAmbassadorIds || [])}
  };

  // Check if widget already exists
  if (window.leadxWidgetLoaded) {
    console.warn('LeadX Widget already loaded');
    return;
  }
  window.leadxWidgetLoaded = true;

  // Create widget container
  function createWidget() {
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'leadx-ambassador-widget';
    widgetContainer.innerHTML = \`
      <div id="leadx-widget-button" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: \${LEADX_CONFIG.tilesAndButtonColor};
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: all 0.3s ease;
      ">
        <svg width="24" height="24" fill="\${LEADX_CONFIG.textColor}" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </div>
      
      <div id="leadx-widget-modal" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: none;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 800px;
          max-height: 90%;
          overflow-y: auto;
          position: relative;
        ">
          <div style="
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <h2 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">
              Connect with our Ambassadors
            </h2>
            <button id="leadx-close-modal" style="
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #6b7280;
            ">&times;</button>
          </div>
          <div id="leadx-ambassadors-container" style="padding: 20px;">
            Loading ambassadors...
          </div>
        </div>
      </div>
    \`;
    
    document.body.appendChild(widgetContainer);
    
    // Add event listeners
    document.getElementById('leadx-widget-button').addEventListener('click', openModal);
    document.getElementById('leadx-close-modal').addEventListener('click', closeModal);
    document.getElementById('leadx-widget-modal').addEventListener('click', function(e) {
      if (e.target.id === 'leadx-widget-modal') {
        closeModal();
      }
    });
  }

  function openModal() {
    document.getElementById('leadx-widget-modal').style.display = 'flex';
    loadAmbassadors();
  }

  function closeModal() {
    document.getElementById('leadx-widget-modal').style.display = 'none';
  }

  async function loadAmbassadors() {
    try {
      const response = await fetch(\`\${LEADX_CONFIG.apiUrl}/api/customization/public/\${LEADX_CONFIG.configId}\`);
      const result = await response.json();
      
      if (result.success) {
        renderAmbassadors(result.data.ambassadors);
      } else {
        document.getElementById('leadx-ambassadors-container').innerHTML = 
          '<p style="text-align: center; color: #6b7280;">Unable to load ambassadors</p>';
      }
    } catch (error) {
      console.error('Error loading ambassadors:', error);
      document.getElementById('leadx-ambassadors-container').innerHTML = 
        '<p style="text-align: center; color: #ef4444;">Error loading ambassadors</p>';
    }
  }

  function renderAmbassadors(ambassadors) {
    const container = document.getElementById('leadx-ambassadors-container');
    
    if (!ambassadors || ambassadors.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #6b7280;">No ambassadors available</p>';
      return;
    }

    const ambassadorCards = ambassadors.map(ambassador => \`
      <div style="
        border: 2px solid \${LEADX_CONFIG.borderColor};
        border-radius: \${getBorderRadius()}px;
        padding: 16px;
        margin-bottom: 16px;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <img src="\${ambassador.profilePicture || '/default-avatar.png'}" 
               alt="\${ambassador.name}" 
               style="
                 width: 50px;
                 height: 50px;
                 border-radius: 50%;
                 margin-right: 12px;
                 object-fit: cover;
               ">
          <div>
            <h3 style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">
              \${ambassador.name}
            </h3>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
              \${ambassador.bio || 'Ambassador'}
            </p>
          </div>
        </div>
        
        \${LEADX_CONFIG.questions.length > 0 ? \`
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 8px 0; color: #374151; font-weight: 500; font-size: 14px;">
              Quick Questions:
            </p>
            \${LEADX_CONFIG.questions.map(question => \`
              <div style="
                background: #f9fafb;
                border: 1px solid \${LEADX_CONFIG.borderColor};
                border-radius: 6px;
                padding: 8px 12px;
                margin-bottom: 6px;
                font-size: 13px;
                color: #374151;
              ">
                \${question}
              </div>
            \`).join('')}
          </div>
        \` : ''}
        
        <button onclick="startChat('\${ambassador._id}', '\${ambassador.name}')" style="
          background: \${LEADX_CONFIG.tilesAndButtonColor};
          color: \${LEADX_CONFIG.textColor};
          border: none;
          border-radius: \${getBorderRadius()}px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          transition: opacity 0.2s ease;
        " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
          Chat with \${ambassador.name}
        </button>
      </div>
    \`).join('');

    container.innerHTML = ambassadorCards;
  }

  function getBorderRadius() {
    const size = parseInt(LEADX_CONFIG.borderSize) || 3;
    return size * 4; // Convert to pixels
  }

  // Global function for chat
  window.startChat = function(ambassadorId, ambassadorName) {
    // Redirect to chat page with ambassador info
    const chatUrl = \`\${LEADX_CONFIG.baseUrl}/embed/\${LEADX_CONFIG.configId}?ambassador=\${ambassadorId}&name=\${encodeURIComponent(ambassadorName)}\`;
    window.open(chatUrl, '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes');
  };

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
`
}
