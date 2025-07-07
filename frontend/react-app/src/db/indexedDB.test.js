import { initDB, saveFormData, fetchFormData, deleteFormData } from './indexedDB';

describe('IndexedDB Tests', () => {
    beforeAll(async () => {
        // Initialize the database before running tests
        await initDB();
    });

    test('should save form data', async () => {
        const testData = { id: 1, name: 'Test Name', value: 'Test Value' };
        await saveFormData(testData);
        const allData = await fetchFormData();
        expect(allData).toContainEqual(testData);
    });

    test('should fetch all form data', async () => {
        const testData1 = { id: 2, name: 'Test Name 1', value: 'Test Value 1' };
        const testData2 = { id: 3, name: 'Test Name 2', value: 'Test Value 2' };
        await saveFormData(testData1);
        await saveFormData(testData2);
        const allData = await fetchFormData();
        expect(allData).toEqual(expect.arrayContaining([testData1, testData2]));
    });

    test('should delete form data by id', async () => {
        const testData = { id: 4, name: 'Test Name to Delete', value: 'Test Value to Delete' };
        await saveFormData(testData);
        await deleteFormData(4);
        const allData = await fetchFormData();
        expect(allData).not.toContainEqual(testData);
    });
});
