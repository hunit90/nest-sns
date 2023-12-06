import {IsOptional, IsString} from "class-validator";
import {PickType} from "@nestjs/mapped-types";
import {PostsModel} from "../entity/posts.entity";

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']){
    @IsString({
        each: true,
    })
    @IsOptional()
    images?: string[] = [];
}