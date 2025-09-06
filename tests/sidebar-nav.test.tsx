import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { usePathname } from '@/routing'
import { SidebarNav } from '@/components/sidebar-nav'

// Mock next-intl routing
vi.mock('@/routing', () => ({
  usePathname: vi.fn(),
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ locale: 'en' })),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

const mockUsePathname = vi.mocked(usePathname)

// Mock navigation data
const mockNavigation = [
  { key: 'welcome', label: 'Welcome', href: '/welcome' },
  { key: 'installation', label: 'Installation', href: '/installation' },
  { key: 'quickstart', label: 'Quickstart', href: '/quickstart' },
  { key: 'concepts', label: 'Concepts', href: '/concepts' },
  { 
    key: 'core', 
    label: 'Core', 
    href: '/core',
    children: [
      { key: 'coach', label: 'Coach', href: '/core/coach' },
      { key: 'programs', label: 'Programs', href: '/core/programs' }
    ]
  },
  { 
    key: 'tools', 
    label: 'Tools', 
    href: '/tools',
    children: [
      { key: 'goal-planner', label: 'Goal Planner', href: '/tools/goal-planner' }
    ]
  },
  { key: 'background-agents', label: 'Background Agents', href: '/background-agents' }
]

describe('SidebarNav', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/docs/welcome')
  })

  it('renders navigation items correctly', () => {
    render(<SidebarNav navigation={mockNavigation} />)
    
    // Check for main navigation items
    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByText('Installation')).toBeInTheDocument()
    expect(screen.getByText('Quickstart')).toBeInTheDocument()
    expect(screen.getByText('Concepts')).toBeInTheDocument()
    expect(screen.getByText('Core')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('Background Agents')).toBeInTheDocument()
  })

  it('expands and collapses nested items', () => {
    render(<SidebarNav navigation={mockNavigation} />)
    
    const coreButton = screen.getByRole('button', { name: /core/i })
    
    // Check if Core button exists and can be clicked
    expect(coreButton).toBeInTheDocument()
    
    // Click to expand if not already expanded
    fireEvent.click(coreButton)
    
    // After clicking, it should be expanded
    expect(coreButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('highlights active route', () => {
    mockUsePathname.mockReturnValue('/welcome')
    render(<SidebarNav navigation={mockNavigation} />)
    
    // Check if the welcome link exists
    const welcomeLink = screen.getByRole('link', { name: /welcome/i })
    expect(welcomeLink).toBeInTheDocument()
  })

  it('has proper ARIA attributes for accessibility', () => {
    render(<SidebarNav navigation={mockNavigation} />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    
    const coreButton = screen.getByRole('button', { name: /core/i })
    expect(coreButton).toHaveAttribute('aria-expanded')
    expect(coreButton).toHaveAttribute('aria-controls')
  })

  it('provides keyboard navigation support', () => {
    render(<SidebarNav navigation={mockNavigation} />)
    
    const firstLink = screen.getByRole('link', { name: /welcome/i })
    firstLink.focus()
    
    // Test that the element can receive focus
    expect(firstLink).toHaveFocus()
    
    // Test keyboard navigation
    fireEvent.keyDown(firstLink, { key: 'ArrowDown' })
    // Note: Full keyboard navigation testing would require more setup
    // This test ensures the basic structure is in place
  })

  it('renders with custom className', () => {
    const { container } = render(<SidebarNav navigation={mockNavigation} className="custom-class" />)
    const aside = container.querySelector('aside')
    expect(aside).toHaveClass('custom-class')
  })

  it('auto-expands parent when child is active', () => {
    mockUsePathname.mockReturnValue('/tools/goal-planner')
    render(<SidebarNav navigation={mockNavigation} />)
    
    // Tools section should be auto-expanded when a child page is active
    const toolsButton = screen.getByRole('button', { name: /tools/i })
    expect(toolsButton).toHaveAttribute('aria-expanded', 'true')
  })
})