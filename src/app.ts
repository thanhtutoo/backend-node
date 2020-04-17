import "reflect-metadata";
import bodyParser from "body-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { createConnection, getManager } from "typeorm";
import config from "./config/config";
import routes from "./routes";
import cron from "cron";
import differenceInYears from "date-fns/difference_in_years";

// // Import Services
// import { AdditionalService } from "./services/additionals.service";
// import { UserService } from "./services/users.service";
// import { CurrencyService } from "./services/currency.service";
// import { BillService } from "./services/bills.service";
// import { LanguageService } from "./services/languages.service";
// import { ConfigService } from "./services/config.service";
// import { TemplateService } from "./services/templates.service";

// // Import Entities
// import { Currency } from "./entities/currency.entity";
// import { User } from "./entities/user.entity";
// import { Bill } from "./entities/bill.entity";
// import { Additional } from "./entities/additional.entity";
// import { Language } from "./entities/language.entity";
// import { Config } from "./entities/config.entity";
// import { Template } from "./entities/template.entity";

// Import Utils
// import * as swaggerDocument from "./utils/swagger/swagger.json";
import { Logger, ILogger } from "./utils/logger";

// Import Crons
// import { CurrencyCron } from "./crons/currency.cron";

// Import Middlewares
import { AuthHandler } from "./middlewares/authHandler.middleware";
import genericErrorHandler from "./middlewares/genericErrorHandler.middleware";
import nodeErrorHandler from "./middlewares/nodeErrorHandler.middleware";
import notFoundHandler from "./middlewares/notFoundHandler.middleware";

export class Application {
  app: express.Application;
  config = config;
  logger: ILogger;
  CronJob = cron.CronJob;

  constructor() {
    this.logger = new Logger(__filename);
    this.app = express();

    this.app.use(require("express-status-monitor")());
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(
      morgan("dev", {
        skip: () => process.env.NODE_ENV === "test"
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(new AuthHandler().initialize());

    this.app.use("/api", routes);
    // this.app.use(
    //   "/api-docs",
    //   swaggerUi.serve,
    //   swaggerUi.setup(swaggerDocument)
    // );
    this.app.use(genericErrorHandler);
    this.app.use(notFoundHandler);
  }

  setupDbAndServer = async () => {
    const conn = await createConnection();
    this.logger.info(
      `Connected to database. Connection: ${conn.name} / ${
        conn.options.database
      }`
    );

    await this.startServer();
    // await this.setConfig();
    // await this.setLanguages();
    // await this.setCurrencies();
    // await this.setupCrons();
    // await this.setTemplates();
    // await this.createAdmin();
    // await this.createAuthor();
  };

  startServer = (): Promise<boolean> => {
    // process.on('unhandledRejection', err => {
    //   console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    //   console.log(err.name, err.message);
    //   // server.close(() => {
    //     process.exit(1);
    //   // });
    // });
    return new Promise((resolve, reject) => {
      this.app
        .listen(+this.config.port, this.config.host, () => {
          this.logger.info(
            `Server started at http://${this.config.host}:${this.config.port}`
          );
          resolve(true);
        })
        .on("error", nodeErrorHandler);
    });
  };

}
