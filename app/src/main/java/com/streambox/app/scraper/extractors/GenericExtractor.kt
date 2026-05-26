package com.streambox.app.scraper.extractors

import com.streambox.app.model.StreamLink
import com.streambox.app.network.HttpClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jsoup.Jsoup

object GenericExtractor {
    suspend fun extract(url: String): StreamLink? = withContext(Dispatchers.IO) {
        try {
            val html = HttpClient.get(url)
            val doc = Jsoup.parse(html, url)

            // Try to find common video tags
            doc.select("video source").first()?.attr("src")?.let { videoSrc ->
                return@withContext StreamLink(videoSrc, "MP4", "auto")
            }
            doc.select("video").first()?.attr("src")?.let { videoSrc ->
                return@withContext StreamLink(videoSrc, "MP4", "auto")
            }

            // Try to find iframes that might contain video players
            doc.select("iframe").first()?.attr("src")?.let { iframeSrc ->
                // Potentially recursively call extract on the iframe source
                // For simplicity, we'll just return the iframe source as a stream link for now
                return@withContext StreamLink(iframeSrc, "IFRAME", "auto")
            }

            // Look for direct video links in the HTML
            val mp4Regex = ".*?(http[^\s]+\.mp4).*?".toRegex()
            mp4Regex.find(html)?.let { match ->
                return@withContext StreamLink(match.groupValues[1], "MP4", "auto")
            }

            null
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
