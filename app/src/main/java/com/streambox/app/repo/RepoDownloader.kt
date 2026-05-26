package com.streambox.app.repo

import com.streambox.app.network.HttpClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object RepoDownloader {
    suspend fun downloadRepoConfig(url: String): String = withContext(Dispatchers.IO) {
        HttpClient.get(url)
    }
}
