import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateOrganizationDto } from '../../models/dto/input/create-organization.dto';
import { OrganizationDto } from '../../models/dto/output/organization.dto';

export function CreateOrganizationDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Create a new organization',
			description:
				'Creates a new organization with name, description and logo. The authenticated user is automatically set as owner and added as a member of the organization.',
		}),
		ApiBody({
			type: CreateOrganizationDto,
			description: 'Data for organization creation',
		}),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: 'Organization created successfully.',
			type: OrganizationDto,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invalid data for organization creation.',
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while creating organization.',
		}),
	);
}
