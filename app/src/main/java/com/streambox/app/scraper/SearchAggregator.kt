package com.streambox.app.scraper

import com.streambox.app.model.ContentItem
import com.streambox.app.repo.RepoConfig
import com.streambox.app.network.HttpClient
import org.jsoup.Jsoup
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object SearchAggregator {

    suspend fun performSearch(query: String, repo: RepoConfig): List<ContentItem> = withContext(Dispatchers.IO) {
        val results = mutableListOf<ContentItem>()
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
        results
    }
}
