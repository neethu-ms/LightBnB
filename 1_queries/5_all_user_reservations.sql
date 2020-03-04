SELECT properties.*, reservations.*, AVG(property_reviews.rating) AS average_rating 
FROM reservations JOIN properties ON reservations.property_id = properties.id 
JOIN property_reviews ON property_reviews.property_id = properties.id 
WHERE reservations.end_date < now()::date AND reservations.guest_id = 1
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date 
LIMIT 10 ; 