import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FavoritesFilter from './favorites-filter';

describe('FavoritesFilter', () => {
  const defaultProps = {
    showOnlyFavorites: false,
    onToggleFavoritesFilter: vi.fn(),
    favoritesCount: 3,
    totalCourtsCount: 10
  };

  it('renders correctly with default state', () => {
    render(<FavoritesFilter {...defaultProps} />);
    
    expect(screen.getByText('Show only favorites')).toBeInTheDocument();
    expect(screen.getByText('3 favorites • 10 total')).toBeInTheDocument();
  });

  it('shows correct text when favorites filter is active', () => {
    render(<FavoritesFilter {...defaultProps} showOnlyFavorites={true} />);
    
    expect(screen.getByText('Showing 3 of 10 courts')).toBeInTheDocument();
  });

  it('handles single favorite correctly', () => {
    render(<FavoritesFilter {...defaultProps} favoritesCount={1} />);
    
    expect(screen.getByText('1 favorite • 10 total')).toBeInTheDocument();
  });

  it('calls onToggleFavoritesFilter when switch is clicked', () => {
    const onToggle = vi.fn();
    render(<FavoritesFilter {...defaultProps} onToggleFavoritesFilter={onToggle} />);
    
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('displays correct switch state', () => {
    const { rerender } = render(<FavoritesFilter {...defaultProps} />);
    
    // Initially unchecked
    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
    
    // Checked state
    rerender(<FavoritesFilter {...defaultProps} showOnlyFavorites={true} />);
    expect(switchElement).toBeChecked();
  });

  it('handles zero favorites correctly', () => {
    render(<FavoritesFilter {...defaultProps} favoritesCount={0} />);
    
    expect(screen.getByText('0 favorites • 10 total')).toBeInTheDocument();
  });

  it('handles zero total courts correctly', () => {
    render(<FavoritesFilter {...defaultProps} totalCourtsCount={0} />);
    
    expect(screen.getByText('3 favorites • 0 total')).toBeInTheDocument();
  });

  it('shows correct text when filtering with zero favorites', () => {
    render(<FavoritesFilter {...defaultProps} showOnlyFavorites={true} favoritesCount={0} />);
    
    expect(screen.getByText('Showing 0 of 10 courts')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<FavoritesFilter {...defaultProps} />);
    
    const switchElement = screen.getByRole('switch');
    const label = screen.getByText('Show only favorites');
    
    expect(switchElement).toHaveAttribute('id', 'favorites-filter');
    expect(label).toHaveAttribute('for', 'favorites-filter');
  });
}); 