/**
 * Mobile-specific JavaScript functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation functionality removed as requested
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');

    // Default display settings for mobile
    if (sidebar && content) {
        sidebar.style.display = 'block';
        content.style.display = 'flex';
    }
    
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        // Adjust layout based on orientation
        setTimeout(function() {
            if (window.innerHeight > window.innerWidth) {
                // Portrait mode
                document.body.classList.add('portrait');
                document.body.classList.remove('landscape');
            } else {
                // Landscape mode
                document.body.classList.add('landscape');
                document.body.classList.remove('portrait');
            }
        }, 200); // Small delay to ensure dimensions have updated
    });
    
    // Initial orientation check
    if (window.innerHeight > window.innerWidth) {
        document.body.classList.add('portrait');
    } else {
        document.body.classList.add('landscape');
    }
    
    // Fix for iOS 100vh issue
    function setVhVariable() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Set the variable initially and on resize
    setVhVariable();
    window.addEventListener('resize', setVhVariable);
    
    // Add touch-friendly interactions
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        item.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });
        
        item.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        });
    });
    
    // Detect if using a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.classList.add('is-mobile-device');
    }

    // Handle document viewer controls
    const fullscreenDocBtn = document.getElementById('fullscreen-doc');
    const closeDocBtn = document.getElementById('close-doc');
    const downloadDocBtn = document.getElementById('download-doc');
    const documentViewer = document.getElementById('document-viewer');
    const documentIframe = document.getElementById('document-iframe');

    if (fullscreenDocBtn) {
        fullscreenDocBtn.addEventListener('click', function() {
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
        });
    }

    if (closeDocBtn) {
        closeDocBtn.addEventListener('click', function() {
            // Hide document and show placeholder
            if (documentIframe) {
                documentIframe.classList.add('hidden');
                documentIframe.src = '';
            }

            const placeholder = document.getElementById('viewer-placeholder');
            if (placeholder) {
                placeholder.classList.remove('hidden');
            }

            // Exit fullscreen if active
            document.body.classList.remove('document-fullscreen');

            // Show sidebar and content
            if (sidebar && content) {
                sidebar.style.display = 'block';
                content.style.display = 'flex';
            }
        });
    }

    // Add pull-to-refresh functionality
    let touchStartY = 0;
    // Using the sidebar variable already declared at the top

    if (sidebar) {
        sidebar.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        sidebar.addEventListener('touchmove', function(e) {
            const touchY = e.touches[0].clientY;
            const touchDiff = touchY - touchStartY;

            // If pulled down and at the top of the sidebar
            if (touchDiff > 30 && this.scrollTop === 0) {
                this.classList.add('pull-refresh');
                e.preventDefault();
            }
        }, { passive: false });

        sidebar.addEventListener('touchend', function() {
            if (this.classList.contains('pull-refresh')) {
                this.classList.remove('pull-refresh');

                // Simulate refresh by adding a loading indicator
                const loadingItem = document.createElement('li');
                loadingItem.className = 'loading-item';
                loadingItem.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

                const fileList = this.querySelector('.file-list');
                if (fileList) {
                    fileList.prepend(loadingItem);

                    // Remove after a delay (in a real app, this would be after data refresh)
                    setTimeout(() => {
                        loadingItem.remove();
                    }, 1500);
                }
            }
        });
    }
});