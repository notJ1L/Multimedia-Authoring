const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.main-nav a').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
        const href = anchor.getAttribute('href') || '';
        if (!href.startsWith('#')) {
            return;
        }

        event.preventDefault();
        const targetId = href.slice(1);
        if (!targetId) {
            return;
        }

        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        }
    });
});

document.querySelectorAll('.topic-button[data-url]').forEach((button) => {
    button.addEventListener('click', () => {
        const url = button.getAttribute('data-url');
        if (!url) {
            return;
        }

        window.location.href = url;
    });
});

const revealItems = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add('visible'));
} else {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2 }
    );

    revealItems.forEach((item, index) => {
        item.style.transitionDelay = `${Math.min(index * 80, 420)}ms`;
        revealObserver.observe(item);
    });
}

const orbs = document.querySelectorAll('.bg-orb');

if (!prefersReducedMotion && orbs.length > 0) {
    window.addEventListener('pointermove', (event) => {
        const xRatio = (event.clientX / window.innerWidth - 0.5) * 2;
        const yRatio = (event.clientY / window.innerHeight - 0.5) * 2;

        orbs.forEach((orb, index) => {
            const strength = (index + 1) * 8;
            const x = xRatio * strength;
            const y = yRatio * strength;
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}