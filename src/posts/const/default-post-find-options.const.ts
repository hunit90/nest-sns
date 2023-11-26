import {PostsModel} from "../entities/posts.entity";
import {FindManyOptions} from "typeorm";

export const DEFAULT_POST_FIND_OPTIONS: FindManyOptions<PostsModel> = {
    relations: {
        author: true,
        images: true,
    }
}