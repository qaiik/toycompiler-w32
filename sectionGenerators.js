const path = require('path')
const { createFunctionCall } = require("./utils.js");

// Object.defineProperty(String.prototype, 'literal', {
//   get() {
//     return { value: this.toString(), type: 'literal' };
//   },
//   configurable: false,  
//   enumerable: false    
// });

// Object.defineProperty(String.prototype, 'symbol', {
//   get() {
//     return { value: this.toString(), type: 'symbol' };
//   },
//   configurable: false,  
//   enumerable: false    
// });


exports.DataSection = class DataSection {
    constructor(signature = null) {
        this.signature = signature ? `; ${signature}` : ''
        this.statements = [this.signature]
    }

    addBinarySymbol(name, value = new Uint8Array(0), store_len = true) {
        this.statements.push(`${name} db ${value.constructor == String ? new TextEncoder().encode(value).toString() : value.toString()}`)
        if (store_len) {
            this.statements.push(`${name}_len equ $-${name}`)
        }
        return name
    }

    out() {
        return this.statements
    }
}

exports.CodeSection = class CodeSection {
    constructor(dataSection, signature = null) {
        this.toLink = [];
        this.ds = dataSection
        this.externals = []
        this.signature = signature ? `; ${signature}` : ''
        this.statements = [this.signature]
        this.counter = 0;
    }

    require(...a) {
        for (const l of a) {
            const resolved = path.resolve(l);
            if (!this.toLink.includes(resolved)) {
                this.toLink.push(resolved);
            }
        }
    }

    print(data) {
        if (!this.externals.includes('printraw')) {
            this.externals.push('printraw');
            this.require(
                './lib/w.a',
                './lib/libkernel32.a'
            )
        }
        if (data.type == 'symbol') {
            const call = createFunctionCall('printraw', data.value, `${data.value}_len`)
            this.statements.push(...call)
        } else {
            const name = this.ds.addBinarySymbol(`w_lit_${++this.counter}`, data.value)
            const call = createFunctionCall('printraw', name, `${name}_len`)
            this.statements.push(...call)
        }
    }

    out() {
        return this.statements
    }

    addCall(name, ...a) {
        !this.externals.includes(name) && this.externals.push(name);
        const call = createFunctionCall(name, ...a)
        this.statements.push(...call)
    }
}
