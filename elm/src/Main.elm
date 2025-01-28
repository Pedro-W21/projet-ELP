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
import Platform.Cmd as Cmd

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
    }

type Erreur
    = Rien
    | Message String

init : () -> (Model, Cmd Msg)
init _ =
<<<<<<< HEAD
    ( { commande_str = "", commandes = [], erreur = Rien, commandesExecutees = [], dessinEnCours = False, taille_dessin = 1, initial_x = 150, initial_y = 150 }, Cmd.none )
=======
    ( {commande_str = "", commandes = [], erreur = Rien, commandesExecutees = [], dessinEnCours = False, taille_dessin = 1, initial_x = 0, initial_y = 0}, Cmd.none )
>>>>>>> a339228317688b83c565728bc1e98414380670a5

-- UPDATE

type Msg
    = Change String
    | Render
    | ChangeTailleDessin String
    | BougeDessinHoriz String
    | BougeDessinVert String
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
                    , erreur = Message """!!! Commande invalide, veuillez entrer une des commandes de la liste ci-dessous !!!"""
                }, Cmd.none)
            else
                ({ model
                    | commandes = chemins
                    , erreur = Rien
                }, Cmd.none)
<<<<<<< HEAD

        AugmenteTailleDessin ->
            ({ model | taille_dessin = model.taille_dessin * 1.1 }, Cmd.none)

        ReduitTailleDessin ->
            if model.taille_dessin > 0.2 then
                ({ model | taille_dessin = model.taille_dessin * 0.9 }, Cmd.none)
            else
                (model, Cmd.none)

        BougeDessinBas ->
            ({ model | initial_y = model.initial_y + 3.0 * model.taille_dessin }, Cmd.none)

        BougeDessinHaut ->
            ({ model | initial_y = model.initial_y - 3.0 * model.taille_dessin }, Cmd.none)

        BougeDessinGauche ->
            ({ model | initial_x = model.initial_x - 3.0 * model.taille_dessin }, Cmd.none)

        BougeDessinDroite ->
            ({ model | initial_x = model.initial_x + 3.0 * model.taille_dessin }, Cmd.none)

=======
        ChangeTailleDessin str -> 
            ({ model | taille_dessin = (String.toFloat str |> Maybe.withDefault 5.0)/5.0}, Cmd.none)
        BougeDessinVert str ->
            ({ model | initial_y = ((String.toFloat str |> Maybe.withDefault 0.0) * model.taille_dessin)}, Cmd.none)
        
        BougeDessinHoriz str ->
            ({ model | initial_x = ((String.toFloat str |> Maybe.withDefault 0.0) * model.taille_dessin)}, Cmd.none)
>>>>>>> a339228317688b83c565728bc1e98414380670a5
        Start ->
            ({ model | dessinEnCours = True }, Cmd.none) -- commence dessin

        Stop ->
            ({ model | dessinEnCours = False }, Cmd.none) -- arrête dessin

        Timer ->
            if model.dessinEnCours then -- si on dessine, on arrête si plus de commandes et on continue si commande
                case model.commandes of
                    [] ->
                        ({ model | dessinEnCours = False }, Cmd.none)

                    nextCommand :: remaining ->
                        ({ model
                            | commandes = remaining
                            , commandesExecutees = model.commandesExecutees ++ [nextCommand]
                        }, Cmd.none)
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
<<<<<<< HEAD
                    [ svg [ Svg.Attributes.width (String.fromInt 300), Svg.Attributes.height (String.fromInt 300), viewBox "0 0 1000 300" ]
                        (Tuple.second (CheminASvg.getSvgDataRecursive model.commandes (Turtle model.initial_x model.initial_y 0 True "Blue" (2 * model.taille_dessin) model.taille_dessin) []))
=======
                    [ svg [ Svg.Attributes.width (String.fromInt 300), Svg.Attributes.height (String.fromInt 300), viewBox "0 0 300 300" ]
                        (Tuple.second (CheminASvg.getSvgDataRecursive model.commandes (Turtle (model.initial_x + 150.0) (model.initial_y + 150.0) 0 True "Blue" (2*model.taille_dessin) model.taille_dessin) []))
>>>>>>> a339228317688b83c565728bc1e98414380670a5
                    ]
            Message msg ->
                div [ Html.Attributes.style "color" "black", Html.Attributes.style "text-align" "left", Html.Attributes.style "width" "300px" ]
                    [ Html.h2 [] [ Html.text "Commande invalide" ]
                    , Html.ul []
                        [ Html.li [] [ Html.text "Forward <distance> : avance le crayon d'une distance donnée" ]
                        , Html.li [] [ Html.text "Repeat <nb_iter> <liste_cmd> : répète un nombre de fois donné une liste d'instructions donnée" ]
                        , Html.li [] [ Html.text "Left <angle> : tourne le crayon vers la gauche d'un certain angle" ]
                        , Html.li [] [ Html.text "Right <angle> : tourne le crayon vers la droite d'un certain angle" ]
                        , Html.li [] [ Html.text "Hide : désactive l'écriture au passage du crayon" ]
                        , Html.li [] [ Html.text "Show : active l'écriture au passage du crayon" ]
                        , Html.li [] [ Html.text "Color <couleur> : définit une couleur donnée pour le crayon" ]
                        , Html.li [] [ Html.text "Size <taille> : définit une taille donnée pour le crayon" ]
                        , Html.li [] [ Html.text "Square <taille> : trace un carré de taille donnée" ]
                        , Html.li [] [ Html.text "Circle <taille> : trace un cercle de taille donnée" ]
                        , Html.li [] [ Html.text "Dash : écrit en pointillés de pas donné sur une distance donnée" ]
                        ]
                    ]
        ]
