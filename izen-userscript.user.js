// ==UserScript==
// @name         izen.lol Bypass Userscript
// @namespace    http://tampermonkey.net/
// @version      3.2.0
// @description  Improved izen.lol userscript with safer redirects, multi-endpoint failover (izen.lol / bypass.vip / bypass.city / bypass.tools), better mobile support, loop protection, persisted settings, and cleaner UI.
// @author       Gabriel
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      izen.lol
// @connect      bypass.vip
// @connect      bypass.city
// @connect      bypass.tools
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
        // (Overridable at runtime via the in-UI settings toggle, which wins
        // once the user has changed it.)
        auto_continue: false,

        // Resolver services to try, in priority order. Each is pinged (when
        // GM_xmlhttpRequest is available) and the first reachable one is
        // used; if none respond, the primary is used anyway.
        //
        // Each service has its own endpoint shape, confirmed from that
        // service's own official userscript where possible. `redirectParam`
        // is the query param the service appends when it sends the user
        // back with a resolved destination.
        //   - izen.lol:     GET /userscript ?url=&apikey=&time=   -> ?redirect=
        //   - bypass.vip:   GET /userscript.html ?url=&key=&time= -> ?redirect=
        //   - bypass.city:  shape unconfirmed — mirrored on bypass.vip's
        //     contract as a best guess since no official userscript for it
        //     was available to check. Update this entry once confirmed.
        //   - bypass.tools: GET /wait ?url=&wait=                 -> ?referrer=
        //     (bypass.tools' full userscript is actually a standalone
        //     in-page bypass engine, not a redirect-handoff resolver like
        //     the others; only its simple /wait handoff page is used here.)
        resolvers: [
            {
                origin: 'https://izen.lol',
                path: '/userscript',
                timeParam: 'time',
                apiKeyParam: 'apikey',
                redirectParam: 'redirect',
            },
            {
                origin: 'https://bypass.vip',
                path: '/userscript.html',
                timeParam: 'time',
                apiKeyParam: 'key',
                redirectParam: 'redirect',
            },
            {
                origin: 'https://bypass.city',
                path: '/userscript.html',
                timeParam: 'time',
                apiKeyParam: 'key',
                redirectParam: 'redirect',
            },
            {
                origin: 'https://bypass.tools',
                path: '/wait',
                timeParam: 'wait',
                apiKeyParam: null,
                redirectParam: 'referrer',
            },
        ],

        // How long to wait for a resolver to respond to a reachability
        // check before trying the next one.
        resolver_ping_timeout_ms: 2500,

        // Where "Report broken site" opens.
        report_issue_url: 'https://github.com/dylankirkgirg/Zen-Userscript/issues/new',

        // Console debugging.
        debug: false,
    });

    /*
     * ============================================================
     * CONSTANTS
     * ============================================================
     */

    const SETTINGS_KEYS = Object.freeze({
        autoContinue: 'izen_userscript_auto_continue',
        theme: 'izen_userscript_theme',
    });

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
     * GM API SHIMS
     * ============================================================
     *
     * Falls back to localStorage / a direct navigation attempt when the
     * userscript manager doesn't expose the GM_* APIs (e.g. some
     * lightweight managers, or a @grant none install).
     */

    function gmApi(name) {
        try {
            if (typeof window[name] === 'function') {
                return window[name];
            }

            if (
                typeof GM !== 'undefined' &&
                typeof GM[name.replace(/^GM_/, '')] === 'function'
            ) {
                return GM[name.replace(/^GM_/, '')].bind(GM);
            }
        } catch {
            // Ignore — treat as unavailable.
        }

        return null;
    }

    function persistSet(key, value) {
        const setValue = gmApi('GM_setValue');

        if (setValue) {
            try {
                setValue(key, value);
                return;
            } catch {
                // Fall through to localStorage.
            }
        }

        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Storage may be blocked. Setting just won't persist.
        }
    }

    function persistGet(key, fallback) {
        const getValue = gmApi('GM_getValue');

        if (getValue) {
            try {
                const value = getValue(key, undefined);
                return value === undefined ? fallback : value;
            } catch {
                // Fall through to localStorage.
            }
        }

        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch {
            return fallback;
        }
    }

    function gmHttpRequest(details) {
        const request = gmApi('GM_xmlhttpRequest');

        if (!request) {
            return Promise.reject(new Error('GM_xmlhttpRequest unavailable'));
        }

        return new Promise((resolve, reject) => {
            try {
                request({
                    ...details,
                    onload: resolve,
                    onerror: () => reject(new Error('Request failed')),
                    ontimeout: () => reject(new Error('Request timed out')),
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /*
     * ============================================================
     * SETTINGS
     * ============================================================
     *
     * Small user-adjustable preferences, persisted across page loads and
     * across every site the script runs on (GM_setValue is scoped to the
     * script, not the page).
     */

    const settings = {
        autoContinue: Boolean(
            persistGet(SETTINGS_KEYS.autoContinue, CONFIG.auto_continue)
        ),

        // 'auto' follows the OS/browser preference; 'light'/'dark' pin it.
        theme: ['auto', 'light', 'dark'].includes(
            persistGet(SETTINGS_KEYS.theme, 'auto')
        )
            ? persistGet(SETTINGS_KEYS.theme, 'auto')
            : 'auto',
    };

    function setAutoContinue(value) {
        settings.autoContinue = Boolean(value);
        persistSet(SETTINGS_KEYS.autoContinue, settings.autoContinue);
    }

    function cycleTheme() {
        const order = ['auto', 'dark', 'light'];
        const next = order[(order.indexOf(settings.theme) + 1) % order.length];

        settings.theme = next;
        persistSet(SETTINGS_KEYS.theme, next);

        return next;
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
     * RESOLVER ORIGIN VALIDATION
     * ============================================================
     */

    const RESOLVER_HOSTS = CONFIG.resolvers.map((resolver) => {
        try {
            return new URL(resolver.origin).hostname.toLowerCase();
        } catch {
            return null;
        }
    }).filter(Boolean);

    function isTrustedResolverHost(hostname) {
        const host = String(hostname || '').toLowerCase();

        return RESOLVER_HOSTS.some(
            (trusted) => host === trusted || host.endsWith(`.${trusted}`)
        );
    }

    function referrerIsTrustedResolver() {
        const referrer = parseHttpUrl(document.referrer);
        return Boolean(referrer && isTrustedResolverHost(referrer.hostname));
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

    function readValidPendingHandoff() {
        const pending = readJsonStorage(PENDING_KEY);

        if (!pending || typeof pending !== 'object') {
            return null;
        }

        const timestamp = Number(pending.timestamp || 0);
        const age = Date.now() - timestamp;
        const samePage = pending.pageKey === getPageKey();

        return samePage && age >= 0 && age <= PENDING_TTL_MS ? pending : null;
    }

    function markPendingHandoff(resolver) {
        writeJsonStorage(PENDING_KEY, {
            timestamp: Date.now(),
            pageKey: getPageKey(),
            redirectParam: resolver.redirectParam,
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

    const KNOWN_REDIRECT_PARAMS = [
        ...new Set(CONFIG.resolvers.map((resolver) => resolver.redirectParam)),
    ];

    function getSourceUrlForHandoff() {
        const source = new URL(window.location.href);

        // Never send a preexisting redirect result back through a resolver
        // as the source URL — strip every known return-param name, since
        // different resolvers use different ones (redirect, referrer, ...).
        for (const param of KNOWN_REDIRECT_PARAMS) {
            source.searchParams.delete(param);
        }

        return source.href;
    }

    function buildHandoffUrl(resolver) {
        const endpoint = new URL(resolver.path, resolver.origin);

        endpoint.searchParams.set('url', getSourceUrlForHandoff());

        // API KEY IS OPTIONAL. If empty, or the resolver has no concept of
        // one, don't even add the parameter.
        const apiKey = String(CONFIG.apikey || '').trim();

        if (apiKey && resolver.apiKeyParam) {
            endpoint.searchParams.set(resolver.apiKeyParam, apiKey);
        }

        endpoint.searchParams.set(
            resolver.timeParam,
            String(getWaitSeconds(CONFIG.time, 1))
        );

        return endpoint.href;
    }

    /*
     * ============================================================
     * RESOLVER FAILOVER
     * ============================================================
     *
     * A plain page navigation can't tell us whether the destination
     * actually loaded, so before committing to one resolver we send a
     * lightweight HEAD probe (via GM_xmlhttpRequest, which isn't bound by
     * CORS) and fall through the configured resolver list in order.
     *
     * If GM_xmlhttpRequest isn't granted, we skip probing entirely and
     * just use the primary resolver, preserving the original behavior.
     */

    async function pingOrigin(origin, timeoutMs) {
        try {
            await gmHttpRequest({
                method: 'HEAD',
                url: origin,
                timeout: timeoutMs,
            });

            return true;
        } catch (error) {
            log('Resolver unreachable:', origin, error);
            return false;
        }
    }

    async function selectResolver() {
        const resolvers = CONFIG.resolvers;

        if (!gmApi('GM_xmlhttpRequest') || resolvers.length <= 1) {
            return resolvers[0];
        }

        for (const resolver of resolvers) {
            // eslint-disable-next-line no-await-in-loop
            const reachable = await pingOrigin(
                resolver.origin,
                CONFIG.resolver_ping_timeout_ms
            );

            if (reachable) {
                return resolver;
            }
        }

        // Every resolver failed its probe. Attempt the primary anyway —
        // the probe itself may have been the thing that failed (e.g. a
        // strict CSP), not the resolver.
        return resolvers[0];
    }

    async function handoffToIzen() {
        // Protect against: target -> resolver -> target -> resolver -> target...
        if (wasJustHandedOff()) {
            throw new Error('A redirect loop was detected. Reload the page and try again.');
        }

        const resolver = await selectResolver();
        const target = buildHandoffUrl(resolver);

        markPendingHandoff(resolver);
        markHandoffNow();

        log('Handing off to resolver:', target);

        window.location.replace(target);
    }

    /*
     * ============================================================
     * REDIRECT RESULT
     * ============================================================
     */

    // Which query param(s) to check for a resolved destination on this
    // page load. If we have a valid pending-handoff record, we know
    // exactly which resolver we sent the user to and can check only its
    // param name; otherwise (referrer-only trust, e.g. pending expired or
    // storage blocked) fall back to checking every known param name.
    function candidateRedirectParams(pending) {
        if (pending && pending.redirectParam) {
            return [pending.redirectParam];
        }

        return KNOWN_REDIRECT_PARAMS;
    }

    function getRedirectTarget() {
        const current = new URL(window.location.href);
        const pending = readValidPendingHandoff();

        const paramName = candidateRedirectParams(pending).find((param) =>
            current.searchParams.has(param)
        );

        const rawRedirect = paramName ? current.searchParams.get(paramName) : null;

        if (!rawRedirect) {
            return null;
        }

        // document.referrer can disappear because of browser privacy /
        // Referrer-Policy. Therefore we accept either a trusted resolver
        // referrer or our valid session handoff marker.
        const trustedReturn = referrerIsTrustedResolver() || pending !== null;

        if (!trustedReturn) {
            log('Ignoring untrusted redirect parameter.');
            return null;
        }

        const target = parseHttpUrl(rawRedirect);

        if (!target) {
            throw new Error('The redirect destination returned by the resolver is invalid.');
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

        if (settings.theme !== 'auto') {
            host.setAttribute('data-theme', settings.theme);
        }

        shadow.innerHTML = `
            <style>
                :host {
                    all: initial;
                    position: fixed;
                    inset: 0;
                    z-index: 2147483647;

                    --bg-grad-1: rgba(99, 102, 241, 0.18);
                    --bg-grad-2: #09090f;
                    --bg-grad-3: #111827;
                    --text-main: #e5e7eb;
                    --card-border: rgba(255, 255, 255, 0.09);
                    --card-bg: rgba(15, 23, 42, 0.72);
                    --logo-color: #f8fafc;
                    --logo-accent: #818cf8;
                    --subtitle-color: #64748b;
                    --dest-border: rgba(255, 255, 255, 0.07);
                    --dest-bg: rgba(255, 255, 255, 0.035);
                    --dest-color: #94a3b8;
                    --countdown-color: #c4b5fd;
                    --track-bg: rgba(255, 255, 255, 0.065);
                    --fill-1: #6366f1;
                    --fill-2: #a78bfa;
                    --btn-secondary-bg: rgba(255, 255, 255, 0.07);
                    --btn-secondary-color: #cbd5e1;
                    --btn-secondary-border: rgba(255, 255, 255, 0.08);
                    --icon-btn-color: #64748b;
                }

                @media (prefers-color-scheme: light) {
                    :host(:not([data-theme="dark"])) {
                        --bg-grad-1: rgba(99, 102, 241, 0.10);
                        --bg-grad-2: #eef0fb;
                        --bg-grad-3: #f8fafc;
                        --text-main: #1e293b;
                        --card-border: rgba(15, 23, 42, 0.08);
                        --card-bg: rgba(255, 255, 255, 0.78);
                        --logo-color: #0f172a;
                        --logo-accent: #6366f1;
                        --subtitle-color: #64748b;
                        --dest-border: rgba(15, 23, 42, 0.08);
                        --dest-bg: rgba(15, 23, 42, 0.04);
                        --dest-color: #475569;
                        --countdown-color: #6d28d9;
                        --track-bg: rgba(15, 23, 42, 0.08);
                        --btn-secondary-bg: rgba(15, 23, 42, 0.05);
                        --btn-secondary-color: #334155;
                        --btn-secondary-border: rgba(15, 23, 42, 0.09);
                        --icon-btn-color: #94a3b8;
                    }
                }

                :host([data-theme="light"]) {
                    --bg-grad-1: rgba(99, 102, 241, 0.10);
                    --bg-grad-2: #eef0fb;
                    --bg-grad-3: #f8fafc;
                    --text-main: #1e293b;
                    --card-border: rgba(15, 23, 42, 0.08);
                    --card-bg: rgba(255, 255, 255, 0.78);
                    --logo-color: #0f172a;
                    --logo-accent: #6366f1;
                    --subtitle-color: #64748b;
                    --dest-border: rgba(15, 23, 42, 0.08);
                    --dest-bg: rgba(15, 23, 42, 0.04);
                    --dest-color: #475569;
                    --countdown-color: #6d28d9;
                    --track-bg: rgba(15, 23, 42, 0.08);
                    --btn-secondary-bg: rgba(15, 23, 42, 0.05);
                    --btn-secondary-color: #334155;
                    --btn-secondary-border: rgba(15, 23, 42, 0.09);
                    --icon-btn-color: #94a3b8;
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
                        radial-gradient(circle at 50% 12%, var(--bg-grad-1), transparent 34%),
                        linear-gradient(135deg, var(--bg-grad-2) 0%, var(--bg-grad-3) 52%, var(--bg-grad-3) 100%);
                    color: var(--text-main);
                    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    text-align: center;
                    -webkit-font-smoothing: antialiased;
                }

                .card {
                    position: relative;
                    width: min(480px, 100%);
                    padding: clamp(28px, 6vw, 46px) clamp(22px, 5vw, 38px);
                    border: 1px solid var(--card-border);
                    border-radius: 22px;
                    background: var(--card-bg);
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

                .toolbar {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    display: flex;
                    gap: 6px;
                }

                .icon-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    min-height: 0;
                    padding: 0;
                    border-radius: 9px;
                    background: transparent;
                    color: var(--icon-btn-color);
                    font-size: 15px;
                    box-shadow: none;
                }

                .icon-btn:hover {
                    background: var(--btn-secondary-bg);
                }

                .logo {
                    margin-bottom: 6px;
                    font-size: clamp(22px, 5vw, 27px);
                    font-weight: 800;
                    letter-spacing: -0.7px;
                    color: var(--logo-color);
                }

                .logo-accent { color: var(--logo-accent); }

                .subtitle {
                    margin-bottom: 28px;
                    color: var(--subtitle-color);
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.7px;
                    text-transform: uppercase;
                }

                .destination {
                    margin-bottom: 18px;
                    padding: 11px 13px;
                    overflow: hidden;
                    border: 1px solid var(--dest-border);
                    border-radius: 11px;
                    background: var(--dest-bg);
                    color: var(--dest-color);
                    font-size: 12px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    cursor: help;
                }

                .countdown-row {
                    display: flex;
                    align-items: baseline;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 14px;
                }

                .countdown {
                    color: var(--countdown-color);
                    font-size: 14px;
                    font-weight: 650;
                    font-variant-numeric: tabular-nums;
                }

                .percent {
                    color: var(--subtitle-color);
                    font-size: 12px;
                    font-weight: 600;
                    font-variant-numeric: tabular-nums;
                }

                .progress-track {
                    width: 100%;
                    height: 4px;
                    margin-bottom: 22px;
                    overflow: hidden;
                    border-radius: 999px;
                    background: var(--track-bg);
                }

                .progress-fill {
                    width: 0%;
                    height: 100%;
                    border-radius: inherit;
                    background: linear-gradient(90deg, var(--fill-1), var(--fill-2));
                    transition: width 100ms linear;
                }

                .settings-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 18px;
                    color: var(--subtitle-color);
                    font-size: 12px;
                    font-weight: 600;
                }

                .settings-row label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    user-select: none;
                }

                .settings-row input[type="checkbox"] {
                    width: 14px;
                    height: 14px;
                    accent-color: var(--fill-1);
                    cursor: pointer;
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

                #copyBtn, #retryBtn, #reportBtn {
                    display: none;
                    background: var(--btn-secondary-bg);
                    color: var(--btn-secondary-color);
                    border: 1px solid var(--btn-secondary-border);
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

                    <div class="toolbar">
                        <button
                            class="icon-btn"
                            id="themeBtn"
                            type="button"
                            title="Cycle theme (auto / dark / light)"
                            aria-label="Cycle theme"
                        >&#9788;</button>
                    </div>

                    <div class="logo" id="izenTitle">
                        izen<span class="logo-accent">.lol</span>
                    </div>

                    <div class="subtitle">Bypass Userscript</div>

                    <div class="destination" id="destination">Preparing destination…</div>

                    <div class="countdown-row">
                        <span class="countdown" id="countdown" role="status" aria-live="polite">Preparing…</span>
                        <span class="percent" id="percent"></span>
                    </div>

                    <div class="progress-track" aria-hidden="true">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>

                    <div class="settings-row">
                        <label>
                            <input type="checkbox" id="autoContinueToggle" />
                            Auto-continue next time
                        </label>
                    </div>

                    <div class="button-row">
                        <button id="continueBtn" type="button" disabled>Please wait…</button>
                        <button id="copyBtn" type="button">Copy destination</button>
                        <button id="retryBtn" type="button">Try again</button>
                        <button id="reportBtn" type="button">Report broken site</button>
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
            percent: $('#percent'),
            progressFill: $('#progressFill'),
            continueBtn: $('#continueBtn'),
            copyBtn: $('#copyBtn'),
            retryBtn: $('#retryBtn'),
            reportBtn: $('#reportBtn'),
            themeBtn: $('#themeBtn'),
            autoContinueToggle: $('#autoContinueToggle'),
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
        ui.percent.textContent = '100%';
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

        if (settings.autoContinue) {
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
            ui.percent.textContent = `${Math.round(progress * 100)}%`;

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
     * SETTINGS UI WIRING
     * ============================================================
     */

    function wireSettingsControls(ui) {
        ui.autoContinueToggle.checked = settings.autoContinue;

        ui.autoContinueToggle.addEventListener('change', () => {
            setAutoContinue(ui.autoContinueToggle.checked);
        });

        const applyThemeLabel = () => {
            const glyphs = { auto: '☉', dark: '☽', light: '☀' };
            ui.themeBtn.textContent = glyphs[settings.theme] || glyphs.auto;
            ui.themeBtn.title = `Theme: ${settings.theme} (click to cycle)`;
        };

        applyThemeLabel();

        ui.themeBtn.addEventListener('click', () => {
            const next = cycleTheme();

            if (next === 'auto') {
                ui.host.removeAttribute('data-theme');
            } else {
                ui.host.setAttribute('data-theme', next);
            }

            applyThemeLabel();
        });
    }

    function wireReportButton(ui, target) {
        ui.reportBtn.style.display = 'block';

        ui.reportBtn.addEventListener('click', () => {
            const title = encodeURIComponent(
                `Broken bypass on ${window.location.hostname}`
            );

            const scriptVersion =
                typeof GM_info !== 'undefined' && GM_info?.script?.version
                    ? GM_info.script.version
                    : 'unknown';

            const body = encodeURIComponent(
                [
                    `Gate site: ${window.location.href}`,
                    `Resolved destination: ${target.href}`,
                    `Script version: ${scriptVersion}`,
                ].join('\n')
            );

            const reportUrl = `${CONFIG.report_issue_url}?title=${title}&body=${body}`;

            window.open(reportUrl, '_blank', 'noopener,noreferrer');
        });
    }

    /*
     * ============================================================
     * REDIRECT UI
     * ============================================================
     */

    async function showRedirectUI(target) {
        const waitTime = isLinkvertiseHashPage()
            ? getWaitSeconds(CONFIG.linkvertise_hash_wait, 10)
            : getWaitSeconds(CONFIG.time, 1);

        const isInstant = !CONFIG.wait_before_redirect || waitTime <= 0;

        // True zero-render fast path: when there's nothing to wait for and
        // the user has opted into auto-continue, skip mounting the shadow
        // DOM UI entirely and navigate immediately. If the navigation
        // itself throws, fall through to the normal UI so the user isn't
        // left on a blank page.
        if (isInstant && settings.autoContinue) {
            try {
                window.location.assign(target.href);
                return;
            } catch (error) {
                log('Instant redirect failed, falling back to UI:', error);
            }
        }

        await ensureDocumentRoot();

        const ui = createUI();

        // Only display the destination hostname by default. This avoids
        // exposing massive query strings/tokens in the main UI; the full
        // URL is still available via the title tooltip and copy button.
        ui.destination.textContent = target.hostname;
        ui.destination.title = target.href;

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

        wireSettingsControls(ui);
        wireReportButton(ui, target);

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

            wireSettingsControls(ui);
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

            const hasAnyRedirectParam = KNOWN_REDIRECT_PARAMS.some((param) =>
                current.searchParams.has(param)
            );

            // If a resolver has returned us a redirect, validate and
            // display it. Otherwise send the current URL off for resolving.
            const target = hasAnyRedirectParam ? getRedirectTarget() : null;

            if (!target) {
                await handoffToIzen();
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

    /*
     * ============================================================
     * MENU COMMANDS
     * ============================================================
     *
     * Only registered when the userscript manager supports it. These give
     * power users a way to retry or flip auto-continue without waiting for
     * the on-page UI (useful if the page never reaches a stable state).
     */

    let autoContinueMenuId = null;

    function updateAutoContinueMenuEntry() {
        const register = gmApi('GM_registerMenuCommand');
        const unregister = gmApi('GM_unregisterMenuCommand');

        if (!register) {
            return;
        }

        // Menu labels are captured at registration time in most managers,
        // so drop the old toggle entry before adding the one reflecting
        // the new state.
        if (unregister && autoContinueMenuId !== null) {
            try {
                unregister(autoContinueMenuId);
            } catch (error) {
                log('Failed to unregister menu command:', error);
            }
        }

        try {
            autoContinueMenuId = register(
                `Auto-continue: ${settings.autoContinue ? 'ON' : 'OFF'} (click to toggle)`,
                () => {
                    setAutoContinue(!settings.autoContinue);
                    updateAutoContinueMenuEntry();
                }
            );
        } catch (error) {
            log('Failed to register menu command:', error);
        }
    }

    function registerMenuCommands() {
        const register = gmApi('GM_registerMenuCommand');

        if (!register) {
            return;
        }

        try {
            register('Retry bypass (reload page)', () => {
                window.location.reload();
            });
        } catch (error) {
            log('Failed to register menu command:', error);
        }

        updateAutoContinueMenuEntry();
    }

    registerMenuCommands();

    // document-start means we can start immediately.
    main();
})();
