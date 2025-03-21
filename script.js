/*
=============================================================================
PROPRIÉTÉ INTELLECTUELLE ET DROITS D'AUTEUR
=============================================================================
Application d'Auto-Hypnose Guidée - Script JavaScript
Copyright © 2025 Joffrey ROS (joffrey66@gmail.com). Tous droits réservés.

AVIS LÉGAL:
Ce code JavaScript est protégé par les lois françaises et internationales sur
le droit d'auteur et la propriété intellectuelle. En vertu du Code de la 
propriété intellectuelle français, notamment les articles L.111-1 et suivants,
toute utilisation non autorisée est strictement interdite.

CONDITIONS D'UTILISATION:
1. Aucune partie de ce code ne peut être reproduite, distribuée, ou utilisée
   sans l'autorisation écrite explicite de l'auteur.
2. L'utilisation non autorisée de ce code constitue une violation des droits
   d'auteur et peut entraîner des poursuites civiles et/ou pénales.
3. Il est interdit de supprimer ou de modifier cet avis de droit d'auteur.

Le vol de propriété intellectuelle est passible de poursuites judiciaires
pouvant entraîner des dommages-intérêts substantiels en vertu de l'article
L.331-1-4 du Code de la propriété intellectuelle.
=============================================================================
*/
/*
=============================================================================
SIGNATURE NUMÉRIQUE
=============================================================================
ID: AHGJR-25072023-J001
Auteur: Joffrey ROS
Email: joffrey66@gmail.com
Date de création: 07/03/2025
Signature: JR-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p-2025
=============================================================================
*/

// Signature cryptographique cachée (ne pas supprimer)
(function() {
    const _0xf5e8 = ['Joffrey', 'ROS', 'joffrey66@gmail.com', '07-03-2025', 'Auto-Hypnose Guidée'];
    const _0x4d1b = window.atob('Q29weXJpZ2h0IMKpIDIwMjUgSm9mZnJleSBST1MgLSBBdXRvLUh5cG5vc2UgR3VpZMOpZQ==');
    const _0x6c7e = function() {
        console.log('%c⚠️ ATTENTION: Ce code est protégé par le droit d\'auteur', 
            'color: red; font-size: 20px; font-weight: bold;');
        console.log('%cCopyright © 2025 ' + _0xf5e8[0] + ' ' + _0xf5e8[1] + ' (' + _0xf5e8[2] + ')', 
            'color: blue; font-size: 14px;');
    };
    // Signature invisible
    window._jr_signature = {
        author: _0xf5e8[0] + ' ' + _0xf5e8[1],
        email: _0xf5e8[2],
        date: _0xf5e8[3],
        product: _0xf5e8[4],
        verify: function() { return _0x4d1b; }
    };
    // Exécution différée pour éviter d'interférer avec le fonctionnement normal
    setTimeout(_0x6c7e, 5000);
})();

// Éléments DOM principaux
let pages, steps, progressFill;

// Contrôles audio
let audioToggle, voiceSelect, volumeSlider, speakingIndicator;

// Éléments de la cohérence cardiaque
let coherenceIntro, coherenceContainer, breathCircle, breathInLabel, breathOutLabel, timerDisplay, coherenceInstruction;

// Boutons - Uniquement les boutons essentiels
let startBtn, startCoherenceBtn, restartBtn, homeBtn;

// Autres éléments
let inductionInstruction, inductionCounter, deepeningInstruction, stairsCounter, explorationInstruction, awakeningCounter, energyScene;

// === SYSTÈME ANTI-VEILLE MULTI-COUCHE ===

// Système 1: NoSleep.js
let noSleep = null;

// Système 2: API Wake Lock native
let wakeLock = null;

// Système 3: Audio/Vidéo en arrière-plan
let keepAwakeMedia = null;

// Système 4: Interval de rafraîchissement
let refreshInterval = null;

// Variables pour les sons binauraux
let binauralContext = null;
let binauralOscillators = [];
let binauralGain = null;
let binauralVolume = 0.2; // Volume par défaut
let binauralActive = false; // Suivi de l'état du son binaural

// Variables globales pour la gestion des timeouts et des intervalles
const allTimeouts = new Set();
const allIntervals = new Set();

// Variables d'état
let currentPage = 1;
let speakingInProgress = false;
let coherenceTimer;
let coherenceInterval;
let secondsRemaining = 120;

// Système amélioré de gestion des files d'attente pour la synthèse vocale
let speechQueue = [];
let isSpeaking = false;
let waitingForNextSpeech = false;

// === NOUVELLES VARIABLES POUR LA GESTION AMÉLIORÉE DE LA VOIX ===
let voiceInitRetryCount = 0;
const maxVoiceInitRetries = 5;
let voiceInitTimer = null;
let lastSpeechTime = 0;
let voiceKeepAliveInterval = null;
let speechFailureCount = 0;
const maxSpeechFailures = 3;
let voiceDebounceTimer = null;
let lastSelectedVoiceName = '';
let speechEngineReady = false;

// Fonction sécurisée pour setTimeout qui garde une référence
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

// Fonction sécurisée pour setInterval qui garde une référence
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

// Fonction pour nettoyer tous les timeouts enregistrés
function clearAllTimeouts() {
    try {
        allTimeouts.forEach(id => {
            clearTimeout(id);
        });
        allTimeouts.clear();
        
        // Nettoyage supplémentaire pour les timeouts non suivis
        const highestId = setTimeout(() => {}, 0);
        for (let i = 1; i <= highestId; i++) {
            clearTimeout(i);
        }
    } catch (error) {
        console.error("Erreur lors du nettoyage des timeouts:", error);
    }
}

// Fonction pour nettoyer tous les intervalles enregistrés
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

// Initialisation améliorée de la synthèse vocale
const speech = {
    synth: null,
    voices: [],
    selectedVoice: null,
    volume: 0.8,  // Volume par défaut
    rate: 0.82,   // Vitesse légèrement ajustée pour plus de stabilité
    pitch: 1.0,   // Contrôle du pitch pour améliorer la fluidité
    pauseBetweenSentences: 350, // Pause entre les phrases (en ms)
    resumeTimer: null,
    utteranceQueue: [], // Pour suivre les utterances en cours
    lastInitTime: 0,
    initAttempts: 0,
    maxInitAttempts: 5,
    failbackVoiceUsed: false,
    
    // Textes spécifiques avec prononciation améliorée
    pronunciationFixes: {
        "vous entrez": "vouZentrez",
        "vous enfonçant": "vouZenfonçant",
        "nous arriverons": "nouZarriverons",
        "de l'air": "delair",
        "vous apaise": "vouZapaise",
        "vous ancrez": "vouZancrez",
        "vous enveloppent": "vouZenveloppent",
        "est ici": "estici",
        "état profonde": "état profond",
        "marche un": "marche une",
        "petit à petit": "petiTapeti",
        "bien être": "bien nêtre",
        "peu à peu": "peuWapeu",
        "plus en plus": "pluZenplu",
        "de plus en plus": "deplussenplu",
        "étape par étape": "étappareétap",
        "profond et": "profonTé",
        "grand air": "granTair",
        "grand écran": "granTécran",
        "second état": "segonTéta"
    },
    
    // AMÉLIORÉ: Plus de substitutions de prononciation pour le français
    frenchPhoneticFixes: {
        "aient": "è",
        "ais": "è",
        "ait": "è",
        "dans un": "dan-zun",
        "en un": "en-nun",
        "vingt": "vin",
        "second": "segon",
        "instinct": "instein",
        "indistinct": "indistein"
    },
    
    // Convertir un nombre en texte français
    numberToFrenchText: function(number) {
        const numberWords = {
            0: "zéro",
            1: "un",
            2: "deux",
            3: "trois",
            4: "quatre",
            5: "cinq",
            6: "six",
            7: "sept",
            8: "huit",
            9: "neuf",
            10: "dix"
        };
        
        // Retourner le mot correspondant ou le nombre lui-même en texte
        return numberWords[number] || number.toString();
    },
    
    init: function() {
        try {
            // Mémoriser le temps d'initialisation
            this.lastInitTime = Date.now();
            this.initAttempts++;
            
            // Initialiser la synthèse vocale
            if (!this.synth) {
                this.synth = window.speechSynthesis;
            }
            
            // Vérifier si la synthèse vocale est disponible
            if (!this.synth) {
                console.warn("SpeechSynthesis API non disponible dans ce navigateur");
                if (audioToggle) {
                    audioToggle.checked = false;
                    audioToggle.disabled = true;
                }
                return false;
            }
            
            // NOUVEAU: Réinitialiser l'état de la synthèse vocale
            this.synth.cancel();
            
            // Fonction pour charger les voix avec tentatives multiples et délai progressif
            const loadVoices = () => {
                console.log(`Tentative ${this.initAttempts} de chargement des voix`);
                
                // Récupérer toutes les voix disponibles
                const availableVoices = this.synth.getVoices();
                
                if (availableVoices && availableVoices.length > 0) {
                    this.voices = availableVoices;
                    console.log(`${this.voices.length} voix disponibles`);
                    
                    // NOUVEAU: Montrer plus d'informations sur les voix en debug
                    this.voices.forEach((voice, index) => {
                        console.log(`Voix #${index}: ${voice.name} (${voice.lang}) - ${voice.localService ? 'Locale' : 'Distante'}`);
                    });
                    
                    // Peupler la liste et sélectionner la voix
                    this.populateVoiceList();
                    this.selectBestFrenchVoice();
                    
                    // Marquer l'initialisation comme réussie
                    speechEngineReady = true;
                    
                    // NOUVEAU: Mettre en place le mécanisme de keep-alive
                    this.setupVoiceKeepAlive();
                    
                    return true;
                }
                
                // Si pas de voix et max tentatives non atteint, réessayer avec un délai exponentiel
                if (this.initAttempts < this.maxInitAttempts) {
                    const delayMs = Math.min(2000 * Math.pow(1.5, this.initAttempts - 1), 10000);
                    console.log(`Pas de voix trouvée, nouvel essai dans ${delayMs}ms`);
                    
                    voiceInitTimer = setTimeout(() => {
                        this.init();
                    }, delayMs);
                } else {
                    console.warn(`Échec de chargement des voix après ${this.initAttempts} tentatives.`);
                    
                    // Utiliser une approche de fallback
                    this.useFallbackVoice();
                }
                
                return false;
            };
            
            // NOUVEAU: Essayer immédiatement, puis configurer l'événement onvoiceschanged
            if (!loadVoices() && this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = () => {
                    // Éviter les appels multiples trop rapprochés
                    if (Date.now() - this.lastInitTime > 500) {
                        this.lastInitTime = Date.now();
                        loadVoices();
                    }
                };
            }
            
            // Configurer les événements UI
            this.setupUIEvents();
            
            return true;
        } catch (error) {
            console.error('Erreur d\'initialisation de la synthèse vocale:', error);
            
            // Essayer de récupérer après une erreur
            if (this.initAttempts < this.maxInitAttempts) {
                const recoveryDelay = 2000 * this.initAttempts;
                console.log(`Tentative de récupération dans ${recoveryDelay}ms`);
                
                voiceInitTimer = setTimeout(() => {
                    this.init();
                }, recoveryDelay);
            } else {
                // Désactiver l'audio en cas d'échec persistant
                if (audioToggle) {
                    audioToggle.checked = false;
                }
            }
            
            return false;
        }
    },
    
    // NOUVEAU: Configuration des événements UI pour la synthèse vocale
    setupUIEvents: function() {
        try {
            // Écouteur pour le sélecteur de voix
            if (voiceSelect) {
                voiceSelect.addEventListener('change', () => {
                    const selectedIndex = voiceSelect.selectedIndex;
                    if (selectedIndex >= 0 && selectedIndex < voiceSelect.options.length) {
                        const voiceIndex = parseInt(voiceSelect.options[selectedIndex].getAttribute('data-voice-index'));
                        if (!isNaN(voiceIndex) && voiceIndex >= 0 && voiceIndex < this.voices.length) {
                            this.selectedVoice = this.voices[voiceIndex];
                            
                            // Mémoriser le nom de la voix sélectionnée
                            lastSelectedVoiceName = this.selectedVoice.name;
                            
                            // Enregistrer la préférence
                            this.saveVoicePreference(voiceIndex);
                            
                            // Tester la voix
                            this.speak("Cette voix a été sélectionnée");
                        }
                    }
                });
            }
            
            // Gestionnaire pour le contrôle du volume
            if (volumeSlider) {
                // Initialiser le slider
                volumeSlider.value = this.volume;
                volumeSlider.setAttribute('step', '0.05');
                
                // Écouter les changements
                volumeSlider.addEventListener('input', () => {
                    const newVolume = parseFloat(volumeSlider.value);
                    this.volume = newVolume;
                    
                    // Enregistrer la préférence
                    localStorage.setItem('voiceVolume', newVolume);
                    
                    // Mettre à jour l'UI
                    this.updateVolumeDisplay(newVolume);
                });
                
                // Tester le volume après changement
                volumeSlider.addEventListener('change', () => {
                    if (this.synth && !this.synth.speaking) {
                        this.speak("Volume ajusté");
                    }
                });
                
                // Charger préférence sauvegardée
                const savedVolume = localStorage.getItem('voiceVolume');
                if (savedVolume !== null) {
                    const parsedVolume = parseFloat(savedVolume);
                    if (!isNaN(parsedVolume) && parsedVolume >= 0 && parsedVolume <= 1) {
                        this.volume = parsedVolume;
                        volumeSlider.value = parsedVolume;
                        this.updateVolumeDisplay(parsedVolume);
                    }
                }
            }
            
            // NOUVEAU: Écouter les événements de visibilité du document
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    console.log("Document redevenu visible, réveiller la synthèse vocale");
                    
                    // Réinitialiser complètement en cas de problème
                    if (speechFailureCount > 0) {
                        this.resetSpeechEngine();
                    } else if (this.synth && this.synth.speaking) {
                        // Simple réveil si la synthèse est en cours
                        this.pingVoiceEngine();
                    }
                }
            });
        } catch (error) {
            console.error("Erreur lors de la configuration des événements UI:", error);
        }
    },
    
    // NOUVEAU: Utiliser une voix de fallback quand rien d'autre ne fonctionne
    useFallbackVoice: function() {
        try {
            console.warn("Activation du mode de fallback pour la synthèse vocale");
            
            // Marquer que nous utilisons une voix de fallback
            this.failbackVoiceUsed = true;
            
            // Même sans voix spécifique, on peut utiliser la synthèse vocale par défaut
            this.selectedVoice = null;
            
            // Alerte visuelle minimale
            if (voiceSelect) {
                voiceSelect.innerHTML = '<option value="-1">Mode dégradé actif</option>';
                voiceSelect.style.backgroundColor = '#fff3cd';
                voiceSelect.style.color = '#856404';
            }
            
            // Marquer que le moteur est prêt (en mode dégradé)
            speechEngineReady = true;
            
            // Configurer le mécanisme de keep-alive même en mode fallback
            this.setupVoiceKeepAlive();
            
            console.log("Mode de fallback vocal activé avec succès");
        } catch (error) {
            console.error("Erreur lors de l'activation du mode fallback:", error);
            
            // Dernier recours: désactiver l'audio
            if (audioToggle) {
                audioToggle.checked = false;
                audioToggle.disabled = true;
            }
        }
    },
    
    // NOUVEAU: Reset complet du moteur de synthèse vocale
    resetSpeechEngine: function() {
        try {
            console.log("Réinitialisation complète du moteur de synthèse vocale");
            
            // Annuler toutes les synthèses en cours
            if (this.synth) {
                this.synth.cancel();
            }
            
            // Nettoyer les intervalles et timers
            if (voiceKeepAliveInterval) {
                clearInterval(voiceKeepAliveInterval);
                voiceKeepAliveInterval = null;
            }
            
            if (voiceInitTimer) {
                clearTimeout(voiceInitTimer);
                voiceInitTimer = null;
            }
            
            if (this.resumeTimer) {
                clearTimeout(this.resumeTimer);
                this.resumeTimer = null;
            }
            
            // Réinitialiser les compteurs
            speechFailureCount = 0;
            this.initAttempts = 0;
            this.lastInitTime = 0;
            
            // Vider les files d'attente
            this.utteranceQueue = [];
            speechQueue = [];
            isSpeaking = false;
            waitingForNextSpeech = false;
            speakingInProgress = false;
            
            // Réinitialiser l'état visuel
            if (speakingIndicator) {
                speakingIndicator.classList.remove('active');
            }
            
            // Réinitialiser complètement
            speechEngineReady = false;
            this.synth = null;
            this.voices = [];
            this.selectedVoice = null;
            
            // Petit délai puis relancer l'initialisation
            setTimeout(() => {
                this.init();
            }, 500);
            
            console.log("Réinitialisation du moteur de synthèse vocale terminée");
        } catch (error) {
            console.error("Erreur lors de la réinitialisation du moteur vocal:", error);
        }
    },
    
    // AMÉLIORÉ: Sélection de la meilleure voix française disponible
    selectBestFrenchVoice: function() {
        try {
            // Priorité des voix françaises:
            // 1. Voix précédemment sélectionnée par l'utilisateur
            // 2. Voix neuronales/premium françaises
            // 3. Voix natives françaises
            // 4. Autres voix françaises
            // 5. Première voix disponible (fallback)
            
            // Filtrer toutes les voix françaises (inclut fr-FR, fr-CA, etc.)
            const frenchVoices = this.voices.filter(voice => 
                voice.lang && (voice.lang.toLowerCase().includes('fr'))
            );
            
            console.log(`${frenchVoices.length} voix françaises identifiées`);
            
            // Vérifier d'abord s'il y a une préférence sauvegardée
            const savedVoiceIndex = localStorage.getItem('selectedVoiceIndex');
            
            if (savedVoiceIndex !== null) {
                const index = parseInt(savedVoiceIndex);
                if (!isNaN(index) && index >= 0 && index < this.voices.length) {
                    this.selectedVoice = this.voices[index];
                    console.log(`Voix précédemment sélectionnée chargée: ${this.selectedVoice.name}`);
                    
                    // Mettre à jour l'UI
                    this.updateVoiceSelectionUI(index);
                    return;
                }
            }
            
            // Si dernier nom de voix mémorisé, essayer de retrouver cette voix
            if (lastSelectedVoiceName && lastSelectedVoiceName.length > 0) {
                const voiceByName = this.voices.find(v => v.name === lastSelectedVoiceName);
                if (voiceByName) {
                    this.selectedVoice = voiceByName;
                    const index = this.voices.indexOf(voiceByName);
                    this.updateVoiceSelectionUI(index);
                    console.log(`Voix retrouvée par nom: ${lastSelectedVoiceName}`);
                    return;
                }
            }
            
            // Si aucune préférence valide, sélectionner la meilleure voix française
            if (frenchVoices.length > 0) {
                // Chercher des voix premium/neuronales (meilleure qualité)
                const premiumKeywords = ['neural', 'premium', 'enhanced', 'wavenet', 'studio'];
                const premiumVoice = frenchVoices.find(voice => 
                    premiumKeywords.some(keyword => 
                        voice.name.toLowerCase().includes(keyword)
                    )
                );
                
                if (premiumVoice) {
                    this.selectedVoice = premiumVoice;
                    console.log(`Voix premium française sélectionnée: ${premiumVoice.name}`);
                } else {
                    // Préférer les voix natives (souvent sans accent)
                    const nativeVoice = frenchVoices.find(voice => 
                        voice.localService === true || 
                        voice.name.toLowerCase().includes('native') ||
                        voice.name.toLowerCase().includes('français') ||
                        voice.name.toLowerCase().includes('france')
                    );
                    
                    if (nativeVoice) {
                        this.selectedVoice = nativeVoice;
                        console.log(`Voix native française sélectionnée: ${nativeVoice.name}`);
                    } else {
                        // N'importe quelle voix française
                        this.selectedVoice = frenchVoices[0];
                        console.log(`Voix française générique sélectionnée: ${frenchVoices[0].name}`);
                    }
                }
                
                // Mettre à jour l'UI si une voix a été trouvée
                if (this.selectedVoice) {
                    const index = this.voices.indexOf(this.selectedVoice);
                    this.updateVoiceSelectionUI(index);
                }
            } else if (this.voices.length > 0) {
                // En dernier recours, utiliser la première voix disponible
                this.selectedVoice = this.voices[0];
                console.log(`Aucune voix française disponible, sélection par défaut: ${this.voices[0].name}`);
                
                // Mettre à jour l'UI
                this.updateVoiceSelectionUI(0);
            }
        } catch (error) {
            console.error("Erreur lors de la sélection de la voix:", error);
            
            // Fallback ultime: utiliser n'importe quelle voix disponible
            if (this.voices && this.voices.length > 0) {
                this.selectedVoice = this.voices[0];
                this.updateVoiceSelectionUI(0);
            }
        }
    },
    
    // NOUVEAU: Mettre à jour l'UI du sélecteur de voix
    updateVoiceSelectionUI: function(voiceIndex) {
        try {
            if (!voiceSelect) return;
            
            for (let i = 0; i < voiceSelect.options.length; i++) {
                const optionIndex = parseInt(voiceSelect.options[i].getAttribute('data-voice-index'));
                if (optionIndex === voiceIndex) {
                    voiceSelect.selectedIndex = i;
                    break;
                }
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'UI de sélection de voix:", error);
        }
    },
    
    // Fonction pour sauvegarder la préférence de voix
    saveVoicePreference: function(voiceIndex) {
        try {
            localStorage.setItem('selectedVoiceIndex', voiceIndex);
            
            // Mémoriser aussi le nom de la voix comme backup
            if (this.selectedVoice && this.selectedVoice.name) {
                lastSelectedVoiceName = this.selectedVoice.name;
                localStorage.setItem('selectedVoiceName', this.selectedVoice.name);
            }
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de la préférence de voix:", error);
        }
    },
    
    // Mettre à jour l'affichage du volume
    updateVolumeDisplay: function(volume) {
        try {
            const volumeValue = document.getElementById('volumeValue');
            if (volumeValue) {
                volumeValue.textContent = Math.round(volume * 100) + '%';
            } else if (volumeSlider && volumeSlider.parentNode) {
                // Créer l'élément s'il n'existe pas
                const newVolumeValue = document.createElement('span');
                newVolumeValue.id = 'volumeValue';
                newVolumeValue.textContent = Math.round(volume * 100) + '%';
                newVolumeValue.style.marginLeft = '10px';
                newVolumeValue.style.fontWeight = 'bold';
                volumeSlider.parentNode.insertBefore(newVolumeValue, volumeSlider.nextSibling);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'affichage du volume:", error);
        }
    },
    
    // AMÉLIORÉ: Configuration du système de keep alive pour la synthèse vocale
    setupVoiceKeepAlive: function() {
        try {
            if (!this.synth) {
                console.warn("Synthèse vocale non disponible pour le keepAlive");
                return;
            }
            
            // Nettoyer l'intervalle précédent si existant
            if (voiceKeepAliveInterval) {
                clearInterval(voiceKeepAliveInterval);
            }
            
            // Mécanisme pour maintenir la synthèse vocale active
            voiceKeepAliveInterval = setInterval(() => {
                this.pingVoiceEngine();
            }, 250);
            
            console.log("Système de keep-alive vocal configuré");
        } catch (error) {
            console.error("Erreur lors de la configuration du keepAlive vocal:", error);
        }
    },
    
    // NOUVEAU: Fonction pour "ping" le moteur de synthèse vocale
    pingVoiceEngine: function() {
        try {
            // Ne rien faire si le moteur n'est pas initialisé
            if (!this.synth) return;
            
            // Si la synthèse est en cours, appliquer le hack pause/resume
            if (this.synth.speaking) {
                // Appliquer pause/resume seulement si nécessaire (pas trop fréquent)
                const timeSinceLastSpeech = Date.now() - lastSpeechTime;
                if (timeSinceLastSpeech > 2000) {
                    this.synth.pause();
                    this.synth.resume();
                    lastSpeechTime = Date.now();
                }
            } else if (Date.now() - lastSpeechTime > 15000) {
                // Si aucune parole depuis longtemps, envoyer un signal silencieux
                const dummy = new SpeechSynthesisUtterance('');
                dummy.volume = 0;
                dummy.onend = function() {
                    // Ne rien faire, juste pour maintenir le moteur actif
                };
                this.synth.speak(dummy);
                lastSpeechTime = Date.now();
            }
        } catch (error) {
            console.error("Erreur lors du ping du moteur vocal:", error);
            speechFailureCount++;
            
            // Réinitialiser le moteur en cas d'échecs répétés
            if (speechFailureCount >= maxSpeechFailures) {
                console.warn(`Trop d'échecs de ping (${speechFailureCount}), réinitialisation du moteur vocal`);
                this.resetSpeechEngine();
            }
        }
    },
    
    // AMÉLIORÉ: Mise à jour de la liste des voix avec plus d'informations
    populateVoiceList: function() {
        try {
            // Vérifier que le sélecteur existe
            if (!voiceSelect) {
                console.warn("Élément voiceSelect non trouvé");
                return;
            }
            
            // Vider la liste existante
            voiceSelect.innerHTML = '';
            
            if (!this.voices || this.voices.length === 0) {
                const option = document.createElement('option');
                option.textContent = 'Aucune voix disponible';
                voiceSelect.appendChild(option);
                voiceSelect.disabled = true;
                return;
            }
            
            voiceSelect.disabled = false;
            
            // Filtrer uniquement les voix françaises
            const frenchVoices = this.voices.filter(voice => 
                voice.lang && (voice.lang.toLowerCase().includes('fr'))
            );
            
            // Utiliser les voix françaises en priorité
            const voicesToUse = frenchVoices.length > 0 ? frenchVoices : this.voices;
            
            // NOUVEAU: Trier les voix par ordre de qualité et de préférence
            voicesToUse.sort((a, b) => {
                // Priorité 1: Les voix locales (meilleure performance)
                if (a.localService && !b.localService) return -1;
                if (!a.localService && b.localService) return 1;
                
                // Priorité 2: Les voix premium/neuronales
                const premiumKeywords = ['neural', 'premium', 'enhanced', 'wavenet', 'studio'];
                const aIsPremium = premiumKeywords.some(kw => a.name.toLowerCase().includes(kw));
                const bIsPremium = premiumKeywords.some(kw => b.name.toLowerCase().includes(kw));
                
                if (aIsPremium && !bIsPremium) return -1;
                if (!aIsPremium && bIsPremium) return 1;
                
                // Priorité 3: Les voix françaises de France (fr-FR)
                const aIsFrFR = a.lang === 'fr-FR';
                const bIsFrFR = b.lang === 'fr-FR';
                
                if (aIsFrFR && !bIsFrFR) return -1;
                if (!aIsFrFR && bIsFrFR) return 1;
                
                // Par défaut: ordre alphabétique
                return a.name.localeCompare(b.name);
            });
            
            // Ajouter chaque voix à la liste
            voicesToUse.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = index;
                
                // AMÉLIORÉ: Format du nom avec indicateurs de qualité
                let displayName = voice.name || 'Voix sans nom';
                
                // Ajouter le code de langue
                if (voice.lang) {
                    displayName += ` (${voice.lang})`;
                }
                
                // Indiquer si la voix est native/locale
                if (voice.localService) {
                    displayName += ' ⚡'; // Icône d'éclair pour les voix locales (plus rapides)
                }
                
                // Indiquer si c'est une voix premium
                const premiumKeywords = ['neural', 'premium', 'enhanced', 'wavenet', 'studio'];
                if (premiumKeywords.some(kw => voice.name.toLowerCase().includes(kw))) {
                    displayName += ' ★'; // Étoile pour les voix premium (meilleure qualité)
                }
                
                option.textContent = displayName;
                option.setAttribute('data-voice-index', this.voices.indexOf(voice)); // Index original
                
                // NOUVEAU: Préférences visuelles pour les voix françaises
                if (voice.lang && voice.lang.startsWith('fr-')) {
                    option.style.fontWeight = 'bold';
                }
                
                voiceSelect.appendChild(option);
            });
            
            console.log(`Liste de voix mise à jour avec ${voicesToUse.length} voix`);
        } catch (error) {
            console.error("Erreur lors du remplissage de la liste des voix:", error);
            
            // Créer une option par défaut en cas d'erreur
            if (voiceSelect) {
                voiceSelect.innerHTML = '<option value="-1">Erreur de chargement des voix</option>';
            }
        }
    },
    
    // AMÉLIORÉ: Fonction pour prononcer les nombres
    speakNumber: function(number, callback) {
        try {
            // Convertir le nombre en texte français explicite
            const numberText = this.numberToFrenchText(number);
            
            // Créer une utterance séparée pour le nombre
            const utterance = new SpeechSynthesisUtterance(numberText);
            
            // Configurer l'utterance
            if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
            }
            
            utterance.volume = this.volume;
            utterance.rate = 0.75; // Légèrement plus lent pour les chiffres
            utterance.pitch = 1.05; // Légèrement plus haut pour les chiffres
            utterance.lang = 'fr-FR';
            
            // Gérer la fin de l'énoncé
            if (callback && typeof callback === 'function') {
                utterance.onend = callback;
            }
            
            // Mémoriser le temps de parole
            lastSpeechTime = Date.now();
            
            // Prononcer le nombre
            this.synth.speak(utterance);
            
        } catch (error) {
            console.error('Erreur lors de la prononciation du nombre:', error);
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    },
    
    // AMÉLIORÉ: Correction complète des problèmes de prononciation en français
    fixSpecificPronunciations: function(text) {
        try {
            if (!text) return text;
            
            // Copie du texte original pour la comparaison
            const originalText = text;
            
            // Fixer le problème de "marche un" en priorité
            text = text.replace(/\bmarche un\b/gi, "marche une");
            
            // Fixer le problème de "état profonde"
            text = text.replace(/\bétat profonde\b/gi, "état profond");
            
            // Optimisation spécifique pour le décompte du réveil
            if (text.startsWith("Un.")) {
                text = text.replace(/^Un\./, "Numéro Un.");
            }
            
            // Fixer les liaisons courantes en français
            for (const [problem, solution] of Object.entries(this.pronunciationFixes)) {
                // Utiliser une expression régulière pour trouver toutes les occurrences
                const regex = new RegExp('\\b' + problem + '\\b', 'gi');
                text = text.replace(regex, solution);
            }
            
            // Appliquer les corrections phonétiques supplémentaires
            for (const [problem, solution] of Object.entries(this.frenchPhoneticFixes)) {
                const regex = new RegExp(problem, 'gi');
                text = text.replace(regex, solution);
            }
            
            // Traitement spécial pour les cas qui nécessitent une insertion de caractère
            const specialCases = [
                { pattern: /\bvous entrez\b/gi, replacement: "vous-entrez" },
                { pattern: /\bvous enfonçant\b/gi, replacement: "vous-enfonçant" },
                { pattern: /\bnous arriverons\b/gi, replacement: "nous-arriverons" },
                { pattern: /\bde l'air\b/gi, replacement: "de-l'air" },
                { pattern: /\bvous apaise\b/gi, replacement: "vous-apaise" },
                { pattern: /\bvous ancrez\b/gi, replacement: "vous-ancrez" },
                { pattern: /\bvous enveloppent\b/gi, replacement: "vous-enveloppent" },
                { pattern: /\best ici\b/gi, replacement: "est-ici" },
                { pattern: /\bplus en plus\b/gi, replacement: "plus-en-plus" },
                { pattern: /\bpeu à peu\b/gi, replacement: "peu-à-peu" },
                { pattern: /\bpetit à petit\b/gi, replacement: "petit-à-petit" }
            ];
            
            specialCases.forEach(({ pattern, replacement }) => {
                text = text.replace(pattern, replacement);
            });
            
            // NOUVEAU: Correction des nombres
            text = text.replace(/(\d+)([,.])(\d+)/g, (match, p1, p2, p3) => {
                // Pour les nombres décimaux, ajouter des espaces pour améliorer la prononciation
                return `${p1} virgule ${p3}`;
            });
            
            // NOUVEAU: Détecter si des corrections ont été appliquées
            if (text !== originalText) {
                console.log("Corrections de prononciation appliquées");
            }
            
            return text;
        } catch (error) {
            console.error("Erreur lors de la correction des prononciations:", error);
            return text || "";
        }
    },
    
    // AMÉLIORÉ: Méthode speak avec plus de robustesse et de performance
    speak: function(text) {
        try {
            // Vérifier si le son est activé et si le texte est valide
            if (!audioToggle || !audioToggle.checked || !this.synth || !text || !speechEngineReady) {
                if (!audioToggle || !audioToggle.checked) {
                    console.log("Synthèse vocale désactivée");
                } else if (!speechEngineReady) {
                    console.warn("Moteur de synthèse vocale non prêt");
                }
                return;
            }
            
            // Anti-doublon: éviter de répéter exactement la même phrase trop rapidement
            if (text === this._lastSpokenText && Date.now() - lastSpeechTime < 1000) {
                console.log("Texte identique ignoré (anti-doublon)");
                return;
            }
            
            // Mémoriser le dernier texte prononcé
            this._lastSpokenText = text;
            
            // Mémoriser le temps de parole
            lastSpeechTime = Date.now();
            
            // Prétraiter le texte pour les problèmes de prononciation
            text = this.fixSpecificPronunciations(text);
            
            // Créer un nouvel énoncé
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configurer l'énoncé avec la voix sélectionnée
            if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
            }
            
            // Appliquer les paramètres
            utterance.volume = this.volume;
            utterance.rate = 0.78; // Vitesse ralentie pour une articulation parfaite
            utterance.pitch = 1.02; // Pitch légèrement ajusté pour une meilleure sonorité
            
            // Définir la langue française explicitement
            utterance.lang = 'fr-FR';
            
            // Suivre cet utterance
            this.utteranceQueue.push(utterance);
            
            // Ajouter des événements
            utterance.onstart = () => {
                safeSetTimeout(() => {
                    speakingInProgress = true;
                    if (speakingIndicator) {
                        speakingIndicator.classList.add('active');
                    }
                    
                    // Réinitialiser le compteur d'échecs
                    speechFailureCount = 0;
                }, 50);
            };
            
            utterance.onend = () => {
                // Retirer cet utterance de la file d'attente
                const index = this.utteranceQueue.indexOf(utterance);
                if (index !== -1) {
                    this.utteranceQueue.splice(index, 1);
                }
                
                // Mettre à jour l'état
                safeSetTimeout(() => {
                    if (this.utteranceQueue.length === 0) {
                        speakingInProgress = false;
                        if (speakingIndicator) {
                            speakingIndicator.classList.remove('active');
                        }
                    }
                }, 100);
            };
            
            utterance.onerror = (e) => {
                console.error('Erreur de synthèse vocale:', e);
                
                // Retirer cet utterance de la file d'attente
                const index = this.utteranceQueue.indexOf(utterance);
                if (index !== -1) {
                    this.utteranceQueue.splice(index, 1);
                }
                
                // Incrémenter le compteur d'échecs
                speechFailureCount++;
                
                // Réinitialiser l'état
                safeSetTimeout(() => {
                    if (this.utteranceQueue.length === 0) {
                        speakingInProgress = false;
                        if (speakingIndicator) {
                            speakingIndicator.classList.remove('active');
                        }
                    }
                    
                    // Réinitialiser le moteur en cas d'erreurs répétées
                    if (speechFailureCount >= maxSpeechFailures) {
                        console.warn(`Trop d'erreurs de synthèse (${speechFailureCount}), réinitialisation du moteur`);
                        this.resetSpeechEngine();
                    }
                }, 100);
            };
            
            // AMÉLIORATION: Débounce pour éviter les problèmes de saturation
            if (voiceDebounceTimer) {
                clearTimeout(voiceDebounceTimer);
            }
            
            voiceDebounceTimer = setTimeout(() => {
                // Prononcer le texte
                this.synth.speak(utterance);
                voiceDebounceTimer = null;
            }, 50);
            
        } catch (error) {
            console.error('Erreur de synthèse vocale:', error);
            speakingInProgress = false;
            
            // Tenter de récupérer
            speechFailureCount++;
            if (speechFailureCount >= maxSpeechFailures) {
                this.resetSpeechEngine();
            }
        }
    },
    
    // AMÉLIORÉ: Arrêt complet de toute la synthèse vocale
    stop: function() {
        try {
            console.log("Arrêt complet de toute synthèse vocale");
            
            // Annuler tous les minuteurs
            if (this.resumeTimer) {
                clearTimeout(this.resumeTimer);
                this.resumeTimer = null;
            }
            
            if (voiceDebounceTimer) {
                clearTimeout(voiceDebounceTimer);
                voiceDebounceTimer = null;
            }
            
            // Annuler toutes les paroles
            if (this.synth) {
                // Double annulation pour s'assurer que tout est bien arrêté
                this.synth.cancel();
                
                // Seconde annulation après un bref délai
                safeSetTimeout(() => {
                    if (this.synth) {
                        this.synth.cancel();
                    }
                }, 100);
            }
            
            // Réinitialiser les états
            this.utteranceQueue = [];
            this._lastSpokenText = null;
            speakingInProgress = false;
            if (speakingIndicator) {
                speakingIndicator.classList.remove('active');
            }
            
            console.log("Synthèse vocale arrêtée avec succès");
        } catch (error) {
            console.error('Erreur lors de l\'arrêt de la synthèse vocale:', error);
        }
    }
};

// Fonction principale d'initialisation de l'application
function initializeApp() {
    try {
        console.log("Initialisation de l'application...");
        
        // Initialiser les références DOM principales
        initDOMReferences();
        
        // Initialiser l'anti-veille
        initAntiSleepSystem();
        
        // Initialiser la synthèse vocale avec fallback
        const speechInitSuccess = speech.init();
        
        // Si l'initialisation de la voix échoue, on continue quand même
        if (!speechInitSuccess) {
            console.warn("Initialisation de la synthèse vocale échouée - l'application continuera sans audio");
        }
        
        // Initialiser les contrôles et événements de l'UI
        setupEventListeners();
        
        // Initialiser les ajustements pour les styles mobiles
        adjustMobileStyles();
        
        console.log("Initialisation de l'application terminée");
    } catch (error) {
        console.error("Erreur critique lors de l'initialisation de l'application:", error);
        // Afficher un message d'erreur visible pour l'utilisateur
        const errorMessage = document.createElement('div');
        errorMessage.style.position = 'fixed';
        errorMessage.style.top = '50%';
        errorMessage.style.left = '50%';
        errorMessage.style.transform = 'translate(-50%, -50%)';
        errorMessage.style.background = 'rgba(255, 0, 0, 0.8)';
        errorMessage.style.color = 'white';
        errorMessage.style.padding = '20px';
        errorMessage.style.borderRadius = '10px';
        errorMessage.style.zIndex = '9999';
        errorMessage.textContent = "Une erreur s'est produite lors du chargement de l'application. Veuillez rafraîchir la page.";
        document.body.appendChild(errorMessage);
    }
}

// Initialiser toutes les références DOM
function initDOMReferences() {
    try {
        // Éléments DOM principaux
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
    
        // Boutons essentiels uniquement
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
    } catch (error) {
        console.error("Erreur lors de l'initialisation des références DOM:", error);
        throw error; // Propager l'erreur pour une gestion plus précise
    }
}

// Fonction pour configurer tous les écouteurs d'événements
function setupEventListeners() {
    try {
        // Uniquement les boutons essentiels
        if (startBtn) startBtn.addEventListener('click', () => showPage(2));
        if (startCoherenceBtn) startCoherenceBtn.addEventListener('click', startCoherenceCardiaque);
        if (restartBtn) restartBtn.addEventListener('click', () => showPage(2));
        if (homeBtn) homeBtn.addEventListener('click', () => showPage(1));
        
        // Sons binauraux
        const binauralToggle = document.getElementById('binauralToggle');
        if (binauralToggle) {
            binauralToggle.addEventListener('change', function() {
                if (this.checked) {
                    startBinauralBeats(); // Appel immédiat
                } else {
                    // Si on désactive manuellement, on arrête les sons
                    stopBinauralBeats();
                    binauralActive = false;
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
        
        // NOUVEAU: Écouteur pour les erreurs non capturées
        window.addEventListener('error', function(e) {
            console.error("Erreur non capturée:", e.error || e.message);
            
            // Tenter de récupérer les fonctionnalités vocales en cas d'erreur
            if (e.error && (e.error.toString().includes('speech') || e.error.toString().includes('voice'))) {
                console.warn("Erreur liée à la voix détectée, tentative de récupération");
                if (speech && typeof speech.resetSpeechEngine === 'function') {
                    speech.resetSpeechEngine();
                }
            }
            
            // Éviter de perturber l'expérience utilisateur
            e.preventDefault();
        });
    } catch (error) {
        console.error("Erreur lors de la configuration des écouteurs d'événements:", error);
    }
}

// Fonction principale d'initialisation du système anti-veille
function initAntiSleepSystem() {
    try {
        console.log("Initialisation du système anti-veille multi-couche");
        
        // Préparer tous les systèmes
        initNoSleep();
        initWakeLock();
        prepareKeepAwakeMedia();
        
        // Activation au premier clic ou toucher
        const activateAntiSleep = () => {
            console.log("Activation des systèmes anti-veille");
            enableNoSleep();
            requestWakeLock();
            startKeepAwakeMedia();
            startRefreshInterval();
            
            // On n'a besoin de ces écouteurs qu'une fois
            document.removeEventListener('click', activateAntiSleep);
            document.removeEventListener('touchstart', activateAntiSleep);
            document.removeEventListener('touchend', activateAntiSleep);
        };
        
        // Attacher aux événements d'interaction utilisateur
        document.addEventListener('click', activateAntiSleep, { once: true });
        document.addEventListener('touchstart', activateAntiSleep, { once: true });
        document.addEventListener('touchend', activateAntiSleep, { once: true });
        
        // Surveillance de la visibilité pour réactiver si nécessaire
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log("Page redevenue visible, réactivation des systèmes anti-veille");
                enableNoSleep();
                requestWakeLock();
                resumeKeepAwakeMedia();
                startRefreshInterval();
            }
        });
        
        return true;
    } catch (error) {
        console.error("Erreur lors de l'initialisation du système anti-veille:", error);
        return false;
    }
}

// === SYSTÈME 1: NOSLEEP.JS ===
function initNoSleep() {
    try {
        if (typeof NoSleep !== 'undefined') {
            noSleep = new NoSleep();
            console.log("NoSleep.js initialisé avec succès");
        } else {
            console.warn("NoSleep.js n'est pas disponible");
        }
    } catch (error) {
        console.error("Erreur lors de l'initialisation de NoSleep:", error);
    }
}

function enableNoSleep() {
    try {
        if (noSleep) {
            noSleep.enable();
            console.log("NoSleep activé");
        }
    } catch (error) {
        console.error("Erreur lors de l'activation de NoSleep:", error);
    }
}

function disableNoSleep() {
    try {
        if (noSleep) {
            noSleep.disable();
            console.log("NoSleep désactivé");
        }
    } catch (error) {
        console.error("Erreur lors de la désactivation de NoSleep:", error);
    }
}

// === SYSTÈME 2: API WAKE LOCK NATIVE ===
function initWakeLock() {
    // Vérifier si l'API est supportée
    if ('wakeLock' in navigator) {
        console.log("API Wake Lock supportée");
    } else {
        console.warn("API Wake Lock non supportée par ce navigateur");
    }
}

async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    
    try {
        // Relâcher tout verrou existant d'abord
        if (wakeLock) {
            await wakeLock.release();
            wakeLock = null;
        }
        
        // Demander un nouveau verrou
        wakeLock = await navigator.wakeLock.request('screen');
        console.log("Wake Lock activé avec l'API native");
        
        // Gérer la libération du verrou
        wakeLock.addEventListener('release', () => {
            console.log("Wake Lock a été libéré");
            wakeLock = null;
            
            // Tenter de réactiver après un court délai
            safeSetTimeout(requestWakeLock, 1000);
        });
    } catch (err) {
        console.error("Erreur lors de la demande de Wake Lock:", err);
    }
}

// === SYSTÈME 3: AUDIO/VIDÉO EN ARRIÈRE-PLAN ===
function prepareKeepAwakeMedia() {
    try {
        // Créer l'élément audio
        const audio = document.createElement('audio');
        audio.setAttribute('loop', '');
        audio.setAttribute('playsinline', '');
        audio.setAttribute('id', 'keep-awake-audio');
        audio.style.display = 'none';
        
        // Créer une source audio avec un son silencieux
        const source = document.createElement('source');
        // Data URL d'un son silencieux de 1 seconde
        source.src = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABGADk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk//////////////////////////////////////////////////////////////////8AAAAATGF2YzU3LjY0AAAAAAAAAAAAAAAAJAZAAAAAAAAY4MUkRQAAAAAAAAAAAAAAABSAAAAAAAAAAAAAAAAAAAAAP/7kGQAAAAAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
        source.type = 'audio/mpeg';
        audio.appendChild(source);
        
        // Ajouter l'audio au document
        document.body.appendChild(audio);
        
        // Créer l'élément vidéo (solution de secours)
        const video = document.createElement('video');
        video.setAttribute('loop', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        video.setAttribute('id', 'keep-awake-video');
        video.style.position = 'absolute';
        video.style.top = '-100px';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.opacity = '0.01';
        
        // Source vidéo minimale
        const videoSource = document.createElement('source');
        videoSource.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAA7RtZGF0AAACrAYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBhMGNkN2QzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTMgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD0zMCByYz1jcmYgbWJ0cmVlPTEgY3JmPTI4LjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAAwZYiEAD//8m+P5OXfBeLGOfKE3xQxyJFjhP2tn9LAK8DYLXtNgsfrRV+FgAAAAwAAAwAAJuKjOAQQAAAL5BngjxDP/jOAHEGYI//8TBdc2EIOi7QEPgD2IQiwRqXXgB5SscyBhWwh9J/gAOAgAAAEeQZ4q0U0y/AC3R7xQAs2SXxRd5V5NwxAAWMolABPxAAACQQBnknRCfwAiPcX9SLzxwALGQAAABsAZ5LqQn8AJyEIFHp9L7LK4AAcGhFoAJ+IAAAADUGaT0moQWyZTAhf/4QAAAAwBnm10Qn8AJyEAAAAMAZ5vqQn8AJyEAAABPQZpzSahBbJlMCF//hAAAAAsQZ6RRREsK/8AAOBAAAAAEAZ6xdEJ/ACchAAAABABnrOpCfwAnIQAAAQ1Bmvc0pMQxCf/APPkj0rkAH6O6VnYQAfNjzfXy/oABH0qT3Mv8Je/qgAEfAAAAW0GeEUURLCv/AADgQAAAAOwZ4xRRUsK/8AAOBAAAABMAGeb0U0y/AAOwbmbxlwAcCAAAAAFABnnOv8AByEAAAD0QZp3NKTEJn+eECGf//jhAADWkYtwAfvbJz24l7nEAAkKVJ7mX+Evf1QAJCAAAAJUZp7NKTEMQn/8AAOBAAAAAKQZ/bRRUsK/8AAOBAAAABABng9FNMv8AAzMAEfAAAAEMAZ4Tr/AAchAAAACsZpo0pMQxCf/wAA4EAAAAKEGaLTSmxCf/4QAAAAwBnktFNMv8AAzMAEfAAAAAQgBnk2v8AAzMAEfAAACcIQZpRSahBaJlMCF//hAAAAAr0Z5xRRUsK/8AAOBA=';
        videoSource.type = 'video/mp4';
        video.appendChild(videoSource);
        
        // Ajouter la vidéo au document
        document.body.appendChild(video);
        
        // Stocker les références
        keepAwakeMedia = {
          audio: audio,
          video: video
        };
        
        console.log("Média anti-veille préparé");
        return true;
    } catch (error) {
        console.error("Erreur lors de la préparation du média anti-veille:", error);
        return false;
    }
}

function startKeepAwakeMedia() {
    try {
        if (!keepAwakeMedia) return false;

        // Démarrer l'audio
        const playAudio = async () => {
            try {
                if (keepAwakeMedia.audio.paused) {
                    // Régler le volume très bas mais pas à zéro
                    keepAwakeMedia.audio.volume = 0.01;
                    await keepAwakeMedia.audio.play();
                    console.log("Audio anti-veille démarré");
                }
            } catch (error) {
                console.warn("Impossible de démarrer l'audio, utilisation de la vidéo à la place:", error);
                playVideo();
            }
        };

        // Démarrer la vidéo (solution de secours)
        const playVideo = async () => {
            try {
                if (keepAwakeMedia.video.paused) {
                    await keepAwakeMedia.video.play();
                    console.log("Vidéo anti-veille démarrée");
                }
            } catch (error) {
                console.error("Impossible de démarrer la vidéo:", error);
            }
        };

        // Essayer d'abord l'audio
        playAudio();
        
        return true;
    } catch (error) {
        console.error("Erreur lors du démarrage du média anti-veille:", error);
        return false;
    }
}

function resumeKeepAwakeMedia() {
    try {
        if (!keepAwakeMedia) return false;
        
        // Redémarrer l'audio s'il a été mis en pause
        if (keepAwakeMedia.audio && keepAwakeMedia.audio.paused) {
            keepAwakeMedia.audio.play()
                .then(() => console.log("Audio anti-veille repris"))
                .catch(error => console.warn("Impossible de reprendre l'audio:", error));
        }
        
        // Redémarrer la vidéo si elle a été mise en pause
        if (keepAwakeMedia.video && keepAwakeMedia.video.paused) {
            keepAwakeMedia.video.play()
                .then(() => console.log("Vidéo anti-veille reprise"))
                .catch(error => console.warn("Impossible de reprendre la vidéo:", error));
        }
        
        return true;
    } catch (error) {
        console.error("Erreur lors de la reprise du média anti-veille:", error);
        return false;
    }
}

// === SYSTÈME 4: INTERVALLE DE RAFRAÎCHISSEMENT ===
function startRefreshInterval() {
    try {
        // Arrêter l'intervalle précédent s'il existe
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
        
        // Créer un nouvel intervalle
        refreshInterval = safeSetInterval(() => {
            // Réactiver les systèmes périodiquement
            console.log("Réactivation périodique des systèmes anti-veille");
            enableNoSleep();
            requestWakeLock();
            resumeKeepAwakeMedia();
            
            // Créer une interaction simulée (faible, mais peut aider)
            const simulateInteraction = () => {
                if (document.hasFocus()) {
                    // Créer un événement factice pour simuler une activité
                    const evt = new Event('mousemove', {
                        bubbles: true,
                        cancelable: true,
                    });
                    document.dispatchEvent(evt);
                }
            };
            
            simulateInteraction();
        }, 15000); // Toutes les 15 secondes
        
        console.log("Intervalle de rafraîchissement démarré");
        return true;
    } catch (error) {
        console.error("Erreur lors du démarrage de l'intervalle de rafraîchissement:", error);
        return false;
    }
}

// === FONCTION POUR DÉSACTIVER TOUS LES SYSTÈMES ===
function disableAllKeepAwakeSystems() {
    try {
        console.log("Désactivation de tous les systèmes anti-veille");
        
        // Désactiver NoSleep
        disableNoSleep();
        
        // Libérer le Wake Lock
        if (wakeLock) {
            wakeLock.release()
                .then(() => {
                    console.log("Wake Lock libéré");
                    wakeLock = null;
                })
                .catch(error => console.error("Erreur lors de la libération du Wake Lock:", error));
        }
        
        // Arrêter tous les médias
        if (keepAwakeMedia) {
            if (keepAwakeMedia.audio) {
                keepAwakeMedia.audio.pause();
                keepAwakeMedia.audio.src = '';
            }
            
            if (keepAwakeMedia.video) {
                keepAwakeMedia.video.pause();
                keepAwakeMedia.video.src = '';
            }
        }
        
        // Arrêter l'intervalle de rafraîchissement
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
        
        return true;
    } catch (error) {
        console.error("Erreur lors de la désactivation des systèmes anti-veille:", error);
        return false;
    }
}

// Fonction pour mettre à jour l'indicateur visuel
function updateKeepAwakeIndicator(visible) {
    const indicator = document.getElementById('keep-awake-indicator');
    if (indicator) {
        indicator.style.display = visible ? 'block' : 'none';
    }
}

// Fonction pour activer le système anti-veille (remplace l'ancienne enableNoSleep)
function enableKeepAwake() {
    console.log("Activation du système anti-veille multi-couche");
    enableNoSleep();
    requestWakeLock();
    startKeepAwakeMedia();
    startRefreshInterval();
    updateKeepAwakeIndicator(true);
}

// Fonction pour désactiver le système anti-veille (remplace l'ancienne disableNoSleep)
function disableKeepAwake() {
    console.log("Désactivation du système anti-veille multi-couche");
    disableAllKeepAwakeSystems();
    updateKeepAwakeIndicator(false);
}

// Implémentation des sons binauraux qui s'activent au clic et restent actifs
function startBinauralBeats() {
    try {
        // Vérifier si Web Audio API est supportée
        if (!window.AudioContext && !window.webkitAudioContext) {
            console.warn("L'API Web Audio n'est pas prise en charge");
            return false;
        }
        
        // Vérifier si le bouton est activé
        const binauralToggle = document.getElementById('binauralToggle');
        if (!binauralToggle || !binauralToggle.checked) {
            console.log("Sons binauraux non activés car le bouton est désactivé");
            return false;
        }
        
        // Si les sons binauraux sont déjà actifs, ne rien faire
        if (binauralActive) {
            console.log("Les sons binauraux sont déjà actifs, pas besoin de les redémarrer");
            return true;
        }
        
        // Initialiser le contexte audio s'il n'existe pas déjà
        if (!binauralContext) {
            binauralContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Déjà actif ? Ne rien faire
        if (binauralOscillators.length > 0) {
            console.log("Les sons binauraux sont déjà actifs");
            binauralActive = true;
            return true;
        }
        
        console.log("Démarrage des sons binauraux");
        
        // Créer un contrôleur de volume principal
        binauralGain = binauralContext.createGain();
        binauralGain.gain.value = binauralVolume;
        binauralGain.connect(binauralContext.destination);
        
        // Créer deux oscillateurs pour l'effet binaural
        // Fréquence de base pour la relaxation profonde (ondes thêta: 4-8 Hz)
        const baseFrequency = 200; // 200 Hz comme fréquence porteuse
        const binauralBeat = 6; // 6 Hz (dans la plage thêta pour la méditation)
        
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
        
        // Contrôleurs de volume individuels pour équilibrer les canaux
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
