import { Column, Entity, PrimaryKey } from "../core/decorators";
import { QueryBuilderAPI } from "../core/query-builders/api-query-language";
import "reflect-metadata"

//@ts-ignore
@Entity("users")
class UserEntity {
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

describe("QueryBuilderAPI", () => {
  let queryBuilder: QueryBuilderAPI;

  beforeEach(() => {
    queryBuilder = new QueryBuilderAPI();
  });

  it("should build a simple select query", () => {
    const query = queryBuilder.forEntity(UserEntity).void()?.build();

    expect(query?.trim()).toBe("SELECT * FROM users");
  });

  it("should build an insert query", () => {
    const query = queryBuilder
      .insertInto(UserEntity)
      .setObject({ id: 1, name: "John", email: "john@example.com" })
      .build();
      
    expect(query.trim()).toBe("INSERT INTO users (id, name, email) VALUES (1, 'John', 'john@example.com')");
  });

  it("should build an update query", () => {
    const query = queryBuilder
      .update(UserEntity)
      .setObject({ name: "John Doe", age: 30 })
      .build();

    expect(query.trim()).toBe("UPDATE users SET name = 'John Doe', age = 30");
  });

  it("should build a delete query", () => {
    const query = queryBuilder
      .deleteFrom(UserEntity)
      .build();

    expect(query.trim()).toBe("DELETE FROM users");
  });

  /*it("should build a select query with ordering", () => {
    const query = queryBuilder
      .forEntity(UserEntity).void()?.orderBy("name", "ASC")
      .build();

    expect(query).toBe("SELECT * FROM users ORDER BY name ASC");
  });

  it("should build a select query with grouping", () => {
    const query = queryBuilder
      .forEntity(UserEntity).void()?.groupBy("country", "city")
      .build();

    expect(query).toBe("SELECT * FROM users GROUP BY country, city");
  });*/
});
