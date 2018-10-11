import "mocha";
import chai from "chai";
import sinon from "sinon";

import { User } from "../models";
import * as userController from "../controllers/userController";

chai.should();

describe("userController", () => {
  describe("createUser", () => {
    it("should create a user properly", async () => {
      const {
        successfullyCreatedUser,
        generatedPassword
      } = await userController.createUser("testuser", "testuser@domain.com");

      successfullyCreatedUser.should.equal(true);
      generatedPassword.length.should.equal(24);
    });

    it("should handle an exception during user creation", async () => {
      const userCreateStub = sinon.stub(User, "create").throws();

      console.log(User.create);
      const { successfullyCreatedUser } = await userController.createUser(
        "test",
        "test"
      );
      successfullyCreatedUser.should.equal(false);

      userCreateStub.restore();
    });
  });
});
