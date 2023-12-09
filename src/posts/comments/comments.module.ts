import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {CommentsModel} from "./entity/comments.entity";
import {CommonModule} from "../../common/common.module";
import {AuthModule} from "../../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
        CommentsModel,
    ]),
      CommonModule,
      AuthModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
