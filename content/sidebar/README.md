# Sidebar Navigation Configuration

This directory contains the **ONLY** files you need to edit to manage the navigation structure. The system is now fully content-driven - no code changes required!

## Files

- `navigation.en.json` - English navigation structure
- `navigation.zh_hk.json` - Traditional Chinese (Hong Kong) navigation structure

## How It Works

The navigation system now automatically:
- ✅ **Reads from these content files only**
- ✅ **Generates folder structure dynamically**
- ✅ **Sorts by folder names (numbered prefixes work automatically)**
- ✅ **No hardcoded arrays or mappings to maintain**
- ✅ **Changes reflect immediately**

## Structure

Each navigation file contains a JSON object with the following structure:

```json
{
  "title": "Navigation Structure",
  "description": "Description of the navigation",
  "sections": [
    {
      "id": "unique-section-id",
      "title": "Section Title",
      "href": "/section-url",
      "icon": "IconName",
      "order": 1,
      "children": [
        {
          "id": "unique-child-id",
          "title": "Child Title",
          "href": "/section/child-url",
          "order": 1
        }
      ]
    }
  ]
}
```

## Available Icons

The following icons are available for use in the `icon` field:

- `BookOpen`, `Rocket`, `Zap`, `Layers`, `Gauge`, `Settings`
- `Bot`, `Users`, `Calendar`, `BarChart3`, `Clipboard`, `Brain`
- `Target`, `Repeat`, `FileText`, `MessageSquare`, `CheckSquare`
- `LayoutTemplate`, `Lightbulb`, `AlertTriangle`, `BookMarked`
- `CaseSensitive`, `Wrench`, `Eye`, `Globe`, `Gift`

## Adding New Sections

1. **Create the folder** with numbered prefix (e.g., `06-new-section`)
2. **Add section to navigation file**:
   ```json
   {
     "id": "new-section",
     "title": "6. New Section",
     "href": "/06-new-section",
     "icon": "Settings",
     "order": 6,
     "children": []
   }
   ```
3. **That's it!** No code changes needed.

## Adding New Subsections

1. **Create the subfolder** with numbered prefix (e.g., `01-new-subsection`)
2. **Add subsection to parent's children array**:
   ```json
   {
     "id": "new-subsection",
     "title": "6.1 New Subsection",
     "href": "/06-new-section/01-new-subsection",
     "order": 1
   }
   ```
3. **That's it!** No code changes needed.

## Important Notes

- ✅ **Only edit these JSON files** - no other files need changes
- ✅ **Folder names with numbers sort automatically** (01, 02, 03, etc.)
- ✅ **The `href` must match the actual folder structure**
- ✅ **Changes are immediate** - no server restart needed
- ✅ **System falls back to English** if locale-specific file doesn't exist
- ✅ **No hardcoded arrays to maintain** - everything is dynamic

## Example: Complete New Section

1. **Create folder**: `content/06-advanced-topics/`
2. **Create subfolder**: `content/06-advanced-topics/01-advanced-prompting/`
3. **Update navigation.en.json**:
   ```json
   {
     "id": "advanced-topics",
     "title": "6. Advanced Topics",
     "href": "/06-advanced-topics",
     "icon": "Settings",
     "order": 6,
     "children": [
       {
         "id": "advanced-prompting",
         "title": "6.1 Advanced Prompting",
         "href": "/06-advanced-topics/01-advanced-prompting",
         "order": 1
       }
     ]
   }
   ```
4. **Update navigation.zh_hk.json** with Chinese translations
5. **Done!** The navigation will automatically appear.
