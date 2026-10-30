
(() => {
    'use strict';

    const TEXTAREA_SELECTOR = '#send_textarea';
    const TOGGLE_ID = 'ui-enhancements-toggle';
    const POPUP_ID = 'ui-enhancements-popup';

    const WRAPPERS = [
        {
            label: '""',
            title: 'ใส่เครื่องหมายคำพูด',
            open: '"',
            close: '"'
        },
        {
            label: '**',
            title: 'ใส่ตัวหนา',
            open: '**',
            close: '**'
        },
        {
            label: '(OOC:)',
            title: 'ใส่คำสั่ง OOC',
            open: '(OOC: ',
            close: ')'
        }
    ];

    let toggleButton = null;
    let popup = null;
    let isOpen = false;

    function getTextarea() {
        return document.querySelector(TEXTAREA_SELECTOR);
    }

    function positionElements() {
        const textarea = getTextarea();

        if (!textarea || !toggleButton || !popup) return;

        const rect = textarea.getBoundingClientRect();

        // วางปุ่มลอยไว้บริเวณมุมซ้ายบนของช่องพิมพ์
        let toggleTop = rect.top - 38;

        if (toggleTop < 5) {
            toggleTop = rect.top + 5;
        }

        toggleButton.style.left = `${Math.max(5, rect.left + 5)}px`;
        toggleButton.style.top = `${toggleTop}px`;

        if (isOpen) {
            const popupRect = popup.getBoundingClientRect();

            let popupTop = toggleTop - popupRect.height - 7;

            // หากพื้นที่ด้านบนไม่พอ ให้แสดงป๊อปอัปด้านล่างปุ่ม
            if (popupTop < 5) {
                popupTop = toggleTop + 35;
            }

            popup.style.left = `${Math.max(5, rect.left + 5)}px`;
            popup.style.top = `${popupTop}px`;
        }
    }

    function insertWrapper(wrapper) {
        const textarea = getTextarea();

        if (!textarea || textarea.disabled || textarea.readOnly) return;

        textarea.focus();

        const start = textarea.selectionStart ?? textarea.value.length;
        const end = textarea.selectionEnd ?? start;

        const value = textarea.value;
        const selected = value.slice(start, end);

        textarea.value =
            value.slice(0, start) +
            wrapper.open +
            selected +
            wrapper.close +
            value.slice(end);

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

        closePopup();
    }

    function openPopup() {
        if (!popup || !toggleButton) return;

        isOpen = true;
        popup.style.display = 'flex';
        toggleButton.classList.add('active');
        toggleButton.setAttribute('aria-expanded', 'true');

        positionElements();
    }

    function closePopup() {
        if (!popup || !toggleButton) return;

        isOpen = false;
        popup.style.display = 'none';
        toggleButton.classList.remove('active');
        toggleButton.setAttribute('aria-expanded', 'false');
    }

    function createInterface() {
        if (document.getElementById(TOGGLE_ID)) return;

        toggleButton = document.createElement('button');
        toggleButton.id = TOGGLE_ID;
        toggleButton.type = 'button';
        toggleButton.textContent = 'แทรกด่วน';
        toggleButton.title = 'เปิดเมนูแทรกข้อความ';
        toggleButton.setAttribute('aria-expanded', 'false');

        popup = document.createElement('div');
        popup.id = POPUP_ID;
        popup.setAttribute('aria-label', 'เมนูแทรกข้อความ');

        WRAPPERS.forEach(wrapper => {
            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'ui-enhancements-popup-button';
            button.textContent = wrapper.label;
            button.title = wrapper.title;

            button.addEventListener('mousedown', event => {
                event.preventDefault();
            });

            button.addEventListener('click', () => {
                insertWrapper(wrapper);
            });

            popup.appendChild(button);
        });

        toggleButton.addEventListener('mousedown', event => {
            event.preventDefault();
        });

        toggleButton.addEventListener('click', () => {
            if (isOpen) {
                closePopup();
            } else {
                openPopup();
            }
        });

        document.body.appendChild(toggleButton);
        document.body.appendChild(popup);

        document.addEventListener('mousedown', event => {
            if (
                isOpen &&
                !popup.contains(event.target) &&
                !toggleButton.contains(event.target)
            ) {
                closePopup();
            }
        });

        window.addEventListener('resize', positionElements);
        window.addEventListener('scroll', positionElements, true);

        positionElements();
    }

    function init() {
        if (!getTextarea()) return;

        if (!document.getElementById(TOGGLE_ID)) {
            createInterface();
        } else {
            positionElements();
        }
    }

    function start() {
        init();

        const observer = new MutationObserver(() => {
            init();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
