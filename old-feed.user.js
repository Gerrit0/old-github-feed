// ==UserScript==
// @name         Old Feed
// @namespace    https://gerritbirkeland.com/
// @version      0.7
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
    const OLD_ID=`old_gh_feed_${(Math.random() * 1e10)|0}`
    const observer = new MutationObserver(fixDashboard);

    const feedContainer = document.querySelector(".feed-content");
    feedContainer.classList.remove("flex-justify-center");
    feedContainer.style.maxWidth="100vw";
    const feedColumn = feedContainer.querySelector(".feed-main");
    feedColumn.style.maxWidth="100vw";

    const dashboardContents = document.createElement("template")
    dashboardContents.innerHTML = `<div id="${OLD_ID}"><p style="margin:0">Updating...</p>${localStorage.getItem("dashboardCache") || ""}</div>`;
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
        observer.observe(feedColumn, { subtree: true, childList: true });
    }

    function allowChanges() {
        observer.disconnect();
    }

    function fixDashboard() {
        allowChanges();
        const feed = document.querySelector("#dashboard feed-container") || document.querySelector(`#${OLD_ID}`);
        if (feed) {
            feed.replaceWith(dashboardContents.content.cloneNode(true));

            const loadMoreButton = feedColumn.querySelector(".ajax-pagination-btn");
            loadMoreButton?.addEventListener("click", (event) => {
                allowChanges();
                loadMoreButton.textContent = loadMoreButton.dataset.disableWith;
                loadMoreButton.disabled = true;
                preventChanges();
                fetchDashboard();
                event.preventDefault();
            });
        }
        preventChanges();


    }

    function fetchDashboard() {
        fetch(`https://github.com/dashboard-feed?page=${nextPage++}`, { headers: { "X-Requested-With": "XMLHttpRequest" } })
            .then(r => r.text())
            .then(html => {
            if (nextPage === 2) {
                dashboardContents.innerHTML = `<div id="${OLD_ID}"><p style="margin:0">&nbsp;</p>${html}</div>`;
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
