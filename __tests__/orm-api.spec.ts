import { LilORM } from "../src/api";
import { DBSMType } from "../src/core/type-maps/lil-orm-types";
import { UserEntity } from "./user.entity";

describe('LilORM API', () => {
    let lilOrm: LilORM;
    const dbsmType: DBSMType = 'sqlite';

    beforeEach(async () => {
        lilOrm = new LilORM(':memory:', dbsmType);

        await lilOrm.createTable(UserEntity);

        const user = new UserEntity();
        user.id = 1;
        user.name = 'John Doe';
        user.email = 'john@example.com';
        user.isActive = false;
        user.permission = 42;
        user.income = 50000.69;
        user.config = { allowed: true };
        const repository = lilOrm.getRepository(UserEntity);

        await repository.insert(user);
    });

    afterEach(async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.delete(qb => qb.where('id').isNot(null));
        lilOrm.dbInstance.releaseConnection();
    });

    it('inserts and retrieves a UserEntity', async () => {
        const user = new UserEntity();
        user.id = 12;
        user.name = 'John Doe';
        user.email = 'john@example.com';
        user.isActive = true;
        user.permission = 42;
        user.income = 50000.69;
        user.lastLogin = new Date();
        user.config = { allowed: true };

        const repository = lilOrm.getRepository(UserEntity);
        repository.enableDebugMode()

        await repository.insert(user, true);

        const retrievedUser = await repository.retrieve(qb => qb.where('id').equals(12));

        expect(retrievedUser[0].id).toBe(user.id);
        expect(retrievedUser[0].name).toBe(user.name);
        expect(retrievedUser[0].email).toBe(user.email);
        expect(retrievedUser[0].isActive).toBe(user.isActive);
        expect(retrievedUser[0].permission).toBe(user.permission);
        expect(retrievedUser[0].income).toBe(user.income);
        expect(retrievedUser[0].config).toEqual(user.config);

        expect(retrievedUser[0].lastLogin.getFullYear()).toBe(user.lastLogin.getFullYear());
        expect(retrievedUser[0].lastLogin.getMonth()).toBe(user.lastLogin.getMonth());
        expect(retrievedUser[0].lastLogin.getDate()).toBe(user.lastLogin.getDate());
        expect(retrievedUser[0].lastLogin.getHours()).toBe(user.lastLogin.getHours());
        expect(retrievedUser[0].lastLogin.getMinutes()).toBe(user.lastLogin.getMinutes());
        expect(retrievedUser[0].lastLogin.getSeconds()).toBe(user.lastLogin.getSeconds());
    });

    it('updates a UserEntity', async () => {
        const repository = lilOrm.getRepository(UserEntity);

        await repository.update({ name: 'Jane Doe' }, qb => qb.where('id').equals(1));

        const updatedUser = await repository.retrieve(qb => qb.where('id').equals(1));
        expect(updatedUser[0].name).toBe('Jane Doe');
    });

    it('deletes a UserEntity', async () => {
        const repository = lilOrm.getRepository(UserEntity);

        await repository.delete(qb => qb.where('id').equals(1));

        const deletedUser = await repository.retrieve(qb => qb.where('id').equals(1));
        expect(deletedUser.length).toBe(0);
    });

    it('queries using jsonContains', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        const users = await repository.retrieve(
            qb => qb.where('config').jsonContains('allowed', true)
        );

        expect(users.every(u => u.config.allowed)).toBe(true);
    });

    it('applies OnInsert and OnUpdate hooks correctly', async () => {
        const user = new UserEntity();
        user.id = 2;
        user.name = 'Hook Test';
        user.createdAt = new Date(2000, 0, 1); // This should be overridden by OnInsert

        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert(user);

        const insertedUser = await repository.retrieve(qb => qb.where('id').equals(2));
        expect(insertedUser[0].createdAt).not.toEqual(new Date(2000, 0, 1));

        await repository.update({ name: 'Hook Update Test' }, qb => qb.where('id').equals(2));
        const updatedUser = await repository.retrieve(qb => qb.where('id').equals(2));
        expect(updatedUser[0].updatedAt).toBeDefined();
    });

    it('handles complex queries with nested JSON', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert({
            id: 3,
            name: 'Nested Json',
            email: 'nested@example.com',
            config: { details: { level: 42, interests: ['coding', 'testing'] } },
            createdAt: new Date()
        });

        const users = await repository.retrieve(
            qb => (dbsmType as string) === 'sqlite' ? qb.where('config').jsonContains('details.level', 42) : qb.where('config').jsonContains('details', { level: 42 })
        );

        expect(users[0].config.details.level).toBe(42);
        expect(users[0].config.details.interests).toContain('coding');
    });

    it('ensures transactional integrity', async () => {
        const repository = lilOrm.getRepository(UserEntity);

        try {
            await lilOrm.transaction.begin();
            await repository.insert({ id: 4, name: 'Transaction Test', createdAt: new Date() });
            // Insert a duplicate id to cause an error
            await repository.insert({ id: 4, name: 'Transaction Test Fail', createdAt: new Date() });
            await lilOrm.transaction.commit();
        } catch (error) {
            await lilOrm.transaction.rollback();
        }

        const users = await repository.retrieve(qb => qb.where('id').equals(4));
        expect(users.length).toBe(0); // The transaction rollback should prevent any insertion
    });

    it('finds the meaning of life', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert({
            id: 42,
            name: 'The Answer',
            email: 'universe@example.com',
            isActive: true,
            createdAt: new Date()
        });

        const theAnswer = await repository.retrieve(
            qb => qb.where('id').equals(42)
        );

        expect(theAnswer[0].name).toBe('The Answer');
    });

    it('supports complex OR and AND combinations', async () => {
        const repository = lilOrm.getRepository(UserEntity);

        await repository.insert([
            { id: 2, name: 'Complex Query', isActive: false, createdAt: new Date() },
            { id: 5, name: 'Complex Query 1', isActive: false, createdAt: new Date() },
            { id: 6, name: 'Complex Query 2', isActive: true, createdAt: new Date() }
        ], true);

        const users = await repository.retrieve(
            qb => qb.where('isActive').equals(true)
                .or(qb2 => qb2.where('name').like('%Query%')
                    .and('id').compare('>=', 4))
        );

        expect(users.length).toBe(2);
    });

    it('conditionally updates UserEntity based on email', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        repository.enableDebugMode()
        await repository.update({ isActive: true }, qb => qb.where('email').equals('john@example.com'));
        const updatedUser = await repository.retrieve(qb => qb.where('id').equals(1));
        expect(updatedUser[0].isActive).toBe(true);
    });

    it('inserts UserEntity with specific JSON config', async () => {
        const user = new UserEntity();
        user.id = 13;
        user.config = { notifications: true };
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert(user);
        const retrievedUser = await repository.retrieve(qb => qb.where('id').equals(13));
        expect(retrievedUser[0].config.notifications).toBe(true);
    });

    it('deletes UserEntities with permission below a threshold', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        repository.enableDebugMode()
        await repository.insert({ id: 14, permission: 5 });

        await repository.delete(qb => qb.where('permission').compare('<', 10));

        const users = await repository.retrieve(qb => qb.where('id').equals(14));

        expect(users.find(u => u.id === 14)).toBeUndefined();
    });

    it('handles entities with dates correctly', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert({ id: 15, lastLogin: new Date(2020, 1, 1) });
        const retrievedUser = await repository.retrieve(qb => qb.where('id').equals(15));
        expect(new Date(retrievedUser[0].lastLogin)).toEqual(new Date(2020, 1, 1));
    });

    it('ensures transactional integrity with multiple operations', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        try {
            await lilOrm.transaction.begin();
            await repository.insert({ id: 16, name: 'Transaction Test' });
            await repository.insert({ id: 16, name: 'Should Fail' });
            await lilOrm.transaction.commit();
        } catch (error) {
            await lilOrm.transaction.rollback();
        }
        const users = await repository.retrieve(qb => qb.where('id').equals(16));
        expect(users.length).toBe(0);
    });

    it('retrieves UserEntity with complex JSON query', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert({ id: 17, config: { deep: { nested: true } } });
        const users = await repository.retrieve(qb => qb.where('config').jsonContains('deep', { nested: true }));
        expect(users.length).toBeGreaterThan(0);
        expect(users[0].id).toBe(17);
    });

    it('updates UserEntity and checks hooks', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.update({ name: 'Updated Name' }, qb => qb.where('id').equals(1));
        const updatedUser = await repository.retrieve(qb => qb.where('id').equals(1));
        expect(updatedUser[0].name).toBe('Updated Name');
        expect(updatedUser[0].updatedAt).toBeDefined();
    });

    it('performs bulk insert and retrieves multiple UserEntities', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert([
            { id: 18, name: 'Bulk Insert 1' },
            { id: 19, name: 'Bulk Insert 2' }
        ], true);
        const users = await repository.retrieve(qb => qb.where('id').compare('>=', 18));
        expect(users.length).toBe(2);
    });

    it('filters UserEntities by a specific last login date', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert({ id: 27, name: 'Last Login Filter Test', lastLogin: new Date(2021, 0, 15) });
        const users = await repository.retrieve(qb => qb.where('lastLogin').equals(new Date(2021, 0, 15)));
        expect(users.length).toBeGreaterThan(0);
        expect(users[0].name).toBe('Last Login Filter Test');
    });

    it('updates UserEntity last login date and retrieves it', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        const newDate = new Date(2022, 11, 25);
        await repository.update({ lastLogin: newDate }, qb => qb.where('id').equals(1));
        const updatedUser = await repository.retrieve(qb => qb.where('id').equals(1));
        expect(new Date(updatedUser[0].lastLogin)).toEqual(newDate);
    });

    it('retrieves UserEntities with last login after a specific date', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        const specificDate = new Date(2021, 5, 1);
        await repository.insert({ id: 28, name: 'After Specific Last Login', lastLogin: new Date(2021, 6, 1) });
        const users = await repository.retrieve(qb => qb.where('lastLogin').compare('>', specificDate));
        expect(users.some(u => u.id === 28)).toBe(true);
    });

    it('retrieves UserEntities with last login before a specific date', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        const specificDate = new Date(2023, 0, 1);
        await repository.insert({ id: 29, name: 'Before Specific Last Login', lastLogin: new Date(2022, 11, 31) });
        const users = await repository.retrieve(qb => qb.where('lastLogin').compare('<', specificDate));
        expect(users.some(u => u.id === 29)).toBe(true);
    });

    it('retrieves UserEntities with last login within a specific date range', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        const startDate = new Date(2022, 0, 1);
        const endDate = new Date(2022, 11, 31);
        await repository.insert([
            { id: 30, name: 'Within Last Login Range 1', lastLogin: new Date(2022, 5, 15) },
            { id: 31, name: 'Within Last Login Range 2', lastLogin: new Date(2022, 6, 15) }
        ], true);
        const users = await repository.retrieve(qb => qb.where('lastLogin').compare('>=', startDate).and('lastLogin').compare('<=', endDate));
        expect(users.length).toBe(2);
        expect(users.some(u => u.id === 30)).toBe(true);
        expect(users.some(u => u.id === 31)).toBe(true);
    });

    it('inserts UserEntity with future last login date and retrieves it', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        const futureDate = new Date(new Date().getFullYear() + 1, 0, 1);
        await repository.insert({ id: 32, name: 'Future Last Login Test', lastLogin: futureDate });
        const retrievedUser = await repository.retrieve(qb => qb.where('id').equals(32));
        expect(retrievedUser[0].name).toBe('Future Last Login Test');
        expect(new Date(retrievedUser[0].lastLogin)).toEqual(futureDate);
    });

    it('retrieves UserEntities not logged in after a specific date', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        const specificDate = new Date(2023, 0, 1);
        await repository.insert({ id: 33, name: 'Not Logged In Test', lastLogin: new Date(2022, 11, 31) });
        const users = await repository.retrieve(qb => qb.where('lastLogin').compare('<', specificDate));
        expect(users.some(u => u.id === 33)).toBe(true);
    });

    it('prevents SQL Injection via input sanitization', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        const maliciousString = "'; DROP TABLE UserEntity; --";
        const user = new UserEntity();
        user.id = 34;
        user.name = maliciousString;
        user.email = 'test@example.com';

        await repository.insert(user);

        const retrievedUser = await repository.retrieve(qb => qb.where('name').equals(maliciousString));
        expect(retrievedUser.length).toBe(1);
        expect(retrievedUser[0].name).toBe(maliciousString);
    });

    it('finds entities with a specific field set to null', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert({ id: 2, name: 'Test User 1', email: null });

        const users = await repository.retrieve(qb => qb.where('email').is(null));
        expect(users).toHaveLength(1);
        expect(users[0].name).toBe('Test User 1');
    });

    it('finds entities with a specific field not set to null', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert({ id: 2, name: 'Test User 2', email: 'user2@example.com' });

        const users = await repository.retrieve(qb => qb.where('email').isNot(null));
        expect(users.some(user => user.id === 2)).toBe(true);
    });


    it('updates a field to be null', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert({ id: 3, name: 'Test User 3', email: 'user3@example.com' });

        await repository.update({ email: null }, qb => qb.where('id').equals(3));
        const updatedUser = await repository.retrieve(qb => qb.where('id').equals(3));

        expect(updatedUser[0].email).toBeNull();
    });

    it('inserts entities with both null and non-null fields', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert([
            { id: 4, name: 'Test User 4', email: null },
            { id: 5, name: 'Test User 5', email: 'user5@example.com' }
        ]);

        const users = await repository.retrieve(qb => qb.where('id').compare('>=', 4));
        expect(users).toHaveLength(2);
        expect((users.find(user => user.id === 4) as any).email).toBeNull();
        expect((users.find(user => user.id === 5) as any).email).not.toBeNull();
    });

    it('retrieves entities by comparing a field against null and non-null values', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert({ id: 6, name: 'Test User 6', email: null });
        await repository.insert({ id: 7, name: 'Test User 7', email: 'user7@example.com' });

        const nullEmailUsers = await repository.retrieve(qb => qb.where('email').is(null));
        const nonNullEmailUsers = await repository.retrieve(qb => qb.where('email').isNot(null));

        expect(nullEmailUsers.some(user => user.id === 6)).toBe(true);
        expect(nonNullEmailUsers.some(user => user.id === 7)).toBe(true);
    });

    it('correctly stores and retrieves UTC dates', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        const utcDate = new Date('2024-01-01T12:00:00Z');

        await repository.insert({ id: 2, name: 'UTC Test', lastLogin: utcDate });
        const retrievedUser = await repository.retrieve(qb => qb.where('id').equals(2));

        expect(new Date(retrievedUser[0].lastLogin).toISOString()).toBe(utcDate.toISOString());
    });

    it('handles dates from different timezones correctly', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        const nyDate = new Date('2024-01-01T07:00:00-05:00');

        await repository.insert({ id: 2, name: 'Timezone Test', lastLogin: nyDate });
        const retrievedUser = await repository.retrieve(qb => qb.where('id').equals(2));

        expect(new Date(retrievedUser[0].lastLogin).toISOString()).toBe(nyDate.toISOString());
    });

    it('performs timezone-sensitive query operations correctly', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        const beforeDate = new Date('2024-01-01T11:00:00Z');
        const afterDate = new Date('2024-01-01T13:00:00Z');

        await repository.insert({ id: 3, name: 'Query Timezone Test', lastLogin: new Date('2024-01-01T12:00:00Z') });
        const users = await repository.retrieve(qb => qb.where('lastLogin').compare('>', beforeDate).and('lastLogin').compare('<', afterDate));

        expect(users.length).toBe(1);
        expect(users[0].id).toBe(3);
    });


    it('retrieves entities within a specific numeric range', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert([
            { id: 101, name: 'Range Test 1', permission: 10 },
            { id: 102, name: 'Range Test 2', permission: 20 },
            { id: 103, name: 'Range Test 3', permission: 30 }
        ]);

        const users = await repository.retrieve(
            qb => qb.where('permission').compare('>=', 15).and('permission').compare('<=', 25)
        );

        expect(users.length).toBe(1);
        expect(users[0].name).toBe('Range Test 2');
    });

    it('conditionally updates entities based on specific criteria', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert([
            { id: 104, name: 'Update Test 1', isActive: false },
            { id: 105, name: 'Update Test 2', isActive: false }
        ]);

        await repository.update({ isActive: true }, qb => qb.where('id').equals(104));

        const updatedUser = await repository.retrieve(qb => qb.where('id').equals(104));
        const nonUpdatedUser = await repository.retrieve(qb => qb.where('id').equals(105));

        expect(updatedUser[0].isActive).toBe(true);
        expect(nonUpdatedUser[0].isActive).toBe(false);
    });

    it('retrieves entities by substring search', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert({ id: 106, name: 'Substring Search', email: 'substring@example.com' });

        const users = await repository.retrieve(
            qb => qb.where('email').like('%sub%')
        );

        expect(users.length).toBeGreaterThan(0);
        expect(users[0].email).toContain('substring');
    });
});
