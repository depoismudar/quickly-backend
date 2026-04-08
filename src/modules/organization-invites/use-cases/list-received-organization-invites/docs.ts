import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { getPaginatedResponseSchema } from '@/shared/helpers/paginated-response-schema.helper';
import { OrganizationInviteDto } from '../../models/dto/output/organization-invite.dto';

export function ListReceivedOrganizationInvitesDocs() {
	return applyDecorators(
		ApiExtraModels(OrganizationInviteDto),
		ApiOperation({
			summary: 'List received organization invites',
			description: 'Returns a paginated list of invites received by the logged in user.',
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
