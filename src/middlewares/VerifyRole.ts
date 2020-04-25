import { Request, Response, NextFunction } from "express";
import {getRepository} from "typeorm";
import {Role} from "../entities/Role";

export class VerifyRole{

	public isAdmin = function (req: Request, res: Response, next:NextFunction) {
	const roleArr = req.user.role;
	const checkAdmin = roleArr.map(function(e:any) { return e.name; }).indexOf('Admin');
	if(checkAdmin >= 0){
		return next();
	}else{
		return next({message:"Require admin role",status:403});
	}
}

// function isManager(req: Request, res: Response, next:NextFunction) {
// 	const roleArr = req.user.role;
// 	const checkManager = roleArr.map(function(e:any) { return e.name; }).indexOf('Manager');
// 	if(checkManager >= 0){
// 		return next();
// 	}else{
// 		return next({message:"Require Manager role",status:403});
// 	}
// }

// function isClient(req: Request, res: Response, next:NextFunction) {
// 	const roleArr = req.user.role;
// 	const checkClient = roleArr.map(function(e:any) { return e.name; }).indexOf('Client');
// 	if(checkClient >= 0){
// 		return next();
// 	}else{
// 		return next({message:"Require Client role",status:403});
// 	}
// }

// function isAdminOrManager(req: Request, res: Response, next:NextFunction) {
// 	const roleArr = req.user.role;
// 	const checkManager = roleArr.map(function(e:any) { return e.name; }).indexOf('Manager');
// 	const checkAdmin = roleArr.map(function(e:any) { return e.name; }).indexOf('Admin');
// 	if(checkManager >= 0 || checkAdmin >= 0){
// 		return next();
// 	}else{
// 		return next({message:"Require admin or Manager role",status:403});
// 	}
// }
}
