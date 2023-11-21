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

@Module({
  imports: [
      TypeOrmModule.forFeature([
          PostsModel,
      ]),
      AuthModule,
      UsersModule,
      CommonModule,
      MulterModule.register({
          limits: {
              fileSize: 10000000,
          },
          fileFilter: (req, file, cb) => {
              const ext = extname(file.originalname)

              if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
                  return cb(
                      new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다.'),
                      false,
                  )
              }

              return cb(null, true)
          },
          storage: multer.diskStorage({
              destination: function (req, res, cb) {
                  cb(null, POST_IMAGE_PATH);
              },
              filename: function(req, file, cb) {
                  cb(null, `${uuid()}${extname(file.originalname)}`)
              }
          })
      }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}