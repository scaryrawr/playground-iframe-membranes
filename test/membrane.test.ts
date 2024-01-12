import { createMembrane as baseline } from "../solutions/1-baseline/index";
import { createMembrane as withRevoke } from "../solutions/2-store-revoke-in-weakrefs/index";
import { createMembrane as harmonyExample } from "../solutions/3-harmony-reflect-example/index";
import { createMembrane as tc39Example } from "../solutions/5-tc39-unit-test-example/index";
describe.each([
  ["baseline", baseline],
  ["with revoke", withRevoke],
  ["harmony-reflect example", harmonyExample],
  ["tc39 unit test example", tc39Example],
])("Membrane %s", (_, createMembrane: CreateMembraneFunction) => {
  describe("nested equality", () => {
    let bazSpy: any;
    const wetObject = {
      baz: { foo: "bar" },
      foo: "bar",
      nested: { a: 1 },
      collection: [{ x: 1 }, { x: 2 }, { x: 3 }],
      functionThatModifies: function (baz: any) {
        this.baz = baz;
        bazSpy = baz;
      },
      _private: "private",
      get private() {
        return this._private;
      },
      set private(value) {
        this._private = value;
      },
    };
    const { membrane: dryMembrane } = createMembrane(wetObject);
    test("primitives are unchanged", () => {
      expect(dryMembrane.foo).toBe(wetObject.foo);
    });
    test("objects are proxied", () => {
      expect(dryMembrane.nested).not.toBe(wetObject.nested);
    });
    test("arrays are proxied", () => {
      expect(dryMembrane.collection).not.toBe(wetObject.collection);
    });
    test("functions are proxied", () => {
      expect(dryMembrane.functionThatModifies).not.toBe(wetObject.functionThatModifies);
    });
    test("multiple accesses return the same proxy", () => {
      expect(dryMembrane.nested).toBe(dryMembrane.nested);
      expect(dryMembrane.collection).toBe(dryMembrane.collection);
      expect(dryMembrane.collection[0]).toBe(dryMembrane.collection[0]);
    });

    // function arguments are proxied within the membrane, but returned unwrapped
    test("function arguments are proxied within the membrane, but returned unwrapped", () => {
      const originalBaz = { a: 1 };
      dryMembrane.functionThatModifies(originalBaz);
      expect(bazSpy).not.toBe(originalBaz);
      expect(bazSpy).toBe(wetObject.baz);
      expect(dryMembrane.baz).toBe(originalBaz);
      expect(wetObject.baz).not.toBe(originalBaz);
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Membrane tests, adapted from harmony-reflect library.                                                                  //
    // See: https://github.com/tc39/test262/blob/main/implementation-contributed/v8/mjsunit/es6/proxies-example-membrane.js   //
    // These tests are open-source under the Apache license, which lets us use them as long as we include proper attribution. //
    // See: https://docs.opensource.microsoft.com/legal/resources/oss-licenses-by-type/                                       //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Copyright (C) 2013 Software Languages Lab, Vrije Universiteit Brussel
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    // http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.

    describe("harmony-reflect tests", () => {
      test("primitives make it through unwrapped", () => {
        // membrane works for configurable properties
        const wetA = { x: 1 };
        const wetB = { y: wetA };
        const { membrane, revoke } = createMembrane(wetB);
        const dryB = membrane;
        const dryA = dryB.y;
        expect(wetA).not.toBe(dryA);
        expect(wetB).not.toBe(dryB);
        expect(wetA.x).toBe(1);
        expect(dryA.x).toBe(1);
        revoke();
        expect(wetA.x).toBe(1);
        expect(wetB.y).toBe(wetA);
        expect(() => dryA.x).toThrow();
        expect(() => dryB.y).toThrow();
      });

      test("functions are wrapped", () => {
        const wetA = (x: unknown) => x;
        const { membrane, revoke } = createMembrane(wetA);
        const dryA = membrane;

        expect(wetA).not.toBe(dryA);
        expect(wetA(1)).toBe(1);
        expect(dryA(1)).toBe(1);

        revoke();
        expect(wetA(1)).toBe(1);
        expect(() => dryA(1)).toThrow();
      });

      test("values returned from wrapped methods are wrapped", () => {
        const wetA = { x: 42 };
        const wetB = {
          m: function () {
            return wetA;
          },
        };
        const { membrane, revoke } = createMembrane(wetB);
        expect(wetA.x).toBe(42);
        expect(wetB.m().x).toBe(42);

        const dryB = membrane;
        const dryA = dryB.m();

        expect(wetA).not.toBe(dryA);
        expect(wetB).not.toBe(dryB);

        expect(dryA.x).toBe(42);

        revoke();

        expect(() => dryA.x).toThrow();
        expect(() => dryB.m()).toThrow();
      });

      test("the prototype is also wrapped", () => {
        const wetA = { x: 42 };
        const wetB = Object.create(wetA);

        expect(Object.getPrototypeOf(wetB)).toBe(wetA);

        const { membrane, revoke } = createMembrane(wetB);
        const dryB = membrane;
        const dryA = Object.getPrototypeOf(dryB);

        expect(wetA).not.toBe(dryA);
        expect(wetB).not.toBe(dryB);

        expect(dryA.x).toBe(42);
        revoke();
        expect(() => dryA.x).toThrow();
      });

      test("typeof results are unchanged when crossing a membrane", () => {
        // TODO: without the 'any' cast, I was getting "Object literal's property 'nul' implicitly has an 'any' type" (and a similar error for 'udf').
        const wetA: any = {
          obj: {},
          arr: [],
          fun: function () {},
          nbr: 1,
          str: "x",
          nul: null,
          udf: undefined,
          bln: true,
          rex: /x/,
          dat: new Date(),
        };
        const { membrane } = createMembrane(wetA);
        const dryA = membrane;

        Object.keys(wetA).forEach(function (name) {
          expect(typeof wetA[name]).toBe(typeof dryA[name]);
        });
      });

      test("observation of non-configurability of wrapped properties", () => {
        const wetA = Object.create(null, {
          x: { value: 1, writable: true, enumerable: true, configurable: false },
        });

        expect(wetA.x).toBe(1);
        expect(Object.getOwnPropertyDescriptor(wetA, "x").configurable).toBe(false);

        const { membrane } = createMembrane(wetA);
        const dryA = membrane;

        // perhaps surprisingly, just reading out the property value works,
        // since no code has yet observed that 'x' is a non-configurable
        // own property.
        expect(dryA.x).toBe(1);

        // membranes should expose a non-configurable prop as non-configurable
        const exactDesc = Object.getOwnPropertyDescriptor(dryA, "x");
        expect(exactDesc.configurable).toBe(false);
        expect(exactDesc.value).toBe(1);
        expect(exactDesc.enumerable).toBe(true);
        expect(exactDesc.writable).toBe(true);

        expect(dryA.x).toBe(1);
      });

      test("non-extensibility across a membrane", () => {
        const wetA = Object.preventExtensions({ x: 1 });
        expect(Object.isExtensible(wetA)).toBe(false);

        const { membrane } = createMembrane(wetA);
        const dryA = membrane;

        expect(dryA.x).toBe(1);

        expect(Object.isExtensible(dryA)).toBe(false);

        const dryDesc = Object.getOwnPropertyDescriptor(dryA, "x");
        expect(dryDesc.value).toBe(1);

        // TODO: the original test had this line, but "Reflect.hasOwn" didn't seem to have made it into the ECMA standard.
        // expect(Reflect.hasOwn(dryA, "x")).toBe(true);
        // We're checking both of these instead. Hopefully they're equivalent - need to investigate.
        expect(Reflect.has(dryA, "x")).toBe(true);
        expect(Object.hasOwn(dryA, "x")).toBe(true);
      });

      test("assignment to a membrane", () => {
        const wetA = { x: 1 };
        expect(wetA.x).toBe(1);

        const { membrane, revoke } = createMembrane(wetA);
        const dryA: { x: number; y?: number } = membrane;

        Object.defineProperty(dryA, "y", { value: 2, writable: true, enumerable: true, configurable: true });
        expect(dryA.y).toBe(2);

        expect(dryA.x).toBe(1);
        dryA.x = 2;
        expect(dryA.x).toBe(2);

        revoke();

        expect(() => (dryA.x = 3)).toThrow();
      });

      test("definition of a new non-configurable property on a membrane", () => {
        const wetA: { x?: number } = {};
        const { membrane } = createMembrane(wetA);
        const dryA = membrane;

        // membranes should allow definition of non-configurable props
        Object.defineProperty(dryA, "x", { value: 1, writable: true, enumerable: true, configurable: false });
        expect(dryA.x).toBe(1);
        expect(wetA.x).toBe(1);
      });

      test("a membrane preserves object identity", () => {
        const wetA = {};
        const wetB = { x: wetA };
        const { membrane } = createMembrane(wetB);
        const dryB = membrane;

        const dryA1 = dryB.x;
        const dryA2 = dryB.x;
        expect(dryA1).toBe(dryA2);
      });

      test("a membrane properly unwraps a value when crossing the boundary wet->dry and then dry->wet, instead of doubly wrapping the value", () => {
        const wetA = {
          out: {},
          id: function (x: unknown) {
            return x;
          },
        } as const;

        const { membrane } = createMembrane(wetA);
        const dryA = membrane;
        const dryB = dryA.out;
        const dryC = {};

        const outWetB = dryA.id(dryB);
        expect(dryB).toBe(outWetB);

        const outWetA = dryA.id(dryA);
        expect(dryA).toBe(outWetA);

        const outC = dryA.id(dryC);
        expect(outC).toBe(dryC);
      });

      test("a membrane handles Date objects", () => {
        const wetDate = new Date();
        const { membrane } = createMembrane(wetDate);
        const dryDate = membrane;
        expect(typeof dryDate.getTime()).toBe("number");
      });

      test("a membrane handles has and delete operations", () => {
        const wetA = { x: 0 };
        const { membrane } = createMembrane(wetA);
        const dryA = membrane;

        expect("x" in dryA).toBe(true);
        // TODO: the original test had this line, but "Reflect.hasOwn" didn't seem to have made it into the ECMA standard.
        // expect(Reflect.hasOwn(dryA, "x")).toBe(true);
        // We're checking both of these instead. Hopefully they're equivalent - need to investigate.
        expect(Reflect.has(dryA, "x")).toBe(true);
        expect(Object.hasOwn(dryA, "x")).toBe(true);

        delete dryA.x;
        expect("x" in dryA).toBe(false);
        // TODO: the original test had this line, but "Reflect.hasOwn" didn't seem to have made it into the ECMA standard.
        // expect(Reflect.hasOwn(dryA, "x")).toBe(false);
        // We're checking both of these instead. Hopefully they're equivalent - need to investigate.
        expect(Reflect.has(dryA, "x")).toBe(false);
        expect(Object.hasOwn(dryA, "x")).toBe(false);
      });

      test("a membrane handles Object.keys", () => {
        var wetA = { x: 0, y: 0 };
        var { membrane } = createMembrane(wetA);
        var dryA = membrane;

        var dryKeys = Object.keys(dryA);
        expect(dryKeys.length).toBe(2);
      });
    });
  });
});
