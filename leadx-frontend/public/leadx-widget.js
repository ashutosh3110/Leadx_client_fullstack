// LeadX Ambassador Chat Widget
// Version: 1.0.0
// Usage: <script src="http://localhost:5174/leadx-widget.js"></script>

(function() {
  // Configuration - Admin can customize these values
  const config = {
    apiBaseUrl: "http://localhost:5000",
    webUrl: "http://localhost:5174",
    webName: "testing",
    status: "active",
    policyUrl: "https://www.swiggy.com/privacy-policy",
    termsUrl: "https://www.swiggy.com/privacy-policy",
    questions: [
      "Which is the course u want?",
      "what sports u like it?"
    ],
    tilesAndButtonColor: "#7040f2",
    textColor: "#952d2d",
    borderColor: "#d00606",
    borderSize: "5"
  };

  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'leadx-ambassador-widget';
  widgetContainer.innerHTML = `
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
        border-radius: ${config.borderSize}px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        border: 1px solid ${config.borderColor};
      ">
        <!-- Ambassador cards will be loaded here -->
      </div>
      
      <button id="chat-toggle" style="
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: ${config.tilesAndButtonColor};
        color: ${config.textColor};
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
  `;

  // Load ambassadors
  async function loadAmbassadors() {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/ambassadors/public`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        const cardsContainer = document.getElementById('ambassador-cards');
        cardsContainer.innerHTML = data.data.map(ambassador => `
          <div style="
            padding: 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'"
          onclick="openChat('${ambassador._id}', '${ambassador.name}', '${ambassador.email}')">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: ${config.tilesAndButtonColor};
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${config.textColor};
                font-weight: bold;
              ">
                ${ambassador.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-weight: 600; color: #333;">${ambassador.name}</div>
                <div style="font-size: 12px; color: #666;">${ambassador.course || 'Student Ambassador'}</div>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        // Show demo content if no ambassadors
        const cardsContainer = document.getElementById('ambassador-cards');
        cardsContainer.innerHTML = `
          <div style="padding: 15px; text-align: center; color: #666;">
            <div style="margin-bottom: 10px;">🎓</div>
            <div style="font-weight: 600; margin-bottom: 5px;">No Ambassadors Available</div>
            <div style="font-size: 12px;">Please check back later</div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading ambassadors:', error);
      // Show error message
      const cardsContainer = document.getElementById('ambassador-cards');
      cardsContainer.innerHTML = `
        <div style="padding: 15px; text-align: center; color: #666;">
          <div style="margin-bottom: 10px;">⚠️</div>
          <div style="font-weight: 600; margin-bottom: 5px;">Connection Error</div>
          <div style="font-size: 12px;">Unable to load ambassadors</div>
        </div>
      `;
    }
  }

  // Open chat modal
  function openChat(ambassadorId, ambassadorName, ambassadorEmail) {
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
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
    `;
    
    modal.innerHTML = `
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
            <h3 style="margin: 0; color: #333;">Chat with ${ambassadorName}</h3>
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
                  <a href="${config.termsUrl}" target="_blank" style="color: #007bff;">Terms of Use</a> and 
                  <a href="${config.policyUrl}" target="_blank" style="color: #007bff;">Privacy Policy</a>
                </span>
              </label>
            </div>
            
            <button type="submit" style="
              width: 100%;
              padding: 12px;
              background: ${config.tilesAndButtonColor};
              color: ${config.textColor};
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
    `;
    
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
        const response = await fetch(`${config.apiBaseUrl}/api/user/auto-register`, {
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
          const chatResponse = await fetch(`${config.apiBaseUrl}/api/chat/send`, {
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
