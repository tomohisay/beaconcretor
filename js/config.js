/**
 * Configuration constants for Adobe Analytics Beacon Creator
 */
const CONFIG = {
    // Query parameter mappings for image request
    PARAM_MAP: {
        pageName: 'pageName',
        channel: 'ch',
        server: 'server',
        pageType: 'pageType',
        referrer: 'r',
        pageURL: 'g',
        characterSet: 'ce',
        campaign: 'v0',
        purchaseID: 'purchaseID',
        transactionID: 'xact',
        visitorID: 'vid',
        events: 'events',
        products: 'products',
        timestamp: 't'
    },

    // Variable prefixes for image request
    EVAR_PREFIX: 'v',      // v1, v2, ... v250
    PROP_PREFIX: 'c',      // c1, c2, ... c75
    LIST_PREFIX: 'l',      // l1, l2, l3

    // Limits
    MAX_EVARS: 250,
    MAX_PROPS: 75,
    MAX_LISTS: 3,
    MAX_EVENTS: 1000,
    MAX_URL_LENGTH: 2048,

    // Standard events list
    STANDARD_EVENTS: [
        { value: 'purchase', label: 'purchase' },
        { value: 'prodView', label: 'prodView' },
        { value: 'scOpen', label: 'scOpen' },
        { value: 'scAdd', label: 'scAdd' },
        { value: 'scRemove', label: 'scRemove' },
        { value: 'scView', label: 'scView' },
        { value: 'scCheckout', label: 'scCheckout' }
    ],

    // Link types for s.tl()
    LINK_TYPES: [
        { value: 'o', label: 'Custom Link (o)' },
        { value: 'd', label: 'Download Link (d)' },
        { value: 'e', label: 'Exit Link (e)' }
    ],

    // AppMeasurement version string for image request URL
    AM_VERSION: 'JS-2.22.0',

    // Storage keys
    STORAGE_KEYS: {
        CONFIG: 'aa_beacon_config',
        TEMPLATES: 'aa_beacon_templates',
        LANGUAGE: 'aa_beacon_language'
    },

    // Default configuration values
    DEFAULTS: {
        characterSet: 'UTF-8',
        useSecure: true,
        sendMode: 'imageRequest',
        trackType: 'pageView',
        linkType: 'o',
        language: 'ja'
    }
};

// Freeze the config to prevent modification
Object.freeze(CONFIG);
Object.freeze(CONFIG.PARAM_MAP);
Object.freeze(CONFIG.STANDARD_EVENTS);
Object.freeze(CONFIG.LINK_TYPES);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.DEFAULTS);
