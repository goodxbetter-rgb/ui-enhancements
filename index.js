
(() => {
    'use strict';

    const TOOLBAR_ID = 'ui-enhancements-quick-insert';
    const TEXTAREA_SELECTOR = '#send_textarea';

    const WRAPPERS = [
        {
            id: 'quote',
            label: '""',
            title: 'ใส่เครื่องหมายคำพูด',
            open: '"',
            close: '"'
        },
        {
            id: 'bold',
            label: '**',
            title: 'ใส่ตัวหนา',
            open: '**',
            close: '**'
        },
        {
            id: 'ooc',
            label: '(OOC:)',
            title: 'ใส่คำสั่ง OOC',
            open: '(OOC: ',
            close: ')'
        }
    ];

    function getTextarea() {
        return document.querySelector(TEXTAREA_SELECTOR);
    }

    function insertWrapper(wrapper) {
        const textarea = getTextarea();

        if (!textarea || textarea.disabled || textarea.readOnly) return;

        textarea.focus();

        const start = textarea.selectionStart ?? textarea.value.length;
        const end = textarea.selectionEnd ?? start;

        const value = textarea.value;
        const selected = value.slice(start, end);

        const before = value.slice(0, start);
        const after = value.slice(end);

        textarea.value =
            before +
            wrapper.open +
            selected +
            wrapper.close +
            after;

        if (start !== end) {
            textarea.setSelectionRange(
                start + wrapper.open.length,
                start + wrapper.open.length + selected.length
            );
        } else {
            const caret = start + wrapper.open.length;
            textarea.setSelectionRange(caret, caret);
        }

        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function createToolbar() {
        const toolbar = document.createElement('div');

        toolbar.id = TOOLBAR_ID;
        toolbar.className = 'ui-enhancements-toolbar';
        toolbar.setAttribute('aria-label', 'Quick Insert Toolbar');

        const label = document.createElement('span');
        label.className = 'ui-enhancements-toolbar-label';
        label.textContent = 'แทรกด่วน';

        toolbar.appendChild(label);

        WRAPPERS.forEach(wrapper => {
            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'ui-enhancements-button';
            button.textContent = wrapper.label;
            button.title = wrapper.title;
            button.setAttribute('aria-label', wrapper.title);

            button.addEventListener('mousedown', event => {
                event.preventDefault();
            });

            button.addEventListener('click', () => {
                insertWrapper(wrapper);
            });

            toolbar.appendChild(button);
        });

        return toolbar;
    }

    function mountToolbar() {
        const textarea = getTextarea();

        if (!textarea) return;
        if (document.getElementById(TOOLBAR_ID)) return;

        const container = textarea.parentElement;
        if (!container) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'ui-enhancements-toolbar-wrapper';

        const toolbar = createToolbar();

        container.insertBefore(wrapper, textarea);
        wrapper.appendChild(toolbar);

        wrapper.insertAdjacentElement('afterend', textarea);
    }

    function init() {
        mountToolbar();

        const observer = new MutationObserver(() => {
            if (!document.getElementById(TOOLBAR_ID)) {
                mountToolbar();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, {
            once: true
        });
    } else {
        init();
    }
})();
