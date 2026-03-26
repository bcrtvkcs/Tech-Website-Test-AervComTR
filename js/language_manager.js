// Language Manager for AerVision TR Website
// Handles forced Turkish translation injection and language toggling to EN domain (Vanilla JS version)

(function() {

    // Function to apply translations
    function applyLanguage() {
        if (!document.body.classList.contains('lang-tr-active')) {
            document.body.classList.add('lang-tr-active');
        }

        // Walk the DOM and replace text
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walk.nextNode()) {
            const parentTag = node.parentNode.tagName;
            if (parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'NOSCRIPT') continue;

            const text = node.nodeValue.trim();
            if (text && typeof tr_translations !== 'undefined' && tr_translations[text]) {
                if (tr_translations[text].length > 0) {
                    node.nodeValue = node.nodeValue.replace(text, tr_translations[text]);
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
         let prefix = '';
         if (window.location.pathname.indexOf('/contact/') !== -1 || window.location.pathname.indexOf('/about/') !== -1) prefix = '../';
         // Simplified fallback logic
         const parts = window.location.pathname.split('/').filter(p => p.length > 0 && !p.endsWith('.htm'));
         if (parts.length > 0) {
            prefix = '../'.repeat(parts.length);
         }
         return prefix + path;
    }

    function insertButton() {
         if (document.getElementById('lang-toggle-btn')) return true;

         // Find the theme toggle button to insert before it
         let targetContainer = null;
         let themeBtn = null;

         const buttons = document.querySelectorAll('button');
         for (const btn of buttons) {
             // Check if it's the theme button either by its SVGs, text content, or specific attributes/classes
             if (btn.querySelector('.lucide-sun') ||
                 btn.querySelector('.lucide-moon') ||
                 btn.innerHTML.includes('Toggle theme') ||
                 (btn.textContent && btn.textContent.includes('Toggle theme')) ||
                 btn.querySelector('span.sr-only')?.textContent === 'Toggle theme' ||
                 btn.innerHTML.includes('lucide-sun')) {
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

             // Always show English icon to switch to aervision.com
             img.src = getRelativeImagePath('images/en.png');
             img.alt = 'Switch to English';

             btn.appendChild(img);

             // Ensure the container is flex to accommodate the new button properly
             if (window.getComputedStyle(targetContainer).display !== 'flex') {
                 targetContainer.style.display = 'flex';
                 targetContainer.style.alignItems = 'center';
                 targetContainer.style.gap = '8px';
             }

             // Insert the language button BEFORE the theme toggle button within the flex container
             targetContainer.insertBefore(btn, themeBtn);

             btn.addEventListener('click', () => {
                 // Redirect to the .com domain with the current pathname and search
                 window.location.href = 'https://www.aervision.com' + window.location.pathname + window.location.search;
             });

             return true;
         }
         return false;
    }

    // Try multiple times if necessary in case React creates elements later
    function tryInit(attemptsLeft) {
        if (!document.getElementById('lang-toggle-btn') && !insertButton()) {
             if (attemptsLeft > 0) {
                 setTimeout(() => tryInit(attemptsLeft - 1), 200);
             } else {
                 console.error('Theme toggle button not found after retries!');
             }
        }
    }

    function init() {
        applyLanguage();
        tryInit(20); // Try for up to 4 seconds
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }

})();
