import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  MapPin, 
  List, 
  Filter,
  Star,
  Globe
} from 'lucide-react';

interface NetworkErrorProps {
  onRetry: () => void;
  error?: string;
}

export function NetworkError({ onRetry, error }: NetworkErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <WifiOff className="h-8 w-8 text-orange-600 dark:text-orange-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Network Connection Error
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-md">
        Unable to connect to the server. Please check your internet connection and try again.
      </p>
      {error && (
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={onRetry} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Retry Connection
      </Button>
    </div>
  );
}

interface DataErrorProps {
  onRetry: () => void;
  error?: string;
}

export function DataError({ onRetry, error }: DataErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Data Loading Error
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-md">
        Failed to load courts data. This might be a temporary issue.
      </p>
      {error && (
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={onRetry} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

interface MapErrorProps {
  onRetry: () => void;
  error?: string;
}

export function MapError({ onRetry, error }: MapErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Map Loading Error
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-md">
        Unable to load the map view. This might be due to a network issue or map service problem.
      </p>
      {error && (
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={onRetry} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Retry Map
      </Button>
    </div>
  );
}

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onAddActivity?: () => void;
}

export function EmptyState({ hasFilters, onClearFilters, onAddActivity }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <MapPin className="h-8 w-8 text-gray-600 dark:text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {hasFilters ? 'No Courts Match Your Filters' : 'No Courts Found'}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md">
        {hasFilters 
          ? 'Try adjusting your filters or favorites selection to see more courts.'
          : 'Start adding activities to see your courts here. Your courts will appear based on where you play.'
        }
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {hasFilters && (
          <Button onClick={onClearFilters} variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Clear All Filters
          </Button>
        )}
        {onAddActivity && (
          <Button onClick={onAddActivity} className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Add Activity
          </Button>
        )}
      </div>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading courts...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Loading Courts
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {message}
      </p>
    </div>
  );
}

interface OfflineStateProps {
  onRetry: () => void;
}

export function OfflineState({ onRetry }: OfflineStateProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WifiOff className="h-5 w-5 text-orange-600" />
          You're Offline
        </CardTitle>
        <CardDescription>
          Some features may not be available without an internet connection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          You can still view previously loaded courts, but real-time updates and new data fetching are disabled.
        </p>
        <Button onClick={onRetry} variant="outline" className="w-full">
          <Wifi className="h-4 w-4 mr-2" />
          Check Connection
        </Button>
      </CardContent>
    </Card>
  );
}

interface PartialDataStateProps {
  loadedCount: number;
  totalCount: number;
  onRetry: () => void;
}

export function PartialDataState({ loadedCount, totalCount, onRetry }: PartialDataStateProps) {
  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Only {loadedCount} of {totalCount} courts loaded. 
        <Button 
          variant="link" 
          className="p-0 h-auto text-blue-600 dark:text-blue-400 ml-1"
          onClick={onRetry}
        >
          Retry loading
        </Button>
      </AlertDescription>
    </Alert>
  );
} 