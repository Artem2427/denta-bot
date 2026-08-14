import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/strategies/access-token.strategy';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostResponseDto } from './dto/blog-post-response.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

// No @Public() on any route here — protected by the existing global
// AccessTokenGuard by default (AUTH-04, already active app-wide).
@ApiTags('blog-posts')
@ApiBearerAuth('access-token')
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Get()
  @ApiOkResponse({ type: BlogPostResponseDto, isArray: true })
  findAll() {
    return this.blogPostsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: BlogPostResponseDto })
  findOne(@Param('id') id: string) {
    return this.blogPostsService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: BlogPostResponseDto })
  create(
    @Body() dto: CreateBlogPostDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.blogPostsService.create(dto, user.sub);
  }

  @Patch(':id')
  @ApiOkResponse({ type: BlogPostResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogPostDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.blogPostsService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.blogPostsService.remove(id);
  }
}
