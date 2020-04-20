import "mocha";

import chai from "chai";
import chaiHttp = require("chai-http");

chai.use(chaiHttp);
const should = chai.should();
import * as app from "./helpers/tests-helper";

const userToRegister = {
  name: "Adrian",
  surname: "Pietrzak",
  email: "adrian@pietrzak.com",
  login: 865321352216,
  password: "1234",
  currencyId: 2
};

describe("Register", () => {
  describe("POST /api/users/register", () => {
    it("should not able to register a user without name in body", done => {
      const tmpUser = Object.assign({}, userToRegister);
      delete tmpUser.name;
      // done();
      console.log(app);
      chai
        .request(app)
        .post("/api/users/register")
        .send(tmpUser)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.success.should.equal(false);
          done();
        });
    });
  });
});
