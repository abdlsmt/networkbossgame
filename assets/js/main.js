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
        updateNocSimulator();
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

    // 4B. Interactive NOC Crisis Simulator
    let activeNocScenario = 'fiber';
    let nocCountdownVal = 28;
    let nocTimerInterval = null;

    const nocScenarios = {
        fiber: {
            id: 'fiber',
            incidentId: 'INCIDENT-ID: #TR-NOC-402',
            tag: 'SECTOR-04: FIBER LINK BROKEN',
            alertKey: 'noc.fiber.alert_level',
            titleKey: 'noc.fiber.title',
            descKey: 'noc.fiber.desc',
            telemetry: {
                sla: '%99.8',
                slaTrendHtml: '<i class="fas fa-arrow-down"></i> -%0.4',
                slaTrendClass: 'trend-down',
                slaFill: '92%',
                stock: '₺42.50',
                stockTrendHtml: '<i class="fas fa-arrow-trend-down"></i> Düşüş Riski',
                stockTrendClass: 'trend-down',
                stockFill: '78%',
                sentiment: '%86',
                sentimentTrendHtml: '<i class="fas fa-face-meh"></i> Gergin',
                sentimentTrendClass: 'trend-warn',
                sentimentFill: '86%',
                subs: '18.500',
                subsTrendHtml: '<i class="fas fa-triangle-exclamation"></i> Kesilme Eşiği',
                subsTrendClass: 'trend-danger',
                subsFill: '95%'
            },
            logs: [
                { time: '14:22:01', class: 'log-critical', key: 'noc.fiber.log1' },
                { time: '14:22:02', class: 'log-warning', key: 'noc.fiber.log2' },
                { time: '14:22:03', class: 'log-alert', key: 'noc.fiber.log3' }
            ],
            choices: [
                {
                    icon: 'fa-route',
                    titleKey: 'noc.fiber.c0_title',
                    descKey: 'noc.fiber.c0_desc',
                    metaClass: 'meta-optimal',
                    metaKey: 'noc.meta_optimal',
                    costKey: 'noc.cost_medium',
                    rankClass: 'rank-master',
                    rankKey: 'noc.rank_master',
                    resTitleKey: 'noc.fiber.c0_res_title',
                    resDescKey: 'noc.fiber.c0_res_desc',
                    deltaSla: '+0.1% (%99.9)',
                    deltaStock: '+₺2.72 (+6.4%)',
                    deltaSent: '+8% (%94)',
                    chirperUser: '@Eren_Gamer',
                    chirperKey: 'noc.fiber.c0_chirper',
                    statusKey: 'noc.status_solved',
                    isSuccess: true
                },
                {
                    icon: 'fa-truck-tower',
                    titleKey: 'noc.fiber.c1_title',
                    descKey: 'noc.fiber.c1_desc',
                    metaClass: 'meta-partial',
                    metaKey: 'noc.meta_partial',
                    costKey: 'noc.cost_low',
                    rankClass: 'rank-partial',
                    rankKey: 'noc.rank_partial',
                    resTitleKey: 'noc.fiber.c1_res_title',
                    resDescKey: 'noc.fiber.c1_res_desc',
                    deltaSla: '-1.2% (%98.6)',
                    deltaStock: '-₺0.80 (-1.9%)',
                    deltaSent: '-15% (%71)',
                    chirperUser: '@KobiPatronu',
                    chirperKey: 'noc.fiber.c1_chirper',
                    statusKey: 'noc.status_critical',
                    isSuccess: false
                },
                {
                    icon: 'fa-clock',
                    titleKey: 'noc.fiber.c2_title',
                    descKey: 'noc.fiber.c2_desc',
                    metaClass: 'meta-risky',
                    metaKey: 'noc.meta_risky',
                    costKey: 'noc.cost_free',
                    rankClass: 'rank-disaster',
                    rankKey: 'noc.rank_disaster',
                    resTitleKey: 'noc.fiber.c2_res_title',
                    resDescKey: 'noc.fiber.c2_res_desc',
                    deltaSla: '-15.4% (%84.4)',
                    deltaStock: '-₺5.95 (-14.0%)',
                    deltaSent: '-42% (%44)',
                    chirperUser: '@SinirliAbone',
                    chirperKey: 'noc.fiber.c2_chirper',
                    statusKey: 'noc.status_failed',
                    isSuccess: false
                }
            ]
        },
        crowd: {
            id: 'crowd',
            incidentId: 'INCIDENT-ID: #TR-NOC-508',
            tag: 'ARENA-GRID: RF CHANNELS SATURATED',
            alertKey: 'noc.crowd.alert_level',
            titleKey: 'noc.crowd.title',
            descKey: 'noc.crowd.desc',
            telemetry: {
                sla: '%99.4',
                slaTrendHtml: '<i class="fas fa-arrow-down"></i> -%0.5',
                slaTrendClass: 'trend-down',
                slaFill: '88%',
                stock: '₺42.50',
                stockTrendHtml: '<i class="fas fa-arrow-right"></i> Sabit',
                stockTrendClass: 'trend-warn',
                stockFill: '78%',
                sentiment: '%79',
                sentimentTrendHtml: '<i class="fas fa-face-frown"></i> Şikayet',
                sentimentTrendClass: 'trend-danger',
                sentimentFill: '79%',
                subs: '50.000',
                subsTrendHtml: '<i class="fas fa-users"></i> Aşırı Yük',
                subsTrendClass: 'trend-danger',
                subsFill: '98%'
            },
            logs: [
                { time: '19:45:10', class: 'log-critical', key: 'noc.crowd.log1' },
                { time: '19:45:12', class: 'log-warning', key: 'noc.crowd.log2' },
                { time: '19:45:14', class: 'log-alert', key: 'noc.crowd.log3' }
            ],
            choices: [
                {
                    icon: 'fa-truck-fast',
                    titleKey: 'noc.crowd.c0_title',
                    descKey: 'noc.crowd.c0_desc',
                    metaClass: 'meta-optimal',
                    metaKey: 'noc.meta_optimal',
                    costKey: 'noc.cost_medium',
                    rankClass: 'rank-master',
                    rankKey: 'noc.rank_master',
                    resTitleKey: 'noc.crowd.c0_res_title',
                    resDescKey: 'noc.crowd.c0_res_desc',
                    deltaSla: '+0.1% (%99.9)',
                    deltaStock: '+₺3.80 (+8.9%)',
                    deltaSent: '+11% (%97)',
                    chirperUser: '@FanatikAmigo',
                    chirperKey: 'noc.crowd.c0_chirper',
                    statusKey: 'noc.status_solved',
                    isSuccess: true
                },
                {
                    icon: 'fa-tower-broadcast',
                    titleKey: 'noc.crowd.c1_title',
                    descKey: 'noc.crowd.c1_desc',
                    metaClass: 'meta-partial',
                    metaKey: 'noc.meta_partial',
                    costKey: 'noc.cost_low',
                    rankClass: 'rank-partial',
                    rankKey: 'noc.rank_partial',
                    resTitleKey: 'noc.crowd.c1_res_title',
                    resDescKey: 'noc.crowd.c1_res_desc',
                    deltaSla: '-0.8% (%99.0)',
                    deltaStock: '₺42.50 (Sabit)',
                    deltaSent: '-8% (%78)',
                    chirperUser: '@MahalleSakin',
                    chirperKey: 'noc.crowd.c1_chirper',
                    statusKey: 'noc.status_critical',
                    isSuccess: false
                },
                {
                    icon: 'fa-clock-rotate-left',
                    titleKey: 'noc.crowd.c2_title',
                    descKey: 'noc.crowd.c2_desc',
                    metaClass: 'meta-risky',
                    metaKey: 'noc.meta_risky',
                    costKey: 'noc.cost_free',
                    rankClass: 'rank-disaster',
                    rankKey: 'noc.rank_disaster',
                    resTitleKey: 'noc.crowd.c2_res_title',
                    resDescKey: 'noc.crowd.c2_res_desc',
                    deltaSla: '-9.5% (%90.3)',
                    deltaStock: '-₺4.50 (-10.6%)',
                    deltaSent: '-35% (%51)',
                    chirperUser: '@SporMuhabiri',
                    chirperKey: 'noc.crowd.c2_chirper',
                    statusKey: 'noc.status_failed',
                    isSuccess: false
                }
            ]
        },
        blackout: {
            id: 'blackout',
            incidentId: 'INCIDENT-ID: #TR-NOC-619',
            tag: 'POWER-GRID: 0V MAINS / UPS DISCHARGE',
            alertKey: 'noc.blackout.alert_level',
            titleKey: 'noc.blackout.title',
            descKey: 'noc.blackout.desc',
            telemetry: {
                sla: '%99.1',
                slaTrendHtml: '<i class="fas fa-arrow-down"></i> -%0.8',
                slaTrendClass: 'trend-danger',
                slaFill: '82%',
                stock: '₺42.50',
                stockTrendHtml: '<i class="fas fa-arrow-down"></i> Risk',
                stockTrendClass: 'trend-down',
                stockFill: '78%',
                sentiment: '%74',
                sentimentTrendHtml: '<i class="fas fa-face-grimace"></i> Panik',
                sentimentTrendClass: 'trend-danger',
                sentimentFill: '74%',
                subs: '32.000',
                subsTrendHtml: '<i class="fas fa-bolt"></i> Kesik',
                subsTrendClass: 'trend-danger',
                subsFill: '96%'
            },
            logs: [
                { time: '21:10:02', class: 'log-critical', key: 'noc.blackout.log1' },
                { time: '21:10:04', class: 'log-warning', key: 'noc.blackout.log2' },
                { time: '21:10:06', class: 'log-alert', key: 'noc.blackout.log3' }
            ],
            choices: [
                {
                    icon: 'fa-gas-pump',
                    titleKey: 'noc.blackout.c0_title',
                    descKey: 'noc.blackout.c0_desc',
                    metaClass: 'meta-optimal',
                    metaKey: 'noc.meta_optimal',
                    costKey: 'noc.cost_medium',
                    rankClass: 'rank-master',
                    rankKey: 'noc.rank_master',
                    resTitleKey: 'noc.blackout.c0_res_title',
                    resDescKey: 'noc.blackout.c0_res_desc',
                    deltaSla: '+0.1% (%99.9)',
                    deltaStock: '+₺4.20 (+9.8%)',
                    deltaSent: '+13% (%99)',
                    chirperUser: '@BelediyeBaskani',
                    chirperKey: 'noc.blackout.c0_chirper',
                    statusKey: 'noc.status_solved',
                    isSuccess: true
                },
                {
                    icon: 'fa-hospital',
                    titleKey: 'noc.blackout.c1_title',
                    descKey: 'noc.blackout.c1_desc',
                    metaClass: 'meta-partial',
                    metaKey: 'noc.meta_partial',
                    costKey: 'noc.cost_low',
                    rankClass: 'rank-partial',
                    rankKey: 'noc.rank_partial',
                    resTitleKey: 'noc.blackout.c1_res_title',
                    resDescKey: 'noc.blackout.c1_res_desc',
                    deltaSla: '-2.4% (%97.4)',
                    deltaStock: '+₺0.50 (+1.2%)',
                    deltaSent: '-10% (%76)',
                    chirperUser: '@HemsireAyse',
                    chirperKey: 'noc.blackout.c1_chirper',
                    statusKey: 'noc.status_critical',
                    isSuccess: false
                },
                {
                    icon: 'fa-hourglass-half',
                    titleKey: 'noc.blackout.c2_title',
                    descKey: 'noc.blackout.c2_desc',
                    metaClass: 'meta-risky',
                    metaKey: 'noc.meta_risky',
                    costKey: 'noc.cost_free',
                    rankClass: 'rank-disaster',
                    rankKey: 'noc.rank_disaster',
                    resTitleKey: 'noc.blackout.c2_res_title',
                    resDescKey: 'noc.blackout.c2_res_desc',
                    deltaSla: '-22.0% (%77.8)',
                    deltaStock: '-₺7.50 (-17.6%)',
                    deltaSent: '-48% (%38)',
                    chirperUser: '@HaberTurk',
                    chirperKey: 'noc.blackout.c2_chirper',
                    statusKey: 'noc.status_failed',
                    isSuccess: false
                }
            ]
        },
        cyber: {
            id: 'cyber',
            incidentId: 'INCIDENT-ID: #TR-NOC-777',
            tag: 'FIREWALL: 412 Gbps SYN FLOOD ATTACK',
            alertKey: 'noc.cyber.alert_level',
            titleKey: 'noc.cyber.title',
            descKey: 'noc.cyber.desc',
            telemetry: {
                sla: '%98.5',
                slaTrendHtml: '<i class="fas fa-arrow-down"></i> -%1.4',
                slaTrendClass: 'trend-danger',
                slaFill: '76%',
                stock: '₺42.50',
                stockTrendHtml: '<i class="fas fa-arrow-down"></i> Soygun Riski',
                stockTrendClass: 'trend-danger',
                stockFill: '75%',
                sentiment: '%72',
                sentimentTrendHtml: '<i class="fas fa-shield-halved"></i> Güvensiz',
                sentimentTrendClass: 'trend-warn',
                sentimentFill: '72%',
                subs: '45.000',
                subsTrendHtml: '<i class="fas fa-skull"></i> Veri Riski',
                subsTrendClass: 'trend-danger',
                subsFill: '94%'
            },
            logs: [
                { time: '03:14:22', class: 'log-critical', key: 'noc.cyber.log1' },
                { time: '03:14:23', class: 'log-warning', key: 'noc.cyber.log2' },
                { time: '03:14:25', class: 'log-alert', key: 'noc.cyber.log3' }
            ],
            choices: [
                {
                    icon: 'fa-shield-halved',
                    titleKey: 'noc.cyber.c0_title',
                    descKey: 'noc.cyber.c0_desc',
                    metaClass: 'meta-optimal',
                    metaKey: 'noc.meta_optimal',
                    costKey: 'noc.cost_medium',
                    rankClass: 'rank-master',
                    rankKey: 'noc.rank_master',
                    resTitleKey: 'noc.cyber.c0_res_title',
                    resDescKey: 'noc.cyber.c0_res_desc',
                    deltaSla: '+0.1% (%99.9)',
                    deltaStock: '+₺3.10 (+7.3%)',
                    deltaSent: '+9% (%95)',
                    chirperUser: '@CyberSecAnalyst',
                    chirperKey: 'noc.cyber.c0_chirper',
                    statusKey: 'noc.status_solved',
                    isSuccess: true
                },
                {
                    icon: 'fa-earth-americas',
                    titleKey: 'noc.cyber.c1_title',
                    descKey: 'noc.cyber.c1_desc',
                    metaClass: 'meta-partial',
                    metaKey: 'noc.meta_partial',
                    costKey: 'noc.cost_low',
                    rankClass: 'rank-partial',
                    rankKey: 'noc.rank_partial',
                    resTitleKey: 'noc.cyber.c1_res_title',
                    resDescKey: 'noc.cyber.c1_res_desc',
                    deltaSla: '-3.5% (%96.3)',
                    deltaStock: '-₺1.20 (-2.8%)',
                    deltaSent: '-18% (%68)',
                    chirperUser: '@OyuncuMehmet',
                    chirperKey: 'noc.cyber.c1_chirper',
                    statusKey: 'noc.status_critical',
                    isSuccess: false
                },
                {
                    icon: 'fa-power-off',
                    titleKey: 'noc.cyber.c2_title',
                    descKey: 'noc.cyber.c2_desc',
                    metaClass: 'meta-risky',
                    metaKey: 'noc.meta_risky',
                    costKey: 'noc.cost_free',
                    rankClass: 'rank-disaster',
                    rankKey: 'noc.rank_disaster',
                    resTitleKey: 'noc.cyber.c2_res_title',
                    resDescKey: 'noc.cyber.c2_res_desc',
                    deltaSla: '-18.0% (%81.8)',
                    deltaStock: '-₺6.80 (-16.0%)',
                    deltaSent: '-45% (%41)',
                    chirperUser: '@TechGundem',
                    chirperKey: 'noc.cyber.c2_chirper',
                    statusKey: 'noc.status_failed',
                    isSuccess: false
                }
            ]
        }
    };

    function startNocTimer() {
        if (nocTimerInterval) clearInterval(nocTimerInterval);
        nocCountdownVal = 28;
        const countdownEl = document.getElementById('nocCountdown');
        if (countdownEl) {
            countdownEl.textContent = `00:${nocCountdownVal < 10 ? '0' : ''}${nocCountdownVal}`;
        }
        nocTimerInterval = setInterval(() => {
            if (nocCountdownVal > 0) {
                nocCountdownVal--;
                if (countdownEl) {
                    countdownEl.textContent = `00:${nocCountdownVal < 10 ? '0' : ''}${nocCountdownVal}`;
                }
            } else {
                clearInterval(nocTimerInterval);
            }
        }, 1000);
    }

    function updateNocSimulator() {
        const scenario = nocScenarios[activeNocScenario];
        if (!scenario) return;

        const dict = translations[currentLang] || translations.tr;

        // 1. Incident Header & Brief
        const incidentIdEl = document.getElementById('nocIncidentId');
        const alertLevelEl = document.getElementById('nocAlertLevel');
        const eventTitleEl = document.getElementById('nocEventTitle');
        const eventDescEl = document.getElementById('nocEventDesc');
        const radarTagEl = document.getElementById('radarTag');

        if (incidentIdEl) incidentIdEl.textContent = scenario.incidentId;
        if (alertLevelEl) alertLevelEl.textContent = dict[scenario.alertKey] || '';
        if (eventTitleEl) eventTitleEl.textContent = dict[scenario.titleKey] || '';
        if (eventDescEl) eventDescEl.textContent = dict[scenario.descKey] || '';
        if (radarTagEl) radarTagEl.textContent = scenario.tag;

        // 2. Telemetry HUD
        const slaVal = document.getElementById('nocSlaVal');
        const slaTrend = document.getElementById('nocSlaTrend');
        const slaBar = document.getElementById('nocSlaBar');

        const stockVal = document.getElementById('nocStockVal');
        const stockTrend = document.getElementById('nocStockTrend');
        const stockBar = document.getElementById('nocStockBar');

        const sentimentVal = document.getElementById('nocSentimentVal');
        const sentimentTrend = document.getElementById('nocSentimentTrend');
        const sentimentBar = document.getElementById('nocSentimentBar');

        const subsVal = document.getElementById('nocSubsVal');
        const subsTrend = document.getElementById('nocSubsTrend');
        const subsBar = document.getElementById('nocSubsBar');

        if (slaVal) slaVal.textContent = scenario.telemetry.sla;
        if (slaTrend) {
            slaTrend.className = `telemetry-trend ${scenario.telemetry.slaTrendClass}`;
            slaTrend.innerHTML = scenario.telemetry.slaTrendHtml;
        }
        if (slaBar) slaBar.style.width = scenario.telemetry.slaFill;

        if (stockVal) stockVal.textContent = scenario.telemetry.stock;
        if (stockTrend) {
            stockTrend.className = `telemetry-trend ${scenario.telemetry.stockTrendClass}`;
            stockTrend.innerHTML = scenario.telemetry.stockTrendHtml;
        }
        if (stockBar) stockBar.style.width = scenario.telemetry.stockFill;

        if (sentimentVal) sentimentVal.textContent = scenario.telemetry.sentiment;
        if (sentimentTrend) {
            sentimentTrend.className = `telemetry-trend ${scenario.telemetry.sentimentTrendClass}`;
            sentimentTrend.innerHTML = scenario.telemetry.sentimentTrendHtml;
        }
        if (sentimentBar) sentimentBar.style.width = scenario.telemetry.sentimentFill;

        if (subsVal) subsVal.textContent = scenario.telemetry.subs;
        if (subsTrend) {
            subsTrend.className = `telemetry-trend ${scenario.telemetry.subsTrendClass}`;
            subsTrend.innerHTML = scenario.telemetry.subsTrendHtml;
        }
        if (subsBar) subsBar.style.width = scenario.telemetry.subsFill;

        // 3. Log Stream
        const logStream = document.getElementById('nocLogStream');
        if (logStream) {
            logStream.innerHTML = '';
            scenario.logs.forEach(log => {
                const entry = document.createElement('div');
                entry.className = `log-entry ${log.class}`;
                entry.innerHTML = `<span class="log-time">[${log.time}]</span> ${dict[log.key] || ''}`;
                logStream.appendChild(entry);
            });
        }

        // 4. Action Cards
        const actionsList = document.getElementById('nocActionsList');
        if (actionsList) {
            actionsList.innerHTML = '';
            scenario.choices.forEach((choice, idx) => {
                const card = document.createElement('div');
                card.className = 'action-card';
                card.dataset.choice = idx;
                card.innerHTML = `
                    <div class="action-card-icon"><i class="fas ${choice.icon}"></i></div>
                    <div class="action-card-body">
                        <div class="action-card-title">${dict[choice.titleKey] || ''}</div>
                        <div class="action-card-desc">${dict[choice.descKey] || ''}</div>
                        <div class="action-card-meta">
                            <span class="meta-badge ${choice.metaClass}">${dict[choice.metaKey] || ''}</span>
                            <span class="meta-cost">${dict[choice.costKey] || ''}</span>
                        </div>
                    </div>
                `;
                card.addEventListener('click', () => handleNocChoice(idx));
                actionsList.appendChild(card);
            });
        }
    }

    function handleNocChoice(choiceIndex) {
        const scenario = nocScenarios[activeNocScenario];
        if (!scenario || !scenario.choices[choiceIndex]) return;
        const choice = scenario.choices[choiceIndex];
        const dict = translations[currentLang] || translations.tr;

        if (nocTimerInterval) clearInterval(nocTimerInterval);

        // Update Overlay contents
        const overlay = document.getElementById('nocResultOverlay');
        const badge = document.getElementById('resultRankBadge');
        const title = document.getElementById('resultTitle');
        const desc = document.getElementById('resultDesc');
        const deltaSla = document.getElementById('resDeltaSla');
        const deltaStock = document.getElementById('resDeltaStock');
        const deltaSent = document.getElementById('resDeltaSent');
        const chirperName = document.getElementById('resChirperName');
        const chirperText = document.getElementById('resChirperText');

        if (badge) {
            badge.className = `result-rank-badge ${choice.rankClass}`;
            badge.textContent = dict[choice.rankKey] || '';
        }
        if (title) title.textContent = dict[choice.resTitleKey] || '';
        if (desc) desc.textContent = dict[choice.resDescKey] || '';
        if (deltaSla) deltaSla.textContent = choice.deltaSla;
        if (deltaStock) deltaStock.textContent = choice.deltaStock;
        if (deltaSent) deltaSent.textContent = choice.deltaSent;
        if (chirperName) chirperName.textContent = choice.chirperUser;
        if (chirperText) chirperText.textContent = dict[choice.chirperKey] || '';

        // Status bar update
        const statusText = document.getElementById('nocStatusText');
        const led = document.getElementById('nocLed');
        if (statusText) statusText.textContent = dict[choice.statusKey] || '';
        if (led) {
            led.className = `noc-led-indicator ${choice.isSuccess ? 'pulse-success' : 'pulse-danger'}`;
        }

        if (overlay) {
            overlay.classList.add('active');
        }
    }

    function resetNocOverlay() {
        const overlay = document.getElementById('nocResultOverlay');
        if (overlay) overlay.classList.remove('active');
        startNocTimer();
        const dict = translations[currentLang] || translations.tr;
        const statusText = document.getElementById('nocStatusText');
        const led = document.getElementById('nocLed');
        if (statusText) statusText.textContent = dict['noc.status_critical'];
        if (led) led.className = 'noc-led-indicator pulse-danger';
    }

    // Tab buttons event listener
    const nocTabButtons = document.querySelectorAll('.noc-tab-btn');
    nocTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sc = btn.dataset.scenario;
            if (!sc || sc === activeNocScenario) return;

            nocTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeNocScenario = sc;
            resetNocOverlay();
            updateNocSimulator();
        });
    });

    const nocRetryBtn = document.getElementById('nocRetryBtn');
    if (nocRetryBtn) {
        nocRetryBtn.addEventListener('click', resetNocOverlay);
    }

    // Start timer & simulator initially
    updateNocSimulator();
    startNocTimer();

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
