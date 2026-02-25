package com.core_server.sals.service;


import org.springframework.stereotype.Service;

@Service
public class GeofencingService {

    // ALLOWED RADIUS in meters (e.g., 50 meters around the class)
    private static final double ALLOWED_RADIUS_METERS = 900.0;


    private static final double CLASS_LAT = 31.25567003530153;
    private static final double CLASS_LNG = 75.70475791210389;

//
//    private static final double CLASS_LAT = 31.255255092082944;
//    private static final double CLASS_LNG = 75.70322245141388;

    /**
     * Returns TRUE if student is inside the radius.
     */
    public boolean isWithinRange(double studentLat, double studentLng) {
        double distance = calculateDistance(CLASS_LAT, CLASS_LNG, studentLat, studentLng);
//        System.out.println("Distance Calculated: " + distance + " meters"); // For Debugging
        return distance <= ALLOWED_RADIUS_METERS;
    }

    // Haversine Formula Implementation
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c * 1000; // Convert to meters

        return distance;
    }
}