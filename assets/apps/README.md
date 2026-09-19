# Spidey OS App Icons

Place your application icons here. The taskbar will automatically use them with fallback to emoji if missing.

Expected files (all optional - system falls back gracefully):

- notepad.png
- calculator.png
- weather.png
- bugle.png
- browser.png
- gallery.png
- music.png
- files.png
- settings.png
- terminal.png

Requirements:
- Use PNG with transparent background recommended
- Square aspect ratio (e.g., 128x128, 256x256)
- Will be displayed with `object-fit: contain`
- Keep file size small (<100KB) for performance

Example usage in registry:

```js
{
  id: "weather",
  name: "Spidey Weather",
  icon: "assets/apps/weather.png", // <-- replaceable path
  fallbackIcon: "🌦️",
  ...
}
```

If an image fails to load, the fallbackIcon emoji will be shown automatically.

You can also use JPG, SVG, or WEBP - just update the path in `app/registry.js`.

Do NOT distort images - the CSS uses `object-fit: contain` and preserves aspect ratio.
