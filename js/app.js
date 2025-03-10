// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const documentsListElement = document.getElementById('documents-list');
const rifilesListElement = document.getElementById('rifiles-list');
const documentIframe = document.getElementById('document-iframe');
const viewerPlaceholder = document.getElementById('viewer-placeholder');
const searchInput = document.getElementById('file-search');
const searchResults = document.getElementById('search-results');
const searchResultsList = document.getElementById('search-results-list');
const clearSearchButton = document.getElementById('clear-search');
const downloadDocButton = document.getElementById('download-doc');
const fullscreenDocButton = document.getElementById('fullscreen-doc');

// Track current document
let currentDocument = null;

// Add a last updated element to the header
const userControls = document.querySelector('.user-controls');
const lastUpdatedElement = document.createElement('div');
lastUpdatedElement.id = 'last-updated';
lastUpdatedElement.className = 'last-updated';
lastUpdatedElement.innerHTML = '<small>Last updated: <span>-</span></small>';
userControls.insertBefore(lastUpdatedElement, userControls.firstChild);

// Store all files for search functionality
let allFiles = [];

// Function to format date
function formatDate(date) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleDateString('en-IN', options);
}

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
  const isDarkTheme = document.body.classList.toggle('dark-theme');
  themeToggle.innerHTML = isDarkTheme 
    ? '<i class="fas fa-sun"></i>' 
    : '<i class="fas fa-moon"></i>';
  
  // Save theme preference
  localStorage.setItem('darkTheme', isDarkTheme);
});

// Load saved theme preference
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('darkTheme');
  
  if (savedTheme === 'true') {
    document.body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else if (savedTheme === 'false') {
    document.body.classList.remove('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
});

// Function to fetch files from GitHub repository
async function fetchRepositoryFiles(path) {
  try {
    const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`);

    if (!response.ok) {
      // Check if the folder doesn't exist (404)
      if (response.status === 404) {
        console.warn(`Folder '${path}' does not exist in the repository. Creating a placeholder message.`);

        // Return a placeholder file to indicate the folder is missing
        return [{
          name: `Create a '${path}' folder in your repository`,
          path: `${path}/placeholder`,
          download_url: null,
          type: 'file',
          _isPlaceholder: true
        }];
      }

      throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.filter(item => item.type === 'file');
  } catch (error) {
    console.error('Error fetching repository files:', error);
    return [];
  }
}

// Function to render file list
function renderFileList(files, containerElement, folderPath) {
  containerElement.innerHTML = '';

  if (files.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.textContent = 'No files available in this category';
    emptyMessage.className = 'empty-message';
    containerElement.appendChild(emptyMessage);
    return;
  }

  files.forEach(file => {
    const fileItem = document.createElement('li');

    // Check if this is a placeholder file (missing folder)
    if (file._isPlaceholder) {
      fileItem.className = 'file-item placeholder-item';
      fileItem.innerHTML = `
        <i class="fas fa-folder-plus"></i>
        <span>${file.name}</span>
        <small class="placeholder-hint">Repository folder missing</small>
      `;

      // Add a different click handler for placeholder items
      fileItem.addEventListener('click', () => {
        // Show a helpful message about creating the folder
        const viewerPlaceholder = document.getElementById('viewer-placeholder');
        if (viewerPlaceholder) {
          viewerPlaceholder.innerHTML = `
            <i class="fas fa-folder-plus"></i>
            <h3>Repository Setup Required</h3>
            <p>The "${folderPath}" folder doesn't exist in the GitHub repository.</p>
            <div class="setup-instructions">
              <p><strong>To fix this:</strong></p>
              <ol>
                <li>Go to your GitHub repository: <a href="https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}" target="_blank">github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}</a></li>
                <li>Click "Add file" > "Create new file"</li>
                <li>Enter "${folderPath}/README.md" as the file name</li>
                <li>Add some content like "# ${folderPath.charAt(0).toUpperCase() + folderPath.slice(1)} Folder"</li>
                <li>Click "Commit new file"</li>
              </ol>
              <p>Then return to this application and click the "Retry Connection" button.</p>
            </div>
          `;
          viewerPlaceholder.classList.remove('hidden');
          documentIframe.classList.add('hidden');
        }
      });

      containerElement.appendChild(fileItem);
      return;
    }

    // Regular file item
    fileItem.className = 'file-item';
    fileItem.dataset.path = file.path;
    fileItem.dataset.url = file.download_url;
    fileItem.dataset.name = file.name;

    const extension = getFileExtension(file.name);
    const iconClass = getFileIcon(file.name);

    fileItem.innerHTML = `
      <i class="fas ${iconClass}"></i>
      <span>${file.name}</span>
    `;

    fileItem.addEventListener('click', () => {
      // Remove active class from all items
      document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
      });

      // Add active class to clicked item
      fileItem.classList.add('active');

      // Display the document
      displayDocument(file);
    });

    containerElement.appendChild(fileItem);
  });
}

// Function to display document in the viewer
function displayDocument(file) {
  // Check if this is a placeholder file (missing folder)
  if (file._isPlaceholder) {
    // This should be handled by the placeholder item click handler
    return;
  }

  const fileUrl = file.download_url;
  const fileExtension = getFileExtension(file.name);

  // Store current document for download functionality
  currentDocument = file;

  // Show iframe, hide placeholder
  viewerPlaceholder.classList.add('hidden');
  documentIframe.classList.remove('hidden');

  if (fileExtension === 'pdf') {
    // For PDFs, use PDF.js or Google Docs Viewer
    const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    documentIframe.src = googleDocsViewerUrl;
  } else if (fileExtension === 'doc' || fileExtension === 'docx') {
    // For Word documents, use Google Docs Viewer
    const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    documentIframe.src = googleDocsViewerUrl;
  } else {
    // For other file types, try to display directly or use a fallback
    documentIframe.src = fileUrl;
  }

  // Show document controls when a document is displayed
  const mobileDocControls = document.querySelector('.mobile-document-controls');
  if (mobileDocControls) {
    mobileDocControls.classList.remove('hidden');
  }

  // Show document controls
  const documentControls = document.querySelector('.document-controls');
  if (documentControls) {
    documentControls.style.display = 'flex';
  }
}

// Function to show loading state
function showLoading(containerElement) {
  containerElement.innerHTML = '<li class="loading-item"><i class="fas fa-spinner fa-spin"></i> Loading files...</li>';
}

// Function to search files
function searchFiles(query) {
  if (!query.trim()) {
    searchResults.classList.add('hidden');
    clearSearchButton.classList.add('hidden');
    return;
  }
  
  // Show clear button when search has content
  clearSearchButton.classList.remove('hidden');
  
  const searchTerm = query.toLowerCase().trim();
  const results = allFiles.filter(file => 
    file.name.toLowerCase().includes(searchTerm)
  );
  
  searchResultsList.innerHTML = '';
  
  // Update search results heading with count
  const searchResultsHeading = searchResults.querySelector('h3');
  if (searchResultsHeading) {
    searchResultsHeading.innerHTML = `<i class="fas fa-search"></i> Search Results (${results.length})`;
  }
  
  if (results.length === 0) {
    searchResultsList.innerHTML = '<li class="empty-message">No matching files found</li>';
  } else {
    results.forEach(file => {
      const fileItem = document.createElement('li');
      fileItem.className = 'file-item';
      fileItem.dataset.path = file.path;
      fileItem.dataset.url = file.download_url;
      fileItem.dataset.name = file.name;
      
      const extension = getFileExtension(file.name);
      const iconClass = getFileIcon(file.name);
      
      // Highlight the matching text
      const fileName = file.name;
      const index = fileName.toLowerCase().indexOf(searchTerm);
      let highlightedName = fileName;
      
      if (index !== -1) {
        const before = fileName.substring(0, index);
        const match = fileName.substring(index, index + searchTerm.length);
        const after = fileName.substring(index + searchTerm.length);
        highlightedName = `${before}<span class="search-highlight">${match}</span>${after}`;
      }
      
      fileItem.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${highlightedName}</span>
        <small>${file.path.split('/')[0]}</small>
      `;
      
      fileItem.addEventListener('click', () => {
        // Remove active class from all items
        document.querySelectorAll('.file-item').forEach(item => {
          item.classList.remove('active');
        });
        
        // Add active class to clicked item
        fileItem.classList.add('active');
        
        // Display the document
        displayDocument(file);
      });
      
      searchResultsList.appendChild(fileItem);
    });
  }
  
  searchResults.classList.remove('hidden');
}

// Function to clear search
function clearSearch() {
  searchInput.value = '';
  searchResults.classList.add('hidden');
  clearSearchButton.classList.add('hidden');
  // Focus back on the search input
  searchInput.focus();
}

// Add search input event listener
searchInput.addEventListener('input', (e) => {
  searchFiles(e.target.value);
});

// Add clear button event listener
clearSearchButton.addEventListener('click', clearSearch);

// Add keyboard shortcut (Escape) to clear search
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    clearSearch();
  }
});

// Add global keyboard shortcut (Ctrl+F or Cmd+F) to focus on search
document.addEventListener('keydown', (e) => {
  // Check if Ctrl key (or Command key on Mac) is pressed along with F
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    // Prevent the default browser search
    e.preventDefault();
    // Focus on our search input
    searchInput.focus();
  }
});

// Function to load documents from GitHub repository
async function loadDocuments() {
  try {
    // Remove any existing error messages
    const existingError = document.querySelector('.github-error-message');
    if (existingError) {
      existingError.remove();
    }

    // Show loading indicators
    showLoading(documentsListElement);
    showLoading(rifilesListElement);

    // Fetch documents
    const documents = await fetchRepositoryFiles('documents');
    renderFileList(documents, documentsListElement, 'documents');

    // Fetch rifiles
    const rifiles = await fetchRepositoryFiles('rifiles');
    renderFileList(rifiles, rifilesListElement, 'rifiles');

    // Store all files for search functionality
    allFiles = [...documents, ...rifiles];

    // Update last updated timestamp
    const now = new Date();
    const lastUpdatedSpan = document.querySelector('#last-updated span');
    if (lastUpdatedSpan) {
      lastUpdatedSpan.textContent = formatDate(now);
    }

    // Check if we have any real files (not placeholders)
    const hasRealFiles = [...documents, ...rifiles].some(file => !file._isPlaceholder);

    // If no real files were found, show a repository setup message
    if (!hasRealFiles) {
      const viewerPlaceholder = document.getElementById('viewer-placeholder');
      if (viewerPlaceholder) {
        viewerPlaceholder.innerHTML = `
          <i class="fas fa-folder-plus"></i>
          <h3>Repository Setup Required</h3>
          <p>No files were found in your GitHub repository.</p>
          <div class="setup-instructions">
            <p><strong>To fix this:</strong></p>
            <ol>
              <li>Go to your GitHub repository: <a href="https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}" target="_blank">github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}</a></li>
              <li>Create two folders: "documents" and "rifiles"</li>
              <li>Upload your PDF, DOC, or other files to these folders</li>
              <li>Return to this application and click the button below</li>
            </ol>
            <button id="refresh-repo" class="btn primary-btn">Refresh Repository Data</button>
          </div>
        `;

        // Add refresh button functionality
        const refreshButton = document.getElementById('refresh-repo');
        if (refreshButton) {
          refreshButton.addEventListener('click', loadDocuments);
        }
      }
    }
  } catch (error) {
    console.error('Error loading documents:', error);

    // Show error with retry button
    documentsListElement.innerHTML = `
      <li class="error-item">
        <i class="fas fa-exclamation-circle"></i>
        Error loading files
        <button id="retry-documents" class="btn small-btn">Retry</button>
      </li>
    `;

    rifilesListElement.innerHTML = `
      <li class="error-item">
        <i class="fas fa-exclamation-circle"></i>
        Error loading files
        <button id="retry-rifiles" class="btn small-btn">Retry</button>
      </li>
    `;

    // Add retry button functionality
    document.getElementById('retry-documents')?.addEventListener('click', loadDocuments);
    document.getElementById('retry-rifiles')?.addEventListener('click', loadDocuments);
  }
}

// Refresh document lists periodically to check for updates
function setupAutoRefresh() {
  // Refresh every 5 minutes
  setInterval(loadDocuments, 5 * 60 * 1000);
}

// Initialize auto-refresh when app loads
setupAutoRefresh();

// Function to check if the repository exists and is accessible
async function checkRepositoryAccess() {
  try {
    const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`);

    if (!response.ok) {
      console.error(`GitHub repository not accessible: ${response.status} ${response.statusText}`);

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
          <p>Current repository: <strong>${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}</strong></p>
          <p>Please check the repository configuration in firebase-config.js</p>
          <button id="retry-connection" class="btn primary-btn">Retry Connection</button>
        </div>
      `;

      // Add to the main container after login
      const mainContainer = document.getElementById('main-container');
      if (mainContainer) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
          sidebar.prepend(errorMessage);
        } else {
          mainContainer.prepend(errorMessage);
        }

        // Add retry button functionality
        document.getElementById('retry-connection').addEventListener('click', function() {
          errorMessage.remove();
          checkRepositoryAccess().then(() => {
            loadDocuments(); // Retry loading documents if repository check passes
          });
        });
      }

      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking GitHub repository:', error);
    return false;
  }
}

// Check repository access when user is authenticated
document.addEventListener('DOMContentLoaded', function() {
  // The auth.js file will handle authentication and call loadDocuments()
  // We'll add a repository check before loading documents
  const originalLoadDocuments = loadDocuments;

  // Override the loadDocuments function to check repository access first
  window.loadDocuments = async function() {
    const repoAccessible = await checkRepositoryAccess();
    if (repoAccessible) {
      originalLoadDocuments();
    }
  };
});

// Download document functionality
if (downloadDocButton) {
  downloadDocButton.addEventListener('click', function() {
    if (currentDocument) {
      // Create a temporary anchor element to trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = currentDocument.download_url;
      downloadLink.download = currentDocument.name; // Set the filename
      downloadLink.target = '_blank';

      // Append to the body, click, and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  });
}

// Fullscreen document functionality
if (fullscreenDocButton) {
  fullscreenDocButton.addEventListener('click', function() {
    const documentViewer = document.getElementById('document-viewer');

    if (documentViewer) {
      // Toggle fullscreen class
      document.body.classList.toggle('document-fullscreen');

      // Change icon based on state
      const icon = this.querySelector('i');
      if (document.body.classList.contains('document-fullscreen')) {
        icon.classList.remove('fa-expand');
        icon.classList.add('fa-compress');
      } else {
        icon.classList.remove('fa-compress');
        icon.classList.add('fa-expand');
      }
    }
  });
}
