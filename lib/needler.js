(function () {
    var Kernel = function () {
        var _services = {};
        var _singletonCache = {};
        var _serviceUnderConstructionName = "";

        this.bind = function (serviceName, constructor, scope) {
            regiterService(serviceName, constructor, scope, contructorActivationFactory);
        }

        this.bindFunction = function (serviceName, func, scope) {
            regiterService(serviceName, func, scope, functionActivationFactory);
        }

        this.get = function (serviceName) {
            _serviceUnderConstructionName = serviceName;
            var instance = build(_services[serviceName]);
            return instance;
        }

        function regiterService(serviceName, activator, scope, activationFactory) {
            _services[serviceName] = {
                scope: scope ? scope : "transient",
                activator: activator,
                dependenciesNames: activator.__dependsOn ? activator.__dependsOn : [],
                name: serviceName,
                activate: activationFactory
            }
        }

        function build(serviceInfo) {
            if (serviceInfo.scope == "singleton" && _singletonCache[serviceInfo.name]) {
                return _singletonCache[serviceInfo.name];
            }

            var dependenciesNames = serviceInfo.dependenciesNames;
            var resolvedDependencies = {};

            for (var i = 0; i < dependenciesNames.length; i++) {
                var dependencyName = dependenciesNames[i];
                var dependencyInfo = _services[dependencyName];

                if (!dependencyInfo) {
                    throw new DependencyError(_serviceUnderConstructionName, dependencyName);
                }

                var resolvedDependency = build(dependencyInfo);
                resolvedDependencies[dependencyName] = resolvedDependency;
            }

            var instance = serviceInfo.activate(resolvedDependencies);

            if (serviceInfo.scope == "singleton") {
                _singletonCache[serviceInfo.name] = instance;
            }
            return instance;
        }

        function contructorActivationFactory(dependencies) {
            return new this.activator(dependencies);
        }

        function functionActivationFactory(dependencies) {
            return this.activator(dependencies);
        }
    }

    function DependencyError(serviceUnderConstructionName, missingDependencyName) {
        this.name = "DependencyError";
        this.message = "Cannot get [" + serviceUnderConstructionName
            + "]. Missing dependency: [" + missingDependencyName + "].";
    }
    DependencyError.prototype = new Error();
    DependencyError.prototype.constructor = DependencyError;

    function buildModule(exports){
        exports.Kernel = Kernel;
    }

    if (typeof exports == "undefined") {
        if(typeof define == "function" && define["amd"]){
            define(function(){
                var module = {};
                buildModule(module);
                return module;
            });
        }
        else {
            window.needler = factory();
        }
    }
    else {
        buildModule(exports);
    }
})();