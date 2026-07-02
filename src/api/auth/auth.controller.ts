import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Success201ResponseDTO, SuccessResponseDTO } from 'src/common/response/response.dto';
import { ApiExtraModels, ApiOkResponse, ApiOperation, getSchemaPath } from '@nestjs/swagger';
import { JwtTokenResponseDTO, ViewerLoginResponseDTO } from './dto/response/auth.dto';
import { LoginDTO, RefreshTokenDto, SignupDTO, ViewerLoginRequestDTO } from './dto/request/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입 API' })
  @ApiExtraModels(SuccessResponseDTO, JwtTokenResponseDTO)
  @ApiOkResponse({
    description: '회원가입 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponseDTO) },
        {
          properties: {
            result: { $ref: getSchemaPath(JwtTokenResponseDTO) },
          },
        },
      ],
    },
  })
  async signup(@Body() signupDTO: SignupDTO): Promise<Success201ResponseDTO<JwtTokenResponseDTO>> {
    return new Success201ResponseDTO(await this.authService.signup(signupDTO));
  }

  @Post('/login')
  @ApiOperation({ summary: '로그인 API' })
  @ApiExtraModels(SuccessResponseDTO, JwtTokenResponseDTO)
  @ApiOkResponse({
    description: '로그인 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponseDTO) },
        {
          properties: {
            result: { $ref: getSchemaPath(JwtTokenResponseDTO) },
          },
        },
      ],
    },
  })
  async login(@Body() loginDTO: LoginDTO): Promise<SuccessResponseDTO<JwtTokenResponseDTO>> {
    return new SuccessResponseDTO(await this.authService.login(loginDTO));
  }

  @Post('/refresh-token')
  @ApiOperation({ summary: '리프레시 API' })
  @ApiExtraModels(SuccessResponseDTO, JwtTokenResponseDTO)
  @ApiOkResponse({
    description: '리프레시 토큰 발급 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponseDTO) },
        {
          properties: {
            result: { $ref: getSchemaPath(JwtTokenResponseDTO) },
          },
        },
      ],
    },
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<Success201ResponseDTO<JwtTokenResponseDTO>> {
    return new Success201ResponseDTO(await this.authService.refreshToken(refreshTokenDto));
  }

  @Post('/viewer-login')
  @ApiOperation({ summary: '관람자 로그인 API' })
  @ApiExtraModels(SuccessResponseDTO, ViewerLoginResponseDTO)
  @ApiOkResponse({
    description: '관람자 로그인 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponseDTO) },
        {
          properties: {
            result: { $ref: getSchemaPath(ViewerLoginResponseDTO) },
          },
        },
      ],
    },
  })
  async viewerLogin(@Body() viewerLoginRequestDTO: ViewerLoginRequestDTO) {
    return new SuccessResponseDTO(await this.authService.viewerLogin(viewerLoginRequestDTO));
  }
}
