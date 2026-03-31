/**
 * YT Mini — Front-end miniplayer controller
 *
 * Scans the page for YouTube links with timestamps, marks them, and opens
 * clicked ones in a fixed-position, draggable miniplayer via the YT IFrame API.
 */
(function () {
	"use strict";

	/* ------------------------------------------------------------------ */
	/*  State                                                              */
	/* ------------------------------------------------------------------ */
	let player = null;
	let apiReady = false;
	let pendingPlay = null;
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };

	/* ------------------------------------------------------------------ */
	/*  URL Parsing — detect YT links with timestamps                      */
	/* ------------------------------------------------------------------ */
	function parseYTLink(href) {
		try {
			var url = new URL(href);
		} catch (_) {
			return null;
		}

		var host = url.hostname.replace(/^www\./, "");
		var videoId = null;
		var rawTime = null;

		if (host === "youtube.com" && url.pathname === "/watch") {
			videoId = url.searchParams.get("v");
			rawTime = url.searchParams.get("t");
		} else if (host === "youtu.be") {
			videoId = url.pathname.slice(1);
			rawTime = url.searchParams.get("t");
		}

		// Check hash fragment for t= (e.g. #t=60)
		if (!rawTime && url.hash) {
			var fm = url.hash.match(/(?:^#|&)t=([0-9hms]+)/);
			if (fm) rawTime = fm[1];
		}

		if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
			return null;
		}

		return { videoId: videoId, start: rawTime ? parseTime(rawTime) : 0 };
	}

	function parseTime(raw) {
		if (/^\d+$/.test(raw)) return parseInt(raw, 10);
		var s = 0;
		var h = raw.match(/(\d+)h/);
		var m = raw.match(/(\d+)m/);
		var sec = raw.match(/(\d+)s/);
		if (h) s += parseInt(h[1], 10) * 3600;
		if (m) s += parseInt(m[1], 10) * 60;
		if (sec) s += parseInt(sec[1], 10);
		return s;
	}

	/* ------------------------------------------------------------------ */
	/*  Scan page links on load                                            */
	/* ------------------------------------------------------------------ */
	function scanLinks() {
		var links = document.querySelectorAll("a[href]");
		links.forEach(function (link) {
			if (link.hasAttribute("data-yt-mini")) return;
			var data = parseYTLink(link.href);
			if (data) {
				link.setAttribute(
					"data-yt-mini",
					JSON.stringify(data)
				);
			}
		});
	}

	scanLinks();

	/* ------------------------------------------------------------------ */
	/*  DOM — Build the miniplayer shell                                    */
	/* ------------------------------------------------------------------ */
	var wrapper = el("div", "ytm-wrapper");
	var container = el("div", "ytm-player");

	// Read position setting from WordPress.
	var pos = (typeof ytMiniSettings !== "undefined" && ytMiniSettings.position)
		? ytMiniSettings.position : "bottom-right";
	wrapper.classList.add("ytm-pos-" + pos);

	container.innerHTML =
		'<div class="ytm-header">' +
		'<div class="ytm-header-icon">' +
		'<svg viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/></svg>' +
		"</div>" +
		'<div class="ytm-title">YT Mini</div>' +

		'<button class="ytm-btn ytm-btn-close" aria-label="Close" title="Close">' +
		'<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
		"</button>" +
		"</div>" +
		'<div class="ytm-viewport"><div id="ytm-yt-player"></div></div>';

	wrapper.appendChild(container);
	document.body.appendChild(wrapper);

	var headerEl = container.querySelector(".ytm-header");
	var titleEl = container.querySelector(".ytm-title");
	var btnClose = container.querySelector(".ytm-btn-close");

	/* ------------------------------------------------------------------ */
	/*  YouTube IFrame API                                                 */
	/* ------------------------------------------------------------------ */
	function loadYTAPI() {
		if (document.getElementById("ytm-yt-api")) return;
		var tag = document.createElement("script");
		tag.id = "ytm-yt-api";
		tag.src = "https://www.youtube.com/iframe_api";
		document.head.appendChild(tag);
	}

	window.onYouTubeIframeAPIReady = function () {
		apiReady = true;
		if (pendingPlay) {
			openVideo(pendingPlay.videoId, pendingPlay.start);
			pendingPlay = null;
		}
	};

	/* ------------------------------------------------------------------ */
	/*  Core — Open / swap / close                                         */
	/* ------------------------------------------------------------------ */
	function openVideo(videoId, start) {
		if (!apiReady) {
			pendingPlay = { videoId: videoId, start: start };
			loadYTAPI();
			return;
		}

		show();

		if (!player) {
			player = new YT.Player("ytm-yt-player", {
				width: "100%",
				height: "100%",
				videoId: videoId,
				host: "https://www.youtube-nocookie.com",
				playerVars: {
					autoplay: 1,
					start: start,
					modestbranding: 1,
					rel: 0,
					playsinline: 1,
				},
				events: {
					onReady: function (e) {
						updateTitle(e.target);
					},
					onStateChange: function (e) {
						if (e.data === YT.PlayerState.PLAYING) {
							updateTitle(e.target);
						}
					},
				},
			});
		} else {
			player.loadVideoById({ videoId: videoId, startSeconds: start });
		}
	}

	function updateTitle(ytPlayer) {
		try {
			var data = ytPlayer.getVideoData();
			if (data && data.title) {
				titleEl.innerHTML =
					escapeHTML(data.title) + " <span>— YT Mini</span>";
			}
		} catch (_) { }
	}

	function show() {
		container.classList.add("ytm-open");
	}

	function close() {
		container.classList.remove("ytm-open");
		if (player) {
			try {
				player.stopVideo();
			} catch (_) { }
		}
		// Clear drag position so CSS class takes over.
		wrapper.style.top = "";
		wrapper.style.left = "";
		wrapper.style.bottom = "";
		wrapper.style.right = "";
	}



	/* ------------------------------------------------------------------ */
	/*  Dragging                                                           */
	/* ------------------------------------------------------------------ */
	headerEl.addEventListener("pointerdown", function (e) {
		if (e.target.closest(".ytm-btn")) return;
		isDragging = true;
		container.classList.add("ytm-dragging");
		var rect = wrapper.getBoundingClientRect();
		dragOffset.x = e.clientX - rect.left;
		dragOffset.y = e.clientY - rect.top;
		headerEl.setPointerCapture(e.pointerId);
		e.preventDefault();
	});

	headerEl.addEventListener("pointermove", function (e) {
		if (!isDragging) return;
		wrapper.style.left = e.clientX - dragOffset.x + "px";
		wrapper.style.top = e.clientY - dragOffset.y + "px";
		wrapper.style.right = "auto";
		wrapper.style.bottom = "auto";
	});

	headerEl.addEventListener("pointerup", function () {
		isDragging = false;
		container.classList.remove("ytm-dragging");
	});

	/* ------------------------------------------------------------------ */
	/*  Button handlers                                                    */
	/* ------------------------------------------------------------------ */
	btnClose.addEventListener("click", close);

	/* ------------------------------------------------------------------ */
	/*  Intercept link clicks                                              */
	/* ------------------------------------------------------------------ */
	document.addEventListener("click", function (e) {
		var link = e.target.closest("a[data-yt-mini]");
		if (!link) return;

		e.preventDefault();
		e.stopPropagation();

		try {
			var data = JSON.parse(link.getAttribute("data-yt-mini"));
			openVideo(data.videoId, data.start);
		} catch (err) {
			console.error("[YT Mini] Could not parse link data:", err);
		}
	});

	/* ------------------------------------------------------------------ */
	/*  Helpers                                                            */
	/* ------------------------------------------------------------------ */
	function el(tag, cls) {
		var node = document.createElement(tag);
		if (cls) node.className = cls;
		return node;
	}

	function escapeHTML(str) {
		var d = document.createElement("div");
		d.textContent = str;
		return d.innerHTML;
	}
})();
