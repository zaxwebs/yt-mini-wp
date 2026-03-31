# YT Mini

A lightweight WordPress plugin that opens YouTube links in a sleek, draggable miniplayer — so visitors stay on your page while watching videos.

## Features

- **Automatic link detection** — Scans posts and pages for YouTube links (including `youtu.be` short URLs) and intercepts clicks.
- **Timestamp support** — Honors `?t=`, `#t=`, and human-readable (`1h2m3s`) timestamp formats.
- **Draggable miniplayer** — Grab the header bar to reposition the player anywhere on screen.
- **Privacy-enhanced embeds** — Uses `youtube-nocookie.com` to comply with YouTube's privacy-enhanced mode.
- **Configurable position** — Choose the default screen corner (top-left, top-right, bottom-left, bottom-right) from the admin settings page.
- **Responsive** — Adapts gracefully to small viewports.
- **Accessible** — ARIA dialog semantics, keyboard navigation (Escape to close, focus trap), and screen-reader hints.
- **Smart pause** — Pauses the miniplayer when the user clicks through to YouTube via the native player's logo or title.
- **Zero dependencies** — Pure vanilla JavaScript with no external libraries.

## Requirements

- WordPress 5.0+
- PHP 7.4+

## Installation

1. Download or clone this repository into your `wp-content/plugins/` directory:
   ```bash
   cd wp-content/plugins/
   git clone https://github.com/zaxwebs/yt-mini-wp.git yt-mini
   ```
2. Activate the plugin from **Plugins → Installed Plugins** in your WordPress admin.
3. That's it — any YouTube link on a singular post or page will now open in the miniplayer.

## Configuration

Navigate to **Settings → YT Mini** in the WordPress admin to configure:

| Setting                  | Description                                      | Default        |
| ------------------------ | ------------------------------------------------ | -------------- |
| **Default Player Position** | The screen corner where the miniplayer appears | Bottom Right   |

Available positions: Top Left, Top Right, Bottom Left, Bottom Right.

A quick **Settings** link is also available directly on the Plugins list page.

## Usage

1. Write a post or page containing one or more YouTube links, for example:
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42
   https://youtu.be/dQw4w9WgXcQ?t=1m30s
   ```
2. When a visitor clicks any detected link, the miniplayer slides into view and begins playing.
3. The player header displays the video title and can be dragged to reposition the player.
4. Click the **✕** button to close the player and stop playback.

## Project Structure

```
yt-mini/
├── assets/
│   ├── css/
│   │   └── yt-mini.css          # Miniplayer styles (glassmorphism, positioning, responsive)
│   └── js/
│       └── yt-mini.js           # Front-end controller (link scanning, IFrame API, drag)
├── includes/
│   ├── class-yt-mini-admin.php  # Admin settings page, sanitization, plugin action links
│   └── class-yt-mini-front.php  # Front-end asset enqueueing and settings localization
├── views/
│   ├── settings-page.php        # Admin settings page template
│   └── settings-position.php    # Position picker radio grid template
├── yt-mini.php                  # Main plugin bootstrap file
├── .gitignore
└── README.md
```

## How It Works

1. On singular posts/pages, `YT_Mini_Front` enqueues the CSS and JS assets and passes the saved position setting to JavaScript via `wp_localize_script`.
2. `yt-mini.js` scans all `<a>` elements on the page, parsing their `href` for YouTube video IDs and optional timestamps. Matching links receive a `data-yt-mini` attribute.
3. A delegated click listener intercepts clicks on tagged links, prevents navigation, and opens the video in a fixed-position miniplayer using the YouTube IFrame Player API.
4. The player supports video swapping — clicking a different link loads the new video without rebuilding the player.
5. The header bar supports pointer-based dragging so users can reposition the player freely.
6. When the user clicks YouTube's native logo or video title inside the iframe (opening a new tab), the miniplayer automatically pauses.

## Accessibility

| Feature | Detail |
| --- | --- |
| **Dialog semantics** | The player has `role="dialog"` and `aria-label="YouTube miniplayer"`, with `aria-hidden` toggled on open/close. |
| **Focus management** | Focus moves to the close button when the player opens, and returns to the triggering link when it closes. |
| **Keyboard support** | Press **Escape** to close the player. **Tab** is trapped within the dialog while it's open. |
| **Link hints** | Intercepted links receive `aria-haspopup="dialog"` and a visually-hidden label "(opens in miniplayer)" so screen readers communicate the actual behavior. |
| **Iframe isolation** | The YouTube iframe is set to `tabindex="-1"` so it doesn't interfere with the dialog's Tab order; users can still click into it for YouTube's native controls. |

## License

GPL-2.0-or-later — see WordPress plugin header for details.

## Author

**Zack Webster** — [GitHub](https://github.com/zaxwebs)
