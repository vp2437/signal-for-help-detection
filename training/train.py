import pandas as pd
import joblib

from sklearn.model_selection import (
    train_test_split,
    GridSearchCV,
    cross_val_score,
)
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)


df = pd.read_csv("features.csv")

X = df.iloc[:, :-1]
y = df.iloc[:, -1]


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

# model = RandomForestClassifier(
# class_weight=
# "balanced"
# )

base_model = RandomForestClassifier(
    class_weight="balanced",
    random_state=42,
    n_jobs=-1,
)

param_grid = {
    "n_estimators": [200, 500],
    "max_depth": [15, 20, None],
    "min_samples_split": [2, 4],
    "min_samples_leaf": [1, 2],
    "max_features": ["sqrt"],
}

grid = GridSearchCV(
    estimator=base_model,
    param_grid=param_grid,
    cv=5,
    scoring="accuracy",
    n_jobs=-1,
)

# model.fit(
#     X_train,
#     y_train
# )

grid.fit(X_train, y_train)

model = grid.best_estimator_

print("\nBest Parameters")
print(grid.best_params_)

cv_scores = cross_val_score(
    model,
    X,
    y,
    cv=5,
)

print(f"\nCross Validation Accuracy: {cv_scores.mean():.4f}")

predictions = model.predict(X_test)

# accuracy = model.score(
#     X_test,
#     y_test
# )

accuracy = accuracy_score(
    y_test,
    predictions,
)

print(f"\nTest Accuracy: {accuracy:.4f}")

print("\nClassification Report")
print(classification_report(y_test, predictions))

print("\nConfusion Matrix")
print(confusion_matrix(y_test, predictions))

joblib.dump(
    model,
    "../models/gesture_classifier.pkl",
)

print("\nModel saved")
# print(
#     f"Accuracy: {accuracy:.2f}"
# )

# joblib.dump(
#     model,
#     "../models/gesture_classifier.pkl"
# )

# print("Model saved")