# Scroll Diagnostics

A lightweight browser userscript for diagnosing mouse-wheel and scrolling problems in Firefox-derived browsers, with particular focus on Waterfox running on Linux/Wayland.

The script observes wheel and scroll events without modifying the page's scrolling behavior. It is intended to help distinguish between:

* wheel events not reaching the web page;
* wheel events reaching the page but being cancelled;
* wheel events reaching an unexpected element;
* custom scroll containers failing to scroll;
* nested scrolling and scroll chaining behavior;
* iframe scrolling behavior; and
* site-specific JavaScript or CSS affecting scrolling.

This project was created as a diagnostic aid while investigating scrolling behavior in a custom Waterfox build running on Linux/Wayland.

## Features

The diagnostic overlay reports:

* wheel event target;
* horizontal and vertical wheel deltas;
* `deltaMode`;
* `ctrlKey` state;
* whether the wheel event was cancelled;
* scroll events and resulting scroll positions;
* target `overflow-y`;
* `overscroll-behavior-y`;
* `scroll-snap-type`; and
* the current page URL.

The script also mirrors diagnostic messages to the browser's developer console using the `[scrolldiag]` prefix.

## Installation

The script is intended to be installed using a userscript manager such as Violentmonkey or Tampermonkey.

1. Install your preferred userscript manager.

2. Create a new userscript.

3. Copy the contents of:

   `userscript/scroll-diagnostics.user.js`

4. Save the script.

5. Open the site where scrolling needs to be investigated.

The script is configured to run at `document-start`.

## Usage

After installation, open the affected page and reproduce the scrolling problem.

The diagnostic panel appears on the right side of the page and records relevant events.

Example:

```text
scroll-diag loaded: https://example.com/
WHEEL-IN  div.viewer dy=135 dx=0 mode=0 ctrl=false [ovf=hidden osb=auto snap=none]
SCROLL    div.scroller top=135 left=0
```

A normal scrolling sequence should generally show a `WHEEL-IN` event followed by a corresponding `SCROLL` event on the appropriate scrolling element.

The absence of a `SCROLL` event does not by itself prove that the browser failed to scroll. A page may deliberately handle wheel input through JavaScript, another element may be the intended scroll target, or the page may have CSS or application-level scrolling behavior that does not produce the expected event.

### Keyboard shortcut

Press:

```text
Ctrl+Shift+S
```

to toggle the diagnostic panel.

The script continues collecting diagnostic information while the panel is hidden.

## What to look for

### Wheel events are present and scrolling occurs

Example:

```text
WHEEL-IN  div.content dy=135 ...
SCROLL    div.scroller top=135 ...
```

This indicates that the page is receiving wheel input and that scrolling is occurring.

### Wheel events are present but no scroll occurs

Example:

```text
WHEEL-IN  div.viewer dy=135 ...
```

with no corresponding scroll event.

This is evidence that the problem occurs after wheel delivery to the page, but it does not identify the cause by itself.

Possible causes include:

* site JavaScript;
* custom scrolling implementations;
* incorrect scroll target selection;
* CSS overflow configuration;
* nested scrolling;
* scroll chaining;
* scroll snapping; or
* browser-side input/scroll-targeting behavior.

### Wheel events are not observed

If physical wheel input produces no diagnostic `WHEEL-IN` event on a page where scrolling is expected, the problem may be further down the browser input pipeline.

This is the more interesting result when investigating browser/platform-level problems.

## Diagnostic philosophy

This script is intentionally observational.

It does **not**:

* synthesize wheel events;
* modify wheel deltas;
* call `preventDefault()`;
* change scrolling preferences;
* modify page CSS;
* replace browser APIs;
* monkey-patch `addEventListener()`;
* monkey-patch `preventDefault()`; or
* attempt to repair scrolling.

The goal is to minimize the chance that the diagnostic tool changes the behavior being investigated.

## Scope

The primary target is browser-side scrolling behavior on Linux, particularly:

* Waterfox;
* Firefox-derived browsers;
* GTK-based browser builds;
* Wayland sessions; and
* pages containing custom or nested scroll containers.

The script is not tied to Waterfox and may be useful on other browsers as well.

## Known limitations

The diagnostic output is evidence, not a complete explanation of the browser's scrolling pipeline.

In particular:

* A `wheel` event reaching JavaScript does not prove that the browser's internal APZ/input pipeline behaved correctly.
* The absence of a `scroll` event does not prove that the browser dropped the wheel event.
* Cross-origin iframes cannot be inspected from their parent document. If the userscript manager injects the script into the iframe, diagnostics may instead appear in the iframe's own document.
* Some applications implement scrolling without relying on ordinary DOM scrolling behavior.
* The diagnostic overlay itself can affect page layout or interaction if the page is particularly unusual. Avoid interacting with the overlay while reproducing a scrolling problem.
* The current version intentionally favors simple observation over invasive instrumentation.

## Development

The project currently keeps the diagnostic implementation intentionally small.

Recommended workflow:

1. Reproduce the problem on a known failing site.
2. Capture the userscript output.
3. Compare it with a known-good page.
4. Determine whether the failure is page-specific or browser/platform-wide.
5. Only then consider deeper browser instrumentation.

Browser-source changes should not be made solely from the absence of a DOM `scroll` event.

## Repository layout

```text
scroll-diagnostics-userscript/
├── README.md
├── LICENSE
└── userscript/
    └── scroll-diagnostics.user.js
```

## License

Copyright (c) 2026

This project is licensed under the BSD 2-Clause License.

See [`LICENSE`](LICENSE) for the complete license text.

