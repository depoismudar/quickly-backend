import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequestEmailChangeDto } from '../../models/dto/input/request-email-change.dto';

export function RequestEmailChangeDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Request email change',
			description:
				'Sends a 6-digit OTP code to the old email address to confirm the email change request. The code expires in 15 minutes. After validation, the user email will be updated to the new email. This security measure prevents fraud by requiring confirmation from the current email.',
		}),
		ApiBody({
			type: RequestEmailChangeDto,
			description: 'New email address',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'OTP code has been sent to the current email.',
			schema: {
				example: {
					message: 'Código OTP enviado para o email atual.',
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invalid data for email change request.',
			schema: {
				examples: {
					same_email: {
						summary: 'New email is the same as current email',
						value: {
							message: 'O novo email deve ser diferente do email atual.',
						},
					},
					tentativas_excedidas: {
						summary: 'Attempts exceeded',
						value: {
							message: 'Você excedeu o limite de tentativas de confirmação de email. Tente novamente em algumas horas.',
						},
					},
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.CONFLICT,
			description: 'Email already in use.',
			schema: {
				example: {
					message: 'Este email já está em uso.',
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: 'User not found.',
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while requesting email change.',
		}),
	);
}
