import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewToggle, { ViewMode } from './view-toggle';

describe('ViewToggle', () => {
  const defaultProps = {
    currentView: 'list' as ViewMode,
    onViewChange: vi.fn(),
    listCount: 5,
    mapCount: 3
  };

  it('renders both view options correctly', () => {
    render(<ViewToggle {...defaultProps} />);
    
    expect(screen.getByText('View:')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
    expect(screen.getByText('Map')).toBeInTheDocument();
  });

  it('shows correct active state for list view', () => {
    render(<ViewToggle {...defaultProps} currentView="list" />);
    
    const listButton = screen.getByText('List').closest('button');
    const mapButton = screen.getByText('Map').closest('button');
    
    expect(listButton).toHaveClass('bg-primary');
    expect(mapButton).toHaveClass('bg-transparent');
  });

  it('shows correct active state for map view', () => {
    render(<ViewToggle {...defaultProps} currentView="map" />);
    
    const listButton = screen.getByText('List').closest('button');
    const mapButton = screen.getByText('Map').closest('button');
    
    expect(mapButton).toHaveClass('bg-primary');
    expect(listButton).toHaveClass('bg-transparent');
  });

  it('calls onViewChange when list button is clicked', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle {...defaultProps} onViewChange={onViewChange} currentView="map" />);
    
    const listButton = screen.getByText('List').closest('button');
    fireEvent.click(listButton!);
    
    expect(onViewChange).toHaveBeenCalledWith('list');
  });

  it('calls onViewChange when map button is clicked', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle {...defaultProps} onViewChange={onViewChange} currentView="list" />);
    
    const mapButton = screen.getByText('Map').closest('button');
    fireEvent.click(mapButton!);
    
    expect(onViewChange).toHaveBeenCalledWith('map');
  });

  it('displays count badges when provided', () => {
    render(<ViewToggle {...defaultProps} listCount={5} mapCount={3} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not display count badges when count is 0', () => {
    render(<ViewToggle {...defaultProps} listCount={0} mapCount={0} />);
    
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('handles missing count props gracefully', () => {
    render(<ViewToggle {...defaultProps} listCount={undefined} mapCount={undefined} />);
    
    expect(screen.queryByText('5')).not.toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ViewToggle {...defaultProps} className="custom-class" />);
    
    const container = screen.getByText('View:').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<ViewToggle {...defaultProps} />);
    
    const listButton = screen.getByText('List').closest('button');
    const mapButton = screen.getByText('Map').closest('button');
    
    expect(listButton).toHaveAttribute('type', 'button');
    expect(mapButton).toHaveAttribute('type', 'button');
  });

  it('displays icons correctly', () => {
    render(<ViewToggle {...defaultProps} />);
    
    // Check that icons are present (they should be rendered as SVGs)
    const listIcon = screen.getByText('List').previousElementSibling;
    const mapIcon = screen.getByText('Map').previousElementSibling;
    
    expect(listIcon).toBeInTheDocument();
    expect(mapIcon).toBeInTheDocument();
  });
}); 