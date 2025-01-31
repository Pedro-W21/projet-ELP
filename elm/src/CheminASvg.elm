module CheminASvg exposing (..)

import ParseurChemin exposing (Chemin(..))
import Svg exposing (..)
import Svg.Attributes exposing (..)
import Maybe exposing (withDefault)

type alias Turtle = { posx : Float, posy : Float, orient : Float, drawing : Bool, color : String, size : Float, drawing_size : Float }


-- rajoute une ligne SVG entre les 2 turtle données à la liste de SVG donnée, et continue l'exécution des étapes de dessin
goForward : List Chemin -> Turtle -> Turtle -> (List (Svg msg)) -> (Turtle, (List (Svg msg)))
goForward steps turt next_turt svg_final =
    if turt.drawing then
        getSvgDataRecursive steps next_turt ( List.append svg_final
            [ line [ Svg.Attributes.strokeWidth (String.fromFloat turt.size)
                    , Svg.Attributes.stroke (String.trim turt.color)
                    , x1 (String.fromFloat turt.posx)
                    , y1 (String.fromFloat turt.posy)
                    , x2 (String.fromFloat next_turt.posx)
                    , y2 (String.fromFloat next_turt.posy)
                    ] []
            ]
        )
    else
        getSvgDataRecursive steps next_turt svg_final
-- le premier call répète la liste d'étapes donnée le nombre de fois qu'on lui donne, tout en mettant à jour la turtle et la liste des SVG, renvoie la turtle finale après la répétition demandée
repeatSteps : Int -> List Chemin -> Turtle -> (List (Svg msg)) -> (Turtle, (List (Svg msg)))
repeatSteps nb_left steps turt svg_final =
    if nb_left > 0 then
        doSvgRecursiveWithTurt steps (repeatSteps (nb_left - 1) steps turt svg_final)
    else
        (turt, svg_final)
-- comme getSvgDataRecursive, mais prend un tuple comme 2ème argument comme ça on peut lui donner en entrée la sortie de repeatSteps directement
doSvgRecursiveWithTurt : List Chemin -> (Turtle, (List (Svg msg))) -> (Turtle, (List (Svg msg)))
doSvgRecursiveWithTurt rest_of_steps (turt, final_svg) =
    getSvgDataRecursive rest_of_steps turt final_svg


-- à partir d'une liste d'étape à effectuer, d'une turtle initiale et d'une liste de SVG donnée, renvoie la turtle et la liste de SVG finale après l'exécution des étapes demandées
getSvgDataRecursive : List Chemin -> Turtle -> (List (Svg msg)) -> (Turtle, (List (Svg msg)))
getSvgDataRecursive steps turt final_svg =
    case steps of
        [] ->
            (turt, final_svg)

        (step :: rest_of_steps) ->
            case step of
                Forward long ->
                    goForward rest_of_steps turt
                        (Turtle (turt.posx + cos (degrees turt.orient) * (long*turt.drawing_size)) (turt.posy + sin (degrees turt.orient) * (long*turt.drawing_size)) turt.orient turt.drawing turt.color turt.size turt.drawing_size)
                        final_svg

                Right changement ->
                    getSvgDataRecursive rest_of_steps (Turtle turt.posx turt.posy (turt.orient + changement) turt.drawing turt.color turt.size turt.drawing_size) final_svg

                Left changement ->
                    getSvgDataRecursive rest_of_steps (Turtle turt.posx turt.posy (turt.orient - changement) turt.drawing turt.color turt.size turt.drawing_size) final_svg

                Repeat nb repeat_steps ->
                    doSvgRecursiveWithTurt rest_of_steps (repeatSteps nb repeat_steps turt final_svg)

                Hide ->
                    getSvgDataRecursive rest_of_steps (Turtle turt.posx turt.posy turt.orient False turt.color turt.size turt.drawing_size) final_svg

                Show ->
                    getSvgDataRecursive rest_of_steps (Turtle turt.posx turt.posy turt.orient True turt.color turt.size turt.drawing_size) final_svg

                Color couleur ->
                    getSvgDataRecursive rest_of_steps (Turtle turt.posx turt.posy turt.orient turt.drawing couleur turt.size turt.drawing_size) final_svg

                Size taille ->
                    getSvgDataRecursive rest_of_steps (Turtle turt.posx turt.posy turt.orient turt.drawing turt.color (taille * turt.drawing_size) turt.drawing_size) final_svg

                Square taille ->
                    doSvgRecursiveWithTurt rest_of_steps (repeatSteps 1 [Show, Left 90, Forward (taille/2), Right 90, Repeat 3 [Forward taille, Right 90], Forward (taille/2), Right 90, Hide, Forward taille, Show] turt final_svg)
                
                Circle taille ->
                    doSvgRecursiveWithTurt rest_of_steps (repeatSteps 1 [Show, Left 90, Repeat 360 [Forward (taille * pi/360), Right 1], Right 90, Hide, Forward taille, Show] turt final_svg)
                
                Dash long pas ->
                    doSvgRecursiveWithTurt rest_of_steps (repeatSteps (ceiling (long/pas)) [Show, Forward (pas/2), Hide, Forward (pas/2), Show] turt final_svg)
