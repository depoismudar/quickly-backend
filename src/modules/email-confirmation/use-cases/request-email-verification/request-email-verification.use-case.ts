import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { GetExistingUserUseCase } from '@/modules/users/use-cases/get-existing-user/get-existing-user.use-case';
import { OtpCode } from '@/shared/value-objects/otp-code';
import { EmailAlreadyVerifiedException } from '../../errors/email-already-verified.error';
import type { CreateEmailConfirmationDto } from '../../models/dto/input/create-email-confirmation.dto';
import { EmailConfirmationTemplateType } from '../../models/dto/input/send-email-confirmation-email.dto';
import type { EmailConfirmationRepositoryInterface } from '../../models/interfaces/email-confirmation-repository.interface';
import { EMAIL_CONFIRMATION_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/email-confirmation-repository-interface-key';
import { EMAIL_CONFIRMATION_STATUS } from '../../shared/interfaces/email-confirmation-status';
import { EMAIL_CONFIRMATION_TYPE } from '../../shared/interfaces/email-confirmation-type';
import { CheckEmailConfirmationAttemptsUseCase } from '../check-email-confirmation-attempts/check-email-confirmation-attempts.use-case';
import { GetExistingEmailConfirmationUseCase } from '../get-existing-email-confirmation/get-existing-email-confirmation.use-case';
import { SendEmailConfirmationEmailUseCase } from '../send-email-confirmation-email/send-email-confirmation-email.use-case';
import { UpdateEmailConfirmationUseCase } from '../update-email-confirmation/update-email-confirmation.use-case';

@Injectable()
export class RequestEmailVerificationUseCase {
	constructor(
		@Inject(EMAIL_CONFIRMATION_REPOSITORY_INTERFACE_KEY)
		private readonly emailConfirmationRepository: EmailConfirmationRepositoryInterface,
		@Inject(GetExistingUserUseCase)
		private readonly getExistingUserUseCase: GetExistingUserUseCase,
		@Inject(GetExistingEmailConfirmationUseCase)
		private readonly getExistingEmailConfirmationUseCase: GetExistingEmailConfirmationUseCase,
		@Inject(CheckEmailConfirmationAttemptsUseCase)
		private readonly checkEmailConfirmationAttemptsUseCase: CheckEmailConfirmationAttemptsUseCase,
		@Inject(UpdateEmailConfirmationUseCase)
		private readonly updateEmailConfirmationUseCase: UpdateEmailConfirmationUseCase,
		@Inject(SendEmailConfirmationEmailUseCase)
		private readonly sendEmailConfirmationEmailUseCase: SendEmailConfirmationEmailUseCase,
	) {}

	async execute(userId: string): Promise<void> {
		// 1. Validate User Exists
		const user = await this.getExistingUserUseCase.execute({
			where: { id: userId },
		});

		// 2. Check if email is already verified
		if (user.email_verified) {
			throw new EmailAlreadyVerifiedException();
		}

		// 3. Check Attempts
		await this.checkEmailConfirmationAttemptsUseCase.execute(user.id, EMAIL_CONFIRMATION_TYPE.VERIFY_EMAIL);

		// 4. Invalidate Pending Confirmations
		const existingConfirmation = await this.getExistingEmailConfirmationUseCase.execute(
			{
				where: {
					user_id: user.id,
					status: EMAIL_CONFIRMATION_STATUS.PENDING,
					type: EMAIL_CONFIRMATION_TYPE.VERIFY_EMAIL,
				},
			},
			{ throwIfNotFound: false },
		);

		if (existingConfirmation) {
			await this.updateEmailConfirmationUseCase.execute(existingConfirmation.id, {
				status: EMAIL_CONFIRMATION_STATUS.EXPIRED,
			});
		}

		// 5. Generate OTP and Create Entity
		const otpCode = OtpCode.generate();
		const expirationDate = this.generateExpirationDate();

		const createEmailConfirmationDto: CreateEmailConfirmationDto = {
			user_id: user.id,
			otp_code: otpCode.getValue(),
			expiration_date: expirationDate,
			status: EMAIL_CONFIRMATION_STATUS.PENDING,
			validated: false,
			type: EMAIL_CONFIRMATION_TYPE.VERIFY_EMAIL,
		};

		try {
			const emailConfirmation = this.emailConfirmationRepository.create(createEmailConfirmationDto);
			await this.emailConfirmationRepository.save(emailConfirmation);

			// 6. Send Email
			await this.sendEmailConfirmationEmailUseCase.execute({
				email: user.email,
				otpCode: emailConfirmation.otp_code,
				templateType: EmailConfirmationTemplateType.EMAIL_VERIFICATION,
			});
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}

	private generateExpirationDate(): Date {
		const expirationDate = new Date();
		expirationDate.setMinutes(expirationDate.getMinutes() + 15);
		return expirationDate;
	}
}
