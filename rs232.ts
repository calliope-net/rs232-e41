
//% color=#002050 icon="\uf093" block="RS-232" weight=15
namespace rs232
/* 
    https://de.wikipedia.org/wiki/RS-232
    https://calliope-net.github.io/rs232-e41/
    https://calliope-net.github.io/rs232-e41/rs232.png
*/ {


    //% group="Empfang"
    //% block="Bitarray auswerten (10 Bit) %pab_Bin" weight=2
    export function parse10Bit(pab_Bin: boolean[]) {
        let iDez = 0, iParity = 0, iFehler = 0
        let iExp = 1
        let bBit: boolean
        if (pab_Bin.length < 10) {
            iFehler = -1
        }
        else {
            for (let i = 0; i <= 9; i++) { // 10 Bit im Array boolean[]
                bBit = pab_Bin[i]          // aktuelles Bit lesen (negative Logik)
                if (i == 0 && !bBit) {     // [0] Start Bit false - muss true sein (Licht an-true = logisch 0)
                    iFehler = -2
                    break // for
                }
                else if (i >= 1 && i <= 7) { // [1]..[7] Daten Bits (Licht aus-false = logisch 1)
                    if (!bBit) {
                        iParity++ // Parity zählt (Licht aus-false = logisch 1)
                        iDez += iExp
                    }
                    iExp = iExp << 1 // um 1 Bit nach links schieben entspricht *2
                }
                else if (i == 8) {       // [8] Parity Bit
                    if (!bBit) { // Parity zählt (Licht aus-false = logisch 1)
                        iParity++
                    }
                    if (iParity % 2 != 0) { // ungerade Parität - Fehler -8
                        iFehler = -3
                        break // for
                    }
                }
                else if (i == 9 && bBit) { // [9] Stop Bit true - muss false sein (Licht aus)
                    iFehler = -4
                    break // for
                }
            }
        }

        if (iFehler == 0)
            return iDez
        else
            return iFehler // -1 Array<10 | -2 Start | -3 Parity | -4 Stop
    }


} // rs232.ts