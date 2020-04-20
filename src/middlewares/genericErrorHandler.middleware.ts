import * as HttpStatus from "http-status-codes";
import { Request, Response, NextFunction } from "express";

import { Logger } from "../utils/logger";
import { any } from "bluebird";

/**
 * Generic error response middleware for internal server errors.
 *
 * @param  {any} err
 * @param  {Request} req
 * @param  {Response} res
 * @param  {NextFunction} next
 * @returns void
 */

module.exports.handleCastErrorDB =  async (error:any) => {
 console.log(error);

}
// const handleCastErrorDB = async( 
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction) => {
  


// }
//QueryFailedError
export class genericErrorHandlers {

  public handleCastErrorDB =  async (err:any, req: Request , res: Response, next: NextFunction) => {
    res.status(402).json({
      success: false,
      code: 402,
      message: "db error found"
    });
  }  
  public genericErrorHandler =  async (err:any, req: Request , res: Response, next: NextFunction) => {
    const logger = new Logger(__filename);
    logger.info(`Info: ${JSON.stringify(req.body)}`);
    logger.error(`Error: ${JSON.stringify(err)}`);
    console.log(err);
    const errCode = err.status || err.code || 500;
    let errorMsg = "";
    // let extractedErrors: Array<any> = [];
  
    // err.array().map(err => extractedErrors.push( err.param +':'+err.msg ))
    if (Array.isArray(err.error)) {
      errorMsg = err.error.map((e: any) => e.param + ": " + e.msg).toString();
    } else {
      errorMsg = err.error
        ? err.error.message + " " + (err.error.detail || "")
        : err.message;
    }
    console.log("err.name");
    console.log(err.error.name);
    console.log("err.name");
    if(err.error.name == "QueryFailedError"){
      return this.handleCastErrorDB(err, req , res, next);
    }
    res.status(errCode).json({
      success: false,
      code: errCode,
      message: errorMsg
    });
  };
  

}

// export default function genericErrorHandler(
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void {
//   const logger = new Logger(__filename);
//   logger.info(`Info: ${JSON.stringify(req.body)}`);
//   logger.error(`Error: ${JSON.stringify(err)}`);
//   console.log(err);
//   const errCode = err.status || err.code || 500;
//   let errorMsg = "";
//   // let extractedErrors: Array<any> = [];

//   // err.array().map(err => extractedErrors.push( err.param +':'+err.msg ))
//   if (Array.isArray(err.error)) {
//     errorMsg = err.error.map((e: any) => e.param + ": " + e.msg).toString();
//   } else {
//     errorMsg = err.error
//       ? err.error.message + " " + (err.error.detail || "")
//       : err.message;
//   }
//   console.log("err.name");
//   console.log(err.error.name);
//   console.log("err.name");
//   if(err.error.name == "QueryFailedError"){
//     return this.handleCastErrorDB("a");
//   }
//   res.status(errCode).json({
//     success: false,
//     code: errCode,
//     message: errorMsg
//   });
// }
// export function handleCastErrorDB (  


// }

