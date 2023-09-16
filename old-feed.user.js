// ==UserScript==
// @name         Old Feed
// @namespace    https://gerritbirkeland.com/
// @version      0.8
// @updateURL    https://raw.githubusercontent.com/Gerrit0/old-github-feed/main/old-feed.user.js
// @downloadURL  https://raw.githubusercontent.com/Gerrit0/old-github-feed/main/old-feed.user.js
// @description  Restores the Following/For You buttons to let you pick your own feed
// @author       Gerrit Birkeland
// @match        https://github.com/
// @match        https://github.com/dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const feedContainer = document.querySelector("#dashboard feed-container");
    // Apparently if this isn't true, then a SSO popup is being shown, so don't do anything.
    if (!feedContainer) return;

    const columnContainer = document.querySelector(".feed-content");
    columnContainer.classList.remove("flex-justify-center");
    columnContainer.style.maxWidth="100vw";
    const feedColumn = columnContainer.querySelector(".feed-main");
    feedColumn.style.maxWidth="100vw";

    if (feedColumn.children.length != 2) {
        console.warn("[Old Feed] Page does not have expected structure, please report an issue");
        return;
    }

    const followingFeedWrapper = document.createElement("div");
    followingFeedWrapper.innerHTML = localStorage.getItem("dashboardCache") || "";
    feedColumn.prepend(followingFeedWrapper);
    const loadMoreButton = followingFeedWrapper.querySelector(".ajax-pagination-btn");
    loadMoreButton?.addEventListener("click", (event) => {
        loadMoreButton.textContent = loadMoreButton.dataset.disableWith;
        loadMoreButton.disabled = true;
        fetchDashboard();
        event.preventDefault();
    });

    const picker = document.createElement("div");
    picker.classList.add("color-border-default");
    picker.style = "border-bottom: 1px solid; margin-bottom: 1em";
    feedColumn.prepend(picker);
    picker.innerHTML = `<button class="Button" data-show="following">Following</button><button class="Button" data-show="forYou">For you</button><span style="float:right">Loading...</span>`;
    const loadingIndicator = picker.querySelector("span");

    const tabs = { following: followingFeedWrapper, forYou: feedContainer };
    picker.addEventListener("click", event => {
        if (event.target.tagName !== "BUTTON") return;
        for (const [name, el] of Object.entries(tabs)) {
            el.style.display = name === event.target.dataset.show ? "block" : "none";
        }
        for (const button of picker.querySelectorAll("button")) {
            button.style = button === event.target
                ? "border-radius: 0; border-bottom: 1px solid var(--color-primer-border-active);"
                : "";
        }
        localStorage.setItem("dashboardActiveButton", event.target.dataset.show);
    });
    picker.querySelector(`[data-show=${localStorage.getItem("dashboardActiveButton") || "following"}]`).click();

    let nextPage = 1;
    fetchDashboard();

    // GitHub updated the feed every minute unless the user has loaded more, so we'll do the same.
    setInterval(() => {
        if (nextPage === 2) {
            nextPage--;
            fetchDashboard();
        }
    }, 60000);

    function fetchDashboard() {
        fetch(`https://github.com/dashboard-feed?page=${nextPage++}`, { headers: { "X-Requested-With": "XMLHttpRequest" } })
            .then(r => r.text())
            .then(html => {
            loadingIndicator.textContent = "";
            if (nextPage === 2) {
                followingFeedWrapper.innerHTML = html;
                localStorage.setItem("dashboardCache", html);
            } else {
                followingFeedWrapper.innerHTML += html;
                // GitHub's API only ever returns 2 pages of results, so no point in showing the load more button.
                const updateForm = followingFeedWrapper.querySelector('.ajax-pagination-form');
                updateForm.remove();
            }
        });
    }
})();
