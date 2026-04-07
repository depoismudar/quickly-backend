import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AcceptOrganizationInviteResponseDto } from '../../models/dto/output/accept-organization-invite-response.dto';

export function AcceptOrganizationInviteDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Accept an organization invite',
			description: 'Accepts a pending invite and links the authenticated user to the organization as a member.',
		}),
		ApiParam({
			name: 'id',
			description: 'Unique invite ID (UUID)',
			type: String,
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Invite accepted successfully. User linked to organization.',
			type: AcceptOrganizationInviteResponseDto,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invite is no longer pending or has expired.',
		}),
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: 'Invite not found.',
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while accepting invite.',
		}),
	);
}
