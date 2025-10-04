# LeadX Ambassador Widget - Quick Start Guide

## 🚀 Kya Banaya Hai

Aapke LeadX project mein ab ek **Ambassador Widget Generator** hai jo admin ko allow karta hai:

1. **Customization Form** fill karne ke liye
2. **JavaScript Script** generate karne ke liye
3. **Client ko script** sell karne ke liye
4. **University/College websites** mein embed karne ke liye

## 📋 Features

✅ **Client Information**: Client name, email, target website URL
✅ **Web Settings**: Company URL, name, privacy/terms links  
✅ **UI Customization**: Colors, borders, styling
✅ **Default Questions**: Up to 6 questions jo ambassador cards mein show honge
✅ **Auto Ambassador Selection**: Sabhi verified ambassadors automatically include honge
✅ **Script Generation**: One-click script generation
✅ **Easy Embedding**: Simple `<script>` tag for clients

## 🎯 Kaise Use Kare

### 1. Admin Panel Access

```
1. Login as admin
2. Go to Settings > Customize
3. Ek unified form dikhega with all options
```

### 2. Form Fill Kare

```
Client Info:
- Client Name: "ABC University"
- Client Email: "admin@abcuni.edu"
- Target Website: "https://abcuni.edu"

Web Settings:
- Your Company URL: "https://leadx.com"
- Company Name: "LeadX"
- Privacy Policy URL (optional)
- Terms URL (optional)

UI Design:
- Button Colors: Gradient ya solid colors
- Text Color: #ffffff
- Border Color: #e5e7eb
- Border Radius: 1-5 scale

Questions (Optional):
- "What courses are you interested in?"
- "Do you need help with admissions?"
- "Want to know about campus life?"
- etc. (max 6 questions)
```

### 3. Script Generate Kare

```
1. Click "Generate Script" button
2. Script automatically generate hogi
3. Copy the script tag: <script src="..."></script>
4. Client ko ye script tag de do
```

### 4. Client Implementation

```html
<!-- Client apni website mein ye script paste karega -->
<script src="https://yourapi.com/api/customization/script/config_123.js"></script>

<!-- Script automatically ambassador cards load karega -->
```

## 🔧 Technical Flow

### 1. Script Generation

- Admin form fill karta hai
- Backend mein `CustomizationConfig` create hota hai
- Unique `configId` generate hota hai
- Script URL: `/api/customization/script/{configId}.js`

### 2. Widget Loading

- Client website mein script load hoti hai
- Script automatically ambassador cards fetch karti hai
- Sabhi verified ambassadors show hote hain
- Custom styling apply hoti hai

### 3. User Interaction

- Website visitor ambassador card dekh sakta hai
- Default questions visible hote hain
- "Chat with Ambassador" button click karne par modal open hota hai
- Contact form fill karke message send kar sakta hai

### 4. Chat Integration

- Form submission se user account create hota hai (agar naya hai)
- Chat conversation start hoti hai
- Ambassador ko LeadX dashboard mein message milta hai

## 📁 Files Structure

```
Frontend:
├── AdminCustomize.jsx (Main component)
├── ScriptGeneratorForm.jsx (Unified form)
├── CustomEmbedView.jsx (Public embed page)
└── apicopy.js (API functions)

Backend:
├── CustomizationConfig.js (Model)
├── customization.js (Controller)
├── customization.js (Routes)
└── embed.js (Updated controller)
```

## 🧪 Testing

### Local Testing:

```bash
# Backend start karo
cd leadx-backend
npm run dev

# Frontend start karo
cd leadx-frontend
npm run dev

# Browser mein test karo
1. http://localhost:3000 - Admin login
2. Settings > Customize - Form fill karo
3. Script generate karo
4. test-embed.html mein script paste karo
```

### Production Testing:

```bash
# Script tag example:
<script src="https://yourapi.com/api/customization/script/config_abc123.js"></script>

# Ye script client ki website mein kaam karega
```

## 🎨 Customization Options

### Colors:

- **Button Background**: Gradient ya solid colors support
- **Text Color**: Hex colors (#ffffff)
- **Border Color**: Card borders ke liye
- **Border Radius**: 1-5 scale (4px to 20px)

### Questions:

- Maximum 6 questions add kar sakte hain
- Questions ambassador cards mein preview show hote hain
- Users ko pata chal jata hai kya puch sakte hain

### Auto Ambassador Selection:

- Manual selection remove kar diya hai
- Sabhi verified ambassadors automatically include hote hain
- Admin ko manually select nahi karna padta

## 🔒 Security Features

✅ **CORS Protection**: Proper headers set hain
✅ **Input Validation**: Form validation frontend aur backend dono mein
✅ **XSS Protection**: Safe script generation
✅ **Rate Limiting**: API endpoints protected hain
✅ **Authentication**: Admin-only access for script generation

## 🚨 Troubleshooting

### Common Issues:

1. **Script not loading**: CORS settings check karo
2. **No ambassadors showing**: Database mein verified ambassadors hain ya nahi check karo
3. **Styling issues**: Color format aur CSS conflicts check karo
4. **Chat not working**: API endpoints aur network check karo

### Debug Tips:

- Browser console mein errors check karo
- Network tab mein API responses dekho
- Different browsers mein test karo
- Mobile responsiveness check karo

## 📞 Support

Agar koi issue hai to:

1. Console errors check karo
2. API responses verify karo
3. Database connections check karo
4. CORS settings verify karo

## 🎉 Success!

Ab aapka LeadX Ambassador Widget Generator ready hai! Admin easily scripts generate kar sakta hai aur clients ko sell kar sakta hai. Widget automatically sabhi verified ambassadors ko show karega with custom styling aur questions.

**Happy Coding! 🚀**
