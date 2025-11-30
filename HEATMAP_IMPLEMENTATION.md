# Heatmap Implementation Guide

## Overview
A fully functional ride heatmap visualization has been added to the Admin Analytics Dashboard. This feature displays geographic distribution of ride requests and pickups using Google Maps Heatmap Layer.

## Features Implemented

### 1. **HeatMap Component** (`components/Admin/HeatMap.tsx`)
- Google Maps integration with Heatmap visualization layer
- Automatic data loading and error handling
- Weighted location support for ride density
- Custom gradient coloring (blue → purple → red)
- Legend showing density levels
- Responsive design with 500px height
- Empty state and error state handling

### 2. **Analytics Dashboard Integration** (`components/Admin/AnalyticsDashboard.tsx`)
- Heatmap section added below zone statistics
- Props extended to include heatmap data
- Real-time data count display
- Seamless integration with existing analytics

### 3. **Redux State Management**
- Already configured in `adminAnalyticsSlice.ts`
- Heatmap data fetching via `getAnalyticsHeatmap` action
- Loading and error states managed

### 4. **Analytics Page Integration** (`app/admin/analytics/page.tsx`)
- Automatic heatmap data fetching on date range change
- Parallel API calls for optimal performance

## API Endpoint Requirement

### Endpoint
```
GET /api/admin/analytics/heatmap
```

### Query Parameters
- `from` (string, ISO 8601 datetime): Start date/time for data range
- `to` (string, ISO 8601 datetime): End date/time for data range

### Expected Response Format

The API should return an array of location objects:

```json
[
  {
    "lat": 12.9716,
    "lng": 77.5946,
    "weight": 5
  },
  {
    "lat": 12.9750,
    "lng": 77.6000,
    "weight": 3
  },
  {
    "lat": 12.9800,
    "lng": 77.6050,
    "weight": 8
  }
]
```

### Response Fields
- `lat` (number, required): Latitude coordinate
- `lng` (number, required): Longitude coordinate
- `weight` (number, optional): Intensity/weight of the location (defaults to 1 if not provided)
  - Higher values = higher density (shown as red)
  - Lower values = lower density (shown as blue/cyan)
  - Recommended range: 1-10

### Example Backend Implementation (Spring Boot)

```java
@GetMapping("/api/admin/analytics/heatmap")
public List<HeatmapPoint> getHeatmap(
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
) {
    // Fetch rides from database within date range
    List<Ride> rides = rideRepository.findByCreatedAtBetween(from, to);
    
    // Group by location and count occurrences
    Map<Location, Long> locationCounts = rides.stream()
        .map(Ride::getPickupLocation)
        .collect(Collectors.groupingBy(
            Function.identity(), 
            Collectors.counting()
        ));
    
    // Convert to heatmap points
    return locationCounts.entrySet().stream()
        .map(entry -> new HeatmapPoint(
            entry.getKey().getLatitude(),
            entry.getKey().getLongitude(),
            entry.getValue().intValue()
        ))
        .collect(Collectors.toList());
}

@Data
@AllArgsConstructor
public static class HeatmapPoint {
    private double lat;
    private double lng;
    private int weight;
}
```

### Alternative: If API is Not Available

If the API endpoint returns 501 (Not Implemented) or is not available, the heatmap will display a user-friendly error message. You can implement the backend endpoint using the example above.

## Configuration

### Google Maps API Key
The application uses the Google Maps API key configured in `utils/config.ts`:

```typescript
GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyA4l8wJ5bYRj_iPcaWF1TTuPt5KVDGMFpo"
```

**Important:** Replace the default key with your own Google Maps API key with the following APIs enabled:
- Maps JavaScript API
- Visualization Library (for Heatmap Layer)

### Enable Analytics Feature
Ensure analytics are enabled in your configuration:

```typescript
ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
```

Or in your `.env.local` file:
```
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Usage

1. **Navigate to Admin Analytics**
   - Login as admin
   - Go to `/admin/analytics`

2. **View Heatmap**
   - The heatmap displays automatically on page load
   - Shows data for the last 7 days by default

3. **Adjust Date Range**
   - Use the date range selector at the top
   - Heatmap updates automatically when date range changes

4. **Interpret the Visualization**
   - **Blue/Cyan**: Low ride density areas
   - **Purple**: Medium ride density areas
   - **Red**: High ride density areas
   - Data point count shown in legend

## File Structure

```
ride_fast_frontend/
├── components/
│   └── Admin/
│       ├── HeatMap.tsx                 # NEW: Heatmap component
│       └── AnalyticsDashboard.tsx      # UPDATED: Added heatmap integration
├── app/
│   └── admin/
│       └── analytics/
│           └── page.tsx                # UPDATED: Added heatmap data fetching
├── utils/
│   ├── slices/
│   │   └── adminAnalyticsSlice.ts     # Already configured
│   ├── reducers/
│   │   └── adminReducers.ts           # Already configured
│   ├── apiRoutes.ts                   # Already configured
│   └── config.ts                      # Already configured
└── HEATMAP_IMPLEMENTATION.md          # This file
```

## Troubleshooting

### Issue: "Error loading Google Maps"
**Solution:** 
- Verify your Google Maps API key is valid
- Ensure Maps JavaScript API is enabled
- Check browser console for specific API errors

### Issue: "No heatmap data available"
**Solution:**
- Verify the date range has ride activity
- Check backend API is returning data
- Verify API endpoint is accessible

### Issue: "Failed to load heatmap" error
**Solution:**
- Check backend API is running
- Verify `/api/admin/analytics/heatmap` endpoint exists
- Check API returns data in correct format
- Review browser console and network tab

### Issue: Empty or sparse heatmap
**Solution:**
- Increase the date range to include more data
- Verify rides exist in the database for selected period
- Check weight values in API response

## Testing the Implementation

### 1. **Test with Mock Data (Development)**

You can test the heatmap with mock data by modifying the Redux slice temporarily:

```typescript
// In adminAnalyticsSlice.ts (for testing only)
const mockHeatmapData = [
  { lat: 12.9716, lng: 77.5946, weight: 5 },
  { lat: 12.9750, lng: 77.6000, weight: 3 },
  { lat: 12.9800, lng: 77.6050, weight: 8 },
  { lat: 12.9850, lng: 77.6100, weight: 2 },
  { lat: 12.9900, lng: 77.6150, weight: 6 },
];
```

### 2. **Test API Endpoint**

Use curl or Postman to test the backend endpoint:

```bash
curl -X GET "https://gauva-b7gaf7bwcwhqa0c6.canadacentral-01.azurewebsites.net/api/admin/analytics/heatmap?from=2024-10-23T00:00:00&to=2024-10-30T23:59:59" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. **Expected Behavior**
- Loading spinner displays while fetching data
- Heatmap renders with color-coded density
- Legend shows correct data point count
- Error messages display if API fails

## Performance Considerations

- **Data Limit**: For optimal performance, limit heatmap data to max 10,000 points
- **Caching**: Consider implementing backend caching for frequently accessed date ranges
- **Clustering**: For very dense data, consider server-side clustering
- **Lazy Loading**: Heatmap loads only when analytics page is visited

## Future Enhancements

Potential improvements:
1. ✅ Custom date range selection
2. ✅ Real-time data updates
3. ⬜ Export heatmap as image
4. ⬜ Zoom to specific zone on click
5. ⬜ Time-based animation (24-hour playback)
6. ⬜ Filter by ride status (completed, cancelled, etc.)
7. ⬜ Multiple heatmap layers (pickup vs dropoff)
8. ⬜ Cluster markers for dense areas

## Dependencies

- `@react-google-maps/api`: ^2.20.7 (already installed)
- Google Maps JavaScript API with Visualization Library
- Redux Toolkit for state management

## Security Notes

1. **API Key Protection**: Store Google Maps API key in environment variables
2. **API Key Restrictions**: Configure API key restrictions in Google Cloud Console
   - HTTP referrers for production domain
   - API restrictions to Maps JavaScript API only
3. **Admin Authentication**: Heatmap endpoint requires admin authentication
4. **Rate Limiting**: Consider implementing rate limiting on backend API

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all dependencies are installed
3. Ensure backend API endpoint is implemented
4. Review Redux DevTools for state issues

---

**Status**: ✅ Frontend Implementation Complete
**Next Step**: Implement backend API endpoint (if not already available)

