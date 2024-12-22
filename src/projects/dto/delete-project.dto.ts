import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class DeleteProjectDto {
  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

  @IsString()
  @IsNotEmpty()
  readonly oauthId: string;
}