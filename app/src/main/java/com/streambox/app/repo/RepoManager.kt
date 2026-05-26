package com.streambox.app.repo

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.streambox.app.App
import com.streambox.app.network.HttpClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.Request

object RepoManager {

    private val gson = Gson()

    suspend fun downloadAndSaveRepos(context: Context) {
        val defaultReposJson = withContext(Dispatchers.IO) {
            context.assets.open("default_repos.json").bufferedReader().use { it.readText() }
        }
        val defaultRepos: List<RepoConfig> = gson.fromJson(defaultReposJson, object : TypeToken<List<RepoConfig>>() {}.type)

        App.repoDatabase.repoDao().insertAll(defaultRepos)

        // In a real app, you'd download from a remote URL, e.g.:
        // val remoteReposJson = HttpClient.get("https://example.com/repos.json")
        // val remoteRepos: List<RepoConfig> = gson.fromJson(remoteReposJson, object : TypeToken<List<RepoConfig>>() {}.type)
        // App.repoDatabase.repoDao().insertAll(remoteRepos)
    }

    suspend fun testAndFilterRepos() {
        val allRepos = App.repoDatabase.repoDao().getAllRepos()
        val workingRepos = mutableListOf<RepoConfig>()

        for (repo in allRepos) {
            if (testRepo(repo)) {
                workingRepos.add(repo)
            }
        }
        App.repoDatabase.repoDao().updateAll(workingRepos) // Only keep working repos
    }

    private suspend fun testRepo(repo: RepoConfig): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder().head().url(repo.baseUrl).build()
                val response = HttpClient.client.newCall(request).execute()
                response.isSuccessful
            } catch (e: Exception) {
                false
            }
        }
    }

    fun getEnabledRepos(): List<RepoConfig> {
        return App.repoDatabase.repoDao().getEnabledReposSynchronous() // Assuming you add a synchronous version to your DAO
    }
}
