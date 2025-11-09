const w = require('./index');
const { generateAsm } = require('./utils');
const { writeFile, readFile } = require('fs/promises');

const ds = new w.DataSection()
const cs = new w.CodeSection(ds)

!async function main() {
    const sbcText = (await readFile(process.argv[2])).toString().replaceAll('\r', '')
    for (const line of sbcText.split('\n')) {
        if (line.startsWith('say ')) {
            const after = line.split('say ').slice(1).join('');
            let data;
            switch (after[0]) {
                case '"':
                    data = JSON.parse(after);
                    cs.print(data.literal);
                    break;
                case '[':
                    data = JSON.parse(after.split(' ').filter(Boolean).join(','));
                    cs.print(new Uint8Array(data).literal);
                    break;
                default:
                    data = after.trim();
                    cs.print(data.symbol);
                    break;
            }
        }

        if (line.startsWith('def ')) {
            // console.log(line)
            const rest = line.split(' ').slice(1).join(' '); // ["bytes", "=", "[62", "15]"]
            const sbe = line.split("=")
            const name = sbe[0].trim().split("def")[1].trim()
            const afterEq = sbe.slice(1).join('')
            const valueRaw = afterEq.trim()
            // console.log(valueRaw)

            // const eqIndex = rest.indexOf('=');     // find '=' position
            // const name = rest.slice(0, eqIndex).join(''); // "bytes"
            // const valueRaw = rest.slice(eqIndex + 1).join(' '); // "[62 15]"
            let data;

            switch (valueRaw[0]) {
                case '"':
                    data = JSON.parse(valueRaw);
                    ds.addBinarySymbol(name, new TextEncoder().encode(data));
                    break;
                case '[':
                    const content = valueRaw.slice(1, -1).trim()
                    const arr = content.split(/\s+/).map(Number);
                    data = new Uint8Array(arr);
                    ds.addBinarySymbol(name, data)
                    break;
                default:
                    data = valueRaw.trim();
                    break;
            }


        }

        if (line.startsWith('exit ')) {
            // console.log(line)
            const rest = parseInt(line.split(' ').slice(1).join(' '));
            cs.require('./lib/libkernel32.a')
            cs.addCall('ExitProcess', rest)


        }

    }
    // await writeFile('./fdb.asm', generateAsm(ds,cs))
    // console.log(cs,ds)
    const output = await w.compile(
        cs,
        ds
    )


    if (process.argv.map(a => a.toLowerCase()).includes('--emitasm')) await writeFile(process.argv[3].split('.')[0] + '.asm', generateAsm(cs, ds));
    if (process.argv.map(a => a.toLowerCase()).includes('--emitlib')) await writeFile(process.argv[3].split('.')[0] + '.lib', output.lib)

    await writeFile(process.argv[3], output.bin)
}()
