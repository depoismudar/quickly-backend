import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { getPaginatedResponseSchema } from '@/shared/helpers/paginated-response-schema.helper';
import { OrganizationInviteDto } from '../../models/dto/output/organization-invite.dto';
import { OrganizationInvite } from '../../models/entities/organization-invite.entity';

export function ListOrganizationInvitesByOrganizationDocs() {
	return applyDecorators(
		ApiExtraModels(OrganizationInvite),
		ApiOperation({
			summary: 'List organization invites by organization',
			description: 'Returns a paginated list with all invites for a specific organization. Used by organization clients.',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'List of invites returned successfully.',
			schema: getPaginatedResponseSchema(OrganizationInviteDto),
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while listing invites.',
		}),
	);
}
