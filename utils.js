exports.createFunctionCall = function createFunctionCall(symbolName, rcx, rdx=null, r8=null, r9=null) {
    const registerOrder = ['rcx', 'rdx', 'r8', 'r9']
    const regmovs = [rcx, rdx, r8, r9].filter(Boolean)
    return [
        `sub rsp, 32`,
        ...regmovs.map((moveValue, i) => `mov ${registerOrder[i]}, ${moveValue}`),
        `call ${symbolName}`,
        `add rsp, 32`
    ]
}

exports.generateAsm = function generateAssembly(cs, ds) {
    return `; must link: ${cs.toLink.join('~')}
global main
${cs.externals.map(symbol => 'extern ' + symbol).join('\n')}
section .data
${ds.out().filter(Boolean).map(l => `\t${l}`).join('\n')}
section .text
main:
${cs.out().filter(Boolean).map(l => `\t${l}`).join('\n')}`
}

