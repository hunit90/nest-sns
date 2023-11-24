import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {FindOptionsWhere, LessThan, MoreThan, Repository} from "typeorm";
import {PostsModel} from "./entities/posts.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";
import {PaginatePostDto} from "./dto/paginate-post.dto";
import {CommonService} from "../common/common.service";
import {ConfigService} from "@nestjs/config";
import {ENV_HOST_KEY, ENV_PROTOCOL_KEY} from "../common/const/env-keys.const";
import {POST_IMAGE_PATH, PUBLIC_FOLDER_PATH} from "../common/const/path.const";
import {basename, join} from "path";
import {promises} from "fs";

/**
 * author: string;
 * title: string;
 * content: string;
 * likeCount: number;
 * commentCount: number;
 */

export interface PostModel {
    id: number;
    author: string;
    title: string;
    content: string;
    likeCount: number;
    commentCount: number;
}

let posts : PostModel[] = [
    {
        id: 1,
        author: 'newjeans_official',
        title: '뉴진스 민지',
        content: '메이크업 고치고 있는 민지',
        likeCount: 1000,
        commentCount: 9999,
    },
    {
        id: 2,
        author: 'newjeans_official',
        title: '뉴진스 해린',
        content: '노래 연습 하고 있는 해린',
        likeCount: 1000,
        commentCount: 9999,
    },
    {
        id: 3,
        author: 'blackpink_official',
        title: '블랙핑크 로제',
        content: '메이크업 고치고 있는 로제',
        likeCount: 1000,
        commentCount: 9999,
    },
]

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(PostsModel)
        private readonly postsRepository: Repository<PostsModel>,
        private readonly commonService: CommonService,
        private readonly configService: ConfigService,
    ) {}
    async getAllPosts() {
        return this.postsRepository.find({
            relations: ['author']
        });
    }

    async generatePosts(userId: number) {
        for(let i =0; i < 100; i++) {
            await this.createPost(userId, {
                title: `test post title ${i}`,
                content: `test post content ${i}`,
            })
        }
    }

    async paginatePosts(dto: PaginatePostDto) {
        return this.commonService.paginate(
            dto,
            this.postsRepository,
            {
                relations: ['author']
            },
            'posts')
        // if (dto.page) {
        //     return this.pagePaginatePosts(dto)
        // } else {
        //     return this.cursorPaginatePosts(dto)
        // }
    }

    async pagePaginatePosts(dto: PaginatePostDto) {
        const [posts, count] = await this.postsRepository.findAndCount({
            skip: dto.take * (dto.page -1),
            take: dto.take,
            order: {
                createdAt: dto.order__createdAt,
            }
        })

        return {
            data: posts,
            total: count,
        }
    }

    async cursorPaginatePosts(dto: PaginatePostDto) {
        const where: FindOptionsWhere<PostsModel> = {}

        if (dto.where__id__less_than) {
            where.id = LessThan(dto.where__id__less_than);
        } else if (dto.where__id__more_than) {
            where.id = MoreThan(dto.where__id__more_than)
        }

        const posts = await this.postsRepository.find({
            where,
            order: {
                createdAt: dto.order__createdAt,
            },
            take: dto.take,
        })

        const lastItem = posts.length > 0 && posts.length === dto.take ? posts[posts.length -1] : null

        const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
        const host = this.configService.get<string>(ENV_HOST_KEY);
        const nextUrl = lastItem && new URL(`${protocol}://${host}/posts`)

        if (nextUrl) {
            for (const key of Object.keys(dto)) {
                if (dto[key]) {
                    if (key !== 'where__id__more_than' && key !== 'where__id__less_than') {
                        nextUrl.searchParams.append(key, dto[key])
                    }
                }
            }

            let key = null

            if (dto.order__createdAt === 'ASC') {
                key = 'where__id__more_than'
            } else {
                key = 'where__id__less_than'
            }

            nextUrl.searchParams.append(key, lastItem.id.toString())
        }

        return {
            data: posts,
            cursor: {
                after: lastItem?.id ?? null,
            },
            count: posts.length,
            next: nextUrl?.toString() ?? null,
        }
    }

    async getPostById(id: number) {
        const post = await this.postsRepository.findOne({
            where: {
                id: id,
            },
            relations: ['author']
        });

        if (!post) {
            throw new NotFoundException();
        }
        return post;
    }

    async createPostImage(dto: CreatePostDto){
        const tempFilePath = join(
            PUBLIC_FOLDER_PATH,
            dto.image,
        )

        try {
            await promises.access(tempFilePath);
        } catch (e) {
            throw new BadRequestException('존재하지 않는 파일입니다.')
        }

        const fileName = basename(tempFilePath)

        const newPath = join(
            POST_IMAGE_PATH,
            fileName,
        )

        await promises.rename(tempFilePath, newPath)

        return true;
    }

    async createPost(authorId: number, postDto: CreatePostDto, image?: string) {
        // 1) create -> 저장할 객체를 생성한다.
        // 2) save -> 객체를 저장한다. (create 메서드에서 생성한 객체로)

        const post = this.postsRepository.create({
            author:{
                id: authorId,
            },
            ...postDto,
            image,
            likeCount: 0,
            commentCount: 0,
        });

        const newPost = await this.postsRepository.save(post);

        return newPost;
    }

    async updatePost(postId: number,  postDto: UpdatePostDto) {
        const {title, content} = postDto
        // save의 기능
        // 1) 데이터가 존재하지 않는다면, (id 기준으로) 새로 생성한다.
        // 2) 데이터가 존재한다면 (같은 id의 값이 존재한다면) 존재하던 값을 업데이트한다.
        const post = await this.postsRepository.findOne({
            where: {
                id: postId,
            }
        })

        if (!post) {
            throw new NotFoundException();
        }

        if (title) {
            post.title = title;
        }

        if (content) {
            post.content = content;
        }

        const newPost = await this.postsRepository.save(post);


        return newPost;
    }

    async deletePost(postId: number) {
        const post = await this.postsRepository.findOne({
            where: {
                id: postId,
            }
        })

        if (!post) {
            throw new NotFoundException();
        }

        await this.postsRepository.delete(postId);

        return postId;

    }
}
