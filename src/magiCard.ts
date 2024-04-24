/**
 * @fileoverview magicCard class - Representa una carta de Magic.
 */

/**
 * @brief Enumerado color - Representa los colores de las cartas de Magic.
 */

import { Document, Schema, model } from 'mongoose';


export enum color {
    white,
    blue,
    black,
    red,
    green,
    colorless,
    multicolor,
  }
  
  /**
   * @brief Enumerado rare - Representa la rareza de las cartas de Magic.
   */
  export enum rare {
    common,
    uncommon,
    rare,
    mythicRare,
  }
  
  /**
   * @brief Enumerado tipe - Representa el tipo de carta de Magic.
   */
  export enum tipe {
    creature,
    enchantment,
    artifact,
    instant,
    sorcery,
    planeswalker,
    land,
  }
  
  /**
   * @brief Clase magicCard - Representa una carta de Magic.
   */
  export interface magicCard extends Document {
    user_: string,
    id_: number,
    name_: string,
    manaCost_: number,
    color_: string,
    typo_: string,
    rare_: string,
    rules_: string,
    value_: number,
    strRes_?: number,
   loyalty_?: number,
  }

  export const magicSchema = new Schema<magicCard>({
        user_:{
            type:String,
        },
        id_:{
            type:Number
        },
        name_:{
            type:String
        },
        manaCost_:{
            type:Number
        },
        color_:{
            type:String
        },
        typo_:{
            type:String
        },
        rare_:{
            type:String
        },
        rules_:{
            type:String
        },
        value_: {
            type:Number
        },
        strRes_: {
            type:Number
        },
         loyalty_:{
            type:Number,
            //validate: (value:Number) => {
              //  if(typo_ !== tipe.creature) {
                //    throw new Error('Note title must start with a capital letter');
                //}
            //}
        }
  });
  export const Card = model<magicCard>('Note', magicSchema);



 
