this.db.createUser({
  user: 'admin',
  pwd: 'admin',
  roles: [
    { role: 'userAdmin', db: 'nightfall' },
    { role: 'dbAdmin', db: 'nightfall' },
    { role: 'readWrite', db: 'nightfall' },
  ],
});
