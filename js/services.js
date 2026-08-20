// Services Page JavaScript
(function() {
    "use strict";
    
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    /* ---------- Quick Navigation ScrollSpy ---------- */
    const quickNav = document.getElementById('svcQuickNav');
    const navPills = document.querySelectorAll('.svc-nav-pill');
    const sections = document.querySelectorAll('[id]');
    
    function updateActiveNav() {
        let current = '';
        const scrollPos = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navPills.forEach(pill => {
            pill.classList.remove('active');
            if (pill.getAttribute('data-section') === current) {
                pill.classList.add('active');
            }
        });
    }
    
    if (quickNav && !reduced) {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(updateActiveNav);
        }, { passive: true });
        
        // Smooth scroll for nav pills
        navPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = pill.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const headerHeight = document.getElementById('siteHeader').offsetHeight;
                    const navHeight = quickNav.offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight - navHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    /* ---------- Steps Animation ---------- */
    const steps = document.querySelectorAll('.svc-step');
    const stepsFill = document.querySelector('.svc-steps-line .fill');
    
    if (steps.length && stepsFill && 'IntersectionObserver' in window && !reduced) {
        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    const stepIndex = parseInt(entry.target.getAttribute('data-step')) - 1;
                    const totalSteps = steps.length;
                    const progress = (stepIndex / (totalSteps - 1)) * 100;
                    
                    const isMobile = window.innerWidth < 768;
                    if (isMobile) {
                        stepsFill.style.height = progress + '%';
                    } else {
                        stepsFill.style.width = progress + '%';
                    }
                    
                    stepObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        steps.forEach(step => stepObserver.observe(step));
    } else if (steps.length) {
        steps.forEach(step => step.classList.add('active'));
        if (stepsFill) stepsFill.style.width = '100%';
    }
    
    /* ---------- Service Selector Form ---------- */
    const selectorForm = document.getElementById('serviceSelectorForm');
    if (selectorForm) {
        selectorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(selectorForm);
            const shipmentType = formData.get('shipment-type');
            const cargoType = formData.get('cargo-type');
            
            // Route to quote section with pre-selected options
            const quoteSection = document.getElementById('tools');
            if (quoteSection) {
                quoteSection.scrollIntoView({ behavior: 'smooth' });
                
                // Trigger calc tab if available
                const calcTab = document.getElementById('tab-calc');
                if (calcTab && window.bootstrap) {
                    bootstrap.Tab.getOrCreateInstance(calcTab).show();
                }
            }
        });
    }
    
    /* ---------- Service List Interactions ---------- */
    const serviceListItems = document.querySelectorAll('.svc-list-item');
    serviceListItems.forEach(item => {
        item.addEventListener('click', () => {
            // Add subtle click feedback
            item.style.transform = 'scale(0.98)';
            setTimeout(() => {
                item.style.transform = '';
            }, 150);
        });
    });
    
    /* ---------- Horizontal Scroll for Quick Nav (Mobile) ---------- */
    const quickNavScroll = document.querySelector('.svc-quick-nav-scroll');
    if (quickNavScroll) {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        quickNavScroll.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - quickNavScroll.offsetLeft;
            scrollLeft = quickNavScroll.scrollLeft;
            quickNavScroll.style.cursor = 'grabbing';
        });
        
        quickNavScroll.addEventListener('mouseleave', () => {
            isDown = false;
            quickNavScroll.style.cursor = 'grab';
        });
        
        quickNavScroll.addEventListener('mouseup', () => {
            isDown = false;
            quickNavScroll.style.cursor = 'grab';
        });
        
        quickNavScroll.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - quickNavScroll.offsetLeft;
            const walk = (x - startX) * 2;
            quickNavScroll.scrollLeft = scrollLeft - walk;
        });
        
        quickNavScroll.style.cursor = 'grab';
    }
    
    /* ---------- Parallax Effect for Hero (Desktop) ---------- */
    const hero = document.querySelector('.svc-hero');
    const heroVisual = document.querySelector('.svc-hero-visual');
    
    if (hero && heroVisual && !reduced && window.innerWidth >= 992) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const heroRect = hero.getBoundingClientRect();
            
            if (heroRect.top < 0 && heroRect.bottom > 0) {
                const parallaxValue = scrolled * 0.3;
                heroVisual.style.transform = `translateY(${parallaxValue}px)`;
            }
        }, { passive: true });
    }
    
    /* ---------- Card Hover Effects Enhancement ---------- */
    const cards = document.querySelectorAll('.svc-overview-card, .svc-freight-card, .svc-additional-card, .why-choose-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!reduced) {
                card.style.transition = 'all 0.35s cubic-bezier(0.22, 0.61, 0.36, 1)';
            }
        });
    });
    
    /* ---------- Update window resize handler for steps ---------- */
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Recalculate step progress on resize
            const activeSteps = document.querySelectorAll('.svc-step.active');
            if (activeSteps.length && stepsFill) {
                const lastActiveStep = activeSteps[activeSteps.length - 1];
                const stepIndex = parseInt(lastActiveStep.getAttribute('data-step')) - 1;
                const totalSteps = steps.length;
                const progress = (stepIndex / (totalSteps - 1)) * 100;
                
                const isMobile = window.innerWidth < 768;
                if (isMobile) {
                    stepsFill.style.height = progress + '%';
                } else {
                    stepsFill.style.width = progress + '%';
                }
            }
        }, 250);
    });
    
})();