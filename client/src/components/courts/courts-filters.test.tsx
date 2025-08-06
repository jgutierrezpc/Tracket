import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CourtsFilters, { CourtFilters } from './courts-filters';

describe('CourtsFilters', () => {
  const defaultProps = {
    filters: {} as CourtFilters,
    onFiltersChange: vi.fn(),
    onClearFilters: vi.fn(),
    availableSports: ['tennis', 'padel', 'pickleball'],
    availableActivityTypes: ['friendly', 'tournament', 'training'],
    availablePlayers: ['John', 'Jane', 'Bob', 'Alice', 'Mike', 'Sarah'],
    isExpanded: false,
    onToggleExpanded: vi.fn()
  };

  it('renders filter header correctly', () => {
    render(<CourtsFilters {...defaultProps} />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Filter Options')).toBeInTheDocument();
  });

  it('shows active filters count when filters are applied', () => {
    const filtersWithValues = {
      sport: 'tennis',
      activityType: 'tournament'
    };
    
    render(<CourtsFilters {...defaultProps} filters={filtersWithValues} />);
    
    expect(screen.getByText('2 active')).toBeInTheDocument();
  });

  it('calls onClearFilters when clear all button is clicked', () => {
    const onClearFilters = vi.fn();
    const filtersWithValues = { sport: 'tennis' };
    
    render(<CourtsFilters {...defaultProps} filters={filtersWithValues} onClearFilters={onClearFilters} />);
    
    const clearButton = screen.getByText('Clear all');
    fireEvent.click(clearButton);
    
    expect(onClearFilters).toHaveBeenCalled();
  });

  it('handles date range selection correctly', () => {
    const onFiltersChange = vi.fn();
    render(<CourtsFilters {...defaultProps} onFiltersChange={onFiltersChange} />);
    
    // Open the collapsible
    const filterButton = screen.getByText('Filter Options');
    fireEvent.click(filterButton);
    
    // Find and click the date range select
    const dateRangeSelect = screen.getByText('Select date range');
    fireEvent.click(dateRangeSelect);
    
    // Select "This year"
    const thisYearOption = screen.getByText('This year');
    fireEvent.click(thisYearOption);
    
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dateRange: 'this-year',
        startDate: expect.stringMatching(/^\d{4}-01-01$/),
        endDate: expect.stringMatching(/^\d{4}-12-31$/)
      })
    );
  });

  it('handles sport selection correctly', () => {
    const onFiltersChange = vi.fn();
    render(<CourtsFilters {...defaultProps} onFiltersChange={onFiltersChange} />);
    
    // Open the collapsible
    const filterButton = screen.getByText('Filter Options');
    fireEvent.click(filterButton);
    
    // Find and click the sport select
    const sportSelect = screen.getByText('All sports');
    fireEvent.click(sportSelect);
    
    // Select "Tennis"
    const tennisOption = screen.getByText('Tennis');
    fireEvent.click(tennisOption);
    
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sport: 'tennis'
      })
    );
  });

  it('handles activity type selection correctly', () => {
    const onFiltersChange = vi.fn();
    render(<CourtsFilters {...defaultProps} onFiltersChange={onFiltersChange} />);
    
    // Open the collapsible
    const filterButton = screen.getByText('Filter Options');
    fireEvent.click(filterButton);
    
    // Find and click the activity type select
    const activitySelect = screen.getByText('All activities');
    fireEvent.click(activitySelect);
    
    // Select "Tournament"
    const tournamentOption = screen.getByText('Tournament');
    fireEvent.click(tournamentOption);
    
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        activityType: 'tournament'
      })
    );
  });

  it('handles player search correctly', () => {
    const onFiltersChange = vi.fn();
    render(<CourtsFilters {...defaultProps} onFiltersChange={onFiltersChange} />);
    
    // Open the collapsible
    const filterButton = screen.getByText('Filter Options');
    fireEvent.click(filterButton);
    
    // Find the player input
    const playerInput = screen.getByPlaceholderText('Search by player name...');
    fireEvent.change(playerInput, { target: { value: 'John' } });
    
    // Click the search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        player: 'John'
      })
    );
  });

  it('handles player search on Enter key', () => {
    const onFiltersChange = vi.fn();
    render(<CourtsFilters {...defaultProps} onFiltersChange={onFiltersChange} />);
    
    // Open the collapsible
    const filterButton = screen.getByText('Filter Options');
    fireEvent.click(filterButton);
    
    // Find the player input
    const playerInput = screen.getByPlaceholderText('Search by player name...');
    fireEvent.change(playerInput, { target: { value: 'Jane' } });
    fireEvent.keyPress(playerInput, { key: 'Enter', code: 'Enter' });
    
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        player: 'Jane'
      })
    );
  });

  it('shows player suggestions when available', () => {
    render(<CourtsFilters {...defaultProps} />);
    
    // Open the collapsible
    const filterButton = screen.getByText('Filter Options');
    fireEvent.click(filterButton);
    
    // Check that player suggestions are shown
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument(); // 6 players, showing 5 + "+1 more"
  });

  it('handles clicking on player suggestions', () => {
    const onFiltersChange = vi.fn();
    render(<CourtsFilters {...defaultProps} onFiltersChange={onFiltersChange} />);
    
    // Open the collapsible
    const filterButton = screen.getByText('Filter Options');
    fireEvent.click(filterButton);
    
    // Click on a player suggestion
    const johnBadge = screen.getByText('John');
    fireEvent.click(johnBadge);
    
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        player: 'John'
      })
    );
  });

  it('shows active filter badges when filters are applied', () => {
    const filtersWithValues = {
      sport: 'tennis',
      activityType: 'tournament',
      player: 'John'
    };
    
    render(<CourtsFilters {...defaultProps} filters={filtersWithValues} />);
    
    expect(screen.getByText('tennis')).toBeInTheDocument();
    expect(screen.getByText('tournament')).toBeInTheDocument();
    expect(screen.getByText('Player: John')).toBeInTheDocument();
  });

  it('handles clearing individual filters', () => {
    const onFiltersChange = vi.fn();
    const filtersWithValues = { sport: 'tennis' };
    
    render(<CourtsFilters {...defaultProps} filters={filtersWithValues} onFiltersChange={onFiltersChange} />);
    
    // Find and click the X button on the sport badge
    const sportBadge = screen.getByText('tennis');
    const xButton = sportBadge.querySelector('svg');
    fireEvent.click(xButton!);
    
    expect(onFiltersChange).toHaveBeenCalledWith({});
  });

  it('handles custom date range correctly', () => {
    const onFiltersChange = vi.fn();
    render(<CourtsFilters {...defaultProps} onFiltersChange={onFiltersChange} />);
    
    // Open the collapsible
    const filterButton = screen.getByText('Filter Options');
    fireEvent.click(filterButton);
    
    // Select custom date range
    const dateRangeSelect = screen.getByText('Select date range');
    fireEvent.click(dateRangeSelect);
    const customOption = screen.getByText('Custom range');
    fireEvent.click(customOption);
    
    // Check that date inputs are shown
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  it('handles collapsible toggle correctly', () => {
    const onToggleExpanded = vi.fn();
    render(<CourtsFilters {...defaultProps} onToggleExpanded={onToggleExpanded} />);
    
    const filterButton = screen.getByText('Filter Options');
    fireEvent.click(filterButton);
    
    expect(onToggleExpanded).toHaveBeenCalledWith(true);
  });
}); 