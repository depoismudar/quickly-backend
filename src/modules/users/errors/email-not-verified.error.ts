import { BadRequestException } from '@nestjs/common';

export class EmailNotVerifiedException extends BadRequestException {
	constructor(message = 'Email não verificado. Por favor, verifique seu email antes de continuar.') {
		super(message);
		this.name = 'EmailNotVerifiedException';
	}
}
