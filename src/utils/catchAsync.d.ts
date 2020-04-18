import {Request, Response, NextFunction, RequestHandler} from "express";

declare function catchAsync(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>
): RequestHandler;

export = catchAsync;