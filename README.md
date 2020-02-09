selector: appInputMask

vyplnovaní inputu:
    stisknutí povoleného písmena/čísla - zapíše char na místo stávajícího
    stisknutí ENTER - doplní celý input autoFillCharem
    stisknutí ESCAPE - vymaže všechny možné znaky za _
    stisknutí BACKSPACE - nahradí předchozí char za _
    stisknutí DELETE - nahradí aktuální char za _
    stisknutí CTRL + X - vyjme vybranou oblast a nahradí z basic placeholderu
    stisknutí CTRL + V - vloží text do inputu, volná místa nahradi za autoFillChar
                         blbě vyplněný text nahradí za autoFillChar, vyplnujě odzadu

attributy:

    appInputMask: string
        - vytvoří masku podle které lze vyplnit input
        - maska se skládá z kombinování
            - /a -> pro písmena
            - /n -> pro číslice
            - /* -> pro /a i /n
            př.: '/n/n/n - /a/a/a // /*/*/*' => '000 - aaa / 0a0'

    autoPlaceholder: boolean
        - default = false
        - z "appInputMask" vytvoří "placeholder"
        př.:  '/n/n/n - /a/a/a // /*/*/*' => '___ - ___ / ___'
    
    allowedNumber: string
        - default = [0-9]
        - lze změnit povolené znaky pro selektor /n
        př.: [5-7] => 5, 6, 7

    allowedLetter: string
        - default = [a-zA-Z]
        - lze změnit povolené znaky pro selektor /a
        př.: [5-7] => 5, 6, 7

    autoFillChar: string
        - default = _
        - při paste eventu a stisku enter nahradí
          nevyplněné políčka zástopním znakem