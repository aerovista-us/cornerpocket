# Recycling Folder

This folder is used to store files that are no longer needed, instead of deleting them permanently.

## Structure

- `recycling/audio/` - Audio files that have been removed from the playlist
- `recycling/images/` - Image files that are no longer in use
- `recycling/docs/` - Document files that have been replaced

## Usage

When removing files from the project:

1. **DO NOT DELETE** - Always move files to the appropriate recycling subfolder
2. **Keep for reference** - Files here are kept for historical reference and can be restored if needed
3. **Git tracking** - Files in recycling are tracked by git, so they're preserved in history

## Example

Instead of:
```bash
git rm audio/old_song.mp3
```

Do this:
```bash
git mv audio/old_song.mp3 recycling/audio/old_song.mp3
git commit -m "Move old_song.mp3 to recycling"
```

This preserves the file in git history and allows easy restoration if needed.

