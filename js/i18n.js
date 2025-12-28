/**
 * Internationalization (i18n) module for Japanese/English support
 */
const I18n = {
    currentLanguage: 'ja',

    translations: {
        ja: {
            title: 'Adobe Analytics Beacon Creator',

            // Configuration section
            'config.title': '設定',
            'config.rsid': 'レポートスイートID',
            'config.rsidHelp': '複数のRSIDはカンマで区切る',
            'config.trackingServer': 'トラッキングサーバー',
            'config.secureServer': 'セキュアトラッキングサーバー',
            'config.useSecure': 'HTTPSを使用',

            // Mode section
            'mode.title': '送信モード',
            'mode.imageRequest': '直接イメージリクエスト',
            'mode.appMeasurement': 'AppMeasurement.js',
            'mode.pageView': 'ページビュー (s.t())',
            'mode.linkTrack': 'リンクトラック (s.tl())',
            'mode.linkType': 'リンクタイプ',
            'mode.linkName': 'リンク名',

            // Basic variables
            'basic.title': '基本変数',
            'basic.pageName': 'pageName (ページ名)',
            'basic.channel': 'channel (チャネル)',
            'basic.server': 'server (サーバー)',
            'basic.pageType': 'pageType (ページタイプ)',
            'basic.pageURL': 'pageURL (ページURL)',
            'basic.referrer': 'referrer (参照元)',
            'basic.campaign': 'campaign (キャンペーン)',
            'basic.purchaseID': 'purchaseID (購入ID)',
            'basic.transactionID': 'transactionID (トランザクションID)',
            'basic.visitorID': 'visitorID (訪問者ID)',
            'basic.characterSet': 'characterSet (文字セット)',

            // eVars
            'evars.title': 'eVar (コンバージョン変数)',
            'evars.number': 'eVar番号',
            'evars.value': '値',

            // Props
            'props.title': 'prop (トラフィック変数)',
            'props.number': 'prop番号',
            'props.value': '値',

            // Events
            'events.title': 'イベント',
            'events.name': 'イベント名',
            'events.value': '値 (オプション)',
            'events.serialId': 'シリアルID (オプション)',

            // Products
            'products.title': '製品',
            'products.help': '形式: カテゴリ;製品名;数量;価格;イベント;eVar',
            'products.category': 'カテゴリ',
            'products.name': '製品名',
            'products.quantity': '数量',
            'products.price': '価格',
            'products.events': 'イベント',
            'products.evars': 'eVar',

            // List variables
            'list.title': 'リスト変数',
            'list.list1': 'list1',
            'list.list2': 'list2',
            'list.list3': 'list3',
            'list.delimiter': '区切り文字: カンマ (,)',

            // Context data
            'context.title': 'コンテキストデータ',
            'context.key': 'キー',
            'context.value': '値',

            // Templates
            'template.title': 'テンプレート',
            'template.save': 'テンプレートを保存',
            'template.load': '読み込み',
            'template.delete': '削除',
            'template.empty': '保存されたテンプレートはありません',
            'template.namePlaceholder': 'テンプレート名',
            'template.saved': 'テンプレートを保存しました',
            'template.deleted': 'テンプレートを削除しました',
            'template.loaded': 'テンプレートを読み込みました',

            // Preview
            'preview.title': 'リクエストプレビュー',
            'preview.placeholder': '「プレビュー」をクリックして生成されたリクエストを表示',
            'preview.urlLength': 'URL長:',
            'preview.characters': '文字',
            'preview.urlWarning': '警告: URLが2048文字を超えています',

            // Actions
            'actions.preview': 'プレビュー',
            'actions.send': 'ビーコン送信',
            'actions.clear': 'フォームクリア',
            'actions.copy': 'クリップボードにコピー',

            // Status messages
            'status.sent': 'ビーコンを送信しました',
            'status.sentNote': '(CORSによりレスポンスはブロックされますが、ビーコンは送信されています)',
            'status.error': 'エラー: ',
            'status.copied': 'クリップボードにコピーしました',
            'status.copyFailed': 'コピーに失敗しました',
            'status.cleared': 'フォームをクリアしました',
            'status.configRequired': 'レポートスイートIDとトラッキングサーバーは必須です',

            // Common
            'common.add': '+ 追加',
            'common.remove': '削除',
            'common.select': '選択してください',
            'common.customEvent': 'カスタムイベント'
        },

        en: {
            title: 'Adobe Analytics Beacon Creator',

            // Configuration section
            'config.title': 'Configuration',
            'config.rsid': 'Report Suite ID',
            'config.rsidHelp': 'Multiple RSIDs separated by comma',
            'config.trackingServer': 'Tracking Server',
            'config.secureServer': 'Secure Tracking Server',
            'config.useSecure': 'Use HTTPS',

            // Mode section
            'mode.title': 'Sending Mode',
            'mode.imageRequest': 'Direct Image Request',
            'mode.appMeasurement': 'AppMeasurement.js',
            'mode.pageView': 'Page View (s.t())',
            'mode.linkTrack': 'Link Track (s.tl())',
            'mode.linkType': 'Link Type',
            'mode.linkName': 'Link Name',

            // Basic variables
            'basic.title': 'Basic Variables',
            'basic.pageName': 'pageName',
            'basic.channel': 'channel',
            'basic.server': 'server',
            'basic.pageType': 'pageType',
            'basic.pageURL': 'pageURL',
            'basic.referrer': 'referrer',
            'basic.campaign': 'campaign',
            'basic.purchaseID': 'purchaseID',
            'basic.transactionID': 'transactionID',
            'basic.visitorID': 'visitorID',
            'basic.characterSet': 'characterSet',

            // eVars
            'evars.title': 'eVars (Conversion Variables)',
            'evars.number': 'eVar Number',
            'evars.value': 'Value',

            // Props
            'props.title': 'Props (Traffic Variables)',
            'props.number': 'Prop Number',
            'props.value': 'Value',

            // Events
            'events.title': 'Events',
            'events.name': 'Event Name',
            'events.value': 'Value (optional)',
            'events.serialId': 'Serial ID (optional)',

            // Products
            'products.title': 'Products',
            'products.help': 'Format: Category;Product;Quantity;Price;Events;eVars',
            'products.category': 'Category',
            'products.name': 'Product Name',
            'products.quantity': 'Quantity',
            'products.price': 'Price',
            'products.events': 'Events',
            'products.evars': 'eVars',

            // List variables
            'list.title': 'List Variables',
            'list.list1': 'list1',
            'list.list2': 'list2',
            'list.list3': 'list3',
            'list.delimiter': 'Delimiter: comma (,)',

            // Context data
            'context.title': 'Context Data',
            'context.key': 'Key',
            'context.value': 'Value',

            // Templates
            'template.title': 'Templates',
            'template.save': 'Save Template',
            'template.load': 'Load',
            'template.delete': 'Delete',
            'template.empty': 'No saved templates',
            'template.namePlaceholder': 'Template Name',
            'template.saved': 'Template saved',
            'template.deleted': 'Template deleted',
            'template.loaded': 'Template loaded',

            // Preview
            'preview.title': 'Request Preview',
            'preview.placeholder': 'Click "Preview" to see the generated request',
            'preview.urlLength': 'URL Length:',
            'preview.characters': 'characters',
            'preview.urlWarning': 'Warning: URL exceeds 2048 characters',

            // Actions
            'actions.preview': 'Preview',
            'actions.send': 'Send Beacon',
            'actions.clear': 'Clear Form',
            'actions.copy': 'Copy to Clipboard',

            // Status messages
            'status.sent': 'Beacon sent successfully',
            'status.sentNote': '(Response blocked by CORS, but beacon was sent)',
            'status.error': 'Error: ',
            'status.copied': 'Copied to clipboard',
            'status.copyFailed': 'Failed to copy',
            'status.cleared': 'Form cleared',
            'status.configRequired': 'Report Suite ID and Tracking Server are required',

            // Common
            'common.add': '+ Add',
            'common.remove': 'Remove',
            'common.select': 'Select',
            'common.customEvent': 'Custom Event'
        }
    },

    /**
     * Initialize i18n with saved language preference
     */
    init() {
        const savedLanguage = localStorage.getItem(CONFIG.STORAGE_KEYS.LANGUAGE);
        if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'en')) {
            this.currentLanguage = savedLanguage;
        } else {
            // Detect browser language
            const browserLang = navigator.language || navigator.userLanguage;
            this.currentLanguage = browserLang.startsWith('ja') ? 'ja' : 'en';
        }
        this.updateUI();
        this.updateLangToggle();
    },

    /**
     * Get translated text for a key
     * @param {string} key - Translation key
     * @returns {string} Translated text or key if not found
     */
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    },

    /**
     * Toggle between Japanese and English
     */
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'ja' ? 'en' : 'ja';
        localStorage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, this.currentLanguage);
        this.updateUI();
        this.updateLangToggle();
    },

    /**
     * Update the language toggle button label
     */
    updateLangToggle() {
        const langLabel = document.getElementById('lang-label');
        if (langLabel) {
            langLabel.textContent = this.currentLanguage === 'ja' ? 'EN' : 'JA';
        }
    },

    /**
     * Update all UI elements with data-i18n attribute
     */
    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        });

        // Update page title
        document.title = this.t('title');

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }
};
