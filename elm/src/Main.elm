module Main exposing (..)
import ParseurChemin exposing (..)
import Parser exposing (run)
import Browser
import Html exposing (Html, button, div, text, input)
import Html.Events exposing (onClick, onInput)
import Html.Attributes exposing (..)
import ParseurChemin exposing (Chemin)



-- MAIN


main =
  Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model = { commandes:(List Chemin), commande_str:String }


init : Model
init =
  {commande_str="", commandes=[]}



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
    Change str -> { model | commande_str=str }
    Render -> {model | commandes=unwrap (run extraitListeChemin model.commande_str)}



-- VIEW


view : Model -> Html Msg
view model =
  div []
    [ input [ placeholder "Commande à afficher", value model.commande_str, onInput Change ] []
    , div [] []
    , button [ onClick Render] [ text "Rendu des commandes" ]
    ]