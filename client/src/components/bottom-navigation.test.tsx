import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/hooks/use-navigation', () => ({
  useNavigation: vi.fn(() => ({
    navigate: vi.fn()
  }))
}));

vi.mock('@/components/ui/sheet', () => ({
  Sheet: vi.fn(({ children, open, onOpenChange }) => (
    <div data-testid="sheet" data-open={open}>
      {children}
    </div>
  )),
  SheetContent: vi.fn(({ children, side, className }) => (
    <div data-testid="sheet-content" data-side={side} className={className}>
      {children}
    </div>
  )),
  SheetTrigger: vi.fn(({ children, asChild }) => (
    <div data-testid="sheet-trigger" data-as-child={asChild}>
      {children}
    </div>
  ))
}));

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, className, size, variant, ...props }) => (
    <button className={className} data-size={size} data-variant={variant} {...props}>
      {children}
    </button>
  ))
}));

vi.mock('./add-activity-form', () => ({
  default: vi.fn(({ onClose }) => (
    <div data-testid="add-activity-form">
      <button onClick={onClose}>Close</button>
    </div>
  ))
}));

// Import after mocks
import BottomNavigation from './bottom-navigation';
import { useNavigation } from '@/hooks/use-navigation';

const mockUseNavigation = vi.mocked(useNavigation);

describe('BottomNavigation', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigation.mockReturnValue({
      navigate: mockNavigate
    });
  });

  describe('Rendering', () => {
    it('renders all navigation items', () => {
      render(<BottomNavigation currentPage="home" />);
      
      expect(screen.getByTestId('nav-home')).toBeInTheDocument();
      expect(screen.getByTestId('nav-courts')).toBeInTheDocument();
      expect(screen.getByTestId('nav-friends')).toBeInTheDocument();
      expect(screen.getByTestId('nav-profile')).toBeInTheDocument();
    });

    it('renders add activity button', () => {
      render(<BottomNavigation currentPage="home" />);
      
      expect(screen.getByTestId('button-add-activity')).toBeInTheDocument();
    });

    it('renders sheet components', () => {
      render(<BottomNavigation currentPage="home" />);
      
      expect(screen.getByTestId('sheet')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('handles home navigation click', () => {
      render(<BottomNavigation currentPage="courts" />);
      
      const homeButton = screen.getByTestId('nav-home');
      fireEvent.click(homeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('home');
    });

    it('handles courts navigation click', () => {
      render(<BottomNavigation currentPage="home" />);
      
      const courtsButton = screen.getByTestId('nav-courts');
      fireEvent.click(courtsButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('courts');
    });

    it('handles friends navigation click', () => {
      render(<BottomNavigation currentPage="home" />);
      
      const friendsButton = screen.getByTestId('nav-friends');
      fireEvent.click(friendsButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('friends');
    });

    it('handles profile navigation click', () => {
      render(<BottomNavigation currentPage="home" />);
      
      const profileButton = screen.getByTestId('nav-profile');
      fireEvent.click(profileButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('profile');
    });
  });

  describe('Active State', () => {
    it('shows home as active when currentPage is home', () => {
      render(<BottomNavigation currentPage="home" />);
      
      const homeButton = screen.getByTestId('nav-home');
      expect(homeButton).toHaveClass('text-primary');
    });

    it('shows courts as active when currentPage is courts', () => {
      render(<BottomNavigation currentPage="courts" />);
      
      const courtsButton = screen.getByTestId('nav-courts');
      expect(courtsButton).toHaveClass('text-primary');
    });

    it('shows friends as active when currentPage is friends', () => {
      render(<BottomNavigation currentPage="friends" />);
      
      const friendsButton = screen.getByTestId('nav-friends');
      expect(friendsButton).toHaveClass('text-primary');
    });

    it('shows profile as active when currentPage is profile', () => {
      render(<BottomNavigation currentPage="profile" />);
      
      const profileButton = screen.getByTestId('nav-profile');
      expect(profileButton).toHaveClass('text-primary');
    });

    it('shows inactive state for non-active pages', () => {
      render(<BottomNavigation currentPage="home" />);
      
      const courtsButton = screen.getByTestId('nav-courts');
      const friendsButton = screen.getByTestId('nav-friends');
      const profileButton = screen.getByTestId('nav-profile');
      
      expect(courtsButton).toHaveClass('text-gray-400');
      expect(friendsButton).toHaveClass('text-gray-400');
      expect(profileButton).toHaveClass('text-gray-400');
    });
  });

  describe('Add Activity Sheet', () => {
    it('renders add activity form in sheet', () => {
      render(<BottomNavigation currentPage="home" />);
      
      expect(screen.getByTestId('add-activity-form')).toBeInTheDocument();
    });

    it('has proper sheet configuration', () => {
      render(<BottomNavigation currentPage="home" />);
      
      const sheetContent = screen.getByTestId('sheet-content');
      expect(sheetContent).toHaveAttribute('data-side', 'bottom');
      expect(sheetContent.className).toContain('h-[80vh]');
      expect(sheetContent.className).toContain('rounded-t-3xl');
    });
  });

  describe('Accessibility', () => {
    it('has proper test IDs for all navigation items', () => {
      render(<BottomNavigation currentPage="home" />);
      
      expect(screen.getByTestId('nav-home')).toBeInTheDocument();
      expect(screen.getByTestId('nav-courts')).toBeInTheDocument();
      expect(screen.getByTestId('nav-friends')).toBeInTheDocument();
      expect(screen.getByTestId('nav-profile')).toBeInTheDocument();
      expect(screen.getByTestId('button-add-activity')).toBeInTheDocument();
    });

    it('has proper button labels', () => {
      render(<BottomNavigation currentPage="home" />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Courts')).toBeInTheDocument();
      expect(screen.getByText('Friends')).toBeInTheDocument();
      expect(screen.getByText('You')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies proper styling classes', () => {
      render(<BottomNavigation currentPage="home" />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('bg-white', 'dark:bg-gray-800', 'border-t', 'sticky', 'bottom-0');
    });

    it('has proper layout structure', () => {
      render(<BottomNavigation currentPage="home" />);
      
      const container = screen.getByRole('navigation').querySelector('div');
      expect(container).toHaveClass('flex', 'items-center', 'justify-around');
    });
  });

  describe('Default Props', () => {
    it('uses home as default currentPage', () => {
      render(<BottomNavigation />);
      
      const homeButton = screen.getByTestId('nav-home');
      expect(homeButton).toHaveClass('text-primary');
    });
  });
}); 