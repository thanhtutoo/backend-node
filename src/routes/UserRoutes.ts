import { Router } from "express";
import { UserController } from "../controllers/UserController";
// import { registerValidationRules, validate} from "../utils/Validator";
import { AuthHandler } from "../middlewares/AuthHandler";
import { VerifyRole } from "../middlewares/VerifyRole";
const auth = new AuthHandler();
const veryfyRole = new VerifyRole();
export class UserRoutes {

    router: Router;
    public userController: UserController = new UserController();

    constructor() {
        this.router = Router();
        this.routes();
    }
    routes() {
        // For TEST only ! In production, you should use an Identity Provider !!
        this.router.post("/register", this.userController.registerUser);
        this.router.post("/login", this.userController.loginUser);
        this.router.post("/admin-post",[auth.authenticate('basic'), veryfyRole.isAdmin ],this.userController.adminPost);
        // this.router.get("/:login/isLogin", this.userController.isLogin);
    }
}