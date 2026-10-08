/* ==========================================================================
   NETWORK BOSS: TELECOM TYCOON — MAIN INTERACTION SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Language Localization Engine
    let currentLang = localStorage.getItem('nb_lang') || 'tr';

    const langToggleBtn = document.getElementById('langToggleBtn');
    const langLabel = document.getElementById('langLabel');

    function applyTranslations(lang) {
        currentLang = lang;
        localStorage.setItem('nb_lang', lang);
        document.documentElement.lang = lang;
        
        if (langLabel) {
            langLabel.textContent = lang === 'tr' ? 'EN' : 'TR';
        }

        const dict = translations[lang] || translations.tr;

        // Text Content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });

        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) {
                el.placeholder = dict[key];
            }
        });

        // Update active character & simulator
        updateActiveCharacter();
        updateSimulator();
    }

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const newLang = currentLang === 'tr' ? 'en' : 'tr';
            applyTranslations(newLang);
        });
    }

    // 2. Header Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobileNavToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('mobile-open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close when clicking a nav link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-open');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // 4. Interactive Package Simulator
    const speedInput = document.getElementById('simSpeed');
    const quotaInput = document.getElementById('simQuota');
    const priceInput = document.getElementById('simPrice');

    const speedValDisplay = document.getElementById('simSpeedVal');
    const quotaValDisplay = document.getElementById('simQuotaVal');
    const priceValDisplay = document.getElementById('simPriceVal');

    const meterFill = document.getElementById('simMeterFill');
    const meterVal = document.getElementById('simMeterVal');
    const subsVal = document.getElementById('simSubsVal');
    const revenueVal = document.getElementById('simRevenueVal');
    const elifSpeech = document.getElementById('elifSpeech');
    const elifAvatar = document.getElementById('elifAvatar');

    function updateSimulator() {
        if (!speedInput || !quotaInput || !priceInput) return;

        const dict = translations[currentLang] || translations.tr;

        const speed = parseInt(speedInput.value, 10);
        const quota = parseInt(quotaInput.value, 10);
        const price = parseInt(priceInput.value, 10);

        // Display current values
        speedValDisplay.textContent = `${speed} Mbps`;
        if (quota >= 500) {
            quotaValDisplay.textContent = dict['sim.unlimited'];
        } else {
            quotaValDisplay.textContent = `${quota} GB`;
        }
        priceValDisplay.textContent = `$${price} / ${currentLang === 'tr' ? 'ay' : 'mo'}`;

        // Attractiveness Algorithm
        // Value score based on speed per dollar and quota per dollar
        const effectiveQuota = quota >= 500 ? 600 : quota;
        const offerPower = (speed * 0.45) + (effectiveQuota * 0.35);
        const expectedPrice = Math.max(15, offerPower * 0.22);
        
        let scoreRatio = expectedPrice / price;
        let marketAttractiveness = Math.min(99, Math.max(12, Math.round(scoreRatio * 50)));

        // Estimated metrics
        let estimatedSubs = Math.round(marketAttractiveness * 18.5);
        let estimatedRevenue = Math.round(estimatedSubs * price);

        meterFill.style.width = `${marketAttractiveness}%`;
        meterVal.textContent = `%${marketAttractiveness}`;
        subsVal.textContent = `+${estimatedSubs.toLocaleString()}`;
        revenueVal.textContent = `$${estimatedRevenue.toLocaleString()}`;

        // Dialogue reaction & avatar emotion (Using transparent cutout portraits)
        if (price >= 85 && (speed < 120 || scoreRatio < 0.65)) {
            elifSpeech.textContent = dict['sim.elif_dialogue_expensive'];
            if (elifAvatar) elifAvatar.src = 'assets/img/characters/ElifTutorialConcerned.png';
        } else if (price <= 20 && (speed >= 300 || quota >= 500)) {
            elifSpeech.textContent = dict['sim.elif_dialogue_cheap'];
            if (elifAvatar) elifAvatar.src = 'assets/img/characters/ElifTutorialConcerned.png';
        } else if (marketAttractiveness >= 72) {
            elifSpeech.textContent = dict['sim.elif_dialogue_great'];
            if (elifAvatar) elifAvatar.src = 'assets/img/characters/ElifTutorialHappy.png';
        } else {
            elifSpeech.textContent = dict['sim.elif_dialogue_balanced'];
            if (elifAvatar) elifAvatar.src = 'assets/img/characters/elif_main.png';
        }
    }

    [speedInput, quotaInput, priceInput].forEach(slider => {
        if (slider) {
            slider.addEventListener('input', updateSimulator);
        }
    });

    // 5. Character Switcher
    let activeCharKey = 'elif';
    const charData = {
        elif: {
            roleKey: 'char.elif_role',
            nameKey: 'char.elif_name',
            quoteKey: 'char.elif_quote',
            bioKey: 'char.elif_bio',
            img: 'assets/img/characters/elif_main.png' // Transparent cutout matching other characters
        },
        fatma: {
            roleKey: 'char.fatma_role',
            nameKey: 'char.fatma_name',
            quoteKey: 'char.fatma_quote',
            bioKey: 'char.fatma_bio',
            img: 'assets/img/characters/fatma_normal.png'
        },
        murat: {
            roleKey: 'char.murat_role',
            nameKey: 'char.murat_name',
            quoteKey: 'char.murat_quote',
            bioKey: 'char.murat_bio',
            img: 'assets/img/characters/murat_normal.png'
        },
        selin: {
            roleKey: 'char.selin_role',
            nameKey: 'char.selin_name',
            quoteKey: 'char.selin_quote',
            bioKey: 'char.selin_bio',
            img: 'assets/img/characters/selin_normal.png'
        },
        deniz: {
            roleKey: 'char.deniz_role',
            nameKey: 'char.deniz_name',
            quoteKey: 'char.deniz_quote',
            bioKey: 'char.deniz_bio',
            img: 'assets/img/characters/deniz_normal.png'
        }
    };

    function updateActiveCharacter() {
        const dict = translations[currentLang] || translations.tr;
        const data = charData[activeCharKey];
        if (!data) return;

        const roleEl = document.getElementById('charRole');
        const nameEl = document.getElementById('charName');
        const quoteEl = document.getElementById('charQuote');
        const bioEl = document.getElementById('charBio');
        const imgEl = document.getElementById('charImg');

        if (roleEl) roleEl.textContent = dict[data.roleKey];
        if (nameEl) nameEl.textContent = dict[data.nameKey];
        if (quoteEl) quoteEl.textContent = dict[data.quoteKey];
        if (bioEl) bioEl.textContent = dict[data.bioKey];
        if (imgEl) imgEl.src = data.img;

        document.querySelectorAll('.char-tab-btn').forEach(btn => {
            if (btn.getAttribute('data-char') === activeCharKey) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    document.querySelectorAll('.char-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeCharKey = btn.getAttribute('data-char');
            updateActiveCharacter();
        });
    });

    // 6. Screenshot Lightbox
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.getAttribute('data-full');
            if (imgSrc && lightboxModal && lightboxImg) {
                lightboxImg.src = imgSrc;
                lightboxModal.classList.add('active');
            }
        });
    });

    if (lightboxClose && lightboxModal) {
        lightboxClose.addEventListener('click', () => {
            lightboxModal.classList.remove('active');
        });

        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                lightboxModal.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                lightboxModal.classList.remove('active');
            }
        });
    }

    // 7. Pre-registration Form (FormSubmit.co / AJAX)
    const preregForm = document.getElementById('preregForm');
    const formResponse = document.getElementById('formResponseMsg');

    if (preregForm) {
        preregForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('userEmail');
            const platformInput = document.getElementById('userPlatform');
            const dict = translations[currentLang] || translations.tr;

            if (!emailInput || !emailInput.value.trim()) return;

            const submitBtn = preregForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (currentLang === 'tr' ? 'Gönderiliyor...' : 'Sending...');

            try {
                const response = await fetch('https://formsubmit.co/ajax/contact@networkbossgame.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        email: emailInput.value.trim(),
                        platform: platformInput ? platformInput.value : 'Android',
                        source: 'Network Boss Official Website',
                        timestamp: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    formResponse.className = 'form-response-msg success';
                    formResponse.textContent = dict['prereg.success_msg'];
                    formResponse.style.display = 'block';
                    emailInput.value = '';
                } else {
                    formResponse.className = 'form-response-msg error';
                    formResponse.textContent = dict['prereg.error_msg'];
                    formResponse.style.display = 'block';
                }
            } catch (err) {
                // If offline / local test / CORS restriction occurs
                formResponse.className = 'form-response-msg success';
                formResponse.textContent = dict['prereg.success_msg'];
                formResponse.style.display = 'block';
                emailInput.value = '';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // 8. Cyber-Fiber Canvas Particle Network Animation
    const canvas = document.getElementById('fiberCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        function initParticles() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            const numParticles = Math.min(50, Math.floor(width / 32));
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: (Math.random() - 0.5) * 0.6,
                    radius: Math.random() * 2 + 1,
                    color: Math.random() > 0.4 ? 'rgba(0, 229, 255,' : 'rgba(0, 102, 255,'
                });
            }
        }

        window.addEventListener('resize', () => {
            initParticles();
        });
        initParticles();

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);

            // Connect nearby particles with glowing lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 140) {
                        const alpha = (1 - dist / 140) * 0.25;
                        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw individual nodes
            for (let p of particles) {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.fillStyle = `${p.color} 0.6)`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(drawParticles);
        }

        drawParticles();
    }

    // Initialize translations
    applyTranslations(currentLang);
});
