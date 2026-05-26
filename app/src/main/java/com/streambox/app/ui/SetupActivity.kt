package com.streambox.app.ui

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.streambox.app.MainActivity
import com.streambox.app.R
import com.streambox.app.repo.RepoManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SetupActivity : AppCompatActivity() {

    private lateinit var statusTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_setup)

        statusTextView = findViewById(R.id.statusTextView)

        val prefs = getSharedPreferences("streambox", MODE_PRIVATE)
        val isFirstLaunch = prefs.getBoolean("is_first_launch", true)

        if (isFirstLaunch) {
            lifecycleScope.launch(Dispatchers.IO) {
                try {
                    withContext(Dispatchers.Main) { statusTextView.text = getString(R.string.setup_installing) }
                    RepoManager.downloadAndSaveRepos(this@SetupActivity)

                    withContext(Dispatchers.Main) { statusTextView.text = getString(R.string.setup_testing) }
                    RepoManager.testAndFilterRepos()

                    withContext(Dispatchers.Main) { statusTextView.text = getString(R.string.setup_ready) }
                    prefs.edit().putBoolean("is_first_launch", false).apply()
                    startMainActivity()
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) { statusTextView.text = getString(R.string.setup_error) }
                    // Optionally, add a retry button or more detailed error handling
                }
            }
        } else {
            startMainActivity()
        }
    }

    private fun startMainActivity() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
        finish()
    }
}
