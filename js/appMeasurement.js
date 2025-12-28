/**
 * AppMeasurement wrapper module
 */
const AppMeasurementSender = {
    s: null,
    isLoaded: false,

    /**
     * Check if AppMeasurement.js is loaded
     * @returns {boolean} True if loaded
     */
    checkLoaded() {
        this.isLoaded = typeof s_gi === 'function';
        return this.isLoaded;
    },

    /**
     * Initialize AppMeasurement instance
     * @param {Object} config - Configuration object
     * @returns {boolean} Success status
     */
    initialize(config) {
        if (!this.checkLoaded()) {
            console.warn('AppMeasurement.js is not loaded');
            return false;
        }

        try {
            // Get or create s object
            this.s = s_gi(config.reportSuiteID);
            this.s.trackingServer = config.trackingServer;

            if (config.useSecure) {
                this.s.trackingServerSecure = config.secureServer || config.trackingServer;
            }

            this.s.charSet = 'UTF-8';
            this.s.currencyCode = 'JPY';

            return true;
        } catch (e) {
            console.error('Failed to initialize AppMeasurement:', e);
            return false;
        }
    },

    /**
     * Set all variables on the s object
     * @param {Object} data - Form data
     */
    setVariables(data) {
        const s = this.s;
        if (!s) return;

        // Clear previous values
        this.clearVars();

        // Basic variables
        const basic = data.basic;
        if (basic.pageName) s.pageName = basic.pageName;
        if (basic.channel) s.channel = basic.channel;
        if (basic.server) s.server = basic.server;
        if (basic.pageType) s.pageType = basic.pageType;
        if (basic.pageURL) s.pageURL = basic.pageURL;
        if (basic.referrer) s.referrer = basic.referrer;
        if (basic.campaign) s.campaign = basic.campaign;
        if (basic.purchaseID) s.purchaseID = basic.purchaseID;
        if (basic.transactionID) s.transactionID = basic.transactionID;
        if (basic.visitorID) s.visitorID = basic.visitorID;
        if (basic.characterSet) s.charSet = basic.characterSet;

        // eVars
        data.evars.forEach(evar => {
            s['eVar' + evar.number] = evar.value;
        });

        // Props
        data.props.forEach(prop => {
            s['prop' + prop.number] = prop.value;
        });

        // Events
        if (data.events.length > 0) {
            s.events = VariableBuilder.buildEventsString(data.events);
        }

        // Products
        if (data.products.length > 0) {
            s.products = VariableBuilder.buildProductsString(data.products);
        }

        // List variables
        if (data.lists.list1) s.list1 = data.lists.list1;
        if (data.lists.list2) s.list2 = data.lists.list2;
        if (data.lists.list3) s.list3 = data.lists.list3;

        // Context data
        if (!s.contextData) s.contextData = {};
        data.contextData.forEach(cd => {
            s.contextData[cd.key] = cd.value;
        });
    },

    /**
     * Send page view tracking call
     * @returns {Object} Result object
     */
    sendPageView() {
        if (!this.s) {
            return { success: false, error: 'AppMeasurement not initialized' };
        }

        try {
            this.s.t();
            return {
                success: true,
                method: 's.t()',
                message: I18n.t('status.sent')
            };
        } catch (e) {
            return {
                success: false,
                error: e.message
            };
        }
    },

    /**
     * Send link tracking call
     * @param {string} linkType - Link type (o, d, e)
     * @param {string} linkName - Link name
     * @returns {Object} Result object
     */
    sendLinkTrack(linkType, linkName) {
        if (!this.s) {
            return { success: false, error: 'AppMeasurement not initialized' };
        }

        try {
            this.s.tl(true, linkType || 'o', linkName || 'Custom Link');
            return {
                success: true,
                method: 's.tl()',
                message: I18n.t('status.sent')
            };
        } catch (e) {
            return {
                success: false,
                error: e.message
            };
        }
    },

    /**
     * Clear all variables
     */
    clearVars() {
        if (!this.s) return;

        try {
            if (typeof this.s.clearVars === 'function') {
                this.s.clearVars();
            } else {
                // Manual clear if clearVars not available
                this.s.pageName = '';
                this.s.channel = '';
                this.s.server = '';
                this.s.pageType = '';
                this.s.pageURL = '';
                this.s.referrer = '';
                this.s.campaign = '';
                this.s.purchaseID = '';
                this.s.transactionID = '';
                this.s.events = '';
                this.s.products = '';
                this.s.list1 = '';
                this.s.list2 = '';
                this.s.list3 = '';

                // Clear eVars and props
                for (let i = 1; i <= 250; i++) {
                    this.s['eVar' + i] = '';
                }
                for (let i = 1; i <= 75; i++) {
                    this.s['prop' + i] = '';
                }

                // Clear context data
                this.s.contextData = {};
            }
        } catch (e) {
            console.error('Failed to clear vars:', e);
        }
    },

    /**
     * Generate JavaScript code for the current settings
     * @param {Object} config - Configuration object
     * @param {Object} data - Form data
     * @param {Object} mode - Mode settings
     * @returns {string} JavaScript code
     */
    generateCode(config, data, mode) {
        let code = '// Adobe Analytics AppMeasurement Configuration\n';
        code += `var s = s_gi("${config.reportSuiteID}");\n`;
        code += `s.trackingServer = "${config.trackingServer}";\n`;

        if (config.useSecure) {
            code += `s.trackingServerSecure = "${config.secureServer || config.trackingServer}";\n`;
        }

        code += `s.charSet = "${data.basic.characterSet || 'UTF-8'}";\n`;
        code += '\n// Variables\n';

        // Basic variables
        const basic = data.basic;
        if (basic.pageName) code += `s.pageName = "${this.escapeJS(basic.pageName)}";\n`;
        if (basic.channel) code += `s.channel = "${this.escapeJS(basic.channel)}";\n`;
        if (basic.server) code += `s.server = "${this.escapeJS(basic.server)}";\n`;
        if (basic.pageType) code += `s.pageType = "${this.escapeJS(basic.pageType)}";\n`;
        if (basic.pageURL) code += `s.pageURL = "${this.escapeJS(basic.pageURL)}";\n`;
        if (basic.referrer) code += `s.referrer = "${this.escapeJS(basic.referrer)}";\n`;
        if (basic.campaign) code += `s.campaign = "${this.escapeJS(basic.campaign)}";\n`;
        if (basic.purchaseID) code += `s.purchaseID = "${this.escapeJS(basic.purchaseID)}";\n`;
        if (basic.transactionID) code += `s.transactionID = "${this.escapeJS(basic.transactionID)}";\n`;
        if (basic.visitorID) code += `s.visitorID = "${this.escapeJS(basic.visitorID)}";\n`;

        // eVars
        if (data.evars.length > 0) {
            code += '\n// eVars\n';
            data.evars.forEach(evar => {
                code += `s.eVar${evar.number} = "${this.escapeJS(evar.value)}";\n`;
            });
        }

        // Props
        if (data.props.length > 0) {
            code += '\n// Props\n';
            data.props.forEach(prop => {
                code += `s.prop${prop.number} = "${this.escapeJS(prop.value)}";\n`;
            });
        }

        // Events
        if (data.events.length > 0) {
            code += '\n// Events\n';
            const eventsStr = VariableBuilder.buildEventsString(data.events);
            code += `s.events = "${this.escapeJS(eventsStr)}";\n`;
        }

        // Products
        if (data.products.length > 0) {
            code += '\n// Products\n';
            const productsStr = VariableBuilder.buildProductsString(data.products);
            code += `s.products = "${this.escapeJS(productsStr)}";\n`;
        }

        // List variables
        if (data.lists.list1 || data.lists.list2 || data.lists.list3) {
            code += '\n// List Variables\n';
            if (data.lists.list1) code += `s.list1 = "${this.escapeJS(data.lists.list1)}";\n`;
            if (data.lists.list2) code += `s.list2 = "${this.escapeJS(data.lists.list2)}";\n`;
            if (data.lists.list3) code += `s.list3 = "${this.escapeJS(data.lists.list3)}";\n`;
        }

        // Context data
        if (data.contextData.length > 0) {
            code += '\n// Context Data\n';
            data.contextData.forEach(cd => {
                code += `s.contextData["${this.escapeJS(cd.key)}"] = "${this.escapeJS(cd.value)}";\n`;
            });
        }

        // Track call
        code += '\n// Send beacon\n';
        if (mode.trackType === 'linkTrack') {
            code += `s.tl(true, "${mode.linkType}", "${this.escapeJS(mode.linkName)}");\n`;
        } else {
            code += 's.t();\n';
        }

        return code;
    },

    /**
     * Escape string for JavaScript
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeJS(str) {
        if (!str) return '';
        return str
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    }
};
