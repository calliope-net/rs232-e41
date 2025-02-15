
//% color=#001FCF icon="\uf26c" block="RS-232" weight=18
namespace rs232
/* 
    
*/ {


    //% group="Empfang"
    //% block="Bitarray auswerten (10 Bit) %pab_Bin" weight=2
    export function parse10Bit(pab_Bin: boolean[]) {
        let iDez = 0
        let iExp = 1
        let iParity = 0
        let iFehler = 0
        for (let i = 0; i <= 9; i++) {
            bBit = ab11Bit[i]
            if (i == 0 && !(bBit)) {
                iFehler = -1
                break;
            } else if (i >= 1 && i <= 7) {
                if (bBit) {
                    iParity += 1
                } else {
                    iDez += iExp
                }
                iExp = iExp * 2
            } else if (i == 8) {
                if (bBit) {
                    iParity += 1
                }
                if (iParity % 2 != 0) {
                    iFehler = -8
                    break;
                }
            } else if (i == 9 && bBit) {
                iFehler = -9
                break;
            }
        }
        if (iFehler == 0) {
            return iDez
        } else {
            return iFehler
        }
    }


} // rs232.ts