import bcrypt from "bcryptjs";
import { NextFunction, Request, Response, Router } from "express";
import * as HttpStatus from "http-status-codes";
// import { body, param, validationResult } from "express-validator/check";
import { getManager, getRepository, AdvancedConsoleLogger } from "typeorm";
// import catchAsync from "../utils/catchAsync";
import asyncWrapper from "async-wrapper-express-ts";
// Import Entities
import { User } from "../entities/User";
import { Role } from "../entities/Role";
// Import Middlewares
import { AuthHandler } from "../middlewares/AuthHandler";
// Impoty Services
import { UserService } from "../services/UserService";
// Import Response API Format
import ResponseFormat from "../utils/ResponseFormat";

import { ActivityType, ActorType, ObjectType } from "../middlewares/PermissionModule/ActivityStreamInterface";
import { AuthPermission, getPermission } from "../middlewares/PermissionModule/PermissionHandler";

// const auth = new AuthHandler();
// const usersRouter: Router = Router();

export class AuthController {
    public registerUser = asyncWrapper( async (req: Request , res: Response, next: NextFunction) => {
        const userService = new UserService();
        let user = new User();
        const role = await getRepository(Role).findOne({
            name: req.body.role
        });
        console.log(role);
        user.name = req.body.name;
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = req.body.password;
        user.is_active = 1;
        user.roles = [role];
        // const userRepository = getManager().getRepository(User);
        // user = userRepository.create(user);
        user = await userService.insert(user);
        // const data = {user};
        res.status(HttpStatus.OK).json(ResponseFormat.success(user));

    });

    public loginUser = asyncWrapper( async (req: Request, res: Response, next: NextFunction) => {
        const userService = new UserService();
        const authHandler = new AuthHandler();
        const user: User = await userService.getByLogin(req.body.username);

        const isPasswordCorrect: boolean = await bcrypt.compare(
          req.body.password,
          user.password
        );
        if (!user || !isPasswordCorrect || user.is_active === 0) {
          if (!isPasswordCorrect) await userService.setLastFailedLoggedDate(user);
          console.log(user.is_active);
          console.log("gg")
          return next({message:user.is_active === 0?"user_is_not_activated":"password_incorrect",status:401});
        }
        try {
          await userService.setLastPresentLoggedDate(user);
          const token: string = authHandler.generateToken(user);
          const data: object = {access_token:token,expires_in:432000,token_type:"Bearer"};
          res.status(HttpStatus.OK).json(ResponseFormat.success(data));
        } catch (error) {
          next(error);
        }
    })

    public testingAuth = asyncWrapper( async (req: any , res: Response, next: NextFunction) => {
      // console.log("req.id");
      // console.log(req);
      // console.log(req);
      // console.log("req");
      console.log("ok");
      // const resource: string = "users";
      // const isOwnerOrMember: boolean = true;
      // const action: string = ActivityType.READ;
      // // const user = await getRepository(User).findOne({
      // //   username: "manager"},{
      // //     relations: ["roles"]
      // // });
      // // console.log(user);
      // const permission: AuthPermission = await getPermission(req.user, isOwnerOrMember, action, resource);
      // console.log(permission.granted);
      // console.log("permission.granted");
    });

    // public adminPost = asyncWrapper( async (req: any , res: Response, next: NextFunction) => {
    //   const user = await getRepository(User).findOne({
    //     username: "manager"
    //   });
    //   // const ability = defineAbilitiesFor(user)
    //   // ability.can('read', 'Role');
    //   console.log("admin Post");
    //   console.log(req.ability);
    //   console.log("req.abilit");
    //   console.log("req.ability");
    //   // console.log(req.ability.throwUnlessCan());
    //   console.log(user);
    //   // console.log(req.ability.can('update', user));
    //   console.log(ForbiddenError.from(req.ability).throwUnlessCan('read', "Post"));
    //   ForbiddenError.from(req.ability).throwUnlessCan('update', user)
    //   // req.ability.throwUnlessCan('read', role);
    //   console.log("admin post 2");
    // })
}
    // public isLogin = asyncWrapper( async (req: Request , res: Response, next: NextFunction) => {
    //     const userService = new UserService();
    //     // const validationErrors = validationResult(req);
    //     const username: string = req.params.username;

    //     // if (!validationErrors.isEmpty()) {
    //     // const err: IResponseError = {
    //     //     success: false,
    //     //     code: HttpStatus.BAD_REQUEST,
    //     //     error: validationErrors.array()
    //     // };
    //     // return next(err);
    //     // }

    //     try {
    //     const user: User = await userService.getByLogin(login);

    //     if (user)
    //         return res.status(HttpStatus.OK).json({
    //         isLogin: true
    //         });

    //     res.status(HttpStatus.OK).json({
    //         isLogin: false
    //     });
    //     } catch (error) {
    //     const err: IResponseError = {
    //         success: false,
    //         code: HttpStatus.BAD_REQUEST,
    //         error
    //     };
    //     next(err);
    //     }
    // });
// }
// /**
//  * Checks whether the login already exists
//  *
//  * @Method GET
//  * @URL /api/users/:login/isLogin/
//  *
//  */
// usersRouter
//   .route("/:login/isLogin")

//   .get(
//     [
//       param("login")
//         .exists()
//         .isNumeric()
//         .isLength({ min: 1, max: 20 })
//     ],

//     async (req: Request, res: Response, next: NextFunction) => {
//       const userService = new UserService();
//       const validationErrors = validationResult(req);
//       const login: string = req.params.login;

//       if (!validationErrors.isEmpty()) {
//         const err: IResponseError = {
//           success: false,
//           code: HttpStatus.BAD_REQUEST,
//           error: validationErrors.array()
//         };
//         return next(err);
//       }

//       try {
//         const user: User = await userService.getByLogin(login);

//         if (user)
//           return res.status(HttpStatus.OK).json({
//             isLogin: true
//           });

//         res.status(HttpStatus.OK).json({
//           isLogin: false
//         });
//       } catch (error) {
//         const err: IResponseError = {
//           success: false,
//           code: HttpStatus.BAD_REQUEST,
//           error
//         };
//         next(err);
//       }
//     }
//   );

// /**
//  * Checks whether the email already exists
//  *
//  * @Method GET
//  * @URL /api/users/:email/isEmail
//  *
//  */
// usersRouter
//   .route("/:email/isEmail")

//   .get(
//     [
//       param("email")
//         .exists()
//         .isEmail()
//         .isLength({ min: 1, max: 255 })
//     ],

//     async (req: Request, res: Response, next: NextFunction) => {
//       const userService = new UserService();
//       const validationErrors = validationResult(req);
//       const email: string = req.params.email;

//       if (!validationErrors.isEmpty()) {
//         const err: IResponseError = {
//           success: false,
//           code: HttpStatus.BAD_REQUEST,
//           error: validationErrors.array()
//         };
//         return next(err);
//       }

//       try {
//         const user: User = await userService.getByEmail(email);

//         if (user)
//           return res.status(HttpStatus.OK).json({
//             isEmail: true
//           });

//         res.status(HttpStatus.OK).json({
//           isEmail: false
//         });
//       } catch (error) {
//         const err: IResponseError = {
//           success: false,
//           code: HttpStatus.BAD_REQUEST,
//           error
//         };
//         next(err);
//       }
//     }
//   );

// /**
//  * Returns basic data about the user
//  *
//  * @Method GET
//  * @URL /api/users
//  *
//  */
// usersRouter
//   .route("/")

//   .get(
//     auth.authenticate("jwt"),

//     async (req: Request, res: Response, next: NextFunction) => {
//       const userService = new UserService();

//       try {
//         const userId: number = req.user.id;
//         const user: User = await userService.getById(userId);

//         if (user) {
//           res.status(HttpStatus.OK).json({
//             name: user.name,
//             surname: user.surname,
//             email: user.email,
//             createdDate: user.createdDate,
//             lastSuccessfulLoggedDate: user.lastSuccessfulLoggedDate,
//             lastPresentLoggedDate: user.lastPresentLoggedDate,
//             lastFailedLoggedDate: user.lastFailedLoggedDate
//           });
//         }
//       } catch (error) {
//         const err: IResponseError = {
//           success: false,
//           code: HttpStatus.BAD_REQUEST,
//           error
//         };
//         next(err);
//       }
//     }
//   );

// /**
//  * Returns update user's basic informations
//  *
//  * @Method PATCH
//  * @URL /api/users
//  *
//  */
// usersRouter
//   .route("/")

//   .patch(
//     [
//       body("name")
//         .optional({ nullable: true })
//         .isString()
//         .isAlpha()
//         .isLength({ min: 1 }),
//       body("surname")
//         .optional({ nullable: true })
//         .isString()
//         .isAlpha()
//         .isLength({ min: 1 }),
//       body("email")
//         .optional({ nullable: true })
//         .isEmail(),
//       body("password")
//         .optional({ nullable: true })
//         .isLength({ min: 1 }),
//       body("currencyId")
//         .optional({ nullable: true })
//         .isNumeric()
//     ],
//     auth.authenticate("jwt"),

//     async (req: Request, res: Response, next: NextFunction) => {
//       const userService = new UserService();
//       const currencyService = new CurrencyService();
//       const additionalService = new AdditionalService();
//       const validationErrors = validationResult(req);

//       if (!validationErrors.isEmpty()) {
//         const err: IResponseError = {
//           success: false,
//           code: HttpStatus.BAD_REQUEST,
//           error: validationErrors.array()
//         };
//         return next(err);
//       }

//       try {
//         const user: User = await userService.getById(req.user.id);

//         if (req.body.name) user.name = req.body.name;
//         if (req.body.surname) user.surname = req.body.surname;
//         if (req.body.password) await user.setPassword(req.body.password);

//         if (req.body.email) {
//           const isEmail: User = await userService.getByEmail(req.body.email);
//           if (!isEmail) user.email = req.body.email;
//           else {
//             const err: IResponseError = {
//               success: false,
//               code: HttpStatus.BAD_REQUEST,
//               error: validationErrors.array()
//             };
//             return next(err);
//           }
//         }

//         if (req.body.currencyId) {
//           const userCurrency: Currency = await currencyService.getByUser(user);
//           const newCurrency: Currency = await currencyService.getById(
//             req.body.currencyId
//           );

//           if (req.body.currencyId !== userCurrency.id) {
//             await currencyService.setExchangeRate(user, newCurrency);
//             await currencyService.setCurrency(user, newCurrency);
//             await additionalService.setWidgetStatus(user);
//           } else {
//             const err: IResponseError = {
//               success: false,
//               code: HttpStatus.BAD_REQUEST,
//               error: validationErrors.array()
//             };
//             return next(err);
//           }
//         }

//         await userService.update(user);

//         res.status(HttpStatus.OK).json({
//           success: true
//         });
//       } catch (error) {
//         const err: IResponseError = {
//           success: false,
//           code: HttpStatus.BAD_REQUEST,
//           error
//         };
//         next(err);
//       }
//     }
//   );

// export default usersRouter;
