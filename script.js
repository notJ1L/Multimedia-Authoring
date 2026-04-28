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

const ageCalculatorForm = document.querySelector('[data-age-calculator-form]');
const ageCalculatorResults = document.querySelector('[data-age-calculator-results]');

if (ageCalculatorForm && ageCalculatorResults) {
    const earthYearsInput = ageCalculatorForm.elements.namedItem('earth-years');
    const planetYears = [
        { name: 'Mercury', orbitalPeriod: 0.2408467 },
        { name: 'Venus', orbitalPeriod: 0.61519726 },
        { name: 'Earth', orbitalPeriod: 1 },
        { name: 'Mars', orbitalPeriod: 1.8808158 },
        { name: 'Jupiter', orbitalPeriod: 11.862615 },
        { name: 'Saturn', orbitalPeriod: 29.447498 },
        { name: 'Uranus', orbitalPeriod: 84.016846 },
        { name: 'Neptune', orbitalPeriod: 164.79132 },
        { name: 'Pluto', orbitalPeriod: 248 }
    ];

    const formatAge = (value) => {
        if (!Number.isFinite(value)) {
            return '0';
        }

        if (value >= 1000) {
            return value.toFixed(0);
        }

        if (value >= 100) {
            return value.toFixed(1);
        }

        if (value >= 1) {
            return value.toFixed(2);
        }

        if (value >= 0.01) {
            return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
        }

        return '<0.01';
    };

    const renderAges = () => {
        if (!(earthYearsInput instanceof HTMLInputElement)) {
            return;
        }

        const earthYears = Number(earthYearsInput.value);
        const normalizedEarthYears = Number.isFinite(earthYears) && earthYears >= 0 ? earthYears : 0;

        ageCalculatorResults.innerHTML = planetYears
            .map((planet) => {
                const planetAge = normalizedEarthYears / planet.orbitalPeriod;

                return `
                    <article class="age-result-card">
                        <h3>${planet.name}</h3>
                        <p><strong>${formatAge(planetAge)}</strong> ${planet.name} years</p>
                    </article>
                `;
            })
            .join('');
    };

    ageCalculatorForm.addEventListener('submit', (event) => {
        event.preventDefault();
        renderAges();
    });

    if (earthYearsInput instanceof HTMLInputElement) {
        earthYearsInput.addEventListener('input', renderAges);
    }
    renderAges();
}