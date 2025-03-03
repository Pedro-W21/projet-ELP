module Main exposing (..)

import ParseurChemin exposing (..)
import Parser exposing (run)
import Browser
import Html exposing (Html, button, div, input)
import Html.Events exposing (onClick, onInput)
import Html.Attributes exposing (..)
import Svg exposing (..)
import Svg.Attributes exposing (viewBox, width, height)
import CheminASvg exposing (..)
import Time exposing (every)
import Process
import Task

-- MAIN

main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }

-- MODEL

type alias Model =
    { commandes : List Chemin
    , commande_str : String
    , erreur : Erreur
    , taille_dessin : Float
    , initial_x : Float
    , initial_y : Float
    , commandesExecutees : List Chemin
    , dessinEnCours : Bool
    , svgPartiel : List (Svg Msg)
    , svgFini : List (Svg Msg)
    }

type Erreur
    = Rien
    | Message String

init : () -> (Model, Cmd msg )
init _ =
    ( {commande_str = "", commandes = [], erreur = Rien, commandesExecutees = [], dessinEnCours = False, svgPartiel = [], svgFini = [], taille_dessin = 1, initial_x = 0, initial_y = 0}, Cmd.none )

-- UPDATE

type Msg
    = Change String
    | Render
    | ChangeTailleDessin String
    | BougeDessinHoriz String
    | BougeDessinVert String
    | Timer

unwrap : Result (List Parser.DeadEnd) (List Chemin) -> List Chemin
unwrap res =
    case res of
        Ok cool ->
            cool

        Err _ ->
            []

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Change str ->
            ({ model | commande_str = str }, Cmd.none)

        Render ->
            let chemins = unwrap (run extraitListeChemin model.commande_str) in
            if List.isEmpty chemins then
                ({ model
                    | commandes = []
                    , erreur = Message "Commande invalide"
                }, Cmd.none)
            else
                ({ model
                    | commandes = chemins
                    , erreur = Rien
                    , dessinEnCours = True
                    , svgPartiel = []
                    , svgFini = (Tuple.second (CheminASvg.getSvgDataRecursive chemins  (Turtle (model.initial_x + 150.0) (model.initial_y + 150.0) 0 True "Blue" (2*model.taille_dessin) model.taille_dessin) []))
                }, Task.perform (\_ -> Timer) (Process.sleep 1))
        ChangeTailleDessin str -> 
            ({ model | taille_dessin = (String.toFloat str |> Maybe.withDefault 5.0)/5.0, svgPartiel = (Tuple.second (CheminASvg.getSvgDataRecursive model.commandes (Turtle (model.initial_x + 150.0) (model.initial_y + 150.0) 0 True "Blue" (2*model.taille_dessin) model.taille_dessin) []))}, Cmd.none)
        BougeDessinVert str ->
            ({ model | initial_y = ((String.toFloat str |> Maybe.withDefault 0.0) * model.taille_dessin), svgPartiel = (Tuple.second (CheminASvg.getSvgDataRecursive model.commandes (Turtle (model.initial_x + 150.0) (model.initial_y + 150.0) 0 True "Blue" (2*model.taille_dessin) model.taille_dessin) []))}, Cmd.none )
        BougeDessinHoriz str ->
            ({ model | initial_x = ((String.toFloat str |> Maybe.withDefault 0.0) * model.taille_dessin), svgPartiel = (Tuple.second (CheminASvg.getSvgDataRecursive model.commandes (Turtle (model.initial_x + 150.0) (model.initial_y + 150.0) 0 True "Blue" (2*model.taille_dessin) model.taille_dessin) []))}, Cmd.none)
        Timer ->
            if model.dessinEnCours then
                case model.svgFini of
                    [] ->
                        ( { model
                            | dessinEnCours = False
                            , commandesExecutees = []
                          }
                        , Cmd.none
                        )
                    nextCommand :: remaining ->
                        ( { model
                            |svgFini = remaining, 
                            svgPartiel = model.svgPartiel ++ [nextCommand]
                          }
                        , Task.perform (\_ -> Timer) (Process.sleep 5)
                        )
            else
                (model, Cmd.none)

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none

-- VIEW

view : Model -> Html Msg
view model =
    div [ Html.Attributes.style "display" "flex", Html.Attributes.style "flex-direction" "column", Html.Attributes.style "align-items" "center", Html.Attributes.style "justify-content" "center", Html.Attributes.style "height" "100vh" ]
        [ Html.h1 [ Html.Attributes.style "font-family" "Arial, sans-serif", Html.Attributes.style "font-size" "36px", Html.Attributes.style "color" "green", Html.Attributes.style "text-shadow" "2px 2px 4px #000000" ] [ Html.text "TcTurtleSimulator" ]
        , Html.h2 [ Html.Attributes.style "font-family" "Arial, sans-serif", Html.Attributes.style "font-size" "24px", Html.Attributes.style "color" "blue", Html.Attributes.style "text-shadow" "2px 2px 4px #000000" ] [ Html.text "Tapez ici votre code en TcTurtle, nous le traçons pour vous ! Ne nous remerciez pas XD" ]
        , div [ Html.Attributes.style "margin" "10px" ]
            [ input [ placeholder "Votre code TcTurtle", value model.commande_str, onInput Change, Html.Attributes.style "padding" "10px", Html.Attributes.style "font-size" "16px" ] []
            ]
        , div [ Html.Attributes.style "margin" "10px" ]
            [ button [ onClick Render, Html.Attributes.style "padding" "10px", Html.Attributes.style "font-size" "16px" ] [ Html.text "Appuyez ici pour afficher les instructions disponibles ou exécuter votre code " ]
            ]
        , div [ Html.Attributes.style "margin" "10px" ]
            [ 
                div [] [Html.text <| String.fromFloat model.taille_dessin]
                , input
                [ type_ "range"
                , Html.Attributes.min "1"
                , Html.Attributes.max "50"
                , value <| String.fromFloat (model.taille_dessin * 5.0)
                , onInput ChangeTailleDessin
                ]
                []
            ]
        , div [ Html.Attributes.style "margin" "10px" ]
            [ 
                div [] [Html.text <| String.fromFloat ((model.initial_x/model.taille_dessin))]
                , input
                [ type_ "range"
                , Html.Attributes.min "-150"
                , Html.Attributes.max "150"
                , value <| String.fromFloat ((model.initial_x/model.taille_dessin))
                , onInput BougeDessinHoriz
                ]
                []
            ]
        , div [ Html.Attributes.style "margin" "10px" ]
            [ 
                div [] [Html.text <| String.fromFloat ((model.initial_y/model.taille_dessin))]
                , input
                [ type_ "range"
                , Html.Attributes.min "-150"
                , Html.Attributes.max "150"
                , value <| String.fromFloat ((model.initial_y/model.taille_dessin))
                , onInput BougeDessinVert
                ]
                []
            ]
        , case model.erreur of
            Rien ->
                div [ Html.Attributes.style "margin" "10px", Html.Attributes.style "border" "1px solid #ccc", Html.Attributes.style "padding" "10px" ]
                    [ svg [ Svg.Attributes.width (String.fromInt 300), Svg.Attributes.height (String.fromInt 300), viewBox "0 0 300 300" ]
                        model.svgPartiel
                    ]
            Message msg ->
                div [ Html.Attributes.style "color" "black", Html.Attributes.style "text-align" "left", Html.Attributes.style "width" "300px" ]
                    [ Html.h2 [] [ Html.text "Instructions disponibles :" ]
                    , Html.ul []
                        [ Html.li [] [ Html.text "Forward <dist> : avance le crayon d'une distance donnée" ]
                        , Html.li [] [ Html.text "Repeat <nb_iter> <liste_cmd> : répète un nombre de fois donné une liste d'instructions donnée" ]
                        , Html.li [] [ Html.text "Left <angle> : tourne le crayon vers la gauche d'un certain angle" ]
                        , Html.li [] [ Html.text "Right <angle> : tourne le crayon vers la droite d'un certain angle" ]
                        , Html.li [] [ Html.text "Hide : désactive l'écriture du crayon" ]
                        , Html.li [] [ Html.text "Show : active l'écriture du crayon" ]
                        , Html.li [] [ Html.text "Color <couleur> : définit une couleur donnée pour le crayon" ]
                        , Html.li [] [ Html.text "Size <taille> : définit une taille donnée pour le crayon" ]
                        , Html.li [] [ Html.text "Square <taille> : trace un carré de taille donnée" ]
                        , Html.li [] [ Html.text "Circle <taille> : trace un cercle de taille donnée" ]
                        , Html.li [] [ Html.text "Dash <dist> <pas>: écrit en pointillés de pas donné sur une distance donnée" ]
                        ]
                    ]
        ]
