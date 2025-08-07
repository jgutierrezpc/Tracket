import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlacesAutocomplete } from './places-autocomplete';
import { vi } from 'vitest';

// Mock Google Maps API
const mockGoogle = {
  maps: {
    places: {
      AutocompleteService: vi.fn(),
      PlacesService: vi.fn(),
      PlacesServiceStatus: {
        OK: 'OK',
        ZERO_RESULTS: 'ZERO_RESULTS'
      }
    }
  }
};

// Mock window.google
Object.defineProperty(window, 'google', {
  value: mockGoogle,
  writable: true
});

describe('PlacesAutocomplete', () => {
  const mockOnPlaceSelect = vi.fn();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with placeholder', () => {
    render(
      <PlacesAutocomplete
        onPlaceSelect={mockOnPlaceSelect}
        placeholder="Search for venues..."
      />
    );

    expect(screen.getByPlaceholderText('Search for venues...')).toBeInTheDocument();
  });

  it('shows search icon', () => {
    render(
      <PlacesAutocomplete
        onPlaceSelect={mockOnPlaceSelect}
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('handles input changes', async () => {
    render(
      <PlacesAutocomplete
        onPlaceSelect={mockOnPlaceSelect}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText('Search for a venue...');
    fireEvent.change(input, { target: { value: 'Padel Town' } });

    expect(mockOnChange).toHaveBeenCalledWith('Padel Town');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <PlacesAutocomplete
        onPlaceSelect={mockOnPlaceSelect}
        disabled={true}
      />
    );

    const input = screen.getByPlaceholderText('Search for a venue...');
    expect(input).toBeDisabled();
  });

  it('displays controlled value', () => {
    render(
      <PlacesAutocomplete
        onPlaceSelect={mockOnPlaceSelect}
        value="Padel Town"
      />
    );

    const input = screen.getByPlaceholderText('Search for a venue...');
    expect(input).toHaveValue('Padel Town');
  });

  it('applies custom className', () => {
    render(
      <PlacesAutocomplete
        onPlaceSelect={mockOnPlaceSelect}
        className="custom-class"
      />
    );

    const container = screen.getByPlaceholderText('Search for a venue...').closest('div');
    expect(container).toHaveClass('custom-class');
  });
}); 