import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostResponseDto } from './dto/blog-post-response.dto';

// Class-level @Public() — every route here is unauthenticated by design
// (apps/web's marketing Blog list/detail pages). Reads only, published-only
// (enforced in BlogPostsService, not here — T-06-06/T-06-08). The protected
// admin BlogPostsController (create/update/delete, GET /blog-posts(/:id))
// stays untouched behind the global AccessTokenGuard.
@Public()
@ApiTags('public-blog-posts')
@Controller('public/blog-posts')
export class PublicBlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Get()
  @ApiOkResponse({ type: BlogPostResponseDto, isArray: true })
  findAllPublished() {
    return this.blogPostsService.findAllPublished();
  }

  @Get(':slug')
  @ApiOkResponse({ type: BlogPostResponseDto })
  findOneBySlug(@Param('slug') slug: string) {
    return this.blogPostsService.findPublishedBySlug(slug);
  }
}
