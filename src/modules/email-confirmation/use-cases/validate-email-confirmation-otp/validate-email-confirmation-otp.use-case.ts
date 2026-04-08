import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { OtpCode } from '@/shared/value-objects/otp-code';
import type { ValidateEmailConfirmationOtpDto } from '../../models/dto/input/validate-email-confirmation-otp.dto';
import { EMAIL_CONFIRMATION_STATUS } from '../../shared/interfaces/email-confirmation-status';
import { GetExistingEmailConfirmationUseCase } from '../get-existing-email-confirmation/get-existing-email-confirmation.use-case';
import { MarkEmailConfirmationAsValidatedUseCase } from '../mark-email-confirmation-as-validated/mark-email-confirmation-as-validated.use-case';
import { ValidateEmailConfirmationExpirationUseCase } from '../validate-email-confirmation-expiration/validate-email-confirmation-expiration.use-case';

@Injectable()
export class ValidateEmailConfirmationOtpUseCase {
	constructor(
		@Inject(GetExistingEmailConfirmationUseCase)
		private readonly getExistingEmailConfirmationUseCase: GetExistingEmailConfirmationUseCase,
		@Inject(MarkEmailConfirmationAsValidatedUseCase)
		private readonly markEmailConfirmationAsValidatedUseCase: MarkEmailConfirmationAsValidatedUseCase,
		@Inject(ValidateEmailConfirmationExpirationUseCase)
		private readonly validateEmailConfirmationExpirationUseCase: ValidateEmailConfirmationExpirationUseCase,
	) {}

	async execute(userId: string, validateEmailConfirmationOtpDto: ValidateEmailConfirmationOtpDto): Promise<{ valid: boolean }> {
		const otpCode = new OtpCode(validateEmailConfirmationOtpDto.otp_code);

		// First, find the confirmation by OTP code
		const emailConfirmation = await this.getExistingEmailConfirmationUseCase.execute(
			{
				where: {
					user_id: userId,
					otp_code: otpCode.getValue(),
					status: EMAIL_CONFIRMATION_STATUS.PENDING,
				},
			},
			{ throwIfNotFound: false },
		);

		if (!emailConfirmation) {
			throw new BadRequestException('Email ou código OTP inválido.');
		}

		await this.validateEmailConfirmationExpirationUseCase.execute(emailConfirmation);

		await this.markEmailConfirmationAsValidatedUseCase.execute(emailConfirmation.id);

		return { valid: true };
	}
}
