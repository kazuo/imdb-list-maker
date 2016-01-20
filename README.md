# IMDb List Maker
Chrome Extension that creates a list from IMDb's birthdays. Useful for generating lists of guests.
 
 To install
 
 1. Clone or download/extract repo
 2. Open chrome://extensions in Chrome
 3. Ensure "Developer mode" is enabled
 4. Choose "Load unpacked extensions..."
 5. Choose where *imdb-list-maker* folder was unpacked
  
There will be an action for IMDb List Maker in Chrome. You can only create a list when you are on IMDb's birthday page!
Settings are automatically saved whenever a list is created.

Enjoy!

## Technical
The script `content.js` simply uses jQuery to parse through the DOM. However, script `popup.js` uses AngularJS to aid
 with the popup UI. Sure, it may be a little overkill, but using AngularJS instead of jQuery made it a bit easier to
 maintain. 