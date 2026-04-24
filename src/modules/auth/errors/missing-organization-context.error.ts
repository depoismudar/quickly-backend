import { ForbiddenException } from '@nestjs/common';

export class MissingOrganizationContextException extends ForbiddenException {
	constructor() {
		super('Organização ativa não encontrada. Faça login em uma organização para continuar.');
		this.name = 'MissingOrganizationContextException';
	}
}
