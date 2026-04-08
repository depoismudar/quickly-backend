export enum EmailConfirmationTemplateType {
	EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
	EMAIL_CHANGE_REQUEST = 'EMAIL_CHANGE_REQUEST',
}

export class SendEmailConfirmationEmailDto {
	email: string;
	otpCode: string;
	templateType: EmailConfirmationTemplateType;
	newEmail?: string;
}
