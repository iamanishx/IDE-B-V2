import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '@nestjs/passport';
import { Project } from './schema/project.entity';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getProjects(@Req() req) {
    const oauthId = req.user.oauthId;
    if (!oauthId) {
      throw new HttpException('Unauthorized: Invalid or missing oauthId', HttpStatus.UNAUTHORIZED);
    }

    const projects = await this.projectsService.findProjectsByOauthId(oauthId);
    if (projects.length === 0) {
      throw new HttpException('No projects found for the user', HttpStatus.NOT_FOUND);
    }

    return { projects };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createProject(@Body() data: CreateProjectDto, @Req() req) {
    const oauthId = req.user.oauthId;
    if (!oauthId) {
      throw new HttpException('oauthId is required', HttpStatus.BAD_REQUEST);
    }

    if (!data.name) {
      throw new HttpException('Project name is required', HttpStatus.BAD_REQUEST);
    }
    const project = await this.projectsService.createProject({ ...data, oauthId });
    return { project };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteProject(@Param('id') id: number, @Req() req) {
    const oauthId = req.user.oauthId;

    const deleteProjectDto = { id, oauthId };
    const deleted = await this.projectsService.deleteProject(deleteProjectDto);
    if (!deleted) {
      throw new HttpException('Project not found or not authorized', HttpStatus.NOT_FOUND);
    }

    return { message: 'Project deleted successfully' };
  }
}
