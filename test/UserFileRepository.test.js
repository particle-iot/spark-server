/* eslint-disable */
import test from 'ava';
import sinon from 'sinon';
import TestData from './setup/TestData';
import UserFileRepository from '../src/repository/UserFileRepository';

// Testing memoize
test('should memoize and cache bust when mutator functions are called', async t => {
  let testIterator = 0;
  const repository = new UserFileRepository('path');
  const user = await repository.createWithCredentials(TestData.getUser());
  const fileManager = repository._fileManager;
  const getAllSpy = sinon.spy(fileManager, 'getAllData');
  const getByIDSpy = sinon.spy(fileManager, 'getFile');
  const deleteByIDSpy = sinon.spy(fileManager, 'deleteFile');

  async function testAllAccessors() {
    testIterator++;

    await repository.getAll();
    t.truthy(getAllSpy.callCount === testIterator);
    await repository.getAll();
    t.truthy(getAllSpy.callCount === testIterator);

    await repository.getByID(user.id);
    t.truthy(getByIDSpy.callCount === testIterator);
    await repository.getByID(user.id);
    t.truthy(getByIDSpy.callCount === testIterator);

    await repository.getByUsername(user.username);
    t.truthy(getAllSpy.callCount === testIterator);
    await repository.getByUsername(user.username);
    t.truthy(getAllSpy.callCount === testIterator);
  }

  await testAllAccessors();

  await repository.updateByID(user.id, user);
  await testAllAccessors();

  await repository.deleteByID(user.id);
  await testAllAccessors();
  t.truthy(deleteByIDSpy.callCount === 1);
});
