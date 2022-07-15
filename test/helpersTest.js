const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    assert.deepEqual(getUserByEmail("user@example.com", testUsers), "userRandomID");
    // Write your assert statement here
  });
});
describe('getUserByEmail', function() {
  it('should return "null" with an invalid email', function() {;
    assert.deepEqual(getUserByEmail("test@example.com", testUsers), null);
    // Write your assert statement here
  });
});
