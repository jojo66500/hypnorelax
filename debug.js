/**
 * Hypnorelax - Script de diagnostic
 * Ce script aide à identifier les problèmes qui empêchent l'application de démarrer
 */

// Exécution immédiate pour intercepter les erreurs le plus tôt possible
(function() {
    console.log("=== DIAGNOSTIC HYPNORELAX ===");
    console.log("Démarrage du diagnostic...");
    
    // 1. Vérifier si la console est accessible
    console.log("✓ Console accessible");
    
    // 2. Enregistrer les erreurs
    const errors = [];
    const originalConsoleError = console.error;
    console.error = function() {
        errors.push(Array.from(arguments).join(' '));
        originalConsoleError.apply(console, arguments);
    };
    
    // 3. Vérifier l'état des scripts
    const scripts = document.querySelectorAll('script');
    console.log(`Scripts chargés: ${scripts.length}`);
    scripts.forEach((script, index) => {
        console.log(`${index + 1}. ${script.src || 'Script inline'}`);
    });
    
    // 4. Vérifier les fonctions critiques
    function checkFunctions() {
        console.log("\nVérification des fonctions critiques:");
        
        const functions = [
            'createAppStructure', 
            'initializeApp', 
            'showPage', 
            'startCoherenceCardiaque'
        ];
        
        functions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                console.log(`✓ ${funcName} est disponible`);
            } else {
                console.log(`✕ ${funcName} est MANQUANTE`);
            }
        });
    }
    
    // 5. Vérifier les ressources CSS
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    console.log(`\nFeuilles de style chargées: ${styles.length}`);
    styles.forEach((style, index) => {
        console.log(`${index + 1}. ${style.href}`);
    });
    
    // 6. Tentative de correction
    function attemptFix() {
        console.log("\n=== TENTATIVE DE CORRECTION ===");
        
        // Charger les scripts essentiels s'ils sont manquants
        const essentialScripts = ['script.js', 'mobile-optimization.js'];
        essentialScripts.forEach(scriptName => {
            if (!document.querySelector(`script[src*="${scriptName}"]`)) {
                console.log(`Chargement d'urgence de ${scriptName}...`);
                
                const script = document.createElement('script');
                script.src = scriptName;
                script.async = false;
                
                script.onload = () => console.log(`✓ ${scriptName} chargé avec succès`);
                script.onerror = () => console.log(`✕ Échec du chargement de ${scriptName}`);
                
                document.body.appendChild(script);
            }
        });
        
        // Vérifier les styles essentiels
        const essentialStyles = ['styles.css', 'mobile-optimization.css'];
        essentialStyles.forEach(styleName => {
            if (!document.querySelector(`link[href*="${styleName}"]`)) {
                console.log(`Chargement d'urgence de ${styleName}...`);
                
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = styleName;
                
                link.onload = () => console.log(`✓ ${styleName} chargé avec succès`);
                link.onerror = () => console.log(`✕ Échec du chargement de ${styleName}`);
                
                document.head.appendChild(link);
            }
        });
        
        // Créer un fallback minimal pour les fonctions critiques
        if (typeof window.createAppStructure !== 'function') {
            console.log("Création d'un fallback pour createAppStructure");
            window.createAppStructure = function() {
                console.log("Exécution du fallback createAppStructure");
                
                const appHTML = `
                <div class="container">
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
                            
                            <div class="btn-container">
                                <button id="startBtn" class="btn">Commencer</button>
                                <button id="reloadBtn" class="btn btn-blue">Rafraîchir la page</button>
                            </div>
                        </div>
                    </div>
                </div>`;
                
                // Créer un conteneur pour l'application
                const appContainer = document.createElement('div');
                appContainer.id = 'hypnorelax-app';
                appContainer.innerHTML = appHTML;
                
                // Ajouter au document
                document.body.appendChild(appContainer);
                
                // Ajouter l'événement au bouton de rechargement
                setTimeout(() => {
                    const reloadBtn = document.getElementById('reloadBtn');
                    if (reloadBtn) {
                        reloadBtn.addEventListener('click', () => {
                            window.location.reload();
                        });
                    }
                }, 100);
                
                return true;
            };
        }
        
        if (typeof window.showPage !== 'function') {
            console.log("Création d'un fallback pour showPage");
            window.showPage = function(pageNumber) {
                console.log(`Exécution du fallback showPage(${pageNumber})`);
                
                const pages = document.querySelectorAll('.page');
                pages.forEach(page => {
                    page.classList.remove('active');
                });
                
                const targetPage = document.getElementById(`page${pageNumber}`);
                if (targetPage) {
                    targetPage.classList.add('active');
                }
                
                return true;
            };
        }
        
        if (typeof window.initializeApp !== 'function') {
            console.log("Création d'un fallback pour initializeApp");
            window.initializeApp = function() {
                console.log("Exécution du fallback initializeApp");
                
                // Configuration minimale des événements
                setTimeout(() => {
                    const startBtn = document.getElementById('startBtn');
                    if (startBtn) {
                        startBtn.addEventListener('click', () => {
                            if (typeof window.showPage === 'function') {
                                window.showPage(2);
                            }
                        });
                    }
                }, 100);
                
                return true;
            };
        }
    }
    
    // 7. Vérifier le chargement de l'application
    function checkAppLoading() {
        console.log("\nVérification de l'état de chargement de l'application:");
        
        const loadingScreen = document.getElementById('app-loading-screen');
        if (loadingScreen) {
            console.log(`Écran de chargement: ${loadingScreen.classList.contains('active') ? 'ACTIF' : 'inactif'}`);
        } else {
            console.log("✕ Écran de chargement introuvable");
        }
        
        const appContainer = document.getElementById('hypnorelax-app');
        console.log(`Container de l'application: ${appContainer ? 'présent' : 'ABSENT'}`);
        
        // Afficher un rapport des erreurs
        if (errors.length > 0) {
            console.log("\nErreurs détectées:");
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        } else {
            console.log("\nAucune erreur détectée dans la console");
        }
    }
    
    // Exécuter les vérifications après le chargement complet
    window.addEventListener('load', function() {
        console.log("\nPage entièrement chargée");
        checkFunctions();
        checkAppLoading();
        
        // Tenter de réparer les problèmes détectés
        if (typeof window.createAppStructure !== 'function' || 
            typeof window.initializeApp !== 'function' || 
            typeof window.showPage !== 'function') {
            
            console.log("Problèmes détectés, tentative de correction...");
            attemptFix();
            
            // Revérifier après la réparation
            setTimeout(() => {
                console.log("\n=== APRÈS CORRECTION ===");
                checkFunctions();
                
                // Démarrer l'application si possible
                console.log("Tentative de démarrage forcé de l'application...");
                try {
                    // Masquer la page marketing si elle est encore visible
                    document.querySelectorAll('header, .hero, .features, .testimonials, .cta, footer').forEach(el => {
                        if (el) el.style.display = 'none';
                    });
                    
                    // Nettoyer le body
                    document.body.style.padding = '0';
                    document.body.style.margin = '0';
                    
                    // Créer l'application
                    if (typeof window.createAppStructure === 'function') {
                        window.createAppStructure();
                    }
                    
                    // Initialiser et afficher
                    setTimeout(() => {
                        if (typeof window.initializeApp === 'function') {
                            window.initializeApp();
                        }
                        
                        if (typeof window.showPage === 'function') {
                            window.showPage(1);
                        }
                        
                        // Masquer l'écran de chargement s'il est encore visible
                        const loadingScreen = document.getElementById('app-loading-screen');
                        if (loadingScreen && loadingScreen.classList.contains('active')) {
                            loadingScreen.classList.remove('active');
                        }
                    }, 300);
                } catch (error) {
                    console.error("Échec du démarrage forcé:", error);
                }
            }, 1000);
        }
        
        // Ajouter un bouton de diagnostic visible
        const diagnosticBtn = document.createElement('button');
        diagnosticBtn.textContent = '🔧 Diagnostiquer';
        diagnosticBtn.style.position = 'fixed';
        diagnosticBtn.style.bottom = '10px';
        diagnosticBtn.style.left = '10px';
        diagnosticBtn.style.zIndex = '9999';
        diagnosticBtn.style.padding = '8px 12px';
        diagnosticBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        diagnosticBtn.style.color = 'white';
        diagnosticBtn.style.border = 'none';
        diagnosticBtn.style.borderRadius = '4px';
        diagnosticBtn.style.cursor = 'pointer';
        
        diagnosticBtn.addEventListener('click', function() {
            // Refaire les vérifications
            console.clear();
            console.log("=== DIAGNOSTIC MANUEL ===");
            checkFunctions();
            checkAppLoading();
            
            // Demander à l'utilisateur s'il veut tenter une réparation
            if (confirm("Voulez-vous tenter de réparer l'application?")) {
                attemptFix();
                
                setTimeout(() => {
                    alert("Tentative de réparation terminée. Vérifiez la console pour plus de détails.");
                }, 1000);
            }
        });
        
        document.body.appendChild(diagnosticBtn);
    });
})();
