const { compile } = require("./compile");
const { DataSection, CodeSection } = require("./sectionGenerators")

Object.defineProperty(String.prototype, 'literal', {
  get() {
    return { value: this.toString(), type: 'literal' };
  },
  configurable: false,  
  enumerable: false    
});

Object.defineProperty(Uint8Array.prototype, 'literal', {
  get() {
    // Convert the Uint8Array to a regular array so it’s easier to inspect
    return { value: Array.from(this), type: 'literal' };
  },
  configurable: false,
  enumerable: false
});

Object.defineProperty(String.prototype, 'symbol', {
  get() {
    return { value: this.toString(), type: 'symbol' };
  },
  configurable: false,  
  enumerable: false    
});

exports.DataSection = DataSection;
exports.CodeSection = CodeSection;
exports.compile = compile;