///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Membrane tests, adapted from the es-membrane library.                                                 //
// See: https://github.com/ajvincent/es-membrane/blob/master/old-0.9/spec/concepts.js                    //
// The license below appears to allow us to use it (if we want to), as long as we include the copyright. //
///////////////////////////////////////////////////////////////////////////////////////////////////////////

// ISC License (ISC)

// Copyright (c) 2016-2022, Alexander J. Vincent <ajvincent@gmail.com>

// Permission to use, copy, modify, and/or distribute this software for any purpose
// with or without fee is hereby granted, provided that the above copyright notice
// and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
// OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
// TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
// THIS SOFTWARE.

import { MembraneMocks } from "./es-membrane-node-mocks";

describe.each(membranes)("es-membrane tests --> %s membrane", (_, createMembrane: CreateMembraneFunction) => {
  /** We want to adapt tests that were written for es-membrane to our more generic createMembrane function. */
  class MockEsMembrane {
    getMembraneValue() {
      // TODO: implement this.
      // We'll probably need to publicly expose the membrane's internals to do this. Is it worth it?
    }
    getMembraneProxy() {
      // TODO: implement this.
    }
  }
  describe("basic concepts", () => {
    let wetDocument: any, dryDocument: any, membrane: MockEsMembrane;

    beforeEach(function () {
      const parts = MembraneMocks();
      wetDocument = parts.wet.doc;

      // ansteg: This was originally "dryDocument = parts.dry.doc;"" We are modifying it to make it adaptable to our other implementations.
      const createMembraneResult = createMembrane(wetDocument);
      dryDocument = createMembraneResult.membrane;

      // ansteg: We emulate the way that es-membrane does revoking - through dispatching an 'unload' event.
      wetDocument.dispatchEvent = (eventName: string) => {
        if (eventName === "unload") {
          createMembraneResult.revoke();
        }
      };
      membrane = new MockEsMembrane();
    });

    afterEach(function () {
      wetDocument = null;
      dryDocument = null;
      membrane = null;
    });

    it("dryDocument and wetDocument should not be the same", function () {
      expect(dryDocument === wetDocument).toBe(false);
    });

    it("Looking up a primitive on a directly defined value works", function () {
      expect(dryDocument.nodeType).toBe(9);
    });

    it("Looking up null through a property name works", function () {
      expect(dryDocument.ownerDocument).toBe(null);
    });

    it("Looking up null through a property getter works", function () {
      expect(dryDocument.firstChild).toBe(null);
    });

    // TODO: In order to implement this, we'll need implement getMembraneValue and getMembraneProxy.
    // This requires exposing the membranes internal maps, which might be more trouble than its worth.
    // But maybe we could make it optional so membrane implementations that have these maps can opt-in to the test?

    // it("Setters should wrap and unwrap values correctly", function () {
    //   var extraHolder;
    //   const desc = {
    //     get: function () {
    //       return extraHolder;
    //     },
    //     set: function (val) {
    //       extraHolder = val;
    //       return val;
    //     },
    //     enumerable: true,
    //     configurable: true,
    //   };

    //   Reflect.defineProperty(dryDocument, "extra", desc);

    //   var unwrappedExtra = {};
    //   dryDocument.extra = unwrappedExtra;
    //   expect(typeof extraHolder).toBe("object");
    //   expect(extraHolder).not.toBe(null);
    //   expect(extraHolder).not.toBe(unwrappedExtra);

    //   /* In summary:
    //    *
    //    * dryDocument is a proxy, dryDocument.extra is an unwrapped object
    //    * wetDocument is an unwrapped object, wetDocument.extra is a proxy
    //    */

    //   let found, foundValue;
    //   [found, foundValue] = membrane.getMembraneValue("wet", wetDocument);
    //   expect(found).toBe(true);
    //   expect(foundValue).toBe(wetDocument);

    //   [found, foundValue] = membrane.getMembraneValue("dry", dryDocument);
    //   expect(found).toBe(true);
    //   expect(foundValue).toBe(wetDocument);

    //   [found, foundValue] = membrane.getMembraneProxy("wet", wetDocument);
    //   expect(found).toBe(true);
    //   expect(foundValue).toBe(wetDocument);

    //   [found, foundValue] = membrane.getMembraneProxy("dry", dryDocument);
    //   expect(found).toBe(true);
    //   expect(foundValue).toBe(dryDocument);

    //   [found, foundValue] = membrane.getMembraneValue("wet", wetDocument.extra);
    //   expect(found).toBe(true);
    //   expect(foundValue).toBe(unwrappedExtra);

    //   [found, foundValue] = membrane.getMembraneValue("dry", dryDocument.extra);
    //   expect(found).toBe(true);
    //   expect(foundValue).toBe(unwrappedExtra);

    //   [found, foundValue] = membrane.getMembraneProxy("wet", wetDocument.extra);
    //   expect(found).toBe(true);
    //   expect(foundValue).toBe(extraHolder);

    //   [found, foundValue] = membrane.getMembraneProxy("dry", dryDocument.extra);
    //   expect(found).toBe(true);
    //   expect(foundValue).toBe(unwrappedExtra);
    // });

    // it("Looking up an object twice returns the same object", function () {
    //   var root1 = dryDocument.rootElement;
    //   var root2 = dryDocument.rootElement;
    //   expect(root1 === root2).toBe(true);
    //   expect(root1 !== wetDocument.rootElement).toBe(true);
    //   expect(typeof root1).toBe("object");
    //   expect(root1 !== null).toBe(true);
    // });

    // it("Looking up an cyclic object (a.b.c == a)", function () {
    //   var root = dryDocument.rootElement;
    //   var owner = root.ownerDocument;
    //   expect(dryDocument === owner).toBe(true);
    // });

    // it("Looking up a method twice returns the same method", function () {
    //   var method1 = dryDocument.insertBefore;
    //   var method2 = dryDocument.insertBefore;

    //   expect(method1 === method2).toBe(true);
    //   expect(method1 !== wetDocument.insertBefore).toBe(true);
    //   expect(typeof method1).toBe("function");
    // });

    // it("Looking up a non-configurable, non-writable property twice returns the same property, protected", function () {
    //   const obj = { value: 6 };
    //   Reflect.defineProperty(wetDocument, "extra", {
    //     value: obj,
    //     writable: false,
    //     enumerable: true,
    //     configurable: false,
    //   });

    //   var lookup1 = dryDocument.extra;
    //   var lookup2 = dryDocument.extra;

    //   expect(lookup1 === lookup2).toBe(true);
    //   expect(lookup1 === obj).toBe(false);

    //   expect(lookup1.value).toBe(6);
    // });

    // it("Looking up an accessor descriptor works", function () {
    //   var desc = Object.getOwnPropertyDescriptor(dryDocument, "firstChild");
    //   expect(desc.configurable).toBe(true);
    //   expect(desc.enumerable).toBe(true);
    //   expect(typeof desc.get).toBe("function");
    //   expect("set" in desc).toBe(true);
    //   expect(typeof desc.set).toBe("undefined");

    //   desc = Object.getOwnPropertyDescriptor(dryDocument, "baseURL");
    //   expect(desc.configurable).toBe(true);
    //   expect(desc.enumerable).toBe(true);
    //   expect(typeof desc.get).toBe("function");
    //   expect(typeof desc.set).toBe("function");

    //   dryDocument.baseURL = "https://www.ecmascript.org/";
    //   expect(dryDocument.baseURL).toBe("https://www.ecmascript.org/");
    // });

    // it("Executing a method returns a properly wrapped object", function () {
    //   var rv;
    //   expect(function () {
    //     rv = dryDocument.insertBefore(dryDocument.rootElement, null);
    //   }).not.toThrow();
    //   expect(rv == dryDocument.firstChild).toBe(true);
    //   expect(dryDocument.firstChild == dryDocument.rootElement).toBe(true);
    // });

    // it("ElementDry and NodeDry respect Object.getPrototypeOf", function () {
    //   let wetRoot, ElementWet, NodeWet;
    //   let dryRoot, ElementDry, NodeDry;

    //   let parts = MembraneMocks();
    //   wetRoot = parts.wet.doc.rootElement;
    //   ElementWet = parts.wet.Element;
    //   NodeWet = parts.wet.Node;

    //   let e, eP, proto, p2;

    //   e = new ElementWet({}, "test");
    //   eP = Object.getPrototypeOf(e);
    //   proto = ElementWet.prototype;
    //   expect(eP === proto).toBe(true);

    //   proto = Object.getPrototypeOf(proto);
    //   p2 = NodeWet.prototype;
    //   expect(proto === p2).toBe(true);

    //   dryRoot = parts.dry.doc.rootElement;
    //   ElementDry = parts.dry.Element;
    //   NodeDry = parts.dry.Node;

    //   e = new ElementDry({}, "test");
    //   eP = Object.getPrototypeOf(e);
    //   proto = ElementDry.prototype;
    //   expect(eP === proto).toBe(true);

    //   proto = Object.getPrototypeOf(proto);
    //   p2 = NodeDry.prototype;
    //   expect(proto === p2).toBe(true);

    //   expect(dryRoot instanceof ElementDry).toBe(true);

    //   expect(dryRoot instanceof NodeDry).toBe(true);
    // });

    // it("ElementDry as a constructor reflects assigned properties", function () {
    //   let parts = MembraneMocks();

    //   let ElementDry = parts.dry.Element;
    //   let ElementWet = parts.wet.Element;
    //   let proto1 = ElementDry.prototype;
    //   let owner = {
    //     isFakeDoc: true,
    //     root: null,
    //   };
    //   let k = new ElementDry(owner, "k");
    //   expect(typeof k).not.toBe("undefined");

    //   let proto2 = Object.getPrototypeOf(k);
    //   expect(proto1 === proto2).toBe(true);
    //   let kOwner = k.ownerDocument;
    //   expect(kOwner === owner).toBe(true);
    //   owner.root = k;

    //   /* This might be cheating, since on the "wet" object graph, there's no
    //    * reason to look up owner.root.  On the other hand, if k is passed back to
    //    * the "wet" object graph, being able to find the root property is allowed.
    //    */
    //   let dryWetMB = parts.membrane;

    //   let [found, wetK] = dryWetMB.getMembraneValue("wet", k);
    //   expect(found).toBe(true);

    //   expect(Object.getPrototypeOf(wetK) === ElementWet.prototype);
    //   let wetKOwner = wetK.ownerDocument;
    //   expect(wetKOwner !== owner).toBe(true);
    //   let wetKRoot = wetKOwner.root;
    //   expect(wetKRoot === wetK).toBe(true);
    // });

    // XXX ajvincent Be sure to retest this via frames, sandboxes.
    it("Executing a function via .apply() returns a properly wrapped object", function () {
      var method1 = dryDocument.insertBefore;
      var rv;
      expect(function () {
        rv = method1.apply(dryDocument, [dryDocument.rootElement, null]);
      }).not.toThrow();
      expect(rv == dryDocument.firstChild).toBe(true);
      expect(dryDocument.firstChild == dryDocument.rootElement).toBe(true);
    });

    it("Looking up a proxy-added property works", function () {
      [dryDocument, dryDocument.rootElement, dryDocument.insertBefore].forEach(function (dryObj) {
        var keys = Object.getOwnPropertyNames(dryObj);
        expect(keys.indexOf("membraneGraphName")).not.toBe(-1);
        expect(dryDocument.membraneGraphName).toBe("dry");
      });
    });

    it("Looking up Object.isExtensible() works", function () {
      let wetExtensible = Object.isExtensible(wetDocument);
      let dryExtensible = Object.isExtensible(dryDocument);

      expect(wetExtensible).toBe(true);
      expect(dryExtensible).toBe(true);

      Object.preventExtensions(wetDocument);

      wetExtensible = Object.isExtensible(wetDocument);
      dryExtensible = Object.isExtensible(dryDocument);

      expect(wetExtensible).toBe(false);
      expect(dryExtensible).toBe(false);
    });

    it("The in operator works", function () {
      let checkHas = function (value: any, valueName: any, propName: any, index: any, array: any) {
        expect(propName in value).toBe(index !== array.length - 1);
      };
      let propList = ["nodeType", "nodeName", "childNodes", "ownerDocument", "firstChild", "unknownProperty"];

      propList.forEach(checkHas.bind(null, dryDocument, "dryDocument"));

      // root follows inheritance patterns.
      let root = dryDocument.rootElement;
      propList.forEach(checkHas.bind(null, root, "root"));
    });

    describe("The delete operator works as expected", function () {
      it("on dryDocument.rootElement", function () {
        let wasDeleted = delete dryDocument.rootElement;
        expect(typeof dryDocument.rootElement).toBe("undefined");
        expect("rootElement" in dryDocument).toBe(false);
        expect(wasDeleted).toBe(true);
      });

      it("on dryDocument.rootElement.nodeName", function () {
        let root = dryDocument.rootElement;
        let wasDeleted = delete root.nodeName;
        expect(typeof root.nodeName).toBe("undefined");
        expect("nodeName" in root).toBe(false);
        expect(wasDeleted).toBe(true);
      });

      it("on dryDocument.rootElement.insertBefore", function () {
        let root = dryDocument.rootElement;
        let wasDeleted = delete root.insertBefore;

        // This is because insertBefore is inherited from NodeWet.prototype.
        expect(typeof root.insertBefore).toBe("function");
        expect("insertBefore" in root).toBe(true);
        expect(wasDeleted).toBe(true);
      });
    });

    describe("Deleting a property via Reflect.deleteProperty(...) works as expected", function () {
      it("when the property doesn't exist", function () {
        expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBe(true);
      });

      it("when the property descriptor has configurable: true", function () {
        Reflect.defineProperty(dryDocument, "doesNotExist", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: true,
        });
        expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBe(true);
        expect(Reflect.getOwnPropertyDescriptor(dryDocument, "doesNotExist")).toBe(undefined);
      });

      it("when the property descriptor has configurable: false", function () {
        Reflect.defineProperty(dryDocument, "doesNotExist", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: false,
        });
        expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBe(false);
        let desc = Reflect.getOwnPropertyDescriptor(dryDocument, "doesNotExist");
        expect(typeof desc).toBe("object");
        if (desc) {
          expect(desc.value).toBe(2);
        }
      });

      it("when the property descriptor is initially defined on the original target with configurable: true", function () {
        Reflect.defineProperty(wetDocument, "doesNotExist", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: true,
        });
        expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBe(true);
        expect(Reflect.getOwnPropertyDescriptor(dryDocument, "doesNotExist")).toBe(undefined);
      });

      it("when the property descriptor is initially defined on the original target with configurable: false", function () {
        Reflect.defineProperty(wetDocument, "doesNotExist", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: false,
        });
        expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBe(false);
        let desc = Reflect.getOwnPropertyDescriptor(dryDocument, "doesNotExist");
        expect(typeof desc).toBe("object");
        if (desc) {
          expect(desc.value).toBe(2);
        }
      });
    });

    it("Defining a property via Object.defineProperty(...) works as expected", function () {
      Object.defineProperty(dryDocument, "screenWidth", {
        value: 200,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      expect(dryDocument.screenWidth).toBe(200);
      expect(wetDocument.screenWidth).toBe(200);

      let localHeight = 150;
      Object.defineProperty(dryDocument, "screenHeight", {
        get: function () {
          return localHeight;
        },
        set: function (val) {
          localHeight = val;
        },
        enumerable: true,
        configurable: true,
      });
      expect(dryDocument.screenHeight).toBe(150);
      expect(wetDocument.screenHeight).toBe(150);

      let location = {
        name: "location",
      };
      Object.defineProperty(dryDocument, "location", {
        value: location,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      expect(dryDocument.location === location).toBe(true);
      expect(typeof dryDocument.location.membraneGraphName).toBe("undefined");
      expect(wetDocument.location !== location).toBe(true);
      expect(wetDocument.location.name === "location").toBe(true);
      expect(wetDocument.location.membraneGraphName === "wet").toBe(true);

      /* XXX ajvincent There is an obvious temptation to just call:
       * dryDocument.screenWidth = 200;
       *
       * That's covered in the next test.  Here, we're testing defineProperty.
       *
       * On the other hand, we've just tested that setting a property from the
       * "dry" side retains its identity with the "dry" object graph.
       */

      // Additional test for configurable: false
      const obj = {};
      Object.defineProperty(dryDocument, "extra", {
        value: obj,
        writable: true,
        enumerable: false,
        configurable: false,
      });
      let extra = dryDocument.extra;
      expect(extra).toBe(obj);
    });

    it("Defining a property directly works as expected", function () {
      dryDocument.screenWidth = 200;
      expect(dryDocument.screenWidth).toBe(200);
      expect(wetDocument.screenWidth).toBe(200);

      let localHeight = 150;
      Object.defineProperty(dryDocument, "screenHeight", {
        get: function () {
          return localHeight;
        },
        set: function (val) {
          localHeight = val;
        },
        enumerable: true,
        configurable: true,
      });
      wetDocument.screenHeight = 200;
      expect(dryDocument.screenHeight).toBe(200);
      expect(wetDocument.screenHeight).toBe(200);

      let location = {
        name: "location",
      };
      dryDocument.location = location;
      expect(dryDocument.location === location).toBe(true);
      expect(typeof dryDocument.location.membraneGraphName).toBe("undefined");
      expect(wetDocument.location !== location).toBe(true);
      expect(wetDocument.location.name === "location").toBe(true);
      expect(wetDocument.location.membraneGraphName === "wet").toBe(true);
    });

    // it("Setting a prototype works as expected", function () {
    //   const logger = loggerLib.getLogger("test.membrane.setPrototypeOf");
    //   let wetRoot, ElementWet, NodeWet;
    //   let dryRoot, ElementDry, NodeDry;

    //   let parts = MembraneMocks(false, logger);
    //   wetRoot = parts.wet.doc.rootElement;
    //   ElementWet = parts.wet.Element;
    //   NodeWet = parts.wet.Node;
    //   parts.wet.root = wetRoot;

    //   dryRoot = parts.dry.doc.rootElement;
    //   ElementDry = parts.dry.Element;
    //   NodeDry = parts.dry.Node;
    //   parts.dry.root = dryRoot;

    //   let XHTMLElementDryProto = {
    //     namespaceURI: "http://www.w3.org/1999/xhtml",
    //   };
    //   let eProto = ElementDry.prototype;

    //   const traceMap = new Map(/* value: name */);
    //   {
    //     traceMap.addMember = function (value, name) {
    //       if (!this.has(value)) this.set(value, name);
    //       if (typeof value === "function" && !this.has(value.prototype))
    //         this.set(value.prototype, name + ".prototype");
    //     };

    //     {
    //       let keys = Reflect.ownKeys(parts.wet);
    //       keys.forEach(function (key) {
    //         let value = this[key];
    //         traceMap.addMember(value, "parts.wet." + key);
    //       }, parts.wet);

    //       traceMap.addMember(Reflect.getPrototypeOf(parts.wet.Node.prototype), "parts.wet.EventListener.prototype");
    //     }
    //     {
    //       let keys = Reflect.ownKeys(parts.dry);
    //       keys.forEach(function (key) {
    //         let value = this[key];
    //         traceMap.addMember(value, "parts.dry." + key);
    //       }, parts.dry);

    //       traceMap.addMember(Reflect.getPrototypeOf(parts.dry.Node.prototype), "parts.dry.EventListener.prototype");

    //       traceMap.set(XHTMLElementDryProto, "XHTMLElementDryProto");
    //     }

    //     traceMap.getPrototypeChain = function (value) {
    //       var rv = [],
    //         next;
    //       while (value) {
    //         next = this.get(value) || "(unknown)";
    //         rv.push(next);
    //         value = Reflect.getPrototypeOf(value);
    //       }
    //       return rv;
    //     };
    //   }

    //   {
    //     let chain = traceMap.getPrototypeChain(parts.wet.root);
    //     let expectedChain = [
    //       "parts.wet.root",
    //       "parts.wet.Element.prototype",
    //       "parts.wet.Node.prototype",
    //       "parts.wet.EventListener.prototype",
    //       "(unknown)",
    //     ];
    //     expect(chain).toEqual(expectedChain);
    //   }

    //   {
    //     let chain = traceMap.getPrototypeChain(parts.dry.root);
    //     let expectedChain = [
    //       "parts.dry.root",
    //       "parts.dry.Element.prototype",
    //       "parts.dry.Node.prototype",
    //       "parts.dry.EventListener.prototype",
    //       "(unknown)",
    //     ];
    //     expect(chain).toEqual(expectedChain);
    //   }

    //   expect(Reflect.setPrototypeOf(XHTMLElementDryProto, eProto)).toBe(true);
    //   {
    //     let chain = traceMap.getPrototypeChain(XHTMLElementDryProto);
    //     let expectedChain = [
    //       "XHTMLElementDryProto",
    //       "parts.dry.Element.prototype",
    //       "parts.dry.Node.prototype",
    //       "parts.dry.EventListener.prototype",
    //       "(unknown)",
    //     ];
    //     expect(chain).toEqual(expectedChain);
    //   }

    //   expect(Reflect.setPrototypeOf(dryRoot, XHTMLElementDryProto)).toBe(true);
    //   expect(Reflect.getPrototypeOf(dryRoot) === XHTMLElementDryProto).toBe(true);
    //   {
    //     let chain = traceMap.getPrototypeChain(parts.dry.root);
    //     let expectedChain = [
    //       "parts.dry.root",
    //       "XHTMLElementDryProto",
    //       "parts.dry.Element.prototype",
    //       "parts.dry.Node.prototype",
    //       "parts.dry.EventListener.prototype",
    //       "(unknown)",
    //     ];
    //     expect(chain).toEqual(expectedChain);
    //   }

    //   {
    //     let chain = traceMap.getPrototypeChain(parts.wet.root);
    //     let expectedChain = [
    //       "parts.wet.root",
    //       "(unknown)",
    //       "parts.wet.Element.prototype",
    //       "parts.wet.Node.prototype",
    //       "parts.wet.EventListener.prototype",
    //       "(unknown)",
    //     ];
    //     expect(chain).toEqual(expectedChain);
    //   }

    //   expect(dryRoot.namespaceURI).toBe(XHTMLElementDryProto.namespaceURI);
    //   expect(wetRoot.namespaceURI).toBe(XHTMLElementDryProto.namespaceURI);

    //   let XHTMLElementDry = function (ownerDoc, name) {
    //     // this takes care of ownerDoc, name
    //     ElementDry.apply(this, [ownerDoc, name]);
    //   };
    //   XHTMLElementDry.prototype = XHTMLElementDryProto;
    //   traceMap.addMember(XHTMLElementDry, "XHTMLElementDry");

    //   let x = new XHTMLElementDry(dryDocument, "test");
    //   traceMap.addMember(x, "x");
    //   {
    //     let chain = traceMap.getPrototypeChain(x);
    //     let expectedChain = [
    //       "x",
    //       "XHTMLElementDryProto",
    //       "parts.dry.Element.prototype",
    //       "parts.dry.Node.prototype",
    //       "parts.dry.EventListener.prototype",
    //       "(unknown)",
    //     ];
    //     expect(chain).toEqual(expectedChain);
    //   }
    //   expect(x.namespaceURI).toBe(XHTMLElementDryProto.namespaceURI);
    //   expect(x.nodeType).toBe(1);
    // });

    it("Calling Object.preventExtensions(...) works as expected", function () {
      expect(Object.isExtensible(dryDocument)).toBe(true);
      Object.preventExtensions(dryDocument);
      expect(Object.isExtensible(dryDocument)).toBe(false);

      // this line is NOT expected to throw an exception
      Object.preventExtensions(dryDocument);
      expect(Object.isExtensible(dryDocument)).toBe(false);
    });

    it("ObjectGraphHandler.prototype.revokeEverything() breaks all proxy access on an object graph", function () {
      function lookup(obj: any, propName: any) {
        return function () {
          return obj[propName];
        };
      }
      let root = lookup(dryDocument, "rootElement")();

      wetDocument.dispatchEvent("unload");
      expect(lookup(dryDocument, "nodeType")).toThrow();
      expect(lookup(dryDocument, "nodeName")).toThrow();
      expect(lookup(dryDocument, "childNodes")).toThrow();
      expect(lookup(dryDocument, "insertBefore")).toThrow();
      expect(lookup(dryDocument, "rootElement")).toThrow();
      expect(lookup(dryDocument, "parentNode")).toThrow();
      expect(lookup(dryDocument, "ownerDocument")).toThrow();
      expect(lookup(dryDocument, "membraneGraphName")).toThrow();

      expect(lookup(root, "nodeType")).toThrow();
      expect(lookup(root, "nodeName")).toThrow();
      expect(lookup(root, "childNodes")).toThrow();
      expect(lookup(root, "insertBefore")).toThrow();
      expect(lookup(root, "rootElement")).toThrow();
      expect(lookup(root, "parentNode")).toThrow();
      expect(lookup(root, "ownerDocument")).toThrow();
      expect(lookup(root, "membraneGraphName")).toThrow();
    });

    it("Wrapped descriptors throw if membrane revoked", function () {
      wetDocument.dispatchEvent("unload");
      expect(function () {
        dryDocument.baseURL = "https://www.ecmascript.org/";
      }).toThrow();

      function voidFunc(...args: unknown[]) {}
      expect(function () {
        let x = dryDocument.baseURL;
        voidFunc(x);
      }).toThrow();
    });

    describe("Object constructors should be properly wrapped (thanks to Luca Franceschini for this test)", function () {
      // objects returned by `should`
      function ObjectWrapper(obj: any) {
        // @ts-ignore - TODO: fix this
        this._obj = obj;
      }

      ObjectWrapper.prototype.equal = function equal(other: any) {
        return this._obj === other;
      };
      beforeEach(function () {
        Object.defineProperty(Object.prototype, "should", {
          configurable: true,
          get: function () {
            // @ts-ignore - TODO: fix this
            return new ObjectWrapper(this);
          },
        });
      });
      afterEach(function () {
        Reflect.deleteProperty(Object.prototype, "should");
      });
      it("for non-wrapped objects", function () {
        const rv = wetDocument.should.equal(wetDocument);
        expect(rv).toBe(true);
      });
      it("for wrapped objects", function () {
        const rv = dryDocument.should.equal(dryDocument);
        expect(rv).toBe(true);
      });
    });

    it("Array.prototype.splice works on wrapped arrays", function () {
      wetDocument.strings = ["alpha", "beta", "gamma"];
      expect(dryDocument.strings.length).toBe(3);

      Array.prototype.splice.apply(dryDocument.strings, [1, 1, "delta", "epsilon"]);

      expect(wetDocument.strings).toEqual(["alpha", "delta", "epsilon", "gamma"]);
    });
  });

  describe("Receivers in proxies", function () {
    let wetObj: any, dryObj: any;
    beforeEach(function () {
      wetObj = {
        ALPHA: {
          value: "A",
        },
        BETA: {
          value: "B",
        },

        alpha: {
          get upper() {
            return this._upper;
          },
          set upper(val) {
            this._upper = val;
          },
          _upper: null,
          value: "a",
        },

        beta: {
          _upper: null,
          value: "b",
        },

        X: {},
      };
      wetObj.alpha._upper = wetObj.ALPHA;
      wetObj.beta._upper = wetObj.BETA;

      // ansteg: this was originally:
      // let parts = MembraneMocks();
      // dryObj = parts.membrane.convertArgumentToProxy(parts.handlers.wet, parts.handlers.dry, wetObj);

      // We are modifying it to make it adaptable to our other implementations beyond es-membrane:
      dryObj = createMembrane(wetObj).membrane;
    });

    it("are where property lookups happen", function () {
      const a = dryObj.alpha,
        b = dryObj.beta,
        B = dryObj.BETA;
      const val = Reflect.get(a, "upper", b);
      expect(val).toBe(B);
    });

    it("are where property setter invocations happen", function () {
      const a = dryObj.alpha,
        b = dryObj.beta,
        A = dryObj.ALPHA,
        X = dryObj.X;
      const wetX = wetObj.X;
      Reflect.set(a, "upper", X, b);
      expect(b._upper).toBe(X);
      expect(a._upper).toBe(A);

      expect(wetObj.beta._upper).toBe(wetX);
    });
  });

  // it("More than one object graph can be available", function () {
  //   let parts = MembraneMocks(true);
  //   let wetDocument = parts.wet.doc;
  //   let dryDocument = parts.dry.doc;
  //   let dampDocument = parts[DAMP].doc;

  //   wetDocument.dispatchEvent("unload");

  //   expect(function () {
  //     void dryDocument.rootElement;
  //   }).toThrow();

  //   expect(function () {
  //     dampDocument.insertBefore(dampDocument.rootElement, null);
  //   }).not.toThrow();
  // });
});
