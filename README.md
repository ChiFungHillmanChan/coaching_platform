# AI Coaching Documentation

A production-ready documentation site for the AI Coaching System, built with Next.js, TypeScript, and Tailwind CSS with a powerful JSON-based content management system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── docs/              # Documentation pages
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles with CSS variables
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── content-renderer.tsx # Renders JSON content blocks
│   ├── article-page.tsx  # Generic article page component
│   ├── topbar.tsx        # Top navigation bar
│   ├── sidebar-nav.tsx   # Left navigation sidebar
│   └── theme-toggle.tsx  # Dark/light mode toggle
├── content/              # JSON-based content management
│   ├── welcome/          # Welcome page content
│   ├── core/            # Core features content
│   ├── tools/           # Tools content
│   └── [category]/      # Other categories
├── lib/                  # Utility functions and configurations
│   ├── content.ts       # Content management utilities
│   ├── nav.ts           # Navigation structure definition
│   └── utils.ts         # Helper functions
├── public/              # Static assets
│   └── media/           # Images and videos for content
└── tests/               # Unit tests with Vitest
```

## 🛠 Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
npm run format:check # Check code formatting
npm run typecheck   # Run TypeScript type checking
npm run test        # Run unit tests
npm run test:watch  # Run tests in watch mode
npm run test:ui     # Run tests with UI
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Focus search input |
| `↑` / `↓` | Navigate sidebar items |
| `Home` | Jump to first sidebar item |
| `End` | Jump to last sidebar item |
| `Enter` | Activate focused link/button |
| `Space` | Toggle expandable sections |

## 📄 Content Management

Content is managed through JSON files in the `content/` directory. Each article is a JSON file with structured blocks:

```json
{
  "title": "Article Title",
  "description": "Article description",
  "slug": "article-slug",
  "category": "category-name",
  "lastModified": "2024-01-01T00:00:00.000Z",
  "blocks": [
    {
      "type": "heading",
      "level": 1,
      "content": "Main Title"
    },
    {
      "type": "text",
      "content": "Paragraph content goes here."
    },
    {
      "type": "image",
      "src": "/media/images/example.png",
      "alt": "Description of the image"
    },
    {
      "type": "video",
      "src": "/media/videos/demo.mp4",
      "alt": "Description of the video"
    }
  ]
}
```

### Supported Block Types
- `heading` - Headings (levels 1-6)
- `text` - Paragraph text
- `code` - Code blocks with syntax highlighting
- `image` - Images (PNG, JPG) with responsive sizing
- `video` - Videos (MP4) with play/pause controls
- `list` - Bulleted lists
- `card` - Card components with title and description
- `callout` - Highlighted callouts (info, warning, success, error)

### Adding New Articles
1. Create a new directory in `content/[category]/[article-name]/`
2. Add an `article.json` file with your content
3. Place any media assets in `public/media/images/` or `public/media/videos/`
4. Reference media using `/media/images/filename.png` paths

## 🎨 Theming

The project uses CSS variables for easy theme customization. Update colors in `app/globals.css`:

```css
:root {
  --primary: 222.2 47.4% 11.2%;     /* Primary brand color */
  --accent: 210 40% 96%;             /* Accent color */
  --muted: 210 40% 96%;              /* Muted backgrounds */
  --ring: 222.2 84% 4.9%;            /* Focus ring color */
}
```

### Dark Mode

Dark mode is implemented using the `class` strategy with `next-themes`. Toggle between light/dark modes using:
- The theme toggle button in the top bar
- The switch variant in settings (if implemented)

## 🧪 Testing

Unit tests are written with Vitest and React Testing Library:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test sidebar-nav.test.tsx
```

### Test Coverage

- `SidebarNav`: Navigation, keyboard accessibility, state management
- `ThemeToggle`: Theme switching, variants, accessibility

## 🏗 Architecture Decisions

### Next.js App Router
- File-based routing with layouts and groups
- Server and client components separation
- Metadata API for SEO optimization

### Component Design
- **Atomic Design**: Small, reusable components
- **shadcn/ui**: Consistent, accessible UI primitives
- **TypeScript**: Full type safety and developer experience

### Styling Strategy
- **Tailwind CSS**: Utility-first styling
- **CSS Variables**: Dynamic theming support
- **Responsive Design**: Mobile-first approach

### Animation
- **Framer Motion**: Smooth page transitions
- **CSS Transitions**: Micro-interactions
- **Reduced Motion**: Respects user preferences

## ♿ Accessibility

This project follows WCAG 2.1 AA guidelines:

- **Semantic HTML**: Proper landmark and heading structure
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: ARIA labels and descriptions
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Minimum 4.5:1 ratio

### Testing Accessibility

```bash
# Run accessibility tests (included in unit tests)
npm run test

# Manual testing checklist:
# - Tab through all interactive elements
# - Test with screen reader (VoiceOver, NVDA, JAWS)
# - Verify color contrast ratios
# - Test with reduced motion settings
```

## 🚢 Deployment

### Build Optimization

```bash
npm run build
```

The build process:
1. Type checking with TypeScript
2. Code linting with ESLint
3. Static generation for all pages
4. Asset optimization and minification

### Environment Variables

Create `.env.local` for local development:

```env
# Optional: Analytics tracking ID
NEXT_PUBLIC_GA_ID=your_ga_id
```

## 🤝 Contributing

1. **Code Style**: Follow existing patterns and run `npm run format`
2. **Testing**: Add tests for new components and features
3. **Accessibility**: Test with keyboard and screen readers
4. **Performance**: Use Lighthouse to verify performance metrics

### Adding New Documentation Pages

1. Create the page file in `app/docs/`
2. Add the route to `lib/nav.ts`
3. Include proper metadata and page structure
4. Test navigation and accessibility

## 📋 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: ES2020, CSS Grid, CSS Variables, Intersection Observer

## 🔧 Troubleshooting

### Common Issues

1. **Build Errors**: Run `npm run typecheck` to identify TypeScript issues
2. **Style Issues**: Clear `.next` cache and restart dev server
3. **Test Failures**: Check Node.js version (18+) and clear test cache

### Performance Tips

- Use `next/image` for optimized images
- Implement proper loading states
- Monitor Core Web Vitals with Lighthouse
- Consider lazy loading for non-critical content

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Vitest](https://vitest.dev)

---

Built with ❤️ for the Hillman Chan Coaching System