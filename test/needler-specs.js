var expect = require("chai").expect;
var ioc_container = require("../lib/needler.js");

describe("ioc-container module", function () {
    describe("Kernel", function () {
        describe("after registering service constructor with no dependencies", function () {
            var kernel;

            beforeEach(function () {
                kernel = new ioc_container.Kernel();

                var controllerConstructor = function () {
                    this.type = "controller";
                }

                kernel.bind("controller", controllerConstructor);
            });

            it("should be able to return object using get", function () {
                var controllerInstance = kernel.get("controller");
                expect(controllerInstance.type).to.be.equal("controller");
            });
        });

        describe("after registering service function with no dependencies", function () {
            var kernel;

            beforeEach(function () {
                kernel = new ioc_container.Kernel();

                var func = function () {
                    return { type: "controller" };
                }

                kernel.bindFunction("controller", func);
            });

            it("should be able to return object using get", function () {
                var controllerInstance = kernel.get("controller");
                expect(controllerInstance.type).to.be.equal("controller");
            });
        });

        describe("after registering service constructor with not existing dependencies dependencies", function () {
            var kernel;

            beforeEach(function () {
                kernel = new ioc_container.Kernel();

                var ControllerConstructor = function () {
                    this.type = "controller";
                }

                var Stone = function () {

                }

                ControllerConstructor.__dependsOn = ["unicorn", "dragon", "stone"];

                kernel.bind("controller", ControllerConstructor);
                kernel.bind("stone", Stone);
            });

            it("should throw meaningfull error when user is trying to get instance", function () {
                try {
                    var controllerInstance = kernel.get("controller");
                }
                catch (err) {
                    expect(err.message).to.be.equal("Cannot get [controller]. Missing dependency: [unicorn].");
                }
            });
        });

        describe("after registering transient service with some complex dependencies", function () {
            var kernel;

            beforeEach(function () {
                kernel = new ioc_container.Kernel();

                var controllerCtor = function (dependencies) {
                    this.type = "controller";
                    this.serviceA = dependencies.serviceA;
                    this.serviceB = dependencies.serviceB;
                }
                controllerCtor.__dependsOn = ["serviceA", "serviceB"];

                var serviceACtor = function (dependencies) {
                    this.type = "serviceA";
                    this.repositoryA = dependencies.repositoryA;
                }
                serviceACtor.__dependsOn = ["repositoryA"];

                var serviceBCtor = function (dependencies) {
                    this.type = "serviceB";
                    this.repositoryA = dependencies.repositoryA;
                }
                serviceBCtor.__dependsOn = ["repositoryA"];

                var repositoryACtor = function () {
                    this.type = "repositoryA";
                }

                kernel.bind("controller", controllerCtor);
                kernel.bind("serviceA", serviceACtor);
                kernel.bind("serviceB", serviceBCtor);
                kernel.bind("repositoryA", repositoryACtor);
            });

            it("should should succsesfully resolve root and all it's dependencies", function () {
                var controllerInstance = kernel.get("controller");

                expect(controllerInstance.type).to.be.equal("controller");
                expect(controllerInstance.serviceA.type).to.be.equal("serviceA");
                expect(controllerInstance.serviceB.type).to.be.equal("serviceB");
                expect(controllerInstance.serviceA.repositoryA.type).to.be.equal("repositoryA");
                expect(controllerInstance.serviceB.repositoryA.type).to.be.equal("repositoryA");
            });

            it("should successfully resolve leaf dependencies", function () {
                var repositoryAInstance = kernel.get("repositoryA");

                expect(repositoryAInstance.type).to.be.equal("repositoryA");
            });
        });

        describe("after registering singleton with no dependencies", function () {
            var kernel;

            beforeEach(function () {
                kernel = new ioc_container.Kernel();

                var controllerConstructor = function () {
                    this.type = "controller";
                }

                kernel.bind("controller", controllerConstructor, "singleton");
            });

            it("subsequent gets return the same instance", function () {
                var controllerInstance1 = kernel.get("controller");
                var controllerInstance2 = kernel.get("controller");

                expect(controllerInstance1).to.be.equal(controllerInstance2);
            });
        });

        describe("after registering transient object with singleton dependency", function () {
            var kernel;
            var controllerInstance1;
            var controllerInstance2;

            beforeEach(function () {
                kernel = new ioc_container.Kernel();

                var controllerCtor = function (dependencies) {
                    this.type = "controller";
                    this.serviceA = dependencies.serviceA;
                }
                controllerCtor.__dependsOn = ["serviceA"];

                var serviceACtor = function (dependencies) {
                    this.type = "serviceA";
                }

                kernel.bind("controller", controllerCtor, "transient");
                kernel.bind("serviceA", serviceACtor, "singleton");

                controllerInstance1 = kernel.get("controller");
                controllerInstance2 = kernel.get("controller");
            });

            it("each transient object is new", function () {
                expect(controllerInstance1).not.to.equal(controllerInstance2);
            });

            it("each transient object points to the same singleton dependency and they both point to dep from kernel", function () {
                var singletonServiceA = kernel.get("serviceA");

                expect(controllerInstance1.serviceA).to.be.equal(controllerInstance2.serviceA);
                expect(controllerInstance1.serviceA).to.be.equal(singletonServiceA);
            });
        });

        describe("after registering singleton object with transient dependency", function () {
            var kernel;
            var controllerInstance1;
            var controllerInstance2;

            beforeEach(function () {
                kernel = new ioc_container.Kernel();

                var controllerCtor = function (dependencies) {
                    this.type = "controller";
                    this.serviceA = dependencies.serviceA;
                }
                controllerCtor.__dependsOn = ["serviceA"];

                var serviceACtor = function (dependencies) {
                    this.type = "serviceA";
                }

                kernel.bind("controller", controllerCtor, "singleton");
                kernel.bind("serviceA", serviceACtor, "transient");

                controllerInstance1 = kernel.get("controller");
                controllerInstance2 = kernel.get("controller");
            });

            it("each singleton object is the same", function () {
                expect(controllerInstance1).to.equal(controllerInstance2);
            });

            it("each singleton object points to the same transient dependency but different than one that can be got from kernel", function () {
                var singletonServiceA = kernel.get("serviceA");

                expect(controllerInstance1.serviceA).to.be.equal(controllerInstance2.serviceA);
                expect(controllerInstance1.serviceA).not.to.be.equal(singletonServiceA);
            });
        });
    });

    describe("dependencies function", function(){
        it("should set dependencies array", function(){
            var A = function(){};

            ioc_container.depends(A, ["B","C"]);
            expect(A.__dependsOn).to.deep.equal(["B", "C"]);
        });
    });
});