import { Module } from '@nestjs/common';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPostsService } from './blog-posts.service';
import { PublicBlogPostsController } from './public-blog-posts.controller';

// No PrismaModule import needed — it's @Global().
@Module({
  controllers: [BlogPostsController, PublicBlogPostsController],
  providers: [BlogPostsService],
})
export class BlogPostsModule {}
