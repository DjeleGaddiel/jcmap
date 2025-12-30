import { 
  Column, 
  Entity, 
  OneToMany, 
  ManyToMany,
  ManyToOne,
  JoinTable,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';
import { Organization } from '../organizations/organization.entity';
import { UserRole } from './enums/user-role.enum';

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ select: false })
  password: string;

  // --- Infos Personnelles ---
  @Column({ nullable: true })
  fullName: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ nullable: true })
  gender: string; // "M", "F", "Other"

  @Column({ nullable: true })
  maritalStatus: string; // "Célibataire", "Marié", etc.

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: 5 })
  notificationRadius: number;

  @Column({ nullable: true })
  firebaseUid: string;

  // --- Infos Église ---
  @ManyToOne(() => Organization, (org) => org.members, { nullable: true })
  homeChurch: Organization;

  @Column({ nullable: true })
  churchRole: string; // "Pasteur", "Leader", etc.

  @Column({ nullable: true })
  membershipDate: Date;

  @OneToMany(() => Organization, (org) => org.owner)
  ownedOrganizations: Organization[];

  @OneToMany(() => Event, (event) => event.organizer)
  events: Event[];

  @ManyToMany(() => Event, (event) => event.participants)
  @JoinTable({ name: 'event_participants' })
  participatingEvents: Event[];

  @ManyToMany(() => Event, (event) => event.favoritedBy)
  @JoinTable({ name: 'user_favorite_events' })
  favoriteEvents: Event[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}