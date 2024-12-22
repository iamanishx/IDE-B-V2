import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project } from './schema/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { DeleteProjectDto } from './dto/delete-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project)
    private projectModel: typeof Project,
  ) {}

  async findProjectsByOauthId(oauthId: string): Promise<Project[]> {
    return this.projectModel.findAll({ 
      where: { oauthId } 
    });
  }

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    return await this.projectModel.create({
      ...createProjectDto
    });
  }

  async deleteProject(deleteProjectDto: DeleteProjectDto): Promise<boolean> {
    const { id, oauthId } = deleteProjectDto;
    const deleted = await this.projectModel.destroy({
      where: { 
        id,
        oauthId 
      }
    });

    if (!deleted) {
      throw new NotFoundException(`Project with ID ${id} not found or unauthorized`);
    }

    return true;
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.findAll();
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectModel.findByPk(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }
}