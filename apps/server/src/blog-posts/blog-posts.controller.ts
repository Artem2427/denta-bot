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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/strategies/access-token.strategy';
import { BlogPostsService } from './blog-posts.service';
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
  findAll() {
    return this.blogPostsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogPostsService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateBlogPostDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.blogPostsService.create(dto, user.sub);
  }

  @Patch(':id')
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
