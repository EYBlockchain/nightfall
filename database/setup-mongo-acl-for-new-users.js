/* eslint-disable */

var existingRoles = db.getRoles().map(data => data.role);
var existingUsers = db.getUsers().map(data => data.user);

db.getCollectionNames().forEach(function(c){
  if (existingRoles.indexOf(c) !== -1) return;
  if (c.indexOf("_") === -1) return;

  var username = c.split('_')[0];
  if (existingUsers.indexOf(username) === -1) return;

  var dbName = db.toString();

  db.createRole({
    role: c,
    privileges: [{ resource: { db: dbName, collection: c }, actions: [ "find", "update", "insert" ] }],
    roles: []
  });

  db.grantRolesToUser(username, [{ "role" : c, "db" : dbName}]);
  db.revokeRolesFromUser(username, [{role: "read", "db": dbName}]);
});
