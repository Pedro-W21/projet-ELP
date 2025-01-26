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


type alias Model = { commandes:(List Chemin), commande_str:String, erreur:Erreur }

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
    Change str -> { model | commande_str=str } --change les messages/commandes = entre instructions dans cadre du haut
    Render -> let chemins = unwrap (run extraitListeChemin model.commande_str) in --applique le change = clique sur bouton
            if List.isEmpty chemins then -- si la liste est vide y'a une erreur
                { model
                    | commandes = []
                    , erreur = Message "Commande invalide, veuillez entrer une des commandes suivantes: " --A REMPLIR, COMMENT ON FAIT DES LISTES??
                }
            else --sinon ça va
                { model
                    | commandes = chemins
                    , erreur = Rien
                }


-- VIEW


view : Model -> Html Msg
view model =
  div [
    Html.Attributes.style "display" "flex"
    , Html.Attributes.style "align-items" "center"
    , Html.Attributes.style "justify-content" "center"
    ]
      
  [
  div []
    [ input [ placeholder "Commande à afficher", value model.commande_str, onInput Change ] []
    , div [] []
    , button [ onClick Render] [ Html.text "Rendu des commandes" ]
    , div [] []
    , case model.erreur of -- vérifie si on a une erreur ou pas
      Rien -> --cas normal
        svg [ Html.Attributes.width 300, Html.Attributes.height 300, viewBox "0 0 300 300" ] (Tuple.second (CheminASvg.getSvgDataRecursive model.commandes (Turtle 150 150 0) []))
      Message msg -> --cas erreur, on récupère le message en string
        div [ Html.Attributes.style "color" "red"
              , Html.Attributes.style "display" "flex"
              , Html.Attributes.style "align-items" "center"
              , Html.Attributes.style "justify-content" "center"
              , Html.Attributes.style "text-align" "center"
              , Html.Attributes.style "width" "300px"]
            [ Html.text msg ]
    ]
  ]
--reste à essayer de centrer tout le monde et chercher comment faire une liste des instructions sous html