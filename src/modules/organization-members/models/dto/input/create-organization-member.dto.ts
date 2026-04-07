import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { OrganizationRole } from '@/shared/constants/organization-roles';

export class CreateOrganizationMemberDto {
	@IsUUID()
	@IsNotEmpty()
	@ApiProperty({ description: 'The user ID' })
	user_id: string;

	@IsEnum(OrganizationRole)
	@IsOptional()
	@ApiPropertyOptional({ description: 'The role of the member in the organization', enum: OrganizationRole, default: OrganizationRole.PROFESSIONAL })
	role?: OrganizationRole;
}
