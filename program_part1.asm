    ldi R3, $87 ; R3 = $87
    ldi R3, 1(R3) ; R3 = $88
    ld R2, $75 ; R2 = ($75) = $56
    ldi R2, -2(R2) ; R2 = $54
    ld R1, 4(R2) ; R1 = ($58) = $34
    ldi R0, 1 ; R0 = 1
    ldi R3, $73 ; R3 = $73
    brmi R3, 3 ; continue with the next instruction (will not branch)
    ldi R3, 5(R3) ; R3 = $78
    ld R7, -3(R3) ; R7 = ($78 - 3) = $56
    nop
    brpl R7, 2 ; continue with the instruction at “target” (will branch)
    ldi R4, 6(R1) ; this instruction will not execute
    ldi R3, 2(R4) ; this instruction will not execute
    add R3, R2, R3 ; R3 = $CC
    addi R7, R7, 3 ; R7 = $59
    neg R7, R7 ; R7 = $FFFFFFA7
    not R7, R7 ; R7 = $58
    andi R7, R7, $0F ; R7 = 8
    ori R7, R1, 3 ; R7 = $37
    shr R2, R3, R0 ; R2 = $66
    st $58, R2 ; ($58) = $66 new value in memory with address $58
    ror R1, R1, R0 ; R1 = $1A
    rol R2, R2, R0 ; R2 = $CC
    or R2, R3, R0 ; R2 = $CD
    and R1, R2, R1 ; R1 = $8
    st $67(R1), R2 ; ($75) = $CD new value in memory with address $75
    sub R3, R2, R3 ; R3 = 1
    shl R1, R2, R0 ; R1 = $19A
    ldi R4, 5 ; R4 = 5
    ldi R5, $1D ; R5 = $1D
    mul R5, R4 ; HI = 0; LO = $91
    mfhi R7 ; R7 = 0
    mflo R6 ; R6 = $91
    div R5, R4 ; HI = 4, LO = 5
    ldi R10, 0(R4) ; R10 = 5 setting up argument registers
    ldi R11, 2(R5) ; R11 = $1F R8, R9, R10, and R11
    ldi R12, 0(R6) ; R12 = $91
    ldi R13, 0(R7) ; R13 = 0
    jal R12 ; address of subroutine subA in R12 - return address in R14
    halt ; upon return, the program halts