    add R9, R10, R12 ; R8 and R9 are return value registers
    sub R8, R11, R13 ; R9 = $96, R8 = $1F
    sub R9, R9, R8 ; R13 = $77
    jr R14 ; return from procedure