import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany
} from "typeorm";
import {Permission} from "./Permission";

@Entity("roles")
@Unique(["name"])
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany((type) => Permission, (permission) => permission.role, {
    cascade: true,
    onDelete: "CASCADE",
  })
  public permissions: Permission[];
}
