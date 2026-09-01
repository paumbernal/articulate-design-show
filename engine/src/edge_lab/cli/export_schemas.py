"""Dump JSON Schema for every model in edge_lab.models to engine/schemas/.

This is the Python -> TypeScript contract: schemas are checked into git, and
a Vitest contract test (see src/features/orderflow-edge-lab/types) validates
that the static frontend artifacts conform to them. Run via:

    npm run engine:setup   # once
    cd engine && python -m uv run python -m edge_lab.cli.export_schemas
"""

from __future__ import annotations

import json
from pathlib import Path

from edge_lab import models

SCHEMAS_DIR = Path(__file__).resolve().parents[3] / "schemas"

MODELS = {
    "OHLCVBar": models.OHLCVBar,
    "SyntheticOrderFlowBar": models.SyntheticOrderFlowBar,
    "DetectedCondition": models.DetectedCondition,
    "SetupDefinition": models.SetupDefinition,
    "EdgeScoreResult": models.EdgeScoreResult,
    "BacktestTrade": models.BacktestTrade,
    "BacktestStatistics": models.BacktestStatistics,
}


def main() -> None:
    SCHEMAS_DIR.mkdir(parents=True, exist_ok=True)
    for name, model in MODELS.items():
        schema = model.model_json_schema(by_alias=True)
        out_path = SCHEMAS_DIR / f"{name}.schema.json"
        out_path.write_text(json.dumps(schema, indent=2) + "\n", encoding="utf-8")
        print(f"wrote {out_path.relative_to(SCHEMAS_DIR.parent)}")


if __name__ == "__main__":
    main()
