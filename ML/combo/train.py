import pandas as pd
from mlxtend.frequent_patterns import fpgrowth
from mlxtend.frequent_patterns import association_rules
import joblib
from pathlib import Path

base_dir = Path(__file__).resolve().parent.parent 
model_path=base_dir/"combo" 
combo=pd.read_csv("combo.csv") 
basket = (
    combo.assign(Product=combo["food_item"].str.split("+"))
    .explode("Product")
    .groupby(["transaction_id", "Product"])
    .size()
    .unstack(fill_value=0)
)
basket = basket.astype(bool)

frequent_itemsets = fpgrowth(
    basket,
    min_support=0.01,
    use_colnames=True)
print(frequent_itemsets)

rules = association_rules(
    frequent_itemsets,
    metric="confidence",
    min_threshold=0.5)
print("Association Rules")
print(
    rules[
        [
            "antecedents",
            "consequents",
            "support",
            "confidence",
            "lift"
        ]
    ]
)

model_file = model_path / "combo.pkl" 
joblib.dump(rules, model_file) 
print("Recommendation Model Saved Successfully") 