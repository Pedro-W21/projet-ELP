module ParseurChemin exposing (..)
import Parser exposing (..)
import String exposing (..)

type Chemin
    = Forward Float
    | Right Float
    | Left Float
    | Repeat Int (List Chemin)
    | Hide
    | Show
    | Color String
    | Size Float
    -- | Square Float
    -- | Circle Float

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

extraitHide : Parser Chemin
extraitHide = succeed Hide
    |. symbol "Hide"

extraitShow : Parser Chemin
extraitShow = succeed Show
    |. symbol "Show"

extraitColor : Parser Chemin
extraitColor = succeed Color
    |. symbol "Color"
    |. spaces
    |= getChompedString (chompWhile (\c -> c /= ' ' && c /= ','))

extraitSize : Parser Chemin
extraitSize = succeed Size
    |. symbol "Size"
    |. spaces
    |= float

-- extraitSquare : Parser Chemin
-- extraitSquare = succeed Square
--     |. symbol "<square>"
--     |. spaces
--     |= float

-- extraitCircle : Parser Chemin
-- extraitCircle = succeed Circle
--     |. symbol "<circle>"
--     |. spaces
--     |= float

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
    , extraitHide
    , extraitShow
    , extraitColor
    , extraitSize
    -- , extraitSquare
    -- , extraitCircle
    ]
