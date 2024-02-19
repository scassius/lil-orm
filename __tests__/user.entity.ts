import { Column, Entity, OnInsert, OnUpdate, PrimaryKey } from "../src/core/decorators";
import "reflect-metadata"
/* tslint:disable:comment-format */
//@ts-ignore
@Entity("users")
export class UserEntity {
  //@ts-ignore
  @PrimaryKey({
    autoIncrement: true,
  })
  //@ts-ignore
  @Column({
    type: "integer",
    name: "id",
  })
  id: number;

  //@ts-ignore
  @Column({
    type: "text"
  })
  name: string;

  //@ts-ignore
  @Column({
    type: "text",
    name: "email",
    nullable: true,
  })
  email: string;

  //@ts-ignore
  @Column({
    type: "json",
    name: "config",
    nullable: true
  })
  config: any;

  //@ts-ignore
  @Column({
    type: "boolean",
    name: "is_active",
    nullable: true
  })
  isActive: boolean;

  //@ts-ignore
  @Column({
    type: "date",
    name: "created_at",
  })
  @OnInsert(() => new Date())
  createdAt: Date;

  //@ts-ignore
  @Column({
    type: "date",
    name: "updated_at",
  })
  @OnInsert(() => new Date())
  @OnUpdate(() => new Date())
  updatedAt: Date;

  //@ts-ignore
  @Column({
    type: "integer",
    nullable: true
  })
  permission: number;

  @Column({
    type: "money",
    nullable: true
  })
  income: number;
}
/* tslint:disable:comment-format */
