import { LilORM } from "../src/api";
import { Repository } from "../src/core";
import { QueryBuilderAPI } from "../src/core/query-builders/api-query-language";
import { UserEntity } from "./user.entity";

describe('LilORM API', () => {
    let lilOrm: LilORM;

    beforeEach(async () => {
        const connectionString = ':memory:';
        lilOrm = new LilORM(connectionString);
        await lilOrm.createTable(UserEntity);

        const userEntity = new UserEntity();
        userEntity.id = 1;
        userEntity.name = 'test';
        userEntity.email = 'test@example.com';
        userEntity.isActive = true;
        userEntity.age = 42;
        userEntity.config =  { allowed: true };
        userEntity.createdAt = new Date();

        const repository = lilOrm.getRepository(UserEntity);

        await repository.insert(userEntity);
    });

    it('should build a query and retive an object', async () => {
        const user = await lilOrm.retrieve<UserEntity>(
            qb => qb.forEntity(UserEntity)
            .where('isActive').equals(true)
            .and('age').greaterThan(18)
            .or('config').equals({ allowed: true })
            .finalize(), (data) => data)
        
        expect(user[0].config).toBe('{"allowed":true}')
        expect(user[0]).toBeDefined();
    });

    it('should build a query and retive an object mapped', async () => {
        const user = await lilOrm.retrieve<UserEntity>(
            qb => qb.forEntity(UserEntity)
            .where('isActive').equals(true)
            .and('age').greaterThan(18)
            .or('config').equals({ allowed: true })
            .finalize(), (data) => lilOrm.entityMapper.sqlEntityToObj(UserEntity, data))

        expect(user[0].config).toStrictEqual({ allowed: true })
        expect(user).toBeDefined();
    });
});