const getUserByEmail = function (email, database) {

  let emailExists;
  let storedUser;

  Object.values(database).some(function(user) {
    if(user.email === email) {
      emailExists = true;
      storedUser = user;
    }
  });

  if(emailExists) {
    return storedUser.id;
  }
  return null;
};


module.exports = {getUserByEmail}; 