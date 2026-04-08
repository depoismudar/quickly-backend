import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { EmailConfirmation } from './models/entities/email-confirmation.entity';
import { EmailConfirmationRepository } from './repository/email-confirmation.repository';
import { EMAIL_CONFIRMATION_REPOSITORY_INTERFACE_KEY } from './shared/constants/email-confirmation-repository-interface-key';
import { CheckEmailConfirmationAttemptsUseCase } from './use-cases/check-email-confirmation-attempts/check-email-confirmation-attempts.use-case';
import { ConfirmEmailController } from './use-cases/confirm-email/confirm-email.controller';
import { ConfirmEmailUseCase } from './use-cases/confirm-email/confirm-email.use-case';
import { GetExistingEmailConfirmationUseCase } from './use-cases/get-existing-email-confirmation/get-existing-email-confirmation.use-case';
import { MarkEmailConfirmationAsValidatedUseCase } from './use-cases/mark-email-confirmation-as-validated/mark-email-confirmation-as-validated.use-case';
import { RequestEmailChangeController } from './use-cases/request-email-change/request-email-change.controller';
import { RequestEmailChangeUseCase } from './use-cases/request-email-change/request-email-change.use-case';
import { RequestEmailVerificationController } from './use-cases/request-email-verification/request-email-verification.controller';
import { RequestEmailVerificationUseCase } from './use-cases/request-email-verification/request-email-verification.use-case';
import { SendEmailConfirmationEmailUseCase } from './use-cases/send-email-confirmation-email/send-email-confirmation-email.use-case';
import { UpdateEmailConfirmationUseCase } from './use-cases/update-email-confirmation/update-email-confirmation.use-case';
import { ValidateEmailConfirmationExpirationUseCase } from './use-cases/validate-email-confirmation-expiration/validate-email-confirmation-expiration.use-case';
import { ValidateEmailConfirmationOtpController } from './use-cases/validate-email-confirmation-otp/validate-email-confirmation-otp.controller';
import { ValidateEmailConfirmationOtpUseCase } from './use-cases/validate-email-confirmation-otp/validate-email-confirmation-otp.use-case';

@Module({
	imports: [TypeOrmModule.forFeature([EmailConfirmation]), EmailModule, UsersModule],
	controllers: [RequestEmailVerificationController, RequestEmailChangeController, ValidateEmailConfirmationOtpController, ConfirmEmailController],
	providers: [
		{
			provide: EMAIL_CONFIRMATION_REPOSITORY_INTERFACE_KEY,
			useFactory: (dataSource: DataSource) => {
				return new EmailConfirmationRepository(dataSource);
			},
			inject: [DataSource],
		},
		CheckEmailConfirmationAttemptsUseCase,
		ConfirmEmailUseCase,
		GetExistingEmailConfirmationUseCase,
		MarkEmailConfirmationAsValidatedUseCase,
		RequestEmailChangeUseCase,
		SendEmailConfirmationEmailUseCase,
		UpdateEmailConfirmationUseCase,
		ValidateEmailConfirmationExpirationUseCase,
		ValidateEmailConfirmationOtpUseCase,
		RequestEmailVerificationUseCase,
	],
	exports: [
		EMAIL_CONFIRMATION_REPOSITORY_INTERFACE_KEY,
		GetExistingEmailConfirmationUseCase,
		RequestEmailVerificationUseCase,
		RequestEmailChangeUseCase,
		ConfirmEmailUseCase,
	],
})
export class EmailConfirmationModule {}
