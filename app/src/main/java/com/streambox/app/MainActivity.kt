package com.streambox.app

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.webkit.*
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.streambox.app.player.StreamPlayer
import com.streambox.app.scraper.ScraperEngine
import com.streambox.app.repo.RepoManager
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private val gson = Gson()

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.mainWebView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.mediaPlaybackRequiresUserGesture = false

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                swipeRefreshLayout.isRefreshing = false
                injectJavaScriptInterfaces()
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
                // Handle error, maybe show a local error page
            }
        }

        webView.webChromeClient = WebChromeClient()

        webView.addJavascriptInterface(AndroidBridge(), "Android")

        swipeRefreshLayout.setOnRefreshListener { webView.reload() }

        // Load the Lovable web UI or local asset
        webView.loadUrl("https://pixel-perfect-display-1.lovable.app") // Or "file:///android_asset/index.html"
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    private fun injectJavaScriptInterfaces() {
        val script = """
            window.Android.playVideo = function(url) {
                Android.playVideo(url);
            };
            window.Android.searchContent = function(query) {
                Android.searchContent(query);
            };
            window.Android.getContentDetail = function(url) {
                Android.getContentDetail(url);
            };
            window.Android.getInstalledRepos = function() {
                return Android.getInstalledRepos();
            };
        """
        webView.evaluateJavascript(script, null)
    }

    inner class AndroidBridge {
        @JavascriptInterface
        fun playVideo(url: String) {
            val intent = Intent(this@MainActivity, PlayerActivity::class.java)
            intent.putExtra("stream_url", url)
            startActivity(intent)
        }

        @JavascriptInterface
        fun searchContent(query: String) {
            CoroutineScope(Dispatchers.IO).launch {
                val results = ScraperEngine.search(query)
                withContext(Dispatchers.Main) {
                    webView.evaluateJavascript("window.handleSearchResults(" + gson.toJson(results) + ")", null)
                }
            }
        }

        @JavascriptInterface
        fun getContentDetail(url: String) {
            CoroutineScope(Dispatchers.IO).launch {
                val detail = ScraperEngine.getContentDetail(url)
                withContext(Dispatchers.Main) {
                    webView.evaluateJavascript("window.handleContentDetail(" + gson.toJson(detail) + ")", null)
                }
            }
        }

        @JavascriptInterface
        fun getInstalledRepos(): String {
            return gson.toJson(RepoManager.getEnabledRepos())
        }
    }
}
