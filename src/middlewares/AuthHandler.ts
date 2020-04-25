import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import passport from "passport";
import { BasicStrategy } from "passport-http";
import {
  ExtractJwt,
  Strategy as JWTStrategy,
  StrategyOptions
} from "passport-jwt";

import { Strategy } from "passport";
import { getRepository } from "typeorm";
import config from "../config/config";
import { User } from "../entities/User";
import { UserService } from "../services/UserService";
import { userInfo } from "os";
import { runInNewContext } from "vm";

const { auth, admin } = config;

export class AuthHandler {
  jwtOptions: StrategyOptions;
  superSecret = auth.secretKey;
  BasicStrategy: BasicStrategy;

  constructor() {
    this.jwtOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // HEADER: Authorization: bearer JSON_WEB_TOKEN_STRING.....
      secretOrKey: this.superSecret
    };
  }

  /**
   * initialize the Auth middleware & configure JWT strategy for Passport
   */
  initialize() {
    passport.use("jwt", this.getJWTStrategy());
    passport.use("basic", this.getBasicStategy());
    return passport.initialize();
  }

  /**
   * configure & return the JWT strategy for passport
   */
  getJWTStrategy(): Strategy {
    return new JWTStrategy(this.jwtOptions, async (jwt_payload, next) => {
      const userService = new UserService();

      try {
        const user = await userService.getById(jwt_payload.id);

        // if user not found for this id
        if (!user) {
          console.log("ma tway pu");
          return next(null, false);
        }

        // authentication passed
        return next(undefined, {
          id: user.id
        });
      } catch (err) {
        return next(null, false);
      }
    });
  }

  getBasicStategy(): Strategy {
    return new BasicStrategy(async (username, password, next)=> {

      getRepository(User).findOneOrFail({username:username},{relations: ["roles"]})
      .then(async userInfo => {
      const isPasswordCorrect:boolean = await bcrypt.compare(
          password,
          userInfo.password
        );
      if (!isPasswordCorrect){
        next({message:"password_incorrect"});
      } else{
        console.log("passed");
        next(null, {
          id: userInfo.id, role:userInfo.roles
        });
      }
      }).catch(err => {
        next({err,message:"user_not_found"});
      });
    });
  }

  /**
   * Authentication handler. Call this on routes needs authentication
   */
  authenticate(option: string) {
    if (option === "jwt") {
      return passport.authenticate("jwt", {
        session: false,
        failWithError: true
      });
    }

    if (option === "basic") {
      return passport.authenticate("basic", {
        session: false
      });
    }
  }

  /**
   * Generate JWT token.
   * @param user
   */
  generateToken(user: User): string {
    const token = jwt.sign(
      {
        id: user.id
      },
      this.superSecret,
      {
        expiresIn: "5d"
      }
    );

    return token;
  }
}
