import { Column, Entity, PrimaryKey } from "../src/core/decorators";
import { QueryBuilderAPI } from "../src/core/query-builders/api-query-language";
import "reflect-metadata"
import { UserEntity } from "./user.entity";

describe("QueryBuilderAPI", () => {
  let queryBuilder: QueryBuilderAPI;

  beforeEach(() => {
    queryBuilder = new QueryBuilderAPI();
  });

  it("should build a simple select query", () => {
    const query = queryBuilder.forEntity(UserEntity).finalize().build();

    expect(query?.trim()).toBe("SELECT * FROM users");
  });

  it("should build a simple where query", () => {
    const query = queryBuilder.forEntity(UserEntity)
    .where('email').equals('test@email.com').and('id')
    .equals(1).build();

    expect(query?.trim()).toBe("SELECT * FROM users WHERE users.email = 'test@email.com' AND users.id = 1");
  });

  it("should build an insert query", () => {
    const query = queryBuilder
      .insertInto(UserEntity)
      .setObject({ id: 1, name: "John", email: "john@example.com" })
      .finalize().build();
      
    expect(query.trim()).toBe("INSERT INTO users (id, name, email) VALUES (1, 'John', 'john@example.com')");
  });

  it("should build an update query", () => {
    const query = queryBuilder
      .update(UserEntity)
      .setObject({ name: "John Doe", age: 30, isActive: false })
      .where('id').equals(1)
      .and('isActive').equals(true)
      .build();

    expect(query.trim()).toBe("UPDATE users SET name = 'John Doe', is_active = 0, age = 30 WHERE users.id = 1 AND users.is_active = 1");
  });

  it("should build a delete query", () => {
    const query = queryBuilder
      .deleteFrom(UserEntity)
      .where('id').equals(1)
      .and('isActive').equals(true)
      .build();

    expect(query.trim()).toBe("DELETE FROM users WHERE users.id = 1 AND users.is_active = 1");
  });

  it("should build a complex where query with AND and OR conditions", () => {
    const query = queryBuilder.forEntity(UserEntity)
      .where('email').equals('test@email.com')
      .and('id').equals(1)
      .or('name').equals('John Doe')
      .build();
  
    expect(query?.trim()).toBe("SELECT * FROM users WHERE users.email = 'test@email.com' AND users.id = 1 OR users.name = 'John Doe'");
  });

  it("should build a compound where query", () => {
    const query = queryBuilder
      .forEntity(UserEntity)
      .where('email').equals('test@email.com')
      .and('id').equals(1)
      .or('age').equals(30)
      .and('isActive').equals(true)
      .build();
  
    expect(query.trim()).toBe("SELECT * FROM users WHERE users.email = 'test@email.com' AND users.id = 1 OR users.age = 30 AND users.is_active = 1");
  });

  /*it("should build a query with a complex nested condition", () => {
    const query = queryBuilder.forEntity(UserEntity)
      .where('isActive').equals(true)
      .andNested((nested) => nested
        .where('age').greaterThan(30)
        .or('email').like('%example.com')
      )
      .build();
  
    expect(query?.trim()).toBe("SELECT * FROM users WHERE users.isActive = true AND (users.age > 30 OR users.email LIKE '%example.com')");
  });*/
});
