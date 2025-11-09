const w = require('./index.js');
const { generateAsm } = require('./utils.js');
// const { generateAsm } = require('./utils.js');
const ds = new w.DataSection();
const cs = new w.CodeSection(ds);

// cs.require('./lib/libkernel32.a')
// cs.addCall('ExitProcess', 42)

cs.print("Hello World\n".literal)
cs.print("Hello World".literal)
cs.print("Hello World Hello WorldHello WorldHello WorldHello World".literal)
cs.print("glfalg o".literal)
console.log(
    generateAsm(
        cs,
        ds
    )
)
cs.require('./lib/libkernel32.a')
cs.addCall('ExitProcess', 2)


w.compile(cs, ds).then(o => 
    require('fs').writeFileSync('./mii.exe', o.bin)
)