package com.streambox.app.model

data class ContentItem(
    val title: String,
    val thumbnail: String,
    val url: String,
    val type: String,
    val description: String? = null,
    val episodes: List<Episode>? = null
)
