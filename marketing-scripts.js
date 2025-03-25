/**
 * Hypnorelax - Scripts pour la page marketing
 * Ce script gère toutes les interactions de la page marketing
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation des scripts marketing...');
    
    // Configuration des variables globales
    const CONFIG = {
        scrollOffset: 100,
        animationDelay: 50,
        newsletterDelay: 30000, // 30 secondes
        installPromptDelay: 60000, // 60 secondes
        testimonialAutoplayInterval: 8000, // 8 secondes
    };
    
    // Références des éléments DOM
    const DOM = {
        // Navigation
        header: document.querySelector('.site-header'),
        menuToggle: document.querySelector('.menu-toggle'),
        mobileNav: document.querySelector('.mobile-nav'),
        navLinks: document.querySelectorAll('a[href^="#"]'),
        overlay: document.querySelector('.overlay'),
        closeNav: document.querySelector('.close-mobile-nav'),
        
        // Témoignages
        testimonialContainer: document.querySelector('.testimonials-slider'),
        testimonials: document.querySelectorAll('.testimonial'),
        nextBtn: document.querySelector('.next-btn'),
        prevBtn: document.querySelector('.prev-btn'),
        dots: document.querySelectorAll('.dot'),
        
        // FAQ
        faqItems: document.querySelectorAll('.faq-item'),
        
        // Newsletter
        newsletterModal: document.getElementById('newsletter-modal'),
        closeNotification: document.querySelector('.close-notification'),
        newsletterForm: document.querySelector('.notification-form'),
        
        // PWA Installation
        installButton: document.getElementById('install-button'),
        installPrompt: document.getElementById('install-prompt'),
        installYes: document.getElementById('install-yes'),
        installNo: document.getElementById('install-no'),
        
        // Animation au scroll
        animatedElements: document.querySelectorAll('.feature-card, .step, .benefits-content, .benefits-image, .testimonial, .faq-item'),
        
        // Boutons de démarrage de l'application
        startAppButtons: document.querySelectorAll('.start-app-button')
    };
    
    // État de l'application
    const STATE = {
        currentTestimonial: 0,
        testimonialCount: DOM.dots ? DOM.dots.length : 0,
        testimonialAutoplay: null,
        isInstallable: false,
        deferredPrompt: null,
        previousScrollPosition: window.scrollY,
        hasSeenNewsletter: localStorage.getItem('hypnorelax_newsletter_seen') === 'true'
    };
    
    // ----- FONCTIONS D'INITIALISATION -----
    
    /**
     * Initialise tous les composants de la page
     */
    function init() {
        initNavigation();
        initFAQ();
        initNewsletter();
        initTestimonials();
        initAnimations();
        initPWAInstallation();
        initVideoPlayer();
        initStartAppButtons();
        
        // Observer l'intersection pour les animations au scroll
        setupIntersectionObserver();
        
        // Vérifier si des paramètres URL nécessitent une action
        checkUrlParameters();
        
        console.log('Scripts marketing initialisés avec succès');
    }
    
    /**
     * Initialise la navigation mobile et le comportement du header
     */
    function initNavigation() {
        // Navigation mobile toggle
        if (DOM.menuToggle && DOM.mobileNav && DOM.overlay) {
            DOM.menuToggle.addEventListener('click', openMobileMenu);
            
            if (DOM.closeNav) {
                DOM.closeNav.addEventListener('click', closeMobileMenu);
            }
            
            if (DOM.overlay) {
                DOM.overlay.addEventListener('click', closeMobileMenu);
            }
            
            // Fermer le menu quand on clique sur un lien
            const mobileNavLinks = DOM.mobileNav.querySelectorAll('a');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });
        }
        
        // Navigation smooth scroll
        if (DOM.navLinks) {
            DOM.navLinks.forEach(link => {
                link.addEventListener('click', smoothScrollToAnchor);
            });
        }
        
        // Header comportement au scroll
        window.addEventListener('scroll', handleHeaderScroll);
    }
    
    /**
     * Initialise le comportement de la FAQ
     */
    function initFAQ() {
        if (!DOM.faqItems.length) return;
        
        DOM.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => toggleFAQItem(item));
            }
        });
    }
    
    /**
     * Initialise le slider de témoignages
     */
    function initTestimonials() {
        if (!DOM.testimonialContainer) return;
        
        if (DOM.nextBtn) {
            DOM.nextBtn.addEventListener('click', () => nextTestimonial());
        }
        
        if (DOM.prevBtn) {
            DOM.prevBtn.addEventListener('click', () => prevTestimonial());
        }
        
        if (DOM.dots && DOM.dots.length) {
            DOM.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => goToTestimonial(index));
            });
        }
        
        // Initialiser l'autoplay
        startTestimonialAutoplay();
        
        // Pause sur hover/touch
        if (DOM.testimonialContainer) {
            DOM.testimonialContainer.addEventListener('mouseenter', stopTestimonialAutoplay);
            DOM.testimonialContainer.addEventListener('mouseleave', startTestimonialAutoplay);
            DOM.testimonialContainer.addEventListener('touchstart', stopTestimonialAutoplay);
            DOM.testimonialContainer.addEventListener('touchend', startTestimonialAutoplay);
        }
    }
    
    /**
     * Initialise la modal newsletter
     */
    function initNewsletter() {
        if (!DOM.newsletterModal || !DOM.closeNotification) return;
        
        // Afficher après un délai si l'utilisateur n'a pas déjà vu la newsletter
        if (!STATE.hasSeenNewsletter) {
            setTimeout(() => {
                if (!isDisplayingApp()) {
                    showNewsletterModal();
                }
            }, CONFIG.newsletterDelay);
        }
        
        // Gérer la fermeture
        DOM.closeNotification.addEventListener('click', hideNewsletterModal);
        
        // Gérer la soumission du formulaire
        if (DOM.newsletterForm) {
            DOM.newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        }
    }
    
    /**
     * Initialise les animations au chargement initial
     */
    function initAnimations() {
        // Animation initiale
        setTimeout(() => {
            animateElementsInView();
            
            // Animation hero
            const heroContent = document.querySelector('.hero-content');
            const heroImage = document.querySelector('.hero-image');
            
            if (heroContent) heroContent.classList.add('fadeIn');
            if (heroImage) heroImage.classList.add('fadeIn');
        }, CONFIG.animationDelay);
        
        // Animation au scroll
        window.addEventListener('scroll', debounce(animateElementsInView, 100));
    }
    
    /**
     * Initialise la détection et gestion d'installation PWA
     */
    function initPWAInstallation() {
        // Vérifier si l'application est déjà installée
        if (window.matchMedia('(display-mode: standalone)').matches) {
            // L'application est déjà installée, masquer les boutons d'installation
            if (DOM.installButton) DOM.installButton.style.display = 'none';
            return;
        }
        
        // Écouter l'événement beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            // Empêcher Chrome d'afficher la bannière d'installation automatique
            e.preventDefault();
            
            console.log('Application installable détectée');
            
            // Stocker l'événement pour pouvoir le déclencher plus tard
            STATE.deferredPrompt = e;
            STATE.isInstallable = true;
            
            // Afficher notre bouton d'installation
            if (DOM.installButton) {
                DOM.installButton.style.display = 'inline-block';
            }
            
            // Afficher le prompt après un délai si l'utilisateur est toujours sur la page
            setTimeout(() => {
                if (STATE.deferredPrompt && !isDisplayingApp() && DOM.installPrompt) {
                    DOM.installPrompt.style.display = 'block';
                }
            }, CONFIG.installPromptDelay);
        });
        
        // Écouteurs pour les boutons d'installation
        if (DOM.installButton) {
            DOM.installButton.addEventListener('click', triggerInstallPrompt);
        }
        
        if (DOM.installYes) {
            DOM.installYes.addEventListener('click', () => {
                triggerInstallPrompt();
                hideInstallPrompt();
            });
        }
        
        if (DOM.installNo) {
            DOM.installNo.addEventListener('click', hideInstallPrompt);
        }
        
        // Détection d'installation réussie
        window.addEventListener('appinstalled', (e) => {
            console.log('Application installée avec succès');
            trackEvent('app_installed');
            hideInstallPrompt();
            if (DOM.installButton) {
                DOM.installButton.style.display = 'none';
            }
            STATE.isInstallable = false;
            STATE.deferredPrompt = null;
        });
    }
    
    /**
     * Initialise le lecteur vidéo
     */
    function initVideoPlayer() {
        const playButton = document.querySelector('.play-button');
        const videoContainer = document.querySelector('.video-container');
        const videoPlaceholder = document.querySelector('.video-placeholder');
        
        if (playButton && videoContainer && videoPlaceholder) {
            playButton.addEventListener('click', () => {
                // Suivi de l'événement
                trackEvent('video_play', 'demo_video');
                
                // En production, cela créerait un iframe YouTube ou chargerait une vidéo
                // Pour cette démo, nous allons juste afficher un message
                const videoMessage = document.createElement('div');
                videoMessage.style.position = 'absolute';
                videoMessage.style.top = '0';
                videoMessage.style.left = '0';
                videoMessage.style.width = '100%';
                videoMessage.style.height = '100%';
                videoMessage.style.display = 'flex';
                videoMessage.style.alignItems = 'center';
                videoMessage.style.justifyContent = 'center';
                videoMessage.style.backgroundColor = '#0A2463';
                videoMessage.style.color = 'white';
                videoMessage.style.fontSize = '18px';
                videoMessage.style.padding = '20px';
                videoMessage.style.textAlign = 'center';
                videoMessage.style.borderRadius = '15px';
                
                videoMessage.textContent = 'La démo vidéo sera disponible dans la version finale de l\'application.';
                
                videoContainer.innerHTML = '';
                videoContainer.appendChild(videoMessage);
            });
        }
    }
    
    /**
     * Initialise les boutons de démarrage de l'application
     */
    function initStartAppButtons() {
        if (!DOM.startAppButtons.length) return;
        
        DOM.startAppButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Suivi de l'événement
                trackEvent('app_start', 'marketing_button');
                
                // Afficher l'écran de chargement
                const loadingScreen = document.getElementById('app-loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('active');
                }
                
                // Début du chargement
                let loadProgress = 0;
                const progressBar = document.getElementById('app-loading-progress');
                
                // Animation de la barre de progression
                const progressInterval = setInterval(() => {
                    loadProgress += 5;
                    if (progressBar) progressBar.style.width = `${loadProgress}%`;
                    
                    if (loadProgress >= 100) {
                        clearInterval(progressInterval);
                        
                        // Attendre un petit délai pour montrer le 100%
                        setTimeout(() => {
                            // Vérifier si hypnorelax-bridge.js est chargé
                            if (typeof window.launchApplication === 'function') {
                                window.launchApplication();
                            } else {
                                console.error('Le script de transition n\'est pas chargé. Tentative de chargement...');
                                
                                // Charger le script bridge si nécessaire
                                const bridgeScript = document.createElement('script');
                                bridgeScript.src = 'js/hypnorelax-bridge.js';
                                bridgeScript.onload = function() {
                                    if (typeof window.launchApplication === 'function') {
                                        window.launchApplication();
                                    } else {
                                        console.error('Impossible de lancer l\'application après chargement du script.');
                                        showFallbackStartButton(loadingScreen);
                                    }
                                };
                                bridgeScript.onerror = function() {
                                    console.error('Erreur lors du chargement du script bridge.');
                                    showFallbackStartButton(loadingScreen);
                                };
                                document.body.appendChild(bridgeScript);
                            }
                        }, 500);
                    }
                }, 50);
            });
        });
    }
    
    /**
     * Affiche un bouton de secours en cas d'échec du chargement
     */
    function showFallbackStartButton(loadingScreen) {
        if (loadingScreen) {
            // Créer un bouton de secours
            const fallbackBtn = document.createElement('button');
            fallbackBtn.textContent = 'Réessayer';
            fallbackBtn.className = 'btn btn-primary';
            fallbackBtn.style.marginTop = '20px';
            
            fallbackBtn.addEventListener('click', function() {
                window.location.reload();
            });
            
            // Ajouter au contenu de chargement
            const loadingContent = loadingScreen.querySelector('.loading-content');
            if (loadingContent) {
                loadingContent.appendChild(fallbackBtn);
            }
        }
    }
    
    /**
     * Configure l'observateur d'intersection pour les animations au scroll
     */
    function setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback pour les navigateurs qui ne supportent pas IntersectionObserver
            animateAllElements();
            return;
        }
        
        const options = {
            root: null, // utilise la viewport
            rootMargin: '0px',
            threshold: 0.1 // 10% de l'élément doit être visible
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fadeIn');
                    observer.unobserve(entry.target); // une seule fois par élément
                }
            });
        }, options);
        
        // Observer tous les éléments animés
        DOM.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // ----- GESTIONNAIRES D'ÉVÉNEMENTS -----
    
    /**
     * Gère le comportement du header lors du défilement
     */
    function handleHeaderScroll() {
        if (!DOM.header) return;
        
        const currentScrollPos = window.scrollY;
        
        // Ajout d'une classe quand on défile vers le bas
        if (currentScrollPos > 100) {
            DOM.header.classList.add('scrolled');
        } else {
            DOM.header.classList.remove('scrolled');
        }
        
        // Masquer/afficher le header lors du défilement
        if (currentScrollPos > STATE.previousScrollPosition && currentScrollPos > 200) {
            // Défilement vers le bas -> masquer le header
            DOM.header.classList.add('header-hidden');
        } else {
            // Défilement vers le haut -> afficher le header
            DOM.header.classList.remove('header-hidden');
        }
        
        STATE.previousScrollPosition = currentScrollPos;
    }
    
    /**
     * Gère la soumission du formulaire d'inscription à la newsletter
     */
    function handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const emailInput = e.target.querySelector('input[type="email"]');
        if (!emailInput || !emailInput.value) return;
        
        // Suivi de l'événement
        trackEvent('newsletter_signup', emailInput.value);
        
        // Ici, vous enverriez normalement l'email à votre API
        console.log('Inscription à la newsletter:', emailInput.value);
        
        // Afficher un message de confirmation
        const form = e.target;
        form.innerHTML = '<p style="text-align: center; margin: 20px 0;">Merci de votre inscription ! Vous recevrez bientôt nos actualités.</p>';
        
        // Fermer la modal après un délai
        setTimeout(hideNewsletterModal, 3000);
        
        // Marquer comme vu
        STATE.hasSeenNewsletter = true;
        localStorage.setItem('hypnorelax_newsletter_seen', 'true');
    }
    
    // ----- FONCTIONS DE NAVIGATION -----
    
    /**
     * Ouvre le menu mobile
     */
    function openMobileMenu() {
        if (DOM.mobileNav && DOM.overlay) {
            DOM.mobileNav.classList.add('active');
            DOM.overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Empêcher le défilement
        }
    }
    
    /**
     * Ferme le menu mobile
     */
    function closeMobileMenu() {
        if (DOM.mobileNav && DOM.overlay) {
            DOM.mobileNav.classList.remove('active');
            DOM.overlay.classList.remove('active');
            document.body.style.overflow = ''; // Réactiver le défilement
        }
    }
    
    /**
     * Fait défiler en douceur vers un ancre
     */
    function smoothScrollToAnchor(e) {
        const href = this.getAttribute('href');
        
        if (href === '#') return;
        
        e.preventDefault();
        const targetId = href;
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = DOM.header ? DOM.header.offsetHeight : 0;
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
            
            window.scrollTo({
                top: targetPosition - headerHeight - CONFIG.scrollOffset,
                behavior: 'smooth'
            });
            
            // Suivi de l'événement
            trackEvent('scroll_to', targetId.substring(1));
            
            // Mise à jour de l'URL sans recharger la page
            history.pushState(null, null, href);
        }
    }
    
    // ----- FONCTIONS DE TÉMOIGNAGES -----
    
    /**
     * Passe au témoignage suivant
     */
    function nextTestimonial() {
        STATE.currentTestimonial = (STATE.currentTestimonial + 1) % STATE.testimonialCount;
        updateTestimonialDisplay();
        trackEvent('testimonial_navigation', 'next');
    }
    
    /**
     * Passe au témoignage précédent
     */
    function prevTestimonial() {
        STATE.currentTestimonial = (STATE.currentTestimonial - 1 + STATE.testimonialCount) % STATE.testimonialCount;
        updateTestimonialDisplay();
        trackEvent('testimonial_navigation', 'prev');
    }
    
    /**
     * Va à un témoignage spécifique
     */
    function goToTestimonial(index) {
        if (index >= 0 && index < STATE.testimonialCount) {
            STATE.currentTestimonial = index;
            updateTestimonialDisplay();
            trackEvent('testimonial_navigation', `dot_${index}`);
        }
    }
    
    /**
     * Met à jour l'affichage des témoignages
     */
    function updateTestimonialDisplay() {
        // Mise à jour des points de navigation
        if (DOM.dots && DOM.dots.length) {
            DOM.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === STATE.currentTestimonial);
            });
        }
        
        // Dans une implémentation réelle avec plusieurs témoignages, nous ferions défiler ici
        
        // Réinitialiser l'autoplay
        if (STATE.testimonialAutoplay) {
            stopTestimonialAutoplay();
            startTestimonialAutoplay();
        }
    }
    
    /**
     * Démarre le défilement automatique des témoignages
     */
    function startTestimonialAutoplay() {
        if (STATE.testimonialAutoplay) return;
        
        STATE.testimonialAutoplay = setInterval(() => {
            nextTestimonial();
        }, CONFIG.testimonialAutoplayInterval);
    }
    
    /**
     * Arrête le défilement automatique des témoignages
     */
    function stopTestimonialAutoplay() {
        if (STATE.testimonialAutoplay) {
            clearInterval(STATE.testimonialAutoplay);
            STATE.testimonialAutoplay = null;
        }
    }
    
    // ----- FONCTIONS DE FAQ -----
    
    /**
     * Bascule l'état d'un élément FAQ
     */
    function toggleFAQItem(item) {
        const isActive = item.classList.contains('active');
        const faqQuestion = item.querySelector('.faq-question h3');
        
        // Fermer tous les éléments actifs
        DOM.faqItems.forEach(faqItem => {
            if (faqItem !== item) {
                faqItem.classList.remove('active');
            }
        });
        
        // Basculer l'état de l'élément actuel
        item.classList.toggle('active', !isActive);
        
        // Suivi de l'événement
        if (!isActive && faqQuestion) {
            trackEvent('faq_open', faqQuestion.textContent.trim());
        }
    }
    
    // ----- FONCTIONS DE NEWSLETTER -----
    
    /**
     * Affiche la modal newsletter
     */
    function showNewsletterModal() {
        if (DOM.newsletterModal) {
            DOM.newsletterModal.classList.add('active');
            trackEvent('newsletter_modal_shown');
        }
    }
    
    /**
     * Cache la modal newsletter
     */
    function hideNewsletterModal() {
        if (DOM.newsletterModal) {
            DOM.newsletterModal.classList.remove('active');
            
            // Marquer comme vu
            STATE.hasSeenNewsletter = true;
            localStorage.setItem('hypnorelax_newsletter_seen', 'true');
        }
    }
    
    // ----- FONCTIONS D'INSTALLATION PWA -----
    
    /**
     * Déclenche le prompt d'installation PWA
     */
    function triggerInstallPrompt() {
        if (STATE.deferredPrompt) {
            trackEvent('install_prompt_shown');
            
            STATE.deferredPrompt.prompt();
            
            STATE.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Utilisateur a accepté l\'installation');
                    trackEvent('install_accepted');
                    
                    if (DOM.installButton) {
                        DOM.installButton.style.display = 'none';
                    }
                } else {
                    console.log('Utilisateur a refusé l\'installation');
                    trackEvent('install_rejected');
                }
                
                // Réinitialiser le prompt différé
                STATE.deferredPrompt = null;
            });
        }
    }
    
    /**
     * Cache le prompt d'installation personnalisé
     */
    function hideInstallPrompt() {
        if (DOM.installPrompt) {
            DOM.installPrompt.style.display = 'none';
        }
    }
    
    // ----- FONCTIONS D'ANIMATION -----
    
    /**
     * Anime les éléments qui sont dans la vue
     */
    function animateElementsInView() {
        DOM.animatedElements.forEach(element => {
            if (isElementInViewport(element) && !element.classList.contains('fadeIn')) {
                element.classList.add('fadeIn');
            }
        });
    }
    
    /**
     * Anime tous les éléments (fallback)
     */
    function animateAllElements() {
        DOM.animatedElements.forEach(element => {
            setTimeout(() => {
                element.classList.add('fadeIn');
            }, Math.random() * 1000); // Délai aléatoire pour un effet plus naturel
        });
    }
    
    // ----- FONCTIONS DE TRACKING -----
    
    /**
     * Suit un événement avec Google Analytics (si disponible)
     * @param {string} eventName - Nom de l'événement
     * @param {string|object} value - Valeur ou détails de l'événement
     */
    function trackEvent(eventName, value = '') {
        // Vérifier si Google Analytics est chargé
        if (typeof gtag === 'function') {
            gtag('event', eventName, {
                'event_category': 'marketing',
                'event_label': typeof value === 'string' ? value : JSON.stringify(value)
            });
        }
        
        // Log pour le debug
        console.log(`Event: ${eventName}`, value);
    }
    
    // ----- FONCTIONS UTILITAIRES -----
    
    /**
     * Vérifie si un élément est dans la viewport
     */
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        return (
            rect.top <= windowHeight * 0.8 && // 80% de la hauteur de l'écran
            rect.bottom >= 0
        );
    }
    
    /**
     * Vérifie si l'application est en cours d'affichage
     */
    function isDisplayingApp() {
        // Vérifier si l'application est en cours d'affichage au lieu de la page marketing
        return document.getElementById('hypnorelax-app') !== null;
    }
    
    /**
     * Vérifie les paramètres URL pour actions spécifiques
     */
    function checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Démarrer l'application si demandé
        if (urlParams.has('start')) {
            trackEvent('auto_start', 'url_parameter');
            
            const startAppButtons = document.querySelectorAll('.start-app-button');
            if (startAppButtons.length > 0) {
                setTimeout(() => {
                    startAppButtons[0].click();
                }, 500);
            }
        }
        
        // Scroll vers une section spécifique
        if (urlParams.has('section')) {
            const section = urlParams.get('section');
            const sectionElement = document.getElementById(section);
            
            if (sectionElement) {
                setTimeout(() => {
                    const headerHeight = DOM.header ? DOM.header.offsetHeight : 0;
                    const targetPosition = sectionElement.getBoundingClientRect().top + window.scrollY;
                    
                    window.scrollTo({
                        top: targetPosition - headerHeight - CONFIG.scrollOffset,
                        behavior: 'smooth'
                    });
                    
                    trackEvent('auto_scroll', section);
                }, 500);
            }
        }
        
        // Ouvrir la newsletter si demandé
        if (urlParams.has('newsletter') && urlParams.get('newsletter') === 'true') {
            setTimeout(() => {
                showNewsletterModal();
            }, 1000);
        }
    }
    
    /**
     * Fonction debounce pour limiter les appels répétés
     */
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            
            clearTimeout(timeout);
            
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // Initialiser tout
    init();
});
