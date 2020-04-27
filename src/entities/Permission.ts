import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    ManyToOne
  } from "typeorm";
import {Role} from "./Role";

  @Entity("permissions")
  export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    public resource: string;

    @Column()
    public action: string;

    @Column()
    public attributes: string;

    @ManyToOne((type) => Role, (role) => role.permissions, {
      onDelete: "CASCADE",
    })
    public role: Role;

  }
