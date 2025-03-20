/**
 * Optimisations pour les appareils mobiles
 */

// Fonction pour déterminer si on est sur un appareil mobile
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || window.innerWidth < 768
      || ('ontouchstart' in window);
}

// Fonction pour optimiser les performances sur mobile
function optimizeForMobile() {
  if (isMobileDevice()) {
    console.log("Optimisations mobiles activées");
    
    // Ajouter une classe pour les styles spécifiques
    document.body.classList.add('mobile-device');
    
    // Optimiser les animations de particules
    window.mobileOptimizations = {
      reduceParticles: true,        // Réduire le nombre de particules
      simplifyAnimations: true,     // Simplifier certaines animations
      reduceTransitionEffects: true // Réduire les effets de transition
    };
    
    // Adapter l'orientation de l'écran automatiquement
    function handleOrientationChange() {
      // Vérifier si nous sommes en mode portrait
      if (window.innerHeight > window.innerWidth) {
        // En mode portrait, ajuster certains éléments pour une meilleure lisibilité
        document.querySelectorAll('.step-label').forEach(el => {
          el.style.fontSize = '0.6rem';
        });
      } else {
        // En mode paysage, optimiser l'espace horizontal
        document.querySelectorAll('.step-label').forEach(el => {
          el.style.fontSize = '';
        });
      }
    }
    
    // Exécuter une première fois et ajouter l'écouteur d'événements
    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    
    // Optimiser les interactions tactiles
    document.addEventListener('touchstart', function() {
      // Préconfigurer certains éléments pour une meilleure réactivité
    }, {passive: true});
    
    // Améliorer les performances des animations
    function simplifyAnimationsForMobile() {
      if (window.mobileOptimizations.simplifyAnimations) {
        // Réduire la complexité des animations
        const spiral = document.querySelector('.spiral');
        if (spiral) {
          spiral.style.animationDuration = '30s';
        }
        
        // Réduire le nombre de points lumineux
        const stairDotsContainer = document.getElementById('stairDotsContainer');
        if (stairDotsContainer && stairDotsContainer.children.length > 10) {
          // Garder seulement 10 points au maximum
          Array.from(stairDotsContainer.children).slice(10).forEach(dot => {
            dot.remove();
          });
        }
      }
    }
    
    // Appliquer après un court délai pour ne pas interférer avec le chargement initial
    setTimeout(simplifyAnimationsForMobile, 1000);
    
    // Désactiver certaines fonctionnalités gourmandes en ressources sur les appareils très faibles
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || /Android 4|Android 5/i.test(navigator.userAgent);
    if (isLowEndDevice) {
      console.log("Appareil à faibles performances détecté, activation du mode économique");
      document.body.classList.add('low-end-device');
      
      // Désactiver les animations les plus gourmandes
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        .spiral { animation: none !important; background: radial-gradient(circle, var(--pastel-blue), var(--deep-blue)) !important; }
        .spiral::before, .spiral::after { display: none !important; }
        .exploration-ring { animation: none !important; }
        .stair-dots-container { display: none !important; }
      `;
      document.head.appendChild(styleEl);
    }
  }
}

// Exécuter dès que le DOM est chargé
document.addEventListener('DOMContentLoaded', optimizeForMobile);

// Surveiller et optimiser le chargement des ressources
if ('serviceWorker' in navigator) {
  // Demander au service worker de prioritiser les ressources critiques
  navigator.serviceWorker.ready.then(registration => {
    if (registration.active && 'postMessage' in registration.active) {
      registration.active.postMessage({
        type: 'OPTIMIZE_MOBILE',
        isMobile: isMobileDevice()
      });
    }
  });
}

// Améliorer le comportement sur iOS
function iosFixes() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    // Fix pour le problème de défilement sur iOS
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Éviter le zoom sur les contrôles de formulaire
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
    }
    
    // Empêcher le comportement de rebond en haut et en bas de la page
    document.body.addEventListener('touchmove', function(e) {
      if (document.body.scrollTop === 0) {
        e.preventDefault();
      }
    }, { passive: false });
  }
}

// Appliquer les correctifs iOS
iosFixes();
