import { NextFunction, Request, Response, Router } from "express";
import * as HttpStatus from "http-status-codes";
import { body, param, validationResult } from "express-validator/check";
import { getManager } from "typeorm";
import catchAsync from "../utils/catchAsync";

console.log(catchAsync);
// Import Entities
// import { Currency } from "../entities/currency.entity";
import { User } from "../entities/user.entity";

// Import Middlewares
import { AuthHandler } from "../middlewares/authHandler.middleware";

// Impoty Services
import { UserService } from "../services/users.service";
// import { CurrencyService } from "../services/currency.service";
// import { AdditionalService } from "../services/additionals.service";

// // Import Interfaces
import { IResponseError } from "../resources/interfaces/IResponseError.interface";


const auth = new AuthHandler();
const usersRouter: Router = Router();

export class UserController {
    public registerUser = catchAsync( async (req: Request , res: Response, next: NextFunction) => {
        const userService = new UserService();
        // const billService = new BillService();
        // const currencyService = new CurrencyService();
        // const additionalService = new AdditionalService();
        const validationErrors = validationResult(req);
        const isLogin: User = await userService.getByLogin(req.body.login);
        const isEmail: User = await userService.getByEmail(req.body.email);
        console.log(req.body);
        if (isLogin || isEmail || !validationErrors.isEmpty()) {
          const error: IResponseError = {
            success: false,
            code: HttpStatus.BAD_REQUEST,
            error: validationErrors.array()
          };
          return next(error);
        }
        try {
        //   const currencyId: number = req.body.currencyId;
        //   const currency: Currency = await currencyService.getById(currencyId);
          console.log("try p ");
          let user = new User();
          user.name = req.body.name;
          user.surname = req.body.surname;
          user.email = req.body.email;
          user.login = req.body.login;
          user.password = req.body.password;
          const userRepository = getManager().getRepository(User);
          user = userRepository.create(user);
          user = await userService.insert(user);
          console.log("abc");
          res.status(HttpStatus.OK).json({
            success: true
          });
        } catch (error) {
            console.log(error);
          const err: IResponseError = {
            success: false,
            code: HttpStatus.BAD_REQUEST,
            error
          };
          next(err);
        }
    });    

    public isLogin = async (req: Request , res: Response, next: NextFunction) => {
        const userService = new UserService();
        const validationErrors = validationResult(req);
        const login: string = req.params.login;

        if (!validationErrors.isEmpty()) {
        const err: IResponseError = {
            success: false,
            code: HttpStatus.BAD_REQUEST,
            error: validationErrors.array()
        };
        return next(err);
        }

        try {
        const user: User = await userService.getByLogin(login);

        if (user)
            return res.status(HttpStatus.OK).json({
            isLogin: true
            });

        res.status(HttpStatus.OK).json({
            isLogin: false
        });
        } catch (error) {
        const err: IResponseError = {
            success: false,
            code: HttpStatus.BAD_REQUEST,
            error
        };
        next(err);
        }
    }
}
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
