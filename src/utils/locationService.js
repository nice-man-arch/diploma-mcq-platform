// src/utils/locationService.js

/**
 * Returns default local workspace region info without network IP tracking.
 */
export async function detectStudentLocation() {
  return {
    city: 'Local Area',
    region: '',
    country: 'India',
    displayText: 'Local Workspace'
  };
}
