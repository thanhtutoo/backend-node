import bcrypt from "bcryptjs";
import { NextFunction, Request, Response, Router } from "express";
import * as HttpStatus from "http-status-codes";
// import { body, param, validationResult } from "express-validator/check";
import { getManager, getRepository, AdvancedConsoleLogger } from "typeorm";
// import catchAsync from "../utils/catchAsync";
import asyncWrapper from "async-wrapper-express-ts";
// console.log(catchAsync);
// Import Entities
// import { Currency } from "../entities/currency.entity";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
// Import Middlewares
import { AuthHandler } from "../middlewares/AuthHandler";

// Impoty Services
import { UserService } from "../services/UserService";
// import { CurrencyService } from "../services/currency.service";
// import { AdditionalService } from "../services/additionals.service";

// // Import Interfaces
import { IResponseError } from "../resources/interfaces/IResponseError";
import ResponseFormat from "../utils/ResponseFormat";


const auth = new AuthHandler();
const usersRouter: Router = Router();

export class UserController {
    public registerUser = asyncWrapper( async (req: Request , res: Response, next: NextFunction) => {
        const userService = new UserService();
        // const roleService = new UserService();
        let user = new User();
        // let role1 = new Role();
        const role = await getRepository(Role).findOne({
            name: req.body.role
        });
        user.name = req.body.name;
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = req.body.password;
        user.is_active = 1;
        user.roles = [role];
        // const userRepository = getManager().getRepository(User);
        // user = userRepository.create(user);
        user = await userService.insert(user);

        const data = {user};
        res.status(HttpStatus.OK).json(ResponseFormat.success(data));

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
    public adminPost = asyncWrapper( async (req: Request , res: Response, next: NextFunction) => {
      console.log("admin Post");
    
    })
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
