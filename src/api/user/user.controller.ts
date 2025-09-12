import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Put, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SetUserCaseDTO, UserCaseDTO, UserContentAndQuestionsDTO, UserContentDTO, UserPostsDTO } from './dto/user.dto';
import { Success204ResponseDTO, SuccessResponseDTO } from 'src/common/response/response.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiDefaultResponses } from '../../common/deco/api-default-response.deco';
import { ApiSuccess204Response, ApiSuccessResponse } from '../../common/deco/api-paginated-response.deco';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:uuid/cases')
  @ApiOperation({ summary: '유저 케이스 불러오기 API' })
  @ApiSuccessResponse(UserCaseDTO)
  @ApiDefaultResponses()
  async getUserCase(@Param('uuid', ParseUUIDPipe) uuid: string): Promise<SuccessResponseDTO<UserCaseDTO>> {
    return new SuccessResponseDTO(await this.userService.getUserCase(uuid));
  }

  @Put('/:uuid/cases')
  @ApiOperation({ summary: '유저 케이스 저장하기 API' })
  @ApiBody({ type: SetUserCaseDTO })
  @ApiSuccessResponse(UserCaseDTO)
  @ApiDefaultResponses()
  async setUserCase(@Body() setUserCaseDTO: SetUserCaseDTO, @Param('uuid', ParseUUIDPipe) uuid: string): Promise<SuccessResponseDTO<UserCaseDTO>> {
    return new SuccessResponseDTO(await this.userService.setUserCase(uuid, setUserCaseDTO));
  }

  @Get('/:uuid/contents')
  @ApiOperation({ summary: '유저 맞춤형 목차 불러오기 API' })
  @ApiSuccessResponse(UserContentDTO, true)
  @ApiDefaultResponses()
  async getUserContents(@Param('uuid', ParseUUIDPipe) uuid: string): Promise<SuccessResponseDTO<UserContentDTO[]>> {
    return new SuccessResponseDTO(await this.userService.getUserContents(uuid));
  }

  @Get('/:uuid/contents/:contentsId/questions')
  @ApiOperation({ summary: '유저 맞춤형 목차별 질문들 불러오기 API' })
  @ApiSuccessResponse(UserContentAndQuestionsDTO)
  @ApiDefaultResponses()
  async getUserQuestions(@Param('contentsId', ParseIntPipe) contentsId: number): Promise<SuccessResponseDTO<UserContentAndQuestionsDTO>> {
    return new SuccessResponseDTO(await this.userService.getQuestionsByContentId(contentsId));
  }

  @Get('/:uuid/posts')
  @ApiOperation({ summary: '유저 자서전 데이터 모두 불러오기 API' })
  @ApiSuccessResponse(UserPostsDTO, true)
  @ApiDefaultResponses()
  async getAllUserPosts(@Param('uuid', ParseUUIDPipe) uuid: string): Promise<SuccessResponseDTO<UserPostsDTO[]>> {
    return new SuccessResponseDTO(await this.userService.getAllUserPostsByUUID(uuid));
  }

  @Delete('/:uuid')
  @ApiOperation({ summary: '회원탈퇴 API' })
  @ApiSuccess204Response
  @ApiDefaultResponses()
  async deleteUser(@Query('deleteType', ParseIntPipe) deleteType: number, @Param('uuid', ParseUUIDPipe) uuid: string): Promise<Success204ResponseDTO> {
    await this.userService.deleteUser(uuid, deleteType);
    return new Success204ResponseDTO();
  }
}
