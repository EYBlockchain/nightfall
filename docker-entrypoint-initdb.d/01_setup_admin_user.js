this.db.createUser({
  user: 'admin',
  pwd: 'admin',
  roles: [
    { role: 'userAdmin', db: 'merkle_tree' },
    { role: 'dbAdmin', db: 'merkle_tree' },
    { role: 'readWrite', db: 'merkle_tree' },
  ],
});
