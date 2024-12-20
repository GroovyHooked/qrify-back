const request = require("supertest");
const app = require("./app");
const mongoose = require("mongoose");
const User = require("./models/users");
const connectionString = process.env.CONNECTION_STRING;

describe("POST/auth/signup", () => {
  beforeAll(async () => {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });
  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await mongoose.connection.close();
  });

  it("teste de la réception de la requête du Front-end vers le backend et la BDD /signup", async () => {
    const res = await request(app).post("/auth/signup").send({
      lastname: "Dupont",
      firstname: "Nicole",
      company: "Pamris-nous",
      email: "nicole@gmail.com",
      password: "1234",
    });

    expect(res.body.result).toBe(true); // vérifie le résultat de la res.json si user est bien présent
    expect(res.body.email).toBe("nicole@gmail.com"); // Vérifie que toutes les données receptionnées de user sont bien présentent
    expect(res.statusCode).toBe(200); // vérifie que le fichier est bien save en BDD
  });
});
