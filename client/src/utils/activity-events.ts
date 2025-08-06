/**
 * Utility functions for dispatching activity change events
 * These events are used to trigger real-time updates in the Courts page
 */

export type ActivityChangeType = 'added' | 'updated' | 'deleted' | 'changed';

export interface ActivityChangeEvent {
  type: ActivityChangeType;
  activityId?: string;
  timestamp: Date;
}

/**
 * Dispatch an activity change event to trigger real-time updates
 */
export function dispatchActivityChange(type: ActivityChangeType, activityId?: string): void {
  const event = new CustomEvent(`activity-${type}`, {
    detail: {
      type,
      activityId,
      timestamp: new Date(),
    } as ActivityChangeEvent,
  });
  
  window.dispatchEvent(event);
}

/**
 * Dispatch activity added event
 */
export function dispatchActivityAdded(activityId?: string): void {
  dispatchActivityChange('added', activityId);
}

/**
 * Dispatch activity updated event
 */
export function dispatchActivityUpdated(activityId?: string): void {
  dispatchActivityChange('updated', activityId);
}

/**
 * Dispatch activity deleted event
 */
export function dispatchActivityDeleted(activityId?: string): void {
  dispatchActivityChange('deleted', activityId);
}

/**
 * Dispatch general activity change event
 */
export function dispatchActivityChanged(activityId?: string): void {
  dispatchActivityChange('changed', activityId);
}

/**
 * Listen for activity change events
 */
export function onActivityChange(callback: (event: ActivityChangeEvent) => void): () => void {
  const handleEvent = (event: Event) => {
    const customEvent = event as CustomEvent<ActivityChangeEvent>;
    callback(customEvent.detail);
  };

  window.addEventListener('activity-added', handleEvent);
  window.addEventListener('activity-updated', handleEvent);
  window.addEventListener('activity-deleted', handleEvent);
  window.addEventListener('activity-changed', handleEvent);

  return () => {
    window.removeEventListener('activity-added', handleEvent);
    window.removeEventListener('activity-updated', handleEvent);
    window.removeEventListener('activity-deleted', handleEvent);
    window.removeEventListener('activity-changed', handleEvent);
  };
} 