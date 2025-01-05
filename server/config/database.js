const Pool = require("pg").Pool;
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "PcomESLy05@",
  database: "MyNetworth",
  logging: false,
});

module.exports = sequelize;
