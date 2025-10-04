# LeadX Ambassador Widget Generator Guide

## Overview

The LeadX Ambassador Widget Generator allows admins to create customized embeddable widgets for clients (universities, colleges, etc.). These widgets display ambassador cards with chat functionality that can be embedded on any website.

## Features

- 🎨 **Customizable UI**: Colors, borders, and styling
- ❓ **Default Questions**: Add up to 6 pre-defined questions for ambassadors
- 👥 **Ambassador Selection**: Choose specific ambassadors for each widget
- 🔗 **Easy Embedding**: Generate simple script tags for clients
- 📱 **Responsive Design**: Works on all devices
- 💬 **Chat Integration**: Direct chat with ambassadors

## How It Works

### 1. Admin Creates Widget Configuration

1. Login as admin
2. Go to **Settings > Customize**
3. Fill out the unified form with 5 sections:
   - **Client Info**: Client name, email, target website, price
   - **Web Settings**: Your company info, privacy/terms URLs
   - **UI Design**: Colors, borders, styling
   - **Questions**: Add default questions (up to 6)
   - **Ambassadors**: Select which ambassadors to include

### 2. Script Generation

- After completing the form, a JavaScript script is automatically generated
- The script URL format: `https://yourapi.com/api/customization/script/{configId}.js`
- Admin gets a script tag: `<script src="..."></script>`

### 3. Client Implementation

- Client copies the script tag
- Pastes it into their website HTML
- Widget automatically loads and displays ambassador cards

### 4. User Interaction

- Website visitors see ambassador cards
- Cards show ambassador photos, names, and default questions
- Clicking "Chat" opens a modal with contact form
- Form submissions create chat conversations in LeadX system

## API Endpoints

### Admin Endpoints (Protected)

```
POST   /api/customization              - Create new configuration
GET    /api/customization              - Get all configurations
PUT    /api/customization/:id          - Update configuration
DELETE /api/customization/:id          - Delete configuration
```

### Public Endpoints

```
GET    /api/customization/script/:configId.js  - Serve embeddable script
GET    /api/customization/public/:configId     - Get public configuration
POST   /api/embed/submit                       - Submit chat form
```

## Database Schema

### CustomizationConfig Model

```javascript
{
  configId: String,           // Unique identifier
  adminId: ObjectId,          // Admin who created it
  clientName: String,         // Client name
  clientEmail: String,        // Client email
  targetWebUrl: String,       // Where script will be embedded
  webUrl: String,            // Your company URL
  webName: String,           // Your company name
  policyUrl: String,         // Privacy policy URL
  termsUrl: String,          // Terms & conditions URL
  tilesAndButtonColor: String, // Button background color
  textColor: String,         // Text color
  borderColor: String,       // Border color
  borderSize: String,        // Border radius (1-5)
  questions: [String],       // Default questions array
  selectedAmbassadorIds: [ObjectId], // Selected ambassadors
  scriptUrl: String,         // Generated script URL
  isActive: Boolean,         // Active status
  price: Number,            // Price for client
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Components

### 1. UnifiedCustomizationForm.jsx

- Main form with 5 sections
- Step-by-step navigation
- Real-time preview
- Form validation
- Script generation

### 2. CustomEmbedView.jsx

- Public embed page
- Displays ambassador cards
- Chat modal functionality
- Responsive design
- Customizable styling

## Usage Examples

### 1. Basic Script Embedding

```html
<!DOCTYPE html>
<html>
  <head>
    <title>University Website</title>
  </head>
  <body>
    <h1>Welcome to Our University</h1>
    <p>Connect with our student ambassadors:</p>

    <!-- LeadX Widget -->
    <script src="https://yourapi.com/api/customization/script/config_123456.js"></script>
  </body>
</html>
```

### 2. Custom Styling Example

The generated widget will use the colors and styling configured in the admin panel:

- Button colors from `tilesAndButtonColor`
- Text colors from `textColor`
- Border styling from `borderColor` and `borderSize`
- Questions from `questions` array

### 3. Chat Flow

1. User clicks "Chat with Ambassador"
2. Modal opens with ambassador info and questions
3. User fills contact form
4. Form submits to LeadX API
5. Creates user account (if new) and chat conversation
6. Ambassador receives message in LeadX dashboard

## Configuration Options

### UI Customization

- **Button Background**: Supports gradients and solid colors
- **Text Color**: Hex color codes
- **Border Color**: Hex color codes
- **Border Radius**: 1-5 scale (4px to 20px)

### Questions

- Up to 6 default questions
- Displayed on ambassador cards
- Help users know what to ask

### Ambassador Selection

- Choose specific ambassadors per widget
- Only verified ambassadors available
- Multiple ambassadors per widget

## Testing

### 1. Local Development

```bash
# Start backend
cd leadx-backend
npm run dev

# Start frontend
cd leadx-frontend
npm run dev
```

### 2. Test Widget

1. Open `test-embed.html` in browser
2. Generate script in admin panel
3. Replace script tag in HTML file
4. Refresh page to see widget

### 3. Production Deployment

- Set proper CORS origins
- Configure production URLs
- Test script generation
- Verify embed functionality

## Troubleshooting

### Common Issues

1. **Script not loading**: Check CORS settings and URL
2. **Ambassadors not showing**: Verify ambassador selection and verification status
3. **Styling issues**: Check color format and CSS conflicts
4. **Chat not working**: Verify API endpoints and authentication

### Debug Tips

- Check browser console for errors
- Verify API responses in Network tab
- Test with different browsers
- Check mobile responsiveness

## Security Considerations

- Scripts are served with proper CORS headers
- Only verified ambassadors are included
- Form submissions are validated
- Rate limiting on API endpoints
- XSS protection enabled

## Future Enhancements

- Widget analytics and tracking
- A/B testing for different designs
- Advanced customization options
- White-label branding
- Multi-language support
