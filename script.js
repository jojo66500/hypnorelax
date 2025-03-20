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

// Boutons
let startBtn, startCoherenceBtn, nextPrepBtn, skipInductionBtn, skipDeepeningBtn, nextExplorationBtn, completeBtn, restartBtn, homeBtn;

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

// Variable pour prévenir les transitions rapides entre pages
let pageTransitionInProgress = false;
let pageTransitionTimeout = null;

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

// Fonction sécurisée pour setTimeout qui garde une référence
function safeSetTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
        allTimeouts.delete(timeoutId);
        callback();
    }, delay);
    
    allTimeouts.add(timeoutId);
    return timeoutId;
}

// Fonction sécurisée pour setInterval qui garde une référence
function safeSetInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    allIntervals.add(intervalId);
    return intervalId;
}

// Fonction pour nettoyer tous les timeouts enregistrés
function clearAllTimeouts() {
    allTimeouts.forEach(id => {
        clearTimeout(id);
    });
    allTimeouts.clear();
    
    // Nettoyage supplémentaire pour les timeouts non suivis
    const highestId = setTimeout(() => {}, 0);
    for (let i = 1; i <= highestId; i++) {
        clearTimeout(i);
    }
}

// Fonction pour nettoyer tous les intervalles enregistrés
function clearAllIntervals() {
    allIntervals.forEach(id => {
        clearInterval(id);
    });
    allIntervals.clear();
}

// Version sécurisée de showPage avec anti-double-clic
function safeShowPage(pageNumber) {
    if (pageTransitionInProgress) {
        console.log("Transition de page déjà en cours, demande ignorée");
        return;
    }
    
    // Verrouiller les transitions pendant un court moment
    pageTransitionInProgress = true;
    
    // Appeler la fonction réelle de changement de page
    showPage(pageNumber);
    
    // Déverrouiller après un court délai
    pageTransitionTimeout = safeSetTimeout(() => {
        pageTransitionInProgress = false;
    }, 1000); // 1 seconde de "cooldown" entre les transitions
}

// Initialisation de la synthèse vocale AMÉLIORÉE
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
        "marche un": "marche une"
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
            // Initialiser la synthèse vocale
            this.synth = window.speechSynthesis;
            
            // Vérifier si la synthèse vocale est disponible
            if (!this.synth) {
                console.warn("SpeechSynthesis API non disponible dans ce navigateur");
                if (audioToggle) {
                    audioToggle.checked = false;
                    audioToggle.disabled = true;
                }
                return false;
            }
            
            // Fonction pour charger les voix
            const loadVoices = () => {
                this.voices = this.synth.getVoices();
                console.log(`${this.voices.length} voix disponibles`);
                this.populateVoiceList();
                
                // Trouver la meilleure voix française
                this.selectBestFrenchVoice();
            };
            
            // Mise en place d'un timeout pour éviter un blocage indéfini
            let voicesLoaded = false;
            
            // Vérifier si les voix sont déjà disponibles
            if (this.synth.getVoices().length > 0) {
                loadVoices();
                voicesLoaded = true;
            }
            
            // Sinon, attendre l'événement 'voiceschanged'
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = () => {
                    if (!voicesLoaded) {
                        loadVoices();
                        voicesLoaded = true;
                    }
                };
                
                // Fallback en cas de non-déclenchement de l'événement
                safeSetTimeout(() => {
                    if (!voicesLoaded) {
                        console.warn("Timeout: événement voiceschanged non déclenché");
                        // Forcer un rechargement des voix
                        loadVoices();
                        voicesLoaded = true;
                    }
                }, 3000);
            }
            
            // Événements de contrôle
            if (voiceSelect) {
                voiceSelect.addEventListener('change', () => {
                    const selectedIndex = voiceSelect.selectedIndex;
                    if (selectedIndex >= 0 && selectedIndex < this.voices.length) {
                        const voiceIndex = parseInt(voiceSelect.options[selectedIndex].getAttribute('data-voice-index'));
                        if (!isNaN(voiceIndex) && voiceIndex >= 0 && voiceIndex < this.voices.length) {
                            this.selectedVoice = this.voices[voiceIndex];
                            
                            // Enregistrer la préférence de voix dans le localStorage
                            this.saveVoicePreference(voiceIndex);
                            
                            // Tester la voix
                            this.speak("Cette voix a été sélectionnée");
                        }
                    }
                });
            }
            
            // Gestionnaire amélioré pour le contrôle du volume
            if (volumeSlider) {
                // Initialiser le slider avec la valeur par défaut
                volumeSlider.value = this.volume;
                
                // AMÉLIORATION: Ajouter l'attribut step pour un contrôle plus fin
                volumeSlider.setAttribute('step', '0.05');
                
                // AMÉLIORATION: Gérer les événements input et change pour réactivité immédiate
                volumeSlider.addEventListener('input', () => {
                    const newVolume = parseFloat(volumeSlider.value);
                    this.volume = newVolume;
                    
                    // Enregistrer la préférence de volume dans le localStorage
                    localStorage.setItem('voiceVolume', newVolume);
                    
                    // NOUVEAU: Mettre à jour le volume pour toutes les utterances actives
                    this.updateActiveUtterancesVolume(newVolume);
                    
                    // NOUVEAU: Afficher un retour visuel pour le volume
                    this.updateVolumeDisplay(newVolume);
                });
                
                // AMÉLIORATION: Tester immédiatement le volume lors d'un changement complet
                volumeSlider.addEventListener('change', () => {
                    // Jouer un son bref pour démontrer le niveau de volume
                    if (this.synth && !this.synth.speaking) {
                        this.speak("Volume ajusté");
                    }
                });
                
                // Charger la préférence de volume sauvegardée
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
            
            // Prévenir la suspension de la synthèse vocale
            this.setupVoiceKeepAlive();
            
            return true;
        } catch (error) {
            console.error('Erreur d\'initialisation de la synthèse vocale:', error);
            // Désactiver l'audio en cas d'erreur
            if (audioToggle) {
                audioToggle.checked = false;
            }
            return false;
        }
    },
    
    // NOUVEAU: Sélectionner la meilleure voix française disponible
    selectBestFrenchVoice: function() {
        // Priorité des voix françaises: voix neuronales > voix natives > autres voix françaises
        const frenchVoices = this.voices.filter(voice => 
            voice.lang && (voice.lang.includes('fr') || voice.lang.includes('FR'))
        );
        
        // Vérifier d'abord s'il y a une préférence sauvegardée
        const savedVoiceIndex = localStorage.getItem('selectedVoiceIndex');
        if (savedVoiceIndex !== null) {
            const index = parseInt(savedVoiceIndex);
            if (!isNaN(index) && index >= 0 && index < this.voices.length) {
                this.selectedVoice = this.voices[index];
                
                // Mettre à jour l'UI
                if (voiceSelect) {
                    for (let i = 0; i < voiceSelect.options.length; i++) {
                        if (parseInt(voiceSelect.options[i].getAttribute('data-voice-index')) === index) {
                            voiceSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
                return;
            }
        }
        
        // Si aucune préférence ou préférence invalide, sélectionner la meilleure voix française
        if (frenchVoices.length > 0) {
            // Priorité 1: Chercher des voix neuronales/premium (souvent contiennent des mots clés)
            const neuralVoice = frenchVoices.find(voice => 
                voice.name.includes('Neural') || 
                voice.name.includes('Premium') || 
                voice.name.includes('Enhanced')
            );
            
            if (neuralVoice) {
                this.selectedVoice = neuralVoice;
            } else {
                // Priorité 2: Voix natives (souvent sans accent)
                const nativeVoice = frenchVoices.find(voice => 
                    voice.localService === true || 
                    voice.name.includes('Native') ||
                    voice.name.toLowerCase().includes('français') ||
                    voice.name.toLowerCase().includes('france')
                );
                
                if (nativeVoice) {
                    this.selectedVoice = nativeVoice;
                } else {
                    // Priorité 3: N'importe quelle voix française
                    this.selectedVoice = frenchVoices[0];
                }
            }
            
            // Mettre à jour l'UI si une voix française a été trouvée
            if (this.selectedVoice && voiceSelect) {
                const voiceIndex = this.voices.indexOf(this.selectedVoice);
                for (let i = 0; i < voiceSelect.options.length; i++) {
                    if (parseInt(voiceSelect.options[i].getAttribute('data-voice-index')) === voiceIndex) {
                        voiceSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        } else if (this.voices.length > 0) {
            // Si aucune voix française n'est disponible, utiliser la première voix
            this.selectedVoice = this.voices[0];
        }
    },
    
    // NOUVEAU: Sauvegarder la préférence de voix
    saveVoicePreference: function(voiceIndex) {
        localStorage.setItem('selectedVoiceIndex', voiceIndex);
    },
    
    // NOUVEAU: Mettre à jour l'affichage du volume
    updateVolumeDisplay: function(volume) {
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
    },
    
    // Méthode pour mettre à jour le volume des utterances actives
    updateActiveUtterancesVolume: function(newVolume) {
        // Malheureusement, on ne peut pas modifier le volume d'une utterance en cours
        // On peut seulement s'assurer que les nouvelles utterances utilisent le bon volume
        console.log(`Volume mis à jour: ${newVolume}`);
    },
    
    setupVoiceKeepAlive: function() {
        if (!this.synth) {
            console.warn("Synthèse vocale non disponible pour le keepAlive");
            return;
        }
        
        // Mécanisme pour maintenir la synthèse vocale active en permanence
        const keepAlive = () => {
            // Si la synthèse est en cours, appliquer le hack pause/resume
            if (this.synth && this.synth.speaking) {
                this.synth.pause();
                this.synth.resume();
            }
        };
        
        // Exécuter le keepAlive toutes les 250ms quand une synthèse est active
        const keepAliveInterval = safeSetInterval(keepAlive, 250);
        
        // Événement de changement de visibilité de la page
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.synth) {
                // L'utilisateur est revenu sur la page, réveiller la synthèse
                keepAlive();
            }
        });
        
        // Ping périodique pour garder le moteur de synthèse actif
        const pingInterval = safeSetInterval(() => {
            if (this.synth && !this.synth.speaking) {
                // Envoyer un signal silencieux pour maintenir le moteur actif
                const dummy = new SpeechSynthesisUtterance('');
                dummy.volume = 0;
                dummy.onend = function() {
                    // Ne rien faire, juste pour maintenir le moteur actif
                };
                this.synth.speak(dummy);
            }
        }, 10000);
    },
    
    populateVoiceList: function() {
        // Vérifier que le sélecteur de voix existe
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
            voice.lang && (voice.lang.includes('fr') || voice.lang.includes('FR'))
        );
        
        // Si aucune voix française n'est disponible, utiliser toutes les voix
        const voicesToUse = frenchVoices.length > 0 ? frenchVoices : this.voices;
        
        // Ajouter chaque voix à la liste
        voicesToUse.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            
            // Formater le nom de la voix avec la langue
            let displayName = voice.name || 'Voix sans nom';
            if (voice.lang) {
                displayName += ` (${voice.lang})`;
            }
            
            // Indiquer si la voix est native/locale
            if (voice.localService) {
                displayName += ' [Locale]';
            }
            
            option.textContent = displayName;
            option.setAttribute('data-voice-index', this.voices.indexOf(voice)); // Utiliser l'index réel dans le tableau original
            voiceSelect.appendChild(option);
        });
    },
    
    // Fonction spéciale pour prononcer les nombres
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
            
            // Prononcer le nombre
            this.synth.speak(utterance);
            
        } catch (error) {
            console.error('Erreur lors de la prononciation du nombre:', error);
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    },
    
    // Nouvelle fonction pour corriger les problèmes de prononciation spécifiques
    fixSpecificPronunciations: function(text) {
        if (!text) return text;

        // Fixer le problème de "marche un" en priorité
        text = text.replace(/\bmarche un\b/gi, "marche une");
        
        // Fixer le problème de "état profonde"
        text = text.replace(/\bétat profonde\b/gi, "état profond");
        
        // Optimisation spécifique pour le décompte du réveil
        if (text.startsWith("Un.")) {
            text = text.replace(/^Un\./, "Numéro Un.");
        }
        
        // Fixer les problèmes spécifiques de liaison et prononciation
        for (const [problem, solution] of Object.entries(this.pronunciationFixes)) {
            // Utiliser une expression régulière pour trouver toutes les occurrences
            const regex = new RegExp('\\b' + problem + '\\b', 'gi');
            text = text.replace(regex, solution);
        }
        
        // Traitement spécial pour les cas qui nécessitent une insertion de caractère
        text = text.replace(/\bvous entrez\b/gi, "vous-entrez");
        text = text.replace(/\bvous enfonçant\b/gi, "vous-enfonçant");
        text = text.replace(/\bnous arriverons\b/gi, "nous-arriverons");
        text = text.replace(/\bde l'air\b/gi, "de-l'air");
        text = text.replace(/\bvous apaise\b/gi, "vous-apaise");
        text = text.replace(/\bvous ancrez\b/gi, "vous-ancrez");
        text = text.replace(/\bvous enveloppent\b/gi, "vous-enveloppent");
        text = text.replace(/\best ici\b/gi, "est-ici");
        
        return text;
    },
    
    // Méthode speak améliorée avec correction des problèmes de prononciation
    speak: function(text) {
        try {
            // Vérifier si le son est activé
            if (!audioToggle || !audioToggle.checked || !this.synth || !text) {
                return;
            }
            
            // Prétraiter le texte pour les problèmes de prononciation spécifiques
            text = this.fixSpecificPronunciations(text);
            
            // Créer un nouvel énoncé
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configurer l'énoncé avec la voix sélectionnée
            if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
            }
            
            // Appliquer le volume actuel à chaque utterance
            utterance.volume = this.volume;
            utterance.rate = 0.78; // Vitesse ralentie pour une articulation parfaite
            utterance.pitch = 1.02; // Pitch légèrement ajusté pour une meilleure sonorité
            
            // Définir la langue française explicitement
            utterance.lang = 'fr-FR';
            
            // Suivre cet utterance
            this.utteranceQueue.push(utterance);
            
            // Ajouter des événements avec des délais pour assurer la stabilité
            utterance.onstart = () => {
                safeSetTimeout(() => {
                    speakingInProgress = true;
                    if (speakingIndicator) {
                        speakingIndicator.classList.add('active');
                    }
                }, 50);
            };
            
            utterance.onend = () => {
                // Retirer cet utterance de la file d'attente
                const index = this.utteranceQueue.indexOf(utterance);
                if (index !== -1) {
                    this.utteranceQueue.splice(index, 1);
                }
                
                // Petit délai pour éviter les problèmes de timing
                safeSetTimeout(() => {
                    // Ne mettre fin que si aucune autre utterance n'est en cours
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
                
                // Réinitialiser l'état si nécessaire
                safeSetTimeout(() => {
                    if (this.utteranceQueue.length === 0) {
                        speakingInProgress = false;
                        if (speakingIndicator) {
                            speakingIndicator.classList.remove('active');
                        }
                    }
                }, 100);
            };
            
            // Prononcer le texte avec un léger délai pour stabiliser
            safeSetTimeout(() => {
                this.synth.speak(utterance);
            }, 50);
            
        } catch (error) {
            console.error('Erreur de synthèse vocale:', error);
            speakingInProgress = false;
        }
    },
    
    // Arrêter toute la synthèse vocale proprement - AMÉLIORÉ
    stop: function() {
        try {
            console.log("Arrêt complet de toute synthèse vocale");
            
            // Arrêter tous les minuteurs
            if (this.resumeTimer) {
                clearTimeout(this.resumeTimer);
                this.resumeTimer = null;
            }
            
            // Annuler toutes les paroles
            if (this.synth) {
                // Double annulation pour s'assurer que tout est bien arrêté
                this.synth.cancel();
                
                // Seconde annulation après un bref délai pour garantir l'arrêt complet
                safeSetTimeout(() => {
                    if (this.synth) {
                        this.synth.cancel();
                    }
                }, 100);
            }
            
            // Réinitialiser les états
            this.utteranceQueue = [];
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
}

// Initialiser toutes les références DOM
function initDOMReferences() {
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

    // Boutons
    startBtn = document.getElementById('startBtn');
    startCoherenceBtn = document.getElementById('startCoherenceBtn');
    nextPrepBtn = document.getElementById('nextPrepBtn');
    skipInductionBtn = document.getElementById('skipInductionBtn');
    skipDeepeningBtn = document.getElementById('skipDeepeningBtn');
    nextExplorationBtn = document.getElementById('nextExplorationBtn');
    completeBtn = document.getElementById('completeBtn');
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
}

// Fonction pour configurer tous les écouteurs d'événements
function setupEventListeners() {
    // Boutons de navigation avec système anti-double-clic
    if (startBtn) startBtn.addEventListener('click', () => safeShowPage(2));
    if (startCoherenceBtn) startCoherenceBtn.addEventListener('click', startCoherenceCardiaque);
    if (nextPrepBtn) nextPrepBtn.addEventListener('click', () => safeShowPage(3));
    
    // Activer les sons binauraux lors du clic sur les boutons spécifiques (seulement si le bouton est activé)
    if (skipInductionBtn) {
        skipInductionBtn.addEventListener('click', () => {
            // Vérifier l'état du bouton binauralToggle avant d'activer les sons
            const binauralToggle = document.getElementById('binauralToggle');
            if (binauralToggle && binauralToggle.checked) {
                startBinauralBeats();
            }
            safeShowPage(4);
        });
    }
    
    if (skipDeepeningBtn) {
        skipDeepeningBtn.addEventListener('click', () => {
            // Vérifier l'état du bouton binauralToggle avant d'activer les sons
            const binauralToggle = document.getElementById('binauralToggle');
            if (binauralToggle && binauralToggle.checked) {
                startBinauralBeats();
            }
            safeShowPage(5);
        });
    }
    
    if (nextExplorationBtn) nextExplorationBtn.addEventListener('click', () => safeShowPage(6));
    
    // Arrêter les sons binauraux à la fin du programme
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            if (binauralActive) {
                // Arrêter progressivement les sons binauraux
                if (binauralGain) {
                    binauralGain.gain.linearRampToValueAtTime(0, binauralContext.currentTime + 2);
                }
                // Après la diminution du volume, arrêter complètement
                safeSetTimeout(() => {
                    stopBinauralBeats();
                    binauralActive = false;
                    safeShowPage(7);
                }, 2000);
            } else {
                safeShowPage(7);
            }
        });
    }
    
    if (restartBtn) restartBtn.addEventListener('click', () => safeShowPage(2));
    if (homeBtn) homeBtn.addEventListener('click', () => safeShowPage(1));
    
    // Sons binauraux - Modification pour activation immédiate et continue
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
}

// Fonction principale d'initialisation du système anti-veille
function initAntiSleepSystem() {
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

function stopBinauralBeats() {
    try {
        if (!binauralContext || binauralOscillators.length === 0) {
            console.log("Aucun son binaural actif à arrêter");
            binauralActive = false;
            return false;
        }
        
        console.log("Arrêt des sons binauraux");
        
        // Diminuer progressivement le volume avant d'arrêter
        if (binauralGain) {
            binauralGain.gain.linearRampToValueAtTime(0, binauralContext.currentTime + 1.5);
        }
        
        // Arrêter les oscillateurs après la baisse de volume
        safeSetTimeout(() => {
            binauralOscillators.forEach(osc => {
                try {
                    osc.stop();
                    osc.disconnect();
                } catch (e) {
                    console.log("Erreur lors de l'arrêt d'un oscillateur:", e);
                }
            });
            
            // Vider le tableau des oscillateurs
            binauralOscillators = [];
            
            // Marquer les sons binauraux comme inactifs
            binauralActive = false;
            
            console.log("Sons binauraux arrêtés avec succès");
        }, 1500);
        
        return true;
    } catch (error) {
        console.error("Erreur lors de l'arrêt des sons binauraux:", error);
        return false;
    }
}

function updateBinauralVolume(volume) {
    try {
        // Volume entre 0 et 1
        binauralVolume = Math.max(0, Math.min(1, volume));
        
        if (binauralGain) {
            // Mettre à jour le volume progressivement
            binauralGain.gain.linearRampToValueAtTime(binauralVolume, binauralContext.currentTime + 0.5);
        }
        
        console.log("Volume des sons binauraux mis à jour:", binauralVolume);
        return true;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du volume des sons binauraux:", error);
        return false;
    }
}

// Fonction pour ajuster les styles sur mobile
function adjustMobileStyles() {
    try {
        const isMobile = window.innerWidth <= 768;
        console.log("Ajustement des styles pour mobile:", isMobile);
        
        // Création d'un style dynamique
        let styleElement = document.getElementById('mobile-styles-fix');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'mobile-styles-fix';
            document.head.appendChild(styleElement);
        }
        
        if (isMobile) {
            // Styles ajustés pour mobile
            styleElement.textContent = `
                /* Ajustement des points dans la liste */
                .steps-list li::before {
                    width: 16px !important;
                    height: 16px !important;
                    left: 2px !important;
                    top: 50% !important;
                }
                
                /* Ajustement des étapes de progression */
                .step {
                    width: 14px !important;
                    height: 14px !important;
                }
                
                /* Meilleure adaptation pour les labels d'étapes */
                .step-label {
                    width: 60px !important;
                    font-size: 0.65rem !important;
                }
            `;
        } else {
            // Réinitialisation pour desktop
            styleElement.textContent = '';
        }
        
        return true;
    } catch (error) {
        console.error("Erreur lors de l'ajustement des styles pour mobile:", error);
        return false;
    }
}

// Fonction améliorée pour segmenter le texte en respectant les structures syntaxiques
function segmentTextForBetterSpeech(text) {
    // Si le texte est court, pas besoin de segmentation
    if (text.length < 100) return [text];
    
    // Diviser d'abord sur les ponctuations fortes
    let segments = text.split(/(?<=[.!?:])\s+/);
    
    // Traiter plus finement les segments longs
    let finalSegments = [];
    segments.forEach(segment => {
        if (segment.length > 120) {
            // Diviser sur les virgules pour les segments très longs
            const commaSegments = segment.split(/(?<=,)\s+/);
            
            // Si même après division par virgules certains segments sont trop longs
            let subSegments = [];
            commaSegments.forEach(commaSeg => {
                if (commaSeg.length > 100) {
                    // Chercher des points de césure naturels: conjonctions, prépositions
                    const parts = commaSeg.split(/\s+(et|ou|mais|donc|car|ni|comme|si|quand|lorsque|puisque|parce que|pour|dans|sur|avec|sans|sous|entre|vers|avant|après)\s+/i);
                    
                    // Reconstruire des phrases complètes à partir des fragments
                    for (let i = 0; i < parts.length; i += 2) {
                        let subSegment = parts[i];
                        if (i + 1 < parts.length) {
                            subSegment += " " + parts[i + 1];
                        }
                        subSegments.push(subSegment.trim());
                    }
                } else {
                    subSegments.push(commaSeg);
                }
            });
            
            finalSegments = finalSegments.concat(subSegments);
        } else {
            finalSegments.push(segment);
        }
    });
    
    // Filtrer les segments vides
    return finalSegments.filter(seg => seg.trim() !== '');
}

// Fonction plus précise pour estimer la durée de parole
function calculateEstimatedDuration(text) {
    // Durée de base en millisecondes
    const baseTime = 3000;
    
    // Compter plus précisément pour le français
    const wordsCount = text.split(/\s+/).length;
    const characterCount = text.length;
    const sentenceCount = (text.match(/[.!?:]+/g) || []).length + 1;
    
    // Facteurs pour le français (parole légèrement plus lente que l'anglais)
    const wordTime = wordsCount * 800; // ~800ms par mot en français à vitesse modérée
    const charTime = characterCount * 75; // ~75ms par caractère
    const sentenceTime = sentenceCount * 500; // Pauses entre phrases
    
    // Calculer la durée totale en prenant le maximum et en ajoutant une marge de sécurité
    const rawDuration = Math.max(baseTime, wordTime, charTime);
    const margin = 1.2; // 20% de marge supplémentaire
    
    return Math.round(rawDuration * margin) + sentenceTime;
}

// Fonction améliorée pour prononcer des segments de texte avec une meilleure intonation
function speakTextSegments(segments, index, onComplete) {
    if (index >= segments.length) {
        if (typeof onComplete === 'function') {
            // Ajouter un délai de sécurité pour éviter les coupures prématurées
            safeSetTimeout(onComplete, 100);
        }
        return;
    }
    
    // S'assurer que le segment n'est pas vide
    if (!segments[index] || segments[index].trim() === '') {
        // Délai de sécurité lors du passage au segment suivant
        safeSetTimeout(() => {
            speakTextSegments(segments, index + 1, onComplete);
        }, 100);
        return;
    }
    
    // Appliquer les corrections de prononciation spécifiques
    const correctedSegment = speech.fixSpecificPronunciations(segments[index]);
    
    // Créer une utterance personnalisée pour maintenir la continuité
    const utterance = new SpeechSynthesisUtterance(correctedSegment);
    
    if (speech.selectedVoice) {
        utterance.voice = speech.selectedVoice;
    }
    
    // Appliquer les paramètres vocaux
    utterance.volume = speech.volume;
    utterance.rate = speech.rate;
    utterance.lang = 'fr-FR';
    
    // Variations subtiles de pitch entre les segments pour une intonation naturelle
    // Règles prosodiques françaises: légère montée pour les questions, baisse pour les déclarations
    let segmentPitch = speech.pitch;
    const segment = segments[index];
    
    // Questions: légère hausse de pitch
    if (segment.trim().endsWith('?')) {
        segmentPitch += 0.15;
    } 
    // Phrases exclamatives: accentuation plus forte
    else if (segment.trim().endsWith('!')) {
        segmentPitch += 0.1;
    }
    // Phrases déclaratives: baisse légère en fin de phrase
    else if (segment.trim().endsWith('.') && index === segments.length - 1) {
        segmentPitch -= 0.05;
    }
    // Milieu de phrase: légère variation aléatoire pour naturel
    else {
        const pitchVariation = 0.04;
        segmentPitch += (Math.random() * pitchVariation * 2 - pitchVariation);
    }
    
    // Appliquer le pitch calculé
    utterance.pitch = segmentPitch;
    
    // Pause optimisée entre les segments pour des transitions fluides
    // Plus longue après ponctuations fortes, plus courte entre segments reliés
    let pauseDuration = 200; // Pause par défaut
    
    if (segment.trim().endsWith('.') || segment.trim().endsWith('!') || segment.trim().endsWith('?')) {
        pauseDuration = 400; // Pause plus longue après ponctuation forte
    } else if (segment.trim().endsWith(',') || segment.trim().endsWith(';') || segment.trim().endsWith(':')) {
        pauseDuration = 250; // Pause moyenne après ponctuation faible
    } else {
        pauseDuration = 150; // Pause courte entre segments reliés
    }
    
    // Callbacks de gestion
    utterance.onend = function() {
        safeSetTimeout(() => {
            speakTextSegments(segments, index + 1, onComplete);
        }, pauseDuration);
    };
    
    utterance.onerror = function(e) {
        console.error('Erreur de synthèse vocale:', e);
        
        // Continuer malgré l'erreur après une pause plus longue
        safeSetTimeout(() => {
            speakTextSegments(segments, index + 1, onComplete);
        }, pauseDuration * 2);
    };
    
    // Utiliser le moteur de synthèse directement
    speech.synth.speak(utterance);
}

// Textes optimisés pour les marches (décompte) pour une meilleure fluidité
function getStairText(step) {
    return {
        10: "Marche dix. Vous commencez à descendre, sentez la relaxation envahir votre corps.",
        9: "Marche neuf. Vos épaules se détendent, et votre respiration devient plus profonde.",
        8: "Marche huit. Vos bras et vos mains deviennent lourds, agréablement détendus.",
        7: "Marche sept. La sensation de calme se diffuse dans tout votre corps.",
        6: "Marche six. Vous descendez plus profondément, vos jambes sont maintenant complètement détendues.",
        5: "Marche cinq. À mi-chemin, vous vous sentez parfaitement à l'aise, en sécurité.",
        4: "Marche quatre. Votre esprit se calme, les pensées ralentissent.",
        3: "Marche trois. Presque arrivé, vous êtes maintenant dans un état de relaxation profonde.",
        2: "Marche deux. Votre conscience intérieure s'éveille tandis que votre corps se relaxe totalement.",
        1: "Marche une. Vous êtes arrivé dans cet état d'hypnose profond et agréable.",
        0: ""
    }[step] || "";
}

// Textes optimisés pour le décompte du réveil avec numéros explicitement mentionnés
function getCountText(count) {
    return {
        5: "Cinq. Commencez à prendre conscience de votre corps.",
        4: "Quatre. Sentez l'énergie revenir progressivement.",
        3: "Trois. Vous pouvez bouger légèrement vos doigts et vos orteils.",
        2: "Deux. Respirez plus profondément, sentez-vous revigoré.",
        1: "Un. Préparez-vous à ouvrir les yeux, en pleine forme.",
        0: ""
    }[count] || "";
}

// Version améliorée avec meilleure gestion de la fluidité
function queueSpeech(text, delay, textElement) {
    try {
        if (!text || text.trim() === '') return;
        
        if (delay === undefined) delay = 0;
        
        speechQueue.push({text, delay, textElement});
        
        // Si rien n'est en cours, démarrer le traitement
        if (!isSpeaking && !waitingForNextSpeech) {
            processSpeechQueue();
        }
    } catch (error) {
        console.error('Erreur dans queueSpeech:', error);
    }
}

// Traitement amélioré de la file d'attente vocale
function processSpeechQueue() {
    try {
        if (speechQueue.length === 0) {
            isSpeaking = false;
            waitingForNextSpeech = false;
            return;
        }
        
        isSpeaking = true;
        const nextSpeech = speechQueue.shift();
        
        // Mettre à jour l'élément de texte avant de commencer à parler
        if (nextSpeech.textElement && typeof nextSpeech.textElement === 'object') {
            nextSpeech.textElement.textContent = nextSpeech.text;
        }
        
        // Attendre le délai spécifié avant de parler
        safeSetTimeout(function() {
            // Si le texte est trop long, le diviser pour une meilleure fluidité
            const textSegments = segmentTextForBetterSpeech(nextSpeech.text);
            
            if (textSegments.length === 1) {
                // Texte court, prononcer directement
                if (nextSpeech.text) {
                    speech.speak(nextSpeech.text);
                }
                
                // Attendre que la parole soit terminée avant de continuer
                const estimatedDuration = calculateEstimatedDuration(nextSpeech.text);
                
                waitingForNextSpeech = true;
                
                safeSetTimeout(function() {
                    waitingForNextSpeech = false;
                    processSpeechQueue();
                }, estimatedDuration);
            } else {
                // Texte long, prononcer en segments
                waitingForNextSpeech = true;
                speakTextSegments(textSegments, 0, () => {
                    waitingForNextSpeech = false;
                    processSpeechQueue();
                });
            }
            
        }, nextSpeech.delay);
    } catch (error) {
        console.error('Erreur dans processSpeechQueue:', error);
        // Réinitialiser les états pour éviter un blocage
        isSpeaking = false;
        waitingForNextSpeech = false;
    }
}

// AMÉLIORATION: Réécrire les textes d'exploration pour de meilleures liaisons
function improveExplorationTexts() {
    return [
        "Imaginez un lieu de paix et de sécurité. Un endroit où vous vous sentez parfaitement bien. Peut-être un lieu connu, ou un espace entièrement imaginaire. Prenez le temps de créer cet endroit dans votre esprit.",
        
        "Observez les couleurs qui vous entourent. Sont-elles vives ou douces ? Remarquez les formes, les contours, les détails visuels. Peut-être y a-t-il une lumière particulière qui baigne cet endroit, le rendant plus apaisant.",
        
        "Écoutez maintenant les sons de ce lieu. Peut-être entendez-vous le murmure d'un ruisseau, le chant des oiseaux, ou simplement un silence profond et réconfortant. Laissez ces sons vous envelopper complètement.",
        
        "Ressentez la température de l'air sur votre peau. Est-ce la chaleur douce du soleil, ou une fraîcheur agréable ? Sentez l'atmosphère autour de vous, peut-être une légère brise caresse votre visage.",
        
        "Explorez maintenant les textures présentes. Le sol sous vos pieds est-il doux comme du sable, ferme comme de la pierre, ou souple comme de l'herbe ? Touchez les surfaces, ressentez leur contact contre votre peau.",
        
        "Respirez profondément, et remarquez les parfums, les odeurs de cet endroit spécial. Peut-être l'odeur fraîche de la nature, le parfum des fleurs, l'air marin, ou un arôme particulier qui vous apaise profondément.",
        
        "À chaque respiration, vous vous ancrez davantage dans ce lieu, et votre relaxation s'approfondit. Sentez comment votre corps s'alourdit agréablement, se détend complètement.",
        
        "Imaginez maintenant qu'une douce énergie commence à vous envelopper. Vous pouvez la visualiser comme une lumière colorée, ou simplement la ressentir comme une sensation de bien-être qui se diffuse en vous.",
        
        "Cette énergie bienveillante circule lentement dans tout votre corps, de la tête aux pieds, apportant calme et vitalité. Elle dissout toute tension, toute préoccupation au passage.",
        
        "Vous êtes parfaitement présent dans cet instant, dans cet espace de tranquillité. Tout ce dont vous avez besoin est ici. Vous êtes en sécurité, protégé, profondément ressourcé."
    ];
}

// Démarrer la cohérence cardiaque
function startCoherenceCardiaque() {
    try {
        // Vérifier que les éléments existent
        if (!coherenceIntro || !coherenceContainer || !coherenceInstruction) {
            console.error("Éléments de cohérence cardiaque manquants");
            return;
        }
        
        // Cacher l'intro et montrer l'animation
        coherenceIntro.style.display = 'none';
        coherenceContainer.style.display = 'block';
        
        // Réinitialiser le timer
        secondsRemaining = 120;
        updateTimerDisplay();
        
        // Instructions initiales
        const initialText = "Nous allons pratiquer la cohérence cardiaque pendant 2 minutes. Suivez le mouvement du cercle. Quand il monte, inspirez. Quand il descend, expirez.";
        coherenceInstruction.textContent = initialText;
        queueSpeech(initialText);
        
        // Démarrer l'animation après un court délai
        safeSetTimeout(function() {
            // Animer la respiration
            animateBreath();
            
            // Suite de la fonction startCoherenceCardiaque
            // Démarrer le décompte
            coherenceTimer = safeSetInterval(function() {
                secondsRemaining--;
                updateTimerDisplay();
                
                // Si le temps est écoulé
                if (secondsRemaining <= 0) {
                    stopCoherenceCardiaque();
                    const completionText = "Excellent. Vous avez terminé les 2 minutes de cohérence cardiaque. Vous pouvez maintenant continuer vers l'étape suivante.";
                    coherenceInstruction.textContent = completionText;
                    queueSpeech(completionText);
                    
                    // Mettre en évidence le bouton suivant s'il existe
                    if (nextPrepBtn) {
                        nextPrepBtn.classList.add('pulse-animation');
                    }
                }
            }, 1000);
        }, 5000);
    } catch (error) {
        console.error("Erreur dans startCoherenceCardiaque:", error);
    }
}

// Animation de respiration
function animateBreath() {
    try {
        // Vérifier que les éléments existent
        if (!breathCircle || !breathInLabel || !breathOutLabel || !coherenceInstruction) {
            console.error("Éléments de respiration manquants");
            return;
        }
        
        let phase = 'in'; // 'in' pour inspiration, 'out' pour expiration
        let step = 0;
        const totalSteps = 50; // 5 secondes à 10 étapes par seconde
        
        // Arrêter l'intervalle précédent si existant
        if (coherenceInterval) {
            clearInterval(coherenceInterval);
        }
        
        // Démarrer l'animation
        coherenceInterval = safeSetInterval(function() {
            if (phase === 'in') {
                // Animation d'inspiration (monter)
                const progress = step / totalSteps;
                breathCircle.style.transform = `translate(-50%, calc(-50% - ${80 * progress}px))`;
                
                // Afficher le label d'inspiration
                breathInLabel.style.opacity = 1;
                breathOutLabel.style.opacity = 0;
                
                // Mettre à jour l'instruction pour l'inspiration
                if (step === 0) {
                    coherenceInstruction.textContent = "Inspirez lentement...";
                    
                    // Utiliser un délai pour éviter de couper la voix précédente
                    if (audioToggle && audioToggle.checked && !speakingInProgress) {
                        speech.speak("Inspirez");
                    }
                }
                
                step++;
                if (step >= totalSteps) {
                    phase = 'out';
                    step = 0;
                }
            } else {
                // Animation d'expiration (descendre)
                const progress = step / totalSteps;
                breathCircle.style.transform = `translate(-50%, calc(-50% + ${80 * progress}px))`;
                
                // Afficher le label d'expiration
                breathInLabel.style.opacity = 0;
                breathOutLabel.style.opacity = 1;
                
                // Mettre à jour l'instruction pour l'expiration
                if (step === 0) {
                    coherenceInstruction.textContent = "Expirez doucement...";
                    
                    // Utiliser un délai pour éviter de couper la voix précédente
                    if (audioToggle && audioToggle.checked && !speakingInProgress) {
                        speech.speak("Expirez");
                    }
                }
                
                step++;
                if (step >= totalSteps) {
                    phase = 'in';
                    step = 0;
                }
            }
        }, 100); // 10 frames par seconde
    } catch (error) {
        console.error("Erreur dans animateBreath:", error);
    }
}

// Mettre à jour l'affichage du minuteur
function updateTimerDisplay() {
    if (!timerDisplay) return;
    
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Arrêter la cohérence cardiaque
function stopCoherenceCardiaque() {
    try {
        // Arrêter les intervalles
        if (coherenceInterval) {
            clearInterval(coherenceInterval);
            coherenceInterval = null;
        }
        
        if (coherenceTimer) {
            clearInterval(coherenceTimer);
            coherenceTimer = null;
        }
        
        // Réinitialiser l'affichage
        if (breathCircle) {
            breathCircle.style.transform = 'translate(-50%, -50%)';
        }
        
        if (breathInLabel) breathInLabel.style.opacity = 0;
        if (breathOutLabel) breathOutLabel.style.opacity = 0;
    } catch (error) {
        console.error("Erreur dans stopCoherenceCardiaque:", error);
    }
}

// Réinitialiser la cohérence cardiaque
function resetCoherenceCardiaque() {
    try {
        // Arrêter tout
        stopCoherenceCardiaque();
        
        // Réinitialiser l'affichage si les éléments existent
        if (coherenceIntro) coherenceIntro.style.display = 'block';
        if (coherenceContainer) coherenceContainer.style.display = 'none';
        
        secondsRemaining = 120;
        updateTimerDisplay();
        
        // Retirer l'animation du bouton s'il existe
        if (nextPrepBtn) {
            nextPrepBtn.classList.remove('pulse-animation');
        }
    } catch (error) {
        console.error("Erreur dans resetCoherenceCardiaque:", error);
    }
}

// Démarrer l'induction avec activation conditionnelle des sons binauraux
function startInduction() {
    try {
        // Vérifier que les éléments existent
        if (!inductionCounter || !inductionInstruction) {
            console.error("Éléments d'induction manquants");
            return;
        }
        
        // Activer explicitement le système anti-veille pour éviter la mise en veille
        enableKeepAwake();
        
        // Vérifier si le bouton binaural est activé avant de démarrer les sons
        const binauralToggle = document.getElementById('binauralToggle');
        if (binauralToggle && binauralToggle.checked) {
            startBinauralBeats();
        }
        
        const inductionTexts = [
            "Fixez votre regard sur le point central de la spirale, laissez-vous absorber par ce point",
            "Laissez votre vision périphérique capter naturellement le mouvement circulaire",
            "Respirez tranquillement en vous concentrant sur la spirale qui tourne doucement",
            "Vos paupières peuvent devenir lourdes, c'est tout à fait normal",
            "Laissez-vous absorber complètement par ce motif hypnotique"
        ];
        
        let count = 10;
        let currentInstruction = 0;
        let instructionInterval;
        
        // Initialiser l'affichage
        inductionCounter.textContent = count;
        inductionInstruction.textContent = inductionTexts[0];
        
        // Attendre que la page soit bien chargée
        safeSetTimeout(function() {
            // Début de la séquence
            queueSpeech(inductionTexts[0], 0, inductionInstruction);
            
            // Progression des instructions
            instructionInterval = safeSetInterval(function() {
                currentInstruction++;
                
                if (currentInstruction < inductionTexts.length) {
                    queueSpeech(inductionTexts[currentInstruction], 0, inductionInstruction);
                } else {
                    clearInterval(instructionInterval);
                }
            }, 8000);
            
            // Décompte
            safeSetTimeout(function() {
                startCountdown();
            }, 5000);
            
            function startCountdown() {
                if (count <= 0) {
                    clearInterval(instructionInterval);
                    
                    const finalText = "Vous entrez maintenant dans un état plus profond de relaxation";
                    queueSpeech(finalText, 0, inductionInstruction);
                    
                    safeSetTimeout(function() {
                        safeShowPage(4); // Passer à la profondeur
                    }, 7000);
                    return;
                }
                
                count--;
                inductionCounter.textContent = count;
                
                safeSetTimeout(startCountdown, 4500);
            }
        }, 1000);
    } catch (error) {
        console.error("Erreur dans startInduction:", error);
    }
}

// Démarrer l'approfondissement avec une synchronisation parfaite et des sons binauraux conditionnels
function startDeepening() {
    try {
        // Vérifier que les éléments existent
        if (!deepeningInstruction || !stairsCounter) {
            console.error("Éléments d'approfondissement manquants");
            return;
        }
        
        // S'assurer que le système anti-veille reste actif
        enableKeepAwake();
        
        // Vérifier si le bouton binaural est activé avant de démarrer les sons
        const binauralToggle = document.getElementById('binauralToggle');
        if (binauralToggle && binauralToggle.checked) {
            startBinauralBeats();
        }
        
        const deepeningTexts = [
            "Maintenant, je vous invite à imaginer un escalier. Un escalier qui descend en spirale, confortablement.",
            "Vous allez descendre cet escalier, marche par marche, et à chaque marche, vous vous sentirez plus détendu, plus calme.",
            "Nous allons compter de 10 à 1, et à chaque chiffre, vous descendrez une marche, vous enfonçant plus profondément dans un état d'hypnose agréable.",
            "Quand nous arriverons à 1, vous pourrez fermer les yeux si ce n'est pas déjà fait, et vous serez dans un état de transe profonde et confortable."
        ];
        
        // Préparer les compteurs
        let currentPhase = "intro"; // "intro", "countdown", "finale"
        let currentStep = 0; // pour les textes d'intro
        let stairCount = 10; // pour les marches
        
        // Cacher le compteur au début
        stairsCounter.style.visibility = 'hidden';
        stairsCounter.textContent = stairCount;
        
        // Créer les points lumineux pour l'animation d'escalier
        createStairDots();
        
        // Attendre que la page soit bien initialisée
        safeSetTimeout(function() {
            // Démarrer la séquence
            progressSequence();
        }, 1000);
        
        // Fonction récursive pour progresser dans la séquence
        function progressSequence() {
            if (currentPhase === "intro") {
                // Phase d'introduction - 4 textes d'introduction
                if (currentStep < deepeningTexts.length) {
                    // Afficher et prononcer le texte actuel
                    deepeningInstruction.textContent = deepeningTexts[currentStep];
                    
                    // Utiliser la segmentation pour les textes longs
                    const textSegments = segmentTextForBetterSpeech(deepeningTexts[currentStep]);
                    speakTextSegments(textSegments, 0, () => {
                        currentStep++;
                        // Programmer la prochaine étape
                        safeSetTimeout(progressSequence, 3000);
                    });
                } else {
                    // Fin de l'introduction, commencer le décompte
                    currentPhase = "countdown";
                    
                    // Petit délai avant de commencer le décompte
                    safeSetTimeout(progressSequence, 2000);
                }
            }
            else if (currentPhase === "countdown") {
                // Phase de décompte - marches de 10 à 1
                if (stairCount > 0) {
                    // Afficher le compteur pour le décompte
                    stairsCounter.style.visibility = 'visible';
                    stairsCounter.textContent = stairCount;
                    
                    // Obtenir et afficher le texte pour cette marche
                    const stairText = getStairText(stairCount);
                    deepeningInstruction.textContent = stairText;
                    
                    // IMPORTANT: S'assurer que "marche une" est bien prononcé pour la marche 1
                    if (stairCount === 1) {
                        speech.speak("Marche une. Vous êtes arrivé dans cet état d'hypnose profond et agréable.");
                        
                        safeSetTimeout(() => {
                            stairCount--;
                            safeSetTimeout(progressSequence, 3000);
                        }, calculateEstimatedDuration("Marche une. Vous êtes arrivé dans cet état d'hypnose profond et agréable."));
                    } else {
                        // Lire le texte de la marche avec la nouvelle méthode
                        const textSegments = segmentTextForBetterSpeech(stairText);
                        speakTextSegments(textSegments, 0, () => {
                            stairCount--;
                            // Programmer la prochaine marche
                            safeSetTimeout(progressSequence, 3000);
                        });
                    }
                } else {
                    // Fin du décompte, passer à la finale
                    currentPhase = "finale";
                    
                    // Cacher le compteur à la fin
                    stairsCounter.style.visibility = 'hidden';
                    
                    // Petit délai avant le message final
                    safeSetTimeout(progressSequence, 2000);
                }
            }
            else if (currentPhase === "finale") {
                // Phase finale - message de conclusion et transition
                const finalMessage = "Vous êtes maintenant dans un état de relaxation profonde. Si ce n'est pas déjà fait, fermez doucement vos yeux et laissez-vous porter par ma voix.";
                deepeningInstruction.textContent = finalMessage;
                
                // Utiliser la segmentation pour le message final
                const textSegments = segmentTextForBetterSpeech(finalMessage);
                speakTextSegments(textSegments, 0, () => {
                    // Transition à la prochaine page après un délai suffisant
                    safeSetTimeout(function() {
                        safeShowPage(5); // Passer à l'exploration
                    }, 5000);
                });
            }
        }
    } catch (error) {
        console.error("Erreur dans startDeepening:", error);
    }
}

// Création dynamique des points lumineux pour l'escalier
function createStairDots() {
    try {
        const container = document.getElementById('stairDotsContainer');
        if (!container) {
            console.error("Container de points d'escalier manquant");
            return;
        }
        
        // Vider le container d'abord
        container.innerHTML = '';
        
        // Créer 20 points à des positions aléatoires
        for (let i = 0; i < 20; i++) {
            const dot = document.createElement('div');
            dot.className = 'stair-dot';
            
            // Position aléatoire
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * 8; // Délai aléatoire pour l'animation
            
            dot.style.left = x + '%';
            dot.style.top = y + '%';
            dot.style.animationDelay = delay + 's';
            
            container.appendChild(dot);
        }
    } catch (error) {
        console.error("Erreur dans createStairDots:", error);
    }
}

// Fonction complète d'exploration avec animations et effets visuels
function startExploration() {
    try {
        // Vérifier que les éléments existent
        if (!explorationInstruction || !energyScene) {
            console.error("Éléments d'exploration manquants");
            return;
        }
        
        // S'assurer que le système anti-veille reste actif
        enableKeepAwake();
        
        // Vérifier si le bouton binaural est activé avant de démarrer les sons
        const binauralToggle = document.getElementById('binauralToggle');
        if (binauralToggle && binauralToggle.checked) {
            startBinauralBeats();
        }
        
        // Utiliser les textes améliorés pour de meilleures liaisons
        const explorationTexts = improveExplorationTexts();
        
        // Récupérer les éléments d'animation
        const explorationScene = document.getElementById('explorationScene');
        const explorationProgress = document.getElementById('explorationProgress');
        
        // Variables de contrôle
        let currentTextIndex = 0;
        let particlesInterval;
        const totalTexts = explorationTexts.length;
        
        // Fonction pour créer une particule avec des couleurs et formes variées
        function createParticle() {
            if (!explorationScene) return null;
            
            const particle = document.createElement('div');
            particle.className = 'exploration-particle';
            
            // Variations de couleurs pour des particules plus diversifiées
            const colors = [
                'rgba(255, 255, 255, 0.8)', // blanc
                'rgba(173, 216, 230, 0.8)', // bleu clair
                'rgba(255, 223, 186, 0.8)', // orange pâle
                'rgba(152, 251, 152, 0.8)', // vert pâle
                'rgba(238, 130, 238, 0.8)', // violet pâle
                'rgba(255, 182, 193, 0.8)', // rose pâle
                'rgba(240, 230, 140, 0.8)'  // jaune pâle
            ];
            
            // Variations de taille
            const size = 3 + Math.random() * 8; // entre 3px et 11px
            
            // Appliquer les styles
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // 50% de chance d'avoir une particule ronde ou carrée
            if (Math.random() > 0.5) {
                particle.style.borderRadius = '50%';
            }
            
            // Position aléatoire
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 150; // Distance plus variée
            const x = Math.cos(angle) * distance + 150;
            const y = Math.sin(angle) * distance + 150;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            explorationScene.appendChild(particle);
            
            // Animation plus variée
            safeSetTimeout(() => {
                particle.style.opacity = 0.6 + Math.random() * 0.4; // Opacité variée
                
                // Mouvements plus organiques
                const targetX = 150 + (Math.random() * 60 - 30);
                const targetY = 150 + (Math.random() * 60 - 30);
                const rotation = Math.random() * 360; // Rotation aléatoire
                const scale = 0.8 + Math.random() * 0.5; // Échelle aléatoire
                
                particle.style.transform = `translate(${targetX - x}px, ${targetY - y}px) rotate(${rotation}deg) scale(${scale})`;
                
                // Durée de vie variable des particules
                const duration = 8000 + Math.random() * 7000;
                
                // Disparition progressive
                safeSetTimeout(() => {
                    particle.style.opacity = 0;
                    safeSetTimeout(() => {
                        if (explorationScene.contains(particle)) {
                            explorationScene.removeChild(particle);
                        }
                    }, 1000);
                }, duration);
            }, 100);
            
            return particle;
        }
        
        // Fonction pour créer des particules périodiquement
        function startParticlesAnimation() {
            return safeSetInterval(() => {
                if (currentTextIndex < totalTexts) {
                    // Augmenter progressivement le nombre de particules créées
                    const particleCount = 1 + Math.floor(currentTextIndex / 2);
                    
                    for (let i = 0; i < particleCount; i++) {
                        safeSetTimeout(() => createParticle(), i * 200);
                    }
                }
            }, 1500);
        }
        
        // Créer un effet de vagues pour le fond
        function createBackgroundEffect() {
            if (!explorationScene) return null;
            
            // Créer un élément pour l'effet de vague
            const waveEffect = document.createElement('div');
            waveEffect.className = 'wave-effect';
            waveEffect.style.position = 'absolute';
            waveEffect.style.top = '50%';
            waveEffect.style.left = '50%';
            waveEffect.style.transform = 'translate(-50%, -50%)';
            waveEffect.style.width = '200px';
            waveEffect.style.height = '200px';
            waveEffect.style.borderRadius = '50%';
            waveEffect.style.background = 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)';
            waveEffect.style.boxShadow = '0 0 50px rgba(255, 255, 255, 0.3)';
            waveEffect.style.transition = 'all 0.5s ease';
            waveEffect.style.zIndex = '1';
            waveEffect.style.pointerEvents = 'none';
            
            explorationScene.appendChild(waveEffect);
            
            // Animation de pulsation
            let scale = 1;
            let growing = true;
            
            const pulseInterval = safeSetInterval(() => {
                if (growing) {
                    scale += 0.01;
                    if (scale >= 1.2) growing = false;
                } else {
                    scale -= 0.01;
                    if (scale <= 1) growing = true;
                }
                
                waveEffect.style.transform = `translate(-50%, -50%) scale(${scale})`;
                waveEffect.style.opacity = 0.1 + Math.sin(scale * Math.PI) * 0.05;
            }, 100);
            
            return {
                element: waveEffect,
                interval: pulseInterval
            };
        }
        
        // Attendre que la page soit bien initialisée
        safeSetTimeout(function() {
            // Afficher la scène d'exploration
            if (explorationScene) {
                explorationScene.style.opacity = '1';
                
                // Ajouter l'effet de fond
                const backgroundEffect = createBackgroundEffect();
                
                // Démarrer l'animation des particules
                particlesInterval = startParticlesAnimation();
                
                // Commencer la séquence d'exploration
                safeSetTimeout(() => progressExploration(), 2000);
                
                function progressExploration() {
                    if (currentTextIndex < totalTexts) {
                        // Mettre à jour le texte
                        explorationInstruction.textContent = explorationTexts[currentTextIndex];
                        
                        // Mettre à jour la barre de progression
                        if (explorationProgress) {
                            const progressPercent = ((currentTextIndex + 1) / totalTexts) * 100;
                            explorationProgress.style.width = progressPercent + '%';
                        }
                        
                        // AMÉLIORATION: Utiliser la segmentation pour une meilleure fluidité
                        const textSegments = segmentTextForBetterSpeech(explorationTexts[currentTextIndex]);
                        
                        // Créer un effet spécial pour cette phase
                        createParticleBurst(10 + currentTextIndex * 2, 150);
                        
                        // Utiliser la nouvelle méthode de segments pour parler
                        speakTextSegments(textSegments, 0, () => {
                            currentTextIndex++;
                            // Pause plus longue entre les textes pour l'immersion
                            safeSetTimeout(progressExploration, 4000);
                        });
                    } else {
                        // Fin de l'exploration, message de transition
                        safeSetTimeout(function() {
                            const transitionMessages = [
                                "Prenez encore quelques instants pour profiter pleinement de cet espace intérieur...",
                                "Ressentez cette paix, ce calme qui est maintenant ancré en vous...",
                                "Lorsque vous serez prêt, nous reviendrons doucement à un état de conscience ordinaire, en conservant cette sérénité."
                            ];
                            
                            // Premier message de transition
                            explorationInstruction.textContent = transitionMessages[0];
                            
                            let transitionIndex = 0;
                            
                            function playTransition() {
                                // Utiliser la segmentation pour la transition
                                const segments = segmentTextForBetterSpeech(transitionMessages[transitionIndex]);
                                
                                speakTextSegments(segments, 0, () => {
                                    if (transitionIndex < transitionMessages.length - 1) {
                                        transitionIndex++;
                                        safeSetTimeout(() => {
                                            explorationInstruction.textContent = transitionMessages[transitionIndex];
                                            playTransition();
                                        }, 3000);
                                    } else {
                                        // Dernier message, préparer la transition vers la page suivante
                                        safeSetTimeout(() => safeShowPage(6), 8000);
                                    }
                                });
                            }
                            
                            // Démarrer la séquence de transition
                            playTransition();
                            
                        }, 3000);
                        
                        // Nettoyer les animations
                        if (particlesInterval) {
                            clearInterval(particlesInterval);
                        }
                        
                        if (backgroundEffect && backgroundEffect.interval) {
                            clearInterval(backgroundEffect.interval);
                        }
                    }
                }
            }
        }, 1500);
        
        // Fonction pour créer une explosion de particules
        function createParticleBurst(count, delay) {
            for (let i = 0; i < count; i++) {
                safeSetTimeout(() => {
                    createParticle();
                }, i * delay);
            }
        }
        
    } catch (error) {
        console.error("Erreur dans startExploration:", error);
    }
}

// Démarrer le réveil avec une progression plus naturelle - VERSION AMÉLIORÉE
function startAwakening() {
    try {
        // Vérifier que les éléments existent
        if (!awakeningCounter || !energyScene) {
            console.error("Éléments de réveil manquants");
            return;
        }
        
        // S'assurer que le système anti-veille reste actif
        enableKeepAwake();
        
        // Réinitialiser tous les états et éléments
        speech.stop();
        speechQueue = [];
        
        const mainInstruction = document.querySelector('#page6 .instruction');
        if (!mainInstruction) {
            console.error("Élément d'instruction de réveil manquant");
            return;
        }
        
        let count = 5;
        awakeningCounter.textContent = count;
        
        // Faire apparaître progressivement la scène d'énergie
        energyScene.style.transition = 'opacity 3s ease';
        energyScene.style.opacity = '1';
        
        // Variables pour contrôler le flux et les délais
        let phase = 0;
        let phaseComplete = false;
        
        // Fonction pour avancer à la phase suivante
        function nextPhase() {
            phase++;
            phaseComplete = false;
            executeCurrentPhase();
        }
        
        // Cette fonction permet de structurer les phases avec des rappels sur la fin
        function executeCurrentPhase() {
            switch(phase) {
                case 0: // Phase initiale - Introduction
                    safeSetTimeout(() => {
                        const text = "Préparez-vous à revenir doucement à votre état de conscience habituel.";
                        mainInstruction.textContent = text;
                        
                        // Utiliser la segmentation pour une meilleure fluidité
                        const segments = segmentTextForBetterSpeech(text);
                        
                        // Utiliser la nouvelle méthode pour une meilleure prononciation
                        speakTextSegments(segments, 0, () => {
                            if (!phaseComplete) {
                                phaseComplete = true;
                                safeSetTimeout(nextPhase, 1000); // Pause entre les phrases
                            }
                        });
                    }, 2000);
                    break;
                    
                case 1: // Seconde instruction
                    const text = "À chaque compte, vous vous sentirez de plus en plus éveillé et alerte.";
                    mainInstruction.textContent = text;
                    
                    // Utiliser la segmentation pour une meilleure fluidité
                    const segments = segmentTextForBetterSpeech(text);
                    
                    // Utiliser la nouvelle méthode pour une meilleure prononciation
                    speakTextSegments(segments, 0, () => {
                        if (!phaseComplete) {
                            phaseComplete = true;
                            safeSetTimeout(nextPhase, 1000);
                        }
                    });
                    break;
                    
                case 2: // Début du décompte
                    startAwakeningCountdown();
                    break;
            }
        }
        
        // Fonction pour gérer le décompte du réveil - VERSION AMÉLIORÉE
        function startAwakeningCountdown() {
            if (count < 0) {
                // Fin du décompte
                const finalText = "Vous êtes maintenant complètement réveillé, présent et alerte, tout en conservant cette sensation de bien-être et de calme.";
                mainInstruction.textContent = finalText;
                
                // Utiliser la segmentation pour le texte final
                const segments = segmentTextForBetterSpeech(finalText);
                speakTextSegments(segments, 0, () => {
                    // Passer à la page finale après un délai
                    safeSetTimeout(() => safeShowPage(7), 5000);
                });
                return;
            }
            
            // Afficher le compteur
            awakeningCounter.textContent = count;
            
            // Obtenir et afficher le texte pour ce compte
            const countText = getCountText(count);
            mainInstruction.textContent = countText;
            
            // Utiliser la méthode speak directement pour les nombres, pour une meilleure prononciation
            if (count > 0) {
                // Assurer une synchronisation parfaite pour le chiffre et son texte associé
                speech.speak(countText);
                
                // Calculer la durée estimée pour déterminer quand passer au chiffre suivant
                const estimatedDuration = calculateEstimatedDuration(countText);
                
                // Programmer le prochain chiffre après la durée calculée
                safeSetTimeout(() => {
                    count--;
                    safeSetTimeout(startAwakeningCountdown, 1000);
                }, estimatedDuration + 500); // Ajouter une pause supplémentaire pour rendre le rythme plus naturel
            } else {
                count--;
                safeSetTimeout(startAwakeningCountdown, 1000);
            }
        }
        
        // Démarrer la séquence
        executeCurrentPhase();
        
    } catch (error) {
        console.error("Erreur dans startAwakening:", error);
    }
}

// Fonction pour afficher une page - AMÉLIORÉE
function showPage(pageNumber) {
    try {
        console.log(`Changement vers la page ${pageNumber}`);
        
        // Annuler TOUS les timers en cours pour éviter les chevauchements
        clearAllTimeouts();
        clearAllIntervals();
        
        // Interrompre proprement TOUTE synthèse vocale en vidant complètement les files d'attente
        speech.stop();
        
        // MODIFICATION: Ne pas arrêter les sons binauraux lors des changements de page
        // Seulement à la fin du programme (page 7)
        if (typeof stopBinauralBeats === 'function' && pageNumber === 7) {
            stopBinauralBeats();
            binauralActive = false;
        }
        
        // Stopper toutes les animations et séquences
        speech.utteranceQueue = [];
        speechQueue = [];
        isSpeaking = false;
        waitingForNextSpeech = false;
        speakingInProgress = false;
        
        // Arrêter les intervalles de la cohérence cardiaque si actifs
        if (coherenceInterval) {
            clearInterval(coherenceInterval);
            coherenceInterval = null;
        }
        
        if (coherenceTimer) {
            clearInterval(coherenceTimer);
            coherenceTimer = null;
        }
        
        // Masquer toutes les pages
        pages.forEach(function(page) {
            page.classList.remove('active');
        });
        
        // Afficher la page demandée
        const pageElement = document.getElementById('page' + pageNumber);
        if (pageElement) {
            pageElement.classList.add('active');
        } else {
            console.error('Page non trouvée:', 'page' + pageNumber);
            return;
        }
        
        // Mettre à jour la navigation
        updateSteps(pageNumber);
        
        // Mettre à jour l'état actuel
        currentPage = pageNumber;
        
        // Défiler vers le haut
        window.scrollTo(0, 0);
        
        // Exécuter les actions spécifiques à la page après un délai
        // pour s'assurer que toutes les voix précédentes sont bien arrêtées
        safeSetTimeout(function() {
            switch (pageNumber) {
                case 1:
                    // Page d'accueil
                    const welcomeElement = document.querySelector('#page1 .intro-text p:first-child');
                    const homeText = "Bienvenue dans votre séance d'auto-hypnose guidée.";
                    if (welcomeElement) {
                        welcomeElement.textContent = homeText;
                    }
                    queueSpeech(homeText);
                    break;
                    
                case 2:
                    // Page de préparation
                    resetCoherenceCardiaque();
                    break;
                    
                case 3:
                    // Induction
                    startInduction();
                    // Activer le système anti-veille au début de la séance
                    enableKeepAwake();
                    break;
                
                case 4:
                    // Profondeur
                    startDeepening();
                    // S'assurer que le système anti-veille reste actif
                    enableKeepAwake();
                    break;
                    
                case 5:
                    // Exploration
                    startExploration();
                    // S'assurer que le système anti-veille reste actif
                    enableKeepAwake();
                    break;
                    
                case 6:
                    // Retour
                    startAwakening();
                    // S'assurer que le système anti-veille reste actif
                    enableKeepAwake();
                    break;
                    
                case 7:
                    // Page finale
                    // Appliquer les ajustements de style mobile
                    adjustMobileStyles();
                    // Désactiver le système anti-veille à la fin de la séance
                    disableKeepAwake();
                    break;
            }
        }, 800); // Délai optimisé pour la réactivité
    } catch (error) {
        console.error('Erreur lors du changement de page:', error);
    }
}

// Mettre à jour les étapes de navigation
function updateSteps(currentStep) {
    try {
        // Limiter à 6 étapes max (inclut la nouvelle étape d'approfondissement)
        if (currentStep > 6) currentStep = 6;
        
        // Réinitialiser toutes les étapes
        steps.forEach(function(step) {
            step.classList.remove('active');
        });
        
        // Activer l'étape actuelle
        const stepElement = document.getElementById('step' + currentStep);
        if (stepElement) {
            stepElement.classList.add('active');
        }
        
        // Mettre à jour la barre de progression
        if (progressFill) {
            const progressPercent = ((currentStep - 1) / 5) * 100;  // 5 étapes au total (de 1 à 6)
            progressFill.style.width = progressPercent + '%';
        }
    } catch (error) {
        console.error('Erreur dans updateSteps:', error);
    }
}

// Styles CSS requis pour l'animation des particules
function addCSSAnimations() {
    // Créer les styles nécessaires pour les animations et particules
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0.3; }
            50% { opacity: 0.8; }
            100% { opacity: 0.3; }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.5); opacity: 0.9; }
            100% { transform: scale(1); opacity: 0.7; }
        }
        
        .exploration-particle {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.8);
            width: 5px;
            height: 5px;
            transition: all 2.5s cubic-bezier(0.2, 0.8, 0.3, 1);
            z-index: 5;
            pointer-events: none;
        }
    `;
    
    document.head.appendChild(styleElement);
    console.log("Animations CSS ajoutées");
}

// Ajouter une fonction pour nettoyer l'application avant de quitter la page
window.addEventListener('beforeunload', function() {
    // Arrêter tous les sons binauraux
    if (typeof stopBinauralBeats === 'function') {
        stopBinauralBeats();
    }
    
    // Arrêter la synthèse vocale
    if (speech && typeof speech.stop === 'function') {
        speech.stop();
    }
    
    // Désactiver le système anti-veille
    if (typeof disableKeepAwake === 'function') {
        disableKeepAwake();
    }
    
    // Nettoyer tous les timeouts et intervalles
    clearAllTimeouts();
    clearAllIntervals();
});

// Initialiser les animations CSS au chargement
document.addEventListener('DOMContentLoaded', function() {
    addCSSAnimations();
    initializeApp();
});
