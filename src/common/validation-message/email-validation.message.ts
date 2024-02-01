import {ValidationArguments} from "class-validator";

export const emailValidationMessage = (args: ValidationArguments) => {
    return `${args.property}에 정확한 이메일 주소를 입력해주세요.`
}