import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function RequestEmailVerificationDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Request email verification',
			description: 'Sends a 6-digit OTP code to verify the logged in user email. The code expires in 15 minutes.',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'OTP code has been sent to the email.',
			schema: {
				example: {
					message: 'Código OTP enviado para o email.',
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invalid data for email verification request.',
			schema: {
				examples: {
					email_already_verified: {
						summary: 'Email already verified',
						value: {
							message: 'Este email já está verificado.',
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
			status: HttpStatus.NOT_FOUND,
			description: 'User not found.',
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while requesting email verification.',
		}),
	);
}
