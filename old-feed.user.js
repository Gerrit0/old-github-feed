// ==UserScript==
// @name         Old Feed
// @namespace    https://gerritbirkeland.com/
// @version      0.1
// @updateURL    https://raw.githubusercontent.com/Gerrit0/old-github-feed/main/old-feed.user.js
// @downloadURL  https://raw.githubusercontent.com/Gerrit0/old-github-feed/main/old-feed.user.js
// @description  Replaces the "For you" feed with the old one
// @author       Gerrit Birkeland
// @match        https://github.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const observer = new MutationObserver(fixDashboard);
    let dashboardCache = "<p>Updating...</p>" + (localStorage.getItem("dashboardCache") || "");
    fixDashboard();
    updateDashboard();

    function fixDashboard() {
        if (location.pathname === '/') {
            observer.disconnect();
            const dashboard = document.getElementById('dashboard');
            dashboard.innerHTML = dashboardCache;
            observer.observe(dashboard, { subtree: true, childList: true });
        }
    }

    function updateDashboard() {
        fetch("https://github.com/dashboard-feed", { headers: { "X-Requested-With": "XMLHttpRequest" } })
            .then(r => r.text())
            .then(html => {
                dashboardCache = html;
                localStorage.setItem("dashboardCache", html);
                fixDashboard();
            });
    }
})();
