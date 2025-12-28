/**
 * Preview Generator module for displaying request previews
 */
const PreviewGenerator = {
    lastPreview: null,

    /**
     * Generate preview based on selected mode
     * @param {string} mode - 'imageRequest' or 'appMeasurement'
     * @param {Object} config - Configuration object
     * @param {Object} data - Form data
     * @param {Object} modeData - Mode settings
     * @returns {Object} Preview result
     */
    generate(mode, config, data, modeData) {
        if (mode === 'imageRequest') {
            return this.generateImageRequestPreview(config, data);
        } else {
            return this.generateAppMeasurementPreview(config, data, modeData);
        }
    },

    /**
     * Generate image request URL preview
     * @param {Object} config - Configuration object
     * @param {Object} data - Form data
     * @returns {Object} Preview result
     */
    generateImageRequestPreview(config, data) {
        const url = ImageRequest.buildURL(config, data);
        const formatted = this.formatURLForDisplay(url);

        this.lastPreview = {
            type: 'url',
            raw: url,
            formatted: formatted,
            length: url.length,
            warning: url.length > CONFIG.MAX_URL_LENGTH
        };

        return this.lastPreview;
    },

    /**
     * Generate AppMeasurement code preview
     * @param {Object} config - Configuration object
     * @param {Object} data - Form data
     * @param {Object} modeData - Mode settings
     * @returns {Object} Preview result
     */
    generateAppMeasurementPreview(config, data, modeData) {
        const code = AppMeasurementSender.generateCode(config, data, modeData);

        this.lastPreview = {
            type: 'code',
            code: code,
            raw: code
        };

        return this.lastPreview;
    },

    /**
     * Generate Web SDK preview
     * @param {Object} config - Web SDK configuration
     * @param {Object} data - Form data
     * @param {string} eventType - Event type
     * @returns {Object} Preview result
     */
    generateWebSdkPreview(config, data, eventType) {
        const code = WebSdk.generateCode(config, data, eventType);
        const curl = WebSdk.generateCurl(config, data, eventType);

        const fullPreview = code + '\n\n// ---- cURL Command ----\n' + curl;

        this.lastPreview = {
            type: 'code',
            code: fullPreview,
            raw: fullPreview
        };

        return this.lastPreview;
    },

    /**
     * Format URL for display with syntax highlighting
     * @param {string} url - Raw URL
     * @returns {string} HTML formatted URL
     */
    formatURLForDisplay(url) {
        // Split URL into base and query string
        const questionMarkIndex = url.indexOf('?');
        if (questionMarkIndex === -1) {
            return this.escapeHtml(url);
        }

        const base = url.substring(0, questionMarkIndex);
        const queryString = url.substring(questionMarkIndex + 1);

        // Format base URL
        let html = `<span class="url-part">${this.escapeHtml(base)}</span>\n`;
        html += '?';

        // Format parameters
        const params = queryString.split('&');
        params.forEach((param, index) => {
            const [key, value] = param.split('=');
            if (index > 0) {
                html += '\n&';
            }
            html += `<span class="param-key">${this.escapeHtml(key)}</span>`;
            if (value !== undefined) {
                html += `=<span class="param-value">${this.escapeHtml(decodeURIComponent(value))}</span>`;
            }
        });

        return html;
    },

    /**
     * Render preview to the DOM
     * @param {Object} preview - Preview result object
     */
    render(preview) {
        const container = document.getElementById('preview-output');
        const urlLengthContainer = document.getElementById('url-length');
        const urlLengthValue = document.getElementById('url-length-value');
        const urlWarning = document.getElementById('url-warning');

        if (!container) return;

        if (preview.type === 'url') {
            container.innerHTML = preview.formatted;

            // Show URL length
            if (urlLengthContainer && urlLengthValue) {
                urlLengthContainer.classList.remove('hidden');
                urlLengthValue.textContent = preview.length;

                if (preview.warning && urlWarning) {
                    urlWarning.classList.remove('hidden');
                } else if (urlWarning) {
                    urlWarning.classList.add('hidden');
                }
            }
        } else if (preview.type === 'code') {
            container.innerHTML = this.escapeHtml(preview.code);

            // Hide URL length for code preview
            if (urlLengthContainer) {
                urlLengthContainer.classList.add('hidden');
            }
        }
    },

    /**
     * Get the raw content for clipboard
     * @returns {string} Raw preview content
     */
    getRawContent() {
        if (!this.lastPreview) return '';
        return this.lastPreview.raw || '';
    },

    /**
     * Copy preview content to clipboard
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard() {
        const content = this.getRawContent();
        if (!content) {
            return false;
        }

        try {
            await navigator.clipboard.writeText(content);
            return true;
        } catch (e) {
            // Fallback for older browsers
            try {
                const textArea = document.createElement('textarea');
                textArea.value = content;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                const result = document.execCommand('copy');
                document.body.removeChild(textArea);
                return result;
            } catch (fallbackError) {
                console.error('Failed to copy:', fallbackError);
                return false;
            }
        }
    },

    /**
     * Clear the preview display
     */
    clear() {
        const container = document.getElementById('preview-output');
        const urlLengthContainer = document.getElementById('url-length');

        if (container) {
            container.innerHTML = `<p class="placeholder-text" data-i18n="preview.placeholder">${I18n.t('preview.placeholder')}</p>`;
        }
        if (urlLengthContainer) {
            urlLengthContainer.classList.add('hidden');
        }

        this.lastPreview = null;
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
