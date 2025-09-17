import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SaveUserIntroDTO, SaveUserWithdrawalDTO } from './dto/user.dto';
import { Success204ResponseDTO, SuccessResponseDTO } from 'src/common/response/response.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PatchPostDTO } from '../life-legacy/dto/save.dto';
import { GetUUID } from '../../common/deco/get-user.decorator';

@ApiTags('users/me')
@Controller('users/me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/intro')
  @ApiOperation({ summary: '유저 자기소개 저장하기 API' })
  async saveIntro(@Body() saveUserIntroDTO: SaveUserIntroDTO, @GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.userService.saveUserIntroduction(uuid, saveUserIntroDTO));
  }

  @Get('/toc')
  @ApiOperation({ summary: '유저 맞춤형 목차 및 퍼센테이지 불러오기 API' })
  async getUserToc(@GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.userService.getUserToc(uuid));
  }

  @Get('/toc-questions')
  @ApiOperation({ summary: '유저 맞춤형 목차 및 질문 불러오기 API' })
  async getUserContents(@GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.userService.getUserTocAndQuestions(uuid));
  }

  @Get('/answers')
  @ApiOperation({ summary: '유저가 작성한 답변 불러오기 API' })
  async getUserAnswer(@Query('questionId', ParseIntPipe) questionId: number, @Query('tocId', ParseIntPipe) tocId: number, @GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.userService.getUserAnswer(questionId, tocId, uuid));
  }

  @Patch('/answers/:answerId')
  @ApiOperation({ summary: '유저가 작성한 자서전 내용 업데이트하기 API' })
  async updateUserAnswer(
    @Body() patchPostDTO: PatchPostDTO,
    @Param('answerId', ParseIntPipe) answerId: number,
    @GetUUID() uuid: string,
  ): Promise<Success204ResponseDTO> {
    await this.userService.updatePost(uuid, answerId, patchPostDTO);
    return new Success204ResponseDTO();
  }

  @Delete('/')
  @ApiOperation({ summary: '회원탈퇴 API' })
  async deleteUser(@GetUUID() uuid: string, @Body() withdrawalDTO: SaveUserWithdrawalDTO) {
    await this.userService.deleteUser(uuid, withdrawalDTO);
    return new Success204ResponseDTO();
  }
}
