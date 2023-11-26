import {BadRequestException, Module} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PostsModel} from "./entities/posts.entity";
import {AuthModule} from "../auth/auth.module";
import {UsersModule} from "../users/users.module";
import {CommonModule} from "../common/common.module";
import {MulterModule} from "@nestjs/platform-express";
import multer from "multer";
import {POST_IMAGE_PATH} from "../common/const/path.const";
import { extname } from 'path';
import {v4 as uuid} from 'uuid';
import {ImageModel} from "../common/entity/image.entity";

@Module({
  imports: [
      TypeOrmModule.forFeature([
          PostsModel,
          ImageModel,
      ]),
      AuthModule,
      UsersModule,
      CommonModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}