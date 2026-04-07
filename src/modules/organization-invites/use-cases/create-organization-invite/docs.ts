import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateOrganizationInviteDto } from '../../models/dto/input/create-organization-invite.dto';
import { OrganizationInvite } from '../../models/entities/organization-invite.entity';

export function CreateOrganizationInviteDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Create a new organization invite',
			description:
				'Creates a unique invite with a 7-day validity period. The invite ID (UUID) will be used as a unique identifier. A user can only have 1 active invite per organization. It is not possible to invite a user who is already a member of the organization. The invited user does not need to have an account in the system yet - they can create one when accepting the invite. Organization and inviter are resolved from the authenticated context.',
		}),
		ApiBody({
			type: CreateOrganizationInviteDto,
			description: 'Data for invite creation',
		}),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: 'Invite created successfully and email sent.',
			type: OrganizationInvite,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description:
				'Invalid data for invite creation, or an active invite already exists, or the user is already a member of the organization (if they have an account).',
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while creating invite.',
		}),
	);
}
