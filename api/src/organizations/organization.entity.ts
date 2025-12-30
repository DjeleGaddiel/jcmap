import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  Index,
  ManyToOne, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'double precision', nullable: true })
  latitude: number;

  @Column({ type: 'double precision', nullable: true })
  longitude: number;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  logoUrl: string | null;

  @Column({ default: false })
  isVerified: boolean;

  @ManyToOne(() => User, (user) => user.ownedOrganizations)
  owner: User;

  @OneToMany(() => User, (user) => user.homeChurch)
  members: User[];

  @OneToMany(() => Event, (event) => event.organization)
  events: Event[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
