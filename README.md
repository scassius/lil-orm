![ORM](https://github.com/scassius/lil-orm/assets/35706430/5fd46412-ea3d-40b8-a56a-20450e9e2986)

# Lil ORM
Lil ORM is a lightweight ORM designed for Node.js. This compact project prioritizes clarity and simplicity in its API, making it effortless to interact with SQL databases. Although it's a lightweight ORM, it boasts a robust set of capabilities, letting developers create intricate database queries with ease.

While Lil ORM is primarily intended as a learning resource and experimental project, its lean design and user-friendly approach make it a noteworthy tool for those looking to understand the nuances of building APIs without the complexity that often accompanies larger ORMs.

Please note: Lil ORM is currently not recommended for use in production environments (yet), but rather as a learning tool and sandbox for testing and development purposes

⚠️ **API are subjected to change** ⚠️ 

# Changelog

## Version 3.1.0

### Performance Improvements
- **Bulk Insert Optimization**: Enhanced the performance of bulk insert operations, significantly reducing the time required for inserting large volumes of data.

### Bug Fixes
- **PostgreSQL Column Name Case Sensitivity**: Fixed an issue where column names were forced into lowercase, leading to errors in environments where case sensitivity is important. Now, column names are handled in a case-sensitive manner, aligning with PostgreSQL standards.

## Version 3.0.0

### Security Enhancements
- Introduced **prepared statements** to enhance security and performance.

### Features
- **Multiple DBMS Support**: Now supporting PostgreSQL and SQLite, offering flexibility across different database environments.
- **JSON Query Support**: New capabilities for querying JSON fields with functions like `jsonEquals` and `jsonContains`.
- **Expanded Type Support**: Increased range of supported data types.
- **Lifecycle Hooks**: Added `OnInsert` and `OnUpdate` hooks for custom logic during data operations.
- **Query Grouping**: Support for complex query constructions with parenthetical grouping, allowing for advanced logical combinations.
- **Transaction Support**: Enhanced support for transactional operations, ensuring data integrity across multiple operations.
- **Bulk Insert**: Added capability for bulk inserting data, improving efficiency for large data operations.

### Changes
- **API Overhaul**: Many APIs have been changed or updated to improve usability and efficiency.

## Version 2.0.0

### Added
- Default database changed to PostgreSQL.
- Support for specifying `SELECT` clauses.
- Ability to extract queries from repository for debugging.

### Planned Features
- **Integrated Complex Query Language**: Implement an integrated language for constructing complex queries, enhancing the ORM's ability to handle sophisticated data retrieval and manipulation scenarios.
- **Dynamic Object Mapping**: Enable dynamic mapping of database results to objects, supporting more flexible and dynamic data models.
- **Automatic Support for Multiple DBMS Types**: Expand the ORM to automatically support multiple Database Management Systems (DBMS), allowing seamless switching and interoperability across different database platforms.
- **Loading of Related Objects**: Introduce efficient loading mechanisms for related objects, enabling easier and more efficient handling of object relationships and dependencies in the data model.
- **Stable Support for Migrations**: Introduce stable support for database schema migrations, including the generation of migration scripts in TypeScript, to facilitate version-controlled schema changes and database evolution.

# Install 

```shell
npm i lil-orm pg
```
```shell
npm i lil-orm sqlite3
```

```shell
yarn add lil-orm pg
yarn add lil-orm sqlite3
```

# Define Entity
```typescript
@Entity('user')
class UserEntity {
  @PrimaryKey({
    autoIncrement: true,
  })
  @Column({
    type: 'integer',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'text',
    name: 'name',
  })
  name: string;

  @Column({
    type: 'text',
    name: 'email',
  })
  email: string;

  @Column({
    type: 'json',
    name: 'config',
  })
  config: any;

  @Column({
    type: 'boolean',
    name: 'is_active',
  })
  isActive: boolean;

 @Column({
    type: "date",
    name: "created_at",
  })
  @OnInsert(() => new Date())
  createdAt: Date;

  @Column({
    type: "date",
    name: "updated_at",
  })
  @OnInsert(() => new Date())
  @OnUpdate(() => new Date())
  updatedAt: Date;
}
```
 
⚠️ **Warning: Important Configuration Required**

To ensure proper functioning of the library, please make sure to configure your TypeScript project correctly.

```json
"experimentalDecorators": true,
"emitDecoratorMetadata": true,
"esModuleInterop": true,
```

**Other configurations**

**Option 1: Enable `useDefineForClassFields`**

In your project's `tsconfig.json`, add or modify the `compilerOptions` section to include the following:

```json
{
  "compilerOptions": {
    "useDefineForClassFields": true
  }
}
```
**Option 2: Initialize Every Property with Default Values**

If you cannot enable `useDefineForClassFields` or prefer not to modify your TypeScript configuration, make sure to explicitly initialize every property in your entity class with a default value.

For example:

```typescript
@Entity('tableName')
class MyEntity {
  @PrimaryKey({
    autoIncrement: true,
  })
  @Column({
    type: 'INTEGER'
  })
  id: number = 0;
  
  @Column({
    type: 'TEXT'
  })
  name: string = '';
  // ...other properties
}
```

# Module Setup
```typescript
import { LilORM } from 'lil-orm';

const databaseConnectionString = ':memory:';

const module = new LilORM(databaseConnectionString);

```

# Create Table
(experimental API name)
```typescript
module.createTable(UserEntity) //to create a table from an entity
```

# CRUD Operations
```typescript
//get repository
const repository = module.getRepository<UserEntity>(UserEntity);

//Insert 
const userEntity = new UserEntity();
userEntity.id = 1;
userEntity.name = 'test';
userEntity.email = 'test@example.com';
userEntity.isActive = false;
userEntity.age = 42;
userEntity.config = null;
userEntity.createdAt = new Date();

await repository.insert(userEntity);

//Find by id
const users = await repository.retrieve(qb => qb.where('id').equals(1));

//Update
userEntity.name = 'updated';
await repository.update(userEntity, qb => qb.where('id').equals(1));

//Delete
await repository.delete({ id: 69 });
```

# Custom query with query builder
```typescript
let user: any[] = lilOrm.retrieve<UserEntity>(
            qb => qb.forEntity(UserEntity)
            .where('isActive').equals(true)
            .and('age').greaterThan(18)
            .or('config').equals({ allowed: true })
            .finalize(), 
            (data) => data)
```

# `@OnInsert` and `@OnUpdate` Hooks

## `@OnInsert`

Executes custom logic before a new entity is saved. Commonly used to set creation timestamps.

```typescript
@Column({ type: "date", name: "created_at" })
@OnInsert(() => new Date())
createdAt: Date;
```

## `@OnUpdate`

Triggered automatically before an existing entity is updated. Typically used for updating modification timestamps.

```typescript
@Column({ type: "date", name: "updated_at" })
@OnUpdate(() => new Date())
updatedAt: Date;
```

## Debugging with `enableDebugMode`

To assist in debugging and optimizing your SQL queries, you can enable a debug mode on your ORM repository instances. This mode logs the last SQL query executed, allowing you to review the raw SQL sent to the database.

### Enabling Debug Mode

```typescript
const repository = lilOrm.getRepository(UserEntity);
repository.enableDebugMode();
console.log(repository.debugSQLQuery);
```

### Note

Debug mode is intended for development and debugging purposes. Ensure it is disabled in production environments to avoid performance overhead and potential security risks.
