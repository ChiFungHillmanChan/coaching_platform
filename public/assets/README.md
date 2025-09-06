# Assets Folder Structure

This folder contains all static assets for the AI Coaching Platform documentation.

## 📁 Folder Structure

```
public/assets/
├── images/
│   ├── ui/                 # UI screenshots and interface images
│   ├── diagrams/           # Flowcharts, architecture diagrams
│   └── [other images]      # General images
├── videos/
│   ├── demos/              # Product demonstration videos
│   ├── tutorials/          # Tutorial and how-to videos
│   └── [other videos]      # General videos
└── downloads/              # Downloadable files (PDFs, templates, etc.)
```

## 🖼️ Image Guidelines

### Supported Formats
- **PNG** - Best for screenshots, UI elements, diagrams
- **JPG/JPEG** - Best for photos, complex images
- **SVG** - Best for logos, simple icons, scalable graphics
- **WebP** - Modern format for optimized web delivery

### Naming Convention
- Use descriptive, lowercase names with hyphens
- Include context in filename
- Examples:
  - `ai-coach-dashboard-overview.png`
  - `goal-setting-workflow-diagram.svg`
  - `mobile-navigation-screenshot.jpg`

### Recommended Sizes
- **Screenshots**: 1200px wide max
- **Thumbnails**: 400px wide
- **Hero images**: 1920px wide max
- **Diagrams**: Vector format (SVG) preferred

## 🎥 Video Guidelines

### Supported Formats
- **MP4** - Primary format, best compatibility
- **WebM** - Alternative for smaller file sizes
- **MOV** - Acceptable but convert to MP4 when possible

### Naming Convention
- Use descriptive names with context
- Examples:
  - `onboarding-flow-demo.mp4`
  - `habit-tracker-tutorial.mp4`
  - `api-integration-guide.webm`

### Recommended Specifications
- **Resolution**: 1080p (1920x1080) or 720p (1280x720)
- **Frame Rate**: 30fps or 60fps
- **Bitrate**: 2-5 Mbps for 1080p
- **Duration**: Keep under 5 minutes for tutorials

## 📄 Download Files

### Supported Formats
- **PDF** - Documents, guides, cheat sheets
- **XLSX/CSV** - Templates, data files
- **ZIP** - Packaged resources

### Naming Convention
- Include language code for localized files
- Examples:
  - `ai-coach-quickstart-guide-en.pdf`
  - `markdown-cheat-sheet-zh-hk.pdf`
  - `goal-planner-template.xlsx`

## 🔗 Usage in Content

### Images
```json
{
  "type": "image",
  "src": "/assets/images/ui/ai-coach-dashboard.png",
  "alt": "AI Coach Dashboard Interface",
  "caption": "The main dashboard showing progress tracking and recommendations"
}
```

### Videos
```json
{
  "type": "video",
  "src": "/assets/videos/demos/onboarding-flow.mp4",
  "alt": "Complete onboarding flow demonstration"
}
```

### Download Links
```json
{
  "type": "download-link",
  "title": "Quick Start Guide",
  "content": "Complete PDF guide for getting started",
  "href": "/assets/downloads/quickstart-guide-en.pdf",
  "fileType": "PDF",
  "fileSize": "2.3 MB"
}
```

## 📝 Notes

- All assets are served from `/assets/` URL path
- Use relative paths starting with `/assets/`
- Optimize images for web (compress without losing quality)
- Consider providing multiple formats for better browser support
- Keep file sizes reasonable for good loading performance