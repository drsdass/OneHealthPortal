import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, getDocs, addDoc, setDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PhysicianProvider from './components/PhysicianProvider'; // Make sure this path is correct

// --- Hardcoded User Data (Fallback/Initial Seeding) ---
// This list will be used if no users are found in Firestore for demonstration.
// In a real production environment, users would *only* be managed via Firestore/Firebase Authentication.
const initialHardcodedUsers = [
  // Full Access Admins (can see Patient, Physician, Sales, Admin)
  {
    username: "SatishD",
    password: "password123",
    role: "admin",
    isFullAccessAdmin: true, // Special flag for specific admin privileges
    entities: {
      "First Bio Lab": "Yes",
      "First Bio Genetics LLC": "Yes",
      "First Bio Lab of Illinois": "Yes",
      "AIM Laboratories LLC": "Yes",
      "AMICO Dx LLC": "Yes",
      "Enviro Labs LLC": "Yes",
      "Stat Labs": "Yes",
    },
  },
  {
    username: "AshlieT",
    password: "password123",
    role: "admin",
    isFullAccessAdmin: true,
    entities: {
      "First Bio Lab": "Yes",
      "First Bio Genetics LLC": "Yes",
      "First Bio Lab of Illinois": "Yes",
      "AIM Laboratories LLC": "Yes",
      "AMICO Dx LLC": "Yes",
      "Enviro Labs LLC": "Yes",
      "Stat Labs": "Yes",
    },
  },
  {
    username: "MinaK",
    password: "password123",
    role: "admin",
    isFullAccessAdmin: true,
    entities: {
      "First Bio Lab": "Yes",
      "First Bio Genetics LLC": "Yes",
      "First Bio Lab of Illinois": "Yes",
      "AIM Laboratories LLC": "Yes",
      "AMICO Dx LLC": "Yes",
      "Enviro Labs LLC": "Yes",
      "Stat Labs": "Yes",
    },
  },
  {
    username: "JayM",
    password: "password123",
    role: "admin",
    isFullAccessAdmin: true,
    entities: {
      "First Bio Lab": "Yes",
      "First Bio Genetics LLC": "Yes",
      "First Bio Lab of Illinois": "Yes",
      "AIM Laboratories LLC": "Yes",
      "AMICO Dx LLC": "Yes",
      "Enviro Labs LLC": "Yes",
      "Stat Labs": "Yes",
    },
  },
  {
    username: "AghaA",
    password: "password123",
    role: "admin",
    isFullAccessAdmin: true,
    entities: {
      "AIM Laboratories LLC": "Yes",
    },
  },

  // Regular Admins (Sales & Marketing, Admin portal only)
  // These users are 'admin' role but NOT 'isFullAccessAdmin'
  // They have entity access for Admin page reporting
  {
    username: "BobS",
    password: "password123",
    role: "admin",
    isFullAccessAdmin: false,
    entities: {
      "First Bio Lab": "Yes",
      "First Bio Genetics LLC": "Yes",
      "First Bio Lab of Illinois": "Yes",
      "AIM Laboratories LLC": "Yes",
      "AMICO Dx LLC": "Yes",
      "Enviro Labs LLC": "Yes",
      "Stat Labs": "Yes",
    },
  },
  {
    username: "Omar",
    password: "password123",
    role: "admin",
    isFullAccessAdmin: false,
    entities: {
      "First Bio Lab": "Yes",
      "First Bio Genetics LLC": "Yes",
      "First Bio Lab of Illinois": "Yes",
      "AIM Laboratories LLC": "Yes",
      "AMICO Dx LLC": "Yes",
      "Enviro Labs LLC": "Yes",
      "Stat Labs": "Yes",
    },
  },
  {
    username: "MelindaC",
    password: "password123",
    role: "admin",
    isFullAccessAdmin: false,
    entities: {
      "First Bio Lab": "Yes",
      "First Bio Genetics LLC": "Yes",
      "First Bio Lab of Illinois": "Yes",
      "AIM Laboratories LLC": "Yes",
      "AMICO Dx LLC": "Yes",
      "Enviro Labs LLC": "Yes",
      "Stat Labs": "Yes",
    },
  },
  {
    username: "Wenjun",
    password: "password123",
    role: "admin",
    isFullAccessAdmin: false,
    entities: {
      "AIM Laboratories LLC": "Yes",
    },
  },
  {
    username: "AndreaM",
    password: "password123",
    role: "admin",
    isFullAccessAdmin: false,
    entities: {
      "AIM Laboratories LLC": "Yes",
    },
  },
  // Corrected roles for these users - they are admins with limited entity access
  {
    username: "DarangT",
    password: "password123",
    role: "admin", // Corrected: Admin role
    isFullAccessAdmin: false, // Corrected: Not full access
    entities: { // Preserving their entity access
      "AIM Laboratories LLC": "Yes",
      "AMICO Dx LLC": "Yes",
      "Stat Labs": "Yes",
    },
  },
  {
    username: "ACG",
    password: "password123",
    role: "admin", // Corrected: Admin role
    isFullAccessAdmin: false, // Corrected: Not full access
    entities: { // Preserving their entity access
      "First Bio Lab": "Yes",
      "First Bio Genetics LLC": "Yes",
      "First Bio Lab of Illinois": "Yes",
      "AIM Laboratories LLC": "Yes",
      "AMICO Dx LLC": "Yes",
      "Enviro Labs LLC": "Yes",
      "Stat Labs": "Yes",
   },
  },
  {
    username: "VinceO",
    password: "password123",
    role: "admin",
    isFullAccessAdmin: true,
    entities: {
      "AMICO Dx LLC": "Yes",
   },
  },
  {
    username: "NickC",
    password: "password123",
    role: "admin", // Corrected: Admin role
    isFullAccessAdmin: false, // Corrected: Not full access
    entities: { // Preserving their entity access
      "AMICO Dx LLC": "Yes",
    },
  },
  {
    username: "WeesL",
    password: "password123",
    role: "admin", // Corrected: Admin role
    isFullAccessAdmin: false, // Corrected: Not full access
    entities: { // Preserving their entity access
      "Stat Labs": "Yes",
    },
  },
  {
    username: "AndrewS",
    password: "password123",
    role: "admin", // Corrected: Admin role
    isFullAccessAdmin: false, // Corrected: Not full access
    entities: { // Preserving their entity access
      "First Bio Lab": "Yes",
      "First Bio Genetics LLC": "Yes",
      "First Bio Lab of Illinois": "Yes",
      "AIM Laboratories LLC": "Yes",
    },
  },
  {
    username: "BenM",
    password: "password123",
    role: "admin", // Corrected: Admin role
    isFullAccessAdmin: false, // Corrected: Not full access
    entities: { // Preserving their entity access
      "Enviro Labs LLC": "Yes",
    },
  },
  {
    username: "SonnyA",
    password: "password123",
    role: "admin", // Corrected: Admin role
    isFullAccessAdmin: false, // Corrected: Not full access
    entities: { // Preserving their entity access
      "AIM Laboratories LLC": "Yes",
    },
  },

  // Dedicated Sales User (only Sales & Marketing portal)
  // This user will have role: "sales"
  {
    username: "KeenanW",
    password: "password123",
    role: "sales", // New role for sales-only access
    isFullAccessAdmin: false, // Sales users are not full access admins
    entities: {}, // Sales users typically don't have entity access for admin reports
  },

  // Patient User
  {
    lastName: "Doe",
    ssnLast4: "1234",
    phoneNumber: "5551234567", // Can be with or without spaces/parentheses in input
    role: "patient",
    isFullAccessAdmin: false,
    entities: {},
  },
  // Physician/Provider User
  {
    email: "dr.smith@example.com",
    password: "securepassword",
    role: "physician",
    isFullAccessAdmin: false,
    entities: {},
  },
  {
    email: "dr.jones@example.com",
    password: "anotherpassword",
    role: "physician",
    isFullAccessAdmin: false,
    entities: {},
  },
];

const initialHardcodedSalesData = [
    { month: 'January 2025', location: 'Demo Location A', reimbursement: 5000, cogs: 2000, net: 3000, commission: 300, entity: 'First Bio Lab', associatedrepname: 'Demo Rep', username: 'SatishD' },
    { month: 'February 2025', location: 'Demo Location B', reimbursement: 7500, cogs: 3000, net: 4500, commission: 450, entity: 'AIM Laboratories LLC', associatedrepname: 'Demo Rep 2', username: 'JayM' },
    { month: 'March 2025', location: 'Demo Location A', reimbursement: 6000, cogs: 2500, net: 3500, commission: 350, entity: 'First Bio Lab', associatedrepname: 'Demo Rep', username: 'SatishD' },
];

// --- Firebase Initialization (Global Configuration Variables) ---
let firebaseConfig = {};
let globalAppId = 'my-healthcare-app-1'; // Default application ID

// Logic to load config: 1. Render Env Vars, 2. Canvas Vars, 3. Hardcoded
if (process.env.REACT_APP_FIREBASE_CONFIG) {
    // 1. Load from Render's Environment Variables (recommended for production)
    try {
        firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
        globalAppId = process.env.REACT_APP_APP_ID || globalAppId;
        console.log("Firebase config loaded from production environment variables.");
    } catch (e) {
        console.error("Error parsing REACT_APP_FIREBASE_CONFIG from environment variables:", e);
    }
} else if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    // 2. Load from Canvas environment for development
    try {
        firebaseConfig = JSON.parse(__firebase_config);
        globalAppId = typeof __app_id !== 'undefined' ? __app_id : globalAppId;
        console.log("Firebase config loaded from Canvas environment.");
    } catch (e) {
        console.error("Error parsing __firebase_config in Canvas environment:", e);
    }
} else {
    // 3. Fallback to hardcoded config for local development if others fail
    firebaseConfig = {
        apiKey: "AIzaSyB6pb1l277vaRBNSZk37lpKbzqsO4k4s7M",
        authDomain: "onehealth-a1751.firebaseapp.com",
        projectId: "onehealth-a1751",
        storageBucket: "onehealth-a1751.firebasestorage.app",
        messagingSenderId: "155326349181",
        appId: "1:155326349181:web:eef3e2cd74053626ddd614",
        measurementId: "G-5T3MQX7ZXX"
    };
    console.log("Using hardcoded Firebase config as a fallback.");
}


// --- AuthContext ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [app, setApp] = useState(null); // Firebase app instance
  const [db, setDb] = useState(null);     // Firestore instance
  const [auth, setAuth] = useState(null); // Auth instance
  const [allUsersFromFirestore, setAllUsersFromFirestore] = useState([]); // State to hold all users from Firestore

  // Use the globally determined appId for Firestore paths
  const currentAppId = globalAppId;

  // Effect for Firebase Initialization and initial Auth
  useEffect(() => {
    let unsubscribeAuth;

    const initializeFirebaseAndAuth = async () => {
      let initializedApp;
      let initializedDb;
      let initializedAuth;

      try {
        // Initialize Firebase app if not already initialized
        if (!app) {
          if (firebaseConfig && Object.keys(firebaseConfig).length > 0 && firebaseConfig.projectId && firebaseConfig.apiKey) {
            initializedApp = initializeApp(firebaseConfig);
            initializedDb = getFirestore(initializedApp);
            initializedAuth = getAuth(initializedApp);
            setApp(initializedApp);
            setDb(initializedDb);
            setAuth(initializedAuth);
            console.log("Firebase initialized successfully within AuthProvider useEffect.");
          } else {
            console.error("Firebase config is incomplete or invalid during initial check:", firebaseConfig);
            setErrorMessage("Firebase configuration is incomplete. Please ensure Firebase is enabled for the Canvas project or all environment variables are set for deployment.");
            setShowModal(true);
            setIsAuthReady(true); // Mark ready to show the error modal
            return;
          }
        } else {
          // If app is already set, use the existing instances
          initializedApp = app;
          initializedDb = db;
          initializedAuth = auth;
        }

        // Only set up auth listener if auth instance is available
        if (initializedAuth) {
          unsubscribeAuth = onAuthStateChanged(initializedAuth, async (user) => {
            if (user) {
              console.log("Firebase user signed in via onAuthStateChanged:", user.uid);
              // In this specific Canvas flow, our currentUser comes from hardcoded 'users' list
              // We don't set it from Firebase user here.
            } else {
              // Attempt anonymous/custom token sign-in if in Canvas environment and no user is logged in
              if (typeof __initial_auth_token !== 'undefined' && initializedAuth) {
                try {
                  if (__initial_auth_token) {
                    await signInWithCustomToken(initializedAuth, __initial_auth_token);
                    console.log("Signed in with custom token for Canvas. UID:", initializedAuth.currentUser?.uid);
                  } else {
                    await signInAnonymously(initializedAuth);
                    console.log("Signed in anonymously for Canvas. UID:", initializedAuth.currentUser?.uid);
                  }
                } catch (authError) {
                  console.error("Firebase authentication error in Canvas (signInWithCustomToken/Anonymously):", authError);
                  // Do not set global error message for auth listener errors, as it might conflict with login errors
                }
              } else {
                console.log("No Firebase user signed in (production environment, or after logout/initial check).");
              }
            }
            // Ensure auth is ready only after the initial check/sign-in attempt completes
            setIsAuthReady(true); 
          });
        }
      } catch (overallError) {
        console.error("Overall Firebase initialization/auth setup failed:", overallError);
        setErrorMessage(`Application startup error: ${overallError.message}. Please check your Firebase setup.`);
        setShowModal(true);
        setIsAuthReady(true); // Mark ready to indicate error and stop loading
      }
    };

    initializeFirebaseAndAuth();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [app, db, auth]); // REVERTED: Depend on 'app', 'db', and 'auth' state to run this effect when they are set

  // Effect to fetch all users from Firestore once DB is ready and user is authenticated
  useEffect(() => {
    if (db && isAuthReady && auth?.currentUser) {
      const fetchAllUsers = async () => {
        try {
          const usersColRef = collection(db, `artifacts/${currentAppId}/public/data/users`);
          const q = query(usersColRef);
          const querySnapshot = await getDocs(q);
          const fetchedUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (fetchedUsers.length > 0) {
            setAllUsersFromFirestore(fetchedUsers);
            console.log("All users successfully fetched from Firestore:", fetchedUsers);
          } else {
            console.log("No users found in Firestore. The app will use the hardcoded user list for login.");
          }
        } catch (error) {
          console.error("Error fetching users from Firestore (falling back to hardcoded list):", error);
        }
      };
      fetchAllUsers();
    }
  }, [db, isAuthReady, auth, currentAppId]);


  const login = (credentials, loginType) => {
    let userFound = null;
    let userSource = allUsersFromFirestore.length > 0 ? allUsersFromFirestore : initialHardcodedUsers;

    if (loginType === 'admin' || loginType === 'sales') {
        const { username, password } = credentials;
        userFound = userSource.find(u =>
          (u.role === 'admin' || u.role === 'sales') && u.username === username && u.password === password
        );
      } else if (loginType === 'patient') {
        const { lastName, ssnLast4, phoneNumber } = credentials;
        const normalizedPhoneNumber = phoneNumber.replace(/\D/g, '');
        userFound = userSource.find(u =>
          u.role === 'patient' &&
          u.lastName?.toLowerCase() === lastName?.toLowerCase() &&
          u.ssnLast4 === ssnLast4 &&
          u.phoneNumber === normalizedPhoneNumber
        );
      } else if (loginType === 'physician') {
        const { email, password } = credentials;
        userFound = userSource.find(u =>
          u.role === 'physician' && u.email === email && u.password === password
        );
      }

    if (userFound) {
      console.log(`Login successful for user: ${userFound.username || userFound.email || userFound.lastName}`);
      setCurrentUser(userFound);
      setErrorMessage("");
    } else {
      console.log("Login failed: User not found or credentials incorrect.");
      setErrorMessage("Invalid credentials. Please try again.");
      setShowModal(true);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setErrorMessage("");
    if (auth) { 
      // Re-authenticate anonymously after logout to maintain Firestore access for public data
      signInAnonymously(auth).catch(error => console.error("Error signing in anonymously after logout:", error));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setErrorMessage("");
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, errorMessage, showModal, closeModal, db, auth, isAuthReady, appId: currentAppId, allUsersFromFirestore, setAllUsersFromFirestore }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

// --- LoginPage ---
const LoginPage = () => {
  const [loginType, setLoginType] = useState('admin'); // Default login type to 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [ssnLast4, setSsnLast4] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [showForgotPwdModal, setShowForgotPwdModal] = useState(false); // New state for forgot password modal

  const { login, errorMessage, showModal, closeModal } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loginType === 'admin') {
      login({ username, password }, loginType);
    } else if (loginType === 'sales') {
      login({ username, password }, loginType);
    } else if (loginType === 'patient') {
      login({ lastName, ssnLast4, phoneNumber }, loginType);
    } else if (loginType === 'physician') {
      login({ email, password }, loginType);
    }
  };

  // Function to clear input fields when login type changes
  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setUsername('');
    setPassword('');
    setLastName('');
    setSsnLast4('');
    setPhoneNumber('');
    setEmail('');
  };

  return (
    // The main container for the login form, adjusted for the new split layout
    // Removed full-screen centering as parent AuthContent now handles it.
    // Adjusted width to fit the right panel's design.
    <div className="flex flex-col items-center justify-center h-full w-full p-8">
      {/* Increased max-width and adjusted background/text colors for the dark theme */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg md:max-w-xl lg:max-w-md"> {/* Adjusted max-w for responsiveness */}
        <h2 className="text-3xl font-bold text-center text-white mb-8">Login to One Health Holdings Portal</h2> {/* Text color changed to white */}

        {/* Login Type Selection */}
        <div className="mb-6 flex justify-center space-x-4 flex-wrap gap-2">
          <button
            onClick={() => handleLoginTypeChange('admin')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              loginType === 'admin' ? 'bg-cyan-600 text-white shadow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Admin Login
          </button>
          <button
            onClick={() => handleLoginTypeChange('sales')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              loginType === 'sales' ? 'bg-cyan-600 text-white shadow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Sales Login
          </button>
          <button
            onClick={() => handleLoginTypeChange('patient')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              loginType === 'patient' ? 'bg-cyan-600 text-white shadow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Patient Login
          </button>
          <button
            onClick={() => handleLoginTypeChange('physician')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              loginType === 'physician' ? 'bg-cyan-600 text-white shadow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Physician Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {(loginType === 'admin' || loginType === 'sales') && (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white sm:text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {loginType === 'patient' && (
            <>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white sm:text-sm"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ssnLast4" className="block text-sm font-medium text-gray-300">
                  Last 4 of SSN
                </label>
                <input
                  type="text"
                  id="ssnLast4"
                  className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white sm:text-sm"
                  value={ssnLast4}
                  onChange={(e) => setSsnLast4(e.target.value)}
                  maxLength="4"
                  required
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white sm:text-sm"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {loginType === 'physician' && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white sm:text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transform transition-transform hover:scale-105"
          >
            Login
          </button>
        </form>

        {/* Forgot Password Link - Visible only for Physician login type */}
        {loginType === 'physician' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowForgotPwdModal(true)}
              className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* Error Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-auto text-center">
              <h3 className="text-xl font-semibold text-red-600 mb-4">Login Failed</h3>
              <p className="text-gray-700 mb-6">{errorMessage}</p>
              <button
                onClick={closeModal}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          isOpen={showForgotPwdModal}
          onClose={() => setShowForgotPwdModal(false)}
        />
      </div>
    </div>
  );
};

// --- PatientPortal ---
const PatientPortal = () => {
  return (
    // Added max-w-4xl and mx-auto for centering and fixed width
    <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-4xl mx-auto min-h-[500px]">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Patient Portal</h2>
      <p className="text-gray-700 text-lg">
        Welcome to the Patient Portal. Here you can view your appointments, test results, and communicate with your healthcare providers.
      </p>
      <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Upcoming Appointments:</h3>
        <ul className="list-disc list-inside text-gray-600">
          <li>July 15, 2025 - Dr. Smith (Annual Check-up)</li>
          <li>August 10, 2025 - Lab Test (Blood Work)</li>
        </ul>
      </div>
      <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Recent Test Results:</h3>
        <p className="text-gray-600">No new results available.</p>
      </div>
      <button className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
        Schedule New Appointment
      </button>
    </div>
  );
};

// --- getNormalizedEntityName ---
const getNormalizedEntityName = (entityName) => {
  if (!entityName) return '';
  return String(entityName).replace(/[^a-zA-Z0-9]/g, '');
};


// --- Entity Financial Data Availability ---
// This object maps entity names to an array of years for which financial reports are available.
const entityFinancialDataAvailability = {
  "First Bio Lab": ["2022", "2023", "2024", "2025"],
  "First Bio Genetics LLC": ["2023", "2024", "2025"],
  "First Bio Lab of Illinois": ["2023", "2024", "2025"],
  "AIM Laboratories LLC": ["2024", "2025"], // Corrected to 2024, 2025
  "AMICO Dx LLC": ["2024", "2025"], // Corrected to 2024, 2025
  "Enviro Labs LLC": ["2023", "2024", "2025"],
  "Stat Labs": ["2024", "2025"], // Corrected to 2024, 2025
  // Added "House" as a new entity for AndrewS
  "House": ["2024", "2025"], 
};


// --- FinancialsReport ---
const FinancialsReport = ({ entity }) => {

  const normalizedEntity = getNormalizedEntityName(entity); // Use the universal normalizer
  // Ensure availableYears is an array to use .includes()
  const availableYears = entityFinancialDataAvailability[entity] || []; 


  return (
    <div className="p-6 bg-white rounded-lg shadow-inner mt-4">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Financials for {entity}</h3>
      <div className="space-y-4">
        {/* Conditionally render 2022 Full Report */}
        {availableYears.includes("2022") && (
          <div className="p-4 border border-gray-200 rounded-md bg-blue-50">
            <h4 className="text-xl font-semibold text-gray-700">2022 Full Report</h4>
            <p className="text-gray-600">Access the full financial report for 2022.</p>
            <ul className="list-disc list-inside text-gray-600 ml-4 mt-2">
              <li>Revenue: \$X,XXX,XXX</li>
              <li>Expenses: \$Y,YYY,YYY</li>
              <li>Net Profit: \$Z,ZZZ,ZZZ</li>
            </ul>
            <a
              href={`/financial-reports-static/${normalizedEntity}-2022-FullReport.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              View 2022 Report (PDF)
            </a>
          </div>
        )}

        {/* Conditionally render 2023 Full Report */}
        {availableYears.includes("2023") && (
          <div className="p-4 border border-gray-200 rounded-md bg-blue-50">
            <h4 className="text-xl font-semibold text-gray-700">2023 Full Report</h4>
            <p className="text-gray-600">Access the full financial report for 2023.</p>
            <ul className="list-disc list-inside text-gray-600 ml-4 mt-2">
              <li>Revenue: \$X,XXX,XXX</li>
              <li>Expenses: \$Y,YYY,YYY</li>
              <li>Net Profit: \$Z,ZZZ,ZZZ</li>
            </ul>
            <a
              href={`/financial-reports-static/${normalizedEntity}-2023-FullReport.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              View 2023 Report (PDF)
            </a>
          </div>
        )}
        
        {/* Conditionally render 2024 Full Report */}
        {availableYears.includes("2024") && (
          <div className="p-4 border border-gray-200 rounded-md bg-blue-50">
            <h4 className="text-xl font-semibold text-gray-700">2024 Full Report</h4>
            <p className="text-gray-600">Access the full financial report for 2024.</p>
            <ul className="list-disc list-inside text-gray-600 ml-4 mt-2">
              <li>Revenue: \$A,AAA,AAA</li>
              <li>Expenses: \$B,BBB,BBB</li>
              <li>Net Profit: \$C,CCC,CCC</li>
            </ul>
            <a
              href={`/financial-reports-static/${normalizedEntity}-2024-FullReport.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              View 2024 Report (PDF)
            </a>
          </div>
        )}

        {/* 2025 Full Report (added for consistency) */}
        {availableYears.includes("2025") && (
          <div className="p-4 border border-gray-200 rounded-md bg-blue-50">
            <h4 className="text-xl font-semibold text-gray-700">2025 Full Report</h4>
            <p className="text-gray-600">Access the full financial report for 2025.</p>
            <ul className="list-disc list-inside text-gray-600 ml-4 mt-2">
              <li>Revenue: \$D,DDD,DDD</li>
              <li>Expenses: \$E,EEE,EEE</li>
              <li>Net Profit: \$F,FFF,FFF</li>
            </ul>
            {/* Dynamically construct the PDF link for 2025 */}
            <a
              href={`/financial-reports-static/${normalizedEntity}-2025-FullReport.pdf`}
              target="_blank" // Open in new tab
              rel="noopener noreferrer" // Security best practice for target="_blank"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              View 2025 Report (PDF)
            </a>
          </div>
        )}

        {/* Original 2025 Financials section, now for YTD/Last Month live data */}
        <div className="p-4 border border-gray-200 rounded-md bg-blue-50">
          <h4 className="text-xl font-semibold text-gray-700">2025 Financials (Live Data)</h4>
          <ul className="list-disc list-inside text-gray-600 ml-4">
            <li className="mt-2">
              <span className="font-medium">YTD Financials:</span> Placeholder for Year-to-Date data.
              <p className="ml-4 text-gray-500 text-sm">Summary of financials from January 1, 2025 to current date.</p>
            </li>
            <li className="mt-2">
              <span className="font-medium">Last Month Financials:</span> Placeholder for Last Month's data.
              <p className="ml-4 text-gray-500 text-sm">Detailed report for the previous full month (e.g., May 2025).</p>
            </li>
          </ul>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
            View Live Data
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-6">
        *Note: Detailed reports require specific data parsing. This is placeholder content.*
      </p>
    </div>
  );
};

// --- CPT Code Data ---
const cptCodeData = [
  {
      cpt: '80047',
      description: 'Basic metabolic panel (Calcium, ionized)',
      category: 'Chemistry',
      diagnosisCodes: 'E83.52 (Hypercalcemia), R74.8 (Abnormal levels of other serum enzymes)',
      details: 'Measures calcium, carbon dioxide, chloride, creatinine, glucose, potassium, sodium, and urea nitrogen (BUN) with ionized calcium.'
  },
  {
      cpt: '80048',
      description: 'Basic Metabolic Panel (BMP) (Calcium, total)',
      category: 'Chemistry',
      diagnosisCodes: 'E86.0 (Dehydration), R73.03 (Prediabetes), I10 (Hypertension)',
      details: 'Checks kidney status, blood sugar, and electrolyte/fluid balance.'
  },
  {
      cpt: '80053',
      description: 'Comprehensive Metabolic Panel (CMP)',
      category: 'Chemistry',
      diagnosisCodes: 'K74.60 (Cirrhosis of liver), E11.9 (Type 2 diabetes), Z00.00 (General adult medical exam)',
      details: 'Broader panel than BMP, includes liver function tests (ALT, AST, ALP, Bilirubin).'
  },
  {
      cpt: '80061',
      description: 'Lipid Panel',
      category: 'Chemistry',
      diagnosisCodes: 'E78.2 (Mixed hyperlipidemia), Z13.220 (Screening for lipid disorders)',
      details: 'Assesses cardiovascular risk by measuring total cholesterol, HDL, LDL, and triglycerides.'
  },
  {
      cpt: '80069',
      description: 'Renal function panel',
      category: 'Chemistry',
      diagnosisCodes: 'N18.9 (Chronic kidney disease, unspecified), I12.9 (Hypertensive CKD)',
      details: 'Evaluates kidney function with tests like albumin, calcium, CO2, chloride, creatinine, glucose, phosphorus, potassium, sodium, BUN.'
  },
  {
      cpt: '80074',
      description: 'Acute hepatitis panel',
      category: 'Chemistry',
      diagnosisCodes: 'B19.9 (Unspecified viral hepatitis), R17 (Unspecified jaundice)',
      details: 'Tests for acute hepatitis, including Hepatitis A, Hepatitis B (surface antigen, core antibody), and Hepatitis C antibody.'
  },
  {
      cpt: '80076',
      description: 'Hepatic function panel',
      category: 'Chemistry',
      diagnosisCodes: 'K76.0 (Fatty liver), R94.5 (Abnormal results of liver function studies)',
      details: 'Evaluates liver function with tests like ALT, AST, ALP, albumin, total and direct bilirubin.'
  },
  {
      cpt: '82040',
      description: 'Albumin; serum, plasma or whole blood',
      category: 'Chemistry',
      diagnosisCodes: 'E88.09 (Other disorder of plasma-protein metabolism), K70.30 (Alcoholic cirrhosis of liver without ascites)',
      details: 'Measures the amount of albumin in the blood.'
  },
  {
      cpt: '82043',
      description: 'Albumin; urine, microalbumin, quantitative',
      category: 'Chemistry',
      diagnosisCodes: 'E11.22 (Type 2 diabetes with diabetic chronic kidney disease), I12.9 (Hypertensive CKD)',
      details: 'Screens for early kidney damage, especially in diabetic or hypertensive patients.'
  },
  {
      cpt: '82140',
      description: 'Ammonia',
      category: 'Chemistry',
      diagnosisCodes: 'K72.90 (Hepatic failure, unspecified without coma)',
      details: 'Measures ammonia levels to investigate severe liver disease and certain genetic urea cycle disorders.'
  },
  {
      cpt: '82306',
      description: 'Vitamin D; 25-hydroxy, includes fraction(s), if performed',
      category: 'Chemistry',
      diagnosisCodes: 'E55.9 (Vitamin D deficiency, unspecified)',
      details: 'Measures Vitamin D levels to check for deficiency.'
  },
  {
      cpt: '82378',
      description: 'Carcinoembryonic antigen (CEA)',
      category: 'Chemistry',
      diagnosisCodes: 'C18.9 (Malignant neoplasm of colon), Z85.46 (Personal hx of colon cancer)',
      details: 'A tumor marker used to monitor certain cancers, especially colorectal cancer.'
  },
  {
      cpt: '82570',
      description: 'Creatinine; other source',
      category: 'Chemistry',
      diagnosisCodes: 'N18.3 (Chronic kidney disease, stage 3)',
      details: 'Measures creatinine level in fluids other than blood or urine.'
  },
  {
      cpt: '82607',
      description: 'Cyanocobalamin (Vitamin B-12)',
      category: 'Chemistry',
      diagnosisCodes: 'D51.9 (Vitamin B12 deficiency anemia, unspecified), K90.0 (Celiac disease)',
      details: 'Measures Vitamin B-12 levels to diagnose deficiency.'
  },
  {
      cpt: '82728',
      description: 'Ferritin',
      category: 'Chemistry',
      diagnosisCodes: 'D50.9 (Iron deficiency anemia), E83.119 (Hemochromatosis)',
      details: 'Measures the amount of stored iron in the body.'
  },
  {
      cpt: '82746',
      description: 'Folic acid; serum',
      category: 'Chemistry',
      diagnosisCodes: 'D52.9 (Folate deficiency anemia, unspecified)',
      details: 'Measures the level of folic acid in the blood.'
  },
  {
      cpt: '82947',
      description: 'Glucose; quantitative, blood',
      category: 'Chemistry',
      diagnosisCodes: 'R73.03 (Prediabetes), E11.9 (Type 2 diabetes)',
      details: 'Measures the amount of glucose in the blood at a specific time.'
  },
  {
      cpt: '83036',
      description: 'Hemoglobin; glycosylated (A1c)',
      category: 'Chemistry',
      diagnosisCodes: 'E11.65 (Type 2 diabetes with hyperglycemia), R73.09 (Other abnormal glucose)',
      details: 'Provides an average of blood sugar control over 2-3 months.'
  },
  {
      cpt: '83735',
      description: 'Magnesium',
      category: 'Chemistry',
      diagnosisCodes: 'E83.42 (Hypomagnesemia)',
      details: 'Measures the level of magnesium in the blood.'
  },
  {
      cpt: '83880',
      description: 'Natriuretic peptide (BNP)',
      category: 'Chemistry',
      diagnosisCodes: 'I50.9 (Heart failure, unspecified), R06.02 (Shortness of breath)',
      details: 'Helps diagnose and assess the severity of heart failure.'
  },
  {
      cpt: '84100',
      description: 'Phosphorus inorganic (phosphate);',
      category: 'Chemistry',
      diagnosisCodes: 'E83.30 (Disorder of phosphorus metabolism, unspecified)',
      details: 'Measures phosphorus levels, often evaluated alongside calcium.'
  },
  {
      cpt: '84153',
      description: 'Prostate specific antigen (PSA); total',
      category: 'Chemistry',
      diagnosisCodes: 'C61 (Malignant neoplasm of prostate), N40.1 (Benign prostatic hyperplasia)',
      details: 'Screens for and monitors prostate cancer.'
  },
  {
      cpt: '84436',
      description: 'Thyroxine; total',
      category: 'Chemistry',
      diagnosisCodes: 'E03.9 (Hypothyroidism, unspecified)',
      details: 'Measures the total amount of the thyroid hormone T4 in the blood.'
  },
  {
      cpt: '84439',
      description: 'Thyroxine; free',
      category: 'Chemistry',
      diagnosisCodes: 'E05.90 (Thyrotoxicosis, unspecified), E03.9 (Hypothyroidism)',
      details: 'Measures the unbound, active form of the thyroid hormone T4.'
  },
  {
      cpt: '84443',
      description: 'Thyroid stimulating hormone (TSH)',
      category: 'Chemistry',
      diagnosisCodes: 'E03.9 (Hypothyroidism, unspecified), E05.90 (Thyrotoxicosis, unspecified)',
      details: 'Primary test for evaluating thyroid function.'
  },
  {
      cpt: '84450',
      description: 'Transferase; aspartate amino (AST) (SGOT)',
      category: 'Chemistry',
      diagnosisCodes: 'R94.5 (Abnormal results of liver function studies)',
      details: 'An enzyme often measured as part of a liver function panel.'
  },
  {
      cpt: '84480',
      description: 'Triiodothyronine (T3); total',
      category: 'Chemistry',
      diagnosisCodes: 'E05.90 (Thyrotoxicosis, unspecified)',
      details: 'Measures the total amount of the thyroid hormone T3.'
  },
  {
      cpt: '84481',
      description: 'Triiodothyronine (T3); free',
      category: 'Chemistry',
      diagnosisCodes: 'E05.90 (Thyrotoxicosis, unspecified)',
      details: 'Measures the unbound, active form of the thyroid hormone T3.'
  },
  {
      cpt: '84550',
      description: 'Uric acid; blood',
      category: 'Chemistry',
      diagnosisCodes: 'M10.9 (Gout, unspecified)',
      details: 'Measures uric acid levels, primarily for diagnosing and monitoring gout.'
  },
  {
      cpt: '84703',
      description: 'Gonadotropin, chorionic (hCG); qualitative',
      category: 'Chemistry',
      diagnosisCodes: 'Z32.01 (Encounter for pregnancy test, result positive), R82.90 (Abnormal findings in urine)',
      details: 'A qualitative test to detect the presence of hCG (e.g., in urine).'
  },
  {
      cpt: '85025',
      description: 'Blood count; complete (CBC), with automated differential WBC count',
      category: 'Hematology/Coagulation',
      diagnosisCodes: 'D64.9 (Anemia, unspecified), D72.829 (Elevated white blood cell count)',
      details: 'A broad screening test for anemia, infection, and other diseases.'
  },
  {
      cpt: '85027',
      description: 'Blood count; complete (CBC), automated (Hgb, Hct, RBC, WBC and platelet count)',
      category: 'Hematology/Coagulation',
      diagnosisCodes: 'Z00.00 (General adult medical exam), D50.9 (Iron deficiency anemia)',
      details: 'Similar to 85025 but without the white blood cell differential.'
  },
  {
      cpt: '85610',
      description: 'Prothrombin time (PT)',
      category: 'Hematology/Coagulation',
      diagnosisCodes: 'Z79.01 (Long term use of anticoagulants), I48.20 (Chronic atrial fibrillation)',
      details: 'Measures how long it takes blood to clot; monitors warfarin therapy.'
  },
  {
      cpt: '81001',
      description: 'Urinalysis, by dip stick or tablet reagent...; automated, with microscopy',
      category: 'Urinalysis',
      diagnosisCodes: 'N39.0 (UTI, site not specified), R31.0 (Gross hematuria), R30.0 (Dysuria)',
      details: 'An automated urinalysis with a microscopic examination of the urine sediment.'
  },
  {
      cpt: '80164',
      description: 'Depakote (valproic acid)',
      category: 'Toxicology',
      diagnosisCodes: 'G40.909 (Epilepsy, unspecified), F31.9 (Bipolar disorder, unspecified)',
      details: 'Therapeutic drug monitoring for valproic acid.'
  },
  {
      cpt: '80178',
      description: 'Lithium',
      category: 'Toxicology',
      diagnosisCodes: 'F31.9 (Bipolar disorder, unspecified)',
      details: 'Therapeutic drug monitoring for lithium.'
  },
  {
      cpt: '80307',
      description: 'Drug test(s), presumptive, any number of drug classes... read by instrument',
      category: 'Toxicology',
      diagnosisCodes: 'F19.90 (Other psychoactive substance use), Z02.83 (Encounter for suspected substance abuse)',
      details: 'A screening test to detect the presence of various classes of drugs via an instrument-read device.'
  },
  {
      cpt: 'G0480',
      description: 'Drug test(s), definitive... 1-7 drug class(es)',
      category: 'Toxicology',
      diagnosisCodes: 'F11.10 (Opioid abuse, uncomplicated), Z79.891 (Long term use of opiate analgesic)',
      details: 'A specific test that identifies individual drugs within 1-7 classes.'
  },
  {
      cpt: 'G0481',
      description: 'Drug test(s), definitive... 8-10 drug class(es)',
      category: 'Toxicology',
      diagnosisCodes: 'F11.20 (Opioid dependence), T40.691A (Poisoning by narcotics, accidental)',
      details: 'A specific test that identifies individual drugs within 8-10 classes.'
  },
  {
      cpt: 'G0482',
      description: 'Drug test(s), definitive... 11-21 drug class(es)',
      category: 'Toxicology',
      diagnosisCodes: 'F11.20 (Opioid dependence), F14.20 (Cocaine dependence)',
      details: 'A specific test that identifies individual drugs within 11-21 classes.'
  },
  {
      cpt: 'G0483',
      description: 'Drug test(s), definitive... 22 or more drug class(es)',
      category: 'Toxicology',
      diagnosisCodes: 'F10.20 (Alcohol dependence), F11.23 (Opioid dependence with withdrawal)',
      details: 'A comprehensive definitive drug test for 22 or more drug classes.'
  },
  {
      cpt: '86200',
      description: 'Cyclic citrullinated peptide (CCP) antibody',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'M05.79 (Rheumatoid arthritis with rheumatoid factor of other site)',
      details: 'Helps diagnose rheumatoid arthritis.'
  },
  {
      cpt: '86376',
      description: 'Mycoplasma pneumoniae, antibody',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'J15.7 (Pneumonia due to Mycoplasma pneumoniae)',
      details: 'Detects antibodies to Mycoplasma pneumoniae.'
  },
  {
      cpt: '86430',
      description: 'Rheumatoid factor; qualitative',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'M06.9 (Rheumatoid arthritis, unspecified)',
      details: 'Screens for rheumatoid factor, an autoantibody associated with rheumatoid arthritis.'
  },
  {
      cpt: '86480',
      description: 'Tuberculosis test, cell mediated immunity...',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'Z11.1 (Encounter for screening for respiratory tuberculosis), R76.11 (Nonspecific reaction to tuberculin skin test)',
      details: 'Blood test for tuberculosis (e.g., QuantiFERON-TB Gold).'
  },
  {
      cpt: '86592',
      description: 'Syphilis test, non-treponemal antibody; qualitative (eg, RPR, VDRL)',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'A53.9 (Syphilis, unspecified), Z11.3 (Encounter for screening for infections with a predominantly sexual mode of transmission)',
      details: 'A non-specific screening test for syphilis.'
  },
  {
      cpt: '86695',
      description: 'Herpes simplex, non-specific type test, antibody',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'A60.00 (Herpesviral infection of unspecified anogenital site), Z11.3',
      details: 'Detects antibodies to Herpes Simplex Virus.'
  },
  {
      cpt: '86696',
      description: 'Herpes simplex, type 2',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'A60.04 (Herpesviral infection of female genitalia)',
      details: 'Detects antibodies specifically to Herpes Simplex Virus Type 2.'
  },
  {
      cpt: '86701',
      description: 'Antibody; HIV-1',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'Z11.4 (Encounter for screening for human immunodeficiency virus [HIV])',
      details: 'Detects antibodies to HIV-1.'
  },
  {
      cpt: '86702',
      description: 'Antibody; HIV-2',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'Z11.4 (Encounter for screening for human immunodeficiency virus [HIV])',
      details: 'Detects antibodies to HIV-2.'
  },
  {
      cpt: '86708',
      description: 'Antibody; Hepatitis B core antibody (HBcAb), IgG and IgM',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'Z22.51 (Carrier of viral hepatitis B), B18.1 (Chronic viral hepatitis B)',
      details: 'Detects previous or ongoing infection with Hepatitis B virus.'
  },
  {
      cpt: '86800',
      description: 'Thyroglobulin antibody',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'E06.3 (Autoimmune thyroiditis)',
      details: 'Detects antibodies against thyroglobulin, often seen in autoimmune thyroid disease.'
  },
  {
      cpt: '87340',
      description: 'Infectious agent antigen detection...; hepatitis B surface antigen (HBsAg)',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'Z11.59 (Encounter for screening for other viral diseases), B18.1 (Chronic viral hepatitis B)',
      details: 'Screens for the presence of Hepatitis B virus.'
  },
  {
      cpt: '87389',
      description: 'Infectious agent antigen detection... HIV-1 antigen(s), with HIV-1 and HIV-2 antibodies',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'Z11.4 (Encounter for screening for human immunodeficiency virus [HIV])',
      details: '4th generation HIV test that detects both the p24 antigen and antibodies.'
  },
  {
      cpt: '87426',
      description: 'Infectious agent antigen detection... Shiga-like toxin',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'A04.9 (Bacterial intestinal infection, unspecified), R19.7 (Diarrhea)',
      details: 'Detects Shiga toxin, indicating an infection with E. coli O157:H7 or other Shiga toxin-producing bacteria.'
  },
  {
      cpt: '87491',
      description: 'Infectious agent detection... Chlamydia trachomatis, amplified probe technique',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'A56.00 (Chlamydial infection of lower genitourinary tract, unspecified)',
      details: 'Detects the genetic material of Chlamydia trachomatis.'
  },
  {
      cpt: '87522',
      description: 'Infectious agent detection... hepatitis C, quantitative',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'B18.2 (Chronic viral hepatitis C)',
      details: 'Measures the amount of Hepatitis C virus in the blood (viral load).'
  },
  {
      cpt: '87556',
      description: 'Infectious agent detection... Mycoplasma genitalium, amplified probe technique',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'A59.02 (Trichomonal prostatitis)',
      details: 'Detects the genetic material of Mycoplasma genitalium.'
  },
  {
      cpt: '87591',
      description: 'Infectious agent detection... Neisseria gonorrhoeae, amplified probe technique',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'A54.00 (Gonococcal infection of lower genitourinary tract without abscess)',
      details: 'Detects the genetic material of Neisseria gonorrhoeae.'
  },
  {
      cpt: '87635',
      description: 'Infectious agent detection... respiratory virus (eg, adenovirus, influenza virus...)',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'J06.9 (Acute upper respiratory infection, unspecified), R05 (Cough)',
      details: 'Multiplex PCR test for several common respiratory viruses.'
  },
  {
      cpt: '87636',
      description: 'Infectious agent detection... SARS-CoV-2 and influenza virus types A and B',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'J11.1 (Influenza due to unidentified influenza virus), Z20.822 (Contact with and (suspected) exposure to COVID-19)',
      details: 'A combination test for COVID-19 and Influenza A/B.'
  },
  {
      cpt: '87637',
      description: 'Infectious agent detection... SARS-CoV-2, influenza A/B, and RSV, multiplex',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'J12.1 (Pneumonia due to respiratory syncytial virus)',
      details: 'A combination test for COVID-19, Influenza A/B, and RSV.'
  },
  {
      cpt: '87804',
      description: 'Infectious agent antigen detection... Influenza',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'J11.1 (Influenza due to unidentified influenza virus)',
      details: 'Rapid antigen test for influenza.'
  },
  {
      cpt: 'U0004',
      description: '2019-nCoV Coronavirus, SARS-CoV-2 by PCR, high throughput',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'Z20.822 (Contact with and (suspected) exposure to COVID-19)',
      details: 'High-throughput laboratory PCR test for SARS-CoV-2.'
  },
  {
      cpt: 'U0005',
      description: 'Infectious agent detection... SARS-CoV-2, non-CDC lab, 24-48 hours',
      category: 'Infectious Disease/Microbiology',
      diagnosisCodes: 'Z20.822 (Contact with and (suspected) exposure to COVID-19)',
      details: 'Used for certain non-CDC developed COVID-19 tests with specific turnaround times.'
  },
  {
      cpt: '81210',
      description: 'BRCA1, BRCA2... full sequence analysis and common duplication/deletion',
      category: 'Molecular Pathology',
      diagnosisCodes: 'Z15.01 (Genetic susceptibility to malignant neoplasm of breast)',
      details: 'Assesses hereditary risk for breast, ovarian, and other cancers.'
  },
  {
      cpt: '81435',
      description: 'Hereditary colon cancer syndromes... genomic sequence analysis panel',
      category: 'Molecular Pathology',
      diagnosisCodes: 'Z15.03 (Genetic susceptibility to malignant neoplasm of colon)',
      details: 'Panel to test for genetic syndromes that increase colon cancer risk.'
  },
  {
      cpt: '81479',
      description: 'Unlisted molecular pathology procedure',
      category: 'Molecular Pathology',
      diagnosisCodes: 'C80.1 (Disseminated malignant neoplasm, unspecified)',
      details: 'Used for molecular tests that do not have a specific CPT code.'
  },
  {
      cpt: '87631',
      description: 'Infectious agent detection... respiratory syncytial virus, amplified probe',
      category: 'Molecular Pathology',
      diagnosisCodes: 'J21.0 (Acute bronchiolitis due to respiratory syncytial virus)',
      details: 'Detects the genetic material of Respiratory Syncytial Virus (RSV).'
  },
  {
      cpt: '88305',
      description: 'Level IV - Surgical pathology, gross and microscopic examination',
      category: 'Anatomic Pathology',
      diagnosisCodes: 'D22.5 (Melanocytic nevi of trunk), K63.5 (Polyp of colon), N84.1 (Polyp of cervix uteri)',
      details: 'Pathologic examination of tissue, such as a colon polyp or skin biopsy.'
  },
  {
      cpt: '36415',
      description: 'Collection of venous blood by venipuncture',
      category: 'Procedure/Other',
      diagnosisCodes: 'Z00.00 (General adult medical exam), Z01.812 (Preprocedural lab exam)',
      details: 'Procedure code for drawing blood.'
  },
  {
      cpt: 'G2023',
      description: 'Specimen collection for SARS-CoV-2 (COVID-19)',
      category: 'Procedure/Other',
      diagnosisCodes: 'Z20.822 (Contact with and (suspected) exposure to COVID-19)',
      details: 'HCPCS code for collecting a COVID-19 specimen.'
  },
  {
      cpt: 'P9604',
      description: 'Catheterization for collection of specimen(s)',
      category: 'Procedure/Other',
      diagnosisCodes: 'R30.0 (Dysuria), N39.0 (UTI, site not specified)',
      details: 'HCPCS code for collecting a specimen via catheter.'
  },
  {
      cpt: 'K1034',
      description: 'Saliva-based test for the detection of HIV',
      category: 'Procedure/Other',
      diagnosisCodes: 'Z11.4 (Encounter for screening for HIV)',
      details: 'HCPCS code for a saliva-based HIV test.'
  }
];

// --- CPT Code Finder Component ---
const CptCodeFinder = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setSearchResults([]);
      return;
    }

    const results = cptCodeData.filter(item => 
      item.cpt.toLowerCase().includes(term) || 
      item.description.toLowerCase().includes(term)
    );
    setSearchResults(results);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl mx-auto relative transform transition-all sm:my-8 sm:w-full h-[90vh] flex flex-col">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">CPT Code Finder</h3>
        <div className="mb-4">
          <label htmlFor="cpt-search" className="block text-sm font-medium text-gray-700">
            Search by CPT Code or Description
          </label>
          <input
            type="text"
            id="cpt-search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="e.g., 80053 or Comprehensive"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
          <div className="space-y-4">
            {searchResults.length > 0 ? (
              searchResults.map((item, index) => (
                <div key={`${item.cpt}-${index}`} className="p-4 border rounded-md bg-white shadow-sm">
                  <h4 className="text-lg font-bold text-indigo-700">{item.cpt} - {item.description}</h4>
                  <p className="mt-1 text-sm text-gray-600"><span className="font-semibold">Associated Diagnosis Codes:</span> {item.diagnosisCodes}</p>
                  <p className="mt-1 text-sm text-gray-800">{item.details}</p>
                </div>
              ))
            ) : (
              searchTerm && <p className="text-gray-500">No results found for "{searchTerm}".</p>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


// --- SalesMarketing ---
const SalesMarketing = () => {
  const { currentUser, db, isAuthReady, appId, auth } = useAuth();
  const [rawSalesData, setRawSalesData] = useState([]); // All data fetched from Firestore
  const [filteredDisplayData, setFilteredDisplayData] = useState([]); // Data for table/chart after filtering
  const [chartData, setChartData] = useState([]); // Aggregated data for the chart
  const [availableEntities, setAvailableEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(''); // Empty string for "All Months"
  const [selectedEntity, setSelectedEntity] = useState(''); // Empty string for "All Entities"

  const fullAccessSalesAdmins = ["SatishD", "AshlieT", "MinaK"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // 1. Fetch all sales data on component mount
  useEffect(() => {
    if (!db || !isAuthReady || !auth || !currentUser) {
      return;
    }

    const fetchSalesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const salesColRef = collection(db, `artifacts/${appId}/public/data/salesReports`);
        const querySnapshot = await getDocs(query(salesColRef));
        const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Populate available entities for the dropdown
        const entities = [...new Set(fetchedData.map(item => item.entity))].sort();
        setAvailableEntities(entities);

        setRawSalesData(fetchedData);
      } catch (err) {
        console.error("Error fetching sales data:", err);
        setError("Failed to load sales data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [db, isAuthReady, appId, auth, currentUser]);

  // 2. Apply filters whenever raw data or filter selections change
  useEffect(() => {
    let dataToFilter = [...rawSalesData];

    // First, apply user-based permission filtering
    const isFullAccess = currentUser && fullAccessSalesAdmins.includes(currentUser.username);
    if (!isFullAccess) {
      dataToFilter = dataToFilter.filter(item =>
        item.username && item.username.split(',,').includes(currentUser?.username)
      );
    }
    
    // Apply year filter
    if (selectedYear) {
      dataToFilter = dataToFilter.filter(item => item.month && item.month.includes(selectedYear));
    }

    // Apply month filter
    if (selectedMonth) {
      dataToFilter = dataToFilter.filter(item => item.month && item.month.startsWith(selectedMonth));
    }
    
    // Apply entity filter
    if (selectedEntity) {
      dataToFilter = dataToFilter.filter(item => item.entity === selectedEntity);
    }

    // Sort the final filtered data for the table
    dataToFilter.sort((a, b) => {
      const aDate = new Date(`${a.month.split(' ')[0]} 1, ${a.month.split(' ')[1]}`);
      const bDate = new Date(`${b.month.split(' ')[0]} 1, ${b.month.split(' ')[1]}`);
      return aDate - bDate;
    });

    setFilteredDisplayData(dataToFilter);

    // Aggregate data for the chart based on the final filtered data
    const aggregated = dataToFilter.reduce((acc, item) => {
        if (!acc[item.month]) {
            acc[item.month] = { month: item.month, reimbursement: 0, cogs: 0, net: 0 };
        }
        acc[item.month].reimbursement += parseFloat(item.reimbursement || 0);
        acc[item.month].cogs += parseFloat(item.cogs || 0);
        acc[item.month].net += parseFloat(item.net || 0);
        return acc;
    }, {});

    const sortedAggregated = Object.values(aggregated).sort((a, b) => {
        const aDate = new Date(`${a.month.split(' ')[0]} 1, ${a.month.split(' ')[1]}`);
        const bDate = new Date(`${b.month.split(' ')[0]} 1, ${b.month.split(' ')[1]}`);
        return aDate - bDate;
    });

    setChartData(sortedAggregated);

  }, [rawSalesData, selectedYear, selectedMonth, selectedEntity, currentUser]);

  const requisitionFiles = [
    "AIM Clinical Laboratory Requisition",
    "AIM RIT PCR Laboratory Requisition",
    "AIM Toxicology Laboratory Requisition",
    "AIM UTI PCR Laboratory Requisition",
    "AIM Wound PCR Laboratory Requisition"
  ];

  return (
    <div className="p-8 bg-white rounded-lg shadow-md w-full min-h-[500px]">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Sales & Marketing Dashboard</h2>
      <p className="text-gray-700 text-lg mb-6">
        Access tools and insights for sales and marketing initiatives.
      </p>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg border">
        <div>
          <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700">Year</label>
          <select id="year-filter" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <div>
          <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700">Month</label>
          <select id="month-filter" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="">All Months</option>
            {monthNames.map(month => <option key={month} value={month}>{month}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="entity-filter" className="block text-sm font-medium text-gray-700">Entity</label>
          <select id="entity-filter" value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" disabled={loading || availableEntities.length === 0}>
            <option value="">All Entities</option>
            {availableEntities.map(entity => <option key={entity} value={entity}>{entity}</option>)}
          </select>
        </div>
      </div>

      {/* Sales Performance Chart Section */}
      <div className="mt-6 p-4 border border-gray-200 rounded-md bg-blue-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Monthly Sales Overview (Reimbursement vs. COGS)</h3>
        {loading && <p>Loading chart...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5, }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="reimbursement" name="Total Reimbursement" fill="#8884d8" />
              <Bar dataKey="cogs" name="Total COGS" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        ) : (!loading && !error && <p className="text-gray-600">No sales data available for the selected criteria.</p>)}
      </div>

      {/* Sales Performance Table Section */}
      <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Detailed Sales Data:</h3>
        {loading && <p>Loading data...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && filteredDisplayData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th><th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th><th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reimbursement</th><th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">COGS</th><th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th><th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th><th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th><th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Associated Rep Name</th><th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username(s)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDisplayData.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 text-xs font-medium text-gray-900">{item.month}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">{item.location}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">${(item.reimbursement || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">${(item.cogs || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">${(item.net || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">{(item.commission || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">{item.entity}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">{item.associatedrepname}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (!loading && !error && <p className="text-gray-600">No sales data available for the selected criteria.</p>)}
      </div>
      
      {/* Sales Tools and Documents Section */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Sales Tools & Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requisitions Section */}
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Requisitions</h3>
                <p className="text-gray-600">Access and download requisition forms.</p>
                <div className="mt-4 space-y-2">
                    {requisitionFiles.map(fileName => (
                         <a
                         key={fileName}
                         href={`/requisitions/${fileName.replace(/\s/g, '')}.pdf`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="block w-full text-left p-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
                       >
                         {fileName}
                       </a>
                    ))}
                </div>
            </div>

            {/* Marketing Material Section */}
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Marketing Material</h3>
              <p className="text-gray-600">View and download marketing materials.</p>
              <a
                href="/marketing/product-brochure.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                View Product Brochure (PDF)
              </a>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- MonthlyBonusReport ---
const MonthlyBonusReport = ({ entity }) => {
  const { currentUser, db, isAuthReady, appId, auth } = useAuth(); // Added currentUser
  const [bonusData, setBonusData] = useState([]);
  const [salesData, setSalesData] = useState([]); // New state for sales data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for the selected year, defaulting to the current year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Use the universal normalizer
  const normalizedEntity = getNormalizedEntityName(entity);

  useEffect(() => {
    // Ensure db and auth are ready
    if (!db || !isAuthReady || !auth || !currentUser) { // Added currentUser to dependency
      return;
    }

    const fetchReportsData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!appId) {
          throw new Error("Application ID (appId) is not available for Firestore path.");
        }

        console.log(`MonthlyBonusReport: Fetching bonus data for normalized entity path: ${normalizedEntity} and year: ${selectedYear} with UID: ${auth.currentUser.uid}`);

        // Fetch Monthly Bonus Data
        const bonusColRef = collection(db, "artifacts", appId, "public", "data", "monthlyBonuses", normalizedEntity, "bonus_months");
        const bonusQuerySnapshot = await getDocs(query(bonusColRef));
        const fetchedBonusData = bonusQuerySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          // Filter by selected year
          .filter(item => item.Month && item.Month.includes(selectedYear));

        console.log(`MonthlyBonusReport: Raw fetched bonus data for ${entity} (${selectedYear}):`, fetchedBonusData);

        fetchedBonusData.sort((a, b) => {
            const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const parseMonthYear = (monthYearStr) => {
                const parts = monthYearStr.split(' ');
                const month = parts[0];
                const year = parseInt(parts[1]);
                return { month, year };
            };

            const aParsed = parseMonthYear(a.Month);
            const bParsed = parseMonthYear(b.Month);

            if (aParsed.year !== bParsed.year) {
                return aParsed.year - bParsed.year;
            }
            return monthOrder.indexOf(aParsed.month) - monthOrder.indexOf(bParsed.month);
        });
        setBonusData(fetchedBonusData);

        // Fetch Sales Data for Chart
        const salesColRef = collection(db, `artifacts/${appId}/public/data/salesReports`);
        const salesQuerySnapshot = await getDocs(query(salesColRef));
        const fetchedSalesData = salesQuerySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          // Filter sales data by selected year
          .filter(item => item.month && item.month.includes(selectedYear));
        
        console.log(`MonthlyBonusReport: Raw fetched sales data (all entities, filtered by year ${selectedYear}):`, fetchedSalesData);
        console.log(`MonthlyBonusReport: Selected entity from dropdown (raw): "${entity}"`);
        console.log(`MonthlyBonusReport: Selected entity normalized: "${getNormalizedEntityName(entity)}"`);


        // Filter sales data for the selected entity (if applicable) and aggregate
        const relevantSalesData = fetchedSalesData.filter(item => {
          const normalizedItemEntity = getNormalizedEntityName(item.entity);
          const normalizedSelectedEntity = getNormalizedEntityName(entity);
          console.log(`Comparing item.entity "${item.entity}" (normalized: "${normalizedItemEntity}") with selected entity "${entity}" (normalized: "${normalizedSelectedEntity}") for year ${selectedYear}`);
          return normalizedItemEntity === normalizedSelectedEntity;
        });
        console.log(`MonthlyBonusReport: Filtered sales data for ${entity} (${selectedYear}):`, relevantSalesData);

        const aggregated = relevantSalesData.reduce((acc, item) => {
          if (!acc[item.month]) {
            acc[item.month] = { month: item.month, reimbursement: 0, cogs: 0 };
          }
          acc[item.month].reimbursement += parseFloat(item.reimbursement || 0);
          acc[item.month].cogs += parseFloat(item.cogs || 0);
          return acc;
        }, {});

        console.log(`MonthlyBonusReport: Aggregated sales data for chart for ${entity} (${selectedYear}):`, aggregated);


        // Convert aggregated object to array and sort by month
        const sortedAggregatedSalesData = Object.values(aggregated).sort((a, b) => {
            const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const parseMonthYear = (monthYearStr) => {
                const parts = monthYearStr.split(' ');
                const month = parts[0];
                const year = parseInt(parts[1]);
                return { month, year };
            };

            const aParsed = parseMonthYear(a.month);
            const bParsed = parseMonthYear(b.month);

            if (aParsed.year !== bParsed.year) {
                return aParsed.year - bParsed.year;
            }
            return monthOrder.indexOf(aParsed.month) - monthOrder.indexOf(bParsed.month);
        });

        setSalesData(sortedAggregatedSalesData); // Set the aggregated sales data for the chart

      } catch (err) {
        console.error("Error fetching reports data:", err);
        setError("Failed to load reports data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (entity) { // Only fetch if an entity is selected
      fetchReportsData();
    } else {
      setBonusData([]);
      setSalesData([]); // Clear sales data as well
      setLoading(false);
    }
  }, [db, isAuthReady, appId, entity, selectedYear, auth, currentUser]); // Added currentUser to dependency


  const downloadCsv = () => {
    // Define CSV headers - ensure these match your Firestore document fields
    const headers = ["Month", "Bonus Amount", "Performance", "Participants"];
    
    // Use the fetched bonusData instead of mockBonusData
    const csvRows = [
      headers.join(','), // Add headers
      ...bonusData.map(row => 
        // Ensure property names match your Firestore document fields exactly
        `${row.Month || ''},${row.BonusAmount || 0},${row.Performance || ''},${row.Participants || 0}`
      )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) { 
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${entity.replace(/\s+/g, '-')}-MonthlyBonusReport-${selectedYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-inner mt-4">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Monthly Bonus for {entity}</h3>
      
      {/* Year Selection Dropdown */}
      <div className="mb-4">
        <label htmlFor="year-select" className="block text-lg font-medium text-gray-700 mb-2">
          Select Year:
        </label>
        <select
          id="year-select"
          className="mt-1 block w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {/* Dynamically generate options for available years */}
          {/* Assuming current year is 2025 and 2024 is also available */}
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading && (
            <div className="animate-pulse flex flex-col space-y-4">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-24 bg-gray-300 rounded"></div>
                <div className="h-48 bg-gray-300 rounded"></div>
            </div>
        )}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!loading && !error && bonusData.length === 0 && salesData.length === 0 && (
          <p className="text-gray-600">No monthly bonus or sales data available for this entity for {selectedYear}.</p>
        )}

        {/* Display Live Data for Bonuses */}
        {!loading && !error && bonusData.length > 0 && (
            <div className="p-4 border border-gray-200 rounded-md bg-green-50">
                <h4 className="text-xl font-semibold text-gray-700 mb-2">{selectedYear} Bonus (Live Data)</h4>
                <ul className="list-disc list-inside text-gray-600 ml-4">
                    {bonusData.map((item) => (
                        <li key={item.id} className="mt-2">
                            <span className="font-medium">{item.Month} Bonus:</span> ${item.BonusAmount?.toFixed(2) || 'N/A'} (Total Bonuses Due to Members)
                        </li>
                    ))}
                </ul>
                <p className="text-gray-500 text-sm mt-4">
                    Details for each month's bonus payouts are fetched from Firestore.
                </p>
                <button
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                >
                    Generate Current Month's Bonus (Placeholder)
                </button>
                <button
                    onClick={downloadCsv}
                    className="mt-4 ml-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                    Download Monthly Bonus Report (CSV)
                </button>
            </div>
        )}

        {/* Reimbursement and COGS Bar Chart */}
        {!loading && !error && salesData.length > 0 && (
          <div className="mt-6 p-4 border border-gray-200 rounded-md bg-blue-50">
            <h4 className="text-xl font-semibold text-gray-700 mb-4">Monthly Reimbursement vs. COGS for {selectedYear}</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={salesData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="reimbursement" name="Total Reimbursement" fill="#8884d8" />
                <Bar dataKey="cogs" name="Total COGS" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
             <p className="text-sm text-gray-500 mt-2">
                This chart displays the aggregated monthly reimbursement and cost of goods sold (COGS) for {entity} in {selectedYear}.
            </p>
          </div>
        )}

        {/* The 2024 Bonus placeholder is removed as the year selection handles this now */}
      </div>
      <p className="text-sm text-gray-500 mt-6">
        *Note: Specific bonus calculations would be integrated here based on available data.*
      </p>
    </div>
  );
};

// --- RecentActivityFeed Component ---
const RecentActivityFeed = () => {
  // Mock activity data for demonstration
  const activities = [
    { id: 1, message: "Global Sales Data for May 2025 uploaded by SatishD.", timestamp: "2025-06-15 10:30 AM" },
    { id: 2, message: "Monthly Bonus Report for AIM Laboratories (April 2025) finalized.", timestamp: "2025-06-14 04:00 PM" },
    { id: 3, message: "New physician Dr. House registered.", timestamp: "2025-06-13 09:15 AM" },
    { id: 4, message: "New patient Jane Doe updated her profile.", timestamp: "2025-06-12 11:00 AM" },
    { id: 5, message: "System maintenance completed successfully.", timestamp: "2025-06-11 02:00 AM" },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.length > 0 ? (
          <ul className="list-none p-0">
            {activities.map(activity => (
              <li key={activity.id} className="bg-gray-50 p-3 rounded-md border border-gray-200 text-gray-700 text-sm flex justify-between items-center">
                <span>{activity.message}</span>
                <span className="text-gray-500 text-xs ml-4">{activity.timestamp}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No recent activities to display.</p>
        )}
      </div>
    </div>
  );
};

// --- UserManagement Component ---
const UserManagement = () => {
  const { db, auth, isAuthReady, appId, allUsersFromFirestore, setAllUsersFromFirestore } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
    role: 'admin', // Default role
    isFullAccessAdmin: false,
    email: '', // For physician
    lastName: '', // For patient
    ssnLast4: '', // For patient
    phoneNumber: '', // For patient
    entities: {}, // For admin
  });

  // All possible entities for admin access configuration
  const allEntities = Object.keys(entityFinancialDataAvailability);

  // Function to fetch users (can be called after add/edit/delete)
  const fetchUsers = async () => {
    if (!db || !auth || !auth.currentUser || !isAuthReady || !appId) {
      console.log("UserManagement: Cannot fetch users. DB, Auth, currentUser, or isAuthReady not ready/available.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const usersColRef = collection(db, `artifacts/${appId}/public/data/users`);
      const q = query(usersColRef);
      const querySnapshot = await getDocs(q);
      const fetchedUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsersFromFirestore(fetchedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount and when auth/db state changes
  useEffect(() => {
    fetchUsers();
  }, [db, isAuthReady, auth, appId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEntityChange = (entityName) => {
    setNewUserData(prev => ({
      ...prev[newUserData.role === 'admin' ? 'entities' : ''], // Only update entities for admin role
      entities: {
        ...prev.entities,
        [entityName]: prev.entities[entityName] === 'Yes' ? 'No' : 'Yes',
      },
    }));
  };
  
  const handleAddUser = async () => {
    if (!db || !auth || !auth.currentUser || !isAuthReady || !appId) {
      setError("Error: Database, authentication, or application ID not ready/available.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const usersColRef = collection(db, `artifacts/${appId}/public/data/users`);
      // Prepare data based on role
      const userToSave = { ...newUserData, createdAt: serverTimestamp() };
      
      // Clear irrelevant fields based on role before saving
      if (userToSave.role !== 'admin') {
        delete userToSave.isFullAccessAdmin;
        delete userToSave.entities;
      }
      if (userToSave.role !== 'physician') {
        delete userToSave.email;
      }
      if (userToSave.role !== 'patient') {
        delete userToSave.lastName;
        delete userToSave.ssnLast4;
        delete userToSave.phoneNumber;
      }
      if (userToSave.role !== 'admin' && userToSave.role !== 'sales') {
        delete userToSave.username;
        delete userToSave.password;
      }

      await addDoc(usersColRef, userToSave);
      setNewUserData({ username: '', password: '', role: 'admin', isFullAccessAdmin: false, email: '', lastName: '', ssnLast4: '', phoneNumber: '', entities: {} });
      setShowAddUserModal(false);
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Error adding user:", err);
      setError("Failed to add user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!db || !auth || !auth.currentUser || !isAuthReady || !appId || !editingUser?.id) {
      setError("Error: Database, authentication, or application ID not ready/available, or no user selected for editing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userDocRef = doc(db, `artifacts/${appId}/public/data/users`, editingUser.id);
      const userToUpdate = { ...editingUser }; // Use a copy of editingUser state

      // Clear irrelevant fields based on role before saving
      if (userToUpdate.role !== 'admin') {
        delete userToUpdate.isFullAccessAdmin;
        delete userToUpdate.entities;
      } else { // For admin role, ensure entities object is clean (no 'No' values)
        const cleanedEntities = {};
        for (const entityName in userToUpdate.entities) {
          if (userToUpdate.entities[entityName] === 'Yes') {
            cleanedEntities[entityName] = 'Yes';
          }
        }
        userToUpdate.entities = cleanedEntities;
      }

      if (userToUpdate.role !== 'physician') {
        delete userToUpdate.email;
      }
      if (userToUpdate.role !== 'patient') {
        delete userToUpdate.lastName;
        delete userToUpdate.ssnLast4;
        delete userToUpdate.phoneNumber;
      }
      if (userToUpdate.role !== 'admin' && userToUpdate.role !== 'sales') {
        delete userToUpdate.username;
        delete userToUpdate.password;
      }

      // Remove the 'id' field as it's not part of the document data
      delete userToUpdate.id; 

      await updateDoc(userDocRef, userToUpdate);
      setEditingUser(null);
      setShowEditUserModal(false);
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!db || !auth || !auth.currentUser || !isAuthReady || !appId) {
      setError("Error: Database, authentication, or application ID not ready/available.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      setLoading(true);
      setError(null);
      try {
        const userDocRef = doc(db, `artifacts/${appId}/public/data/users`, userId);
        await deleteDoc(userDocRef);
        await fetchUsers(); // Refresh the list
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Failed to delete user: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const openAddUserModal = () => {
    setNewUserData({ username: '', password: '', role: 'admin', isFullAccessAdmin: false, email: '', lastName: '', ssnLast4: '', phoneNumber: '', entities: {} });
    setShowAddUserModal(true);
  };

  const openEditUserModal = (user) => {
    // Ensure entities is an object, not null/undefined
    const entitiesToEdit = user.entities || {};
    setEditingUser({ ...user, entities: entitiesToEdit });
    setShowEditUserModal(true);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-inner mt-4">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">User Management</h3>
      
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-blue-600 mb-4">Loading users...</p>}

      <button
        onClick={openAddUserModal}
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
      >
        Add New User
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username/Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Access Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entities</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allUsersFromFirestore.length > 0 ? (
              allUsersFromFirestore.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.username || user.email || `${user.lastName} (Patient)`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.isFullAccessAdmin ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.entities ? Object.keys(user.entities).filter(e => user.entities[e] === 'Yes').join(', ') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditUserModal(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New User</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }} className="space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  id="role"
                  value={newUserData.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="sales">Sales</option>
                  <option value="patient">Patient</option>
                  <option value="physician">Physician</option>
                </select>
              </div>

              {(newUserData.role === 'admin' || newUserData.role === 'sales') && (
                <>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                    <input type="text" name="username" id="username" value={newUserData.username} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" id="password" value={newUserData.password} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                </>
              )}

              {newUserData.role === 'patient' && (
                <>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" name="lastName" id="lastName" value={newUserData.lastName} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="ssnLast4" className="block text-sm font-medium text-gray-700">Last 4 of SSN</label>
                    <input type="text" name="ssnLast4" id="ssnLast4" value={newUserData.ssnLast4} onChange={handleInputChange} maxLength="4" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" name="phoneNumber" id="phoneNumber" value={newUserData.phoneNumber} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                </>
              )}

              {newUserData.role === 'physician' && (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" id="email" value={newUserData.email} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" id="edit-password" value={newUserData.password} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                </>
              )}

              {newUserData.role === 'admin' && (
                <>
                  <div>
                    <label htmlFor="isFullAccessAdmin" className="flex items-center text-sm font-medium text-gray-700 mt-2">
                      <input
                        type="checkbox"
                        name="isFullAccessAdmin"
                        id="isFullAccessAdmin"
                        checked={newUserData.isFullAccessAdmin}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
                      />
                      Is Full Access Admin
                    </label>
                  </div>
                  <div className="border p-3 rounded-md bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">Assign Entities (for Admin Reports):</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {allEntities.map(entity => (
                        <label key={entity} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newUserData.entities[entity] === 'Yes'}
                            onChange={() => setNewUserData(prev => ({
                              ...prev,
                              entities: {
                                ...prev.entities,
                                [entity]: prev.entities[entity] === 'Yes' ? 'No' : 'Yes'
                              }
                            }))}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
                          />
                          {entity}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit User: {editingUser.username || editingUser.email || editingUser.lastName}</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }} className="space-y-4">
              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  id="edit-role"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="sales">Sales</option>
                  <option value="patient">Patient</option>
                  <option value="physician">Physician</option>
                </select>
              </div>

              {(editingUser.role === 'admin' || editingUser.role === 'sales') && (
                <>
                  <div>
                    <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700">Username</label>
                    <input type="text" name="username" id="edit-username" value={editingUser.username || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, username: e.target.value }))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" id="edit-password" value={editingUser.password || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, password: e.target.value }))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    <p className="text-xs text-gray-500 mt-1">Note: This will overwrite the current password. For security, consider implementing a password reset flow instead in a production app.</p>
                  </div>
                </>
              )}

              {editingUser.role === 'patient' && (
                <>
                  <div>
                    <label htmlFor="edit-lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" name="lastName" id="edit-lastName" value={editingUser.lastName || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, lastName: e.target.value }))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="edit-ssnLast4" className="block text-sm font-medium text-gray-700">Last 4 of SSN</label>
                    <input type="text" name="ssnLast4" id="edit-ssnLast4" value={editingUser.ssnLast4 || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, ssnLast4: e.target.value }))} maxLength="4" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="edit-phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" name="phoneNumber" id="edit-phoneNumber" value={editingUser.phoneNumber || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, phoneNumber: e.target.value }))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                </>
              )}

              {editingUser.role === 'physician' && (
                <>
                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" id="edit-email" value={editingUser.email || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" id="edit-password" value={editingUser.password || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, password: e.target.value }))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    <p className="text-xs text-gray-500 mt-1">Note: This will overwrite the current password. For security, consider implementing a password reset flow instead in a production app.</p>
                  </div>
                </>
              )}

              {editingUser.role === 'admin' && (
                <>
                  <div>
                    <label htmlFor="edit-isFullAccessAdmin" className="flex items-center text-sm font-medium text-gray-700 mt-2">
                      <input
                        type="checkbox"
                        name="isFullAccessAdmin"
                        id="edit-isFullAccessAdmin"
                        checked={editingUser.isFullAccessAdmin}
                        onChange={(e) => setEditingUser(prev => ({ ...prev, isFullAccessAdmin: e.target.checked }))}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
                      />
                      Is Full Access Admin
                    </label>
                  </div>
                  <div className="border p-3 rounded-md bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">Assign Entities (for Admin Reports):</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {allEntities.map(entity => (
                        <label key={entity} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingUser.entities[entity] === 'Yes'}
                            onChange={() => setEditingUser(prev => ({
                              ...prev,
                              entities: {
                                ...prev.entities,
                                [entity]: prev.entities[entity] === 'Yes' ? 'No' : 'Yes'
                              }
                            }))}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
                          />
                          {entity}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


// --- AdminPage (WITH UPDATES) ---
const AdminPage = () => {
  const { currentUser, db, auth, isAuthReady, appId } = useAuth(); // Added appId
  const [selectedEntity, setSelectedEntity] = useState('');
  // Renamed adminSubPage to currentAdminView to better reflect its purpose
  const [currentAdminView, setCurrentAdminView] = useState(''); 
  const [globalSalesCsvInput, setGlobalSalesCsvInput] = useState(''); // State for Global Sales CSV input
  const [globalSalesUploadMessage, setGlobalSalesUploadMessage] = useState(''); // Message for global sales upload
  const [globalSalesUploading, setGlobalSalesUploading] = useState(false); // Loading state for global sales upload

  const [monthlyBonusCsvInput, setMonthlyBonusCsvInput] = useState(''); // State for Monthly Bonus CSV input
  const [monthlyBonusUploadMessage, setMonthlyBonusUploadMessage] = useState(''); // Message for monthly bonus upload
  const [monthlyBonusUploading, setMonthlyBonusUploading] = useState(false); // Loading state for monthly bonus upload

  // Define users who are allowed to perform the global data dump (global sales import)
  const allowedGlobalDataDumpUsers = ["SatishD", "AshlieT"];
  const canPerformGlobalDataDump = currentUser?.role === 'admin' && allowedGlobalDataDumpUsers.includes(currentUser.username);

  // Define users who are allowed to perform the monthly bonus data import
  const allowedMonthlyBonusImportUsers = ["SatishD", "AshlieT"];
  const canPerformMonthlyBonusImport = currentUser?.role === 'admin' && allowedMonthlyBonusImportUsers.includes(currentUser.username);

  // Admins who can access User Management
  const allowedUserManagementUsers = ["SatishD", "AshlieT"];
  const canAccessUserManagement = currentUser?.role === 'admin' && allowedUserManagementUsers.includes(currentUser.username);


  // Access check: Only users with role 'admin' can view this page
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-8 bg-white rounded-lg shadow-md text-center text-red-600 text-xl font-semibold">
        Access Denied: You must be an administrator to view this page.
      </div>
    );
  }

  // Helper function to normalize entity names for Firestore document IDs
  // This must be consistent with how the MonthlyBonusReport constructs its paths.
  // Using the universal `getNormalizedEntityName` function for consistency
  const normalizedEntity = getNormalizedEntityName(selectedEntity);


  // Function to parse CSV data for Global Sales Data Import
  const parseCsv = (csvString) => {
    // Define the expected headers and their normalized keys
    const fixedHeaders = [
        "Month", "Location", "Reimbursement", "COGS", "Net",
        "Commission", "Entity", "Associated Rep Name", "Username"
    ].map(h => h.toLowerCase().replace(/\s/g, '')); // Pre-normalize expected keys

    const lines = csvString.trim().split(/\r?\n/);
    if (lines.length === 0) {
      throw new Error("CSV data is empty.");
    }

    const records = [];
    // Determine fieldsPerRecord based on fixedHeaders length for validation
    const fieldsPerRecord = fixedHeaders.length; 

    // Process data lines (skip header if present)
    // Simple split by comma, handling quoted fields for robust parsing.
    const csvRows = lines.map(line => {
        // Split by comma, but not if the comma is inside double quotes.
        // This regex ensures commas within quoted fields are ignored.
        const rowData = line.match(/(?:[^,"]+|"[^"]*")+/g);
        return rowData ? rowData.map(field => field.trim().replace(/^"|"$/g, '').replace(/""/g, '"')) : [];
    }).filter(row => row.length > 0); // Filter out empty lines

    if (csvRows.length === 0) {
      throw new Error("No valid data rows found in CSV after parsing.");
    }
    
    // Assume first row is header for robust parsing of headers
    const headerRow = csvRows[0];
    const actualHeaders = headerRow.map(h => h.toLowerCase().replace(/\s/g, ''));

    // Check if actual headers match fixed headers
    const headerMatch = fixedHeaders.every(h => actualHeaders.includes(h));
    if (!headerMatch) {
      throw new Error("CSV headers do not match expected format. Expected: " + fixedHeaders.join(', ') + ". Found: " + actualHeaders.join(', '));
    }

    const dataRows = csvRows.slice(1); // Skip header row for data parsing

    dataRows.forEach((recordFields, recordIndex) => {
        // Find the correct index for each field based on `actualHeaders`
        const monthIndex = actualHeaders.indexOf('month');
        const locationIndex = actualHeaders.indexOf('location');
        const reimbursementIndex = actualHeaders.indexOf('reimbursement');
        const cogsIndex = actualHeaders.indexOf('cogs');
        const netIndex = actualHeaders.indexOf('net');
        const commissionIndex = actualHeaders.indexOf('commission');
        const entityIndex = actualHeaders.indexOf('entity');
        const associatedRepNameIndex = actualHeaders.indexOf('associated rep name');
        const usernameIndex = actualHeaders.indexOf('username');

        // Basic validation for number of fields (optional, but good practice)
        if (recordFields.length < fieldsPerRecord) { // Check if enough fields exist
            console.warn(`Skipping malformed record at row ${recordIndex + 2} (1-indexed, including header): expected at least ${fieldsPerRecord} fields, got ${recordFields.length}. Data: "${recordFields.join(',')}"`);
            return;
        }


        const row = {
          month: recordFields[monthIndex] || '',
          location: recordFields[locationIndex] || '',
          reimbursement: parseFloat(recordFields[reimbursementIndex]) || 0,
          cogs: parseFloat(recordFields[cogsIndex]) || 0,
          net: parseFloat(recordFields[netIndex]) || 0,
          commission: parseFloat(recordFields[commissionIndex]) || 0,
          entity: recordFields[entityIndex] || '',
          associatedrepname: recordFields[associatedRepNameIndex] || '',
          username: recordFields[usernameIndex] || '',
        };
        records.push(row);
    });

    if (records.length === 0) {
        throw new Error("No valid data records could be parsed from the CSV. Please ensure your CSV has at least one complete row of data matching the expected format.");
    }
    return records;
  };


  // Function to handle CSV data upload to Firestore for Global Sales Data (replaces all)
  const handleUploadGlobalSalesData = async () => {
    if (!db || !auth || !auth.currentUser || !isAuthReady || !appId) {
      setGlobalSalesUploadMessage("Error: Database, authentication, or application ID not ready/available. Please wait for authentication to complete or check your Firebase setup.");
      return;
    }

    if (!canPerformGlobalDataDump) {
      setGlobalSalesUploadMessage("Access Denied: You do not have permission to upload global sales data.");
      return;
    }

    if (!globalSalesCsvInput.trim()) {
      setGlobalSalesUploadMessage("Please paste CSV data into the text area.");
      return;
    }

    setGlobalSalesUploading(true);
    setGlobalSalesUploadMessage("Uploading data...");

    try {
      const parsedData = parseCsv(globalSalesCsvInput);
      if (parsedData.length === 0) {
        setGlobalSalesUploadMessage("No valid data found in CSV to upload.");
        setGlobalSalesUploading(false);
        return;
      }

      // --- 1. Process and upload Sales Reports ---
      const salesCollectionRef = collection(db, `artifacts/${appId}/public/data/salesReports`);
      
      // Clear all existing sales data
      const existingSalesDocs = await getDocs(query(salesCollectionRef));
      const deleteSalesPromises = existingSalesDocs.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteSalesPromises);
      console.log("Cleared existing sales data.");

      // Add new sales data
      const addSalesPromises = parsedData.map(item =>
        addDoc(salesCollectionRef, {
          ...item,
          uploadedBy: auth.currentUser.uid,
          uploadedAt: serverTimestamp(),
        })
      );
      await Promise.all(addSalesPromises);
      console.log(`Successfully uploaded ${parsedData.length} sales records.`);

      // --- 2. Aggregate and upload Monthly Bonus data ---
      const monthlyBonusAggregates = {}; // Stores { "Entity_Month": { Month, BonusAmount, Participants, Entity } }
      const uniqueEntities = new Set(); // To keep track of entities to clear their bonus subcollections

      parsedData.forEach(item => {
        const month = item.month; // Assuming 'month' is the normalized field from CSV
        const entity = item.entity; // Assuming 'entity' is the normalized field from CSV
        const commission = item.commission || 0; // Ensure commission is a number, default to 0

        if (month && entity) {
          const key = `${entity}_${month}`;
          uniqueEntities.add(entity); // Add entity to the set

          if (!monthlyBonusAggregates[key]) {
            monthlyBonusAggregates[key] = {
              Month: month,
              BonusAmount: 0,
              Performance: "Total Bonuses Due to Members", // Default - Updated text
              Participants: new Set(), // Use a Set to collect unique usernames
              Entity: entity, // Store original entity name
            };
          }
          monthlyBonusAggregates[key].BonusAmount += commission;
          
          // Add usernames to participants set (split by ,, if multiple)
          if (item.username) {
            item.username.split(',,').forEach(user => {
              if (user.trim()) {
                monthlyBonusAggregates[key].Participants.add(user.trim());
              }
            });
          }
        }
      });

      // Convert Set of participants to array for Firestore storage
      const bonusDataToUpload = Object.values(monthlyBonusAggregates).map(bonus => ({
        ...bonus,
        Participants: Array.from(bonus.Participants).join(', '), // Convert Set to comma-separated string
      }));

      // Clear existing monthly bonus data for the *affected entities* only
      for (const entityName of uniqueEntities) {
        const normalizedEntity = getNormalizedEntityName(entityName); // Use the universal normalization
        const bonusSubCollectionRef = collection(db, `artifacts/${appId}/public/data/monthlyBonuses/${normalizedEntity}/bonus_months`);
        const existingBonusDocs = await getDocs(query(bonusSubCollectionRef));
        const deleteBonusPromises = existingBonusDocs.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deleteBonusPromises);
        console.log(`Cleared existing monthly bonus data for entity: ${entityName}`);
      }


      // Upload new monthly bonus data
      const addBonusPromises = bonusDataToUpload.map(bonus => {
        const normalizedEntityForBonus = getNormalizedEntityName(bonus.Entity); // Use the universal normalization
        const bonusSubCollectionRef = collection(db, `artifacts/${appId}/public/data/monthlyBonuses/${normalizedEntityForBonus}/bonus_months`);
        return addDoc(bonusSubCollectionRef, {
          ...bonus, // Month, BonusAmount, Performance, Participants
          uploadedBy: auth.currentUser.uid,
          uploadedAt: serverTimestamp(),
        });
      });
      await Promise.all(addBonusPromises);
      console.log(`Successfully uploaded ${bonusDataToUpload.length} monthly bonus records.`);

      setGlobalSalesUploadMessage(`Successfully uploaded ${parsedData.length} sales records and ${bonusDataToUpload.length} monthly bonus records.`);
      setGlobalSalesCsvInput(''); // Clear input after successful upload

    } catch (error) {
      console.error("Error uploading sales/bonus data:", error);
      setGlobalSalesUploadMessage(`Error uploading data: ${error.message}`);
    } finally {
      setGlobalSalesUploading(false);
    }
  };

  // Function to parse CSV for Monthly Bonus Data Import
  const parseMonthlyBonusCsv = (csvString) => {
    const fixedHeaders = ["Month", "Bonus Amount", "Performance", "Participants"]
      .map(h => h.toLowerCase().replace(/\s/g, '')); // Normalize expected keys

    const lines = csvString.trim().split(/\r?\n/);
    if (lines.length === 0) {
      throw new Error("CSV data is empty.");
    }

    const records = [];
    const fieldsPerRecord = fixedHeaders.length;

    const csvRows = lines.map(line => {
        const rowData = line.match(/(?:[^,"]+|"[^"]*")+/g);
        return rowData ? rowData.map(field => field.trim().replace(/^"|"$/g, '').replace(/""/g, '"')) : [];
    }).filter(row => row.length > 0);

    if (csvRows.length === 0) {
        throw new Error("No valid data rows found in CSV after parsing.");
    }

    const headerRow = csvRows[0];
    const actualHeaders = headerRow.map(h => h.toLowerCase().replace(/\s/g, ''));

    const headerMatch = fixedHeaders.every(h => actualHeaders.includes(h));
    if (!headerMatch) {
      throw new Error("CSV headers do not match expected format. Expected: " + fixedHeaders.join(', ') + ". Found: " + actualHeaders.join(', '));
    }

    const dataRows = csvRows.slice(1);

    dataRows.forEach((recordFields, recordIndex) => {
        // Find the correct index for each field based on `actualHeaders`
        const monthIndex = actualHeaders.indexOf('month');
        const bonusAmountIndex = actualHeaders.indexOf('bonus amount');
        const performanceIndex = actualHeaders.indexOf('performance');
        const participantsIndex = actualHeaders.indexOf('participants');

        // Basic validation for number of fields
        if (recordFields.length < fieldsPerRecord) {
            console.warn(`Skipping malformed record at row ${recordIndex + 2} (1-indexed, including header): expected at least ${fieldsPerRecord} fields, got ${recordFields.length}. Data: "${recordFields.join(',')}"`);
            return;
        }

        const row = {};
        row.Month = recordFields[monthIndex] || '';
        row.BonusAmount = parseFloat(recordFields[bonusAmountIndex]) || 0;
        row.Performance = recordFields[performanceIndex] || '';
        row.Participants = recordFields[participantsIndex] || '';
        
        records.push(row);
    });

    if (records.length === 0) {
      throw new Error("No valid monthly bonus data records could be parsed from the CSV. Ensure data matches 'Month', 'Bonus Amount', 'Performance', 'Participants' format.");
    }
    return records;
  };

  // Function to handle CSV data upload for specific Monthly Bonus data
  const handleUploadMonthlyBonusData = async () => {
    if (!db || !auth || !auth.currentUser || !isAuthReady || !appId) {
      setMonthlyBonusUploadMessage("Error: Database, authentication, or application ID not ready/available.");
      return;
    }

    if (!canPerformMonthlyBonusImport) { // Added permission check
        setMonthlyBonusUploadMessage("Access Denied: You do not have permission to upload monthly bonus data.");
        return;
    }

    if (!selectedEntity) {
      setMonthlyBonusUploadMessage("Please select an entity first to upload monthly bonus data.");
      return;
    }

    if (!monthlyBonusCsvInput.trim()) {
      setMonthlyBonusUploadMessage("Please paste CSV data into the text area.");
      return;
    }

    setMonthlyBonusUploading(true);
    setMonthlyBonusUploadMessage("Uploading data...");

    try {
      const parsedData = parseMonthlyBonusCsv(monthlyBonusCsvInput);
      if (parsedData.length === 0) {
        setMonthlyBonusUploadMessage("No valid data found in CSV to upload.");
        setMonthlyBonusUploading(false);
        return;
      }

      const normalizedEntity = getNormalizedEntityName(selectedEntity);
      const bonusSubCollectionRef = collection(db, `artifacts/${appId}/public/data/monthlyBonuses/${normalizedEntity}/bonus_months`);

      // Clear existing monthly bonus data for *this specific entity*
      const existingBonusDocs = await getDocs(query(bonusSubCollectionRef));
      const deleteBonusPromises = existingBonusDocs.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteBonusPromises);
      console.log(`Cleared existing monthly bonus data for entity: ${selectedEntity}`);

      // Add new monthly bonus data for this entity
      const addBonusPromises = parsedData.map(bonus =>
        addDoc(bonusSubCollectionRef, {
          ...bonus, // Month, BonusAmount, Performance, Participants
          uploadedBy: auth.currentUser.uid,
          uploadedAt: serverTimestamp(),
        })
      );
      await Promise.all(addBonusPromises);
      console.log(`Successfully uploaded ${parsedData.length} monthly bonus records for ${selectedEntity}.`);

      setMonthlyBonusUploadMessage(`Successfully uploaded ${parsedData.length} monthly bonus records for ${selectedEntity}.`);
      setMonthlyBonusCsvInput(''); // Clear input after successful upload

    } catch (error) {
      console.error("Error uploading monthly bonus data:", error);
      setMonthlyBonusUploadMessage(`Error uploading data: ${error.message}`);
    } finally {
      setMonthlyBonusUploading(false);
    }
  };


  // Filter accessible entities based on the current admin user's entities
  const accessibleEntities = Object.entries(currentUser.entities || {})
    .filter(([, value]) => value === "Yes")
    .map(([key]) => key);

  return (
    <div className="p-8 bg-white rounded-lg shadow-md w-full min-h-[500px]"> {/* Standardized height/width */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

      {/* Confidentiality Notice */}
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6 shadow-sm">
        <p className="font-semibold text-lg mb-2">Dear Members,</p>
        <p className="text-base mb-3">
          This information is intended solely for the members of First Bio Lab, First Bio Genetics, First Bio Lab of Illinois, AIM Laboratories, AMICO Dx, Enviro Labs and STAT Labs. It contains privileged, proprietary, and confidential information intended for internal use only.
        </p>
        <p className="text-base font-semibold mb-2">We kindly remind all members that:</p>
        <ul className="list-disc list-inside text-sm space-y-1 mb-3">
          <li>The contents of this notice, and any attached or referenced documents, are strictly confidential.</li>
          <li>Redistribution, disclosure, or discussion of this information with any party outside of approved internal recipients is strictly prohibited without prior written authorization.</li>
          <li>Breach of confidentiality may result in disciplinary action, termination of membership rights, or legal consequences.</li>
        </ul>
        <p className="text-base mb-3">
          We appreciate your cooperation in maintaining the integrity and privacy of sensitive operational and financial matters. Please direct any questions or concerns regarding this notice to Nick Thomas <a href="mailto:nick@jnicholsonlawgroup.com" className="text-blue-600 hover:underline">nick@jnicholsonlawgroup.com</a>.
        </p>
        <p className="text-base font-semibold">Thank you for your continued commitment.</p>
      </div>

      {/* MODIFICATION: Show dropdown to ANY admin with assigned entities */}
      {accessibleEntities.length > 0 && currentUser.role === 'admin' ? (
        <div className="mb-6">
          <label htmlFor="entity-select" className="block text-xl font-medium text-gray-700 mb-2">
            Select Entity:
          </label>
          <select
            id="entity-select"
            className="mt-1 block w-full md:w-1/2 lg:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-lg"
            value={selectedEntity}
            onChange={(e) => {
              setSelectedEntity(e.target.value);
              // When entity changes, reset current view to avoid stale data display
              setCurrentAdminView('');
            }}
          >
            <option value="">-- Please select an entity --</option>
            {accessibleEntities.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-gray-600 text-lg mb-6">
          Your admin account does not have entity-specific report access from this view.
        </p>
      )}
      {/* MODIFICATION END */}

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Admin Tools & Reports</h3>
        <div className="flex flex-wrap gap-4 mb-6">
          {/* MODIFICATION: The buttons inside here now depend on selectedEntity */}
          {selectedEntity && (
            <>
              <button
                onClick={() => setCurrentAdminView('financials')}
                className={`px-6 py-3 rounded-md text-lg font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 ${
                  currentAdminView === 'financials' ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                View Financials
              </button>
              <button
                onClick={() => setCurrentAdminView('monthly-bonus-view')}
                className={`px-6 py-3 rounded-md text-lg font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 ${
                  currentAdminView === 'monthly-bonus-view' ? 'bg-green-600 text-white shadow-lg' : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                View Monthly Bonus
              </button>
              {canPerformMonthlyBonusImport && ( // Only show button for SatishD and AshlieT
                <button
                  onClick={() => setCurrentAdminView('monthly-bonus-import')}
                  className={`px-6 py-3 rounded-md text-lg font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 ${
                    currentAdminView === 'monthly-bonus-import' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                  }`}
                >
                  Monthly Bonus Data Import
                </button>
              )}
            </>
          )}

          {canPerformGlobalDataDump && ( // This button does NOT require entity selection
            <button
              onClick={() => setCurrentAdminView('global-sales-import')}
              className={`px-6 py-3 rounded-md text-lg font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 ${
                currentAdminView === 'global-sales-import' ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              }`}
            >
              Global Sales Data Import
            </button>
          )}

          {canAccessUserManagement && ( // New button for User Management
            <button
              onClick={() => setCurrentAdminView('user-management')}
              className={`px-6 py-3 rounded-md text-lg font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 ${
                currentAdminView === 'user-management' ? 'bg-yellow-600 text-white shadow-lg' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              User Management
            </button>
          )}
        </div>

        {currentAdminView === 'financials' && selectedEntity && <FinancialsReport entity={selectedEntity} />}
        {currentAdminView === 'monthly-bonus-view' && selectedEntity && <MonthlyBonusReport entity={selectedEntity} />}
        
        {currentAdminView === 'monthly-bonus-import' && selectedEntity && canPerformMonthlyBonusImport && ( // Render section only if allowed
            <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Upload Monthly Bonus Data for {selectedEntity} (CSV)</h3>
                <textarea
                    className="w-full p-2 border border-gray-300 rounded-md mb-4 font-mono text-sm"
                    rows="10"
                    placeholder={`Paste CSV data here, including headers.
Example:
"Month","Bonus Amount","Performance","Participants"
"January 2025","15000.00","Excellent","John Doe, Jane Smith"
"February 2025","12500.50","Good","Alice Johnson"
`}
                    value={monthlyBonusCsvInput}
                    onChange={(e) => setMonthlyBonusCsvInput(e.target.value)}
                ></textarea>
                <button
                    onClick={handleUploadMonthlyBonusData}
                    disabled={monthlyBonusUploading || !db || !auth || !auth.currentUser || !isAuthReady || !selectedEntity || !canPerformMonthlyBonusImport} // Disable if not allowed
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {monthlyBonusUploading ? 'Uploading...' : 'Upload Monthly Bonus Data'}
                </button>
                {monthlyBonusUploadMessage && (
                    <p className={`mt-4 text-sm ${monthlyBonusUploadMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                        {monthlyBonusUploadMessage}
                    </p>
                )}
                <p className="text-sm text-gray-600 mt-2">
                    Note: Uploading data here will **replace all existing monthly bonus data for {selectedEntity}** in the database. It will **not** affect sales data or bonus data for other entities.
                </p>
            </div>
        )}

        {currentAdminView === 'global-sales-import' && canPerformGlobalDataDump && (
            <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Upload Global Sales Data (CSV)</h3>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md mb-4 font-mono text-sm"
                rows="10"
                placeholder={`Paste CSV data here, including headers.
Example:
"Month","Location","Reimbursement","COGS","Net","Commission","Entity","Associated Rep Name","Username"
"April 2025","BANYAN HEARTLAND - CLIN","525.22","557.566","-32.346","-16.173","AIM Laboratories LLC","HCM Crew LLC/ 360 Health","JayM,,Omar"
"January 2025","TRIBE RECOVERY HOMES","108514.53","33000","75514.53","22654.36","AIM Laboratories LLC","GD Laboratory","SatishD,,ACG"
`}
                value={globalSalesCsvInput}
                onChange={(e) => setGlobalSalesCsvInput(e.target.value)}
              ></textarea>
              <button
                onClick={handleUploadGlobalSalesData}
                disabled={globalSalesUploading || !db || !auth || !auth.currentUser || !isAuthReady || !canPerformGlobalDataDump} // Disable if not allowed
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {globalSalesUploading ? 'Uploading...' : 'Upload Global Sales Data'}
              </button>
              {globalSalesUploadMessage && (
                <p className={`mt-4 text-sm ${globalSalesUploadMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {globalSalesUploadMessage}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Note: Uploading new data via this section will **replace all existing sales data** and will **update monthly bonus data for all entities included in the CSV** in the database for this application.
                <br/>
                **Important:** Please ensure your CSV data is correctly formatted with each record on a new line and the correct number of fields per record.
              </p>
            </div>
          )}

          {currentAdminView === 'user-management' && canAccessUserManagement && <UserManagement />}
      </div>
    </div>
  );
};

// --- ContactUsModal Component ---
const ContactUsModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState(''); // 'success', 'error', ''

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitStatus('');

    if (!name || !email || !subject || !message) {
      setSubmitStatus('error');
      return;
    }

    const formData = {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    };

    console.log("Contact Us Form Submitted:", formData);
    // In a real application, you would send this 'formData' to your backend
    // using fetch or axios, for example:
    // fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData),
    // })
    // .then(response => response.json())
    // .then(data => {
    //   console.log('Success:', data);
    //   setSubmitStatus('success');
    //   // Clear form fields
    //   setName('');
    //   setEmail('');
    //   setSubject('');
    //   setMessage('');
    // })
    // .catch((error) => {
    //   console.error('Error:', error);
    //   setSubmitStatus('error');
    // });

    setSubmitStatus('success'); // Simulate success for demonstration
    // Clear form fields after successful (simulated) submission
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto relative transform transition-all sm:my-8 sm:w-full">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Contact Us</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700">Your Name</label>
            <input
              type="text"
              id="contact-name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">Your Email</label>
            <input
              type="email"
              id="contact-email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              id="contact-subject"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="contact-message"
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>

          {submitStatus === 'success' && (
            <p className="text-green-600 text-sm font-medium text-center">
              Thank you for your message! We will get back to you shortly.
            </p>
          )}
          {submitStatus === 'error' && (
            <p className="text-red-600 text-sm font-medium text-center">
              Please fill in all required fields.
            </p>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- ForgotPasswordModal Component ---
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate sending a password reset email
      // In a real application, you would use Firebase Auth:
      // const auth = getAuth();
      // await sendPasswordResetEmail(auth, email);
      console.log(`Simulating password reset email sent to: ${email}`);
      setMessage('If an account with that email exists, a password reset link has been sent.');
      setEmail(''); // Clear email field after submission
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setMessage('Error sending password reset email. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto relative transform transition-all sm:my-8 sm:w-full">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Forgot Password</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">
              Enter your email address
            </label>
            <input
              type="email"
              id="forgot-email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
            />
          </div>

          {message && (
            <p className={`text-sm font-medium text-center ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Dashboard ---
const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('patient-portal');
  const [showContactModal, setShowContactModal] = useState(false); // New state for Contact Us modal
  const [showCptFinder, setShowCptFinder] = useState(false); // State for CPT Finder Modal

  // Define admin users with full access to patient and physician portals
  const fullAccessAdminsUsernames = ["SatishD", "AshlieT", "MinaK", "JayM", "AghaA"];

  // Determine if the current user has full portal access based on the specific username list
  const hasFullPortalAccess = fullAccessAdminsUsernames.includes(currentUser?.username);

  // Set default page on initial load or user change
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'patient') {
        setCurrentPage('patient-portal');
      } else if (currentUser.role === 'physician') {
        setCurrentPage('physician-provider');
      } else if (currentUser.role === 'admin') {
        // Admins with full portal access go to Patient Portal by default
        if (hasFullPortalAccess) {
          setCurrentPage('patient-portal');
        } else {
          // Other admins go to Admin page
          setCurrentPage('admin');
        }
      } else if (currentUser.role === 'sales') {
        setCurrentPage('sales-marketing'); // Dedicated sales user like KeenanW
      } else {
        setCurrentPage('patient-portal'); // Fallback for any unexpected role
      }
    }
  }, [currentUser, hasFullPortalAccess]); // Depend on currentUser and its full access status


  const renderContent = () => {
    switch (currentPage) {
      case 'patient-portal':
        return <PatientPortal />;
      case 'physician-provider':
        return <PhysicianProvider />;
      case 'sales-marketing':
        return <SalesMarketing />;
      case 'admin':
        return <AdminPage />;
      default:
        // This default should ideally be caught by useEffect, but as a safeguard
        return (
          <div className="p-8 bg-white rounded-lg shadow-md w-full min-h-[500px]"> {/* Standardized height/width */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome!</h2>
            <p className="text-lg text-gray-700">Please select an option from the navigation.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg p-6 flex flex-col md:flex-row justify-between items-center rounded-b-xl">
        {/* Updated logo src to new file name */}
        <div className="flex items-center mb-4 md:mb-0">
          <img src="/Logo.png" alt="One Health Holdings Logo" className="h-16 md:h-20 w-auto object-contain mr-4" />
          <h1 className="text-4xl font-extrabold text-white">
            Healthcare Portal
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-white text-lg font-medium">
            Welcome, {currentUser?.username || currentUser?.lastName || currentUser?.email || 'Guest'}!
          </span>
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Removed px-4 from this div to allow full width for content */}
      <div className="flex flex-1 flex-col lg:flex-row py-6 space-y-6 lg:space-y-0 lg:space-x-6">
        <nav className="bg-white p-6 rounded-lg shadow-xl w-full lg:w-64 flex flex-col space-y-4">
          {/* Patient Portal button: Visible to actual patients and full portal access admins */}
          {(currentUser?.role === 'patient' || hasFullPortalAccess) && (
            <button
              onClick={() => setCurrentPage('patient-portal')}
              className={`px-4 py-3 text-left text-lg font-medium rounded-md transition-colors duration-200 ${
                currentPage === 'patient-portal' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Patient Portal
            </button>
          )}

          {/* Physician/Provider button: Visible to actual physicians and full portal access admins */}
          {(currentUser?.role === 'physician' || hasFullPortalAccess) && (
            <button
              onClick={() => setCurrentPage('physician-provider')}
              className={`px-4 py-3 text-left text-lg font-medium rounded-md transition-colors duration-200 ${
                currentPage === 'physician-provider' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Physician/Provider
            </button>
          )}

          {/* Sales & Marketing button: Visible to all admins and sales users */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'sales') && (
            <button
              onClick={() => setCurrentPage('sales-marketing')}
              className={`px-4 py-3 text-left text-lg font-medium rounded-md transition-colors duration-200 ${
                currentPage === 'sales-marketing' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Sales & Marketing
            </button>
          )}

          {/* Admin button: Visible only to admin users */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setCurrentPage('admin')}
              className={`px-4 py-3 text-left text-lg font-medium rounded-md transition-colors duration-200 ${
                currentPage === 'admin' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Admin
            </button>
          )}

          {/* New CPT Code Finder Button */}
          <button
            onClick={() => setShowCptFinder(true)}
            className="px-4 py-3 text-left text-lg font-medium rounded-md transition-colors duration-200 text-gray-700 hover:bg-gray-100"
          >
            CPT Code Finder
          </button>

          {/* New Contact Us Button */}
          <button
            onClick={() => setShowContactModal(true)}
            className="px-4 py-3 text-left text-lg font-medium rounded-md transition-colors duration-200 text-gray-700 hover:bg-gray-100"
          >
            Contact Us
          </button>
        </nav>

        <main className="flex-1 bg-white p-6 rounded-lg shadow-xl flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
          <div className="flex-grow">
            {renderContent()}
          </div>
          <div className="lg:w-1/3"> {/* Adjust width as needed, e.g., lg:w-1/4 */}
            <RecentActivityFeed />
          </div>
        </main>
      </div>

      {/* Render ContactUsModal */}
      <ContactUsModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
      {/* Render CPTCodeFinder as a modal */}
      <CptCodeFinder isOpen={showCptFinder} onClose={() => setShowCptFinder(false)} />
    </div>
  );
}

// AuthContent component will consume the context and conditionally render LoginPage or Dashboard
function AuthContent() {
  const { currentUser, isAuthReady, errorMessage, showModal, closeModal } = useAuth();

  // If not auth ready, show a loading message
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-xl">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-blue-200">Loading application and authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Conditionally show error modal if Firebase init failed AND auth is ready (meaning we've checked) */}
      {showModal && (errorMessage.includes("Firebase configuration is incomplete") || errorMessage.includes("Firebase initialization failed")) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-auto text-center">
              <h3 className="text-xl font-semibold text-red-600 mb-4">Application Error</h3>
              <p className="text-gray-700 mb-6">{errorMessage}</p>
              <button
                onClick={closeModal}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

      {!currentUser ? (
        <>
          {/* Left section: Image background */}
          <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden bg-gray-900">
            <img
              src="/DNA-helix-concept.jpg"
              alt="DNA helix background for One Health Holdings"
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            {/* You can add content over the image if needed, like a logo or text */}
            <div className="relative z-10 p-8 text-white text-center">
              {/* Optional: Add text or logo over the image if it fits the design */}
              {/* <h2 className="text-5xl font-bold">One Health Holdings</h2>
              <p className=\"mt-4 text-xl\">Connecting Healthcare, Empowering Lives.</p> */}<h2 className="text-5xl font-bold">One Health Holdings</h2><p className="text-lg mt-4">Connecting Healthcare, Empowering Lives.</p>
            </div>
          </div>

          {/* Right section: Login Form */}
          <div className="flex-1 flex items-center justify-center bg-gray-900 p-4 sm:p-6 md:p-8">
            <LoginPage />
          </div>
        </>
      ) : (
        <Dashboard />
      )}
    </div>
  );
}

// Main App component
export default function App() {
  return (
    <AuthProvider>
      <AuthContent />
    </AuthProvider>
  );
}
