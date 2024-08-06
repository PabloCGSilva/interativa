const { DataSource } = require('typeorm');
const { User } = require('./dist/auth/entities/user.entity');
const dotenv = require('dotenv');

dotenv.config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [User],
    migrations: ['./dist/src/migrations/*.js'],
    synchronize: false,
});

console.log("Database Configuration:");
console.log("Host:", process.env.DATABASE_HOST);
console.log("Port:", process.env.DATABASE_PORT);
console.log("Username:", process.env.DATABASE_USER);
console.log("Password:", process.env.DATABASE_PASSWORD);
console.log("Database:", process.env.DATABASE_NAME);

AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((err) => {
        console.error('Error during Data Source initialization:', err);
    });

module.exports = AppDataSource;
