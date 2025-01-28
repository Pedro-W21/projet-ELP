module Main exposing (..)
import ParseurChemin exposing (..)
import Parser exposing (run)
import Browser
import Html exposing (Html, button, div, text, input)
import Html.Events exposing (onClick, onInput)
import Html.Attributes exposing (..)
import ParseurChemin exposing (Chemin)
import Svg exposing (..)
import Svg.Attributes exposing (viewBox,x, y, width, height, rx, ry, x1, x2, y1, y2)
import CheminASvg exposing (..)
import Html exposing (br)

-- MAIN

main =
  Browser.sandbox { init = init, update = update, view = view }

-- MODEL

type alias Model =
    { commandes : List Chemin
    , commande_str : String
    , erreur : Erreur
    }

type Erreur
    = Rien
    | Message String

init : Model
init =
  {commande_str="", commandes=[], erreur=Rien}

-- UPDATE

type Msg
  = Change String
  | Render

unwrap : (Result (List Parser.DeadEnd) (List Chemin)) -> (List Chemin)
unwrap res = case res of 
    Ok cool -> cool
    Err error -> []

update : Msg -> Model -> Model
update msg model =
    case msg of
        Change str ->
            { model | commande_str = str }

        Render ->
            let chemins = unwrap (run extraitListeChemin model.commande_str) in
            if List.isEmpty chemins then
                { model
                    | commandes = []
                    , erreur = Message "Commande invalide, veuillez entrer une des commandes suivantes: hide, show, color <couleur>, size <taille>, <forme>"
                }
            else
                { model
                    | commandes = chemins
                    , erreur = Rien
                }

-- VIEW

view : Model -> Html Msg
view model =
    div [ style "display" "flex", style "flex-direction" "column", style "align-items" "center", style "justify-content" "center", style "height" "100vh" ]
        [ div [ style "margin" "10px" ]
            [ input [ placeholder "Commande à afficher", value model.commande_str, onInput Change, style "padding" "10px", style "font-size" "16px" ] []
            ]
        , div [ style "margin" "10px" ]
            [ button [ onClick Render, style "padding" "10px", style "font-size" "16px" ] [ text "Rendu des commandes" ]
            ]
        , case model.erreur of
            Rien ->
                div [ style "margin" "10px", style "border" "1px solid #ccc", style "padding" "10px" ]
                    [ svg [ width 300, height 300, viewBox "0 0 300 300" ]
                        (Tuple.second (CheminASvg.getSvgDataRecursive model.commandes (Turtle 150 150 0 True "Blue" 2) []))
                    ]
            Message msg ->
                div [ style "color" "red", style "text-align" "center", style "width" "300px" ]
                    [ text msg ]
        ]
