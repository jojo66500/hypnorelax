/**
 * Hypnorelax - Correctif pour faire fonctionner l'application
 * Ce script corrige les problèmes d'initialisation et de navigation
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation de Hypnorelax...");
    
    // Déterminer si nous sommes sur la page marketing ou l'application
    const isMarketingPage = document.querySelector('.hero') !== null;
    
    if (isMarketingPage) {
        console.log("Page marketing détectée, configuration des boutons...");
        setupMarketingButtons();
    } else {
        console.log("Page d'application détectée, lancement de l'application...");
        initializeApp();
    }
});

/**
 * Configure les boutons de la page marketing pour lancer l'application
 */
function setupMarketingButtons() {
    // Trouver tous les boutons qui renvoient vers index.html
    const appButtons = document.querySelectorAll('a[href="index.html"]');
    
    appButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Bouton 'Commencer' cliqué, lancement de l'application...");
            
            // Cacher la page marketing
            hideMarketingPage();
            
            // Créer et afficher l'application
            createAppStructure();
            
            // Initialiser l'application
            setTimeout(() => {
                initializeApp();
                showPage(1); // Afficher la première page de l'application
            }, 100);
        });
    });
}

/**
 * Cache la page marketing
 */
function hideMarketingPage() {
    // Cacher tous les éléments de la page marketing
    const marketingElements = [
        '.site-header', '.hero', '.features', '.benefits', 
        '.how-it-works', '.testimonials', '.pricing', 
        '.faq', '.cta', '.site-footer', '.mobile-nav', '.overlay'
    ];
    
    marketingElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style.display = 'none';
        });
    });
    
    // Nettoyer le body
    document.body.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.background = '#f5f5f5';
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
                <h1>Reveil</h1>
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
    appContainer.innerHTML = appHTML;
    
    // Ajouter l'application au document
    document.body.appendChild(appContainer);
    
    // Charger les styles nécessaires s'ils ne sont pas déjà chargés
    if (!document.querySelector('link[href="styles.css"]')) {
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = 'styles.css';
        document.head.appendChild(styleLink);
    }
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
        if (speech && speech.synth && audioToggle && audioToggle.checked) {
            switch(pageNumber) {
                case 1:
                    speech.speak("Bienvenue dans Hypnorelax. Cette application vous guidera à travers une séance d'auto-hypnose pour vous aider à atteindre un état de détente et de bien-être.");
                    break;
                case 2:
                    speech.speak("Commençons par une courte séance de cohérence cardiaque pour calmer votre système nerveux et préparer votre esprit.");
                    break;
                // Autres cas pour les autres pages...
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
 * Fonction pour démarrer la cohérence cardiaque
 */
function startCoherenceCardiaque() {
    try {
        console.log("Démarrage de la cohérence cardiaque");
        
        // Masquer l'introduction et afficher l'animation
        const coherenceIntro = document.getElementById('coherenceIntroduction');
        const coherenceContainer = document.getElementById('coherenceContainer');
        const timerDisplay = document.getElementById('timerDisplay');
        const coherenceInstruction = document.getElementById('coherenceInstruction');
        
        if (coherenceIntro) coherenceIntro.style.display = 'none';
        if (coherenceContainer) coherenceContainer.style.display = 'block';
        if (timerDisplay) timerDisplay.style.display = 'block';
        if (coherenceInstruction) coherenceInstruction.style.display = 'block';
        
        // Initialiser le timer
        secondsRemaining = 120; // 2 minutes
        updateTimerDisplay();
        
        // Démarrer l'animation de respiration
        startBreathingAnimation();
        
        // Parler si l'audio est activé
        if (speech && speech.synth && audioToggle && audioToggle.checked) {
            speech.speak("Suivez le rythme. Inspirez pendant 5 secondes quand le cercle s'agrandit, puis expirez pendant 5 secondes quand il se rétrécit.");
        }
        
        // Activer les sons binauraux si ils sont activés
        const binauralToggle = document.getElementById('binauralToggle');
        if (binauralToggle && binauralToggle.checked) {
            startBinauralBeats();
        }
        
        // Démarrer le timer
        coherenceTimer = safeSetTimeout(() => {
            finishCoherenceCardiaque();
        }, secondsRemaining * 1000);
        
        // Mettre à jour le timer chaque seconde
        coherenceInterval = safeSetInterval(() => {
            secondsRemaining--;
            updateTimerDisplay();
            
            // Messages vocaux à des moments spécifiques
            if (audioToggle && audioToggle.checked) {
                const remainingMinutes = Math.floor(secondsRemaining / 60);
                const remainingSeconds = secondsRemaining % 60;
                
                if (remainingMinutes === 1 && remainingSeconds === 30) {
                    speech.speak("Vous faites très bien. Continuez à respirer calmement.");
                } else if (remainingMinutes === 0 && remainingSeconds === 45) {
                    speech.speak("Encore quelques respirations. Sentez comme votre corps et votre esprit se détendent.");
                } else if (remainingMinutes === 0 && remainingSeconds === 15) {
                    speech.speak("Dernières respirations. Préparez-vous à continuer votre voyage.");
                }
            }
        }, 1000);
        
    } catch (error) {
        console.error("Erreur lors du démarrage de la cohérence cardiaque:", error);
    }
}

/**
 * Fonction pour mettre à jour l'affichage du timer
 */
function updateTimerDisplay() {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    const timerDisplay = document.getElementById('timerDisplay');
    
    if (timerDisplay) {
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}

/**
 * Fonction pour démarrer l'animation de respiration
 */
function startBreathingAnimation() {
    const breathCircle = document.getElementById('breathCircle');
    const breathInLabel = document.getElementById('breathInLabel');
    const breathOutLabel = document.getElementById('breathOutLabel');
    const coherenceInstruction = document.getElementById('coherenceInstruction');
    
    if (!breathCircle) return;
    
    const breathDuration = 5000; // 5 secondes pour inspirer, 5 secondes pour expirer
    
    // Fonction pour animer un cycle de respiration
    function animateBreathCycle() {
        // Phase d'inspiration
        if (coherenceInstruction) coherenceInstruction.textContent = "Inspirez profondément...";
        if (breathInLabel) breathInLabel.style.opacity = "1";
        if (breathOutLabel) breathOutLabel.style.opacity = "0";
        
        breathCircle.style.transition = `all ${breathDuration}ms cubic-bezier(0.5, 0, 0.5, 1)`;
        breathCircle.style.transform = 'translate(-50%, -50%) scale(3)';
        
        // Phase d'expiration après breathDuration ms
        setTimeout(() => {
            if (coherenceInstruction) coherenceInstruction.textContent = "Expirez lentement...";
            if (breathInLabel) breathInLabel.style.opacity = "0";
            if (breathOutLabel) breathOutLabel.style.opacity = "1";
            
            breathCircle.style.transition = `all ${breathDuration}ms cubic-bezier(0.5, 0, 0.5, 1)`;
            breathCircle.style.transform = 'translate(-50%, -50%) scale(1)';
        }, breathDuration);
    }
    
    // Lancer le premier cycle immédiatement
    animateBreathCycle();
    
    // Répéter le cycle toutes les 10 secondes (5s inspire + 5s expire)
    const breathingInterval = setInterval(animateBreathCycle, breathDuration * 2);
    
    // Stocker l'intervalle pour pouvoir l'arrêter plus tard
    allIntervals.add(breathingInterval);
}

/**
 * Fonction pour terminer la cohérence cardiaque et passer à l'étape suivante
 */
function finishCoherenceCardiaque() {
    // Nettoyer les timeouts et intervals
    if (coherenceTimer) {
        clearTimeout(coherenceTimer);
        coherenceTimer = null;
    }
    
    if (coherenceInterval) {
        clearInterval(coherenceInterval);
        coherenceInterval = null;
    }
    
    // Message de fin
    if (audioToggle && audioToggle.checked) {
        speech.speak("Excellent. Vous avez terminé la cohérence cardiaque. Nous allons maintenant passer à l'induction hypnotique.");
    }
    
    // Passer à l'étape suivante après un court délai
    setTimeout(() => {
        showPage(3); // Page d'induction
    }, 3000);
}

// Définir les variables globales nécessaires
let allTimeouts = new Set();
let allIntervals = new Set();
let currentPage = 1;
let coherenceTimer;
let coherenceInterval;
let secondsRemaining = 120;

/**
 * Fonction de nettoyage sécurisée pour setTimeout
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
 * Fonction de nettoyage sécurisée pour setInterval
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
 * Fonction pour ajuster les styles pour mobile
 */
function adjustMobileStyles() {
    const isMobile = window.innerWidth < 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
        console.log("Styles mobiles appliqués");
    } else {
        document.body.classList.remove('mobile-device');
    }
}

/**
 * Fonction pour initialiser les références DOM
 */
function initDOMReferences() {
    // Cette fonction sera appelée par initializeApp
    // On s'assure que les éléments sont présents avant de les référencer
    
    console.log("Initialisation des références DOM");
    
    // Récupérer les références des éléments une fois qu'ils sont créés
    pages = document.querySelectorAll('.page');
    steps = document.querySelectorAll('.step');
    progressFill = document.getElementById('progressFill');
    
    // Contrôles audio
    audioToggle = document.getElementById('audioToggle');
    voiceSelect = document.getElementById('voiceSelect');
    volumeSlider = document.getElementById('volumeSlider');
    speakingIndicator = document.getElementById('speakingIndicator');
    
    // Éléments de la cohérence cardiaque
    coherenceIntro = document.getElementById('coherenceIntroduction');
    coherenceContainer = document.getElementById('coherenceContainer');
    breathCircle = document.getElementById('breathCircle');
    breathInLabel = document.getElementById('breathInLabel');
    breathOutLabel = document.getElementById('breathOutLabel');
    timerDisplay = document.getElementById('timerDisplay');
    coherenceInstruction = document.getElementById('coherenceInstruction');
    
    // Boutons essentiels
    startBtn = document.getElementById('startBtn');
    startCoherenceBtn = document.getElementById('startCoherenceBtn');
    restartBtn = document.getElementById('restartBtn');
    homeBtn = document.getElementById('homeBtn');
    
    // Autres éléments
    inductionInstruction = document.getElementById('inductionInstruction');
    inductionCounter = document.getElementById('inductionCounter');
    deepeningInstruction = document.getElementById('deepeningInstruction');
    stairsCounter = document.getElementById('stairsCounter');
    explorationInstruction = document.getElementById('explorationInstruction');
    awakeningCounter = document.getElementById('awakeningCounter');
    energyScene = document.getElementById('energyScene');
    
    // Vérifier les éléments critiques
    if (!pages || !pages.length) {
        console.error("Éléments de page non trouvés");
    }
    
    if (!startBtn) {
        console.error("Bouton de démarrage non trouvé");
    }
    
    console.log("Références DOM initialisées avec succès");
}

/**
 * Fonction pour configurer les écouteurs d'événements
 */
function setupEventListeners() {
    try {
        console.log("Configuration des écouteurs d'événements");
        
        // Boutons essentiels - s'assurer qu'ils existent d'abord
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                console.log("Bouton Start cliqué");
                showPage(2);
            });
        } else {
            console.error("startBtn non trouvé");
        }
        
        if (startCoherenceBtn) {
            startCoherenceBtn.addEventListener('click', function() {
                console.log("Bouton startCoherence cliqué");
                startCoherenceCardiaque();
            });
        } else {
            console.error("startCoherenceBtn non trouvé");
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', function() {
                console.log("Bouton Restart cliqué");
                showPage(2);
            });
        } else {
            console.error("restartBtn non trouvé");
        }
        
        if (homeBtn) {
            homeBtn.addEventListener('click', function() {
                console.log("Bouton Home cliqué");
                showPage(1);
            });
        } else {
            console.error("homeBtn non trouvé");
        }
        
        // Sons binauraux
        const binauralToggle = document.getElementById('binauralToggle');
        if (binauralToggle) {
            binauralToggle.addEventListener('change', function() {
                if (this.checked) {
                    startBinauralBeats();
                } else {
                    stopBinauralBeats();
                }
            });
        }
        
        // Contrôle du volume des sons binauraux
        const binauralVolumeSlider = document.getElementById('binauralVolumeSlider');
        if (binauralVolumeSlider) {
            binauralVolumeSlider.addEventListener('input', function() {
                updateBinauralVolume(parseFloat(this.value));
            });
        }
        
        // Ajout d'un écouteur pour le redimensionnement
        window.addEventListener('resize', adjustMobileStyles);
        
        console.log("Écouteurs d'événements configurés avec succès");
    } catch (error) {
        console.error("Erreur lors de la configuration des écouteurs d'événements:", error);
    }
}

// Stub pour la fonction startBinauralBeats
function startBinauralBeats() {
    console.log("Démarrage des sons binauraux");
    // Implémenter si nécessaire
}

// Stub pour la fonction stopBinauralBeats
function stopBinauralBeats() {
    console.log("Arrêt des sons binauraux");
    // Implémenter si nécessaire
}

// Stub pour la fonction updateBinauralVolume
function updateBinauralVolume(volume) {
    console.log("Mise à jour du volume des sons binauraux:", volume);
    // Implémenter si nécessaire
}

// Objet de synthèse vocale minimal
const speech = {
    synth: null,
    voices: [],
    selectedVoice: null,
    volume: 0.8,
    
    init: function() {
        try {
            // Initialiser la synthèse vocale
            if ('speechSynthesis' in window) {
                this.synth = window.speechSynthesis;
                console.log("Synthèse vocale initialisée");
                
                // Charger les voix disponibles
                this.voices = this.synth.getVoices();
                
                // Si aucune voix n'est disponible immédiatement, attendre l'événement voiceschanged
                if (this.voices.length === 0) {
                    console.log("Attente du chargement des voix...");
                    window.speechSynthesis.onvoiceschanged = () => {
                        this.voices = this.synth.getVoices();
                        this.selectBestFrenchVoice();
                        this.populateVoiceList();
                    };
                } else {
                    this.selectBestFrenchVoice();
                    this.populateVoiceList();
                }
                
                return true;
            } else {
                console.warn("La synthèse vocale n'est pas supportée par ce navigateur");
                return false;
            }
        } catch (error) {
            console.error("Erreur lors de l'initialisation de la synthèse vocale:", error);
            return false;
        }
    },
    
    selectBestFrenchVoice: function() {
        // Sélectionner la meilleure voix française disponible
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
        if (voiceSelect) {
            voiceSelect.innerHTML = '';
            
            this.voices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.textContent = `${voice.name} (${voice.lang})`;
                option.setAttribute('data-voice-index', index);
                voiceSelect.appendChild(option);
                
                // Sélectionner la voix actuelle
                if (voice === this.selectedVoice) {
                    voiceSelect.selectedIndex = index;
                }
            });
            
            // Ajouter l'écouteur d'événements
            voiceSelect.addEventListener('change', () => {
                const selectedIndex = voiceSelect.selectedIndex;
                const voiceIndex = voiceSelect.options[selectedIndex].getAttribute('data-voice-index');
                this.selectedVoice = this.voices[voiceIndex];
                console.log("Nouvelle voix sélectionnée:", this.selectedVoice.name);
            });
        }
    },
    
    speak: function(text) {
        try {
            // Vérifier si la synthèse vocale est disponible et activée
            if (!this.synth || !audioToggle || !audioToggle.checked) {
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
                if (speakingIndicator) {
                    speakingIndicator.classList.add('active');
                }
            };
            
            utterance.onend = () => {
                if (speakingIndicator) {
                    speakingIndicator.classList.remove('active');
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
