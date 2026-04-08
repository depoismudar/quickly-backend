import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { GetExistingUserUseCase } from '@/modules/users/use-cases/get-existing-user/get-existing-user.use-case';
import { UpdateUserUseCase } from '@/modules/users/use-cases/update-user/update-user.use-case';
import { OtpCode } from '@/shared/value-objects/otp-code';
import type { ValidateEmailConfirmationOtpDto } from '../../models/dto/input/validate-email-confirmation-otp.dto';
import { EMAIL_CONFIRMATION_STATUS } from '../../shared/interfaces/email-confirmation-status';
import { EMAIL_CONFIRMATION_TYPE } from '../../shared/interfaces/email-confirmation-type';
import { GetExistingEmailConfirmationUseCase } from '../get-existing-email-confirmation/get-existing-email-confirmation.use-case';
import { RequestEmailVerificationUseCase } from '../request-email-verification/request-email-verification.use-case';
import { UpdateEmailConfirmationUseCase } from '../update-email-confirmation/update-email-confirmation.use-case';
import { ValidateEmailConfirmationExpirationUseCase } from '../validate-email-confirmation-expiration/validate-email-confirmation-expiration.use-case';

@Injectable()
export class ConfirmEmailUseCase {
	constructor(
		@Inject(GetExistingUserUseCase)
		private readonly getExistingUserUseCase: GetExistingUserUseCase,
		@Inject(GetExistingEmailConfirmationUseCase)
		private readonly getExistingEmailConfirmationUseCase: GetExistingEmailConfirmationUseCase,
		@Inject(UpdateEmailConfirmationUseCase)
		private readonly updateEmailConfirmationUseCase: UpdateEmailConfirmationUseCase,
		@Inject(ValidateEmailConfirmationExpirationUseCase)
		private readonly validateEmailConfirmationExpirationUseCase: ValidateEmailConfirmationExpirationUseCase,
		@Inject(UpdateUserUseCase)
		private readonly updateUserUseCase: UpdateUserUseCase,
		@Inject(RequestEmailVerificationUseCase)
		private readonly requestEmailVerificationUseCase: RequestEmailVerificationUseCase,
	) {}

	async execute(userId: string, validateEmailConfirmationOtpDto: ValidateEmailConfirmationOtpDto): Promise<{ message: string }> {
		const otpCode = new OtpCode(validateEmailConfirmationOtpDto.otp_code);

		const emailConfirmation = await this.getExistingEmailConfirmationUseCase.execute(
			{
				where: {
					user_id: userId,
					otp_code: otpCode.getValue(),
					status: EMAIL_CONFIRMATION_STATUS.PENDING,
					validated: true,
				},
			},
			{ throwIfNotFound: false },
		);

		if (!emailConfirmation) {
			throw new BadRequestException('Nenhum código OTP validado encontrado. Por favor, valide o código OTP primeiro.');
		}

		const user = await this.getExistingUserUseCase.execute({
			where: { id: emailConfirmation.user_id },
		});

		await this.validateEmailConfirmationExpirationUseCase.execute(emailConfirmation);

		if (emailConfirmation.type === EMAIL_CONFIRMATION_TYPE.CHANGE_EMAIL) {
			if (!emailConfirmation.new_email) {
				throw new BadRequestException('Novo email não encontrado para troca de email.');
			}

			await this.getExistingUserUseCase.execute(
				{
					where: { email: emailConfirmation.new_email },
				},
				{ throwIfFound: true, throwIfNotFound: false },
			);

			await this.updateUserUseCase.execute(user.id, {
				email: emailConfirmation.new_email,
				email_verified: false,
			});
		} else {
			await this.updateUserUseCase.execute(user.id, {
				email_verified: true,
			});
		}

		await this.updateEmailConfirmationUseCase.execute(emailConfirmation.id, {
			status: EMAIL_CONFIRMATION_STATUS.USED,
			validated: true,
		});

		if (emailConfirmation.type === EMAIL_CONFIRMATION_TYPE.CHANGE_EMAIL) {
			await this.requestEmailVerificationUseCase.execute(user.id);
			return {
				message: 'Email alterado com sucesso. Enviamos um novo código para verificar o novo email. Você também pode fazer isso manualmente depois.',
			};
		}

		return { message: 'Seu email foi verificado.' };
	}
}
