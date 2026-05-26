package com.streambox.app.scraper.extractors

import com.streambox.app.model.StreamLink
import com.streambox.app.network.HttpClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object M3U8Extractor {
    suspend fun extract(url: String): StreamLink? = withContext(Dispatchers.IO) {
        try {
            val html = HttpClient.get(url)
            val m3u8Regex = ".*?(http[^\s]+\.m3u8).*?".toRegex()
            m3u8Regex.find(html)?.let { match ->
                return@withContext StreamLink(match.groupValues[1], "HLS", "auto")
            }
            null
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
