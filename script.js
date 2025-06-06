// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB83lU3shdek0MYtvuT9wgdFvGWLaltWXc",
    authDomain: "childpre0606.firebaseapp.com",
    projectId: "childpre0606",
    storageBucket: "childpre0606.firebasestorage.app",
    messagingSenderId: "963681190468",
    appId: "1:963681190468:web:0f78a942deed663dadf211",
    measurementId: "G-BJBW1V8FRR"
};

// Initialize Firebase
let db = null;
let auth = null;
let isFirebaseEnabled = false;
let isAdminAuthenticated = false;
let currentUser = null;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    isFirebaseEnabled = true;
    console.log('Firebase connected successfully!');
    
    // Listen for authentication state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            isAdminAuthenticated = true;
            document.getElementById('auth-status').style.display = 'block';
            document.getElementById('auth-status').textContent = `Logged in as ${user.email}`;
            closeLoginModal();
        } else {
            currentUser = null;
            isAdminAuthenticated = false;
            document.getElementById('auth-status').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'none';
        }
    });
} catch (error) {
    console.error('Firebase initialization failed:', error);
    console.log('Falling back to local storage for demo');
}

// Game Data
const gameData = {
    questions: [
        {
            title: "Team Collaboration",
            scenario: {
                title: "Staff Meeting Participation",
                description: "During team meetings, what type of contribution do you value most from teaching staff?"
            },
            options: [
                {
                    text: "Data-Driven Insights",
                    description: "Shares student progress data and assessment observations",
                    quality: "analytical"
                },
                {
                    text: "Creative Solutions",
                    description: "Proposes innovative teaching methods and activities",
                    quality: "creativity"
                },
                {
                    text: "Collaborative Planning",
                    description: "Actively engages in team curriculum development",
                    quality: "teamwork"
                }
            ]
        },
        {
            title: "Classroom Management",
            scenario: {
                title: "Challenging Student Behavior",
                description: "A teacher reports persistent behavioral issues with a student. What approach do you want them to prioritize?"
            },
            options: [
                {
                    text: "Evidence-Based Interventions",
                    description: "Document behaviors and implement proven strategies",
                    quality: "structure"
                },
                {
                    text: "Individual Relationship Building",
                    description: "Focus on understanding and connecting with the child",
                    quality: "empathy"
                },
                {
                    text: "Family Partnership",
                    description: "Collaborate closely with parents for consistent approach",
                    quality: "communication"
                }
            ]
        },
        {
            title: "Curriculum Implementation",
            scenario: {
                title: "New Program Introduction",
                description: "Your school is implementing a new educational approach. What quality is most important in your teaching staff?"
            },
            options: [
                {
                    text: "Adaptability to Change",
                    description: "Embraces new methods and adjusts teaching style",
                    quality: "flexibility"
                },
                {
                    text: "Professional Development Focus",
                    description: "Actively seeks training and skill improvement",
                    quality: "growth"
                },
                {
                    text: "Consistent Implementation",
                    description: "Reliably follows established protocols and standards",
                    quality: "reliability"
                }
            ]
        },
        {
            title: "Student Assessment",
            scenario: {
                title: "Progress Monitoring",
                description: "How do you prefer your teachers to track and report student development?"
            },
            options: [
                {
                    text: "Comprehensive Documentation",
                    description: "Detailed records of milestones and observations",
                    quality: "documentation"
                },
                {
                    text: "Portfolio-Based Assessment",
                    description: "Creative collection of student work and growth",
                    quality: "creativity"
                },
                {
                    text: "Regular Progress Conferences",
                    description: "Frequent communication with families about development",
                    quality: "communication"
                }
            ]
        },
        {
            title: "Professional Standards",
            scenario: {
                title: "Hiring Decision Factor",
                description: "You have two equally qualified candidates. What additional factor would be the deciding criterion?"
            },
            options: [
                {
                    text: "Advanced Certifications",
                    description: "Additional credentials in special education or languages",
                    quality: "expertise"
                },
                {
                    text: "Leadership Potential",
                    description: "Ability to mentor new staff and lead initiatives",
                    quality: "leadership"
                },
                {
                    text: "Cultural Competency",
                    description: "Experience with diverse populations and inclusive practices",
                    quality: "diversity"
                }
            ]
        }
    ],
    profiles: {
        communication: {
            icon: "💬",
            title: "The Master Communicator",
            description: "You value teachers who excel at building bridges between school, students, and families through effective communication."
        },
        teamwork: {
            icon: "🤝",
            title: "The Collaborative Professional",
            description: "You prioritize teachers who work seamlessly with colleagues and contribute actively to your school's team culture."
        },
        creativity: {
            icon: "🎨",
            title: "The Innovation Catalyst",
            description: "You seek teachers who bring fresh ideas, creative solutions, and innovative approaches to education."
        },
        structure: {
            icon: "📊",
            title: "The Systematic Educator",
            description: "You value teachers who implement evidence-based practices and maintain consistent, structured approaches."
        },
        empathy: {
            icon: "💖",
            title: "The Relationship Builder",
            description: "You prioritize teachers who form deep connections with students and understand individual needs."
        },
        leadership: {
            icon: "⭐",
            title: "The Future Leader",
            description: "You seek teachers with leadership potential who can grow within your organization and mentor others."
        },
        flexibility: {
            icon: "🔄",
            title: "The Adaptable Professional",
            description: "You value teachers who embrace change and can pivot effectively as educational needs evolve."
        },
        growth: {
            icon: "📈",
            title: "The Lifelong Learner",
            description: "You prioritize teachers committed to continuous professional development and skill enhancement."
        }
    }
};

// Game State
let currentQuestion = 0;
let answers = [];
let qualityScores = {};

// Core Game Functions
function startGame() {
    showScreen('question-screen');
    currentQuestion = 0;
    answers = [];
    qualityScores = {};
    loadQuestion();
}

function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function loadQuestion() {
    const question = gameData.questions[currentQuestion];
    
    document.getElementById('question-title').textContent = question.title;
    document.getElementById('scenario-title').textContent = question.scenario.title;
    document.getElementById('scenario-description').textContent = question.scenario.description;
    document.getElementById('question-counter').textContent = `Question ${currentQuestion + 1} of ${gameData.questions.length}`;
    
    const progress = ((currentQuestion + 1) / gameData.questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.onclick = () => selectOption(index);
        optionElement.innerHTML = `
            <h4>${option.text}</h4>
            <p>${option.description}</p>
        `;
        optionsContainer.appendChild(optionElement);
    });
    
    document.getElementById('prev-btn').style.display = currentQuestion > 0 ? 'block' : 'none';
    document.getElementById('next-btn').disabled = true;
}

function selectOption(optionIndex) {
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    options[optionIndex].classList.add('selected');
    
    const question = gameData.questions[currentQuestion];
    const selectedOption = question.options[optionIndex];
    answers[currentQuestion] = selectedOption;
    
    document.getElementById('next-btn').disabled = false;
}

function nextQuestion() {
    if (currentQuestion < gameData.questions.length - 1) {
        currentQuestion++;
        loadQuestion();
    } else {
        calculateResults();
        showScreen('results-screen');
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
        
        if (answers[currentQuestion]) {
            const question = gameData.questions[currentQuestion];
            const selectedIndex = question.options.findIndex(opt => opt === answers[currentQuestion]);
            if (selectedIndex !== -1) {
                document.querySelectorAll('.option')[selectedIndex].classList.add('selected');
                document.getElementById('next-btn').disabled = false;
            }
        }
    }
}

function calculateResults() {
    qualityScores = {};
    
    answers.forEach(answer => {
        if (answer && answer.quality) {
            qualityScores[answer.quality] = (qualityScores[answer.quality] || 0) + 1;
        }
    });
    
    const topQuality = Object.keys(qualityScores).reduce((a, b) => 
        qualityScores[a] > qualityScores[b] ? a : b
    );
    
    const profile = gameData.profiles[topQuality] || gameData.profiles.communication;
    
    document.getElementById('profile-icon').textContent = profile.icon;
    document.getElementById('profile-title').textContent = profile.title;
    document.getElementById('profile-description').textContent = profile.description;
    
    const qualitiesList = document.getElementById('qualities-list');
    qualitiesList.innerHTML = '';
    
    const sortedQualities = Object.entries(qualityScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4);
    
    sortedQualities.forEach(([quality, score]) => {
        const tag = document.createElement('div');
        tag.className = 'quality-tag';
        tag.textContent = quality.charAt(0).toUpperCase() + quality.slice(1);
        qualitiesList.appendChild(tag);
    });
    
    generateInterviewTips(topQuality);
    saveToHistory(profile, sortedQualities);
    saveToSharedDatabase(profile, sortedQualities, answers);
    loadHistory();
}

function generateInterviewTips(topQuality) {
    const tips = {
        communication: [
            "Ask candidates to describe their parent communication strategies",
            "Request examples of difficult conversations they've navigated",
            "Evaluate their ability to document and report student progress"
        ],
        teamwork: [
            "Inquire about their experience with collaborative curriculum planning",
            "Ask for examples of successful team projects or initiatives",
            "Assess their conflict resolution skills with colleagues"
        ],
        creativity: [
            "Request a sample lesson plan showcasing innovative activities",
            "Ask about their approach to adapting curriculum for different learners",
            "Evaluate their ideas for engaging reluctant students"
        ],
        structure: [
            "Ask about their classroom management philosophy and systems",
            "Request examples of data collection and progress monitoring",
            "Evaluate their experience with evidence-based teaching practices"
        ],
        empathy: [
            "Ask about their approach to supporting struggling students",
            "Request examples of building relationships with challenging children",
            "Evaluate their understanding of trauma-informed practices"
        ],
        leadership: [
            "Inquire about their mentoring or training experience",
            "Ask about initiatives they've led or would like to implement",
            "Assess their vision for professional growth within your organization"
        ],
        flexibility: [
            "Ask about times they've had to adapt quickly to changes",
            "Request examples of modifying approaches based on student needs",
            "Evaluate their openness to feedback and new methodologies"
        ],
        growth: [
            "Inquire about their professional development goals and activities",
            "Ask about recent learning that has changed their practice",
            "Evaluate their commitment to staying current with best practices"
        ]
    };
    
    const tipsList = document.getElementById('interview-tips');
    tipsList.innerHTML = '';
    
    const qualityTips = tips[topQuality] || tips.communication;
    qualityTips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
    });
}

function saveToHistory(profile, qualities) {
    const history = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
    const newEntry = {
        date: new Date().toISOString(),
        profile: profile.title,
        qualities: qualities.map(([quality]) => quality),
        icon: profile.icon
    };
    history.unshift(newEntry);
    localStorage.setItem('assessmentHistory', JSON.stringify(history));
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    const history = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
    
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<p>No previous assessments found.</p>';
        return;
    }

    history.forEach(entry => {
        const date = new Date(entry.date).toLocaleDateString();
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-date">${date}</div>
            <div class="history-profile">${entry.icon} ${entry.profile}</div>
            <div class="history-qualities">
                ${entry.qualities.map(quality => 
                    `<span class="history-quality">${quality.charAt(0).toUpperCase() + quality.slice(1)}</span>`
                ).join('')}
            </div>
        `;
        historyList.appendChild(historyItem);
    });
}

function restartGame() {
    showScreen('start-screen');
}

function shareResults() {
    const profile = document.getElementById('profile-title').textContent;
    const text = `As a school director, I've identified my ideal teacher hiring profile: ${profile}! This assessment helps clarify our staffing priorities.`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Director\'s Ideal Teacher Profile',
            text: text
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Results copied to clipboard!');
        });
    }
}

// Authentication Functions
function toggleAdminPanel() {
    if (!isAdminAuthenticated) {
        showLoginModal();
        return;
    }
    
    const adminPanel = document.getElementById('admin-panel');
    const isVisible = adminPanel.style.display !== 'none';
    adminPanel.style.display = isVisible ? 'none' : 'block';
}

function showLoginModal() {
    document.getElementById('login-modal').style.display = 'block';
    document.getElementById('error-message').textContent = '';
    document.getElementById('success-message').textContent = '';
}

function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('admin-email').value = '';
    document.getElementById('admin-password').value = '';
    document.getElementById('error-message').textContent = '';
    document.getElementById('success-message').textContent = '';
}

function adminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const submitBtn = document.getElementById('login-submit-btn');
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    // Clear previous messages
    errorDiv.textContent = '';
    successDiv.textContent = '';
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    if (isFirebaseEnabled && auth) {
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('Admin logged in successfully');
                successDiv.textContent = 'Login successful!';
                // Modal will close automatically via onAuthStateChanged
            })
            .catch((error) => {
                console.error('Login error:', error);
                errorDiv.textContent = getAuthErrorMessage(error.code);
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            });
    } else {
        // Fallback for demo - simple hardcoded admin
        if (email === 'admin@example.com' && password === 'admin123') {
            isAdminAuthenticated = true;
            document.getElementById('auth-status').style.display = 'block';
            document.getElementById('auth-status').textContent = 'Logged in as Demo Admin';
            closeLoginModal();
            successDiv.textContent = 'Demo login successful!';
        } else {
            errorDiv.textContent = 'Invalid email or password';
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}

function logout() {
    if (isFirebaseEnabled && auth) {
        auth.signOut().then(() => {
            console.log('Admin logged out successfully');
        }).catch((error) => {
            console.error('Logout error:', error);
        });
    } else {
        // Fallback for demo
        isAdminAuthenticated = false;
        document.getElementById('auth-status').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'none';
    }
}

function getAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'No admin account found with this email';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later';
        default:
            return 'Login failed. Please check your credentials';
    }
}

// Admin Functions
function viewAllResults() {
    if (!isAdminAuthenticated) {
        alert('Please login as admin to view results');
        return;
    }
    
    const summaryDiv = document.getElementById('results-summary');
    
    if (isFirebaseEnabled) {
        summaryDiv.innerHTML = '<p>Loading results from database...</p>';
        summaryDiv.style.display = 'block';
        
        db.collection('assessmentResults')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get()
            .then((querySnapshot) => {
                const results = [];
                querySnapshot.forEach((doc) => {
                    results.push(doc.data());
                });
                displayResults(results, summaryDiv);
            })
            .catch((error) => {
                console.error('Error getting results:', error);
                summaryDiv.innerHTML = '<p>Error loading results from database</p>';
            });
    } else {
        const sharedResults = JSON.parse(localStorage.getItem('sharedAssessmentResults') || '[]');
        displayResults(sharedResults, summaryDiv);
    }
}

function displayResults(results, summaryDiv) {
    if (results.length === 0) {
        summaryDiv.innerHTML = '<p>No assessment results found yet.</p>';
        return;
    }

    const profileCounts = {};
    const qualityCounts = {};
    
    results.forEach(result => {
        profileCounts[result.profile] = (profileCounts[result.profile] || 0) + 1;
        if (result.topQualities) {
            result.topQualities.forEach(quality => {
                qualityCounts[quality] = (qualityCounts[quality] || 0) + 1;
            });
        }
    });

    let html = `
        <h5>📈 Results Summary (${results.length} responses)</h5>
        <div style="margin: 15px 0;">
            <strong>Most Common Profiles:</strong><br>
            ${Object.entries(profileCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([profile, count]) => `• ${profile}: ${count} people`)
                .join('<br>')}
        </div>
        <div style="margin: 15px 0;">
            <strong>Top Valued Qualities:</strong><br>
            ${Object.entries(qualityCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([quality, count]) => `• ${quality.charAt(0).toUpperCase() + quality.slice(1)}: ${count} times`)
                .join('<br>')}
        </div>
        <h6>Recent Individual Results:</h6>
    `;

    results.slice(0, 5).forEach(result => {
        const date = new Date(result.timestamp).toLocaleString();
        html += `
            <div class="result-item">
                <strong>${result.profileIcon} ${result.profile}</strong><br>
                <small>${date}</small><br>
                <em>Top qualities: ${(result.topQualities || []).join(', ')}</em>
            </div>
        `;
    });

    summaryDiv.innerHTML = html;
}

function exportData() {
    if (!isAdminAuthenticated) {
        alert('Please login as admin to export data');
        return;
    }
    
    if (isFirebaseEnabled) {
        db.collection('assessmentResults')
            .orderBy('timestamp', 'desc')
            .get()
            .then((querySnapshot) => {
                const results = [];
                querySnapshot.forEach((doc) => {
                    results.push(doc.data());
                });
                downloadCSV(results);
            })
            .catch((error) => {
                console.error('Error exporting data:', error);
                alert('Error exporting data from database');
            });
    } else {
        const results = JSON.parse(localStorage.getItem('sharedAssessmentResults') || '[]');
        downloadCSV(results);
    }
}

function downloadCSV(results) {
    if (results.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = ['Timestamp', 'Profile', 'Top Quality 1', 'Top Quality 2', 'Top Quality 3', 'Session ID'];
    const csvContent = [
        headers.join(','),
        ...results.map(result => [
            result.timestamp,
            `"${result.profile}"`,
            (result.topQualities && result.topQualities[0]) || '',
            (result.topQualities && result.topQualities[1]) || '',
            (result.topQualities && result.topQualities[2]) || '',
            result.sessionId
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function clearAllData() {
    if (!isAdminAuthenticated) {
        alert('Please login as admin to clear data');
        return;
    }
    
    if (confirm('Are you sure you want to clear ALL assessment data? This cannot be undone.')) {
        if (isFirebaseEnabled) {
            console.log('Clearing data from Firestore...');
            
            db.collection('assessmentResults').get()
                .then((querySnapshot) => {
                    console.log(`Found ${querySnapshot.size} documents to delete`);
                    
                    if (querySnapshot.size === 0) {
                        console.log('No documents found in Firestore');
                        alert('No data found in database to clear');
                        return;
                    }
                    
                    const batch = db.batch();
                    querySnapshot.docs.forEach((doc) => {
                        console.log(`Adding document ${doc.id} to deletion batch`);
                        batch.delete(doc.ref);
                    });
                    return batch.commit();
                })
                .then(() => {
                    console.log('Firestore data cleared successfully');
                    localStorage.removeItem('sharedAssessmentResults');
                    localStorage.removeItem('assessmentHistory');
                    document.getElementById('results-summary').style.display = 'none';
                    document.getElementById('results-summary').innerHTML = '';
                    loadHistory();
                    alert('All data cleared successfully from database and local storage');
                })
                .catch((error) => {
                    console.error('Error clearing Firestore data:', error);
                    localStorage.removeItem('sharedAssessmentResults');
                    localStorage.removeItem('assessmentHistory');
                    document.getElementById('results-summary').style.display = 'none';
                    document.getElementById('results-summary').innerHTML = '';
                    loadHistory();
                    alert(`Database deletion failed (${error.code}), but local storage cleared. Error: ${error.message}`);
                });
        } else {
            localStorage.removeItem('sharedAssessmentResults');
            localStorage.removeItem('assessmentHistory');
            document.getElementById('results-summary').style.display = 'none';
            document.getElementById('results-summary').innerHTML = '';
            loadHistory();
            alert('All local data cleared successfully');
        }
    }
}

function saveToSharedDatabase(profile, qualities, userAnswers) {
    const resultData = {
        timestamp: new Date().toISOString(),
        profile: profile.title,
        profileIcon: profile.icon,
        topQualities: qualities.map(([quality]) => quality),
        allAnswers: userAnswers.map(answer => ({
            quality: answer.quality,
            text: answer.text
        })),
        userAgent: navigator.userAgent.substring(0, 100),
        sessionId: generateSessionId()
    };

    if (isFirebaseEnabled) {
        db.collection('assessmentResults').add(resultData)
            .then((docRef) => {
                console.log('Result saved to database with ID:', docRef.id);
            })
            .catch(error => {
                console.error('Error saving to database:', error);
                saveToLocalStorage(resultData);
            });
    } else {
        saveToLocalStorage(resultData);
    }
}

function saveToLocalStorage(resultData) {
    const sharedResults = JSON.parse(localStorage.getItem('sharedAssessmentResults') || '[]');
    sharedResults.push(resultData);
    localStorage.setItem('sharedAssessmentResults', JSON.stringify(sharedResults));
}

function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Initialize when page loads
window.onload = function() {
    loadHistory();
}; 