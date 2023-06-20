import { QueryBuilderAPI } from "../core/query-builders/api-query-language";
import { Repository } from "../core/data-access-layer/entity-repository";
import { DataAccessLayer } from "../core/data-access-layer/data-access-layer";
import { DatabaseConnection } from "../core/database/database-connection";
import { UserEntity } from "./user.entity"
import { LilORM } from "../api"

describe('Repository', () => {
    let repository: Repository<UserEntity>;
    let qbMock: QueryBuilderAPI;
    let lilOrm: LilORM;

    beforeEach(async () => {
        const connectionString = ':memory:';
        qbMock = new QueryBuilderAPI();
        lilOrm = new LilORM(connectionString);
        await lilOrm.createTable(UserEntity);
        repository = lilOrm.getRepository(UserEntity);
    });

    it('should insert a UserEntity', async () => {
        const userEntity = new UserEntity();
        userEntity.id = 1;
        userEntity.name = 'test';
        userEntity.email = 'test@example.com';
        await repository.insert(userEntity);
        const users = await repository.retrieve(qb => qb.where('id').equals(1));
        expect(users[0]).toEqual(userEntity);
    });

    it('should update a UserEntity', async () => {
        const userEntity = new UserEntity();
        userEntity.id = 1;
        userEntity.name = 'test';
        userEntity.email = 'test@example.com';

        await repository.insert(userEntity);
        userEntity.name = 'updated';
        await repository.update(userEntity, qb => qb.where('id').equals(1));
        const users = await repository.retrieve(qb => qb.where('id').equals(1));
        expect(users[0].name).toEqual('updated');
    });

    it('should delete a UserEntity', async () => {
        const userEntity = new UserEntity();
        userEntity.id = 1;
        userEntity.name = 'test';
        userEntity.email = 'test@example.com';

        await repository.insert(userEntity);
        await repository.delete(qb => qb.where('id').equals(1));
        const users = await repository.retrieve(qb => qb.where('id').equals(1));
        expect(users.length).toEqual(0);
    });
});