package com.streambox.app

import android.annotation.SuppressLint
import android.content.Intent
import android.net.http.SslError
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.SslErrorHandler
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var rootView: FrameLayout
    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null
    private var interceptedStreamUrl: String? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        rootView = findViewById(R.id.rootView)
        progressBar = findViewById(R.id.progressBar)
        webView = findViewById(R.id.webView)

        // CRITICAL: Keep WebView alive when app goes to background
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            mediaPlaybackRequiresUserGesture = false

            // CRITICAL for video playback
            @Suppress("DEPRECATION")
            pluginState = WebSettings.PluginState.ON
            loadsImagesAutomatically = true
            blockNetworkImage = false
            blockNetworkLoads = false

            // Better user agent — pretend to be Chrome browser
            userAgentString = "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36"

            // Viewport settings
            useWideViewPort = true
            loadWithOverviewMode = true

            // Cache settings
            cacheMode = WebSettings.LOAD_DEFAULT

        }

        // Allow WebView to handle cookies (some video hosts need sessions)
        val cookieManager = android.webkit.CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        webView.webViewClient = StreamWebViewClient()
        webView.webChromeClient = StreamWebChromeClient()
        webView.addJavascriptInterface(StreamBridge(), "StreamBox")

        webView.loadUrl("https://pixel-perfect-display-1.lovable.app")
    }

    // ==================== WebView Client ====================
    inner class StreamWebViewClient : WebViewClient() {

        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
            val url = request?.url?.toString() ?: return false

            // Block ads
            val blocked = listOf("doubleclick.net", "googlesyndication.com", "googleadservices.com", "adnxs.com", "adsrvr.org", "popads", "popunder", "pushnotifications")
            if (blocked.any { url.contains(it, ignoreCase = true) }) {
                return true
            }

            // If this is a stream URL, offer to play in native ExoPlayer
            if (url.contains(".m3u8", ignoreCase = true) || 
                (url.contains(".mp4", ignoreCase = true) && !url.contains(".mp4.js"))) {
                interceptedStreamUrl = url
                // Optionally launch native player
                openInNativePlayer(url, "Stream")
                return true
            }

            return false
        }

        override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
            val url = request?.url?.toString() ?: return super.shouldInterceptRequest(view, request)

            // Intercept and log video stream URLs
            if (url.contains(".m3u8", ignoreCase = true) || 
                (url.contains(".mp4", ignoreCase = true) && !url.contains(".js") && !url.contains(".css"))) {
                interceptedStreamUrl = url
            }

            // Block ad requests at network level
            val adPatterns = listOf("doubleclick", "googlesyndication", "googleadservices", "adnxs", "adsrvr", "popads", "analytics", "tracking", "pixel?", "banner", "prebid", "rubicon", "amazon-adsystem", "ads.")
            if (adPatterns.any { url.contains(it, ignoreCase = true) }) {
                return WebResourceResponse("text/plain", "UTF-8", "".byteInputStream())
            }

            return super.shouldInterceptRequest(view, request)
        }

        override fun onPageFinished(view: WebView?, url: String?) {
            super.onPageFinished(view, url)
            progressBar.visibility = ProgressBar.GONE

            // Inject comprehensive video handling bridge
            view?.evaluateJavascript("""
                (function() {
                    if (window._sbv4) return;
                    window._sbv4 = true;

                    // ===== FORCE VIDEOS TO PLAY =====
                    function forceVideoPlay() {
                        var videos = document.querySelectorAll('video');
                        videos.forEach(function(v) {
                            // Remove autoplay restrictions
                            v.removeAttribute('autoplay');
                            v.setAttribute('autoplay', 'true');
                            v.setAttribute('playsinline', 'true');
                            v.setAttribute('webkit-playsinline', 'true');
                            v.setAttribute('x5-video-player-type', 'h5');
                            v.setAttribute('x5-video-player-fullscreen', 'true');
                            
                            // Try to play
                            try {
                                var playPromise = v.play();
                                if (playPromise !== undefined) {
                                    playPromise.catch(function(e) {
                                        console.log('Autoplay blocked, will retry: ' + e.message);
                                        // Retry on user interaction
                                        document.addEventListener('click', function() {
                                            v.play().catch(function(){});
                                        }, { once: true });
                                    });
                                }
                            } catch(e) {}

                            // Report video source to native
                            var sources = v.querySelectorAll('source');
                            sources.forEach(function(s) {
                                var src = s.getAttribute('src');
                                if (src && typeof StreamBox !== 'undefined') {
                                    StreamBox.foundStreamUrl(src);
                                }
                            });
                            var src = v.getAttribute('src');
                            if (src && typeof StreamBox !== 'undefined') {
                                StreamBox.foundStreamUrl(src);
                            }

                            // Monitor for source changes
                            var observer = new MutationObserver(function() {
                                var newSrc = v.getAttribute('src');
                                if (newSrc && typeof StreamBox !== 'undefined') {
                                    StreamBox.foundStreamUrl(newSrc);
                                }
                            });
                            observer.observe(v, { attributes: true, attributeFilter: ['src'] });
                        });
                    }

                    // ===== INTERCEPT IFRAME VIDEO SOURCES =====
                    function interceptIframes() {
                        var iframes = document.querySelectorAll('iframe');
                        iframes.forEach(function(iframe) {
                            var src = iframe.getAttribute('src') || '';
                            if (src.includes('embed') || src.includes('player') || src.includes('video') || src.includes('stream') || src.includes('m3u8')) {
                                if (typeof StreamBox !== 'undefined') {
                                    StreamBox.foundEmbedUrl(src);
                                }
                            }
                        });
                    }

                    // ===== INTERCEPT FETCH AND XHR TO FIND STREAM URLS =====
                    var originalFetch = window.fetch;
                    window.fetch = function() {
                        var url = arguments[0] || '';
                        if (typeof url === 'string') {
                            if (url.includes('.m3u8') || url.includes('.mp4') || url.includes('playlist') || url.includes('master')) {
                                if (typeof StreamBox !== 'undefined') {
                                    StreamBox.foundStreamUrl(url);
                                }
                            }
                        } else if (url && url.url) {
                            if (url.url.includes('.m3u8') || url.url.includes('.mp4')) {
                                if (typeof StreamBox !== 'undefined') {
                                    StreamBox.foundStreamUrl(url.url);
                                }
                            }
                        }
                        return originalFetch.apply(this, arguments);
                    };

                    var originalXHROpen = XMLHttpRequest.prototype.open;
                    XMLHttpRequest.prototype.open = function(method, url) {
                        if (url && (url.includes('.m3u8') || url.includes('.mp4') || url.includes('playlist'))) {
                            if (typeof StreamBox !== 'undefined') {
                                StreamBox.foundStreamUrl(url);
                            }
                        }
                        return originalXHROpen.apply(this, arguments);
                    }

                    // ===== WATCH FOR DYNAMIC CONTENT =====
                    var contentObserver = new MutationObserver(function() {
                        forceVideoPlay();
                        interceptIframes();
                    });
                    contentObserver.observe(document.body || document.documentElement, { 
                        childList: true, 
                        subtree: true 
                    });

                    // Run immediately and periodically
                    forceVideoPlay();
                    interceptIframes();
                    setInterval(forceVideoPlay, 2000);
                    setInterval(interceptIframes, 3000);

                    console.log('StreamBox Video Bridge v4 injected');
                })();
            """, null)
        }

        override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
            handler?.proceed()
        }
    }

    // ==================== Chrome Client (handles fullscreen video) ====================
    inner class StreamWebChromeClient : WebChromeClient() {

        override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
            if (customView != null) {
                callback?.onCustomViewHidden()
                return
            }
            customView = view
            customViewCallback = callback

            webView.visibility = View.GONE
            rootView.addView(view, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ))

            // Fullscreen mode
            val decorView = window.decorView
            @Suppress("DEPRECATION")
            decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE)
        }

        override fun onHideCustomView() {
            if (customView == null) return
            rootView.removeView(customView)
            customView = null
            customViewCallback?.onCustomViewHidden()
            webView.visibility = View.VISIBLE
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
        }

        override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean = true

        // Grant all permission requests (needed for autoplay)
        override fun onPermissionRequest(request: android.webkit.PermissionRequest?) {
            request?.grant(request.resources)
        }
    }

    // ==================== JavaScript Bridge ====================
    inner class StreamBridge {

        @JavascriptInterface
        fun foundStreamUrl(url: String) {
            runOnUiThread {
                interceptedStreamUrl = url
                Toast.makeText(this@MainActivity, "Found stream: ${url.take(60)}...", Toast.LENGTH_SHORT).show()
            }
        }

        @JavascriptInterface
        fun foundEmbedUrl(url: String) {
            runOnUiThread {
                // Embed URLs are from iframes — let WebView handle them
                // But if we want native playback, store the URL
            }
        }

        @JavascriptInterface
        fun playInNativePlayer(url: String, title: String) {
            runOnUiThread {
                openInNativePlayer(url, title)
            }
        }
    }

    // ==================== Native Player Launch ====================
    private fun openInNativePlayer(url: String, title: String) {
        val intent = Intent(this, PlayerActivity::class.java)
        intent.putExtra("stream_url", url)
        intent.putExtra("title", title)
        startActivity(intent)
    }

    // ==================== Lifecycle ====================
    override fun onPause() {
        webView.onPause()
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (customView != null) {
            customViewCallback?.onCustomViewHidden()
            return
        }
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }

    override fun onKeyDown(keyCode: Int, event: android.view.KeyEvent?): Boolean {
        if (keyCode == android.view.KeyEvent.KEYCODE_BACK) {
            if (customView != null) {
                customViewCallback?.onCustomViewHidden()
                return true
            }
            if (webView.canGoBack()) {
                webView.goBack()
                return true
            }
        }
        return super.onKeyDown(keyCode, event)
    }
}
