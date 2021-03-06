describe('The Vireo EggShell findSubValueRef', function () {
    'use strict';

    // Reference aliases
    var vireoHelpers = window.vireoHelpers;
    var vireoRunner = window.testHelpers.vireoRunner;
    var fixtures = window.testHelpers.fixtures;

    var vireo;
    beforeAll(async function () {
        vireo = await vireoHelpers.createInstance();
    });

    var publicApiMultipleTypesViaUrl = fixtures.convertToAbsoluteFromFixturesDir('publicapi/MultipleTypes.via');
    var viName = 'MyVI';

    var expectValidValueRef = function (valueRef) {
        expect(valueRef).toBeNonEmptyObject();
        expect(valueRef.typeRef).toBeNumber();
        expect(valueRef.typeRef).not.toBe(0);
        expect(valueRef.dataRef).toBeNumber();
        expect(valueRef.dataRef).not.toBe(0);
    };

    beforeAll(function (done) {
        fixtures.preloadAbsoluteUrls([
            publicApiMultipleTypesViaUrl
        ], done);
    });

    beforeAll(function () {
        vireoRunner.rebootAndLoadVia(vireo, publicApiMultipleTypesViaUrl);
    });

    describe('for a cluster of scalars', function () {
        var valueRef,
            clusterOfScalarsPath = 'dataItem_ClusterOfScalars';

        beforeAll(function () {
            valueRef = vireo.eggShell.findValueRef(viName, clusterOfScalarsPath);
        });

        it('throws for an object with no typeRef', function () {
            var invalidValueRef = function () {
                vireo.eggShell.findSubValueRef({}, 'dataItem_ClusterOfScalars');
            };

            expect(invalidValueRef).toThrow();
        });

        it('throws for an object with invalid typeRef', function () {
            var invalidValueRef = function () {
                var invalidTypeRef = {
                    typeRef: 0
                };
                vireo.eggShell.findSubValueRef(invalidTypeRef, 'dataItem_ClusterOfScalars');
            };

            expect(invalidValueRef).toThrow();
        });

        it('return undefined for a nonexistant path', function () {
            var nonExistantValueRef = vireo.eggShell.findSubValueRef(valueRef, 'nonexistantpath');
            expect(nonExistantValueRef).toBeUndefined();
        });

        it('finds values of cluster elements', function () {
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'bool'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'string'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'double'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'int32'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'int64'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'uint64'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'complex'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'time'));
        });
    });

    describe('for a 1D array', function () {
        var valueRef,
            arrayOfBooleansPath = 'dataItem_ArrayOfBoolean';

        beforeAll(function () {
            valueRef = vireo.eggShell.findValueRef(viName, arrayOfBooleansPath);
        });

        it('return undefined for invalid index', function () {
            var nonExistantValueRef = vireo.eggShell.findSubValueRef(valueRef, '-1');
            expect(nonExistantValueRef).toBeUndefined();
        });

        it('return undefined for index out of bounds', function () {
            var nonExistantValueRef = vireo.eggShell.findSubValueRef(valueRef, '10');
            expect(nonExistantValueRef).toBeUndefined();
        });

        it('finds a value', function () {
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '0'));
        });
    });

    describe('for a multidimensional array', function () {
        var valueRef,
            ndimArrayPath = 'dataItem_3DArrayOfInt32'; // Dimensions: [1, 2, 3]

        beforeAll(function () {
            valueRef = vireo.eggShell.findValueRef(viName, ndimArrayPath);
        });

        it('return undefined for an invalid path format', function () {
            var nonExistantValueRef = vireo.eggShell.findSubValueRef(valueRef, '0,0.0');
            expect(nonExistantValueRef).toBeUndefined();
        });

        it('return undefined for index out of bounds', function () {
            var nonExistantValueRef = vireo.eggShell.findSubValueRef(valueRef, '2,0,0');
            expect(nonExistantValueRef).toBeUndefined();
        });

        it('finds values for comma-separated indexes', function () {
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '0,0,0'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '0,0,2'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '0,1,2'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '1,0,0'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '1,0,2'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '1,1,2'));
        });
    });

    describe('for an array of clusters', function () {
        var valueRef,
            arrayOfClustersPath = 'dataItem_ArrayOfClusters';

        beforeAll(function () {
            valueRef = vireo.eggShell.findValueRef(viName, arrayOfClustersPath);
        });

        it('return undefined for invalid path format', function () {
            var nonExistantValueRef = vireo.eggShell.findSubValueRef(valueRef, '0,bool');
            expect(nonExistantValueRef).toBeUndefined();
        });

        it('finds values for indexes followed by "." field name', function () {
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '0.bool'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '0.string'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '1.double'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '1.int32'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '2.int64'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '2.complex'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, '2.time'));
        });
    });

    describe('for a cluster of arrays', function () {
        var valueRef,
            clusterOfArraysPath = 'dataItem_ClusterOfArrays';

        beforeAll(function () {
            valueRef = vireo.eggShell.findValueRef(viName, clusterOfArraysPath);
        });

        it('return undefined for invalid path format', function () {
            var nonExistantValueRef = vireo.eggShell.findSubValueRef(valueRef, 'booleans,0');
            expect(nonExistantValueRef).toBeUndefined();
        });

        it('return undefined for index out of bounds', function () {
            var nonExistantValueRef = vireo.eggShell.findSubValueRef(valueRef, 'booleans.3');
            expect(nonExistantValueRef).toBeUndefined();
        });

        it('finds values for fields followed by "." index', function () {
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'booleans.0'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'strings.1'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'doubles.2'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'int32s.3'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'int64s.3'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'complexes.2'));
            expectValidValueRef(vireo.eggShell.findSubValueRef(valueRef, 'times.0'));
        });
    });
});
