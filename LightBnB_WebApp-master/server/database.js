const db = require('./db');
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return db.query(`SELECT * FROM users where email = $1`, [email]).then((user) => {
    console.log(user.rows[0]);
    if (user.rows.length === 0) {
      return null;
    }
    return user.rows[0];
  });

};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  //return Promise.resolve(users[id]);
  return db.query(`SELECT * FROM users where id = $1`, [id]).then((user) => {

    if (user.rows.length === 0) {
      return null;
    }
    return user.rows;
  });

};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  return db.query(`INSERT INTO users(name, email,password) values($1,$2,$3) returning *`, [user.name, user.email, user.password]).then(user => user.rows);
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return db.query(`SELECT properties.*, reservations.*, AVG(property_reviews.rating) AS average_rating 
FROM reservations JOIN properties ON reservations.property_id = properties.id 
JOIN property_reviews ON property_reviews.property_id = properties.id 
WHERE reservations.end_date < now()::date AND reservations.guest_id = $1
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date 
LIMIT $2 ;`, [guest_id, limit]).then(res => res.rows);

};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {

    if (queryParams.length > 0) {
      queryParams.push(Number(options.minimum_price_per_night));
      queryString += ` AND cost_per_night/100 > $${queryParams.length}`;
    } else {
      console.log('minimum', Number(options.minimum_price_per_night));
      queryParams.push(options.minimum_price_per_night);
      queryString += `WHERE cost_per_night/100 > $${queryParams.length}`;
    }
  }

  if (options.maximum_price_per_night) {
    if (queryParams.length > 0) {
      queryParams.push(Number(options.maximum_price_per_night));
      queryString += ` AND cost_per_night/100 < $${queryParams.length}`;
    } else {
      queryParams.push(Number(options.minimum_price_per_night));
      queryString += `WHERE cost_per_night/100 < $${queryParams.length}`;
    }
  }

  if (options.owner_id) {
    if (queryParams.length > 0) {
      queryParams.push(Number(options.owner_id));
      queryString += ` AND owner_id = $${queryParams.length}`;
    } else {
      queryParams.push(Number(options.owner_id));
      queryString += `WHERE owner_id = $${queryParams.length}`;
    }
  }
  // 4

  queryString += `
  GROUP BY properties.id`;

  if (options.minimum_rating) {
    queryParams.push(Number(options.minimum_rating));
    queryString += ` HAVING avg(property_reviews.rating) >= $${queryParams.length}`;
  }
  queryParams.push(limit);
  queryString += ` ORDER BY cost_per_night
  LIMIT $${queryParams.length};`;

  // 5
  console.log(queryString, queryParams);

  // 6
  return db.query(queryString, queryParams)
    .then(res => res.rows);

};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
 
  return db.query(`INSERT INTO properties(owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code,
  country, parking_spaces, number_of_bathrooms, number_of_bedrooms) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) returning *`,  [property.owner_id,
    property.title, property.description,property.thumbnail_photo_url, property.cover_photo_url,Number(property.cost_per_night),property.street, property.city,
  property.province, property.post_code, property.country, Number(property.parking_spaces), Number(property.number_of_bathrooms), Number(property.number_of_bedrooms)]).then(propertyValue => propertyValue.rows);
};
exports.addProperty = addProperty;
