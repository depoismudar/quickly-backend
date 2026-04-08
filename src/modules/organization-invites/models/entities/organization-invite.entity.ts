import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '@/modules/users/models/entities/user.entity';
import { TimestampedEntity } from '@/shared/entities/timestamped.entity';
import { Organization } from '../../../organizations/models/entities/organization.entity';
import { INVITE_STATUS } from '../../shared/interfaces/invite-status';

@Entity('organization_invites')
// Acelera listagem de convites por organização e status.
@Index(['organization_id', 'status'])
@Index(['invited_user_id', 'status'])
// Evita corrida concorrente criando mais de um convite pendente para o mesmo email na mesma organização.
@Index(['organization_id', 'email'], { unique: true, where: `"status" = 'PENDING'` })
export class OrganizationInvite extends TimestampedEntity {
	@Column({ name: 'organization_id' })
	organization_id: string;

	@Column({ name: 'inviter_id' })
	inviter_id: string;

	@Column({ name: 'email' })
	email: string;

	@Column({ name: 'invited_user_id', nullable: true })
	invited_user_id: string | null;

	@Column({ name: 'expiration_date', type: 'timestamp with time zone' })
	expiration_date: Date;

	@Column({ name: 'status', type: 'enum', enum: INVITE_STATUS, default: INVITE_STATUS.PENDING })
	status: INVITE_STATUS;

	@ManyToOne(() => Organization)
	@JoinColumn({ name: 'organization_id' })
	organization: Organization;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'inviter_id' })
	inviter: User;

	@ManyToOne(() => User, { nullable: true })
	@JoinColumn({ name: 'invited_user_id' })
	invited_user: User | null;
}
