import { POINT_TYPE_ICON } from "./constants"

export * from './constants'

// Add validation for duplicate icons
if (Object.values(POINT_TYPE_ICON).length !== new Set(Object.values(POINT_TYPE_ICON)).size) {
    console.warn('Duplicate icons')
} 