import { Inject, Injectable } from '@nestjs/common';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email/send-email.use-case';
import {
	EmailConfirmationTemplateType,
	type SendEmailConfirmationEmailDto,
} from '../../models/dto/input/send-email-confirmation-email.dto';

@Injectable()
export class SendEmailConfirmationEmailUseCase {
	constructor(
		@Inject(SendEmailUseCase)
		private readonly sendEmailUseCase: SendEmailUseCase,
	) {}

	async execute(data: SendEmailConfirmationEmailDto): Promise<void> {
		const isEmailChangeRequest = data.templateType === EmailConfirmationTemplateType.EMAIL_CHANGE_REQUEST;
		const subject = isEmailChangeRequest ? 'Solicitação de troca de email' : 'Aqui está seu código';
		const title = isEmailChangeRequest ? 'Solicitação de troca de email' : 'Aqui está seu código';
		const description = isEmailChangeRequest
			? `Você solicitou uma troca de email para: <strong>${data.newEmail}</strong>. Aqui está seu código de confirmação:`
			: 'Você solicitou um código de verificação de email.';
		const footerMessage = isEmailChangeRequest
			? 'Se você não solicitou esta troca, ignore este email. A sua conta continua segura.'
			: 'Se você não solicitou este código, ignore este email. A sua conta está segura.';

		await this.sendEmailUseCase.execute({
			to: data.email,
			subject,
			html: `
				<!DOCTYPE html>
				<html lang="pt-BR">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>${title}</title>
				</head>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
						<h1 style="color: #2c3e50; margin-top: 0;">${title}</h1>
						<p>${description}</p>
						<div style="text-align: center; margin: 30px 0;">
							<div style="background-color: #3498db; color: white; padding: 20px; border-radius: 5px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
								${data.otpCode}
							</div>
						</div>
						<p style="font-size: 12px; color: #666;">Este código expira em 15 minutos.</p>
						<p style="font-size: 12px; color: #999; margin-bottom: 0;">${footerMessage}</p>
					</div>
				</body>
				</html>
			`,
		});
	}
}
