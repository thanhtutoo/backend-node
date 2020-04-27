import * as HttpStatus from "http-status-codes";
import { Request, Response, NextFunction } from "express";

import { Logger } from "../utils/logger";
import { any } from "bluebird";

import ResponseFormat from "../utils/ResponseFormat";
import { AuthPermission, getPermission } from "../middlewares/PermissionModule/PermissionHandler";
import { runInNewContext } from "vm";


export default function permissionAccess (isOwnerOrMember: boolean, action: string, resource: string) {
        return async (req: Request, res: Response, next: NextFunction) => {
          try {
            console.log("ggwp");
            // const permission = roles.can(req.user.role)[action](resource);
            const permission: AuthPermission = await getPermission(req.user, isOwnerOrMember, action, resource);
            console.log(permission.granted);
            console.log("permission.granted");
            if (permission.granted === false && req.user.role != "Admin") {
              return res.status(401).json({
                error: "You don't have enough permission to perform this action"
              });
            }
            next()
          } catch (error) {
            next(error)
          }
        }
};
