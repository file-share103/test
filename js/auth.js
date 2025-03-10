// DOM Elements
const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showLoginLink = document.getElementById('show-login');
const showSignupLink = document.getElementById('show-signup');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const logoutButton = document.getElementById('logout-button');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');
const userNameDisplay = document.getElementById('user-name');

// Toggle between login and signup forms
showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  loginError.textContent = '';
});

showSignupLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
  signupError.textContent = '';
});

// Login functionality
loginButton.addEventListener('click', () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  if (!email || !password) {
    loginError.textContent = 'Please enter both email and password';
    return;
  }
  
  loginButton.disabled = true;
  loginButton.textContent = 'Logging in...';
  
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Clear form
      document.getElementById('login-email').value = '';
      document.getElementById('login-password').value = '';
      loginError.textContent = '';
    })
    .catch((error) => {
      console.error('Login error:', error);
      loginError.textContent = error.message;
    })
    .finally(() => {
      loginButton.disabled = false;
      loginButton.textContent = 'Login';
    });
});

// Signup functionality
signupButton.addEventListener('click', () => {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  
  // Validation
  if (!name || !email || !password || !confirmPassword) {
    signupError.textContent = 'Please fill in all fields';
    return;
  }
  
  if (password !== confirmPassword) {
    signupError.textContent = 'Passwords do not match';
    return;
  }
  
  if (password.length < 6) {
    signupError.textContent = 'Password must be at least 6 characters';
    return;
  }
  
  signupButton.disabled = true;
  signupButton.textContent = 'Creating account...';
  
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Update profile with name
      return userCredential.user.updateProfile({
        displayName: name
      }).then(() => {
        // Save user data to Firestore
        return db.collection('users').doc(userCredential.user.uid).set({
          name: name,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
    })
    .then(() => {
      // Clear form
      document.getElementById('signup-name').value = '';
      document.getElementById('signup-email').value = '';
      document.getElementById('signup-password').value = '';
      document.getElementById('signup-confirm-password').value = '';
      signupError.textContent = '';
    })
    .catch((error) => {
      console.error('Signup error:', error);
      signupError.textContent = error.message;
    })
    .finally(() => {
      signupButton.disabled = false;
      signupButton.textContent = 'Sign Up';
    });
});

// Logout functionality
logoutButton.addEventListener('click', () => {
  auth.signOut()
    .catch((error) => {
      console.error('Logout error:', error);
    });
});

// Auth state change listener
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    authContainer.classList.add('hidden');
    mainContainer.classList.remove('hidden');
    userNameDisplay.textContent = user.displayName || user.email;
    
    // Load documents when user is authenticated
    loadDocuments();
  } else {
    // User is signed out
    mainContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    
    // Reset to login form
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  }
});