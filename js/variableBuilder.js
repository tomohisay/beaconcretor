/**
 * Variable Builder module for collecting and building Adobe Analytics variables
 */
const VariableBuilder = {
    /**
     * Collect all form data into a structured object
     * @returns {Object} All form data
     */
    collectFormData() {
        return {
            config: this.getConfigData(),
            mode: this.getModeData(),
            basic: this.getBasicVariables(),
            evars: DynamicFields.getEvars(),
            props: DynamicFields.getProps(),
            events: DynamicFields.getEvents(),
            products: DynamicFields.getProducts(),
            lists: this.getListVariables(),
            contextData: DynamicFields.getContextData()
        };
    },

    /**
     * Get configuration data
     * @returns {Object} Configuration object
     */
    getConfigData() {
        return {
            reportSuiteID: document.getElementById('rsid')?.value?.trim() || '',
            trackingServer: document.getElementById('trackingServer')?.value?.trim() || '',
            secureServer: document.getElementById('secureServer')?.value?.trim() || '',
            useSecure: document.getElementById('useSecure')?.checked ?? true
        };
    },

    /**
     * Get sending mode data
     * @returns {Object} Mode configuration
     */
    getModeData() {
        const sendMode = document.querySelector('input[name="sendMode"]:checked')?.value || 'imageRequest';
        const trackType = document.querySelector('input[name="trackType"]:checked')?.value || 'pageView';
        const linkType = document.getElementById('linkType')?.value || 'o';
        const linkName = document.getElementById('linkName')?.value?.trim() || 'Custom Link';

        return {
            sendMode,
            trackType,
            linkType,
            linkName
        };
    },

    /**
     * Get basic variables from form
     * @returns {Object} Basic variables
     */
    getBasicVariables() {
        return {
            pageName: document.getElementById('pageName')?.value?.trim() || '',
            channel: document.getElementById('channel')?.value?.trim() || '',
            server: document.getElementById('server')?.value?.trim() || '',
            pageType: document.getElementById('pageType')?.value?.trim() || '',
            pageURL: document.getElementById('pageURL')?.value?.trim() || '',
            referrer: document.getElementById('referrer')?.value?.trim() || '',
            campaign: document.getElementById('campaign')?.value?.trim() || '',
            purchaseID: document.getElementById('purchaseID')?.value?.trim() || '',
            transactionID: document.getElementById('transactionID')?.value?.trim() || '',
            visitorID: document.getElementById('visitorID')?.value?.trim() || '',
            characterSet: document.getElementById('characterSet')?.value?.trim() || 'UTF-8'
        };
    },

    /**
     * Get list variables
     * @returns {Object} List variables
     */
    getListVariables() {
        return {
            list1: document.getElementById('list1')?.value?.trim() || '',
            list2: document.getElementById('list2')?.value?.trim() || '',
            list3: document.getElementById('list3')?.value?.trim() || ''
        };
    },

    /**
     * Build events string from events array
     * Format: "event1,event2=5,event3:serialID,event4=10:serialID"
     * @param {Array} events - Array of event objects
     * @returns {string} Formatted events string
     */
    buildEventsString(events) {
        if (!events || events.length === 0) return '';

        return events.map(e => {
            let str = e.name;
            if (e.value) {
                str += '=' + e.value;
            }
            if (e.serialId) {
                str += ':' + e.serialId;
            }
            return str;
        }).join(',');
    },

    /**
     * Build products string from products array
     * Format: "category;product;qty;price;events;evars" per product, comma separated
     * @param {Array} products - Array of product objects
     * @returns {string} Formatted products string
     */
    buildProductsString(products) {
        if (!products || products.length === 0) return '';

        return products.map(p => {
            const parts = [
                p.category || '',
                p.name || '',
                p.quantity || '',
                p.price || ''
            ];

            // Handle product-level events and evars
            // Convert pipe (|) separated to comma for events
            let productEvents = '';
            if (p.events) {
                productEvents = p.events.replace(/\|/g, ',');
            }

            // Convert pipe separated eVars to proper format
            let productEvars = '';
            if (p.evars) {
                productEvars = p.evars.replace(/\|/g, '|');
            }

            // Add events and evars if present
            if (productEvents || productEvars) {
                parts.push(productEvents);
                if (productEvars) {
                    parts.push(productEvars);
                }
            }

            return parts.join(';');
        }).join(',');
    },

    /**
     * Validate required configuration
     * @param {Object} config - Configuration object
     * @returns {Object} Validation result {valid: boolean, message: string}
     */
    validateConfig(config) {
        if (!config.reportSuiteID) {
            return { valid: false, message: I18n.t('status.configRequired') };
        }
        if (!config.trackingServer) {
            return { valid: false, message: I18n.t('status.configRequired') };
        }
        return { valid: true };
    },

    /**
     * Set form data from a template or saved data
     * @param {Object} data - Form data object
     */
    setFormData(data) {
        if (!data) return;

        // Set config
        if (data.config) {
            if (data.config.reportSuiteID) {
                document.getElementById('rsid').value = data.config.reportSuiteID;
            }
            if (data.config.trackingServer) {
                document.getElementById('trackingServer').value = data.config.trackingServer;
            }
            if (data.config.secureServer) {
                document.getElementById('secureServer').value = data.config.secureServer;
            }
            if (typeof data.config.useSecure === 'boolean') {
                document.getElementById('useSecure').checked = data.config.useSecure;
            }
        }

        // Set mode
        if (data.mode) {
            if (data.mode.sendMode) {
                const modeRadio = document.querySelector(`input[name="sendMode"][value="${data.mode.sendMode}"]`);
                if (modeRadio) modeRadio.checked = true;
            }
            if (data.mode.trackType) {
                const trackRadio = document.querySelector(`input[name="trackType"][value="${data.mode.trackType}"]`);
                if (trackRadio) trackRadio.checked = true;
            }
            if (data.mode.linkType) {
                document.getElementById('linkType').value = data.mode.linkType;
            }
            if (data.mode.linkName) {
                document.getElementById('linkName').value = data.mode.linkName;
            }
        }

        // Set basic variables
        if (data.basic) {
            Object.keys(data.basic).forEach(key => {
                const element = document.getElementById(key);
                if (element && data.basic[key]) {
                    element.value = data.basic[key];
                }
            });
        }

        // Set list variables
        if (data.lists) {
            if (data.lists.list1) document.getElementById('list1').value = data.lists.list1;
            if (data.lists.list2) document.getElementById('list2').value = data.lists.list2;
            if (data.lists.list3) document.getElementById('list3').value = data.lists.list3;
        }

        // Set dynamic fields
        if (data.evars && data.evars.length > 0) {
            DynamicFields.setEvars(data.evars);
        }
        if (data.props && data.props.length > 0) {
            DynamicFields.setProps(data.props);
        }
        if (data.events && data.events.length > 0) {
            DynamicFields.setEvents(data.events);
        }
        if (data.products && data.products.length > 0) {
            DynamicFields.setProducts(data.products);
        }
        if (data.contextData && data.contextData.length > 0) {
            DynamicFields.setContextData(data.contextData);
        }

        // Update mode visibility
        if (typeof App !== 'undefined' && App.updateModeVisibility) {
            App.updateModeVisibility();
        }
    },

    /**
     * Clear all form fields
     */
    clearForm() {
        // Clear config fields
        document.getElementById('rsid').value = '';
        document.getElementById('trackingServer').value = '';
        document.getElementById('secureServer').value = '';
        document.getElementById('useSecure').checked = true;

        // Reset mode
        document.querySelector('input[name="sendMode"][value="imageRequest"]').checked = true;
        document.querySelector('input[name="trackType"][value="pageView"]').checked = true;
        document.getElementById('linkType').value = 'o';
        document.getElementById('linkName').value = '';

        // Clear basic variables
        ['pageName', 'channel', 'server', 'pageType', 'pageURL', 'referrer',
         'campaign', 'purchaseID', 'transactionID', 'visitorID'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        document.getElementById('characterSet').value = 'UTF-8';

        // Clear list variables
        document.getElementById('list1').value = '';
        document.getElementById('list2').value = '';
        document.getElementById('list3').value = '';

        // Clear dynamic fields
        DynamicFields.clearAll();

        // Clear preview and status
        document.getElementById('preview-output').innerHTML =
            `<p class="placeholder-text" data-i18n="preview.placeholder">${I18n.t('preview.placeholder')}</p>`;
        document.getElementById('url-length').classList.add('hidden');
        document.getElementById('status-output').innerHTML = '';

        // Update mode visibility
        if (typeof App !== 'undefined' && App.updateModeVisibility) {
            App.updateModeVisibility();
        }
    }
};
