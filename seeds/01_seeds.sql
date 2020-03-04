INSERT INTO users(name, email, password) 
VALUES ('Tom', 'tom@gmail.com','$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'),
('John', 'john@gmail.com','$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'),
('Alice', 'alice@gmail.com','$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'),
('Sam', 'sam@gmail.com','$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'),
('Henry', 'henry@gmail.com','$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u');

INSERT INTO properties(owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms,  
country, street, city, province, post_code, active) 
VALUES (1,'Speed lamp','description','image1.png','image11.png', 85234, 6, 6, 7, 'Canada', '651 Nami Road', 
'Bohbatev','Alberta', 83680, true),
 (1,'Habit mix','description','image1.png','image11.png', 85234, 6, 6, 7, 'Canada', '651 Nami Road', 
'Bohbatev','Alberta', 83680, true),
(2,'Headed know','description','image1.png','image11.png', 85234, 6, 6, 7, 'Canada', '651 Nami Road', 
'Bohbatev','Alberta', 83680, true);

INSERT INTO reservations(start_date, end_date, property_id, guest_id) 
VALUES ('2018-09-11', '2018-09-26', 2, 3),
('2019-01-04', '2019-02-01', 2, 2),
('2021-10-01', '2021-10-14', 1, 1);

INSERT INTO property_reviews(guest_id, property_id, reservation_id, rating, message)
VALUES (2, 1, 1, 3, 'messages'),
(1, 1, 1, 3, 'messages'),
(3, 1, 1, 3, 'messages');