/**
 * Dynamic Fields module for managing eVar, prop, event, product, and context data fields
 */
const DynamicFields = {
    // Track field counters for unique IDs
    counters: {
        evar: 0,
        prop: 0,
        event: 0,
        product: 0,
        context: 0
    },

    /**
     * Initialize dynamic fields module
     */
    init() {
        this.bindEventListeners();
    },

    /**
     * Bind event listeners for add buttons
     */
    bindEventListeners() {
        document.getElementById('add-evar-btn')?.addEventListener('click', () => this.addEvar());
        document.getElementById('add-prop-btn')?.addEventListener('click', () => this.addProp());
        document.getElementById('add-event-btn')?.addEventListener('click', () => this.addEvent());
        document.getElementById('add-product-btn')?.addEventListener('click', () => this.addProduct());
        document.getElementById('add-context-btn')?.addEventListener('click', () => this.addContextData());
    },

    /**
     * Generate event select options HTML
     * @returns {string} HTML string for event options
     */
    generateEventOptions() {
        let html = `<option value="">${I18n.t('common.select')}</option>`;

        // Standard events
        html += '<optgroup label="Standard Events">';
        CONFIG.STANDARD_EVENTS.forEach(event => {
            html += `<option value="${event.value}">${event.label}</option>`;
        });
        html += '</optgroup>';

        // Custom events (event1 - event1000, show first 100 for practical use)
        html += `<optgroup label="${I18n.t('common.customEvent')}">`;
        for (let i = 1; i <= 100; i++) {
            html += `<option value="event${i}">event${i}</option>`;
        }
        html += '</optgroup>';

        return html;
    },

    /**
     * Add an eVar field
     * @param {number} varNumber - Optional specific eVar number
     * @param {string} value - Optional preset value
     */
    addEvar(varNumber = null, value = '') {
        const container = document.getElementById('evars-container');
        if (!container) return;

        this.counters.evar++;
        const id = `evar-row-${this.counters.evar}`;
        const defaultNum = varNumber || 1;

        const row = document.createElement('div');
        row.className = 'dynamic-field-row evar-row';
        row.id = id;
        row.innerHTML = `
            <div class="form-group">
                <label data-i18n="evars.number">${I18n.t('evars.number')}</label>
                <input type="number" class="var-number-input evar-number" min="1" max="${CONFIG.MAX_EVARS}" value="${defaultNum}">
            </div>
            <div class="form-group">
                <label data-i18n="evars.value">${I18n.t('evars.value')}</label>
                <input type="text" class="evar-value" value="${this.escapeHtml(value)}" placeholder="eVar${defaultNum} value">
            </div>
            <button type="button" class="btn btn-remove" onclick="DynamicFields.removeField('${id}')" data-i18n="common.remove">${I18n.t('common.remove')}</button>
        `;

        container.appendChild(row);
    },

    /**
     * Add a prop field
     * @param {number} varNumber - Optional specific prop number
     * @param {string} value - Optional preset value
     */
    addProp(varNumber = null, value = '') {
        const container = document.getElementById('props-container');
        if (!container) return;

        this.counters.prop++;
        const id = `prop-row-${this.counters.prop}`;
        const defaultNum = varNumber || 1;

        const row = document.createElement('div');
        row.className = 'dynamic-field-row prop-row';
        row.id = id;
        row.innerHTML = `
            <div class="form-group">
                <label data-i18n="props.number">${I18n.t('props.number')}</label>
                <input type="number" class="var-number-input prop-number" min="1" max="${CONFIG.MAX_PROPS}" value="${defaultNum}">
            </div>
            <div class="form-group">
                <label data-i18n="props.value">${I18n.t('props.value')}</label>
                <input type="text" class="prop-value" value="${this.escapeHtml(value)}" placeholder="prop${defaultNum} value">
            </div>
            <button type="button" class="btn btn-remove" onclick="DynamicFields.removeField('${id}')" data-i18n="common.remove">${I18n.t('common.remove')}</button>
        `;

        container.appendChild(row);
    },

    /**
     * Add an event field
     * @param {string} eventName - Optional event name
     * @param {string} eventValue - Optional event value
     * @param {string} serialId - Optional serialization ID
     */
    addEvent(eventName = '', eventValue = '', serialId = '') {
        const container = document.getElementById('events-container');
        if (!container) return;

        this.counters.event++;
        const id = `event-row-${this.counters.event}`;

        const row = document.createElement('div');
        row.className = 'dynamic-field-row event-row';
        row.id = id;
        row.innerHTML = `
            <div class="form-group">
                <label data-i18n="events.name">${I18n.t('events.name')}</label>
                <select class="event-select event-name">
                    ${this.generateEventOptions()}
                </select>
            </div>
            <div class="form-group">
                <label data-i18n="events.value">${I18n.t('events.value')}</label>
                <input type="text" class="event-value" value="${this.escapeHtml(eventValue)}" placeholder="e.g., 5">
            </div>
            <div class="form-group">
                <label data-i18n="events.serialId">${I18n.t('events.serialId')}</label>
                <input type="text" class="event-serial" value="${this.escapeHtml(serialId)}" placeholder="e.g., ABC123">
            </div>
            <button type="button" class="btn btn-remove" onclick="DynamicFields.removeField('${id}')" data-i18n="common.remove">${I18n.t('common.remove')}</button>
        `;

        container.appendChild(row);

        // Set selected event if provided
        if (eventName) {
            const select = row.querySelector('.event-name');
            select.value = eventName;
        }
    },

    /**
     * Add a product field
     * @param {Object} product - Optional product data
     */
    addProduct(product = null) {
        const container = document.getElementById('products-container');
        if (!container) return;

        this.counters.product++;
        const id = `product-row-${this.counters.product}`;

        const p = product || { category: '', name: '', quantity: '', price: '', events: '', evars: '' };

        const row = document.createElement('div');
        row.className = 'dynamic-field-row product-row';
        row.id = id;
        row.innerHTML = `
            <div class="form-group">
                <label data-i18n="products.category">${I18n.t('products.category')}</label>
                <input type="text" class="product-category" value="${this.escapeHtml(p.category)}" placeholder="Category">
            </div>
            <div class="form-group">
                <label data-i18n="products.name">${I18n.t('products.name')}</label>
                <input type="text" class="product-name" value="${this.escapeHtml(p.name)}" placeholder="Product Name">
            </div>
            <div class="form-group">
                <label data-i18n="products.quantity">${I18n.t('products.quantity')}</label>
                <input type="number" class="product-quantity" value="${p.quantity}" placeholder="1">
            </div>
            <div class="form-group">
                <label data-i18n="products.price">${I18n.t('products.price')}</label>
                <input type="text" class="product-price" value="${p.price}" placeholder="9.99">
            </div>
            <div class="form-group">
                <label data-i18n="products.events">${I18n.t('products.events')}</label>
                <input type="text" class="product-events" value="${this.escapeHtml(p.events)}" placeholder="event1=5|event2">
            </div>
            <div class="form-group">
                <label data-i18n="products.evars">${I18n.t('products.evars')}</label>
                <input type="text" class="product-evars" value="${this.escapeHtml(p.evars)}" placeholder="eVar1=val|eVar2=val">
            </div>
            <button type="button" class="btn btn-remove" onclick="DynamicFields.removeField('${id}')" data-i18n="common.remove">${I18n.t('common.remove')}</button>
        `;

        container.appendChild(row);
    },

    /**
     * Add a context data field
     * @param {string} key - Optional key
     * @param {string} value - Optional value
     */
    addContextData(key = '', value = '') {
        const container = document.getElementById('context-container');
        if (!container) return;

        this.counters.context++;
        const id = `context-row-${this.counters.context}`;

        const row = document.createElement('div');
        row.className = 'dynamic-field-row context-row';
        row.id = id;
        row.innerHTML = `
            <div class="form-group">
                <label data-i18n="context.key">${I18n.t('context.key')}</label>
                <input type="text" class="context-key" value="${this.escapeHtml(key)}" placeholder="myKey">
            </div>
            <div class="form-group">
                <label data-i18n="context.value">${I18n.t('context.value')}</label>
                <input type="text" class="context-value" value="${this.escapeHtml(value)}" placeholder="myValue">
            </div>
            <button type="button" class="btn btn-remove" onclick="DynamicFields.removeField('${id}')" data-i18n="common.remove">${I18n.t('common.remove')}</button>
        `;

        container.appendChild(row);
    },

    /**
     * Remove a dynamic field by ID
     * @param {string} id - Field row ID
     */
    removeField(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    },

    /**
     * Clear all dynamic fields
     */
    clearAll() {
        ['evars-container', 'props-container', 'events-container', 'products-container', 'context-container'].forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        });

        // Reset counters
        this.counters = { evar: 0, prop: 0, event: 0, product: 0, context: 0 };
    },

    /**
     * Get all eVar values
     * @returns {Array} Array of {number, value} objects
     */
    getEvars() {
        const evars = [];
        document.querySelectorAll('.evar-row').forEach(row => {
            const number = parseInt(row.querySelector('.evar-number')?.value, 10);
            const value = row.querySelector('.evar-value')?.value?.trim();
            if (number && value) {
                evars.push({ number, value });
            }
        });
        return evars;
    },

    /**
     * Get all prop values
     * @returns {Array} Array of {number, value} objects
     */
    getProps() {
        const props = [];
        document.querySelectorAll('.prop-row').forEach(row => {
            const number = parseInt(row.querySelector('.prop-number')?.value, 10);
            const value = row.querySelector('.prop-value')?.value?.trim();
            if (number && value) {
                props.push({ number, value });
            }
        });
        return props;
    },

    /**
     * Get all event values
     * @returns {Array} Array of {name, value, serialId} objects
     */
    getEvents() {
        const events = [];
        document.querySelectorAll('.event-row').forEach(row => {
            const name = row.querySelector('.event-name')?.value;
            const value = row.querySelector('.event-value')?.value?.trim();
            const serialId = row.querySelector('.event-serial')?.value?.trim();
            if (name) {
                events.push({ name, value, serialId });
            }
        });
        return events;
    },

    /**
     * Get all product values
     * @returns {Array} Array of product objects
     */
    getProducts() {
        const products = [];
        document.querySelectorAll('.product-row').forEach(row => {
            const category = row.querySelector('.product-category')?.value?.trim() || '';
            const name = row.querySelector('.product-name')?.value?.trim() || '';
            const quantity = row.querySelector('.product-quantity')?.value?.trim() || '';
            const price = row.querySelector('.product-price')?.value?.trim() || '';
            const events = row.querySelector('.product-events')?.value?.trim() || '';
            const evars = row.querySelector('.product-evars')?.value?.trim() || '';

            // Only add if at least product name is set
            if (name || category) {
                products.push({ category, name, quantity, price, events, evars });
            }
        });
        return products;
    },

    /**
     * Get all context data values
     * @returns {Array} Array of {key, value} objects
     */
    getContextData() {
        const contextData = [];
        document.querySelectorAll('.context-row').forEach(row => {
            const key = row.querySelector('.context-key')?.value?.trim();
            const value = row.querySelector('.context-value')?.value?.trim();
            if (key && value) {
                contextData.push({ key, value });
            }
        });
        return contextData;
    },

    /**
     * Set eVars from data
     * @param {Array} evars - Array of {number, value} objects
     */
    setEvars(evars) {
        const container = document.getElementById('evars-container');
        if (container) container.innerHTML = '';
        this.counters.evar = 0;
        evars.forEach(evar => this.addEvar(evar.number, evar.value));
    },

    /**
     * Set props from data
     * @param {Array} props - Array of {number, value} objects
     */
    setProps(props) {
        const container = document.getElementById('props-container');
        if (container) container.innerHTML = '';
        this.counters.prop = 0;
        props.forEach(prop => this.addProp(prop.number, prop.value));
    },

    /**
     * Set events from data
     * @param {Array} events - Array of event objects
     */
    setEvents(events) {
        const container = document.getElementById('events-container');
        if (container) container.innerHTML = '';
        this.counters.event = 0;
        events.forEach(event => this.addEvent(event.name, event.value, event.serialId));
    },

    /**
     * Set products from data
     * @param {Array} products - Array of product objects
     */
    setProducts(products) {
        const container = document.getElementById('products-container');
        if (container) container.innerHTML = '';
        this.counters.product = 0;
        products.forEach(product => this.addProduct(product));
    },

    /**
     * Set context data from data
     * @param {Array} contextData - Array of {key, value} objects
     */
    setContextData(contextData) {
        const container = document.getElementById('context-container');
        if (container) container.innerHTML = '';
        this.counters.context = 0;
        contextData.forEach(cd => this.addContextData(cd.key, cd.value));
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
