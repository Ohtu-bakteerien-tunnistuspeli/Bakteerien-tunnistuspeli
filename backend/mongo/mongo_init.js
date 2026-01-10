/* eslint-disable no-undef */
db.createUser({
  user: 'the_user',
  pwd: 'the_password',
  roles: [
    {
      db: 'test',
    },
  ],
})
