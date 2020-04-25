import bcrypt from "bcryptjs";
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  ManyToMany,
  JoinTable
} from "typeorm";
import {Role} from "../entities/Role";


@Entity("users")
@Unique(["email", "username"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdDate: Date;

  @Column({ nullable: true })
  lastPresentLoggedDate: Date;

  @Column({ nullable: true })
  lastSuccessfulLoggedDate: Date;

  @Column({ nullable: true })
  lastFailedLoggedDate: Date;

  @Column("smallint",{default:0,nullable: true})
  is_active: number;

  async setPassword(newPassword: string) {
    this.password = await bcrypt.hash(newPassword, 10);
  }

  @BeforeInsert()
  async encryptPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
  @ManyToMany(type => Role)
  @JoinTable({ name:'users_roles'})

  roles: Role[];

}
