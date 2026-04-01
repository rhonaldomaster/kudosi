# Kudos Image Bank

## Overview

The Image Bank is a curated collection of images that users can choose from when sending kudos. Instead of searching for GIFs or pasting a custom URL, users can select a pre-loaded image from the bank directly in the kudos modal.

Images are hosted on Imgur and their URLs are stored in the database.

## How It Works

### User Flow

1. User types `/kudos` and the modal opens
2. In the image section, a new **"Image Bank"** option appears
3. User browses available images and selects one
4. The selected image is attached to the kudos message
5. Image priority on submission: **GIF search > Image Bank > Custom URL**

### Admin Flow

To add or manage images, insert/update rows directly in the `image_bank` database table:

```sql
-- Add a new image
INSERT INTO image_bank (title, url, category)
VALUES ('Celebration', 'https://i.imgur.com/example1.png', 'celebration');

-- Deactivate an image (soft delete)
UPDATE image_bank SET active = false WHERE id = 1;

-- List all active images
SELECT * FROM image_bank WHERE active = true ORDER BY category, title;
```

## Database Schema

### Table: `image_bank`

| Column     | Type                     | Description                                 |
| ---------- | ------------------------ | ------------------------------------------- |
| id         | SERIAL PRIMARY KEY       | Auto-increment ID                           |
| title      | VARCHAR(100) NOT NULL    | Display name shown in the modal             |
| url        | VARCHAR(500) NOT NULL    | Full Imgur URL (e.g. https://i.imgur.com/x.png) |
| category   | VARCHAR(50)              | Optional grouping (e.g. "celebration", "thanks", "teamwork") |
| active     | BOOLEAN DEFAULT true     | Soft delete flag                            |
| created_at | TIMESTAMP DEFAULT NOW()  | When the image was added                    |

### Migration

A new migration file will be added at `src/db/migrations/002_image_bank.sql`.

## Hosting Images on Imgur

### Why Imgur?

- Free image hosting
- Stable, direct-link URLs
- No authentication needed to serve images
- Slack can render Imgur URLs natively in messages

### Uploading Images

1. Go to https://imgur.com and sign in (or upload anonymously)
2. Upload the image
3. Right-click the image and copy the **direct image link** (must end in `.png`, `.jpg`, or `.gif`)
   - Correct: `https://i.imgur.com/abc123.png`
   - Wrong: `https://imgur.com/abc123` (this is the gallery page, not the image)
4. Use the direct link as the `url` value in the database

### Image Recommendations

- **Format**: PNG or JPG (PNG preferred for graphics with text)
- **Size**: Keep under 1MB for fast loading in Slack
- **Dimensions**: Recommended 400-800px wide
- **Content**: Professional, positive, on-brand for employee recognition

## Suggested Image Categories

| Category      | Description                          | Example Use          |
| ------------- | ------------------------------------ | -------------------- |
| celebration   | Party, confetti, success moments     | Big wins, milestones |
| thanks        | Thank you, gratitude themed          | General appreciation |
| teamwork      | Collaboration, team spirit           | Team efforts         |
| innovation    | Lightbulb, creative, ideas          | Creative solutions   |
| leadership    | Star, trophy, guidance              | Leadership moments   |
| extra-mile    | Rocket, superhero, going beyond     | Above and beyond     |

These categories align with the existing kudos categories but are optional - images can be used with any kudos category.

## Modal Integration

The Image Bank appears in the kudos modal as a static select dropdown. When selected, a preview of the image is shown below the dropdown (similar to how GIF search results display).

```
+------------------------------------------+
|  Image Bank (optional)                   |
|  [Select an image...          v]         |
|                                          |
|  [Preview of selected image]             |
+------------------------------------------+
```

## Implementation Checklist

- [ ] Create migration `002_image_bank.sql` with table + seed data
- [ ] Add `getActiveImages()` query to `src/db/queries.js`
- [ ] Update `src/views/kudosModal.js` to include Image Bank selector
- [ ] Update `src/actions/submitKudos.js` to handle Image Bank selection
- [ ] Upload initial set of images to Imgur
- [ ] Insert image URLs into database
- [ ] Update `HOW_IT_WORKS.md` to document Image Bank feature
