/**
 * ============================================================================
 * APP.JS - Shared Application Utilities
 * ============================================================================
 * 
 * Core utilities and helper functions shared across the Resolution Tracker
 * application. Includes storage management, notifications, and common utilities.
 * 
 * @author Williams
 * @version 2.0.0
 * @since 2026
 */

'use strict';

/**
 * Application namespace to avoid global pollution
 */
const ResolutionApp = {
    
    /**
     * Application version for state compatibility checking
     */
    VERSION: '2.0.0',
    
    /**
     * Storage keys used throughout the application
     */
    STORAGE_KEYS: {
        STATE_2026: 'williams2026State',
        THEME: 'resolutionAppTheme',
        LAST_VISIT: 'lastVisit'
    },

    /**
     * ========================================================================
     * UTILITY FUNCTIONS
     * ========================================================================
     */
    
    /**
     * Safely parse JSON with fallback
     * @param {string} jsonString - The JSON string to parse
     * @param {*} fallback - Fallback value if parsing fails
     * @returns {*} Parsed object or fallback
     */
    safeJsonParse(jsonString, fallback = null) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('JSON parse error:', error);
            return fallback;
        }
    },

    /**
     * Format number as currency (MXN)
     * @param {number} value - The value to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            maximumFractionDigits: 0
        }).format(value);
    },

    /**
     * Format number with fixed decimals
     * @param {number} value - The value to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number string
     */
    formatNumber(value, decimals = 1) {
        return Number(value).toFixed(decimals);
    },

    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Debounce function to limit execution rate
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 250) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * ========================================================================
     * STORAGE MANAGEMENT
     * ========================================================================
     */
    
    storage: {
        /**
         * Get item from localStorage
         * @param {string} key - Storage key
         * @returns {*} Parsed value or null
         */
        get(key) {
            const item = localStorage.getItem(key);
            return ResolutionApp.safeJsonParse(item);
        },

        /**
         * Set item in localStorage
         * @param {string} key - Storage key
         * @param {*} value - Value to store
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error('Storage set error:', error);
            }
        },

        /**
         * Remove item from localStorage
         * @param {string} key - Storage key
         */
        remove(key) {
            localStorage.removeItem(key);
        },

        /**
         * Clear all application data
         */
        clearAll() {
            Object.values(ResolutionApp.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        }
    },

    /**
     * ========================================================================
     * NOTIFICATION SYSTEM
     * ========================================================================
     */
    
    notifications: {
        /**
         * Show a toast notification
         * @param {string} message - Message to display
         * @param {string} type - Notification type (success, error, warning, info)
         * @param {number} duration - Duration in milliseconds
         */
        show(message, type = 'info', duration = 3000) {
            // Remove existing notifications
            const existing = document.querySelector('.toast-notification');
            if (existing) {
                existing.remove();
            }

            // Create notification element
            const toast = document.createElement('div');
            toast.className = `toast-notification toast-notification--${type}`;
            toast.innerHTML = `
                <span class="toast-notification__icon">${this.getIcon(type)}</span>
                <span class="toast-notification__message">${message}</span>
            `;

            // Add styles if not already present
            this.ensureStyles();

            // Add to DOM
            document.body.appendChild(toast);

            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add('toast-notification--visible');
            });

            // Auto-remove
            setTimeout(() => {
                toast.classList.remove('toast-notification--visible');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        },

        /**
         * Get icon for notification type
         * @param {string} type - Notification type
         * @returns {string} Icon HTML
         */
        getIcon(type) {
            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };
            return icons[type] || icons.info;
        },

        /**
         * Ensure notification styles are in the document
         */
        ensureStyles() {
            if (document.getElementById('toast-styles')) return;

            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast-notification {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%) translateY(100px);
                    padding: 12px 24px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    opacity: 0;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                }
                .toast-notification--visible {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
                .toast-notification--success {
                    background: #10b981;
                    color: white;
                }
                .toast-notification--error {
                    background: #ef4444;
                    color: white;
                }
                .toast-notification--warning {
                    background: #f59e0b;
                    color: white;
                }
                .toast-notification--info {
                    background: #3b82f6;
                    color: white;
                }
                .toast-notification__icon {
                    font-size: 16px;
                }
            `;
            document.head.appendChild(style);
        },

        /**
         * Shorthand methods for notification types
         */
        success(message, duration) {
            this.show(message, 'success', duration);
        },
        error(message, duration) {
            this.show(message, 'error', duration);
        },
        warning(message, duration) {
            this.show(message, 'warning', duration);
        },
        info(message, duration) {
            this.show(message, 'info', duration);
        }
    },

    /**
     * ========================================================================
     * DOM UTILITIES
     * ========================================================================
     */
    
    dom: {
        /**
         * Safely get element by ID
         * @param {string} id - Element ID
         * @returns {HTMLElement|null} Element or null
         */
        getById(id) {
            return document.getElementById(id);
        },

        /**
         * Query selector shorthand
         * @param {string} selector - CSS selector
         * @param {HTMLElement} parent - Parent element
         * @returns {HTMLElement|null} Element or null
         */
        query(selector, parent = document) {
            return parent.querySelector(selector);
        },

        /**
         * Query selector all shorthand
         * @param {string} selector - CSS selector
         * @param {HTMLElement} parent - Parent element
         * @returns {NodeList} List of elements
         */
        queryAll(selector, parent = document) {
            return parent.querySelectorAll(selector);
        },

        /**
         * Add event listener with delegation support
         * @param {HTMLElement|string} target - Element or selector
         * @param {string} event - Event type
         * @param {Function} handler - Event handler
         */
        on(target, event, handler) {
            const element = typeof target === 'string' 
                ? document.querySelector(target) 
                : target;
            if (element) {
                element.addEventListener(event, handler);
            }
        },

        /**
         * Toggle class on element
         * @param {HTMLElement|string} target - Element or selector
         * @param {string} className - Class to toggle
         * @param {boolean} force - Force add/remove
         */
        toggleClass(target, className, force) {
            const element = typeof target === 'string' 
                ? document.querySelector(target) 
                : target;
            if (element) {
                element.classList.toggle(className, force);
            }
        }
    },

    /**
     * ========================================================================
     * DATE UTILITIES
     * ========================================================================
     */
    
    date: {
        /**
         * Get current date in ISO format
         * @returns {string} ISO date string
         */
        getISODate() {
            return new Date().toISOString().split('T')[0];
        },

        /**
         * Format date for display
         * @param {Date|string} date - Date to format
         * @returns {string} Formatted date
         */
        format(date) {
            const d = typeof date === 'string' ? new Date(date) : date;
            return d.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },

        /**
         * Get current year
         * @returns {number} Current year
         */
        getCurrentYear() {
            return new Date().getFullYear();
        }
    },

    /**
     * ========================================================================
     * INITIALIZATION
     * ========================================================================
     */
    
    /**
     * Initialize application
     */
    init() {
        // Record last visit
        this.storage.set(this.STORAGE_KEYS.LAST_VISIT, new Date().toISOString());
        
        console.log(`Resolution Tracker v${this.VERSION} initialized`);
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ResolutionApp.init());
} else {
    ResolutionApp.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResolutionApp;
}
