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
    });

    it('should build a query and retive an object', async () => {
        let user = lilOrm.retrieve<UserEntity>(
            qb => qb.forEntity(UserEntity)
            .where('isActive').equals(true)
            .and('age').greaterThan(18)
            .or('config').equals({ allowed: true })
            .finalize(), (data) => data)
        expect(user).toBeDefined();
    });
});