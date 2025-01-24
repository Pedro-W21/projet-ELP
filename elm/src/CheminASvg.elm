module CheminASvg exposing (..)
import ParseurChemin exposing (Chemin)
import ParseurChemin exposing (Chemin(..))
import Svg exposing (..)
import Svg.Attributes exposing (..)
import Parser exposing(int)
import Maybe exposing (withDefault)

a = 1

type alias Turtle = {posx:Float, posy:Float, orient:Float}

goForward : List Chemin -> Turtle -> Turtle ->  (List (Svg msg)) -> (Turtle, (List (Svg msg)))
goForward steps turt next_turt svg_final = 
    getSvgDataRecursive steps next_turt (List.append svg_final [line [Svg.Attributes.strokeWidth "2", Svg.Attributes.stroke "Blue", x1 (String.fromInt(floor(turt.posx))), y1 (String.fromInt(floor(turt.posy))), x2 (String.fromInt(floor(next_turt.posx))), y2 (String.fromInt(floor(next_turt.posy)))] []])

repeatSteps : Int -> List Chemin -> Turtle ->  (List (Svg msg)) -> (Turtle,  (List (Svg msg)))
repeatSteps nb_left steps turt svg_final = 
    if nb_left > 0 then (doSvgRecursiveWithTurt steps (repeatSteps (nb_left-1) steps turt svg_final) ) else (turt, svg_final)

concatenateIntoMovementTuple : (Turtle,  (List (Svg msg))) ->  (List (Svg msg)) -> (Turtle,  (List (Svg msg)))
concatenateIntoMovementTuple (turt, svg_to_add) start_svg =
    (turt, List.append start_svg svg_to_add)

doSvgRecursiveWithTurt : List Chemin -> (Turtle,  (List (Svg msg))) -> (Turtle,  (List (Svg msg)))
doSvgRecursiveWithTurt rest_of_steps (turt, final_svg) =
    getSvgDataRecursive rest_of_steps turt final_svg

getSvgDataRecursive : List Chemin -> Turtle ->  (List (Svg msg)) -> (Turtle,  (List (Svg msg)))
getSvgDataRecursive steps turt final_svg = case steps of
    [] -> (turt, final_svg)
    (step :: rest_of_steps) -> case step of
                                Forward long -> goForward rest_of_steps (turt) (Turtle (turt.posx + cos(degrees turt.orient) * long) (turt.posy + sin(degrees turt.orient) * long) turt.orient) final_svg
                                Right changement -> getSvgDataRecursive rest_of_steps (Turtle (turt.posx) (turt.posy) (turt.orient + changement)) final_svg
                                Left changement -> getSvgDataRecursive rest_of_steps (Turtle (turt.posx) (turt.posy) (turt.orient - changement)) final_svg
                                Repeat nb repeat_steps -> doSvgRecursiveWithTurt rest_of_steps (repeatSteps (nb) (repeat_steps) (turt) (final_svg))