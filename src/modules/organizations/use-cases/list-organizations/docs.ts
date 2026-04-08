import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { getPaginatedResponseSchema } from '@/shared/helpers/paginated-response-schema.helper';
import { ListOrganizationResponseDto } from '../../models/dto/output/list-organization-response.dto';

export function ListOrganizationsDocs() {
	return applyDecorators(
		ApiExtraModels(ListOrganizationResponseDto),
		ApiOperation({
			summary: 'List all organizations',
			description: 'Returns a paginated list with all registered organizations. Includes the count of members for each organization.',
		}),

		ApiResponse({
			status: HttpStatus.OK,
			description: 'List of organizations returned successfully.',
			schema: getPaginatedResponseSchema(ListOrganizationResponseDto),
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while listing organizations.',
		}),
	);
}
