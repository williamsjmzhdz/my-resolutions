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
        nexusfiProgress: 0,  // NexusFi frontend progress percentage
        nexusfiBackendProgress: 0,  // NexusFi backend progress percentage
        // New visual progress bars
        gofluent: 0,
        // Finance - 4 cubos patrimoniales
        ivvpeso: 50873.58,       // Base: $50,873.58 → Meta: $110,000
        afore: 20000,            // Base: $20,000 → Meta: $63,000
        fondoEmergencia: 30000,  // Base: $30,000 → Meta: $70,000
        fondoProyectos: 0,       // Base: $0 → Meta: $64,000
        pizzaSessions: 0,        // Pizza Lab sessions (max 24)
        sparkTopics: 0,
        gym: 0,
        homeExercise: 0,        // Home exercise sessions (max 50)
        delivery: 0,
        transfers: 0,
        family: 0,
        imgOutfits: 0,
        spaceSavings: 0,
        furniture: 0,
        games: 0,
        frieren: 0,
        berserk: 0,
        anime: 0,
        animeExtra: 0,
        mangaExtra: 0,
        booksExtra: 0,
        cinema: 0,
        lol: 0,
        book: 0,
        sparkEx: 0,
        videos: 0,
        awsStudy: 0
    };

    /** Chart.js instance for finance chart */
    let financeChartInstance = null;

    /** Storage key for dashboard state */
    const STORAGE_KEY = 'williams2026State';

    /** Financial constants */
    const FINANCE = {
        // Ahorro e Inversiones (IVVPESO)
        IVVPESO_BASE: 50873.58,
        IVVPESO_TARGET: 110000,
        IVVPESO_PTS: 5,
        // Afore
        AFORE_BASE: 20000,
        AFORE_TARGET: 63000,
        AFORE_PTS: 5,
        // Fondo Emergencia
        EMERGENCIA_BASE: 30000,
        EMERGENCIA_TARGET: 70000,
        EMERGENCIA_PTS: 5,
        // Fondo para Proyectos
        PROYECTOS_BASE: 0,
        PROYECTOS_TARGET: 64000,
        PROYECTOS_PTS: 5
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
            // Restore counters (merge with defaults to handle missing keys)
            if (state.counters) {
                counters = { 
                    img: 0, 
                    nexusfiProgress: 0, 
                    nexusfiBackendProgress: 0,
                    gofluent: 0,
                    // Finance - 3 cubos patrimoniales
                    ivvpeso: FINANCE.IVVPESO_BASE,
                    afore: FINANCE.AFORE_BASE,
                    fondoEmergencia: FINANCE.EMERGENCIA_BASE,
                    fondoProyectos: FINANCE.PROYECTOS_BASE,
                    sparkTopics: 0,
                    gym: 0,
                    homeExercise: 0,
                    delivery: 0,
                    transfers: 0,
                    family: 0,
                    imgOutfits: 0,
                    spaceSavings: 0,
                    furniture: 0,
                    games: 0,
                    frieren: 0,
                    berserk: 0,
                    anime: 0,
                    animeExtra: 0,
                    mangaExtra: 0,
                    booksExtra: 0,
                    cinema: 0,
                    lol: 0,
                    book: 0,
                    sparkEx: 0,
                    videos: 0,
                    awsStudy: 0,
                    ...state.counters 
                };
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

        // Reset all counters to defaults
        counters = {
            img: 0,
            nexusfiProgress: 0,
            nexusfiBackendProgress: 0,
            gofluent: 0,
            // Finance - 4 cubos patrimoniales
            ivvpeso: FINANCE.IVVPESO_BASE,
            afore: FINANCE.AFORE_BASE,
            fondoEmergencia: FINANCE.EMERGENCIA_BASE,
            fondoProyectos: FINANCE.PROYECTOS_BASE,
            pizzaSessions: 0,
            sparkTopics: 0,
            gym: 0,
            homeExercise: 0,
            delivery: 0,
            transfers: 0,
            family: 0,
            imgOutfits: 0,
            spaceSavings: 0,
            furniture: 0,
            games: 0,
            frieren: 0,
            berserk: 0,
            anime: 0,
            animeExtra: 0,
            mangaExtra: 0,
            booksExtra: 0,
            cinema: 0,
            lol: 0,
            book: 0,
            sparkEx: 0,
            videos: 0,
            awsStudy: 0
        };
        
        // Reset all progress bar fills
        document.querySelectorAll('[id$="-progress-fill"]').forEach(fill => {
            fill.style.width = '0%';
        });
        
        // Reset finance displays to base values
        updateDisplay('ivvpeso-display', '$' + FINANCE.IVVPESO_BASE.toLocaleString('en-US'));
        updateDisplay('afore-display', '$' + FINANCE.AFORE_BASE.toLocaleString('en-US'));
        updateDisplay('fondo-emergencia-display', '$' + FINANCE.EMERGENCIA_BASE.toLocaleString('en-US'));
        updateDisplay('fondo-proyectos-display', '$' + FINANCE.PROYECTOS_BASE.toLocaleString('en-US'));
        
        // Reset NexusFi displays
        updateDisplay('nexusfi-progress-display', '0%');
        updateDisplay('val-nexusfi-progress-curr', '0');
        updateDisplay('nexusfi-backend-progress-display', '0%');
        updateDisplay('val-nexusfi-backend-progress-curr', '0');

        // Uncheck all checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            chk.checked = false;
        });

        // Reset radio buttons to default
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = radio.value === '0';
        });

        // Reset range sliders (for any remaining ones)
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
     * Generic function to update any visual progress bar
     * @param {string} key - The counter key name
     * @param {number} change - Amount to change (positive or negative)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {string} fillId - ID of the progress bar fill element
     * @param {string} displayId - ID of the display element showing current value
     * @param {string} unit - Unit to display (%, horas, etc.)
     */
    function updateVisualProgress(key, change, min, max, fillId, displayId, unit = '') {
        const currentValue = counters[key] || min;
        const newValue = Math.max(min, Math.min(max, currentValue + change));
        counters[key] = newValue;
        
        // Calculate percentage for the fill bar
        const percentage = ((newValue - min) / (max - min)) * 100;
        
        // Update progress bar fill
        const progressFill = document.getElementById(fillId);
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
        
        // Update display
        const displayValue = unit === '%' ? newValue + '%' : newValue + (unit ? ' ' + unit : '');
        updateDisplay(displayId, displayValue);
        
        calculateScore();
        saveState();
    }

    /**
     * Update IVVPESO progress with user-defined increment
     * @param {number} direction - Direction of change (+1 for increase, -1 for decrease)
     */
    function updateIvvpesoProgress(direction) {
        const incrementInput = document.getElementById('ivvpeso-increment');
        const increment = parseInt(incrementInput?.value) || 1000;
        const change = direction * increment;
        
        const min = FINANCE.IVVPESO_BASE;
        const max = FINANCE.IVVPESO_TARGET;
        const currentValue = counters.ivvpeso || min;
        const newValue = Math.max(min, Math.min(max, currentValue + change));
        counters.ivvpeso = newValue;
        
        const percentage = ((newValue - min) / (max - min)) * 100;
        const progressFill = document.getElementById('ivvpeso-progress-fill');
        if (progressFill) progressFill.style.width = percentage + '%';
        
        const formatted = '$' + newValue.toLocaleString('en-US');
        updateDisplay('ivvpeso-display', formatted);
        
        calculateScore();
        saveState();
    }

    /**
     * Update Afore progress with user-defined increment
     * @param {number} direction - Direction of change (+1 for increase, -1 for decrease)
     */
    function updateAforeProgress(direction) {
        const incrementInput = document.getElementById('afore-increment');
        const increment = parseInt(incrementInput?.value) || 1000;
        const change = direction * increment;
        
        const min = FINANCE.AFORE_BASE;
        const max = FINANCE.AFORE_TARGET;
        const currentValue = counters.afore || min;
        const newValue = Math.max(min, Math.min(max, currentValue + change));
        counters.afore = newValue;
        
        const percentage = ((newValue - min) / (max - min)) * 100;
        const progressFill = document.getElementById('afore-progress-fill');
        if (progressFill) progressFill.style.width = percentage + '%';
        
        const formatted = '$' + newValue.toLocaleString('en-US');
        updateDisplay('afore-display', formatted);
        
        calculateScore();
        saveState();
    }

    /**
     * Update Fondo Emergencia progress with user-defined increment
     * @param {number} direction - Direction of change (+1 for increase, -1 for decrease)
     */
    function updateFondoEmergenciaProgress(direction) {
        const incrementInput = document.getElementById('fondo-emergencia-increment');
        const increment = parseInt(incrementInput?.value) || 1000;
        const change = direction * increment;
        
        const min = FINANCE.EMERGENCIA_BASE;
        const max = FINANCE.EMERGENCIA_TARGET;
        const currentValue = counters.fondoEmergencia || min;
        const newValue = Math.max(min, Math.min(max, currentValue + change));
        counters.fondoEmergencia = newValue;
        
        const percentage = ((newValue - min) / (max - min)) * 100;
        const progressFill = document.getElementById('fondo-emergencia-progress-fill');
        if (progressFill) progressFill.style.width = percentage + '%';
        
        const formatted = '$' + newValue.toLocaleString('en-US');
        updateDisplay('fondo-emergencia-display', formatted);
        
        calculateScore();
        saveState();
    }

    /**
     * Update Fondo para Proyectos progress with user-defined increment
     * @param {number} direction - Direction of change (+1 for increase, -1 for decrease)
     */
    function updateFondoProyectosProgress(direction) {
        const incrementInput = document.getElementById('fondo-proyectos-increment');
        const increment = parseInt(incrementInput?.value) || 1000;
        const change = direction * increment;
        
        const min = FINANCE.PROYECTOS_BASE;
        const max = FINANCE.PROYECTOS_TARGET;
        const currentValue = counters.fondoProyectos !== undefined ? counters.fondoProyectos : min;
        const newValue = Math.max(min, Math.min(max, currentValue + change));
        counters.fondoProyectos = newValue;
        
        const percentage = (newValue / max) * 100;
        const progressFill = document.getElementById('fondo-proyectos-progress-fill');
        if (progressFill) progressFill.style.width = percentage + '%';
        
        const formatted = '$' + newValue.toLocaleString('en-US');
        updateDisplay('fondo-proyectos-display', formatted);
        
        calculateScore();
        saveState();
    }

    /**
     * Update Pizza Lab sessions
     * @param {number} change - Amount to change (+1 or -1)
     */
    function updatePizzaSessions(change) {
        const max = 24;  // max sessions
        const newValue = Math.max(0, Math.min(max, (counters.pizzaSessions || 0) + change));
        counters.pizzaSessions = newValue;
        
        // Update display
        updateDisplay('val-pizza-sessions-curr', newValue);
        updateDisplay('pizza-sessions-display', newValue);
        
        // Update progress bar
        const progressFill = document.getElementById('pizza-progress-fill');
        if (progressFill) {
            progressFill.style.width = ((newValue / max) * 100) + '%';
        }
        
        // Update points (0.25 pts per session, max 6 pts)
        const sessionsPts = Math.min(6, newValue * 0.25);
        updateDisplay('val-pizza-sessions-pts', sessionsPts.toFixed(2) + ' pts');
        
        // Update total pizza pts
        const ovenPts = document.getElementById('chk-pizza-oven')?.checked ? 4 : 0;
        const totalPts = ovenPts + sessionsPts;
        updateDisplay('val-pizza-total-pts', totalPts.toFixed(2) + ' pts');
        
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
        
        // Update points (2.5 pts max for frontend dev)
        const frontendPts = Math.min(2.5, newValue * 0.025);
        updateDisplay('val-nexusfi-frontend-pts', frontendPts.toFixed(2) + ' pts');
        
        recalculateNexusFiTotal();
        calculateScore();
        saveState();
    }
    
    /**
     * Update NexusFi backend progress
     * @param {number} change - Amount to change (+10 or -10)
     */
    function updateNexusFiBackendProgress(change) {
        const newValue = Math.max(0, Math.min(100, counters.nexusfiBackendProgress + change));
        counters.nexusfiBackendProgress = newValue;
        
        // Update display
        updateDisplay('nexusfi-backend-progress-display', newValue + '%');
        updateDisplay('val-nexusfi-backend-progress-curr', newValue);
        
        // Update progress bar
        const progressFill = document.getElementById('nexusfi-backend-progress-fill');
        if (progressFill) {
            progressFill.style.width = newValue + '%';
        }
        
        // Update points (2.5 pts max for backend dev)
        const backendPts = Math.min(2.5, newValue * 0.025);
        updateDisplay('val-nexusfi-backend-pts', backendPts.toFixed(2) + ' pts');
        
        recalculateNexusFiTotal();
        calculateScore();
        saveState();
    }
    
    /**
     * Recalculate total NexusFi points from all components
     */
    function recalculateNexusFiTotal() {
        // Backend: dev (2.5) + deploy (2)
        const backendProgress = counters.nexusfiBackendProgress || 0;
        const backendDevPts = Math.min(2.5, backendProgress * 0.025);
        const backendDeployChecked = document.getElementById('chk-nexusfi-backend-deploy')?.checked || false;
        const backendDeployPts = backendDeployChecked ? 2 : 0;
        
        // Frontend: dev (2.5) + deploy (3)
        const frontendProgress = counters.nexusfiProgress || 0;
        const frontendDevPts = Math.min(2.5, frontendProgress * 0.025);
        const frontendDeployChecked = document.getElementById('chk-nexusfi-frontend-deploy')?.checked || false;
        const frontendDeployPts = frontendDeployChecked ? 3 : 0;
        
        const totalNexusFiPts = backendDevPts + backendDeployPts + frontendDevPts + frontendDeployPts;
        updateDisplay('val-nexusfi-total-pts', totalNexusFiPts.toFixed(2) + ' pts');
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
        
        // 1. English - GoFluent (using counters now)
        const gofluentHours = counters.gofluent || 0;
        const gofluentPts = (gofluentHours / 50) * 5;
        updateDisplay('val-gofluent-pts', gofluentPts.toFixed(1) + ' pts');
        updateDisplay('val-gofluent-curr', gofluentHours);
        updateDisplay('gofluent-display', gofluentHours + ' hrs');
        const gofluentFill = document.getElementById('gofluent-progress-fill');
        if (gofluentFill) gofluentFill.style.width = ((gofluentHours / 50) * 100) + '%';
        oro += gofluentPts;
        
        // English Maintenance (1st half of year) - 5 pts
        const engMaintenance = document.getElementById('chk-english-maintenance')?.checked || false;
        const engMaintenancePts = engMaintenance ? 5 : 0;
        updateDisplay('val-english-maintenance-pts', engMaintenancePts + ' pts');
        oro += engMaintenancePts;
        
        // English Consistent Study (2nd half of year) - 10 pts
        const engConsistent = document.getElementById('chk-english-consistent')?.checked || false;
        const engConsistentPts = engConsistent ? 10 : 0;
        updateDisplay('val-english-consistent-pts', engConsistentPts + ' pts');
        oro += engConsistentPts;

        // 2. Apache Spark - Study Progress (0-100%) - using counters
        const sparkTopics = counters.sparkTopics || 0;
        const sparkTopicsPts = (sparkTopics / 100) * 2;
        updateDisplay('val-spark-topics-pts', sparkTopicsPts.toFixed(1) + ' pts');
        updateDisplay('val-spark-topics-curr', sparkTopics);
        updateDisplay('spark-topics-display', sparkTopics + '%');
        const sparkSliderFill = document.getElementById('spark-slider-fill');
        const sparkSliderThumb = document.getElementById('spark-slider-thumb');
        if (sparkSliderFill) sparkSliderFill.style.width = sparkTopics + '%';
        if (sparkSliderThumb) sparkSliderThumb.style.left = sparkTopics + '%';
        oro += sparkTopicsPts;
        
        // +2 pts por presentar el examen
        const sparkPresent = document.getElementById('chk-spark-present')?.checked || false;
        if (sparkPresent) oro += 2;
        
        // +6 pts por aprobar el examen
        const sparkPass = document.getElementById('chk-spark-pass')?.checked || false;
        if (sparkPass) oro += 6;

        // 3. Finance - 3 Cubos Patrimoniales (20 pts total)
        
        // 3a. Ahorro e Inversiones (14 pts) - $50,873.58 → $191,000
        const ivvpesoValue = counters.ivvpeso || FINANCE.IVVPESO_BASE;
        let ivvpesoPts = 0;
        if (ivvpesoValue > FINANCE.IVVPESO_BASE) {
            const progress = (ivvpesoValue - FINANCE.IVVPESO_BASE) / 
                           (FINANCE.IVVPESO_TARGET - FINANCE.IVVPESO_BASE);
            ivvpesoPts = ResolutionApp.clamp(progress, 0, 1) * FINANCE.IVVPESO_PTS;
        }
        updateDisplay('val-ivvpeso-pts', ivvpesoPts.toFixed(1) + ' pts');
        updateDisplay('ivvpeso-display', '$' + ivvpesoValue.toLocaleString('en-US'));
        const ivvpesoFill = document.getElementById('ivvpeso-progress-fill');
        if (ivvpesoFill) ivvpesoFill.style.width = (((ivvpesoValue - FINANCE.IVVPESO_BASE) / (FINANCE.IVVPESO_TARGET - FINANCE.IVVPESO_BASE)) * 100) + '%';
        oro += ivvpesoPts;
        
        // 3b. Afore (4 pts) - $20,000 → $63,000
        const aforeValue = counters.afore || FINANCE.AFORE_BASE;
        let aforePts = 0;
        if (aforeValue > FINANCE.AFORE_BASE) {
            const progress = (aforeValue - FINANCE.AFORE_BASE) / 
                           (FINANCE.AFORE_TARGET - FINANCE.AFORE_BASE);
            aforePts = ResolutionApp.clamp(progress, 0, 1) * FINANCE.AFORE_PTS;
        }
        updateDisplay('val-afore-pts', aforePts.toFixed(1) + ' pts');
        updateDisplay('afore-display', '$' + aforeValue.toLocaleString('en-US'));
        const aforeFill = document.getElementById('afore-progress-fill');
        if (aforeFill) aforeFill.style.width = (((aforeValue - FINANCE.AFORE_BASE) / (FINANCE.AFORE_TARGET - FINANCE.AFORE_BASE)) * 100) + '%';
        oro += aforePts;
        
        // 3c. Fondo Emergencia (2 pts) - $30,000 → $70,000
        const emergenciaValue = counters.fondoEmergencia || FINANCE.EMERGENCIA_BASE;
        let emergenciaPts = 0;
        if (emergenciaValue > FINANCE.EMERGENCIA_BASE) {
            const progress = (emergenciaValue - FINANCE.EMERGENCIA_BASE) / 
                           (FINANCE.EMERGENCIA_TARGET - FINANCE.EMERGENCIA_BASE);
            emergenciaPts = ResolutionApp.clamp(progress, 0, 1) * FINANCE.EMERGENCIA_PTS;
        }
        updateDisplay('val-fondo-emergencia-pts', emergenciaPts.toFixed(1) + ' pts');
        updateDisplay('fondo-emergencia-display', '$' + emergenciaValue.toLocaleString('en-US'));
        const emergenciaFill = document.getElementById('fondo-emergencia-progress-fill');
        if (emergenciaFill) emergenciaFill.style.width = (((emergenciaValue - FINANCE.EMERGENCIA_BASE) / (FINANCE.EMERGENCIA_TARGET - FINANCE.EMERGENCIA_BASE)) * 100) + '%';
        oro += emergenciaPts;
        
        // 3d. Fondo para Proyectos (7 pts) - $0 → $64,000
        const proyectosValue = counters.fondoProyectos !== undefined ? counters.fondoProyectos : FINANCE.PROYECTOS_BASE;
        let proyectosPts = 0;
        if (proyectosValue > FINANCE.PROYECTOS_BASE) {
            const progress = proyectosValue / FINANCE.PROYECTOS_TARGET;
            proyectosPts = ResolutionApp.clamp(progress, 0, 1) * FINANCE.PROYECTOS_PTS;
        }
        updateDisplay('val-fondo-proyectos-pts', proyectosPts.toFixed(1) + ' pts');
        updateDisplay('fondo-proyectos-display', '$' + proyectosValue.toLocaleString('en-US'));
        const proyectosFill = document.getElementById('fondo-proyectos-progress-fill');
        if (proyectosFill) proyectosFill.style.width = ((proyectosValue / FINANCE.PROYECTOS_TARGET) * 100) + '%';
        oro += proyectosPts;
        
        // Update finance chart
        updateFinanceChart();

        // 4. Health - Gym - using counters
        const gymVisits = counters.gym || 0;
        const gymPts = Math.min(15, (gymVisits / 100) * 15);
        updateDisplay('val-gym-pts', gymPts.toFixed(1) + ' pts');
        updateDisplay('val-gym-curr', gymVisits);
        updateDisplay('gym-display', gymVisits + ' visitas');
        const gymFill = document.getElementById('gym-progress-fill');
        if (gymFill) gymFill.style.width = ((gymVisits / 100) * 100) + '%';
        oro += gymPts;
        
        // Health - Home Exercise - using counters (3 pts max, 50 sessions)
        const homeExerciseSessions = counters.homeExercise || 0;
        const homeExercisePts = Math.min(5, (homeExerciseSessions / 50) * 5);
        updateDisplay('val-home-exercise-pts', homeExercisePts.toFixed(1) + ' pts');
        updateDisplay('val-home-exercise-curr', homeExerciseSessions);
        updateDisplay('home-exercise-display', homeExerciseSessions + ' sesiones');
        const homeExerciseFill = document.getElementById('home-exercise-progress-fill');
        if (homeExerciseFill) homeExerciseFill.style.width = ((homeExerciseSessions / 50) * 100) + '%';
        extra += homeExercisePts;
        
        // Health - Nutrition - using counters
        const deliveries = counters.delivery || 0;
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
        updateDisplay('delivery-display', deliveries + ' deliveries');
        const deliveryFill = document.getElementById('delivery-progress-fill');
        if (deliveryFill) deliveryFill.style.width = ((deliveries / 52) * 100) + '%';
        oro += nutritionPts;

        // ===== PLATA CALCULATIONS =====
        
        // 5. Work (10 pts)
        const workCompleted = document.getElementById('chk-work')?.checked || false;
        const workPts = workCompleted ? 10 : 0;
        updateDisplay('val-work-pts', workPts + ' pts');
        plata += workPts;

        // 6. Family - Transfers (4 pts) + Meetings (4 pts) = 8 pts total
        const transfers = parseInt(document.getElementById('rng-transfers').value) || 0;
        const transfersPts = (transfers / 24) * 4;  // 24 quincenas
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
        const spaceSavingsPts = (spaceSavings / 24) * 2;  // 24 quincenas
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

        // 13. Book: Fundamentals of DE (visual progress bar - 394 pages)
        const bookPages = Math.max(0, Math.min(394, counters.book)); // counter is page count directly
        const bookPts = bookPages >= 394 ? 3 : (bookPages / 394) * 3;
        updateDisplay('val-book-pts', bookPts.toFixed(1) + ' pts');
        updateDisplay('val-book-curr', bookPages);
        updateProgressFill('book-fill', (bookPages / 394) * 100);
        updateDisplay('book-display', bookPages);
        extra += bookPts;
        
        // 14. Spark Exercises Extra (visual progress bar)
        const sparkExercises = Math.max(0, Math.min(50, counters.sparkEx)); // counter is exercise count directly
        const sparkExercisesPts = sparkExercises * 0.2;
        updateDisplay('val-spark-ex-pts', sparkExercisesPts.toFixed(1) + ' pts');
        updateDisplay('val-spark-ex-curr', sparkExercises);
        updateProgressFill('spark-ex-fill', (sparkExercises / 50) * 100);
        updateDisplay('spark-ex-display', sparkExercises);
        extra += sparkExercisesPts;
        
        // 15. YouTube/TikTok Videos Extra (visual progress bar)
        const videos = Math.max(0, Math.min(50, counters.videos)); // counter is in 1-video increments
        const videosPts = videos * 0.2;
        updateDisplay('val-videos-pts', videosPts.toFixed(1) + ' pts');
        updateDisplay('val-videos-curr', videos);
        updateProgressFill('videos-fill', (videos / 50) * 100);
        updateDisplay('videos-display', videos);
        extra += videosPts;
        
        // 16. AWS Study (visual progress bar)
        const awsStudyPct = Math.max(0, Math.min(100, counters.awsStudy)); // counter is percentage directly (increment 5)
        const awsStudyPts = (awsStudyPct / 100) * 2;
        updateDisplay('val-aws-study-pts', awsStudyPts.toFixed(1) + ' pts');
        updateDisplay('val-aws-study-curr', awsStudyPct);
        updateProgressFill('aws-study-fill', awsStudyPct);
        updateDisplay('aws-study-display', awsStudyPct);
        extra += awsStudyPts;
        
        const awsCert = document.querySelector('input[name="aws-cert"]:checked');
        if (awsCert) extra += parseInt(awsCert.value);

        // 17. Extra Savings
        let savingsExtra = parseInt(document.getElementById('inp-savings-extra').value) || 0;
        savingsExtra = Math.max(0, savingsExtra);
        const savingsExtraPts = Math.floor(savingsExtra / 2000);
        updateDisplay('val-savings-extra-pts', savingsExtraPts + ' pts');
        if (savingsExtraPts > 0) extra += savingsExtraPts;

        // 18. Pizza Lab Project (max 10 pts: 4 oven + 6 sessions)
        const pizzaOven = document.getElementById('chk-pizza-oven')?.checked || false;
        const pizzaOvenPts = pizzaOven ? 4 : 0;
        updateDisplay('val-pizza-oven-pts', pizzaOvenPts + ' pts');
        
        const pizzaSessions = counters.pizzaSessions || 0;
        const pizzaSessionsPts = Math.min(6, pizzaSessions * 0.25);  // max 24 sessions = 6 pts
        updateDisplay('val-pizza-sessions-pts', pizzaSessionsPts.toFixed(2) + ' pts');
        updateDisplay('val-pizza-sessions-curr', pizzaSessions);
        updateDisplay('pizza-sessions-display', pizzaSessions);
        
        const pizzaProgressFill = document.getElementById('pizza-progress-fill');
        if (pizzaProgressFill) {
            pizzaProgressFill.style.width = ((pizzaSessions / 24) * 100) + '%';
        }
        
        const pizzaTotalPts = pizzaOvenPts + pizzaSessionsPts;
        updateDisplay('val-pizza-total-pts', pizzaTotalPts.toFixed(2) + ' pts');
        extra += pizzaTotalPts;

        // 19. NexusFi Project (10 pts max)
        // Backend: development (2.5 pts) + deploy (2 pts)
        const nexusfiBackendProgress = counters.nexusfiBackendProgress || 0;
        const nexusfiBackendDevPts = Math.min(2.5, nexusfiBackendProgress * 0.025);
        updateDisplay('val-nexusfi-backend-pts', nexusfiBackendDevPts.toFixed(2) + ' pts');
        updateDisplay('val-nexusfi-backend-progress-curr', nexusfiBackendProgress);
        updateDisplay('nexusfi-backend-progress-display', nexusfiBackendProgress + '%');
        
        const nexusfiBackendFill = document.getElementById('nexusfi-backend-progress-fill');
        if (nexusfiBackendFill) {
            nexusfiBackendFill.style.width = nexusfiBackendProgress + '%';
        }
        
        const nexusfiBackendDeployChecked = document.getElementById('chk-nexusfi-backend-deploy')?.checked || false;
        const nexusfiBackendDeployPts = nexusfiBackendDeployChecked ? 2 : 0;
        updateDisplay('val-nexusfi-backend-deploy-pts', nexusfiBackendDeployPts + ' pts');
        
        // Frontend: development (2.5 pts) + deploy (3 pts)
        const nexusfiFrontendProgress = counters.nexusfiProgress || 0;
        const nexusfiFrontendPts = Math.min(2.5, nexusfiFrontendProgress * 0.025);
        updateDisplay('val-nexusfi-frontend-pts', nexusfiFrontendPts.toFixed(2) + ' pts');
        updateDisplay('val-nexusfi-progress-curr', nexusfiFrontendProgress);
        updateDisplay('nexusfi-progress-display', nexusfiFrontendProgress + '%');
        
        const nexusfiProgressFill = document.getElementById('nexusfi-progress-fill');
        if (nexusfiProgressFill) {
            nexusfiProgressFill.style.width = nexusfiFrontendProgress + '%';
        }
        
        const nexusfiFrontendDeployChecked = document.getElementById('chk-nexusfi-frontend-deploy')?.checked || false;
        const nexusfiFrontendDeployPts = nexusfiFrontendDeployChecked ? 3 : 0;
        updateDisplay('val-nexusfi-frontend-deploy-pts', nexusfiFrontendDeployPts + ' pts');
        
        const nexusfiTotalPts = nexusfiBackendDevPts + nexusfiBackendDeployPts + nexusfiFrontendPts + nexusfiFrontendDeployPts;
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
     * Helper to update progress bar fill width
     * @param {string} id - Element ID of the fill div
     * @param {number} percent - Percentage to fill (0-100)
     */
    function updateProgressFill(id, percent) {
        const el = document.getElementById(id);
        if (el) el.style.width = Math.min(100, Math.max(0, percent)) + '%';
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
                labels: ['Ahorro e Inv.', 'Afore', 'Emergencia', 'Proyectos'],
                datasets: [
                    { 
                        label: 'Actual', 
                        data: [
                            FINANCE.IVVPESO_BASE,
                            FINANCE.AFORE_BASE,
                            FINANCE.EMERGENCIA_BASE,
                            FINANCE.PROYECTOS_BASE
                        ], 
                        backgroundColor: ['#10b981', '#3b82f6', '#64748b', '#8b5cf6']
                    },
                    { 
                        label: 'Faltante', 
                        data: [
                            FINANCE.IVVPESO_TARGET - FINANCE.IVVPESO_BASE,
                            FINANCE.AFORE_TARGET - FINANCE.AFORE_BASE,
                            FINANCE.EMERGENCIA_TARGET - FINANCE.EMERGENCIA_BASE,
                            FINANCE.PROYECTOS_TARGET - FINANCE.PROYECTOS_BASE
                        ], 
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
                        max: 200000, 
                        ticks: { 
                            callback: val => '$' + val/1000 + 'k'
                        }
                    },
                    y: { 
                        stacked: true
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
     * Update finance chart with 3 cubos patrimoniales
     */
    function updateFinanceChart() {
        if (!financeChartInstance) return;
        
        const ivvpeso = counters.ivvpeso || FINANCE.IVVPESO_BASE;
        const afore = counters.afore || FINANCE.AFORE_BASE;
        const emergencia = counters.fondoEmergencia || FINANCE.EMERGENCIA_BASE;
        const proyectos = counters.fondoProyectos !== undefined ? counters.fondoProyectos : FINANCE.PROYECTOS_BASE;

        financeChartInstance.data.datasets[0].data = [ivvpeso, afore, emergencia, proyectos];
        financeChartInstance.data.datasets[1].data = [
            Math.max(0, FINANCE.IVVPESO_TARGET - ivvpeso),
            Math.max(0, FINANCE.AFORE_TARGET - afore),
            Math.max(0, FINANCE.EMERGENCIA_TARGET - emergencia),
            Math.max(0, FINANCE.PROYECTOS_TARGET - proyectos)
        ];
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
    /**
     * Initialize a YouTube-style draggable slider
     * @param {string} containerId - ID of the slider container
     * @param {string} trackId - ID of the slider track
     * @param {string} fillId - ID of the fill element
     * @param {string} thumbId - ID of the thumb element
     * @param {string} counterKey - Key in the counters object
     */
    function initYouTubeSlider(containerId, trackId, fillId, thumbId, counterKey) {
        const container = document.getElementById(containerId);
        const track = document.getElementById(trackId);
        const fill = document.getElementById(fillId);
        const thumb = document.getElementById(thumbId);
        
        if (!container || !track || !fill || !thumb) return;
        
        let isDragging = false;
        
        function getPercentFromEvent(e) {
            const rect = track.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const x = clientX - rect.left;
            const percent = Math.round(Math.max(0, Math.min(100, (x / rect.width) * 100)));
            return percent;
        }
        
        function updateSlider(percent) {
            counters[counterKey] = percent;
            fill.style.width = percent + '%';
            thumb.style.left = percent + '%';
            calculateScore();
            saveState();
        }
        
        // Mouse events
        track.addEventListener('mousedown', function(e) {
            isDragging = true;
            updateSlider(getPercentFromEvent(e));
            container.classList.add('yt-slider--active');
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            updateSlider(getPercentFromEvent(e));
            e.preventDefault();
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                container.classList.remove('yt-slider--active');
            }
        });
        
        // Touch events for mobile
        track.addEventListener('touchstart', function(e) {
            isDragging = true;
            updateSlider(getPercentFromEvent(e));
            container.classList.add('yt-slider--active');
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            updateSlider(getPercentFromEvent(e));
        }, { passive: true });
        
        document.addEventListener('touchend', function() {
            if (isDragging) {
                isDragging = false;
                container.classList.remove('yt-slider--active');
            }
        });
        
        // Click on track to jump
        track.addEventListener('click', function(e) {
            updateSlider(getPercentFromEvent(e));
        });
    }

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
        
        // Initialize YouTube-style sliders
        initYouTubeSlider(
            'spark-slider-container',
            'spark-slider-track',
            'spark-slider-fill',
            'spark-slider-thumb',
            'sparkTopics'
        );
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
        updateNexusFiProgress,
        updateNexusFiBackendProgress,
        updateVisualProgress,
        updateIvvpesoProgress,
        updateAforeProgress,
        updateFondoEmergenciaProgress,
        updateFondoProyectosProgress,
        updatePizzaSessions,
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
