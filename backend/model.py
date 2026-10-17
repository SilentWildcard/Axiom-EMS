"""
ERS AI/ML ETA Prediction Engine
Trains and serves a real Scikit-Learn GradientBoostingRegressor and RandomForest ensemble
trained on synthetic Delhi emergency transit data.

Features:
- distance_km: Remaining distance to checkpoint or destination
- current_speed_kmh: Current instantaneous GPS speed
- traffic_density: Delhi traffic index (1.0 = Free Flow, 2.0 = Normal, 3.5 = Severe Gridlock)
- hour_of_day: 0-23 (Rush hours: 8-11 AM, 5-8 PM)
- is_weekend: 0 or 1
- intersections_remaining: Count of traffic junctions along the corridor
- roadblock_active: 0 or 1 (Accident, VIP movement, or construction)
- weather_factor: 1.0 (Clear), 1.3 (Monsoon Rain / Dense Winter Fog/Smog)

Outputs:
- predicted_eta_seconds: Estimated arrival time in seconds
- baseline_eta_seconds: Simple physics-based calculation (distance / speed + fixed junction penalty)
- uncertainty_range_seconds: [min_eta, max_eta] at 90% confidence
- delay_risk: 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
- recommended_advance_alert_lead_seconds: Time ahead of arrival to dispatch IoT RSU alert
- feature_importances: Weight of each feature in the tree ensemble
"""

import os
import joblib
import numpy as np
from typing import Dict, Any, Tuple
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

MODEL_PATH = os.path.join(os.path.dirname(__file__), "delhi_eta_model.joblib")
META_PATH = os.path.join(os.path.dirname(__file__), "model_metadata.joblib")

FEATURE_NAMES = [
    "distance_km",
    "current_speed_kmh",
    "traffic_density",
    "hour_of_day",
    "is_weekend",
    "intersections_remaining",
    "roadblock_active",
    "weather_factor"
]

class ETAPredictor:
    def __init__(self):
        self.model: GradientBoostingRegressor = None
        self.rf_uncertainty_model: RandomForestRegressor = None
        self.metadata: Dict[str, Any] = {}
        self._initialize_model()

    def _generate_synthetic_training_data(self, n_samples: int = 4000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Synthesizes realistic Delhi arterial emergency trips based on traffic engineering studies:
        - Free flow speed for ambulances: ~40-60 km/h
        - Heavy congestion speed reduction: 40-70%
        - Peak hour multiplier (8-11am, 5-9pm): +30-60% delay
        - Roadblock delay: +120-400 seconds
        - Per-intersection delay: ~15-45 seconds without signal preemption
        """
        np.random.seed(42)

        distances = np.random.uniform(0.5, 18.0, n_samples)
        speeds = np.random.uniform(15.0, 75.0, n_samples)
        traffic_densities = np.random.uniform(1.0, 3.5, n_samples)
        hours = np.random.randint(0, 24, n_samples)
        is_weekends = np.random.binomial(1, 0.28, n_samples)
        intersections = np.clip(np.round(distances * np.random.uniform(0.6, 1.2, n_samples)).astype(int), 1, 15)
        roadblocks = np.random.binomial(1, 0.12, n_samples)
        weather = np.random.choice([1.0, 1.15, 1.35], p=[0.75, 0.18, 0.07], size=n_samples)

        # Calculate ground truth travel time in seconds with nonlinear interactions and noise
        # Base transit time (seconds) = (distance / speed) * 3600
        effective_speed = speeds / (traffic_densities ** 0.6)
        base_time = (distances / np.clip(effective_speed, 8.0, 90.0)) * 3600

        # Rush hour penalty
        is_peak = ((hours >= 8) & (hours <= 11)) | ((hours >= 17) & (hours <= 20))
        peak_penalty = np.where(is_peak, distances * 35.0 * (1 - 0.4 * is_weekends), 0)

        # Intersection clearance penalty without ERS synchronization
        intersection_delay = intersections * np.random.uniform(18.0, 38.0, n_samples) * (traffic_densities ** 0.5)

        # Roadblock penalty
        roadblock_delay = roadblocks * np.random.uniform(150.0, 420.0, n_samples)

        # Weather factor
        weather_delay = (weather - 1.0) * base_time * 0.4

        # Environmental noise (Delhi lane discipline, pedestrian crossings, red-light runners)
        stochastic_noise = np.random.normal(0, 25.0, n_samples)

        target_travel_time = np.clip(
            base_time + peak_penalty + intersection_delay + roadblock_delay + weather_delay + stochastic_noise,
            60.0,
            7200.0
        )

        X = np.column_stack([
            distances,
            speeds,
            traffic_densities,
            hours,
            is_weekends,
            intersections,
            roadblocks,
            weather
        ])

        return X, target_travel_time

    def _initialize_model(self):
        """Loads pre-trained model or trains a fresh model on startup."""
        if os.path.exists(MODEL_PATH) and os.path.exists(META_PATH):
            try:
                data = joblib.load(MODEL_PATH)
                self.model = data["gb_model"]
                self.rf_uncertainty_model = data["rf_model"]
                self.metadata = joblib.load(META_PATH)
                return
            except Exception as e:
                print(f"[ERS ML] Error loading saved model: {e}. Retraining...")

        self.train_and_save()

    def train_and_save(self):
        """Trains Scikit-Learn ensemble model, calculates performance metrics, and persists to disk."""
        print("[ERS ML] Generating Delhi emergency transit dataset and training ML models...")
        X, y = self._generate_synthetic_training_data(n_samples=5000)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Primary GradientBoostingRegressor for point predictions
        gb = GradientBoostingRegressor(
            n_estimators=120,
            learning_rate=0.08,
            max_depth=4,
            subsample=0.85,
            random_state=42
        )
        gb.fit(X_train, y_train)

        # Secondary RandomForestRegressor for ensemble tree prediction intervals
        rf = RandomForestRegressor(
            n_estimators=80,
            max_depth=6,
            random_state=42,
            n_jobs=-1
        )
        rf.fit(X_train, y_train)

        y_pred = gb.predict(X_test)
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))

        # Baseline evaluation (simple speed = distance/time with default 30s junction delay)
        baseline_pred = (X_test[:, 0] / np.clip(X_test[:, 1], 10, 80)) * 3600 + X_test[:, 5] * 30
        baseline_rmse = float(np.sqrt(mean_squared_error(y_test, baseline_pred)))

        importances = dict(zip(FEATURE_NAMES, [round(float(v), 4) for v in gb.feature_importances_]))

        self.model = gb
        self.rf_uncertainty_model = rf
        self.metadata = {
            "model_type": "GradientBoostingRegressor + RandomForest Ensemble",
            "framework": "scikit-learn",
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "rmse_seconds": round(rmse, 2),
            "r2_score": round(r2, 4),
            "baseline_rmse_seconds": round(baseline_rmse, 2),
            "accuracy_improvement_pct": round(((baseline_rmse - rmse) / baseline_rmse) * 100, 1),
            "features": FEATURE_NAMES,
            "feature_importances": importances,
            "disclaimer": "Predictions are probabilistic estimates based on simulated corridor telemetry."
        }

        joblib.dump({"gb_model": gb, "rf_model": rf}, MODEL_PATH)
        joblib.dump(self.metadata, META_PATH)
        print(f"[ERS ML] Model trained successfully! RMSE: {rmse:.2f}s, R2: {r2:.4f}, Improvement: {self.metadata['accuracy_improvement_pct']}%")

    def predict(
        self,
        distance_km: float,
        current_speed_kmh: float,
        traffic_density: float = 1.8,
        hour_of_day: int = 14,
        is_weekend: int = 0,
        intersections_remaining: int = 3,
        roadblock_active: int = 0,
        weather_factor: float = 1.0
    ) -> Dict[str, Any]:
        """
        Executes prediction, uncertainty bounds, and dynamic alert lead time.
        """
        # Ensure model is ready
        if self.model is None:
            self._initialize_model()

        # Sanitize inputs
        distance_km = max(0.05, float(distance_km))
        current_speed_kmh = max(5.0, float(current_speed_kmh))
        traffic_density = max(1.0, min(4.0, float(traffic_density)))
        hour_of_day = int(hour_of_day) % 24
        is_weekend = 1 if is_weekend else 0
        intersections_remaining = max(0, int(intersections_remaining))
        roadblock_active = 1 if roadblock_active else 0
        weather_factor = max(1.0, float(weather_factor))

        features = np.array([[
            distance_km,
            current_speed_kmh,
            traffic_density,
            hour_of_day,
            is_weekend,
            intersections_remaining,
            roadblock_active,
            weather_factor
        ]])

        # 1. AI/ML Point Prediction
        predicted_sec = float(self.model.predict(features)[0])
        predicted_sec = max(10.0, predicted_sec)

        # 2. Transparent Baseline Calculation (Standard physics: t = d/v + 30s per intersection)
        baseline_sec = float((distance_km / current_speed_kmh) * 3600 + (intersections_remaining * 30))

        # 3. Ensemble tree prediction variance for empirical uncertainty bounds (90% interval)
        if self.rf_uncertainty_model is not None:
            tree_preds = [tree.predict(features)[0] for tree in self.rf_uncertainty_model.estimators_]
            std_dev = float(np.std(tree_preds))
            lower_bound = max(5.0, predicted_sec - 1.645 * std_dev)
            upper_bound = predicted_sec + 1.645 * std_dev
        else:
            lower_bound = predicted_sec * 0.85
            upper_bound = predicted_sec * 1.25
            std_dev = predicted_sec * 0.1

        # 4. Delay Risk Assessment
        delay_ratio = predicted_sec / max(1.0, baseline_sec)
        if roadblock_active or delay_ratio > 1.6:
            delay_risk = "CRITICAL"
        elif delay_ratio > 1.3:
            delay_risk = "HIGH"
        elif delay_ratio > 1.1:
            delay_risk = "MODERATE"
        else:
            delay_risk = "LOW"

        # 5. Dynamic Advance Alert Lead Time:
        # High speed or congested corridor needs longer lead time to clear traffic queues (60s to 120s)
        recommended_lead_sec = int(np.clip(
            (current_speed_kmh / 40.0) * 45.0 + (traffic_density * 15.0) + (15.0 if roadblock_active else 0.0),
            45.0,
            120.0
        ))

        return {
            "predicted_eta_seconds": round(predicted_sec, 1),
            "predicted_eta_formatted": f"{int(predicted_sec // 60)}m {int(predicted_sec % 60)}s",
            "baseline_eta_seconds": round(baseline_sec, 1),
            "baseline_eta_formatted": f"{int(baseline_sec // 60)}m {int(baseline_sec % 60)}s",
            "uncertainty_range_seconds": [round(lower_bound, 1), round(upper_bound, 1)],
            "uncertainty_margin_seconds": round(1.645 * std_dev, 1),
            "delay_risk": delay_risk,
            "delay_ratio": round(delay_ratio, 2),
            "recommended_advance_alert_lead_seconds": recommended_lead_sec,
            "features_used": {
                "distance_km": distance_km,
                "current_speed_kmh": current_speed_kmh,
                "traffic_density": traffic_density,
                "hour_of_day": hour_of_day,
                "is_weekend": is_weekend,
                "intersections_remaining": intersections_remaining,
                "roadblock_active": roadblock_active,
                "weather_factor": weather_factor
            },
            "model_metadata": self.metadata
        }

# Global singleton
eta_predictor = ETAPredictor()
