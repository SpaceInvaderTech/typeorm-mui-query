import { DataSource } from 'typeorm';
import { Test } from './entity_test';

export const ds = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [Test],
  synchronize: true,
});
