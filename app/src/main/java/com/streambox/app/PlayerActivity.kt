package com.streambox.app

import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.ImageButton
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.source.DefaultMediaSourceFactory
import com.google.android.exoplayer2.ui.PlayerView
import com.google.android.exoplayer2.upstream.DefaultHttpDataSource
import com.google.android.exoplayer2.util.Log

class PlayerActivity : AppCompatActivity() {

    private var player: ExoPlayer? = null
    private lateinit var playerView: PlayerView
    private lateinit var titleTextView: TextView
    private lateinit var backButton: ImageButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_player)

        playerView = findViewById(R.id.player_view)
        titleTextView = findViewById(R.id.player_title)
        backButton = findViewById(R.id.player_back_button)

        val streamUrl = intent.getStringExtra("stream_url")
        val contentTitle = intent.getStringExtra("content_title") ?: "StreamBox Player"

        titleTextView.text = contentTitle

        backButton.setOnClickListener { onBackPressed() }

        if (streamUrl != null) {
            initializePlayer(streamUrl)
        } else {
            Log.e("PlayerActivity", "Stream URL is null")
            // Handle error, maybe show a toast
        }
    }

    private fun initializePlayer(streamUrl: String) {
        val httpDataSourceFactory = DefaultHttpDataSource.Factory()
            .setUserAgent("Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36")
            .setDefaultRequestProperties(mapOf("Referer" to streamUrl)) // Set referer to the stream URL itself or a known referrer

        val mediaSourceFactory = DefaultMediaSourceFactory(this).setDataSourceFactory(httpDataSourceFactory)

        player = ExoPlayer.Builder(this)
            .setMediaSourceFactory(mediaSourceFactory)
            .build()

        playerView.player = player

        val mediaItem = MediaItem.fromUri(Uri.parse(streamUrl))
        player?.setMediaItem(mediaItem)
        player?.prepare()
        player?.playWhenReady = true
    }

    override fun onPause() {
        super.onPause()
        player?.pause()
    }

    override fun onStop() {
        super.onStop()
        player?.release()
        player = null
    }

    override fun onDestroy() {
        super.onDestroy()
        player?.release()
        player = null
    }
}
