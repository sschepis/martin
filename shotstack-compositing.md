# **SHOTSTACK COMPOSITING KNOWLEDGE**

---

## **1. THE TIMELINE**
Shotstack uses a JSON-based timeline to compose videos. The timeline contains an array of `tracks`.
* **Tracks**: Layers of media. Track 1 is the bottom layer (background), Track 2 is above it, etc. Audio tracks are typically placed on separate tracks from video tracks.
* **Clips**: Each track contains an array of clips. Clips define the media asset, start time, length, and any effects/transitions.

## **2. ASSETS**
Clips reference assets. Common asset types:
* **video**: `{ "type": "video", "src": "url_to_mp4" }`
* **audio**: `{ "type": "audio", "src": "url_to_mp3" }`
* **image**: `{ "type": "image", "src": "url_to_jpg" }`
* **title**: `{ "type": "title", "text": "Hello World", "style": "minimal" }`

## **3. EFFECTS**
Effects add motion to clips. You MUST use one of these exact strings:
`zoomIn`, `zoomInSlow`, `zoomInFast`, `zoomOut`, `zoomOutSlow`, `zoomOutFast`, `slideLeft`, `slideLeftSlow`, `slideLeftFast`, `slideRight`, `slideRightSlow`, `slideRightFast`, `slideUp`, `slideUpSlow`, `slideUpFast`, `slideDown`, `slideDownSlow`, `slideDownFast`

## **4. TRANSITIONS**
Transitions blend clips together or fade them in/out. The `transition` object has `in` and `out` keys. You MUST use one of these exact strings:
`fade`, `fadeSlow`, `fadeFast`, `reveal`, `revealSlow`, `revealFast`, `wipeLeft`, `wipeLeftSlow`, `wipeLeftFast`, `wipeRight`, `wipeRightSlow`, `wipeRightFast`, `slideLeft`, `slideLeftSlow`, `slideLeftFast`, `slideRight`, `slideRightSlow`, `slideRightFast`, `slideUp`, `slideUpSlow`, `slideUpFast`, `slideDown`, `slideDownSlow`, `slideDownFast`, `carouselLeft`, `carouselLeftSlow`, `carouselLeftFast`, `carouselRight`, `carouselRightSlow`, `carouselRightFast`, `carouselUp`, `carouselUpSlow`, `carouselUpFast`, `carouselDown`, `carouselDownSlow`, `carouselDownFast`, `zoom`

## **5. FILTERS**
Filters adjust the color or style of the clip. You MUST use one of these exact strings:
`blur`, `boost`, `contrast`, `darken`, `greyscale`, `lighten`, `muted`, `negative`

## **6. OUTPUT RESOLUTION**
The `output.resolution` field MUST be one of: `preview`, `mobile`, `sd`, `hd`, `1080`, `4k`

## **EXAMPLE JSON COMPOSITION**
```json
{
  "timeline": {
    "tracks": [
      {
        "clips": [
          {
            "asset": { "type": "video", "src": "video1.mp4" },
            "start": 0,
            "length": 5,
            "effect": "zoomIn",
            "transition": { "in": "fade", "out": "fade" }
          }
        ]
      }
    ]
  },
  "output": {
    "format": "mp4",
    "resolution": "hd"
  }
}
```