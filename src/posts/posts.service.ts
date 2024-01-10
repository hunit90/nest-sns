import {Injectable, NotFoundException} from '@nestjs/common';
import {Repository} from "typeorm";
import {PostsModel} from "./entities/posts.entity";
import {InjectRepository} from "@nestjs/typeorm";

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
        title: '뉴진스 혜린',
        content: '노래 연습하는 혜린',
        likeCount: 1000,
        commentCount: 9999,
    },
    {
        id: 3,
        author: 'blackpink_official',
        title: '블랙핑크 제니',
        content: '공연중인 제니',
        likeCount: 1000,
        commentCount: 9999,
    },
]


@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(PostsModel)
        private readonly postsRepository: Repository<PostsModel>
    ) {
    }
    async getAllPosts() {
        return await this.postsRepository.find();
    }

    async getPostById(id: number) {
        const post = await this.postsRepository.findOne({
            where: {
                id,
            }
        })

        if (!post) {
            throw new NotFoundException()
        }

        return post
    }

    async createPost(author: string, title: string, content: string) {
        const post = this.postsRepository.create({
            author,
            title,
            content,
            likeCount: 0,
            commentCount: 0,
        })

        const newPost = await this.postsRepository.save(post)

        return newPost;
    }

    async updatePost(postId: number, author: string, title: string, content: string) {
        const post = await this.postsRepository.findOne({
            where: {
                id: postId,
            }
        })

        if (!post) {
            throw new NotFoundException()
        }

        if (author) {
            post.author = author
        }

        if (title) {
            post.title = title
        }

        if (content) {
            post.content = content
        }

        const newPost = await this.postsRepository.save(post)

        return newPost;
    }

    async deletePost(postId: number) {
        const post = await this.postsRepository.findOne({
            where: {
                id: postId,
            }
        })

        if (!post) {
            throw new NotFoundException()
        }

        await this.postsRepository.delete(postId);

        return postId;
    }
}

