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
    const allAmbassadors = await User.findAll({
      where: {
        role: "ambassador",
        isVerified: true,
      }
    })
    const finalAmbassadorIds = allAmbassadors.map((amb) => amb.id)

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
    const customizations = await CustomizationConfig.findAll({
      where: {
        adminId: req.user.id,
      },
      order: [['createdAt', 'DESC']]
    })

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

    const customization = await CustomizationConfig.findOne({
      where: { id: id, adminId: req.user.id }
    })
    if (!customization) return res.status(404).json({ success: false, message: "Customization not found" })
    
    await customization.update(updateData)

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

    const customization = await CustomizationConfig.findOne({
      where: { id: id, adminId: req.user.id }
    })
    if (!customization) return res.status(404).json({ success: false, message: "Customization not found" })
    
    await customization.destroy()

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
      where: { configId }
    })

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
      where: { configId, isActive: true }
    })

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

  // Add CSS styles for AmbassadorCard UI with 4 cards per row
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
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
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
        max-width: 1400px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
      }
      .leadx-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        padding: 30px;
      }
      .leadx-main-container {
        max-width: 1400px;
        margin: 20px auto;
        padding: 0 20px;
      }
      .leadx-main-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        padding: 30px 0;
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
      .leadx-chat-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10001;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .leadx-chat-modal-content {
        background: white;
        border-radius: 16px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        position: relative;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
      .leadx-chat-header {
        padding: 20px;
        background: \${CONFIG.colors.button};
        color: \${CONFIG.colors.text};
        border-radius: 16px 16px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e7eb;
      }
      .leadx-chat-body {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }
      @media (max-width: 1200px) {
        .leadx-grid, .leadx-main-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      @media (max-width: 900px) {
        .leadx-grid, .leadx-main-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          padding: 20px;
        }
      }
      @media (max-width: 600px) {
        .leadx-grid, .leadx-main-grid {
          grid-template-columns: 1fr;
          gap: 16px;
          padding: 16px;
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

  // Create main container for direct embedding
  function createMainContainer() {
    const container = document.createElement('div');
    container.id = 'leadx-main-container';
    container.className = 'leadx-main-container';
    container.innerHTML = \`
      <div style="text-align: center; padding: 60px 30px;">
        <div class="leadx-spinner"></div>
        <p style="margin: 0; color: #666;">Loading ambassadors...</p>
      </div>
    \`;
    
    // Find a good place to insert the container
    const targetElement = document.querySelector('main') || 
                         document.querySelector('.main') || 
                         document.querySelector('#main') || 
                         document.body;
    
    targetElement.appendChild(container);
    console.log('✅ Main container created');
    return container;
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

  // Create chat modal with multi-step form like ChatModal.jsx
  function createChatModal() {
    const chatModal = document.createElement('div');
    chatModal.className = 'leadx-chat-modal';
    chatModal.id = 'leadx-chat-modal';
    chatModal.innerHTML = \`
      <div class="leadx-chat-modal-content">
        <div class="leadx-chat-header">
          <div>
            <h3 style="margin: 0; font-size: 18px;">Get your query resolved in 3 easy steps</h3>
          </div>
          <button onclick="closeChatModal()" style="
            background: rgba(255,255,255,0.2);
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            color: \${CONFIG.colors.text};
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">×</button>
        </div>
        
        <!-- Progress Steps -->
        <div style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <div id="step-1" style="display: flex; align-items: center; gap: 5px;">
              <div style="
                width: 24px; height: 24px; border-radius: 50%; 
                background: \${CONFIG.colors.button}; color: \${CONFIG.colors.text};
                display: flex; align-items: center; justify-content: center;
                font-size: 12px; font-weight: bold;
              ">1</div>
              <span style="font-size: 12px; color: #374151;">Your Message</span>
            </div>
            <div style="width: 20px; height: 2px; background: #d1d5db;"></div>
            <div id="step-2" style="display: flex; align-items: center; gap: 5px;">
              <div style="
                width: 24px; height: 24px; border-radius: 50%; 
                background: #d1d5db; color: #6b7280;
                display: flex; align-items: center; justify-content: center;
                font-size: 12px; font-weight: bold;
              ">2</div>
              <span style="font-size: 12px; color: #6b7280;">Your Information</span>
            </div>
            <div style="width: 20px; height: 2px; background: #d1d5db;"></div>
            <div id="step-3" style="display: flex; align-items: center; gap: 5px;">
              <div style="
                width: 24px; height: 24px; border-radius: 50%; 
                background: #d1d5db; color: #6b7280;
                display: flex; align-items: center; justify-content: center;
                font-size: 12px; font-weight: bold;
              ">3</div>
              <span style="font-size: 12px; color: #6b7280;">Receive Answer</span>
            </div>
          </div>
        </div>
        
        <div class="leadx-chat-body" id="chat-form-container">
          <!-- Step 1: Message -->
          <div id="chat-step-1" style="padding: 20px;">
            <div style="margin-bottom: 15px;">
              <textarea 
                id="chat-message" 
                placeholder="Ask me about university courses, campus life and more!"
                style="
                  width: 100%; height: 80px; padding: 10px; border: 1px solid #d1d5db;
                  border-radius: 8px; resize: none; font-size: 14px;
                  outline: none; font-family: inherit;
                "
              ></textarea>
              <div id="message-error" style="color: #ef4444; font-size: 12px; margin-top: 5px; display: none;"></div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">You can ask me about:</p>
              <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                \${CONFIG.questions.length > 0 ? CONFIG.questions.map(q => \`
                  <button onclick="selectQuestion('\${q.replace(/'/g, "\\'")}'))" style="
                    padding: 8px 12px; border: 1px solid \${CONFIG.colors.border};
                    border-radius: 6px; background: white; text-align: left;
                    font-size: 12px; cursor: pointer; color: \${CONFIG.colors.text};
                    transition: all 0.2s;
                  " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
                    • \${q}
                  </button>
                \`).join('') : \`
                  <button onclick="selectQuestion('Can you tell me how the course is?')" style="
                    padding: 8px 12px; border: 1px solid \${CONFIG.colors.border};
                    border-radius: 6px; background: white; text-align: left;
                    font-size: 12px; cursor: pointer; transition: all 0.2s;
                  " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
                    • Can you tell me how the course is?
                  </button>
                  <button onclick="selectQuestion('How is the campus life?')" style="
                    padding: 8px 12px; border: 1px solid \${CONFIG.colors.border};
                    border-radius: 6px; background: white; text-align: left;
                    font-size: 12px; cursor: pointer; transition: all 0.2s;
                  " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
                    • How is the campus life?
                  </button>
                  <button onclick="selectQuestion('How are the placements and internship opportunities?')" style="
                    padding: 8px 12px; border: 1px solid \${CONFIG.colors.border};
                    border-radius: 6px; background: white; text-align: left;
                    font-size: 12px; cursor: pointer; transition: all 0.2s;
                  " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
                    • How are the placements and internship opportunities?
                  </button>
                \`}
              </div>
            </div>
            
            <button onclick="nextStep()" style="
              width: 100%; padding: 12px; background: \${CONFIG.colors.button};
              color: \${CONFIG.colors.text}; border: none; border-radius: 8px;
              font-size: 14px; font-weight: 500; cursor: pointer;
            ">Continue</button>
          </div>
          
          <!-- Step 2: Information -->
          <div id="chat-step-2" style="padding: 20px; display: none;">
            <div style="display: grid; gap: 15px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 5px;">
                  * Your Name
                </label>
                <input type="text" id="chat-name" placeholder="Enter Your Name" style="
                  width: 100%; padding: 10px; border: 1px solid #d1d5db;
                  border-radius: 6px; font-size: 14px; outline: none;
                " />
                <div id="name-error" style="color: #ef4444; font-size: 12px; margin-top: 5px; display: none;"></div>
              </div>
              
              <div>
                <label style="display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 5px;">
                  * Your Email
                </label>
                <input type="email" id="chat-email" placeholder="Enter Your Email" style="
                  width: 100%; padding: 10px; border: 1px solid #d1d5db;
                  border-radius: 6px; font-size: 14px; outline: none;
                " />
                <div id="email-error" style="color: #ef4444; font-size: 12px; margin-top: 5px; display: none;"></div>
              </div>
              
              <div>
                <label style="display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 5px;">
                  * Mobile Number
                </label>
                <input type="tel" id="chat-mobile" placeholder="Enter 10-digit mobile number" style="
                  width: 100%; padding: 10px; border: 1px solid #d1d5db;
                  border-radius: 6px; font-size: 14px; outline: none;
                " />
                <div id="mobile-error" style="color: #ef4444; font-size: 12px; margin-top: 5px; display: none;"></div>
              </div>
              
              <div>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #374151;">
                  <input type="checkbox" id="chat-terms" style="width: 16px; height: 16px;" />
                  I agree to the terms and conditions
                </label>
                <div id="terms-error" style="color: #ef4444; font-size: 12px; margin-top: 5px; display: none;"></div>
              </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
              <button onclick="prevStep()" style="
                flex: 1; padding: 12px; background: #f3f4f6; color: #374151;
                border: none; border-radius: 8px; font-size: 14px; cursor: pointer;
              ">Back</button>
              <button onclick="nextStep()" style="
                flex: 2; padding: 12px; background: \${CONFIG.colors.button};
                color: \${CONFIG.colors.text}; border: none; border-radius: 8px;
                font-size: 14px; font-weight: 500; cursor: pointer;
              ">Continue</button>
            </div>
          </div>
          
          <!-- Step 3: Success -->
          <div id="chat-step-3" style="padding: 20px; display: none; text-align: center;">
            <div style="margin-bottom: 20px;">
              <div style="
                width: 60px; height: 60px; background: #10b981; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                margin: 0 auto 15px; color: white; font-size: 24px;
              ">✓</div>
              <h3 style="margin: 0 0 10px 0; color: #1f2937;">Message Sent Successfully!</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Your message has been sent to the ambassador. They will get back to you soon!
              </p>
            </div>
            
            <button onclick="closeChatModal()" style="
              padding: 12px 24px; background: \${CONFIG.colors.button};
              color: \${CONFIG.colors.text}; border: none; border-radius: 8px;
              font-size: 14px; font-weight: 500; cursor: pointer;
            ">Close</button>
          </div>
        </div>
      </div>
    \`;
    
    chatModal.onclick = (e) => {
      if (e.target === chatModal) closeChatModal();
    };
    
    document.body.appendChild(chatModal);
    console.log('✅ Chat modal created');
  }

  // Open modal and load ambassadors
  function openModal() {
    document.querySelector('.leadx-modal').style.display = 'flex';
    loadAmbassadors('ambassadors-container');
  }

  // Close modal
  window.closeModal = function() {
    document.querySelector('.leadx-modal').style.display = 'none';
  };

  // Chat modal state
  let currentChatStep = 1;
  let currentAmbassador = null;

  // Close chat modal
  window.closeChatModal = function() {
    document.getElementById('leadx-chat-modal').style.display = 'none';
    // Reset form
    currentChatStep = 1;
    currentAmbassador = null;
    showChatStep(1);
    clearChatForm();
  };

  // Select question function
  window.selectQuestion = function(question) {
    document.getElementById('chat-message').value = question;
  };

  // Navigation functions
  window.nextStep = function() {
    if (currentChatStep === 1) {
      if (validateStep1()) {
        currentChatStep = 2;
        showChatStep(2);
        updateStepIndicators();
      }
    } else if (currentChatStep === 2) {
      if (validateStep2()) {
        submitChatForm();
      }
    }
  };

  window.prevStep = function() {
    if (currentChatStep > 1) {
      currentChatStep--;
      showChatStep(currentChatStep);
      updateStepIndicators();
    }
  };

  // Show specific step
  function showChatStep(step) {
    // Hide all steps
    for (let i = 1; i <= 3; i++) {
      const stepElement = document.getElementById(\`chat-step-\${i}\`);
      if (stepElement) {
        stepElement.style.display = 'none';
      }
    }
    
    // Show current step
    const currentStepElement = document.getElementById(\`chat-step-\${step}\`);
    if (currentStepElement) {
      currentStepElement.style.display = 'block';
    }
  }

  // Update step indicators
  function updateStepIndicators() {
    for (let i = 1; i <= 3; i++) {
      const stepElement = document.getElementById(\`step-\${i}\`);
      const circle = stepElement.querySelector('div');
      const text = stepElement.querySelector('span');
      
      if (i <= currentChatStep) {
        circle.style.background = CONFIG.colors.button;
        circle.style.color = CONFIG.colors.text;
        text.style.color = '#374151';
        if (i < currentChatStep) {
          circle.textContent = '✓';
        } else {
          circle.textContent = i.toString();
        }
      } else {
        circle.style.background = '#d1d5db';
        circle.style.color = '#6b7280';
        text.style.color = '#6b7280';
        circle.textContent = i.toString();
      }
    }
  }

  // Validation functions
  function validateStep1() {
    const message = document.getElementById('chat-message').value.trim();
    const errorElement = document.getElementById('message-error');
    
    if (!message) {
      showError('message-error', 'Message is required');
      return false;
    } else if (message.length < 10) {
      showError('message-error', 'Message must be at least 10 characters');
      return false;
    }
    
    hideError('message-error');
    return true;
  }

  function validateStep2() {
    let isValid = true;
    
    const name = document.getElementById('chat-name').value.trim();
    const email = document.getElementById('chat-email').value.trim();
    const mobile = document.getElementById('chat-mobile').value.trim();
    const terms = document.getElementById('chat-terms').checked;
    
    if (!name) {
      showError('name-error', 'Name is required');
      isValid = false;
    } else if (name.length < 2) {
      showError('name-error', 'Name must be at least 2 characters');
      isValid = false;
    } else {
      hideError('name-error');
    }
    
    if (!email) {
      showError('email-error', 'Email is required');
      isValid = false;
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      showError('email-error', 'Please enter a valid email');
      isValid = false;
    } else {
      hideError('email-error');
    }
    
    if (!mobile) {
      showError('mobile-error', 'Mobile number is required');
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(mobile)) {
      showError('mobile-error', 'Please enter a valid 10-digit mobile number');
      isValid = false;
    } else {
      hideError('mobile-error');
    }
    
    if (!terms) {
      showError('terms-error', 'Please accept the terms and conditions');
      isValid = false;
    } else {
      hideError('terms-error');
    }
    
    return isValid;
  }

  // Helper functions
  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  function clearChatForm() {
    document.getElementById('chat-message').value = '';
    document.getElementById('chat-name').value = '';
    document.getElementById('chat-email').value = '';
    document.getElementById('chat-mobile').value = '';
    document.getElementById('chat-terms').checked = false;
    
    // Hide all errors
    ['message-error', 'name-error', 'email-error', 'mobile-error', 'terms-error'].forEach(hideError);
  }

  // Submit form function
  async function submitChatForm() {
    try {
      const formData = {
        ambassadorId: currentAmbassador.id,
        ambassadorName: currentAmbassador.name,
        message: document.getElementById('chat-message').value.trim(),
        name: document.getElementById('chat-name').value.trim(),
        email: document.getElementById('chat-email').value.trim(),
        mobile: document.getElementById('chat-mobile').value.trim(),
      };
      
      console.log('📤 Submitting chat form:', formData);
      
      // Here you would normally send to your backend
      // For now, we'll simulate success
      setTimeout(() => {
        currentChatStep = 3;
        showChatStep(3);
        updateStepIndicators();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      alert('Failed to send message. Please try again.');
    }
  }

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
  async function loadAmbassadors(containerId = 'leadx-main-container') {
    try {
      console.log('📡 Loading ambassadors...');
      const response = await fetch(\`\${CONFIG.apiUrl}/api/auth/ambassadors/public\`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const ambassadors = result.data; // No need to filter - API already returns filtered data
        console.log(\`✅ Loaded \${ambassadors.length} ambassadors\`);
        console.log('Ambassador data:', ambassadors);
        
        // Store ambassadors globally for profile modal access
        window.leadxAmbassadors = ambassadors;
        
        renderAmbassadorCards(ambassadors, containerId);
      } else {
        throw new Error(result.message || 'No ambassadors found');
      }
    } catch (error) {
      console.error('❌ Error loading ambassadors:', error);
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = \`
          <div style="text-align: center; padding: 60px 30px; color: #666;">
            <p>Unable to load ambassadors. Please try again later.</p>
          </div>
        \`;
      }
    }
  }

  // Render ambassadors with EXACT AmbassadorCard UI
  function renderAmbassadorCards(ambassadors, containerId = 'leadx-main-container') {
    const container = document.getElementById(containerId);
    
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
          
          <!-- Info Button -->
          <div style="position: absolute; top: 8px; right: 8px;">
            <button 
              onclick="showProfile('\${ambassador._id}', '\${ambassador.name}')"
              style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(255,255,255,0.9);
                backdrop-filter: blur(4px);
                border: 1px solid rgba(255,255,255,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
              "
            >
              <svg style="width: 16px; height: 16px; color: #64748b;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
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

    const gridClass = containerId === 'leadx-main-container' ? 'leadx-main-grid' : 'leadx-grid';
    container.innerHTML = \`
      <div class="\${gridClass}">
        \${cards}
      </div>
    \`;
  }

  // Start chat function - opens chat modal with multi-step form
  window.startChat = function(ambassadorId, ambassadorName) {
    currentAmbassador = { id: ambassadorId, name: ambassadorName };
    currentChatStep = 1;
    
    // Reset and show modal
    clearChatForm();
    showChatStep(1);
    updateStepIndicators();
    document.getElementById('leadx-chat-modal').style.display = 'flex';
    
    console.log(\`Starting chat with \${ambassadorName} (ID: \${ambassadorId})\`);
  };

  // Show profile function - opens ambassador profile modal
  window.showProfile = function(ambassadorId, ambassadorName) {
    // Find ambassador data
    const ambassador = window.leadxAmbassadors?.find(a => a._id === ambassadorId);
    if (!ambassador) {
      console.error('Ambassador not found');
      return;
    }
    
    // Create and show profile modal
    createProfileModal(ambassador);
    document.getElementById('leadx-profile-modal').style.display = 'flex';
    console.log(\`Opening profile for \${ambassadorName} (ID: \${ambassadorId})\`);
  };

  // Create profile modal
  function createProfileModal(ambassador) {
    // Remove existing modal if any
    const existingModal = document.getElementById('leadx-profile-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const profileModal = document.createElement('div');
    profileModal.id = 'leadx-profile-modal';
    profileModal.style.cssText = \`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 10002;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    \`;
    
    profileModal.innerHTML = \`
      <div style="
        background: white;
        border-radius: 16px;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      ">
        <!-- Header -->
        <div style="
          padding: 20px;
          background: \${CONFIG.colors.button};
          color: \${CONFIG.colors.text};
          border-radius: 16px 16px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h2 style="margin: 0; font-size: 20px; font-weight: 600;">Ambassador Profile</h2>
          <button onclick="closeProfileModal()" style="
            background: rgba(255,255,255,0.2);
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            color: \${CONFIG.colors.text};
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">×</button>
        </div>
        
        <!-- Profile Content -->
        <div style="padding: 30px;">
          <!-- Profile Image and Basic Info -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="
              width: 120px;
              height: 120px;
              border-radius: 50%;
              border: 4px solid \${CONFIG.colors.button};
              overflow: hidden;
              margin: 0 auto 15px;
              position: relative;
            ">
              <img 
                src="\${ambassador.profileImage ? CONFIG.apiUrl + '/' + ambassador.profileImage : ''}"
                alt="\${ambassador.name}"
                style="width: 100%; height: 100%; object-fit: cover;"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\"width:100%;height:100%;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;color:white;font-size:36px;font-weight:bold;\\">\${ambassador.name.charAt(0).toUpperCase()}</div>'"
              />
              <!-- Online Status -->
              <div style="
                position: absolute;
                bottom: 5px;
                right: 5px;
                width: 20px;
                height: 20px;
                background: #10b981;
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  background: #059669;
                  border-radius: 50%;
                "></div>
              </div>
            </div>
            
            <h3 style="
              margin: 0 0 5px 0;
              font-size: 24px;
              font-weight: 600;
              color: #1f2937;
            ">\${ambassador.name}</h3>
            
            <p style="
              margin: 0;
              font-size: 16px;
              color: #6b7280;
              font-weight: 500;
            ">\${ambassador.course || ambassador.program || 'Student Ambassador'}</p>
          </div>
          
          <!-- Detailed Information -->
          <div style="space-y: 20px;">
            <!-- Location -->
            <div style="
              background: #f8fafc;
              border-radius: 12px;
              padding: 20px;
              border-left: 4px solid \${CONFIG.colors.button};
              margin-bottom: 20px;
            ">
              <h4 style="
                margin: 0 0 10px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
              ">
                <svg style="width: 20px; height: 20px; color: \${CONFIG.colors.button};" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
                Location
              </h4>
              <div style="display: flex; align-items: center; gap: 8px;">
                <img
                  src="\${getCountryFlag(ambassador.country || 'India')}"
                  alt="Flag"
                  style="width: 24px; height: 18px; border-radius: 3px;"
                  onerror="this.style.display='none'"
                />
                <p style="margin: 0; font-size: 14px; color: #374151;">
                  \${(() => {
                    const country = ambassador.country?.trim();
                    if (country === 'India' || country === 'india' || country?.toLowerCase() === 'india') {
                      return \`\${ambassador.state || ''}, \${ambassador.country || 'India'}\`;
                    }
                    return ambassador.country || 'India';
                  })()}
                </p>
              </div>
            </div>
            
            <!-- Languages -->
            <div style="
              background: #f8fafc;
              border-radius: 12px;
              padding: 20px;
              border-left: 4px solid \${CONFIG.colors.button};
              margin-bottom: 20px;
            ">
              <h4 style="
                margin: 0 0 10px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
              ">
                <svg style="width: 20px; height: 20px; color: \${CONFIG.colors.button};" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clip-rule="evenodd"/>
                </svg>
                Languages
              </h4>
              <p style="margin: 0; font-size: 14px; color: #374151;">
                \${(() => {
                  let languages = ambassador.languages || ambassador.language;
                  if (Array.isArray(languages)) {
                    return languages.join(', ');
                  }
                  if (typeof languages === 'string') {
                    try {
                      const parsed = JSON.parse(languages);
                      if (Array.isArray(parsed)) {
                        return parsed.join(', ');
                      }
                    } catch (e) {
                      if (languages.includes(',')) {
                        return languages.split(',').map(lang => lang.trim()).join(', ');
                      }
                    }
                  }
                  return languages || 'English';
                })()}
              </p>
            </div>
            
            <!-- About -->
            <div style="
              background: #f8fafc;
              border-radius: 12px;
              padding: 20px;
              border-left: 4px solid \${CONFIG.colors.button};
              margin-bottom: 20px;
            ">
              <h4 style="
                margin: 0 0 10px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
              ">
                <svg style="width: 20px; height: 20px; color: \${CONFIG.colors.button};" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
                </svg>
                About Me
              </h4>
              <p style="
                margin: 0;
                font-size: 14px;
                color: #374151;
                line-height: 1.6;
              ">
                \${ambassador.description || ambassador.about || 'I am a student ambassador ready to help you with any questions about our programs and campus life!'}
              </p>
            </div>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin-top: 30px;">
            <button 
              onclick="closeProfileModal(); startChat('\${ambassador._id}', '\${ambassador.name}')"
              style="
                background: \${CONFIG.colors.button};
                color: \${CONFIG.colors.text};
                border: none;
                border-radius: 12px;
                padding: 15px 30px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin: 0 auto;
              "
              onmouseover="this.style.transform='scale(1.05)'"
              onmouseout="this.style.transform='scale(1)'"
            >
              <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
              </svg>
              Start Chat
            </button>
          </div>
        </div>
      </div>
    \`;
    
    profileModal.onclick = (e) => {
      if (e.target === profileModal) closeProfileModal();
    };
    
    document.body.appendChild(profileModal);
  }

  // Close profile modal
  window.closeProfileModal = function() {
    const modal = document.getElementById('leadx-profile-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  };

  // Initialize
  function init() {
    const mainContainer = createMainContainer();
    createFloatingButton();
    createModal();
    createChatModal();
    
    // Load ambassadors directly in main container
    loadAmbassadors('leadx-main-container');
    
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
