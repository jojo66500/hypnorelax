/**
 * Hypnorelax - Script de transition
 * Ce script gère la transition entre la page marketing et l'application
 * 
 * @version 1.1.0
 * @author Joffrey ROS
 */

// Configuration
const APP_CONFIG = {
    resourcesLoaded: false,
    appInitialized: false,
    transitionDuration: 500,
    minLoadingTime: 1000,
    preloadResources: [
        'css/styles.css',
        'css/mobile-optimization.css',
        'js/script.js',
        'js/mobile-optimization.js'
    ],
    resourcesRequiredToInitialize: [
        'js/script.js'
    ]
};

// Variables globales pour l'application
let appContainer = null;
let loadingProgressInterval = null;
let loadStartTime = null;

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation de Hypnorelax Bridge...");
    
    // Configurer les boutons de lancement
    setupLaunchButtons();
    
    // Précharger les ressources en arrière-plan
    preloadResources(false, 0.2); // précharger 20% des ressources en arrière-plan
    
    // Configurer le service worker pour la PWA
    setupServiceWorker();
    
    // Exporter les fonctions publiques
    window.launchApplication = launchApplication;
    window.getAppStatus = getAppStatus;
});

/**
 * Configure les boutons qui lancent l'application
 */
function setupLaunchButtons() {
    const startButtons = document.querySelectorAll('.start-app-button');
    console.log(`${startButtons.length} boutons de démarrage trouvés`);
    
    startButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Bouton de démarrage cliqué, lancement de l'application...");
            
            // Tracking du clic
            trackEvent('start_app_button_clicked');
            
            // Afficher l'écran de chargement
            showLoadingScreen();
            
            // Si les ressources sont déjà chargées, démarrer immédiatement
            if (APP_CONFIG.resourcesLoaded) {
                launchApplication();
            } else {
                // Sinon attendre que les ressources soient chargées
                preloadResources(true).then(() => {
                    launchApplication();
                }).catch(error => {
                    console.error("Erreur lors du chargement des ressources:", error);
                    showErrorMessage("Une erreur s'est produite lors du chargement de l'application. Veuillez rafraîchir la page.");
                });
            }
        });
    });
}

/**
 * Précharge les ressources de l'application
 * @param {boolean} priority - Si true, exécute le préchargement en priorité
 * @param {number} progressLimit - Limite de progression pour le préchargement en arrière-plan (0-1)
 * @returns {Promise} - Promise résolue quand les ressources sont chargées
 */
function preloadResources(priority = false, progressLimit = 1) {
    return new Promise((resolve, reject) => {
        if (APP_CONFIG.resourcesLoaded) {
            resolve();
            return;
        }
        
        console.log(`Préchargement des ressources de l'application (priorité: ${priority ? 'haute' : 'basse'})...`);
        
        const startTime = Date.now();
        loadStartTime = startTime;
        let resourcesLoaded = 0;
        const totalResources = APP_CONFIG.preloadResources.length;
        
        // Mise à jour automatique de la barre de progression
        if (priority && !loadingProgressInterval) {
            startProgressAnimation();
        }
        
        // Fonction pour mettre à jour l'indicateur de chargement
        function updateLoadingStatus() {
            const percentage = Math.round((resourcesLoaded / totalResources) * 100) * (progressLimit || 1);
            console.log(`Préchargement: ${percentage}%`);
            
            if (priority) {
                const loadingProgress = document.getElementById('app-loading-progress');
                if (loadingProgress) {
                    loadingProgress.style.width = `${percentage}%`;
                }
            }
        }
        
        // Promesses pour chaque ressource
        const loadPromises = APP_CONFIG.preloadResources.map(resource => {
            return new Promise((resolveResource, rejectResource) => {
                const isStylesheet = resource.endsWith('.css');
                const isScript = resource.endsWith('.js');
                
                if (isStylesheet) {
                    const existingLink = document.querySelector(`link[href="${resource}"]`);
                    if (existingLink) {
                        resourcesLoaded++;
                        updateLoadingStatus();
                        resolveResource();
                        return;
                    }
                    
                    const link = document.createElement('link');
                    link.rel = priority ? 'stylesheet' : 'preload';
                    link.as = 'style';
                    link.href = resource;
                    
                    link.onload = () => {
                        resourcesLoaded++;
                        updateLoadingStatus();
                        
                        // Si c'était un préchargement, convertir en stylesheet
                        if (link.rel === 'preload') {
                            const styleLink = document.createElement('link');
                            styleLink.rel = 'stylesheet';
                            styleLink.href = resource;
                            document.head.appendChild(styleLink);
                        }
                        
                        resolveResource();
                    };
                    
                    link.onerror = (err) => {
                        console.warn(`Échec du préchargement de ${resource}:`, err);
                        resourcesLoaded++;
                        updateLoadingStatus();
                        // Ne pas rejeter pour continuer malgré l'erreur
                        resolveResource();
                    };
                    
                    document.head.appendChild(link);
                } 
                else if (isScript) {
                    const existingScript = document.querySelector(`script[src="${resource}"]`);
                    if (existingScript) {
                        resourcesLoaded++;
                        updateLoadingStatus();
                        resolveResource();
                        return;
                    }
                    
                    if (priority) {
                        // Chargement direct du script
                        const script = document.createElement('script');
                        script.src = resource;
                        script.async = false;
                        
                        script.onload = () => {
                            resourcesLoaded++;
                            updateLoadingStatus();
                            resolveResource();
                        };
                        
                        script.onerror = (err) => {
                            console.warn(`Échec du chargement de ${resource}:`, err);
                            
                            // Si le script est requis pour l'initialisation, c'est critique
                            if (APP_CONFIG.resourcesRequiredToInitialize.includes(resource)) {
                                rejectResource(new Error(`Script critique non chargé: ${resource}`));
                            } else {
                                resourcesLoaded++;
                                updateLoadingStatus();
                                resolveResource();
                            }
                        };
                        
                        document.body.appendChild(script);
                    } else {
                        // Préchargement
                        const preloadLink = document.createElement('link');
                        preloadLink.rel = 'preload';
                        preloadLink.as = 'script';
                        preloadLink.href = resource;
                        
                        preloadLink.onload = () => {
                            resourcesLoaded++;
                            updateLoadingStatus();
                            resolveResource();
                        };
                        
                        preloadLink.onerror = (err) => {
                            console.warn(`Échec du préchargement de ${resource}:`, err);
                            resourcesLoaded++;
                            updateLoadingStatus();
                            resolveResource();
                        };
                        
                        document.head.appendChild(preloadLink);
                    }
                } else {
                    // Autres types de ressources (images, etc.)
                    const img = new Image();
                    img.src = resource;
                    
                    img.onload = () => {
                        resourcesLoaded++;
                        updateLoadingStatus();
                        resolveResource();
                    };
                    
                    img.onerror = (err) => {
                        console.warn(`Échec du préchargement de ${resource}:`, err);
                        resourcesLoaded++;
                        updateLoadingStatus();
                        resolveResource();
                    };
                }
            });
        });
        
        // Attendre que toutes les ressources soient chargées
        Promise.all(loadPromises)
            .then(() => {
                const loadTime = Date.now() - startTime;
                console.log(`Toutes les ressources préchargées en ${loadTime}ms`);
                
                if (priority) {
                    // Garantir un temps de chargement minimum
                    const remainingTime = Math.max(0, APP_CONFIG.minLoadingTime - loadTime);
                    
                    setTimeout(() => {
                        APP_CONFIG.resourcesLoaded = true;
                        stopProgressAnimation();
                        
                        // Si c'était un préchargement en arrière-plan, charger les scripts maintenant
                        if (!priority) {
                            APP_CONFIG.preloadResources
                                .filter(resource => resource.endsWith('.js'))
                                .forEach(resource => {
                                    if (!document.querySelector(`script[src="${resource}"]`)) {
                                        console.log(`Script préchargé, chargement différé: ${resource}`);
                                        const script = document.createElement('script');
                                        script.src = resource;
                                        script.async = false;
                                        document.body.appendChild(script);
                                    }
                                });
                        }
                        
                        resolve();
                    }, remainingTime);
                } else {
                    // En préchargement arrière-plan, on ne marque pas comme chargé complètement
                    console.log('Préchargement partiel terminé');
                    resolve();
                }
            })
            .catch(error => {
                console.error("Erreur lors du préchargement des ressources:", error);
                stopProgressAnimation();
                reject(error);
            });
    });
}

/**
 * Démarre l'animation de la barre de progression
 */
function startProgressAnimation() {
    const loadingProgress = document.getElementById('app-loading-progress');
    if (!loadingProgress) return;
    
    // Définir des étapes pour une animation plus réaliste
    const steps = [
        { progress: 15, time: 300 },  // Charge rapidement à 15%
        { progress: 30, time: 500 },  // Puis à 30%
        { progress: 50, time: 800 },  // Plus lentement à 50%
        { progress: 70, time: 1200 }, // Encore plus lentement à 70%
        { progress: 85, time: 2000 }  // Reste un moment à 85%
    ];
    
    let currentStep = 0;
    
    // Gérer l'animation manuelle pour une expérience plus réaliste
    loadingProgressInterval = setInterval(() => {
        if (currentStep < steps.length) {
            loadingProgress.style.width = `${steps[currentStep].progress}%`;
            currentStep++;
        } else {
            // Après les étapes principales, avancer très lentement
            const currentWidth = parseFloat(loadingProgress.style.width);
            if (currentWidth < 95) { // Ne jamais atteindre 100% automatiquement
                loadingProgress.style.width = `${currentWidth + 0.5}%`;
            } else {
                stopProgressAnimation();
            }
        }
    }, 300);
}

/**
 * Arrête l'animation de la barre de progression
 */
function stopProgressAnimation() {
    if (loadingProgressInterval) {
        clearInterval(loadingProgressInterval);
        loadingProgressInterval = null;
        
        // Mettre la barre à 100%
        const loadingProgress = document.getElementById('app-loading-progress');
        if (loadingProgress) {
            loadingProgress.style.width = '100%';
        }
    }
}

/**
 * Configure le service worker pour la PWA
 */
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Utiliser un chemin relatif explicite et définir le scope au répertoire courant
            navigator.serviceWorker.register('./service-worker.js', { scope: './' })
                .then(registration => {
                    console.log('Service Worker enregistré avec succès', registration.scope);
                    
                    // Vérifier si une mise à jour est disponible
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Une mise à jour est disponible, afficher une notification
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch(error => {
                    // Gérer spécifiquement les erreurs de sécurité
                    if (error.name === 'SecurityError') {
                        console.warn('Service Worker non enregistré - problème de sécurité d\'origine. Ce problème est normal en développement local.');
                    } else {
                        console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
                    }
                    // L'application continuera de fonctionner sans PWA
                });
                
            // Gérer les messages du service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'UPDATE_READY') {
                    showUpdateNotification();
                }
            });
        });
    }
}

/**
 * Affiche une notification de mise à jour disponible
 */
function showUpdateNotification() {
    // Créer une notification discrète
    const updateNotif = document.createElement('div');
    updateNotif.style.position = 'fixed';
    updateNotif.style.bottom = '20px';
    updateNotif.style.left = '20px';
    updateNotif.style.backgroundColor = '#0A2463';
    updateNotif.style.color = 'white';
    updateNotif.style.padding = '10px 20px';
    updateNotif.style.borderRadius = '5px';
    updateNotif.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
    updateNotif.style.zIndex = '9999';
    updateNotif.style.display = 'flex';
    updateNotif.style.alignItems = 'center';
    updateNotif.style.gap = '10px';
    
    updateNotif.innerHTML = `
        <div>Mise à jour disponible!</div>
        <button style="background: #FF7F50; border: none; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Rafraîchir</button>
    `;
    
    // Ajouter l'action de rafraîchissement
    const refreshButton = updateNotif.querySelector('button');
    refreshButton.addEventListener('click', () => {
        window.location.reload();
    });
    
    document.body.appendChild(updateNotif);
}

/**
 * Affiche l'écran de chargement
 */
function showLoadingScreen() {
    const loadingScreen = document.getElementById('app-loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('active');
        
        // Réinitialiser la barre de progression
        const loadingProgress = document.getElementById('app-loading-progress');
        if (loadingProgress) {
            loadingProgress.style.width = '0%';
        }
        
        // Démarrer l'animation
        startProgressAnimation();
    }
}

/**
 * Cache l'écran de chargement
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('app-loading-screen');
    if (loadingScreen) {
        // Assurer que la barre de progression est à 100%
        const loadingProgress = document.getElementById('app-loading-progress');
        if (loadingProgress) {
            loadingProgress.style.width = '100%';
        }
        
        // Masquer avec un délai
        setTimeout(() => {
            loadingScreen.classList.remove('active');
            
            // Supprimer après la transition
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 500);
        }, 200);
    }
}

/**
 * Fonction principale pour lancer l'application
 */
function launchApplication() {
    console.log("Lancement de l'application...");
    trackEvent('app_launch_started');
    
    // Mesurer le temps de chargement
    const loadTime = loadStartTime ? (Date.now() - loadStartTime) : 0;
    trackEvent('app_load_time', loadTime);
    
    // 1. Vérifier que les scripts nécessaires sont chargés
    const scriptsLoaded = checkRequiredScriptsLoaded();
    
    if (!scriptsLoaded) {
        console.log("Chargement des scripts manquants...");
        
        // Charger les scripts nécessaires
        loadRequiredScripts()
            .then(() => {
                // Continuer le processus
                transitionToApp();
            })
            .catch(error => {
                console.error("Erreur lors du chargement des scripts:", error);
                showErrorMessage("Une erreur s'est produite lors du chargement des scripts. Veuillez rafraîchir la page.");
            });
    } else {
        // Scripts déjà chargés, continuer
        transitionToApp();
    }
    
    return true;
}

/**
 * Vérifie si tous les scripts requis sont chargés
 */
function checkRequiredScriptsLoaded() {
    const requiredScripts = APP_CONFIG.resourcesRequiredToInitialize;
    for (const script of requiredScripts) {
        if (!document.querySelector(`script[src="${script}"]`)) {
            return false;
        }
    }
    return true;
}

/**
 * Charge tous les scripts requis
 */
function loadRequiredScripts() {
    const requiredScripts = APP_CONFIG.resourcesRequiredToInitialize.filter(
        script => !document.querySelector(`script[src="${script}"]`)
    );
    
    return new Promise((resolve, reject) => {
        if (requiredScripts.length === 0) {
            resolve();
            return;
        }
        
        let loadedCount = 0;
        const totalScripts = requiredScripts.length;
        
        requiredScripts.forEach(script => {
            const scriptElem = document.createElement('script');
            scriptElem.src = script;
            scriptElem.async = false;
            
            scriptElem.onload = () => {
                loadedCount++;
                if (loadedCount === totalScripts) {
                    resolve();
                }
            };
            
            scriptElem.onerror = (err) => {
                reject(new Error(`Échec du chargement de ${script}: ${err}`));
            };
            
            document.body.appendChild(scriptElem);
        });
    });
}

/**
 * Effectue la transition vers l'application
 */
function transitionToApp() {
    // 1. Masquer la page marketing
    hideMarketingPage();
    
    // 2. Créer la structure de l'application
    setTimeout(() => {
        try {
            if (typeof window.createAppStructure === 'function') {
                window.createAppStructure();
                console.log("Structure de l'application créée");
                trackEvent('app_structure_created');
            } else {
                createMinimalAppStructure();
                console.error("Fonction createAppStructure manquante");
                trackEvent('app_structure_fallback');
            }
            
            // 3. Initialiser l'application
            setTimeout(() => {
                try {
                    if (typeof window.initializeApp === 'function') {
                        window.initializeApp();
                        console.log("Application initialisée");
                        trackEvent('app_initialized');
                        
                        // 4. Afficher la première page
                        if (typeof window.showPage === 'function') {
                            window.showPage(1);
                            console.log("Première page affichée");
                            trackEvent('app_first_page_shown');
                        } else {
                            console.error("Fonction showPage manquante");
                            trackEvent('app_missing_showpage');
                        }
                    } else {
                        console.error("Fonction initializeApp manquante");
                        trackEvent('app_missing_initialize');
                    }
                    
                    // 5. Masquer l'écran de chargement
                    APP_CONFIG.appInitialized = true;
                    hideLoadingScreen();
                } catch (error) {
                    console.error("Erreur lors de l'initialisation de l'application:", error);
                    trackEvent('app_init_error', error.message);
                    showErrorMessage("Une erreur s'est produite lors de l'initialisation de l'application.");
                }
            }, 300);
        } catch (error) {
            console.error("Erreur lors de la création de la structure de l'application:", error);
            trackEvent('app_structure_error', error.message);
            showErrorMessage("Une erreur s'est produite lors de la création de l'application.");
        }
    }, APP_CONFIG.transitionDuration);
}

/**
 * Cache les éléments de la page marketing
 */
function hideMarketingPage() {
    // Marquer le corps pour la transition
    document.body.classList.add('transitioning-to-app');
    
    // Ajouter un style pour la transition si nécessaire
    if (!document.getElementById('transition-styles')) {
        const style = document.createElement('style');
        style.id = 'transition-styles';
        style.textContent = `
            .transitioning-to-app * {
                transition: opacity ${APP_CONFIG.transitionDuration/1000}s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Liste des sélecteurs d'éléments à masquer
    const elements = [
        'header', '.site-header', '.hero', '.features', '.benefits', '.how-it-works',
        '.testimonials', '.faq', '.cta', 'footer', '.site-footer', '.floating-btn',
        '.mobile-nav', '.overlay'
    ];
    
    // Masquer les éléments avec une transition
    elements.forEach(selector => {
        const items = document.querySelectorAll(selector);
        items.forEach(item => {
            item.style.opacity = '0';
        });
    });
    
    // Supprimer les éléments après la transition
    setTimeout(() => {
        elements.forEach(selector => {
            const items = document.querySelectorAll(selector);
            items.forEach(item => {
                if (item && item.parentNode) {
                    item.parentNode.removeChild(item);
                }
            });
        });
        
        // Nettoyer les styles du body
        document.body.style.padding = '0';
        document.body.style.margin = '0';
        document.body.style.background = '#f5f5f5';
        document.body.classList.remove('transitioning-to-app');
        
        trackEvent('marketing_page_hidden');
    }, APP_CONFIG.transitionDuration);
}

/**
 * Crée une structure d'application minimale en cas d'erreur
 */
function createMinimalAppStructure() {
    console.log("Création d'une structure d'application minimale");
    
    appContainer = document.createElement('div');
    appContainer.id = 'hypnorelax-app';
    appContainer.className = 'container';
    appContainer.style.padding = '20px';
    appContainer.style.margin = '0 auto';
    appContainer.style.maxWidth = '800px';
    appContainer.style.opacity = '0';
    appContainer.style.transition = 'opacity 0.5s ease';
    
    appContainer.innerHTML = `
        <div class="page" id="page1" style="padding-top: 80px; text-align: center;">
            <header style="margin-bottom: 40px;">
                <div class="app-branding">
                    <span class="app-name" style="font-size: 24px; font-weight: bold; color: #0A2463;">Hypnorelax</span>
                </div>
                <h1 style="font-size: 28px; color: #0A2463; margin-top: 20px;">Auto-Hypnose Guidée</h1>
            </header>
            
            <div class="intro-content">
                <div style="width: 120px; height: 120px; background: #f0f7ff; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(#FFC8A2, #FF7F50, #0A2463, #A8D0E6, #FFC8A2); animation: rotate 20s linear infinite;"></div>
                </div>
                <h2 style="font-size: 22px; margin-bottom: 20px; color: #333;">Bienvenue dans votre voyage vers la relaxation profonde</h2>
                <p style="margin-bottom: 30px; color: #666;">Cette application vous guidera à travers une séance d'auto-hypnose pour vous aider à atteindre un état de détente et de bien-être.</p>
                
                <div style="margin: 30px 0;">
                    <button id="restartBtn" style="padding: 15px 30px; background: linear-gradient(135deg, #FF7F50, #E25822); color: white; border: none; border-radius: 50px; font-size: 18px; cursor: pointer; box-shadow: 0 4px 15px rgba(226, 88, 34, 0.3);">Rafraîchir et réessayer</button>
                </div>
                
                <div id="error-container" style="margin: 30px auto; max-width: 80%; background-color: #ffefef; border-left: 4px solid #e25822; padding: 15px; text-align: left; border-radius: 4px;">
                    <h3 style="color: #e25822; margin-bottom: 10px;">Problème détecté</h3>
                    <p>Une erreur est survenue lors du chargement de l'application. Essayez de rafraîchir la page ou réessayez plus tard.</p>
                    <details style="margin-top: 15px;">
                        <summary style="cursor: pointer; color: #0A2463;">Détails techniques</summary>
                        <div id="error-details" style="margin-top: 10px; font-family: monospace; font-size: 14px; background: #f8f8f8; padding: 10px; border-radius: 4px; white-space: pre-wrap;">
                            Erreur: Structure de l'application non chargée
                        </div>
                    </details>
                </div>
            </div>
            
            <footer style="margin-top: 60px; color: #888; font-size: 14px;">
                <p>&copy; 2025 Hypnorelax - Joffrey ROS</p>
            </footer>
        </div>
    `;
    
    document.body.appendChild(appContainer);
    
    // Afficher avec transition
    setTimeout(() => {
        appContainer.style.opacity = '1';
    }, 100);
    
    // Ajouter l'événement au bouton
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }
    
    // Ajouter l'animation de rotation
    const styleAnim = document.createElement('style');
    styleAnim.textContent = `
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styleAnim);
    
    hideLoadingScreen();
}

/**
 * Affiche un message d'erreur à l'utilisateur
 * @param {string} message - Message d'erreur à afficher
 * @param {Error} [error] - Objet d'erreur optionnel pour les détails
 */
function showErrorMessage(message, error) {
    trackEvent('app_error', { message, error: error ? error.toString() : undefined });
    
    // S'assurer que le conteneur d'application existe
    if (!appContainer) {
        createMinimalAppStructure();
    }
    
    // Mettre à jour le message d'erreur si le conteneur existe déjà
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        const errorMessage = errorContainer.querySelector('p');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        
        const errorDetails = document.getElementById('error-details');
        if (errorDetails && error) {
            errorDetails.textContent = `${error.name}: ${error.message}\n${error.stack || ''}`;
        }
    } else {
        // Créer un nouveau message d'erreur
        const errorBox = document.createElement('div');
        errorBox.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
        errorBox.style.color = 'white';
        errorBox.style.padding = '15px 20px';
        errorBox.style.borderRadius = '8px';
        errorBox.style.marginTop = '20px';
        errorBox.style.textAlign = 'center';
        errorBox.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        errorBox.style.maxWidth = '90%';
        errorBox.style.margin = '20px auto';
        
        errorBox.innerHTML = `
            <p style="margin-bottom: 10px;"><strong>Erreur</strong></p>
            <p>${message}</p>
            ${error ? `<details style="margin-top: 10px; text-align: left;">
                <summary style="cursor: pointer;">Détails techniques</summary>
                <pre style="margin-top: 10px; font-size: 12px; white-space: pre-wrap;">${error.name}: ${error.message}\n${error.stack || ''}</pre>
            </details>` : ''}
        `;
        
        // Ajouter au conteneur de l'application
        if (appContainer && appContainer.querySelector('.intro-content')) {
            appContainer.querySelector('.intro-content').appendChild(errorBox);
        } else {
            document.body.appendChild(errorBox);
        }
    }
    
    // Masquer l'écran de chargement
    hideLoadingScreen();
}

/**
 * Récupère l'état actuel de l'application
 * @returns {Object} État de l'application
 */
function getAppStatus() {
    return {
        resourcesLoaded: APP_CONFIG.resourcesLoaded,
        appInitialized: APP_CONFIG.appInitialized,
        loadTime: loadStartTime ? (Date.now() - loadStartTime) : 0,
        scriptsLoaded: checkRequiredScriptsLoaded()
    };
}

/**
 * Suit un événement (intégration avec analytics)
 * @param {string} eventName - Nom de l'événement
 * @param {*} [data] - Données associées à l'événement
 */
function trackEvent(eventName, data) {
    // Intégration Google Analytics
    if (typeof gtag === 'function') {
        gtag('event', eventName, {
            'event_category': 'application',
            'event_label': data ? JSON.stringify(data) : undefined,
            'value': typeof data === 'number' ? data : undefined
        });
    }
    
    // Log pour débogage
    if (data) {
        console.log(`[Event] ${eventName}:`, data);
    } else {
        console.log(`[Event] ${eventName}`);
    }
}
