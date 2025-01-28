module CheminASvg exposing (..)

import ParseurChemin exposing (Chemin(..))
import Svg exposing (..)
import Svg.Attributes exposing (..)
import Maybe exposing (withDefault)

type alias Turtle = { posx : Float, posy : Float, orient : Float, drawing : Bool, color : String, size : Float, drawing_size : Float }

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

repeatSteps : Int -> List Chemin -> Turtle -> (List (Svg msg)) -> (Turtle, (List (Svg msg)))
repeatSteps nb_left steps turt svg_final =
    if nb_left > 0 then
        doSvgRecursiveWithTurt steps (repeatSteps (nb_left - 1) steps turt svg_final)
    else
        (turt, svg_final)

concatenateIntoMovementTuple : (Turtle, (List (Svg msg))) -> (List (Svg msg)) -> (Turtle, (List (Svg msg)))
concatenateIntoMovementTuple (turt, svg_to_add) start_svg =
    (turt, List.append start_svg svg_to_add)

doSvgRecursiveWithTurt : List Chemin -> (Turtle, (List (Svg msg))) -> (Turtle, (List (Svg msg)))
doSvgRecursiveWithTurt rest_of_steps (turt, final_svg) =
    getSvgDataRecursive rest_of_steps turt final_svg

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

                -- Forme forme_steps ->
                --     getSvgDataRecursive (List.append forme_steps rest_of_steps) turt final_svg
