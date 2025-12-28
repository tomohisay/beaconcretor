/**
 * Image Request module for direct beacon sending
 */
const ImageRequest = {
    /**
     * Build the full tracking URL
     * @param {Object} config - Configuration object
     * @param {Object} data - All form data
     * @returns {string} Complete tracking URL
     */
    buildURL(config, data) {
        const protocol = config.useSecure ? 'https' : 'http';
        const server = config.useSecure ? (config.secureServer || config.trackingServer) : config.trackingServer;
        const rsid = config.reportSuiteID;
        const random = Math.floor(Math.random() * 10000000000000);

        // Base URL format: https://[server]/b/ss/[rsid]/1/JS-2.x.x-[random]
        let url = `${protocol}://${server}/b/ss/${rsid}/1/${CONFIG.AM_VERSION}-${random}`;

        // Build query string
        const params = this.buildQueryParams(data);

        // Add AQB=1 at start and AQE=1 at end
        url += '?AQB=1&' + params + '&AQE=1';

        return url;
    },

    /**
     * Build query parameters from form data
     * @param {Object} data - All form data
     * @returns {string} URL-encoded query string
     */
    buildQueryParams(data) {
        const params = [];

        // Basic variables
        const basic = data.basic;
        if (basic.pageName) {
            params.push('pageName=' + encodeURIComponent(basic.pageName));
        }
        if (basic.channel) {
            params.push('ch=' + encodeURIComponent(basic.channel));
        }
        if (basic.server) {
            params.push('server=' + encodeURIComponent(basic.server));
        }
        if (basic.pageType) {
            params.push('pageType=' + encodeURIComponent(basic.pageType));
        }
        if (basic.pageURL) {
            params.push('g=' + encodeURIComponent(basic.pageURL));
        }
        if (basic.referrer) {
            params.push('r=' + encodeURIComponent(basic.referrer));
        }
        if (basic.campaign) {
            params.push('v0=' + encodeURIComponent(basic.campaign));
        }
        if (basic.purchaseID) {
            params.push('purchaseID=' + encodeURIComponent(basic.purchaseID));
        }
        if (basic.transactionID) {
            params.push('xact=' + encodeURIComponent(basic.transactionID));
        }
        if (basic.visitorID) {
            params.push('vid=' + encodeURIComponent(basic.visitorID));
        }
        if (basic.characterSet) {
            params.push('ce=' + encodeURIComponent(basic.characterSet));
        }

        // eVars (v1-v250)
        data.evars.forEach(evar => {
            params.push('v' + evar.number + '=' + encodeURIComponent(evar.value));
        });

        // Props (c1-c75)
        data.props.forEach(prop => {
            params.push('c' + prop.number + '=' + encodeURIComponent(prop.value));
        });

        // Events
        if (data.events.length > 0) {
            const eventsStr = VariableBuilder.buildEventsString(data.events);
            params.push('events=' + encodeURIComponent(eventsStr));
        }

        // Products
        if (data.products.length > 0) {
            const productsStr = VariableBuilder.buildProductsString(data.products);
            params.push('products=' + encodeURIComponent(productsStr));
        }

        // List variables
        if (data.lists.list1) {
            params.push('l1=' + encodeURIComponent(data.lists.list1));
        }
        if (data.lists.list2) {
            params.push('l2=' + encodeURIComponent(data.lists.list2));
        }
        if (data.lists.list3) {
            params.push('l3=' + encodeURIComponent(data.lists.list3));
        }

        // Context data
        if (data.contextData.length > 0) {
            // Context data wrapper
            params.push('c.=1');
            data.contextData.forEach(cd => {
                params.push('c.' + encodeURIComponent(cd.key) + '=' + encodeURIComponent(cd.value));
            });
            params.push('.c=1');
        }

        // Timestamp
        params.push('t=' + this.generateTimestamp());

        return params.join('&');
    },

    /**
     * Generate Adobe Analytics timestamp format
     * @returns {string} Encoded timestamp
     */
    generateTimestamp() {
        const d = new Date();
        const offset = d.getTimezoneOffset();
        // Format: DD/MM/YYYY HH:MM:SS D OFFSET
        const timestamp = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ` +
            `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} ` +
            `${d.getDay()} ${offset}`;
        return encodeURIComponent(timestamp);
    },

    /**
     * Send the beacon via image request
     * @param {string} url - The tracking URL
     * @returns {Promise} Resolves with result object
     */
    send(url) {
        return new Promise((resolve) => {
            const img = new Image();

            img.onload = () => {
                resolve({
                    success: true,
                    url: url,
                    message: I18n.t('status.sent')
                });
            };

            img.onerror = () => {
                // Note: Image requests often "error" due to CORS
                // but the beacon is still received by Adobe
                resolve({
                    success: true,
                    url: url,
                    message: I18n.t('status.sent'),
                    note: I18n.t('status.sentNote')
                });
            };

            // Set the src to trigger the request
            img.src = url;

            // Fallback timeout (beacon should be sent quickly)
            setTimeout(() => {
                resolve({
                    success: true,
                    url: url,
                    message: I18n.t('status.sent'),
                    note: I18n.t('status.sentNote')
                });
            }, 3000);
        });
    },

    /**
     * Parse a tracking URL back into parameters (for debugging)
     * @param {string} url - Tracking URL
     * @returns {Object} Parsed parameters
     */
    parseURL(url) {
        const result = {
            base: '',
            params: {}
        };

        try {
            const [base, queryString] = url.split('?');
            result.base = base;

            if (queryString) {
                queryString.split('&').forEach(param => {
                    const [key, value] = param.split('=');
                    result.params[key] = decodeURIComponent(value || '');
                });
            }
        } catch (e) {
            console.error('Failed to parse URL:', e);
        }

        return result;
    }
};
