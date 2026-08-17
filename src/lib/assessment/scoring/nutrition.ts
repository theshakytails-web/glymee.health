import { ScoreResult } from "../types";
import { createScoreResult } from "../scoring-engine";

export function calculateNutritionScore(responses: Record<string, unknown>): ScoreResult {
  let points = 0;
  let maxPoints = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  const optScore = (val: string, opts: string[]) => {
    const idx = opts.indexOf(val);
    return idx >= 0 ? idx : -1;
  };

  // Vegetables (0-10)
  maxPoints += 10;
  const veg = optScore(responses.vegetables as string, ["Less than 1", "1-2", "2-3", "More than 3"]);
  if (veg >= 0) {
    points += veg <= 1 ? veg * 3 : veg * 2.5;
    if (veg >= 2) strengths.push("Good vegetable intake");
    else concerns.push("Low vegetable intake");
  }

  // Fruits (0-8)
  maxPoints += 8;
  const fruit = optScore(responses.fruits as string, ["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily"]);
  if (fruit >= 0) {
    points += fruit * 2;
    if (fruit >= 2) strengths.push("Regular fruit consumption");
  }

  // Whole grains (0-8)
  maxPoints += 8;
  const grains = optScore(responses.whole_grains as string, ["Rarely / Never", "Sometimes", "Most meals", "Every meal"]);
  if (grains >= 0) {
    points += grains * 2;
    if (grains >= 2) strengths.push("Includes whole grains/millets");
    else recommendations.push("Try including more whole grains and millets");
  }

  // Protein (0-8)
  maxPoints += 8;
  const protein = optScore(responses.protein as string, ["Rarely", "Sometimes", "Usually", "Every main meal"]);
  if (protein >= 0) {
    points += protein * 2;
    if (protein >= 2) strengths.push("Good protein intake");
    else recommendations.push("Include protein in every main meal");
  }

  // Sugary drinks (0-10)
  maxPoints += 10;
  const drinks = optScore(responses.sugary_drinks as string, ["Daily or more", "4-6 times/week", "1-3 times/week", "Rarely / Never"]);
  if (drinks >= 0) {
    points += drinks * 2.5;
    if (drinks >= 2) strengths.push("Low sugary drink consumption");
    else { concerns.push("Frequent sugary drink consumption"); recommendations.push("Reduce sugary drinks — swap for water or unsweetened tea"); }
  }

  // Sweets (0-8)
  maxPoints += 8;
  const sweets = optScore(responses.sweets as string, ["Daily or more", "4-6 times/week", "1-3 times/week", "Rarely / Never"]);
  if (sweets >= 0) points += sweets * 2;

  // Fried/processed (0-8)
  maxPoints += 8;
  const fried = optScore(responses.fried_processed as string, ["Daily or more", "4-6 times/week", "1-3 times/week", "Rarely / Never"]);
  if (fried >= 0) {
    points += fried * 2;
    if (fried >= 2) strengths.push("Low processed food intake");
    else concerns.push("Frequent processed food consumption");
  }

  // Late night eating (0-8)
  maxPoints += 8;
  const late = optScore(responses.late_night_eating as string, ["Almost every day", "Often", "Sometimes", "Rarely / Never"]);
  if (late >= 0) {
    points += late * 2;
    if (late >= 2) strengths.push("Eats at regular hours");
    else recommendations.push("Avoid eating within 2-3 hours of bedtime");
  }

  // Breakfast (0-8)
  maxPoints += 8;
  const breakfast = optScore(responses.breakfast_habit as string, ["Rarely / Never", "Sometimes", "Most days", "Every day"]);
  if (breakfast >= 0) {
    points += breakfast * 2;
    if (breakfast >= 2) strengths.push("Regular breakfast habit");
  }

  // Water (0-8)
  maxPoints += 8;
  const water = optScore(responses.water_intake as string, ["Less than 1 litre", "1-1.5 litres", "1.5-2 litres", "More than 2 litres"]);
  if (water >= 0) {
    points += water * 2;
    if (water >= 2) strengths.push("Adequate water intake");
    else recommendations.push("Try to drink at least 1.5-2 litres of water daily");
  }

  // Outside food (0-8)
  maxPoints += 8;
  const outside = optScore(responses.outside_food as string, ["Almost daily", "3-4 times/week", "1-2 times/week", "Rarely / Never"]);
  if (outside >= 0) {
    points += outside * 2;
    if (outside >= 2) strengths.push("Mostly home-cooked meals");
    else concerns.push("Frequent outside food consumption");
  }

  // Meals per day (0-8)
  maxPoints += 8;
  const meals = responses.meals_per_day as string;
  if (meals === "3" || meals === "4") {
    points += 8;
    strengths.push("Regular meal pattern");
  } else {
    points += 4;
    recommendations.push("Aim for 3-4 regular meals per day");
  }

  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 50;
  return createScoreResult(score, strengths, concerns, recommendations);
}
