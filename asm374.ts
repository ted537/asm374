import { readFileSync } from 'fs';

interface instruction {
    op:string,
    params:string[]
}

interface address {
    regField:field,
    immediateOffset:number
}

interface field {
    bits:number,
    value:number
}

function parseImmediate(str:string):number {
    if (str[0]=='$') {
        return Number.parseInt(str.substr(1),16);
    }
    else {
        return Number.parseInt(str,10);
    }
}

function parseAddress(param:string):address {
    // this is an immediate address
    if (param.includes("(")) {
        const immediateOffset = parseImmediate(param);
        const startIndex = param.indexOf("(")+1;
        const stopIndex = param.indexOf(")");
        const length = stopIndex-startIndex;
        const regField = fieldFromRegister(param.substr(startIndex,length))
        return {regField,immediateOffset}
    }
    else {
        const immediateOffset = parseImmediate(param);
        return {
            regField:{
                bits:4,
                value:0
            },
            immediateOffset
        }
    }
}

function fieldFromRegister(reg:string):field {
    return {
        bits:4,
        value:Number.parseInt(reg.substr(1))
    }
}

const OP_TABLE : {[opcode:string]:number} = {
    'ld':0,
    'ldi':1,
    'st':2,
    'add':3,
    'sub':4,
    'shr':5,
    'shl':6,
    'ror':7,
    'rol':8,
    'and':9,
    'or':10,
    'addi':11,
    'andi':12,
    'ori':13,
    'mul':14,
    'div':15,
    'neg':16,
    'not':17,
    'brzr':18,'brnz':18,'brmi':18,'brpl':18,
    'jr':19,
    'jal':20,
    'in':21,
    'out':22,
    'mfhi':23,
    'mflo':24,
    'nop':25,
    'halt':26
}

const BR_TABLE : {[opcode:string]:number} = {
    'brzr':0,
    'brnz':1,
    'brpl':2,
    'brmi':3
}

function assembleInstruction(instruction:instruction):field[] {
    const {op,params} = instruction
    const fields:field[] = [{
        bits:5,
        value:OP_TABLE[instruction.op]
    }]
    switch(op) {
        // load
        case 'ld': case 'ldi':{
            const ra = fieldFromRegister(params[0]);
            fields.push(ra);
            const address = parseAddress(params[1]);
            const rb = address.regField;
            fields.push(rb);
            const immediateField = {
                bits:19,
                value:address.immediateOffset
            }
            fields.push(immediateField);
            return fields;
        }
        // store
        case 'st':{
            const storeAddress = parseAddress(params[0]);
            const rb = storeAddress.regField;
            const ra = fieldFromRegister(params[1]);
            fields.push(ra);
            fields.push(rb);
            fields.push({
                bits:19,
                value:storeAddress.immediateOffset
            })
            return fields;
        }
        // three registers ALU
        case 'add': case 'sub': case 'and': case 'or': case 'shr': case 'shl': case 'ror': case 'rol': {
            const ra = fieldFromRegister(params[0]);
            const rb = fieldFromRegister(params[1]);
            const rc = fieldFromRegister(params[2]);
            fields.push(ra);
            fields.push(rb);
            fields.push(rc);
            fields.push({
                bits:15,
                value:0
            })
            return fields;
        }
        case 'addi':case 'andi': case 'ori': {
            const ra = fieldFromRegister(params[0]);
            const rb = fieldFromRegister(params[1]);
            const c = {
                bits:19,
                value:parseImmediate(params[2])
            }
            fields.push(ra);
            fields.push(rb);
            fields.push(c);
            return fields;
        }
        // two registers ALU
        case 'mul': case 'div': case 'neg': case 'not': {
            const ra = fieldFromRegister(params[0]);
            const rb = fieldFromRegister(params[1]);
            fields.push(ra);
            fields.push(rb);
            fields.push({
                bits:19,
                value:0
            })
            return fields;
        }
        // branch
        case 'brmi': case 'brpl': case 'brzr': case 'brnz':
            const ra = fieldFromRegister(params[0]);
            fields.push(ra);
            const br_val = BR_TABLE[op]
            fields.push({bits:2,value:br_val})

            // 2 padding bits
            fields.push({bits:2,value:0});

            const immediateField = {
                bits:19,
                value:parseImmediate(params[1])
            };
            fields.push(immediateField);

            return fields;
        // one register
        case 'jr': case 'jal': case 'in': case 'out': case 'mfhi': case 'mflo':{
            const ra = fieldFromRegister(params[0]);
            fields.push(ra);
            fields.push({
                bits:23,
                value:0
            })
            return fields;
        }
        // simple
        case 'nop':case 'halt':
            // pad rest of instruction
            fields.push({
                bits:27,value:0
            })
            return fields;
        default:
            console.warn(`Unrecognized opcode: ${instruction.op}`);
    }
    return [];
}

function parseInstruction(line:string):instruction {
    const startIndex = line.includes(':') ? line.indexOf(':')+1 : 0;
    const stopIndex = line.includes(';') ? line.indexOf(';') : line.length;
    const length = stopIndex-startIndex;

    const filtered = line.substr(startIndex,length).replace("\r","").trim();
    let spaceIndex = filtered.indexOf(' ');
    if (spaceIndex==-1) spaceIndex = filtered.length;
    const op = filtered.substr(0,spaceIndex);

    const right_side = filtered.substr(spaceIndex).trim();
    const params = right_side.split(',').map(param=>param.trim());

    return {
        op,
        params
    }
}

function bitsToNumber(fields_des:field[]) {
    const fields_asc = [...fields_des].reverse();
    let i=0;
    let num = 0;
    for (const field of fields_asc) {
        let unsigned_val:number;
        if (field.value>=0) {
            unsigned_val = field.value;
        }
        else {
            unsigned_val = Math.pow(2,field.bits) + field.value
        }
        const shifted_val = unsigned_val * Math.pow(2,i);
        num += shifted_val;
        i+=field.bits;
    }
    return num;
}

function separateBits(bitString:string):string {
    return [
        bitString.substr(0,5),
        bitString.substr(5,4),
        bitString.substr(9,4),
        bitString.substr(13,4),
        bitString.substr(17)
    ].join(' ');
}

function main() {
    const buff = readFileSync('./program_part1.asm')
    const lines = buff.toString().split("\n")
    const instructions = lines.map(parseInstruction);
    const assembled = instructions.map(assembleInstruction);
    const compiled = assembled.map(bitsToNumber);
    console.log('INSTRUCTION'.padEnd(40) + '  OP   RA   RB   RC   IMMEDIATE'.padEnd(36).padStart(40))
    for (let i=0;i<lines.length;++i) {
        const commentIndex = lines[i].indexOf(';');
        const lineNoComment = commentIndex===-1 ? lines[i] : lines[i].substr(0,commentIndex);
        console.log(lineNoComment.padEnd(40)+separateBits(compiled[i].toString(2).padStart(32,'0')).padStart(40));
    }
}

main();