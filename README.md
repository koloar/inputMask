selector: appInputMask

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