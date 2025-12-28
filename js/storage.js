/**
 * Storage module for configuration and template management
 */
const Storage = {
    /**
     * Save configuration settings
     * @param {Object} config - Configuration object
     */
    saveConfig(config) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.CONFIG, JSON.stringify(config));
        } catch (e) {
            console.error('Failed to save config:', e);
        }
    },

    /**
     * Load saved configuration
     * @returns {Object|null} Saved configuration or null
     */
    loadConfig() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.CONFIG);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Failed to load config:', e);
            return null;
        }
    },

    /**
     * Clear saved configuration
     */
    clearConfig() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CONFIG);
        } catch (e) {
            console.error('Failed to clear config:', e);
        }
    },

    /**
     * Get all saved templates
     * @returns {Array} Array of template objects
     */
    getTemplates() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.TEMPLATES);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load templates:', e);
            return [];
        }
    },

    /**
     * Save a new template
     * @param {string} name - Template name
     * @param {Object} data - Template data (form values)
     * @returns {boolean} Success status
     */
    saveTemplate(name, data) {
        try {
            const templates = this.getTemplates();
            const existingIndex = templates.findIndex(t => t.name === name);

            const template = {
                id: existingIndex >= 0 ? templates[existingIndex].id : Date.now().toString(),
                name: name,
                data: data,
                createdAt: existingIndex >= 0 ? templates[existingIndex].createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (existingIndex >= 0) {
                templates[existingIndex] = template;
            } else {
                templates.push(template);
            }

            localStorage.setItem(CONFIG.STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
            return true;
        } catch (e) {
            console.error('Failed to save template:', e);
            return false;
        }
    },

    /**
     * Load a template by ID
     * @param {string} id - Template ID
     * @returns {Object|null} Template data or null
     */
    loadTemplate(id) {
        const templates = this.getTemplates();
        const template = templates.find(t => t.id === id);
        return template ? template.data : null;
    },

    /**
     * Delete a template by ID
     * @param {string} id - Template ID
     * @returns {boolean} Success status
     */
    deleteTemplate(id) {
        try {
            const templates = this.getTemplates();
            const filtered = templates.filter(t => t.id !== id);
            localStorage.setItem(CONFIG.STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
            return true;
        } catch (e) {
            console.error('Failed to delete template:', e);
            return false;
        }
    },

    /**
     * Export all data as JSON
     * @returns {string} JSON string of all data
     */
    exportData() {
        return JSON.stringify({
            config: this.loadConfig(),
            templates: this.getTemplates(),
            exportedAt: new Date().toISOString()
        }, null, 2);
    },

    /**
     * Import data from JSON
     * @param {string} jsonString - JSON string to import
     * @returns {boolean} Success status
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            if (data.config) {
                this.saveConfig(data.config);
            }

            if (data.templates && Array.isArray(data.templates)) {
                localStorage.setItem(CONFIG.STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
            }

            return true;
        } catch (e) {
            console.error('Failed to import data:', e);
            return false;
        }
    },

    /**
     * Clear all stored data
     */
    clearAll() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CONFIG);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.TEMPLATES);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.LANGUAGE);
        } catch (e) {
            console.error('Failed to clear all data:', e);
        }
    }
};
