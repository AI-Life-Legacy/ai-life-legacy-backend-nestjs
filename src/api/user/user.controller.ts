import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { Success201ResponseDTO, SuccessNoResultResponseDTO, SuccessResponseDTO } from 'src/common/response/response.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { GetUUID } from '../../common/deco/get-user.decorator';
import { PatchPostDTO, SaveUserIntroDTO, SaveUserWithdrawalDTO, UpdateNotificationSettingsDTO } from './dto/request/user.dto';
import { TocWithQuestionsDTO, UserAnswerResponseDTO, UserChapterDTO, UserTocResultDTO } from './dto/response/user.dto';
import { QuestionResponseDTO } from '../life-legacy/dto/response/life-legacy.dto';
import { WriterOnlyGuard } from '../jwt/role.guard';

@ApiTags('users/me')
@Controller('users/me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WriterOnlyGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/intro')
  @ApiOperation({ summary: '유저 자기소개 저장하기 API' })
  @ApiOkResponse({ description: '자기소개 저장 성공', type: Success201ResponseDTO })
  async saveIntro(@Body() saveUserIntroDTO: SaveUserIntroDTO, @GetUUID() uuid: string) {
    const result = await this.userService.saveUserIntroduction(uuid, saveUserIntroDTO);
    return new Success201ResponseDTO(result);
  }

  @Get('/toc')
  @ApiOperation({ summary: '유저 맞춤형 목차 및 퍼센테이지 불러오기 API' })
  @ApiExtraModels(SuccessResponseDTO, UserTocResultDTO)
  @ApiOkResponse({
    description: '불러오기 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponseDTO) },
        {
          properties: {
            result: { $ref: getSchemaPath(UserTocResultDTO) },
          },
        },
      ],
    },
  })
  async getUserToc(@GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.userService.getUserToc(uuid));
  }

  @Get('/toc-questions')
  @ApiOperation({ summary: '유저 맞춤형 목차 및 질문 불러오기 API' })
  @ApiExtraModels(SuccessResponseDTO, TocWithQuestionsDTO, QuestionResponseDTO)
  @ApiOkResponse({
    description: '불러오기 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponseDTO) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(TocWithQuestionsDTO) },
            },
          },
        },
      ],
    },
  })
  async getUserContents(@GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.userService.getUserTocAndQuestions(uuid));
  }

  @Get('/answers')
  @ApiOperation({ summary: '유저가 작성한 답변 불러오기 API' })
  @ApiExtraModels(SuccessResponseDTO, UserAnswerResponseDTO)
  @ApiOkResponse({
    description: '불러오기 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponseDTO) },
        {
          properties: {
            result: { $ref: getSchemaPath(UserAnswerResponseDTO) },
          },
        },
      ],
    },
  })
  async getUserAnswer(@Query('questionId', ParseIntPipe) questionId: number, @Query('tocId', ParseIntPipe) tocId: number, @GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.userService.getUserAnswer(questionId, tocId, uuid));
  }

  @Patch('/answers/:answerId')
  @ApiOperation({ summary: '유저가 작성한 자서전 내용 업데이트하기 API' })
  @ApiOkResponse({ description: '최근 검색 기록 삭제 성공', type: SuccessNoResultResponseDTO })
  async updateUserAnswer(@Body() patchPostDTO: PatchPostDTO, @Param('answerId', ParseIntPipe) answerId: number, @GetUUID() uuid: string) {
    await this.userService.updatePost(uuid, answerId, patchPostDTO);
    return new SuccessNoResultResponseDTO();
  }

  @Delete('/')
  @ApiOperation({ summary: '회원탈퇴 API' })
  @ApiOkResponse({ description: '회원탈퇴 성공', type: SuccessResponseDTO })
  async deleteUser(@GetUUID() uuid: string, @Body() withdrawalDTO: SaveUserWithdrawalDTO) {
    await this.userService.deleteUser(uuid, withdrawalDTO);
    return new SuccessResponseDTO(true);
  }

  @Post('/profile-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: '프로필 이미지 업로드 API' })
  @ApiOkResponse({ description: '업로드 성공', type: SuccessNoResultResponseDTO })
  async updateProfileImage(@UploadedFile() file: any, @GetUUID() uuid: string) {
    await this.userService.updateProfileImage(uuid, file);
    return new SuccessNoResultResponseDTO();
  }

  @Patch('/settings/notifications')
  @ApiOperation({ summary: '서비스 알림 설정 수정 API' })
  @ApiOkResponse({ description: '수정 성공', type: SuccessNoResultResponseDTO })
  async updateNotificationSettings(@Body() settings: UpdateNotificationSettingsDTO, @GetUUID() uuid: string) {
    await this.userService.updateNotificationSettings(uuid, settings);
    return new SuccessNoResultResponseDTO();
  }
}
