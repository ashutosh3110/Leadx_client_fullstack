import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCustomization } from '../../context/CustomizationContext';

const CustomizationForm = () => {
    const { customization, updateCustomization } = useCustomization();
    
    const [formData, setFormData] = useState(customization);

    const [colorFormat, setColorFormat] = useState({
        backgroundColor: 'hex',
        textColor: 'hex',
        chatBackgroundColor: 'hex',
        chatTextColor: 'hex',
        gradientColor: 'hex'
    });

    // Sync form data with context when customization changes
    useEffect(() => {
        setFormData(customization);
        
        // Auto-detect color formats based on saved values
        const newColorFormat = { ...colorFormat };
        
        if (customization.backgroundColor && customization.backgroundColor.startsWith('rgb')) {
            newColorFormat.backgroundColor = 'rgb';
        } else if (customization.backgroundColor && customization.backgroundColor.startsWith('#')) {
            newColorFormat.backgroundColor = 'hex';
        }
        
        if (customization.textColor && customization.textColor.startsWith('rgb')) {
            newColorFormat.textColor = 'rgb';
        } else if (customization.textColor && customization.textColor.startsWith('#')) {
            newColorFormat.textColor = 'hex';
        }
        
        if (customization.chatBackgroundColor && customization.chatBackgroundColor.startsWith('rgb')) {
            newColorFormat.chatBackgroundColor = 'rgb';
        } else if (customization.chatBackgroundColor && customization.chatBackgroundColor.startsWith('#')) {
            newColorFormat.chatBackgroundColor = 'hex';
        }
        
        if (customization.chatTextColor && customization.chatTextColor.startsWith('rgb')) {
            newColorFormat.chatTextColor = 'rgb';
        } else if (customization.chatTextColor && customization.chatTextColor.startsWith('#')) {
            newColorFormat.chatTextColor = 'hex';
        }
        
        if (customization.gradientColor && customization.gradientColor.startsWith('rgb')) {
            newColorFormat.gradientColor = 'rgb';
        } else if (customization.gradientColor && customization.gradientColor.startsWith('#')) {
            newColorFormat.gradientColor = 'hex';
        }
        
        setColorFormat(newColorFormat);
    }, [customization]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...(prev.questions || []), '']
        }));
    };

    const handleQuestionChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => i === index ? value : q)
        }));
    };

    const handleRemoveQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleColorFormatChange = (field, format) => {
        setColorFormat(prev => ({
            ...prev,
            [field]: format
        }));
        
        // Reset color value when format changes
        if (format === 'hex') {
            setFormData(prev => ({
                ...prev,
                [field]: '#ffffff'
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: 'rgb(255, 255, 255)'
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        
        // Update the global customization context
        updateCustomization(formData);
        
        // Show success message
        toast.success('Configuration saved successfully! The changes will be applied to the Chat buttons.');
    };

    // Generate embeddable script
    const generateEmbeddableScript = (data) => {
        // Generate unique client ID
        const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return `<!-- LeadX Ambassador Chat Widget -->
<!-- Client ID: ${clientId} -->
<!-- Generated: ${new Date().toISOString()} -->
<script>
(function() {
  // Configuration for ${data.webName || 'Client Website'}
  const config = {
    clientId: "${clientId}",
    apiBaseUrl: "${data.apiBaseUrl || 'http://localhost:5000'}",
    webUrl: "${data.webUrl || ''}",
    webName: "${data.webName || ''}",
    status: "${data.status || 'active'}",
    policyUrl: "${data.policyUrl || ''}",
    termsUrl: "${data.termsUrl || ''}",
    questions: ${JSON.stringify(data.questions || [], null, 2)},
    tilesAndButtonColor: "${data.tilesAndButtonColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}",
    textColor: "${data.textColor || '#ffffff'}",
    borderColor: "${data.borderColor || '#e5e7eb'}",
    borderSize: "${data.borderSize || '3'}"
  };

  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'leadx-ambassador-widget';
  widgetContainer.innerHTML = \`
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div id="ambassador-cards" style="
        display: none;
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 300px;
        max-height: 400px;
        overflow-y: auto;
        background: white;
        border-radius: \${config.borderSize}px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        border: 1px solid \${config.borderColor};
      ">
        <!-- Ambassador cards will be loaded here -->
      </div>
      
      <button id="chat-toggle" style="
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: \${config.tilesAndButtonColor};
        color: \${config.textColor};
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        💬
      </button>
    </div>
  \`;

  // Load ambassadors
  async function loadAmbassadors() {
    try {
      const response = await fetch(\`\${config.apiBaseUrl}/api/ambassadors/public\`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        const cardsContainer = document.getElementById('ambassador-cards');
        cardsContainer.innerHTML = data.data.map(ambassador => \`
          <div style="
            padding: 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'"
          onclick="openChat('\${ambassador._id}', '\${ambassador.name}', '\${ambassador.email}')">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: \${config.tilesAndButtonColor};
                display: flex;
                align-items: center;
                justify-content: center;
                color: \${config.textColor};
                font-weight: bold;
              ">
                \${ambassador.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-weight: 600; color: #333;">\${ambassador.name}</div>
                <div style="font-size: 12px; color: #666;">\${ambassador.course || 'Student Ambassador'}</div>
              </div>
            </div>
          </div>
        \`).join('');
      }
    } catch (error) {
      console.error('Error loading ambassadors:', error);
    }
  }

  // Open chat modal
  function openChat(ambassadorId, ambassadorName, ambassadorEmail) {
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = \`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    \`;
    
    modal.innerHTML = \`
      <div style="
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      ">
        <div style="padding: 20px; border-bottom: 1px solid #eee;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: #333;">Chat with \${ambassadorName}</h3>
            <button onclick="this.closest('.modal').remove()" style="
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #666;
            ">×</button>
          </div>
        </div>
        
        <div style="padding: 20px;">
          <form id="chat-form">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500;">Your Message *</label>
              <textarea name="message" required style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
                resize: vertical;
                min-height: 80px;
              " placeholder="Ask your question..."></textarea>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500;">Your Name *</label>
              <input type="text" name="name" required style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
              " placeholder="Enter your name">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500;">Your Email *</label>
              <input type="email" name="email" required style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
              " placeholder="Enter your email">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500;">Your Mobile *</label>
              <input type="tel" name="mobile" required style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
              " placeholder="Enter your mobile number">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" name="terms" required>
                <span style="font-size: 14px;">
                  I agree to the 
                  <a href="\${config.termsUrl}" target="_blank" style="color: #007bff;">Terms of Use</a> and 
                  <a href="\${config.policyUrl}" target="_blank" style="color: #007bff;">Privacy Policy</a>
                </span>
              </label>
            </div>
            
            <button type="submit" style="
              width: 100%;
              padding: 12px;
              background: \${config.tilesAndButtonColor};
              color: \${config.textColor};
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              transition: opacity 0.2s;
            " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
              Send Message
            </button>
          </form>
        </div>
      </div>
    \`;
    
    modal.className = 'modal';
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('chat-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        mobile: formData.get('mobile'),
        message: formData.get('message'),
        ambassadorId: ambassadorId,
        ambassadorName: ambassadorName,
        ambassadorEmail: ambassadorEmail
      };
      
      try {
        // Auto-register user with hashed password
        const response = await fetch(\`\${config.apiBaseUrl}/api/user/auto-register\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            password: '123456', // Default password
            role: 'user'
          })
        });
        
        if (response.ok) {
          // Send chat message
          const chatResponse = await fetch(\`\${config.apiBaseUrl}/api/chat/send\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ambassadorId: ambassadorId,
              message: userData.message,
              userEmail: userData.email
            })
          });
          
          if (chatResponse.ok) {
            alert('Message sent successfully! You will receive an email when the ambassador replies.');
            modal.remove();
          } else {
            alert('Error sending message. Please try again.');
          }
        } else {
          alert('Error registering user. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }

  // Toggle ambassador cards
  document.getElementById('chat-toggle').addEventListener('click', function() {
    const cards = document.getElementById('ambassador-cards');
    cards.style.display = cards.style.display === 'none' ? 'block' : 'none';
  });

  // Close cards when clicking outside
  document.addEventListener('click', function(e) {
    const widget = document.getElementById('leadx-ambassador-widget');
    const cards = document.getElementById('ambassador-cards');
    if (!widget.contains(e.target)) {
      cards.style.display = 'none';
    }
  });

  // Initialize
  document.body.appendChild(widgetContainer);
  loadAmbassadors();
})();
</script>`;
    };

    // Generate HTML example
    const generateHTMLExample = (data) => {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Website</title>
</head>
<body>
    <h1>Welcome to Your Website</h1>
    <p>Your website content goes here...</p>
    
    <!-- LeadX Ambassador Chat Widget -->
    ${generateEmbeddableScript(data)}
</body>
</html>`;
    };

    const ColorInput = ({ field, label, value }) => {
        const handleColorInputChange = (newValue) => {
            handleInputChange(field, newValue);
        };

        const handleColorInputKeyDown = (e) => {
            // For RGB format, handle special key combinations
            if (colorFormat[field] === 'rgb') {
                // If user presses Ctrl+A or Cmd+A, select all text
                if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                    e.target.select();
                    return;
                }
                
                // If user presses Delete or Backspace when all text is selected, clear the field
                if ((e.key === 'Delete' || e.key === 'Backspace') && 
                    e.target.selectionStart === 0 && e.target.selectionEnd === e.target.value.length) {
                    e.preventDefault();
                    handleColorInputChange('');
                    return;
                }
            }
        };

        const handleColorInputFocus = (e) => {
            // Auto-select all text when focusing on RGB input
            if (colorFormat[field] === 'rgb') {
                setTimeout(() => {
                    e.target.select();
                }, 10);
            }
        };

        const handleColorPickerChange = (e) => {
            const hexColor = e.target.value;
            handleColorInputChange(hexColor);
        };

        const clearColorInput = () => {
            handleColorInputChange('');
        };

        return (
            <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                    {label}
                </label>
                <div className="flex space-x-2">
                    <div className="flex space-x-1">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`${field}-format`}
                                checked={colorFormat[field] === 'hex'}
                                onChange={() => handleColorFormatChange(field, 'hex')}
                                className="mr-1 w-3 h-3 text-blue-600"
                            />
                            <span className="text-xs text-slate-600">HEX</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`${field}-format`}
                                checked={colorFormat[field] === 'rgb'}
                                onChange={() => handleColorFormatChange(field, 'rgb')}
                                className="mr-1 w-3 h-3 text-blue-600"
                            />
                            <span className="text-xs text-slate-600">RGB</span>
                        </label>
                    </div>
                    <div className="flex-1 flex space-x-1">
                        {colorFormat[field] === 'hex' ? (
                            <div className="relative">
                                <input
                                    ref={(ref) => {
                                        if (ref) {
                                            ref.colorPickerField = field;
                                        }
                                    }}
                                    type="color"
                                    value={value.startsWith('#') ? value : '#ffffff'}
                                    onChange={handleColorPickerChange}
                                    className="absolute opacity-0 w-10 h-8 cursor-pointer"
                                    style={{ zIndex: 10 }}
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const colorInput = e.currentTarget.previousElementSibling;
                                        if (colorInput) {
                                            colorInput.click();
                                        }
                                    }}
                                    className="w-10 h-8 border-2 border-slate-300 rounded cursor-pointer hover:border-blue-400 transition-colors flex items-center justify-center relative"
                                    title="Click to open color picker"
                                    style={{ 
                                        minWidth: '40px', 
                                        minHeight: '32px',
                                        backgroundColor: value.startsWith('#') ? value : '#ffffff'
                                    }}
                                >
                                    <svg className="w-4 h-4 text-gray-600 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                    </svg>
                                </button>
                            </div>
                        ) : null}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleColorInputChange(e.target.value)}
                                onKeyDown={handleColorInputKeyDown}
                                onFocus={handleColorInputFocus}
                                placeholder={colorFormat[field] === 'hex' ? '#ffffff' : 'rgb(255, 255, 255)'}
                                className="w-full p-2 pr-6 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
                            />
                            {value && (
                                <button
                                    type="button"
                                    onClick={clearColorInput}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600 flex items-center justify-center"
                                    title="Clear color"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <div 
                            className="w-8 h-8 border-2 border-slate-300 rounded cursor-pointer hover:border-slate-400 transition-colors flex-shrink-0"
                            style={{ backgroundColor: value || '#ffffff', minWidth: '32px', minHeight: '32px' }}
                            title="Color preview - click to copy color"
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (value) {
                                    navigator.clipboard.writeText(value).then(() => {
                                        // Show temporary feedback
                                        const originalTitle = e.target.title;
                                        e.target.title = 'Color copied!';
                                        setTimeout(() => {
                                            e.target.title = originalTitle;
                                        }, 1000);
                                    }).catch(() => {
                                        // Fallback for browsers that don't support clipboard API
                                        console.log('Color value:', value);
                                        const originalTitle = e.target.title;
                                        e.target.title = 'Copy not supported';
                                        setTimeout(() => {
                                            e.target.title = originalTitle;
                                        }, 1000);
                                    });
                                }
                            }}
                        ></div>
                    </div>
                </div>
                {colorFormat[field] === 'rgb' && (
                    <div className="text-xs text-slate-500 mt-1">
                        💡 Tip: Focus on the input and press Ctrl+A (or Cmd+A) to select all, then Delete to clear
                    </div>
                )}
                {colorFormat[field] === 'hex' && (
                    <div className="text-xs text-slate-500 mt-1">
                        🎨 Tip: Click the color square to open the color picker palette
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-4" style={{ touchAction: 'pan-y' }}>
            <div className="max-w-3xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-1"></div>
                    <div className="p-4">
                        <div className="text-center mb-4">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                                Ambassador Page Setting
                            </h1>
                            <p className="text-slate-600 text-sm">Configure your interface settings</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* Web URL Section */}
                            <div className="bg-green-50/50 rounded-lg p-3 border border-green-200/30">
                                <h2 className="text-base font-semibold text-green-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                    </svg>
                                    Web URL
                                </h2>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            Web URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.webUrl || ''}
                                            onChange={(e) => handleInputChange('webUrl', e.target.value)}
                                            placeholder="https://example.com"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                                        />
                                        <p className="text-xs text-slate-500">Main website URL</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            Web Name <span className="text-red-500">*</span>
                                        </label>
                                            <input
                                            type="text"
                                            value={formData.webName || ''}
                                            onChange={(e) => handleInputChange('webName', e.target.value)}
                                            placeholder="Enter website name"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                                        />
                                        <p className="text-xs text-slate-500">Website display name</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            Status <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.status || 'active'}
                                            onChange={(e) => handleInputChange('status', e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        <p className="text-xs text-slate-500">Website status</p>
                                    </div>
                                </div>
                            </div>

                            {/* Terms and Policy URL Section */}
                            <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/30">
                                <h2 className="text-base font-semibold text-blue-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Terms and Policy URL
                                </h2>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            Policy URL <span className="text-red-500">*</span>
                                        </label>
                                            <input
                                            type="url"
                                            value={formData.policyUrl || ''}
                                            onChange={(e) => handleInputChange('policyUrl', e.target.value)}
                                            placeholder="https://example.com/privacy-policy"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                                        />
                                        <p className="text-xs text-slate-500">URL for Privacy Policy page</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            Terms & Conditions URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.termsUrl || ''}
                                            onChange={(e) => handleInputChange('termsUrl', e.target.value)}
                                            placeholder="https://example.com/terms-and-conditions"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                                        />
                                        <p className="text-xs text-slate-500">URL for Terms & Conditions page</p>
                                    </div>
                                </div>

                            </div>


                            {/* Ambassador Card Settings Section */}
                            <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-200/30">
                                <h2 className="text-base font-semibold text-purple-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    Ambassador Card Settings
                                </h2>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            Button Background Color <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={formData.tilesAndButtonColor || ''}
                                                onChange={(e) => handleInputChange('tilesAndButtonColor', e.target.value)}
                                                placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                                            />
                                            <input
                                                type="color"
                                                value={formData.tilesAndButtonColor?.includes('#') ? formData.tilesAndButtonColor : '#667eea'}
                                                onChange={(e) => handleInputChange('tilesAndButtonColor', e.target.value)}
                                                className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">Gradient color for ambassador card background image and button colors</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                           Button Text Color <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={formData.textColor || ''}
                                                onChange={(e) => handleInputChange('textColor', e.target.value)}
                                                placeholder="#ffffff"
                                                className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                                            />
                                            <input
                                                type="color"
                                                value={formData.textColor || '#ffffff'}
                                                onChange={(e) => handleInputChange('textColor', e.target.value)}
                                                className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">Text color for ambassador card button and chat modal text</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            Border Color <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={formData.borderColor || ''}
                                                onChange={(e) => handleInputChange('borderColor', e.target.value)}
                                                placeholder="#e5e7eb"
                                                className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                                            />
                                            <input
                                                type="color"
                                                value={formData.borderColor || '#e5e7eb'}
                                                onChange={(e) => handleInputChange('borderColor', e.target.value)}
                                                className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">Border color for ambassador cards and chat questions</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                            Border Redius <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.borderSize || '3'}
                                            onChange={(e) => handleInputChange('borderSize', e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                                        >
                                            <option value="1">1 - Flat</option>
                                            <option value="2">2 - Slightly Rounded</option>
                                            <option value="3">3 - Medium Rounded</option>
                                            <option value="4">4 - More Rounded</option>
                                            <option value="5">5 - Very Rounded</option>
                                        </select>
                                        <p className="text-xs text-slate-500">Border radius for ambassador cards (1=flat, 5=very rounded)</p>
                                    </div>
                                </div>

                                {/* Dynamic Questions Section */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Questions
                                    </label>
                                    {formData.questions && formData.questions.map((question, index) => (
                                        <div key={index} className="mb-3 p-3 bg-white/60 rounded border border-slate-200">
                                            <div className="flex items-start space-x-2">
                                                <div className="flex-1">
                                        <textarea
                                                        value={question}
                                                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                                            placeholder="Type your question here..."
                                                        rows="2"
                                                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200 resize-none"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveQuestion(index)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                                </button>
                                    </div>
                                </div>
                                    ))}
                                    
                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="w-full p-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-colors text-sm"
                                    >
                                        + Add New Question
                                    </button>
                                </div>

                            </div>

                            {/* Script Generation Section */}
                            <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-200/30">
                                <h3 className="text-base font-semibold text-amber-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    Dynamic Client Script Generator
                                </h3>
                                <p className="text-xs text-amber-600 mb-3">
                                    Generate unique scripts for different clients. Each script will have custom branding and settings.
                                </p>
                                
                                {/* Client Information */}
                                <div className="bg-white/60 rounded p-3 border border-amber-200 mb-3">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Client Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.clientName || ''}
                                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                                        placeholder="e.g., Delhi University, IIT Mumbai"
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">This will be used to identify the client and customize the script</p>
                                </div>
                                
                                <div className="space-y-3">
                                    {/* API Configuration */}
                                    <div className="bg-white/60 rounded p-3 border border-amber-200">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            API Base URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.apiBaseUrl || 'http://localhost:5000'}
                                            onChange={(e) => handleInputChange('apiBaseUrl', e.target.value)}
                                            placeholder="https://your-api-domain.com"
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Your backend API URL where the script will make requests</p>
                                    </div>

                                    {/* Script Preview */}
                                    <div className="flex space-x-3">
                                        <div className="flex-1">
                                            <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto max-h-80 overflow-y-auto font-mono">
{`<!-- LeadX Ambassador Chat Widget -->
<script>
(function() {
  // Configuration
  const config = {
    apiBaseUrl: "${formData.apiBaseUrl || 'http://localhost:5000'}",
    webUrl: "${formData.webUrl || ''}",
    webName: "${formData.webName || ''}",
    status: "${formData.status || 'active'}",
    policyUrl: "${formData.policyUrl || ''}",
    termsUrl: "${formData.termsUrl || ''}",
    questions: ${JSON.stringify(formData.questions || [], null, 2)},
    tilesAndButtonColor: "${formData.tilesAndButtonColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}",
    textColor: "${formData.textColor || '#ffffff'}",
    borderColor: "${formData.borderColor || '#e5e7eb'}",
    borderSize: "${formData.borderSize || '3'}"
  };

  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'leadx-ambassador-widget';
  widgetContainer.innerHTML = \`
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div id="ambassador-cards" style="
        display: none;
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 300px;
        max-height: 400px;
        overflow-y: auto;
        background: white;
        border-radius: \${config.borderSize}px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        border: 1px solid \${config.borderColor};
      ">
        <!-- Ambassador cards will be loaded here -->
      </div>
      
      <button id="chat-toggle" style="
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: \${config.tilesAndButtonColor};
        color: \${config.textColor};
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        💬
      </button>
    </div>
  \`;

  // Load ambassadors
  async function loadAmbassadors() {
    try {
      const response = await fetch(\`\${config.apiBaseUrl}/api/ambassadors/public\`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        const cardsContainer = document.getElementById('ambassador-cards');
        cardsContainer.innerHTML = data.data.map(ambassador => \`
          <div style="
            padding: 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'"
          onclick="openChat('\${ambassador._id}', '\${ambassador.name}', '\${ambassador.email}')">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: \${config.tilesAndButtonColor};
                display: flex;
                align-items: center;
                justify-content: center;
                color: \${config.textColor};
                font-weight: bold;
              ">
                \${ambassador.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-weight: 600; color: #333;">\${ambassador.name}</div>
                <div style="font-size: 12px; color: #666;">\${ambassador.course || 'Student Ambassador'}</div>
              </div>
            </div>
          </div>
        \`).join('');
      }
    } catch (error) {
      console.error('Error loading ambassadors:', error);
    }
  }

  // Open chat modal
  function openChat(ambassadorId, ambassadorName, ambassadorEmail) {
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = \`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    \`;
    
    modal.innerHTML = \`
      <div style="
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      ">
        <div style="padding: 20px; border-bottom: 1px solid #eee;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: #333;">Chat with \${ambassadorName}</h3>
            <button onclick="this.closest('.modal').remove()" style="
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #666;
            ">×</button>
          </div>
        </div>
        
        <div style="padding: 20px;">
          <form id="chat-form">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500;">Your Message *</label>
              <textarea name="message" required style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
                resize: vertical;
                min-height: 80px;
              " placeholder="Ask your question..."></textarea>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500;">Your Name *</label>
              <input type="text" name="name" required style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
              " placeholder="Enter your name">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500;">Your Email *</label>
              <input type="email" name="email" required style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
              " placeholder="Enter your email">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500;">Your Mobile *</label>
              <input type="tel" name="mobile" required style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
              " placeholder="Enter your mobile number">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" name="terms" required>
                <span style="font-size: 14px;">
                  I agree to the 
                  <a href="\${config.termsUrl}" target="_blank" style="color: #007bff;">Terms of Use</a> and 
                  <a href="\${config.policyUrl}" target="_blank" style="color: #007bff;">Privacy Policy</a>
                </span>
              </label>
            </div>
            
            <button type="submit" style="
              width: 100%;
              padding: 12px;
              background: \${config.tilesAndButtonColor};
              color: \${config.textColor};
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              transition: opacity 0.2s;
            " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
              Send Message
            </button>
          </form>
        </div>
      </div>
    \`;
    
    modal.className = 'modal';
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('chat-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        mobile: formData.get('mobile'),
        message: formData.get('message'),
        ambassadorId: ambassadorId,
        ambassadorName: ambassadorName,
        ambassadorEmail: ambassadorEmail
      };
      
      try {
        // Auto-register user with hashed password
        const response = await fetch(\`\${config.apiBaseUrl}/api/user/auto-register\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            password: '123456', // Default password
            role: 'user'
          })
        });
        
        if (response.ok) {
          // Send chat message
          const chatResponse = await fetch(\`\${config.apiBaseUrl}/api/chat/send\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ambassadorId: ambassadorId,
              message: userData.message,
              userEmail: userData.email
            })
          });
          
          if (chatResponse.ok) {
            alert('Message sent successfully! You will receive an email when the ambassador replies.');
            modal.remove();
          } else {
            alert('Error sending message. Please try again.');
          }
        } else {
          alert('Error registering user. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }

  // Toggle ambassador cards
  document.getElementById('chat-toggle').addEventListener('click', function() {
    const cards = document.getElementById('ambassador-cards');
    cards.style.display = cards.style.display === 'none' ? 'block' : 'none';
  });

  // Close cards when clicking outside
  document.addEventListener('click', function(e) {
    const widget = document.getElementById('leadx-ambassador-widget');
    const cards = document.getElementById('ambassador-cards');
    if (!widget.contains(e.target)) {
      cards.style.display = 'none';
    }
  });

  // Initialize
  document.body.appendChild(widgetContainer);
  loadAmbassadors();
})();
</script>`}
                                            </pre>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!formData.clientName) {
                                                        toast.error('Please enter client name first!');
                                                        return;
                                                    }
                                                    const script = generateEmbeddableScript(formData);
                                                    navigator.clipboard.writeText(script);
                                                    toast.success(`Script for ${formData.clientName} copied to clipboard!`);
                                                }}
                                                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center space-x-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                <span>Copy Script</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!formData.clientName) {
                                                        toast.error('Please enter client name first!');
                                                        return;
                                                    }
                                                    const script = generateEmbeddableScript(formData);
                                                    const blob = new Blob([script], { type: 'text/javascript' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `leadx-widget-${formData.clientName.replace(/\s+/g, '-').toLowerCase()}.js`;
                                                    a.click();
                                                    URL.revokeObjectURL(url);
                                                    toast.success(`Script for ${formData.clientName} downloaded!`);
                                                }}
                                                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center space-x-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span>Download</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!formData.clientName) {
                                                        toast.error('Please enter client name first!');
                                                        return;
                                                    }
                                                    const html = generateHTMLExample(formData);
                                                    navigator.clipboard.writeText(html);
                                                    toast.success(`HTML example for ${formData.clientName} copied!`);
                                                }}
                                                className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm flex items-center space-x-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span>HTML Example</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!formData.clientName) {
                                                        toast.error('Please enter client name first!');
                                                        return;
                                                    }
                                                    // Save client configuration
                                                    const clientConfig = {
                                                        id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                                        name: formData.clientName,
                                                        webUrl: formData.webUrl,
                                                        webName: formData.webName,
                                                        apiBaseUrl: formData.apiBaseUrl,
                                                        status: formData.status,
                                                        policyUrl: formData.policyUrl,
                                                        termsUrl: formData.termsUrl,
                                                        questions: formData.questions,
                                                        tilesAndButtonColor: formData.tilesAndButtonColor,
                                                        textColor: formData.textColor,
                                                        borderColor: formData.borderColor,
                                                        borderSize: formData.borderSize,
                                                        createdAt: new Date().toISOString()
                                                    };
                                                    
                                                    // Save to localStorage
                                                    const existingClients = JSON.parse(localStorage.getItem('leadxClients') || '[]');
                                                    existingClients.push(clientConfig);
                                                    localStorage.setItem('leadxClients', JSON.stringify(existingClients));
                                                    
                                                    toast.success(`Client ${formData.clientName} saved successfully!`);
                                                }}
                                                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center space-x-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>Save Client</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Client Management Section */}
                            <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/30">
                                <h3 className="text-base font-semibold text-blue-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Saved Clients
                                </h3>
                                <p className="text-xs text-blue-600 mb-3">
                                    View and manage your saved client configurations.
                                </p>
                                
                                <div className="space-y-2">
                                    {(() => {
                                        const savedClients = JSON.parse(localStorage.getItem('leadxClients') || '[]');
                                        if (savedClients.length === 0) {
                                            return (
                                                <div className="text-center py-4 text-gray-500">
                                                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                    <p className="text-sm">No clients saved yet</p>
                                                </div>
                                            );
                                        }
                                        
                                        return savedClients.map((client, index) => (
                                            <div key={client.id} className="bg-white/60 rounded p-3 border border-blue-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-800">{client.name}</h4>
                                                        <p className="text-xs text-gray-500">{client.webName} • {client.webUrl}</p>
                                                        <p className="text-xs text-gray-400">Created: {new Date(client.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                // Load client configuration
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    clientName: client.name,
                                                                    webUrl: client.webUrl,
                                                                    webName: client.webName,
                                                                    apiBaseUrl: client.apiBaseUrl,
                                                                    status: client.status,
                                                                    policyUrl: client.policyUrl,
                                                                    termsUrl: client.termsUrl,
                                                                    questions: client.questions,
                                                                    tilesAndButtonColor: client.tilesAndButtonColor,
                                                                    textColor: client.textColor,
                                                                    borderColor: client.borderColor,
                                                                    borderSize: client.borderSize
                                                                }));
                                                                toast.success(`Loaded configuration for ${client.name}`);
                                                            }}
                                                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const script = generateEmbeddableScript(client);
                                                                navigator.clipboard.writeText(script);
                                                                toast.success(`Script for ${client.name} copied!`);
                                                            }}
                                                            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                                        >
                                                            Copy
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const updatedClients = savedClients.filter(c => c.id !== client.id);
                                                                localStorage.setItem('leadxClients', JSON.stringify(updatedClients));
                                                                toast.success(`Client ${client.name} deleted`);
                                                                // Force re-render
                                                                window.location.reload();
                                                            }}
                                                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-3">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Save Configuration</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizationForm;
