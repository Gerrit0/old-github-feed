# old-github-feed

Brings back GitHub's old feed. To use this, install a user script manager (like https://www.tampermonkey.net/), then go to https://github.com/Gerrit0/old-github-feed/raw/main/old-feed.user.js and it will prompt you to install.

If you can't install user scripts, you can use https://github.com/dashboard-feed to view the old feed (with slightly broken styling) manually.

## Features

1. Caches following feed to localStorage to improve page load speed
2. Automatically reloads the following feed every minute like GitHub did
3. Allows quickly switching between the Following/For you feeds, and remembers which one was last active

## Change Log

### v0.17 (2024-12-07)

- Also detect/remove copilot from dashboard (@cotes2020)

### v0.16 (2024-10-08)

- Update favicon to use GitHub instead of Google (@xPaw)

### v0.15 (2024-10-06)

- Update to handle GitHub style/layout change (@KMohZaid)

### v0.14 (2024-04-27)

- Add box around non-boxed feed items for consistency (@AlexV525)

### v0.13 (2023-10-15)

- Updated Following/For You styles for consistency with GitHub's UI (@Teraskull)

### v0.12 (2023-10-07)

- Adjusted page insert to fix display on very narrow (mobile) screens (@Gerrit0)

### v0.11 (2023-09-22)

- Update styling of feed entries to more closely match GitHub's colors (@AlexV525)

### v0.10 (2023-09-18)

- Improve selectors for padding adjustment to work in more cases (@AlexV525)

### v0.9 (2023-09-17)

- Reduce overly large padding between feed entries (@AlexV525)

### v0.8 (2023-09-16)

- Implement toggle for old/new feed (@Gerrit0)
- Fix crash when overwriting the feed due to infinite loop (@Gerrit0)

### v0.7 (2023-09-12)

- SSO link is no longer removed from the page when overwriting the new feed (@Gerrit0)

### v0.6 (2023-09-07)

- Feed is now full-width like it used to be, rather than oddly centered like GitHub's new design (@Gerrit0)

### v0.5 (2023-09-06)

- Update feed target selectors to handle GitHub's new feed structure (@jevinskie)

### v0.4 (2022-10-29)

- Fixed jitter caused by conflict with Refined GitHub addon (@Gerrit0)

### v0.3 (2022-10-29)

- Fixed "Load More" button at end of feed (@Gerrit0)

### v0.2 (2022-10-29)

- Improved styling on mobile/small screens (@Gerrit0)

### v0.1 (2022-10-28)

- Initial release
