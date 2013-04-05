var TestClass = (function () {
    function TestClass() { }
    return TestClass;
})();
needler.depends(TestClass, [
    "A", 
    "B", 
    "C"
]);
var kernel = new needler.Kernel();
kernel.bind("TestClass", TestClass);
kernel.bind("TestClass", TestClass, "singleton");
kernel.bindFunction("testFunc", function () {
}, "singleton");
kernel.bindFunction("testFunc2", function () {
});
kernel.get("TestClass");
