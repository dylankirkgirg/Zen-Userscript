// ==UserScript==
// @name         izen.lol Bypass Userscript
// @namespace    http://tampermonkey.net/
// @version      2.3.0
// @description  Improved izen.lol userscript with safer redirects, better mobile support, loop protection, and cleaner UI.
// @author       Gabriel
// @match        *://auth.platorelay.com/*
// @match        *://auth.platoboost.app/*
// @match        *://auth.platoboost.me/*
// @match        *://pandadevelopment.net/*
// @match        *://new.pandadevelopment.net/*
// @match        *://trigonevo.com/*
// @match        *://violated.lol/*
// @match        *://blox-script.com/*
// @match        *://boblox-script.com/*
// @match        *://hydrogen.lat/*
// @match        *://linkvertise.com/*
// @match        *://link-to.net/*
// @match        *://link-hub.net/*
// @match        *://link-target.org/*
// @match        *://link-target.net/*
// @match        *://link-center.net/*
// @match        *://direct-link.net/*
// @match        *://loot-link.com/*
// @match        *://lootdest.org/*
// @match        *://free-content.pro/*
// @match        *://lootdest.com/*
// @match        *://bleleadersto.com/*
// @match        *://daughablelea.com/*
// @match        *://fast-links.org/*
// @match        *://best-links.org/*
// @match        *://discordlink.cc/*
// @match        *://rapid-links.net/*
// @match        *://lootlinks.co/*
// @match        *://redeem-nitro.com/*
// @match        *://lootdest.net/*
// @match        *://tonordersitye.com/*
// @match        *://mega-redirect.com/*
// @match        *://butthedshookh.org/*
// @match        *://certainlywhenev.org/*
// @match        *://aywithmehesa.org/*
// @match        *://loot-links.com/*
// @match        *://onlyshare.info/*
// @match        *://mega-guy.com/*
// @match        *://megadropz.com/*
// @match        *://godxnationds.com/*
// @match        *://direct-links.net/*
// @match        *://direct-links.org/*
// @match        *://linksloot.net/*
// @match        *://worldpacks.co/*
// @match        *://links-loot.com/*
// @match        *://lootdest.info/*
// @match        *://lootlink.org/*
// @match        *://pkofs.com/*
// @match        *://mdlinkshub.com/*
// @match        *://goldmega.online/*
// @match        *://onlyfunlink.com/*
// @match        *://rbxdrops.org/*
// @match        *://darkmodz-links.com/*
// @match        *://links.lootlabs.gg/*
// @match        *://*.lootlabs.gg/*
// @match        *://gateway-links.com/*
// @match        *://tbv-hub.com/*
// @match        *://attiktok22.com/*
// @match        *://megalinks.one/*
// @match        *://cemendemons.com/*
// @match        *://content-hub.club/*
// @match        *://oui-chu.com/*
// @match        *://crip-hub.com/*
// @match        *://rapid-links.com/*
// @match        *://nitroclaim.com/*
// @match        *://bizzarestorage.com/*
// @match        *://folderscontent.com/*
// @match        *://work.ink/*
// @match        *://workink.net/*
// @match        *://rinku.pro/*
// @match        *://7mb.io/*
// @match        *://speedy-links.com/*
// @match        *://mobile.codex.lol/*
// @match        *://stfly.vip/*
// @match        *://shrtslug.biz/*
// @match        *://lockr.so/*
// @match        *://lockr.net/*
// @match        *://linkunlocker.com/*
// @match        *://link-unlock.com/*
// @match        *://arolinks.com/*
// @match        *://tpi.li/*
// @match        *://socialwolvez.com/*
// @match        *://go.linkify.ru/*
// @match        *://mboost.me/*
// @match        *://social-unlock.com/*
// @match        *://rekonise.com/*
// @match        *://rekonise.org/*
// @match        *://rkns.link/*
// @match        *://pastebin.com/*
// @match        *://paste-drop.com/*
// @match        *://pastefy.app/*
// @match        *://sub2unlock.com/*
// @match        *://sub2unlock.me/*
// @match        *://sub2unlock.io/*
// @match        *://sub4unlock.com/*
// @match        *://sub4unlock.me/*
// @match        *://sub4unlock.io/*
// @match        *://sub4unlock.pro/*
// @match        *://bstlar.com/*
// @match        *://scriptpastebins.com/*
// @match        *://paster.so/*
// @match        *://sfl.gl/*
// @match        *://go.yorurl.com/*
// @match        *://yorurl.com/*
// @match        *://www.robloxscripts.gg/*
// @match        *://lnbz.la/*
// @match        *://linkzy.space/*
// @match        *://ez4short.com/*
// @homepageURL  https://izen.lol
// @icon         https://www.google.com/s2/favicons?domain=izen.lol&sz=64
// @run-at       document-start
// ==/UserScript==

(() => {
    'use strict';

    // Don't execute inside embeds/iframes.
    if (window.top !== window.self) {
        return;
    }

    /*
     * ============================================================
     * CONFIG
     * ============================================================
     *
     * API key is OPTIONAL. Leave apikey: '' if you don't have one.
     */
    const CONFIG = Object.freeze({
        apikey: '',

        // Normal countdown.
        time: 1,

        // false = Continue button becomes available immediately.
        wait_before_redirect: true,

        // Linkvertise hash-page delay.
        linkvertise_hash_wait: 1,

        // Prevent bad/configured values from creating massive timers.
        max_wait_seconds: 300,

        // Auto-continue once the countdown finishes, without waiting for a click.
        auto_continue: false,

        // Console debugging.
        debug: false,
    });

    /*
     * ============================================================
     * CONSTANTS
     * ============================================================
     */

    const IZEN_ORIGIN = 'https://izen.lol';
    const IZEN_ENDPOINT = `${IZEN_ORIGIN}/userscript`;

    // Stored on the gateway domain before going to izen. sessionStorage
    // survives navigation away and back within the same tab, which helps
    // when Referer is stripped.
    const PENDING_KEY = '__izen_userscript_pending_v2__';
    const HANDOFF_KEY = '__izen_userscript_last_handoff_v2__';

    const PENDING_TTL_MS = 10 * 60 * 1000;
    const HANDOFF_GUARD_MS = 4000;

    const state = {
        countdownTimer: null,
        redirecting: false,
    };

    /*
     * ============================================================
     * LOGGING
     * ============================================================
     */

    function log(...args) {
        if (!CONFIG.debug) {
            return;
        }
        console.log('[izen userscript]', ...args);
    }

    /*
     * ============================================================
     * GENERIC HELPERS
     * ============================================================
     */

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function getWaitSeconds(value, fallback = 1) {
        const parsed = Number(value);

        if (!Number.isFinite(parsed)) {
            return fallback;
        }

        return clamp(Math.floor(parsed), 0, CONFIG.max_wait_seconds);
    }

    // Only accept normal browser web URLs. Rejects javascript:, data:, file:.
    function parseHttpUrl(raw, base = window.location.href) {
        if (typeof raw !== 'string' || !raw.trim()) {
            return null;
        }

        try {
            const parsed = new URL(raw, base);

            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                return null;
            }

            if (!parsed.hostname) {
                return null;
            }

            // Don't allow URLs containing embedded credentials:
            // https://username:password@example.com
            if (parsed.username || parsed.password) {
                return null;
            }

            return parsed;
        } catch {
            return null;
        }
    }

    /*
     * ============================================================
     * IZEN ORIGIN VALIDATION
     * ============================================================
     */

    function isIzenHost(hostname) {
        const host = String(hostname || '').toLowerCase();
        return host === 'izen.lol' || host.endsWith('.izen.lol');
    }

    function referrerIsIzen() {
        const referrer = parseHttpUrl(document.referrer);
        return Boolean(referrer && isIzenHost(referrer.hostname));
    }

    /*
     * ============================================================
     * SESSION HANDOFF
     * ============================================================
     */

    function getPageKey(url = new URL(window.location.href)) {
        return url.origin + url.pathname;
    }

    function readJsonStorage(key) {
        try {
            const raw = sessionStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function writeJsonStorage(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }

    function removeStorage(key) {
        try {
            sessionStorage.removeItem(key);
        } catch {
            // Storage may be blocked. Nothing else required.
        }
    }

    function hasValidPendingHandoff() {
        const pending = readJsonStorage(PENDING_KEY);

        if (!pending || typeof pending !== 'object') {
            return false;
        }

        const timestamp = Number(pending.timestamp || 0);
        const age = Date.now() - timestamp;
        const samePage = pending.pageKey === getPageKey();

        return samePage && age >= 0 && age <= PENDING_TTL_MS;
    }

    function markPendingHandoff() {
        writeJsonStorage(PENDING_KEY, {
            timestamp: Date.now(),
            pageKey: getPageKey(),
        });
    }

    function wasJustHandedOff() {
        const last = readJsonStorage(HANDOFF_KEY);

        if (!last || typeof last !== 'object') {
            return false;
        }

        const timestamp = Number(last.timestamp || 0);
        const age = Date.now() - timestamp;

        return last.pageKey === getPageKey() && age >= 0 && age < HANDOFF_GUARD_MS;
    }

    function markHandoffNow() {
        writeJsonStorage(HANDOFF_KEY, {
            timestamp: Date.now(),
            pageKey: getPageKey(),
        });
    }

    /*
     * ============================================================
     * HANDOFF URL
     * ============================================================
     */

    function getSourceUrlForHandoff() {
        const source = new URL(window.location.href);

        // Never send a preexisting redirect result back through izen as
        // the source URL.
        source.searchParams.delete('redirect');

        return source.href;
    }

    function buildIzenHandoffUrl() {
        const endpoint = new URL(IZEN_ENDPOINT);

        endpoint.searchParams.set('url', getSourceUrlForHandoff());

        // API KEY IS OPTIONAL. If empty, don't even add the parameter.
        const apiKey = String(CONFIG.apikey || '').trim();

        if (apiKey) {
            endpoint.searchParams.set('apikey', apiKey);
        }

        endpoint.searchParams.set('time', String(getWaitSeconds(CONFIG.time, 1)));

        return endpoint.href;
    }

    function handoffToIzen() {
        // Protect against: target -> izen -> target -> izen -> target...
        if (wasJustHandedOff()) {
            throw new Error('A redirect loop was detected. Reload the page and try again.');
        }

        markPendingHandoff();
        markHandoffNow();

        const target = buildIzenHandoffUrl();

        log('Handing off to izen:', target);

        window.location.replace(target);
    }

    /*
     * ============================================================
     * REDIRECT RESULT
     * ============================================================
     */

    function getRedirectTarget() {
        const current = new URL(window.location.href);
        const rawRedirect = current.searchParams.get('redirect');

        if (!rawRedirect) {
            return null;
        }

        // document.referrer can disappear because of browser privacy /
        // Referrer-Policy. Therefore we accept either an izen referrer or
        // our valid session handoff marker.
        const trustedReturn = referrerIsIzen() || hasValidPendingHandoff();

        if (!trustedReturn) {
            log('Ignoring untrusted redirect parameter.');
            return null;
        }

        const target = parseHttpUrl(rawRedirect);

        if (!target) {
            throw new Error('The redirect destination returned by izen is invalid.');
        }

        // Stop a redirect directly back to ourselves.
        if (target.href === window.location.href) {
            throw new Error('The redirect destination points back to the current page.');
        }

        // Successful return. We don't need the handoff markers anymore.
        removeStorage(PENDING_KEY);
        removeStorage(HANDOFF_KEY);

        return target;
    }

    /*
     * ============================================================
     * LINKVERTISE SPECIAL CASE
     * ============================================================
     */

    function isLinkvertiseHashPage() {
        try {
            const current = new URL(window.location.href);

            return (
                current.hostname.toLowerCase().includes('linkvertise') &&
                current.searchParams.has('hash')
            );
        } catch {
            return false;
        }
    }

    /*
     * ============================================================
     * DOM
     * ============================================================
     */

    function ensureDocumentRoot() {
        if (document.documentElement) {
            return Promise.resolve(document.documentElement);
        }

        return new Promise((resolve) => {
            const observer = new MutationObserver(() => {
                if (!document.documentElement) {
                    return;
                }

                observer.disconnect();
                resolve(document.documentElement);
            });

            observer.observe(document, {
                childList: true,
                subtree: true,
            });
        });
    }

    /*
     * ============================================================
     * UI
     * ============================================================
     *
     * Shadow DOM is used so CSS from the target website can't easily
     * destroy the userscript interface.
     */

    function createUI() {
        const existing = document.getElementById('__izen_userscript_host__');

        if (existing) {
            existing.remove();
        }

        const host = document.createElement('div');

        host.id = '__izen_userscript_host__';
        host.setAttribute('data-izen-userscript', 'true');

        const shadow = host.attachShadow({ mode: 'open' });

        shadow.innerHTML = `
            <style>
                :host {
                    all: initial;
                    position: fixed;
                    inset: 0;
                    z-index: 2147483647;
                }

                *, *::before, *::after {
                    box-sizing: border-box;
                }

                .overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 2147483647;
                    display: grid;
                    place-items: center;
                    width: 100vw;
                    min-height: 100vh;
                    min-height: 100dvh;
                    padding:
                        max(20px, env(safe-area-inset-top))
                        max(20px, env(safe-area-inset-right))
                        max(20px, env(safe-area-inset-bottom))
                        max(20px, env(safe-area-inset-left));
                    overflow: auto;
                    background:
                        radial-gradient(circle at 50% 12%, rgba(99, 102, 241, 0.18), transparent 34%),
                        linear-gradient(135deg, #09090f 0%, #111827 52%, #111827 100%);
                    color: #e5e7eb;
                    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    text-align: center;
                    -webkit-font-smoothing: antialiased;
                }

                .card {
                    width: min(480px, 100%);
                    padding: clamp(28px, 6vw, 46px) clamp(22px, 5vw, 38px);
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 22px;
                    background: rgba(15, 23, 42, 0.72);
                    box-shadow:
                        0 24px 80px rgba(0, 0, 0, 0.45),
                        0 0 80px rgba(99, 102, 241, 0.06);
                    backdrop-filter: blur(22px);
                    -webkit-backdrop-filter: blur(22px);
                    animation: izen-enter 420ms cubic-bezier(.2, .8, .2, 1) both;
                }

                @keyframes izen-enter {
                    from { opacity: 0; transform: translateY(14px) scale(.985); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes izen-spin {
                    to { transform: rotate(360deg); }
                }

                .logo {
                    margin-bottom: 6px;
                    font-size: clamp(22px, 5vw, 27px);
                    font-weight: 800;
                    letter-spacing: -0.7px;
                    color: #f8fafc;
                }

                .logo-accent { color: #818cf8; }

                .subtitle {
                    margin-bottom: 28px;
                    color: #64748b;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.7px;
                    text-transform: uppercase;
                }

                .destination {
                    margin-bottom: 18px;
                    padding: 11px 13px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 11px;
                    background: rgba(255, 255, 255, 0.035);
                    color: #94a3b8;
                    font-size: 12px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .countdown {
                    margin-bottom: 14px;
                    color: #c4b5fd;
                    font-size: 14px;
                    font-weight: 650;
                    font-variant-numeric: tabular-nums;
                }

                .progress-track {
                    width: 100%;
                    height: 4px;
                    margin-bottom: 26px;
                    overflow: hidden;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.065);
                }

                .progress-fill {
                    width: 0%;
                    height: 100%;
                    border-radius: inherit;
                    background: linear-gradient(90deg, #6366f1, #a78bfa);
                    transition: width 100ms linear;
                }

                .button-row {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 10px;
                }

                button {
                    min-height: 46px;
                    width: 100%;
                    padding: 12px 18px;
                    border: 0;
                    border-radius: 12px;
                    font: inherit;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                    transition:
                        transform 150ms ease,
                        opacity 150ms ease,
                        background 150ms ease,
                        box-shadow 150ms ease;
                }

                button:focus-visible {
                    outline: 2px solid #a78bfa;
                    outline-offset: 2px;
                }

                #continueBtn {
                    background: linear-gradient(135deg, #6366f1, #7c3aed);
                    color: #fff;
                    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.28);
                }

                #continueBtn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 30px rgba(99, 102, 241, 0.38);
                }

                #continueBtn:active:not(:disabled) {
                    transform: translateY(0);
                }

                #continueBtn:disabled {
                    opacity: 0.42;
                    cursor: default;
                    box-shadow: none;
                }

                #copyBtn {
                    display: none;
                    background: rgba(255, 255, 255, 0.07);
                    color: #cbd5e1;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                #retryBtn {
                    display: none;
                    background: rgba(255, 255, 255, 0.07);
                    color: #cbd5e1;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .error {
                    display: none;
                    margin-top: 18px;
                    padding: 12px 14px;
                    border: 1px solid rgba(248, 113, 113, 0.18);
                    border-radius: 11px;
                    background: rgba(248, 113, 113, 0.08);
                    color: #fca5a5;
                    font-size: 13px;
                    line-height: 1.45;
                    overflow-wrap: anywhere;
                }

                .spinner {
                    display: none;
                    width: 22px;
                    height: 22px;
                    margin: 18px auto 0;
                    border: 3px solid rgba(129, 140, 248, 0.18);
                    border-top-color: #818cf8;
                    border-radius: 50%;
                    animation: izen-spin 700ms linear infinite;
                }

                @media (max-width: 480px) {
                    .overlay { place-items: center; }
                    .card { border-radius: 18px; }
                }

                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after {
                        animation-duration: 0.001ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.001ms !important;
                    }
                }
            </style>

            <div class="overlay" role="dialog" aria-modal="true" aria-labelledby="izenTitle">
                <section class="card">

                    <div class="logo" id="izenTitle">
                        izen<span class="logo-accent">.lol</span>
                    </div>

                    <div class="subtitle">Bypass Userscript</div>

                    <div class="destination" id="destination">Preparing destination…</div>

                    <div class="countdown" id="countdown" role="status" aria-live="polite">Preparing…</div>

                    <div class="progress-track" aria-hidden="true">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>

                    <div class="button-row">
                        <button id="continueBtn" type="button" disabled>Please wait…</button>
                        <button id="copyBtn" type="button">Copy destination</button>
                        <button id="retryBtn" type="button">Try again</button>
                    </div>

                    <div class="error" id="errorMsg" role="alert"></div>

                    <div class="spinner" id="spinner" aria-hidden="true"></div>

                </section>
            </div>
        `;

        document.documentElement.appendChild(host);

        const $ = (selector) => shadow.querySelector(selector);

        return {
            host,
            shadow,
            destination: $('#destination'),
            countdown: $('#countdown'),
            progressFill: $('#progressFill'),
            continueBtn: $('#continueBtn'),
            copyBtn: $('#copyBtn'),
            retryBtn: $('#retryBtn'),
            errorMsg: $('#errorMsg'),
            spinner: $('#spinner'),
        };
    }

    /*
     * ============================================================
     * TIMER MANAGEMENT
     * ============================================================
     */

    function stopCountdown() {
        if (state.countdownTimer === null) {
            return;
        }

        clearInterval(state.countdownTimer);
        state.countdownTimer = null;
    }

    /*
     * ============================================================
     * ERROR HANDLING
     * ============================================================
     */

    function showError(ui, message, target = null) {
        stopCountdown();

        state.redirecting = false;

        ui.countdown.textContent = 'Unable to continue';
        ui.continueBtn.disabled = true;
        ui.continueBtn.textContent = 'Unavailable';
        ui.spinner.style.display = 'none';

        ui.errorMsg.textContent = String(message || 'An unknown error occurred.');
        ui.errorMsg.style.display = 'block';

        // Always offer a manual way forward: reload the page to retry the
        // whole handoff flow from scratch.
        ui.retryBtn.style.display = 'block';
        ui.retryBtn.onclick = () => {
            window.location.reload();
        };

        // If we know the destination, allow it to be copied manually.
        if (target) {
            ui.copyBtn.style.display = 'block';

            ui.copyBtn.onclick = async () => {
                try {
                    if (!navigator.clipboard) {
                        throw new Error('Clipboard API unavailable.');
                    }

                    await navigator.clipboard.writeText(target.href);

                    ui.copyBtn.textContent = 'Copied';

                    setTimeout(() => {
                        ui.copyBtn.textContent = 'Copy destination';
                    }, 1200);
                } catch {
                    ui.errorMsg.textContent = `${message} Destination: ${target.href}`;
                }
            };
        }
    }

    /*
     * ============================================================
     * REDIRECT
     * ============================================================
     */

    function performRedirect(target, ui) {
        // Prevent double taps / double clicks.
        if (state.redirecting || ui.continueBtn.disabled) {
            return;
        }

        state.redirecting = true;

        stopCountdown();

        ui.continueBtn.disabled = true;
        ui.continueBtn.textContent = 'Redirecting…';
        ui.countdown.textContent = 'Opening destination…';
        ui.spinner.style.display = 'block';

        try {
            window.location.assign(target.href);
        } catch (error) {
            log('Redirect error:', error);

            showError(
                ui,
                `Redirect failed: ${error instanceof Error ? error.message : String(error)}`,
                target
            );
        }
    }

    /*
     * ============================================================
     * READY STATE
     * ============================================================
     */

    function setReady(target, ui) {
        stopCountdown();

        ui.progressFill.style.width = '100%';
        ui.countdown.textContent = 'Ready to redirect!';
        ui.continueBtn.disabled = false;
        ui.continueBtn.textContent = 'Continue';

        // focus() can occasionally fail in unusual browser environments,
        // so don't let it break the script.
        try {
            ui.continueBtn.focus({ preventScroll: true });
        } catch {
            // Ignore.
        }

        if (CONFIG.auto_continue) {
            performRedirect(target, ui);
        }
    }

    /*
     * ============================================================
     * COUNTDOWN
     * ============================================================
     */

    function startCountdown(target, waitTime, ui) {
        const waitSeconds = getWaitSeconds(waitTime, 1);

        // Instant mode.
        if (!CONFIG.wait_before_redirect || waitSeconds <= 0) {
            setReady(target, ui);
            return;
        }

        // performance.now() prevents accumulated setInterval drift from
        // making the countdown inaccurate.
        const startedAt = performance.now();
        const durationMs = waitSeconds * 1000;

        const update = () => {
            const elapsed = performance.now() - startedAt;
            const remainingMs = Math.max(0, durationMs - elapsed);
            const progress = clamp(elapsed / durationMs, 0, 1);
            const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

            ui.progressFill.style.width = `${(progress * 100).toFixed(2)}%`;

            if (remainingMs <= 0) {
                setReady(target, ui);
                return;
            }

            ui.countdown.textContent = `Redirecting in ${remainingSeconds} second${
                remainingSeconds === 1 ? '' : 's'
            }…`;
        };

        // Update instantly instead of waiting for the first interval tick.
        update();

        state.countdownTimer = window.setInterval(update, 100);
    }

    /*
     * ============================================================
     * REDIRECT UI
     * ============================================================
     */

    async function showRedirectUI(target) {
        await ensureDocumentRoot();

        const ui = createUI();

        // Only display the destination hostname. This avoids exposing
        // massive query strings/tokens in the main UI.
        ui.destination.textContent = target.hostname;

        // click works for desktop AND modern touch browsers. No separate
        // touchend handler is needed, preventing accidental double
        // execution.
        ui.continueBtn.addEventListener('click', () => {
            performRedirect(target, ui);
        });

        // Allow Enter/Space to trigger the continue action once it is
        // enabled and focused, matching native button semantics even
        // though this is a shadow-DOM element some AT may treat oddly.
        ui.continueBtn.addEventListener('keydown', (event) => {
            if (
                (event.key === 'Enter' || event.key === ' ') &&
                !ui.continueBtn.disabled
            ) {
                event.preventDefault();
                performRedirect(target, ui);
            }
        });

        const waitTime = isLinkvertiseHashPage()
            ? getWaitSeconds(CONFIG.linkvertise_hash_wait, 10)
            : getWaitSeconds(CONFIG.time, 1);

        startCountdown(target, waitTime, ui);
    }

    /*
     * ============================================================
     * FATAL UI
     * ============================================================
     */

    async function showFatalError(error) {
        try {
            await ensureDocumentRoot();

            const ui = createUI();
            const message = error instanceof Error ? error.message : String(error);

            showError(ui, message);
        } catch (uiError) {
            console.error('[izen userscript] Fatal error:', error, uiError);
        }
    }

    /*
     * ============================================================
     * MAIN
     * ============================================================
     */

    async function main() {
        try {
            const current = new URL(window.location.href);
            const rawRedirect = current.searchParams.get('redirect');

            // If izen has returned us a redirect, validate and display it.
            // Otherwise send the current URL to izen.
            const target = rawRedirect ? getRedirectTarget() : null;

            if (!target) {
                handoffToIzen();
                return;
            }

            await showRedirectUI(target);
        } catch (error) {
            console.error('[izen userscript]', error);
            await showFatalError(error);
        }
    }

    /*
     * ============================================================
     * CLEANUP
     * ============================================================
     */

    window.addEventListener(
        'pagehide',
        () => {
            stopCountdown();
        },
        { once: true }
    );

    // document-start means we can start immediately.
    main();
})();
