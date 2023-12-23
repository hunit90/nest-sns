import {
    ClassSerializerInterceptor,
    MiddlewareConsumer,
    Module,
    NestMiddleware,
    NestModule,
    RequestMethod
} from '@nestjs/common';
import { AppController } from './app.controller';
import {ConfigModule} from "@nestjs/config";
import * as process from "process";

@Module({
  controllers: [AppController],
  providers: [
  ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(
        ).forRoutes({
            path: '*',
            method: RequestMethod.GET,
        })
    }
}
