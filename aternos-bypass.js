// This script is made by: u/No_Technology5700


// ==UserScript==
// @name Aternos – Adblock Detection Bypass
// @namespace https://aternos.org/
// @version 1.3
// @description Blokuje detekci adblocku na Aternos a zabrání nahrazení obsahu stránky varováním.
// @author UserScript
// @match https://aternos.org/*
// @grant none
// @run-at document-start
// ==/UserScript==

(function() {

    'use strict';

    const fakeAdDiv = document.createElement('div');

    fakeAdDiv.id = 'aswift_1';

    fakeAdDiv.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';

    document.documentElement.appendChild(fakeAdDiv);

    Object.defineProperty(window, 'canRunAds', {
        get: () => true,
        configurable: true
    });

    Object.defineProperty(window, 'google_ad_status', {
        get: () => 1,
        configurable: true
    });

    const blockedPatterns = [

        /adblock/i,

        /blocker/i,

        /fuckadblock/i,

        /blockadblock/i,

        /adsbygoogle/i,

        /pagead/i,

    ];

    const originalCreateElement = document.createElement.bind(document);

    document.createElement = function(tag) {

        const el = originalCreateElement(tag);

        if (tag.toLowerCase() === 'script') {

            const origSetSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');

            Object.defineProperty(el, 'src', {

                set(val) {

                    if (blockedPatterns.some(p => p.test(val))) {

                        return;

                    }

                    origSetSrc.set.call(this, val);

                },

                get() {

                    return origSetSrc.get.call(this);

                },

                configurable: true,

            });

        }

        return el;

    };

    let originalBody = null;

    function saveBody() {

        if (!originalBody && document.body) {

            originalBody = document.body.innerHTML;

        }

    }

    function isAdblockWarning(node) {

        const text = node.textContent || '';

        return (

            text.includes('blokování reklam') ||

            text.includes('adblock') ||

            text.includes('Adblocker') ||

            text.includes('ad blocker') ||

            text.includes('disable your ad') ||

            text.includes('Používáš blokování')

        );

    }

    function removeWarningNodes(root) {

        const selectors = [

            '[class*="adblock"]',

            '[class*="ad-block"]',

            '[id*="adblock"]',

            '[class*="blocker"]',

            '[class*="adblocker"]',

            '[class*="overlay"]',

            '[class*="modal"]',

            '[class*="warning"]',

            '[class*="notice"]',

        ];

        selectors.forEach(sel => {

            root.querySelectorAll(sel).forEach(el => {

                if (isAdblockWarning(el)) {

                    el.remove();

                }

            });

        });

    }

    const observer = new MutationObserver(mutations => {

        for (const mutation of mutations) {

            if (

                mutation.type === 'childList' &&

                mutation.target === document.documentElement &&

                !document.body

            ) {

                if (originalBody) {

                    const newBody = document.createElement('body');

                    newBody.innerHTML = originalBody;

                    document.documentElement.appendChild(newBody);

                }

                continue;

            }

            for (const node of mutation.addedNodes) {

                if (node.nodeType === Node.ELEMENT_NODE) {

                    if (isAdblockWarning(node)) {

                        node.remove();

                    } else {

                        removeWarningNodes(node);

                    }

                }

            }

            if (mutation.type === 'attributes' && mutation.target !== document.body) {

                const el = mutation.target;

                const style = el.getAttribute('style') || '';

                const cls = el.getAttribute('class') || '';

                if (

                    (style.includes('display:none') || style.includes('display: none') ||

                        style.includes('visibility:hidden') || style.includes('visibility: hidden')) &&

                    (cls.includes('content') || cls.includes('page') || el.id === 'content' || el.id === 'page')

                ) {

                    el.style.removeProperty('display');

                    el.style.removeProperty('visibility');

                }

            }

        }

    });

    function startObserver() {

        const target = document.documentElement || document.body;

        if (target) {

            observer.observe(target, {

                childList: true,

                subtree: true,

                attributes: true,

                attributeFilter: ['style', 'class'],

            });

        }

    }

    startObserver();

    document.addEventListener('DOMContentLoaded', () => {

        saveBody();

        if (document.body) removeWarningNodes(document.body);

    }, {
        once: true
    });

    try {

        const storageKeys = ['adblock', 'adblocker', 'adBlockDetected'];

        storageKeys.forEach(k => {

            localStorage.removeItem(k);

            sessionStorage.removeItem(k);

        });

    } catch (_) {}

    const _setTimeout = window.setTimeout;

    const _setInterval = window.setInterval;

    window.setTimeout = function(fn, delay, ...args) {

        if (typeof fn === 'function') {

            const src = fn.toString();

            if (/adblock|blocker|canRunAds|aswift/i.test(src)) {

                return 0;

            }

        }

        return _setTimeout.call(this, fn, delay, ...args);

    };

    window.setInterval = function(fn, delay, ...args) {

        if (typeof fn === 'function') {

            const src = fn.toString();

            if (/adblock|blocker|canRunAds|aswift/i.test(src)) {

                return 0;

            }

        }

        return _setInterval.call(this, fn, delay, ...args);

    };

})();
