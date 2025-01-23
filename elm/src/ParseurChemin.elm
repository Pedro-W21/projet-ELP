module ParseurChemin exposing (..)
import Parser exposing (..)


type Chemin = Forward Float | Right Float | Left Float | Repeat Int (List Chemin)

extraitForward : Parser Chemin
extraitForward = succeed Forward 
 |. symbol "Forward"
 |. spaces
 |= float
extraitRight : Parser Chemin
extraitRight = succeed Right
 |. symbol "Right"
 |. spaces
 |= float
extraitLeft : Parser Chemin
extraitLeft = succeed Left
 |. symbol "Left"
 |. spaces
 |= float

extraitRepeat : Parser Chemin
extraitRepeat = succeed Repeat
 |. symbol "Repeat"
 |. spaces
 |= int
 |. spaces
 |= lazy (\_ -> extraitListeChemin)


extraitListeChemin : Parser (List Chemin)
extraitListeChemin = 
    Parser.sequence 
        { start = "["
        , separator = ","
        , end = "]"
        , spaces = spaces
        , item = extraitChemin
        , trailing = Optional
        }

extraitChemin : Parser Chemin
extraitChemin = oneOf [
    extraitForward
    , extraitLeft
    , extraitRight
    , extraitRepeat
    ]

a = Forward 10