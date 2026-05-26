package com.streambox.app.scraper

import com.streambox.app.model.ContentItem
import org.jsoup.nodes.Document

object ContentParser {
    fun parseContentItem(doc: Document, baseUrl: String): ContentItem {
        // Placeholder for parsing logic
        val title = doc.select("h1").first()?.text() ?: "Unknown Title"
        val thumbnail = doc.select("meta[property=og:image]").first()?.attr("content") ?: ""
        val description = doc.select(".description").first()?.text() ?: "No description available."
        return ContentItem(title, thumbnail, baseUrl, "unknown", description = description)
    }
}
