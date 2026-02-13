import mongoose, { Schema, model, models } from "mongoose";

const CardSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const Card = models.Card || model("Card", CardSchema);
export default Card;
