///<reference path="../lib/needler.d.ts"/>

class TestClass {

}

needler.depends(TestClass, ["A", "B", "C"]);
//needler.depends(TestClass, [1, 2, 3]);

var kernel = new needler.Kernel();

kernel.bind("TestClass", TestClass);
//kernel.bind(12, TestClass);

kernel.bind("TestClass", TestClass, "singleton");
kernel.bindFunction("testFunc", () => {}, "singleton");
kernel.bindFunction("testFunc2", () => {});
kernel.get("TestClass");
