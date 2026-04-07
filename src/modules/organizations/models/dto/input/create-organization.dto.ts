import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsOrganizationSlug } from '@/shared/decorators/is-organization-slug.decorator';

export class CreateOrganizationDto {
	@IsString()
	@IsNotEmpty()
	@IsOrganizationSlug()
	@ApiProperty({ description: 'The unique slug of the organization (used as public tenant ID in URLs)' })
	slug: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The name of the organization' })
	name: string;

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ description: 'The description of the organization' })
	description?: string;

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ description: 'The logo path of the organization' })
	logo?: string;

}
