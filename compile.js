const { unlink, readFile, writeFile } = require('fs').promises;
const path = require('path')

const b2n = require('bin2node');
const { generateAsm } = require('./utils');
const nasm = b2n.bin('.\\bin\\nasm.exe');
const lld = b2n.bin('.\\bin\\lld-link.exe');

exports.compile = async function compile(cs, ds) {
    const asm = generateAsm(
        cs,
        ds
    )
    const asm_p = `${crypto.randomUUID()}.asm`
    await writeFile(asm_p, asm)
    const fileAsm = (await readFile(asm_p)).toString();
    const libraries = fileAsm.split('\n')[0].split(': ').slice(1).flat().join('').split('~').map(l => `"${l}"`);
    const out_p = `${crypto.randomUUID()}.exe`
    const output_obj = `${crypto.randomUUID()}.obj`
    await nasm('-f win64', asm_p, '-o', output_obj);
    await lld(
        '/subsystem:console',
        '/entry:main',
        '/out:' + out_p,
        output_obj,
        // `"${path.resolve('./lib/w.a')}"`,
        // `"${path.resolve('./lib/libkernel32.a')}"`
        ...libraries
    )

    await unlink(path.resolve(output_obj))
    await unlink(path.resolve(asm_p))
    const binBuf = await readFile(out_p)
    let libBuf;
    try {
        libBuf = await readFile(out_p.split('.')[0] + '.lib')
    } catch {
        libBuf = null;
    }
    

    await unlink(out_p)
    if (libBuf != null) await unlink(out_p.split('.')[0] + '.lib')
    return {
        bin: binBuf,
        lib: libBuf
    }


}

if (require.main === module) {
    !async function main() {
        const asm_p = process.argv[2]
        const fileAsm = (await readFile(asm_p)).toString();
        const libraries = fileAsm.split('\n')[0].split(': ').slice(1).flat().join('').split('~').map(l => `"${l}"`);
        const out_p = process.argv[3] ?? 'out.exe'
        const output_obj = `${crypto.randomUUID()}.obj`
        await nasm('-f win64', asm_p, '-o', output_obj);
        await lld(
            '/subsystem:console',
            '/entry:main',
            '/out:' + out_p,
            output_obj,
            // `"${path.resolve('./lib/w.a')}"`,
            // `"${path.resolve('./lib/libkernel32.a')}"`
            ...libraries
        )

        await unlink(path.resolve(output_obj))
    }();
}
