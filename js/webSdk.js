/**
 * Web SDK module for Adobe Experience Platform Edge Network
 */
const WebSdk = {
    /**
     * Build XDM payload from form data
     * @param {Object} data - Form data
     * @param {string} eventType - Event type (pageView, linkClick, custom)
     * @returns {Object} XDM payload
     */
    buildXdmPayload(data, eventType) {
        const xdm = {
            eventType: this.getEventType(eventType),
            timestamp: new Date().toISOString()
        };

        // Web page details
        if (data.basic.pageName || data.basic.pageURL) {
            xdm.web = {
                webPageDetails: {}
            };
            if (data.basic.pageName) {
                xdm.web.webPageDetails.name = data.basic.pageName;
            }
            if (data.basic.pageURL) {
                xdm.web.webPageDetails.URL = data.basic.pageURL;
            }
            if (data.basic.server) {
                xdm.web.webPageDetails.server = data.basic.server;
            }
            if (data.basic.pageType) {
                xdm.web.webPageDetails.pageViews = {
                    value: 1
                };
                if (data.basic.pageType === 'errorPage') {
                    xdm.web.webPageDetails.isErrorPage = true;
                }
            }
        }

        // Web referrer
        if (data.basic.referrer) {
            if (!xdm.web) xdm.web = {};
            xdm.web.webReferrer = {
                URL: data.basic.referrer
            };
        }

        // Marketing (campaign)
        if (data.basic.campaign) {
            xdm.marketing = {
                trackingCode: data.basic.campaign
            };
        }

        // Commerce data
        if (data.products && data.products.length > 0) {
            xdm.commerce = {};
            xdm.productListItems = [];

            // Determine commerce action from events
            const events = data.events.map(e => e.name);
            if (events.includes('purchase')) {
                xdm.commerce.purchases = { value: 1 };
                if (data.basic.purchaseID) {
                    xdm.commerce.order = {
                        purchaseID: data.basic.purchaseID
                    };
                }
            }
            if (events.includes('prodView')) {
                xdm.commerce.productViews = { value: 1 };
            }
            if (events.includes('scAdd')) {
                xdm.commerce.productListAdds = { value: 1 };
            }
            if (events.includes('scRemove')) {
                xdm.commerce.productListRemovals = { value: 1 };
            }
            if (events.includes('scView')) {
                xdm.commerce.productListViews = { value: 1 };
            }
            if (events.includes('scCheckout')) {
                xdm.commerce.checkouts = { value: 1 };
            }

            // Product list items
            data.products.forEach(product => {
                const item = {};
                if (product.name) item.name = product.name;
                if (product.category) item.productCategories = [{ primary: product.category }];
                if (product.quantity) item.quantity = parseInt(product.quantity, 10);
                if (product.price) {
                    item.priceTotal = parseFloat(product.price);
                    item.currencyCode = 'JPY';
                }
                if (Object.keys(item).length > 0) {
                    xdm.productListItems.push(item);
                }
            });
        }

        // Adobe Analytics specific data (for AA mapping)
        xdm._experience = {
            analytics: {
                customDimensions: {
                    eVars: {},
                    props: {}
                },
                event1to100: {},
                event101to200: {},
                event201to300: {},
                event301to400: {},
                event401to500: {}
            }
        };

        // eVars
        data.evars.forEach(evar => {
            xdm._experience.analytics.customDimensions.eVars['eVar' + evar.number] = evar.value;
        });

        // Props
        data.props.forEach(prop => {
            xdm._experience.analytics.customDimensions.props['prop' + prop.number] = prop.value;
        });

        // Events (custom events)
        data.events.forEach(event => {
            if (event.name.startsWith('event')) {
                const eventNum = parseInt(event.name.replace('event', ''), 10);
                const eventValue = event.value ? parseFloat(event.value) : 1;

                let eventGroup;
                if (eventNum <= 100) {
                    eventGroup = 'event1to100';
                } else if (eventNum <= 200) {
                    eventGroup = 'event101to200';
                } else if (eventNum <= 300) {
                    eventGroup = 'event201to300';
                } else if (eventNum <= 400) {
                    eventGroup = 'event301to400';
                } else {
                    eventGroup = 'event401to500';
                }

                xdm._experience.analytics[eventGroup][event.name] = {
                    value: eventValue
                };
                if (event.serialId) {
                    xdm._experience.analytics[eventGroup][event.name].id = event.serialId;
                }
            }
        });

        // List variables
        if (data.lists.list1 || data.lists.list2 || data.lists.list3) {
            xdm._experience.analytics.customDimensions.lists = {};
            if (data.lists.list1) {
                xdm._experience.analytics.customDimensions.lists.list1 = {
                    list: data.lists.list1.split(',').map(v => ({ value: v.trim() }))
                };
            }
            if (data.lists.list2) {
                xdm._experience.analytics.customDimensions.lists.list2 = {
                    list: data.lists.list2.split(',').map(v => ({ value: v.trim() }))
                };
            }
            if (data.lists.list3) {
                xdm._experience.analytics.customDimensions.lists.list3 = {
                    list: data.lists.list3.split(',').map(v => ({ value: v.trim() }))
                };
            }
        }

        // Clean up empty objects
        this.cleanEmptyObjects(xdm);

        return xdm;
    },

    /**
     * Get XDM event type string
     * @param {string} eventType - Internal event type
     * @returns {string} XDM event type
     */
    getEventType(eventType) {
        const eventTypes = {
            pageView: 'web.webpagedetails.pageViews',
            linkClick: 'web.webinteraction.linkClicks',
            custom: 'commerce.custom'
        };
        return eventTypes[eventType] || 'web.webpagedetails.pageViews';
    },

    /**
     * Build the full Edge Network request
     * @param {Object} config - Web SDK config
     * @param {Object} xdm - XDM payload
     * @returns {Object} Full request body
     */
    buildRequest(config, xdm) {
        return {
            events: [
                {
                    xdm: xdm,
                    data: {
                        __adobe: {
                            analytics: this.buildAnalyticsData(xdm)
                        }
                    }
                }
            ]
        };
    },

    /**
     * Build Adobe Analytics specific data object
     * @param {Object} xdm - XDM object
     * @returns {Object} Analytics data
     */
    buildAnalyticsData(xdm) {
        // This allows direct variable mapping for AA
        const analytics = {};

        if (xdm._experience && xdm._experience.analytics) {
            const aa = xdm._experience.analytics;

            // eVars
            if (aa.customDimensions && aa.customDimensions.eVars) {
                Object.keys(aa.customDimensions.eVars).forEach(key => {
                    analytics[key] = aa.customDimensions.eVars[key];
                });
            }

            // Props
            if (aa.customDimensions && aa.customDimensions.props) {
                Object.keys(aa.customDimensions.props).forEach(key => {
                    analytics[key] = aa.customDimensions.props[key];
                });
            }
        }

        return analytics;
    },

    /**
     * Build the Edge Network endpoint URL
     * @param {Object} config - Web SDK config
     * @returns {string} Endpoint URL
     */
    buildEndpointURL(config) {
        const edgeDomain = config.edgeDomain || 'edge.adobedc.net';
        const datastreamId = config.datastreamId;

        // Format: https://edge.adobedc.net/ee/v2/collect?datastreamId=xxx
        return `https://${edgeDomain}/ee/v2/collect?datastreamId=${datastreamId}`;
    },

    /**
     * Send beacon via Web SDK (Edge Network)
     * @param {Object} config - Web SDK config
     * @param {Object} data - Form data
     * @param {string} eventType - Event type
     * @returns {Promise} Result promise
     */
    async send(config, data, eventType) {
        const xdm = this.buildXdmPayload(data, eventType);
        const requestBody = this.buildRequest(config, xdm);
        const url = this.buildEndpointURL(config);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-adobe-edge-config-id': config.datastreamId
                },
                body: JSON.stringify(requestBody),
                mode: 'cors'
            });

            if (response.ok) {
                return {
                    success: true,
                    message: I18n.t('status.sent'),
                    status: response.status
                };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${errorText}`
                };
            }
        } catch (error) {
            // CORS error or network error
            return {
                success: true,
                message: I18n.t('status.sent'),
                note: I18n.t('status.sentNote')
            };
        }
    },

    /**
     * Generate JavaScript code for Web SDK implementation
     * @param {Object} config - Web SDK config
     * @param {Object} data - Form data
     * @param {string} eventType - Event type
     * @returns {string} JavaScript code
     */
    generateCode(config, data, eventType) {
        const xdm = this.buildXdmPayload(data, eventType);

        let code = '// Adobe Experience Platform Web SDK\n';
        code += '// Requires alloy.js to be loaded\n\n';

        code += '// Configuration (run once on page load)\n';
        code += 'alloy("configure", {\n';
        code += `  datastreamId: "${config.datastreamId}",\n`;
        if (config.orgId) {
            code += `  orgId: "${config.orgId}",\n`;
        }
        if (config.edgeDomain && config.edgeDomain !== 'edge.adobedc.net') {
            code += `  edgeDomain: "${config.edgeDomain}",\n`;
        }
        code += '});\n\n';

        code += '// Send event\n';
        code += 'alloy("sendEvent", {\n';
        code += '  xdm: ' + JSON.stringify(xdm, null, 4).replace(/\n/g, '\n  ') + '\n';
        code += '});\n';

        return code;
    },

    /**
     * Generate curl command for testing
     * @param {Object} config - Web SDK config
     * @param {Object} data - Form data
     * @param {string} eventType - Event type
     * @returns {string} curl command
     */
    generateCurl(config, data, eventType) {
        const xdm = this.buildXdmPayload(data, eventType);
        const requestBody = this.buildRequest(config, xdm);
        const url = this.buildEndpointURL(config);

        let curl = 'curl -X POST \\\n';
        curl += `  '${url}' \\\n`;
        curl += '  -H \'Content-Type: application/json\' \\\n';
        curl += `  -H 'x-adobe-edge-config-id: ${config.datastreamId}' \\\n`;
        curl += `  -d '${JSON.stringify(requestBody)}'`;

        return curl;
    },

    /**
     * Validate Web SDK configuration
     * @param {Object} config - Web SDK config
     * @returns {Object} Validation result
     */
    validateConfig(config) {
        if (!config.datastreamId) {
            return { valid: false, message: I18n.t('websdk.datastreamRequired') };
        }
        // UUID format validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(config.datastreamId)) {
            return { valid: false, message: I18n.t('websdk.invalidDatastreamId') };
        }
        return { valid: true };
    },

    /**
     * Get Web SDK config from form
     * @returns {Object} Web SDK config
     */
    getConfig() {
        return {
            datastreamId: document.getElementById('datastreamId')?.value?.trim() || '',
            orgId: document.getElementById('orgId')?.value?.trim() || '',
            edgeDomain: document.getElementById('edgeDomain')?.value?.trim() || 'edge.adobedc.net'
        };
    },

    /**
     * Get selected event type
     * @returns {string} Event type
     */
    getEventType() {
        return document.querySelector('input[name="webSdkEventType"]:checked')?.value || 'pageView';
    },

    /**
     * Remove empty objects from payload
     * @param {Object} obj - Object to clean
     */
    cleanEmptyObjects(obj) {
        Object.keys(obj).forEach(key => {
            if (obj[key] && typeof obj[key] === 'object') {
                this.cleanEmptyObjects(obj[key]);
                if (Object.keys(obj[key]).length === 0) {
                    delete obj[key];
                }
            }
        });
    }
};
