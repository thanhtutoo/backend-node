import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
// import { registerValidationRules, validate} from "../utils/Validator";
import { AuthHandler } from "../middlewares/AuthHandler";
import { VerifyRole } from "../middlewares/VerifyRole";
import { NextFunction, Request, Response } from "express";
import { ActivityType, ActorType, ObjectType } from "../middlewares/PermissionModule/ActivityStreamInterface";
import { AuthPermission, getPermission } from "../middlewares/PermissionModule/PermissionHandler";
import  permissionAccess from "../middlewares/GrantAccess";
import { runInNewContext } from "vm";

const auth = new AuthHandler();
// const ga = new GrantAccess();
const veryfyRole = new VerifyRole();

export class AuthRoutes {

    router: Router;
    public authController: AuthController = new AuthController();

    constructor() {
        this.router = Router();
        this.routes();

    }
    routes() {
        // For TEST only ! In production, you should use an Identity Provider !!
        this.router.post("/register", this.authController.registerUser);
        this.router.post("/login", this.authController.loginUser);
        // this.router.post("/admin-post",[auth.authenticate('basic'), veryfyRole.isAdmin ],this.userController.adminPost);
        // this.router.post("/admin-post",[auth.authenticate('basic'),accessAbility.createAbilities ],this.userController.adminPost);
        const resource: string = "users";
        const isOwnerOrMember: boolean = true;
        const action: string = ActivityType.READ;
        // this.router.post("/admin-post",[auth.authenticate('basic'),ga.GrantAccess(req.user, isOwnerOrMember, action, resource) ],this.authController.testingAuth);
        this.router.post("/admin-post",[auth.authenticate('basic'), permissionAccess(true, "read", "users") ],this.authController.testingAuth);
        // this.router.post("/admin-post",[auth.authenticate('basic'), grantAccess() ],this.authController.testingAuth);
        // this.router.get("/:login/isLogin", this.userController.isLogin);
    }
}