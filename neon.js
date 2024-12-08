const { Neon } = require('@neondatabase/neon');

const neon = new Neon({
  user: 'neondb_owner',
  password: 'fqeLDvkp07Cd',
  host: 'ep-green-pond-a1i5140z-pooler.ap-southeast-1.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  ssl: true,
});

module.exports = neon;
