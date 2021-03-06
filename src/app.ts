import 'reflect-metadata';

import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cors from 'cors';
import * as errorHandler from 'errorhandler';
import * as express from 'express';
import * as expressStatusMonitor from 'express-status-monitor';
import * as helmet from 'helmet';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as methodOverride from 'method-override';
import * as morgan from 'morgan';
import * as path from 'path';
import { logger } from './logger';
import { CustomerService } from '@/infrastructure';
import { TYPES } from '@/constants/types';
import { CustomerRepository } from '@/domain/customer/CustomerRepository';
import { InMemoryCustomerRepository } from '@/infrastructure/Repository/customer/InMemoryCustomerRepository';
import { MockBookRepository } from '@/infrastructure/Repository/book/MockBookRepository';
import { BookRepository } from '@/domain/book/book/BookRepository';

export class Server {

  public static bootstrap (): Server {
    return new Server();
  }
  public app: express.Application;

  private readonly container: Container;

  constructor () {
    this.container = new Container();
    this.init();
    const inversifyApp: InversifyExpressServer = new InversifyExpressServer(this.container);

    inversifyApp.setConfig((app) => {
      return this.config(app);
    });
    this.app = inversifyApp.build();
  }
  public config (app: express.Application): void {
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(morgan('tiny', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));

    app.use(bodyParser.urlencoded({
      extended: true,
    }));
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(helmet());
    app.use(cors());
    app.use(compression());
    app.use(methodOverride());
    app.use(expressStatusMonitor());

    // catch 404 and forward to error handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      err.status = 404;
      next(err);
    });

    // error handling
    app.use(errorHandler());
  }

  private init(): void {
    this.container.bind<CustomerService>(TYPES.CustomerService).to(CustomerService);
    this.container.bind<CustomerRepository>(TYPES.CustomerRepository).to(InMemoryCustomerRepository);
    this.container.bind<BookRepository>(TYPES.BookRepository).to(MockBookRepository);
  }
}
