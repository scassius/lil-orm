import 'reflect-metadata';
import { Column, Entity, PrimaryKey } from '../core/decorators';
import { LilORMModule } from '../core/module';
import { Transaction } from '../core/transaction';

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

describe('LilORMModule', () => {
  const databaseConnectionString = ':memory:';

  it('should instantiate LilORMModule', () => {
    const module = new LilORMModule({
      database: databaseConnectionString,
      entities: [],
    });

    expect(module).toBeDefined();
  });

  it('should migrate the database schema', async () => {
    const module = new LilORMModule({
      database: databaseConnectionString,
      entities: [UserEntity],
    });

    await module.migrate();

    // Assert that the migration was successful by checking if the table exists in the database
    const tableExists = await module.tableExists('user');
    expect(tableExists).toBeTruthy();
  });

  it('should create a new user in the database', async () => {
    // Arrange
    // ... (Same code as in the original test)

    const module = new LilORMModule({
      database: databaseConnectionString,
      entities: [UserEntity],
    });

    await module.migrate();

    const repository = module.getRepository<UserEntity>(UserEntity);

    // Act
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

    // Assert
    const user = await repository.findOne({ id: 1 });
    expect(user).toBeDefined();
    expect(user?.email).toBe('test@gmail.com');
    expect(user?.name).toBe('test');
    expect(user?.createdAt).toBeInstanceOf(Date);
    expect(user?.isActive).toBe(true);
    expect(user?.config).toEqual({ test: true });
  });

  it('should retrieve all users from the database', async () => {
    // Arrange
    // ... (Same code as in the original test)

    const module = new LilORMModule({
      database: databaseConnectionString,
      entities: [UserEntity],
    });

    await module.migrate();

    const repository = module.getRepository<UserEntity>(UserEntity);

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

    // Act
    const users = await repository.findAll();

    // Assert
    expect(users.length).toBe(1);
    expect(users[0].email).toBe('test@gmail.com');
    expect(users[0].name).toBe('test');
  });

  it('should update a user in the database', async () => {
    // Arrange
    // ... (Same code as in the original test)

    const module = new LilORMModule({
      database: databaseConnectionString,
      entities: [UserEntity],
    });

    await module.migrate();

    const repository = module.getRepository<UserEntity>(UserEntity);

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

    // Act
    const updatedUser = {
      id: 1,
      email: 'updated@gmail.com',
      name: 'updated',
    };
    await repository.update(updatedUser);

    // Assert
    const user = await repository.findOne({ id: 1 });
    expect(user?.email).toBe('updated@gmail.com');
    expect(user?.name).toBe('updated');
  });

  it('should delete a user from the database', async () => {
    // Arrange
    // ... (Same code as in the original test)

    const module = new LilORMModule({
      database: databaseConnectionString,
      entities: [UserEntity],
    });

    await module.migrate();

    const repository = module.getRepository<UserEntity>(UserEntity);

    await repository.create({
      id: 69,
      email: 'test@gmail.com',
      name: 'test',
      config: {
        test: true,
      },
      isActive: true,
      createdAt: new Date(),
    });

    // Act
    await repository.delete({ id: 69 });

    // Assert
    const user = await repository.findOne({ id: 69 });

    expect(user).toBeNull();
  });

  it('should begin a transaction', async () => {
    const module = new LilORMModule({
      database: databaseConnectionString,
      entities: [UserEntity],
    });

    await module.migrate();

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
      //throw new Error('test');
    });
  });
});
