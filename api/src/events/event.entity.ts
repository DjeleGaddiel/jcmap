import { 
  Column, 
  Entity, 
  ManyToOne, 
  ManyToMany,
  PrimaryGeneratedColumn, 
  Index,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "../users/user.entity";
import { Organization } from "../organizations/organization.entity";

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  type: string;

  @Column({ default: 'general' })
  category: string;

  @Column("double precision")
  latitude: number;

  @Column("double precision")
  longitude: number;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: string;

  @Column()
  address: string;

  @Column()
  startDatetime: Date;

  @Column()
  endDatetime: Date;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @ManyToOne(() => User, (user) => user.events, { eager: true })
  organizer: User;

  @ManyToOne(() => Organization, (org) => org.events, { nullable: true, eager: true })
  organization: Organization;

  @ManyToMany(() => User, (user) => user.participatingEvents)
  participants: User[];

  @ManyToMany(() => User, (user) => user.favoriteEvents)
  favoritedBy: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}