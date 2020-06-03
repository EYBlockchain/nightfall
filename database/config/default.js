module.exports = {
  mongo: {
    host: process.env.MONGO_HOST,
    port: process.env.MONGO_PORT,
    databaseName: process.env.MONGO_NAME,
    admin: process.env.MONGO_USERNAME,
    adminPassword: process.env.MONGO_PASSWORD,
  },
  isLoggerEnable: true,
};
