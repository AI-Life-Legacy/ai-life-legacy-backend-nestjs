import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto, JwtTokenResponseDto, RefreshTokenDto } from './dto/auth.dto';
import { ConflictResponseDTO, Success201ResponseDTO, SuccessResponseDTO } from 'src/common/response/response.dto';
import { ApiConflictResponse, ApiOperation } from '@nestjs/swagger';
import { ApiDefaultResponses } from '../../common/deco/api-default-response.deco';
import { ApiSuccess201Response, ApiSuccessResponse } from '../../common/deco/api-paginated-response.deco';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입 API' })
  async signup(@Body() authCredentialsDto: AuthCredentialsDto): Promise<Success201ResponseDTO<JwtTokenResponseDto>> {
    return new SuccessResponseDTO(await this.authService.signup(authCredentialsDto));
  }

  @Post('/signin')
  @ApiOperation({ summary: '로그인 API' })
  async signIn(@Body() authCredentialsDto: AuthCredentialsDto): Promise<SuccessResponseDTO<JwtTokenResponseDto>> {
    return new SuccessResponseDTO(await this.authService.signIn(authCredentialsDto));
  }

  @Post('/refresh')
  @ApiOperation({ summary: '리프레시 API' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<SuccessResponseDTO<JwtTokenResponseDto>> {
    return new SuccessResponseDTO(await this.authService.refresh(refreshTokenDto));
  }
}
