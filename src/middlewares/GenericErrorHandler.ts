import * as HttpStatus from "http-status-codes";
import { Request, Response, NextFunction } from "express";

import { Logger } from "../utils/logger";
import { any } from "bluebird";

import ResponseFormat from "../utils/ResponseFormat";

/**
 * Generic error response middleware for internal server errors.
 *
 * @param  {any} err
 * @param  {Request} req
 * @param  {Response} res
 * @param  {NextFunction} next
 * @returns void
 */
export class GenericErrorHandlers {

  public handleCastErrorDB = async (err: any, req: Request , res: Response, next: NextFunction) => {
    const errCode = err.status || 500;
    const data = {message:"db_error_found"};
    res.status(errCode).json(ResponseFormat.error(data));
  }

  public genericErrorHandler = async (err: any, req: Request , res: Response, next: NextFunction) => {
    const logger = new Logger(__filename);
    logger.info(`Info: ${JSON.stringify(req.body)}`);
    logger.error(`Error: ${JSON.stringify(err)}`);
    console.log(err.error);
    console.log("err.error");
    console.log(err.name);
    const errCode = err.status || 500;
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
    
    if (err.name === "QueryFailedError") {
      return this.handleCastErrorDB(err, req , res, next);
    }
    const data = {message:errorMsg};
    res.status(errCode).json(ResponseFormat.error(data));
    // res.status(errCode).json({
    //   success: false,
    //   time: new Date().toLocaleString(),
    //   code: errCode,
    //   message: errorMsg
    // });
  }


}


