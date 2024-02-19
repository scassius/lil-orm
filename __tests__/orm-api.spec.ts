import { LilORM } from "../src/api";
import { UserEntity } from "./user.entity";

describe('LilORM API', () => {
    let lilOrm: LilORM;

    beforeEach(async () => {
        lilOrm = new LilORM(':memory:', 'sqlite');
        await lilOrm.createTable(UserEntity);
    });

    it('inserts and retrieves a UserEntity', async () => {
        const user = new UserEntity();
        user.id = 1;
        user.name = 'John Doe';
        user.email = 'john@example.com';
        user.isActive = true;
        user.permission = 42;
        user.income = 50000.69;
        user.config = { allowed: true };
        user.createdAt = new Date();

        const repository = lilOrm.getRepository(UserEntity);
        repository.enableDebugMode()

        await repository.insert(user);

        console.log(repository.debugSQLQuery)
        const retrievedUser = await repository.retrieve(qb => qb.where('id').equals(1));
        expect(retrievedUser[0].name).toBe('John Doe');
    });

    it('updates a UserEntity', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        repository.enableDebugMode();
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
            qb => qb.where('config').jsonContains('details.level', 42)
                     .and('config').jsonContains('details.interests', 'coding')
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

    it('finds the hidden easter egg', async () => {
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
        console.log("Congratulations, you've discovered the meaning of life, the universe, and everything!");
    });

    it('supports complex OR and AND combinations', async () => {
        const repository = lilOrm.getRepository(UserEntity);
        await repository.insert([
            { id: 5, name: 'Complex Query 1', email: '', isActive: false, createdAt: new Date() },
            { id: 6, name: 'Complex Query 2', email: '', isActive: true, createdAt: new Date() }
        ]);

        const users = await repository.retrieve(
            qb => qb.where('isActive').equals(true)
                .or(qb2 => qb2.where('name').like('%Query%')
                                    .and('id').greaterThan(4))
        );

        expect(users.length).toBe(2); // Should match both users due to the OR condition
    });
});
