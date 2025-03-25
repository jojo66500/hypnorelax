/**
 * Hypnorelax - Script de transition
 * Ce script gère la transition entre la page marketing et l'application
 */

// Configuration
const APP_CONFIG = {
    resourcesLoaded: false,
    appInitialized: false,
    transitionDuration: 500,
    minLoadingTime: 1000,
    preloadResources: [
        'styles.css',
        'mobile-optimization.css',
        'script.js',
        'mobile-optimization.js'
    ]
};

// Variables globales pour l'application
let appContainer = null;

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation de Hypnorelax Bridge...");
    
    // Configurer les boutons de lancement
    setupLaunchButtons();
    
    // Précharger les ressources en arrière-plan
    preloadResources();
    
    // Configurer le service worker pour la PWA
    setupServiceWorker();
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
 * @returns {Promise} - Promise résolue quand les ressources sont chargées
 */
function preloadResources(priority = false) {
    return new Promise((resolve, reject) => {
        if (APP_CONFIG.resourcesLoaded) {
            resolve();
            return;
        }
        
        console.log("Préchargement des ressources de l'application...");
        
        const startTime = Date.now();
        let resourcesLoaded = 0;
        const totalResources = APP_CONFIG.preloadResources.length;
        
        // Fonction pour mettre à jour l'indicateur de chargement
        function updateLoadingStatus() {
            const percentage = Math.round((resourcesLoaded / totalResources) * 100);
            console.log(`Préchargement: ${percentage}%`);
            
            const loadingProgress = document.getElementById('app-loading-progress');
            if (loadingProgress) {
                loadingProgress.style.width = `${percentage}%`;
            }
        }
        
        // Promesses pour chaque ressource
        const loadPromises = APP_CONFIG.preloadResources.map(resource => {
            return new Promise((resolveResource, rejectResource) => {
                const isStylesheet = resource.endsWith('.css');
                const isScript = resource.endsWith('.js');
                
                if (isStylesheet) {
                    const link = document.createElement('link');
                    link.rel = priority ? 'stylesheet' : 'preload';
                    link.as = 'style';
                    link.href = resource;
                    
                    link.onload = () => {
                        resourcesLoaded++;
                        updateLoadingStatus();
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
                    
                    // Si c'est un préchargement en priorité, la transforme en stylesheet
                    if (!priority && link.rel === 'preload') {
                        setTimeout(() => {
                            link.rel = 'stylesheet';
                        }, 100);
                    }
                } 
                else if (isScript) {
                    if (priority) {
                        // Chargement direct du script
                        const script = document.createElement('script');
                        script.src = resource;
                        
                        script.onload = () => {
                            resourcesLoaded++;
                            updateLoadingStatus();
                            resolveResource();
                        };
                        
                        script.onerror = (err) => {
                            console.warn(`Échec du chargement de ${resource}:`, err);
                            resourcesLoaded++;
                            updateLoadingStatus();
                            // Ne pas rejeter pour continuer malgré l'erreur
                            resolveResource();
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
                }
            });
        });
        
        // Attendre que toutes les ressources soient chargées
        Promise.all(loadPromises)
            .then(() => {
                const loadTime = Date.now() - startTime;
                console.log(`Toutes les ressources préchargées en ${loadTime}ms`);
                
                // Garantir un temps de chargement minimum
                const remainingTime = Math.max(0, APP_CONFIG.minLoadingTime - loadTime);
                
                setTimeout(() => {
                    APP_CONFIG.resourcesLoaded = true;
                    
                    // Si c'était un préchargement en arrière-plan, charger les scripts maintenant
                    if (!priority) {
                        APP_CONFIG.preloadResources.forEach(resource => {
                            if (resource.endsWith('.js') && !document.querySelector(`script[src="${resource}"]`)) {
                                // Le script est préchargé mais pas exécuté
                                console.log(`Script préchargé, chargement différé: ${resource}`);
                            }
                        });
                    }
                    
                    resolve();
                }, remainingTime);
            })
            .catch(error => {
                console.error("Erreur lors du préchargement des ressources:", error);
                reject(error);
            });
    });
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
        });
    }
}

/**
 * Affiche l'écran de chargement
 */
function showLoadingScreen() {
    const loadingScreen = document.getElementById('app-loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('active');
    }
}

/**
 * Cache l'écran de chargement
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('app-loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('active');
        
        // Supprimer après la transition
        setTimeout(() => {
            if (loadingScreen.parentNode) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
        }, 500);
    }
}

/**
 * Fonction principale pour lancer l'application
 */
function launchApplication() {
    console.log("Lancement de l'application...");
    
    // 1. Vérifier que les scripts nécessaires sont chargés
    const scriptsLoaded = typeof window.createAppStructure === 'function' && 
                         typeof window.initializeApp === 'function';
    
    if (!scriptsLoaded) {
        console.log("Chargement des scripts manquants...");
        
        // Charger les scripts nécessaires
        loadScripts(APP_CONFIG.preloadResources.filter(res => res.endsWith('.js')))
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
}

/**
 * Charge dynamiquement des scripts dans l'ordre
 * @param {Array} scripts - Liste des scripts à charger
 * @returns {Promise} - Promise résolue quand tous les scripts sont chargés
 */
function loadScripts(scripts) {
    return scripts.reduce((promise, script) => {
        return promise.then(() => {
            return new Promise((resolve, reject) => {
                // Vérifier si le script est déjà chargé
                if (document.querySelector(`script[src="${script}"]`)) {
                    resolve();
                    return;
                }
                
                const scriptElem = document.createElement('script');
                scriptElem.src = script;
                scriptElem.async = false; // Garantir l'ordre de chargement
                
                scriptElem.onload = () => resolve();
                scriptElem.onerror = (err) => reject(new Error(`Échec du chargement de ${script}: ${err}`));
                
                document.body.appendChild(scriptElem);
            });
        });
    }, Promise.resolve());
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
            } else {
                createMinimalAppStructure();
                console.error("Fonction createAppStructure manquante");
            }
            
            // 3. Initialiser l'application
            setTimeout(() => {
                try {
                    if (typeof window.initializeApp === 'function') {
                        window.initializeApp();
                        console.log("Application initialisée");
                        
                        // 4. Afficher la première page
                        if (typeof window.showPage === 'function') {
                            window.showPage(1);
                            console.log("Première page affichée");
                        } else {
                            console.error("Fonction showPage manquante");
                        }
                    } else {
                        console.error("Fonction initializeApp manquante");
                    }
                    
                    // 5. Masquer l'écran de chargement
                    hideLoadingScreen();
                } catch (error) {
                    console.error("Erreur lors de l'initialisation de l'application:", error);
                    showErrorMessage("Une erreur s'est produite lors de l'initialisation de l'application.");
                }
            }, 300);
        } catch (error) {
            console.error("Erreur lors de la création de la structure de l'application:", error);
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
        'header', '.hero', '.features', '.testimonials', 
        '.cta', 'footer', '.floating-btn'
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
    }, APP_CONFIG.transitionDuration);
}

/**
 * Crée une structure d'application minimale en cas d'erreur
 */
function createMinimalAppStructure() {
    console.log("Création d'une structure d'application minimale");
    
    appContainer = document.createElement('div');
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
 */
function showErrorMessage(message) {
    // S'assurer que le conteneur d'application existe
    if (!appContainer) {
        createMinimalAppStructure();
    }
    
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
    `;
    
    // Ajouter au conteneur de l'application
    if (appContainer && appContainer.querySelector('.intro-content')) {
        appContainer.querySelector('.intro-content').appendChild(errorBox);
    } else {
        document.body.appendChild(errorBox);
    }
    
    // Masquer l'écran de chargement
    hideLoadingScreen();
}
