package com.streambox.app

import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.PlaybackException
import com.google.android.exoplayer2.Player
import com.google.android.exoplayer2.source.DefaultMediaSourceFactory
import com.google.android.exoplayer2.source.hls.HlsMediaSource
import com.google.android.exoplayer2.ui.PlayerView
import com.google.android.exoplayer2.upstream.DefaultHttpDataSource

class PlayerActivity : AppCompatActivity() {

    private var player: ExoPlayer? = null
    private lateinit var playerView: PlayerView
    private lateinit var titleText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY)
        }

        setContentView(R.layout.activity_player)

        playerView = findViewById(R.id.playerView)
        titleText = findViewById(R.id.titleText)

        val streamUrl = intent.getStringExtra("stream_url") ?: ""
        val title = intent.getStringExtra("title") ?: "Now Playing"
        titleText.text = title

        findViewById<ImageView>(R.id.backButton).setOnClickListener { finish() }

        if (streamUrl.isNotEmpty()) {
            initPlayer(streamUrl)
        } else {
            Toast.makeText(this, "No stream URL found", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    private fun initPlayer(url: String) {
        val dataSourceFactory = DefaultHttpDataSource.Factory()
            .setUserAgent("Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36")
            .setDefaultRequestProperties(mapOf(
                "Referer" to url,
                "Origin" to (Uri.parse(url).scheme + "://" + Uri.parse(url).host)
            ))
            .setAllowCrossProtocolRedirects(true)

        player = ExoPlayer.Builder(this)
            .setMediaSourceFactory(DefaultMediaSourceFactory(dataSourceFactory))
            .build()
            .also { exoPlayer ->
                playerView.player = exoPlayer

                val mediaItem = MediaItem.fromUri(url)

                val mediaSource = if (url.contains(".m3u8", ignoreCase = true)) {
                    HlsMediaSource.Factory(dataSourceFactory).createMediaSource(mediaItem)
                } else {
                    null
                }

                if (mediaSource != null) {
                    exoPlayer.setMediaSource(mediaSource)
                } else {
                    exoPlayer.setMediaItem(mediaItem)
                }

                exoPlayer.addListener(object : Player.Listener {
                    override fun onPlayerError(error: PlaybackException) {
                        runOnUiThread {
                            Toast.makeText(this@PlayerActivity, "Playback error: ${error.message}", Toast.LENGTH_LONG).show()
                        }
                    }
                })

                exoPlayer.prepare()
                exoPlayer.playWhenReady = true
            }
    }

    override fun onDestroy() {
        super.onDestroy()
        player?.release()
        player = null
    }
}
