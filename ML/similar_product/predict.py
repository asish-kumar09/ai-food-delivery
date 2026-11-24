import joblib
from pathlib import Path

base_dir = Path(__file__).resolve().parent.parent
model_path = base_dir / "similar_product"

vectorizer = joblib.load(model_path / "tfidf_vectorizer.pkl")
similarity_matrix = joblib.load(model_path / "similarity_matrix.pkl")
food_data = joblib.load(model_path / "food_data.pkl")

print("Models loaded successfully")

def recommend_products(food_name, top_n=5):

    matching_products = food_data[
        food_data["food_name"].str.lower() == food_name.lower()
    ]

    if matching_products.empty:
        return ["Product Not Found"]

    product_index = matching_products.index[0]

    # Get food type of the input food
    input_food_type = food_data.iloc[product_index]["food_type"].lower()

    # Only recommend foods having the SAME food type
    # Veg -> only veg
    # Non-veg -> only non-veg
    same_type_products = food_data[
        food_data["food_type"].str.lower() == input_food_type
    ]

    similarity_scores = []

    for index in same_type_products.index:

        score = similarity_matrix[product_index][index]

        similarity_scores.append(
            (index, score)
        )

    similarity_scores = sorted(
        similarity_scores,
        key=lambda x: x[1],
        reverse=True
    )

    recommendations = []
    added_foods = set()

    for index, score in similarity_scores:

        current_food = food_data.iloc[index]["food_name"]

        
        if current_food.lower() == food_name.lower():
            continue

        
        if current_food.lower() in added_foods:
            continue

        recommendations.append(
            {
                "Food": current_food,
                "Category": food_data.iloc[index]["category"],
                "Food Type": food_data.iloc[index]["food_type"],
                "Similarity Score": round(float(score), 3)
            }
        )

        added_foods.add(current_food.lower())

        if len(recommendations) == top_n:
            break

    return recommendations
if __name__ == "__main__":
    result = recommend_products("Paneer Pizza", top_n=5)
    print("Recommended Products")
    for product in result:
        print(product)