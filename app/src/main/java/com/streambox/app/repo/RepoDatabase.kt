package com.streambox.app.repo

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.RoomDatabase
import androidx.room.Update

@Database(entities = [RepoConfig::class], version = 1, exportSchema = false)
abstract class RepoDatabase : RoomDatabase() {
    abstract fun repoDao(): RepoDao
}

@Dao
interface RepoDao {
    @Query("SELECT * FROM repos")
    suspend fun getAllRepos(): List<RepoConfig>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(repos: List<RepoConfig>)

    @Update
    suspend fun updateAll(repos: List<RepoConfig>)

    @Query("SELECT * FROM repos")
    fun getEnabledReposSynchronous(): List<RepoConfig>
}
