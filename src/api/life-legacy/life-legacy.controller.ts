import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LifeLegacyService } from './life-legacy.service';
import { SavePostDTO } from './dto/save.dto';
import { Success204ResponseDTO } from 'src/common/response/response.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { ApiSuccess204Response } from '../../common/deco/api-paginated-response.deco';
import { ApiDefaultResponses } from '../../common/deco/api-default-response.deco';
import { GetUUID } from '../../common/deco/get-user.decorator';

@Controller('life-legacy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class LifeLegacyController {
  constructor(private lifeLegacyService: LifeLegacyService) {}

  @Post('/answers')
  @ApiOperation({ summary: '자서전 저장하기 API' })
  @ApiBody({ type: SavePostDTO })
  @ApiSuccess204Response
  @ApiDefaultResponses()
  async savePost(@Body() savePostDTO: SavePostDTO, @GetUUID() uuid: string): Promise<Success204ResponseDTO> {
    await this.lifeLegacyService.saveUserAnswer(uuid, savePostDTO);
    return new Success204ResponseDTO();
  }
}
