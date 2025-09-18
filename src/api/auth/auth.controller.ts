import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtTokenResponseDto, LoginDTO, RefreshTokenDto, SignupDTO } from './dto/auth.dto';
import { Success201ResponseDTO, SuccessResponseDTO } from 'src/common/response/response.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입 API' })
  async signup(@Body() signupDTO: SignupDTO): Promise<Success201ResponseDTO<JwtTokenResponseDto>> {
    return new Success201ResponseDTO(await this.authService.signup(signupDTO));
  }

  @Post('/login')
  @ApiOperation({ summary: '로그인 API' })
  async login(@Body() loginDTO: LoginDTO): Promise<SuccessResponseDTO<JwtTokenResponseDto>> {
    return new SuccessResponseDTO(await this.authService.login(loginDTO));
  }

  @Post('/refresh-token')
  @ApiOperation({ summary: '리프레시 API' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<Success201ResponseDTO<JwtTokenResponseDto>> {
    return new Success201ResponseDTO(await this.authService.refreshToken(refreshTokenDto));
  }
}
