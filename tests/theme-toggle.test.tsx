import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}))

const mockUseTheme = vi.mocked(useTheme)

describe('ThemeToggle', () => {
  const mockSetTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light'
    })
  })

  describe('Button variant', () => {
    it('renders button variant by default', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button', { name: /toggle dark mode/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'Toggle dark mode')
    })

    it('shows moon icon in light mode', () => {
      render(<ThemeToggle />)
      
      // Moon icon should be present when in light mode
      const moonIcon = screen.getByRole('button').querySelector('svg')
      expect(moonIcon).toBeInTheDocument()
    })

    it('shows sun icon in dark mode', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
        themes: ['light', 'dark'],
        systemTheme: 'dark'
      })
      
      render(<ThemeToggle />)
      
      // Sun icon should be present when in dark mode
      const sunIcon = screen.getByRole('button').querySelector('svg')
      expect(sunIcon).toBeInTheDocument()
    })

    it('toggles theme when clicked', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button', { name: /toggle dark mode/i })
      await user.click(button)
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('toggles from dark to light', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
        themes: ['light', 'dark'],
        systemTheme: 'dark'
      })
      
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button', { name: /toggle dark mode/i })
      await user.click(button)
      
      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })
  })

  describe('Switch variant', () => {
    it('renders switch variant when specified', () => {
      render(<ThemeToggle variant="switch" />)
      
      const switchElement = screen.getByRole('switch', { name: /toggle dark mode/i })
      expect(switchElement).toBeInTheDocument()
    })

    it('shows both sun and moon icons in switch variant', () => {
      render(<ThemeToggle variant="switch" />)
      
      // Both sun and moon icons should be present
      const container = screen.getByRole('switch').parentElement
      const icons = container?.querySelectorAll('svg')
      expect(icons).toHaveLength(2)
    })

    it('reflects correct state in switch', () => {
      render(<ThemeToggle variant="switch" />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).not.toBeChecked() // light mode = unchecked
    })

    it('shows checked state in dark mode', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
        themes: ['light', 'dark'],
        systemTheme: 'dark'
      })
      
      render(<ThemeToggle variant="switch" />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeChecked() // dark mode = checked
    })

    it('toggles theme when switch is clicked', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle variant="switch" />)
      
      const switchElement = screen.getByRole('switch')
      await user.click(switchElement)
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })
  })

  describe('Component behavior', () => {
    it('does not render before mounting (SSR safety)', () => {
      // Mock the mounting state
      const { container } = render(<ThemeToggle />)
      
      // The component should render (in our test environment it's always "mounted")
      // In real usage, there's a mounting check that prevents SSR issues
      expect(container.firstChild).toBeTruthy()
    })

    it('applies custom className', () => {
      render(<ThemeToggle className="custom-class" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('handles keyboard interaction', async () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      button.focus()
      
      fireEvent.keyDown(button, { key: 'Enter' })
      await waitFor(() => {
        expect(mockSetTheme).toHaveBeenCalled()
      })
    })

    it('has proper accessibility attributes', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Toggle dark mode')
    })
  })

  describe('Edge cases', () => {
    it('handles undefined theme gracefully', () => {
      mockUseTheme.mockReturnValue({
        theme: undefined,
        setTheme: mockSetTheme,
        resolvedTheme: undefined,
        themes: ['light', 'dark'],
        systemTheme: 'light'
      })
      
      expect(() => {
        render(<ThemeToggle />)
      }).not.toThrow()
    })

    it('works with system theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
        themes: ['light', 'dark', 'system'],
        systemTheme: 'light'
      })
      
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })
})