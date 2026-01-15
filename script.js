/* ===================================
   LOCO DHAASU - Interactive JavaScript
   ================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initSmoothScroll();
    initParallax();
    initMenuScroll();
    initRevealAnimations();
    initMenuCardHover();
    initMobileNav();
    initCustomCursor();
    initMarqueeSpeed();
    
    // Add loaded class for animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

/* ===================================
   SMOOTH SCROLL
   ================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ===================================
   PARALLAX EFFECTS
   ================================== */
function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.1;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        // Hero headline parallax
        const headlineWords = document.querySelectorAll('.headline-word');
        headlineWords.forEach((word, index) => {
            const speed = 0.05 + (index * 0.03);
            const yPos = scrolled * speed;
            word.style.transform = `translateY(${yPos}px)`;
        });
        
        // Roll image rotation on scroll
        const rollImage = document.querySelector('.roll-image');
        if (rollImage) {
            const rotation = scrolled * 0.02;
            rollImage.style.transform = `rotate(${rotation}deg)`;
        }
    }
    
    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateParallax);
    });
}

/* ===================================
   HORIZONTAL MENU SCROLL
   ================================== */
function initMenuScroll() {
    const container = document.querySelector('.menu-scroll-container');
    if (!container) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('active');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });
    
    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
    });
    
    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active');
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
    });
    
    // Touch support
    let touchStartX;
    let touchScrollLeft;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].pageX - container.offsetLeft;
        touchScrollLeft = container.scrollLeft;
    });
    
    container.addEventListener('touchmove', (e) => {
        const x = e.touches[0].pageX - container.offsetLeft;
        const walk = (x - touchStartX) * 2;
        container.scrollLeft = touchScrollLeft - walk;
    });
}

/* ===================================
   REVEAL ANIMATIONS ON SCROLL
   ================================== */
function initRevealAnimations() {
    const revealElements = document.querySelectorAll(
        '.bento-box, .menu-card, .squad-item, .section-header, .order-content'
    );
    
    revealElements.forEach(el => {
        el.classList.add('reveal');
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => observer.observe(el));
}

/* ===================================
   MENU CARD HOVER EFFECTS
   ================================== */
function initMenuCardHover() {
    const menuCards = document.querySelectorAll('.menu-card');
    const menuSection = document.querySelector('.menu-section');
    
    menuCards.forEach(card => {
        const color = card.dataset.color;
        
        card.addEventListener('mouseenter', () => {
            // Background pulse effect
            menuSection.style.transition = 'background-color 0.4s ease';
            menuSection.style.backgroundColor = adjustColor(color, -20);
        });
        
        card.addEventListener('mouseleave', () => {
            menuSection.style.backgroundColor = '';
        });
    });
}

// Helper function to darken colors
function adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

/* ===================================
   MOBILE NAVIGATION
   ================================== */
function initMobileNav() {
    const toggle = document.querySelector('.nav-mobile-toggle');
    const nav = document.querySelector('.nav');
    const links = document.querySelector('.nav-links');
    
    if (!toggle) return;
    
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        
        if (links.style.display === 'flex') {
            links.style.display = 'none';
        } else {
            links.style.display = 'flex';
            links.style.position = 'absolute';
            links.style.top = '100%';
            links.style.left = '0';
            links.style.right = '0';
            links.style.flexDirection = 'column';
            links.style.background = 'var(--nav-bg-solid)';
            links.style.padding = '1rem';
            links.style.borderBottom = '2px solid var(--black)';
            links.style.gap = '1rem';
        }
    });
    
    // Toggle animation
    toggle.querySelectorAll('span').forEach((span, index) => {
        if (toggle.classList.contains('active')) {
            if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) span.style.opacity = '0';
            if (index === 2) span.style.transform = 'rotate(-45deg) translate(5px, -5px)';
        }
    });
}

/* ===================================
   CUSTOM CURSOR
   ================================== */
function initCustomCursor() {
    // Only on devices with hover capability
    if (!window.matchMedia('(hover: hover)').matches) return;
    
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Smooth cursor follow
    function animateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        cursorX += dx * 0.15;
        cursorY += dy * 0.15;
        
        cursor.style.left = cursorX - 10 + 'px';
        cursor.style.top = cursorY - 10 + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Cursor effects on interactive elements
    const interactiveElements = document.querySelectorAll(
        'a, button, .menu-card, .bento-box, .squad-item'
    );
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
}

/* ===================================
   MARQUEE SPEED CONTROL
   ================================== */
function initMarqueeSpeed() {
    const marquee = document.querySelector('.marquee-track');
    if (!marquee) return;
    
    // Pause on hover
    marquee.addEventListener('mouseenter', () => {
        marquee.style.animationPlayState = 'paused';
    });
    
    marquee.addEventListener('mouseleave', () => {
        marquee.style.animationPlayState = 'running';
    });
}

/* ===================================
   NAVBAR SCROLL EFFECT
   ================================== */
let lastScroll = 0;
const navbar = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.transform = 'translateY(0)';
        navbar.style.boxShadow = 'none';
        return;
    }
    
    if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    }
    
    lastScroll = currentScroll;
});

/* ===================================
   GLITCH TEXT EFFECT
   ================================== */
function createGlitchEffect(element) {
    const text = element.textContent;
    element.setAttribute('data-text', text);
    
    element.addEventListener('mouseenter', () => {
        element.classList.add('glitch');
        setTimeout(() => {
            element.classList.remove('glitch');
        }, 300);
    });
}

// Apply to CTA buttons
document.querySelectorAll('.cta-button, .cta-nav').forEach(createGlitchEffect);

/* ===================================
   INTERSECTION OBSERVER FOR COUNTERS
   ================================== */
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = '€' + (progress * (end - start) + start).toFixed(2);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/* ===================================
   PRELOAD CRITICAL ASSETS
   ================================== */
function preloadAssets() {
    const fonts = [
        'https://fonts.googleapis.com/css2?family=Anton&display=swap',
        'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap'
    ];
    
    fonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = font;
        document.head.appendChild(link);
    });
}

/* ===================================
   KEYBOARD NAVIGATION
   ================================== */
document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape') {
        const links = document.querySelector('.nav-links');
        const toggle = document.querySelector('.nav-mobile-toggle');
        if (links && toggle) {
            links.style.display = 'none';
            toggle.classList.remove('active');
        }
    }
});

/* ===================================
   PERFORMANCE: REDUCE MOTION
   ================================== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    // Disable animations for users who prefer reduced motion
    document.documentElement.style.setProperty('--ease-out', 'linear');
    document.documentElement.style.setProperty('--ease-in-out', 'linear');
    
    // Stop marquee
    const marquees = document.querySelectorAll('.marquee-track, .footer-marquee');
    marquees.forEach(m => m.style.animation = 'none');
    
    // Stop floating animations
    const floatingElements = document.querySelectorAll('.floating-element, .roll-placeholder');
    floatingElements.forEach(el => el.style.animation = 'none');
}

/* ===================================
   ROLL OPENING ANIMATION ENHANCEMENTS
   ================================== */
function initRollAnimation() {
    const rollWrapper = document.querySelector('.roll-wrapper');
    if (!rollWrapper) return;
    
    const spiceParticles = rollWrapper.querySelector('.spice-particles');
    const ingredients = rollWrapper.querySelectorAll('.ingredient');
    
    // Create dynamic spice particles on hover
    rollWrapper.addEventListener('mouseenter', () => {
        createSpiceBurst(rollWrapper);
        
        // Add sizzle sound effect feeling with vibration
        ingredients.forEach((ing, index) => {
            setTimeout(() => {
                ing.style.animation = `ingredientFloat 0.8s ease-in-out ${index * 0.05}s infinite alternate`;
            }, index * 100);
        });
    });
    
    rollWrapper.addEventListener('mouseleave', () => {
        ingredients.forEach(ing => {
            ing.style.animation = '';
        });
    });
    
    // Mouse tracking for dynamic glow
    rollWrapper.addEventListener('mousemove', (e) => {
        const rect = rollWrapper.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        const glow = rollWrapper.querySelector('.roll-glow');
        if (glow) {
            glow.style.background = `radial-gradient(
                circle at ${x * 100}% ${y * 100}%,
                rgba(255, 193, 7, 0.5) 0%,
                rgba(255, 152, 0, 0.3) 25%,
                rgba(255, 87, 34, 0.15) 50%,
                transparent 70%
            )`;
        }
    });
}

function createSpiceBurst(container) {
    const colors = ['#c41e3a', '#ff6b35', '#ffd700', '#228b22', '#8b4513', '#ff4500'];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'dynamic-spice';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 6 + 3}px;
            height: ${Math.random() * 6 + 3}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            left: 50%;
            top: 50%;
            pointer-events: none;
            z-index: 30;
            opacity: 0;
        `;
        
        container.appendChild(particle);
        
        // Animate particle
        const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
        const distance = 80 + Math.random() * 60;
        const duration = 600 + Math.random() * 400;
        
        particle.animate([
            { 
                transform: 'translate(-50%, -50%) scale(0)', 
                opacity: 0 
            },
            { 
                opacity: 1,
                offset: 0.2
            },
            { 
                transform: `translate(
                    calc(-50% + ${Math.cos(angle) * distance}px), 
                    calc(-50% + ${Math.sin(angle) * distance}px)
                ) scale(1.5) rotate(${Math.random() * 360}deg)`, 
                opacity: 0 
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => particle.remove();
    }
}

// Initialize roll animation
document.addEventListener('DOMContentLoaded', () => {
    initRollAnimation();
});

// Add dynamic CSS for ingredient float
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes ingredientFloat {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(-8px) rotate(5deg); }
    }
`;
document.head.appendChild(styleSheet);

/* ===================================
   CONSOLE EASTER EGG
   ================================== */
console.log(`
%c🌯 LOCO DHAASU 🌯
%cBold rolls for modern appetites.

%cWe don't do "Mystical India."
We do bold, fast, street-style rolls
with real ingredients.

%c→ Join the squad: wa.me/yourwhatsapp
→ Instagram: @locodhaasu
`,
'font-size: 24px; font-weight: bold; color: #FF2D55;',
'font-size: 14px; color: #FFC400;',
'font-size: 12px; color: #2B2F3A;',
'font-size: 10px; color: #0D0F14;'
);
