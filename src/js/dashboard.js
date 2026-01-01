/**
 * ============================================================================
 * DASHBOARD.JS - 2026 Resolution Dashboard Controller
 * ============================================================================
 * 
 * Main controller for the 2026 resolution dashboard. Handles all goal tracking,
 * score calculation, state persistence, and UI updates.
 * 
 * Dependencies:
 * - ResolutionApp (app.js) - Core utilities
 * - Chart.js - For financial chart
 * 
 * @author Williams
 * @version 2.0.0
 * @since 2026
 */

'use strict';

/**
 * Dashboard Controller Module
 */
const Dashboard = (function() {

    /**
     * ========================================================================
     * PRIVATE STATE
     * ========================================================================
     */
    
    /** State for manual counters */
    let counters = {
        img: 0,  // Image/outfit counter
        pizzaSessions: 0,  // Pizza Lab sessions counter
        nexusfiProgress: 0  // NexusFi frontend progress percentage
    };

    /** Chart.js instance for finance chart */
    let financeChartInstance = null;

    /** Storage key for dashboard state */
    const STORAGE_KEY = 'williams2026State';

    /** Financial constants */
    const FINANCE = {
        BASE_BALANCE: 80873,
        TARGET_BALANCE: 170000
    };

    /** LoL rank names */
    const LOL_RANKS = [
        'Sin clasificar',
        'Esmeralda IV',
        'Esmeralda III', 
        'Esmeralda II',
        'Esmeralda I',
        'Diamante IV',
        'Diamante III',
        'Diamante II',
        'Diamante I'
    ];

    /**
     * ========================================================================
     * DOM ELEMENT CACHE
     * ========================================================================
     */
    
    const elements = {};

    /**
     * Cache frequently accessed DOM elements
     */
    function cacheElements() {
        // Score displays
        elements.scoreBig = document.getElementById('score-big');
        elements.headerScore = document.getElementById('header-score');
        elements.headerScoreMobile = document.getElementById('header-score-mobile');
        elements.mobileScore = document.getElementById('mobile-score');
        
        // Score breakdown
        elements.ptsOro = document.getElementById('pts-oro');
        elements.ptsPlata = document.getElementById('pts-plata');
        elements.ptsBronce = document.getElementById('pts-bronze');
        elements.ptsExtra = document.getElementById('pts-extra');
        
        // Grade and reward
        elements.gradeBadge = document.getElementById('grade-badge');
        elements.rewardText = document.getElementById('reward-text');
        
        // Finance chart
        elements.financeChart = document.getElementById('financeChart');
        
        // Mobile menu
        elements.mobileMenu = document.getElementById('mobileMenu');
        elements.menuOverlay = document.getElementById('menuOverlay');
        
        // File input for import
        elements.importFile = document.getElementById('import-file');
    }

    /**
     * ========================================================================
     * STATE MANAGEMENT
     * ========================================================================
     */
    
    /**
     * Save current state to localStorage
     */
    function saveState() {
        const state = {
            counters: counters,
            checkboxes: {},
            radios: {},
            ranges: {},
            numbers: {},
            timestamp: new Date().toISOString(),
            version: ResolutionApp.VERSION
        };

        // Collect all input states
        document.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            if (chk.id) state.checkboxes[chk.id] = chk.checked;
        });

        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            if (radio.name && radio.checked) {
                state.radios[radio.name] = radio.value;
            }
        });

        document.querySelectorAll('input[type="range"]').forEach(rng => {
            if (rng.id) state.ranges[rng.id] = rng.value;
        });

        document.querySelectorAll('input[type="number"]').forEach(num => {
            if (num.id) state.numbers[num.id] = num.value;
        });

        ResolutionApp.storage.set(STORAGE_KEY, state);
    }

    /**
     * Load state from localStorage
     */
    function loadState() {
        const state = ResolutionApp.storage.get(STORAGE_KEY);
        if (!state) return;

        try {
            // Restore counters
            if (state.counters) {
                counters = state.counters;
                Object.keys(counters).forEach(key => {
                    const el = document.getElementById(`count-${key}`);
                    if (el) el.innerText = counters[key];
                });
            }

            // Restore checkboxes
            if (state.checkboxes) {
                Object.keys(state.checkboxes).forEach(id => {
                    const chk = document.getElementById(id);
                    if (chk) chk.checked = state.checkboxes[id];
                });
            }

            // Restore radio buttons
            if (state.radios) {
                Object.keys(state.radios).forEach(name => {
                    const radio = document.querySelector(
                        `input[name="${name}"][value="${state.radios[name]}"]`
                    );
                    if (radio) radio.checked = true;
                });
            }

            // Restore range sliders
            if (state.ranges) {
                Object.keys(state.ranges).forEach(id => {
                    const rng = document.getElementById(id);
                    if (rng) rng.value = state.ranges[id];
                });
            }

            // Restore number inputs
            if (state.numbers) {
                Object.keys(state.numbers).forEach(id => {
                    const num = document.getElementById(id);
                    if (num) num.value = state.numbers[id];
                });
            }
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    }

    /**
     * ========================================================================
     * EXPORT / IMPORT
     * ========================================================================
     */
    
    /**
     * Export progress to JSON file
     */
    function exportProgress() {
        const state = {
            counters: counters,
            checkboxes: {},
            radios: {},
            ranges: {},
            numbers: {},
            exportDate: new Date().toISOString(),
            version: ResolutionApp.VERSION
        };

        // Collect all states
        document.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            if (chk.id) state.checkboxes[chk.id] = chk.checked;
        });
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            if (radio.name && radio.checked) state.radios[radio.name] = radio.value;
        });
        document.querySelectorAll('input[type="range"]').forEach(rng => {
            if (rng.id) state.ranges[rng.id] = rng.value;
        });
        document.querySelectorAll('input[type="number"]').forEach(num => {
            if (num.id) state.numbers[num.id] = num.value;
        });

        // Create and download file
        const dataStr = JSON.stringify(state, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = `williams2026-backup-${ResolutionApp.date.getISODate()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        ResolutionApp.notifications.success('Progreso exportado correctamente');
    }

    /**
     * Import progress from JSON file
     * @param {Event} event - File input change event
     */
    function importProgress(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const state = JSON.parse(e.target.result);
                
                // Restore counters
                if (state.counters) {
                    counters = state.counters;
                    Object.keys(counters).forEach(key => {
                        const el = document.getElementById(`count-${key}`);
                        if (el) el.innerText = counters[key];
                    });
                }

                // Restore all inputs
                if (state.checkboxes) {
                    Object.keys(state.checkboxes).forEach(id => {
                        const chk = document.getElementById(id);
                        if (chk) chk.checked = state.checkboxes[id];
                    });
                }

                if (state.radios) {
                    Object.keys(state.radios).forEach(name => {
                        const radio = document.querySelector(
                            `input[name="${name}"][value="${state.radios[name]}"]`
                        );
                        if (radio) radio.checked = true;
                    });
                }

                if (state.ranges) {
                    Object.keys(state.ranges).forEach(id => {
                        const rng = document.getElementById(id);
                        if (rng) rng.value = state.ranges[id];
                    });
                }

                if (state.numbers) {
                    Object.keys(state.numbers).forEach(id => {
                        const num = document.getElementById(id);
                        if (num) num.value = state.numbers[id];
                    });
                }

                saveState();
                calculateScore();
                ResolutionApp.notifications.success('Progreso importado correctamente');
                
            } catch (err) {
                ResolutionApp.notifications.error('Error al importar: archivo inválido');
                console.error('Import error:', err);
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }

    /**
     * Reset all progress
     */
    function resetProgress() {
        const confirmed = confirm(
            '⚠️ ¿Reiniciar TODO el progreso?\n\n' +
            'Esta acción no se puede deshacer. ' +
            'Considerar exportar el progreso antes de continuar.'
        );
        
        if (!confirmed) return;

        // Reset counters
        counters = { img: 0, pizzaSessions: 0, nexusfiProgress: 0 };
        Object.keys(counters).forEach(key => {
            const el = document.getElementById(`count-${key}`);
            if (el) el.innerText = 0;
        });
        
        // Reset pizza sessions display
        updateDisplay('pizza-sessions-display', '0');
        updateDisplay('val-pizza-sessions-curr', '0');
        const pizzaFill = document.getElementById('pizza-progress-fill');
        if (pizzaFill) pizzaFill.style.width = '0%';
        
        // Reset NexusFi progress display
        updateDisplay('nexusfi-progress-display', '0%');
        updateDisplay('val-nexusfi-progress-curr', '0');
        const nexusfiFill = document.getElementById('nexusfi-progress-fill');
        if (nexusfiFill) nexusfiFill.style.width = '0%';

        // Uncheck all checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            chk.checked = false;
        });

        // Reset radio buttons to default
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = radio.value === '0';
        });

        // Reset range sliders
        document.querySelectorAll('input[type="range"]').forEach(rng => {
            rng.value = rng.id === 'rng-finance' ? FINANCE.BASE_BALANCE : (rng.min || 0);
        });

        // Reset number inputs
        document.querySelectorAll('input[type="number"]').forEach(num => {
            num.value = 0;
        });

        // Clear localStorage
        ResolutionApp.storage.remove(STORAGE_KEY);
        
        // Recalculate
        calculateScore();
        
        ResolutionApp.notifications.success('Progreso reiniciado correctamente');
    }

    /**
     * ========================================================================
     * COUNTER MANAGEMENT
     * ========================================================================
     */
    
    /**
     * Update manual counter (for +/- buttons)
     * @param {string} key - Counter key
     * @param {number} change - Amount to change (+1 or -1)
     */
    function updateCounter(key, change) {
        counters[key] = Math.max(0, counters[key] + change);
        document.getElementById(`count-${key}`).innerText = counters[key];
        
        // Update image goal display
        if (key === 'img') {
            const basePts = Math.min(6, counters[key] * 1.5);
            let totalPts = basePts;
            if (counters[key] > 4) {
                totalPts += (counters[key] - 4);
            }
            document.getElementById('val-img-pts').innerText = totalPts + ' pts';
        }
        
        calculateScore();
        saveState();
    }

    /**
     * Update Pizza Lab sessions counter
     * @param {number} change - Amount to change (+1 or -1)
     */
    function updatePizzaSessions(change) {
        const newValue = Math.max(0, Math.min(24, counters.pizzaSessions + change));
        counters.pizzaSessions = newValue;
        
        // Update display
        updateDisplay('pizza-sessions-display', newValue);
        updateDisplay('val-pizza-sessions-curr', newValue);
        
        // Update progress bar
        const progressPercent = (newValue / 24) * 100;
        const progressFill = document.getElementById('pizza-progress-fill');
        if (progressFill) {
            progressFill.style.width = progressPercent + '%';
        }
        
        // Update points
        const sessionPts = newValue * 0.25;
        updateDisplay('val-pizza-sessions-pts', sessionPts.toFixed(2) + ' pts');
        
        // Recalculate total pizza points
        const ovenChecked = document.getElementById('chk-pizza-oven')?.checked || false;
        const ovenPts = ovenChecked ? 4 : 0;
        const totalPizzaPts = ovenPts + sessionPts;
        updateDisplay('val-pizza-total-pts', totalPizzaPts.toFixed(2) + ' pts');
        
        calculateScore();
        saveState();
    }

    /**
     * Update NexusFi frontend progress
     * @param {number} change - Amount to change (+10 or -10)
     */
    function updateNexusFiProgress(change) {
        const newValue = Math.max(0, Math.min(100, counters.nexusfiProgress + change));
        counters.nexusfiProgress = newValue;
        
        // Update display
        updateDisplay('nexusfi-progress-display', newValue + '%');
        updateDisplay('val-nexusfi-progress-curr', newValue);
        
        // Update progress bar
        const progressFill = document.getElementById('nexusfi-progress-fill');
        if (progressFill) {
            progressFill.style.width = newValue + '%';
        }
        
        // Update points
        const frontendPts = newValue * 0.06;
        updateDisplay('val-nexusfi-frontend-pts', frontendPts.toFixed(2) + ' pts');
        
        // Recalculate total NexusFi points
        const deployChecked = document.getElementById('chk-nexusfi-deploy')?.checked || false;
        const deployPts = deployChecked ? 4 : 0;
        const totalNexusFiPts = frontendPts + deployPts;
        updateDisplay('val-nexusfi-total-pts', totalNexusFiPts.toFixed(2) + ' pts');
        
        calculateScore();
        saveState();
    }

    /**
     * ========================================================================
     * SCORE CALCULATION
     * ========================================================================
     */
    
    /**
     * Main score calculation function
     * Calculates all goals and updates the UI
     */
    function calculateScore() {
        let oro = 0, plata = 0, bronce = 0, extra = 0;

        // ===== ORO CALCULATIONS =====
        
        // 1. English - GoFluent
        const gofluentHours = parseInt(document.getElementById('rng-gofluent').value) || 0;
        const gofluentPts = (gofluentHours / 50) * 5;
        updateDisplay('val-gofluent-pts', gofluentPts.toFixed(1) + ' pts');
        updateDisplay('val-gofluent-curr', gofluentHours);
        oro += gofluentPts;
        
        // English Certification
        const engCert = document.querySelector('input[name="english-cert"]:checked');
        if (engCert) oro += parseInt(engCert.value);

        // 2. Spark Certification
        const sparkCert = document.querySelector('input[name="spark-cert"]:checked');
        if (sparkCert) oro += parseInt(sparkCert.value);

        // 3. Finance - Savings Habit
        const savingsMonths = parseInt(document.getElementById('rng-savings-habit').value) || 0;
        const savingsHabitPts = (savingsMonths / 12) * 10;
        updateDisplay('val-savings-habit-pts', savingsHabitPts.toFixed(1) + ' pts');
        updateDisplay('val-savings-habit-curr', savingsMonths);
        oro += savingsHabitPts;
        
        // Finance - Balance Growth
        const currentBalance = parseInt(document.getElementById('rng-finance').value) || FINANCE.BASE_BALANCE;
        let financeGoalPts = 0;
        if (currentBalance > FINANCE.BASE_BALANCE) {
            const progress = (currentBalance - FINANCE.BASE_BALANCE) / 
                           (FINANCE.TARGET_BALANCE - FINANCE.BASE_BALANCE);
            financeGoalPts = ResolutionApp.clamp(progress, 0, 1) * 5;
        }
        updateDisplay('val-finance-pts', financeGoalPts.toFixed(1) + ' pts');
        updateDisplay('val-finance-curr', ResolutionApp.formatCurrency(currentBalance));
        oro += financeGoalPts;
        updateFinanceChart(currentBalance);

        // 4. Health - Gym
        const gymVisits = parseInt(document.getElementById('rng-gym').value) || 0;
        const gymPts = Math.min(5, (gymVisits / 100) * 5);
        updateDisplay('val-gym-pts', gymPts.toFixed(1) + ' pts');
        updateDisplay('val-gym-curr', gymVisits);
        oro += gymPts;
        
        // Health - Nutrition
        const deliveries = parseInt(document.getElementById('rng-delivery').value) || 0;
        const targetDeliveries = 24;
        let nutritionPts = 5;
        
        if (deliveries <= targetDeliveries) {
            updateDisplay('val-delivery-status', '✓ En meta');
            setClassName('val-delivery-status', 'font-semibold text-emerald-600');
        } else {
            const over = deliveries - targetDeliveries;
            nutritionPts = Math.max(0, 5 - (over * 0.25));
            updateDisplay('val-delivery-status', '⚠️ +' + over + ' sobre meta');
            setClassName('val-delivery-status', 'font-semibold text-orange-600');
        }
        updateDisplay('val-delivery-pts', nutritionPts.toFixed(1) + ' pts');
        updateDisplay('val-delivery-curr', deliveries);
        oro += nutritionPts;

        // ===== PLATA CALCULATIONS =====
        
        // 5. Work (10 pts)
        const workCompleted = document.getElementById('chk-work')?.checked || false;
        const workPts = workCompleted ? 10 : 0;
        updateDisplay('val-work-pts', workPts + ' pts');
        plata += workPts;

        // 6. Family - Transfers (4 pts) + Meetings (4 pts) = 8 pts total
        const transfers = parseInt(document.getElementById('rng-transfers').value) || 0;
        const transfersPts = (transfers / 12) * 4;
        updateDisplay('val-transfers-pts', transfersPts.toFixed(1) + ' pts');
        updateDisplay('val-transfers-curr', transfers);
        plata += transfersPts;
        
        // Family - Meetings
        const familyMeets = parseInt(document.getElementById('rng-family').value) || 0;
        const familyPts = (familyMeets / 12) * 4;
        updateDisplay('val-family-pts', familyPts.toFixed(1) + ' pts');
        updateDisplay('val-family-curr', familyMeets);
        plata += familyPts;

        // 7. Image (slider)
        const imageSets = Math.max(0, parseInt(document.getElementById('rng-img')?.value) || 0);
        const imagePts = Math.min(6, imageSets * 1.5);
        let imageTotalPts = imagePts;
        plata += imagePts;
        if (imageSets > 4) {
            const imageExtra = imageSets - 4;
            extra += imageExtra;
            imageTotalPts += imageExtra;
        }
        updateDisplay('val-img-pts', imageTotalPts.toFixed(1) + ' pts');
        updateDisplay('val-img-curr', imageSets);
        
        // 8. Space - Savings
        const spaceSavings = parseInt(document.getElementById('rng-space-savings').value) || 0;
        const spaceSavingsPts = (spaceSavings / 12) * 2;
        updateDisplay('val-space-savings-pts', spaceSavingsPts.toFixed(1) + ' pts');
        updateDisplay('val-space-savings-curr', spaceSavings);
        plata += spaceSavingsPts;
        
        // Space - Furniture
        const furniture = parseInt(document.getElementById('rng-furniture').value) || 0;
        let furniturePts = 0;
        let furnitureTotal = 0;
        if (furniture >= 1) {
            furniturePts = 3;
            furnitureTotal = 3;
            if (furniture > 1) {
                const extraFurniture = furniture - 1;
                extra += extraFurniture;
                furnitureTotal += extraFurniture;
            }
        }
        updateDisplay('val-furniture-pts', furnitureTotal.toFixed(1) + ' pts');
        updateDisplay('val-furniture-curr', furniture);
        plata += furniturePts;

        // ===== BRONCE & EXTRAS =====
        
        // 9. Games - 4 pts base (2 games = 4 pts)
        const games = Math.max(0, parseInt(document.getElementById('rng-games')?.value) || 0);
        let gamesPts = 0;
        if (games >= 1) { bronce += 2; gamesPts += 2; }
        if (games >= 2) { bronce += 2; gamesPts += 2; }
        if (games > 2) {
            const extraGamesPts = (games - 2) * 1.5;
            extra += extraGamesPts;
            gamesPts += extraGamesPts;
        }
        updateDisplay('val-games-pts', gamesPts.toFixed(1) + ' pts');
        updateDisplay('val-games-curr', games);

        // 10. Entretenimiento (Anime, Manga & Más) - 4 pts base
        // Frieren manga (6 vols = 1.33pt)
        const frieren = Math.max(0, parseInt(document.getElementById('rng-frieren')?.value) || 0);
        const frierenPts = frieren >= 6 ? 1.33 : (frieren / 6) * 1.33;
        bronce += frierenPts;
        updateDisplay('val-frieren-curr', frieren);
        updateDisplay('val-frieren-pts', frierenPts.toFixed(2) + ' pts');
        
        // Berserk manga (5 vols = 1.33pt)
        const berserk = Math.max(0, parseInt(document.getElementById('rng-berserk')?.value) || 0);
        const berserkPts = berserk >= 5 ? 1.33 : (berserk / 5) * 1.33;
        bronce += berserkPts;
        updateDisplay('val-berserk-curr', berserk);
        updateDisplay('val-berserk-pts', berserkPts.toFixed(2) + ' pts');
        
        // Anime/series/películas (4 = 1.34pt)
        const anime = Math.max(0, parseInt(document.getElementById('rng-anime')?.value) || 0);
        const animePts = anime >= 4 ? 1.34 : (anime / 4) * 1.34;
        bronce += animePts;
        updateDisplay('val-anime-curr', anime);
        updateDisplay('val-anime-pts', animePts.toFixed(2) + ' pts');
        
        // Extras
        const extraAnime = Math.max(0, parseInt(document.getElementById('rng-anime-extra')?.value) || 0);
        const extraAnimePts = extraAnime;
        if (extraAnime > 0) extra += extraAnime;
        updateDisplay('val-anime-extra-curr', extraAnime);
        updateDisplay('val-anime-extra-pts', extraAnimePts + ' pts');
        
        const extraManga = Math.max(0, parseInt(document.getElementById('rng-manga-extra')?.value) || 0);
        const extraMangaPts = extraManga * 0.2;
        if (extraManga > 0) extra += extraMangaPts;
        updateDisplay('val-manga-extra-curr', extraManga);
        updateDisplay('val-manga-extra-pts', extraMangaPts.toFixed(1) + ' pts');
        
        const extraBooks = Math.max(0, parseInt(document.getElementById('rng-books-extra')?.value) || 0);
        const extraBooksPts = extraBooks;
        if (extraBooks > 0) extra += extraBooks;
        updateDisplay('val-books-extra-curr', extraBooks);
        updateDisplay('val-books-extra-pts', extraBooksPts + ' pts');

        // 11. Cinema - 4 pts base (6 visits = 4 pts)
        const cinema = Math.max(0, parseInt(document.getElementById('rng-cinema')?.value) || 0);
        const cineBaseVisits = Math.min(6, cinema);
        const cinemaPts = (cineBaseVisits / 6) * 4;
        bronce += cinemaPts;
        let cinemaExtraPts = 0;
        if (cinema > 6) {
            cinemaExtraPts = (cinema - 6) * 0.5;
            extra += cinemaExtraPts;
        }
        updateDisplay('val-cinema-pts', (cinemaPts + cinemaExtraPts).toFixed(1) + ' pts');
        updateDisplay('val-cinema-curr', cinema);

        // 12. LoL Ranking - 3 pts base
        const lolRank = parseInt(document.getElementById('rng-lol').value) || 0;
        let lolPts = 0;
        if (lolRank >= 1) {
            bronce += 3;
            if (lolRank > 1) extra += (lolRank - 1);
            lolPts = 3 + Math.max(0, lolRank - 1);
        }
        updateDisplay('val-lol-pts', lolPts.toFixed(1) + ' pts');
        updateDisplay('val-lol-rank', LOL_RANKS[lolRank]);

        // 13. Book: Fundamentals of DE (slider - 394 pages)
        const bookPages = Math.max(0, parseInt(document.getElementById('rng-book')?.value) || 0);
        const bookPts = bookPages >= 394 ? 3 : (bookPages / 394) * 3;
        updateDisplay('val-book-pts', bookPts.toFixed(1) + ' pts');
        updateDisplay('val-book-curr', Math.min(394, bookPages));
        extra += bookPts;
        
        // 14. Spark Exercises Extra
        const sparkExercises = parseInt(document.getElementById('rng-spark-ex')?.value) || 0;
        const sparkExercisesClamped = Math.max(0, Math.min(50, sparkExercises));
        const sparkExercisesPts = sparkExercisesClamped * 0.2;
        updateDisplay('val-spark-ex-pts', sparkExercisesPts.toFixed(1) + ' pts');
        updateDisplay('val-spark-ex-curr', sparkExercisesClamped);
        extra += sparkExercisesPts;
        
        // 15. YouTube/TikTok Videos Extra
        const videos = parseInt(document.getElementById('rng-videos')?.value) || 0;
        const videosClamped = Math.max(0, Math.min(50, videos));
        const videosPts = videosClamped * 0.2;
        updateDisplay('val-videos-pts', videosPts.toFixed(1) + ' pts');
        updateDisplay('val-videos-curr', videosClamped);
        extra += videosPts;
        
        // 16. AWS
        const awsStudyPct = parseInt(document.getElementById('rng-aws-study').value) || 0;
        const awsStudyPts = (awsStudyPct / 100) * 2;
        updateDisplay('val-aws-study-pts', awsStudyPts.toFixed(1) + ' pts');
        updateDisplay('val-aws-study-curr', awsStudyPct);
        extra += awsStudyPts;
        
        const awsCert = document.querySelector('input[name="aws-cert"]:checked');
        if (awsCert) extra += parseInt(awsCert.value);

        // 17. Extra Savings
        let savingsExtra = parseInt(document.getElementById('inp-savings-extra').value) || 0;
        savingsExtra = Math.max(0, savingsExtra);
        const savingsExtraPts = Math.floor(savingsExtra / 2000);
        updateDisplay('val-savings-extra-pts', savingsExtraPts + ' pts');
        if (savingsExtraPts > 0) extra += savingsExtraPts;

        // 18. Pizza Lab Project (10 pts max)
        const pizzaOvenChecked = document.getElementById('chk-pizza-oven')?.checked || false;
        const pizzaOvenPts = pizzaOvenChecked ? 4 : 0;
        updateDisplay('val-pizza-oven-pts', pizzaOvenPts + ' pts');
        
        const pizzaSessions = counters.pizzaSessions || 0;
        const pizzaSessionsPts = Math.min(6, pizzaSessions * 0.25);
        updateDisplay('val-pizza-sessions-pts', pizzaSessionsPts.toFixed(2) + ' pts');
        updateDisplay('val-pizza-sessions-curr', pizzaSessions);
        updateDisplay('pizza-sessions-display', pizzaSessions);
        
        // Update progress bar
        const pizzaProgressPercent = (pizzaSessions / 24) * 100;
        const pizzaProgressFill = document.getElementById('pizza-progress-fill');
        if (pizzaProgressFill) {
            pizzaProgressFill.style.width = pizzaProgressPercent + '%';
        }
        
        const pizzaTotalPts = pizzaOvenPts + pizzaSessionsPts;
        updateDisplay('val-pizza-total-pts', pizzaTotalPts.toFixed(2) + ' pts');
        extra += pizzaTotalPts;

        // 19. NexusFi Project (10 pts max)
        const nexusfiFrontendProgress = counters.nexusfiProgress || 0;
        const nexusfiFrontendPts = Math.min(6, nexusfiFrontendProgress * 0.06);
        updateDisplay('val-nexusfi-frontend-pts', nexusfiFrontendPts.toFixed(2) + ' pts');
        updateDisplay('val-nexusfi-progress-curr', nexusfiFrontendProgress);
        updateDisplay('nexusfi-progress-display', nexusfiFrontendProgress + '%');
        
        // Update progress bar
        const nexusfiProgressFill = document.getElementById('nexusfi-progress-fill');
        if (nexusfiProgressFill) {
            nexusfiProgressFill.style.width = nexusfiFrontendProgress + '%';
        }
        
        const nexusfiDeployChecked = document.getElementById('chk-nexusfi-deploy')?.checked || false;
        const nexusfiDeployPts = nexusfiDeployChecked ? 4 : 0;
        updateDisplay('val-nexusfi-deploy-pts', nexusfiDeployPts + ' pts');
        
        const nexusfiTotalPts = nexusfiFrontendPts + nexusfiDeployPts;
        updateDisplay('val-nexusfi-total-pts', nexusfiTotalPts.toFixed(2) + ' pts');
        extra += nexusfiTotalPts;

        // ===== UPDATE UI =====
        const total = oro + plata + bronce + extra;
        updateScoreUI(total, oro, plata, bronce, extra);
    }

    /**
     * Helper to update display element
     * @param {string} id - Element ID
     * @param {string} value - Value to display
     */
    function updateDisplay(id, value) {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    }

    /**
     * Helper to set element className
     * @param {string} id - Element ID
     * @param {string} className - Class name to set
     */
    function setClassName(id, className) {
        const el = document.getElementById(id);
        if (el) el.className = className;
    }

    /**
     * Update main score UI elements
     */
    function updateScoreUI(total, oro, plata, bronce, extra) {
        const formattedTotal = total.toFixed(1);
        
        // Update all score displays
        if (elements.scoreBig) elements.scoreBig.innerText = formattedTotal;
        if (elements.headerScore) elements.headerScore.innerText = formattedTotal;
        if (elements.headerScoreMobile) elements.headerScoreMobile.innerText = formattedTotal;
        if (elements.mobileScore) elements.mobileScore.innerText = formattedTotal;
        
        // Animate score update
        if (elements.scoreBig) {
            elements.scoreBig.classList.add('score-update');
            setTimeout(() => elements.scoreBig.classList.remove('score-update'), 500);
        }

        // Update breakdown
        if (elements.ptsOro) elements.ptsOro.innerText = oro.toFixed(1);
        if (elements.ptsPlata) elements.ptsPlata.innerText = plata.toFixed(1);
        if (elements.ptsBronce) elements.ptsBronce.innerText = bronce.toFixed(1);
        if (elements.ptsExtra) elements.ptsExtra.innerText = extra.toFixed(1);

        // Update grade badge
        updateGradeBadge(total);
    }

    /**
     * Update grade badge based on total score
     * @param {number} total - Total score
     */
    function updateGradeBadge(total) {
        if (!elements.gradeBadge || !elements.rewardText) return;

        const badge = elements.gradeBadge;
        const reward = elements.rewardText;
        
        // Reset classes
        badge.className = 'text-white text-center py-2 rounded-lg font-bold text-lg mb-6 shadow-inner transition-colors duration-300';

        if (total >= 90) {
            badge.innerText = '🌟 ¡SOBRESALIENTE!';
            badge.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-green-600');
            reward.innerText = '¡Increíble! Te has ganado un gran premio: Upgrade PC, Viaje Internacional o Reloj Premium. 🎉';
        } else if (total >= 75) {
            badge.innerText = '😊 ¡SATISFACTORIO!';
            badge.classList.add('bg-gradient-to-r', 'from-blue-500', 'to-cyan-600');
            reward.innerText = '¡Excelente trabajo! Mereces un premio: Ropa nueva, Cena especial o Gadget favorito. 🎁';
        } else if (total >= 60) {
            badge.innerText = '😐 REGULAR';
            badge.classList.add('bg-gradient-to-r', 'from-yellow-500', 'to-orange-500');
            reward.innerText = 'Vas por buen camino, pero hay margen de mejora. ¡Sigue adelante! 💪';
        } else if (total >= 40) {
            badge.innerText = '😟 MEJORABLE';
            badge.classList.add('bg-gradient-to-r', 'from-orange-500', 'to-red-500');
            reward.innerText = 'Necesitas esforzarte más. Pausa de entretenimiento en Enero 2027. ¡Puedes lograrlo! 🎯';
        } else {
            badge.innerText = '😔 COMENZANDO';
            badge.classList.add('bg-gradient-to-r', 'from-rose-600', 'to-red-700');
            reward.innerText = '¡Es momento de tomar acción! Cada día es una nueva oportunidad. 🚀';
        }
    }

    /**
     * ========================================================================
     * FINANCE CHART
     * ========================================================================
     */
    
    /**
     * Initialize the finance chart
     */
    function initFinanceChart() {
        if (!elements.financeChart) return;

        const ctx = elements.financeChart.getContext('2d');
        financeChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Capital'],
                datasets: [
                    { 
                        label: 'Base Inicial', 
                        data: [FINANCE.BASE_BALANCE], 
                        backgroundColor: '#1e293b'
                    },
                    { 
                        label: 'Progreso', 
                        data: [0], 
                        backgroundColor: '#10b981'
                    },
                    { 
                        label: 'Faltante', 
                        data: [FINANCE.TARGET_BALANCE - FINANCE.BASE_BALANCE], 
                        backgroundColor: '#e2e8f0'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: { 
                        stacked: true, 
                        max: 180000, 
                        ticks: { 
                            callback: val => '$' + val/1000 + 'k'
                        }
                    },
                    y: { 
                        stacked: true, 
                        display: false 
                    }
                },
                plugins: { 
                    legend: { 
                        display: true, 
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Update finance chart with current balance
     * @param {number} current - Current balance
     */
    function updateFinanceChart(current) {
        if (!financeChartInstance) return;
        
        const base = FINANCE.BASE_BALANCE;
        const target = FINANCE.TARGET_BALANCE;
        
        const progress = Math.max(0, current - base);
        const remaining = Math.max(0, target - current);
        const baseVal = Math.min(current, base);

        financeChartInstance.data.datasets[0].data = [baseVal];
        financeChartInstance.data.datasets[1].data = [progress];
        financeChartInstance.data.datasets[2].data = [remaining];
        financeChartInstance.update();
    }

    /**
     * ========================================================================
     * MOBILE MENU
     * ========================================================================
     */
    
    /**
     * Toggle mobile menu visibility
     */
    function toggleMobileMenu() {
        if (elements.mobileMenu) {
            elements.mobileMenu.classList.toggle('active');
        }
        if (elements.menuOverlay) {
            elements.menuOverlay.classList.toggle('active');
        }
        
        // Toggle body scroll
        document.body.style.overflow = 
            elements.mobileMenu?.classList.contains('active') ? 'hidden' : '';
    }

    /**
     * ========================================================================
     * EVENT BINDING
     * ========================================================================
     */
    
    /**
     * Attach all event listeners
     */
    function bindEvents() {
        // Debounced save and calculate for performance
        const debouncedUpdate = ResolutionApp.debounce(() => {
            calculateScore();
            saveState();
        }, 100);

        // Attach to all inputs
        document.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('input', debouncedUpdate);
            inp.addEventListener('change', debouncedUpdate);
        });

        // Import file handler
        if (elements.importFile) {
            elements.importFile.addEventListener('change', importProgress);
        }

        // Menu overlay click
        if (elements.menuOverlay) {
            elements.menuOverlay.addEventListener('click', toggleMobileMenu);
        }
    }

    /**
     * ========================================================================
     * INITIALIZATION
     * ========================================================================
     */
    
    /**
     * Initialize the dashboard
     */
    function init() {
        cacheElements();
        loadState();
        bindEvents();
        initFinanceChart();
        calculateScore();
        
        console.log('Dashboard initialized successfully');
    }

    /**
     * ========================================================================
     * PUBLIC API
     * ========================================================================
     */
    
    return {
        init,
        exportProgress,
        importProgress,
        resetProgress,
        updateCounter,
        updatePizzaSessions,
        updateNexusFiProgress,
        toggleMobileMenu,
        calculateScore
    };

})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Dashboard.init);
} else {
    Dashboard.init();
}

// Expose to global scope for inline handlers
window.exportProgress = Dashboard.exportProgress;
window.importProgress = Dashboard.importProgress;
window.resetProgress = Dashboard.resetProgress;
window.updateCounter = Dashboard.updateCounter;
window.toggleMobileMenu = Dashboard.toggleMobileMenu;
window.calculateScore = Dashboard.calculateScore;
