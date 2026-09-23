# Spidey OS

An immersive Spider-Man-inspired browser desktop environment built from scratch with HTML, CSS, and vanilla JavaScript.

Built for **Hack Club Stardance**.

> Created by [Your Name]

## Demo

Live demo: [Live Demo URL]

Spidey OS starts with a cinematic boot experience, then opens into a draggable desktop environment with apps, a taskbar, music controls, news, weather, and more.

## Features

- Spider-Man cinematic boot screen with video and intro audio.
- Animated Spider-Man welcome card after startup.
- Desktop background with HUD-style status bar.
- Draggable, resizable, minimizable app windows.
- Global music player with shared playback controls.
- Spidey Mix Music app with play, pause, seek, volume, and mute controls.
- Daily Bugle news app with Perigon API support and demo fallback stories.
- Spidey Weather dashboard powered by Open-Meteo.
- Calculator and Notepad apps.
- Left-side image slideshow popup.
- Responsive taskbar and mobile layouts.
- Local caching for selected news and user preferences.

## Built With

- HTML5
- CSS3
- Vanilla JavaScript
- HTMLMedia and Web Audio browser APIs
- [Perigon API](https://perigon.io/)
- [Open-Meteo API](https://open-meteo.com/)

## Getting Started

### Clone the project

```bash
git clone [Repository URL]
cd [Repository Folder]
```

### Run the project

Spidey OS does not require npm, a bundler, or a build step. You can open `index.html` directly in a browser.

For the best experience, serve the project with a local static server because local servers handle video, audio, and API requests more consistently:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

The first click on the boot screen starts the intro audio. This is required because modern browsers block audible autoplay until the visitor interacts with the page.

## Configure Daily Bugle News

The Daily Bugle can use Perigon for live news. Do not hardcode your API key into frontend source code or commit it to GitHub.

Open the browser developer console and run:

```js
localStorage.setItem(
  'spidey-news-config',
  JSON.stringify({
    provider: 'perigon',
    apiKey: 'YOUR_PERIGON_API_KEY'
  })
);
```

Refresh the page and open Daily Bugle. If no key is configured, the app uses clearly marked local demo stories. Cached news can also be displayed when the app is offline.

If an API key has ever been exposed publicly, revoke it and generate a replacement from your Perigon dashboard.

## Customize the OS

### Personal attribution

Replace these placeholders in `index.html`:

```text
[Your Name]
[Live Demo URL]
```

### Slideshow images

Place images inside:

```text
popup/images/
```

Then update the `SLIDES` array in `popup/popup.js`:

```js
const SLIDES = [
  'popup/images/my-picture.jpg',
  'popup/images/another-picture.png'
];
```

### Music

The shared audio system is defined in `app/music/audioManager.js`. Add future tracks to `window.SPIDY_AUDIO_TRACKS` and connect them to the Music app playlist.

The default track is:

```text
spider-man-intro.mp3
```

### Visual assets

You can replace the desktop background, boot video, Spider-Man artwork, app icons, and other images without changing the window manager architecture.

## Project Structure

```text
.
├── index.html                  # Main OS shell and app containers
├── style.css                   # Boot screen and global styles
├── script.js                   # Boot transition and clock logic
├── app/
│   ├── bugle/                  # Daily Bugle news app and Perigon service
│   ├── calculator/             # Calculator app
│   ├── music/                  # Shared audio manager and Music app
│   ├── Notepad/                # Notepad app
│   ├── shared/                 # Window, desktop, and integration styles
│   ├── taskbar/                # Taskbar rendering and controls
│   ├── weather/                # Weather app and Open-Meteo service
│   ├── registry.js             # App registry
│   └── windowManager.js        # Window lifecycle and interaction logic
├── assets/                     # App icons and supporting assets
└── popup/                      # Picture slideshow component
```

## Development Notes

- This is a static browser project with no npm or build process.
- Application features are split into modular JavaScript and CSS files.
- The window manager creates and controls app windows from the registry.
- The Music app and global mini-player share one audio instance.
- External API failures fall back gracefully where supported.

## Roadmap

- Add more music tracks and playlist management.
- Build a complete Settings app.
- Expand Browser and Gallery functionality.
- Add more desktop themes and visual customization.
- Improve touch interactions on mobile devices.
- Add richer app-to-app system integrations.

## Credits

Built for **Hack Club Stardance**.

Created by **[Your Name]**.

## License

License: **[Choose a license before publishing]**
