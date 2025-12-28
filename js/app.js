/**
 * Main Application module
 */
const App = {
    /**
     * Initialize the application
     */
    init() {
        // Initialize i18n first
        I18n.init();

        // Initialize dynamic fields
        DynamicFields.init();

        // Bind event listeners
        this.bindEventListeners();

        // Load saved configuration
        this.loadSavedConfig();

        // Render templates
        this.renderTemplates();

        // Update mode visibility
        this.updateModeVisibility();

        // Check for AppMeasurement.js
        this.checkAppMeasurement();

        console.log('Adobe Analytics Beacon Creator initialized');
    },

    /**
     * Bind all event listeners
     */
    bindEventListeners() {
        // Language toggle
        document.getElementById('lang-toggle')?.addEventListener('click', () => {
            I18n.toggleLanguage();
            this.renderTemplates(); // Re-render templates in new language
        });

        // Mode selection
        document.querySelectorAll('input[name="sendMode"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateModeVisibility());
        });

        // Track type selection
        document.querySelectorAll('input[name="trackType"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateTrackTypeVisibility());
        });

        // Action buttons
        document.getElementById('preview-btn')?.addEventListener('click', () => this.handlePreview());
        document.getElementById('send-btn')?.addEventListener('click', () => this.handleSend());
        document.getElementById('clear-btn')?.addEventListener('click', () => this.handleClear());
        document.getElementById('copy-btn')?.addEventListener('click', () => this.handleCopy());

        // Template save button
        document.getElementById('save-template-btn')?.addEventListener('click', () => this.handleSaveTemplate());

        // Auto-save config on input change
        ['rsid', 'trackingServer', 'secureServer'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.saveConfig());
        });
        document.getElementById('useSecure')?.addEventListener('change', () => this.saveConfig());
    },

    /**
     * Update visibility based on sending mode
     */
    updateModeVisibility() {
        const mode = document.querySelector('input[name="sendMode"]:checked')?.value;
        const appMeasurementOptions = document.getElementById('appMeasurementOptions');

        if (mode === 'appMeasurement') {
            appMeasurementOptions?.classList.remove('hidden');
            this.updateTrackTypeVisibility();
        } else {
            appMeasurementOptions?.classList.add('hidden');
        }
    },

    /**
     * Update visibility based on track type
     */
    updateTrackTypeVisibility() {
        const trackType = document.querySelector('input[name="trackType"]:checked')?.value;
        const linkTrackOptions = document.getElementById('linkTrackOptions');

        if (trackType === 'linkTrack') {
            linkTrackOptions?.classList.remove('hidden');
        } else {
            linkTrackOptions?.classList.add('hidden');
        }
    },

    /**
     * Check if AppMeasurement.js is available
     */
    checkAppMeasurement() {
        // Try to load AppMeasurement.js
        const script = document.createElement('script');
        script.src = 'vendor/AppMeasurement.js';

        script.onload = () => {
            console.log('AppMeasurement.js loaded');
            AppMeasurementSender.checkLoaded();
        };

        script.onerror = () => {
            console.warn('AppMeasurement.js not found. AppMeasurement mode will generate code only.');
        };

        document.head.appendChild(script);
    },

    /**
     * Handle preview button click
     */
    handlePreview() {
        const data = VariableBuilder.collectFormData();
        const validation = VariableBuilder.validateConfig(data.config);

        if (!validation.valid) {
            this.showStatus('error', validation.message);
            return;
        }

        const mode = data.mode.sendMode;
        const preview = PreviewGenerator.generate(mode, data.config, data, data.mode);
        PreviewGenerator.render(preview);

        this.showStatus('info', I18n.t('preview.title'));
    },

    /**
     * Handle send button click
     */
    async handleSend() {
        const data = VariableBuilder.collectFormData();
        const validation = VariableBuilder.validateConfig(data.config);

        if (!validation.valid) {
            this.showStatus('error', validation.message);
            return;
        }

        const mode = data.mode.sendMode;

        if (mode === 'imageRequest') {
            // Direct image request
            const url = ImageRequest.buildURL(data.config, data);

            // Show preview first
            const preview = PreviewGenerator.generateImageRequestPreview(data.config, data);
            PreviewGenerator.render(preview);

            // Send the beacon
            const result = await ImageRequest.send(url);

            if (result.success) {
                this.showStatus('success', result.message + (result.note ? ' ' + result.note : ''));
            } else {
                this.showStatus('error', I18n.t('status.error') + result.error);
            }
        } else {
            // AppMeasurement mode
            if (AppMeasurementSender.checkLoaded()) {
                // Initialize and send
                if (AppMeasurementSender.initialize(data.config)) {
                    AppMeasurementSender.setVariables(data);

                    let result;
                    if (data.mode.trackType === 'linkTrack') {
                        result = AppMeasurementSender.sendLinkTrack(data.mode.linkType, data.mode.linkName);
                    } else {
                        result = AppMeasurementSender.sendPageView();
                    }

                    // Clear vars after sending
                    AppMeasurementSender.clearVars();

                    // Show preview
                    const preview = PreviewGenerator.generateAppMeasurementPreview(data.config, data, data.mode);
                    PreviewGenerator.render(preview);

                    if (result.success) {
                        this.showStatus('success', result.message + ' (' + result.method + ')');
                    } else {
                        this.showStatus('error', I18n.t('status.error') + result.error);
                    }
                } else {
                    this.showStatus('error', I18n.t('status.error') + 'Failed to initialize AppMeasurement');
                }
            } else {
                // AppMeasurement.js not loaded, just show the code
                const preview = PreviewGenerator.generateAppMeasurementPreview(data.config, data, data.mode);
                PreviewGenerator.render(preview);

                this.showStatus('info', 'AppMeasurement.js not loaded. Code generated for manual execution.');
            }
        }
    },

    /**
     * Handle clear button click
     */
    handleClear() {
        VariableBuilder.clearForm();
        PreviewGenerator.clear();
        this.showStatus('info', I18n.t('status.cleared'));
    },

    /**
     * Handle copy button click
     */
    async handleCopy() {
        const success = await PreviewGenerator.copyToClipboard();
        if (success) {
            this.showStatus('success', I18n.t('status.copied'));
        } else {
            this.showStatus('error', I18n.t('status.copyFailed'));
        }
    },

    /**
     * Handle save template button click
     */
    handleSaveTemplate() {
        const nameInput = document.getElementById('templateName');
        const name = nameInput?.value?.trim();

        if (!name) {
            this.showStatus('error', 'Template name is required');
            return;
        }

        const data = VariableBuilder.collectFormData();
        const success = Storage.saveTemplate(name, data);

        if (success) {
            this.showStatus('success', I18n.t('template.saved'));
            nameInput.value = '';
            this.renderTemplates();
        } else {
            this.showStatus('error', 'Failed to save template');
        }
    },

    /**
     * Load a template by ID
     * @param {string} id - Template ID
     */
    loadTemplate(id) {
        const data = Storage.loadTemplate(id);
        if (data) {
            VariableBuilder.setFormData(data);
            this.showStatus('success', I18n.t('template.loaded'));
        }
    },

    /**
     * Delete a template by ID
     * @param {string} id - Template ID
     */
    deleteTemplate(id) {
        if (confirm('Delete this template?')) {
            const success = Storage.deleteTemplate(id);
            if (success) {
                this.showStatus('success', I18n.t('template.deleted'));
                this.renderTemplates();
            }
        }
    },

    /**
     * Render template list
     */
    renderTemplates() {
        const container = document.getElementById('template-list');
        if (!container) return;

        const templates = Storage.getTemplates();

        if (templates.length === 0) {
            container.innerHTML = `<p class="template-empty" data-i18n="template.empty">${I18n.t('template.empty')}</p>`;
            return;
        }

        container.innerHTML = templates.map(template => `
            <div class="template-item">
                <span class="template-item-name">${this.escapeHtml(template.name)}</span>
                <div class="template-item-actions">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="App.loadTemplate('${template.id}')" data-i18n="template.load">${I18n.t('template.load')}</button>
                    <button type="button" class="btn btn-remove btn-sm" onclick="App.deleteTemplate('${template.id}')" data-i18n="template.delete">${I18n.t('template.delete')}</button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Save current configuration
     */
    saveConfig() {
        const config = VariableBuilder.getConfigData();
        Storage.saveConfig(config);
    },

    /**
     * Load saved configuration
     */
    loadSavedConfig() {
        const config = Storage.loadConfig();
        if (config) {
            if (config.reportSuiteID) {
                document.getElementById('rsid').value = config.reportSuiteID;
            }
            if (config.trackingServer) {
                document.getElementById('trackingServer').value = config.trackingServer;
            }
            if (config.secureServer) {
                document.getElementById('secureServer').value = config.secureServer;
            }
            if (typeof config.useSecure === 'boolean') {
                document.getElementById('useSecure').checked = config.useSecure;
            }
        }
    },

    /**
     * Show status message
     * @param {string} type - 'success', 'error', or 'info'
     * @param {string} message - Message to display
     */
    showStatus(type, message) {
        const container = document.getElementById('status-output');
        if (!container) return;

        const className = type === 'success' ? 'status-success' :
                         type === 'error' ? 'status-error' : 'status-info';

        container.innerHTML = `<div class="status-message ${className}">${this.escapeHtml(message)}</div>`;

        // Auto-clear after 5 seconds for success/info
        if (type !== 'error') {
            setTimeout(() => {
                container.innerHTML = '';
            }, 5000);
        }
    },

    /**
     * Escape HTML special characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
