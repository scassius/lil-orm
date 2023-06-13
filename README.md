# Lil ORM
Lil ORM is a super lightweight SQLite ORM for Node.js. With its clear API, you can easily interact with SQLite databases

# Install 
```
npm i lil-orm
```

# Define Entity
```
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

# Module Setup
```
import { LilORMModule } from 'lil-orm';

const databaseConnectionString = ':memory:';

const module = new LilORM(databaseConnectionString);

```

# Create Table
(experimental API name)
```
module.createTable(UserEntity) //to create a table from an entity
```

# CRUD Operations
```
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
```
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

