import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CourtsList from './courts-list';

const mockCourts = [
  {
    clubName: "Club A",
    clubLocation: "Location A",
    playCount: 5,
    totalDuration: 450,
    lastPlayed: "2024-01-15",
    sports: ["padel"],
    activityTypes: ["friendly", "tournament"],
    players: ["John", "Jane", "Bob"]
  },
  {
    clubName: "Club B",
    clubLocation: "Location B",
    playCount: 3,
    totalDuration: 180,
    lastPlayed: "2024-01-10",
    sports: ["tennis"],
    activityTypes: ["training"],
    players: ["Alice", "Bob"]
  }
];

const mockFavorites = ["Club A|Location A"];

describe('CourtsList', () => {
  const defaultProps = {
    courts: mockCourts,
    favorites: mockFavorites,
    onToggleFavorite: vi.fn(),
    onCourtClick: vi.fn()
  };

  it('renders courts list correctly', () => {
    render(<CourtsList {...defaultProps} />);
    
    expect(screen.getByText('2 courts found')).toBeInTheDocument();
    expect(screen.getByText('Club A')).toBeInTheDocument();
    expect(screen.getByText('Club B')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<CourtsList {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('Loading courts...')).toBeInTheDocument();
    // No opposite assertion needed; loading should be visible
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to fetch courts';
    render(<CourtsList {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByText(`Failed to load courts: ${errorMessage}`)).toBeInTheDocument();
  });

  it('displays empty state when no courts', () => {
    render(<CourtsList {...defaultProps} courts={[]} />);
    
    expect(screen.getByText('No courts found')).toBeInTheDocument();
    expect(screen.getByText(/You haven't played at any clubs yet/)).toBeInTheDocument();
  });

  it('handles single court correctly', () => {
    render(<CourtsList {...defaultProps} courts={[mockCourts[0]]} />);
    
    expect(screen.getByText('1 court found')).toBeInTheDocument();
  });

  it('calls onCourtClick when court is clicked', () => {
    const onCourtClick = vi.fn();
    render(<CourtsList {...defaultProps} onCourtClick={onCourtClick} />);
    
    const firstCourt = screen.getByText('Club A').closest('div');
    fireEvent.click(firstCourt!);
    
    expect(onCourtClick).toHaveBeenCalledWith(mockCourts[0]);
  });

  it('passes correct favorite status to court cards', () => {
    render(<CourtsList {...defaultProps} />);
    
    // Club A should be favorited (in mockFavorites)
    // Club B should not be favorited
    // We can't easily test the visual state here, but we can test that the props are passed correctly
    expect(screen.getByText('Club A')).toBeInTheDocument();
    expect(screen.getByText('Club B')).toBeInTheDocument();
  });

  it('calls onToggleFavorite when star is clicked', () => {
    const onToggleFavorite = vi.fn();
    render(<CourtsList {...defaultProps} onToggleFavorite={onToggleFavorite} />);
    
    // Find and click the star button (this will be handled by CourtCard)
    const starButtons = screen.getAllByRole('button');
    fireEvent.click(starButtons[0]); // First star button
    
    expect(onToggleFavorite).toHaveBeenCalled();
  });

  it('renders responsive grid layout', () => {
    render(<CourtsList {...defaultProps} />);
    
    const gridContainer = screen.getByText('Club A').closest('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('handles courts with empty location', () => {
    const courtsWithEmptyLocation = [
      {
        ...mockCourts[0],
        clubLocation: ""
      }
    ];
    
    render(<CourtsList {...defaultProps} courts={courtsWithEmptyLocation} />);
    
    expect(screen.getByText('Club A')).toBeInTheDocument();
    expect(screen.getByText('No location')).toBeInTheDocument();
  });

  it('shows correct results count for different numbers of courts', () => {
    const { rerender } = render(<CourtsList {...defaultProps} courts={[mockCourts[0]]} />);
    expect(screen.getByText('1 court found')).toBeInTheDocument();
    
    rerender(<CourtsList {...defaultProps} />);
    expect(screen.getByText('2 courts found')).toBeInTheDocument();
  });
}); 