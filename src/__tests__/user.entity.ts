import { Column, Entity, PrimaryKey } from "../core/decorators";
import "reflect-metadata"

//@ts-ignore
@Entity("users")
export class UserEntity {
  //@ts-ignore
  @PrimaryKey({
    autoIncrement: true,
  })
  //@ts-ignore
  @Column({
    type: "INTEGER",
    name: "id",
  })
  id: number;

  //@ts-ignore
  @Column({
    type: "TEXT",
    name: "name",
  })
  name: string;

  //@ts-ignore
  @Column({
    type: "TEXT",
    name: "email",
    notNull: true,
  })
  email: string;

  //@ts-ignore
  @Column({
    type: "JSON",
    name: "config",
  })
  config: any;

  //@ts-ignore
  @Column({
    type: "BOOLEAN",
    name: "is_active",
  })
  isActive: boolean;

  //@ts-ignore
  @Column({
    type: "DATE",
    name: "created_at",
  })
  createdAt: Date;

   //@ts-ignore
   @Column({
    type: "INTEGER",
    name: "age",
  })
  age: number;
}