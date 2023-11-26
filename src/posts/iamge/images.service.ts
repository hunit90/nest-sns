import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {ImageModel} from "../../common/entity/image.entity";
import {QueryRunner, Repository} from "typeorm";
import {basename, join} from "path";
import {POST_IMAGE_PATH, PUBLIC_FOLDER_PATH} from "../../common/const/path.const";
import {promises} from "fs";
import {CreatePostImageDto} from "./dto/create-image.dto";

@Injectable()
export class PostsImagesService {
    constructor(
        @InjectRepository(ImageModel)
        private readonly imageRepository: Repository<ImageModel>,
    ) {

    }

    getRepository(qr?: QueryRunner) {
        return qr ? qr.manager.getRepository<ImageModel>(ImageModel) : this.imageRepository
    }

    async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
        const repository = this.getRepository(qr)
        const tempFilePath = join(
            PUBLIC_FOLDER_PATH,
            dto.path,
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

        const result = await repository.save({
            ...dto,
        })

        await promises.rename(tempFilePath, newPath)

        return result;
    }
}