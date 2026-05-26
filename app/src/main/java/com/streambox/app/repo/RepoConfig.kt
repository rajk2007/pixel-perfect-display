package com.streambox.app.repo

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "repos")
data class RepoConfig(
    @PrimaryKey val id: String,
    val name: String,
    val baseUrl: String,
    val type: String,
    val language: String,
    val searchPath: String,
    val parsers: Parsers
) {
    data class Parsers(
        @SerializedName("listItem") val listItem: String,
        @SerializedName("title") val title: String,
        @SerializedName("thumbnail") val thumbnail: String,
        @SerializedName("url") val url: String,
        @SerializedName("description") val description: String,
        @SerializedName("streamPage") val streamPage: String,
        @SerializedName("videoIframe") val videoIframe: String
    )
}
