import { BadRequestException } from '@nestjs/common';

export class AlreadyLoggedInOrganizationException extends BadRequestException {
	constructor() {
		super('Você já está logado nesta organização.');
		this.name = 'AlreadyLoggedInOrganizationException';
	}
}
