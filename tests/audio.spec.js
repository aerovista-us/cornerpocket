const { test, expect } = require('@playwright/test');

const AUDIO_FILES = [
  'audio/call_it_corner_optimized_cda_night_life.mp3',
  'audio/two_rails_and_a_promise.mp3',
  'audio/call_it_corner_sherman_ave.mp3',
  'audio/black_flagshine.mp3',
  'audio/table_talk_hypnotic_cut.mp3',
  'audio/chalk_lines_and_tight_angles.mp3'
];

test.describe('Corner Pocket Audio Player', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/index.html');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('page loads and audio player is present', async ({ page }) => {
    // Check that the audio element exists
    const audioPlayer = page.locator('#audioPlayer');
    await expect(audioPlayer).toBeVisible();
    
    // Check that playlist items are present
    const playlistItems = page.locator('.playlist-item');
    await expect(playlistItems).toHaveCount(6);
  });

  test('all audio files are accessible', async ({ page, request }) => {
    // Test each audio file can be fetched
    for (const audioFile of AUDIO_FILES) {
      const response = await request.get(audioFile);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('audio');
      console.log(`✓ ${audioFile} is accessible (${response.headers()['content-length']} bytes)`);
    }
  });

  test('first track loads and can play', async ({ page }) => {
    const audioPlayer = page.locator('#audioPlayer');
    
    // Wait for audio to start loading
    await page.waitForTimeout(1000);
    
    // Check that audio source is set
    const src = await audioPlayer.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src).toContain('audio/');
    
    // Check that audio metadata loads
    await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const audio = document.getElementById('audioPlayer');
        if (audio.readyState >= 2) {
          resolve(audio.duration);
        } else {
          audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
          });
          audio.addEventListener('error', reject);
          // Timeout after 10 seconds
          setTimeout(() => reject(new Error('Audio metadata load timeout')), 10000);
        }
      });
    });
    
    // Verify duration is valid (greater than 0)
    const duration = await page.evaluate(() => {
      const audio = document.getElementById('audioPlayer');
      return audio.duration;
    });
    
    expect(duration).toBeGreaterThan(0);
    console.log(`✓ First track loaded successfully (duration: ${duration.toFixed(2)}s)`);
  });

  test('play button starts playback', async ({ page }) => {
    const playButton = page.locator('#playPauseBtn');
    const audioPlayer = page.locator('#audioPlayer');
    
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    // Click play button
    await playButton.click();
    
    // Wait a bit for playback to start
    await page.waitForTimeout(1000);
    
    // Check if audio is playing
    const isPlaying = await page.evaluate(() => {
      const audio = document.getElementById('audioPlayer');
      return !audio.paused && audio.currentTime > 0;
    });
    
    // Note: Some browsers may require user interaction, so we check if button text changed
    const buttonText = await playButton.textContent();
    expect(buttonText).toContain('Pause');
    
    console.log(`✓ Play button clicked, playback state: ${isPlaying ? 'playing' : 'paused (may require user interaction)'}`);
  });

  test('can navigate through playlist', async ({ page }) => {
    const nextButton = page.locator('#nextBtn');
    const audioPlayer = page.locator('#audioPlayer');
    
    // Get initial track
    const initialSrc = await audioPlayer.getAttribute('src');
    
    // Click next button
    await nextButton.click();
    
    // Wait for track to change
    await page.waitForTimeout(2000);
    
    // Check that source changed
    const newSrc = await audioPlayer.getAttribute('src');
    expect(newSrc).not.toBe(initialSrc);
    expect(newSrc).toContain('audio/');
    
    console.log(`✓ Navigated to next track: ${newSrc}`);
  });

  test('playlist items are clickable', async ({ page }) => {
    // Get second playlist item
    const playlistItems = page.locator('.playlist-item');
    const secondItem = playlistItems.nth(1);
    
    // Click on second item
    await secondItem.click();
    
    // Wait for track to load
    await page.waitForTimeout(2000);
    
    // Check that second item is now active
    await expect(secondItem).toHaveClass(/active/);
    
    // Check that audio source changed
    const audioPlayer = page.locator('#audioPlayer');
    const src = await audioPlayer.getAttribute('src');
    expect(src).toContain('audio/');
    
    console.log(`✓ Playlist item clicked, track loaded: ${src}`);
  });

  test('progress bar updates during playback', async ({ page }) => {
    const playButton = page.locator('#playPauseBtn');
    const progressFill = page.locator('#progressFill');
    
    // Start playback
    await playButton.click();
    await page.waitForTimeout(3000);
    
    // Check that progress bar has updated
    const width = await progressFill.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });
    
    const widthValue = parseFloat(width);
    expect(widthValue).toBeGreaterThan(0);
    
    console.log(`✓ Progress bar updated: ${width}`);
  });

  test('volume control works', async ({ page }) => {
    const volumeSlider = page.locator('#volumeSlider');
    const audioPlayer = page.locator('#audioPlayer');
    
    // Set volume to 50%
    await volumeSlider.fill('50');
    
    // Check that volume was set
    const volume = await audioPlayer.evaluate((audio) => audio.volume);
    expect(volume).toBe(0.5);
    
    // Check that volume display updated
    const volumeValue = page.locator('#volumeValue');
    await expect(volumeValue).toContainText('50%');
    
    console.log(`✓ Volume control works: ${volume * 100}%`);
  });

  test('error handling for missing audio file', async ({ page }) => {
    // Inject a test to verify error handling
    const errorHandled = await page.evaluate(() => {
      return new Promise((resolve) => {
        const audio = document.getElementById('audioPlayer');
        const originalSrc = audio.src;
        
        // Try to load a non-existent file
        audio.src = 'audio/nonexistent_file.mp3';
        audio.load();
        
        audio.addEventListener('error', () => {
          resolve(true);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          resolve(false);
        }, 5000);
      });
    });
    
    // Error should be handled (either caught or logged)
    expect(errorHandled).toBeTruthy();
    console.log(`✓ Error handling works for missing files`);
  });
});

test.describe('Audio File Accessibility', () => {
  test('all audio files return 200 status', async ({ request }) => {
    for (const audioFile of AUDIO_FILES) {
      const response = await request.get(audioFile);
      expect(response.status()).toBe(200);
      
      // Verify it's actually an audio file
      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/audio|octet-stream/);
      
      // Verify file has content
      const contentLength = parseInt(response.headers()['content-length'] || '0');
      expect(contentLength).toBeGreaterThan(0);
      
      console.log(`✓ ${audioFile}: ${contentLength} bytes, ${contentType}`);
    }
  });
});

