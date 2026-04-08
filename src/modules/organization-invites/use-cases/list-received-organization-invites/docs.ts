import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { getPaginatedResponseSchema } from '@/shared/helpers/paginated-response-schema.helper';
import { OrganizationInviteDto } from '../../models/dto/output/organization-invite.dto';

export function ListReceivedOrganizationInvitesDocs() {
	return applyDecorators(
		ApiExtraModels(OrganizationInviteDto),
		ApiOperation({
			summary: 'List received organization invites',
			description: 'Returns a paginated list of invites received by the logged in user.',
		}),
		ApiQuery({
			name: 'page',
			required: false,
			type: Number,
			description: 'Page number (default: 1)',
		}),
		ApiQuery({
			name: 'limit',
			required: false,
			type: Number,
			description: 'Number of items per page (default: 10)',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'List of received invites returned successfully.',
			schema: getPaginatedResponseSchema(OrganizationInviteDto),
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while listing received invites.',
		}),
	);
}
