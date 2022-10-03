export default {
  entities: ['./dist/entities/*.js'],
  entitiesTs: ['./src/entities/*.ts'],
  dbName: 'db-concurrency-control-demo',
  type: 'mysql',
  user: 'user',
  password: '',
  migrations: {
    path: process.cwd() + '/migrations'
  },
};