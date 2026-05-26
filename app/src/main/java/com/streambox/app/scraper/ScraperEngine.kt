package com.streambox.app.scraper

import com.streambox.app.model.ContentItem
import com.streambox.app.model.StreamLink
import com.streambox.app.network.HttpClient
import com.streambox.app.repo.RepoManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jsoup.Jsoup

object ScraperEngine {

    suspend fun search(query: String): List<ContentItem> = withContext(Dispatchers.IO) {
        val results = mutableListOf<ContentItem>()
        val repos = RepoManager.getEnabledRepos()

        for (repo in repos) {
            try {
                val searchUrl = repo.baseUrl + repo.searchPath.replace("{query}", query)
                val html = HttpClient.get(searchUrl)
                val doc = Jsoup.parse(html, repo.baseUrl)

                doc.select(repo.parsers.listItem).forEach { element ->
                    val title = element.select(repo.parsers.title).first()?.text() ?: ""
                    val thumbnail = element.select(repo.parsers.thumbnail).first()?.attr("data-src") ?: element.select(repo.parsers.thumbnail).first()?.attr("src") ?: ""
                    val url = element.select(repo.parsers.url).first()?.attr("href") ?: ""

                    if (title.isNotEmpty() && url.isNotEmpty()) {
                        results.add(ContentItem(title, thumbnail, url, repo.type))
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        results
    }

    suspend fun getContentDetail(contentUrl: String): ContentItem = withContext(Dispatchers.IO) {
        // This is a simplified example. A real implementation would parse the content page
        // to extract description, episodes, stream links, etc.
        val html = HttpClient.get(contentUrl)
        val doc = Jsoup.parse(html, contentUrl)

        val title = doc.select("h1").first()?.text() ?: "Unknown Title"
        val description = doc.select(".description").first()?.text() ?: "No description available."
        val thumbnail = doc.select("meta[property=og:image]").first()?.attr("content") ?: ""

        ContentItem(title, thumbnail, contentUrl, "unknown", description = description)
    }

    suspend fun extractStreamUrl(contentUrl: String): StreamLink? = withContext(Dispatchers.IO) {
        // This is the core logic for extracting stream URLs.
        // It would involve multiple strategies as described in the prompt.
        // For now, a placeholder that tries to find a direct video source or iframe.
        try {
            val html = HttpClient.get(contentUrl)
            val doc = Jsoup.parse(html, contentUrl)

            // Strategy 1: Direct regex for m3u8/mp4
            val m3u8Regex = ".*?(http[^\s]+\.m3u8).*?".toRegex()
            val mp4Regex = ".*?(http[^\s]+\.mp4).*?".toRegex()

            m3u8Regex.find(html)?.let { match ->
                return@withContext StreamLink(match.groupValues[1], "HLS", "auto")
            }
            mp4Regex.find(html)?.let { match ->
                return@withContext StreamLink(match.groupValues[1], "MP4", "auto")
            }

            // Strategy 2: Iframe detection and recursive extraction
            val iframeSrc = doc.select("iframe").first()?.attr("src")
            if (!iframeSrc.isNullOrEmpty()) {
                // Recursive call for iframe content
                return@withContext extractStreamUrl(iframeSrc)
            }

            // Placeholder for other strategies (JS decoding, WebView-based)
            // These would be much more complex to implement here directly.

            null
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
