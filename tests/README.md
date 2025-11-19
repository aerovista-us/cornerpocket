# Audio Player Tests

Playwright tests to verify that audio files load and play correctly in the Corner Pocket player.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in headed mode (see browser):
```bash
npm run test:headed
```

### Run tests in debug mode:
```bash
npm run test:debug
```

## Test Coverage

The tests verify:
- ✅ Page loads and audio player is present
- ✅ All audio files are accessible (HTTP 200)
- ✅ First track loads and metadata is available
- ✅ Play button starts playback
- ✅ Playlist navigation works (next/previous)
- ✅ Playlist items are clickable
- ✅ Progress bar updates during playback
- ✅ Volume control works
- ✅ Error handling for missing files

## Configuration

Tests use a local HTTP server (Python's http.server on port 8000) by default. To test against a different URL, set the `BASE_URL` environment variable:

```bash
BASE_URL=https://aerovista-us.github.io/cornerpocket npm test
```

## Notes

- Some browsers may require user interaction before audio can play (autoplay policies)
- Tests include timeouts to account for audio loading times
- Error handling tests verify that missing files are handled gracefully

