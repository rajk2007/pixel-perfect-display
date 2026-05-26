package com.streambox.app

import android.app.Application
import androidx.room.Room
import com.streambox.app.network.HttpClient
import com.streambox.app.repo.RepoDatabase

class App : Application() {

    companion object {
        lateinit var instance: App
            private set
        lateinit var repoDatabase: RepoDatabase
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        HttpClient.init(this)
        repoDatabase = Room.databaseBuilder(
            applicationContext,
            RepoDatabase::class.java,
            "repo-db"
        ).build()
    }
}
