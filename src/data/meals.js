// src/data/meals.js

export const categories = {
    main: ["Rice", "String Hoppers", "Bread"],
    gravy: ["Dal Curry", "Soya Curry"],
    curries: {
      veg: ["Potato Curry", "Beans Curry", "Pumpkin Curry"],
      nonVeg: {
        divisible: ["Chicken", "Fish"],
        nonDivisible: ["Egg", "Beef"]
      }
    },
  };
  
  export const defaultMeal = {
    main: "Rice",
    vegCurries: 2, // default n number
  };
  
  export const portionOptions = ["Full", "Half", "Small"];
  
  // Example merchant pricing
  export const basePrices = {
    vegMeal: { full: 250, half: 200, small: 150 },
    eggMeal: { full: 260, half: 210, small: 160 },
    // more merchant-defined prices...
  };
  
  export const curryPrices = {
    "Chicken": 120,
    "Fish": 100,
    "Egg": 80,
    "Beef": 150,
    "Potato Curry": 50,
    "Beans Curry": 60,
    "Pumpkin Curry": 70,
    "Dal Curry": 40,
    "Soya Curry": 50,
  };
  