import { readFile, readFileSync } from 'fs';

interface instruction {
    op:string
}

function parseLine(line:string):instruction {
    return {
        op:'none'
    }
}

function main() {
    const buff = readFileSync('./program.asm');
    console.log(buff.toString());
}

main();