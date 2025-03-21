/**
 * Hypnorelax - Debug.js
 * Outils de débogage pour l'application Hypnorelax
 * 
 * Ce script aide à identifier et résoudre les erreurs courantes
 * dans la page marketing et lors de la transition vers l'application.
 */

// Activer le mode débogage strict
'use strict';

// Configuration principale
const HypnoDebug = {
    // Configuration générale
    config: {
        enabled: true,              // Activer/désactiver le débogage
        verboseLogging: true,       // Journalisation détaillée
        showVisualIndicators: true, // Afficher des indicateurs visuels pour les erreurs
        logPrefix: '🧠 [Hypnorelax]', // Préfixe pour les messages de journal
        errorBoxDuration: 5000      // Durée d'affichage des boîtes d'erreurs (ms)
    },
    
    // État interne
    state: {
        started: false,
        errors: [],
        warnings: [],
        fixes: [],
        originalFunctions: {},
        domObserver: null
    },
    
    // Initialisation du système de débogage
    init: function() {
        if (this.state.started || !this.config.enabled) return;
        
        console.log(`${this.config.logPrefix} Initialisation du système de débogage...`);
        
        // Installer le gestionnaire d'erreurs global
        this.setupErrorHandler();
        
        // Surveiller les changements du DOM
        this.setupDomObserver();
        
        // Appliquer les correctifs
        this.applyPatches();
        
        // Améliorer la console
        this.enhanceConsole();
        
        // Journaliser les informations sur l'environnement
        this.logEnvironmentInfo();
        
        // Vérifier les ressources après chargement complet
        window.addEventListener('load', () => {
            this.checkResources();
            this.validateAppStructure();
        });
        
        // Installer un bouton de débogage flottant
        if (this.config.showVisualIndicators) {
            this.createDebugButton();
        }
        
        this.state.started = true;
        console.log(`${this.config.logPrefix} Système de débogage initialisé`);
    },
    
    // Gestionnaire d'erreurs global
    setupErrorHandler: function() {
        window.onerror = (message, source, line, column, error) => {
            // Enregistrer l'erreur
            this.state.errors.push({
                message, source, line, column, error,
                time: new Date().toISOString()
            });
            
            // Journaliser l'erreur avec plus de détails
            console.error(`${this.config.logPrefix} Erreur JavaScript: ${message}\nSource: ${source}\nPosition: ${line}:${column}\nStacktrace: ${error?.stack || 'Non disponible'}`);
            
            // Afficher une boîte d'erreur si activé
            if (this.config.showVisualIndicators) {
                this.showErrorBox(message, source, line);
            }
            
            // Permettre à la console de navigateur d'afficher également l'erreur
            return false;
        };
        
        // Intercepter les rejets de promesses non gérés
        window.addEventListener('unhandledrejection', (event) => {
            this.state.errors.push({
                message: event.reason?.message || 'Rejet de promesse non géré',
                source: 'Promise',
                reason: event.reason,
                time: new Date().toISOString()
            });
            
            console.error(`${this.config.logPrefix} Promesse rejetée non gérée:`, event.reason);
            
            if (this.config.showVisualIndicators) {
                this.showErrorBox(`Promesse rejetée: ${event.reason?.message || 'Erreur inconnue'}`, 'Promise', 0);
            }
        });
    },
    
    // Afficher une boîte d'erreur à l'écran
    showErrorBox: function(message, source, line) {
        const errorBox = document.createElement('div');
        errorBox.className = 'hypno-debug-error';
        errorBox.style.position = 'fixed';
        errorBox.style.top = '0';
        errorBox.style.left = '0';
        errorBox.style.right = '0';
        errorBox.style.backgroundColor = 'rgba(255, 0, 0, 0.85)';
        errorBox.style.color = 'white';
        errorBox.style.padding = '12px 15px';
        errorBox.style.fontSize = '14px';
        errorBox.style.fontFamily = 'Arial, sans-serif';
        errorBox.style.zIndex = '9999';
        errorBox.style.borderBottom = '1px solid #ff0000';
        errorBox.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        
        const errorContent = document.createElement('div');
        
        // Formater le message d'erreur
        let formattedMsg = `<strong>Erreur:</strong> ${message}<br>`;
        if (source && source !== 'undefined' && source !== window.location.href) {
            formattedMsg += `<strong>Source:</strong> ${this.shortenUrl(source)}`;
            if (line && line > 0) {
                formattedMsg += `, ligne ${line}`;
            }
        }
        
        errorContent.innerHTML = formattedMsg;
        
        // Bouton de fermeture
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '10px';
        closeBtn.style.top = '10px';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.padding = '0 5px';
        closeBtn.onclick = () => errorBox.remove();
        
        errorBox.appendChild(errorContent);
        errorBox.appendChild(closeBtn);
        document.body.appendChild(errorBox);
        
        // Faire disparaître la boîte après un délai
        setTimeout(() => {
            errorBox.style.opacity = '0';
            errorBox.style.transition = 'opacity 1s ease';
            setTimeout(() => {
                if (errorBox.parentNode) {
                    errorBox.remove();
                }
            }, 1000);
        }, this.config.errorBoxDuration);
    },
    
    // Raccourcir une URL pour l'affichage
    shortenUrl: function(url) {
        if (!url) return 'inconnu';
        try {
            // Essayer de créer un objet URL
            const urlObj = new URL(url);
            // Raccourcir le pathname
            const pathParts = urlObj.pathname.split('/');
            const shortPath = pathParts.length > 0 ? pathParts[pathParts.length - 1] : urlObj.pathname;
            return shortPath || url;
        } catch (e) {
            return url;
        }
    },
    
    // Vérifier les ressources (images, scripts, styles)
    checkResources: function() {
        console.log(`${this.config.logPrefix} Vérification des ressources...`);
        
        // Vérifier les images
        const images = document.querySelectorAll('img');
        let imagesWithIssues = 0;
        
        images.forEach(img => {
            if (!img.complete || img.naturalHeight === 0) {
                console.warn(`${this.config.logPrefix} Image non chargée: ${img.src}`);
                imagesWithIssues++;
                
                if (this.config.showVisualIndicators) {
                    // Marquer l'image problématique
                    img.style.border = '2px dashed red';
                    img.style.padding = '10px';
                    img.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
                    
                    // Ajouter une info-bulle
                    img.title = `⚠️ Image non chargée: ${img.src}`;
                    
                    // Ajouter un texte de remplacement
                    const errorOverlay = document.createElement('div');
                    errorOverlay.textContent = '❌ Image manquante';
                    errorOverlay.style.position = 'absolute';
                    errorOverlay.style.top = '50%';
                    errorOverlay.style.left = '50%';
                    errorOverlay.style.transform = 'translate(-50%, -50%)';
                    errorOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
                    errorOverlay.style.color = 'white';
                    errorOverlay.style.padding = '5px 10px';
                    errorOverlay.style.borderRadius = '3px';
                    errorOverlay.style.fontSize = '12px';
                    
                    // S'assurer que le conteneur est positionné
                    if (img.parentNode) {
                        if (getComputedStyle(img.parentNode).position === 'static') {
                            img.parentNode.style.position = 'relative';
                        }
                        img.parentNode.appendChild(errorOverlay);
                    }
                }
            }
        });
        
        // Vérifier les feuilles de style
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        let cssWithIssues = 0;
        
        stylesheets.forEach(link => {
            if (!link.sheet) {
                console.warn(`${this.config.logPrefix} Feuille de style non chargée: ${link.href}`);
                cssWithIssues++;
                
                this.state.warnings.push({
                    message: `Feuille de style non chargée: ${link.href}`,
                    type: 'resource',
                    element: link,
                    time: new Date().toISOString()
                });
            }
        });
        
        // Vérifier les scripts
        const scripts = document.querySelectorAll('script[src]');
        let scriptIssues = [];
        
        // Malheureusement, il n'est pas facile de détecter les erreurs de chargement 
        // de script après qu'ils aient été chargés, mais on peut vérifier
        // si certaines fonctions attendues existent
        
        // Vérifier la présence des fonctions importantes
        const expectedFunctions = [
            {name: 'initializeApp', context: window},
            {name: 'showPage', context: window},
            {name: 'startCoherenceCardiaque', context: window}
        ];
        
        expectedFunctions.forEach(func => {
            if (typeof func.context[func.name] !== 'function') {
                console.warn(`${this.config.logPrefix} Fonction ${func.name} manquante - Possible erreur de chargement de script`);
                scriptIssues.push(func.name);
                
                this.state.warnings.push({
                    message: `Fonction ${func.name} manquante`,
                    type: 'function',
                    time: new Date().toISOString()
                });
            }
        });
        
        // Résumé des vérifications
        console.log(`${this.config.logPrefix} Vérification des ressources terminée: ${imagesWithIssues} images, ${cssWithIssues} CSS et ${scriptIssues.length} problèmes de script potentiels.`);
    },
    
    // Vérifier la structure de l'application
    validateAppStructure: function() {
        console.log(`${this.config.logPrefix} Validation de la structure de l'application...`);
        
        // Détecter le type de page (marketing ou application)
        const isMarketingPage = document.querySelector('.hero') !== null;
        const isAppPage = document.querySelector('.page') !== null;
        
        if (!isMarketingPage && !isAppPage) {
            console.warn(`${this.config.logPrefix} Structure de page non reconnue!`);
            return;
        }
        
        if (isMarketingPage) {
            this.validateMarketingPage();
        } else {
            this.validateApplicationPage();
        }
    },
    
    // Valider la structure de la page marketing
    validateMarketingPage: function() {
        console.log(`${this.config.logPrefix} Validation de la page marketing...`);
        
        // Éléments critiques à vérifier
        const criticalElements = [
            {selector: '.hero', name: 'Bannière héroïque'},
            {selector: '.features', name: 'Section Fonctionnalités'},
            {selector: '.testimonials', name: 'Section Témoignages'},
            {selector: '.btn-primary', name: 'Bouton principal'},
            {selector: '.site-header', name: 'En-tête du site'},
            {selector: '.site-footer', name: 'Pied de page'}
        ];
        
        let missingElements = [];
        
        criticalElements.forEach(el => {
            const element = document.querySelector(el.selector);
            if (!element) {
                console.warn(`${this.config.logPrefix} Élément critique manquant: ${el.name} (${el.selector})`);
                missingElements.push(el);
                
                this.state.warnings.push({
                    message: `Élément critique manquant: ${el.name}`,
                    selector: el.selector,
                    type: 'structure',
                    time: new Date().toISOString()
                });
            }
        });
        
        // Vérifier les gestionnaires d'événements sur les boutons d'action
        const actionButtons = document.querySelectorAll('a[href="index.html"], .btn-primary');
        let buttonsWithoutHandlers = 0;
        
        actionButtons.forEach(button => {
            if (typeof button.onclick !== 'function' && !this.hasEventListeners(button, 'click')) {
                console.warn(`${this.config.logPrefix} Bouton sans gestionnaire d'événement:`, button);
                buttonsWithoutHandlers++;
                
                if (this.config.showVisualIndicators) {
                    button.style.border = '2px dashed orange';
                    button.title = '⚠️ Ce bouton pourrait ne pas fonctionner correctement';
                }
                
                // Ajouter un correctif pour ce bouton
                this.fixActionButton(button);
            }
        });
        
        console.log(`${this.config.logPrefix} Validation de la page marketing terminée: ${missingElements.length} éléments manquants, ${buttonsWithoutHandlers} boutons sans gestionnaires d'événements.`);
    },
    
    // Valider la structure de la page d'application
    validateApplicationPage: function() {
        console.log(`${this.config.logPrefix} Validation de la page d'application...`);
        
        // Éléments critiques à vérifier
        const criticalElements = [
            {selector: '.page', name: 'Pages de l\'application'},
            {selector: '#startBtn', name: 'Bouton de démarrage'},
            {selector: '.progress-steps', name: 'Étapes de progression'},
            {selector: '#coherenceContainer', name: 'Conteneur de cohérence cardiaque'},
            {selector: '#audioToggle', name: 'Bouton audio'}
        ];
        
        let missingElements = [];
        
        criticalElements.forEach(el => {
            const elements = document.querySelectorAll(el.selector);
            if (!elements || elements.length === 0) {
                console.warn(`${this.config.logPrefix} Élément critique manquant: ${el.name} (${el.selector})`);
                missingElements.push(el);
                
                this.state.warnings.push({
                    message: `Élément critique manquant: ${el.name}`,
                    selector: el.selector,
                    type: 'structure',
                    time: new Date().toISOString()
                });
            }
        });
        
        // Vérifier les gestionnaires d'événements sur les boutons essentiels
        const essentialButtons = [
            '#startBtn', '#startCoherenceBtn', '#restartBtn', '#homeBtn'
        ];
        
        let buttonsWithoutHandlers = 0;
        
        essentialButtons.forEach(selector => {
            const button = document.querySelector(selector);
            if (button && typeof button.onclick !== 'function' && !this.hasEventListeners(button, 'click')) {
                console.warn(`${this.config.logPrefix} Bouton essentiel sans gestionnaire d'événement: ${selector}`);
                buttonsWithoutHandlers++;
                
                if (this.config.showVisualIndicators) {
                    button.style.border = '2px dashed orange';
                    button.title = '⚠️ Ce bouton pourrait ne pas fonctionner correctement';
                }
                
                // Ajouter un correctif pour ce bouton
                this.fixEssentialButton(button, selector);
            }
        });
        
        console.log(`${this.config.logPrefix} Validation de la page d'application terminée: ${missingElements.length} éléments manquants, ${buttonsWithoutHandlers} boutons sans gestionnaires.`);
    },
    
    // Tenter de déterminer si un élément a des écouteurs d'événements
    hasEventListeners: function(element, eventType) {
        // Cette fonction est imparfaite car JavaScript n'expose pas facilement les écouteurs
        // Nous utilisons une heuristique: vérifier si l'élément a des attributs on* ou des gestionnaires
        
        // Vérifier les attributs on*
        if (element.hasAttribute(`on${eventType}`)) {
            return true;
        }
        
        // Vérifier les gestionnaires jQuery s'ils existent
        if (window.jQuery && jQuery._data && jQuery._data(element, 'events')) {
            return !!jQuery._data(element, 'events')[eventType];
        }
        
        // Malheureusement, nous ne pouvons pas détecter de manière fiable les écouteurs
        // ajoutés via addEventListener sans patcher le prototype
        return false;
    },
    
    // Corriger un bouton d'action sur la page marketing
    fixActionButton: function(button) {
        try {
            console.log(`${this.config.logPrefix} Application d'un correctif pour un bouton d'action:`, button);
            
            // Sauvegarder le gestionnaire d'événement original s'il existe
            const originalOnClick = button.onclick;
            
            // Ajouter un nouveau gestionnaire d'événement
            button.addEventListener('click', function(e) {
                // Empêcher le comportement par défaut
                e.preventDefault();
                
                console.log(`${HypnoDebug.config.logPrefix} Bouton d'action cliqué, tentative de démarrage de l'application...`);
                
                // Vérifier si la fonction setupMarketingButtons existe
                if (typeof setupMarketingButtons === 'function') {
                    setupMarketingButtons();
                } else {
                    // Implémentation de secours
                    console.log(`${HypnoDebug.config.logPrefix} Fonction setupMarketingButtons non trouvée, utilisation de l'implémentation de secours`);
                    
                    // Cacher la page marketing
                    document.querySelectorAll('.site-header, .hero, .features, .benefits, .how-it-works, .testimonials, .pricing, .faq, .cta, .site-footer').forEach(el => {
                        el.style.display = 'none';
                    });
                    
                    // Si createAppStructure existe, l'utiliser
                    if (typeof createAppStructure === 'function') {
                        createAppStructure();
                    } else {
                        // Message d'erreur visuel
                        const errorMsg = document.createElement('div');
                        errorMsg.style.padding = '50px';
                        errorMsg.style.textAlign = 'center';
                        errorMsg.style.color = '#333';
                        errorMsg.innerHTML = `
                            <h2>Erreur de chargement de l'application</h2>
                            <p>Impossible de trouver les fonctions nécessaires pour démarrer l'application.</p>
                            <p>Veuillez rafraîchir la page et réessayer.</p>
                            <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background-color: #0A2463; color: white; border: none; border-radius: 5px; cursor: pointer;">Rafraîchir la page</button>
                        `;
                        document.body.appendChild(errorMsg);
                    }
                    
                    // Essayer d'initialiser l'application si la fonction existe
                    if (typeof initializeApp === 'function') {
                        setTimeout(() => {
                            initializeApp();
                            
                            // Afficher la première page si possible
                            if (typeof showPage === 'function') {
                                showPage(1);
                            }
                        }, 100);
                    }
                }
                
                // Exécuter le gestionnaire original s'il existe
                if (typeof originalOnClick === 'function') {
                    originalOnClick.call(this, e);
                }
            });
            
            this.state.fixes.push({
                type: 'actionButton',
                element: button,
                time: new Date().toISOString()
            });
            
            // Indiquer que le bouton a été corrigé
            if (this.config.showVisualIndicators) {
                button.style.border = '2px solid green';
                button.title = '✅ Ce bouton a été corrigé par le système de débogage';
            }
        } catch (error) {
            console.error(`${this.config.logPrefix} Erreur lors de la correction du bouton d'action:`, error);
        }
    },
    
    // Corriger un bouton essentiel dans l'application
    fixEssentialButton: function(button, selector) {
        try {
            console.log(`${this.config.logPrefix} Application d'un correctif pour un bouton essentiel: ${selector}`);
            
            // Comportement spécifique selon le sélecteur
            button.addEventListener('click', function(e) {
                console.log(`${HypnoDebug.config.logPrefix} Bouton ${selector} cliqué`);
                
                switch (selector) {
                    case '#startBtn':
                        if (typeof showPage === 'function') {
                            showPage(2);
                        } else {
                            console.error(`${HypnoDebug.config.logPrefix} Fonction showPage non trouvée`);
                            alert('Erreur: Impossible de passer à la page suivante. La fonction showPage est manquante.');
                        }
                        break;
                    
                    case '#startCoherenceBtn':
                        if (typeof startCoherenceCardiaque === 'function') {
                            startCoherenceCardiaque();
                        } else {
                            console.error(`${HypnoDebug.config.logPrefix} Fonction startCoherenceCardiaque non trouvée`);
                            alert('Erreur: Impossible de démarrer la cohérence cardiaque. La fonction est manquante.');
                        }
                        break;
                    
                    case '#restartBtn':
                        if (typeof showPage === 'function') {
                            showPage(2);
                        } else {
                            console.error(`${HypnoDebug.config.logPrefix} Fonction showPage non trouvée`);
                            alert('Erreur: Impossible de redémarrer. La fonction showPage est manquante.');
                        }
                        break;
                    
                    case '#homeBtn':
                        if (typeof showPage === 'function') {
                            showPage(1);
                        } else {
                            console.error(`${HypnoDebug.config.logPrefix} Fonction showPage non trouvée`);
                            alert('Erreur: Impossible de retourner à l\'accueil. La fonction showPage est manquante.');
                        }
                        break;
                        
                    default:
                        console.warn(`${HypnoDebug.config.logPrefix} Bouton inconnu: ${selector}`);
                }
            });
            
            this.state.fixes.push({
                type: 'essentialButton',
                element: button,
                selector: selector,
                time: new Date().toISOString()
            });
            
            // Indiquer que le bouton a été corrigé
            if (this.config.showVisualIndicators) {
                button.style.border = '2px solid green';
                button.title = '✅ Ce bouton a été corrigé par le système de débogage';
            }
        } catch (error) {
            console.error(`${this.config.logPrefix} Erreur lors de la correction du bouton essentiel:`, error);
        }
    },
    
    // Observer les changements du DOM pour suivre les problèmes dynamiques
    setupDomObserver: function() {
        try {
            // Créer un observateur de mutations
            this.state.domObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    // Si des nœuds ont été ajoutés, vérifier les nouvelles ressources
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Vérifier uniquement périodiquement pour éviter trop de vérifications
                        if (!this._domCheckTimeout) {
                            this._domCheckTimeout = setTimeout(() => {
                                this.checkNewResources();
                                this._domCheckTimeout = null;
                            }, 1000);
                        }
                    }
                }
            });
            
            // Commencer à observer tout le document
            this.state.domObserver.observe(document, {
                childList: true,
                subtree: true
            });
            
            console.log(`${this.config.logPrefix} Observateur DOM configuré`);
        } catch (error) {
            console.error(`${this.config.logPrefix} Erreur lors de la configuration de l'observateur DOM:`, error);
        }
    },
    
    // Vérifier les nouvelles ressources ajoutées dynamiquement
    checkNewResources: function() {
        if (!this.config.verboseLogging) return;
        
        // Vérifier seulement les images nouvellement ajoutées (sans erreur visuelle)
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
            if (!img.hasAttribute('data-debug-checked')) {
                img.setAttribute('data-debug-checked', 'true');
                
                if (!img.complete || img.naturalHeight === 0) {
                    console.warn(`${this.config.logPrefix} Nouvelle image non chargée: ${img.src}`);
                }
            }
        });
    },
    
    // Appliquer des correctifs pour les problèmes courants
    applyPatches: function() {
        // Correctif 1: Assurer que la fonction de configuration des boutons marketing existe
        if (typeof setupMarketingButtons !== 'function') {
            window.setupMarketingButtons = function() {
                console.log(`${HypnoDebug.config.logPrefix} Utilisation de la fonction setupMarketingButtons de secours`);
                
                // Sélectionner tous les boutons qui pourraient démarrer l'application
                const appButtons = document.querySelectorAll('a[href="index.html"], .btn-primary');
                
                appButtons.forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        console.log(`${HypnoDebug.config.logPrefix} Bouton 'Commencer' cliqué, lancement de l'application...`);
                        
                        // Cacher la page marketing
                        document.querySelectorAll('.site-header, .hero, .features, .benefits, .how-it-works, .testimonials, .pricing, .faq, .cta, .site-footer, .mobile-nav, .overlay').forEach(el => {
                            if (el) el.style.display = 'none';
                        });
                        
                        // Créer et afficher l'application si la fonction existe
                        if (typeof createAppStructure === 'function') {
                            createAppStructure();
                        } else {
                            console.error(`${HypnoDebug.config.logPrefix} Fonction createAppStructure non trouvée`);
                        }
                        
                        // Initialiser l'application si la fonction existe
                        setTimeout(() => {
                            if (typeof initializeApp === 'function') {
                                initializeApp();
                            } else {
                                console.error(`${HypnoDebug.config.logPrefix} Fonction initializeApp non trouvée`);
                            }
                            
                            // Afficher la première page si possible
                            if (typeof showPage === 'function') {
                                showPage(1);
                            } else {
                                console.error(`${HypnoDebug.config.logPrefix} Fonction showPage non trouvée`);
                            }
                        }, 100);
                    });
                });
                
                console.log(`${HypnoDebug.config.logPrefix} Boutons marketing configurés avec succès`);
                return true;
            };
            
            console.log(`${this.config.logPrefix} Correctif appliqué: setupMarketingButtons`);
            this.state.fixes.push({
                type: 'function',
                name: 'setupMarketingButtons',
                time: new Date().toISOString()
            });
        }
        
        // Correctif 2: Assurer que la fonction de chargement de feuilles de style existe
        if (typeof loadStylesheet !== 'function') {
            window.loadStylesheet = function(href) {
                return new Promise((resolve, reject) => {
                    // Vérifier si la feuille de style est déjà chargée
                    if (document.querySelector(`link[href="${href}"]`)) {
                        console.log(`${HypnoDebug.config.logPrefix} Feuille de style déjà chargée: ${href}`);
                        resolve();
                        return;
                    }
                    
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = href;
                    
                    link.onload = () => {
                        console.log(`${HypnoDebug.config.logPrefix} Feuille de style chargée: ${href}`);
                        resolve();
                    };
                    
                    link.onerror = () => {
                        console.error(`${HypnoDebug.config.logPrefix} Erreur lors du chargement de la feuille de style: ${href}`);
                        reject(new Error(`Impossible de charger ${href}`));
                    };
                    
                    document.head.appendChild(link);
                });
            };
            
            console.log(`${this.config.logPrefix} Correctif appliqué: loadStylesheet`);
            this.state.fixes.push({
                type: 'function',
                name: 'loadStylesheet',
                time: new Date().toISOString()
            });
        }
        
        // Correctif 3: Assurer que createAppStructure vérifie et charge les styles nécessaires
        if (typeof createAppStructure === 'function') {
            // Sauvegarder la fonction originale
            this.state.originalFunctions.createAppStructure = createAppStructure;
            
            // Remplacer par une version améliorée
            window.createAppStructure = function() {
                console.log(`${HypnoDebug.config.logPrefix} Utilisation de la version améliorée de createAppStructure`);
                
                // Appeler la fonction originale
                HypnoDebug.state.originalFunctions.createAppStructure();
                
                // Vérifier et charger les styles nécessaires
                setTimeout(async () => {
                    try {
                        // Vérifier si les styles sont chargés
                        if (!document.querySelector('link[href="styles.css"]')) {
                            console.log(`${HypnoDebug.config.logPrefix} Chargement de styles.css...`);
                            await loadStylesheet('styles.css');
                        }
                        
                        if (!document.querySelector('link[href="mobile-optimization.css"]')) {
                            console.log(`${HypnoDebug.config.logPrefix} Chargement de mobile-optimization.css...`);
                            await loadStylesheet('mobile-optimization.css');
                        }
                        
                        console.log(`${HypnoDebug.config.logPrefix} Styles chargés avec succès`);
                    } catch (error) {
                        console.error(`${HypnoDebug.config.logPrefix} Erreur lors du chargement des styles:`, error);
                    }
                }, 100);
                
                return true;
            };
            
            console.log(`${this.config.logPrefix} Correctif appliqué: createAppStructure amélioré`);
            this.state.fixes.push({
                type: 'function',
                name: 'createAppStructure',
                time: new Date().toISOString()
            });
        }
        
        // Correctif 4: Navigation sécurisée entre les pages
        if (typeof showPage === 'function') {
            // Sauvegarder la fonction originale
            this.state.originalFunctions.showPage = showPage;
            
            // Remplacer par une version sécurisée
            window.showPage = function(pageNumber) {
                console.log(`${HypnoDebug.config.logPrefix} Navigation vers la page ${pageNumber}`);
                
                // Vérifier que la page existe avant de naviguer
                const targetPage = document.getElementById(`page${pageNumber}`);
                if (!targetPage) {
                    console.error(`${HypnoDebug.config.logPrefix} Page ${pageNumber} non trouvée!`);
                    
                    if (HypnoDebug.config.showVisualIndicators) {
                        HypnoDebug.showErrorBox(`Page ${pageNumber} non trouvée!`, 'Navigation', 0);
                    }
                    
                    // Ne pas continuer si la page n'existe pas
                    return false;
                }
                
                // Appeler la fonction originale
                return HypnoDebug.state.originalFunctions.showPage(pageNumber);
            };
            
            console.log(`${this.config.logPrefix} Correctif appliqué: showPage sécurisé`);
            this.state.fixes.push({
                type: 'function',
                name: 'showPage',
                time: new Date().toISOString()
            });
        }
        
        console.log(`${this.config.logPrefix} Tous les correctifs ont été appliqués`);
    },
    
    // Amélioration de la console
    enhanceConsole: function() {
        // Sauvegarder les fonctions originales
        const originalConsoleLog = console.log;
        const originalConsoleWarn = console.warn;
        const originalConsoleError = console.error;
        
        // Remplacer console.log
        console.log = function() {
            // Vérifier si c'est un message de débogage (pour éviter la récursion)
            const isDebugMessage = arguments[0] && typeof arguments[0] === 'string' && 
                                  arguments[0].includes(HypnoDebug.config.logPrefix);
            
            // Ajouter un timestamp aux messages non-debug seulement si verbose
            if (HypnoDebug.config.verboseLogging && !isDebugMessage) {
                const timestamp = new Date().toISOString().substr(11, 8); // HH:MM:SS
                originalConsoleLog.apply(console, [`[${timestamp}]`, ...arguments]);
            } else {
                originalConsoleLog.apply(console, arguments);
            }
        };
        
        // Remplacer console.warn
        console.warn = function() {
            // Stocker l'avertissement
            const warning = {
                message: Array.from(arguments).join(' '),
                time: new Date().toISOString()
            };
            HypnoDebug.state.warnings.push(warning);
            
            // Appliquer un style aux avertissements
            const timestamp = new Date().toISOString().substr(11, 8);
            originalConsoleWarn.apply(console, [`[${timestamp}]`, ...arguments]);
        };
        
        // Remplacer console.error
        console.error = function() {
            // Stocker l'erreur
            const error = {
                message: Array.from(arguments).join(' '),
                time: new Date().toISOString()
            };
            HypnoDebug.state.errors.push(error);
            
            // Appliquer un style aux erreurs
            const timestamp = new Date().toISOString().substr(11, 8);
            originalConsoleError.apply(console, [`[${timestamp}]`, ...arguments]);
        };
        
        console.log(`${this.config.logPrefix} Console améliorée`);
    },
    
    // Journaliser les informations sur l'environnement
    logEnvironmentInfo: function() {
        console.log(`${this.config.logPrefix} Informations sur l'environnement:`);
        console.log(`${this.config.logPrefix} - Navigateur: ${navigator.userAgent}`);
        console.log(`${this.config.logPrefix} - Taille de fenêtre: ${window.innerWidth}x${window.innerHeight}`);
        console.log(`${this.config.logPrefix} - URL: ${window.location.href}`);
        console.log(`${this.config.logPrefix} - Temps de chargement: ${Math.round(performance.now())}ms`);
        
        // Détection de l'appareil
        const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log(`${this.config.logPrefix} - Type d'appareil: ${isMobile ? 'Mobile' : 'Desktop'}`);
        
        // Détecter si PWA
        const isPWA = window.matchMedia('(display-mode: standalone)').matches;
        console.log(`${this.config.logPrefix} - Mode PWA: ${isPWA ? 'Oui' : 'Non'}`);
    },
    
    // Créer un bouton de débogage flottant
    createDebugButton: function() {
        // Créer le bouton
        const debugButton = document.createElement('button');
        debugButton.id = 'hypno-debug-button';
        debugButton.textContent = '🐞';
        debugButton.title = 'Outils de débogage Hypnorelax';
        
        // Styler le bouton
        debugButton.style.position = 'fixed';
        debugButton.style.bottom = '10px';
        debugButton.style.right = '10px';
        debugButton.style.zIndex = '9999';
        debugButton.style.width = '40px';
        debugButton.style.height = '40px';
        debugButton.style.borderRadius = '50%';
        debugButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        debugButton.style.color = 'white';
        debugButton.style.border = 'none';
        debugButton.style.fontSize = '20px';
        debugButton.style.cursor = 'pointer';
        debugButton.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        
        // Ajouter un événement au clic
        debugButton.addEventListener('click', () => {
            this.toggleDebugPanel();
        });
        
        // Ajouter au document
        document.body.appendChild(debugButton);
    },
    
    // Afficher/masquer le panneau de débogage
    toggleDebugPanel: function() {
        // Vérifier si le panneau existe déjà
        let debugPanel = document.getElementById('hypno-debug-panel');
        
        if (debugPanel) {
            // Masquer le panneau s'il est déjà visible
            debugPanel.remove();
            return;
        }
        
        // Créer le panneau
        debugPanel = document.createElement('div');
        debugPanel.id = 'hypno-debug-panel';
        
        // Styler le panneau
        debugPanel.style.position = 'fixed';
        debugPanel.style.bottom = '60px';
        debugPanel.style.right = '10px';
        debugPanel.style.width = '300px';
        debugPanel.style.maxHeight = '400px';
        debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        debugPanel.style.color = 'white';
        debugPanel.style.borderRadius = '10px';
        debugPanel.style.padding = '15px';
        debugPanel.style.fontFamily = 'Arial, sans-serif';
        debugPanel.style.fontSize = '14px';
        debugPanel.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.3)';
        debugPanel.style.overflowY = 'auto';
        debugPanel.style.zIndex = '9998';
        
        // Ajouter le contenu du panneau
        debugPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px;">
                <h2 style="margin: 0; font-size: 16px;">Débogage Hypnorelax</h2>
                <button id="hypno-debug-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <p><strong>Erreurs:</strong> ${this.state.errors.length}</p>
                <p><strong>Avertissements:</strong> ${this.state.warnings.length}</p>
                <p><strong>Correctifs appliqués:</strong> ${this.state.fixes.length}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h3 style="margin: 5px 0; font-size: 14px;">Actions</h3>
                <button id="hypno-debug-fix-all" style="background-color: #0A2463; color: white; border: none; padding: 5px 10px; margin-right: 5px; border-radius: 3px; cursor: pointer;">Tout corriger</button>
                <button id="hypno-debug-validate" style="background-color: #0A2463; color: white; border: none; padding: 5px 10px; margin-right: 5px; border-radius: 3px; cursor: pointer;">Valider</button>
                <button id="hypno-debug-reset" style="background-color: #A30000; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Réinitialiser</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h3 style="margin: 5px 0; font-size: 14px;">Dernières erreurs</h3>
                <div id="hypno-debug-error-list" style="margin-top: 5px; max-height: 100px; overflow-y: auto; font-size: 12px; background-color: rgba(0,0,0,0.3); padding: 5px; border-radius: 3px;">
                    ${this.state.errors.length > 0 ? 
                        this.state.errors.slice(-5).reverse().map(error => 
                            `<div style="margin-bottom: 5px; color: #FF6B6B;">${error.message}</div>`
                        ).join('') : 
                        '<div style="color: #8F8F8F;">Aucune erreur détectée</div>'}
                </div>
            </div>
            
            <div>
                <h3 style="margin: 5px 0; font-size: 14px;">Info environnement</h3>
                <div style="font-size: 12px;">
                    <p style="margin: 2px 0;">Appareil: ${window.innerWidth < 768 ? 'Mobile' : 'Desktop'} (${window.innerWidth}x${window.innerHeight})</p>
                    <p style="margin: 2px 0;">Chargement: ${Math.round(performance.now())}ms</p>
                    <p style="margin: 2px 0;">Mode PWA: ${window.matchMedia('(display-mode: standalone)').matches ? 'Oui' : 'Non'}</p>
                </div>
            </div>
        `;
        
        // Ajouter au document
        document.body.appendChild(debugPanel);
        
        // Ajouter les gestionnaires d'événements
        document.getElementById('hypno-debug-close').addEventListener('click', () => {
            debugPanel.remove();
        });
        
        document.getElementById('hypno-debug-fix-all').addEventListener('click', () => {
            this.applyAllFixes();
            debugPanel.remove();
        });
        
        document.getElementById('hypno-debug-validate').addEventListener('click', () => {
            this.validateAppStructure();
            this.checkResources();
            debugPanel.remove();
            
            // Afficher un résumé
            setTimeout(() => {
                this.showValidationSummary();
            }, 500);
        });
        
        document.getElementById('hypno-debug-reset').addEventListener('click', () => {
            if (confirm('Voulez-vous vraiment réinitialiser la page? Cela rechargera la page complètement.')) {
                window.location.reload();
            }
        });
    },
    
    // Appliquer tous les correctifs possibles
    applyAllFixes: function() {
        console.log(`${this.config.logPrefix} Application de tous les correctifs possibles...`);
        
        // Correction des boutons d'action
        const actionButtons = document.querySelectorAll('a[href="index.html"], .btn-primary');
        actionButtons.forEach(button => {
            if (!this.hasEventListeners(button, 'click')) {
                this.fixActionButton(button);
            }
        });
        
        // Correction des boutons essentiels
        const essentialButtons = [
            '#startBtn', '#startCoherenceBtn', '#restartBtn', '#homeBtn'
        ];
        
        essentialButtons.forEach(selector => {
            const button = document.querySelector(selector);
            if (button && !this.hasEventListeners(button, 'click')) {
                this.fixEssentialButton(button, selector);
            }
        });
        
        // Vérifier et charger les styles manquants
        if (typeof loadStylesheet === 'function') {
            setTimeout(async () => {
                try {
                    const requiredStyles = ['styles.css', 'mobile-optimization.css'];
                    
                    for (const style of requiredStyles) {
                        if (!document.querySelector(`link[href="${style}"]`)) {
                            console.log(`${this.config.logPrefix} Chargement de ${style}...`);
                            await loadStylesheet(style);
                        }
                    }
                } catch (error) {
                    console.error(`${this.config.logPrefix} Erreur lors du chargement des styles:`, error);
                }
            }, 100);
        }
        
        console.log(`${this.config.logPrefix} Tous les correctifs possibles ont été appliqués`);
        
        // Afficher une notification de succès
        this.showNotification('Corrections appliquées avec succès', 'success');
    },
    
    // Afficher un résumé de validation
    showValidationSummary: function() {
        // Créer l'élément de résumé
        const summary = document.createElement('div');
        summary.className = 'hypno-debug-summary';
        
        // Styler le résumé
        summary.style.position = 'fixed';
        summary.style.top = '10px';
        summary.style.left = '50%';
        summary.style.transform = 'translateX(-50%)';
        summary.style.backgroundColor = 'rgba(10, 36, 99, 0.9)';
        summary.style.color = 'white';
        summary.style.padding = '15px';
        summary.style.borderRadius = '5px';
        summary.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
        summary.style.zIndex = '9999';
        summary.style.maxWidth = '80%';
        summary.style.textAlign = 'center';
        
        // Déterminer l'état global
        const hasErrors = this.state.errors.length > 0;
        const hasWarnings = this.state.warnings.length > 0;
        const hasFixes = this.state.fixes.length > 0;
        
        let status = 'OK';
        if (hasErrors) {
            status = 'Problèmes détectés';
        } else if (hasWarnings) {
            status = 'Avertissements';
        } else if (hasFixes) {
            status = 'Correctifs appliqués';
        }
        
        // Définir le contenu
        summary.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px;">Résultat de validation: ${status}</div>
            <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 10px;">
                <div><span style="color: ${hasErrors ? '#FF6B6B' : '#8AFF8A'};">Erreurs: ${this.state.errors.length}</span></div>
                <div><span style="color: ${hasWarnings ? '#FFD700' : '#8AFF8A'};">Avertissements: ${this.state.warnings.length}</span></div>
                <div><span style="color: #8AFF8A;">Correctifs: ${this.state.fixes.length}</span></div>
            </div>
            <button class="hypno-debug-summary-close" style="background: none; border: 1px solid white; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-top: 5px;">Fermer</button>
        `;
        
        // Ajouter au document
        document.body.appendChild(summary);
        
        // Ajouter le gestionnaire d'événement pour fermer
        summary.querySelector('.hypno-debug-summary-close').addEventListener('click', () => {
            summary.remove();
        });
        
        // Faire disparaître après un délai
        setTimeout(() => {
            summary.style.opacity = '0';
            summary.style.transition = 'opacity 1s ease';
            setTimeout(() => {
                summary.remove();
            }, 1000);
        }, 5000);
    },
    
    // Afficher une notification
    showNotification: function(message, type = 'info') {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = 'hypno-debug-notification';
        
        // Styler selon le type
        let bgColor, textColor;
        
        switch (type) {
            case 'success':
                bgColor = 'rgba(76, 175, 80, 0.9)';
                textColor = 'white';
                break;
            case 'warning':
                bgColor = 'rgba(255, 152, 0, 0.9)';
                textColor = 'white';
                break;
            case 'error':
                bgColor = 'rgba(244, 67, 54, 0.9)';
                textColor = 'white';
                break;
            default: // info
                bgColor = 'rgba(10, 36, 99, 0.9)';
                textColor = 'white';
        }
        
        // Appliquer les styles
        notification.style.position = 'fixed';
        notification.style.bottom = '70px';
        notification.style.right = '10px';
        notification.style.backgroundColor = bgColor;
        notification.style.color = textColor;
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
        notification.style.zIndex = '9997';
        notification.style.maxWidth = '300px';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '14px';
        
        // Définir le contenu
        notification.innerHTML = message;
        
        // Ajouter au document
        document.body.appendChild(notification);
        
        // Faire disparaître après un délai
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
};

// Initialiser le système de débogage
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        HypnoDebug.init();
    }, 0);
});

// Exporter l'objet de débogage pour y accéder depuis la console
window.HypnoDebug = HypnoDebug;
