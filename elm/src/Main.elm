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

-- MAIN

main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions}

-- MODEL

type alias Model =
    { commandes : List Chemin
    , commande_str : String
    , erreur : Erreur
    , commandesExecutees : List Chemin
    , dessinEnCours : Bool
    }

type Erreur
    = Rien
    | Message String

init : () -> (Model, Cmd Msg)
init _ =
    ( {commande_str = "", commandes = [], erreur = Rien, commandesExecutees = [], dessinEnCours = False}, Cmd.none )

-- UPDATE

type Msg
    = Change String
    | Render
    | Timer
    | Start
    | Stop

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
                    , erreur = Message "Commande invalide, veuillez entrer une des commandes suivantes: forward <distance>, left <angle>, right <angle>, hide, show, color <couleur>, size <taille>, <forme>"
                }, Cmd.none)
            else
                ({ model
                    | commandes = chemins
                    , erreur = Rien
                }, Cmd.none)
        Start ->
            ( { model | dessinEnCours = True }, Cmd.none ) --commence dessin

        Stop ->
            ( { model | dessinEnCours = False }, Cmd.none ) --arrete dessin

        Timer ->
            if model.dessinEnCours then --si on dessine, on arrete si plus de commandes et on continue si commande
                case model.commandes of
                    [] ->
                        ( { model | dessinEnCours = False }, Cmd.none )

                    nextCommand :: remaining ->
                        ( { model
                            | commandes = remaining
                            , commandesExecutees = model.commandesExecutees ++ [ nextCommand ]
                          }
                        , Cmd.none
                        )

            else
                (model, Cmd.none)

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
    if model.dessinEnCours then
        every 500 (\_ -> Timer) -- message Timer déclenché toutes les 0,5s
    else
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
                        (Tuple.second (CheminASvg.getSvgDataRecursive model.commandes (Turtle 150 150 0 True "Blue" 2) []))
                    ]
            Message msg ->
                div [ Html.Attributes.style "color" "red", Html.Attributes.style "text-align" "center", Html.Attributes.style "width" "300px" ]
                    [ Html.text msg ]
        ]
