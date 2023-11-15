import {Injectable, NotFoundException} from '@nestjs/common';
import {MoreThan, Repository} from "typeorm";
import {PostsModel} from "./entities/posts.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";
import {PaginatePostDto} from "./dto/paginate-post.dto";

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
        const posts = await this.postsRepository.find({
            where: {
                id: MoreThan(dto.where__id_more_than ?? 0),
            },
            order: {
                createdAt: dto.order__createdAt,
            },
            take: dto.take,
        })

        return {
            data: posts
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
