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
import Html.Events exposing (onMouseDown)

-- MAIN

main =
    Browser.sandbox { init = init, update = update, view = view }

-- MODEL

type alias Model =
    { commandes : List Chemin
    , commande_str : String
    , erreur : Erreur
    , taille_dessin : Float
    , initial_x : Float
    , initial_y : Float
    }

type Erreur
    = Rien
    | Message String

init : Model
init =
    { commande_str = "", commandes = [], erreur = Rien, taille_dessin = 1, initial_x = 150, initial_y = 150 }

-- UPDATE

type Msg
    = Change String
    | Render
    | AugmenteTailleDessin
    | ReduitTailleDessin
    | BougeDessinGauche
    | BougeDessinDroite
    | BougeDessinBas
    | BougeDessinHaut

unwrap : Result (List Parser.DeadEnd) (List Chemin) -> List Chemin
unwrap res =
    case res of
        Ok cool ->
            cool

        Err _ ->
            []

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
                    , erreur = Message "Commande invalide, veuillez entrer une des commandes suivantes: Forward <distance>, Left <angle>, Right <angle>, Hide, Show, Color <couleur>, Size <taille>, Square ou Circle."
                }
            else
                { model
                    | commandes = chemins
                    , erreur = Rien
                }
        AugmenteTailleDessin -> 
            { model | taille_dessin = model.taille_dessin * 1.1}
        ReduitTailleDessin -> 
            if model.taille_dessin > 0.2 then
                { model | taille_dessin = model.taille_dessin * 0.9}
            else
                model
        BougeDessinBas -> 
            { model | initial_y = model.initial_y + 3.0 * model.taille_dessin}
        BougeDessinHaut -> 
            { model | initial_y = model.initial_y - 3.0 * model.taille_dessin}
        
        BougeDessinGauche -> 
            { model | initial_x = model.initial_x - 3.0 * model.taille_dessin}
        BougeDessinDroite -> 
            { model | initial_x = model.initial_x + 3.0 * model.taille_dessin}

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
        , div [ Html.Attributes.style "margin" "10px" ]
            [ button [ onMouseDown AugmenteTailleDessin, Html.Attributes.style "padding" "10px", Html.Attributes.style "font-size" "16px" ] [ Html.text "Agrandir le dessin" ]
            ]
        , div [ Html.Attributes.style "margin" "10px" ]
            [ button [ onMouseDown ReduitTailleDessin, Html.Attributes.style "padding" "10px", Html.Attributes.style "font-size" "16px" ] [ Html.text "Rendre le dessin plus petit" ]
            ]
        , div [ Html.Attributes.style "margin" "10px" ]
            [ button [ onMouseDown BougeDessinHaut, Html.Attributes.style "padding" "10px", Html.Attributes.style "font-size" "16px" ] [ Html.text "En haut" ]
            ]
        , div [ Html.Attributes.style "margin" "10px" ]
            [ button [ onMouseDown BougeDessinBas, Html.Attributes.style "padding" "10px", Html.Attributes.style "font-size" "16px" ] [ Html.text "En bas" ]
            ]
        , div [ Html.Attributes.style "margin" "10px" ]
            [ button [ onMouseDown BougeDessinGauche, Html.Attributes.style "padding" "10px", Html.Attributes.style "font-size" "16px" ] [ Html.text "à gauche" ]
            ]
        , div [ Html.Attributes.style "margin" "10px" ]
            [ button [ onMouseDown BougeDessinDroite, Html.Attributes.style "padding" "10px", Html.Attributes.style "font-size" "16px" ] [ Html.text "à droite" ]
            ]
        , case model.erreur of
            Rien ->
                div [ Html.Attributes.style "margin" "10px", Html.Attributes.style "border" "1px solid #ccc", Html.Attributes.style "padding" "10px" ]
                    [ svg [ Svg.Attributes.width (String.fromInt 300), Svg.Attributes.height (String.fromInt 300), viewBox "0 0 300 300" ]
                        (Tuple.second (CheminASvg.getSvgDataRecursive model.commandes (Turtle model.initial_x model.initial_y 0 True "Blue" (2*model.taille_dessin) model.taille_dessin) []))
                    ]
            Message msg ->
                div [ Html.Attributes.style "color" "red", Html.Attributes.style "text-align" "center", Html.Attributes.style "width" "300px" ]
                    [ Html.text msg ]
        ]
