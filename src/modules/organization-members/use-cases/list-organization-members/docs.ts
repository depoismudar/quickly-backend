import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { getPaginatedResponseSchema } from '@/shared/helpers/paginated-response-schema.helper';
import { OrganizationMember } from '../../models/entities/organization-member.entity';

export function ListOrganizationMembersDocs() {
	return applyDecorators(
		ApiExtraModels(OrganizationMember),
		ApiOperation({
			summary: 'List all organization members',
			description: 'Returns a paginated list with all organization members. Can be filtered by active/inactive status.',
		}),

		ApiQuery({
			name: 'is_active',
			required: false,
			type: Boolean,
			description: 'Filter by active (true) or inactive (false) members. If not provided, returns all.',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'List of members returned successfully.',
			schema: getPaginatedResponseSchema(OrganizationMember),
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while listing members.',
		}),
	);
}
