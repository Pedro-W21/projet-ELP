module Main exposing (..)

import ParseurChemin exposing (..)
import Parser exposing (run)
import Browser
import Html exposing (Html, button, div, text, input)
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
    ({commande_str = "", commandes = [], erreur = Rien, commandesExecutees = [], dessinEnCours = False, svgPartiel = [], svgFini = []}, Cmd.none)

-- UPDATE

type Msg
    = Change String
    | Render
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
                    , erreur = Message "Commande invalide, veuillez entrer une des commandes suivantes: Forward <distance>, Left <angle>, Right <angle>, Hide, Show, Color <couleur>, Size <taille>, Square ou Circle."
                }, Cmd.none)
            else
                ({ model
                    | commandes = chemins
                    , erreur = Rien
                    , dessinEnCours = True
                    , svgFini = (Tuple.second (CheminASvg.getSvgDataRecursive chemins  (Turtle 150 150 0 True "Blue" 2) []))
                }, Task.perform (\_ -> Timer) (Process.sleep 1))
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
        [ div [ Html.Attributes.style "margin" "10px" ]
            [ input [ placeholder "Commande à afficher", value model.commande_str, onInput Change, Html.Attributes.style "padding" "10px", Html.Attributes.style "font-size" "16px" ] []
            ]
        , div [ Html.Attributes.style "margin" "10px" ]
            [ button [ onClick Render, Html.Attributes.style "padding" "10px", Html.Attributes.style "font-size" "16px" ] [ Html.text "Rendu des commandes" ]
            ]
        , case model.erreur of
            Rien ->
                div [ Html.Attributes.style "margin" "10px", Html.Attributes.style "border" "1px solid #ccc", Html.Attributes.style "padding" "10px" ]
                    [ svg [ Svg.Attributes.width (String.fromInt 300), Svg.Attributes.height (String.fromInt 300), viewBox "0 0 300 300" ]
                        model.svgPartiel
                    ]
            Message msg ->
                div [ Html.Attributes.style "color" "red", Html.Attributes.style "text-align" "center", Html.Attributes.style "width" "300px" ]
                    [ Html.text msg ]
        ]
