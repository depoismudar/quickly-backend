import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { getExceptionResponseSchema } from '@/shared/helpers/exception-response-schema.helper';
import { AlreadyLoggedInOrganizationException } from '../../errors/already-logged-in-organization.error';
import { SwitchOrganizationDto } from '../../models/dto/input/switch-organization.dto';
import { SessionUserDto } from '../../models/dto/output/session-user.dto';

export function SwitchOrganizationDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Switch active organization',
			description: 'Switches the active organization context in the current session.',
		}),
		ApiBody({
			type: SwitchOrganizationDto,
			description: 'Target organization',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Organization switched successfully.',
			type: SessionUserDto,
		}),
		ApiResponse({
			status: HttpStatus.FORBIDDEN,
			description: 'User is not an active member of the target organization.',
		}),
		ApiResponse({
			status: HttpStatus.UNAUTHORIZED,
			description: 'User not authenticated.',
		}),
		ApiResponse(getExceptionResponseSchema(AlreadyLoggedInOrganizationException, [], { description: 'Você já está logado nesta organização.' })),
	);
}
