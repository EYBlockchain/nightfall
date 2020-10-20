/* eslint-disable */

var check = true
while (check) {
  try {
    sleep(3);
    var users = db.getUsers().map(data => data.user);
    if (users.indexOf('admin') === -1) {
      continue;
    };
    check = false;
  } catch (error) {

  }
  sleep(3);
}
