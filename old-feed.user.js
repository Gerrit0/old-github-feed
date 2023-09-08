// ==UserScript==
// @name         Old Feed
// @namespace    https://gerritbirkeland.com/
// @version      0.6
// @updateURL    https://raw.githubusercontent.com/Gerrit0/old-github-feed/main/old-feed.user.js
// @downloadURL  https://raw.githubusercontent.com/Gerrit0/old-github-feed/main/old-feed.user.js
// @description  Replaces the "For you" feed with the old one
// @author       Gerrit Birkeland
// @match        https://github.com/
// @match        https://github.com/dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const observer = new MutationObserver(() => {
        if (document.querySelector("feed-container")) {
            fixDashboard();
        }
    });
    const feedContainer = document.querySelector(".feed-content");
    feedContainer.classList.remove("flex-justify-center");
    feedContainer.style.maxWidth="100vw";
    const feedContent = feedContainer.querySelector(".feed-main");
    feedContent.style.maxWidth="100vw";

    const dashboardContents = document.createElement("template")
    dashboardContents.innerHTML = `<p style="margin:0">Updating...</p>${localStorage.getItem("dashboardCache") || ""}`;
    let nextPage = 1;

    fixDashboard();
    fetchDashboard();

    // GitHub updated the feed every minute unless the user has loaded more, so we'll do the same.
    const updateTimer = setInterval(() => {
        if (nextPage === 2) {
            nextPage--;
            fetchDashboard();
        }
    }, 60000);

    function preventChanges() {
        observer.observe(feedContent, { subtree: true, childList: true });
    }

    function allowChanges() {
        observer.disconnect();
    }

    function fixDashboard() {
        allowChanges();
        feedContent.innerHTML = dashboardContents.innerHTML;
        preventChanges();

        const loadMoreButton = feedContent.querySelector(".ajax-pagination-btn");
        loadMoreButton?.addEventListener("click", (event) => {
            allowChanges();
            loadMoreButton.textContent = loadMoreButton.dataset.disableWith;
            loadMoreButton.disabled = true;
            preventChanges();
            fetchDashboard();
            event.preventDefault();
        });
    }

    function fetchDashboard() {
        fetch(`https://github.com/dashboard-feed?page=${nextPage++}`, { headers: { "X-Requested-With": "XMLHttpRequest" } })
            .then(r => r.text())
            .then(html => {
                if (nextPage === 2) {
                    dashboardContents.innerHTML = `<p style="margin:0">&nbsp;</p>${html}`;
                    localStorage.setItem("dashboardCache", html);
                } else {
                    dashboardContents.innerHTML += html;
                    // GitHub's API only ever returns 2 pages of results, so no point in showing the load more button.
                    const updateForm = dashboardContents.content.querySelector('.ajax-pagination-form');
                    updateForm.remove();
                }
                fixDashboard();
            });
    }
})();
