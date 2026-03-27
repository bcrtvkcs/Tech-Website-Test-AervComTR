// Language Manager for Aeronix Website
// Handles translation injection and language toggling (Vanilla JS version)

(function() {
    const LANG_STORAGE_KEY = 'aeronix_lang';
    const DEFAULT_LANG = 'tr';

    // Helper to get current language
    function getLanguage() {
        try {
            const stored = localStorage.getItem(LANG_STORAGE_KEY);
            if (stored) return stored;
        } catch (e) {
            console.error("Error accessing localStorage", e);
        }

        return DEFAULT_LANG;
    }

    // Helper to set language
    function setLanguage(lang) {
        try {
            localStorage.setItem(LANG_STORAGE_KEY, lang);
        } catch(e) { console.error(e); }

        if (lang === 'en') {
             location.reload();
        } else {
             applyLanguage(lang);
             updateToggleButton(lang);
             replayTextAnimation();
        }
    }

    // Function to replay text animation
    function replayTextAnimation() {
        const activeClass = 'aeronix-text-anim-active';
        if (document.body.classList.contains(activeClass)) {
            document.body.classList.remove(activeClass);
            void document.body.offsetWidth; // Trigger reflow
            document.body.classList.add(activeClass);
        } else {
             document.body.classList.add(activeClass);
        }
    }

    // Function to apply translations
    function applyLanguage(lang) {
        if (lang === 'en') return;

        if (lang === 'tr') {
            if (!document.body.classList.contains('lang-tr-active')) {
                document.body.classList.add('lang-tr-active');
            }

            // Pre-sort translation keys by length descending to replace longest matches first
            let sortedKeys = [];
            if (typeof tr_translations !== 'undefined') {
                sortedKeys = Object.keys(tr_translations).sort((a, b) => b.length - a.length);
            }

            // Walk the DOM and replace text
            const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walk.nextNode()) {
                const parentTag = node.parentNode.tagName;
                if (parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'NOSCRIPT') continue;

                // Important: get the original text (which may contain multiple sentences in one node due to React)
                // We need to iterate over translation keys that might be embedded in the text node
                const origText = node.nodeValue;
                const trimmed = origText.trim();

                if (!trimmed) continue;

                if (typeof tr_translations !== 'undefined') {
                    // Try exact match first
                    if (tr_translations[trimmed] && tr_translations[trimmed].length > 0) {
                        node.nodeValue = origText.replace(trimmed, tr_translations[trimmed]);
                    } else {
                        // Sometimes text is embedded or concatenated, so replace all known keys that exist in this node
                        let newText = origText;

                        for (const key of sortedKeys) {
                            if (newText.includes(key) && tr_translations[key].length > 0) {
                                // Escape string for regex to do global replace in node
                                const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                const regex = new RegExp(escapeRegExp(key), 'g');
                                newText = newText.replace(regex, tr_translations[key]);
                            }
                        }
                        if (newText !== origText) {
                            node.nodeValue = newText;
                        }
                    }
                }
            }

            // Fallback for React hydration breaking text across multiple sibling nodes (e.g. "Purpose-built technologies... ve...")
            const paragraphs = document.querySelectorAll('p');
            for (let i = 0; i < paragraphs.length; i++) {
                const p = paragraphs[i];
                const text = p.innerText || p.textContent;
                if (text && text.includes('Purpose-built technologies to enhance operations')) {
                    p.innerHTML = 'Sektörler genelinde operasyonları, istihbaratı ve erişimi geliştirmek için amaca yönelik teknolojiler.';
                }

            }

            // More aggressive fallback for text split over text nodes that `innerText` misses easily
            if (document.body.innerHTML && document.body.innerHTML.includes("we believe innovation should be practical")) {
                document.body.innerHTML = document.body.innerHTML.replace(
                    /, we believe innovation should be practical\. We’re committed to creating intelligent systems that solve real-world problems — from enhancing public safety to streamlining critical workflows\./g,
                    ", inovasyonun pratik olması gerektiğine inanıyoruz. Kamu güvenliğini artırmaktan kritik iş akışlarını basitleştirmeye kadar gerçek dünyadaki sorunları çözen akıllı sistemler oluşturmaya kararlıyız."
                );
            }

            // Also check for the exact chunk of text that React pushes to the DOM.
            const pNodes = document.querySelectorAll('p');
            for (let i = 0; i < pNodes.length; i++) {
                const p = pNodes[i];

                if (p.textContent && p.textContent.includes('we believe innovation should be practical')) {
                     if (p.innerHTML.includes('<strong>AerVision</strong>')) {
                         p.innerHTML = 'At <strong>AerVision</strong>, inovasyonun pratik olması gerektiğine inanıyoruz. Kamu güvenliğini artırmaktan kritik iş akışlarını basitleştirmeye kadar gerçek dünyadaki sorunları çözen akıllı sistemler oluşturmaya kararlıyız.';
                     } else {
                         p.innerHTML = 'AerVision olarak inovasyonun pratik olması gerektiğine inanıyoruz. Kamu güvenliğini artırmaktan kritik iş akışlarını basitleştirmeye kadar gerçek dünyadaki sorunları çözen akıllı sistemler oluşturmaya kararlıyız.';
                     }
                }

                if (p.textContent && p.textContent.includes('make environments safer, smarter, and more efficient')) {
                    if (!p.textContent.includes('Misyonumuz')) {
                        p.innerHTML = 'Misyonumuz, yapay zeka destekli teknolojilerle ortamları daha güvenli, daha akıllı ve daha verimli hale getirmektir.';
                    }
                }
            }

            // Handle attributes
            const elements = document.getElementsByTagName('*');
            for (let i = 0; i < elements.length; i++) {
                const el = elements[i];
                if (el.hasAttribute('alt')) {
                    const txt = el.getAttribute('alt').trim();
                    if (txt && typeof tr_translations !== 'undefined' && tr_translations[txt]) el.setAttribute('alt', tr_translations[txt]);
                }
                if (el.hasAttribute('placeholder')) {
                    const txt = el.getAttribute('placeholder').trim();
                    if (txt && typeof tr_translations !== 'undefined' && tr_translations[txt]) el.setAttribute('placeholder', tr_translations[txt]);
                }
                if (el.hasAttribute('title')) {
                    const txt = el.getAttribute('title').trim();
                    if (txt && typeof tr_translations !== 'undefined' && tr_translations[txt]) el.setAttribute('title', tr_translations[txt]);
                }
                if (el.tagName.toLowerCase() === 'meta' && el.getAttribute('name') === 'description') {
                     const txt = el.getAttribute('content').trim();
                     if (txt && typeof tr_translations !== 'undefined' && tr_translations[txt]) el.setAttribute('content', tr_translations[txt]);
                }
            }
        }
    }

    // Toggle Button Logic
    function updateToggleButton(currentLang) {
        const btnImg = document.getElementById('lang-toggle-img');
        if (!btnImg) return;

        if (currentLang === 'en') {
            btnImg.src = getRelativeImagePath('images/tr.png');
            btnImg.alt = 'Switch to Turkish';
        } else {
            btnImg.src = getRelativeImagePath('images/en.png');
            btnImg.alt = 'Switch to English';
        }
    }

    function getRelativeImagePath(path) {
         // Simple check if we are in a subdirectory
         // This assumes scripts are loaded properly or we can find an image
         const existingImg = document.querySelector('img[src*="images/"]');
         if (existingImg) {
             const src = existingImg.getAttribute('src');
             const idx = src.indexOf('images/');
             if (idx !== -1) {
                 const prefix = src.substring(0, idx);
                 return prefix + path;
             }
         }
         // Fallback based on depth
         const depth = window.location.pathname.split('/').length - 2;
         // Handle root
         if (window.location.pathname.endsWith('index.htm') || window.location.pathname.endsWith('/')) {
             // standard structure
         }
         // Just try standard relative path if image detection fails
         let prefix = '';
         if (window.location.pathname.indexOf('/contact/') !== -1 || window.location.pathname.indexOf('/about/') !== -1) prefix = '../';
         return prefix + path;
    }

    function insertButton() {
         if (document.getElementById('lang-toggle-btn')) return true;

         // Find the theme toggle button to insert before it
         let targetContainer = null;
         let themeBtn = null;

         const buttons = document.querySelectorAll('button');
         for (const btn of buttons) {
             if (btn.querySelector('.lucide-sun') || btn.querySelector('.lucide-moon') || (btn.textContent && btn.textContent.includes('Toggle theme'))) {
                 themeBtn = btn;
                 targetContainer = btn.parentElement;
                 break;
             }
         }

         if (targetContainer && themeBtn) {
             const btn = document.createElement('button');
             btn.id = 'lang-toggle-btn';
             btn.className = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 cursor-pointer";

             const img = document.createElement('img');
             img.id = 'lang-toggle-img';
             img.style.width = '24px';
             img.style.height = '24px';
             img.style.borderRadius = '50%';
             img.style.objectFit = 'cover';

             btn.appendChild(img);

             // Ensure the container is flex to accommodate the new button properly
             if (window.getComputedStyle(targetContainer).display !== 'flex') {
                 targetContainer.style.display = 'flex';
                 targetContainer.style.alignItems = 'center';
                 targetContainer.style.gap = '8px';
             } else {
                 // If it's already a flex container, ensure it has enough gap
                 targetContainer.style.gap = '8px';
             }

             // Insert the language button BEFORE the theme toggle button within the flex container
             // Margin removed, using gap-2 on parent container instead
             // btn.style.marginRight = '4px'; // Add explicit margin to separate from the theme button
             targetContainer.insertBefore(btn, themeBtn);

             btn.addEventListener('click', () => {
                 const current = getLanguage();
                 const next = current === 'en' ? 'tr' : 'en';
                 setLanguage(next);
             });

             updateToggleButton(getLanguage());
             return true;
         }
         return false;
    }

    let observer = null;
    let debounceTimer = null;

    function handleMutations(mutations) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const currentLang = getLanguage();

            // 1. Enforce Button Presence
            insertButton();

            // Update button state
            updateToggleButton(currentLang);

            if (currentLang === 'en') return;

            // 2. Enforce Translation
            // Let's do a simple check on the DOM to see if known English text has appeared or if we need to apply language to new nodes
            let needsReapply = false;
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    needsReapply = true;
                    break;
                } else if (mutation.type === 'characterData') {
                    needsReapply = true;
                    break;
                }
            }

            if (needsReapply) {
                applyLanguage('tr');
            }
        }, 50); // 50ms debounce for faster reaction
    }

    function startObserver() {
        if (observer) return;
        observer = new MutationObserver(handleMutations);

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true // Watch for text changes from hydration
        });
    }

    function init() {
        if (!document.body.classList.contains('aeronix-text-anim-active')) {
            document.body.classList.add('aeronix-text-anim-active');
        }

        const currentLang = getLanguage();
        if (currentLang === 'tr') {
             applyLanguage('tr');
        }
        insertButton();

        // Start observer to catch React hydration and subsequent re-renders
        startObserver();

        // Fallback interval checks for the first few seconds to ensure hydration is caught
        let checks = 0;
        const interval = setInterval(() => {
             handleMutations([{ type: 'childList', addedNodes: [document.body] }]); // force check
             checks++;
             if (checks > 50) clearInterval(interval); // Stop checking after ~10 seconds
        }, 200);
    }

    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

})();
