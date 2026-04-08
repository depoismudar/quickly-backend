import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { GetExistingUserUseCase } from '@/modules/users/use-cases/get-existing-user/get-existing-user.use-case';
import { UpdateUserUseCase } from '@/modules/users/use-cases/update-user/update-user.use-case';
import { generatePasswordResetToken } from '@/shared/helpers/password-reset-token.helper';
import { OtpCode } from '@/shared/value-objects/otp-code';
import type { ValidatePasswordResetOtpDto } from '../../models/dto/input/validate-password-reset-otp.dto';
import { PASSWORD_RESET_STATUS } from '../../shared/interfaces/password-reset-status';
import { GetExistingPasswordResetUseCase } from '../get-existing-password-reset/get-existing-password-reset.use-case';
import { ValidatePasswordResetExpirationUseCase } from '../validate-password-reset-expiration/validate-password-reset-expiration.use-case';

@Injectable()
export class ValidatePasswordResetOtpUseCase {
	constructor(
		@Inject(GetExistingUserUseCase)
		private readonly getExistingUserUseCase: GetExistingUserUseCase,
		@Inject(UpdateUserUseCase)
		private readonly updateUserUseCase: UpdateUserUseCase,
		@Inject(GetExistingPasswordResetUseCase)
		private readonly getExistingPasswordResetUseCase: GetExistingPasswordResetUseCase,
		@Inject(ValidatePasswordResetExpirationUseCase)
		private readonly validatePasswordResetExpirationUseCase: ValidatePasswordResetExpirationUseCase,
	) {}

	async execute(validatePasswordResetOtpDto: ValidatePasswordResetOtpDto): Promise<{ reset_token: string }> {
		const user = await this.getExistingUserUseCase.execute(
			{
				where: { email: validatePasswordResetOtpDto.email },
			},
			{ throwIfNotFound: false },
		);

		if (!user) {
			throw new BadRequestException('Email ou código OTP inválido.');
		}

		const otpCode = new OtpCode(validatePasswordResetOtpDto.code);
		const passwordReset = await this.getExistingPasswordResetUseCase.execute(
			{
				where: {
					user_id: user.id,
					otp_code: otpCode.getValue(),
					status: PASSWORD_RESET_STATUS.PENDING,
				},
			},
			{ throwIfNotFound: false },
		);

		if (!passwordReset) {
			throw new BadRequestException('Email ou código OTP inválido.');
		}

		await this.validatePasswordResetExpirationUseCase.execute(passwordReset);

		if (!user.email_verified) {
			await this.updateUserUseCase.execute(user.id, { email_verified: true });
		}

		const reset_token = generatePasswordResetToken({
			userId: user.id,
			passwordResetId: passwordReset.id,
		});

		return { reset_token };
	}
}
