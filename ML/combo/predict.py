import joblib
from pathlib import Path

base_dir = Path(__file__).resolve().parent.parent
model_path = base_dir / "combo" / "combo.pkl"
rules = joblib.load(model_path)


def recommend_combo(product_name):
    recommendations = []
    product_name = product_name.lower()

    for _, row in rules.iterrows():

        antecedent = list(row["antecedents"])

        if len(antecedent) > 0 and antecedent[0].lower() == product_name:

            consequent = list(row["consequents"])

            for product in consequent:

                combo = product_name.title() + " + " + product.title()

                if combo not in [item["Combo Offer"] for item in recommendations]:

                    recommendations.append({
                        "Combo Offer": combo,
                        "Support": round(row["support"], 3),
                        "Confidence": round(row["confidence"], 3),
                        "Lift": round(row["lift"], 3)
                    })

    if len(recommendations) == 0:
        return ["No Combo Recommendation Found"]

    return recommendations


if __name__ == "__main__":
    result = recommend_combo("Momos")

    print("\nCombo Recommendations\n")

    for item in result:
        print(item)