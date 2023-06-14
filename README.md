![ORM](https://github.com/scassius/lil-orm/assets/35706430/5fd46412-ea3d-40b8-a56a-20450e9e2986)

# Lil ORM
Lil ORM is a super lightweight SQLite ORM for Node.js. With its clear API, you can easily interact with SQLite databases

⚠️ **API are subjected to change** ⚠️ 

# Install 
```shell
npm i lil-orm
```

# Define Entity
```typescript
@Entity('user')
class UserEntity {
  @PrimaryKey({
    autoIncrement: true,
  })
  @Column({
    type: 'INTEGER',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'TEXT',
    name: 'name',
  })
  name: string;

  @Column({
    type: 'TEXT',
    name: 'email',
  })
  email: string;

  @Column({
    type: 'JSON',
    name: 'config',
  })
  config: any;

  @Column({
    type: 'BOOLEAN',
    name: 'is_active',
  })
  isActive: boolean;

  @Column({
    type: 'DATE',
    name: 'created_at',
  })
  createdAt: Date;
}
```
supported types:
 - TEXT
 - INTEGER
 - REAL
 - BOOLEAN
 - DATE (ISO Format)
 - JSON

 
⚠️ **Warning: Important Configuration Required**

To ensure proper functioning of the library, please make sure to configure your TypeScript project correctly.

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
//get repository for DAO
const repository = module.getRepository<UserEntity>(UserEntity);

//Create
 await repository.create({
    id: 1,
    email: 'test@gmail.com',
    name: 'test',
    config: {
    test: true,
    },
    isActive: true,
    createdAt: new Date(),
});

//Find one
await repository.findOne({ id: 1 });

//Find all
await repository.findAll();

//Update
const updatedUser = {
    id: 1,
    email: 'updated@gmail.com',
    name: 'updated',
};
await repository.update(updatedUser);

//Delete
await repository.delete({ id: 69 });
```

# Transactions
```typescript
import { Transaction } from 'lil-orm';

const repository = module.getRepository<UserEntity>(UserEntity);

const transaction = new Transaction(repository.dbInstance);

transaction.transaction(async (transaction) => {
    repository.create(
    {
        id: 1,
        email: 'test@gmail.com',
        name: 'test',
        config: {
        test: true,
        },
        isActive: true,
        createdAt: new Date(),
    },
    transaction,
    );
});
```

