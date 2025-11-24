import { useState } from "react";
import { categories, portionOptions, basePrices, curryPrices } from "../data/meals";

export default function MealCustomizer() {
  const [main, setMain] = useState(categories.main[0]);
  const [vegCurries, setVegCurries] = useState([]);
  const [nonVegCurries, setNonVegCurries] = useState([]);
  const [gravy, setGravy] = useState([]);
  const [portion, setPortion] = useState(portionOptions[0]);
  const [divisiblePieces, setDivisiblePieces] = useState({}); // track chicken, fish pieces etc.

  // Compute meal type
  const getMealType = () => {
    if (nonVegCurries.length === 0) return "vegMeal";
    if (nonVegCurries.length === 1 && nonVegCurries[0] === "Egg") return "eggMeal";
    return "nonVegMeal";
  };

  // Compute price
  const calculatePrice = () => {
    const type = getMealType();
    let price = basePrices[type]?.[portion.toLowerCase()] || 0;

    // Extra veg curries beyond default
    if (vegCurries.length > 2) {
      const extraVeg = vegCurries.slice(2);
      extraVeg.forEach(c => price += curryPrices[c] || 0);
    }

    // Non-veg curries
    nonVegCurries.forEach(c => {
      let qty = divisiblePieces[c] || 1;
      price += (curryPrices[c] || 0) * qty;
    });

    // Gravy
    gravy.forEach(c => price += curryPrices[c] || 0);

    return price;
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Customize Your Meal</h2>

      {/* Main */}
      <div>
        <label className="font-medium">Main:</label>
        <select value={main} onChange={e => setMain(e.target.value)} className="ml-2 border p-1">
          {categories.main.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* Veg Curries */}
      <div>
        <label className="font-medium">Veg Curries:</label>
        {categories.curries.veg.map(c => (
          <label key={c} className="ml-2">
            <input
              type="checkbox"
              checked={vegCurries.includes(c)}
              onChange={e =>
                setVegCurries(
                  e.target.checked
                    ? [...vegCurries, c]
                    : vegCurries.filter(v => v !== c)
                )
              }
            /> {c}
          </label>
        ))}
      </div>

      {/* Non-Veg Curries */}
      <div>
        <label className="font-medium">Non-Veg Curries:</label>
        {Object.entries(categories.curries.nonVeg).map(([type, items]) => (
          <div key={type} className="ml-4">
            <p className="italic">{type}:</p>
            {items.map(c => (
              <div key={c} className="ml-2">
                <label>
                  <input
                    type="checkbox"
                    checked={nonVegCurries.includes(c)}
                    onChange={e => {
                      if (e.target.checked) {
                        setNonVegCurries([...nonVegCurries, c]);
                        if (type === "divisible") setDivisiblePieces({ ...divisiblePieces, [c]: 1 });
                      } else {
                        setNonVegCurries(nonVegCurries.filter(n => n !== c));
                        const copy = { ...divisiblePieces };
                        delete copy[c];
                        setDivisiblePieces(copy);
                      }
                    }}
                  /> {c}
                </label>
                {type === "divisible" && nonVegCurries.includes(c) && (
                  <input
                    type="number"
                    min="1"
                    value={divisiblePieces[c] || 1}
                    onChange={e => setDivisiblePieces({ ...divisiblePieces, [c]: parseInt(e.target.value) })}
                    className="ml-2 w-16 border p-1"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Gravy */}
      <div>
        <label className="font-medium">Gravy:</label>
        {categories.gravy.map(c => (
          <label key={c} className="ml-2">
            <input
              type="checkbox"
              checked={gravy.includes(c)}
              onChange={e =>
                setGravy(
                  e.target.checked
                    ? [...gravy, c]
                    : gravy.filter(g => g !== c)
                )
              }
            /> {c}
          </label>
        ))}
      </div>

      {/* Portion */}
      <div>
        <label className="font-medium">Portion:</label>
        <select value={portion} onChange={e => setPortion(e.target.value)} className="ml-2 border p-1">
          {portionOptions.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Price */}
      <div className="mt-4 text-lg font-bold">
        Total Price: Rs. {calculatePrice()}
      </div>
    </div>
  );
}

