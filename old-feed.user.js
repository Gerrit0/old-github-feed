// ==UserScript==
// @name         Old Feed
// @namespace    https://gerritbirkeland.com/
// @version      0.16
// @updateURL    https://raw.githubusercontent.com/Gerrit0/old-github-feed/main/old-feed.user.js
// @downloadURL  https://raw.githubusercontent.com/Gerrit0/old-github-feed/main/old-feed.user.js
// @description  Restores the Following/For You buttons to let you pick your feed
// @author       Gerrit Birkeland
// @match        https://github.com/
// @match        https://github.com/dashboard
// @icon         https://github.com/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const feedContainer = document.querySelector("#dashboard feed-container");
    // Apparently if this isn't true, then an SSO popup is being shown, so don't do anything.
    if (!feedContainer) return;

    // Remove Copilot
    const copilot = document.querySelector('.copilotPreview__container');
    if (copilot) copilot.remove();

    const columnContainer = document.querySelector(".feed-content");
    columnContainer.classList.remove("flex-justify-center");
    columnContainer.style.maxWidth = "100vw";
    const feedColumn = columnContainer.querySelector(".feed-main");
    feedColumn.style.maxWidth = "100vw";

    if (feedColumn.children.length != 2) {
        console.warn("[Old Feed] Page does not have expected structure, please report an issue");
        return;
    }

    const news = document.querySelector("#dashboard .news");

    const followingFeedWrapper = document.createElement("div");
    followingFeedWrapper.innerHTML = localStorage.getItem("dashboardCache") || "";
    news.appendChild(followingFeedWrapper);

    const picker = document.createElement("div");
    news.insertBefore(picker, feedContainer);
    picker.innerHTML = `
        <div class="mb-3">
            <nav class="overflow-hidden UnderlineNav">
                <ul class="UnderlineNav-body">
                    <li class="d-inline-flex">
                        <a data-show="following" class="feed-button UnderlineNav-item selected">
                            <span data-content="Following">Following</span>
                        </a>
                    </li>
                    <li class="d-inline-flex">
                        <a data-show="forYou" class="feed-button UnderlineNav-item">
                            <span data-content="For You">For You</span>
                        </a>
                    </li>
                </ul>
                <ul class="UnderlineNav-body">
                    <li class="d-inline-flex">
                        <span class="loader">Loading...</span>
                    </li>
                </ul>
            </nav>
        </div>
    `;

    const loadingIndicator = picker.querySelector(".loader");

    const tabs = { following: followingFeedWrapper, forYou: feedContainer };
    picker.addEventListener("click", event => {
        const isChildSpanClicked = event.target.tagName === "SPAN" && event.target.parentNode.classList.contains("feed-button") && event.target.parentNode.tagName === "A"
        let target = isChildSpanClicked ? event.target.parentNode : event.target;

        if (target.tagName !== "A") return;

        Object.entries(tabs).forEach(([name, el]) => {
            el.style.display = name === target.dataset.show ? "block" : "none";
        });

        picker.querySelectorAll(".feed-button").forEach(button => {
            button.classList.remove("selected");
        });
        target.classList.add("selected");

        localStorage.setItem("dashboardActiveButton", target.dataset.show);
    });
    picker.querySelector(`[data-show=${localStorage.getItem("dashboardActiveButton") || "following"}]`).click();

    let userHasLoadedMore = false;
    fetchDashboard();

    // GitHub updates the feed every minute unless the user has loaded more, so we'll do the same.
    setInterval(() => {
        if (userHasLoadedMore === false) {
            fetchDashboard();
        }
    }, 60000);

    function fetchDashboard() {
        fetch(`https://github.com/dashboard-feed?page=1`, { headers: { "X-Requested-With": "XMLHttpRequest" } })
            .then(r => r.text())
            .then(html => {
            loadingIndicator.textContent = "";
            followingFeedWrapper.innerHTML = html;
            followingFeedWrapper.querySelector(".ajax-pagination-btn").addEventListener("click", () => {
                userHasLoadedMore = true;
            });
            // Apply pretty paddings for feeds.
            followingFeedWrapper.querySelector(".body .py-4").style.setProperty('padding-top', 'var(--base-size-4, 4px)', 'important');
            followingFeedWrapper.querySelectorAll(".body .py-4").forEach((e) => {
                e.classList.remove("py-4");
                e.classList.add("py-3");
            });
            // Apply the same foreground color for texts.
            followingFeedWrapper.querySelectorAll(".body > div > div > div.color-fg-muted").forEach((e) => {
                if (!e.nextElementSibling) {
                    e.querySelector("div").classList.add("color-fg-default");
                }
            });
            // Apply box for non-boxed items.
            followingFeedWrapper.querySelectorAll(".body > .d-flex > .d-flex > div > div[class=color-fg-default]").forEach((e) => {
                e.classList.add("Box");
                e.classList.add("p-3");
                e.classList.add("mt-2");
            });
            // Apply the same colors for feeds.
            followingFeedWrapper.querySelectorAll("div.Box.color-bg-overlay").forEach((e) => {
                e.classList.remove("color-bg-overlay");
                e.classList.remove("color-shadow-medium");
                e.classList.add("feed-item-content");
                e.classList.add("border");
                e.classList.add("color-border-default");
                e.classList.add("color-shadow-small");
                e.classList.add("rounded-2");
                const markdownBody = e.querySelector("div.color-fg-muted.comment-body.markdown-body");
                if (markdownBody) {
                    markdownBody.classList.remove("color-fg-muted");
                }
            });
            // Saving the edited content for the cache.
            localStorage.setItem("dashboardCache", followingFeedWrapper.innerHTML);
        });
    }
})();
