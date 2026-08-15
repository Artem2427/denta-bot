import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogPostsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const blogPost = await this.prisma.blogPost.findUnique({
      where: { id },
      include: { updatedBy: { select: { email: true } } },
    });
    if (!blogPost) {
      throw new NotFoundException('Blog post not found');
    }
    return blogPost;
  }

  // Public, unauthenticated reads (apps/web Blog list/detail) — published-only,
  // least-privilege field selection (excludes updatedById/updatedBy/
  // createdAt/updatedAt, T-06-07). The `published: true` filter/check happens
  // here, never trusted to the caller (T-06-06).
  findAllPublished() {
    return this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        date: true,
        readTime: true,
        image: true,
        body: true,
        published: true,
      },
    });
  }

  async findPublishedBySlug(slug: string) {
    const blogPost = await this.prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        date: true,
        readTime: true,
        image: true,
        body: true,
        published: true,
      },
    });
    if (!blogPost || !blogPost.published) {
      throw new NotFoundException('Blog post not found');
    }
    return blogPost;
  }

  async create(dto: CreateBlogPostDto, adminId: string) {
    try {
      return await this.prisma.blogPost.create({
        data: {
          ...dto,
          body: dto.body as Prisma.InputJsonValue,
          updatedById: adminId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A blog post with this slug already exists',
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateBlogPostDto, adminId: string) {
    try {
      return await this.prisma.blogPost.update({
        where: { id },
        data: {
          ...dto,
          body: dto.body as Prisma.InputJsonValue | undefined,
          updatedById: adminId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Blog post not found');
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A blog post with this slug already exists',
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.blogPost.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Blog post not found');
      }
      throw error;
    }
  }
}
