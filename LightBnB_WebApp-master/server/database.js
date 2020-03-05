const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});
const properties = require('./json/properties.json');
const users = require('./json/users.json');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool.query(`SELECT * FROM users where email = $1`,[email]).then((user) => {
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
  return pool.query(`SELECT * FROM users where id = $1`,[id]).then((user) => {
    
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
const addUser =  function(user) {
  return pool.query(`INSERT INTO users(name, email,password) values($1,$2,$3) returning *`,[user.name,user.email,user.password]).then(user => user.rows);
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool.query(`SELECT properties.*, reservations.*, AVG(property_reviews.rating) AS average_rating 
FROM reservations JOIN properties ON reservations.property_id = properties.id 
JOIN property_reviews ON property_reviews.property_id = properties.id 
WHERE reservations.end_date < now()::date AND reservations.guest_id = $1
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date 
LIMIT $2 ;`,[guest_id, limit]).then(res => res.rows);
  
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
  /* return pool.query(
    `SELECT * FROM properties LIMIT $1`,[limit]).then(res => res.rows)
    .catch(err => console.error('query error', err.stack)); */
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
      console.log('minimum',Number(options.minimum_price_per_night));
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

  if (options.minimum_rating) {
    if (queryParams.length > 0) {
      queryParams.push(Number(options.minimum_rating));
      queryString += ` AND rating >= $${queryParams.length}`;
    } else {
      queryParams.push(Number(options.minimum_rating));
      queryString += `WHERE rating >= $${queryParams.length}`;
    }
  }

  if (options.owner_id) {
    if (queryParams.length > 0) {
      queryParams.push(Number(options.owner_id));
      queryString += ` AND owner_id LIKE $${queryParams.length}`;
    } else {
      queryParams.push(Number(options.owner_id));
      queryString += `WHERE owner_id LIKE $${queryParams.length}`;
    }
  }

  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams)
    .then(res => res.rows);

};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
