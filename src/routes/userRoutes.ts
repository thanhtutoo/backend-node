import { Router } from "express";
import { UserController } from "../controllers/users.controller";
import { registerValidationRules, validate} from "../utils/Validator";

export class UserRoutes {

    router: Router;
    public userController: UserController = new UserController();

    constructor() {
        this.router = Router();
        this.routes();
    }
    routes() {
        // For TEST only ! In production, you should use an Identity Provider !!
        this.router.post("/register",registerValidationRules(), validate, this.userController.registerUser);
        // this.router.get("/:login/isLogin", this.userController.isLogin);
    }
}