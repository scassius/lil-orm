//import "reflect-metadata";
import { Column, Entity, PrimaryKey } from "../core/decorators";
import { LilORM } from "../";
import { Transaction } from "../core/transaction";

//@ts-ignore
@Entity("user")
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
}

describe("LilORM", () => {
  const databaseConnectionString = ":memory:";

  it("should instantiate LilORM", () => {
    const module = new LilORM(databaseConnectionString);

    expect(module).toBeDefined();
  });

  it("should migrate the database schema", async () => {
    const module = new LilORM(databaseConnectionString);

    await module.createTable(UserEntity);

    // Assert that the migration was successful by checking if the table exists in the database
    const tableExists = await module.tableExists("user");
    expect(tableExists).toBeTruthy();
  });

  it("should create a new user in the database", async () => {
    // Arrange

    const module = new LilORM(databaseConnectionString);

    await module.createTable(UserEntity);

    const repository = module.getRepository<UserEntity>(UserEntity);

    // Act
    await repository.create({
      id: 1,
      email: "test@gmail.com",
      name: "test",
      config: {
        test: true,
      },
      isActive: true,
      createdAt: new Date(),
    });

    // Assert
    const user = await repository.findOne({ id: 1 });
    expect(user).toBeDefined();
    expect(user?.email).toBe("test@gmail.com");
    expect(user?.name).toBe("test");
    expect(user?.createdAt).toBeInstanceOf(Date);
    expect(user?.isActive).toBe(true);
    expect(user?.config).toEqual({ test: true });
  });

  it("should create a new user in the database and accept null value", async () => {
    const module = new LilORM(databaseConnectionString);

    await module.createTable(UserEntity);

    const repository = module.getRepository<UserEntity>(UserEntity);

    // Act
    await repository.create({
      id: 1,
      email: "test@gmail.com",
      name: "test",
      config: null,
      isActive: true,
      createdAt: new Date(),
    });
    // Assert
    const user = await repository.findOne({ id: 1 });

    expect(user).toBeDefined();
    expect(user?.email).toBe("test@gmail.com");
    expect(user?.name).toBe("test");
    expect(user?.createdAt).toBeInstanceOf(Date);
    expect(user?.isActive).toBe(true);
    expect(user?.config).toEqual(null);
  });

  it("should retrieve all users from the database", async () => {
    // Arrange
    // ... (Same code as in the original test)

    const module = new LilORM(databaseConnectionString);

    await module.createTable(UserEntity);

    const repository = module.getRepository<UserEntity>(UserEntity);

    await repository.create({
      id: 1,
      email: "test@gmail.com",
      name: "test",
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
    expect(users[0].email).toBe("test@gmail.com");
    expect(users[0].name).toBe("test");
  });

  it("should update a user in the database", async () => {
    // Arrange
    // ... (Same code as in the original test)

    const module = new LilORM(databaseConnectionString);

    await module.createTable(UserEntity);

    const repository = module.getRepository<UserEntity>(UserEntity);

    await repository.create({
      id: 1,
      email: "test@gmail.com",
      name: "test",
      config: {
        test: true,
      },
      isActive: true,
      createdAt: new Date(),
    });

    // Act
    const updatedUser = {
      id: 1,
      email: "updated@gmail.com",
      name: "updated",
    };
    await repository.update(updatedUser);

    // Assert
    const user = await repository.findOne({ id: 1 });
    expect(user?.email).toBe("updated@gmail.com");
    expect(user?.name).toBe("updated");
  });

  it("should delete a user from the database", async () => {
    // Arrange
    // ... (Same code as in the original test)

    const module = new LilORM(databaseConnectionString);

    await module.createTable(UserEntity);

    const repository = module.getRepository<UserEntity>(UserEntity);

    await repository.create({
      id: 69,
      email: "test@gmail.com",
      name: "test",
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

  it("should begin and commit a transaction", async () => {
    const module = new LilORM(databaseConnectionString);

    await module.createTable(UserEntity);

    const repository = module.getRepository<UserEntity>(UserEntity);

    const transaction = new Transaction(repository.dbInstance);

    await (async () =>
      transaction.transaction(async (transaction) => {
        await repository.create(
          {
            id: 2,
            email: "test@gmail.com",
            name: "test",
            config: {
              test: true,
            },
            isActive: true,
            createdAt: new Date(),
          },
          transaction
        );
      }))();

    const user = await repository.findOne({ id: 2 });

    // Assert
    expect(user?.id).toBe(2);
  });

  it("should rollback a transaction", async () => {
    const module = new LilORM(databaseConnectionString);

    await module.createTable(UserEntity);

    const repository = module.getRepository<UserEntity>(UserEntity);

    const transaction = new Transaction(repository.dbInstance);

    try {
      await (async () =>
        transaction.transaction(async (transaction) => {
          await repository.create(
            {
              id: 2,
              email: "test@gmail.com",
              name: "test",
              config: {
                test: true,
              },
              isActive: true,
              createdAt: new Date(),
            },
            transaction
          );
          throw new Error();
        }))();
    } catch (error) {
      expect(error).toBeTruthy();
    }

    const user = await repository.findOne({ id: 2 });

    // Assert
    expect(user).toBeNull();
  });
});
