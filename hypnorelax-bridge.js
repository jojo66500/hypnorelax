/**
 * Hypnorelax - Script de transition amélioré
 * Ce script optimise le passage de la page marketing à l'application
 * et améliore le chargement des ressources
 */

// Configuration
const APP_CONFIG = {
    resourcesLoaded: false,
    appInitialized: false,
    transitionDuration: 800, // ms
    minLoadingTime: 1200, // ms pour montrer l'animation de chargement
    preloadResources: [
        'styles.css',
        'mobile-optimization.css',
        'script.js',
        'mobile-optimization.js'
    ]
};

// Variables globales pour l'application
let allTimeouts = new Set();
let allIntervals = new Set();
let currentPage = 1;
let coherenceTimer;
let coherenceInterval;
let secondsRemaining = 120;

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation de Hypnorelax Bridge...");
    
    // Vérifier les paramètres d'URL pour les raccourcis
    checkUrlParameters();
    
    // Déterminer si nous sommes sur la page marketing ou l'application
    const isMarketingPage = document.querySelector('.hero') !== null;
    
    if (isMarketingPage) {
        console.log("Page marketing détectée, configuration des boutons...");
        
        // Précharger les ressources de l'application en arrière-plan
        preloadAppResources();
        
        // Configurer les boutons de lancement
        setupMarketingButtons();
        
        // Améliorer l'UI de la page marketing
        enhanceMarketingUI();
    } else {
        console.log("Page d'application détectée, lancement direct...");
        initializeApp();
    }
});

/**
 * Vérifie les paramètres d'URL pour les raccourcis
 */
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Mode rapide depuis le raccourci
    if (urlParams.has('mode') && urlParams.get('mode') === 'quick') {
        setTimeout(() => {
            showLoadingScreen();
            hideMarketingPage();
            createAppStructure();
            
            setTimeout(() => {
                initializeApp();
                // Passer directement à la page d'auto-hypnose
                showPage(3); // Page d'induction
                hideLoadingScreen();
            }, 300);
        }, 500);
        
        return true; // Indique qu'un raccourci a été traité
    }
    
    // Page spécifique depuis le raccourci
    else if (urlParams.has('page')) {
        const page = parseInt(urlParams.get('page'));
        if (!isNaN(page) && page >= 1 && page <= 7) {
            setTimeout(() => {
                showLoadingScreen();
                hideMarketingPage();
                createAppStructure();
                
                setTimeout(() => {
                    initializeApp();
                    showPage(page);
                    hideLoadingScreen();
                }, 300);
            }, 500);
            
            return true; // Indique qu'un raccourci a été traité
        }
    }
    
    return false; // Aucun raccourci traité
}

/**
 * Précharge les ressources de l'application en arrière-plan
 * pour accélérer la transition
 */
function preloadAppResources() {
    console.log("Préchargement des ressources de l'application...");
    
    const startTime = Date.now();
    let resourcesLoaded = 0;
    const totalResources = APP_CONFIG.preloadResources.length;
    
    // Fonction pour mettre à jour l'indicateur de chargement
    function updateLoadingStatus() {
        const percentage = Math.round((resourcesLoaded / totalResources) * 100);
        console.log(`Préchargement: ${percentage}%`);
        
        const loadingIndicator = document.getElementById('app-loading-progress');
        if (loadingIndicator) {
            loadingIndicator.style.width = `${percentage}%`;
        }
    }
    
    // Précharger chaque ressource
    APP_CONFIG.preloadResources.forEach(resource => {
        const isStylesheet = resource.endsWith('.css');
        const isScript = resource.endsWith('.js');
        
        if (isStylesheet) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = resource;
            
            link.onload = () => {
                resourcesLoaded++;
                updateLoadingStatus();
                checkAllResourcesLoaded();
            };
            
            link.onerror = () => {
                console.warn(`Échec du préchargement de ${resource}`);
                resourcesLoaded++;
                updateLoadingStatus();
                checkAllResourcesLoaded();
            };
            
            document.head.appendChild(link);
        } 
        else if (isScript) {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'script';
            preloadLink.href = resource;
            
            preloadLink.onload = () => {
                resourcesLoaded++;
                updateLoadingStatus();
                checkAllResourcesLoaded();
            };
            
            preloadLink.onerror = () => {
                console.warn(`Échec du préchargement de ${resource}`);
                resourcesLoaded++;
                updateLoadingStatus();
                checkAllResourcesLoaded();
            };
            
            document.head.appendChild(preloadLink);
        }
    });
    
    // Vérifier si toutes les ressources sont chargées
    function checkAllResourcesLoaded() {
        if (resourcesLoaded >= totalResources) {
            const loadTime = Date.now() - startTime;
            console.log(`Toutes les ressources préchargées en ${loadTime}ms`);
            
            // Attendre au moins le temps minimum de chargement
            const remainingTime = Math.max(0, APP_CONFIG.minLoadingTime - loadTime);
            
            setTimeout(() => {
                APP_CONFIG.resourcesLoaded = true;
                
                // Mettre à jour l'UI pour montrer que tout est prêt
                const startButtons = document.querySelectorAll('.start-app-btn, a[href="index.html"]');
                startButtons.forEach(button => {
                    button.classList.add('ready');
                    
                    // Ajouter une animation subtile
                    button.classList.add('pulse-animation');
                });
                
                // Masquer l'indicateur de chargement
                const loadingIndicator = document.getElementById('app-loading-container');
                if (loadingIndicator) {
                    loadingIndicator.classList.add('loaded');
                }
            }, remainingTime);
        }
    }
}

/**
 * Configure les boutons de la page marketing pour lancer l'application
 */
function setupMarketingButtons() {
    // Trouver tous les boutons qui renvoient vers l'application
    const startAppButtons = document.querySelectorAll('.start-app-btn, a[href="index.html"]');
    
    startAppButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Bouton de lancement cliqué, transition vers l'application...");
            
            // Afficher l'écran de chargement
            showLoadingScreen();
            
            // Lancer la transition avec un délai pour permettre l'animation
            setTimeout(() => {
                // Cacher la page marketing avec transition
                hideMarketingPage();
                
                // Créer et afficher l'application
                createAppStructure();
                
                // Initialiser l'application après un court délai
                setTimeout(() => {
                    initializeApp();
                    showPage(1); // Afficher la première page de l'application
                    
                    // Masquer l'écran de chargement
                    hideLoadingScreen();
                }, 300);
            }, 500);
        });
    });
}

/**
 * Améliore l'interface utilisateur de la page marketing
 */
function enhanceMarketingUI() {
    // Améliorer les boutons de lancement avec un indicateur d'état
    const startButtons = document.querySelectorAll('.start-app-btn, a[href="index.html"]');
    
    startButtons.forEach(button => {
        // Ajouter une classe pour l'état de chargement
        button.classList.add('loading');
        
        // Ajouter un indicateur d'état si c'est le bouton principal (CTA)
        if (button.classList.contains('btn-primary')) {
            // Créer un élément d'état
            const statusElement = document.createElement('span');
            statusElement.className = 'app-status';
            statusElement.textContent = 'Chargement...';
            
            // Ajouter après le bouton
            button.parentNode.insertBefore(statusElement, button.nextSibling);
            
            // Mettre à jour le texte d'état lorsque les ressources sont chargées
            const checkStatus = setInterval(() => {
                if (APP_CONFIG.resourcesLoaded) {
                    statusElement.textContent = 'Prêt à démarrer';
                    statusElement.classList.add('ready');
                    clearInterval(checkStatus);
                }
            }, 500);
        }
    });
}

/**
 * Affiche un écran de chargement stylisé
 */
function showLoadingScreen() {
    // Créer l'écran de chargement s'il n'existe pas
    if (!document.getElementById('app-loading-screen')) {
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'app-loading-screen';
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <div class="app-logo">
                    <div class="spiral-loading"></div>
                </div>
                <h2>Hypnorelax</h2>
                <p>Chargement de votre expérience de relaxation...</p>
                <div id="app-loading-container" class="loading-bar-container">
                    <div id="app-loading-progress" class="loading-bar-progress"></div>
                </div>
            </div>
        `;
        
        // Ajouter les styles pour l'écran de chargement s'ils n'existent pas déjà
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                #app-loading-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #0A2463, #2a4483);
                    z-index: 9999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                }
                
                #app-loading-screen.active {
                    opacity: 1;
                }
                
                .loading-content {
                    text-align: center;
                    color: white;
                    padding: 20px;
                    max-width: 80%;
                }
                
                .app-logo {
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
                }
                
                .spiral-loading {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    border: 4px solid transparent;
                    border-top-color: #FF7F50;
                    border-bottom-color: #A8D0E6;
                    animation: spin 1.5s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .loading-bar-container {
                    height: 6px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-top: 30px;
                    width: 250px;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .loading-bar-progress {
                    height: 100%;
                    background: linear-gradient(to right, #A8D0E6, #FF7F50);
                    width: 0%;
                    transition: width 0.3s ease;
                    border-radius: 3px;
                    box-shadow: 0 0 10px rgba(255, 127, 80, 0.7);
                }
                
                .loading-bar-container.loaded {
                    animation: fadeOut 0.5s forwards 1s;
                }
                
                @keyframes fadeOut {
                    to { opacity: 0; }
                }
            `;
            
            document.head.appendChild(style);
        }
        
        document.body.appendChild(loadingScreen);
    }
    
    // Activer l'écran de chargement
    const loadingScreen = document.getElementById('app-loading-screen');
    loadingScreen.classList.add('active');
}

/**
 * Masque l'écran de chargement
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('app-loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('active');
        
        // Supprimer l'écran de chargement après la transition
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }
}

/**
 * Cache la page marketing avec une transition fluide
 */
function hideMarketingPage() {
    // Ajouter une transition pour tous les éléments de la page marketing
    const marketingElements = [
        '.site-header', '.hero', '.features', '.benefits', 
        '.how-it-works', '.testimonials', '.pricing', 
        '.faq', '.enhanced-cta', '.site-footer', 
        '.mobile-nav', '.overlay', '.floating-action-button',
        '.pwa-install-banner'
    ];
    
    // Ajouter une classe pour la transition
    document.body.classList.add('transitioning-to-app');
    
    // Ajouter un style pour gérer la transition s'il n'existe pas déjà
    if (!document.getElementById('transition-styles')) {
        const transitionStyle = document.createElement('style');
        transitionStyle.id = 'transition-styles';
        transitionStyle.textContent = `
            .transitioning-to-app * {
                transition: opacity ${APP_CONFIG.transitionDuration/1000}s ease;
            }
        `;
        document.head.appendChild(transitionStyle);
    }
    
    // Faire disparaître les éléments avec transition
    marketingElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style.opacity = '0';
        });
    });
    
    // Attendre la fin de la transition avant de masquer complètement
    setTimeout(() => {
        marketingElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'none';
            });
        });
        
        // Nettoyer les styles
        document.body.style.padding = '0';
        document.body.style.margin = '0';
        document.body.style.background = '#f5f5f5';
        document.body.classList.remove('transitioning-to-app');
    }, APP_CONFIG.transitionDuration);
}

/**
 * Crée la structure HTML de l'application
 */
function createAppStructure() {
    const appHTML = `
    <div class="container">
        <!-- Page d'introduction -->
        <div class="page" id="page1">
            <header>
                <div class="app-branding">
                    <span class="app-name">Hypnorelax</span>
                </div>
                <h1>Auto-Hypnose Guidée</h1>
            </header>
            
            <div class="intro-content">
                <div class="intro-icon">
                    <div class="spiral-small"></div>
                </div>
                <h2>Bienvenue dans votre voyage vers la relaxation profonde</h2>
                <p>Cette application vous guidera à travers une séance d'auto-hypnose pour vous aider à atteindre un état de détente et de bien-être.</p>
                
                <div class="steps-list">
                    <li>Vous commencerez par une courte séance de cohérence cardiaque</li>
                    <li>Suivie d'une induction hypnotique progressive</li>
                    <li>Puis une exploration de votre monde intérieur</li>
                    <li>Et enfin un retour en douceur à l'état de veille</li>
                </div>
                
                <div class="btn-container">
                    <button id="startBtn" class="btn">Commencer</button>
                </div>
            </div>
        </div>
        
        <!-- Page Cohérence Cardiaque -->
        <div class="page" id="page2">
            <header>
                <div class="app-branding">
                    <span class="app-name">Hypnorelax</span>
                </div>
                <h1>Cohérence Cardiaque</h1>
            </header>
            
            <div id="coherenceIntroduction">
                <p>Commençons par une courte séance de cohérence cardiaque pour calmer votre système nerveux et préparer votre esprit.</p>
                
                <div class="coherence-instructions">
                    <h3>Instructions :</h3>
                    <p>Suivez simplement le cercle qui s'agrandit et se rétrécit. Inspirez quand il s'agrandit, expirez quand il se rétrécit.</p>
                    <p>La séance dure 2 minutes (6 respirations par minute).</p>
                </div>
                
                <div class="audio-controls">
                    <div class="audio-toggle">
                        <label for="audioToggle">Guide vocal</label>
                        <label class="toggle-switch">
                            <input type="checkbox" id="audioToggle" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="voice-selection">
                        <label for="voiceSelect">Voix :</label>
                        <select id="voiceSelect"></select>
                        <span id="speakingIndicator" class="speaking-indicator"></span>
                    </div>
                    
                    <div class="volume-control">
                        <label for="volumeSlider">Volume :</label>
                        <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="0.8">
                    </div>
                </div>
                
                <div class="btn-container">
                    <button id="startCoherenceBtn" class="btn">Démarrer</button>
                    <button id="homeBtn" class="btn btn-blue">Retour</button>
                </div>
            </div>
            
            <div id="coherenceContainer" class="coherence-container" style="display: none;">
                <div id="breathCircle" class="breath-circle"></div>
                <div class="breath-path"></div>
                <div id="breathInLabel" class="breath-label breath-in-label">Inspirez</div>
                <div id="breathOutLabel" class="breath-label breath-out-label">Expirez</div>
            </div>
            
            <div id="timerDisplay" class="timer-display" style="display: none;">2:00</div>
            <div id="coherenceInstruction" class="instruction" style="display: none;"></div>
        </div>
        
        <!-- Autres pages de l'application -->
        <div class="page" id="page3">
            <header>
                <h1>Induction</h1>
            </header>
            <div id="inductionInstruction" class="instruction"></div>
            <div id="inductionCounter" class="counter"></div>
            <div class="spiral-container">
                <div class="spiral"></div>
                <div class="spiral-center"></div>
                <div class="focus-dot"></div>
            </div>
        </div>
        
        <div class="page" id="page4">
            <header>
                <h1>Approfondissement</h1>
            </header>
            <div id="deepeningInstruction" class="instruction"></div>
            <div id="stairsCounter" class="counter"></div>
            <!-- Escalier d'hypnose -->
            <div class="escalator-container">
                <div class="escalator">
                    <div class="steps-container">
                        <div class="escalator-step"></div>
                        <div class="escalator-step"></div>
                        <div class="escalator-step"></div>
                        <div class="escalator-step"></div>
                        <div class="escalator-step"></div>
                        <div class="escalator-step"></div>
                        <div class="escalator-step"></div>
                        <div class="escalator-step"></div>
                        <div class="escalator-step"></div>
                        <div class="escalator-step"></div>
                    </div>
                    <div class="escalator-rider"></div>
                </div>
            </div>
        </div>
        
        <div class="page" id="page5">
            <header>
                <h1>Exploration</h1>
            </header>
            <div id="explorationInstruction" class="instruction"></div>
            <div class="exploration-scene">
                <div class="exploration-background"></div>
                <div class="exploration-ring"></div>
                <div class="exploration-ring"></div>
                <div class="exploration-ring"></div>
            </div>
            <div class="progress-container">
                <div id="explorationProgress"></div>
            </div>
        </div>
        
        <div class="page" id="page6">
            <header>
                <h1>Réveil</h1>
            </header>
            <div id="awakeningCounter" class="counter"></div>
            <div id="energyScene" class="energy-scene">
                <div class="energy-glow"></div>
            </div>
        </div>
        
        <div class="page" id="page7">
            <header>
                <h1>Séance terminée</h1>
            </header>
            <div class="intro-content">
                <div class="intro-icon">
                    <div class="spiral-small"></div>
                </div>
                <h2>Félicitations !</h2>
                <p>Vous avez terminé votre séance d'auto-hypnose. Prenez un moment pour apprécier cet état de relaxation profonde.</p>
                
                <div class="btn-container">
                    <button id="restartBtn" class="btn">Nouvelle séance</button>
                    <button class="btn btn-blue" onclick="window.location.reload()">Quitter</button>
                </div>
            </div>
        </div>
        
        <!-- Barre de progression -->
        <div class="progress-steps">
            <div class="progress-line"></div>
            <div id="progressFill" class="progress-fill" style="width: 0%;"></div>
            <div class="step active" data-step="1">
                <div class="step-label">Introduction</div>
            </div>
            <div class="step" data-step="2">
                <div class="step-label">Cohérence</div>
            </div>
            <div class="step" data-step="3">
                <div class="step-label">Induction</div>
            </div>
            <div class="step" data-step="4">
                <div class="step-label">Profondeur</div>
            </div>
            <div class="step" data-step="5">
                <div class="step-label">Exploration</div>
            </div>
            <div class="step" data-step="6">
                <div class="step-label">Réveil</div>
            </div>
            <div class="step" data-step="7">
                <div class="step-label">Fin</div>
            </div>
        </div>
        
        <!-- Sons binauraux -->
        <div class="audio-controls" style="margin-top: 20px;">
            <div class="audio-toggle">
                <label for="binauralToggle">Sons binauraux</label>
                <label class="toggle-switch">
                    <input type="checkbox" id="binauralToggle">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="volume-control">
                <label for="binauralVolumeSlider">Volume :</label>
                <input type="range" id="binauralVolumeSlider" min="0" max="1" step="0.1" value="0.2">
            </div>
        </div>
        <p class="binaural-info">Les sons binauraux utilisent des fréquences spécifiques pour favoriser les ondes cérébrales associées à la détente profonde.</p>
        
        <footer>
            <p>&copy; 2025 Hypnorelax - Joffrey ROS</p>
        </footer>
    </div>
    `;
    
    // Créer un nouvel élément qui contiendra l'application
    const appContainer = document.createElement('div');
    appContainer.id = 'hypnorelax-app';
    appContainer.style.opacity = '0';
    appContainer.style.transition = 'opacity 0.5s ease';
    appContainer.innerHTML = appHTML;
    
    // Ajouter l'application au document
    document.body.appendChild(appContainer);
    
    // Charger les styles nécessaires s'ils ne sont pas déjà chargés
    const requiredStyles = ['styles.css', 'mobile-optimization.css'];
    requiredStyles.forEach(style => {
        if (!document.querySelector(`link[href="${style}"]`)) {
            const styleLink = document.createElement('link');
            styleLink.rel = 'stylesheet';
            styleLink.href = style;
            document.head.appendChild(styleLink);
        }
    });
    
    // Afficher l'application avec transition
    setTimeout(() => {
        appContainer.style.opacity = '1';
    }, 100);
}

/**
 * Fonction pour afficher une page spécifique de l'application
 */
function showPage(pageNumber) {
    // Masquer toutes les pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Afficher la page demandée
    const targetPage = document.getElementById(`page${pageNumber}`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageNumber;
        
        // Mettre à jour les étapes
        updateSteps(pageNumber);
        
        // Synthèse vocale selon la page
        if (window.speech && window.speech.synth && document.getElementById('audioToggle') && document.getElementById('audioToggle').checked) {
            switch(pageNumber) {
                case 1:
                    window.speech.speak("Bienvenue dans Hypnorelax. Cette application vous guidera à travers une séance d'auto-hypnose pour vous aider à atteindre un état de détente et de bien-être.");
                    break;
                case 2:
                    window.speech.speak("Commençons par une courte séance de cohérence cardiaque pour calmer votre système nerveux et préparer votre esprit.");
                    break;
                case 3:
                    window.speech.speak("Induction hypnotique. Fixez le centre de la spirale et laissez-vous guider.");
                    break;
                case 4:
                    window.speech.speak("Phase d'approfondissement. Imaginez que vous descendez les marches, vous enfonçant de plus en plus profondément dans l'état hypnotique.");
                    break;
                case 5:
                    window.speech.speak("Exploration. C'est le moment d'explorer votre monde intérieur et de profiter pleinement de cet état de calme et de présence.");
                    break;
                case 6:
                    window.speech.speak("Processus de réveil. Nous allons maintenant entamer le retour progressif à l'état de veille.");
                    break;
                case 7:
                    window.speech.speak("Félicitations, vous avez terminé votre séance d'auto-hypnose. Prenez un moment pour savourer cet état de calme et de relaxation.");
                    break;
            }
        }
    } else {
        console.error(`Page ${pageNumber} non trouvée`);
    }
}

/**
 * Met à jour l'affichage des étapes
 */
function updateSteps(currentStep) {
    // Mettre à jour les classes des étapes
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        const stepNumber = parseInt(step.getAttribute('data-step'));
        if (stepNumber <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Mettre à jour la barre de progression
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
        progressFill.style.width = `${progress}%`;
    }
}

/**
 * Fonction sécurisée pour setTimeout qui garde une référence
 */
function safeSetTimeout(callback, delay) {
    if (typeof callback !== 'function') {
        console.error("safeSetTimeout: callback n'est pas une fonction", callback);
        return null;
    }
    
    try {
        const timeoutId = setTimeout(() => {
            try {
                allTimeouts.delete(timeoutId);
                callback();
            } catch (error) {
                console.error("Erreur dans le callback de safeSetTimeout:", error);
            }
        }, delay || 0);
        
        allTimeouts.add(timeoutId);
        return timeoutId;
    } catch (error) {
        console.error("Erreur lors de la création de safeSetTimeout:", error);
        return null;
    }
}

/**
 * Fonction sécurisée pour setInterval qui garde une référence
 */
function safeSetInterval(callback, delay) {
    if (typeof callback !== 'function') {
        console.error("safeSetInterval: callback n'est pas une fonction", callback);
        return null;
    }
    
    try {
        const intervalId = setInterval(() => {
            try {
                callback();
            } catch (error) {
                console.error("Erreur dans le callback de safeSetInterval:", error);
            }
        }, delay || 1000);
        
        allIntervals.add(intervalId);
        return intervalId;
    } catch (error) {
        console.error("Erreur lors de la création de safeSetInterval:", error);
        return null;
    }
}

/**
 * Nettoyer tous les timeouts enregistrés
 */
function clearAllTimeouts() {
    try {
        allTimeouts.forEach(id => {
            clearTimeout(id);
        });
        allTimeouts.clear();
    } catch (error) {
        console.error("Erreur lors du nettoyage des timeouts:", error);
    }
}

/**
 * Nettoyer tous les intervalles enregistrés
 */
function clearAllIntervals() {
    try {
        allIntervals.forEach(id => {
            clearInterval(id);
        });
        allIntervals.clear();
    } catch (error) {
        console.error("Erreur lors du nettoyage des intervalles:", error);
    }
}

/**
 * Sauvegarde du script externe pour compatibilité
 */
function initializeApp() {
    // Cette fonction est définie dans script.js
    // Nous vérifions si elle existe et sinon, nous créons une version minimale
    if (typeof window.initializeApp === 'function') {
        // Appeler la fonction globale existante
        window.initializeApp();
    } else {
        console.log("Fonction initializeApp non trouvée, utilisation de la version minimale");
        
        // Version minimale
        window.initializeApp = function() {
            console.log("Initialisation minimale de l'application");
            
            // Initialiser les références DOM
            initDOMReferences();
            
            // Configurer les écouteurs d'événements
            setupEventListeners();
            
            // Initialiser la synthèse vocale
            if (window.speech) {
                window.speech.init();
            } else {
                // Créer un objet speech minimal
                createMinimalSpeechObject();
            }
            
            // Configurer la détection de l'orientation de l'écran
            setupOrientationDetection();
            
            console.log("Initialisation minimale terminée");
        };
        
        // Exécuter la version minimale
        window.initializeApp();
    }
}

/**
 * Fonction pour configurer la détection de l'orientation de l'écran
 */
function setupOrientationDetection() {
    // Détecter les changements d'orientation
    window.addEventListener('resize', adjustForScreenOrientation);
    
    // Exécuter une première fois
    adjustForScreenOrientation();
    
    function adjustForScreenOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        
        if (isLandscape) {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        } else {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        }
    }
}

/**
 * Fonctions de support minimales
 */
function initDOMReferences() {
    console.log("Initialisation des références DOM");
    
    // Récupérer les références des éléments
    window.pages = document.querySelectorAll('.page');
    window.steps = document.querySelectorAll('.step');
    window.progressFill = document.getElementById('progressFill');
    
    // Contrôles audio
    window.audioToggle = document.getElementById('audioToggle');
    window.voiceSelect = document.getElementById('voiceSelect');
    window.volumeSlider = document.getElementById('volumeSlider');
    window.speakingIndicator = document.getElementById('speakingIndicator');
    
    // Boutons essentiels
    window.startBtn = document.getElementById('startBtn');
    window.startCoherenceBtn = document.getElementById('startCoherenceBtn');
    window.restartBtn = document.getElementById('restartBtn');
    window.homeBtn = document.getElementById('homeBtn');
    
    // Autres éléments
    window.inductionInstruction = document.getElementById('inductionInstruction');
    window.inductionCounter = document.getElementById('inductionCounter');
    window.deepeningInstruction = document.getElementById('deepeningInstruction');
    window.stairsCounter = document.getElementById('stairsCounter');
    window.explorationInstruction = document.getElementById('explorationInstruction');
    window.awakeningCounter = document.getElementById('awakeningCounter');
    window.energyScene = document.getElementById('energyScene');
    
    // Éléments de la cohérence cardiaque
    window.coherenceIntro = document.getElementById('coherenceIntroduction');
    window.coherenceContainer = document.getElementById('coherenceContainer');
    window.breathCircle = document.getElementById('breathCircle');
    window.breathInLabel = document.getElementById('breathInLabel');
    window.breathOutLabel = document.getElementById('breathOutLabel');
    window.timerDisplay = document.getElementById('timerDisplay');
    window.coherenceInstruction = document.getElementById('coherenceInstruction');
}

function setupEventListeners() {
    console.log("Configuration des écouteurs d'événements");
    
    // Configurer les boutons essentiels
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            showPage(2);
        });
    }
    
    const startCoherenceBtn = document.getElementById('startCoherenceBtn');
    if (startCoherenceBtn) {
        startCoherenceBtn.addEventListener('click', function() {
            if (typeof window.startCoherenceCardiaque === 'function') {
                window.startCoherenceCardiaque();
            } else {
                // Version minimale pour la démonstration
                const coherenceIntro = document.getElementById('coherenceIntroduction');
                const coherenceContainer = document.getElementById('coherenceContainer');
                const timerDisplay = document.getElementById('timerDisplay');
                const coherenceInstruction = document.getElementById('coherenceInstruction');
                
                if (coherenceIntro) coherenceIntro.style.display = 'none';
                if (coherenceContainer) coherenceContainer.style.display = 'block';
                if (timerDisplay) timerDisplay.style.display = 'block';
                if (coherenceInstruction) coherenceInstruction.style.display = 'block';
                
                // Animation simplifiée
                if (coherenceInstruction) coherenceInstruction.textContent = "Respirez profondément...";
                
                // Passer à l'étape suivante après un délai
                setTimeout(() => {
                    showPage(3); // Page d'induction
                }, 3000);
            }
        });
    }
    
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            showPage(2);
        });
    }
    
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', function() {
            showPage(1);
        });
    }
    
    // Sons binauraux
    const binauralToggle = document.getElementById('binauralToggle');
    if (binauralToggle) {
        binauralToggle.addEventListener('change', function() {
            if (this.checked) {
                console.log("Sons binauraux activés");
                if (typeof window.startBinauralBeats === 'function') {
                    window.startBinauralBeats();
                }
            } else {
                console.log("Sons binauraux désactivés");
                if (typeof window.stopBinauralBeats === 'function') {
                    window.stopBinauralBeats();
                }
            }
        });
    }
    
    // Contrôle du volume des sons binauraux
    const binauralVolumeSlider = document.getElementById('binauralVolumeSlider');
    if (binauralVolumeSlider) {
        binauralVolumeSlider.addEventListener('input', function() {
            if (typeof window.updateBinauralVolume === 'function') {
                window.updateBinauralVolume(parseFloat(this.value));
            }
        });
    }
    
    // Contrôle audio
    if (window.audioToggle) {
        window.audioToggle.addEventListener('change', function() {
            if (!this.checked && window.speech) {
                window.speech.stop();
            }
        });
    }
    
    // Volume de la voix
    if (window.volumeSlider) {
        window.volumeSlider.addEventListener('input', function() {
            if (window.speech) {
                window.speech.volume = parseFloat(this.value);
            }
        });
    }
}

/**
 * Crée un objet speech minimal si nécessaire
 */
function createMinimalSpeechObject() {
    window.speech = {
        synth: window.speechSynthesis,
        voices: [],
        selectedVoice: null,
        volume: 0.8,
        
        init: function() {
            if (!this.synth) return false;
            
            // Initialiser les voix
            this.voices = this.synth.getVoices();
            
            // Si aucune voix n'est disponible immédiatement, attendre l'événement voiceschanged
            if (this.voices.length === 0) {
                window.speechSynthesis.onvoiceschanged = () => {
                    this.voices = this.synth.getVoices();
                    this.selectBestVoice();
                    this.populateVoiceList();
                };
            } else {
                this.selectBestVoice();
                this.populateVoiceList();
            }
            
            return true;
        },
        
        selectBestVoice: function() {
            // Sélectionner une voix française si disponible
            const frenchVoices = this.voices.filter(voice => 
                voice.lang && voice.lang.toLowerCase().includes('fr')
            );
            
            if (frenchVoices.length > 0) {
                this.selectedVoice = frenchVoices[0];
                console.log("Voix française sélectionnée:", this.selectedVoice.name);
            } else if (this.voices.length > 0) {
                this.selectedVoice = this.voices[0];
                console.log("Aucune voix française trouvée, utilisation de:", this.selectedVoice.name);
            } else {
                console.warn("Aucune voix disponible");
            }
        },
        
        populateVoiceList: function() {
            // Remplir la liste des voix si l'élément existe
            if (window.voiceSelect) {
                window.voiceSelect.innerHTML = '';
                
                this.voices.forEach((voice, index) => {
                    const option = document.createElement('option');
                    option.textContent = `${voice.name} (${voice.lang})`;
                    option.setAttribute('data-voice-index', index);
                    window.voiceSelect.appendChild(option);
                    
                    // Sélectionner la voix actuelle
                    if (voice === this.selectedVoice) {
                        window.voiceSelect.selectedIndex = index;
                    }
                });
                
                // Ajouter l'écouteur d'événements
                window.voiceSelect.addEventListener('change', () => {
                    const selectedIndex = window.voiceSelect.selectedIndex;
                    const voiceIndex = parseInt(window.voiceSelect.options[selectedIndex].getAttribute('data-voice-index'));
                    this.selectedVoice = this.voices[voiceIndex];
                    console.log("Nouvelle voix sélectionnée:", this.selectedVoice.name);
                });
            }
        },
        
        speak: function(text) {
            if (!this.synth || !text) return;
            
            try {
                // Vérifier si le son est activé
                if (window.audioToggle && !window.audioToggle.checked) {
                    return;
                }
                
                console.log("Synthèse vocale:", text);
                
                // Créer un nouvel énoncé
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Configurer l'énoncé
                if (this.selectedVoice) {
                    utterance.voice = this.selectedVoice;
                }
                
                utterance.volume = this.volume;
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.lang = 'fr-FR';
                
                // Ajouter des événements
                utterance.onstart = () => {
                    if (window.speakingIndicator) {
                        window.speakingIndicator.classList.add('active');
                    }
                };
                
                utterance.onend = () => {
                    if (window.speakingIndicator) {
                        window.speakingIndicator.classList.remove('active');
                    }
                };
                
                // Prononcer le texte
                this.synth.speak(utterance);
            } catch (error) {
                console.error("Erreur lors de la synthèse vocale:", error);
            }
        },
        
        stop: function() {
            if (this.synth) {
                this.synth.cancel();
            }
        }
    };
    
    // Initialiser l'objet
    window.speech.init();
}

// Détecter le support PWA et afficher un message si applicable
function detectPWASupport() {
    // Vérifier si le navigateur prend en charge les PWA
    const isPWASupported = 
        'serviceWorker' in navigator && 
        window.matchMedia('(display-mode: browser)').matches && 
        !window.matchMedia('(display-mode: standalone)').matches;
    
    if (isPWASupported) {
        // L'utilisateur est sur un navigateur qui supporte les PWA mais n'a pas installé l'app
        console.log("Support PWA détecté, l'app peut être installée");
        
        // Cette fonctionnalité est gérée via la bannière d'installation dans le HTML
    }
}

// Exécuter la détection de support PWA
detectPWASupport();
