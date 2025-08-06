import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CourtCard from './court-card';

const mockCourt = {
  clubName: "Test Club",
  clubLocation: "Test Location",
  playCount: 5,
  totalDuration: 450,
  lastPlayed: "2024-01-15",
  sports: ["padel", "tennis"],
  activityTypes: ["friendly", "tournament", "training"],
  players: ["John", "Jane", "Bob", "Alice"]
};

describe('CourtCard', () => {
  const defaultProps = {
    court: mockCourt,
    isFavorite: false,
    onToggleFavorite: vi.fn(),
    onClick: vi.fn()
  };

  it('renders club information correctly', () => {
    render(<CourtCard {...defaultProps} />);
    
    expect(screen.getByText('Test Club')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('5 sessions')).toBeInTheDocument();
    expect(screen.getByText('4 players')).toBeInTheDocument();
  });

  it('displays favorite star correctly when not favorited', () => {
    render(<CourtCard {...defaultProps} />);
    
    const starButton = screen.getByRole('button');
    expect(starButton).toBeInTheDocument();
    expect(starButton).toHaveClass('text-gray-400');
  });

  it('displays favorite star correctly when favorited', () => {
    render(<CourtCard {...defaultProps} isFavorite={true} />);
    
    const starButton = screen.getByRole('button');
    expect(starButton).toBeInTheDocument();
    expect(starButton).toHaveClass('text-yellow-500');
  });

  it('calls onToggleFavorite when star is clicked', () => {
    const onToggleFavorite = vi.fn();
    render(<CourtCard {...defaultProps} onToggleFavorite={onToggleFavorite} />);
    
    const starButton = screen.getByRole('button');
    fireEvent.click(starButton);
    
    expect(onToggleFavorite).toHaveBeenCalledWith('Test Club', 'Test Location');
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<CourtCard {...defaultProps} onClick={onClick} />);
    
    const card = screen.getByText('Test Club').closest('[role="button"]') || screen.getByText('Test Club').closest('div');
    fireEvent.click(card!);
    
    expect(onClick).toHaveBeenCalled();
  });

  it('displays sports badges correctly', () => {
    render(<CourtCard {...defaultProps} />);
    
    expect(screen.getByText('padel')).toBeInTheDocument();
    expect(screen.getByText('tennis')).toBeInTheDocument();
  });

  it('displays activity type badges correctly', () => {
    render(<CourtCard {...defaultProps} />);
    
    expect(screen.getByText('friendly')).toBeInTheDocument();
    expect(screen.getByText('tournament')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('handles empty club location', () => {
    const courtWithNoLocation = {
      ...mockCourt,
      clubLocation: ""
    };
    
    render(<CourtCard {...defaultProps} court={courtWithNoLocation} />);
    
    expect(screen.getByText('No location')).toBeInTheDocument();
  });

  it('formats duration correctly', () => {
    render(<CourtCard {...defaultProps} />);
    
    // 450 minutes = 7 hours 30 minutes
    expect(screen.getByText('7h 30m')).toBeInTheDocument();
  });

  it('handles single session correctly', () => {
    const singleSessionCourt = {
      ...mockCourt,
      playCount: 1
    };
    
    render(<CourtCard {...defaultProps} court={singleSessionCourt} />);
    
    expect(screen.getByText('1 session')).toBeInTheDocument();
  });

  it('prevents event bubbling when star is clicked', () => {
    const onClick = vi.fn();
    const onToggleFavorite = vi.fn();
    
    render(<CourtCard {...defaultProps} onClick={onClick} onToggleFavorite={onToggleFavorite} />);
    
    const starButton = screen.getByRole('button');
    fireEvent.click(starButton);
    
    expect(onToggleFavorite).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });
}); 