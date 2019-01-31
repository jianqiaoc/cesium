defineSuite([
        'Core/CustomProjection',
        'Core/Cartesian3',
        'Core/Cartographic',
        'Core/Ellipsoid',
        'Core/Math'
    ], function(
        CustomProjection,
        Cartesian3,
        Cartographic,
        Ellipsoid,
        CesiumMath) {
    'use strict';

    beforeEach(function() {
        CustomProjection._loadedProjectionFunctions = {};
    });

    it('construct0', function() {
        var projection = new CustomProjection('Data/UserGeographic.js');
        expect(projection.ellipsoid).toEqual(Ellipsoid.WGS84);
    });

    it('construct1', function() {
        var ellipsoid = Ellipsoid.UNIT_SPHERE;
        var projection = new CustomProjection('Data/UserGeographic.js', ellipsoid);
        expect(projection.ellipsoid).toEqual(ellipsoid);
    });

    it('caches by url', function() {
        var cache = CustomProjection._loadedProjectionFunctions;
        var projection1 = new CustomProjection('Data/UserGeographic.js');
        return projection1.readyPromise.then(function() {
            expect(Object.keys(cache).length).toEqual(1);

            var projection2 = new CustomProjection('Data/UserGeographic.js');
            return projection2.readyPromise;
        }).then(function() {
            expect(Object.keys(cache).length).toEqual(1);
        });
    });

    it('does not cache by data URIs', function() {
        var dataUri = 'data:text/javascript;base64,ZnVuY3Rpb24gY3JlYXRlUHJvamVjdGlvbkZ1bmN0aW9ucyhjYWxsYmFjayl7ZnVuY3Rpb24gcHJvamVjdChjYXJ0b2dyYXBoaWMscmVzdWx0KXtyZXN1bHQueD1jYXJ0b2dyYXBoaWMubG9uZ2l0dWRlKjYzNzgxMzcuMDtyZXN1bHQueT1jYXJ0b2dyYXBoaWMubGF0aXR1ZGUqNjM3ODEzNy4wO3Jlc3VsdC56PWNhcnRvZ3JhcGhpYy5oZWlnaHQ7fWZ1bmN0aW9uIHVucHJvamVjdChjYXJ0ZXNpYW4scmVzdWx0KXtyZXN1bHQubG9uZ2l0dWRlPWNhcnRlc2lhbi54LzYzNzgxMzcuMDtyZXN1bHQubGF0aXR1ZGU9Y2FydGVzaWFuLnkvNjM3ODEzNy4wO3Jlc3VsdC5oZWlnaHQ9Y2FydGVzaWFuLno7fWNhbGxiYWNrKHByb2plY3QsdW5wcm9qZWN0KTt9';
        var cache = CustomProjection._loadedProjectionFunctions;
        var projection1 = new CustomProjection(dataUri);
        return projection1.readyPromise.then(function() {
            expect(Object.keys(cache).length).toEqual(0);
        });
    });

    it('project0', function() {
        var height = 10.0;
        var cartographic = new Cartographic(0.0, 0.0, height);
        var projection = new CustomProjection('Data/UserGeographic.js');
        return projection.readyPromise.then(function() {
            expect(projection.project(cartographic)).toEqual(new Cartesian3(0.0, 0.0, height));
        });
    });

    it('project1', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var cartographic = new Cartographic(Math.PI, CesiumMath.PI_OVER_TWO, 0.0);
        var expected = new Cartesian3(Math.PI * ellipsoid.radii.x, CesiumMath.PI_OVER_TWO * ellipsoid.radii.x, 0.0);
        var projection = new CustomProjection('Data/UserGeographic.js', ellipsoid);
        return projection.readyPromise.then(function() {
            expect(projection.project(cartographic)).toEqual(expected);
        });
    });

    it('project2', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var cartographic = new Cartographic(-Math.PI, CesiumMath.PI_OVER_TWO, 0.0);
        var expected = new Cartesian3(-Math.PI * ellipsoid.radii.x, CesiumMath.PI_OVER_TWO * ellipsoid.radii.x, 0.0);
        var projection = new CustomProjection('Data/UserGeographic.js', ellipsoid);
        return projection.readyPromise.then(function() {
            expect(projection.project(cartographic)).toEqual(expected);
        });
    });

    it('project with result parameter', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var cartographic = new Cartographic(Math.PI, CesiumMath.PI_OVER_TWO, 0.0);
        var expected = new Cartesian3(Math.PI * ellipsoid.radii.x, CesiumMath.PI_OVER_TWO * ellipsoid.radii.x, 0.0);
        var projection = new CustomProjection('Data/UserGeographic.js', ellipsoid);
        return projection.readyPromise.then(function() {
            var result = new Cartesian3(0.0, 0.0, 0.0);
            var returnValue = projection.project(cartographic, result);
            expect(result).toBe(returnValue);
            expect(result).toEqual(expected);
        });
    });

    it('unproject', function() {
        var cartographic = new Cartographic(CesiumMath.PI_OVER_TWO, CesiumMath.PI_OVER_FOUR, 12.0);
        var projection = new CustomProjection('Data/UserGeographic.js');
        return projection.readyPromise.then(function() {
            var projected = projection.project(cartographic);
            expect(Cartographic.equalsEpsilon(projection.unproject(projected), cartographic, CesiumMath.EPSILON10)).toBe(true);
        });
    });

    it('unproject with result parameter', function() {
        var cartographic = new Cartographic(CesiumMath.PI_OVER_TWO, CesiumMath.PI_OVER_FOUR, 12.0);
        var projection = new CustomProjection('Data/UserGeographic.js');
        return projection.readyPromise.then(function() {
            var projected = projection.project(cartographic);
            var result = new Cartographic(0.0, 0.0, 0.0);
            var returnValue = projection.unproject(projected, result);
            expect(result).toBe(returnValue);
            expect(Cartographic.equalsEpsilon(result, cartographic, CesiumMath.EPSILON10)).toBe(true);
        });
    });

    it('project throws without cartesian', function() {
        var projection = new CustomProjection('Data/UserGeographic.js');
        return projection.readyPromise.then(function() {
            expect(function() {
                return projection.unproject();
            }).toThrowDeveloperError();
        });
    });

    it('provides a ready accessor', function() {
        var projection = new CustomProjection('Data/UserGeographic.js');
        expect(projection.ready).toBe(false);
        return projection.readyPromise.then(function() {
            expect(projection.ready).toBe(true);
        });
    });

    it('throws when custom projection is not yet loaded', function() {
        var projection = new CustomProjection('Data/UserGeographic.js');
        expect(projection.ready).toBe(false);
        expect(function() {
            var cartographic = new Cartographic(-Math.PI, CesiumMath.PI_OVER_TWO, 0.0);
            projection.project(cartographic);
        }).toThrowDeveloperError();
    });
});
