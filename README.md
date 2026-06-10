**Band Schedule Countdown**

https://thomassb.github.io/Stage-Band-Schedule/


Simple web app that displays a live countdown clock and a timeline of band slots and changeovers for a single day. It's a static page you can open in a browser to add bands, view live/next events, and keep the screen awake during a show.

**Features**
- **Clock:** Large digital clock showing current time.
- **Next Event:** Banner showing the next scheduled item or the live item.
- **Timeline:** Band items and automatic changeover slots between bands.
- **Live Highlighting:** Currently active event is visually highlighted and scrolled into view.
- **Persistence:** Bands are saved to browser `localStorage` under the `bands` key.
- **Wake Lock:** Attempts to keep the screen awake using the Screen Wake Lock API (requires a user interaction to enable).

**How it works**
- Enter a band name, start time and end time using the form on the page.
- The script sorts bands by start time and builds a schedule. If there's a gap between a band's end and the next band's start, it inserts a changeover slot.
- The page updates every second to show countdowns until events start/end and marks which card is active.

**Usage**
- Open the app in a browser: [index.html](index.html)
- Add a band using the form at the top.
- Delete a band using the "Delete" button on a band card.
- The banner at the top shows the next event and remaining time or the current live act.

**Data format**
- The `bands` array stored in `localStorage` contains objects like:
  - `{ "name": "Band Name", "start": "HH:MM", "end": "HH:MM" }`
- The schedule is reconstructed from these entries each load.

**Wake Lock notes**
- The app requests a screen wake lock after the first user click.
- Some browsers may not support the Wake Lock API; in that case the screen may still dim or sleep.

**Development / Testing**
- This is a static page — open `index.html` directly in a browser (double-click the file or use your browser's "Open File" option). No server is required. Click the page once to enable the wake lock.

**Customization**
- Styling and layout live in the top of `index.html` (internal CSS).
- Time display uses local device time; change locale formatting in the `updateClock()` function if needed.

**Troubleshooting**
- If the wake lock doesn't work, check browser support and console errors.
- If events don't persist, ensure the browser accepts `localStorage` and not in private mode blocking storage.

**Files**
- The main page: [index.html](index.html)
- This file: [README.md](README.md)

If you'd like, I can also:
- Add keyboard shortcuts, import/export for the schedule, or
- Extract the CSS into a separate file and add basic automated tests.
