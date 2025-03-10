# UP Police POC Web Application

A secure web-based document viewer application for Uttar Pradesh Police with authentication that allows authorized personnel to view PDF, DOC, and other official files directly in the browser. This application provides a centralized platform for accessing and viewing important police documents and investigation reports.

## Features

- User authentication (signup/login) using Firebase
- Dark/light theme toggle with saved preference
- Responsive design for desktop and mobile devices
- View PDF and DOC files directly in the application
- Search functionality to quickly find documents across categories
- Text highlighting in search results for better visibility
- Keyboard shortcuts for search (Ctrl+F/Cmd+F to focus, Esc to clear)
- Automatic updates when new files are added to the repository
- Secure access to documents only for authenticated users

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/your-username/up-police-poc.git
cd up-police-poc
```

2. **Deploy to a web server**

You can use any web server to host this application. Some options include:

- GitHub Pages
- Firebase Hosting
- Netlify
- Vercel
- Any standard web hosting service

### Firebase Hosting Deployment (Recommended)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```
   - Select "Hosting"
   - Choose your Firebase project
   - Set the public directory to the root folder
   - Configure as a single-page app: No
   - Set up automatic builds and deploys: No

4. Deploy to Firebase:
```bash
firebase deploy
```

## File Structure

```
up-police-poc/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Styles for the application
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── auth.js         # Authentication logic
│   └── app.js          # Main application logic
└── README.md           # This file
```

## How It Works

1. The application authenticates users with secure Firebase Authentication
2. Only authorized personnel can access sensitive documents
3. Files are fetched from the GitHub repository using the GitHub API
4. Documents are categorized as "Official Documents" and "Investigation Reports"
5. Users can search across all document categories with real-time results
6. Search results highlight matching text for easy identification
7. When a user clicks on a file, it's displayed securely in the main viewer
8. For PDF and DOC files, Google Docs Viewer is used to render the content
9. The application periodically checks for updates to ensure the latest documents are available
10. Last updated timestamp shows when the document list was last refreshed

## Customization

- To change the theme colors, modify the CSS variables in `css/style.css`
- To add more file types, update the `FILE_ICONS` object in `js/firebase-config.js`
- To change the repository source, update the GitHub repository information in `js/firebase-config.js`

## Browser Compatibility

This application works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## License

MIT