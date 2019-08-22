/* eslint-disable */

var existingRole = db.getRoles().map(data => data.role);

db.getCollectionNames().forEach(function(c){
  if (existingRole.indexOf(c) !== -1) return;
  if (c.indexOf("_") === -1) return;

  var username = c.split('_')[0];
  var dbName = db.toString();

  db.createRole({
    role: c,
    privileges: [{ resource: { db: dbName, collection: c }, actions: [ "find", "update", "insert" ] }],
    roles: []
  });

  db.grantRolesToUser(username, [{ "role" : c, "db" : dbName}]);
  db.revokeRolesFromUser(username, [{role: "read", "db": dbName}]);
});
