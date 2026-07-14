document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Sticky header: condensed glass state on scroll ---------- */
    initHeaderScrollState();

    /* ---------- Header blur self-heal ---------- */
    initBlurSelfHeal();

    /* ---------- Cursor companion tag (microinteração estilo Canva) ---------- */
    initCursorCompanion();

    /* ---------- Navbar mobile toggle ---------- */
    const menuToggle = document.getElementById('js-menu-toggle');
    const navMenu = document.getElementById('js-nav-menu');
    const menuLinks = document.querySelectorAll('.nav-item a');

    function closeMobileMenu() {
        if (!navMenu || !navMenu.classList.contains('active')) return;
        navMenu.classList.remove('active');
        if (menuToggle) {
            menuToggle.classList.remove('is-open');
            menuToggle.querySelector('i').className = 'fa-solid fa-bars';
            menuToggle.setAttribute('aria-label', 'Abrir menu');
        }
    }

    if (menuToggle && navMenu) {
        menuToggle.setAttribute('aria-label', 'Abrir menu');
        menuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('active');
            menuToggle.classList.toggle('is-open', isOpen);
            menuToggle.querySelector('i').className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
        });
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Elegant, expected mobile-menu behaviors: tap outside or press
    // Escape to dismiss, matching how the rest of the site's overlays feel.
    document.addEventListener('click', (e) => {
        if (!navMenu || !navMenu.classList.contains('active')) return;
        if (navMenu.contains(e.target) || (menuToggle && menuToggle.contains(e.target))) return;
        closeMobileMenu();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
    });
    window.addEventListener('resize', () => {
        if (window.matchMedia('(min-width: 861px)').matches) closeMobileMenu();
    });

    /* ---------- Sliding pill indicator for the central nav menu ---------- */
    (function initNavPillIndicator() {
        if (!navMenu) return;
        const indicator = navMenu.querySelector('.nav-pill-indicator');
        const items = Array.from(navMenu.querySelectorAll('.nav-item > a'));
        if (!indicator || !items.length) return;

        // Only enable on layouts where the menu is the horizontal glass pill
        // (desktop). The mobile dropdown handles its own active styling in CSS.
        const isDesktopLayout = () => window.matchMedia('(min-width: 861px)').matches;

        function moveIndicatorTo(link) {
            if (!link || !isDesktopLayout()) {
                indicator.style.opacity = '0';
                return;
            }
            // Measure the link's own box and translate it into coordinates
            // relative to nav-menu's padding box (its containing block for
            // this absolutely-positioned indicator). Using clientLeft/Top
            // (the menu's border width) rather than subtracting the two
            // getBoundingClientRect() origins directly avoids double-
            // counting that border — the bug that previously left the
            // green highlight offset from the link text. Driving width
            // AND height straight from the link's rect also guarantees the
            // pill wraps the label exactly, centered on both axes, with no
            // dependency on keeping padding values in sync in two places.
            const menuRect = navMenu.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            const left = linkRect.left - menuRect.left - navMenu.clientLeft;
            const top = linkRect.top - menuRect.top - navMenu.clientTop;
            indicator.style.transform = `translate(${left}px, ${top}px)`;
            indicator.style.width = `${linkRect.width}px`;
            indicator.style.height = `${linkRect.height}px`;
            indicator.style.opacity = '1';
        }

        function activeLink() {
            return navMenu.querySelector('.nav-item > a.active') || items[0];
        }

        function restToActive() {
            items.forEach(a => a.classList.remove('is-indicated'));
            const active = activeLink();
            if (active) active.classList.add('is-indicated');
            moveIndicatorTo(active);
        }

        items.forEach(link => {
            link.addEventListener('mouseenter', () => {
                items.forEach(a => a.classList.remove('is-indicated'));
                link.classList.add('is-indicated');
                moveIndicatorTo(link);
            });
            link.addEventListener('focus', () => {
                items.forEach(a => a.classList.remove('is-indicated'));
                link.classList.add('is-indicated');
                moveIndicatorTo(link);
            });
        });

        navMenu.addEventListener('mouseleave', restToActive);
        navMenu.addEventListener('focusout', (e) => {
            if (!navMenu.contains(e.relatedTarget)) restToActive();
        });

        window.addEventListener('resize', () => {
            if (isDesktopLayout()) restToActive();
            else indicator.style.opacity = '0';
        });

        // Position once layout has settled (fonts/logo can shift widths slightly).
        requestAnimationFrame(() => {
            navMenu.classList.add('has-indicator');
            restToActive();
        });
        window.addEventListener('load', restToActive);
        // Re-sync after web fonts finish swapping in — a common source of
        // a few px of drift between the pill and the text it should hug.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(restToActive);
        }
    })();

    /* ---------- Auto-tag reveal animations & stagger ---------- */
    // Grids that get sequential card reveals, each with its own animation flavor
    const staggerGroups = [
        { sel: '.stats-grid', anim: 'scale-in' },
        { sel: '.services-grid', anim: 'fade-up' },
        { sel: '.process-grid', anim: 'fade-up' },
        { sel: '.portfolio-grid', anim: 'scale-in' },
        { sel: '.testimonials-grid', anim: 'blur-in' },
        { sel: '.pricing-grid', anim: 'fade-up' },
        { sel: '.pillars-grid', anim: 'blur-in' },
        { sel: '.addons-grid', anim: 'fade-up' }
    ];

    staggerGroups.forEach(({ sel, anim }) => {
        document.querySelectorAll(sel).forEach(grid => {
            const children = Array.from(grid.children);
            children.forEach((child, i) => {
                if (!child.hasAttribute('data-reveal')) {
                    child.setAttribute('data-reveal', anim);
                    child.setAttribute('data-reveal-delay', String(i * 80));
                }
            });
        });
    });

    // Section headers & standalone blocks get a default reveal if not already tagged
    const defaultRevealSelectors = [
        '.section-header', '.calo-text', '.calo-card',
        '.case-block', '.manifesto-card', '.cta-final',
        '.about-lead', '.about-body', '.packages-intro',
        '.addons-box', '.terms-doc'
    ];

    defaultRevealSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            if (!el.hasAttribute('data-reveal')) {
                el.setAttribute('data-reveal', 'fade-up');
            }
        });
    });

    // Give calo-text / calo-card a directional feel
    document.querySelectorAll('.calo-text').forEach(el => el.setAttribute('data-reveal', 'slide-right'));
    document.querySelectorAll('.calo-card').forEach(el => el.setAttribute('data-reveal', 'slide-left'));

    // Case blocks alternate left/right
    document.querySelectorAll('.case-block').forEach((el, i) => {
        el.setAttribute('data-reveal', i % 2 === 0 ? 'slide-right' : 'slide-left');
    });

    /* ---------- Intersection Observer for reveals ---------- */
    const revealEls = document.querySelectorAll('[data-reveal]');

    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = el.getAttribute('data-reveal-delay');
                if (delay) {
                    el.style.transitionDelay = `${delay}ms`;
                }
                el.classList.add('is-visible');
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => io.observe(el));

    /* ---------- FAQ accordion ---------- */
    // Abre uma pergunta por vez (padrão de accordion de sites profissionais).
    // A animação suave em si é feita via CSS (grid-template-rows), aqui só
    // controlamos qual item está aberto e o estado de acessibilidade.
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');
            faqItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove('is-open');
                    const otherQuestion = other.querySelector('.faq-question');
                    if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
                }
            });
            item.classList.toggle('is-open', !isOpen);
            question.setAttribute('aria-expanded', String(!isOpen));
        });
    });

    /* ---------- Animated counters ---------- */
    document.querySelectorAll('.stat-number').forEach(el => {
        const raw = el.textContent.trim();
        const match = raw.match(/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/);
        if (!match) return;
        const prefix = match[1];
        const numberStr = match[2].replace(',', '.');
        const suffix = match[3];
        const target = parseFloat(numberStr);
        if (isNaN(target)) return;

        el.textContent = prefix + '0' + suffix;

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(el, prefix, target, suffix, numberStr.includes('.'));
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.4 });

        counterObserver.observe(el);
    });

    function animateCount(el, prefix, target, suffix, isDecimal) {
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            const display = isDecimal ? current.toFixed(1) : Math.round(current);
            el.textContent = prefix + display + suffix;
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = prefix + (isDecimal ? target.toFixed(1) : target) + suffix;
            }
        }
        requestAnimationFrame(tick);
    }
});

/* ============================================================
   STICKY HEADER — CONDENSED GLASS STATE
   ============================================================ */
function initHeaderScrollState() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let ticking = false;
    function update() {
        navbar.classList.toggle('is-scrolled', window.scrollY > 24);
        ticking = false;
    }
    update();
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
}

/* ============================================================
   HEADER BLUR SELF-HEAL
   ------------------------------------------------------------
   Some browsers (notably Safari and Chrome on mobile) silently drop
   the GPU compositing layer behind a backdrop-filter element after a
   tab has spent a while hidden or the page is restored from the
   back/forward cache — the blur just never comes back on its own.
   Forcing a reflow on every element that relies on backdrop-filter
   whenever the page becomes visible again (or is restored from
   bfcache) recreates that layer reliably, so the glass effect keeps
   working through the whole session regardless of how long the tab
   was in the background.
   ============================================================ */
function initBlurSelfHeal() {
    const blurredEls = () => document.querySelectorAll('.nav-menu, .navbar.is-scrolled');

    function reassert() {
        blurredEls().forEach(el => {
            const filter = getComputedStyle(el).backdropFilter || getComputedStyle(el).webkitBackdropFilter;
            el.style.backdropFilter = 'none';
            el.style.webkitBackdropFilter = 'none';
            // Force a synchronous style/layout flush before restoring —
            // this is what actually makes the browser rebuild the layer.
            void el.offsetHeight;
            el.style.backdropFilter = filter || '';
            el.style.webkitBackdropFilter = filter || '';
        });
    }

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) requestAnimationFrame(reassert);
    });
    // Fires on back/forward-cache restores, which visibilitychange can miss.
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) requestAnimationFrame(reassert);
    });
    window.addEventListener('focus', () => requestAnimationFrame(reassert));
}

/* ============================================================
   CURSOR COMPANION TAG
   ------------------------------------------------------------
   Pequena tag "Você" que segue o cursor com leve atraso, no
   espírito das microanimações de campanha da Canva.

   - Só roda em dispositivos com mouse fino (matchMedia hover+pointer):
     em touch a tag nunca é criada.
   - pointer-events: none na tag (CSS) garante que ela nunca
     intercepta cliques, hovers ou seleção de texto.
   - O movimento usa requestAnimationFrame com interpolação (lerp)
     entre a posição atual e a posição alvo do cursor, criando o
     "leve atraso" fluido pedido, sem depender de transitions de
     posição (que travariam com movimentos rápidos).
   - A tag some após alguns segundos parada e volta suavemente ao
     menor movimento do mouse, mantendo a interface limpa.
   ============================================================ */
function initCursorCompanion() {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover) return; // dispositivos touch nunca recebem a tag

    const tag = document.createElement('div');
    tag.className = 'cursor-tag';
    tag.setAttribute('aria-hidden', 'true');
    tag.innerHTML = '<span class="cursor-tag__dot"></span><span class="cursor-tag__label">Você</span>';
    document.body.appendChild(tag);

    let targetX = 0, targetY = 0;   // posição real do cursor
    let currentX = 0, currentY = 0; // posição renderizada (com atraso)
    let hasMoved = false;
    let rafId = null;
    let idleTimer = null;
    const EASE = 0.16; // fator de interpolação: menor = atraso mais perceptível

    function show() {
        tag.classList.add('is-visible');
        clearTimeout(idleTimer);
        idleTimer = setTimeout(hide, 2200);
    }

    function hide() {
        tag.classList.remove('is-visible');
    }

    function loop() {
        currentX += (targetX - currentX) * EASE;
        currentY += (targetY - currentY) * EASE;
        tag.style.transform = `translate3d(${currentX + 18}px, ${currentY + 18}px, 0) scale(1)`;
        rafId = requestAnimationFrame(loop);
    }

    function onMove(e) {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!hasMoved) {
            hasMoved = true;
            currentX = targetX;
            currentY = targetY;
        }
        show();
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', hide);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) hide();
    });

    rafId = requestAnimationFrame(loop);
}
