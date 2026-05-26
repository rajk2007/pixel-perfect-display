package com.streambox.app.scraper.extractors

import com.streambox.app.model.StreamLink
import com.streambox.app.network.HttpClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

object VidCloudExtractor {
    suspend fun extract(url: String): StreamLink? = withContext(Dispatchers.IO) {
        try {
            // This is a simplified example. VidCloud extraction is usually more complex
            // involving multiple requests and JavaScript evaluation.
            val html = HttpClient.get(url)

            // Look for a script tag that contains the video data
            val scriptRegex = "var obj = JSON.parse(\\'([^\\]+)\\');".toRegex()
            scriptRegex.find(html)?.let { match ->
                val jsonString = match.groupValues[1].replace("\\\"", "\"")
                val jsonObject = JSONObject(jsonString)
                val sources = jsonObject.getJSONArray("sources")
                if (sources.length() > 0) {
                    val firstSource = sources.getJSONObject(0)
                    val fileUrl = firstSource.getString("file")
                    return@withContext StreamLink(fileUrl, "MP4", "auto")
                }
            }
            null
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
