import express from "express";
import { Card, color, tipe, rare } from "./magiCard.js";
import './db/mongose.js'


export const app = express();
const port = process.env.PORT || 3000
/**
 * @brief Función que comprueba si un json es correcto respecto a una carta magic.
 * @param str Cadena con el json a revisar.
 * @returns Un json con el error o el json correcto.
 */


function jsonRev(str: string) {
  const json = JSON.parse(str);
  if (typeof json.user_ !== "string") {
    return { error: "User must be a string" };
  }
  if (isNaN(json.id_)) {
    return { error: "ID must be a number" };
  }
  if (typeof json.name_ !== "string") {
    return { error: "Name must be a string" };
  }
  if (isNaN(json.manaCost_)) {
    return { error: "Mana Cost must be a number" };
  }
  if (!Object.values(color).includes(json.color_)) {
    return { error: "Color must be a valid color" };
  }
  if (!Object.values(tipe).includes(json.typo_)) {
    return { error: "Type must be a valid type" };
  }
  if (!Object.values(rare).includes(json.rare_)) {
    return { error: "Rare must be a valid rare" };
  }
  if (typeof json.rules_ !== "string") {
    return { error: "Rules must be a string" };
  }
  if (json.typo_ === Object.values(tipe)[5]) {
    if (!json.loyalty_) {
      return { error: "Planeswalker type must have Loyalty" };
    }
  } else {
    if (json.loyalty_ !== undefined) {
      return { error: "Loyalty is only for planeswalker type" };
    }
  }
  if (isNaN(json.value_)) {
    return { error: "Value must be a number" };
  }
  if (json.strRes_ && isNaN(json.strRes_)) {
    return { error: "Strength/Resistance must be a number" };
  }
  if (json.typo_ === Object.values(tipe)[0]) {
    if (!json.strRes_) {
      return { error: "Creature type must have Strength/Resistance" };
    }
  } else {
    if (json.strRes_ !== undefined) {
      return { error: "Strength/Resistance is only for Creature type" };
    }
  }
  return json;
}

/**
 * @brief Petición get sobre la api. Mostrará una carta si se pasa el id en la query string o toda la colección si solmanete se pasa el usuario.
 * __Ejemplo de petición:__
 * ```url
 * http://localhost:3000/cards?user=jose&cardID=0
 * ```
 * __Ejemplo de petición:__
 * ```url
 * http://localhost:3000/cards?user=jose
 * ```
 */
app.get('/cards', (req, res) => {
   if(!req.query.cardID && req.query.user){
        const filter = req.query.user?{user_: req.query.user.toString()}:{};
        Card.find(filter).then((cards) => {
          if (cards.length !== 0) {
            res.send(cards);
          } else {
            res.status(404).send();
          }
        }).catch(() => {
          res.status(500).send();
        });
   } else if (req.query.cardID && req.query.user) {
    const filter = req.query.user?{user_: req.query.user.toString(), id_: req.query.cardID}:{};
    Card.find(filter).then((cards) => {
      if (cards.length !== 0) {
        res.send(cards);
      } else {
        res.status(404).send();
      }
    }).catch(() => {
      res.status(500).send();
    });
   }    

    });
  
/**
 * @brief Petición post sobre la api. Creará una carta si se pasa el usuario en la query string, y los datos correctos de la carta, mediante un json en el cuerpo de la petición.
 * __Ejemplo de petición:__
 * ```json
 {
 "user_":"jose",
 "id_": 0,
 "name_": "Cazador",
 "manaCost_": 16,
 "color_": "multicolor",
 "typo_": "creature",
 "rare_": "mythicRare",
 "rules_": "No puede atacar cuerpo a cuerpo",
 "value_": 150,
 "strRes_": 100
 }
 * ```
 */
app.post("/cards", express.json(), (req, res) => {
  if (req.query.user) {
    if (!jsonRev(JSON.stringify(req.body)).error) {
        const card = new Card(req.body);
        card.save().then((card) => {
            res.send(card);
        }).catch((error) => {
            res.send(error);
        })
    } else {
      res.send(jsonRev(JSON.stringify(req.body)).error);
    }
  } else {
    res.send("User must be in query string");
  }
});

/**
 * @brief Petición delete sobre la api. Eliminará una carta si se pasa el usuario y el id de la carta en la query string.
 * __Ejemplo de petición:__
 * ```url
 * http://localhost:3000/cards?user=jose&cardID=0
 * ```
 */
app.delete('/cards', (req, res) => {
    if (!req.query.user || ! req.query.cardID) {
      res.status(400).send({
        error: 'Revisar query',
      });
    } else {
      Card.findOneAndDelete({user_: req.query.user.toString(), id_:req.query.cardID}).then((card) => {
        if (!card) {
          res.status(404).send();
        } else {
          res.send(card);
        }
      }).catch(() => {
        res.status(400).send();
      });
    }
  });
  

/**
 * @brief Petición patch sobre la api. Actualizará una carta si se pasa el usuario y el id de la carta en la query string, y los datos correctos de la carta, mediante un json en el cuerpo de la petición.
 * __Ejemplo de petición:__
 * ```url
 * http://localhost:3000/cards?user=jose&cardID=0
 * ```
 * ```json
 {
 "user_":"jose",
 "id_": 0,
 "name_": "Cazador",
 "manaCost_": 16,
 "color_": "multicolor",
 "typo_": "creature",
 "rare_": "mythicRare",
 "rules_": "No puede atacar cuerpo a cuerpo",
 "value_": 150,
 "strRes_": 100
 }
 * ```
 */
 app.patch('/cards', (req, res) => {
    if (!req.query.user && !req.query.cardID) {
      res.status(400).send({
        error: 'A title must be provided',
      });
    } else {
      const allowedUpdates = [ "user_","id_","name_","manaCost_","color_","typo_","rare_","rules_","value_","strRes_","loyalty_"]
      const actualUpdates = Object.keys(req.body);
      const isValidUpdate =
        actualUpdates.every((update) => allowedUpdates.includes(update));
  
      if (!isValidUpdate) {
        res.status(400).send({
          error: 'Update is not permitted',
        });
      } else {
        if(req.query.user) {
            Card.findOneAndUpdate({user_: req.query.user.toString(), id_:req.query.cardID}, req.body, {
                new: true,
                runValidators: true,
              }).then((note) => {
                if (!note) {
                  res.status(404).send();
                } else {
                  res.send(note);
                }
              }).catch((error) => {
                res.status(400).send(error);
              });
            }
          }
        }
  });
  
  

/**
 * @brief Petición put sobre la api. Escuchamos sobre el puerto 3000.
 */
app.listen(3000, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});