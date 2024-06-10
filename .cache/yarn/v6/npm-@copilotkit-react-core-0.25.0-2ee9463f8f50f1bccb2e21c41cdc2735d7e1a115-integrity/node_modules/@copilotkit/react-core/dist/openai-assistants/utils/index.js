"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/openai-assistants/utils/index.ts
var utils_exports = {};
__export(utils_exports, {
  processMessageStream: () => processMessageStream
});
module.exports = __toCommonJS(utils_exports);

// src/openai-assistants/utils/process-message-stream.ts
function processMessageStream(reader, processMessage) {
  return __async(this, null, function* () {
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = yield reader.read();
      if (done) {
        if (buffer.length > 0) {
          processMessage(buffer);
        }
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      let endIndex;
      while ((endIndex = buffer.indexOf("\n")) !== -1) {
        processMessage(buffer.substring(0, endIndex).trim());
        buffer = buffer.substring(endIndex + 1);
      }
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  processMessageStream
});
//# sourceMappingURL=index.js.map