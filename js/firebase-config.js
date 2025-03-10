// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCA_G4VEk8sN3YJizFer-OUBTgc3InMqnw",
  authDomain: "the-world-is-here-7f643.firebaseapp.com",
  projectId: "the-world-is-here-7f643",
  storageBucket: "the-world-is-here-7f643.firebasestorage.app",
  messagingSenderId: "280922474996",
  appId: "1:280922474996:web:80b11aee8928304fbed1a1",
  measurementId: "G-H3DHS9QZXH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// GitHub repository information
const GITHUB_REPO_OWNER = 'file-share103';
const GITHUB_REPO_NAME = 'Meta-Data';
const GITHUB_API_BASE_URL = 'https://api.github.com';

// Check GitHub repository connection on load
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Test the repository connection
    const testResponse = await fetch(`${GITHUB_API_BASE_URL}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`);

    if (!testResponse.ok) {
      console.error(`GitHub repository not accessible: ${testResponse.status} ${testResponse.statusText}`);
      // Show error message to user
      const errorMessage = document.createElement('div');
      errorMessage.className = 'github-error-message';
      errorMessage.innerHTML = `
        <div class="error-box">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Repository Connection Error</h3>
          <p>Unable to connect to the GitHub repository. This may be due to:</p>
          <ul>
            <li>Repository doesn't exist or has been moved</li>
            <li>Access restrictions on the repository</li>
            <li>Network connectivity issues</li>
          </ul>
          <p>Please check the repository configuration in firebase-config.js</p>
          <button id="retry-connection" class="btn primary-btn">Retry Connection</button>
        </div>
      `;

      // Add to the main container after login
      const mainContainer = document.getElementById('main-container');
      if (mainContainer) {
        mainContainer.prepend(errorMessage);

        // Add retry button functionality
        document.getElementById('retry-connection').addEventListener('click', function() {
          errorMessage.remove();
          loadDocuments(); // Retry loading documents
        });
      }
    }
  } catch (error) {
    console.error('Error checking GitHub repository:', error);
  }
});

// File types and their icons
const FILE_ICONS = {
  'pdf': 'fa-file-pdf pdf-icon',
  'doc': 'fa-file-word doc-icon',
  'docx': 'fa-file-word doc-icon',
  'txt': 'fa-file-alt',
  'default': 'fa-file'
};

// Function to get file extension
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

// Function to get appropriate icon for file type
function getFileIcon(filename) {
  const extension = getFileExtension(filename);
  return FILE_ICONS[extension] || FILE_ICONS.default;
}
