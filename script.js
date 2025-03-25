/**
 * Hypnorelax - Script principal
 * Gère toutes les fonctionnalités de l'application d'auto-hypnose
 */

// Variables globales pour les éléments DOM
let pages = [];
let steps = [];
let progressFill;

// Contrôles audio
let audioToggle;
let voiceSelect;
let volumeSlider;
let speakingIndicator;

// Éléments de la cohérence cardiaque
let coherenceIntro;
let coherenceContainer;
let breathCircle;
let breathInLabel;
let breathOutLabel;
let timerDisplay;
let coherenceInstruction;

// Boutons
let startBtn;
let startCoherenceBtn;
let restartBtn;
let homeBtn;

// Autres éléments
let inductionInstruction;
let inductionCounter;
let deepeningInstruction;
let stairsCounter;
let explorationInstruction;
let explorationProgress;
let awakeningCounter;
let energyScene;

// Variables d'état
let currentPage = 1;
let speakingInProgress = false;
let coherenceTimer;
let coherenceInterval;
let secondsRemaining = 120;

// Système anti-veille
let noSleep = null;

// Sons binauraux
let binauralContext = null;
let binauralOscillators = [];
let binauralGain = null;
let binauralVolume = 0.2;
let binauralActive = false;

// Ensembles pour suivre les timeouts et intervalles
const allTimeouts = new Set();
const allIntervals = new Set();

/**
 * Fonction principale d'initialisation de l'application
 */
function initializeApp() {
    console.log("Initialisation de l'application...");

    try {
        // Initialiser les références DOM
        initDOMReferences();
        
        // Activer le système anti-veille
        initAntiSleepSystem();
        
        // Initialiser la synthèse vocale
        initSpeechSynthesis();
        
        // Initialiser les écouteurs d'événements
        setupEventListeners();
        
        // Ajuster les styles pour mobile
        adjustForMobile();

        console.log("Initialisation de l'application terminée avec succès");
        return true;
    } catch (error) {
        console.error("Erreur lors de l'initialisation de l'application:", error);
        return false;
    }
}

/**
 * Initialise toutes les références aux éléments DOM
 */
function initDOMReferences() {
    console.log("Initialisation des références DOM...");

    // Pages et étapes
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

    // Boutons
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
    explorationProgress = document.getElementById('explorationProgress');
    awakeningCounter = document.getElementById('awakeningCounter');
    energyScene = document.getElementById('energyScene');

    // Vérifier que les éléments critiques existent
    if (!pages || pages.length === 0) {
        console.warn("Éléments de page non trouvés");
    }

    console.log("Références DOM initialisées");
}

/**
 * Initialise le système anti-veille
 */
function initAntiSleepSystem() {
    try {
        // Vérifier si NoSleep est disponible (généralement via une bibliothèque externe)
        if (typeof NoSleep !== 'undefined') {
            noSleep = new NoSleep();
            console.log("Système anti-veille (NoSleep) initialisé");
            
            // Activer NoSleep au premier clic
            const enableNoSleep = () => {
                noSleep.enable();
                document.removeEventListener('click', enableNoSleep);
            };
            
            document.addEventListener('click', enableNoSleep);
        } else {
            console.log("La bibliothèque NoSleep n'est pas disponible");
        }
    } catch (error) {
        console.error("Erreur lors de l'initialisation du système anti-veille:", error);
    }
}

/**
 * Initialise la synthèse vocale
 */
function initSpeechSynthesis() {
    try {
        // Vérifier si l'API de synthèse vocale est disponible
        if ('speechSynthesis' in window) {
            console.log("API de synthèse vocale disponible");
            
            // Obtenir une référence à l'API
            const synth = window.speechSynthesis;
            
            // Charger les voix disponibles
            let voices = synth.getVoices();
            
            // Si les voix ne sont pas immédiatement disponibles
            if (voices.length === 0) {
                console.log("Chargement des voix...");
                
                // Définir un gestionnaire pour l'événement voiceschanged
                synth.onvoiceschanged = function() {
                    voices = synth.getVoices();
                    populateVoiceList(voices);
                    selectBestFrenchVoice(voices);
                };
            } else {
                populateVoiceList(voices);
                selectBestFrenchVoice(voices);
            }
            
            // Configurer les contrôles audio si disponibles
            if (audioToggle) {
                audioToggle.checked = true;
            }
            
            if (volumeSlider) {
                volumeSlider.value = 0.8; // Volume par défaut
            }
            
            console.log("Synthèse vocale initialisée");
        } else {
            console.warn("La synthèse vocale n'est pas supportée par ce navigateur");
            
            // Désactiver les contrôles audio
            if (audioToggle) {
                audioToggle.checked = false;
                audioToggle.disabled = true;
            }
        }
    } catch (error) {
        console.error("Erreur lors de l'initialisation de la synthèse vocale:", error);
    }
}

/**
 * Peuple la liste des voix disponibles
 */
function populateVoiceList(voices) {
    // Vérifier si le sélecteur existe
    if (!voiceSelect) return;
    
    // Vider la liste existante
    voiceSelect.innerHTML = '';
    
    // Ajouter chaque voix à la liste
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.setAttribute('data-index', index);
        voiceSelect.appendChild(option);
    });
    
    console.log(`Liste de voix mise à jour avec ${voices.length} voix`);
}

/**
 * Sélectionne la meilleure voix française disponible
 */
function selectBestFrenchVoice(voices) {
    // Filtrer les voix françaises
    const frenchVoices = voices.filter(voice => 
        voice.lang && voice.lang.toLowerCase().includes('fr')
    );
    
    if (frenchVoices.length > 0) {
        // Trouver une voix de qualité premium si possible
        const premiumVoice = frenchVoices.find(voice => 
            voice.name.toLowerCase().includes('premium') || 
            voice.name.toLowerCase().includes('enhanced')
        );
        
        const selectedVoice = premiumVoice || frenchVoices[0];
        const index = voices.indexOf(selectedVoice);
        
        // Sélectionner la voix dans la liste déroulante
        if (voiceSelect) {
            for (let i = 0; i < voiceSelect.options.length; i++) {
                const optionIndex = parseInt(voiceSelect.options[i].getAttribute('data-index'));
                if (optionIndex === index) {
                    voiceSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        console.log(`Voix française sélectionnée: ${selectedVoice.name}`);
    } else if (voices.length > 0) {
        // Si aucune voix française n'est disponible, utiliser la première voix
        console.log(`Aucune voix française disponible, utilisation de: ${voices[0].name}`);
    } else {
        console.warn("Aucune voix disponible");
    }
}

/**
 * Configure tous les écouteurs d'événements
 */
function setupEventListeners() {
    console.log("Configuration des écouteurs d'événements...");
    
    // Boutons de navigation
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            console.log("Bouton de démarrage cliqué");
            showPage(2);
        });
    }
    
    if (startCoherenceBtn) {
        startCoherenceBtn.addEventListener('click', function() {
            console.log("Bouton de cohérence cardiaque cliqué");
            startCoherenceCardiaque();
        });
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            console.log("Bouton de redémarrage cliqué");
            showPage(2);
        });
    }
    
    if (homeBtn) {
        homeBtn.addEventListener('click', function() {
            console.log("Bouton d'accueil cliqué");
            showPage(1);
        });
    }
    
    // Contrôles audio
    if (audioToggle) {
        audioToggle.addEventListener('change', function() {
            console.log(`Synthèse vocale ${this.checked ? 'activée' : 'désactivée'}`);
            
            // Si désactivée, arrêter toute synthèse en cours
            if (!this.checked && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        });
    }
    
    if (voiceSelect) {
        voiceSelect.addEventListener('change', function() {
            console.log("Voix changée");
        });
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            console.log(`Volume ajusté: ${this.value}`);
        });
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
    
    console.log("Écouteurs d'événements configurés");
}

/**
 * Ajuste l'affichage pour les appareils mobiles
 */
function adjustForMobile() {
    const isMobile = window.innerWidth < 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
        console.log("Styles mobile appliqués");
    }
    
    // Écouteur pour les changements d'orientation
    window.addEventListener('resize', function() {
        if (window.innerWidth < 768) {
            document.body.classList.add('mobile-device');
        } else {
            document.body.classList.remove('mobile-device');
        }
    });
}

/**
 * Fonction pour créer la structure de l'application
 */
function createAppStructure() {
    console.log("Création de la structure de l'application...");
    
    try {
        // Vérifier si la structure existe déjà
        if (document.getElementById('hypnorelax-app')) {
            console.log("Structure de l'application déjà existante");
            return true;
        }
        
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
            
            <!-- Page Induction -->
            <div class="page" id="page3">
                <header>
                    <h1>Induction</h1>
                </header>
                <div id="inductionInstruction" class="instruction">Fixez le centre de la spirale et laissez-vous guider vers un état de détente profonde...</div>
                <div id="inductionCounter" class="counter"></div>
                <div class="spiral-container">
                    <div class="spiral"></div>
                    <div class="spiral-center"></div>
                    <div class="focus-dot"></div>
                </div>
            </div>
            
            <!-- Page Approfondissement -->
            <div class="page" id="page4">
                <header>
                    <h1>Approfondissement</h1>
                </header>
                <div id="deepeningInstruction" class="instruction">Descendez les marches, une à une, vous enfonçant de plus en plus profondément dans l'état hypnotique...</div>
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
            
            <!-- Page Exploration -->
            <div class="page" id="page5">
                <header>
                    <h1>Exploration</h1>
                </header>
                <div id="explorationInstruction" class="instruction">Explorez votre monde intérieur, profitez pleinement de cet état de calme et de présence...</div>
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
            
            <!-- Page Réveil -->
            <div class="page" id="page6">
                <header>
                    <h1>Réveil</h1>
                </header>
                <div id="awakeningCounter" class="counter"></div>
                <div id="energyScene" class="energy-scene">
                    <div class="energy-glow"></div>
                </div>
            </div>
            
            <!-- Page Finale -->
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
        
        // Créer un élément pour contenir l'application
        const appContainer = document.createElement('div');
        appContainer.id = 'hypnorelax-app';
        appContainer.innerHTML = appHTML;
        
        // Nettoyer le body avant d'ajouter l'application
        document.body.innerHTML = '';
        document.body.appendChild(appContainer);
        
        // Charger les styles nécessaires s'ils ne sont pas déjà présents
        loadStyleIfNeeded('styles.css');
        loadStyleIfNeeded('mobile-optimization.css');
        
        console.log("Structure de l'application créée avec succès");
        return true;
    } catch (error) {
        console.error("Erreur lors de la création de la structure de l'application:", error);
        return false;
    }
}

/**
 * Charge une feuille de style si elle n'est pas déjà chargée
 */
function loadStyleIfNeeded(href) {
    if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
        console.log(`Feuille de style ${href} chargée`);
    }
}

/**
 * Affiche une page spécifique et met à jour l'interface
 */
function showPage(pageNumber) {
    console.log(`Affichage de la page ${pageNumber}`);
    
    try {
        // Vérifier que les pages existent
        if (!pages || pages.length === 0) {
            // Essayer de récupérer les pages si elles n'ont pas été trouvées lors de l'initialisation
            pages = document.querySelectorAll('.page');
            if (!pages || pages.length === 0) {
                console.error("Éléments de page non trouvés");
                return false;
            }
        }
        
        // Masquer toutes les pages
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
            
            // Parler si la synthèse vocale est activée
            speak(getPageIntroText(pageNumber));
            
            // Démarrer les animations spécifiques à la page
            startPageAnimations(pageNumber);
            
            return true;
        } else {
            console.error(`Page ${pageNumber} non trouvée`);
            return false;
        }
    } catch (error) {
        console.error(`Erreur lors de l'affichage de la page ${pageNumber}:`, error);
        return false;
    }
}

/**
 * Met à jour l'affichage des étapes
 */
function updateSteps(currentStep) {
    try {
        // Si les étapes n'ont pas été trouvées lors de l'initialisation
        if (!steps || steps.length === 0) {
            steps = document.querySelectorAll('.step');
        }
        
        // Si progressFill n'a pas été trouvé
        if (!progressFill) {
            progressFill = document.getElementById('progressFill');
        }
        
        // Mettre à jour les classes des étapes
        steps.forEach(step => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            if (stepNumber <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Mettre à jour la barre de progression
        if (progressFill && steps.length > 0) {
            const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
            progressFill.style.width = `${progress}%`;
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour des étapes:", error);
    }
}

/**
 * Renvoie le texte d'introduction pour une page donnée
 */
function getPageIntroText(pageNumber) {
    switch (pageNumber) {
        case 1:
            return "Bienvenue dans Hypnorelax. Cette application vous guidera à travers une séance d'auto-hypnose pour vous aider à atteindre un état de détente et de bien-être.";
        case 2:
            return "Commençons par une courte séance de cohérence cardiaque pour calmer votre système nerveux et préparer votre esprit.";
        case 3:
            return "Phase d'induction hypnotique. Fixez le centre de la spirale et laissez-vous guider vers un état de détente profonde.";
        case 4:
            return "Phase d'approfondissement. Descendez les marches, une à une, vous enfonçant de plus en plus profondément dans l'état hypnotique.";
        case 5:
            return "Phase d'exploration. Explorez votre monde intérieur, profitez pleinement de cet état de calme et de présence.";
        case 6:
            return "Phase de réveil. Préparez-vous à revenir progressivement à un état de conscience ordinaire.";
        case 7:
            return "Félicitations, vous avez terminé votre séance d'auto-hypnose. Prenez un moment pour apprécier cet état de relaxation profonde.";
        default:
            return "";
    }
}

/**
 * Démarre les animations spécifiques à une page
 */
function startPageAnimations(pageNumber) {
    try {
        switch (pageNumber) {
            case 3:
                // Animation de spirale d'induction
                if (inductionInstruction && inductionCounter) {
                    startInductionAnimation();
                }
                break;
            case 4:
                // Animation d'escalier d'approfondissement
                if (deepeningInstruction && stairsCounter) {
                    startStairsAnimation();
                }
                break;
            case 5:
                // Animation d'exploration
                if (explorationInstruction && explorationProgress) {
                    startExplorationAnimation();
                }
                break;
            case 6:
                // Animation de réveil
                if (awakeningCounter && energyScene) {
                    startAwakeningAnimation();
                }
                break;
        }
    } catch (error) {
        console.error("Erreur lors du démarrage des animations:", error);
    }
}

/**
 * Démarre la séance de cohérence cardiaque
 */
function startCoherenceCardiaque() {
    console.log("Démarrage de la cohérence cardiaque");
    
    try {
        // Masquer l'introduction et afficher l'animation
        if (coherenceIntro) coherenceIntro.style.display = 'none';
        if (coherenceContainer) coherenceContainer.style.display = 'block';
        if (timerDisplay) timerDisplay.style.display = 'block';
        if (coherenceInstruction) coherenceInstruction.style.display = 'block';
        
        // Initialiser le timer
        secondsRemaining = 120; // 2 minutes
        updateTimerDisplay();
        
        // Démarrer l'animation de respiration
        startBreathingAnimation();
        
        // Synthèse vocale pour guider l'utilisateur
        speak("Suivez le rythme. Inspirez pendant 5 secondes quand le cercle s'agrandit, puis expirez pendant 5 secondes quand il se rétrécit.");
        
        // Activer les sons binauraux si le bouton est activé
        const binauralToggle = document.getElementById('binauralToggle');
        if (binauralToggle && binauralToggle.checked) {
            startBinauralBeats();
        }
        
        // Démarrer le décompte
        coherenceTimer = setTimeout(() => {
            finishCoherenceCardiaque();
        }, secondsRemaining * 1000);
        
        // Mettre à jour le timer chaque seconde
        coherenceInterval = setInterval(() => {
            secondsRemaining--;
            updateTimerDisplay();
            
            // Messages vocaux à des moments spécifiques
            if (audioToggle && audioToggle.checked) {
                if (secondsRemaining === 90) {
                    speak("Vous faites très bien. Continuez à respirer calmement.");
                } else if (secondsRemaining === 45) {
                    speak("Encore quelques respirations. Sentez comme votre corps et votre esprit se détendent.");
                } else if (secondsRemaining === 15) {
                    speak("Dernières respirations. Préparez-vous à continuer votre voyage.");
                }
            }
        }, 1000);
        
        return true;
    } catch (error) {
        console.error("Erreur lors du démarrage de la cohérence cardiaque:", error);
        return false;
    }
}

/**
 * Met à jour l'affichage du timer
 */
function updateTimerDisplay() {
    try {
        if (!timerDisplay) return;
        
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = secondsRemaining % 60;
        
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du timer:", error);
    }
}

/**
 * Démarre l'animation de respiration pour la cohérence cardiaque
 */
function startBreathingAnimation() {
    try {
        if (!breathCircle || !breathInLabel || !breathOutLabel || !coherenceInstruction) return;
        
        const breathDuration = 5000; // 5 secondes pour inspirer, 5 secondes pour expirer
        
        // Fonction pour animer un cycle de respiration
        function animateBreathCycle() {
            // Phase d'inspiration
            coherenceInstruction.textContent = "Inspirez profondément...";
            breathInLabel.style.opacity = "1";
            breathOutLabel.style.opacity = "0";
            
            breathCircle.style.transition = `all ${breathDuration}ms cubic-bezier(0.5, 0, 0.5, 1)`;
            breathCircle.style.transform = 'translate(-50%, -50%) scale(3)';
            
            // Phase d'expiration après breathDuration ms
            setTimeout(() => {
                coherenceInstruction.textContent = "Expirez lentement...";
                breathInLabel.style.opacity = "0";
                breathOutLabel.style.opacity = "1";
                
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
    } catch (error) {
        console.error("Erreur lors du démarrage de l'animation de respiration:", error);
    }
}

/**
 * Termine la séance de cohérence cardiaque et passe à l'étape suivante
 */
function finishCoherenceCardiaque() {
    try {
        console.log("Fin de la cohérence cardiaque");
        
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
        speak("Excellent. Vous avez terminé la cohérence cardiaque. Nous allons maintenant passer à l'induction hypnotique.");
        
        // Passer à l'étape suivante après un court délai
        setTimeout(() => {
            showPage(3); // Page d'induction
        }, 3000);
    } catch (error) {
        console.error("Erreur lors de la fin de la cohérence cardiaque:", error);
    }
}

/**
 * Démarre l'animation d'induction
 */
function startInductionAnimation() {
    try {
        // Compteur de 10 à 1
        let count = 10;
        
        // Afficher le premier nombre
        inductionCounter.textContent = count;
        speak(count.toString());
        
        // Décompte
        const inductionInterval = setInterval(() => {
            count--;
            
            // Afficher le nombre
            inductionCounter.textContent = count;
            speak(count.toString());
            
            // Quand le décompte est terminé
            if (count <= 0) {
                clearInterval(inductionInterval);
                
                // Masquer le compteur
                inductionCounter.style.opacity = '0';
                
                // Message de transition
                setTimeout(() => {
                    speak("Vous êtes maintenant dans un état de relaxation profonde. Nous allons approfondir cet état.");
                    
                    // Passer à l'étape suivante après un délai
                    setTimeout(() => {
                        showPage(4); // Page d'approfondissement
                    }, 5000);
                }, 2000);
            }
        }, 3000); // Un nombre toutes les 3 secondes
        
        // Stocker l'intervalle
        allIntervals.add(inductionInterval);
    } catch (error) {
        console.error("Erreur lors de l'animation d'induction:", error);
    }
}

/**
 * Démarre l'animation d'escalier pour l'approfondissement
 */
function startStairsAnimation() {
    try {
        // Décompte de 10 à 1 pour les marches
        let count = 10;
        
        // Afficher le premier nombre
        stairsCounter.textContent = count;
        speak(`Marche ${count}`);
        
        // Décompte
        const stairsInterval = setInterval(() => {
            count--;
            
            // Afficher le nombre
            stairsCounter.textContent = count;
            speak(`Marche ${count}`);
            
            // Quand le décompte est terminé
            if (count <= 0) {
                clearInterval(stairsInterval);
                
                // Masquer le compteur
                stairsCounter.style.opacity = '0';
                
                // Message de transition
                setTimeout(() => {
                    speak("Vous êtes maintenant dans un état d'hypnose profonde. Prenons le temps d'explorer cet espace intérieur.");
                    
                    // Passer à l'étape suivante après un délai
                    setTimeout(() => {
                        showPage(5); // Page d'exploration
                    }, 5000);
                }, 2000);
            }
        }, 3000); // Une marche toutes les 3 secondes
        
        // Stocker l'intervalle
        allIntervals.add(stairsInterval);
    } catch (error) {
        console.error("Erreur lors de l'animation d'escalier:", error);
    }
}

/**
 * Démarre l'animation d'exploration
 */
function startExplorationAnimation() {
    try {
        // Rendre la scène d'exploration visible avec une transition
        const explorationScene = document.querySelector('.exploration-scene');
        if (explorationScene) {
            explorationScene.style.opacity = '1';
        }
        
        // Animer la barre de progression
        if (explorationProgress) {
            let progress = 0;
            
            const progressInterval = setInterval(() => {
                progress += 1;
                explorationProgress.style.width = `${progress}%`;
                
                // Messages d'exploration à différents moments
                if (progress === 25) {
                    speak("Observez ce qui se passe dans votre esprit. Laissez venir les images, les sensations, sans les juger.");
                } else if (progress === 50) {
                    speak("Vous pouvez explorer cet espace intérieur en toute sécurité. Prenez conscience des ressources qui sont disponibles ici.");
                } else if (progress === 75) {
                    speak("Dans quelques instants, nous allons commencer à revenir progressivement à l'état de veille.");
                }
                
                // Fin de l'exploration
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    // Message de transition
                    setTimeout(() => {
                        speak("Il est maintenant temps de revenir progressivement. Préparons-nous au réveil.");
                        
                        // Passer à l'étape suivante après un délai
                        setTimeout(() => {
                            showPage(6); // Page de réveil
                        }, 3000);
                    }, 2000);
                }
            }, 300); // Mise à jour toutes les 300ms pour une durée totale d'environ 30 secondes
            
            // Stocker l'intervalle
            allIntervals.add(progressInterval);
        }
    } catch (error) {
        console.error("Erreur lors de l'animation d'exploration:", error);
    }
}

/**
 * Démarre l'animation de réveil
 */
function startAwakeningAnimation() {
    try {
        // Rendre la scène d'énergie visible
        if (energyScene) {
            energyScene.style.opacity = '1';
        }
        
        // Décompte de 1 à 5 pour le réveil
        let count = 1;
        
        // Afficher le premier nombre
        awakeningCounter.textContent = count;
        speak(`Un. Vous commencez à ressentir de l'énergie revenir dans votre corps.`);
        
        // Incrémentation
        const awakeningInterval = setInterval(() => {
            count++;
            
            // Afficher le nombre
            awakeningCounter.textContent = count;
            
            // Messages spécifiques pour chaque étape
            switch (count) {
                case 2:
                    speak("Deux. Votre esprit devient de plus en plus alerte.");
                    break;
                case 3:
                    speak("Trois. Vous pouvez commencer à bouger légèrement vos doigts et vos orteils.");
                    break;
                case 4:
                    speak("Quatre. Prenez une grande inspiration et sentez l'énergie circuler dans tout votre corps.");
                    break;
                case 5:
                    speak("Cinq. Vous êtes maintenant complètement éveillé, détendu et revitalisé.");
                    break;
            }
            
            // Quand le décompte est terminé
            if (count >= 5) {
                clearInterval(awakeningInterval);
                
                // Message de fin
                setTimeout(() => {
                    // Passer à la page finale
                    showPage(7);
                }, 3000);
            }
        }, 5000); // 5 secondes entre chaque étape
        
        // Stocker l'intervalle
        allIntervals.add(awakeningInterval);
    } catch (error) {
        console.error("Erreur lors de l'animation de réveil:", error);
    }
}

/**
 * Fonction pour démarrer les sons binauraux
 */
function startBinauralBeats() {
    try {
        console.log("Démarrage des sons binauraux");
        
        // Vérifier si l'API Web Audio est disponible
        if (!window.AudioContext && !window.webkitAudioContext) {
            console.warn("L'API Web Audio n'est pas supportée");
            return false;
        }
        
        // Si les sons sont déjà actifs, ne rien faire
        if (binauralActive) {
            return true;
        }
        
        // Initialiser le contexte audio s'il n'existe pas déjà
        if (!binauralContext) {
            binauralContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Nettoyer les oscillateurs existants
        if (binauralOscillators.length > 0) {
            stopBinauralBeats();
        }
        
        // Créer un contrôleur de volume principal
        binauralGain = binauralContext.createGain();
        binauralGain.gain.value = binauralVolume;
        binauralGain.connect(binauralContext.destination);
        
        // Fréquence de base pour la relaxation profonde
        const baseFrequency = 200; // 200 Hz comme fréquence porteuse
        const binauralBeat = 6; // 6 Hz (plage thêta pour la méditation)
        
        // Oscillateur gauche
        const leftOsc = binauralContext.createOscillator();
        leftOsc.type = 'sine';
        leftOsc.frequency.value = baseFrequency;
        
        // Oscillateur droit
        const rightOsc = binauralContext.createOscillator();
        rightOsc.type = 'sine';
        rightOsc.frequency.value = baseFrequency + binauralBeat;
        
        // Séparation stéréo
        const merger = binauralContext.createChannelMerger(2);
        
        // Contrôleurs de volume individuels
        const leftGain = binauralContext.createGain();
        const rightGain = binauralContext.createGain();
        
        leftGain.gain.value = 0.5;
        rightGain.gain.value = 0.5;
        
        // Connecter les oscillateurs aux gains
        leftOsc.connect(leftGain);
        rightOsc.connect(rightGain);
        
        // Connecter les gains au merger stéréo
        leftGain.connect(merger, 0, 0); // Canal gauche
        rightGain.connect(merger, 0, 1); // Canal droit
        
        // Connecter le merger au gain principal
        merger.connect(binauralGain);
        
        // Démarrer les oscillateurs avec une montée progressive du volume
        binauralGain.gain.setValueAtTime(0, binauralContext.currentTime);
        binauralGain.gain.linearRampToValueAtTime(binauralVolume, binauralContext.currentTime + 2);
        
        leftOsc.start();
        rightOsc.start();
        
        // Stocker les références pour pouvoir les arrêter plus tard
        binauralOscillators.push(leftOsc, rightOsc);
        
        // Marquer les sons binauraux comme actifs
        binauralActive = true;
        
        console.log("Sons binauraux démarrés avec succès");
        return true;
    } catch (error) {
        console.error("Erreur lors du démarrage des sons binauraux:", error);
        return false;
    }
}

/**
 * Fonction pour arrêter les sons binauraux
 */
function stopBinauralBeats() {
    try {
        console.log("Arrêt des sons binauraux");
        
        if (!binauralActive || !binauralContext) {
            return;
        }
        
        // Arrêter progressivement
        if (binauralGain) {
            binauralGain.gain.linearRampToValueAtTime(0, binauralContext.currentTime + 1);
        }
        
        // Arrêter les oscillateurs après la baisse de volume
        setTimeout(() => {
            binauralOscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (e) {
                    // Ignorer les erreurs si l'oscillateur est déjà arrêté
                }
            });
            
            binauralOscillators = [];
            binauralActive = false;
            
            console.log("Sons binauraux arrêtés avec succès");
        }, 1000);
    } catch (error) {
        console.error("Erreur lors de l'arrêt des sons binauraux:", error);
    }
}

/**
 * Met à jour le volume des sons binauraux
 */
function updateBinauralVolume(volume) {
    try {
        binauralVolume = volume;
        
        if (binauralGain) {
            binauralGain.gain.setValueAtTime(binauralGain.gain.value, binauralContext.currentTime);
            binauralGain.gain.linearRampToValueAtTime(volume, binauralContext.currentTime + 0.5);
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour du volume binaural:", error);
    }
}

/**
 * Fonction de synthèse vocale simplifiée
 */
function speak(text) {
    try {
        // Vérifier si la synthèse vocale est activée
        if (!audioToggle || !audioToggle.checked || !text) {
            return;
        }
        
        // Vérifier si l'API est disponible
        if (!('speechSynthesis' in window)) {
            console.warn("API de synthèse vocale non disponible");
            return;
        }
        
        // Créer un nouvel énoncé
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Définir la voix si le sélecteur existe
        if (voiceSelect && voiceSelect.selectedIndex >= 0) {
            const voices = speechSynthesis.getVoices();
            const selectedOption = voiceSelect.options[voiceSelect.selectedIndex];
            const index = parseInt(selectedOption.getAttribute('data-index'));
            
            if (!isNaN(index) && index >= 0 && index < voices.length) {
                utterance.voice = voices[index];
            }
        }
        
        // Définir le volume
        if (volumeSlider) {
            utterance.volume = parseFloat(volumeSlider.value);
        } else {
            utterance.volume = 0.8; // Volume par défaut
        }
        
        // Autres paramètres
        utterance.rate = 0.9; // Légèrement plus lent que la normale
        utterance.pitch = 1.0;
        
        // Forcer la langue française
        utterance.lang = 'fr-FR';
        
        // Événements
        utterance.onstart = function() {
            if (speakingIndicator) {
                speakingIndicator.classList.add('active');
            }
            speakingInProgress = true;
        };
        
        utterance.onend = function() {
            if (speakingIndicator) {
                speakingIndicator.classList.remove('active');
            }
            speakingInProgress = false;
        };
        
        // Prononcer le texte
        speechSynthesis.speak(utterance);
    } catch (error) {
        console.error("Erreur lors de la synthèse vocale:", error);
    }
}

/**
 * Fonction sécurisée pour setTimeout qui garde une référence
 */
function safeSetTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
        callback();
        allTimeouts.delete(timeoutId);
    }, delay);
    
    allTimeouts.add(timeoutId);
    return timeoutId;
}

/**
 * Fonction sécurisée pour setInterval qui garde une référence
 */
function safeSetInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    allIntervals.add(intervalId);
    return intervalId;
}

/**
 * Fonction pour nettoyer tous les timeouts enregistrés
 */
function clearAllTimeouts() {
    allTimeouts.forEach(id => {
        clearTimeout(id);
    });
    allTimeouts.clear();
}

/**
 * Fonction pour nettoyer tous les intervalles enregistrés
 */
function clearAllIntervals() {
    allIntervals.forEach(id => {
        clearInterval(id);
    });
    allIntervals.clear();
}

// Exporter les fonctions principales
window.createAppStructure = createAppStructure;
window.initializeApp = initializeApp;
window.showPage = showPage;
window.startCoherenceCardiaque = startCoherenceCardiaque;
