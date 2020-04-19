import {body, query, validationResult } from "express-validator";
import {Request,Response,NextFunction} from "express";
export function registerValidationRules () {
  return [
    body('login').exists().withMessage('required!'),
    body('email').exists().withMessage('required!'),

  ]
}

export function teacherValidationRules () {
  return [
    query('teacher').exists().withMessage('required!'),

  ]
}

export function studentValidationRules () {
  return [
    body('student').exists().withMessage('required!'),

  ]
}

export function notificationValidationRules () {
  return [
    body('teacher').exists().withMessage('required!'),
    body('notification').exists().withMessage('required!'),

  ]
}

export function validate (req: Request, res: Response, next: NextFunction) {
  const err = validationResult(req)
  if (err.isEmpty()) {
    return next()
  }
  // const extractedErrors = [];
  let extractedErrors: Array<any> = [];

  err.array().map(err => extractedErrors.push( err.param +':'+err.msg ))
  // console.log(extractedErrors);
  let message: any = {message:extractedErrors};
  next(message);

}
