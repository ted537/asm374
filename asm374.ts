import * as fs from 'fs';

interface instruction {
    op:string
}

function parseLine(line:string):instruction {
    return {
        op:'none'
    }
}