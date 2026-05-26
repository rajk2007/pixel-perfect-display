package com.streambox.app

import android.annotation.SuppressLint
import android.content.Intent
import android.net.http.SslError
import android.os.Bundle
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.SslErrorHandler
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        progressBar = findViewById(R.id.progressBar)
        webView = findViewById(R.id.webView)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            loadWithOverviewMode = true
            useWideViewPort = true
            userAgentString = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36"
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url.contains("doubleclick.net") || url.contains("googlesyndication.com")) {
                    return true
                }
                return false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = ProgressBar.GONE

                view?.evaluateJavascript("""
                    (function() {
                        if (window._streamboxBridge) return;
                        window._streamboxBridge = true;
                        
                        function findVideoLinks() {
                            var links = document.querySelectorAll('a[href*="watch"], a[href*="play"], a[href*="stream"], a[href*="embed"], a[href*="episode"]');
                            links.forEach(function(link) {
                                link.addEventListener('click', function(e) {
                                    var href = link.getAttribute('href');
                                    if (!href) return;
                                    if (href.startsWith('/') || href.startsWith('./')) {
                                        href = window.location.origin + href;
                                    }
                                    if (href.startsWith('http') && typeof Android !== 'undefined') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        Android.playVideo(href, link.textContent.trim() || document.title);
                                        return false;
                                    }
                                }, true);
                            });
                        }
                        
                        findVideoLinks();
                        
                        var observer = new MutationObserver(function() { findVideoLinks(); });
                        observer.observe(document.body, { childList: true, subtree: true });
                    })();
                """, null)
            }

            override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
                handler?.proceed()
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean = true
        }

        webView.addJavascriptInterface(WebAppBridge(), "Android")
        webView.loadUrl("https://pixel-perfect-display-1.lovable.app")
    }

    inner class WebAppBridge {
        @JavascriptInterface
        fun playVideo(url: String, title: String) {
            runOnUiThread {
                val intent = Intent(this@MainActivity, PlayerActivity::class.java)
                intent.putExtra("stream_url", url)
                intent.putExtra("title", title)
                startActivity(intent)
            }
        }

        @JavascriptInterface
        fun showToast(message: String) {
            runOnUiThread {
                Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }
}
