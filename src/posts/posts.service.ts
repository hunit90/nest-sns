import {Injectable, NotFoundException} from '@nestjs/common';
import {FindOptionsWhere, LessThan, MoreThan, Repository} from "typeorm";
import {PostsModel} from "./entities/posts.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";
import {PaginatePostDto} from "./dto/paginate-post.dto";
import {HOST, PROTOCOL} from "../common/const/env.const";

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
        private readonly postsRepository: Repository<PostsModel>
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
        const where: FindOptionsWhere<PostsModel> = {}

        if (dto.where__id_less_than) {
            where.id = LessThan(dto.where__id_less_than);
        } else if (dto.where__id_more_than) {
            where.id = MoreThan(dto.where__id_more_than)
        }

        const posts = await this.postsRepository.find({
            where,
            order: {
                createdAt: dto.order__createdAt,
            },
            take: dto.take,
        })

        const lastItem = posts.length > 0 && posts.length === dto.take ? posts[posts.length -1] : null

        const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`)

        if (nextUrl) {
            for (const key of Object.keys(dto)) {
                if (dto[key]) {
                    if (key !== 'where__id_more_than' && key !== 'where__id_less_than') {
                        nextUrl.searchParams.append(key, dto[key])
                    }
                }
            }

            let key = null

            if (dto.order__createdAt === 'ASC') {
                key = 'where__id_more_than'
            } else {
                key = 'where__id_less_than'
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

    async createPost(authorId: number, postDto: CreatePostDto) {
        // 1) create -> 저장할 객체를 생성한다.
        // 2) save -> 객체를 저장한다. (create 메서드에서 생성한 객체로)

        const post = this.postsRepository.create({
            author:{
                id: authorId,
            },
            ...postDto,
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
